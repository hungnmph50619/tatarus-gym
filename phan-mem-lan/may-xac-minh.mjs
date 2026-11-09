// Dịch vụ chạy trên máy tính lễ tân, KHÔNG công khai cổng này ra Internet.
import https from "node:https";
import fs from "node:fs";
import crypto from "node:crypto";
import net from "node:net";

const cong = Number(process.env.CONG_LAN || "3443");
const mayChu = process.env.DIA_CHI_LAN || "0.0.0.0";
const diaChiCloud = process.env.DIA_CHI_CLOUD;
const maPhong = process.env.MA_PHONG_GYM;
const khoaChung = process.env.KHOA_XAC_MINH_LAN;
const tepChungChi = process.env.TEP_CHUNG_CHI_TLS;
const tepKhoa = process.env.TEP_KHOA_TLS;

if (!diaChiCloud || !diaChiCloud.startsWith("https://") || !maPhong ||
    !khoaChung || khoaChung.length < 32 || !tepChungChi || !tepKhoa) {
  throw new Error("Thiếu cấu hình LAN. Xem huong-dan/CHECK-IN.md.");
}

function laDiaChiNoiBo(diaChi = "") {
  // Chỉ nhận địa chỉ IPv4 nội bộ hoặc loopback; chặn truy cập Internet trực tiếp.
  const ip = diaChi.replace(/^::ffff:/, "");
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (net.isIP(ip) !== 4) return false;
  const o = ip.split(".").map(Number);
  return o[0] === 10 || (o[0] === 172 && o[1] >= 16 && o[1] <= 31) ||
    (o[0] === 192 && o[1] === 168);
}

const lanQuetGanDay = new Map();
const mayChuHttps = https.createServer({
  key: fs.readFileSync(tepKhoa),
  cert: fs.readFileSync(tepChungChi),
}, (yeuCau, phanHoi) => {
  const ip = yeuCau.socket.remoteAddress || "";
  if (!laDiaChiNoiBo(ip)) {
    phanHoi.writeHead(403).end("Khong duoc truy cap.");
    return;
  }
  const thoiGian = Date.now();
  for (const [diaChi, moc] of lanQuetGanDay) {
    if (thoiGian - moc > 60_000) lanQuetGanDay.delete(diaChi);
  }
  if (thoiGian - (lanQuetGanDay.get(ip) || 0) < 2500) {
    phanHoi.writeHead(429).end("Vui long thu lai sau.");
    return;
  }
  let duongDan;
  try { duongDan = new URL(yeuCau.url || "/", "https://lan.local"); }
  catch { phanHoi.writeHead(400).end("Duong dan khong hop le."); return; }
  const hanhDong = duongDan.pathname === "/vao" ? "vao" :
    duongDan.pathname === "/ra" ? "ra" : null;
  if (yeuCau.method !== "GET" || !hanhDong) {
    phanHoi.writeHead(404).end("Khong tim thay.");
    return;
  }
  lanQuetGanDay.set(ip, thoiGian);
  const thongTin = {
    phienBan: 1,
    maPhong,
    hanhDong,
    phatHanhLuc: thoiGian,
    maMotLan: crypto.randomBytes(24).toString("hex"),
  };
  const noiDung = Buffer.from(JSON.stringify(thongTin)).toString("base64url");
  const chuKy = crypto.createHmac("sha256", khoaChung).update(noiDung).digest("hex");
  const dich = new URL("/check-in", diaChiCloud);
  dich.searchParams.set("ve", noiDung + "." + chuKy);
  phanHoi.writeHead(302, {
    Location: dich.toString(),
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  }).end();
});
mayChuHttps.listen(cong, mayChu, () => {
  console.log(`Xac minh LAN dang chay tai cong ${cong}. Khong mo cong ra Internet.`);
});
