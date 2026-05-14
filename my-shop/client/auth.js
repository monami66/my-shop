
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const el = document.getElementById("cart-count");
  if (el) el.textContent = cart.length;
}


function checkUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  const block = document.getElementById("user-block");

  if (!block) return;

  if (user) {
    block.innerHTML = `
      <span style="margin-right:10px;">${user.name}</span>
      <button class="btn" onclick="logout()">Выйти</button>
    `;
  } else {
    block.innerHTML = `
      <a href="/login.html">
        <button class="btn">Вход</button>
      </a>
    `;
  }
}


function logout() {
  localStorage.removeItem("user");
  location.reload();
}


document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  checkUser();
});