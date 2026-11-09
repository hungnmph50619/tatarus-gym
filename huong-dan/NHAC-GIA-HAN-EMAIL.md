# Taurus Gym — Tự động nhắc gia hạn bằng email

## Quy tắc

- Chỉ nhắc **2 ngày trước ngày hết hạn**, theo ngày lịch Việt Nam.
- Mỗi hội viên chỉ nhận **một email cho mỗi kỳ hạn**.
- Chỉ gửi khi hội viên có email hợp lệ và đã đồng ý nhận thông báo nhắc hạn.
- Khi gia hạn, `het_han_luc` được cập nhật; lịch của kỳ cũ không được gửi tiếp.
- Email gửi qua Resend. Cần xác minh tên miền gửi và dùng API key do Resend cấp.
- Phần này chưa hoạt động nếu chưa cấu hình Supabase và lịch chạy tự động.

## Thiết lập

1. Tạo Supabase và chạy `co-so-du-lieu/tao-bang-check-in.sql` trước.
2. Chạy `co-so-du-lieu/nhac-gia-han-email.sql` trong SQL Editor.
3. Điền `email_lien_he` và đặt `cho_phep_nhac_email=true` cho hội viên đã đồng ý.
4. Tạo tài khoản Resend tại https://resend.com, xác minh tên miền email gửi.
5. Thêm các biến môi trường bí mật trên máy chủ:

```dotenv
SUPABASE_URL=https://TEN-DU-AN.supabase.co
SUPABASE_SERVICE_ROLE_KEY=KHOA_SERVICE_ROLE
RESEND_API_KEY=KHOA_RESEND
EMAIL_GUI_NHAC=Taurus Gym <nhac-han@ten-mien-cua-ban.vn>
BI_MAT_LICH_NHAC=CHUOI_NGAU_NHIEN_DU_DAI
```

6. Thiết lập tác vụ gọi `GET https://ten-mien-cua-ban.vn/api/tac-vu/nhac-gia-han`
   mỗi ngày một lần, ví dụ 08:00 giờ Việt Nam. Header phải là
   `Authorization: Bearer BI_MAT_LICH_NHAC`.
   Chọn dịch vụ scheduler hỗ trợ header bí mật. Không dùng URL chứa khóa bí mật.

## Kiểm thử

- Tạo hội viên **giả** có email của chính bạn, đã đồng ý nhận nhắc.
- Chọn hết hạn 2 ngày nữa, chạy thử tác vụ và kiểm tra email.
- Chạy lại tác vụ: không gửi thêm cùng kỳ hạn.
- Đổi ngày hết hạn sang ngày khác: lịch nhắc kỳ mới sẽ được tính lại.
- Xem bảng `nhat_ky_nhac_gia_han` nếu gửi lỗi hoặc cần đối soát.

## Giới hạn bản đầu

- Cần kích hoạt scheduler riêng, chưa tự tạo lịch chạy trên hosting.
- Hệ thống demo đang lưu hội viên trong localStorage, **chưa liên thông** Supabase;
  email nhắc hạn chỉ dùng dữ liệu Supabase.
- Bản đầu không tự thử lại yêu cầu gửi khi trạng thái không chắc chắn,
  cần nhân viên kiểm tra `can_kiem_tra` để tránh spam.
- Chưa có trang quản trị theo dõi nhật ký email và chưa kiểm thử end-to-end.
- Nếu dùng Vercel, cần kiểm tra điều kiện hosting và tần suất cron của gói sử dụng.
