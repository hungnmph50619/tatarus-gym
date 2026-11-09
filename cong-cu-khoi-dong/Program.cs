using System.Diagnostics;
using System.Net.Sockets;

namespace TaurusGym;

// Ứng dụng khởi động Taurus Gym trên Windows bằng một lần nhấp đúp.
// Không chứa mã hội viên hoặc khóa bí mật.
internal static class Program
{
    private const int CongWebsite = 3000;

    private static async Task<int> Main()
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.Title = "Taurus Gym - Khởi động";
        var thuMucDuAn = AppContext.BaseDirectory;

        if (!File.Exists(Path.Combine(thuMucDuAn, "package.json")))
        {
            Console.WriteLine("Không tìm thấy package.json.");
            Console.WriteLine("Hãy đặt TaurusGym.exe ngay trong thư mục gốc dự án Taurus Gym.");
            ChoNhanPhim();
            return 1;
        }

        // Website đang chạy thì chỉ mở trình duyệt, không khởi động thêm.
        if (await KiemTraCongAsync(CongWebsite))
        {
            Console.WriteLine("Cổng 3000 đang có chương trình sử dụng.");
            Console.WriteLine("Kiểm tra có đúng Taurus Gym hay không trước khi tiếp tục.");
            Console.Write("Mở địa chỉ localhost:3000 trong trình duyệt? (c/k): ");
            if (Console.ReadLine()?.Trim().ToLowerInvariant() == "c")
                MoTrinhDuyet();
            return 0;
        }

        if (!CoLenh("node") || !CoLenh("npm.cmd"))
        {
            Console.WriteLine("Chưa tìm thấy Node.js hoặc npm trong PATH.");
            Console.WriteLine("Hãy cài Node.js LTS tại https://nodejs.org rồi mở lại file EXE.");
            ChoNhanPhim();
            return 1;
        }

        if (!Directory.Exists(Path.Combine(thuMucDuAn, "node_modules")))
        {
            Console.WriteLine("Đang cài thư viện lần đầu...");
            if (await ChayLenhAsync(thuMucDuAn, "npm.cmd", "install") != 0)
            {
                Console.WriteLine("Cài thư viện không thành công.");
                ChoNhanPhim();
                return 1;
            }
        }

        // Build lại nếu chưa có bản build hoặc mã nguồn đã thay đổi sau build.
        var duongDanBuild = Path.Combine(thuMucDuAn, ".next", "BUILD_ID");
        if (!File.Exists(duongDanBuild) || MaNguonMoiHonBuild(thuMucDuAn, duongDanBuild))
        {
            Console.WriteLine("Đang tạo bản chạy website...");
            if (await ChayLenhAsync(thuMucDuAn, "npm.cmd", "run build") != 0)
            {
                Console.WriteLine("Không thể tạo bản chạy. Hãy xem thông báo lỗi phía trên.");
                ChoNhanPhim();
                return 1;
            }
        }

        Console.WriteLine("Đang khởi động Taurus Gym...");
        using var mayChu = TaoTienTrinh(thuMucDuAn, "npm.cmd", "run start");
        if (!mayChu.Start()) return 1;

        using var huy = new CancellationTokenSource();
        var luongXuat = InDuLieuAsync(mayChu.StandardOutput, huy.Token);
        var luongLoi = InDuLieuAsync(mayChu.StandardError, huy.Token);
        var sanSang = false;
        for (var lanThu = 0; lanThu < 80; lanThu++)
        {
            if (mayChu.HasExited) break;
            if (await KiemTraCongAsync(CongWebsite))
            {
                sanSang = true;
                break;
            }
            await Task.Delay(500);
        }

        if (sanSang)
        {
            MoTrinhDuyet();
            Console.WriteLine("Taurus Gym đang hoạt động tại http://localhost:3000");
            Console.WriteLine("Giữ cửa sổ này mở để website tiếp tục hoạt động.");
            Console.WriteLine("Nhấn Enter để dừng máy chủ.");
            Console.ReadLine();
        }
        else
        {
            Console.WriteLine("Website chưa sẵn sàng. Kiểm tra log phía trên.");
            ChoNhanPhim();
        }

        if (!mayChu.HasExited)
        {
            try { mayChu.Kill(entireProcessTree: true); }
            catch (InvalidOperationException) { }
        }
        huy.Cancel();
        try { await Task.WhenAll(luongXuat, luongLoi); }
        catch (OperationCanceledException) { }
        return sanSang ? 0 : 1;
    }

    private static bool MaNguonMoiHonBuild(string thuMuc, string duongDanBuild)
    {
        var mocBuild = File.GetLastWriteTimeUtc(duongDanBuild);
        var tepCanXem = new[] { "package.json", "package-lock.json", "next.config.js", "next.config.ts", ".env.local" };
        if (tepCanXem.Any(tep => File.Exists(Path.Combine(thuMuc, tep)) &&
                                File.GetLastWriteTimeUtc(Path.Combine(thuMuc, tep)) > mocBuild))
            return true;
        var thuMucApp = Path.Combine(thuMuc, "app");
        return Directory.Exists(thuMucApp) &&
               Directory.EnumerateFiles(thuMucApp, "*", SearchOption.AllDirectories)
                   .Any(tep => File.GetLastWriteTimeUtc(tep) > mocBuild);
    }

    private static bool CoLenh(string tenLenh)
    {
        var cacThuMuc = (Environment.GetEnvironmentVariable("PATH") ?? "")
            .Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries);
        return cacThuMuc.Any(muc => File.Exists(Path.Combine(muc, tenLenh + (tenLenh.EndsWith(".cmd") ? "" : ".exe"))));
    }

    private static Process TaoTienTrinh(string thuMuc, string lenh, string thamSo)
    {
        var thongTin = new ProcessStartInfo("cmd.exe")
        {
            WorkingDirectory = thuMuc,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
        };
        thongTin.ArgumentList.Add("/d");
        thongTin.ArgumentList.Add("/c");
        thongTin.ArgumentList.Add(lenh);
        foreach (var thamSoRieng in thamSo.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            thongTin.ArgumentList.Add(thamSoRieng);
        return new Process { StartInfo = thongTin };
    }

    private static async Task<int> ChayLenhAsync(string thuMuc, string lenh, string thamSo)
    {
        using var tienTrinh = TaoTienTrinh(thuMuc, lenh, thamSo);
        tienTrinh.Start();
        var xuat = InDuLieuAsync(tienTrinh.StandardOutput, CancellationToken.None);
        var loi = InDuLieuAsync(tienTrinh.StandardError, CancellationToken.None);
        await tienTrinh.WaitForExitAsync();
        await Task.WhenAll(xuat, loi);
        return tienTrinh.ExitCode;
    }

    private static async Task InDuLieuAsync(StreamReader luong, CancellationToken huy)
    {
        try
        {
            while (!huy.IsCancellationRequested)
            {
                var dong = await luong.ReadLineAsync(huy);
                if (dong is null) break;
                Console.WriteLine(dong);
            }
        }
        catch (OperationCanceledException) { }
    }

    private static async Task<bool> KiemTraCongAsync(int cong)
    {
        try
        {
            using var ketNoi = new TcpClient();
            await ketNoi.ConnectAsync("127.0.0.1", cong).WaitAsync(TimeSpan.FromSeconds(1));
            return true;
        }
        catch { return false; }
    }

    private static void MoTrinhDuyet()
    {
        Process.Start(new ProcessStartInfo("http://localhost:3000") { UseShellExecute = true });
    }

    private static void ChoNhanPhim()
    {
        Console.WriteLine("Nhấn Enter để đóng.");
        Console.ReadLine();
    }
}
