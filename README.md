# Taurus Gym — Quản lý phòng gym (mã nguồn tiếng Việt)

Dự án Next.js + TypeScript. Tên biến, hàm và chú thích nghiệp vụ dùng tiếng Việt; từ khóa và tên API bắt buộc của thư viện giữ nguyên tiếng Anh.

## Chạy website trên Windows

```powershell
npm.cmd install
npm.cmd run dev
```

Mở http://localhost:3000

## Trạng thái hiện tại

- Trang tổng quan và danh sách hội viên vẫn là **bản demo localStorage**.
- Đã bổ sung mã nguồn ban đầu cho check-in QR qua dịch vụ xác minh HTTPS trong mạng LAN.
- Có API xác minh phiên Supabase, chữ ký HMAC và hàm SQL ghi nhận check-in/check-out nguyên tử.
- Có giao diện hội viên tại `/check-in`.
- **Chưa thể check-in thật** cho tới khi tạo Supabase, triển khai Cloud và HTTPS nội bộ; chưa có màn hình giám sát lễ tân.

Xem **[Hướng dẫn check-in LAN](huong-dan/CHECK-IN.md)** để triển khai và kiểm thử.

## An toàn

Không dùng dữ liệu hội viên thật ở trạng thái hiện tại. Tuyệt đối không commit file `.env.local`, khóa service role, khóa LAN hoặc khóa riêng TLS. Mạng Wi-Fi và QR không chứng minh tuyệt đối có mặt: cần đối chiếu ảnh bằng lễ tân khi vận hành thực tế.
