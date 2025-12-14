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
  const vipTiers = [
    { key: "bronze", title: "Bronze VIP", price: 9 },
    { key: "silver", title: "Silver VIP", price: 19 },
    { key: "gold", title: "Gold VIP", price: 35 },
    { key: "diamond", title: "Diamond VIP", price: 59 },
  ];
  const vipPeriods = [1, 3, 6, 12];
  let selectedVip = null;

  function renderVip() {
    checkoutBtn.style.display = "none";

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">VIP СТАТУС</div>
        <div class="vip-row">
          ${vipTiers.map(v => `
            <div class="vip-card vip-${v.key}" data-key="${v.key}">
              <div class="vip-check">✓</div>

              <div class="vip-rank">
                <div class="vip-badge">${v.title}</div>
                <div class="vip-crown"></div>
              </div>

              <div class="vip-hero ${v.key}">
                <div class="vip-aura ${v.key}"></div>
              </div>

              <div class="vip-desc">
                Эксклюзивный VIP доступ уровня ${v.title}.
              </div>

              <select class="vip-select">
                ${vipPeriods.map(m => `<option value="${m}">${m} мес.</option>`).join("")}
              </select>

              <button class="detail-add-btn vip-choose-btn">Выбрать</button>
            </div>
          `).join("")}
        </div>

        <div style="margin-top:14px">
          <button id="vipPay" class="detail-add-btn" disabled
            style="opacity:.6;cursor:not-allowed">
            Перейти к оплате
          </button>
        </div>
      </div>
    `;

    const cards = view.querySelectorAll(".vip-card");
    const payBtn = document.getElementById("vipPay");

    cards.forEach(card => {
      const btn = card.querySelector(".vip-choose-btn");
      const select = card.querySelector(".vip-select");
      const tier = vipTiers.find(v => v.key === card.dataset.key);

      btn.onclick = () => {
        cards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        const months = +select.value;
        selectedVip = {
          tier: tier.title,
          months,
          price: (tier.price * months).toFixed(2)
        };

        payBtn.disabled = false;
        payBtn.style.opacity = "1";
        payBtn.style.cursor = "pointer";
      };
    });

    payBtn.onclick = () => {
      if (!selectedVip) return;
      tg?.showAlert(
        `VIP: ${selectedVip.tier}\n` +
        `Период: ${selectedVip.months} мес.\n` +
        `Цена: ${selectedVip.price} USDT`
      );
    };
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