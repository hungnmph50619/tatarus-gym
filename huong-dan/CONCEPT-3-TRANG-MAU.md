# Taurus Command – Trang mẫu Hội viên

Đường dẫn thử: `http://localhost:3000/mau-thiet-ke`

## Phạm vi

- **Chỉ thêm trang mẫu riêng**: `app/mau-thiet-ke/page.tsx` và `trang-mau.module.css`.
- Trang `/`, API check-in, email gia hạn và SQL không thay đổi.
- Dùng cùng key `gymflow-hoi-vien-demo-v1`, cùng trường dữ liệu và cùng quy trình thêm / tìm / xóa hội viên của trang hiện tại.
- Không thêm trường ảnh hoặc gán ảnh giả cho hội viên; dùng avatar placeholder có mô tả rõ.
- Giao diện chỉ áp dụng CSS trong phạm vi route, không sửa stylesheet toàn cục.

## Cách xem

```powershell
git pull origin main
npm.cmd install
npm.cmd run dev
```

Mở `http://localhost:3000/mau-thiet-ke` để xem Concept 3 – Taurus Command.

## Nhận diện thương hiệu

- Ink: #173052
- Primary: #0756C9
- Coral: #ED715C
- Background: #F5F8FC
- Surface: #FFFFFF
- Success: #16794B
- Spacing: bội số 4px, điều chỉnh vùng thao tác theo mật độ nội dung.
- Typography mẫu: font hệ thống Arial/Helvetica để không phải gọi mạng và giữ khả năng đọc tiếng Việt. Sau khi duyệt sẽ thống nhất font thương hiệu và font fallback.
- Không dùng ảnh người thật khi dữ liệu chưa có ảnh.
- State: hover, focus-visible, selected, success, warning, empty, confirm delete, form dialog.
- Đã có skip link, input label, table headers, aria-live và hỗ trợ reduced-motion.

## Lưu ý kiểm thử

Trang mẫu sử dụng **chung localStorage với trang cũ**. Nếu bạn thêm hoặc xóa ở trang mẫu, dữ liệu demo cục bộ cũng sẽ thay đổi khi mở lại trang cũ. Chưa kết nối Supabase thực tế.

Việc thêm trang không có nghĩa đã kiểm thử build/khả năng truy cập trên mọi thiết bị. Cần chạy `npm.cmd run build` và kiểm tra mobile/keyboard/screen reader trước khi duyệt triển khai rộng.

## Sau khi duyệt

Tách token thành CSS variables, component Header, MemberList, MemberDetail, Status, Dialog, Input, Navigation; sau đó ứng dụng lần lượt theo yêu cầu, không tự ý đổi API hoặc nghiệp vụ.
