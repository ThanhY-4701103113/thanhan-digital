// ================= XỬ LÝ Y TẾ & GIÁO DỤC =================

function moModalYTe(tab) {
    document.getElementById('yteModal').style.display = 'block';
    
    // Tự động chuyển Tab tương ứng nhờ Bootstrap API
    if(tab === 'kham') {
        document.getElementById('nav-kham').click();
    } else {
        document.getElementById('nav-hoso').click();
    }
}

function dongModalYTe() {
    document.getElementById('yteModal').style.display = 'none';
}

function moModalGiaoDuc(tab) {
    document.getElementById('giaoDucModal').style.display = 'block';
    
    // Tự động chuyển Tab tương ứng
    if(tab === 'solienlac') {
        document.getElementById('nav-solienlac').click();
    } else {
        document.getElementById('nav-hoclieu').click();
    }
}

function dongModalGiaoDuc() {
    document.getElementById('giaoDucModal').style.display = 'none';
}
// --- LOGIC QUY TRÌNH KHÁM BỆNH TỪ XA ---

function moFormKham() {
    // Ẩn danh sách bác sĩ, hiện form điền triệu chứng
    document.getElementById('kham_step1_danhsach').classList.add('d-none');
    document.getElementById('kham_step2_thongtin').classList.remove('d-none');
}

function huyFormKham() {
    // Quay lại danh sách bác sĩ
    document.getElementById('kham_step2_thongtin').classList.add('d-none');
    document.getElementById('kham_step1_danhsach').classList.remove('d-none');
}
// --- LOGIC QUY TRÌNH KHÁM BỆNH TỪ XA (PHIÊN BẢN CAMERA THẬT) ---

let luongCameraHienTai = null; // Biến toàn cục để lưu luồng Camera

// ... (Giữ nguyên hàm moFormKham và huyFormKham) ...

function vaoPhongKham() {
    const ten = document.getElementById('kham_ten').value.trim();
    const trieuChung = document.getElementById('kham_trieuchung').value.trim();

    if (!ten || !trieuChung) {
        alert("Vui lòng nhập Tên bệnh nhân và Mô tả triệu chứng để Bác sĩ nắm thông tin sơ bộ trước khi gọi!");
        return;
    }

    // 1. Chuyển đổi giao diện
    document.getElementById('kham_step2_thongtin').classList.add('d-none');
    document.getElementById('kham_step3_videocall').classList.remove('d-none');
    
    document.getElementById('kham_trangthai_call').innerText = "Đang kết nối hệ thống bảo mật...";
    document.getElementById('kham_trangthai_call').className = "text-danger fw-bold mb-2";
    document.getElementById('video_overlay').classList.remove('d-none');
    document.getElementById('video_bacsi').classList.add('opacity-50');

    // 2. YÊU CẦU BẬT WEBCAM/CAMERA ĐIỆN THOẠI
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false }) // Tắt audio để tránh tiếng vọng (echo) khi demo
            .then(function(stream) {
                // Đổ luồng hình ảnh thật vào thẻ Video
                luongCameraHienTai = stream;
                const videoElement = document.getElementById('video_benhnhan');
                videoElement.srcObject = stream;
            })
            .catch(function(err) {
                console.error("Lỗi Camera: ", err);
                alert("Vui lòng cho phép trình duyệt truy cập Camera để thực hiện cuộc gọi!");
            });
    } else {
        alert("Trình duyệt của bạn không hỗ trợ gọi Video!");
    }

    // 3. Giả lập Bác sĩ bắt máy sau 3 giây
    setTimeout(() => {
        document.getElementById('kham_trangthai_call').innerText = `🔴 Đang gọi: Bệnh nhân ${ten} - Thời gian: 00:01`;
        document.getElementById('kham_trangthai_call').className = "text-success fw-bold mb-2";
        
        // Tắt vòng Loading
        document.getElementById('video_overlay').classList.add('d-none');
        document.getElementById('video_bacsi').classList.remove('opacity-50');
    }, 3000);
}

function ketThucCuocGoi() {
    // 1. TẮT WEBCAM NGAY LẬP TỨC ĐỂ BẢO MẬT
    if (luongCameraHienTai) {
        luongCameraHienTai.getTracks().forEach(track => track.stop());
        luongCameraHienTai = null;
        document.getElementById('video_benhnhan').srcObject = null;
    }

    alert("Cuộc gọi đã kết thúc!\n\nĐơn thuốc và Lời dặn dò của Bác sĩ sẽ được gửi vào mục 'Hồ sơ sức khỏe' của bạn trong ít phút nữa.");
    
    // 2. Reset giao diện
    document.getElementById('kham_step3_videocall').classList.add('d-none');
    document.getElementById('kham_step1_danhsach').classList.remove('d-none');
    document.getElementById('kham_ten').value = '';
    document.getElementById('kham_trieuchung').value = '';
}
// --- LOGIC TRA CỨU HỒ SƠ SỨC KHỎE (Y BẠ ĐIỆN TỬ) ---
// --- KHO DỮ LIỆU GIẢ LẬP (MOCK DATABASE) ---
const coSoDuLieuYTe = {
    "060203000427": {
        ten: "Phạm Văn Demo",
        bhyt: "GD79123456789",
        nhomMau: "AB+",
        diUng: "Penicillin",
        lichSu: [
            { tenBenh: "Sốt xuất huyết Dengue", ngay: "12/05/2026", bacSi: "BS.CKI Nguyễn Văn A", chiTiet: "Điều trị ngoại trú, dặn dò uống nhiều nước." },
            { tenBenh: "Khám sức khỏe định kỳ", ngay: "10/01/2026", bacSi: "Trạm Y Tế Xã", chiTiet: "Huyết áp bình thường, sức khỏe ổn định." }
        ]
    },
    "079099123456": {
        ten: "Trần Thị Ánh",
        bhyt: "HC12345678901",
        nhomMau: "O-",
        diUng: "Không có",
        lichSu: [
            { tenBenh: "Viêm họng hạt", ngay: "18/06/2026", bacSi: "BS. Trần Thị B (Video Call)", chiTiet: "Cấp đơn thuốc kháng sinh, Vitamin C." }
        ]
    }
};

// --- LOGIC TRA CỨU HỒ SƠ SỨC KHỎE ĐỘNG ---
function traCuuHoSoYTe() {
    const inputCCCD = document.getElementById('kham_input_cccd').value.trim();
    const ketQuaDiv = document.getElementById('kham_ketqua_tracuu');
    
    if (!inputCCCD) {
        alert("Vui lòng nhập số CCCD hoặc mã thẻ BHYT để tra cứu!");
        ketQuaDiv.classList.add('d-none');
        return;
    }

    // Hiệu ứng Loading
    const btnTraCuu = document.querySelector('#tab-hoso-yte .btn-danger');
    btnTraCuu.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG TÌM...';
    btnTraCuu.disabled = true;

    setTimeout(() => {
        // Trả lại nút Tra cứu
        btnTraCuu.innerHTML = '<i class="fa-solid fa-search"></i> TRA CỨU';
        btnTraCuu.disabled = false;

        // KIỂM TRA TRONG DATABASE GIẢ LẬP
        const duLieu = coSoDuLieuYTe[inputCCCD];

        if (duLieu) {
            // NẾU TÌM THẤY -> Đổ dữ liệu động vào HTML
            document.getElementById('kq_ten_bn').innerText = `${duLieu.ten} (ID: ${inputCCCD})`;
            document.getElementById('kq_mabhyt').innerText = duLieu.bhyt;
            document.getElementById('kq_nhommau').innerText = duLieu.nhomMau;
            document.getElementById('kq_diung').innerText = duLieu.diUng;

            // Xóa lịch sử cũ và đổ lịch sử mới vào
            const lichSuContainer = document.getElementById('kq_lichsu');
            lichSuContainer.innerHTML = ''; // Làm sạch
            
            duLieu.lichSu.forEach(ls => {
                lichSuContainer.innerHTML += `
                    <div class="list-group-item border-0 mb-1 rounded bg-white">
                        <div class="d-flex justify-content-between w-100">
                            <h6 class="mb-1 fw-bold text-primary">${ls.tenBenh}</h6>
                            <small class="text-muted fw-bold">${ls.ngay}</small>
                        </div>
                        <p class="mb-1 text-muted" style="font-size: 0.85rem;"><strong>Nơi khám/BS:</strong> ${ls.bacSi}</p>
                        <small class="text-dark"><i class="fa-solid fa-notes-medical text-success"></i> <strong>Chi tiết:</strong> ${ls.chiTiet}</small>
                    </div>
                `;
            });

            // Hiện khung kết quả
            ketQuaDiv.classList.remove('d-none');
        } else {
            // NẾU KHÔNG TÌM THẤY
            ketQuaDiv.classList.add('d-none');
            alert(`Cơ sở dữ liệu quốc gia hiện chưa có thông tin y bạ của mã số [${inputCCCD}]. Vui lòng kiểm tra lại!`);
        }

    }, 800); // Giả lập mạng load 0.8 giây cho giống thật
}
// --- KHO DỮ LIỆU GIÁO DỤC GIẢ LẬP (MOCK DATABASE) ---
const coSoDuLieuGiaoDuc = {
    "HS-123": {
        ten: "Lê Cát Trọng Lý",
        lop: "10A1",
        gvcn: "Cô Đỗ Thị Thu Thảo",
        chuyenCan: "Đi học đầy đủ",
        diem: [
            { mon: "Toán", tx: "8.0, 9.0", gk: "8.5", ck: "9.0", dtb: "8.8" },
            { mon: "Ngữ Văn", tx: "7.5, 8.0", gk: "8.0", ck: "7.5", dtb: "7.8" },
            { mon: "Tin học (AI)", tx: "9.0, 10", gk: "9.5", ck: "10", dtb: "9.6" },
            { mon: "Tiếng Anh", tx: "8.5, 8.5", gk: "9.0", ck: "8.5", dtb: "8.7" }
        ]
    },
    "HS-456": {
        ten: "Nguyễn Hồng Duyên",
        lop: "11B2",
        gvcn: "Thầy Hồ Ngọc Lâm",
        chuyenCan: "Vắng 1 ngày (Có phép)",
        diem: [
            { mon: "Toán", tx: "6.0, 7.0", gk: "6.5", ck: "7.0", dtb: "6.7" },
            { mon: "Ngữ Văn", tx: "8.0, 8.5", gk: "8.0", ck: "8.5", dtb: "8.2" },
            { mon: "Tin học (C++)", tx: "8.5, 9.0", gk: "9.0", ck: "9.5", dtb: "9.1" },
            { mon: "Tiếng Anh", tx: "7.0, 6.5", gk: "7.0", ck: "7.5", dtb: "7.1" }
        ]
    }
};

// --- LOGIC TRA CỨU ĐIỂM ---
function traCuuDiem() {
    // Lấy mã HS và in hoa lên để dễ so sánh
    const inputMaHS = document.getElementById('gd_input_mahs').value.trim().toUpperCase();
    const ketQuaDiv = document.getElementById('gd_ketqua_tracuu');
    
    if (!inputMaHS) {
        alert("Vui lòng nhập Mã học sinh để tra cứu (Ví dụ: HS-123)!");
        ketQuaDiv.classList.add('d-none');
        return;
    }

    // Hiệu ứng Loading
    const btnTraCuu = document.querySelector('#tab-solienlac .btn-primary');
    btnTraCuu.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG TÌM...';
    btnTraCuu.disabled = true;

    setTimeout(() => {
        // Trả lại nút Tra cứu
        btnTraCuu.innerHTML = '<i class="fa-solid fa-search"></i> XEM ĐIỂM';
        btnTraCuu.disabled = false;

        const duLieu = coSoDuLieuGiaoDuc[inputMaHS];

        if (duLieu) {
            // Đổ thông tin cá nhân
            document.getElementById('kq_hs_ten').innerText = duLieu.ten;
            document.getElementById('kq_hs_lop').innerText = duLieu.lop;
            document.getElementById('kq_hs_gvcn').innerText = duLieu.gvcn;
            
            // Xử lý màu sắc cho chuyên cần
            const ccNode = document.getElementById('kq_hs_chuyencan');
            ccNode.innerText = duLieu.chuyenCan;
            ccNode.className = duLieu.chuyenCan.includes('đầy đủ') ? "text-success fw-bold" : "text-danger fw-bold";

            // Đổ dữ liệu bảng điểm
            const tbodyDiem = document.getElementById('kq_hs_diem');
            tbodyDiem.innerHTML = '';
            
            duLieu.diem.forEach(d => {
                // ĐTB dưới 8.0 thì màu đen, từ 8.0 trở lên thì màu đỏ nổi bật
                const dtbColor = parseFloat(d.dtb) >= 8.0 ? 'text-danger' : 'text-dark';
                
                tbodyDiem.innerHTML += `
                    <tr>
                        <td class="fw-bold text-start text-primary">${d.mon}</td>
                        <td>${d.tx}</td>
                        <td>${d.gk}</td>
                        <td>${d.ck}</td>
                        <td class="fw-bold ${dtbColor}">${d.dtb}</td>
                    </tr>
                `;
            });

            // Hiện kết quả
            ketQuaDiv.classList.remove('d-none');
        } else {
            ketQuaDiv.classList.add('d-none');
            alert(`Hệ thống chưa ghi nhận dữ liệu của Mã học sinh [${inputMaHS}]. Vui lòng kiểm tra lại!`);
        }
    }, 800); // Giả lập mạng 0.8s
}
// --- LOGIC HỌC LIỆU SỐ E-LEARNING ---
function moBaiGiang(id, tenBaiGiang, linkVideo) {
    // Ẩn danh sách, hiện trình phát
    document.getElementById('gd_danhsach_khoahoc').classList.add('d-none');
    document.getElementById('gd_trinhphat_video').classList.remove('d-none');
    
    // Cập nhật tên và link video
    document.getElementById('gd_ten_baigiang').innerText = tenBaiGiang;
    document.getElementById('gd_iframe_video').src = linkVideo;
}

function dongBaiGiang() {
    // Tắt video (xóa src để video dừng phát)
    document.getElementById('gd_iframe_video').src = "";
    
    // Ẩn trình phát, hiện lại danh sách
    document.getElementById('gd_trinhphat_video').classList.add('d-none');
    document.getElementById('gd_danhsach_khoahoc').classList.remove('d-none');
}
// ==================== KHO HỌC LIỆU SỐ (GỌI API TỪ PYTHON) ====================

// 1. Tải và Vẽ dữ liệu từ Database
async function renderKhoHocLieu() {
    try {
        const response = await fetch("/api/hoclieu");
        const result = await response.json();
        
        if(result.status === "success") {
            const gridCongDan = document.getElementById('grid_hoclieu_congdan');
            const bangAdmin = document.getElementById('bang-hoc-lieu-admin');

            // Vẽ cho Công dân
            if (gridCongDan) {
                gridCongDan.innerHTML = '';
                result.data.forEach(hl => {
                    let badgeClass = "bg-danger text-white"; 
                    if (hl.phan_loai === "STEM") badgeClass = "bg-warning text-dark";
                    if (hl.phan_loai === "Ngoại ngữ") badgeClass = "bg-success text-white";
                    if (hl.phan_loai === "Công nghệ") badgeClass = "bg-info text-dark";

                    gridCongDan.innerHTML += `
                        <div class="col-md-4">
                            <div class="card h-100 shadow-sm border-0" style="cursor: pointer;" onclick="moBaiGiang('${hl.id}', '${hl.ten_bai}', '${hl.link_bai}')">
                                <div class="position-relative">
                                    <img src="${hl.hinh_anh}" class="card-img-top" style="height: 120px; object-fit: cover;">
                                    <span class="badge ${badgeClass} position-absolute top-0 end-0 m-2">${hl.phan_loai}</span>
                                </div>
                                <div class="card-body p-2">
                                    <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.9rem;">${hl.ten_bai}</h6>
                                    <small class="text-muted" style="font-size: 0.75rem;">Bài giảng trực tuyến</small>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            // Vẽ cho Admin
            if (bangAdmin) {
                bangAdmin.innerHTML = '';
                result.data.forEach(hl => {
                    let badgeClass = "bg-danger text-white"; 
                    if (hl.phan_loai === "STEM") badgeClass = "bg-warning text-dark";
                    if (hl.phan_loai === "Ngoại ngữ") badgeClass = "bg-success text-white";
                    if (hl.phan_loai === "Công nghệ") badgeClass = "bg-info text-dark";

                    bangAdmin.innerHTML += `
                        <tr>
                            <td class="text-start fw-bold text-primary">${hl.ten_bai}</td>
                            <td><span class="badge ${badgeClass}">${hl.phan_loai}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" title="Gỡ bài" onclick="xoaBaiGiang_API(${hl.id})"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }
        }
    } catch(err) {
        console.error("Lỗi tải học liệu:", err);
    }
}

// Chạy hàm lấy dữ liệu khi tải trang
document.addEventListener("DOMContentLoaded", renderKhoHocLieu);


// 2. CÁN BỘ ĐĂNG BÀI MỚI (LƯU VÀO DATABASE)
async function xuatBanBaiGiang() {
    const ten = document.getElementById('hl_ten').value.trim();
    const mon = document.getElementById('hl_mon').value;
    const link = document.getElementById('hl_link').value.trim();

    if (!ten || !link) {
        alert("Vui lòng nhập Tên bài giảng và đính kèm Link!");
        return;
    }

    let anhMacDinh = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop";

    try {
        const response = await fetch("/api/hoclieu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ten_bai: ten,
                phan_loai: mon,
                link_bai: link,
                hinh_anh: anhMacDinh
            })
        });

        if(response.ok) {
            document.getElementById('hl_ten').value = '';
            document.getElementById('hl_link').value = '';
            alert("🎉 Đã lưu bài giảng vào Cơ sở dữ liệu Quốc gia!");
            renderKhoHocLieu(); // Load lại bảng
        }
    } catch(err) {
        alert("Lỗi kết nối máy chủ!");
    }
}

// 3. CÁN BỘ XÓA BÀI (XÓA KHỎI DATABASE)
async function xoaBaiGiang_API(id) {
    if(confirm("Xác nhận gỡ bài giảng này khỏi cơ sở dữ liệu vĩnh viễn?")) {
        try {
            const response = await fetch(`/api/hoclieu/${id}`, {
                method: "DELETE"
            });
            if(response.ok) {
                renderKhoHocLieu(); // Load lại bảng
            }
        } catch(err) {
            alert("Lỗi xóa bài!");
        }
    }
}