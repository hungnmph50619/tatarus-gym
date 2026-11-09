-- Chạy sau co-so-du-lieu/tao-bang-check-in.sql trong Supabase SQL Editor.
-- Chỉ nhắc đúng 2 ngày trước ngày hết hạn theo giờ Việt Nam.
alter table public.hoi_vien_checkin
  add column if not exists email_lien_he text,
  add column if not exists cho_phep_nhac_email boolean not null default false;

create table if not exists public.nhat_ky_nhac_gia_han (
  id uuid primary key default gen_random_uuid(),
  hoi_vien_id uuid not null references public.hoi_vien_checkin(id),
  ngay_het_han timestamptz not null,
  email_nhan text not null,
  trang_thai text not null default 'cho_gui'
    check (trang_thai in ('cho_gui','dang_gui','da_gui','can_kiem_tra')),
  tao_luc timestamptz not null default now(),
  gui_luc timestamptz,
  ma_email text,
  unique (hoi_vien_id, ngay_het_han)
);
alter table public.nhat_ky_nhac_gia_han enable row level security;
revoke all on public.nhat_ky_nhac_gia_han from anon, authenticated;

-- Tạo công việc một lần cho từng hội viên / kỳ hạn.
-- Khi gia hạn, ngày hết hạn đổi nên email kỳ cũ không được đưa vào hàng đợi mới.
create or replace function public.lay_nhac_gia_han_hai_ngay()
returns table (ma_nhat_ky uuid, ho_ten text, email_nhan text, ngay_het_han timestamptz)
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.nhat_ky_nhac_gia_han (hoi_vien_id, ngay_het_han, email_nhan)
  select h.id, h.het_han_luc, h.email_lien_he
  from public.hoi_vien_checkin h
  where h.trang_thai = 'hoat_dong'
    and h.cho_phep_nhac_email
    and h.email_lien_he is not null
    and h.email_lien_he ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and (h.het_han_luc at time zone 'Asia/Ho_Chi_Minh')::date =
        (now() at time zone 'Asia/Ho_Chi_Minh')::date + 2
  on conflict (hoi_vien_id, ngay_het_han) do nothing;

  return query
  with da_nhan as (
    select n.id
    from public.nhat_ky_nhac_gia_han n
    join public.hoi_vien_checkin h on h.id = n.hoi_vien_id
    where n.trang_thai = 'cho_gui'
      and h.het_han_luc = n.ngay_het_han
      and h.cho_phep_nhac_email
      and h.trang_thai = 'hoat_dong'
      and (h.het_han_luc at time zone 'Asia/Ho_Chi_Minh')::date =
          (now() at time zone 'Asia/Ho_Chi_Minh')::date + 2
    order by n.tao_luc
    limit 20
    for update of n skip locked
  ), cap_nhat as (
    update public.nhat_ky_nhac_gia_han n
    set trang_thai = 'dang_gui'
    from da_nhan d
    where n.id = d.id
    returning n.id, n.hoi_vien_id, n.email_nhan, n.ngay_het_han
  )
  select c.id, h.ho_ten, c.email_nhan, c.ngay_het_han
  from cap_nhat c join public.hoi_vien_checkin h on h.id = c.hoi_vien_id;
end;
$$;
revoke all on function public.lay_nhac_gia_han_hai_ngay() from public, anon, authenticated;
grant execute on function public.lay_nhac_gia_han_hai_ngay() to service_role;
