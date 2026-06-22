// ==================== XỬ LÝ GIAN HÀNG ĐẶC SẢN ====================
function moModalGianHang() {
    document.getElementById('gianHangModal').style.display = 'block';
}

function dongModalGianHang() {
    document.getElementById('gianHangModal').style.display = 'none';
}

// ==================== XỬ LÝ DU LỊCH & HOMESTAY ====================
function moModalDuLich() {
    document.getElementById('duLichModal').style.display = 'block';
}

function dongModalDuLich() {
    document.getElementById('duLichModal').style.display = 'none';
}

// ==================== XỬ LÝ CỔNG THANH TOÁN SỐ ====================
function moModalThanhToan(tenDichVu, soTien) {
    document.getElementById('tt_ten_dich_vu').innerText = `Giao dịch: ${tenDichVu}`;
    document.getElementById('tt_so_tien').innerText = soTien.toLocaleString('vi-VN') + ' VNĐ';
    
    // Tự động sinh mã QR mô phỏng theo số tiền
    document.getElementById('tt_qr_code').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ThanhToan_${soTien}_ThanhAn`;
    
    document.getElementById('thanhToanModal').style.display = 'block';
}

function dongModalThanhToan() {
    document.getElementById('thanhToanModal').style.display = 'none';
}

function xacNhanHoanTatThanhToan() {
    alert("Giao dịch thành công! Cảm ơn bạn đã đóng góp vào nền Kinh tế số Xã đảo Thạnh An.");
    dongModalThanhToan();
    
    // Cập nhật lại bảng Admin nếu Cán bộ đang mở tab
    const donhangPane = document.getElementById('donhang-pane');
    if (donhangPane && !donhangPane.classList.contains('d-none')) {
        loadBangDonHangAPI();
    }
}

// ==================== LOGIC XÁC NHẬN ĐƠN HÀNG TRUNG GIAN ====================
let donHangHienTai = { ten: "", gia: 0 };
let danhSachDonHangThucTe = []; // Biến lưu dữ liệu thật cho Cán bộ

function datMuaSanPham(tenSP, gia) {
    dongModalGianHang();
    moModalXacNhanDon(`Mua ${tenSP} (Gian hàng OCOP)`, gia);
}

function datPhong(tenHomestay, gia) {
    dongModalDuLich();  
    moModalXacNhanDon(`Đặt phòng ${tenHomestay}`, gia);
}

function dongModalXacNhanDon() {
    document.getElementById('xacNhanDonModal').style.display = 'none';
}

function moModalXacNhanDon(tenDichVu, gia) {
    donHangHienTai.ten = tenDichVu;
    donHangHienTai.gia = gia;
    
    document.getElementById('don_ten_dich_vu').innerText = `Đang đặt: ${tenDichVu}`;
    document.getElementById('don_gia_tien').innerText = `Tạm tính: ${gia.toLocaleString('vi-VN')} VNĐ`;
    
    // Xóa trắng form cũ
    document.getElementById('don_ten').value = '';
    document.getElementById('don_sdt').value = '';
    document.getElementById('don_diachi').value = ''; 
    document.getElementById('don_phuong_thuc').value = 'TienMat';
    
    document.getElementById('xacNhanDonModal').style.display = 'block';
}

// Hàm tiến hành đặt đơn (ĐÃ NÂNG CẤP GỌI API)
async function tienHanhDatDon() {
    const ten = document.getElementById('don_ten').value.trim();
    const sdt = document.getElementById('don_sdt').value.trim();
    const diaChi = document.getElementById('don_diachi').value.trim();
    const phuongThuc = document.getElementById('don_phuong_thuc').value;

    if (!ten || !sdt || !diaChi) {
        alert("Vui lòng nhập đầy đủ Tên, Số điện thoại và Địa chỉ để chúng tôi phục vụ tốt nhất!");
        return;
    }

    dongModalXacNhanDon(); // Đóng form thông tin lại

    // GỌI API LƯU VÀO DATABASE
    try {
        const response = await fetch("/api/donhang", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ten_khach: ten,
                sdt: sdt,
                dia_chi: diaChi,
                ten_dich_vu: donHangHienTai.ten,
                gia_tien: donHangHienTai.gia,
                phuong_thuc_tt: phuongThuc
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            if (phuongThuc === 'QR') {
                moModalThanhToan(donHangHienTai.ten, donHangHienTai.gia);
            } else {
                alert(`🎉 ĐẶT THÀNH CÔNG!\n\nCảm ơn anh/chị ${ten}.\nYêu cầu [${donHangHienTai.ten}] đã được gửi đi với Mã đơn: ${result.ma_dh}\n📍 Giao đến: ${diaChi}\n\nHệ thống sẽ liên hệ xác nhận trong ít phút nữa!`);
            }
            
            // Cập nhật lại bảng Admin ngay lập tức nếu tab đang mở
            const donhangPane = document.getElementById('donhang-pane');
            if (donhangPane && !donhangPane.classList.contains('d-none')) {
                loadBangDonHangAPI();
            }
        }
    } catch (error) {
        console.error("Lỗi khi đặt hàng:", error);
        alert("Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!");
    }
}

// ==================== XỬ LÝ THANH TOÁN TỰ DO ====================
function moModalThanhToanChung() {
    document.getElementById('ttc_cccd').value = '';
    document.getElementById('ttc_loaiphi').value = '';
    document.getElementById('ttc_sotien').value = '';
    document.getElementById('thanhToanChungModal').style.display = 'block';
}

function dongModalThanhToanChung() {
    document.getElementById('thanhToanChungModal').style.display = 'none';
}

function taoMaQRThanhToan() {
    const cccd = document.getElementById('ttc_cccd').value.trim();
    const loaiPhi = document.getElementById('ttc_loaiphi').value;
    const soTien = parseInt(document.getElementById('ttc_sotien').value);

    if (!cccd || cccd.length < 9) {
        alert("Vui lòng nhập số CCCD hợp lệ (từ 9 đến 12 số) để Kho bạc đối soát!");
        return;
    }
    if (!loaiPhi) {
        alert("Vui lòng chọn Loại khoản thu cần nộp!");
        return;
    }
    if (!soTien || soTien <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ lớn hơn 0!");
        return;
    }

    const noiDungChuyenKhoan = `${loaiPhi} - CCCD: ${cccd}`;
    dongModalThanhToanChung();
    moModalThanhToan(noiDungChuyenKhoan, soTien);
}

// ==================== PHẦN QUẢN TRỊ ADMIN (KINH TẾ SỐ) ====================

// 1. Lấy dữ liệu Đơn hàng từ API
async function loadBangDonHangAPI() {
    try {
        const response = await fetch("/api/donhang");
        const result = await response.json();
        
        if (result.status === "success") {
            danhSachDonHangThucTe = result.data;
            const tbody = document.getElementById('bang-don-hang');
            if(!tbody) return; // Tránh lỗi nếu chưa đăng nhập Admin
            
            tbody.innerHTML = '';
            
            danhSachDonHangThucTe.forEach(dh => {
                const badgeClass = dh.trang_thai === "Chờ xác nhận" ? "bg-warning text-dark" : "bg-success";
                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold text-success">${dh.ma_dh}</td>
                        <td class="text-start"><strong>${dh.ten_khach}</strong><br><small class="text-muted"><i class="fa-solid fa-phone"></i> ${dh.sdt}</small></td>
                        <td class="fw-bold text-primary">${dh.ten_dich_vu}</td>
                        <td><span class="text-danger fw-bold">${dh.gia_tien.toLocaleString('vi-VN')} đ</span><br><small class="text-muted">${dh.phuong_thuc_tt === 'QR' ? 'Đã quét QR' : 'Tiền mặt'}</small></td>
                        <td><span class="badge ${badgeClass}">${dh.trang_thai}</span></td>
                        <td><button class="btn btn-sm btn-success fw-bold shadow-sm" onclick="moModalDuyetDon_API('${dh.ma_dh}')"><i class="fa-solid fa-pen-to-square"></i> Xử lý</button></td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
    }
}

// 2. Mở Modal chi tiết đơn hàng
function moModalDuyetDon_API(maDH) {
    const dh = danhSachDonHangThucTe.find(d => d.ma_dh === maDH);
    if(dh) {
        document.getElementById('admin_dh_ma').innerText = dh.ma_dh;
        document.getElementById('admin_dh_content').innerHTML = `
            <div class="alert alert-success border-success border-2 mb-3">
                <h6 class="fw-bold mb-1"><i class="fa-solid fa-box"></i> Dịch vụ: ${dh.ten_dich_vu}</h6>
                <span class="text-danger fw-bold fs-5">${dh.gia_tien.toLocaleString('vi-VN')} VNĐ</span>
                <span class="badge bg-dark ms-2">${dh.phuong_thuc_tt === 'QR' ? 'Đã quét QR' : 'Tiền mặt'}</span>
            </div>
            <div class="mb-2"><strong><i class="fa-solid fa-user"></i> Khách hàng:</strong> ${dh.ten_khach}</div>
            <div class="mb-2"><strong><i class="fa-solid fa-phone"></i> Số điện thoại:</strong> ${dh.sdt}</div>
            <div class="mb-3"><strong><i class="fa-solid fa-location-dot"></i> Giao đến / Địa chỉ:</strong> ${dh.dia_chi}</div>
            
            <input type="hidden" id="admin_dh_ma_hidden" value="${dh.ma_dh}">
        `;
        document.getElementById('modalDuyetDon').style.display = 'block';
    }
}

function dongModalDuyetDon() {
    document.getElementById('modalDuyetDon').style.display = 'none';
}

// 3. Gửi lệnh cập nhật trạng thái lên API
async function xacNhanDuyetDon_API() {
    const maDH = document.getElementById('admin_dh_ma_hidden').value;
    
    try {
        const response = await fetch(`/api/donhang/${maDH}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trang_thai: "Đã hoàn thành" })
        });
        
        if(response.ok) {
            alert('Đã cập nhật trạng thái đơn hàng thành: ĐÃ HOÀN THÀNH. Hệ thống sẽ tự động gửi SMS thông báo cho khách hàng!');
            dongModalDuyetDon();
            loadBangDonHangAPI(); // Load lại bảng ngay lập tức
        }
    } catch(err) {
        console.error("Lỗi duyệt đơn:", err);
    }
}
// ==================== ADMIN: XỬ LÝ ĐƠN HÀNG KINH TẾ ====================

// 1. Mở Modal hiển thị chi tiết Đơn hàng
function moModalDuyetDon_API(maDH) {
    // Tìm đơn hàng trong mảng dữ liệu đã tải về lúc nãy
    const dh = danhSachDonHangThucTe.find(d => d.ma_dh === maDH);
    
    if(dh) {
        // In mã đơn lên tiêu đề
        document.getElementById('admin_dh_ma').innerText = dh.ma_dh;
        
        // Vẽ chi tiết đơn hàng
        document.getElementById('admin_dh_content').innerHTML = `
            <div class="alert alert-success border-success border-2 mb-3 shadow-sm">
                <h6 class="fw-bold mb-1 text-success"><i class="fa-solid fa-cart-shopping"></i> Dịch vụ / Sản phẩm: ${dh.ten_dich_vu}</h6>
                <span class="text-danger fw-bold fs-5">${dh.gia_tien.toLocaleString('vi-VN')} VNĐ</span>
                <span class="badge bg-dark ms-2">${dh.phuong_thuc_tt === 'QR' ? 'Đã quét QR' : 'Tiền mặt'}</span>
            </div>
            <div class="mb-2"><strong><i class="fa-solid fa-user text-muted"></i> Khách hàng:</strong> ${dh.ten_khach}</div>
            <div class="mb-2"><strong><i class="fa-solid fa-phone text-muted"></i> Số điện thoại:</strong> ${dh.sdt}</div>
            <div class="mb-3 p-2 bg-white border rounded"><strong><i class="fa-solid fa-location-dot text-danger"></i> Giao đến / Địa chỉ:</strong><br> ${dh.dia_chi}</div>
            
            <input type="hidden" id="admin_dh_ma_hidden" value="${dh.ma_dh}">
        `;
        
        // Hiển thị Modal
        document.getElementById('modalDuyetDon').style.display = 'block';
    }
}

// 2. Đóng Modal
function dongModalDuyetDon() {
    document.getElementById('modalDuyetDon').style.display = 'none';
}

// 3. Gửi lệnh cập nhật trạng thái lên API (FastAPI)
async function xacNhanDuyetDon_API() {
    // Lấy mã đơn hàng đang được ẩn
    const maDH = document.getElementById('admin_dh_ma_hidden').value;
    
    try {
        // Gọi API PUT để cập nhật trạng thái
        const response = await fetch(`/api/donhang/${maDH}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trang_thai: "Đã hoàn thành" })
        });
        
        if(response.ok) {
            alert('🎉 Đã cập nhật trạng thái đơn hàng thành: ĐÃ HOÀN THÀNH.\n\nHệ thống sẽ tự động gửi SMS thông báo cho khách hàng!');
            dongModalDuyetDon(); // Đóng bảng chi tiết
            
            // Nếu bạn đang có hàm taiDuLieuDonHang_ChongLoi() trong index.html thì gọi nó để load lại bảng:
            if (typeof taiDuLieuDonHang_ChongLoi === "function") {
                taiDuLieuDonHang_ChongLoi(); 
            } else if (typeof loadBangDonHangAPI === "function") {
                loadBangDonHangAPI(); // Hoặc gọi hàm này tùy theo tên bạn đang đặt
            }
        } else {
            alert("Lỗi khi cập nhật trạng thái trên máy chủ!");
        }
    } catch(err) {
        console.error("Lỗi duyệt đơn:", err);
        alert("Không thể kết nối đến máy chủ API!");
    }
}