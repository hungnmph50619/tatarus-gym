# GymFlow — Phần mềm quản lý phòng gym (bản khởi đầu)

## Quy ước tiếng Việt trong mã nguồn

- **Tên biến, hàm, kiểu dữ liệu nghiệp vụ, lớp CSS, chú thích và nội dung giao diện** được viết bằng tiếng Việt. Ví dụ: `HoiVien`, `danhSachHoiVien`, `themHoiVien`, `.thanh-ben`.
- Tên biến, hàm và lớp CSS dùng **tiếng Việt không dấu** để dễ gõ, tìm kiếm và tránh nhầm lẫn khi chia sẻ mã nguồn.
- **Giữ nguyên từ khóa, thuộc tính và API bắt buộc** của JavaScript/TypeScript/React/Next.js (ví dụ `const`, `return`, `useState`, `onClick`, `className`, `localStorage`, `package.json`, `page.tsx`). Dịch các tên này sẽ làm hỏng chương trình.
- Những thuật ngữ công nghệ như Next.js, PWA, PostgreSQL được giữ tên chính thức, nhưng đều có giải thích bằng tiếng Việt.

## Công nghệ

Next.js, React, TypeScript, CSS, thư viện biểu tượng Lucide. Giao diện co giãn theo máy tính và điện thoại, có tệp khai báo cài đặt PWA (`manifest`).

## Chạy thử trên Windows

1. Cài Node.js phiên bản LTS.
2. Mở PowerShell trong thư mục dự án.
3. Chạy:

```powershell
npm install
npm run dev
```

4. Mở trình duyệt tại http://localhost:3000.

## Tính năng đang có

- Bảng tổng quan hội viên và tiền thu minh họa.
- Thêm, tìm kiếm, xóa hội viên; kiểm tra ngày hết hạn.
- Lưu dữ liệu thử nghiệm bằng `localStorage` (bộ nhớ trình duyệt).

**Cảnh báo:** Chưa có máy chủ, cơ sở dữ liệu, đăng nhập, phân quyền hoặc kiểm tra dữ liệu ở phía máy chủ. Không dùng dữ liệu khách hàng thật. Chưa có chế độ ngoại tuyến hoặc quy trình cài PWA đầy đủ.

## Đưa lên GitHub

Tạo kho mã nguồn riêng tư có tên `gym-management-pwa` tại https://github.com/new, không chọn tạo sẵn README. Trong thư mục dự án chạy:

```powershell
git init
git add .
git commit -m "Khoi tao du an quan ly phong gym"
git branch -M main
git remote add origin https://github.com/hungnmph50619/gym-management-pwa.git
git push -u origin main
```

## Hướng phát triển tiếp theo

Kết nối Supabase/PostgreSQL; đăng nhập và phân quyền; quản lý gói tập và thu phí; mã QR check-in; lịch huấn luyện viên; báo cáo và quản lý nhiều phòng gym. Mỗi thay đổi tiếp theo cần tuân thủ quy ước tiếng Việt nói trên.
