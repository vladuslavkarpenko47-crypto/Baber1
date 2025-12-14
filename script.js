
document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    alert("Открой магазин через кнопку в боте");
    return;
  }

  tg.ready();
  tg.expand();

  // ====== ДАННЫЕ ТОВАРОВ (как было) ======
  const products = [
    { id: 1, name: "Fox Toy", priceUsdt: 10 },
    { id: 2, name: "Penguin", priceUsdt: 12.5 },
    { id: 3, name: "Toy Car", priceUsdt: 15 },
  ];

  // ====== КОРЗИНА (как было) ======
  const cart = {};
  products.forEach((p) => (cart[p.id] = { ...p, qty: 0 }));

  // ====== DOM ======
  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout");

  // ====== БУРГЕР-МЕНЮ ======
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

  menuToggle?.addEventListener("click", () => {
    const isOpen = sideMenu?.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });
  sideMenuBackdrop?.addEventListener("click", closeMenu);

  // ====== NAVIGATION ======
  let currentView = "catalog";

  function navigate(where) {
    closeMenu();
    if (where === "catalog") renderCatalog();
    if (where === "about") renderAbout();
    if (where === "promo") renderPromo();
    if (where === "vip") renderVip();
  }

  // Кнопки меню: работают по data-nav, если его нет — по тексту кнопки
  function bindSideMenuButtons() {
    const btns = document.querySelectorAll("#sideMenu .side-menu-btn");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const nav = btn.getAttribute("data-nav");
        if (nav) return navigate(nav);

        const txt = (btn.textContent || "").toLowerCase().trim();
        if (txt.includes("каталог")) return navigate("catalog");
        if (txt.includes("промо")) return navigate("promo");
        if (txt.includes("о магазин")) return navigate("about");
        if (txt.includes("vip")) return navigate("vip");
      });
    });
  }
  bindSideMenuButtons();

  // Telegram back button: закрыть меню / вернуться в каталог
  tg.onEvent("backButtonClicked", () => {
    if (sideMenu?.classList.contains("open")) closeMenu();
    else navigate("catalog");
  });

  // ====== HELPERS ======
  function renderTotal() {
    let total = 0;
    Object.values(cart).forEach((i) => (total += i.qty * i.priceUsdt));
    totalEl.textContent = total.toFixed(2);
  }

  // ====== КАТАЛОГ (не ломаю, как было) ======
  function renderCatalog() {
    currentView = "catalog";
    tg.BackButton.hide();

    view.innerHTML = products
      .map(
        (p) => `
      <div style="padding:12px;border:1px solid #ccc;margin:6px">
        <b>${p.name}</b> — ${p.priceUsdt} USDT
        <button onclick="dec(${p.id})">−</button>
        <span>${cart[p.id].qty}</span>
        <button onclick="inc(${p.id})">+</button>
      </div>
    `
      )
      .join("");

    renderTotal();
    if (checkoutBtn) checkoutBtn.style.display = "";
  }

  function renderAbout() {
    currentView = "about";
    tg.BackButton.show();

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">О магазине</div>
        <div style="opacity:0.9;line-height:1.6">
          Здесь будет твой текст “о магазине”.
        </div>
        <div style="margin-top:14px">
          <button class="detail-add-btn" id="goBackAbout">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("goBackAbout").onclick = () => navigate("catalog");
    if (checkoutBtn) checkoutBtn.style.display = "none";
  }

  function renderPromo() {
    currentView = "promo";
    tg.BackButton.show();

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">Промокоды</div>
        <div style="opacity:0.9;line-height:1.6">
          Здесь будет ввод промокода и применение скидки (позже подключим).
        </div>
        <div style="margin-top:14px">
          <button class="detail-add-btn" id="goBackPromo">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("goBackPromo").onclick = () => navigate("catalog");
    if (checkoutBtn) checkoutBtn.style.display = "none";
  }

  // ====== VIP (улучшенный визуал, разные короны, рандом тексты/цены для теста) ======
  const vipTiers = [
    { key: "bronze", title: "Bronze VIP", basePricePerMonth: 9.99 },
    { key: "silver", title: "Silver VIP", basePricePerMonth: 19.99 },
    { key: "gold", title: "Gold VIP", basePricePerMonth: 34.99 },
    { key: "diamond", title: "Diamond VIP", basePricePerMonth: 59.99 },
  ];

  const vipPeriods = [1, 3, 6, 12];
  let selectedVip = null;

  // Рандом для теста визуала
  const vipDescPool = [
    "VIP доступ с улучшенными условиями и приятными бонусами.",
    "Уровень для тех, кто хочет больше скорости и комфорта.",
    "Премиальный статус с расширенными возможностями.",
    "Максимальный уровень: редкие бонусы и полный доступ.",
    "Статус для тех, кто любит лучшие условия и стабильные бонусы.",
  ];

  const vipBenefitsPool = [
    ["Скидки на товары", "Приоритет поддержки", "Ранний доступ к новинкам"],
    ["VIP-цены", "Эксклюзивные позиции", "Ускоренная выдача"],
    ["Лучшие скидки", "Персональные предложения", "Закрытые товары"],
    ["Максимальные скидки", "Личный приоритет", "Закрытый раздел", "Подарки/бонусы"],
    ["VIP доступ", "Приоритет", "Спец. предложения", "Расширенные лимиты"],
  ];

  function randFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function calcVipPrice(base, months) {
    // тестовая скидка за длительность (чтобы красиво смотрелось)
    let k = 1;
    if (months === 3) k = 0.97;
    if (months === 6) k = 0.93;
    if (months === 12) k = 0.88;
    return +(base * months * k).toFixed(2);
  }

  // Разные короны по уровню (пункт 2)
  function crownSvg(key) {
    // Цвет через currentColor (задашь стилем/темой, сейчас в CSS у тебя белый на темном)
    if (key === "bronze") {
      return `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 18l2-8 4 5 4-5 2 8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      `;
    }
    if (key === "silver") {
      return `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M5.5 18l2-10 4.5 6 4.5-6 2 10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="7.5" cy="8.2" r="1.3" fill="currentColor"/>
          <circle cx="16.5" cy="8.2" r="1.3" fill="currentColor"/>
        </svg>
      `;
    }
    if (key === "gold") {
      return `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 18l2-10 5 6 5-6 2 10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="7" cy="8" r="1.4" fill="currentColor"/>
          <circle cx="12" cy="13" r="1.4" fill="currentColor"/>
          <circle cx="17" cy="8" r="1.4" fill="currentColor"/>
        </svg>
      `;
    }
    // diamond
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M5 18l2-11 5 7 5-7 2 11" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M8 7l4 6 4-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="7" cy="7.6" r="1.4" fill="currentColor"/>
        <circle cx="12" cy="13.2" r="1.6" fill="currentColor"/>
        <circle cx="17" cy="7.6" r="1.4" fill="currentColor"/>
      </svg>
    `;
  }

  function renderVip() {
    currentView = "vip";
    tg.BackButton.show();

    // генерим рандомные описания/бонусы для теста (каждый вход — чуть по-разному)
    const vipViewData = vipTiers.map((t, idx) => ({
      ...t,
      desc: vipDescPool[idx] ?? randFrom(vipDescPool),
      benefits: vipBenefitsPool[idx] ?? randFrom(vipBenefitsPool),
    }));

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">VIP СТАТУС</div>

        <div class="vip-row">
          ${vipViewData
            .map((v) => {
              const defaultMonths = vipPeriods[0];
              const price = calcVipPrice(v.basePricePerMonth, defaultMonths);

              return `
                <div class="vip-card vip-${v.key}" data-key="${v.key}">
                  <div class="vip-check">✓</div>

                  <div class="vip-rank">
                    <div class="vip-badge">${v.title}</div>
                    <div class="vip-crown" title="VIP">
                      ${crownSvg(v.key)}
                    </div>
                  </div>

                  <div class="vip-hero ${v.key}">
                    <div class="vip-aura ${v.key}"></div>
                  </div>

                  <div class="vip-name">${v.title}</div>
                  <div class="vip-desc">${v.desc}</div>

                  <ul class="vip-benefits">
                    ${v.benefits.map((b) => `<li>${b}</li>`).join("")}
                  </ul>

                  <div class="vip-price-row">
                    <div>
                      <div class="vip-sub">Цена (пример):</div>
                      <div class="vip-price">${price} USDT</div>
                    </div>
                    <div class="vip-sub" style="text-align:right">
                      Период: <b class="vip-period-label">${defaultMonths} мес.</b>
                    </div>
                  </div>

                  <select class="vip-select" data-period>
                    ${vipPeriods.map((m) => `<option value="${m}">${m} мес.</option>`).join("")}
                  </select>

                  <button class="detail-add-btn vip-choose-btn" data-choose>Выбрать</button>
                </div>
              `;
            })
            .join("")}
        </div>

        <div style="margin-top:14px; display:flex; flex-direction:column; gap:10px;">
          <button id="vipPayBtn" class="detail-add-btn" disabled style="opacity:.6; cursor:not-allowed;">
            Перейти к оплате
          </button>
          <button class="detail-add-btn" id="vipBackBtn">Назад</button>
        </div>
      </div>
    `;

    const cards = Array.from(view.querySelectorAll(".vip-card"));
    const payBtn = document.getElementById("vipPayBtn");

    function setPayEnabled(enabled) {
      payBtn.disabled = !enabled;
      payBtn.style.opacity = enabled ? "1" : "0.6";
      payBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    cards.forEach((card) => {
      const key = card.dataset.key;
      const tier = vipTiers.find((x) => x.key === key);

      const periodSelect = card.querySelector("[data-period]");
      const chooseBtn = card.querySelector("[data-choose]");
      const priceEl = card.querySelector(".vip-price");
      const periodLabel = card.querySelector(".vip-period-label");

      periodSelect.addEventListener("change", () => {
        const months = +periodSelect.value;
        const price = calcVipPrice(tier.basePricePerMonth, months);

        priceEl.textContent = `${price} USDT`;
        periodLabel.textContent = `${months} мес.`;

        if (selectedVip?.key === key) {
          selectedVip = { key, months, price };
        }
      });

      chooseBtn.addEventListener("click", () => {
        cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        const months = +periodSelect.value;
        const price = calcVipPrice(tier.basePricePerMonth, months);

        selectedVip = { key, months, price };
        setPayEnabled(true);
      });
    });

    payBtn.addEventListener("click", () => {
      if (!selectedVip) return;
      tg.showAlert(
        `Вы выбрали: ${selectedVip.key.toUpperCase()}
Период: ${selectedVip.months} мес.
Цена: ${selectedVip.price} USDT

Оплату подключим позже.`
      );
    });

    document.getElementById("vipBackBtn").onclick = () => navigate("catalog");
    if (checkoutBtn) checkoutBtn.style.display = "none";
  }

  // ====== ГЛОБАЛЬНЫЕ inc/dec (как было) ======
  window.inc = (id) => {
    cart[id].qty++;
    renderCatalog();
  };
  window.dec = (id) => {
    if (cart[id].qty > 0) cart[id].qty--;
    renderCatalog();
  };

  // ====== CHECKOUT (как было) ======
  checkoutBtn.onclick = () => {
    tg.showAlert("Кнопка нажата");

    const items = Object.values(cart).filter((i) => i.qty > 0);
    if (!items.length) {
      tg.showAlert("Корзина пуста");
      return;
    }

    const order = {
      type: "order",
      total_usdt: +items.reduce((s, i) => s + i.qty * i.priceUsdt, 0).toFixed(2),
      items: items.map((i) => ({
        name: i.name,
        qty: i.qty,
        priceUsdt: i.priceUsdt,
      })),
    };

    tg.sendData(JSON.stringify(order));
    tg.close();
  };

  // ====== START ======
  renderCatalog();
});