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

  function hapticLight() {
    try {
      // Telegram поддерживает разные сигналы, но иногда доступность отличается
      tg.hapticFeedback?.impactOccurred?.("light");
    } catch {
      try { tg.hapticFeedback?.impactOccurred?.(); } catch {}
    }
  }

  function lockScroll(lock) {
    // для webview: блокируем скролл, когда меню открыто
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function isMenuOpen() {
    return sideMenu?.classList.contains("open");
  }

  function openMenu() {
    sideMenu?.classList.add("open");
    sideMenuBackdrop?.classList.add("visible");
    menuToggle?.classList.add("open");
    menuToggle?.setAttribute("aria-expanded", "true");
    lockScroll(true);
    hapticLight();
  }

  function closeMenu() {
    sideMenu?.classList.remove("open");
    sideMenuBackdrop?.classList.remove("visible");
    menuToggle?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    lockScroll(false);
  }

  function toggleMenu(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (isMenuOpen()) closeMenu();
    else openMenu();
  }

  // Важно: НЕ вешаем и click и pointerup одновременно — иначе в тач-среде меню откроется и сразу закроется
  menuToggle?.addEventListener("pointerup", toggleMenu);

  // анти-ghost: иногда после pointer события прилетает "клик"
  menuToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  sideMenuBackdrop?.addEventListener("pointerup", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  // закрытие по тапу вне меню (на всякий)
  document.addEventListener("pointerup", (e) => {
    if (!isMenuOpen()) return;
    const t = e.target;
    if (sideMenu?.contains(t)) return;
    if (menuToggle?.contains(t)) return;
    closeMenu();
  });

  // свайп влево для закрытия меню
  let startX = null;
  sideMenu?.addEventListener("touchstart", (e) => {
    if (!isMenuOpen()) return;
    startX = e.touches?.[0]?.clientX ?? null;
  }, { passive: true });

  sideMenu?.addEventListener("touchmove", (e) => {
    if (startX == null) return;
    const x = e.touches?.[0]?.clientX ?? startX;
    const dx = x - startX;
    // если свайпнули влево ощутимо
    if (dx < -60) {
      startX = null;
      closeMenu();
    }
  }, { passive: true });

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
    if (isMenuOpen()) { closeMenu(); return; }
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
    <div class="vip-cta">
      <div class="vip-cta-text">
        <div class="vip-cta-title">VIP статус</div>
        <div class="vip-cta-sub">Выбери Bronze / Silver / Gold / Diamond</div>
      </div>
      <button class="detail-add-btn vip-cta-btn" id="goVip" type="button">Открыть</button>
    </div>

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

  // VIP button
  document.getElementById("goVip").onclick = () => navigate("vip");

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

  const vipPlans = [
    {
      id: "bronze",
      name: "Bronze VIP",
      badge: "Start",
      icon: "🥉",
      description: "Базовый VIP доступ для старта. Отлично, чтобы попробовать VIP-формат.",
      perks: [
        "Доступ к закрытым VIP-подборкам",
        "Ранний доступ к новинкам",
        "Приоритет в поддержке (стандарт)"
      ],
      monthlyPrice: 19
    },
    {
      id: "silver",
      name: "Silver VIP",
      badge: "Plus",
      icon: "🥈",
      description: "Больше материалов и выгоднее цена на срок. Для регулярных покупок.",
      perks: [
        "Всё из Bronze + расширенные наборы",
        "Скидки на новые релизы",
        "Приоритет поддержки (выше)"
      ],
      monthlyPrice: 29
    },
    {
      id: "gold",
      name: "Gold VIP",
      badge: "Best",
      icon: "🥇",
      description: "Максимум пользы и лучшие подборки. Самый популярный уровень.",
      perks: [
        "Всё из Silver + топовые премиум-материалы",
        "Еженедельные эксклюзивы",
        "Самый высокий приоритет поддержки"
      ],
      monthlyPrice: 49
    },
    {
      id: "diamond",
      name: "Diamond VIP",
      badge: "Elite",
      icon: "💎",
      description: "Элитный VIP: максимум доступа и самый мощный пакет преимуществ.",
      perks: [
        "Всё из Gold + эксклюзивные редкие релизы",
        "Индивидуальные подборки (по запросу)",
        "Персональный приоритет поддержки"
      ],
      monthlyPrice: 79
    }
  ];

  const monthsOptions = [1, 3, 6, 12];

  // выбранные значения
  let selectedPlanId = null;
  const selectedMonthsByPlan = {};
  vipPlans.forEach(p => selectedMonthsByPlan[p.id] = 1);

  function calcVipPrice(plan, months) {
    // можно сделать скидку за срок (лёгкая, выглядит “по-взрослому”)
    let coef = 1;
    if (months === 3) coef = 0.95;
    if (months === 6) coef = 0.90;
    if (months === 12) coef = 0.85;
    return +(plan.monthlyPrice * months * coef).toFixed(2);
  }

  function haptic() {
    try { tg.hapticFeedback?.impactOccurred?.("light"); } catch {}
  }

  view.innerHTML = `
    <div class="vip-page">
      <div class="vip-top">
        <h2>VIP статус</h2>
        <p>Выбери VIP и период (в месяцах). Нажми “Выбрать” — и я отправлю заявку в бота.</p>
      </div>

      <div class="vip-row">
        ${vipPlans.map(plan => {
          const m = selectedMonthsByPlan[plan.id];
          const price = calcVipPrice(plan, m);
          return `
            <div class="vip-cardx" data-plan="${plan.id}">
              <div class="vip-headx">
                <div class="vip-namex">${plan.name}</div>
                <div class="vip-badgex">${plan.badge}</div>
              </div>

              <div class="vip-art ${plan.id}">
                <div class="vip-orb"></div>
                <div class="vip-spark"></div>
                <div class="vip-icon">${plan.icon}</div>
              </div>

              <div class="vip-desc">${plan.description}</div>

              <ul class="vip-listx">
                ${plan.perks.map(x => `<li>${x}</li>`).join("")}
              </ul>

              <div class="vip-months" data-months>
                ${monthsOptions.map(mm => `
                  <button class="vip-chip ${mm === 1 ? "active" : ""}" data-m="${mm}" type="button">${mm} мес</button>
                `).join("")}
              </div>

              <div class="vip-pricex" data-price>${price.toFixed(2)} USDT</div>
              <div class="vip-timehint">Срок: <b data-time>${m}</b> мес</div>

              <button class="detail-add-btn vip-select-btn" data-select type="button">Выбрать</button>
            </div>
          `;
        }).join("")}
      </div>

      <div style="text-align:center;margin-top:4px;">
        <button class="detail-add-btn" id="vipBack" type="button">Назад</button>
      </div>
    </div>
  `;

  // навесим обработчики на карточки
  view.querySelectorAll(".vip-cardx").forEach(card => {
    const planId = card.getAttribute("data-plan");
    const plan = vipPlans.find(p => p.id === planId);

    const monthsWrap = card.querySelector("[data-months]");
    const priceEl = card.querySelector("[data-price]");
    const timeEl = card.querySelector("[data-time]");
    const selectBtn = card.querySelector("[data-select]");

    // выбор месяцев
    monthsWrap.querySelectorAll(".vip-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const mm = Number(chip.getAttribute("data-m"));
        selectedMonthsByPlan[planId] = mm;

        monthsWrap.querySelectorAll(".vip-chip").forEach(x => x.classList.remove("active"));
        chip.classList.add("active");

        const newPrice = calcVipPrice(plan, mm);
        priceEl.textContent = `${newPrice.toFixed(2)} USDT`;
        timeEl.textContent = `${mm}`;

        // если уже выбран этот план — усилим визуально
        if (selectedPlanId === planId) {
          selectBtn.classList.add("selected");
        }

        haptic();
      });
    });

    // выбрать план
    selectBtn.addEventListener("click", (e) => {
      e.preventDefault();

      selectedPlanId = planId;

      // подсветка выбранной карточки + кнопки
      view.querySelectorAll(".vip-cardx").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");

      view.querySelectorAll(".vip-select-btn").forEach(b => b.classList.remove("selected"));
      selectBtn.classList.add("selected");

      const months = selectedMonthsByPlan[planId];
      const price = calcVipPrice(plan, months);

      // отправляем в бота (потом привяжем оплату)
      const payload = {
        type: "vip",
        plan_id: planId,
        plan_name: plan.name,
        months,
        price_usdt: price
      };

      tg.sendData(JSON.stringify(payload));
      haptic();
      tg.showAlert(`Выбран: ${plan.name} • ${months} мес • ${price.toFixed(2)} USDT`);
    });

    // кликом по карточке тоже выбираем (удобно)
    card.addEventListener("click", (e) => {
      // если клик по кнопке/чипам — не дублируем
      if (e.target.closest(".vip-chip") || e.target.closest("[data-select]")) return;
      selectBtn.click();
    });
  });

  document.getElementById("vipBack").onclick = () => navigate("catalog");
}