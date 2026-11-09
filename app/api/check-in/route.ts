import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function traLoi(loi: string, ma: number) {
  return NextResponse.json({ thanhCong: false, thongBao: loi }, { status: ma, headers: { "Cache-Control": "no-store" } });
}

function xacMinhVe(ve: string, khoa: string) {
  if (ve.length > 2048) return null;
  const phan = ve.split(".");
  if (phan.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(phan[0]) || !/^[a-f0-9]{64}$/.test(phan[1])) return null;
  const chuKyDung = crypto.createHmac("sha256", khoa).update(phan[0]).digest();
  const chuKyNhan = Buffer.from(phan[1], "hex");
  if (chuKyDung.length !== chuKyNhan.length || !crypto.timingSafeEqual(chuKyDung, chuKyNhan)) return null;
  try {
    const thongTin = JSON.parse(Buffer.from(phan[0], "base64url").toString("utf8"));
    if (thongTin.phienBan !== 1 || !["vao", "ra"].includes(thongTin.hanhDong) ||
      typeof thongTin.maPhong !== "string" || typeof thongTin.maMotLan !== "string" ||
      !/^[a-f0-9]{48}$/.test(thongTin.maMotLan) || typeof thongTin.phatHanhLuc !== "number") return null;
    const doLech = Date.now() - thongTin.phatHanhLuc;
    if (doLech < -10000 || doLech > 60000) return null;
    return thongTin as { maPhong: string; maMotLan: string; hanhDong: "vao"|"ra"; phatHanhLuc: number };
  } catch { return null; }
}

export async function POST(yeuCau: NextRequest) {
  const urlSupabase = process.env.SUPABASE_URL;
  const khoaMayChu = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const khoaCongKhai = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const khoaLan = process.env.KHOA_XAC_MINH_LAN;
  if (!urlSupabase || !khoaMayChu || !khoaCongKhai || !khoaLan) return traLoi("Máy chủ chưa được cấu hình.", 503);
  let duLieu: { ve?: unknown };
  try { duLieu = await yeuCau.json(); } catch { return traLoi("Dữ liệu không hợp lệ.", 400); }
  if (typeof duLieu.ve !== "string") return traLoi("Thiếu vé xác minh.", 400);
  const thongTin = xacMinhVe(duLieu.ve, khoaLan);
  if (!thongTin) return traLoi("Vé check-in không hợp lệ hoặc đã hết hạn. Hãy quét lại QR tại phòng gym.", 403);

  const maTruyCap = yeuCau.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!maTruyCap) return traLoi("Bạn cần đăng nhập tài khoản hội viên.", 401);
  let ketQuaXacThuc: Response;
  try {
    ketQuaXacThuc = await fetch(`${urlSupabase}/auth/v1/user`, {
      headers: { apikey: khoaCongKhai, Authorization: `Bearer ${maTruyCap}` },
      cache: "no-store",
    });
  } catch { return traLoi("Không kết nối được hệ thống xác thực.", 503); }
  if (!ketQuaXacThuc.ok) return traLoi("Phiên đăng nhập không hợp lệ.", 401);
  const nguoiDung = await ketQuaXacThuc.json();
  if (!nguoiDung.id) return traLoi("Không xác định được hội viên.", 401);

  // RPC thực hiện trong một giao dịch: chống vé dùng lại + kiểm tra gói tập + ghi phiên tập.
  let ketQua: Response;
  try {
    ketQua = await fetch(`${urlSupabase}/rest/v1/rpc/xu_ly_quet_qr`, {
      method: "POST",
      headers: {
        apikey: khoaMayChu,
        Authorization: `Bearer ${khoaMayChu}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_tai_khoan: nguoiDung.id, p_phong: thongTin.maPhong, p_ma_mot_lan: thongTin.maMotLan, p_hanh_dong: thongTin.hanhDong }),
      cache: "no-store",
    });
  } catch { return traLoi("Không kết nối được cơ sở dữ liệu.", 503); }
  const duLieuPhanHoi = await ketQua.json().catch(() => null);
  if (!ketQua.ok) return traLoi("Không thể xử lý check-in. Vui lòng liên hệ lễ tân.", 503);
  return NextResponse.json(duLieuPhanHoi, { headers: { "Cache-Control": "no-store" } });
}
