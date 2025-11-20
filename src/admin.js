import {
    formatK,
    market as defaultMarketItems
} from './marketController.js';

// Biến tìm kiếm và lọc
const productSearchInput = document.getElementById("product-search-input");
const accountSearchInput = document.getElementById("account-search-input");
const priceSearchInput = document.getElementById("price-search-input");
const importSearchInput = document.getElementById("import-search-input");
// Biến lọc đơn hàng theo trạng thái
const orderFilterStatus = document.getElementById("order-filter-status");

// Biến phân trang
const ITEMS_PER_PAGE = 10; 

let productCurrentPage = 1;
let accountCurrentPage = 1;
let importCurrentPage = 1;
let priceCurrentPage = 1;
let orderCurrentPage = 1;


// Đổi tab market, accounts, import, price 
function setActiveTab(tab) {
    // Reset trạng thái active và thêm active cho nút tab
    document.querySelectorAll(".admin-category-bar li").forEach(li => li.classList.remove("active"));
    document.getElementById(`${tab}-tab`).classList.add("active");
    
    const marketPanel = document.getElementById("market");
    const accountsPanel = document.getElementById("accounts");
    const importPanel =document.getElementById("imports");
    const pricePanel=document.getElementById("price");
    const orderPanel = document.getElementById("orders");
    const adminContent = document.getElementById("admin-section-content");

    if(adminContent) adminContent.style.display = "none";
    
    //Mặc định là ẩn
    marketPanel.style.display = "none";
    accountsPanel.style.display = "none";
    importPanel.style.display="none";
    pricePanel.style.display="none";
    orderPanel.style.display = "none";
    //Chọn đúng tab thì hiện
    if (tab === "market") {
        marketPanel.style.display = "block";
        renderProductTable(productCurrentPage);
    } else if(tab === "accounts" ) {
        accountsPanel.style.display = "block";
        renderAccountsTable(accountCurrentPage);
    }
    else if(tab === "imports" ) {
        importPanel.style.display="block";
        renderImportsTable(importCurrentPage);
    }
    else if (tab === "price") {
        pricePanel.style.display="block";
        renderPriceCategorySelector();
        renderPriceTable(priceCurrentPage);
    }
    else if (tab === "orders") { 
        if (orderPanel) {
            orderPanel.style.display = "block";
            renderOrdersTable(orderCurrentPage);
        }
    }
}
//xử lý sự kiện khi chuyển tab
document.getElementById("market-tab").addEventListener("click", () => setActiveTab("market"));
document.getElementById("accounts-tab").addEventListener("click", () => setActiveTab("accounts"));
document.getElementById("imports-tab").addEventListener("click",()=>setActiveTab("imports"));
document.getElementById("price-tab").addEventListener("click",()=>setActiveTab("price"));
document.getElementById("orders-tab").addEventListener("click",()=>setActiveTab("orders"));

// load sản phẩm đã lưu nếu không có thì load mặc định
function loadProductsFromStorage() {
    const dataString = localStorage.getItem("adminProducts");
    if (dataString) {
        return JSON.parse(dataString);
    }
    return JSON.parse(JSON.stringify(defaultMarketItems));
}

//hàm lưu sản phẩm
function saveProductsToStorage() {
    const dataString = JSON.stringify(marketItems);
    localStorage.setItem("adminProducts", dataString);
}

let marketItems = loadProductsFromStorage();

//dang mục mặc định
let currentCategory = Object.keys(marketItems)[0];
let currentProductEditIndex = null; 
const categorySelect = document.getElementById("category-select");

//hàm render bảng dang mục
function renderCategorySelector() {
    if (!categorySelect) return; 
    categorySelect.innerHTML = ""; 
    
    // Lấy từng danh mục trong mảng và thêm từng danh mục
    Object.keys(marketItems).forEach(categoryName => {
        const categoryData = marketItems[categoryName];
        const option = document.createElement("option");
        option.value = categoryName;
        option.textContent = categoryName + (categoryData.hidden ? " (Đang ẩn)" : "");
        if (categoryName === currentCategory) {
            option.selected = true;
        } // thêm thẻ option vào select
        categorySelect.appendChild(option);
    });
}

// xử lý sự kiện làm xuất hiện các danh mục
if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
        currentCategory = e.target.value; 
        renderProductTable(1); // Reset về trang 1
    });
}
// Xử lý thêm danh mục mới
document.getElementById("add-category-btn").addEventListener("click", () => {
    const newCategory = document.getElementById("new-category-name").value.trim();
    if (!newCategory) {
        alert("Vui lòng nhập tên danh mục!");
        return;
    }

    if (marketItems[newCategory]) {
        alert("Danh mục này đã tồn tại!");
        return;
    }

    marketItems[newCategory] = { hidden: false, items: [] };
    currentCategory = newCategory;
    saveProductsToStorage();
    renderCategorySelector();
    renderProductTable(1); // Reset về trang 1
    document.getElementById("new-category-name").value = "";
});

//Xóa danh mục
document.getElementById("delete-cat-btn").addEventListener("click", () => {
    const category = document.getElementById("category-select").value;
    if (!category) {
        alert("Không có danh mục nào được chọn!");
        return;
    }

    if (confirm(`Bạn có chắc muốn xóa danh mục "${category}" không?`)) {
        delete marketItems[category];
        currentCategory = Object.keys(marketItems)[0] || null;
        saveProductsToStorage();
        renderCategorySelector();
        renderProductTable(1); // Reset về trang 1
        alert(`Đã xóa danh mục "${category}"`);
    }
});

//Sửa danh mục
document.getElementById("edit-cat-btn").addEventListener("click", () => {
    const oldCategory = document.getElementById("category-select").value;
    if (!oldCategory) {
        alert("Không có danh mục nào được chọn!");
        return;
    }

    const newName = prompt("Nhập tên danh mục mới:", oldCategory);
    if (!newName || newName.trim() === "") {
        alert("Tên danh mục không hợp lệ!");
        return;
    }

    if (marketItems[newName] && newName !== oldCategory) {
        alert("Tên danh mục này đã tồn tại!");
        return;
    }

    marketItems[newName] = marketItems[oldCategory];
    delete marketItems[oldCategory];
    currentCategory = newName;
    saveProductsToStorage();
    renderCategorySelector();
    renderProductTable(1); // Reset về trang 1
    alert(`Đã đổi tên "${oldCategory}" thành "${newName}"`);
});

//ẩn/hiện  danh mục
document.getElementById("toggle-category-btn").addEventListener("click", () => {
    const categoryName = categorySelect.value;
    if (!categoryName) {
        alert("Không có danh mục nào được chọn!");
        return;
    }
    const categoryData = marketItems[categoryName];
    if (!categoryData) {
        alert("Lỗi: Không tìm thấy dữ liệu danh mục.");
        return;
    }
    categoryData.hidden = !categoryData.hidden;
    saveProductsToStorage();
    renderCategorySelector();
    alert(`Đã ${categoryData.hidden ? 'ẩn' : 'hiện'} danh mục "${categoryName}"`);
});

const modal = document.getElementById("addform");
const addProductForm = document.getElementById("add-pr-frm");
const addProductBtn = document.querySelector(".add-product-bt");
const closePrModalBtn = document.getElementById("close-pr-frm-btn");

// Mở form thêm sản phẩm
function openModal() {
    addProductForm.reset();
    currentProductEditIndex = null; 
    document.getElementById("product-id").disabled = false;
    document.getElementById("product-id").value = "";
    modal.classList.add("visible");
    document.getElementById("product-form-title").textContent = "Thêm sản phẩm mới";
    document.getElementById("product-submit-btn").textContent = "Thêm sản phẩm";
}

// SỬA: Mở form sửa sản phẩm (tìm index gốc)
function openEditModal(pageIndex) {
    // Lấy theo từ khóa đang gõ
    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase() : "";
    //Lọc dựa trên từ khóa hoặc id
    const filteredItems = (marketItems[currentCategory]?.items || []).filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        String(item.id).toLowerCase().includes(searchTerm)
    );
    
    // Lấy item được click dựa trên (trang * số item) + index trên trang
    const start = (productCurrentPage - 1) * ITEMS_PER_PAGE;
    const itemOnPage = filteredItems[start + pageIndex]; 
    
    if (!itemOnPage) {
        alert("Lỗi: Không tìm thấy sản phẩm!");
        return;
    }

    // Tìm index gốc của item đó trong mảng dữ liệu chính
    const originalIndex = marketItems[currentCategory].items.findIndex(i => i.id === itemOnPage.id);
    
    if (originalIndex === -1) {
        alert("Lỗi: Không tìm thấy sản phẩm gốc!");
        return;
    }
    
    // Lấy dữ liệu gốc và điền vào form
    const item = marketItems[currentCategory].items[originalIndex];
    
    document.getElementById("product-id").value = item.id;
    document.getElementById("product-id").disabled = true;
    document.getElementById("product-name").value = item.name;
    document.getElementById("product-price").value = item.price; 
    document.getElementById("product-image").value = item.image;
    document.getElementById("product-description").value = item.description || ""; 
    document.getElementById("product-quantity").value = item.quantity || 0;
    document.getElementById("product-release-year").value = item.releaseYear || 2000;

    currentProductEditIndex = originalIndex; // LƯU INDEX GỐC
    modal.classList.add("visible");
    
    document.getElementById("product-form-title").textContent = "Chỉnh sửa sản phẩm";
    document.getElementById("product-submit-btn").textContent = "Lưu thay đổi";
}
// Đóng form
function closeModal() {
    modal.classList.remove("visible");
}

// Xử lý sự kiện đóng/mở form sản phẩm
addProductBtn.addEventListener("click", openModal);
closePrModalBtn.addEventListener("click", closeModal);

//đóng form khi click vào nền ( thẻ div có class là addform)
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// Xử lý sự kiện khi nộp form sản phẩm
addProductForm.addEventListener("submit", (e) => {
    e.preventDefault(); 
    
    const id=document.getElementById("product-id").value.trim();
    const name = document.getElementById("product-name").value;
    const priceValue = parseFloat(document.getElementById("product-price").value) || 0;
    const price =priceValue; 
    const image = document.getElementById("product-image").value;
    const description = document.getElementById("product-description").value;
    const quantity = parseInt(document.getElementById("product-quantity").value) || 0;
    const releaseYear = parseInt(document.getElementById("product-release-year").value) || new Date().getFullYear();

    const newItem = {
        name,
        price,
        image,
        active: true, 
        description,
        quantity,
        releaseYear
    };

    if (currentProductEditIndex !== null) {
        const oldItem = marketItems[currentCategory].items[currentProductEditIndex];
        newItem.id=oldItem.id;
        newItem.active = oldItem.active; 
        newItem.cost_price = oldItem.cost_price || 0;
        
        marketItems[currentCategory].items[currentProductEditIndex] = newItem;
    } else {
        if (!id) {
            alert("Vui lòng nhập ID sản phẩm!");
            return;
        }
        const idExists = Object.values(marketItems).some(cat => 
            cat.items.some(item => String(item.id).trim() === id)
        );
        
        if (idExists) {
            alert("Lỗi: ID sản phẩm này đã tồn tại!");
            return;
        }
        
        newItem.id = id; 
        newItem.cost_price = 0;
        marketItems[currentCategory].items.push(newItem);
    }

    saveProductsToStorage();
    renderProductTable(1); // Render lại trang hiện tại
    closeModal();
});


// Phân trang
function renderPagination(containerId, totalItems, currentPage, itemsPerPage, clickHandler) {
    const paginationContainer = document.getElementById(containerId);
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return; // Không cần phân trang nếu chỉ có 1 trang


    const createButton = (text, page, isDisabled = false, isActive = false) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.disabled = isDisabled;
        if (isActive) {
            btn.classList.add("active");
        }
        btn.addEventListener("click", () => {
            if (!isDisabled && !isActive) {
                clickHandler(page);
            }
        });
        return btn;
    };

    const createEllipsis = () => {
        const span = document.createElement("span");
        span.textContent = "...";
        span.classList.add("pagination-ellipsis"); 
        return span;
    };


    // Nút "First"
    paginationContainer.appendChild(createButton("First", 1, currentPage === 1));

    // Nút "Previous"
    paginationContainer.appendChild(createButton("Previous", currentPage - 1, currentPage === 1));

    // Các nút số trang
    const siblingCount = 1; 
    const pagesToShow = new Set();

    // Luôn thêm trang 1 và trang cuối
    pagesToShow.add(1);
    pagesToShow.add(totalPages);

    // Thêm trang hiện tại và các trang liền kề
    for (let i = -siblingCount; i <= siblingCount; i++) {
        const page = currentPage + i;
        if (page > 0 && page <= totalPages) {
            pagesToShow.add(page);
        }
    }

    // Chuyển Set thành Array và sắp xếp
    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);

    // Thêm nút và dấu "..."
    let lastPage = 0;
    for (const page of sortedPages) {
        if (lastPage !== 0 && page - lastPage > 1) {
            paginationContainer.appendChild(createEllipsis());
        }
        paginationContainer.appendChild(createButton(page, page, false, page === currentPage));
        lastPage = page;
    }

    //  Nút "Next"
    paginationContainer.appendChild(createButton("Next", currentPage + 1, currentPage === totalPages));

    //  Nút "Last"
    paginationContainer.appendChild(createButton("Last", totalPages, currentPage === totalPages));
}



// Render bảng sản phẩm 
function renderProductTable(page = 1) {
    productCurrentPage = page; // Cập nhật trang hiện tại

    const tbody = document.querySelector(".product-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase() : "";

    //  Lọc
    const filteredItems = (marketItems[currentCategory]?.items || []).filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        String(item.id).toLowerCase().includes(searchTerm)
    );

    //  Tính toán trang
    const totalItems = filteredItems.length;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToRender = filteredItems.slice(start, end);

    //  Render
    if (itemsToRender.length === 0 && page === 1) { // Chỉ hiển thị "Không tìm thấy" nếu là trang 1
        tbody.innerHTML = '<tr><td colspan="6">Không tìm thấy sản phẩm.</td></tr>';
    } else {
        itemsToRender.forEach((item, index) => { // 'index' ở đây là 0 -> 9
            const displayPrice = formatK(item.price);
            const tr = document.createElement("tr");
            tr.dataset.itemId = item.id;
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${displayPrice}</td> 
                
                <td class="${item.quantity < 20 ? 'low-stock-cell' : ''}">${item.quantity}</td> 
                
                <td><img src="${item.image}" alt="Product" class="item-image"></td>
                <td>
                    <button class="edit-btn" title="Edit" data-index="${index}"> 
                        <svg width="18px" height="18px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 0L16 3L9 10H6V7L13 0Z" fill="#000000"></path>
                            <path d="M1 1V15H15V9H13V13H3V3H7V1H1Z" fill="#000000"></path>
                        </svg>
                    </button>
                    <button class="delete-btn" title="Delete" data-id="${item.id}"> <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M6 7H18V18C18 19.66 16.66 21 15 21H9C7.34 21 6 19.66 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                    <button class="hidden-btn ${item.active ? 'on' : 'off'}" data-id="${item.id}"> ${item.active ? '<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.3307 7.16929C13.5873 7.05887 12.806 7 12 7C7.02944 7 3 9.23858 3 12C3 13.4401 4.09589 14.738 5.84963 15.6504L8.21192 13.2881C8.07452 12.8839 8 12.4506 8 12C8 9.79086 9.79086 8 12 8C12.4506 8 12.8839 8.07452 13.2881 8.21192L14.3307 7.16929Z" fill="#000000"></path> <path d="M11.2308 15.9261C11.4797 15.9746 11.7369 16 12 16C14.2091 16 16 14.2091 16 12C16 11.7369 15.9746 11.4797 15.9261 11.2308L18.5726 8.58427C20.0782 9.47809 21 10.6792 21 12C21 14.7614 16.9706 17 12 17C11.4016 17 10.8169 16.9676 10.2512 16.9057L11.2308 15.9261Z" fill="#000000"></path> <path d="M17.7929 5.20711C18.1834 4.81658 18.8166 4.81658 19.2071 5.20711C19.5976 5.59763 19.5976 6.2308 19.2071 6.62132L6.47919 19.3492C6.08866 19.7398 5.4555 19.7398 5.06497 19.3492C4.67445 18.9587 4.67445 18.3256 5.06497 17.935L17.7929 5.20711Z" fill="#000000"></path> </g></svg>':'<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z" stroke="#1C274C" stroke-width="1.5"></path> <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#1C274C" stroke-width="1.5"></path> </g></svg>'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    //  Render thanh phân trang
    renderPagination("product-pagination", totalItems, page, ITEMS_PER_PAGE, (newPage) => {
        renderProductTable(newPage);
    });
}

// Xử lý sự kiện cho các nút
document.querySelector(".product-table tbody").addEventListener("click",(e)=>{
    // Nút Sửa (dùng data-index)
    const editBtn = e.target.closest("button.edit-btn");
    if (editBtn) {
        const pageIndex = parseInt(editBtn.dataset.index); // Lấy index của trang (0-9)
        openEditModal(pageIndex); // Hàm openEditModal đã được sửa
        return;
    }

    // Các nút khác (dùng data-id)
    const btn = e.target.closest("button[data-id]");
    if(!btn) return;

    const id = btn.dataset.id;
    if (!marketItems[currentCategory]) return;

    // Tìm index GỐC
    const originalIndex = marketItems[currentCategory].items.findIndex(item => String(item.id) === id);
    if(originalIndex === -1) return;

    if (btn.classList.contains("delete-btn")) {
        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            marketItems[currentCategory].items.splice(originalIndex, 1);
            saveProductsToStorage();
            
            // Logic kiểm tra trang
            const totalItems = (marketItems[currentCategory]?.items || []).filter(item => 
                item.name.toLowerCase().includes(productSearchInput.value.toLowerCase()) ||
                item.id.toLowerCase().includes(productSearchInput.value.toLowerCase())
            ).length;
            const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
            let newPage = productCurrentPage;
            if (newPage > totalPages && totalPages > 0) {
                newPage = totalPages;
            } else if (totalPages === 0) {
                newPage = 1;
            }
            renderProductTable(newPage);
        }
        return;
    }

    if (btn.classList.contains("hidden-btn")) {
        const product = marketItems[currentCategory].items[originalIndex];
        product.active = !product.active;
        saveProductsToStorage();
        renderProductTable(productCurrentPage); // Render lại trang hiện tại
        return;
    }
});


// Quản lý tài khoản
function saveAccountsToStorage() {
    const dataString = JSON.stringify(accountsList);
    localStorage.setItem("users", dataString);
}
//tài khoản mặc định
function generateDefaultUsers(count) {
    const defaultUsers = [];
    // Thêm tài khoản user mặc định ban đầu
    defaultUsers.push({ 
        username: "user", 
        password: "123456", 
        email: "user@gmail.com", 
        active: true,
        name: "Người dùng Mặc Định",
        address: "456 Đường Demo, Quận 1, TP.HCM"
    });
    
    // Tạo 20 tài khoản testuser1 đến testuser20
    for (let i = 1; i <= count; i++) {
        defaultUsers.push({
            username: `testuser${i}`,
            password: "123456",
            email: `testuser${i}@unishelf.com`,
            active: true,
            name: `Khách hàng ${i}`,
            address: `123 Đường Thử Nghiệm, Quận ${Math.ceil(i/5)}, TP.HCM`
        });
    }
    return defaultUsers;
}

// tài khoản mặc định
const accountsList = JSON.parse(localStorage.getItem("users")) || generateDefaultUsers(20);
let currentAccountEditIndex = null; 
const accModal = document.getElementById("AccountForm");
const AccountForm = document.getElementById("acc-frm");
const closeAccModalBtn = document.getElementById("close-acc-frm-btn");
const addAccountBtn = document.getElementById("add-account-btn");
const accFormTitle = document.getElementById("account-form-title");
const accSubmitBtn = document.getElementById("account-submit-btn");
const accPasswordField = document.getElementById("account-password");


// Mở form thêm Tài khoản
function openAddAccountModal() {
    AccountForm.reset();
    currentAccountEditIndex = null;
    accFormTitle.textContent = "Thêm tài khoản mới";
    accSubmitBtn.textContent = "Thêm tài khoản";
    accPasswordField.placeholder = "Nhập mật khẩu (bắt buộc)";
    accPasswordField.required = true;
    accModal.classList.add("visible");
}
// Mở form sửa tài khoản
function openEditAccountModal(index) {
    const account =  accountsList[index]; 
    if (!account) return;
    currentAccountEditIndex = index;
    AccountForm.reset();
    document.getElementById("account-username").value = account.username;
    document.getElementById("account-email").value = account.email;
    accPasswordField.placeholder = "Nhập mật khẩu mới (để trống nếu giữ nguyên)";
    accPasswordField.required = false;
    accFormTitle.textContent = "Chỉnh sửa tài khoản";
    accSubmitBtn.textContent = "Lưu thay đổi";
    accModal.classList.add("visible");
}
// Đóng form
function closeAccountModal() {
    accModal.classList.remove("visible");
}
closeAccModalBtn.addEventListener("click", closeAccountModal);
if (addAccountBtn) {
    addAccountBtn.addEventListener("click", openAddAccountModal);
}
accModal.addEventListener("click", (e) => {
    if (e.target === accModal) {
        closeAccountModal();
    }
});
// Xử lý sự kiện nộp form tài khoản
AccountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("account-username").value;
    const password = document.getElementById("account-password").value;
    const email = document.getElementById("account-email").value;
    if (currentAccountEditIndex !== null) { 
        const account = accountsList[currentAccountEditIndex];
        account.username = username;
        account.email = email;
        if (password) {
            account.password = password;
        }
    } else { 
        if (!username || !password) {
            alert("Vui lòng nhập Username và Password.");
            return;
        }
        if (accountsList.some(u => u.username === username)) {
            alert("Username này đã tồn tại!");
            return;
        }
        const newAccount = { username, password, email, active: true };
        accountsList.push(newAccount);
    }
    saveAccountsToStorage();
    renderAccountsTable(accountCurrentPage); // Render lại trang hiện tại
    closeAccountModal();
    currentAccountEditIndex = null;
});


// Render bảng tài khoản 
function renderAccountsTable(page = 1) {
    accountCurrentPage = page; 

    const tbody = document.querySelector(".accounts-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchTerm = accountSearchInput ? accountSearchInput.value.toLowerCase() : "";

    //  Lọc
    const filteredList = accountsList.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        (user.email && user.email.toLowerCase().includes(searchTerm))
    );

    //  Tính toán trang
    const totalItems = filteredList.length;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToRender = filteredList.slice(start, end);


    //  Render
    if (itemsToRender.length === 0 && page === 1) {
        tbody.innerHTML = '<tr><td colspan="5">Không tìm thấy tài khoản.</td></tr>';
    } else {
        let id = start + 1; // Số thứ tự bắt đầu đúng
        itemsToRender.forEach((user) => {
            // Lấy index GỐC (quan trọng cho Sửa/Xóa)
            const originalIndex = accountsList.findIndex(u => u.username === user.username);
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${id++}</td>
                <td>${user.username}</td>
                <td>${user.email || 'N/A'}</td>
                
                <td style="color: ${user.active ? '#90EE90' : '#FFD700'}; font-weight: bold;">
                    ${user.active ? "Mở" : "Khóa"}
                </td>

                <td>
                    <button class="reset-btn" title="Reset" data-index="${originalIndex}">
                        <svg fill="#000000" width="18px" height="18px" viewBox="0 0 512.00 512.00" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M64,256H34A222,222,0,0,1,430,118.15V85h30V190H355V160h67.27A192.21,192.21,0,0,0,256,64C150.13,64,64,150.13,64,256Zm384,0c0,105.87-86.13,192-192,192A192.21,192.21,0,0,1,89.73,352H157V322H52V427H82V393.85A222,222,0,0,0,478,256Z"></path></g></svg>
                    </button>
                    <button class="status-btn ${user.active ? 'on' : 'off'}" data-index="${originalIndex}">
                        ${user.active ? '<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>' : '<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.584 6C15.8124 4.2341 14.0503 3 12 3C9.23858 3 7 5.23858 7 8V10.0288M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C16.8802 10 17.7202 10 18.362 10.327C18.9265 10.6146 19.3854 11.0735 19.673 11.638C20 12.2798 20 13.1198 20 14.8V16.2C20 17.8802 20 18.7202 19.673 19.362C19.3854 19.9265 18.9265 20.3854 18.362 20.673C17.7202 21 16.8802 21 15.2 21H8.8C7.11984 21 6.27976 21 5.63803 20.673C5.07354 20.3854 4.6146 19.9265 4.32698 19.362C4 18.7202 4 17.8802 4 16.2V14.8C4 13.1198 4 12.2798 4.32698 11.638C4.6146 11.0735 5.07354 10.6146 5.63803 10.327C5.99429 10.1455 6.41168 10.0647 7 10.0288Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'}
                    </button>
                    <button class="edit-btn" title="Edit" data-index="${originalIndex}"> 
                        <svg width="18px" height="18px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 0L16 3L9 10H6V7L13 0Z" fill="#000000"></path>
                            <path d="M1 1V15H15V9H13V13H3V3H7V1H1Z" fill="#000000"></path>
                        </svg>
                    </button>
                    <button class="delete-btn" title="Delete" data-index="${originalIndex}">
                        <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M6 7H18V18C18 19.66 16.66 21 15 21H9C7.34 21 6 19.66 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    //  Render thanh phân trang
    renderPagination("account-pagination", totalItems, page, ITEMS_PER_PAGE, (newPage) => {
        renderAccountsTable(newPage);
    });
}

// HÀM LISTENER CHO BẢNG TÀI KHOẢN 
document.querySelector(".accounts-table tbody").addEventListener("click", (e) => {
    
    const getIndex = (target, className) => {
        const btn = e.target.closest(className);
        return btn ? btn.dataset.index : null;
    };
    let index; 

    index = getIndex(e.target, ".edit-btn");
    if (index !== null) {
        openEditAccountModal(index); 
        return;
    }

    index = getIndex(e.target, ".delete-btn");
    if (index !== null) {
        const account = accountsList[index];
        if (!account) return;

        if (account.username === "admin") {
            alert("Bạn không thể xóa tài khoản 'admin' mặc định!");
            return;
        }
        if (confirm(`Bạn có chắc muốn xóa tài khoản '${account.username}'?`)) {
            accountsList.splice(index, 1);
            saveAccountsToStorage();
            
            // Logic kiểm tra trang
            const totalItems = accountsList.filter(user => 
                user.username.toLowerCase().includes(accountSearchInput.value.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(accountSearchInput.value.toLowerCase()))
            ).length;
            const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
            let newPage = accountCurrentPage;
            if (newPage > totalPages && totalPages > 0) {
                newPage = totalPages;
            } else if (totalPages === 0) {
                newPage = 1;
            }
            renderAccountsTable(newPage);
        }
        return;
    }

    index = getIndex(e.target, ".reset-btn");
    if (index !== null) {
        const user = accountsList[index];
        if (user) {
            user.password = "123456";
            alert(`Đã reset mật khẩu của tài khoản "${user.username}" về 123456`);
            saveAccountsToStorage();
        }
        return;
    }

    index = getIndex(e.target, ".status-btn");
    if (index !== null) {
        const user = accountsList[index];
        if (user) {
            user.active = !user.active; 
            saveAccountsToStorage();
            renderAccountsTable(accountCurrentPage); // Render lại trang hiện tại
        }
        return;
    }
});

// PHIẾU NHẬP HÀNG 
const importModal = document.getElementById("importForm");
const importForm = document.getElementById("import-frm");
const addImportSlipBtn = document.getElementById("add-import-btn");
const closeImportModalBtn = document.getElementById("close-import-frm-btn");
const importFormTitle = document.getElementById("import-form-title");
const saveImportSlipBtn = document.getElementById("save-import-slip-btn");
const importDateEl = document.getElementById("import-date");
const importProductSelectEl = document.getElementById("import-product-select");
const importProductSearchEl = document.getElementById("import-product-search"); // THÊM MỚI
const importQtyEl = document.getElementById("import-product-quantity");
const importPriceEl = document.getElementById("import-product-price");
const addProductToSlipBtn = document.getElementById("add-product-to-slip-btn");
const slipProductsTbody = document.getElementById("slip-products-tbody");
const importsTableBody = document.querySelector(".imports-table tbody");
const viewModal = document.getElementById("viewImportModal");
const viewModalTitle = document.getElementById("view-imp-title");
const viewModalDetails = document.getElementById("view-slip-details");
const viewModalTbody = document.getElementById("view-slip-products-tbody");
const closeViewModalBtnFooter = document.getElementById("close-view-slip-btn-footer");

let importSlips = [];
let currentSlipProducts = [];
let currentEditSlipId = null;

function getNextImportId() {
    if (importSlips.length === 0) return 1;
    const allIds = importSlips.map(slip => parseInt(slip.id) || 0);
    const maxId = Math.max(...allIds);
    return maxId + 1;
}
//load, lưu phiếu
function loadImportsFromStorage() {
    const dataString = localStorage.getItem("adminImports");
    return dataString ? JSON.parse(dataString) : [];
}
function saveImportsToStorage() {
    localStorage.setItem("adminImports", JSON.stringify(importSlips));
}
function renderCurrentSlipProducts() {
    if (!slipProductsTbody) return;
    slipProductsTbody.innerHTML = "";
    if (currentSlipProducts.length === 0) {
        slipProductsTbody.innerHTML = '<tr><td colspan="4">Chưa có sản phẩm</td></tr>';
        return;
    }
    currentSlipProducts.forEach((product, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${formatK(product.importPrice)}</td>
            <td><button type="button" class="slip-delete-product-btn" data-index="${index}">X</button></td>
        `;
        slipProductsTbody.appendChild(tr);
    });
}
if (slipProductsTbody) {
    slipProductsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('slip-delete-product-btn')) {
            const index = parseInt(e.target.dataset.index);
            currentSlipProducts.splice(index, 1);
            renderCurrentSlipProducts();
        }
    });
}

// Render bảng chính (danh sách các phiếu nhập) 
function renderImportsTable(page = 1) {
    importCurrentPage = page; // Cập nhật trang

    if (!importsTableBody) return;
    importsTableBody.innerHTML = "";

    const searchTerm = importSearchInput ? importSearchInput.value.toLowerCase() : "";

    //  Lọc
    const filteredSlips = importSlips.filter(slip => {
        const productNamesString = slip.products.map(p => p.name).join(', ').toLowerCase();
        
        return (
            slip.id.toString().includes(searchTerm) ||
            slip.importDate.includes(searchTerm) ||
            productNamesString.includes(searchTerm)
        );
    });
    
    //  Tính toán trang
    const totalItems = filteredSlips.length;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const slipsToRender = filteredSlips.slice(start, end);

    //  Render
    if (slipsToRender.length === 0 && page === 1) {
        importsTableBody.innerHTML = '<tr><td colspan="6">Không tìm thấy phiếu nhập.</td></tr>';
    } else {
        slipsToRender.forEach(slip => {
            const tr = document.createElement("tr");
            const isCompleted = slip.status === 'completed';
            const productNamesString = slip.products.map(p => p.name).join(', ');
            const totalProducts = slip.products.reduce((sum, p) => sum + p.quantity, 0);

            tr.innerHTML = `
                <td>${slip.id}</td>
                <td>${slip.importDate}</td>
                <td style="color: ${isCompleted ? '#90EE90' : '#FFD700'}; font-weight: bold;">
                    ${isCompleted ? 'Đã hoàn thành' : 'Đang xử lý'}
                </td>
                <td>${productNamesString}</td>
                <td>${totalProducts}</td>
                <td>
                    <button class="view-btn import-view-btn" data-id="${slip.id}" title="Xem chi tiết">Xem</button>
                    <button class="edit-btn import-edit-btn" data-id="${slip.id}" ${isCompleted ? 'disabled' : ''} title="Sửa phiếu">Sửa</button>
                    <button class="complete-btn import-complete-btn" data-id="${slip.id}" ${isCompleted ? 'disabled' : ''} title="Hoàn thành phiếu">Hoàn thành</button>
                </td>
            `;
            importsTableBody.appendChild(tr);
        });
    }

    //  Render thanh phân trang
    renderPagination("import-pagination", totalItems, page, ITEMS_PER_PAGE, (newPage) => {
        renderImportsTable(newPage);
    });
}

// Hàm này render danh sách sản phẩm, chấp nhận một từ khóa tìm kiếm
function populateProductSelect(searchTerm = "") {
    if (!importProductSelectEl) return;
    
    importProductSelectEl.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
    const lowerSearchTerm = searchTerm.toLowerCase();

    Object.keys(marketItems).forEach(categoryName => {
        const categoryData = marketItems[categoryName];
        if (categoryData && categoryData.items) {
            
            // Lọc các sản phẩm dựa trên searchTerm
            const filteredItems = categoryData.items.filter(item => 
                item.name.toLowerCase().includes(lowerSearchTerm)
            );

            // Chỉ tạo optgroup nếu có sản phẩm sau khi lọc
            if (filteredItems.length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = categoryName;

                filteredItems.forEach(item => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({ name: item.name, category: categoryName });
                    option.textContent = item.name;
                    optgroup.appendChild(option);
                });
                importProductSelectEl.appendChild(optgroup);
            }
        }
    });
}

function openAddImportModal() {
    importForm.reset();
    currentSlipProducts = [];
    currentEditSlipId = null;
    importFormTitle.textContent = "Thêm Phiếu Nhập Hàng";
    saveImportSlipBtn.textContent = "Lưu Phiếu Mới";
    importDateEl.disabled = false;
    
    if (importProductSearchEl) importProductSearchEl.value = ""; //  Reset ô tìm kiếm
    populateProductSelect(""); //  Hiển thị tất cả sản phẩm
    
    renderCurrentSlipProducts();
    importModal.classList.add("visible");
}
function openEditImportModal(slipId) {
    const slip = importSlips.find(s => s.id === slipId);
    if (!slip) return;
    if (slip.status === 'completed') {
        alert("Phiếu đã hoàn thành, không thể sửa.");
        return;
    }
    importForm.reset();
    currentEditSlipId = slipId;
    currentSlipProducts = JSON.parse(JSON.stringify(slip.products)); 
    importFormTitle.textContent = "Sửa Phiếu Nhập Hàng";
    saveImportSlipBtn.textContent = "Lưu Thay Đổi";
    importDateEl.value = slip.importDate;
    importDateEl.disabled = false;
    
    if (importProductSearchEl) importProductSearchEl.value = ""; //   Reset ô tìm kiếm
    populateProductSelect(""); //   Hiển thị tất cả sản phẩm
    
    renderCurrentSlipProducts();
    importModal.classList.add("visible");
}
function closeImportModal() {
    if (importModal) importModal.classList.remove("visible");
}
function openViewImportModal(slipId) {
    const slip = importSlips.find(s => s.id === slipId);
    if (!slip) {
        alert("Không tìm thấy phiếu nhập!");
        return;
    }
    viewModalTitle.textContent = `Chi tiết Phiếu Nhập #${slip.id}`;
    viewModalDetails.innerHTML = `
        <p><strong>Ngày nhập:</strong> ${slip.importDate}</p>
        <p><strong>Trạng thái:</strong> ${slip.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}</p>
    `;
    viewModalTbody.innerHTML = "";
    if (slip.products.length === 0) {
        viewModalTbody.innerHTML = '<tr><td colspan="4">Phiếu này không có sản phẩm.</td></tr>';
    } else {
        slip.products.forEach(product => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>${product.importPrice}</td>
            `;
            viewModalTbody.appendChild(tr);
        });
    }
    if (viewModal) viewModal.classList.add("visible");
}
function closeViewImportModal() {
    if (viewModal) viewModal.classList.remove("visible");
}
if (closeViewModalBtnFooter) closeViewModalBtnFooter.addEventListener("click", closeViewImportModal);
if (viewModal) {
    viewModal.addEventListener("click", (e) => {
        if (e.target === viewModal) {
            closeViewImportModal();
        }
    });
}
if (importModal) {
    importModal.addEventListener("click", (e) => {
        if (e.target === importModal) {
            closeImportModal();
        }
    });
}
if (addImportSlipBtn) addImportSlipBtn.addEventListener("click", openAddImportModal);
if (closeImportModalBtn) closeImportModalBtn.addEventListener("click", closeImportModal);
if (addProductToSlipBtn) {
    addProductToSlipBtn.addEventListener("click", () => {
        const rawProductData = importProductSelectEl.value;
        const quantity = parseInt(importQtyEl.value);
        const importPrice = parseFloat(importPriceEl.value);
        if (!rawProductData || quantity <= 0 || importPrice < 0) {
            alert("Vui lòng chọn sản phẩm, nhập số lượng và giá nhập hợp lệ.");
            return;
        }
        const productData = JSON.parse(rawProductData);
        const existingProduct = currentSlipProducts.find(p => p.name === productData.name && p.category === productData.category);
        if (existingProduct) {
            existingProduct.quantity = quantity;
            existingProduct.importPrice = importPrice;
            alert(`Đã cập nhật "${productData.name}"`);
        } else {
            currentSlipProducts.push({
                category: productData.category,
                name: productData.name,
                quantity: quantity,
                importPrice: importPrice
            });
        }
        renderCurrentSlipProducts();
        importProductSelectEl.value = "";
        importQtyEl.value = 1;
        importPriceEl.value = 0;
    });
}
if (importForm) {
    importForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const importDate = importDateEl.value;
        if (!importDate || currentSlipProducts.length === 0) {
            alert("Ngày nhập và ít nhất 1 sản phẩm là bắt buộc.");
            return;
        }
        if (currentEditSlipId) {
            const slipIndex = importSlips.findIndex(s => s.id === currentEditSlipId);
            if (slipIndex > -1) {
                importSlips[slipIndex].importDate = importDate;
                importSlips[slipIndex].products = currentSlipProducts;
            }
        } else {
            const newSlip = {
                id: getNextImportId(),
                importDate: importDate,
                status: "processing",
                products: currentSlipProducts
            };
            importSlips.push(newSlip);
        }
        saveImportsToStorage();
        renderImportsTable(1); // Reset về trang 1
        closeImportModal();
    });
}

//  Lắng nghe sự kiện gõ phím trên ô tìm kiếm sản phẩm
if (importProductSearchEl) {
    importProductSearchEl.addEventListener('input', (e) => {
        populateProductSelect(e.target.value);
    });
}

if (importsTableBody) {
    importsTableBody.addEventListener("click", (e) => {
        const viewBtn = e.target.closest(".import-view-btn");
        if (viewBtn) {
            openViewImportModal(parseInt(viewBtn.dataset.id));
            return; 
        }
        const editBtn = e.target.closest(".import-edit-btn");
        if (editBtn) {
            openEditImportModal(parseInt(editBtn.dataset.id));
            return;
        }
        const completeBtn = e.target.closest(".import-complete-btn");
        if (completeBtn) {
            const slipId = parseInt(completeBtn.dataset.id);
            if (confirm(`Bạn có chắc muốn hoàn thành phiếu nhập "${slipId}"? \n\nSỐ LƯỢNG SẼ ĐƯỢC CẬP NHẬT VÀO KHO.`)) {
                const slipIndex = importSlips.findIndex(s => s.id === slipId);
                if (slipIndex > -1) {
                    const slip = importSlips[slipIndex];
                    let allProductsFound = true;
                    slip.products.forEach(slipProduct => {
                        if (marketItems[slipProduct.category] && marketItems[slipProduct.category].items) {
                            const productInStock = marketItems[slipProduct.category].items.find(
                                item => item.name === slipProduct.name
                            );
                            if (productInStock) {
                                    const old_qty = parseInt(productInStock.quantity) || 0;
                                    const old_cost = parseFloat(productInStock.cost_price) || 0; 
                                    const old_total_value = old_qty * old_cost;
                                    const new_qty = parseInt(slipProduct.quantity) || 0;
                                    const new_cost = parseFloat(slipProduct.importPrice) || 0;
                                    const new_total_value = new_qty * new_cost;
                                    const total_qty = old_qty + new_qty;
                                    const total_value = old_total_value + new_total_value;
                                    const new_avg_cost = (total_qty > 0) ? (total_value / total_qty) : 0;
                                    productInStock.quantity = total_qty;
                                    productInStock.cost_price = new_avg_cost; 
                            } else {
                                alert(`Lỗi: Không tìm thấy sản phẩm "${slipProduct.name}"...`);
                                allProductsFound = false;
                            }
                        } else {
                            alert(`Lỗi: Danh mục "${slipProduct.category}" không tồn tại.`);
                            allProductsFound = false;
                        }
                    });
                    if (!allProductsFound) {
                        alert("Hoàn thành phiếu thất bại. Vui lòng kiểm tra lại sản phẩm trong phiếu.");
                        return;
                    }
                    saveProductsToStorage();
                    slip.status = "completed";
                    saveImportsToStorage();
                    renderImportsTable(importCurrentPage); // Render lại trang hiện tại
                    renderProductTable(1); // Render lại bảng sản phẩm (có thể ở tab khác)
                    alert(`Đã hoàn thành phiếu ${slipId} và cập nhật số lượng vào kho.`);
                }
            }
            return;
        }
    });
}
importSlips = loadImportsFromStorage();



// PRICE CONTROL  


const priceCategorySelect = document.getElementById("price-category-select");
const priceTableBody = document.querySelector(".price-table tbody");
let currentPriceCategory = Object.keys(marketItems)[0] || null;

// Render danh mục cho tab Giá
function renderPriceCategorySelector() {
    if (!priceCategorySelect) return; 
    priceCategorySelect.innerHTML = "";
    Object.keys(marketItems).forEach(categoryName => {
        const categoryData = marketItems[categoryName];
        const option = document.createElement("option");
        option.value = categoryName;
        option.textContent = categoryName + (categoryData.hidden ? " (Đang ẩn)" : "");
        if (categoryName === currentPriceCategory) {
            option.selected = true;
        }
        priceCategorySelect.appendChild(option);
    });
    if (!marketItems[currentPriceCategory]) {
        currentPriceCategory = Object.keys(marketItems)[0] || null;
    }
}

// Render bảng giá  
function renderPriceTable(page = 1) {
    priceCurrentPage = page; // Cập nhật trang

    if (!priceTableBody) return;
    priceTableBody.innerHTML = "";

    if (!currentPriceCategory || !marketItems[currentPriceCategory]) {
        priceTableBody.innerHTML = "<tr><td colspan='6'>Vui lòng chọn danh mục.</td></tr>";
        return;
    }

    const searchTerm = priceSearchInput ? priceSearchInput.value.toLowerCase() : "";

    //  Lọc
    const filteredItems = (marketItems[currentPriceCategory].items || []).filter(item =>
        item.name.toLowerCase().includes(searchTerm)
    );

    //  Tính toán trang
    const totalItems = filteredItems.length;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToRender = filteredItems.slice(start, end);

    //  Render
    if (itemsToRender.length === 0 && page === 1) {
        priceTableBody.innerHTML = "<tr><td colspan='6'>Không tìm thấy sản phẩm.</td></tr>";
    } else {
        let id = start + 1; // Số thứ tự bắt đầu đúng
        itemsToRender.forEach((item) => { 
            const originalIndex = marketItems[currentPriceCategory].items.findIndex(
                originalItem => originalItem.id === item.id
            );
            if (originalIndex === -1) return; 

            const cost_price = parseFloat(item.cost_price) || 0;
            const selling_price = parseFloat(item.price) || 0; 
            let profit_margin = 0;
            if (cost_price > 0) {
                profit_margin = ((selling_price - cost_price) / cost_price) * 100;
            }

            const tr = document.createElement("tr");
            tr.dataset.index = originalIndex; // DÙNG INDEX GỐC

            tr.innerHTML = `
                <td>${id++}</td>
                <td>${item.name}</td>
                <td class="cost-price-cell" data-cost="${cost_price}">${formatK(cost_price)}</td>
                <td><input type="text" class="profit-input" value="${profit_margin.toFixed(2)}">%</td>
                <td class="selling-price-cell">${formatK(selling_price)}</td>
                <td><button class="price-save-btn">Lưu</button></td>
            `;
            priceTableBody.appendChild(tr);
        });
    }

    //  Render thanh phân trang
    renderPagination("price-pagination", totalItems, page, ITEMS_PER_PAGE, (newPage) => {
        renderPriceTable(newPage);
    });
}
function handlePriceTableInput(e) {
    if (!e.target.classList.contains('profit-input')) return;
    
    const tr = e.target.closest('tr');
    const costPriceCell = tr.querySelector('.cost-price-cell');
    const sellingPriceCell = tr.querySelector('.selling-price-cell');
    
    // Lấy giá gốc từ data-cost (chính xác hơn lấy text)
    const cost_price = parseFloat(costPriceCell.dataset.cost) || 0;
    const new_margin_percent = parseFloat(e.target.value) || 0;
    
    // Tính giá bán mới
    const new_selling_price = cost_price * (1 + new_margin_percent / 100);
    
    // Cập nhật hiển thị: Làm tròn + K
    sellingPriceCell.textContent = formatK(new_selling_price);
}
function handlePriceTableSave(e) {
    if (!e.target.classList.contains('price-save-btn')) return;
    const tr = e.target.closest('tr');
    const index = tr.dataset.index;
    if (!currentPriceCategory || !marketItems[currentPriceCategory] || !marketItems[currentPriceCategory].items[index]) {
        alert("Lỗi: Không tìm thấy sản phẩm!");
        return;
    }
    const newSellingPriceText = tr.querySelector('.selling-price-cell').textContent;
    const product = marketItems[currentPriceCategory].items[index];
    product.price = newSellingPriceText;
    saveProductsToStorage();
    renderProductTable(1); // Cập nhật lại bảng SP (tab khác)
    alert("Đã lưu thành công");
}
if (priceCategorySelect) {
    priceCategorySelect.addEventListener("change", (e) => {
        currentPriceCategory = e.target.value;
        renderPriceTable(1); // Reset về trang 1
    });
}
if (priceTableBody) {
    priceTableBody.addEventListener('input', handlePriceTableInput);
    priceTableBody.addEventListener('click', handlePriceTableSave);
}


 
// LOGIN, LOAD, VÀ LISTENERS  
 
function setupLogin() {
    const loginContainer = document.getElementById("login-container");
    const adminWrapper = document.getElementById("admin-wrapper");
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");
    const navLoginLink = document.getElementById("login-btn");
    const navLogoutBtn = document.getElementById("logout-btn");

    function updateUI(isLoggedIn) {
        if (isLoggedIn) {
            if (loginContainer) loginContainer.classList.add("hidden");
            if (adminWrapper) adminWrapper.classList.remove("hidden");
            if (navLoginLink) navLoginLink.style.display = "none";
            if (navLogoutBtn) navLogoutBtn.style.display = "list-item";
            
            // Render trang đầu tiên của tất cả các bảng
            setActiveTab("market"); // Đặt tab market làm mặc định
            
        } else {
            if (loginContainer) loginContainer.classList.remove("hidden");
            if (adminWrapper) adminWrapper.classList.add("hidden");
            if (navLoginLink) navLoginLink.style.display = "list-item";
            if (navLogoutBtn) navLogoutBtn.style.display = "none";
        }
    }
   
    const isAdmin = (localStorage.getItem("isAdmin") === "true");
    updateUI(isAdmin);

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            // Đăng nhập demo
            if (username === "admin" && password === "secret123") {
                localStorage.setItem("isAdmin", "true");
                updateUI(true);
            } else {
                if (loginMessage) {
                    loginMessage.textContent = "Sai tên đăng nhập hoặc mật khẩu!";
                }
            }
        });
    }

    if (navLogoutBtn) {
        navLogoutBtn.addEventListener("click", () => {
            localStorage.removeItem("isAdmin");
            updateUI(false); 
        });
    }
}

setupLogin();

// Xử lý sự kiện cho các ô tìm kiếm
if (productSearchInput) {
    productSearchInput.addEventListener("input", () => {
        renderProductTable(1);
    });
}
if (accountSearchInput) {
    accountSearchInput.addEventListener("input", () => {
        renderAccountsTable(1);
    });
}
if (priceSearchInput) {
    priceSearchInput.addEventListener("input", () => {
        renderPriceTable(1);
    });
}
if (importSearchInput) {
    importSearchInput.addEventListener("input", () => {
        renderImportsTable(1);
    });
}
if (orderFilterStatus) { 
    orderFilterStatus.addEventListener("change", () => {
        renderOrdersTable(1);
    });
}
// ===== ORDER MANAGEMENT =====

function loadAllOrdersFromStorage() {
    const dataString = localStorage.getItem("all_orders");
    return dataString ? JSON.parse(dataString) : [];
}

// Hàm lưu tất cả đơn hàng
function saveAllOrdersToStorage(orders) {
    localStorage.setItem("all_orders", JSON.stringify(orders));
}

// Hàm helper để định dạng màu
function formatOrderStatus(status) {
    let className = 'status-pending';
    if (status === 'Đang giao') className = 'status-shipping';
    if (status === 'Đã giao') className = 'status-delivered';
    if (status === 'Đã hủy') className = 'status-cancelled';
    
    //dùng thẻ span với class để CSS có thể bắt được
    return `<span class="status-badge ${className}">${status}</span>`;
}

// Render bảng đơn hàng

function renderOrdersTable(page = 1) {
    orderCurrentPage = page;
    const allOrders = loadAllOrdersFromStorage();
    const tbody = document.querySelector(".orders-table tbody");

    // Header bảng (đảm bảo có cột Khóa đơn)
    const theadRow = document.querySelector(".orders-table thead tr");
    if (theadRow && !theadRow.innerHTML.includes('Khóa đơn')) {
        theadRow.innerHTML = `
            <th>ID Đơn hàng</th>
            <th>Ngày đặt</th>
            <th>Khách hàng</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th>Cập nhật trạng thái</th>
            <th>Hành động</th> 
        `;
    }

    if (!tbody) return;
    tbody.innerHTML = "";

    // === LẤY GIÁ TRỊ BỘ LỌC ===
    const filterStatus = document.getElementById("order-filter-status") ? document.getElementById("order-filter-status").value : "";
    const dateFromInput = document.getElementById("order-date-from");
    const dateToInput = document.getElementById("order-date-to");
    
    // Chuyển đổi ngày chọn về dạng timestamp (đầu ngày và cuối ngày)
    let fromDate = dateFromInput && dateFromInput.value ? new Date(dateFromInput.value).setHours(0,0,0,0) : null;
    let toDate = dateToInput && dateToInput.value ? new Date(dateToInput.value).setHours(23,59,59,999) : null;

    // === LOGIC LỌC ===
    const filteredOrders = allOrders.filter(order => {
        let isValid = true;

        // 1. Lọc theo trạng thái
        if (filterStatus !== "" && (order.status || 'Chờ xử lý') !== filterStatus) {
            isValid = false;
        }

        // 2. Lọc theo ngày (Nếu đơn hàng hợp lệ trạng thái thì mới kiểm tra ngày)
        if (isValid) {
            const orderDate = new Date(order.date).getTime(); // Chuyển ngày đặt hàng về timestamp
            
            if (fromDate && orderDate < fromDate) isValid = false;
            if (toDate && orderDate > toDate) isValid = false;
        }
        
        return isValid;
    });

    // === PHÂN TRANG & RENDER ===
    const totalItems = filteredOrders.length;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const ordersToRender = filteredOrders.slice(start, end);

    if (ordersToRender.length === 0 && page === 1) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</td></tr>`; 
    } else {
        ordersToRender.forEach(order => {
            const tr = document.createElement("tr");
            const user = order.user || { username: 'Guest', email: 'N/A', address: 'N/A' };
            const orderStatus = order.status || 'Chờ xử lý';
            const isLocked = order.isLocked === true; 
            const saveButton = isLocked 
                ? '<span style="color:red; font-weight:bold;"><i class="fas fa-lock"></i> Đã khóa</span>' 
                : `<button class="save-order-btn" data-id="${order.id}">Lưu & Khóa</button>`;
            
            // Format ngày giờ đẹp hơn
            const dateObj = new Date(order.date);
            const dateStr = dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

            tr.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>${dateStr}</td>
                <td>
                    <div>${user.username}</div>
                    <div>${user.email}</div>
                </td>
                <td>${user.address}</td>
                <td>${formatOrderStatus(orderStatus)}</td> 
                <td>${order.total}</td>
                <td style="text-align:center;">
                    <select class="order-status-select" data-id="${order.id}" ${isLocked ? 'disabled' : ''} style="padding: 4px; ${isLocked ? 'background:#eee; cursor:not-allowed;' : ''}">
                        <option value="Chờ xử lý" ${orderStatus === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
                        <option value="Đang giao" ${orderStatus === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                        <option value="Đã giao" ${orderStatus === 'Đã giao' ? 'selected' : ''}>Đã giao</option>
                        <option value="Đã hủy" ${orderStatus === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </td>
                <td>
                    <div style="display:flex; gap:5px; justify-content:center;">
                        ${saveButton}
                        <button class="view-order-btn" data-id="${order.id}" style="background:#007bff; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Xem</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderPagination("order-pagination", totalItems, page, ITEMS_PER_PAGE, (newPage) => {
        renderOrdersTable(newPage);
    });
}

const dateFromInput = document.getElementById("order-date-from");
const dateToInput = document.getElementById("order-date-to");
const clearFilterBtn = document.getElementById("clear-order-filter");

if (dateFromInput) {
    dateFromInput.addEventListener("change", () => renderOrdersTable(1));
}
if (dateToInput) {
    dateToInput.addEventListener("change", () => renderOrdersTable(1));
}

// Nút xóa bộ lọc
if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", () => {
        document.getElementById("order-filter-status").value = "";
        document.getElementById("order-date-from").value = "";
        document.getElementById("order-date-to").value = "";
        renderOrdersTable(1);
    });
}

// Mở Modal Xem Chi Tiết Đơn Hàng
function openViewOrderModal(orderId) {
    const allOrders = loadAllOrdersFromStorage();
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        alert("Không tìm thấy đơn hàng!");
        return;
    }

    const viewModal = document.getElementById("viewOrderModal");
    const titleEl = document.getElementById("view-order-title");
    const detailsEl = document.getElementById("view-order-details");
    const tbodyEl = document.getElementById("view-order-products-tbody");

    if (!viewModal || !titleEl || !detailsEl || !tbodyEl) {
        console.error("Không tìm thấy các thành phần của modal xem đơn hàng.");
        return;
    }

    const user = order.user || { username: 'Guest', email: 'N/A' };
    titleEl.textContent = `Chi tiết Đơn hàng #${order.id}`;
    detailsEl.innerHTML = `
        <p><strong>Ngày đặt:</strong> ${new Date(order.date).toLocaleString()}</p>
        <p><strong>Khách hàng:</strong> ${user.username} (${user.email})</p>
        <p><strong>Tổng tiền:</strong> <span>${order.total}</span></p>
    `;

    tbodyEl.innerHTML = "";
    (order.items || []).forEach(item => {
        const displayPrice = formatK(item.price);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity || 1}</td>
            <td>${displayPrice}</td>
        `;
        tbodyEl.appendChild(tr);
    });

    viewModal.classList.add("visible");
}
// Expose to global scope để gọi từ HTML
window.openViewOrderModal = openViewOrderModal;


// Đóng Modal Xem Chi Tiết Đơn Hàng
function closeViewOrderModal() {
    const viewModal = document.getElementById("viewOrderModal");
    if (viewModal) viewModal.classList.remove("visible");
}

// Gắn sự kiện cho modal mới
document.addEventListener('click', (e) => {

    // Nút đóng modal
    if (e.target.classList.contains('closef') || e.target.closest('.closef')) {
        closeViewOrderModal();
        return;
    }

    // Bấm ra ngoài để đóng modal
    const viewModal = document.getElementById("viewOrderModal");
    if (viewModal && e.target === viewModal) {
        closeViewOrderModal();
        return;
    }
});

// Ẩn tab orders ban đầu
// if (orderPanel) orderPanel.style.display = "none"; 
renderCategorySelector();


// Ẩn các tab nội dung ban đầu
document.getElementById("market").style.display = "block";
document.getElementById("accounts").style.display = "none";
document.getElementById("imports").style.display = "none";
document.getElementById("price").style.display = "none";


// Lắng nghe sự kiện thay đổi trạng thái đơn hàng
document.querySelector(".orders-table tbody").addEventListener('change', (e) => {
    if (e.target.classList.contains('order-status-select')) {
        const orderId = e.target.dataset.id;
        const newStatus = e.target.value;

        const allOrders = loadAllOrdersFromStorage();
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            const currentOrder = allOrders[orderIndex];
            const oldStatus = currentOrder.status; 

            // Load lại marketItems mới nhất để tính toán tồn kho
            marketItems = loadProductsFromStorage(); 

            //HỦY ĐƠN
            if (newStatus === 'Đã hủy' && oldStatus !== 'Đã hủy') {
                if(confirm("Xác nhận HỦY đơn hàng này?\n\n- Số lượng sẽ được HOÀN VỀ kho.\n- Đơn hàng vẫn có thể chỉnh sửa tiếp.")) {
                    let restoredCount = 0;
                    if (currentOrder.items) {
                        currentOrder.items.forEach(orderItem => {
                            Object.values(marketItems).forEach(cat => {
                                if (cat.items) {
                                    const product = cat.items.find(p => p.name === orderItem.name);
                                    if (product) {
                                        // CỘNG lại vào kho
                                        product.quantity = (parseInt(product.quantity) || 0) + (parseInt(orderItem.quantity) || 1);
                                        restoredCount++;
                                    }
                                }
                            });
                        });
                    }
                    
                    saveProductsToStorage(); // Lưu kho
                    currentOrder.status = newStatus;

                    
                    alert(`Đã hủy đơn và hoàn kho ${restoredCount} loại sản phẩm.`);
                } else {
                    e.target.value = oldStatus; // Cancel thì trả về cũ
                    return; 
                }
            } 
            //KHÔI PHỤC TỪ "ĐÃ HỦY" 
            else if (oldStatus === 'Đã hủy' && newStatus !== 'Đã hủy') {
                 if(confirm("Bạn đang khôi phục đơn hàng đã hủy?\n\n- Số lượng sẽ bị TRỪ khỏi kho.")) {
                    let deductedCount = 0;
                    if (currentOrder.items) {
                        currentOrder.items.forEach(orderItem => {
                            Object.values(marketItems).forEach(cat => {
                                if (cat.items) {
                                    const product = cat.items.find(p => p.name === orderItem.name);
                                    if (product) {
                                        // TRỪ khỏi kho
                                        product.quantity = (parseInt(product.quantity) || 0) - (parseInt(orderItem.quantity) || 1);
                                        if (product.quantity < 0) product.quantity = 0; // Không cho âm
                                        deductedCount++;
                                    }
                                }
                            });
                        });
                    }

                    saveProductsToStorage(); // Lưu kho
                    currentOrder.status = newStatus;
                    alert(`Đã khôi phục đơn hàng và trừ kho ${deductedCount} loại sản phẩm.`);
                 } else {
                     e.target.value = oldStatus;
                     return;
                 }
            }
            //ĐỔI TRẠNG THÁI BÌNH THƯỜNG ===
            else {
                currentOrder.status = newStatus;
            }

            // --- LƯU TRỮ CHUNG ---
            // Lưu all_orders
            saveAllOrdersToStorage(allOrders);
            
            //Đồng bộ sang đơn hàng cá nhân (localStorage 'orders')
            const userOrdersString = localStorage.getItem('orders');
            if (userOrdersString) {
                try {
                    let userOrders = JSON.parse(userOrdersString);
                    const userOrderIndex = userOrders.findIndex(o => o.id === orderId);
                    if (userOrderIndex !== -1) {
                        userOrders[userOrderIndex].status = currentOrder.status;
                        // userOrders[userOrderIndex].isLocked = currentOrder.isLocked; // Không cần cập nhật lock ở đây nữa vì ko thay đổi
                        localStorage.setItem('orders', JSON.stringify(userOrders));
                    }
                } catch (err) {
                    console.error("Lỗi đồng bộ đơn hàng cá nhân:", err);
                }
            }
            
            //Render lại giao diện
            renderOrdersTable(orderCurrentPage);
            renderProductTable(1); // Cập nhật bảng sản phẩm
        }
    }
});
// Lắng nghe sự kiện click vào nút "Lưu & Khóa"
document.querySelector(".orders-table tbody").addEventListener('click', (e) => {
    
    // 1. XỬ LÝ NÚT XEM CHI TIẾT
    if (e.target.classList.contains('view-order-btn')) {
        const orderId = e.target.dataset.id;
        openViewOrderModal(orderId);
        return;
    }

    // 2. XỬ LÝ NÚT LƯU & KHÓA
    if (e.target.classList.contains('save-order-btn')) {
        const orderId = e.target.dataset.id;
        
        if(confirm(`Bạn có chắc muốn chốt trạng thái đơn hàng ${orderId}? \nSau khi lưu, bạn sẽ KHÔNG thể chỉnh sửa trạng thái được nữa.`)) {
            const allOrders = loadAllOrdersFromStorage();
            const orderIndex = allOrders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                // Đặt cờ khóa
                allOrders[orderIndex].isLocked = true;
                saveAllOrdersToStorage(allOrders);
                
                // Đồng bộ sang orders cá nhân
                const userOrdersString = localStorage.getItem('orders');
                if (userOrdersString) {
                    try {
                        let userOrders = JSON.parse(userOrdersString);
                        const userOrderIndex = userOrders.findIndex(o => o.id === orderId);
                        if (userOrderIndex !== -1) {
                            userOrders[userOrderIndex].isLocked = true;
                            userOrders[userOrderIndex].status = allOrders[orderIndex].status;
                            localStorage.setItem('orders', JSON.stringify(userOrders));
                        }
                    } catch (err) {
                        console.error("Lỗi cập nhật đơn hàng cá nhân:", err);
                    }
                }
                
                renderOrdersTable(orderCurrentPage);
                alert("Đã khóa đơn hàng thành công!");
            }
        }
    }
});