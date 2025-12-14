document.addEventListener("DOMContentLoaded", () => {
  // ✅ работает и в Telegram, и в браузере (для проверки по ссылке)
  const tg = window.Telegram?.WebApp ?? {
    ready: () => {},
    expand: () => {},
    close: () => {},
    sendData: (x) => console.log("sendData:", x),
    showAlert: (x) => alert(x),
    onEvent: () => {},
    BackButton: { show: () => {}, hide: () => {} },
    hapticFeedback: { impactOccurred: () => {} },
  };

  tg.ready();
  tg.expand();
  setTimeout(() => tg.expand(), 60);
  setTimeout(() => tg.expand(), 250);

  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout");
  const bottomBar = document.querySelector(".bottom-bar");

  // menu
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const sideMenuBackdrop = document.getElementById("sideMenuBackdrop");

  function setBottomBarVisible(v) {
    if (!bottomBar) return;
    bottomBar.style.display = v ? "flex" : "none";
  }
  function openMenu() {
    sideMenu?.classList.add("open");
    sideMenuBackdrop?.classList.add("visible");
  }
  function closeMenu() {
    sideMenu?.classList.remove("open");
    sideMenuBackdrop?.classList.remove("visible");
  }
  closeMenu();

  const toggleMenu = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    sideMenu?.classList.contains("open") ? closeMenu() : openMenu();
  };

  menuToggle?.addEventListener("click", toggleMenu);
  menuToggle?.addEventListener("pointerup", toggleMenu);
  sideMenuBackdrop?.addEventListener("click", (e) => { e.stopPropagation(); closeMenu(); });
  sideMenuBackdrop?.addEventListener("pointerup", (e) => { e.stopPropagation(); closeMenu(); });

  // state
  let currentView = "catalog";
  let lastMainView = "catalog";

  // products
  const products = [
    { id: 1,  name: "Neon Sticker Pack",    short: "Digital PNG • 120 шт", full: "Набор неоновых стикеров для контента и сторис. PNG, прозрачный фон. Для обложек, превью и витрины.", priceUsdt: 6.5,  discountPercent: 15, images: ["https://picsum.photos/seed/p1a/1100/800","https://picsum.photos/seed/p1b/1100/800"] },
    { id: 2,  name: "AI Prompt Bundle",     short: "500 промптов",        full: "Портреты, стиль, свет, позы, фотореал, апскейл. Быстро даёт результат и поднимает качество.", priceUsdt: 12,   discountPercent: 25, images: ["https://picsum.photos/seed/p2a/1100/800","https://picsum.photos/seed/p2b/1100/800","https://picsum.photos/seed/p2c/1100/800"] },
    { id: 3,  name: "Premium Backgrounds",  short: "50 фонов 4K",         full: "Коллекция премиум-фонов: dark luxury / minimal / cyber. Под обложки, посты, профили.", priceUsdt: 9, discountPercent: 10, images: ["https://picsum.photos/seed/p3a/1100/800","https://picsum.photos/seed/p3b/1100/800"] },
    { id: 4,  name: "Video Intro Template", short: "Intro 10s • MP4",     full: "Короткая интро-заставка. Добавляешь ник/логотип — и готово.", priceUsdt: 8, discountPercent: 0, images: ["https://picsum.photos/seed/p4a/1100/800"] },
    { id: 5,  name: "Model Caption Pack",   short: "200 подписей ENG/RU", full: "Tease, лайфстайл, флирт, продажи, прогрев. Копируй и публикуй.", priceUsdt: 7.5, discountPercent: 20, images: ["https://picsum.photos/seed/p5a/1100/800","https://picsum.photos/seed/p5b/1100/800"] },
    { id: 6,  name: "Profile Bio Set",      short: "20 био-описаний",     full: "Серьёзно/дерзко/элитно. Можно комбинировать. Для разных ниш.", priceUsdt: 5, discountPercent: 0, images: ["https://picsum.photos/seed/p6a/1100/800"] },
    { id: 7,  name: "Luxury Icon Pack",     short: "150 иконок SVG/PNG",  full: "Иконки премиум-стиля для интерфейса и карточек. Чёткие и лёгкие.", priceUsdt: 11, discountPercent: 18, images: ["https://picsum.photos/seed/p7a/1100/800","https://picsum.photos/seed/p7b/1100/800"] },
    { id: 8,  name: "Photo Preset Pack",    short: "12 пресетов",         full: "Мягкий свет, кино, глянец, контраст. Делает картинку “дороже”.", priceUsdt: 10, discountPercent: 12, images: ["https://picsum.photos/seed/p8a/1100/800","https://picsum.photos/seed/p8b/1100/800"] },
    { id: 9,  name: "Cover Design Kit",     short: "Обложки + исходники", full: "Набор обложек + исходники для редактирования. Быстрый старт.", priceUsdt: 14, discountPercent: 30, images: ["https://picsum.photos/seed/p9a/1100/800","https://picsum.photos/seed/p9b/1100/800","https://picsum.photos/seed/p9c/1100/800"] },
    { id: 10, name: "Chat Script Pack",     short: "Скрипты продаж",      full: "Прогрев, возражения, закрытие сделки. Экономит время и повышает конверсию.", priceUsdt: 13, discountPercent: 22, images: ["https://picsum.photos/seed/p10a/1100/800"] },
    { id: 11, name: "VIP Samples",          short: "10 примеров",         full: "Формат, подача, идеи, чтобы продавать лучше. Для тестов и улучшения витрины.", priceUsdt: 9.5, discountPercent: 5, images: ["https://picsum.photos/seed/p11a/1100/800","https://picsum.photos/seed/p11b/1100/800"] },
    { id: 12, name: "Color Palette",        short: "30 палитр HEX/RGB",   full: "Тёмный премиум, gold, neon, minimal, cyber. Ускоряет дизайн.", priceUsdt: 4.5, discountPercent: 0, images: ["https://picsum.photos/seed/p12a/1100/800"] },
  ];

  const cart = {};
  products.forEach(p => (cart[p.id] = { qty: 0 }));

  function discountedPrice(p) {
    const d = Math.max(0, Math.min(100, Number(p.discountPercent || 0)));
    return +(p.priceUsdt * (1 - d / 100)).toFixed(2);
  }

  function calcTotal() {
    let t = 0;
    products.forEach(p => (t += cart[p.id].qty * discountedPrice(p)));
    return +t.toFixed(2);
  }

  function updateBottomTotal() {
    totalEl.textContent = calcTotal().toFixed(2);
  }

  // nav
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
    if (currentView === "detail") { renderCatalog(); return; }
    if (currentView === "vip" || currentView === "promo" || currentView === "about") {
      navigate(lastMainView || "catalog");
      return;
    }
    navigate("catalog");
  });

  // checkout
  checkoutBtn.onclick = () => {
    const items = products
      .filter(p => cart[p.id].qty > 0)
      .map(p => ({ name: p.name, qty: cart[p.id].qty, priceUsdt: discountedPrice(p) }));

    if (!items.length) return tg.showAlert("Корзина пуста");

    const order = { type: "order", total_usdt: calcTotal(), items };
    tg.sendData(JSON.stringify(order));
    tg.close();
  };

  // catalog
  function renderCatalog() {
    currentView = "catalog";
    tg.BackButton.hide();
    setBottomBarVisible(true);
    updateBottomTotal();

    view.innerHTML = `
      <div class="product-list">
        ${products.map(p => {
          const hasDisc = (p.discountPercent || 0) > 0;
          const newP = discountedPrice(p);
          return `
            <div class="product-card" data-id="${p.id}">
              <img class="product-thumb" src="${p.images[0]}" alt="${p.name}" loading="lazy">
              <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.short}</div>
                <div class="product-price-row">
                  ${hasDisc ? `<div class="old-price">${p.priceUsdt.toFixed(2)}</div>` : ``}
                  <div class="new-price">${newP.toFixed(2)} USDT</div>
                </div>
                <div class="product-controls" data-controls>
                  <button class="qty-btn" data-dec type="button">−</button>
                  <span class="quantity" data-qty>${cart[p.id].qty}</span>
                  <button class="qty-btn" data-inc type="button">+</button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    view.querySelectorAll(".product-card").forEach(card => {
      const id = +card.dataset.id;
      const controls = card.querySelector("[data-controls]");
      const qtyEl = card.querySelector("[data-qty]");

      card.querySelector("[data-inc]").addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        cart[id].qty++;
        qtyEl.textContent = cart[id].qty;
        updateBottomTotal();
      });

      card.querySelector("[data-dec]").addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        if (cart[id].qty > 0) cart[id].qty--;
        qtyEl.textContent = cart[id].qty;
        updateBottomTotal();
      });

      card.addEventListener("click", (e) => {
        if (controls.contains(e.target)) return;
        renderDetail(id);
      });
    });
  }

  // detail
  function renderDetail(productId) {
    currentView = "detail";
    tg.BackButton.show();
    setBottomBarVisible(false);

    const p = products.find(x => x.id === productId);
    if (!p) return renderCatalog();

    let idx = 0;
    const newP = discountedPrice(p);
    const hasDisc = (p.discountPercent || 0) > 0;

    view.innerHTML = `
      <div class="product-detail">
        <div class="detail-slider">
          <img class="detail-image" id="detailImg" src="${p.images[0]}" alt="${p.name}">
          ${p.images.length > 1 ? `
            <button class="slider-btn left" id="prevImg" type="button">‹</button>
            <button class="slider-btn right" id="nextImg" type="button">›</button>
          ` : ``}
        </div>

        <div class="product-detail-title">${p.name}</div>
        <div class="detail-price-row">
          ${hasDisc ? `<div class="old-price">${p.priceUsdt.toFixed(2)}</div>` : ``}
          <div class="new-price">${newP.toFixed(2)} USDT</div>
        </div>

        <div class="product-detail-short" id="descToggle">
          ${p.short}
          <span class="desc-arrow">›</span>
        </div>
        <div class="product-detail-full" id="descFull">${p.full}</div>

        <div class="detail-qty-row">
          <button class="qty-btn" id="dDec" type="button">−</button>
          <span class="quantity" id="dQty">${cart[p.id].qty}</span>
          <button class="qty-btn" id="dInc" type="button">+</button>
        </div>

        <button class="detail-add-btn" id="addBtn" type="button">Добавить</button>

        <div style="margin-top:12px;text-align:center;">
          <button class="detail-add-btn" id="backBtn" type="button">Назад</button>
        </div>
      </div>
    `;

    const imgEl = document.getElementById("detailImg");
    const prevBtn = document.getElementById("prevImg");
    const nextBtn = document.getElementById("nextImg");

    function setImg(i) {
      idx = i;
      imgEl.src = p.images[idx];
    }

    prevBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      setImg((idx - 1 + p.images.length) % p.images.length);
    });
    nextBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      setImg((idx + 1) % p.images.length);
    });

    const dQty = document.getElementById("dQty");
    document.getElementById("dInc").onclick = () => {
      cart[p.id].qty++;
      dQty.textContent = cart[p.id].qty;
      updateBottomTotal();
    };
    document.getElementById("dDec").onclick = () => {
      if (cart[p.id].qty > 0) cart[p.id].qty--;
      dQty.textContent = cart[p.id].qty;
      updateBottomTotal();
    };

    document.getElementById("addBtn").onclick = () => {
      cart[p.id].qty++;
      dQty.textContent = cart[p.id].qty;
      updateBottomTotal();
    };

    const toggle = document.getElementById("descToggle");
    const full = document.getElementById("descFull");
    toggle.onclick = () => {
      full.classList.toggle("visible");
      toggle.classList.toggle("open");
    };

    document.getElementById("backBtn").onclick = () => renderCatalog();
  }

  // pages
  function renderPromo() {
    currentView = "promo";
    tg.BackButton.show();
    setBottomBarVisible(false);
    view.innerHTML = `
      <div class="simple-page">
        <h2>Промокоды</h2>
        <p style="text-align:center;">Скоро подключим систему промокодов.</p>
        <div style="text-align:center;margin-top:14px;">
          <button class="detail-add-btn" id="b">Назад</button>
        </div>
      </div>`;
    document.getElementById("b").onclick = () => navigate("catalog");
  }

  function renderVip() {
    currentView = "vip";
    tg.BackButton.show();
    setBottomBarVisible(false);
    view.innerHTML = `
      <div class="simple-page">
        <h2>VIP статусы</h2>
        <p style="text-align:center;">VIP страницу следующим шагом приведём к твоему идеалу (карточки + выбор периода + оплата).</p>
        <div style="text-align:center;margin-top:14px;">
          <button class="detail-add-btn" id="v">Назад</button>
        </div>
      </div>`;
    document.getElementById("v").onclick = () => navigate("catalog");
  }

  function renderAbout() {
    currentView = "about";
    tg.BackButton.show();
    setBottomBarVisible(false);
    view.innerHTML = `
      <div class="simple-page">
        <h2>COSMO SHOP</h2>
        <p>COSMO SHOP — магазин в Telegram: товары, VIP и оплата в USDT.</p>
        <p>Добавляй товары в корзину и оформляй заказ. Далее подключим промокоды и VIP-оплаты.</p>
        <div style="text-align:center;margin-top:14px;">
          <button class="detail-add-btn" id="a">Назад</button>
        </div>
      </div>`;
    document.getElementById("a").onclick = () => navigate("catalog");
  }

  // start
  navigate("catalog");
});