document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    alert("Открой магазин через кнопку в боте");
    return;
  }

  tg.ready();
  tg.expand();
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

  // ===== BURGER MENU =====
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
  closeMenu();

  const toggleMenu = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const isOpen = sideMenu?.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  };

  menuToggle?.addEventListener("click", toggleMenu);
  menuToggle?.addEventListener("pointerup", toggleMenu);

  sideMenuBackdrop?.addEventListener("click", (e) => { e.stopPropagation(); closeMenu(); });
  sideMenuBackdrop?.addEventListener("pointerup", (e) => { e.stopPropagation(); closeMenu(); });

  // ===== STATE =====
  let currentView = "catalog";
  let lastMainView = "catalog";
  let lastDetailFrom = "catalog";
  let currentProductId = null;

  // ===== PRODUCTS (12 random, 1-3 images) =====
  const products = [
    {
      id: 1,
      name: "Neon Sticker Pack",
      short: "Digital PNG pack • 120 шт",
      full: "Набор неоновых стикеров для контента и сторис. PNG, прозрачный фон. Идеально для обложек, превью и оформления витрины.",
      priceUsdt: 6.5,
      discountPercent: 15,
      images: [
        "https://picsum.photos/seed/neonpack1/1100/800",
        "https://picsum.photos/seed/neonpack2/1100/800",
      ]
    },
    {
      id: 2,
      name: "AI Prompt Bundle",
      short: "500 промптов для моделей",
      full: "Сборник промптов: портреты, стиль, свет, позы, фотореал, апскейл. Быстро поднимает качество и скорость работы.",
      priceUsdt: 12,
      discountPercent: 25,
      images: [
        "https://picsum.photos/seed/promptbundle1/1100/800",
        "https://picsum.photos/seed/promptbundle2/1100/800",
        "https://picsum.photos/seed/promptbundle3/1100/800"
      ]
    },
    {
      id: 3,
      name: "Premium Backgrounds",
      short: "50 фонов 4K",
      full: "Коллекция премиум-фонов под обложки, посты и оформление профиля. 4K, стиль: dark luxury / minimal / cyber.",
      priceUsdt: 9,
      discountPercent: 10,
      images: [
        "https://picsum.photos/seed/backgrounds1/1100/800",
        "https://picsum.photos/seed/backgrounds2/1100/800",
      ]
    },
    {
      id: 4,
      name: "Video Intro Template",
      short: "Intro 10s • MP4",
      full: "Готовая короткая интро-заставка для твоих видео. Добавляешь ник/логотип и используешь. Быстро и красиво.",
      priceUsdt: 8,
      discountPercent: 0,
      images: [
        "https://picsum.photos/seed/videointro1/1100/800",
      ]
    },
    {
      id: 5,
      name: "Model Caption Pack",
      short: "200 подписей ENG/RU",
      full: "Подписи для постов: tease, лайфстайл, флирт, продажи, прогрев. Быстро вставляешь и публикуешь.",
      priceUsdt: 7.5,
      discountPercent: 20,
      images: [
        "https://picsum.photos/seed/captions1/1100/800",
        "https://picsum.photos/seed/captions2/1100/800",
      ]
    },
    {
      id: 6,
      name: "Profile Bio Set",
      short: "20 био-описаний",
      full: "Стильные био для профиля: серьёзно/дерзко/элитно. Можно комбинировать. Подходит под разные ниши.",
      priceUsdt: 5,
      discountPercent: 0,
      images: [
        "https://picsum.photos/seed/bioset1/1100/800",
      ]
    },
    {
      id: 7,
      name: "Luxury Icon Pack",
      short: "150 иконок • SVG/PNG",
      full: "Иконки премиум-стиля для интерфейса, страниц и карточек товаров. SVG/PNG, чёткие и лёгкие.",
      priceUsdt: 11,
      discountPercent: 18,
      images: [
        "https://picsum.photos/seed/iconpack1/1100/800",
        "https://picsum.photos/seed/iconpack2/1100/800",
      ]
    },
    {
      id: 8,
      name: "Photo Preset Pack",
      short: "12 пресетов (моб/ПК)",
      full: "Пресеты: мягкий свет, кино, глянец, контраст. Быстро делает картинку “дороже”.",
      priceUsdt: 10,
      discountPercent: 12,
      images: [
        "https://picsum.photos/seed/presets1/1100/800",
        "https://picsum.photos/seed/presets2/1100/800",
      ]
    },
    {
      id: 9,
      name: "Cover Design Kit",
      short: "Обложки + исходники",
      full: "Набор обложек для Telegram/соцсетей + исходники для редактирования. Готово для быстрого старта.",
      priceUsdt: 14,
      discountPercent: 30,
      images: [
        "https://picsum.photos/seed/coverkit1/1100/800",
        "https://picsum.photos/seed/coverkit2/1100/800",
        "https://picsum.photos/seed/coverkit3/1100/800",
      ]
    },
    {
      id: 10,
      name: "Chat Script Pack",
      short: "Скрипты для продаж",
      full: "Готовые сообщения: прогрев, ответы на возражения, закрытие сделки. Экономит время и увеличивает конверсию.",
      priceUsdt: 13,
      discountPercent: 22,
      images: [
        "https://picsum.photos/seed/chatscripts1/1100/800",
      ]
    },
    {
      id: 11,
      name: "VIP Content Samples",
      short: "10 примеров контента",
      full: "Структура, формат, подача и идеи, чтобы продавать лучше. Подходит для быстрых тестов и улучшения витрины.",
      priceUsdt: 9.5,
      discountPercent: 5,
      images: [
        "https://picsum.photos/seed/vipsamples1/1100/800",
        "https://picsum.photos/seed/vipsamples2/1100/800",
      ]
    },
    {
      id: 12,
      name: "Brand Color Palette",
      short: "30 палитр • HEX/RGB",
      full: "Палитры: тёмный премиум, gold, neon, minimal, cyber. Ускоряет дизайн и делает стиль единым.",
      priceUsdt: 4.5,
      discountPercent: 0,
      images: [
        "https://picsum.photos/seed/palettes1/1100/800",
      ]
    },
  ];

  // cart (qty per product)
  const cart = {};
  products.forEach(p => cart[p.id] = { qty: 0 });

  function discountedPrice(p) {
    const d = Math.max(0, Math.min(100, Number(p.discountPercent || 0)));
    return +(p.priceUsdt * (1 - d / 100)).toFixed(2);
  }

  function calcTotal() {
    let total = 0;
    products.forEach(p => {
      total += cart[p.id].qty * discountedPrice(p);
    });
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

    // если мы в деталке — вернёмся в каталог
    if (currentView === "detail") {
      navigate(lastDetailFrom || "catalog");
      return;
    }

    if (currentView === "about" || currentView === "promo" || currentView === "vip") {
      navigate(lastMainView || "catalog");
      return;
    }

    navigate("catalog");
  });

  // ===== CHECKOUT =====
  checkoutBtn.onclick = () => {
    const items = products
      .filter(p => cart[p.id].qty > 0)
      .map(p => ({ name: p.name, qty: cart[p.id].qty, priceUsdt: discountedPrice(p) }));

    if (!items.length) return tg.showAlert("Корзина пуста");

    const order = {
      type: "order",
      total_usdt: calcTotal(),
      items
    };

    tg.sendData(JSON.stringify(order));
    tg.close();
  };

  // ===== CATALOG (2 in a row, no top menu in content) =====
  function renderCatalog() {
    tg.BackButton.hide();
    setBottomBarVisible(true);
    updateBottomTotal();

    // ❗ НИКАКОГО меню вверху — только сетка товаров
    view.innerHTML = `
      <div class="product-list">
        ${products.map(p => {
          const newP = discountedPrice(p);
          const hasDisc = (p.discountPercent || 0) > 0;

          return `
            <div class="product-card" data-id="${p.id}" role="button" tabindex="0">
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

    view.querySelectorAll(".product-card").forEach(cardEl => {
      const id = +cardEl.dataset.id;
      const qtyEl = cardEl.querySelector("[data-qty]");
      const incBtn = cardEl.querySelector("[data-inc]");
      const decBtn = cardEl.querySelector("[data-dec]");
      const controls = cardEl.querySelector("[data-controls]");

      // +/- не должны открывать деталку
      incBtn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        cart[id].qty++;
        qtyEl.textContent = cart[id].qty;
        updateBottomTotal();
        tg.hapticFeedback?.impactOccurred?.("light");
      });

      decBtn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        if (cart[id].qty > 0) cart[id].qty--;
        qtyEl.textContent = cart[id].qty;
        updateBottomTotal();
        tg.hapticFeedback?.impactOccurred?.("light");
      });

      // клик по карточке (не по controls) открывает деталку
      cardEl.addEventListener("click", (e) => {
        if (controls.contains(e.target)) return;
        openDetail(id, "catalog");
      });

      // enter/space
      cardEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail(id, "catalog");
        }
      });
    });
  }

  // ===== DETAIL (slider + expandable description + qty + add) =====
  function openDetail(productId, from) {
    const p = products.find(x => x.id === productId);
    if (!p) return;

    currentView = "detail";
    lastDetailFrom = from || "catalog";
    currentProductId = productId;

    tg.BackButton.show();
    setBottomBarVisible(false);

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
          <span class="desc-arrow" aria-hidden="true">›</span>
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
      tg.hapticFeedback?.impactOccurred?.("light");
    };
    document.getElementById("dDec").onclick = () => {
      if (cart[p.id].qty > 0) cart[p.id].qty--;
      dQty.textContent = cart[p.id].qty;
      updateBottomTotal();
      tg.hapticFeedback?.impactOccurred?.("light");
    };

    document.getElementById("addBtn").onclick = () => {
      cart[p.id].qty++;
      dQty.textContent = cart[p.id].qty;
      updateBottomTotal();
      tg.hapticFeedback?.impactOccurred?.("medium");
    };

    // expandable description with animated arrow
    const toggle = document.getElementById("descToggle");
    const full = document.getElementById("descFull");
    toggle.onclick = () => {
      full.classList.toggle("visible");
      toggle.classList.toggle("open");
    };

    document.getElementById("backBtn").onclick = () => navigate("catalog");
  }

  // ===== VIP / PROMO / ABOUT (оставляем как есть у тебя, тут не трогаю) =====
  function renderVip() {
    tg.BackButton.show();
    setBottomBarVisible(false);
    view.innerHTML = `
      <div class="about-page">
        <h2>VIP</h2>
        <p style="text-align:center;opacity:.85">VIP-страница у тебя уже есть — оставляем как было.</p>
        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="vipBackBtn">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("vipBackBtn").onclick = () => navigate("catalog");
  }

  function renderPromo() {
    tg.BackButton.show();
    setBottomBarVisible(false);
    view.innerHTML = `
      <div class="about-page">
        <h2>Промокоды</h2>
        <p style="text-align:center;opacity:.85">Раздел промокодов подключим следующим шагом.</p>
        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="promoBackBtn">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("promoBackBtn").onclick = () => navigate("catalog");
  }

  function renderAbout() {
    tg.BackButton.show();
    setBottomBarVisible(false);
    view.innerHTML = `
      <div class="about-page">
        <h2>COSMO SHOP</h2>
        <p>COSMO SHOP — цифровой магазин внутри Telegram для покупки цифровых товаров и VIP-доступов.</p>
        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="aboutBackBtn">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("aboutBackBtn").onclick = () => navigate("catalog");
  }

  // START
  navigate("catalog");
});