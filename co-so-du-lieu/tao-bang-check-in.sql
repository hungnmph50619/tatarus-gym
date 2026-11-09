-- Chạy trong SQL Editor của Supabase sau khi tạo dự án.
-- Bản độc lập để không ảnh hưởng dữ liệu demo localStorage hiện tại.
create table if not exists public.hoi_vien_checkin (
  id uuid primary key default gen_random_uuid(),
  tai_khoan_id uuid not null unique references auth.users(id),
  ma_phong text not null,
  ho_ten text not null,
  anh_dai_dien_url text,
  het_han_luc timestamptz not null,
  trang_thai text not null default 'hoat_dong'
    check (trang_thai in ('hoat_dong','tam_khoa'))
);

create table if not exists public.ve_da_su_dung (
  ma_mot_lan text primary key,
  ma_phong text not null,
  da_dung_luc timestamptz not null default now()
);

create table if not exists public.phien_tap (
  id uuid primary key default gen_random_uuid(),
  hoi_vien_id uuid not null references public.hoi_vien_checkin(id),
  ma_phong text not null,
  vao_luc timestamptz not null default now(),
  ra_luc timestamptz,
  check (ra_luc is null or ra_luc >= vao_luc)
);

create unique index if not exists chi_mot_phien_dang_mo
  on public.phien_tap (hoi_vien_id) where ra_luc is null;
create index if not exists chi_so_phien_tap_moi
  on public.phien_tap (ma_phong, vao_luc desc);

-- Mặc định không cấp quyền truy cập trực tiếp vào các bảng nhạy cảm.
alter table public.hoi_vien_checkin enable row level security;
alter table public.ve_da_su_dung enable row level security;
alter table public.phien_tap enable row level security;
revoke all on public.hoi_vien_checkin, public.ve_da_su_dung, public.phien_tap from anon, authenticated;

create or replace function public.xu_ly_quet_qr(
  p_tai_khoan uuid,
  p_phong text,
  p_ma_mot_lan text,
  p_hanh_dong text
) returns jsonb language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_hoi_vien public.hoi_vien_checkin%rowtype;
  v_phien uuid;
begin
  if p_hanh_dong not in ('vao','ra') or
     length(p_phong) < 1 or length(p_phong) > 100 or
     length(p_ma_mot_lan) <> 48 then
    return jsonb_build_object('thanhCong', false, 'thongBao', 'Yêu cầu không hợp lệ.');
  end if;

  -- Mã QR chỉ được sử dụng một lần, kể cả khi quét đồng thời.
  insert into public.ve_da_su_dung (ma_mot_lan, ma_phong)
  values (p_ma_mot_lan, p_phong)
  on conflict do nothing;
  if not found then
    return jsonb_build_object('thanhCong', false, 'thongBao', 'Vé đã được sử dụng. Hãy quét mã mới.');
  end if;

  select * into v_hoi_vien from public.hoi_vien_checkin
  where tai_khoan_id = p_tai_khoan and ma_phong = p_phong for update;
  if not found then
    return jsonb_build_object('thanhCong', false, 'thongBao', 'Không tìm thấy hội viên tại phòng gym này.');
  end if;
  if v_hoi_vien.trang_thai <> 'hoat_dong' then
    return jsonb_build_object('thanhCong', false, 'thongBao', 'Tài khoản đang bị khóa.');
  end if;

  if p_hanh_dong = 'vao' then
    if v_hoi_vien.het_han_luc <= now() then
      return jsonb_build_object('thanhCong', false, 'thongBao', 'Gói tập đã hết hạn.');
    end if;
    if exists (select 1 from public.phien_tap where hoi_vien_id = v_hoi_vien.id and ra_luc is null) then
      return jsonb_build_object('thanhCong', false, 'thongBao', 'Hội viên đang trong phòng gym.');
    end if;
    insert into public.phien_tap (hoi_vien_id, ma_phong)
    values (v_hoi_vien.id, p_phong) returning id into v_phien;
    return jsonb_build_object('thanhCong', true, 'thongBao', 'Check-in thành công. Chúc bạn tập luyện hiệu quả!', 'maPhien', v_phien);
  end if;

  update public.phien_tap set ra_luc = now()
  where hoi_vien_id = v_hoi_vien.id and ra_luc is null
  returning id into v_phien;
  if v_phien is null then
    return jsonb_build_object('thanhCong', false, 'thongBao', 'Không có phiên tập đang mở.');
  end if;
  return jsonb_build_object('thanhCong', true, 'thongBao', 'Check-out thành công!', 'maPhien', v_phien);
end;
$$;

revoke all on function public.xu_ly_quet_qr(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.xu_ly_quet_qr(uuid,text,text,text) to service_role;

-- Chỉ thử với tài khoản do bạn tạo. Không nhập dữ liệu khách thật trước khi
-- hoàn thiện chính sách bảo vệ ảnh và dữ liệu cá nhân.
