import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NhacGiaHan = {
  ma_nhat_ky: string;
  ho_ten: string;
  email_nhan: string;
  ngay_het_han: string;
};

function baoLoi(thongBao: string, trangThai: number) {
  return NextResponse.json({ thongBao }, { status: trangThai });
}
function anToanHtml(chuoi: string) {
  return chuoi.replace(/[&<>"']/g, kyTu => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[kyTu] || kyTu);
}

export async function GET(yeuCau: NextRequest) {
  const khoaLich = process.env.BI_MAT_LICH_NHAC;
  if (!khoaLich || yeuCau.headers.get("authorization") !== `Bearer ${khoaLich}`) {
    return baoLoi("Không có quyền gọi tác vụ.", 401);
  }
  const diaChi = process.env.SUPABASE_URL;
  const khoaMayChu = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const khoaEmail = process.env.RESEND_API_KEY;
  const emailGui = process.env.EMAIL_GUI_NHAC;
  if (!diaChi || !khoaMayChu || !khoaEmail || !emailGui) {
    return baoLoi("Chưa cấu hình Supabase hoặc dịch vụ gửi email.", 503);
  }
  const tieuDe = {
    apikey: khoaMayChu,
    Authorization: `Bearer ${khoaMayChu}`,
    "Content-Type": "application/json",
  };
  let danhSach: NhacGiaHan[];
  try {
    const phanHoi = await fetch(`${diaChi}/rest/v1/rpc/lay_nhac_gia_han_hai_ngay`, {
      method: "POST", headers: tieuDe, body: "{}", cache: "no-store",
    });
    if (!phanHoi.ok) return baoLoi("Không lấy được danh sách sắp hết hạn.", 502);
    danhSach = await phanHoi.json();
  } catch { return baoLoi("Không thể kết nối cơ sở dữ liệu.", 503); }

  let daGui = 0;
  let canKiemTra = 0;
  for (const nhac of danhSach) {
    const ngay = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric",
    }).format(new Date(nhac.ngay_het_han));
    const ten = anToanHtml(nhac.ho_ten);
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#243247">
      <h2>Taurus Gym – Nhắc gia hạn gói tập</h2>
      <p>Xin chào <strong>${ten}</strong>,</p>
      <p>Gói tập của bạn sẽ hết hạn sau <strong>2 ngày</strong>, vào ngày ${ngay}.</p>
      <p>Bạn vui lòng liên hệ lễ tân để được hỗ trợ gia hạn.</p>
      <p>Trân trọng,<br/>Taurus Gym</p>
    </div>`;
    let trangThai = "can_kiem_tra";
    let maEmail: string | null = null;
    try {
      const phanHoi = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${khoaEmail}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `taurus-gia-han-${nhac.ma_nhat_ky}`,
        },
        body: JSON.stringify({
          from: emailGui,
          to: [nhac.email_nhan],
          subject: "Taurus Gym – Gói tập của bạn sắp hết hạn sau 2 ngày",
          html,
        }),
      });
      if (!phanHoi.ok) throw new Error("Không gửi được email.");
      const duLieu = await phanHoi.json();
      maEmail = duLieu.id || null;
      trangThai = "da_gui";
      daGui++;
    } catch {
      canKiemTra++;
    }
    // Không tự gửi lại trường hợp không rõ kết quả, để tránh gửi trùng.
    try {
      await fetch(`${diaChi}/rest/v1/nhat_ky_nhac_gia_han?id=eq.${nhac.ma_nhat_ky}`, {
        method: "PATCH",
        headers: { ...tieuDe, Prefer: "return=minimal" },
        body: JSON.stringify({
          trang_thai: trangThai,
          ma_email: maEmail,
          gui_luc: trangThai === "da_gui" ? new Date().toISOString() : null,
        }),
      });
    } catch { canKiemTra++; }
  }
  return NextResponse.json({ daGui, canKiemTra, soCongViec: danhSach.length });
}
