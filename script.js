document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    alert("Открой магазин через кнопку в боте");
    return;
  }

  // ✅ чтобы не было “половины экрана”
  tg.ready();
  tg.expand();
  // иногда телеграм “сжимает” после рендера — повторяем
  setTimeout(() => tg.expand(), 50);
  setTimeout(() => tg.expand(), 250);

  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout");
  const bottomBar = document.querySelector(".bottom-bar");

  function setBottomBarVisible(visible) {
    if (!bottomBar) return;
    bottomBar.style.display = visible ? "flex" : "none";
  }

  // ===== MENU =====
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const sideMenuBackdrop = document.getElementById("sideMenuBackdrop");

  function openMenu() {
    sideMenu?.classList.add("open");
    sideMenuBackdrop?.classList.add("visible");
  }
  function closeMenu() {
    sideMenu?.classList.remove("open");
    sideMenuBackdrop?.classList.remove("visible");
  }

  // ✅ на старте принудительно закрываем (если backdrop “залип”)
  closeMenu();

  // ✅ делаем клик и на touch тоже
  const toggleMenu = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const isOpen = sideMenu?.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  };

  // ВАЖНО: ставим и click, и pointerup — на разных устройствах Telegram ведёт себя по-разному
  menuToggle?.addEventListener("click", toggleMenu);
  menuToggle?.addEventListener("pointerup", toggleMenu);

  sideMenuBackdrop?.addEventListener("click", (e) => { e.stopPropagation(); closeMenu(); });
  sideMenuBackdrop?.addEventListener("pointerup", (e) => { e.stopPropagation(); closeMenu(); });

  // ===== STATE =====
  let currentView = "catalog";
  let lastMainView = "catalog";

  // ===== PRODUCTS (demo) =====
  const products = [
    { id: 1, name: "Fox Toy", short: "Soft toy fox 25cm", priceUsdt: 10, discountPercent: 30, img: "https://picsum.photos/seed/fox1/800/600" },
    { id: 2, name: "Penguin", short: "Small cute penguin toy", priceUsdt: 12.5, discountPercent: 25, img: "https://picsum.photos/seed/penguin1/800/600" },
    { id: 3, name: "Toy Car", short: "Mini toy car (metal)", priceUsdt: 15, discountPercent: 15, img: "https://picsum.photos/seed/car1/800/600" },
    { id: 4, name: "Space Sticker Pack", short: "Digital pack (PNG)", priceUsdt: 7, discountPercent: 0, img: "https://picsum.photos/seed/stickers1/800/600" },
  ];

  const cart = {};
  products.forEach(p => cart[p.id] = { ...p, qty: 0 });

  function discountedPrice(p) {
    const d = Math.max(0, Math.min(100, Number(p.discountPercent || 0)));
    return +(p.priceUsdt * (1 - d / 100)).toFixed(2);
  }

  function calcTotal() {
    let total = 0;
    Object.values(cart).forEach(i => total += i.qty * discountedPrice(i));
    return +total.toFixed(2);
  }

  function updateBottomTotal() {
    totalEl.textContent = calcTotal().toFixed(2);
  }

  // ===== NAV =====
  function navigate(where) {
    closeMenu();
    currentView = where;

    if (where === "catalog" || where === "vip") lastMainView = where;

    if (where === "catalog") renderCatalog();
    if (where === "vip") renderVip();
    if (where === "promo") renderPromo();
    if (where === "about") renderAbout();
  }

  document.querySelectorAll("#sideMenu .side-menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const nav = btn.getAttribute("data-nav");
      if (nav) navigate(nav);
    });
  });

  tg.onEvent("backButtonClicked", () => {
    if (sideMenu?.classList.contains("open")) { closeMenu(); return; }
    if (currentView === "about" || currentView === "promo") { navigate(lastMainView || "catalog"); return; }
    navigate("catalog");
  });

  // ===== CHECKOUT BTN =====
  checkoutBtn.onclick = () => tg.showAlert("Оформление подключим позже (демо)");

  // ===== CATALOG =====
  function renderCatalog() {
    tg.BackButton.hide();
    setBottomBarVisible(true);
    updateBottomTotal();

    view.innerHTML = `
      <div class="product-list">
        ${products.map(p => {
          const newP = discountedPrice(p);
          const hasDisc = (p.discountPercent || 0) > 0;
          return `
            <div class="product-card" data-id="${p.id}">
              <img class="product-thumb" src="${p.img}" alt="${p.name}">
              <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.short}</div>

                <div class="product-price-row">
                  ${hasDisc ? `<div class="old-price">${p.priceUsdt.toFixed(2)}</div>` : ``}
                  <div class="new-price">${newP.toFixed(2)} USDT</div>
                </div>

                <div class="product-controls">
                  <button class="qty-btn" data-dec>−</button>
                  <span class="quantity" data-qty>${cart[p.id].qty}</span>
                  <button class="qty-btn" data-inc>+</button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    view.querySelectorAll(".product-card").forEach(cardEl => {
      const id = +cardEl.dataset.id;
      const qtyEl = cardEl.querySelector("[data-qty]");

      cardEl.querySelector("[data-inc]").addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        cart[id].qty++;
        qtyEl.textContent = cart[id].qty;
        updateBottomTotal();
      });

      cardEl.querySelector("[data-dec]").addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        if (cart[id].qty > 0) cart[id].qty--;
        qtyEl.textContent = cart[id].qty;
        updateBottomTotal();
      });
    });
  }

  // ===== VIP (пока заглушка-страница, чтобы не ломать) =====
  function renderVip() {
    tg.BackButton.show();
    setBottomBarVisible(false);

    view.innerHTML = `
      <div class="about-page">
        <h2>VIP СТАТУСЫ</h2>
        <p style="text-align:center;opacity:.85">VIP-страницу доделаем дальше (с карточками и выбором).</p>
        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="vipBackBtn">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("vipBackBtn").onclick = () => navigate("catalog");
  }

  // ===== PROMO =====
  function renderPromo() {
    tg.BackButton.show();
    setBottomBarVisible(false);

    view.innerHTML = `
      <div class="about-page">
        <h2>ПРОМОКОДЫ</h2>
        <p style="text-align:center;opacity:.85">Раздел промокодов подключим следующим шагом.</p>
        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="promoBackBtn">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("promoBackBtn").onclick = () => navigate("catalog");
  }

  // ===== ABOUT (ОДИН текст) =====
  function renderAbout() {
    tg.BackButton.show();
    setBottomBarVisible(false);

    view.innerHTML = `
      <div class="about-page">
        <h2>COSMO SHOP</h2>

        <p>
          COSMO SHOP — цифровой магазин внутри Telegram для покупки цифровых товаров и VIP-доступов.
        </p>

        <p>
          Заказы оформляются в WebApp: выбираешь товар, добавляешь в корзину и отправляешь заказ в бота.
        </p>

        <p>
          Оплата принимается в USDT. После оплаты ты получаешь подтверждение и дальнейшие инструкции/выдачу.
        </p>

        <p>
          Магазин развивается: новые товары, обновления интерфейса и новые функции добавляются постепенно.
        </p>

        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="aboutBackBtn">Назад</button>
        </div>

        <p class="about-footer">© COSMO SHOP</p>
      </div>
    `;

    document.getElementById("aboutBackBtn").onclick = () => navigate("catalog");
  }

  // START
  navigate("catalog");
});