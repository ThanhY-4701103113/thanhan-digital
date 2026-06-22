// ================= XỬ LÝ HẠ TẦNG SỐ =================

// --- 1. WI-FI CÔNG CỘNG ---
function moModalWifi() {
    document.getElementById('wifiModal').style.display = 'block';
}

function dongModalWifi() {
    document.getElementById('wifiModal').style.display = 'none';
}

// --- 2. TRỢ LÝ ẢO AI ---
function moModalAI() {
    document.getElementById('aiModal').style.display = 'block';
}

function dongModalAI() {
    document.getElementById('aiModal').style.display = 'none';
}

function xuLyPhimEnter(event) {
    if (event.key === "Enter") {
        guiTinNhanAI();
    }
}
function guiTinNhanAI() {
    const inputField = document.getElementById('ai_input');
    const text = inputField.value.trim();
    if (!text) return;

    const chatBox = document.getElementById('ai_chat_box');
    
    // In tin nhắn của người dùng lên màn hình
    chatBox.innerHTML += `
        <div class="text-end mb-3">
            <span class="bg-primary text-white shadow-sm px-3 py-2 rounded-3 d-inline-block" style="max-width: 85%;">
                ${text}
            </span>
        </div>`;
    
    inputField.value = ''; // Xóa ô nhập
    chatBox.scrollTop = chatBox.scrollHeight; // Cuộn xuống cuối cùng

    // Giả lập thời gian AI "đang suy nghĩ" (1 giây)
    setTimeout(() => {
        let botReply = "Dạ, hiện tại dữ liệu hệ thống đang được huấn luyện thêm. Xin vui lòng liên hệ trực tiếp số hotline UBND xã Thạnh An để được hỗ trợ chi tiết ạ!";
        
        const lowerText = text.toLowerCase();
        
        // 1. Kịch bản Giao tiếp cơ bản
        if (lowerText.includes('chào') || lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('ê')) {
            botReply = "Dạ xin chào! Chúc bạn một ngày tốt lành. Mình là Trợ lý ảo của xã đảo Thạnh An, mình có thể giúp gì cho bạn ạ?";
        } 
        else if (lowerText.includes('cám ơn') || lowerText.includes('cảm ơn') || lowerText.includes('thank')) {
            botReply = "Dạ không có chi! Rất vinh hạnh được hỗ trợ bạn. Nếu cần thêm thông tin gì, bạn cứ nhắn tin cho mình nhé!";
        }
        else if (lowerText.includes('tên gì') || lowerText.includes('là ai')) {
            botReply = "Mình là Bot AI Thạnh An, được lập trình để hỗ trợ người dân và du khách tra cứu thông tin dịch vụ số trên đảo.";
        }
        // 2. Kịch bản Giao thông / Du lịch
        else if (lowerText.includes('đò') || lowerText.includes('tàu') || lowerText.includes('bến') || lowerText.includes('đi lại')) {
            botReply = "Tuyến đò Cần Thạnh - Thạnh An mỗi ngày có khoảng 5 chuyến đi và về (tham khảo: 6h30, 9h00, 10h30, 12h00, 14h00, 17h00). Giá vé khoảng 15.000đ/lượt. Bạn chú ý ra bến trước 15 phút nhé!";
        }
        // 3. Kịch bản Cũ đã có
        else if (lowerText.includes('wifi') || lowerText.includes('mạng') || lowerText.includes('internet')) {
            botReply = "Tại xã đảo Thạnh An, bạn có thể truy cập Wi-Fi miễn phí ở UBND Xã, Trạm Y tế và Bến đò. Bạn xem chi tiết ở mục 'Điểm phát Wi-Fi' trên màn hình chính nhé!";
        } 
        else if (lowerText.includes('hồ sơ') || lowerText.includes('thủ tục') || lowerText.includes('hành chính') || lowerText.includes('khai sinh')) {
            botReply = "Để nộp hồ sơ hoặc tra cứu thủ tục (Khai sinh, Kết hôn...), bạn vui lòng chuyển sang thẻ 'Hành Chính' ở ngoài trang chủ, sau đó chọn chức năng tương ứng ạ.";
        }
        else if (lowerText.includes('đặc sản') || lowerText.includes('mua') || lowerText.includes('hải sản') || lowerText.includes('cá') || lowerText.includes('ăn')) {
            botReply = "Xã Thạnh An có các đặc sản chuẩn OCOP như Khô cá dứa, Mắm ruốc, Hàu sữa... Bạn hãy vào thẻ 'Kinh tế số' -> 'Gian hàng đặc sản' để đặt mua trực tiếp từ ngư dân nhé!";
        }

        // In tin nhắn trả lời của AI
        chatBox.innerHTML += `
            <div class="text-start mb-3">
                <span class="bg-white text-dark border shadow-sm px-3 py-2 rounded-3 d-inline-block" style="max-width: 85%;">
                    <strong>🤖 AI Thạnh An:</strong><br>${botReply}
                </span>
            </div>`;
        
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}
// ==================== CÁN BỘ - QUẢN TRỊ HẠ TẦNG SỐ ====================

// ==================== CÁN BỘ - QUẢN TRỊ HẠ TẦNG SỐ ====================

// 1. KHO DỮ LIỆU WIFI (Mock Database)
let danhSachWiFi = [
    { ten: "AP-01: UBND Xã", ip: "192.168.1.2", vitri: "Khu hành chính", trangThai: "Đang phát", users: 142 },
    { ten: "AP-02: Bến Đò", ip: "192.168.1.3", vitri: "Khu vực cầu tàu", trangThai: "Đang phát", users: 89 },
    { ten: "AP-03: Trạm Y Tế", ip: "192.168.1.4", vitri: "Khu dân cư Thạnh Bình", trangThai: "Chập chờn", users: 12 }
];

// 2. HÀM VẼ BẢNG WIFI
function renderBangWiFi() {
    const tbody = document.getElementById('bang-wifi-admin');
    if (!tbody) return;
    tbody.innerHTML = ''; // Làm sạch bảng
    
    danhSachWiFi.forEach((wf, index) => {
        let badgeClass = wf.trangThai === "Đang phát" ? "bg-success" : "bg-warning text-dark";
        
        tbody.innerHTML += `
            <tr>
                <td class="text-start">
                    <strong class="text-dark">${wf.ten}</strong><br>
                    <small class="text-muted">IP: ${wf.ip}</small><br>
                    <small class="text-muted"><i class="fa-solid fa-location-dot text-danger"></i> ${wf.vitri}</small>
                </td>
                <td>
                    <span class="badge ${badgeClass} mb-1">${wf.trangThai}</span><br>
                    <small class="text-primary fw-bold">${wf.users} Users</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary me-1" title="Chỉnh sửa" onclick="moModalSuaWiFi('${wf.id}', '${wf.ten_tram}', '${wf.ip_address}', '${wf.vi_tri}')"><i class="fa-solid fa-pen"></i> Sửa</button>
                    <button class="btn btn-sm btn-outline-danger" title="Gỡ trạm" onclick="xoaTramWiFi(${index})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// Tự động vẽ bảng khi web vừa load xong
document.addEventListener("DOMContentLoaded", renderBangWiFi);
// ==================== QUẢN TRỊ HẠ TẦNG SỐ (ĐỒNG BỘ API TRỰC TIẾP) ====================

// 1. Tải dữ liệu Wi-Fi từ FastAPI và vẽ lên CẢ 2 MÀN HÌNH (Công dân & Cán bộ)
// 1. Tải dữ liệu Wi-Fi từ FastAPI và vẽ lên CẢ 2 MÀN HÌNH
async function renderBangWiFi() {
    try {
        const response = await fetch("/api/wifi");
        const result = await response.json();
        
        if (result.status === "success") {
            const tbodyAdmin = document.getElementById('bang-wifi-admin');
            const listCongDan = document.getElementById('danh_sach_wifi_congdan');

            // TRƯỜNG HỢP 1: Đổ dữ liệu vào bảng Quản trị của Cán bộ
            if (tbodyAdmin) {
                tbodyAdmin.innerHTML = '';
                result.data.forEach(wf => {
                    let badgeClass = wf.trang_thai === "Đang phát" ? "bg-success" : "bg-warning text-dark";
                    tbodyAdmin.innerHTML += `
                        <tr>
                            <td class="text-start">
                                <strong class="text-dark">${wf.ten_tram}</strong><br>
                                <small class="text-muted">IP: ${wf.ip_address}</small><br>
                                <small class="text-muted"><i class="fa-solid fa-location-dot text-danger"></i> ${wf.vi_tri}</small>
                            </td>
                            <td>
                                <span class="badge ${badgeClass} mb-1">${wf.trang_thai}</span><br>
                                <small class="text-primary fw-bold">${wf.users_count} Users</small>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-secondary me-1" title="Chỉnh sửa" onclick="moModalSuaWiFi('${wf.id}', '${wf.ten_tram}', '${wf.ip_address}', '${wf.vi_tri}')"><i class="fa-solid fa-pen"></i> Sửa</button>
                                <button class="btn btn-sm btn-outline-danger" title="Gỡ trạm" onclick="xoaTramWiFi_API(${wf.id})"><i class="fa-solid fa-trash"></i> Gỡ</button>
                            </td>
                        </tr>
                    `;
                });
            }

            // TRƯỜNG HỢP 2: Đổ dữ liệu ra Bản đồ Wi-Fi của Người Dân
            if (listCongDan) {
                listCongDan.innerHTML = '';
                result.data.forEach(wf => {
                    let signalText = wf.trang_thai === "Đang phát" ? "Tín hiệu mạnh" : "Tín hiệu khá";
                    let badgeClass = wf.trang_thai === "Đang phát" ? "bg-success" : "bg-warning text-dark";

                    listCongDan.innerHTML += `
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-1 rounded border shadow-sm bg-white">
                            <div>
                                <h6 class="mb-1 fw-bold text-dark"><i class="fa-solid fa-circle-nodes text-primary"></i> ${wf.ten_tram}</h6>
                                <div class="mb-1" style="font-size: 0.85rem;">
                                    <span class="text-muted"><i class="fa-solid fa-location-dot text-danger"></i> Vị trí: ${wf.vi_tri}</span>
                                </div>
                                <small class="text-muted">Tên sóng mạng: <strong class="text-primary">ThanhAn_FreeWiFi_${wf.id}</strong></small>
                            </div>
                            <span class="badge ${badgeClass} rounded-pill"><i class="fa-solid fa-signal"></i> ${signalText}</span>
                        </div>
                    `;
                });
            }
        }
    } catch (error) {
        console.error("Lỗi đồng bộ Wi-Fi:", error);
    }
}

// Tự động chạy để tải dữ liệu Wi-Fi ngay khi mở web lên
document.addEventListener("DOMContentLoaded", renderBangWiFi);


// 2. CÁN BỘ TIẾN HÀNH THÊM TRẠM PHÁT MỚI (LƯU XUỐNG PYTHON)
async function themTramWiFi() {
    const ten = document.getElementById('wf_ten').value.trim();
    const ip = document.getElementById('wf_ip').value.trim();
    const vitri = document.getElementById('wf_vitri').value.trim();

    if (!ten || !ip || !vitri) {
        alert("Vui lòng nhập đầy đủ Tên trạm, IP và Vị trí lắp đặt!");
        return;
    }

    try {
        const response = await fetch("/api/wifi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ten_tram: ten,
                ip_address: ip,
                vi_tri: vitri
            })
        });

        if (response.ok) {
            // Xóa trắng form nhập liệu
            document.getElementById('wf_ten').value = '';
            document.getElementById('wf_ip').value = '';
            document.getElementById('wf_vitri').value = '';
            
            alert("📡 Thiết lập trạm phát mới thành công! Hệ thống đã truyền dữ liệu ra Cổng công dân.");
            renderBangWiFi(); // Gọi nạp lại bảng dữ liệu mới luôn
        }
    } catch (error) {
        alert("Không thể kết nối đến máy chủ quản trị hạ tầng!");
    }
}


// 3. CÁN BỘ TIẾN HÀNH GỠ TRẠM PHÁT (XÓA KHỎI PYTHON)
async function xoaTramWiFi_API(id) {
    if (confirm("Xác nhận gỡ bỏ trạm Wi-Fi này khỏi hệ thống hạ tầng toàn xã? (Người dân sẽ mất kết nối mạng tại vị trí này)")) {
        try {
            const response = await fetch(`/api/wifi/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                renderBangWiFi(); // Cập nhật lại màn hình
            }
        } catch (error) {
            alert("Lỗi lệnh xóa!");
        }
    }
}
// ==================== LOGIC CHỈNH SỬA WI-FI ====================

// Mở cửa sổ và điền dữ liệu cũ vào form
function moModalSuaWiFi(id, ten, ip, vitri) {
    document.getElementById('edit_wf_id').value = id;
    document.getElementById('edit_wf_ten').value = ten;
    document.getElementById('edit_wf_ip').value = ip;
    document.getElementById('edit_wf_vitri').value = vitri;
    document.getElementById('modalSuaWiFi').style.display = 'block';
}

// Đóng cửa sổ
function dongModalSuaWiFi() {
    document.getElementById('modalSuaWiFi').style.display = 'none';
}

// Gửi lệnh lên máy chủ Python để lưu đè
async function luuSuaWiFi_API() {
    const id = document.getElementById('edit_wf_id').value;
    const ten = document.getElementById('edit_wf_ten').value.trim();
    const ip = document.getElementById('edit_wf_ip').value.trim();
    const vitri = document.getElementById('edit_wf_vitri').value.trim();

    if (!ten || !ip || !vitri) {
        alert("Vui lòng không để trống thông tin!");
        return;
    }

    try {
        const response = await fetch(`/api/wifi/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ten_tram: ten,
                ip_address: ip,
                vi_tri: vitri
            })
        });

        if (response.ok) {
            dongModalSuaWiFi(); // Đóng popup
            alert("✅ Đã cập nhật thông tin trạm Wi-Fi thành công! Dữ liệu đã đồng bộ trên bản đồ người dân.");
            renderBangWiFi(); // Nạp lại bảng để thấy kết quả ngay
        } else {
            alert("Lỗi khi cập nhật trên máy chủ!");
        }
    } catch (error) {
        alert("Không thể kết nối đến máy chủ quản trị!");
    }
}