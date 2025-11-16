// Sidebar toggle
function openSidebar() {
  const navbar = document.getElementById("navbar");
  const overlay = document.getElementById("overlay");
  navbar.classList.add("show");
  overlay.style.display = "block";
}

function closeSidebar() {
  const navbar = document.getElementById("navbar");
  const overlay = document.getElementById("overlay");
  navbar.classList.remove("show");
  overlay.style.display = "none";
}

// Form animation toggle
function toggleForm(form) {
  const container = document.getElementById("authContainer");
  const signupBtn = document.getElementById("signupBtn");
  const signinBtn = document.getElementById("signinBtn");
  
  if (form === "signup") {
    container.classList.add("active");
    // Hiển thị nút Sign In, ẩn nút Sign Up
    signupBtn.style.display = "none";
    signinBtn.style.display = "block";
  } else {
    container.classList.remove("active");
    // Hiển thị nút Sign Up, ẩn nút Sign In
    signupBtn.style.display = "block";
    signinBtn.style.display = "none";
  }
}

// tài khoản mặc định
const accountsList = JSON.parse(localStorage.getItem("users"));


let needsSave = false;
accountsList.forEach(user => {
    if (typeof user.active === 'undefined') {
        user.active = true; 
        needsSave = true;
    }
    if (typeof user.name === 'undefined') { 
        user.name = user.username || 'N/A';
        needsSave = true;
    }
});
if (needsSave) {
    saveAccountsToStorage();
}

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // LOGIN
  const loginForm = document.getElementById("loginForm");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const loginMessage = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginMessage.style.color = "red";

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === loginUsername.value && u.password === loginPassword.value);

    if (user) {
      if(!user.active){
        loginMessage.textContent="Tài khoản đã bị khóa, vui lòng liên hệ admin để biết thêm chi tiết.";
      }
      else {loginMessage.style.color = "green";
      loginMessage.textContent = "Login successful! Redirecting...";
      
      // Lưu trạng thái đăng nhập
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      // Redirect về trang chủ sau 1.5s
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);}
    } else {
      loginMessage.textContent = "Invalid username or password!";
    }
  });

  // SIGNUP
  const signupForm = document.getElementById("signupForm");
  const signupUsername = document.getElementById("signupUsername");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const signupMessage = document.getElementById("signupMessage");

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    signupMessage.textContent = "";
    signupMessage.style.color = "red";

    if (!signupUsername.value || !signupEmail.value || !signupPassword.value || !confirmPassword.value) {
      signupMessage.textContent = "Please fill in all fields.";
      return;
    }

    if (signupPassword.value !== confirmPassword.value) {
      signupMessage.textContent = "Passwords do not match!";
      return;
    }

    if (signupPassword.value.length < 6) {
      signupMessage.textContent = "Password must be at least 6 characters.";
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existingUser = users.find(u => u.username === signupUsername.value);

    if (existingUser) {
      signupMessage.textContent = "Username already taken!";
      return;
    }
    if(signupUsername.value==="admin"){
      signupMessage.textContent="Admin user can't be registered!";
      return;
    }

    users.push({
      username: signupUsername.value,
      email: signupEmail.value,
      password: signupPassword.value,
      active: true
    });

    localStorage.setItem("users", JSON.stringify(users));

    signupMessage.style.color = "green";
    signupMessage.textContent = "Sign up successful! Switching to login...";

    // Reset form
    signupForm.reset();

    // Chuyển về login sau 2s
    setTimeout(() => {
      toggleForm("login");
      signupMessage.textContent = "";
    }, 2000);
  });
});
