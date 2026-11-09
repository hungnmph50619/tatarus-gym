"use client";
import { useEffect, useState } from "react";

type KetQua = { thanhCong: boolean; thongBao: string };
const diaChiSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const khoaCongKhai = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function TrangCheckIn() {
  const [ve, datVe] = useState("");
  const [email, datEmail] = useState("");
  const [matKhau, datMatKhau] = useState("");
  const [maTruyCap, datMaTruyCap] = useState("");
  const [dangXuLy, datDangXuLy] = useState(false);
  const [ketQua, datKetQua] = useState<KetQua | null>(null);

  useEffect(() => {
    datVe(new URLSearchParams(window.location.search).get("ve") || "");
    datMaTruyCap(sessionStorage.getItem("taurus_ma_truy_cap") || "");
  }, []);

  async function dangNhap(suKien: React.FormEvent) {
    suKien.preventDefault();
    if (!diaChiSupabase || !khoaCongKhai) return datKetQua({ thanhCong: false, thongBao: "Chưa cấu hình Supabase." });
    datDangXuLy(true);
    try {
      const phanHoi = await fetch(`${diaChiSupabase}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: khoaCongKhai, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: matKhau }),
      });
      const duLieu = await phanHoi.json();
      if (!phanHoi.ok || !duLieu.access_token) throw new Error("Email hoặc mật khẩu không đúng.");
      sessionStorage.setItem("taurus_ma_truy_cap", duLieu.access_token);
      datMaTruyCap(duLieu.access_token);
      datMatKhau("");
      datKetQua({ thanhCong: true, thongBao: "Đăng nhập thành công. Vui lòng xác nhận lượt quét." });
    } catch (loi) {
      datKetQua({ thanhCong: false, thongBao: loi instanceof Error ? loi.message : "Không đăng nhập được." });
    } finally { datDangXuLy(false); }
  }

  async function xacNhan() {
    datDangXuLy(true);
    datKetQua(null);
    try {
      const phanHoi = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${maTruyCap}` },
        body: JSON.stringify({ ve }),
      });
      const duLieu = await phanHoi.json();
      datKetQua({ thanhCong: !!duLieu.thanhCong, thongBao: duLieu.thongBao || "Không có phản hồi." });
      if (phanHoi.status === 401) {
        sessionStorage.removeItem("taurus_ma_truy_cap");
        datMaTruyCap("");
      }
    } catch { datKetQua({ thanhCong: false, thongBao: "Không kết nối được máy chủ." }); }
    finally { datDangXuLy(false); }
  }

  return <main style={{minHeight:"100vh",background:"#f3f7fc",display:"grid",placeItems:"center",padding:20,color:"#1f2937"}}>
    <section style={{width:"100%",maxWidth:440,background:"white",borderRadius:20,padding:28,boxShadow:"0 12px 35px #20386014"}}>
      <h1 style={{fontSize:28,fontWeight:800,marginBottom:8}}>Taurus Gym</h1>
      <p style={{color:"#64748b",marginBottom:24}}>Quét QR tại phòng tập để ghi nhận lượt vào hoặc ra.</p>
      {!ve && <p style={{color:"#b91c1c"}}>Chưa có vé xác minh. Hãy kết nối Wi-Fi phòng gym và quét mã QR tại cửa.</p>}
      {!maTruyCap && <form onSubmit={dangNhap} style={{display:"grid",gap:12}}>
        <label>Email hội viên<input required type="email" value={email} onChange={e=>datEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,border:"1px solid #cbd5e1",borderRadius:9}}/></label>
        <label>Mật khẩu<input required type="password" value={matKhau} onChange={e=>datMatKhau(e.target.value)} style={{display:"block",width:"100%",padding:12,border:"1px solid #cbd5e1",borderRadius:9}}/></label>
        <button disabled={dangXuLy} style={{background:"#2563eb",color:"white",borderRadius:9,padding:13}}>Đăng nhập</button>
      </form>}
      {maTruyCap && <div style={{display:"grid",gap:12}}>
        <p>Đã có phiên đăng nhập hội viên.</p>
        <button disabled={!ve || dangXuLy} onClick={xacNhan} style={{background:"#2563eb",color:"white",borderRadius:9,padding:13,opacity:(!ve||dangXuLy)?0.5:1}}>Xác nhận quét QR</button>
        <button onClick={()=>{sessionStorage.removeItem("taurus_ma_truy_cap");datMaTruyCap("");}} style={{color:"#475569"}}>Đăng xuất</button>
      </div>}
      {ketQua && <p role="status" style={{marginTop:20,padding:14,borderRadius:10,background:ketQua.thanhCong?"#dcfce7":"#fee2e2",color:ketQua.thanhCong?"#166534":"#991b1b"}}>{ketQua.thongBao}</p>}
      <p style={{fontSize:12,color:"#64748b",marginTop:24}}>Vé QR chỉ có hiệu lực 60 giây. Không chia sẻ đường dẫn check-in cho người khác.</p>
    </section>
  </main>;
}
