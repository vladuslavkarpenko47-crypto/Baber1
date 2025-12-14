document.addEventListener("DOMContentLoaded", () => {
  // ✅ защита: работает и в Telegram, и в браузере
  const tg = window.Telegram?.WebApp ?? {
    ready: () => {},
    expand: () => {},
    close: () => {},
    sendData: (x) => console.log("sendData:", x),
    showAlert: (t) => alert(t),
    onEvent: () => {},
    BackButton: { show: () => {}, hide: () => {} },
    hapticFeedback: { impactOccurred: () => {} },
  };

  tg.ready();
  tg.expand();

  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("sideMenuBackdrop");
  const checkoutBtn = document.getElementById("checkout");

  let total = 0;

  const products = [
    { id: 1, name: "AI Prompt Pack", price: 10 },
    { id: 2, name: "VIP Sample Pack", price: 15 },
    { id: 3, name: "Content Bundle", price: 12 },
    { id: 4, name: "Premium Presets", price: 8 },
  ];

  function openMenu() {
    sideMenu.classList.add("open");
    menuToggle.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    backdrop.style.display = "block";
  }

  function closeMenu() {
    sideMenu.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    backdrop.style.display = "none";
  }

  function toggleMenu() {
    if (sideMenu.classList.contains("open")) closeMenu();
    else openMenu();
  }

  function renderCatalog() {
    view.innerHTML = `
      <div class="product-list">
        ${products.map(p => `
          <div class="product">
            <h3>${p.name}</h3>
            <div>${p.price} USDT</div>
            <button data-id="${p.id}" type="button">Добавить</button>
          </div>
        `).join("")}
      </div>
    `;

    view.querySelectorAll(".product button").forEach(btn => {
      btn.onclick = () => {
        const id = +btn.dataset.id;
        const product = products.find(p => p.id === id);
        total += product.price;
        totalEl.textContent = total;
      };
    });
  }

  function renderSimple(text) {
    view.innerHTML = `<div style="padding:16px;text-align:center;">${text}</div>`;
  }

  // start
  renderCatalog();

  // menu handlers
  menuToggle.onclick = (e) => {
    e.preventDefault();
    toggleMenu();
  };

  backdrop.onclick = () => closeMenu();

  sideMenu.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const nav = btn.dataset.nav;
      closeMenu();

      if (nav === "catalog") renderCatalog();
      if (nav === "vip") renderSimple("VIP статусы (скоро)");
      if (nav === "promo") renderSimple("Промокоды (скоро)");
      if (nav === "about") renderSimple("COSMO SHOP — цифровые товары");
    };
  });

  // checkout
  checkoutBtn.onclick = () => {
    tg.sendData(JSON.stringify({ type: "order", total }));
    try { tg.close(); } catch {}
  };
});
