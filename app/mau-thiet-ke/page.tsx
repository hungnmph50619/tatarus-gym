"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity, ArrowLeft, ArrowRight, CalendarClock, Check, ChevronDown,
  CircleHelp, CreditCard, Dumbbell, ExternalLink, LayoutDashboard,
  Mail, Menu, MoreHorizontal, Plus, Search, ShieldCheck, Trash2,
  UserRound, Users, Wallet, X
} from "lucide-react";
import kieu from "./trang-mau.module.css";

type HoiVien = {
  id: string; hoTen: string; soDienThoai: string;
  goiTap: string; ngayHetHan: string; soTienDaThu: number;
};
type BieuMau = {
  hoTen: string; soDienThoai: string; goiTap: string;
  ngayHetHan: string; soTienDaThu: string;
};
const KHO_LUU_TRU = "gymflow-hoi-vien-demo-v1";
const hoiVienMau: HoiVien[] = [
  { id: "001", hoTen: "Nguyễn Văn An", soDienThoai: "0900000001", goiTap: "Gói 3 tháng", ngayHetHan: "2027-02-12", soTienDaThu: 1200000 },
  { id: "002", hoTen: "Trần Thu Hà", soDienThoai: "0900000002", goiTap: "Gói 1 tháng", ngayHetHan: "2026-11-22", soTienDaThu: 450000 },
  { id: "003", hoTen: "Lê Minh Đức", soDienThoai: "0900000003", goiTap: "Gói 6 tháng", ngayHetHan: "2027-04-10", soTienDaThu: 2100000 },
];
const mauRong: BieuMau = { hoTen: "", soDienThoai: "", goiTap: "Gói 1 tháng", ngayHetHan: "", soTienDaThu: "450000" };
const giaGoi: Record<string, string> = { "Gói 1 tháng": "450000", "Gói 3 tháng": "1200000", "Gói 6 tháng": "2100000" };
const ngayHienTai = () => {
  const nay = new Date();
  return `${nay.getFullYear()}-${String(nay.getMonth()+1).padStart(2,"0")}-${String(nay.getDate()).padStart(2,"0")}`;
};
const tienViet = (so: number) => new Intl.NumberFormat("vi-VN", {style:"currency",currency:"VND",maximumFractionDigits:0}).format(so);
const ngayViet = (ngay: string) => {
  const [nam,thang,ngayTrongThang] = ngay.split("-");
  return `${ngayTrongThang}/${thang}/${nam}`;
};
function tinhTrang(hoiVien: HoiVien) {
  const homNay = ngayHienTai();
  if (hoiVien.ngayHetHan < homNay) return {chu:"Đã hết hạn",kieu:"hetHan"};
  const khoangCach = Math.round((Date.parse(hoiVien.ngayHetHan+"T00:00:00")-Date.parse(homNay+"T00:00:00"))/86400000);
  if (khoangCach <= 14) return {chu:"Sắp hết hạn",kieu:"sapHetHan"};
  return {chu:"Đang hoạt động",kieu:"hoatDong"};
}
function chuVietTat(ten: string) {
  return ten.trim().split(/\s+/).slice(-2).map(tu => tu.slice(0,1)).join("").toUpperCase();
}
function duLieuHopLe(duLieu: unknown): duLieu is HoiVien[] {
  return Array.isArray(duLieu) && duLieu.every((muc: unknown) => {
    if (!muc || typeof muc !== "object") return false;
    const m = muc as Record<string,unknown>;
    return typeof m.id === "string" && typeof m.hoTen === "string" &&
      typeof m.soDienThoai === "string" && typeof m.goiTap === "string" &&
      typeof m.ngayHetHan === "string" && typeof m.soTienDaThu === "number";
  });
}

export default function TrangMauHoiVien() {
  const [danhSach, datDanhSach] = useState<HoiVien[]>(hoiVienMau);
  const [daTai, datDaTai] = useState(false);
  const [tuKhoa, datTuKhoa] = useState("");
  const [locTrangThai, datLocTrangThai] = useState("tat-ca");
  const [maDangChon, datMaDangChon] = useState<string | null>("001");
  const [moBieuMau, datMoBieuMau] = useState(false);
  const [moMenu, datMoMenu] = useState(false);
  const [bieuMau, datBieuMau] = useState<BieuMau>(mauRong);
  const [thongBao, datThongBao] = useState("");
  const nutDong = useRef<HTMLButtonElement>(null);
  const nutThem = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const daLuu = localStorage.getItem(KHO_LUU_TRU);
      if (daLuu) {
        const duLieu: unknown = JSON.parse(daLuu);
        if (duLieuHopLe(duLieu)) {
          datDanhSach(duLieu);
          datMaDangChon(duLieu[0]?.id || null);
        }
      }
    } catch { /* Dữ liệu demo không thể đọc: giữ dữ liệu mẫu. */ }
    datDaTai(true);
  }, []);
  useEffect(() => {
    if (!daTai) return;
    try { localStorage.setItem(KHO_LUU_TRU, JSON.stringify(danhSach)); }
    catch { datThongBao("Trình duyệt không thể lưu dữ liệu mẫu."); }
  }, [danhSach, daTai]);
  useEffect(() => {
    if (moBieuMau) nutDong.current?.focus();
    else nutThem.current?.focus();
  }, [moBieuMau]);
  useEffect(() => {
    if (!thongBao) return;
    const henGio = setTimeout(() => datThongBao(""), 4500);
    return () => clearTimeout(henGio);
  }, [thongBao]);

  const locDuoc = useMemo(() => danhSach.filter(hoiVien => {
    const khopTen = `${hoiVien.hoTen} ${hoiVien.soDienThoai} ${hoiVien.goiTap}`.toLocaleLowerCase("vi")
      .includes(tuKhoa.toLocaleLowerCase("vi").trim());
    return khopTen && (locTrangThai === "tat-ca" || tinhTrang(hoiVien).kieu === locTrangThai);
  }), [danhSach, tuKhoa, locTrangThai]);
  const dangChon = danhSach.find(m => m.id === maDangChon) || null;
  const dangHoatDong = danhSach.filter(m => tinhTrang(m).kieu === "hoatDong").length;
  const sapHetHan = danhSach.filter(m => tinhTrang(m).kieu === "sapHetHan").length;
  const daHetHan = danhSach.filter(m => tinhTrang(m).kieu === "hetHan").length;

  function themHoiVien(suKien: FormEvent<HTMLFormElement>) {
    suKien.preventDefault();
    const ten = bieuMau.hoTen.trim();
    const sdt = bieuMau.soDienThoai.trim();
    if (!ten || !sdt || !bieuMau.ngayHetHan || !/^[0-9+().\s-]{8,20}$/.test(sdt)) {
      datThongBao("Vui lòng nhập đầy đủ thông tin và số điện thoại hợp lệ.");
      return;
    }
    const moi: HoiVien = {
      id: crypto.randomUUID(), hoTen: ten, soDienThoai: sdt,
      goiTap: bieuMau.goiTap, ngayHetHan: bieuMau.ngayHetHan,
      soTienDaThu: Number(bieuMau.soTienDaThu) || 0
    };
    datDanhSach(ds => [...ds,moi]);
    datMaDangChon(moi.id);
    datBieuMau(mauRong);
    datMoBieuMau(false);
    datThongBao("Đã thêm hội viên vào dữ liệu thử nghiệm.");
  }

  function xoaHoiVien(m: HoiVien) {
    if (!window.confirm(`Xóa ${m.hoTen} khỏi danh sách hội viên?`)) return;
    datDanhSach(ds => ds.filter(hoiVien => hoiVien.id !== m.id));
    if (maDangChon === m.id) datMaDangChon(danhSach.find(item => item.id !== m.id)?.id || null);
    datThongBao("Đã xóa hồ sơ hội viên trong dữ liệu thử nghiệm.");
  }

  return <div className={kieu.khungTrang}>
    <a className={kieu.boQua} href="#danh-sach-hoi-vien">Chuyển đến nội dung chính</a>
    <header className={kieu.thanhDau}>
      <a href="/" className={kieu.thuongHieu} aria-label="Taurus Gym - về trang hiện tại">
        <span className={kieu.bieuTuong}><Dumbbell size={23} strokeWidth={2.4}/></span>
        <span><strong>TAURUS<span>GYM</span></strong><small>OPERATIONS STUDIO</small></span>
      </a>
      <nav aria-label="Điều hướng chính" className={kieu.dieuHuong}>
        <a href="/">Tổng quan</a>
        <a className={kieu.dangChon} href="/mau-thiet-ke" aria-current="page">Hội viên</a>
        <a href="/check-in">Check-in</a>
      </nav>
      <div className={kieu.tienIch}>
        <span className={kieu.nhanXemThu}>BẢN XEM THỬ</span>
        <a className={kieu.veBanCu} href="/"><ArrowLeft size={16}/> Giao diện cũ</a>
        <button className={kieu.nutMenu} type="button" aria-label="Mở điều hướng" aria-expanded={moMenu} onClick={() => datMoMenu(!moMenu)}><Menu size={21}/></button>
      </div>
    </header>
    {moMenu && <nav className={kieu.menuDiDong} aria-label="Điều hướng di động">
      <a href="/">Tổng quan</a><a href="/mau-thiet-ke" aria-current="page">Hội viên</a><a href="/check-in">Check-in</a>
    </nav>}

    <main id="danh-sach-hoi-vien" className={kieu.noiDung}>
      <div className={kieu.dongMoDau}>
        <div>
          <div className={kieu.nhanNho}><span className={kieu.chamSang}/> QUẢN LÝ VẬN HÀNH / HỘI VIÊN</div>
          <h1>Hội viên <span className={kieu.vetNgan}>/</span> <span className={kieu.tieuDeNhe}>Mọi mối quan hệ đều quan trọng.</span></h1>
          <p>Quản lý hồ sơ, gói tập và các mốc quan trọng trên một màn hình rõ ràng.</p>
        </div>
        <button className={kieu.nutChinh} type="button" ref={nutThem} onClick={() => datMoBieuMau(true)}><Plus size={19}/> Thêm hội viên</button>
      </div>

      <section className={kieu.daiTinhHinh} aria-label="Tình hình hội viên">
        <div className={kieu.chiSoChinh}><span>HỘI VIÊN TRONG HỆ THỐNG</span><strong>{danhSach.length.toLocaleString("vi-VN")}</strong><small>Hồ sơ được lưu trong trình duyệt</small></div>
        <div className={kieu.chiSoPhu}><span className={kieu.iconXanh}><Activity size={18}/></span><div><strong>{dangHoatDong}</strong><small>Đang hoạt động</small></div></div>
        <div className={kieu.chiSoPhu}><span className={kieu.iconCam}><CalendarClock size={18}/></span><div><strong>{sapHetHan}</strong><small>Sắp hết hạn (14 ngày)</small></div></div>
        <div className={kieu.chiSoPhu}><span className={kieu.iconDo}><CircleHelp size={18}/></span><div><strong>{daHetHan}</strong><small>Đã hết hạn</small></div></div>
      </section>

      <div className={kieu.luoiChinh}>
        <section className={kieu.khuDanhSach} aria-labelledby="tieu-de-danh-sach">
          <div className={kieu.tieuDeDanhSach}>
            <div><span className={kieu.nhanNho}>MEMBER DIRECTORY</span><h2 id="tieu-de-danh-sach">Danh sách hội viên</h2></div>
            <span className={kieu.demKetQua} aria-live="polite">{locDuoc.length} kết quả</span>
          </div>
          <div className={kieu.boLoc}>
            <label className={kieu.timKiem}>
              <Search size={19}/><span className={kieu.chiDocManHinh}>Tìm hội viên</span>
              <input type="search" placeholder="Tìm tên, số điện thoại, gói tập…" value={tuKhoa} onChange={e => datTuKhoa(e.target.value)}/>
            </label>
            <label className={kieu.chonLoc}>
              <span className={kieu.chiDocManHinh}>Lọc trạng thái</span>
              <select value={locTrangThai} onChange={e => datLocTrangThai(e.target.value)}>
                <option value="tat-ca">Tất cả trạng thái</option>
                <option value="hoatDong">Đang hoạt động</option>
                <option value="sapHetHan">Sắp hết hạn</option>
                <option value="hetHan">Đã hết hạn</option>
              </select><ChevronDown size={16} aria-hidden="true"/>
            </label>
          </div>
          <div className={kieu.bangCuon}>
            <table className={kieu.bang}>
              <thead><tr><th scope="col">Hội viên</th><th scope="col">Gói tập</th><th scope="col">Hạn sử dụng</th><th scope="col">Trạng thái</th><th scope="col"><span className={kieu.chiDocManHinh}>Chọn</span></th></tr></thead>
              <tbody>{locDuoc.map(m => {
                const tinh = tinhTrang(m);
                const duocChon = m.id === maDangChon;
                return <tr key={m.id} className={duocChon ? kieu.hangDuocChon : ""}>
                  <td><button type="button" className={kieu.oNguoi} onClick={() => datMaDangChon(m.id)} aria-label={`Xem hồ sơ ${m.hoTen}`} aria-pressed={duocChon}>
                    <span className={kieu.avatar}>{chuVietTat(m.hoTen)}</span><span><strong>{m.hoTen}</strong><small>{m.soDienThoai}</small></span>
                  </button></td>
                  <td>{m.goiTap}</td>
                  <td className={kieu.soMono}>{ngayViet(m.ngayHetHan)}</td>
                  <td><span className={`${kieu.trangThai} ${kieu[tinh.kieu]}`}><span/>{tinh.chu}</span></td>
                  <td><button type="button" className={kieu.nutXem} aria-label={`Xem chi tiết ${m.hoTen}`} onClick={() => datMaDangChon(m.id)}><ArrowRight size={17}/></button></td>
                </tr>;
              })}</tbody>
            </table>
            {locDuoc.length === 0 && <div className={kieu.trangRong}><Search size={26}/><strong>Chưa tìm thấy hội viên phù hợp</strong><span>Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</span><button type="button" onClick={() => {datTuKhoa("");datLocTrangThai("tat-ca");}}>Xóa bộ lọc</button></div>}
          </div>
          <div className={kieu.chanDanhSach}><span>Dữ liệu demo sử dụng chung với trang gốc.</span><span>{locDuoc.length} / {danhSach.length} hội viên</span></div>
        </section>

        <aside className={kieu.hoSo} aria-label="Hồ sơ hội viên đang chọn">
          {dangChon ? <>
            <div className={kieu.nhanNho}>MEMBER SPOTLIGHT <span className={kieu.chamSang}/></div>
            <div className={kieu.hoSoDau}>
              <div className={kieu.avatarLon} aria-label="Ảnh đại diện mặc định"><UserRound size={48}/><small>CHƯA CÓ ẢNH</small></div>
              <div><div className={kieu.maHoiVien}>MÃ: {dangChon.id.length > 8 ? dangChon.id.slice(0,8) : dangChon.id}</div><h2>{dangChon.hoTen}</h2><span className={`${kieu.trangThai} ${kieu[tinhTrang(dangChon).kieu]}`}><span/>{tinhTrang(dangChon).chu}</span></div>
            </div>
            <div className={kieu.thongTinChinh}><span>GÓI TẬP HIỆN TẠI</span><strong>{dangChon.goiTap}</strong><small>Hạn sử dụng: {ngayViet(dangChon.ngayHetHan)}</small></div>
            <dl className={kieu.chiTiet}>
              <div><dt><Users size={16}/> Số điện thoại</dt><dd>{dangChon.soDienThoai}</dd></div>
              <div><dt><Wallet size={16}/> Số tiền đã thu</dt><dd>{tienViet(dangChon.soTienDaThu)}</dd></div>
              <div><dt><ShieldCheck size={16}/> Nguồn dữ liệu</dt><dd>Trình duyệt</dd></div>
            </dl>
            <div className={kieu.hanhDongHoSo}>
              <button type="button" className={kieu.nutXoa} onClick={() => xoaHoiVien(dangChon)}><Trash2 size={17}/> Xóa hội viên</button>
            </div>
            <p className={kieu.ghiChuHoSo}>Hồ sơ hiện tại chưa có trường ảnh. Mẫu thiết kế dùng avatar thay thế, không tự tạo dữ liệu hoặc ảnh khách.</p>
          </> : <div className={kieu.hoSoRong}><UserRound size={38}/><strong>Chọn một hội viên</strong><span>Chi tiết sẽ hiển thị tại đây.</span></div>}
        </aside>
      </div>

      <section className={kieu.daiCuoi} aria-label="Thông tin về trang mẫu">
        <div className={kieu.bieuTuongNho}><Dumbbell size={22}/></div>
        <div><strong>TAURUS COMMAND — BẢN TRÌNH DIỄN THIẾT KẾ</strong><span>Không thay đổi API, không thay đổi dữ liệu hội viên hoặc quy trình nghiệp vụ.</span></div>
        <a href="/" className={kieu.lienKetCuoi}>Trở về giao diện hiện tại <ExternalLink size={15}/></a>
      </section>
    </main>

    {thongBao && <div className={kieu.thongBao} role="status"><Check size={17}/>{thongBao}<button type="button" aria-label="Đóng thông báo" onClick={() => datThongBao("")}><X size={15}/></button></div>}

    {moBieuMau && <div className={kieu.phuMo} role="presentation" onMouseDown={e => {if(e.target === e.currentTarget) datMoBieuMau(false);}}>
      <section className={kieu.hopThoai} role="dialog" aria-modal="true" aria-labelledby="tieu-de-them" onKeyDown={e => {if (e.key === "Escape") datMoBieuMau(false); if(e.key === "Tab") { const phanTu = e.currentTarget.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('button:not([disabled]), input:not([disabled]), select:not([disabled])'); const dau = phanTu[0]; const cuoi = phanTu[phanTu.length-1]; if(e.shiftKey && document.activeElement === dau) {e.preventDefault();cuoi?.focus();} else if(!e.shiftKey && document.activeElement === cuoi){e.preventDefault();dau?.focus();} }}}>
        <div className={kieu.dauHopThoai}><div><span className={kieu.nhanNho}>THÊM HỘI VIÊN</span><h2 id="tieu-de-them">Hồ sơ mới</h2></div><button ref={nutDong} type="button" aria-label="Đóng biểu mẫu" onClick={() => datMoBieuMau(false)}><X size={22}/></button></div>
        <form className={kieu.bieuMau} onSubmit={themHoiVien}>
          <label>Họ và tên <input required maxLength={120} value={bieuMau.hoTen} onChange={e => datBieuMau({...bieuMau,hoTen:e.target.value})} placeholder="Nguyễn Văn A"/></label>
          <label>Số điện thoại <input required type="tel" maxLength={20} value={bieuMau.soDienThoai} onChange={e => datBieuMau({...bieuMau,soDienThoai:e.target.value})} placeholder="09…" /></label>
          <label>Gói tập <select value={bieuMau.goiTap} onChange={e => datBieuMau({...bieuMau,goiTap:e.target.value,soTienDaThu:giaGoi[e.target.value] || "0"})}><option>Gói 1 tháng</option><option>Gói 3 tháng</option><option>Gói 6 tháng</option></select></label>
          <label>Ngày hết hạn <input required type="date" value={bieuMau.ngayHetHan} onChange={e => datBieuMau({...bieuMau,ngayHetHan:e.target.value})}/></label>
          <label>Số tiền đã thu (VND) <input required type="number" min={0} step={1} value={bieuMau.soTienDaThu} onChange={e => datBieuMau({...bieuMau,soTienDaThu:e.target.value})}/></label>
          <div className={kieu.nutBieuMau}><button type="button" className={kieu.nutPhu} onClick={() => datMoBieuMau(false)}>Hủy</button><button type="submit" className={kieu.nutChinh}><Plus size={17}/> Lưu hội viên</button></div>
        </form>
      </section>
    </div>}
  </div>;
}
