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

  // ===== 12 PRODUCTS (RANDOM DEMO) =====
  // Фото берём с picsum — разные seed, чтобы не повторялось
  const products = [
    { id: 1,  name: "Neon Sticker Pack",        short: "Digital PNG pack • 120 шт",     full: "Набор неоновых стикеров для контента и сторис. PNG, прозрачный фон.", priceUsdt: 6.5,  discountPercent: 15, img: "https://picsum.photos/seed/neonpack/900/700" },
    { id: 2,  name: "AI Prompt Bundle",         short: "500 промптов для моделей",      full: "Сборник промптов: портреты, стиль, свет, позы, апскейл, фотореал.",    priceUsdt: 12,   discountPercent: 25, img: "https://picsum.photos/seed/promptbundle/900/700" },
    { id: 3,  name: "Premium Backgrounds",      short: "50 фонов 4K",                   full: "Коллекция премиум-фонов под обложки, посты и оформление профиля.",   priceUsdt: 9,    discountPercent: 10, img: "https://picsum.photos/seed/backgrounds4k/900/700" },
    { id: 4,  name: "Video Intro Template",     short: "Intro 10s • MP4",               full: "Готовая короткая интро-заставка для твоих видео. Быстро и красиво.",  priceUsdt: 8,    discountPercent: 0,  img: "https://picsum.photos/seed/videointro/900/700" },
    { id: 5,  name: "Model Caption Pack",       short: "200 подписей ENG/RU",           full: "Подписи для постов: флирт, лайфстайл, tease, продажи, промо.",        priceUsdt: 7.5,  discountPercent: 20, img: "https://picsum.photos/seed/captions/900/700" },
    { id: 6,  name: "Profile Bio Set",          short: "20 био-описаний",               full: "Стильные био для профиля: серьёзно/дерзко/элитно. Легко копировать.", priceUsdt: 5,    discountPercent: 0,  img: "https://picsum.photos/seed/bioset/900/700" },
    { id: 7,  name: "Luxury Icon Pack",         short: "150 иконок • SVG/PNG",          full: "Иконки премиум-стиля для интерфейса, страниц и карточек товаров.",     priceUsdt: 11,   discountPercent: 18, img: "https://picsum.photos/seed/iconpack/900/700" },
    { id: 8,  name: "Photo Preset Pack",        short: "12 пресетов (моб/ПК)",          full: "Пресеты для улучшения контента: мягкий свет, кино, глянец, контраст.", priceUsdt: 10,   discountPercent: 12, img: "https://picsum.photos/seed/presets/900/700" },
    { id: 9,  name: "Cover Design Kit",         short: "Обложки + PSD исходники",       full: "Набор обложек для Telegram/соцсетей + editable PSD/шрифты.",           priceUsdt: 14,   discountPercent: 30, img: "https://picsum.photos/seed/coverkit/900/700" },
    { id: 10, name: "Chat Script Pack",         short: "Скрипты для продаж",            full: "Готовые сообщения: прогрев, ответы на возражения, закрытие сделки.",  priceUsdt: 13,   discountPercent: 22, img: "https://picsum.photos/seed/chatscripts/900/700" },
    { id: 11, name: "VIP Content Samples",      short: "10 примеров контента",          full: "Пак примеров: структура, формат, подача и идеи, чтобы продавать лучше.", priceUsdt: 9.5, discountPercent: 5,  img: "https://picsum.photos/seed/vipsamples/900/700" },
    { id: 12, name: "Brand Color Palette",      short: "30 палитр • HEX/RGB",           full: "Палитры для бренда: тёмный премиум, gold, neon, minimal, cyber.",     priceUsdt: 4.5,  discountPercent: 0,  img: "https://picsum.photos/seed/palettes/900/700" },
  ];

  // cart
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
    if (currentView === "about" || currentView === "promo" || currentView === "vip") {
      navigate(lastMainView || "catalog");
      return;
    }
    navigate("catalog");
  });

  // ===== CHECKOUT =====
  checkoutBtn.onclick = () => {
    const items = Object.values(cart).filter(i => i.qty > 0);
    if (!items.length) return tg.showAlert("Корзина пуста");

    const order = {
      type: "order",
      total_usdt: calcTotal(),
      items: items.map(i => ({
        name: i.name,
        qty: i.qty,
        priceUsdt: discountedPrice(i)
      }))
    };

    // если ты пока не подключаешь бота к заказам — можешь оставить showAlert
    // tg.showAlert("Заказ отправлен (демо)");
    tg.sendData(JSON.stringify(order));
    tg.close();
  };

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
              <img class="product-thumb" src="${p.img}" alt="${p.name}" loading="lazy">
              <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.short}</div>

                <div class="product-price-row">
                  ${hasDisc ? `<div class="old-price">${p.priceUsdt.toFixed(2)}</div>` : ``}
                  <div class="new-price">${newP.toFixed(2)} USDT</div>
                </div>

                <div class="product-controls">
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
    });
  }

  // ===== VIP (оставляем как было у тебя — если хочешь, дальше улучшим дизайн) =====
  // Здесь оставь свой renderVip() с карточками VIP (который мы вернули ранее).
  // Чтобы сейчас ничего не сломать — делаю стабильную версию с карточками.
  let vipHintTimer = null;
  const vipTiers = [
    { key: "bronze",  title: "Bronze VIP",  color: "#cd7f32", pricePerMonth: 9.99,  desc: "Базовый VIP для старта.", benefits: ["VIP-товары", "Скидки", "Ранний доступ"] },
    { key: "silver",  title: "Silver VIP",  color: "#d2d2d2", pricePerMonth: 19.99, desc: "Баланс цены и привилегий.", benefits: ["Всё из Bronze", "Выше скидки", "Приоритет"] },
    { key: "gold",    title: "Gold VIP",    color: "#ffd700", pricePerMonth: 34.99, desc: "Премиум уровень.", benefits: ["Всё из Silver", "Эксклюзивы", "Лучшая выгода"] },
    { key: "diamond", title: "Diamond VIP", color: "#78dcff", pricePerMonth: 59.99, desc: "Максимальный доступ.", benefits: ["Макс скидки", "Закрытый контент", "Личный приоритет", "Бонусы"] },
  ];
  const vipPeriods = [1, 3, 6, 12];
  let selectedVip = null;

  function calcVipPrice(base, months) {
    let k = 1;
    if (months === 3) k = 0.97;
    if (months === 6) k = 0.93;
    if (months === 12) k = 0.88;
    return +(base * months * k).toFixed(2);
  }

  function renderVip() {
    tg.BackButton.show();
    setBottomBarVisible(false);
    selectedVip = null;

    view.innerHTML = `
      <div class="vip-page" style="padding:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0 12px;">
          <div style="font-size:20px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;">VIP статусы</div>
          <div style="font-size:12px;opacity:.7;white-space:nowrap;">Листай →</div>
        </div>

        <div class="vip-row" id="vipRow" style="display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory;">
          ${vipTiers.map(v => `
            <div class="vip-card" data-key="${v.key}"
              style="min-width:270px;flex:0 0 auto;scroll-snap-align:start;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:14px;position:relative;box-shadow:0 10px 24px rgba(0,0,0,.85);">
              <div class="vip-check"
                style="position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);display:grid;place-items:center;font-weight:900;opacity:0;transform:scale(.85);transition:.18s ease;">✓</div>

              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.35);">
                  <span style="width:10px;height:10px;border-radius:999px;background:${v.color};display:inline-block"></span>
                  ${v.title}
                </div>
                <div style="width:34px;height:34px;border-radius:12px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.35);color:${v.color};">👑</div>
              </div>

              <div style="height:120px;border-radius:16px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:radial-gradient(circle at top, ${v.color}33, rgba(0,0,0,.85) 65%);">
                <div style="position:absolute;inset:0;opacity:.22;pointer-events:none;
                  background-image: radial-gradient(circle, rgba(255,255,255,.18) 0 1px, transparent 2px),
                                   radial-gradient(circle, rgba(255,255,255,.12) 0 1px, transparent 2px);
                  background-size:26px 26px, 44px 44px;
                  animation: vipDrift 8s ease-in-out infinite;"></div>
                <div style="position:absolute;inset:-40%;filter:blur(26px);opacity:.16;transform:scale(1);
                  background: radial-gradient(circle, ${v.color}66, transparent 60%);
                  animation: vipBreath 5.5s ease-in-out infinite;"></div>
              </div>

              <div style="margin:12px 0 6px;font-size:16px;font-weight:950;">${v.title}</div>
              <div style="font-size:13px;opacity:.86;line-height:1.45;">${v.desc}</div>

              <ul style="margin:10px 0 0;padding-left:18px;">
                ${v.benefits.map(b => `<li style="font-size:13px;margin:6px 0;opacity:.92;">${b}</li>`).join("")}
              </ul>

              <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.10);">
                <div>
                  <div style="font-size:12px;opacity:.75;">Цена:</div>
                  <div data-price style="font-weight:950;font-size:18px;">${calcVipPrice(v.pricePerMonth, 1)} USDT</div>
                </div>
                <div style="font-size:12px;opacity:.75;text-align:right;">Период: <b data-period-label>1 мес.</b></div>
              </div>

              <select data-period style="width:100%;margin-top:10px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.20);background:rgba(0,0,0,.50);color:#fff;">
                ${vipPeriods.map(m => `<option value="${m}">${m} мес.</option>`).join("")}
              </select>

              <button class="detail-add-btn" data-choose style="margin-top:10px;width:100%;">Выбрать</button>
            </div>
          `).join("")}
        </div>

        <div style="margin-top:14px;display:flex;flex-direction:column;gap:10px;">
          <button id="vipPayBtn" class="detail-add-btn" disabled style="opacity:.6;cursor:not-allowed;width:100%;">Перейти к оплате</button>
          <button id="vipBackBtn" class="detail-add-btn" style="width:100%;">Назад</button>
        </div>

        <style>
          @keyframes vipBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
          @keyframes vipDrift  { 0%,100%{transform:translate(-1%,-1%)} 50%{transform:translate(1%,1%)} }
        </style>
      </div>
    `;

    const vipRow = document.getElementById("vipRow");
    const cards = Array.from(view.querySelectorAll(".vip-card"));
    const payBtn = document.getElementById("vipPayBtn");

    function setPayEnabled(enabled) {
      payBtn.disabled = !enabled;
      payBtn.style.opacity = enabled ? "1" : "0.6";
      payBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }
    setPayEnabled(false);

    if (vipHintTimer) clearInterval(vipHintTimer);
    let dir = 1;
    vipHintTimer = setInterval(() => {
      if (!vipRow) return;
      vipRow.scrollBy({ left: 18 * dir, behavior: "smooth" });
      dir *= -1;
    }, 7000);

    cards.forEach(card => {
      const key = card.dataset.key;
      const tier = vipTiers.find(x => x.key === key);

      const periodSelect = card.querySelector("[data-period]");
      const priceEl = card.querySelector("[data-price]");
      const periodLabel = card.querySelector("[data-period-label]");
      const chooseBtn = card.querySelector("[data-choose]");
      const check = card.querySelector(".vip-check");

      periodSelect.addEventListener("change", () => {
        const months = +periodSelect.value;
        const price = calcVipPrice(tier.pricePerMonth, months);
        priceEl.textContent = `${price} USDT`;
        periodLabel.textContent = `${months} мес.`;
        if (selectedVip?.key === key) selectedVip = { key, months, price, title: tier.title };
      });

      chooseBtn.addEventListener("click", () => {
        cards.forEach(c => {
          c.classList.remove("selected");
          const ck = c.querySelector(".vip-check");
          if (ck) { ck.style.opacity = "0"; ck.style.transform = "scale(.85)"; }
          c.style.borderColor = "rgba(255,255,255,.12)";
        });

        card.classList.add("selected");
        card.style.borderColor = "rgba(255,219,120,.95)";
        if (check) { check.style.opacity = "1"; check.style.transform = "scale(1)"; }

        const months = +periodSelect.value;
        const price = calcVipPrice(tier.pricePerMonth, months);

        selectedVip = { key, months, price, title: tier.title };
        setPayEnabled(true);
        tg.hapticFeedback?.impactOccurred?.("light");
      });
    });

    payBtn.addEventListener("click", () => {
      if (!selectedVip) return;
      tg.showAlert(`VIP: ${selectedVip.title}\nПериод: ${selectedVip.months} мес.\nЦена: ${selectedVip.price} USDT\n\nОплату подключим позже.`);
    });

    document.getElementById("vipBackBtn").onclick = () => navigate("catalog");
  }

  // ===== PROMO =====
  function renderPromo() {
    tg.BackButton.show();
    setBottomBarVisible(false);

    view.innerHTML = `
      <div class="about-page" style="padding:16px;line-height:1.6;">
        <h2 style="text-align:center;margin:10px 0 12px;letter-spacing:.12em;text-transform:uppercase;">Промокоды</h2>
        <p style="text-align:center;opacity:.85">Раздел промокодов подключим следующим шагом.</p>
        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="promoBackBtn">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("promoBackBtn").onclick = () => navigate("catalog");
  }

  // ===== ABOUT =====
  function renderAbout() {
    tg.BackButton.show();
    setBottomBarVisible(false);

    view.innerHTML = `
      <div class="about-page" style="padding:16px;line-height:1.6;">
        <h2 style="text-align:center;margin:10px 0 12px;letter-spacing:.12em;text-transform:uppercase;">COSMO SHOP</h2>

        <p style="font-size:14px;opacity:.9;margin-bottom:10px;">
          COSMO SHOP — цифровой магазин внутри Telegram для покупки цифровых товаров и VIP-доступов.
        </p>
        <p style="font-size:14px;opacity:.9;margin-bottom:10px;">
          Выбирай товары в каталоге, добавляй в корзину и оформляй заказ.
        </p>
        <p style="font-size:14px;opacity:.9;margin-bottom:10px;">
          Оплата принимается в USDT. После оплаты ты получаешь подтверждение и выдачу товара.
        </p>

        <div style="margin-top:14px;text-align:center;">
          <button class="detail-add-btn" id="aboutBackBtn">Назад</button>
        </div>

        <p style="text-align:center;margin-top:18px;opacity:.6;font-size:12px;">© COSMO SHOP</p>
      </div>
    `;
    document.getElementById("aboutBackBtn").onclick = () => navigate("catalog");
  }

  // START
  navigate("catalog");
});