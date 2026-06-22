import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import random
import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.responses import HTMLResponse


SECRET_KEY = "khoa_bi_mat_cua_xa_thanh_an"
ALGORITHM = "HS256"

app = FastAPI(title="Hệ thống Chuyển đổi số Xã Thạnh An")
@app.get("/", response_class=HTMLResponse)
def read_root():
    with open("frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- 1. MODELS (ĐÃ THÊM FILE VÀ THANH TOÁN) ---
class FormHoSo(BaseModel):
    nguoi_nop: str
    cccd: str
    sdt: str
    dia_chi: str                # MỚI THÊM VÀO ĐÂY
    linh_vuc: str
    chi_tiet: str
    file_dinh_kem: str
    trang_thai_thanh_toan: str
class FormDangNhap(BaseModel):
    tai_khoan: str; mat_khau: str

class FormCapNhat(BaseModel):
    trang_thai: str
    ghi_chu_can_bo: str = "" # Thêm dòng này

class ChatMessage(BaseModel):
    message: str

class FormPhanAnh(BaseModel):
    nguoi_gui: str
    sdt: str
    loai_phan_anh: str
    dia_diem: str      
    noi_dung: str 
    hinh_anh: str = ""
class FormTraLoiPhanAnh(BaseModel):
    trang_thai: str; phan_hoi: str

# 2. Kinh tế số
class FormDonHang(BaseModel):
    ten_khach: str
    sdt: str
    dia_chi: str
    ten_dich_vu: str
    gia_tien: int
    phuong_thuc_tt: str
# 3. Giáo dục số
class FormHocLieu(BaseModel):
    ten_bai: str
    phan_loai: str
    link_bai: str
    hinh_anh: str
class FormCapNhatDonHang(BaseModel):
    trang_thai: str

class FormWiFi(BaseModel):
    ten_tram: str
    ip_address: str
    vi_tri: str
# --- 2. DATABASE ---
def get_db_connection():
    conn = sqlite3.connect('thanh_an_data.db')
    conn.row_factory = sqlite3.Row
    return conn
def init_db():
    conn = get_db_connection()
    # Thêm cột phan_hoi_can_bo vào bảng HoSo
    conn.execute('''CREATE TABLE IF NOT EXISTS HoSo (
                        ma_hs TEXT PRIMARY KEY, 
                        ngay_nop TEXT, 
                        nguoi_nop TEXT NOT NULL, 
                        cccd TEXT, 
                        sdt TEXT, 
                        dia_chi TEXT,
                        linh_vuc TEXT NOT NULL, 
                        chi_tiet TEXT, 
                        file_dinh_kem TEXT, 
                        trang_thai_thanh_toan TEXT, 
                        trang_thai TEXT NOT NULL,
                        phan_hoi_can_bo TEXT)''')
    
    cursor = conn.cursor()

    # === BƠM 15 DỮ LIỆU DEMO THÁNG 6/2025 VÀO BẢNG HỒ SƠ ===
    cursor.execute('SELECT COUNT(*) FROM HoSo')
    if cursor.fetchone()[0] == 0:
        danh_sach_mau = [
            ("TA-12001", "03/06/2025 08:30", "Nguyễn Văn Hải", "079090123456", "0901234567", "Tổ 1, Ấp Thạnh Hòa", "Hộ tịch", "Đăng ký khai sinh cho con", "khai_sinh_be_gai.pdf", "Miễn phí", "Đã hoàn thành", "Hồ sơ hợp lệ, đã cấp giấy."),
            ("TA-12045", "05/06/2025 14:15", "Trần Thị Lan", "079190654321", "0987654321", "Tổ 2, Ấp Thạnh Bình", "Chứng thực", "Sao y bằng tốt nghiệp", "bang_dai_hoc.pdf", "Đã thanh toán", "Đã hoàn thành", "Đã ký sao y, mời công dân đến lấy."),
            ("TA-12102", "07/06/2025 09:45", "Lê Hoàng Nam", "079290111222", "0912333444", "Khu chợ, Ấp Thạnh Hòa", "Kinh doanh", "Đăng ký hộ kinh doanh", "don_xin_kd.pdf", "Đã thanh toán", "Từ chối", "Tên hộ kinh doanh bị trùng, vui lòng đổi tên khác."),
            ("TA-12155", "09/06/2025 10:20", "Phạm Thị Cúc", "079390555666", "0934555666", "Tổ 4, Ấp Thạnh Bình", "Y tế", "Gia hạn thẻ BHYT", "the_bhyt_cu.jpg", "Miễn phí", "Đã hoàn thành", "Đã gia hạn thẻ trên hệ thống VSSID."),
            ("TA-12210", "11/06/2025 15:30", "Bùi Văn Long", "079490777888", "0945666777", "Khu dân cư, Ấp Thạnh Hòa", "Đất đai", "Xác nhận ranh giới đất", "giay_chu_quyen.pdf", "Đã thanh toán", "Đã hoàn thành", "Cán bộ địa chính đã xuống đo đạc xong."),
            ("TA-12304", "14/06/2025 08:00", "Vũ Thị Mai", "079590999000", "0956777888", "Tổ 5, Ấp Thạnh Hòa", "Hộ tịch", "Đăng ký kết hôn", "to_khai_kh.pdf", "Miễn phí", "Đã hoàn thành", "Hẹn 2 vợ chồng sáng mai lên ký sổ."),
            ("TA-12388", "15/06/2025 11:10", "Ngô Tấn Phát", "079690222333", "0967888999", "Bờ kè, Ấp Thạnh Bình", "Chứng thực", "Chứng thực hợp đồng thuê nhà", "hop_dong_thue.pdf", "Chưa thanh toán", "Yêu cầu bổ sung", "Bản scan bị mờ trang 2, yêu cầu chụp lại."),
            ("TA-12415", "18/06/2025 14:40", "Đỗ Thị Kim", "079790444555", "0978999000", "Tổ 3, Ấp Thạnh Hòa", "An ninh", "Đăng ký tạm trú", "cccd_mat_truoc.jpg", "Đã thanh toán", "Đã hoàn thành", "Đã cập nhật vào hệ thống Cư trú Quốc gia."),
            ("TA-12490", "20/06/2025 09:05", "Trương Mẫn", "079890666777", "0989000111", "Tổ 1, Ấp Thạnh Bình", "Kinh doanh", "Xin giấy phép mở quán ăn", "giay_atvstp.pdf", "Đã thanh toán", "Đang xử lý", "Đang chuyển hồ sơ sang bộ phận Y tế thẩm định."),
            ("TA-12505", "22/06/2025 16:20", "Lý Thanh Hải", "079990888999", "0990111222", "Khu du lịch, Ấp Thạnh Hòa", "Đất đai", "Chuyển mục đích sử dụng đất", "don_xin_chuyen.pdf", "Chưa thanh toán", "Đã hoàn thành", "Quyết định đã được phê duyệt."),
            ("TA-12622", "24/06/2025 13:50", "Dương Tấn Dũng", "079091123123", "0901222333", "Tổ 2, Ấp Thạnh Bình", "Y tế", "Đăng ký tiêm chủng trẻ em", "so_tiem_chung.jpg", "Miễn phí", "Đang xử lý", "Trạm y tế đang xếp lịch tiêm."),
            ("TA-12680", "25/06/2025 08:55", "Hồ Ngọc Mến", "079191456456", "0912333444", "Trường THPT Thạnh An", "Chứng thực", "Chứng thực sơ yếu lý lịch", "so_yeu_ly_lich.pdf", "Đã thanh toán", "Chờ duyệt", ""),
            ("TA-12711", "26/06/2025 15:15", "Trần Nguyễn Thanh", "079291789789", "0923444555", "UBND Xã Thạnh An", "Hộ tịch", "Cấp bản sao trích lục khai sinh", "cccd_mat_sau.jpg", "Đã thanh toán", "Chờ duyệt", ""),
            ("TA-12750", "27/06/2025 10:45", "Đào Thị Tuyết Mai", "079391012012", "0934555666", "Tổ 4, Ấp Thạnh Bình", "Đất đai", "Trích lục bản đồ địa chính", "don_xin_trich_luc.pdf", "Chưa thanh toán", "Đang xử lý", "Đang tra cứu dữ liệu địa chính bản đồ số 4."),
            ("TA-12800", "28/06/2025 09:10", "Đỗ Thị Thu Hương", "079491345345", "0945666777", "Tổ 5, Ấp Thạnh Hòa", "An ninh", "Thông báo lưu trú Homestay", "danh_sach_khach.xlsx", "Miễn phí", "Chờ duyệt", "")
        ]
        conn.executemany('''INSERT INTO HoSo (ma_hs, ngay_nop, nguoi_nop, cccd, sdt, dia_chi, linh_vuc, chi_tiet, file_dinh_kem, trang_thai_thanh_toan, trang_thai, phan_hoi_can_bo) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', danh_sach_mau)

    conn.execute('''CREATE TABLE IF NOT EXISTS Users (username TEXT PRIMARY KEY, password TEXT NOT NULL, role TEXT NOT NULL)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS PhanAnh (
                        ma_pa TEXT PRIMARY KEY, 
                        nguoi_gui TEXT NOT NULL, 
                        sdt TEXT, 
                        loai_phan_anh TEXT NOT NULL, 
                        dia_diem TEXT,
                        noi_dung TEXT NOT NULL, 
                        hinh_anh TEXT,
                        trang_thai TEXT NOT NULL, 
                        phan_hoi TEXT)''')
    
    # 1. Tạo bảng Đơn Hàng
    conn.execute('''CREATE TABLE IF NOT EXISTS DonHang (
                        ma_dh TEXT PRIMARY KEY, 
                        ten_khach TEXT NOT NULL, 
                        sdt TEXT, 
                        dia_chi TEXT,
                        ten_dich_vu TEXT NOT NULL, 
                        gia_tien INTEGER, 
                        phuong_thuc_tt TEXT, 
                        trang_thai TEXT NOT NULL)''')
    
    # 2. Tạo 2 đơn hàng mẫu ban đầu để Cán bộ có dữ liệu xem ngay
    cursor.execute('SELECT COUNT(*) FROM DonHang')
    if cursor.fetchone()[0] == 0:
        conn.execute("INSERT INTO DonHang (ma_dh, ten_khach, sdt, dia_chi, ten_dich_vu, gia_tien, phuong_thuc_tt, trang_thai) VALUES ('DH-8801', 'Dương Anh Tuấn', '0901234567', 'Tổ 2, Ấp Thạnh Hòa', 'Khô cá dứa một nắng (1kg)', 250000, 'Tiền mặt', 'Chờ xác nhận')")
        conn.execute("INSERT INTO DonHang (ma_dh, ten_khach, sdt, dia_chi, ten_dich_vu, gia_tien, phuong_thuc_tt, trang_thai) VALUES ('DH-8802', 'Nguyễn Thúy Lan', '0987654321', 'Khu du lịch sinh thái', 'Đặt phòng: Homestay Biển Gọi', 250000, 'Đã Quét QR', 'Đã thanh toán')")
    
    cursor.execute('SELECT COUNT(*) FROM Users')
    if cursor.fetchone()[0] == 0:
        conn.execute("INSERT INTO Users (username, password, role) VALUES ('admin', '123456', 'can_bo')")
    
    cursor.execute('SELECT COUNT(*) FROM PhanAnh')
    if cursor.fetchone()[0] == 0:
        conn.execute("INSERT INTO PhanAnh (ma_pa, nguoi_gui, sdt, loai_phan_anh, noi_dung, trang_thai, phan_hoi) VALUES ('PA-1001', 'Nguyễn Thị C', '090123456', 'Hạ tầng', 'Đèn đường ấp Thạnh Hòa bị hỏng.', 'Đã xử lý', 'Điện lực đã thay bóng mới vào sáng nay.')")
    
    # 3. Tạo bảng Kho Học Liệu Số
    conn.execute('''CREATE TABLE IF NOT EXISTS HocLieu (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        ten_bai TEXT NOT NULL, 
                        phan_loai TEXT NOT NULL, 
                        link_bai TEXT NOT NULL, 
                        hinh_anh TEXT)''')
    
    cursor.execute('SELECT COUNT(*) FROM HocLieu')
    if cursor.fetchone()[0] == 0:
        conn.execute("INSERT INTO HocLieu (ten_bai, phan_loai, link_bai, hinh_anh) VALUES ('Toán 9: Đại số & Hình học', 'Phổ thông', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop')")
        conn.execute("INSERT INTO HocLieu (ten_bai, phan_loai, link_bai, hinh_anh) VALUES ('Ngữ Văn 9: Nghị luận', 'Phổ thông', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop')")
        conn.execute("INSERT INTO HocLieu (ten_bai, phan_loai, link_bai, hinh_anh) VALUES ('Dự án Robot BirdAI', 'STEM', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop')")
        conn.execute("INSERT INTO HocLieu (ten_bai, phan_loai, link_bai, hinh_anh) VALUES ('Machine Learning & AI', 'Công nghệ', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop')")
    
    # Tạo bảng Quản lý Wi-Fi Cộng đồng
    conn.execute('''CREATE TABLE IF NOT EXISTS WifiHotspot (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        ten_tram TEXT NOT NULL, 
                        ip_address TEXT NOT NULL, 
                        vi_tri TEXT NOT NULL, 
                        trang_thai TEXT DEFAULT 'Đang phát',
                        users_count INTEGER DEFAULT 0)''')
    
    cursor.execute('SELECT COUNT(*) FROM WifiHotspot')
    if cursor.fetchone()[0] == 0:
        conn.execute("INSERT INTO WifiHotspot (ten_tram, ip_address, vi_tri, users_count) VALUES ('AP-01: UBND Xã', '192.168.1.2', 'Khu hành chính, Ấp Thạnh Hòa', 142)")
        conn.execute("INSERT INTO WifiHotspot (ten_tram, ip_address, vi_tri, users_count) VALUES ('AP-02: Bến Đò', '192.168.1.3', 'Khu vực cầu tàu, Ấp Thạnh Hòa', 89)")
        conn.execute("INSERT INTO WifiHotspot (ten_tram, ip_address, vi_tri, users_count) VALUES ('AP-03: Trạm Y Tế', '192.168.1.4', 'Khu dân cư, Ấp Thạnh Bình', 12)")
    
    conn.commit()
    conn.close()
init_db()
# --- 3. APIs ---

@app.post("/api/login")
def dang_nhap(user: FormDangNhap):
    conn = get_db_connection()
    db_user = conn.execute('SELECT * FROM Users WHERE username = ? AND password = ?', (user.tai_khoan, user.mat_khau)).fetchone()
    conn.close()
    if db_user is None: raise HTTPException(status_code=401, detail="Sai MK!")
    token = jwt.encode({"sub": db_user['username'], "role": db_user['role'], "exp": datetime.utcnow() + timedelta(days=1)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"status": "success", "token": token, "username": db_user['username']}

@app.get("/api/hoso")
def get_danhsach_hoso():
    conn = get_db_connection()
    hoso_db = conn.execute('SELECT * FROM HoSo ORDER BY ma_hs DESC').fetchall()
    conn.close()
    return {"status": "success", "data": [dict(row) for row in hoso_db]}

# API NỘP HỒ SƠ ĐÃ NHẬN THÊM FILE VÀ THANH TOÁN
@app.post("/api/nophoso")
def nop_ho_so_moi(hoso: FormHoSo):
    ma_moi = f"TA-{random.randint(10000, 99999)}"
    
    # 1. Tự động lấy ngày giờ hệ thống lúc người dân bấm nộp
    ngay_hien_tai = datetime.now().strftime("%d/%m/%Y %H:%M") 
    
    conn = get_db_connection()
    
    # 2. Nhét biến ngay_hien_tai vào đúng vị trí thứ 2 trong câu lệnh SQL
    conn.execute('''INSERT INTO HoSo (ma_hs, ngay_nop, nguoi_nop, cccd, sdt, dia_chi, linh_vuc, chi_tiet, file_dinh_kem, trang_thai_thanh_toan, trang_thai) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                 (ma_moi, ngay_hien_tai, hoso.nguoi_nop, hoso.cccd, hoso.sdt, hoso.dia_chi, hoso.linh_vuc, hoso.chi_tiet, hoso.file_dinh_kem, hoso.trang_thai_thanh_toan, "Chờ duyệt"))
    
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Nộp thành công!", "data": {"ma_hs": ma_moi, "sdt": hoso.sdt}}

# Cập nhật API Lưu hồ sơ
@app.put("/api/hoso/{ma_hs}")
def cap_nhat_ho_so(ma_hs: str, du_lieu: FormCapNhat):
    conn = get_db_connection()
    
    # Lệnh này CHỈ lưu vào cột phan_hoi_can_bo, TUYỆT ĐỐI KHÔNG đụng tới cột chi_tiet của dân
    conn.execute('UPDATE HoSo SET trang_thai = ?, phan_hoi_can_bo = ? WHERE ma_hs = ?', 
                 (du_lieu.trang_thai, du_lieu.ghi_chu_can_bo, ma_hs))
    
    conn.commit()
    conn.close()
    return {"status": "success"}
@app.get("/api/tracuu/{ma_hs}")
def tra_cuu_ho_so(ma_hs: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. THÊM phan_hoi_can_bo VÀO CÂU LỆNH SELECT
    cursor.execute("""
        SELECT ma_hs, nguoi_nop, cccd, sdt, dia_chi, linh_vuc, chi_tiet, 
               file_dinh_kem, trang_thai_thanh_toan, trang_thai, phan_hoi_can_bo 
        FROM HoSo WHERE ma_hs = ?
    """, (ma_hs,))
    
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "status": "success",
            "data": {
                "ma_hs": row["ma_hs"],
                "nguoi_nop": row["nguoi_nop"],
                "cccd": row["cccd"],
                "sdt": row["sdt"],
                "dia_chi": row["dia_chi"],
                "linh_vuc": row["linh_vuc"],
                "chi_tiet": row["chi_tiet"],
                "file_dinh_kem": row["file_dinh_kem"],
                "trang_thai_thanh_toan": row["trang_thai_thanh_toan"],
                "trang_thai": row["trang_thai"],
                # 2. BẮT BUỘC PHẢI TRẢ VỀ DỮ LIỆU NÀY CHO JAVASCRIPT
                "phan_hoi_can_bo": row["phan_hoi_can_bo"] 
            }
        }
    return {"status": "error", "message": "Không tìm thấy mã hồ sơ này!"}
# API NỘP HỒ SƠ 
@app.post("/api/nophoso")
def nop_ho_so_moi(hoso: FormHoSo):
    ma_moi = f"TA-{random.randint(10000, 99999)}"
    ngay_hien_tai = datetime.now().strftime("%d/%m/%Y %H:%M") # Tự sinh ngày giờ nộp
    
    conn = get_db_connection()
    conn.execute('''INSERT INTO HoSo (ma_hs, ngay_nop, nguoi_nop, cccd, sdt, dia_chi, linh_vuc, chi_tiet, file_dinh_kem, trang_thai_thanh_toan, trang_thai) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                 (ma_moi, ngay_hien_tai, hoso.nguoi_nop, hoso.cccd, hoso.sdt, hoso.dia_chi, hoso.linh_vuc, hoso.chi_tiet, hoso.file_dinh_kem, hoso.trang_thai_thanh_toan, "Chờ duyệt"))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Nộp thành công!", "data": {"ma_hs": ma_moi, "sdt": hoso.sdt}}
@app.post("/api/chat")
def chat_bot(msg: ChatMessage):
    return {"status": "success", "reply": "Tính năng AI đang được bảo trì, vui lòng dùng các chức năng trên màn hình!"}

@app.post("/api/phananh")
def gui_phan_anh_moi(pa: FormPhanAnh):
    ma_pa = f"PA-{random.randint(1002, 9999)}"
    conn = get_db_connection()
    
    # Đã thêm dia_diem và hinh_anh vào câu lệnh SQL
    conn.execute('''
        INSERT INTO PhanAnh (ma_pa, nguoi_gui, sdt, loai_phan_anh, dia_diem, noi_dung, hinh_anh, trang_thai, phan_hoi) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (ma_pa, pa.nguoi_gui, pa.sdt, pa.loai_phan_anh, pa.dia_diem, pa.noi_dung, pa.hinh_anh, "Đang tiếp nhận", "Chính quyền đang xác minh thông tin..."))
    
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Gửi thành công!"}
@app.get("/api/phananh")
def get_danhsach_phananh():
    conn = get_db_connection()
    pa_db = conn.execute('SELECT * FROM PhanAnh ORDER BY ma_pa DESC').fetchall()
    conn.close()
    return {"status": "success", "data": [dict(row) for row in pa_db]}

@app.put("/api/phananh/{ma_pa}")
def tra_loi_phan_anh(ma_pa: str, du_lieu: FormTraLoiPhanAnh):
    conn = get_db_connection()
    conn.execute('UPDATE PhanAnh SET trang_thai = ?, phan_hoi = ? WHERE ma_pa = ?', 
                 (du_lieu.trang_thai, du_lieu.phan_hoi, ma_pa))
    conn.commit()
    conn.close()
    return {"status": "success"}

# THÊM VÀO PHẦN 3. APIs (DÀNH CHO KINH TẾ SỐ)

# Lấy danh sách đơn hàng cho Admin
@app.get("/api/donhang")
def get_danhsach_donhang():
    conn = get_db_connection()
    # Sắp xếp mã đơn hàng giảm dần để đơn mới nhất lên đầu
    dh_db = conn.execute('SELECT * FROM DonHang ORDER BY ma_dh DESC').fetchall()
    conn.close()
    return {"status": "success", "data": [dict(row) for row in dh_db]}

# Người dân tiến hành đặt hàng / đặt phòng
@app.post("/api/donhang")
def tao_don_hang_moi(don: FormDonHang):
    ma_moi = f"DH-{random.randint(1000, 9999)}"
    conn = get_db_connection()
    
    # Logic: Nếu chọn QR thì trạng thái là Đã thanh toán, nếu Tiền mặt thì Chờ xác nhận
    trang_thai_ban_dau = "Đã thanh toán" if don.phuong_thuc_tt == "QR" else "Chờ xác nhận"
    
    conn.execute('''
        INSERT INTO DonHang (ma_dh, ten_khach, sdt, dia_chi, ten_dich_vu, gia_tien, phuong_thuc_tt, trang_thai) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (ma_moi, don.ten_khach, don.sdt, don.dia_chi, don.ten_dich_vu, don.gia_tien, don.phuong_thuc_tt, trang_thai_ban_dau))
    
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Đặt hàng thành công!", "ma_dh": ma_moi}

# Cán bộ xác nhận hoàn thành đơn hàng
@app.put("/api/donhang/{ma_dh}")
def cap_nhat_don_hang(ma_dh: str, du_lieu: FormCapNhatDonHang):
    conn = get_db_connection()
    conn.execute('UPDATE DonHang SET trang_thai = ? WHERE ma_dh = ?', 
                 (du_lieu.trang_thai, ma_dh))
    conn.commit()
    conn.close()
    return {"status": "success"}

# THÊM VÀO PHẦN 3. APIs (DÀNH CHO GIÁO DỤC SỐ)
@app.get("/api/hoclieu")
def get_hoclieu():
    conn = get_db_connection()
    data = conn.execute('SELECT * FROM HocLieu ORDER BY id DESC').fetchall()
    conn.close()
    return {"status": "success", "data": [dict(row) for row in data]}

@app.post("/api/hoclieu")
def them_hoclieu(hl: FormHocLieu):
    conn = get_db_connection()
    conn.execute('INSERT INTO HocLieu (ten_bai, phan_loai, link_bai, hinh_anh) VALUES (?, ?, ?, ?)',
                 (hl.ten_bai, hl.phan_loai, hl.link_bai, hl.hinh_anh))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/hoclieu/{id}")
def xoa_hoclieu(id: int):
    conn = get_db_connection()
    conn.execute('DELETE FROM HocLieu WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return {"status": "success"}
# APIs DÀNH CHO HẠ TẦNG SỐ (QUẢN LÝ WIFI)
@app.get("/api/wifi")
def get_wifi_hotspots():
    conn = get_db_connection()
    data = conn.execute('SELECT * FROM WifiHotspot ORDER BY id DESC').fetchall()
    conn.close()
    return {"status": "success", "data": [dict(row) for row in data]}

@app.post("/api/wifi")
def them_wifi_hotspot(wf: FormWiFi):
    conn = get_db_connection()
    conn.execute('INSERT INTO WifiHotspot (ten_tram, ip_address, vi_tri) VALUES (?, ?, ?)',
                 (wf.ten_tram, wf.ip_address, wf.vi_tri))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/wifi/{id}")
def xoa_wifi_hotspot(id: int):
    conn = get_db_connection()
    conn.execute('DELETE FROM WifiHotspot WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return {"status": "success"}
# API Cập nhật (Sửa) thông tin Trạm Wi-Fi
@app.put("/api/wifi/{id}")
def cap_nhat_wifi_hotspot(id: int, wf: FormWiFi):
    conn = get_db_connection()
    conn.execute('UPDATE WifiHotspot SET ten_tram = ?, ip_address = ?, vi_tri = ? WHERE id = ?',
                 (wf.ten_tram, wf.ip_address, wf.vi_tri, id))
    conn.commit()
    conn.close()
    return {"status": "success"}
import os
if __name__ == "__main__":
    # Lấy PORT tự động từ máy chủ Cloud, nếu chạy ở máy nhà thì mặc định lấy 8000
    port = int(os.environ.get("PORT", 8000))
    
    # Đổi host thành 0.0.0.0 để mở luồng kết nối Internet
    uvicorn.run("main:app", host="0.0.0.0", port=port)
