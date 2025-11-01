export const market = {
  "Danh mục": {
    hidden: false,
    items: [
      {
        name: "Toán",
        price: "$45",
        image: "https://toanmath.com/wp-content/uploads/2024/02/sach-giao-khoa-toan-12-tap-1-ket-noi-tri-thuc-voi-cuoc-song.png",
        active: true,
        description: "Giáo trình Toán lớp 12 giúp học sinh nắm vững kiến thức nền tảng.",
        quantity: 18,
        releaseYear: 2024,
        cost_price: 36  
      },
      {
        name: "Giải tích 1",
        price: "$85",
        image: "../assets/images/vantai.png",
        active: true,
        description: "Khám phá các khái niệm giới hạn, đạo hàm và tích phân.",
        quantity: 10,
        releaseYear: 2023,
        cost_price: 68  
      },
      {
        name: "Xác suất thống kê",
        price: "$30",
        image: "../assets/images/nguyenvantaingu.png",
        active: true,
        description: "Tài liệu cơ bản về xác suất và thống kê ứng dụng.",
        quantity: 22,
        releaseYear: 2022,
        cost_price: 24  
      },
      {
        name: "Lý thuyết đồ thị",
        price: "$45",
        image: "../assets/images/ltđt.png",
        active: true,
        description: "Giới thiệu các khái niệm và thuật toán trong đồ thị.",
        quantity: 15,
        releaseYear: 2021,
        cost_price: 36  
      },
      {
        name: "Triết học",
        price: "$85",
        image: "../assets/images/triet.png",
        active: true,
        description: "Tổng quan các trường phái triết học phương Tây và phương Đông.",
        quantity: 8,
        releaseYear: 2020,
        cost_price: 68  
      },
      {
        name: "Pháp luật đại cương",
        price: "$30",
        image: "../assets/images/pldc.png",
        active: true,
        description: "Cẩm nang pháp luật cơ bản dành cho sinh viên.",
        quantity: 20,
        releaseYear: 2023,
        cost_price: 24  
      },
      {
        name: "Toán rời rạc",
        price: "$45",
        image: "../assets/images/toanroirac.png",
        active: true,
        description: "Phân tích các cấu trúc toán học không liên tục.",
        quantity: 12,
        releaseYear: 2022,
        cost_price: 36  
      },
      {
        name: "Cờ tướng",
        price: "$30",
        image: "../assets/images/vodichthu.png",
        active: true,
        description: "Chiến thuật và kỹ năng chơi cờ tướng chuyên sâu.",
        quantity: 30,
        releaseYear: 2021,
        cost_price: 24  
      },
      {
        name: "Kinh tế chính trị",
        price: "$45",
        image: "../assets/images/ktct.png",
        active: true,
        description: "Phân tích các học thuyết kinh tế và chính trị hiện đại.",
        quantity: 14,
        releaseYear: 2024,
        cost_price: 36  
      }
    ]
  },

  "Danh mục 1": {
    hidden: false,
    items: [
      {
        name: "Cơ sở dữ liệu",
        price: "$90",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Hướng dẫn thiết kế và quản lý hệ thống cơ sở dữ liệu.",
        quantity: 7,
        releaseYear: 2022,
        cost_price: 72  
      },
      {
        name: "Cấu trúc dữ liệu và giải thuật",
        price: "$40",
        image: "../assets/icons/jokerBentre.jpg",
        active: true,
        description: "Tài liệu chuyên sâu về cấu trúc dữ liệu và thuật toán.",
        quantity: 16,
        releaseYear: 2023,
        cost_price: 32  
      },
      {
        name: "Kỹ thuật lập trình",
        price: "$15",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Giáo trình nhập môn lập trình với các ví dụ thực tế.",
        quantity: 25,
        releaseYear: 2025,
        cost_price: 12  
      }
    ]
  },

  "Danh mục 2": {
    hidden: false,
    items: [
      {
        name: "Java",
        price: "$45",
        image: "../assets/icons/jokerBentre.jpg",
        active: true,
        description: "Học lập trình Java từ cơ bản đến nâng cao.",
        quantity: 14,
        releaseYear: 2021,
        cost_price: 36  
      },
      {
        name: "Lập trình hướng đối tượng",
        price: "$85",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Giáo trình OOP với ví dụ minh họa bằng Java và C++.",
        quantity: 11,
        releaseYear: 2023,
        cost_price: 68  
      },
      {
        name: "JavaScript",
        price: "$30",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Tài liệu học JavaScript cho phát triển web hiện đại.",
        quantity: 19,
        releaseYear: 2024,
        cost_price: 24  
      },
      {
        name: "C++",
        price: "$45",
        image: "../assets/icons/jokerBentre.jpg",
        active: true,
        description: "Giáo trình C++ với các bài tập thực hành nâng cao.",
        quantity: 13,
        releaseYear: 2022,
        cost_price: 36  
      },
      {
        name: "Python",
        price: "$85",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Giáo trình Python dành cho phân tích dữ liệu và AI.",
        quantity: 9,
        releaseYear: 2024,
        cost_price: 68  
      },
      {
        name: "C#",
        price: "$30",
        image: "../assets/images/rickRoll.png",
        active: true,
        description: "Hướng dẫn lập trình C# với ứng dụng thực tế.",
        quantity: 17,
        releaseYear: 2021,
        cost_price: 24  
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
// Hiện thị item trong item-container
function renderMarketItems(page = 1) {
	const container = document.querySelector(".item-container");
	if (!container) return;
	container.innerHTML = "";

	const allItems = Object.values(marketItems).map(cat => cat.items).flat(); // Lấy mảng items bên trong rồi gộp lại

	const filteredItems = selectedCategory? (marketItems[selectedCategory]?.items || []): allItems; 

	const nameFiltered = filteredItems.filter(item => {
		const priceValue = parseFloat(item.price.replace("$", ""));
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
		<img src="${item.image}" alt="${item.name}" class="item-image" />
		<div class="item-info">
			<h3 class="item-name">${item.name}</h3>
			<p class="item-price">${item.price}</p>
			<p class="item-quantity">Số lượng: ${item.quantity ?? 0}</p>
			<p class="item-release">Năm phát hành: ${item.releaseYear ?? "Không rõ"}</p>
		</div>
		`;

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