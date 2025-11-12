// Hàm tạo ID duy nhất cho sản phẩm
function generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Định dạng giá theo dạng 'k' (ví dụ 20 -> 20k)
function formatK(price) {
  if (price === null || price === undefined) return '';
  const num = parseInt(String(price).replace(/[^\d]/g, ''), 10) || 0;
  return `${num}k`;
}

// Thêm sản phẩm vào giỏ hàng (sử dụng trong module marketController)
function addToCart(item, quantity = 1) {
  if (!item) return;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const id = generateId(item.name);
  const existingIndex = cart.findIndex(i => i.id === id);
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id,
      name: item.name,
      price: item.price,
      image: item.image,
      description: item.description,
      quantity: quantity
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  // Cập nhật hiển thị giỏ hàng ngay
  updateCartDisplay();
  // Cập nhật badge nếu có
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cart.reduce((s, it) => s + (it.quantity || 0), 0);
}

// Hàm đóng giỏ hàng,thêm
window.closeCart = function() {
    const cartContainer = document.querySelector('.cart-container');
    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartContainer) cartContainer.style.display = 'none';
    if (cartOverlay) cartOverlay.style.display = 'none';
};

// Hàm cập nhật hiển thị giỏ hàng
function updateCartDisplay() {
    const cartContainer = document.querySelector('.cart-container');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItems = document.querySelector('.cart-items');
    const totalAmount = document.getElementById('total-amount');
    
    if (!cartContainer || !cartItems || !totalAmount) return;
    
    // Hiển thị overlay và container
    if (cartOverlay) cartOverlay.style.display = 'block';
    cartContainer.style.display = 'block';
    
    // Lấy giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Giỏ hàng của bạn đang trống</p>
            </div>`;
  totalAmount.textContent = formatK(0);
        return;
    }
    
  // Tính tổng (theo đơn vị 'k') và hiển thị danh sách sản phẩm
  let totalK = 0;
  cartItems.innerHTML = cart.map((item, index) => {
    const itemK = parseInt(String(item.price).replace(/[^\d]/g, ''), 10) || 0;
    totalK += itemK * item.quantity;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p>Số lượng: ${item.quantity}</p>
          <p>Giá: ${formatK(item.price)}</p>
        </div>
        <button class="remove-item" onclick="removeFromCart(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');

  // Hiển thị tổng tiền theo 'k'
  totalAmount.textContent = formatK(totalK);

  // Hiển thị giỏ hàng
  cartContainer.style.display = 'block';
}

// Hàm xóa sản phẩm khỏi giỏ hàng
window.removeFromCart = function(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Cập nhật badge
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }
};

// ===== QR Payment Modal Functions =====
let countdownInterval = null;
const COUNTDOWN_SECONDS = 300; // 5 minutes

window.showQRModal = function(qrImageUrl = null) {
    const qrModal = document.getElementById('qrModal');
    const qrImage = document.getElementById('qr-image');
    const countdownEl = document.getElementById('countdown-time');
    const statusEl = document.getElementById('paymentStatus');
    
    if (!qrModal) return;
    
  // Set QR image (user will replace with their own image)
  if (qrImageUrl) {
    qrImage.src = qrImageUrl;
  } else {
    // Prefer the image tag's existing src (from HTML). If it's empty, use an external placeholder.
    if (!qrImage.src || qrImage.src.trim() === '') {
      qrImage.src = 'https://via.placeholder.com/250?text=QR+Code'; // Placeholder
    }
  }

  // Image load/error handlers to help debug missing images
  if (qrImage) {
    // Reset any previous handlers
    qrImage.onload = () => {
      // Image loaded successfully
      if (statusEl) {
        statusEl.textContent = 'Đang chờ thanh toán...';
        statusEl.style.color = '#666';
      }
      qrImage.style.opacity = '1';
    };
    qrImage.onerror = () => {
      // Show helpful message and fallback image
      if (statusEl) {
        statusEl.textContent = 'Không thể tải ảnh QR. Vui lòng kiểm tra đường dẫn.';
        statusEl.style.color = '#ff6b6b';
      }
      // Fallback to a known asset in the project (if exists)
      try {
        qrImage.src = '../assets/images/nhom.png';
      } catch (e) {
        // ignore
      }
      qrImage.style.opacity = '0.9';
    };
  }
    
    // Reset countdown
    if (countdownInterval) clearInterval(countdownInterval);
    let remainingSeconds = COUNTDOWN_SECONDS;
    
    // Update countdown every second
    const updateCountdown = () => {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color as time runs low
        if (remainingSeconds <= 60) {
            countdownEl.style.color = '#ff6b6b';
        } else {
            countdownEl.style.color = '#8b14f9';
        }
        
        if (remainingSeconds > 0) {
            remainingSeconds--;
        } else {
            clearInterval(countdownInterval);
            statusEl.textContent = 'Hết thời gian! Thanh toán không thành công.';
            statusEl.style.color = '#ff6b6b';
            document.querySelector('.cancel-payment-btn').textContent = 'Đóng';
        }
    };
    
    updateCountdown(); // Initial display
    countdownInterval = setInterval(updateCountdown, 1000);
    
    // Show modal
    qrModal.style.display = 'flex';
    
    // Ensure confirm button enabled and reset text
    const confirmBtn = document.querySelector('.confirm-payment-btn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Xác nhận đã thanh toán';
    }
    
    // Hide cart overlay and container
    const cartContainer = document.querySelector('.cart-container');
    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartContainer) cartContainer.style.display = 'none';
    if (cartOverlay) cartOverlay.style.display = 'none';
};

window.closeQRModal = function() {
    const qrModal = document.getElementById('qrModal');
    if (qrModal) qrModal.style.display = 'none';
    if (countdownInterval) clearInterval(countdownInterval);
};

window.cancelPayment = function() {
    const qrModal = document.getElementById('qrModal');
    const countdownEl = document.getElementById('countdown-time');
    const statusEl = document.getElementById('paymentStatus');
    
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Reset modal
    countdownEl.style.color = '#8b14f9';
    countdownEl.textContent = '5:00';
    statusEl.textContent = 'Đang chờ thanh toán...';
    statusEl.style.color = '#666';
    document.querySelector('.cancel-payment-btn').textContent = 'Hủy thanh toán';
    // Reset confirm button
    const confirmBtn = document.querySelector('.confirm-payment-btn');
    if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Xác nhận đã thanh toán'; }
    
    // Close modal
    if (qrModal) qrModal.style.display = 'none';
};

// Hàm xử lý thanh toán - hiển thị QR modal thay vì alert
window.processCheckout = function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }
    
    // Hiển thị QR modal
    showQRModal();
    
    // (Optional) Nếu bạn muốn giả lập thanh toán tự động sau 3 giây
    // setTimeout(() => {
    //     completePayment();
    // }, 3000);
};

window.completePayment = function() {
    const qrModal = document.getElementById('qrModal');
    const statusEl = document.getElementById('paymentStatus');
    
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Xóa giỏ hàng
  // Save order to purchase history before clearing cart
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const totalK = cart.reduce((sum, it) => {
        const v = parseInt(String(it.price).replace(/[^\d]/g, ''), 10) || 0;
        return sum + v * (it.quantity || 1);
      }, 0);
      const order = {
        id: 'order-' + Date.now(),
        date: new Date().toISOString(),
        items: cart,
        total: totalK + 'k'
      };
      orders.unshift(order); // newest first
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  } catch (e) {
    console.error('Error saving order:', e);
  }

  localStorage.setItem('cart', '[]');
    
    // Cập nhật hiển thị
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) cartBadge.textContent = '0';
    
    // Hiển thị thông báo thành công
    statusEl.textContent = 'Thanh toán thành công! Cảm ơn bạn đã mua hàng.';
    statusEl.style.color = '#27ae60';
    
    // Disable confirm button and update text
    const confirmBtn = document.querySelector('.confirm-payment-btn');
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Đã xác nhận'; }
    
    document.querySelector('.cancel-payment-btn').textContent = 'Đóng';
    
    // Tự động đóng sau 3 giây
    setTimeout(() => {
        if (qrModal) qrModal.style.display = 'none';
        // If orders modal is open, refresh it
        const ordersModal = document.getElementById('ordersModal');
        if (ordersModal && ordersModal.style.display === 'flex') renderPurchaseHistory();
    }, 3000);
};

// ===== Purchase history UI =====
function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch(e){ return iso; }
}

window.showPurchaseHistory = function() {
  const ordersModal = document.getElementById('ordersModal');
  if (!ordersModal) return;
  renderPurchaseHistory();
  ordersModal.style.display = 'flex';
};

window.closePurchaseHistory = function() {
  const ordersModal = document.getElementById('ordersModal');
  if (ordersModal) ordersModal.style.display = 'none';
};

window.showOrderDetails = function(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const titleEl = document.getElementById('orderDetailsTitle');
  if (titleEl) titleEl.textContent = `Chi tiết đơn hàng ${orderId}`;
  
  const container = document.getElementById('orderDetailsContainer');
  if (!container) return;
  
  const booksHtml = (order.items || []).map(item => `
    <div class="book-card-large">
      <div class="book-cover">
        <img src="${item.image || '../assets/images/nhom.png'}" alt="${item.name}" onerror="this.src='../assets/images/nhom.png'" />
      </div>
      <div class="book-info">
        <div class="book-name">${item.name}</div>
        <div class="book-qty">Số lượng: <strong>${item.quantity || 1}</strong></div>
        <div class="book-price">Giá: <strong>${item.price}</strong></div>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = booksHtml;
  
  const modal = document.getElementById('orderDetailsModal');
  if (modal) modal.style.display = 'flex';
};

window.closeOrderDetails = function() {
  const modal = document.getElementById('orderDetailsModal');
  if (modal) modal.style.display = 'none';
};

function renderPurchaseHistory() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if (!orders || orders.length === 0) {
    container.innerHTML = '<div class="empty-orders">Bạn chưa có đơn hàng nào.</div>';
    return;
  }

  container.innerHTML = orders.map(o => {
    const itemCount = (o.items || []).length;
    const totalQty = (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
    const dateStr = formatDate(o.date);

    const itemsHtml = (o.items || []).map(it => `
      <div class="order-item-thumbnail">
        <img src="${it.image || '../assets/images/nhom.png'}" alt="${it.name}" onerror="this.src='../assets/images/nhom.png'" />
      </div>
    `).join('');

    return `
      <div class="order-card-centered" onclick="showOrderDetails('${o.id}')" style="cursor:pointer;">
        <div class="order-card-header">
          <div class="order-id">${o.id}</div>
        </div>
        
        <div class="order-thumbnails">
          ${itemsHtml}
        </div>
        
        <div class="order-stats">
          <div class="stat-item">
            <span class="stat-label">Ngày mua</span>
            <span class="stat-value">${dateStr}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Số lượng</span>
            <span class="stat-value">${totalQty} sản phẩm</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Tổng tiền</span>
            <span class="stat-value" style="color:#8b14f9;font-weight:700">${o.total}</span>
          </div>
        </div>
        
        <div class="order-details-link">
          <small>${itemCount} mục trong đơn</small>
        </div>
      </div>
    `;
  }).join('');
}

export const market = {
  "Danh mục": {
    hidden: false,
    items: [
      {
        name: "Toán",
        price: "20K",
        image: "https://toanmath.com/wp-content/uploads/2024/02/sach-giao-khoa-toan-12-tap-1-ket-noi-tri-thuc-voi-cuoc-song.png",
        active: true,
        description: "Giáo trình Toán lớp 12 giúp học sinh nắm vững kiến thức nền tảng.",
        quantity: 18,
        releaseYear: 2024
      },
      {
        name: "Giải tích 1",
        price: "25K",
        image: "../assets/images/vantai.png",
        active: true,
        description: "Khám phá các khái niệm giới hạn, đạo hàm và tích phân.",
        quantity: 10,
        releaseYear: 2023
      },
      {
        name: "Xác suất thống kê",
        price: "45K",
        image: "../assets/images/nguyenvantaingu.png",
        active: true,
        description: "Tài liệu cơ bản về xác suất và thống kê ứng dụng.",
        quantity: 22,
        releaseYear: 2022
      },
      {
        name: "Lý thuyết đồ thị",
        price: "45K",
        image: "../assets/images/ltđt.png",
        active: true,
        description: "Giới thiệu các khái niệm và thuật toán trong đồ thị.",
        quantity: 15,
        releaseYear: 2021
      },
      {
        name: "Triết học",
        price: "50K",
        image: "../assets/images/triet.png",
        active: true,
        description: "Tổng quan các trường phái triết học phương Tây và phương Đông.",
        quantity: 8,
        releaseYear: 2020
      },
      {
        name: "Pháp luật đại cương",
        price: "20K",
        image: "../assets/images/pldc.png",
        active: true,
        description: "Cẩm nang pháp luật cơ bản dành cho sinh viên.",
        quantity: 20,
        releaseYear: 2023
      },
      {
        name: "Toán rời rạc",
        price: "45K",
        image: "../assets/images/toanroirac.png",
        active: true,
        description: "Phân tích các cấu trúc toán học không liên tục.",
        quantity: 12,
        releaseYear: 2022
      },
      {
        name: "Cờ tướng",
        price: "30K",
        image: "../assets/images/vodichthu.png",
        active: true,
        description: "Chiến thuật và kỹ năng chơi cờ tướng chuyên sâu.",
        quantity: 30,
        releaseYear: 2021
      },
      {
        name: "Kinh tế chính trị",
        price: "45K",
        image: "../assets/images/ktct.png",
        active: true,
        description: "Phân tích các học thuyết kinh tế và chính trị hiện đại.",
        quantity: 14,
        releaseYear: 2024
      }
    ]
  },

  "Danh mục 1": {
    hidden: false,
    items: [
      {
        name: "Cơ sở dữ liệu",
        price: "20K",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Hướng dẫn thiết kế và quản lý hệ thống cơ sở dữ liệu.",
        quantity: 7,
        releaseYear: 2022
      },
      {
        name: "Cấu trúc dữ liệu và giải thuật",
        price: "20K",
        image: "../assets/icons/jokerBentre.jpg",
        active: true,
        description: "Tài liệu chuyên sâu về cấu trúc dữ liệu và thuật toán.",
        quantity: 16,
        releaseYear: 2023
      },
      {
        name: "Kỹ thuật lập trình",
        price: "55K",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Giáo trình nhập môn lập trình với các ví dụ thực tế.",
        quantity: 25,
        releaseYear: 2025
      }
    ]
  },

  "Danh mục 2": {
    hidden: false,
    items: [
      {
        name: "Java",
        price: "45K",
        image: "../assets/icons/jokerBentre.jpg",
        active: true,
        description: "Học lập trình Java từ cơ bản đến nâng cao.",
        quantity: 14,
        releaseYear: 2021
      },
      {
        name: "Lập trình hướng đối tượng",
        price: "40K",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Giáo trình OOP với ví dụ minh họa bằng Java và C++.",
        quantity: 11,
        releaseYear: 2023
      },
      {
        name: "JavaScript",
        price: "30K",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Tài liệu học JavaScript cho phát triển web hiện đại.",
        quantity: 19,
        releaseYear: 2024
      },
      {
        name: "C++",
        price: "45K",
        image: "../assets/icons/jokerBentre.jpg",
        active: true,
        description: "Giáo trình C++ với các bài tập thực hành nâng cao.",
        quantity: 13,
        releaseYear: 2022
      },
      {
        name: "Python",
        price: "25K",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Giáo trình Python dành cho phân tích dữ liệu và AI.",
        quantity: 9,
        releaseYear: 2024
      },
      {
        name: "C#",
        price: "30K",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Hướng dẫn lập trình C# với ứng dụng thực tế.",
        quantity: 17,
        releaseYear: 2021
      }
    ]
  }
};
let minPrice = null;
let maxPrice = null;
let releaseYear = null;
let searchQuery = "";
let itemsPerPage = 10;
let selectedCategory = null;
let currentPage = 1;

const dataString = localStorage.getItem("adminProducts");
const marketItems = dataString?JSON.parse(dataString):market;
// Tạo HTML cho một sản phẩm,thêm
function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    
    // Lưu thông tin sản phẩm vào data attributes
    itemDiv.setAttribute('data-description', item.description);
    itemDiv.setAttribute('data-quantity', item.quantity);
    itemDiv.setAttribute('data-year', item.releaseYear);
    
    itemDiv.innerHTML = `
        <div class="item-image-container">
            <img src="${item.image}" alt="${item.name}" class="item-image">
        </div>
        <h3 class="item-name">${item.name}</h3>
    <p class="item-price">${formatK(item.price)}</p>
        <button class="add-to-cart-btn">Add to Cart</button>
    `;
    
    // Thêm sự kiện click cho item
    itemDiv.addEventListener('click', (e) => {
        // Reset số lượng về 1 khi mở popup
        if (document.getElementById('quantity')) {
            document.getElementById('quantity').value = 1;
        }
        
        // Ngăn chặn sự kiện khi click vào nút add to cart
        if (e.target.classList.contains('add-to-cart-btn') || 
            e.target.closest('.add-to-cart-btn')) {
            return;
        }
        
        showProductDetail(item);
    });
    
    // Thêm sự kiện cho nút add to cart
    const addToCartBtn = itemDiv.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(item);
    });
    
    return itemDiv;
}

// Hiện thị item trong item-container
function renderMarketItems(page = 1) {
    const container = document.querySelector(".item-container");
    if (!container) return;
    
    // Xóa tất cả các item hiện tại
    container.innerHTML = "";
    container.innerHTML = "";
    
    // Thêm ID cho mỗi sản phẩm và lưu vào localStorage
    Object.values(marketItems).forEach(category => {
        category.items.forEach(item => {
            if (!item.id) {
                item.id = generateId(item.name);
            }
        });
    });
    
    // Lưu toàn bộ dữ liệu sản phẩm vào localStorage
// Lưu toàn bộ dữ liệu sản phẩm vào localStorage
   localStorage.setItem('marketItems', JSON.stringify(marketItems));
    const allItems = Object.values(marketItems).map(cat => cat.items).flat(); // Lấy mảng items bên trong rồi gộp lại // Lấy mảng items bên trong rồi gộp lại

  const filteredItems = selectedCategory? (marketItems[selectedCategory]?.items || []): allItems; 

  const nameFiltered = filteredItems.filter(item => {
   const priceValue = parseFloat(item.price);
  const matchesName = item.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesMin = minPrice === null || priceValue >= minPrice;
  const matchesMax = maxPrice === null || priceValue <= maxPrice;
  const matchesYear = releaseYear === null || item.releaseYear === releaseYear;

    return item.active && matchesName && matchesMin && matchesMax && matchesYear;
  });

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = nameFiltered.slice(start, end); // Mỗi trang có 1-10 item

  // Tạo item mới rồi bỏ vào item-container
  pageItems.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("market-item");

    itemDiv.innerHTML = `
    <div class="item-link">
      <img src="${item.image}" alt="${item.name}" class="item-image" />
      <div class="item-info">
        <h3 class="item-name">${item.name}</h3>
        <p class="item-price">${formatK(item.price)}</p>
        <p class="item-quantity">Số lượng: ${item.quantity ?? 0}</p>
        <p class="item-release">Năm phát hành: ${item.releaseYear ?? "Không rõ"}</p>
      </div>
    </div>`;
        
        // Thêm sự kiện click vào toàn bộ item
        itemDiv.addEventListener('click', (e) => {
            // Reset lại số lượng về 1 mỗi khi mở popup
            document.getElementById('quantity').value = 1;
            
            // Ngăn chặn sự kiện click nếu người dùng click vào nút add to cart
            if (e.target.classList.contains('add-to-cart-btn') || 
                e.target.closest('.add-to-cart-btn')) {
                return;
            }
            showProductDetail(item);
        });

        container.appendChild(itemDiv);
    });

  // rander thanh trang
  renderPagination(nameFiltered.length, page, itemsPerPage);
}

// Hiện thị thanh trang
function renderPagination(totalItems, currentPage, itemsPerPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage); // Tổng số trang trong category đã chọn
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  // Tạo nút chuyển trang
  const createButton = (label, page, disabled = false) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.disabled = disabled;
    btn.classList.add("page-btn");
    if (page === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
    renderMarketItems(page);
    });
    return btn;
  };

  // Tạo nút quay lại
  paginationContainer.appendChild(createButton("Previous", currentPage - 1, currentPage === 1));

  // Insert các nút còn lại vào thanh trang
  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(createButton(i, i));
  }

  // Tạo nút chuyển trang tiếp theo 
  paginationContainer.appendChild(createButton("Next", currentPage + 1, currentPage === totalPages));
}

// Hiện thị thanh danh mục(category)
function renderCategoryBar() {
  const categoryBar = document.getElementById("categoryBar");
  if (!categoryBar) return;

  categoryBar.innerHTML = "";

  // Add "All" option => Hiện thị tất cả item
  const allBtn = document.createElement("div");
  allBtn.textContent = "All";
  allBtn.classList.add("category-btn");
  allBtn.addEventListener("click", () => {
    selectedCategory = null;
    renderMarketItems(1);
  });
  categoryBar.appendChild(allBtn);

  // Add Danh mục(categories) từ marketItems 
  Object.keys(marketItems).forEach(category => {
    const li = document.createElement("div");
    li.textContent = category;
    li.classList.add("category-btn");
    li.addEventListener("click", () => {
    selectedCategory = category;
    renderMarketItems(1);
    });
    categoryBar.appendChild(li);
  });
}

// Đối với admin thì sử dụng hàm này để thêm item vào marketItems
function addItemToCategory(item, category) {
  if (!marketItems[category]) {
    marketItems[category] = { hidden: false, items: [] };
  }
  marketItems[category].items.push({
    ...item,
    description: item.description || "",
    quantity: item.quantity ?? 0
  });
}

// Đối với admin thì sử dụng hàm này để xóa item khỏi marketItems
function removeItemFromCategory(itemName, category) {
  if (!marketItems[category]) return;
  marketItems[category] = marketItems[category].filter(item => item.name !== itemName);
}

// Tìm kiếm theo giá
const minPriceInput = document.getElementById("minPriceBar");
const maxPriceInput = document.getElementById("maxPriceBar");
if (minPriceInput && maxPriceInput) {
  minPriceInput.addEventListener("input", e => {
    const value = parseFloat(e.target.value);
    minPrice = isNaN(value) ? null : value;
    renderMarketItems(1);
  });

  maxPriceInput.addEventListener("input", e => {
    const value = parseFloat(e.target.value);
    maxPrice = isNaN(value) ? null : value;
    renderMarketItems(1);
  });
}

// Tìm kiếm theo năm xuất bản
const releaseYearInput = document.getElementById("releaseYearBar");
if (releaseYearInput) {
  releaseYearInput.addEventListener("input", e => {
    const value = parseInt(e.target.value);
    releaseYear = isNaN(value) ? null : value;
    renderMarketItems(1);
  });
}

// Tìm kiếm theo tên
const searchInput = document.getElementById("searchInput");
if (searchInput) { // <-- THÊM DÒNG NÀY
  searchInput.addEventListener("input", e => {
  searchQuery = e.target.value.trim();
  renderMarketItems(1);
  });
} 

// Thay đổi các hiện thị khi window bị thay đổi khích thước
window.addEventListener("resize", () => {
    renderMarketItems(1); // Re-render on resize
});

// Load lại trang
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryBar();
  renderMarketItems(1);
});

// Click danh mục
document.querySelectorAll(".category-bar li").forEach(li => {
  li.addEventListener("click", () => {
    selectedCategory = li.textContent.trim();
    renderMarketItems(1);
  });
});

// Thêm sự kiện click cho từng sản phẩm
function addProductClickHandlers() {
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Ngăn chặn sự kiện click nếu người dùng click vào nút add to cart
            if (e.target.classList.contains('add-to-cart-btn') || 
                e.target.closest('.add-to-cart-btn')) {
                return;
            }
            
            // Lấy thông tin sản phẩm từ data attributes
            const itemData = {
                name: item.querySelector('.item-name').textContent,
                price: item.querySelector('.item-price').textContent,
                image: item.querySelector('.item-image').src,
                description: item.getAttribute('data-description'),
                quantity: item.getAttribute('data-quantity'),
                releaseYear: item.getAttribute('data-year')
            };
            
            showProductDetail(itemData);
        });
    });
}










function showProductDetail(item) {
    const productDetail = document.querySelector(".product-container");
    if (!productDetail || !item) return;

    // Gán dữ liệu sản phẩm vào popup
    const productImage = document.getElementById("product-image");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productQuantity = document.getElementById("product-quantity");
    const productYear = document.getElementById("product-year");
    const productDescription = document.getElementById("product-description");

  if (productImage) productImage.src = item.image;
  if (productName) productName.textContent = item.name;
  if (productPrice) productPrice.textContent = formatK(item.price);
    if (productQuantity) productQuantity.textContent = item.quantity ?? 0;
    if (productYear) productYear.textContent = item.releaseYear ?? "Không rõ";
    if (productDescription) productDescription.textContent = item.description;

    // Reset số lượng về 1
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) quantityInput.value = 1;

    // Hiện popup chi tiết sản phẩm
    productDetail.style.display = "block";

  // Định nghĩa hàm thêm vào giỏ hàng từ popup (khác với addToCart trên trang cart.js)
  window.addToCartPopup = function() {
        const quantity = parseInt(document.getElementById("quantity").value) || 1;
        const cartItem = {
            id: generateId(item.name),
            name: item.name,
            price: item.price,
            image: item.image,
            description: item.description,
            quantity: quantity
        };

        // Lấy giỏ hàng hiện tại từ localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = cart.findIndex(i => i.id === cartItem.id);

        if (existingItemIndex !== -1) {
            // Nếu sản phẩm đã tồn tại, cộng thêm số lượng
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Nếu sản phẩm chưa có, thêm mới vào giỏ hàng
            cart.push(cartItem);
        }

        // Lưu giỏ hàng mới vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Cập nhật hiển thị số lượng trong giỏ hàng
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = totalItems;
        }

    // Đóng popup chi tiết sản phẩm
    productDetail.style.display = "none";

    // Cập nhật và hiển thị giỏ hàng
    updateCartDisplay();
  };

    // Định nghĩa các hàm xử lý số lượng
    window.decreaseQuantity = function() {
        const input = document.getElementById("quantity");
        if (!input) return;
        let value = parseInt(input.value);
        if (value > 1) {
            input.value = value - 1;
        }
    };

        window.increaseQuantity = function() {
        const input = document.getElementById("quantity");
        if (!input) return;
        let value = parseInt(input.value);
        let maxQuantity = parseInt(document.getElementById("product-quantity").textContent);
        if (value < maxQuantity) {
            input.value = value + 1;
        }
    };

    window.validateQuantity = function(input) {
        let value = parseInt(input.value);
        let maxQuantity = parseInt(document.getElementById("product-quantity").textContent);
        if (value < 1) input.value = 1;
        if (value > maxQuantity) input.value = maxQuantity;
    };

    // Thêm sự kiện click để đóng popup khi click ngoài
    const closePopup = function(event) {
        if (!productDetail.contains(event.target) && 
            !event.target.closest('.item')) {
            productDetail.style.display = "none";
            document.removeEventListener('click', closePopup);
        }
    };

    // Đợi một chút trước khi thêm sự kiện click để tránh đóng ngay lập tức
    setTimeout(() => {
        document.addEventListener('click', closePopup);
    }, 100);
  }
