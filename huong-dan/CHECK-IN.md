# Taurus Gym — Dịch vụ xác minh QR trong mạng LAN

## 1. Tình trạng

Đây là **nền tảng thử nghiệm có thể cấu hình**, không phải hệ thống sản xuất hoàn chỉnh.
Website hiện tại vẫn quản lý hội viên demo bằng localStorage. Bảng `hoi_vien_checkin`
trong Supabase là dữ liệu riêng của luồng QR. Chưa có trang tạo hội viên trên Cloud
hoặc màn hình lễ tân xem ảnh theo thời gian thực.

## 2. Các thành phần

- `phan-mem-lan/may-xac-minh.mjs`: dịch vụ HTTPS chạy trên máy tính lễ tân.
- `app/check-in/page.tsx`: màn hình hội viên đăng nhập và xác nhận quét.
- `app/api/check-in/route.ts`: máy chủ Cloud xác minh tài khoản, chữ ký và ghi dữ liệu.
- `co-so-du-lieu/tao-bang-check-in.sql`: tạo bảng và hàm xử lý trong Supabase.

## 3. Thiết lập Supabase

1. Tạo dự án Supabase, chạy file SQL trong SQL Editor.
2. Tạo tài khoản hội viên trong Supabase Authentication, bật đăng nhập email/mật khẩu.
3. Tạo một bản ghi trong `hoi_vien_checkin` liên kết `tai_khoan_id` với `auth.users.id`.
4. Đảm bảo `ma_phong` khớp với `MA_PHONG_GYM`, ví dụ `taurus-01`.
5. Chỉ dùng dữ liệu giả để thử nghiệm.

## 4. Biến môi trường cho website Cloud

Đặt vào `.env.local` (không commit):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TEN-DU-AN.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=KHOA_ANON_CONG_KHAI
SUPABASE_URL=https://TEN-DU-AN.supabase.co
SUPABASE_SERVICE_ROLE_KEY=KHOA_BI_MAT_SERVICE_ROLE
KHOA_XAC_MINH_LAN=CHUOI_BI_MAT_NGAU_NHIEN_TOI_THIEU_32_KY_TU
```

Triển khai Next.js lên hosting hỗ trợ API server. HTTPS công khai là bắt buộc.
**Không đưa service role key hoặc khóa LAN vào biến có tiền tố NEXT_PUBLIC_.**

## 5. Biến môi trường dịch vụ LAN (PowerShell)

```powershell
$env:CONG_LAN="3443"
$env:DIA_CHI_LAN="0.0.0.0"
$env:DIA_CHI_CLOUD="https://ten-mien-cloud-cua-ban.vn"
$env:MA_PHONG_GYM="taurus-01"
$env:KHOA_XAC_MINH_LAN="CUNG_CHUOI_BI_MAT_DA_CAU_HINH_O_CLOUD"
$env:TEP_CHUNG_CHI_TLS="C:\duong-dan\chung-chi.pem"
$env:TEP_KHOA_TLS="C:\duong-dan\khoa-rieng.pem"
node .\phan-mem-lan\may-xac-minh.mjs
```

Đây là dịch vụ dùng API có sẵn của Node.js, không cần cài thêm thư viện.
**Không dùng chứng chỉ tự ký chưa được thiết bị khách tin cậy**.
Hãy cấu hình DNS nội bộ và tên miền riêng với chứng chỉ HTTPS hợp lệ.
Chứng chỉ riêng chỉ nằm trên máy lễ tân. Không commit khóa riêng lên GitHub.

Mã QR cửa vào dẫn đến `https://checkin.ten-mien-cua-ban.vn:3443/vao`.
Mã QR cửa ra dẫn đến `https://checkin.ten-mien-cua-ban.vn:3443/ra`.
DNS nội bộ ánh xạ tên này đến IP LAN của máy lễ tân.
Không cấu hình port forwarding từ Internet đến cổng 3443.

Quan trọng: điện thoại khách phải truy cập được cổng 3443 của máy lễ tân.
Một số Wi-Fi khách bật AP/client isolation sẽ ngăn kết nối này. Chỉ mở
quyền từ mạng Wi-Fi khách tới đúng dịch vụ check-in; không mở quyền truy cập
các máy và dịch vụ quản trị khác. Thiết lập firewall Windows tương ứng.
Dịch vụ dùng IP nội bộ như một lớp lọc cơ bản; phân vùng mạng và firewall
mới là biện pháp ngăn truy cập từ bên ngoài.

## 6. Cách thử

1. Chạy Next.js Cloud, Supabase và dịch vụ LAN.
2. Điện thoại kết nối Wi-Fi phòng gym, quét QR cửa vào.
3. Trang Cloud mở ra, đăng nhập hội viên rồi nhấn xác nhận.
4. Dữ liệu xuất hiện trong bảng `phien_tap` trên Supabase.
5. Quét cửa vào lần nữa phải báo đã ở trong phòng; quét cửa ra sẽ ghi `ra_luc`.
6. Thử 4G ở bên ngoài LAN phải không mở được dịch vụ LAN.
7. Kiểm tra mã đã dùng không được sử dụng lại và vé quá 60 giây bị từ chối.

## 7. Giới hạn cần hoàn thiện trước khi dùng thực tế

- Chưa có Dashboard lễ tân/ảnh hội viên và phân quyền nhân viên.
- Chưa có tự động làm mới phiên đăng nhập; hết phiên cần đăng nhập lại.
- Mã vé có thể bị chuyển tiếp trong thời gian ngắn; QR + LAN không chứng minh
  tuyệt đối sự hiện diện. Lễ tân vẫn phải đối chiếu người thật.
- Một khóa LAN đang dùng chung trong bản khởi đầu. Khi thương mại hóa đa
  chi nhánh, phải có khóa riêng từng thiết bị, hỗ trợ thu hồi và luân phiên khóa.
- Cần triển khai chống lạm dụng, nhật ký, giám sát trạng thái dịch vụ, xác minh
  HTTPS và sao lưu dữ liệu trước khi đưa vào sản xuất.
- Chưa xử lý gia hạn gói, bảo lưu, vé tập theo lượt, gói nhiều chi nhánh.
- Không lưu ảnh hội viên trong thư mục công khai nếu chưa có chính sách
  quyền truy cập; nên dùng Supabase Storage private bucket và signed URL có hạn.

Nếu chưa có tên miền/HTTPS nội bộ, **không bỏ TLS để chạy HTTP thật cho khách**.
