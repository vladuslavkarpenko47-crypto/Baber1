document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();
  tg?.expand();

  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("sideMenuBackdrop");

  let total = 0;

  const products = [
    { id: 1, name: "AI Prompt Pack", price: 10 },
    { id: 2, name: "VIP Sample Pack", price: 15 },
    { id: 3, name: "Content Bundle", price: 12 },
    { id: 4, name: "Premium Presets", price: 8 },
  ];

  function renderCatalog() {
    view.innerHTML = `
      <div class="product-list">
        ${products.map(p => `
          <div class="product">
            <h3>${p.name}</h3>
            <div>${p.price} USDT</div>
            <button data-id="${p.id}">Добавить</button>
          </div>
        `).join("")}
      </div>
    `;

    view.querySelectorAll("button").forEach(btn => {
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

  renderCatalog();

  menuToggle.onclick = () => {
    sideMenu.classList.add("open");
    backdrop.style.display = "block";
  };

  backdrop.onclick = () => {
    sideMenu.classList.remove("open");
    backdrop.style.display = "none";
  };

  sideMenu.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const nav = btn.dataset.nav;
      sideMenu.classList.remove("open");
      backdrop.style.display = "none";

      if (nav === "catalog") renderCatalog();
      if (nav === "vip") renderSimple("VIP статусы (скоро)");
      if (nav === "promo") renderSimple("Промокоды (скоро)");
      if (nav === "about") renderSimple("COSMO SHOP — цифровые товары");
    };
  });

  document.getElementById("checkout").onclick = () => {
    tg?.sendData(JSON.stringify({ total }));
    tg?.close();
  };
});
