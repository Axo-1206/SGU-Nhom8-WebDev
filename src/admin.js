import {
    market as defaultMarketItems
} from './marketController.js';

// Đổi tab market, accounts, import, price 
function setActiveTab(tab) {
    document.querySelectorAll(".admin-category-bar li").forEach(li => li.classList.remove("active"));
    document.getElementById(`${tab}-tab`).classList.add("active");

    const marketPanel = document.getElementById("market");
    const accountsPanel = document.getElementById("accounts");
    const importPanel =document.getElementById("imports");
    const pricePanel=document.getElementById("price");

    if (tab === "market") {
        marketPanel.style.display = "block";
        accountsPanel.style.display = "none";
        importPanel.style.display="none";
        pricePanel.style.display="none";
    } else if(tab === "accounts" ) {
        marketPanel.style.display = "none";
        accountsPanel.style.display = "block";
        importPanel.style.display="none";
        pricePanel.style.display="none";
    }
    else if(tab === "imports" ) {
        marketPanel.style.display = "none";
        accountsPanel.style.display = "none";
        importPanel.style.display="block";
        pricePanel.style.display="none";
    }
    else {
        marketPanel.style.display = "none";
        accountsPanel.style.display = "none";
        importPanel.style.display="none";
        pricePanel.style.display="block";
        renderPriceCategorySelector();
        renderPriceTable();
    }
}

//xử lý sự kiện khi chuyển tab
document.getElementById("market-tab").addEventListener("click", () => setActiveTab("market"));
document.getElementById("accounts-tab").addEventListener("click", () => setActiveTab("accounts"));
document.getElementById("imports-tab").addEventListener("click",()=>setActiveTab("imports"));
document.getElementById("price-tab").addEventListener("click",()=>setActiveTab("price"));
// load sản phẩm đã lưu nếu không có thì load mặc định
function loadProductsFromStorage() {
    const dataString = localStorage.getItem("adminProducts");
    if (dataString) {
        return JSON.parse(dataString);// chuyển từ string sang object
    }
    return JSON.parse(JSON.stringify(defaultMarketItems));
}

//hàm lưu sản phẩm
function saveProductsToStorage() {
    const dataString = JSON.stringify(marketItems);// chuyển từ object sang string
    localStorage.setItem("adminProducts", dataString);
}

let marketItems = loadProductsFromStorage();


let currentCategory = Object.keys(marketItems)[0]; // chọn danh mục hiện tại là mặc định
let currentProductEditIndex = null; 
const categorySelect = document.getElementById("category-select");

//hàm render bảng dang mục
//hàm render bảng dang mục
function renderCategorySelector() {
    // Thêm kiểm tra null phòng trường hợp không tìm thấy thẻ
    if (!categorySelect) return; 
    categorySelect.innerHTML = ""; // Xóa các option cũ
    
    Object.keys(marketItems).forEach(categoryName => {
        const categoryData = marketItems[categoryName]; // Lấy cả object
        const option = document.createElement("option");
        option.value = categoryName;

        // === NÂNG CẤP: Thêm (Đang ẩn) nếu danh mục bị ẩn ===
        option.textContent = categoryName + (categoryData.hidden ? " (Đang ẩn)" : "");
        // ===================================================

        if (categoryName === currentCategory) {
            option.selected = true; // Chọn đúng mục đang active
        }
        categorySelect.appendChild(option);
    });
}

// xử lý sự kiện làm xuất hiện các danh mục
if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
        currentCategory = e.target.value; 
        renderProductTable(); 
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

    marketItems[newCategory] = { hidden: false, items: [] }; // tạo danh mục mới rỗng // tạo danh mục mới rỗng
    currentCategory = newCategory;
    saveProductsToStorage();
    renderCategorySelector();
    renderProductTable();
    document.getElementById("new-category-name").value = ""; // clear input
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
        renderProductTable();
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

    // Gán lại dữ liệu danh mục cũ sang danh mục mới
    marketItems[newName] = marketItems[oldCategory];
    delete marketItems[oldCategory];
    currentCategory = newName;
    saveProductsToStorage();
    renderCategorySelector();
    renderProductTable();
    alert(`Đã đổi tên "${oldCategory}" thành "${newName}"`);
});

//ẩn/hiện  danh mục
document.getElementById("toggle-category-btn").addEventListener("click", () => {
    const categoryName = categorySelect.value;
    if (!categoryName) {
        alert("Không có danh mục nào được chọn!");
        return;
    }

    // Lấy đối tượng danh mục
    const categoryData = marketItems[categoryName];
    if (!categoryData) {
        alert("Lỗi: Không tìm thấy dữ liệu danh mục.");
        return;
    }

    // Đảo ngược trạng thái 'hidden'
    // (Nếu 'hidden' chưa tồn tại, !undefined sẽ là true)
    categoryData.hidden = !categoryData.hidden;

    // Lưu lại
    saveProductsToStorage();
    
    // Cập nhật lại <select> để hiển thị (Đang ẩn)
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
    modal.classList.add("visible");
    modal.querySelector("h2").textContent = "Add New Product";
    modal.querySelector("button[type='submit']").textContent = "Add Product";
}

// Mở form sửa sản phẩm
// Thay thế hàm openEditModal cũ
function openEditModal(index) {
    const item = marketItems[currentCategory].items[index]; 
    if (!item) return;

    // Điền dữ liệu cũ
    document.getElementById("product-name").value = item.name;
    document.getElementById("product-price").value = item.price.replace('$', ''); 
    document.getElementById("product-image").value = item.image;

    // Điền dữ liệu MỚI
    document.getElementById("product-description").value = item.description || ""; 
    document.getElementById("product-quantity").value = item.quantity || 0;
    document.getElementById("product-release-year").value = item.releaseYear || 2000;

    currentProductEditIndex = index; 
    modal.classList.add("visible");
    
    document.getElementById("product-form-title").textContent = "Edit Product";
    document.getElementById("product-submit-btn").textContent = "Save Changes";
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
    e.preventDefault(); // Ngăn form reload
    
    const name = document.getElementById("product-name").value;
    const priceValue = parseFloat(document.getElementById("product-price").value) || 0;
    const price = "$" + priceValue; 
    const image = document.getElementById("product-image").value;

    // Lấy dữ liệu MỚI
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
        newItem.active = oldItem.active; 
        newItem.cost_price = oldItem.cost_price || 0;
        
        marketItems[currentCategory].items[currentProductEditIndex] = newItem;
    } else {
        marketItems[currentCategory].items.push(newItem);
    }

    renderProductTable();
    closeModal();
    saveProductsToStorage();
});

// Render bảng sản phẩm
function renderProductTable() {
    const tbody = document.querySelector(".product-table tbody");
    tbody.innerHTML = "";

    let id = 1;
    const itemsToRender = marketItems[currentCategory]?.items || []; 

    itemsToRender.forEach((item, index) => { // Sửa ở đây
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${id++}</td>
            <td>${item.name}</td>
            <td>${item.price}</td> 
            <td>${item.quantity}</td> 
            <td><img src="${item.image}" alt="Product" class="item-image"></td>
            <td>
                <button class="edit-btn" title="Edit" data-index="${index}"> 
                    <svg width="18px" height="18px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 0L16 3L9 10H6V7L13 0Z" fill="#000000"></path>
                        <path d="M1 1V15H15V9H13V13H3V3H7V1H1Z" fill="#000000"></path>
                    </svg>
                </button>
                <button class="delete-btn" title="Delete" data-index="${index}">
                    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M6 7H18V18C18 19.66 16.66 21 15 21H9C7.34 21 6 19.66 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>
                <button class="hidden-btn ${item.active ? 'on' : 'off'}" 
                        data-index="${index}">
                    ${item.active ? '<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.3307 7.16929C13.5873 7.05887 12.806 7 12 7C7.02944 7 3 9.23858 3 12C3 13.4401 4.09589 14.738 5.84963 15.6504L8.21192 13.2881C8.07452 12.8839 8 12.4506 8 12C8 9.79086 9.79086 8 12 8C12.4506 8 12.8839 8.07452 13.2881 8.21192L14.3307 7.16929Z" fill="#000000"></path> <path d="M11.2308 15.9261C11.4797 15.9746 11.7369 16 12 16C14.2091 16 16 14.2091 16 12C16 11.7369 15.9746 11.4797 15.9261 11.2308L18.5726 8.58427C20.0782 9.47809 21 10.6792 21 12C21 14.7614 16.9706 17 12 17C11.4016 17 10.8169 16.9676 10.2512 16.9057L11.2308 15.9261Z" fill="#000000"></path> <path d="M17.7929 5.20711C18.1834 4.81658 18.8166 4.81658 19.2071 5.20711C19.5976 5.59763 19.5976 6.2308 19.2071 6.62132L6.47919 19.3492C6.08866 19.7398 5.4555 19.7398 5.06497 19.3492C4.67445 18.9587 4.67445 18.3256 5.06497 17.935L17.7929 5.20711Z" fill="#000000"></path> </g></svg>':'<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z" stroke="#1C274C" stroke-width="1.5"></path> <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#1C274C" stroke-width="1.5"></path> </g></svg>'}
                </button>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll(".hidden-btn").forEach(btn=>{
        btn.addEventListener("click",()=>{
            const index=btn.dataset.index;
            const product=marketItems[currentCategory].items[index];
            product.active=!product.active;
            saveProductsToStorage();
            renderProductTable();
        })
    })
}


//lưu tài khoản
function saveAccountsToStorage() {
    const dataString = JSON.stringify(accountsList);
    localStorage.setItem("users", dataString);
}

//khởi tạo danh sách ban đầu
const accountsList = JSON.parse(localStorage.getItem("users")) || [
    { 
        username: "user", 
        password: "123456", 
        email: "user@gmail.com", 
        active: true 
    }
];
let currentAccountEditIndex = null; 

const accModal = document.getElementById("AccountForm");
const AccountForm = document.getElementById("acc-frm");
const closeAccModalBtn = document.getElementById("close-acc-frm-btn");


//mở form edit tài khoản
function openEditAccountModal(index) {
    const account =  accountsList[index]; 
    currentAccountEditIndex = index;

    AccountForm.reset();

    document.getElementById("account-username").value = account.username;
    document.getElementById("account-email").value = account.email;

    accModal.classList.add("visible");

    accModal.querySelector("h2").textContent = "Chỉnh sửa tài khoản";
    accModal.querySelector("button[type='submit']").textContent = "Lưu thay đổi";
}


//đóng form tài khoản
function closeAccountModal() {
    accModal.classList.remove("visible");
}


//xử lý sự kiện cho đóng/mở form
closeAccModalBtn.addEventListener("click", closeAccountModal);

//xử lý sự kiện khi click vào nền thì đóng form ( thẻ div có classAccountForm)
accModal.addEventListener("click", (e) => {
    if (e.target === accModal) {
        closeAccountModal();
    }
});

// xử lý sự kiện submit tài khoản
AccountForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("account-username").value;
    const password =document.getElementById("account-password").value;
    const email = document.getElementById("account-email").value;

    if (username && password ) {
        const newAccount = { username, password ,email };

        if (currentAccountEditIndex !== null) { // nếu đang sửa thì sửa
            accountsList [currentAccountEditIndex] = newAccount; 
        } else { // nếu đang thêm thì thêm
            accountsList .push(newAccount);
        }

        renderAccountsTable();
        closeAccountModal();
        saveAccountsToStorage();
        currentAccountEditIndex = null; 
    } else {
        alert("Please enter your username and email.");
    }
});

function renderAccountsTable() {
    const tbody = document.querySelector(".accounts-table tbody");
    tbody.innerHTML = "";

    let id = 1;
    accountsList.forEach((user, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${id++}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.active ? "Mở" : "Khóa"}</td>
            <td>
                <button class="reset-btn" title="Reset" data-index="${index}">
                <svg fill="#000000" width="18px" height="18px" viewBox="0 0 512.00 512.00" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M64,256H34A222,222,0,0,1,430,118.15V85h30V190H355V160h67.27A192.21,192.21,0,0,0,256,64C150.13,64,64,150.13,64,256Zm384,0c0,105.87-86.13,192-192,192A192.21,192.21,0,0,1,89.73,352H157V322H52V427H82V393.85A222,222,0,0,0,478,256Z"></path></g></svg>
                </button>
                <button class="status-btn ${user.active ? 'on' : 'off'}" 
                        data-index="${index}">
                    ${user.active ? '<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>' : '<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.584 6C15.8124 4.2341 14.0503 3 12 3C9.23858 3 7 5.23858 7 8V10.0288M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C16.8802 10 17.7202 10 18.362 10.327C18.9265 10.6146 19.3854 11.0735 19.673 11.638C20 12.2798 20 13.1198 20 14.8V16.2C20 17.8802 20 18.7202 19.673 19.362C19.3854 19.9265 18.9265 20.3854 18.362 20.673C17.7202 21 16.8802 21 15.2 21H8.8C7.11984 21 6.27976 21 5.63803 20.673C5.07354 20.3854 4.6146 19.9265 4.32698 19.362C4 18.7202 4 17.8802 4 16.2V14.8C4 13.1198 4 12.2798 4.32698 11.638C4.6146 11.0735 5.07354 10.6146 5.63803 10.327C5.99429 10.1455 6.41168 10.0647 7 10.0288Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'}
                </button>
                <button class="edit-btn" title="Edit" data-index="${index}"> 
                    <svg width="18px" height="18px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 0L16 3L9 10H6V7L13 0Z" fill="#000000"></path>
                        <path d="M1 1V15H15V9H13V13H3V3H7V1H1Z" fill="#000000"></path>
                    </svg>
                </button>
                <button class="delete-btn" title="Delete" data-index="${index}">
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
    // xử lý sự kiện cho nút reset
    document.querySelectorAll(".reset-btn").forEach(btn=>{
        btn.addEventListener("click",()=>{
            const index=btn.dataset.index;
             accountsList[index].password="123456";
            alert(`Đã reset mật khẩu của tài khoản "${ accountsList[index].username}" về 123456`)
            renderAccountsTable();
        })
    })

    // Thêm sự kiện cho nút trạng thái
    document.querySelectorAll(".status-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const user =  accountsList[index];
            user.active = !user.active; 
            saveAccountsToStorage();
            renderAccountsTable();
        });
    });
}


// xử lý sự kiện nút xóa và sửa cho form sản phẩm
document.querySelector(".product-table tbody").addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
        const index = editBtn.dataset.index;
        openEditModal(index);
        return;
    }

    // Tìm nút delete gần nhất mà người dùng click
    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            const index = deleteBtn.dataset.index;
            // Sửa ở đây: Dùng currentCategory
            marketItems[currentCategory].items.splice(index, 1);
            renderProductTable();
            saveProductsToStorage();
        }
    }
});

// xử lý sự kiện nút xóa và sửa cho form tài khoản
document.querySelector(".accounts-table tbody").addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
        const index = editBtn.dataset.index;
        openEditAccountModal(index);
        return;
    }

    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
        const index = deleteBtn.dataset.index;
        const account =  accountsList[index];

        // không được xóa tài khoản admin
        if (account.username === "admin") {
            alert("Bạn không thể xóa tài khoản 'admin' mặc định!");
            return;
        }

        if (confirm(`Bạn có chắc muốn xóa tài khoản '${account.username}'?`)) {
            accountsList .splice(index, 1);
            renderAccountsTable();
            saveAccountsToStorage();
        }
    }
});

// phiếu nhập hàng
const importModal = document.getElementById("importForm");
const importForm = document.getElementById("import-frm");
const addImportSlipBtn = document.getElementById("add-import-btn");
const closeImportModalBtn = document.getElementById("close-import-frm-btn");
const importFormTitle = document.getElementById("import-form-title");
const saveImportSlipBtn = document.getElementById("save-import-slip-btn");
const importDateEl = document.getElementById("import-date");
const importProductSelectEl = document.getElementById("import-product-select");
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

// Data
let importSlips = []; // Danh sách tất cả phiếu nhập
let currentSlipProducts = []; // Sản phẩm trong phiếu đang mở (tạm thời)
let currentEditSlipId = null; // ID của phiếu đang sửa

function getNextImportId() {
    if (importSlips.length === 0) {
        return 1; // ID đầu tiên là 1
    }
    
    // Lấy tất cả ID, chuyển thành số 
    const allIds = importSlips.map(slip => parseInt(slip.id) || 0);
    
    // Tìm ID lớn nhất và + 1
    const maxId = Math.max(...allIds);
    return maxId + 1;
}
// Tải phiếu nhập từ localStorage
function loadImportsFromStorage() {
    const dataString = localStorage.getItem("adminImports");
    return dataString ? JSON.parse(dataString) : [];
}

// Lưu phiếu nhập vào localStorage
function saveImportsToStorage() {
    localStorage.setItem("adminImports", JSON.stringify(importSlips));
}

// Render bảng (bên trong modal) chứa các SP tạm thời
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
            <td>${product.importPrice}</td>
            <td><button type="button" class="slip-delete-product-btn" data-index="${index}">X</button></td>
        `;
        slipProductsTbody.appendChild(tr);
    });
}

// Xử lý sự kiện xóa SP khỏi phiếu tạm (trong modal)
if (slipProductsTbody) {
    slipProductsTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('slip-delete-product-btn')) {
            const index = parseInt(e.target.dataset.index);
            currentSlipProducts.splice(index, 1); // Xóa khỏi mảng tạm
            renderCurrentSlipProducts(); // Render lại bảng trong modal
        }
    });
}

// Render bảng chính (danh sách các phiếu nhập)
function renderImportsTable(slipsToRender = importSlips) {
    if (!importsTableBody) return;
    importsTableBody.innerHTML = "";

    slipsToRender.forEach(slip => {
        const tr = document.createElement("tr");
        const isCompleted = slip.status === 'completed';

        const productNames = slip.products.map(p => p.name);
        const productNamesString = productNames.join(', ');

        const totalProducts = slip.products.reduce((sum, p) => sum + p.quantity, 0);

        tr.innerHTML = `
            <td>${slip.id}</td>
            <td>${slip.importDate}</td>
            <td style="color: ${isCompleted ? 'white' : 'black'};">
                ${isCompleted ? 'Đã hoàn thành' : 'Đang xử lý'}
            </td>
            <td>${productNamesString}</td>
            <td>${totalProducts}</td>
            <td>
                <button class="view-btn import-view-btn" data-id="${slip.id}" title="Xem chi tiết">
                    Xem chi tiết
                </button>
                <button class="edit-btn import-edit-btn" data-id="${slip.id}" 
                    ${isCompleted ? 'disabled' : ''} title="Sửa phiếu">
                    Sửa
                </button>
                <button class="complete-btn import-complete-btn" data-id="${slip.id}" 
                    ${isCompleted ? 'disabled' : ''} title="Hoàn thành phiếu">
                    Hoàn thành
                </button>
            </td>
        `;
        importsTableBody.appendChild(tr);
    });
}

// (Hàm này dùng marketItems, đảm bảo marketItems đã được load)
// Điền danh sách sản phẩm vào <select> trong modal
function populateProductSelect() {
    if (!importProductSelectEl) return;
    importProductSelectEl.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
    
    Object.keys(marketItems).forEach(categoryName => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = categoryName;
        
        const categoryData = marketItems[categoryName];
        if (categoryData && categoryData.items) {
            categoryData.items.forEach(item => {
                const option = document.createElement('option');
                
                option.value = JSON.stringify({ name: item.name, category: categoryName });
                option.textContent = item.name;
                optgroup.appendChild(option);
            });
        }
        importProductSelectEl.appendChild(optgroup);
    });
}

// Mở modal (Thêm Mới)
function openAddImportModal() {
    importForm.reset();
    currentSlipProducts = []; // Reset mảng sản phẩm tạm
    currentEditSlipId = null; // Đảm bảo đang là "thêm mới"
    importFormTitle.textContent = "Thêm Phiếu Nhập Hàng";
    saveImportSlipBtn.textContent = "Lưu Phiếu Mới";
    importDateEl.disabled = false;
    
    populateProductSelect(); // Luôn load SP mới nhất
    renderCurrentSlipProducts(); // Render bảng rỗng
    
    importModal.classList.add("visible");
}

// Mở modal (Sửa)
function openEditImportModal(slipId) {
    const slip = importSlips.find(s => s.id === slipId);
    if (!slip) return;
    
    // Chỉ sửa nếu "đang xử lý"
    if (slip.status === 'completed') {
        alert("Phiếu đã hoàn thành, không thể sửa.");
        return;
    }

    importForm.reset();
    currentEditSlipId = slipId; // Đặt ID đang sửa
    
    // Deep copy mảng products để tránh sửa đổi bản gốc khi chưa save
    currentSlipProducts = JSON.parse(JSON.stringify(slip.products)); 
    
    importFormTitle.textContent = "Sửa Phiếu Nhập Hàng";
    saveImportSlipBtn.textContent = "Lưu Thay Đổi";
    importDateEl.value = slip.importDate;
    importDateEl.disabled = false; // Cho phép sửa ngày

    populateProductSelect();
    renderCurrentSlipProducts();
    
    importModal.classList.add("visible");
}

// Đóng modal
function closeImportModal() {
    if (importModal) importModal.classList.remove("visible");
}
// === Hàm Mở modal XEM chi tiết phiếu ===
function openViewImportModal(slipId) {
    const slip = importSlips.find(s => s.id === slipId);
    if (!slip) {
        alert("Không tìm thấy phiếu nhập!");
        return;
    }

    // 1. Điền thông tin chung
    viewModalTitle.textContent = `Chi tiết Phiếu Nhập #${slip.id}`;
    viewModalDetails.innerHTML = `
        <p><strong>Ngày nhập:</strong> ${slip.importDate}</p>
        <p><strong>Trạng thái:</strong> ${slip.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}</p>
    `;

    // 2. Điền bảng sản phẩm
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
    
    // 3. Hiển thị modal
    if (viewModal) viewModal.classList.add("visible");
}

// ===  Thêm sự kiện đóng modal "Xem" ===
function closeViewImportModal() {
    if (viewModal) viewModal.classList.remove("visible");
}
if (closeViewModalBtnFooter) closeViewModalBtnFooter.addEventListener("click", closeViewImportModal);

// Đóng khi click ra ngoài
if (viewModal) {
    viewModal.addEventListener("click", (e) => {
        if (e.target === viewModal) {
            closeViewImportModal();
        }
    });
}

// Gắn sự kiện cho các nút đóng/mở
if (addImportSlipBtn) addImportSlipBtn.addEventListener("click", openAddImportModal);
if (closeImportModalBtn) closeImportModalBtn.addEventListener("click", closeImportModal);

// Nút "Thêm vào phiếu" (bên trong modal)
if (addProductToSlipBtn) {
    addProductToSlipBtn.addEventListener("click", () => {
        const rawProductData = importProductSelectEl.value;
        const quantity = parseInt(importQtyEl.value);
        const importPrice = parseFloat(importPriceEl.value);

        if (!rawProductData || quantity <= 0 || importPrice < 0) {
            alert("Vui lòng chọn sản phẩm, nhập số lượng và giá nhập hợp lệ.");
            return;
        }

        const productData = JSON.parse(rawProductData); // { name: "...", category: "..." }

        // Kiểm tra xem SP đã tồn tại trong phiếu tạm chưa
        const existingProduct = currentSlipProducts.find(p => p.name === productData.name && p.category === productData.category);

        if (existingProduct) {
            // Nếu tồn tại, chỉ cập nhật
            existingProduct.quantity = quantity;
            existingProduct.importPrice = importPrice;
            alert(`Đã cập nhật "${productData.name}"`);
        } else {
            // Nếu chưa, thêm mới
            currentSlipProducts.push({
                category: productData.category,
                name: productData.name,
                quantity: quantity,
                importPrice: importPrice
            });
        }
        
        renderCurrentSlipProducts(); // Render lại bảng trong modal

        // Reset ô chọn để chuẩn bị thêm SP tiếp
        importProductSelectEl.value = "";
        importQtyEl.value = 1;
        importPriceEl.value = 0;
    });
}

// Xử lý Submit Form (Lưu Phiếu Mới hoặc Lưu Thay Đổi)
if (importForm) {
    importForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const importDate = importDateEl.value;
        if (!importDate || currentSlipProducts.length === 0) {
            alert("Ngày nhập và ít nhất 1 sản phẩm là bắt buộc.");
            return;
        }

        if (currentEditSlipId) {
            // Cập nhật phiếu cũ
            const slipIndex = importSlips.findIndex(s => s.id === currentEditSlipId);
            if (slipIndex > -1) {
                importSlips[slipIndex].importDate = importDate;
                importSlips[slipIndex].products = currentSlipProducts; // Gán mảng đã sửa
            }
        } else {
            // Tạo phiếu mới
            const newSlip = {
                id: getNextImportId(), // ID đơn giản
                importDate: importDate,
                status: "processing", // Mặc định là "đang xử lý"
                products: currentSlipProducts
            };
            importSlips.push(newSlip);
        }

        saveImportsToStorage();
        renderImportsTable(); // Render lại bảng chính
        closeImportModal();
    });
}

// Xử lý sự kiện cho các nút trên bảng chính (Sửa, Hoàn thành)
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
                        // Tìm sản phẩm trong kho chính (marketItems)
                        if (marketItems[slipProduct.category] && marketItems[slipProduct.category].items) {
                            
                            const productInStock = marketItems[slipProduct.category].items.find(
                                item => item.name === slipProduct.name
                            );
                            
                            //  Nếu tìm thấy, cộng dồn số lượng
                            if (productInStock) {
                                
                                    const old_qty = parseInt(productInStock.quantity) || 0;
                                    // Lấy giá vốn cũ, nếu chưa có (là sản phẩm mới) thì dùng 0
                                    const old_cost = parseFloat(productInStock.cost_price) || 0; 
                                    const old_total_value = old_qty * old_cost;

                                    const new_qty = parseInt(slipProduct.quantity) || 0;
                                    const new_cost = parseFloat(slipProduct.importPrice) || 0;
                                    const new_total_value = new_qty * new_cost;
                                    const total_qty = old_qty + new_qty;
                                    const total_value = old_total_value + new_total_value;

                                    // Tính giá vốn trung bình mới
                                    const new_avg_cost = (total_qty > 0) ? (total_value / total_qty) : 0;

                                    // Cập nhật cả số lượng VÀ giá vốn
                                    productInStock.quantity = total_qty;
                                    productInStock.cost_price = new_avg_cost; 
                                                                
                                } else {
                            alert(`Lỗi: Danh mục "${slipProduct.category}" không tồn tại.`);
                            allProductsFound = false;
                        }
                        }
                    });

                    // Nếu có lỗi (SP bị xóa...) thì không hoàn thành phiếu
                    if (!allProductsFound) {
                        alert("Hoàn thành phiếu thất bại. Vui lòng kiểm tra lại sản phẩm trong phiếu.");
                        return;
                    }

                    // Lưu lại KHO CHÍNH (rất quan trọng!)
                    saveProductsToStorage();


                    // Cập nhật trạng thái phiếu và lưu phiếu
                    slip.status = "completed";
                    saveImportsToStorage();
                    
                    // Render lại cả hai bảng
                    renderImportsTable(); // Cập nhật bảng phiếu nhập
                    renderProductTable(); // Cập nhật bảng sản phẩm (để thấy SL mới)
                    
                    alert(`Đã hoàn thành phiếu ${slipId} và cập nhật số lượng vào kho.`);
                }
            }
            return;
        }
    });
}


// Load dữ liệu khi trang tải
importSlips = loadImportsFromStorage();

const priceCategorySelect = document.getElementById("price-category-select");
const priceTableBody = document.querySelector(".price-table tbody");
let currentPriceCategory = Object.keys(marketItems)[0] || null;

// Render danh mục cho tab Giá (tương tự tab Market)
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
    // Đặt lại currentPriceCategory nếu nó không còn tồn tại
    if (!marketItems[currentPriceCategory]) {
        currentPriceCategory = Object.keys(marketItems)[0] || null;
    }
}

// Render bảng giá
function renderPriceTable() {
    if (!priceTableBody) return;
    priceTableBody.innerHTML = "";

    if (!currentPriceCategory || !marketItems[currentPriceCategory]) {
        priceTableBody.innerHTML = "<tr><td colspan='6'>Vui lòng chọn danh mục.</td></tr>";
        return;
    }

    const itemsToRender = marketItems[currentPriceCategory].items || [];
    let id = 1;

    itemsToRender.forEach((item, index) => {
        const cost_price = parseFloat(item.cost_price) || 0;
        // Lấy giá bán và bỏ ký tự $
        const selling_price = parseFloat(item.price.replace('$', '')) || 0; 
        
        // Tính lợi nhuận
        let profit_margin = 0;
        if (cost_price > 0) {
            profit_margin = ((selling_price - cost_price) / cost_price) * 100;
        }

        const tr = document.createElement("tr");
        // Lưu vị trí của item để biết Sửa/Lưu
        tr.dataset.index = index; 

        tr.innerHTML = `
            <td>${id++}</td>
            <td>${item.name}</td>
            
                        <td class="cost-price-cell" data-cost="${cost_price}">
                ${cost_price} 
            </td>

                        <td>
                <input 
                    type="text" 
                    class="profit-input" 
                    value="${profit_margin}" 
                    min="0" ;"
                >%
            </td>

                        <td class="selling-price-cell">
                $${selling_price}
            </td>

                        <td>
                <button class="price-save-btn">Lưu</button>
            </td>
        `;
        priceTableBody.appendChild(tr);
    });
}

// Xử lý khi gõ vào ô Lợi nhuận (tính lại Giá bán)
function handlePriceTableInput(e) {
    if (!e.target.classList.contains('profit-input')) return;

    const tr = e.target.closest('tr');
    const costPriceCell = tr.querySelector('.cost-price-cell');
    const sellingPriceCell = tr.querySelector('.selling-price-cell');
    
    const cost_price = parseFloat(costPriceCell.dataset.cost) || 0;
    const new_margin_percent = parseFloat(e.target.value) || 0;
    
    // Tính giá bán mới
    const new_selling_price = cost_price * (1 + new_margin_percent / 100);
    
    // Cập nhật ô giá bán (giữ định dạng "$")
    sellingPriceCell.textContent = '$' + new_selling_price.toFixed(2);
}

// Xử lý khi nhấn nút "Lưu" (cập nhật giá bán vào marketItems)
function handlePriceTableSave(e) {
    if (!e.target.classList.contains('price-save-btn')) return;

    const tr = e.target.closest('tr');
    const index = tr.dataset.index;
    
    if (!currentPriceCategory || !marketItems[currentPriceCategory] || !marketItems[currentPriceCategory].items[index]) {
        alert("Lỗi: Không tìm thấy sản phẩm!");
        return;
    }

    // Lấy giá bán MỚI (đã được tính tự động)
    const newSellingPriceText = tr.querySelector('.selling-price-cell').textContent;

    // Cập nhật giá bán mới vào kho (marketItems)
    const product = marketItems[currentPriceCategory].items[index];
    product.price = newSellingPriceText; // Lưu lại (ví dụ: "$12.34")

    saveProductsToStorage();
    
    // Cập nhật lại tab Market (vì giá bán đã thay đổi)
    renderProductTable(); 

    // Thông báo cho người dùng
    alert("Đã lưu thành công");
}

// Gắn sự kiện cho tab Price
if (priceCategorySelect) {
    priceCategorySelect.addEventListener("change", (e) => {
        currentPriceCategory = e.target.value;
        renderPriceTable();
    });
}

if (priceTableBody) {
    priceTableBody.addEventListener('input', handlePriceTableInput);
    priceTableBody.addEventListener('click', handlePriceTableSave);
}

function setupLogin() {

    const loginContainer = document.getElementById("login-container");
    const adminWrapper = document.getElementById("admin-wrapper");
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");
    

    const navLoginLink = document.getElementById("login-btn");
    const navLogoutBtn = document.getElementById("logout-btn");

    // Hàm để cập nhật UI (giao diện)
    function updateUI(isLoggedIn) {
        if (isLoggedIn) {
            // Đã đăng nhập
            if (loginContainer) loginContainer.classList.add("hidden");
            if (adminWrapper) adminWrapper.classList.remove("hidden");
            if (navLoginLink) navLoginLink.style.display = "none";
            if (navLogoutBtn) navLogoutBtn.style.display = "list-item";
        } else {
            // Chưa đăng nhập
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

            if (username === "admin" && password === "secret123") {
                localStorage.setItem("isAdmin", "true");
                updateUI(true); // Cập nhật UI sang "đã đăng nhập"
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
setupLogin();
//render mac dinh khi load trang
renderCategorySelector();
renderProductTable();
renderAccountsTable();
renderImportsTable();
setActiveTab("market");
