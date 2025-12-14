document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }

  /* ================== STATE ================== */
  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout");

  let currentView = "catalog";
  let cartTotal = 0;

  /* ================== MENU ================== */
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const sideMenuBackdrop = document.getElementById("sideMenuBackdrop");

  function openMenu() {
    sideMenu.classList.add("open");
    sideMenuBackdrop.classList.add("visible");
  }
  function closeMenu() {
    sideMenu.classList.remove("open");
    sideMenuBackdrop.classList.remove("visible");
  }

  menuToggle.onclick = openMenu;
  sideMenuBackdrop.onclick = closeMenu;

  document.querySelectorAll(".side-menu-btn").forEach(btn => {
    btn.onclick = () => {
      navigate(btn.dataset.nav);
      closeMenu();
    };
  });

  /* ================== NAV ================== */
  function navigate(where) {
    currentView = where;
    if (where === "catalog") renderCatalog();
    if (where === "vip") renderVip();
    if (where === "promo") renderPromo();
    if (where === "about") renderAbout();
  }

  /* ================== CATALOG ================== */
  function renderCatalog() {
    checkoutBtn.style.display = "";
    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">Каталог</div>
        <div style="opacity:.8;text-align:center">
          Здесь будет каталог товаров.<br>
          (Следующий этап)
        </div>
      </div>
    `;
    totalEl.textContent = cartTotal.toFixed(2);
  }

  /* ================== VIP ================== */
  const VIPS = [
  {
    key: "bronze",
    title: "Bronze VIP",
    color: "bronze",
    desc: "Базовый VIP доступ для старта.",
    benefits: ["VIP товары", "Базовые скидки"],
    price: 10
  },
  {
    key: "silver",
    title: "Silver VIP",
    color: "silver",
    desc: "Расширенные возможности и бонусы.",
    benefits: ["Все из Bronze", "Повышенные скидки", "Приоритет"],
    price: 20
  },
  {
    key: "gold",
    title: "Gold VIP",
    color: "gold",
    desc: "Премиальный уровень доступа.",
    benefits: ["Все из Silver", "Эксклюзивы", "Поддержка"],
    price: 35
  },
  {
    key: "diamond",
    title: "Diamond VIP",
    color: "diamond",
    desc: "Максимальный статус без ограничений.",
    benefits: ["Все преимущества", "Макс. скидки", "Закрытый контент"],
    price: 60
  }
];

const VIP_PERIODS = [1, 3, 6, 12];
let vipIndex = 0;
let vipMonths = 1;

// ================= VIP RENDER =================
function renderVip() {
  const vip = VIPS[vipIndex];

  view.innerHTML = `
    <div class="vip-screen ${vip.color}">
      <div class="vip-swipe-area" id="vipSwipe">
        <div class="vip-card-single ${vip.color}">
          <div class="vip-crown">👑</div>

          <div class="vip-hero ${vip.color}">
            <div class="vip-aura ${vip.color}"></div>
          </div>

          <h2 class="vip-title">${vip.title}</h2>
          <p class="vip-desc">${vip.desc}</p>

          <ul class="vip-benefits">
            ${vip.benefits.map(b => `<li>${b}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div class="vip-bottom">
        <select id="vipPeriod" class="vip-select">
          ${VIP_PERIODS.map(m => `
            <option value="${m}" ${m === vipMonths ? "selected" : ""}>
              ${m} мес.
            </option>
          `).join("")}
        </select>

        <div class="vip-price">
          ${(vip.price * vipMonths).toFixed(2)} USDT
        </div>

        <button class="detail-add-btn">Выбрать</button>
        <button class="detail-add-btn">Перейти к оплате</button>
      </div>
    </div>
  `;

  // period change
  document.getElementById("vipPeriod").onchange = e => {
    vipMonths = +e.target.value;
    renderVip();
  };

  initVipSwipe();
}

// ================= SWIPE =================
function initVipSwipe() {
  const el = document.getElementById("vipSwipe");
  let startX = 0;

  el.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  el.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;

    if (Math.abs(dx) < 50) return;

    if (dx < 0 && vipIndex < VIPS.length - 1) {
      vipIndex++;
    } else if (dx > 0 && vipIndex > 0) {
      vipIndex--;
    }

    renderVip();
  });
}
  /* ================== PROMO ================== */
  function renderPromo() {
    checkoutBtn.style.display = "none";
    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">Промокоды</div>
        <div style="opacity:.8;text-align:center">
          Раздел в разработке.
        </div>
      </div>
    `;
  }

  /* ================== ABOUT ================== */
  function renderAbout() {
    checkoutBtn.style.display = "none";
    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">О магазине</div>
        <div style="opacity:.85;line-height:1.6">
          COSMO SHOP — цифровой магазин с VIP доступами и эксклюзивным контентом.
        </div>
      </div>
    `;
  }

  /* ================== START ================== */
  navigate("catalog");
});