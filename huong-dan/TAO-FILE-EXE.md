# Taurus Gym — File EXE trên Windows

Đã thêm mã nguồn để GitHub Actions biên dịch `TaurusGym.exe`.
**EXE chỉ là chương trình khởi động website tại máy tính**, không phải bản
đóng gói toàn bộ Node.js / database / máy xác minh LAN.

## Tải EXE từ GitHub

1. Mở https://github.com/hungnmph50619/tatarus-gym/actions/workflows/tao-file-exe.yml
2. Chọn lần chạy có dấu tích xanh. Nếu chưa có, chọn **Run workflow**.
3. Mở lần chạy đó, mục **Artifacts**, tải `TaurusGym-Windows-EXE`.
4. Giải nén rồi đặt `TaurusGym.exe` cạnh `package.json` trong thư mục dự án.
5. Nhấp đúp vào `TaurusGym.exe`.

Ứng dụng tự kiểm tra Node.js và npm, cài thư viện nếu thiếu, chạy
`npm.cmd run build` khi cần, khởi động `npm.cmd run start` và mở trình duyệt.
Phải giữ cửa sổ chương trình mở để máy chủ hoạt động.
Bản EXE dùng .NET 8 tự chứa runtime, **vẫn cần Node.js LTS cài trên máy**.

## Dùng không cần EXE

`KhoiDongTaurusGym.bat` là file dự phòng, dùng khi GitHub Actions chưa tạo xong
hoặc việc tải EXE gặp sự cố. File BAT không tự kiểm tra mã nguồn thay đổi
sau lần build; nếu thấy giao diện cũ, mở PowerShell chạy
`npm.cmd run build` rồi khởi động lại.

## Lưu ý

- Website đang chạy trên cổng 3000 thì launcher sẽ cảnh báo để tránh mở hai máy chủ.
- Launcher không phải trình cài đặt Windows; không tạo Desktop shortcut tự động.
- Nếu GitHub Action chưa chạy thành công thì không được xem là đã có file EXE.
- Mã nguồn launcher viết bằng C# với tên biến, hàm và chú thích tiếng Việt không dấu.
- Website vẫn cần Supabase, các biến môi trường và HTTPS cho tính năng check-in thật.
- Nếu Windows SmartScreen cảnh báo ứng dụng chưa có chữ ký số, chỉ chạy
  sau khi bạn xác minh EXE tải từ workflow chính chủ trong repository của mình.
