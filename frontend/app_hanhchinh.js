// --- 1. XỬ LÝ ĐĂNG NHẬP & PHÂN QUYỀN ---

function kiemTraDangNhap() {
    const token = localStorage.getItem('thanh_an_token');
    if (token) {
        showPortal('admin');
    } else {
        document.getElementById('loginModal').style.display = 'block';
    }
}

function dongModal() {
    document.getElementById('loginModal').style.display = 'none';
}

async function thucHienDangNhap() {
    const tk = document.getElementById('username').value;
    const mk = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tai_khoan: tk, mat_khau: mk })
        });
        
        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('thanh_an_token', result.token);
            localStorage.setItem('thanh_an_user', result.username);
            
            dongModal();
            showPortal('admin');
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ!");
    }
}

function dangXuat() {
    localStorage.removeItem('thanh_an_token');
    localStorage.removeItem('thanh_an_user');
    showPortal('citizen');
}

// --- 2. CÁC HÀM NGHIỆP VỤ CŨ ---

function showPortal(type) {
    if (type === 'citizen') {
        document.getElementById('citizen-portal').style.display = 'block';
        document.getElementById('admin-portal').style.display = 'none';
    } else {
        document.getElementById('citizen-portal').style.display = 'none';
        document.getElementById('admin-portal').style.display = 'block';
        
        const user = localStorage.getItem('thanh_an_user');
        document.getElementById('ten-can-bo').innerText = user;
        
        layDuLieuTuBackend(); 
    }
}

// --- HÀM TẢI DỮ LIỆU CHO TRANG QUẢN TRỊ ---
// --- HÀM TẢI DỮ LIỆU CHO TRANG QUẢN TRỊ (ĐÃ TÍCH HỢP ĐẾM KPI) ---
async function layDuLieuTuBackend() {
    try {
        const resHS = await fetch('/api/hoso');
        const hoso = await resHS.json();
        
        if (hoso.status === "success") {
            const tbodyHS = document.getElementById('bang-ho-so');
            if (tbodyHS) tbodyHS.innerHTML = ''; 

            // 1. Khởi tạo 3 biến đếm
            let demChoDuyet = 0;
            let demDangXuLy = 0;
            let demHoanThanh = 0;

            hoso.data.forEach(hs => {
                // 2. Logic phân loại đếm
                if (hs.trang_thai === "Chờ duyệt") {
                    demChoDuyet++;
                } else if (hs.trang_thai === "Đang xử lý" || hs.trang_thai === "Yêu cầu bổ sung") {
                    demDangXuLy++; // Gộp các trạng thái đang giải quyết vào 1 ô
                } else if (hs.trang_thai === "Đã hoàn thành" || hs.trang_thai === "Từ chối") {
                    demHoanThanh++; // Gộp các trạng thái đã chốt kết quả vào 1 ô
                }

                // Logic vẽ bảng Hồ sơ
                let mau_sac = hs.trang_thai === "Chờ duyệt" ? "bg-warning text-dark" : 
                              (hs.trang_thai === "Đã hoàn thành" ? "bg-success" : "bg-info text-dark");
                
                // Hiển thị ngày nộp, nếu hồ sơ cũ không có thì để trống
                let hienThiNgay = hs.ngay_nop ? `<small class="text-muted fw-bold">${hs.ngay_nop}</small>` : `<small class="text-muted">Chưa rõ</small>`;

                if (tbodyHS) {
                    tbodyHS.innerHTML += `
                        <tr>
                            <td><strong class="text-primary">${hs.ma_hs}</strong></td>
                            <td>${hienThiNgay}</td> <td class="text-start">${hs.nguoi_nop}</td>
                            <td><span class="badge bg-light text-dark border">${hs.linh_vuc}</span></td>
                            <td><span class="badge ${mau_sac}">${hs.trang_thai}</span></td>
                            <td><button class="btn btn-sm btn-primary fw-bold shadow-sm" onclick="capNhatTrangThai('${hs.ma_hs}')">Xử lý</button></td>
                        </tr>
                    `;
                }
            });

            // 4. Bơm kết quả đếm ngược ra màn hình (3 ô KPI)
            const kpiCho = document.getElementById('kpi-cho-duyet');
            const kpiXuLy = document.getElementById('kpi-dang-xuly');
            const kpiXong = document.getElementById('kpi-hoan-thanh');
            
            if(kpiCho) kpiCho.innerText = demChoDuyet;
            if(kpiXuLy) kpiXuLy.innerText = demDangXuLy;
            if(kpiXong) kpiXong.innerText = demHoanThanh;
        }

        // Đoạn code lấy Phản ánh bên dưới của bạn thì giữ nguyên nhé
        // ... (const resPA = await fetch('http://127.0.0.1:8000/api/phananh'); ...)
        
    } catch (error) {
        console.error("Lỗi tải dữ liệu Quản trị:", error);
    }
}

// --- HÀM CÁN BỘ TRẢ LỜI PHẢN ÁNH ---
// --- HÀM XỬ LÝ GIAO DIỆN TRẢ LỜI PHẢN ÁNH ---
let currentEditingMaPA = ""; 

async function moModalTraLoiPhanAnh(ma_pa) {
    currentEditingMaPA = ma_pa;
    
    try {
        // Lấy danh sách từ server để tìm lại đúng phản ánh đang click
        const res = await fetch('/api/phananh');
        const data = await res.json();
        const pa = data.data.find(item => item.ma_pa === ma_pa);

        if (pa) {
            document.getElementById('admin_pa_ma').innerText = pa.ma_pa;
            
            // Nếu có hình ảnh thì vẽ khung ảnh (Bấm vào phóng to được luôn)
            let htmlHinhAnh = "";
            if (pa.hinh_anh && pa.hinh_anh.startsWith("data:image")) {
                htmlHinhAnh = `
                    <div class="mt-3 text-center p-2" style="background-color: #e9ecef; border-radius: 8px;">
                        <span class="badge bg-secondary mb-2"><i class="fa-solid fa-camera"></i> Hình ảnh người dân cung cấp:</span><br>
                        <img src="${pa.hinh_anh}" class="img-fluid rounded shadow-sm" style="max-height: 200px; cursor: pointer;" onclick="moModalAnh('${pa.hinh_anh}')" title="Bấm để phóng to">
                    </div>
                `;
            }

            // Đổ dữ liệu vào giao diện Modal
            document.getElementById('admin_pa_content').innerHTML = `
                <div class="row">
                    <div class="col-md-6 mb-2 border-end">
                        <small class="text-muted">Người gửi:</small>
                        <h6 class="fw-bold">${pa.nguoi_gui} <span class="badge bg-light text-dark border">${pa.sdt}</span></h6>
                    </div>
                    <div class="col-md-6 mb-2">
                        <small class="text-muted">Lĩnh vực:</small>
                        <h6 class="fw-bold text-primary">${pa.loai_phan_anh}</h6>
                    </div>
                    <div class="col-md-12 mb-2 mt-2">
                        <small class="text-muted">📍 Địa điểm sự cố:</small>
                        <h6 class="fw-bold text-danger">${pa.dia_diem || "Không có thông tin địa điểm"}</h6>
                    </div>
                    <div class="col-md-12 mt-2">
                        <small class="text-muted">Nội dung chi tiết:</small>
                        <div class="p-3 bg-white border rounded fst-italic">
                            "${pa.noi_dung}"
                        </div>
                        ${htmlHinhAnh}
                    </div>
                </div>
            `;
            
            // Xóa trắng ô nhập liệu, hoặc nạp lại câu trả lời cũ nếu có
            const oTraLoi = document.getElementById('admin_pa_traloi');
            oTraLoi.value = (pa.phan_hoi && !pa.phan_hoi.includes("Chính quyền đang xác minh")) ? pa.phan_hoi : "";
            
            document.getElementById('modalTraLoiPhanAnh').style.display = 'block';
        }
    } catch (e) { alert("Lỗi khi tải chi tiết phản ánh!"); }
}

function dongModalTraLoiPhanAnh() {
    document.getElementById('modalTraLoiPhanAnh').style.display = 'none';
}

// HÀM GỬI LỜI ĐÁP ÁN LÊN MÁY CHỦ PYTHON
async function thucHienTraLoiPhanAnh() {
    const cauTraLoi = document.getElementById('admin_pa_traloi').value.trim();
    
    if (!cauTraLoi) {
        alert("Cán bộ chưa nhập nội dung trả lời!");
        return;
    }

    try {
        const response = await fetch(`/api/phananh/${currentEditingMaPA}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trang_thai: "Đã xử lý", phan_hoi: cauTraLoi })
        });
        
        const result = await response.json();
        if (result.status === "success") {
            dongModalTraLoiPhanAnh(); // Đóng Modal
            layDuLieuTuBackend();     // Kích cho bảng tự load lại để hiện huy hiệu màu Xanh (Đã xử lý)
        }
    } catch (error) { alert("Lỗi kết nối đến máy chủ!"); }
}

// --- 4. HÀM CẬP NHẬT TRẠNG THÁI HỒ SƠ ---
// --- HÀM MỞ CHI TIẾT HỒ SƠ CHO CÁN BỘ DUYỆT ---
let currentEditingMaHS = ""; // Biến nhớ xem đang duyệt hồ sơ nào

async function capNhatTrangThai(ma_hs) {
    currentEditingMaHS = ma_hs;
    
    try {
        const response = await fetch(`/api/tracuu/${ma_hs}`);
        const result = await response.json();
        
        if (result.status === "success") {
            const hs = result.data;
            document.getElementById('admin_detail_mahs').innerText = hs.ma_hs;
            
            let mauTien = hs.trang_thai_thanh_toan === "Đã thanh toán Online" ? "text-success" : "text-danger";
            if (hs.trang_thai_thanh_toan === "Miễn phí") mauTien = "text-secondary";

            // TẠO LINK VÀ PREVIEW XEM HÌNH ẢNH TRỰC TIẾP
            let htmlFileDinhKem = `<h6 class="fw-bold text-muted">Không có</h6>`;
            // Sửa phần hiển thị ảnh trong hàm capNhatTrangThai
            if (hs.file_dinh_kem) {
                let parts = hs.file_dinh_kem.split("|||");
                if (parts.length === 2) {
                    let tenFile = parts[0];
                    let dataUrl = parts[1];
                    
                    if (dataUrl.startsWith("data:image")) {
                        htmlFileDinhKem = `
                            <h6 class="fw-bold mb-2 text-primary" style="cursor:pointer;" onclick="moModalAnh('${dataUrl}')">
                                <i class="fa-solid fa-eye"></i> ${tenFile} (Bấm để phóng to)
                            </h6>
                            <div class="mt-2 text-center" style="background-color: #f8f9fa; border: 1px dashed #dee2e6; border-radius: 8px; padding: 5px;">
                                <img src="${dataUrl}" style="max-width: 100%; max-height: 150px; cursor:pointer;" onclick="moModalAnh('${dataUrl}')" alt="Ảnh">
                            </div>
                        `;
                    } else {
                        htmlFileDinhKem = `<h6 class="fw-bold"><a href="${dataUrl}" download="${tenFile}" class="text-primary"><i class="fa-solid fa-file-arrow-down"></i> ${tenFile} (Bấm tải)</a></h6>`;
                    }
                }
            }

            document.getElementById('admin_detail_content').innerHTML = `
                <div class="row mb-3">
                    <div class="col-md-6 border-end">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Họ tên người nộp:</p>
                        <h6 class="fw-bold">${hs.nguoi_nop}</h6>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Số CCCD:</p>
                        <h6 class="fw-bold">${hs.cccd}</h6>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6 border-end">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Số điện thoại:</p>
                        <h6 class="fw-bold">${hs.sdt}</h6>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Địa chỉ:</p>
                        <h6 class="fw-bold">${hs.dia_chi || "Không có dữ liệu"}</h6>
                    </div>
                </div>
                <hr class="text-muted">
                <div class="row mb-3">
                    <div class="col-md-6 border-end">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Lĩnh vực / Thủ tục:</p>
                        <h6 class="fw-bold text-primary">${hs.linh_vuc}</h6>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Tài liệu đính kèm:</p>
                        ${htmlFileDinhKem}
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6 border-end">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Lệ phí:</p>
                        <h6 class="fw-bold ${mauTien}">${hs.trang_thai_thanh_toan || "Miễn phí"}</h6>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;">Ghi chú của người dân:</p>
                        <h6 style="font-style: italic;">"${hs.chi_tiet || "Không có ghi chú"}"</h6>
                    </div>
                </div>
            `;
            
            document.getElementById('admin_select_trangthai').value = hs.trang_thai;
            document.getElementById('chiTietHoSoModal').style.display = 'block';
        }
    } catch (error) { alert("Lỗi khi lấy chi tiết hồ sơ!"); }
}

function dongModalChiTietHoSo() {
    document.getElementById('chiTietHoSoModal').style.display = 'none';
}

// --- HÀM LƯU LẠI TRẠNG THÁI MỚI SAU KHI CÁN BỘ DUYỆT ---

async function luuTrangThaiHoSo() {
    const trangThaiMoi = document.getElementById('admin_select_trangthai').value;
    const lyDo = document.getElementById('admin_lydo').value; // Đảm bảo ID này tồn tại trong HTML

    console.log("Đang lưu trạng thái:", trangThaiMoi, "Lý do:", lyDo); // Bật log để xem nút có nhận lệnh không

    try {
        const response = await fetch(`/api/hoso/${currentEditingMaHS}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                trang_thai: trangThaiMoi,
                ghi_chu_can_bo: lyDo 
            })
        });
        
        const result = await response.json();
        if (result.status === "success") {
            alert("Đã cập nhật thành công!");
            dongModalChiTietHoSo();
            layDuLieuTuBackend();
        }
    } catch (error) { 
        console.error("Lỗi:", error);
        alert("Không thể kết nối máy chủ, kiểm tra lại Python nhé!"); 
    }
}
// --- 5. ĐIỀU KHIỂN MODAL TÍCH HỢP 2-TRONG-1 ---
function dongModalDichVuHoSo() {
    document.getElementById('dichvuHoSoModal').style.display = 'none';
}

function switchTab(type) {
    const tabNopLink = document.getElementById('tab-nop-tab');
    const tabTraLink = document.getElementById('tab-tra-tab');
    const contentNop = document.getElementById('tab-nop');
    const contentTra = document.getElementById('tab-tra');

    if (type === 'nop') {
        tabNopLink.classList.remove('text-white-50'); tabNopLink.classList.add('text-white');
        tabNopLink.style.borderBottom = '3px solid white';
        tabTraLink.classList.remove('text-white'); tabTraLink.classList.add('text-white-50');
        tabTraLink.style.borderBottom = 'none';

        contentNop.classList.add('show', 'active'); contentNop.classList.remove('d-none');
        contentTra.classList.add('d-none');
    } else {
        tabTraLink.classList.remove('text-white-50'); tabTraLink.classList.add('text-white');
        tabTraLink.style.borderBottom = '3px solid white';
        tabNopLink.classList.remove('text-white'); tabNopLink.classList.add('text-white-50');
        tabNopLink.style.borderBottom = 'none';

        contentTra.classList.add('show', 'active'); contentTra.classList.remove('d-none');
        contentNop.classList.add('d-none');
    }
}

// --- HÀM KIỂM TRA LỆ PHÍ & HIỆN MÃ QR THẬT ---
function kiemTraLePhi() {
    const loai = document.getElementById('linh_vuc_nop').value;
    const khuVucQR = document.getElementById('khu_vuc_thanh_toan');
    const txtTien = document.getElementById('so_tien_phi');
    const thongTinTiepNhan = document.getElementById('thong_tin_tiep_nhan');
    const txtNoiTiepNhan = document.getElementById('txt_noi_tiep_nhan');
    const imgQR = document.getElementById('img_qr_thanh_toan'); 

    const NGAN_HANG = "agribank"; 
    const SO_TAI_KHOAN = "1700206627398"; 
    const TEN_TAI_KHOAN = "TRAN THANH Y"; 

    khuVucQR.classList.add('d-none');
    thongTinTiepNhan.style.display = 'none';
    
    document.getElementById('khu_vuc_xac_nhan').style.display = 'block';
    document.getElementById('khu_vuc_xac_nhan').innerHTML = '<button type="button" class="btn btn-warning fw-bold btn-sm px-4 shadow-sm" onclick="xacNhanThanhToan()"><i class="fa-solid fa-money-bill-transfer"></i> TÔI ĐÃ CHUYỂN KHOẢN</button>';
    document.getElementById('thong_bao_thanh_toan_ok').style.display = 'none';
    window.daThanhToan = false; 

    if (!loai) return; 

    thongTinTiepNhan.style.display = 'block';
    let soTien = 0;

    if (loai === 'Hộ tịch') {
        txtNoiTiepNhan.innerText = 'Bộ phận Tư pháp - Hộ tịch (Tầng 1, UBND Xã Thạnh An)';
    } 
    else if (loai === 'Chứng thực') {
        khuVucQR.classList.remove('d-none'); soTien = 10000; txtTien.innerText = '10.000 VNĐ';
        txtNoiTiepNhan.innerText = 'Bộ phận Một cửa (Tầng 1, UBND Xã Thạnh An)';
    } 
    else if (loai === 'Đất đai') {
        khuVucQR.classList.remove('d-none'); soTien = 50000; txtTien.innerText = '50.000 VNĐ';
        txtNoiTiepNhan.innerText = 'Bộ phận Địa chính - Xây dựng (Tầng 2, UBND Xã Thạnh An)';
    }
    else if (loai === 'Y tế') {
        txtNoiTiepNhan.innerText = 'Trạm Y tế Xã Thạnh An (Kế bên trụ sở UBND Xã)';
    }
    else if (loai === 'Kinh doanh') {
        khuVucQR.classList.remove('d-none'); soTien = 100000; txtTien.innerText = '100.000 VNĐ';
        txtNoiTiepNhan.innerText = 'Bộ phận Kinh tế - Kế toán (Tầng 2, UBND Xã Thạnh An)';
    }
    else if (loai === 'An ninh') {
        khuVucQR.classList.remove('d-none'); soTien = 15000; txtTien.innerText = '15.000 VNĐ';
        txtNoiTiepNhan.innerText = 'Trụ sở Công an Xã Thạnh An (Cách UBND xã 200m)';
    }

    if (soTien > 0) {
        const noiDung = encodeURIComponent(`Nop le phi ho so ${loai}`);
        const tenTk = encodeURIComponent(TEN_TAI_KHOAN);
        imgQR.src = `https://img.vietqr.io/image/${NGAN_HANG}-${SO_TAI_KHOAN}-compact2.jpg?amount=${soTien}&addInfo=${noiDung}&accountName=${tenTk}`;
    }
}

// --- HÀM GIẢ LẬP KIỂM TRA TÀI KHOẢN NGÂN HÀNG ---
function xacNhanThanhToan() {
    const btnXacNhan = document.getElementById('khu_vuc_xac_nhan');
    btnXacNhan.innerHTML = '<span class="text-warning fw-bold"><i class="fa-solid fa-spinner fa-spin"></i> Đang kết nối với ngân hàng...</span>';

    setTimeout(() => {
        btnXacNhan.style.display = 'none';
        document.getElementById('thong_bao_thanh_toan_ok').style.display = 'block';
        window.daThanhToan = true; 
    }, 2500);
}

// --- HÀM NỘP HỒ SƠ SIÊU CẤP (ĐÃ GỘP Ổ KHÓA THANH TOÁN VÀ LƯU HÌNH ẢNH BASE64) ---
async function thucHienNopHoSo() {
    const ten = document.getElementById('ten_nguoi_nop').value.trim();
    const cccd = document.getElementById('cccd_nguoi_nop').value.trim();
    const sdt = document.getElementById('sdt_nguoi_nop').value.trim();
    const diaChi = document.getElementById('dia_chi_nguoi_nop').value.trim();
    const linhVuc = document.getElementById('linh_vuc_nop').value;
    const chiTiet = document.getElementById('chi_tiet_nop').value.trim();
    
    const fileInput = document.getElementById('file_dinh_kem');
    
    if (!ten || !cccd || !sdt || !diaChi || !linhVuc) { 
        alert("Vui lòng điền đầy đủ thông tin có dấu * !"); return; 
    }
    if (fileInput.files.length === 0) {
        alert("Bạn chưa tải lên tài liệu đính kèm (PDF/JPG)!"); return;
    }

    const isThuPhi = !document.getElementById('khu_vuc_thanh_toan').classList.contains('d-none');

    if (isThuPhi && !window.daThanhToan) {
        alert("⚠️ Vui lòng quét mã thanh toán lệ phí và bấm 'TÔI ĐÃ CHUYỂN KHOẢN' trước khi nộp hồ sơ!"); 
        return;
    }

    const trangThaiTien = isThuPhi ? "Đã thanh toán Online" : "Miễn phí";
    
    const file = fileInput.files[0];
    const reader = new FileReader();

    // Hút file ảnh chuyển thành chuỗi và lưu lên server
    reader.onloadend = async function() {
        const base64Data = reader.result;
        const tenFileVaData = file.name + "|||" + base64Data;

        try {
            document.body.style.cursor = 'wait';
            
            const response = await fetch('/api/nophoso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nguoi_nop: ten, cccd: cccd, sdt: sdt, dia_chi: diaChi, linh_vuc: linhVuc, 
                    chi_tiet: chiTiet, file_dinh_kem: tenFileVaData, trang_thai_thanh_toan: trangThaiTien
                })
            });
            
            const result = await response.json();
            document.body.style.cursor = 'default';

            if (result.status === "success") {
                dongModalDichVuHoSo(); 
                document.getElementById('ma_ho_so_moi').innerText = result.data.ma_hs;
                document.getElementById('sms_sdt').innerText = result.data.sdt;
                document.getElementById('thanhcongModal').style.display = 'block';
            }
        } catch (error) { 
            document.body.style.cursor = 'default';
            alert("Hệ thống đang bận, không thể kết nối tới máy chủ!"); 
        }
    };
    
    // Bắt đầu đọc file
    reader.readAsDataURL(file);
}

function moModalDichVuHoSo() {
    document.getElementById('dia_chi_nguoi_nop').value = '';
    document.getElementById('dichvuHoSoModal').style.display = 'block';
    switchTab('nop');
    
    document.getElementById('ten_nguoi_nop').value = ''; 
    document.getElementById('cccd_nguoi_nop').value = ''; 
    document.getElementById('sdt_nguoi_nop').value = ''; 
    document.getElementById('chi_tiet_nop').value = ''; 
    document.getElementById('modal_input_tracuu').value = '';
    document.getElementById('file_dinh_kem').value = '';
    kiemTraLePhi(); 
}

function dongModalThanhCong() {
    document.getElementById('thanhcongModal').style.display = 'none';
}

async function traCuuHoSoTuModal() {
    const maHoSo = document.getElementById('modal_input_tracuu').value.trim();
    if (!maHoSo) {
        alert("Vui lòng nhập mã hồ sơ!");
        return;
    }
    document.getElementById('input_tracuu').value = maHoSo;
    dongModalDichVuHoSo(); 
    traCuuHoSo(); 
}

// --- 6. HÀM TRA CỨU HỒ SƠ TỪ THANH TÌM KIẾM ---
// --- 6. HÀM TRA CỨU HỒ SƠ TỪ THANH TÌM KIẾM (PHIÊN BẢN CHỐNG LỖI 100%) ---
async function traCuuHoSo() {
    const maHoSo = document.getElementById('input_tracuu').value.trim();
    
    if (!maHoSo) {
        alert("Vui lòng nhập mã hồ sơ cần tra cứu!");
        return;
    }

    try {
        const response = await fetch(`/api/tracuu/${maHoSo}`);
        const result = await response.json();
        const khungNoiDung = document.getElementById('ket_qua_content');
        
        if (result.status === "success") {
            const hs = result.data;
            
            // MÁY QUÉT: Bật F12 -> Console lên bạn sẽ thấy dòng này để biết máy chủ có gửi lý do về không!
            console.log("Dữ liệu hồ sơ tải về từ Python:", hs); 

            let mauTrangThai = "bg-secondary";
            if (hs.trang_thai === "Chờ duyệt") mauTrangThai = "bg-warning text-dark";
            if (hs.trang_thai === "Đang xử lý" || hs.trang_thai === "Đang luân chuyển") mauTrangThai = "bg-info text-dark";
            if (hs.trang_thai === "Đã hoàn thành") mauTrangThai = "bg-success";
            if (hs.trang_thai === "Yêu cầu bổ sung" || hs.trang_thai === "Từ chối") mauTrangThai = "bg-danger";

            // 1. Vẽ bảng kết quả chính
            khungNoiDung.innerHTML = `
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h4 class="fw-bold text-center text-primary mb-4">${hs.ma_hs}</h4>
                        <table class="table table-borderless mb-0">
                            <tr><td class="text-muted" width="40%">Người nộp:</td><td class="fw-bold">${hs.nguoi_nop}</td></tr>
                            <tr><td class="text-muted">Lĩnh vực:</td><td class="fw-bold">${hs.linh_vuc}</td></tr>
                            <tr><td class="text-muted">Trạng thái xử lý:</td><td><span class="badge ${mauTrangThai} fs-6">${hs.trang_thai}</span></td></tr>
                        </table>
                    </div>
                </div>
            `;

            // 2. TÌM VÀ HIỂN THỊ PHẢN HỒI (Dù nó nằm ở cột mới phan_hoi_can_bo hay kẹt ở cột cũ chi_tiet)
            let loiNhan = "";
            if (hs.phan_hoi_can_bo && hs.phan_hoi_can_bo.trim() !== "") {
                loiNhan = hs.phan_hoi_can_bo;
            } 
            else if (hs.chi_tiet && hs.chi_tiet.includes("Phản hồi")) {
                loiNhan = hs.chi_tiet; // Bắt luôn trường hợp lưu nhầm vào cột cũ hôm trước
            }

            // Nếu có lời nhắn thì vẽ thêm cái khung màu vàng vào dưới bảng
            if (loiNhan !== "") {
                khungNoiDung.innerHTML += `
                    <div class="alert alert-warning mt-3 border-warning border-start border-4 shadow-sm">
                        <h6 class="fw-bold text-warning mb-2">
                            <i class="fa-solid fa-circle-exclamation"></i> Phản hồi từ UBND Xã:
                        </h6>
                        <p class="mb-0 text-dark" style="white-space: pre-line;">${loiNhan}</p>
                    </div>
                `;
            }

        } else {
            khungNoiDung.innerHTML = `
                <div class="text-center py-4">
                    <i class="fa-solid fa-triangle-exclamation text-danger fs-1 mb-3"></i>
                    <h5 class="fw-bold text-danger">Không tìm thấy!</h5>
                    <p class="text-muted">${result.message}</p>
                </div>
            `;
        }
        document.getElementById('ketquaModal').style.display = 'block';
    } catch (error) {
        alert("Lỗi hệ thống khi tra cứu!");
    }
}
function dongModalKetQua() {
    document.getElementById('ketquaModal').style.display = 'none';
}

// --- 8. XỬ LÝ 3 CHỨC NĂNG PHẢN ÁNH & HƯỚNG DẪN ---
function moModalHuongDan() { document.getElementById('huongdanModal').style.display = 'block'; }
function dongModalHuongDan() { document.getElementById('huongdanModal').style.display = 'none'; }

function moModalPhanAnh() { 
    document.getElementById('phananhModal').style.display = 'block'; 
    document.getElementById('pa_nguoi_gui').value = '';
    document.getElementById('pa_sdt').value = '';
    document.getElementById('pa_noidung').value = '';
}
function dongModalPhanAnh() { document.getElementById('phananhModal').style.display = 'none'; }

async function thucHienGuiPhanAnh() {
    const ten = document.getElementById('pa_nguoi_gui').value.trim();
    const sdt = document.getElementById('pa_sdt').value.trim();
    const loai = document.getElementById('pa_loai').value;
    const diadiem = document.getElementById('pa_diadiem').value.trim();
    const noidung = document.getElementById('pa_noidung').value.trim();
    const fileInput = document.getElementById('pa_hinhanh');

    if (!ten || !sdt || !diadiem || !noidung) { 
        alert("Vui lòng điền đủ thông tin: Tên, SĐT, Địa điểm và Nội dung!"); 
        return; 
    }

    const guiDataLenServer = async (hinhAnhBase64) => {
        try {
            document.body.style.cursor = 'wait';
            const res = await fetch('/api/phananh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nguoi_gui: ten, 
                    sdt: sdt, 
                    loai_phan_anh: loai, 
                    dia_diem: diadiem,     // JS GỬI ĐI ĐỊA ĐIỂM
                    noi_dung: noidung,
                    hinh_anh: hinhAnhBase64 // JS GỬI ĐI HÌNH ẢNH BASE64
                })
            });
            
            // Xử lý khi thành công
            if (res.ok) {
                const data = await res.json();
                document.body.style.cursor = 'default';
                if (data.status === 'success') {
                    alert("Đã gửi phản ánh thành công! Xin cảm ơn bạn đã góp ý.");
                    dongModalPhanAnh();
                }
            } else {
                // Nếu vẫn bị 422 thì in ra lỗi để xem
                const errorData = await res.json();
                console.log("Chi tiết lỗi từ Python:", errorData);
                alert("Dữ liệu gửi đi không hợp lệ (Lỗi 422), hãy bật F12 xem Console!");
                document.body.style.cursor = 'default';
            }
        } catch (e) { 
            document.body.style.cursor = 'default';
            alert("Lỗi kết nối máy chủ!"); 
        }
    };

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            guiDataLenServer(reader.result); 
        };
        reader.readAsDataURL(file);
    } else {
        guiDataLenServer(""); 
    }
}

async function moModalHopThu() {
    document.getElementById('hopthuModal').style.display = 'block';
    const khuVucHienThi = document.getElementById('danh_sach_phan_anh');
    khuVucHienThi.innerHTML = '<div class="text-center mt-3"><i class="fa-solid fa-spinner fa-spin fs-2 text-success"></i></div>';

    try {
        const res = await fetch('/api/phananh');
        const data = await res.json();
        khuVucHienThi.innerHTML = '';

        if (data.data.length === 0) {
            khuVucHienThi.innerHTML = '<p class="text-center text-muted mt-3">Chưa có phản ánh nào.</p>';
            return;
        }

        data.data.forEach(pa => {
            let badge = pa.trang_thai === "Đã xử lý" ? "bg-success" : "bg-warning text-dark";
            khuVucHienThi.innerHTML += `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h6 class="fw-bold text-primary"><i class="fa-solid fa-tag"></i> [${pa.loai_phan_anh}] ${pa.nguoi_gui}</h6>
                            <span class="badge ${badge}">${pa.trang_thai}</span>
                        </div>
                        <p class="mb-2 mt-2 text-dark"><strong>Nội dung:</strong> ${pa.noi_dung}</p>
                        <div class="p-2 bg-light border-start border-4 border-success">
                            <small class="text-success fw-bold"><i class="fa-solid fa-reply"></i> UBND Xã trả lời:</small>
                            <p class="mb-0 text-muted" style="font-size: 0.9rem;">${pa.phan_hoi}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        khuVucHienThi.innerHTML = '<p class="text-danger text-center">Lỗi tải dữ liệu!</p>';
    }
}
function dongModalHopThu() { document.getElementById('hopthuModal').style.display = 'none'; }

// --- HÀM CHUYỂN TAB TRONG TRANG QUẢN TRỊ ---
function chuyenTabAdmin(loai) {
    const hosoPane = document.getElementById('hoso-pane');
    const phananhPane = document.getElementById('phananh-pane');
    const btnHoso = document.getElementById('btn-tab-hoso');
    const btnPhananh = document.getElementById('btn-tab-phananh');

    if (loai === 'hoso') {
        hosoPane.classList.remove('d-none'); hosoPane.classList.add('show', 'active');
        phananhPane.classList.add('d-none'); phananhPane.classList.remove('show', 'active');
        btnHoso.classList.add('active'); btnPhananh.classList.remove('active');
    } else {
        phananhPane.classList.remove('d-none'); phananhPane.classList.add('show', 'active');
        hosoPane.classList.add('d-none'); hosoPane.classList.remove('show', 'active');
        btnPhananh.classList.add('active'); btnHoso.classList.remove('active');
    }
}
function moModalAnh(dataUrl) {
    document.getElementById('anh_can_xem').src = dataUrl;
    document.getElementById('modalXemAnh').style.display = 'block';
}

function dongModalAnh() {
    document.getElementById('modalXemAnh').style.display = 'none';
}
function checkLyDo() {
    const status = document.getElementById('admin_select_trangthai').value;
    const oLyDo = document.getElementById('admin_lydo');
    // Chỉ hiện ô lý do nếu chọn "Yêu cầu bổ sung" hoặc "Từ chối"
    if (status === "Yêu cầu bổ sung" || status === "Từ chối") {
        oLyDo.classList.remove('d-none');
    } else {
        oLyDo.classList.add('d-none');
    }
}
// Hàm tạo hiệu ứng "Dịch chuyển tức thời" từ Cẩm nang sang form Nộp hồ sơ
function chuyenSangNopHoSo(linhVuc) {
    // 1. Đóng bảng hướng dẫn
    dongModalHuongDan();
    
    // 2. Mở bảng Nộp hồ sơ
    moModalDichVuHoSo();
    
    // 3. Tự động điền lĩnh vực tương ứng
    document.getElementById('linh_vuc_nop').value = linhVuc;
    
    // 4. Kích hoạt tính tiền/quét QR cho chuẩn khớp với lĩnh vực vừa chọn
    kiemTraLePhi(); 
}
// ==================== ADMIN: TẢI DỮ LIỆU PHẢN ÁNH TỪ FASTAPI ====================
async function loadBangPhanAnhAdmin() {
    try {
        const response = await fetch("/api/phananh");
        const result = await response.json();
        
        if (result.status === "success") {
            const tbody = document.getElementById('bang-phan-anh-admin');
            if(!tbody) return;
            tbody.innerHTML = ''; // Xóa trắng bảng cũ
            
            result.data.forEach(pa => {
                // Đổi màu badge theo trạng thái
                let badgeClass = "bg-warning text-dark";
                if (pa.trang_thai === "Đã xử lý") badgeClass = "bg-success";
                if (pa.trang_thai === "Từ chối") badgeClass = "bg-danger";

                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold text-danger">${pa.ma_pa}</td>
                        <td><strong>${pa.nguoi_gui}</strong><br><small class="text-muted">${pa.sdt}</small></td>
                        <td>
                            <span class="badge bg-secondary mb-1">${pa.loai_phan_anh}</span><br>
                            <small class="text-truncate d-inline-block" style="max-width: 200px;">${pa.noi_dung}</small>
                        </td>
                        <td><span class="badge ${badgeClass}">${pa.trang_thai}</span></td>
                        <td>
                            <button class="btn btn-sm btn-danger fw-bold shadow-sm" onclick="moModalTraLoiPhanAnh_API('${pa.ma_pa}')">
                                <i class="fa-solid fa-reply"></i> Trả lời
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách Phản ánh:", error);
    }
}

// Hàm phụ: Mở Modal trả lời phản ánh (bạn có thể phát triển thêm logic gọi API PUT ở đây sau)
function moModalTraLoiPhanAnh_API(maPA) {
    alert("Đang mở chi tiết phản ánh mã: " + maPA + "\n(Chức năng này sẽ kết nối API cập nhật sau)");
}