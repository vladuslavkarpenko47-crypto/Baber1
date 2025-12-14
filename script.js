document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    alert("Открой магазин через кнопку в боте");
    return;
  }

  // чтобы не было “половины экрана”
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
    if (currentView === "about" || currentView === "promo" || currentView === "vip") {
      navigate(lastMainView || "catalog");
      return;
    }
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

  // ===== VIP (ВОЗВРАЩЕНО: 4 карточки + выбор месяцев + выбрать + auto-hint) =====
  let vipHintTimer = null;

  const vipTiers = [
    {
      key: "bronze",
      title: "Bronze VIP",
      color: "#cd7f32",
      pricePerMonth: 9.99,
      desc: "Базовый VIP для старта: небольшой буст и доступ к VIP-каталогу.",
      benefits: ["Доступ к VIP-товарам", "Небольшие скидки", "Ранний доступ к обновлениям"]
    },
    {
      key: "silver",
      title: "Silver VIP",
      color: "#d2d2d2",
      pricePerMonth: 19.99,
      desc: "Оптимальный баланс цены и привилегий.",
      benefits: ["Всё из Bronze", "Выше скидки", "Приоритет поддержки"]
    },
    {
      key: "gold",
      title: "Gold VIP",
      color: "#ffd700",
      pricePerMonth: 34.99,
      desc: "Премиум-уровень с максимальной выгодой и эксклюзивами.",
      benefits: ["Всё из Silver", "Эксклюзивные позиции", "Лучшие скидки"]
    },
    {
      key: "diamond",
      title: "Diamond VIP",
      color: "#78dcff",
      pricePerMonth: 59.99,
      desc: "Максимальный доступ и лучшие условия. Топ-уровень.",
      benefits: ["Максимальные скидки", "Закрытый контент", "Личный приоритет", "Бонусы"]
    }
  ];

  const vipPeriods = [1, 3, 6, 12];
  let selectedVip = null;

  function calcVipPrice(base, months) {
    // маленькие скидки за период (чтобы выглядело “богаче”)
    let k = 1;
    if (months === 3) k = 0.97;
    if (months === 6) k = 0.93;
    if (months === 12) k = 0.88;
    return +(base * months * k).toFixed(2);
  }

  function crownSVG(color) {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 18h16" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
        <path d="M5.5 18l2-10 4.5 6 4.5-6 2 10" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="7.5" cy="8.2" r="1.3" fill="${color}"/>
        <circle cx="16.5" cy="8.2" r="1.3" fill="${color}"/>
      </svg>
    `;
  }

  function renderVip() {
    tg.BackButton.show();
    setBottomBarVisible(false);

    // сброс выбора при входе
    selectedVip = null;

    view.innerHTML = `
      <div class="vip-page">
        <style>
          /* минимальные стили VIP (чтобы не зависеть от твоего CSS) */
          .vip-page{padding:14px}
          .vip-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0 12px}
          .vip-title{font-size:20px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
          .vip-hint{font-size:12px;opacity:.7;user-select:none;white-space:nowrap;animation:vipHint 5s ease-in-out infinite}
          @keyframes vipHint{0%,100%{opacity:.55}50%{opacity:.9}}
          .vip-row{display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}
          .vip-row::-webkit-scrollbar{height:8px}
          .vip-row::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:999px}
          .vip-card{
            min-width:270px;flex:0 0 auto;scroll-snap-align:start;
            background:rgba(0,0,0,.55);
            border:1px solid rgba(255,255,255,.12);
            border-radius:18px;padding:14px;position:relative;
            box-shadow:0 10px 24px rgba(0,0,0,.85);
            transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          }
          .vip-card:hover{transform:translateY(-3px)}
          .vip-card.selected{
            border-color:rgba(255,219,120,.95);
            box-shadow:0 18px 34px rgba(0,0,0,.95);
            animation:vipPick .35s ease;
          }
          @keyframes vipPick{0%{transform:scale(.98)}70%{transform:scale(1.02)}100%{transform:scale(1)}}
          .vip-check{
            position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;
            background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);
            display:grid;place-items:center;font-weight:900;
            opacity:0;transform:scale(.85);transition:.18s ease;
          }
          .vip-card.selected .vip-check{opacity:1;transform:scale(1)}
          .vip-rank{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
          .vip-badge{
            display:inline-flex;align-items:center;gap:8px;
            padding:8px 12px;border-radius:999px;
            font-weight:900;letter-spacing:.08em;text-transform:uppercase;
            border:1px solid rgba(255,255,255,.14);
            background:rgba(0,0,0,.35);
          }
          .vip-crown{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;
            border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.35)}
          .vip-crown svg{width:20px;height:20px}
          .vip-hero{
            height:120px;border-radius:16px;position:relative;overflow:hidden;
            border:1px solid rgba(255,255,255,.12);
            background:radial-gradient(circle at top, rgba(255,255,255,.08), rgba(0,0,0,.8) 65%);
          }
          /* мягкая анимация “дыхание”, не режет глаз */
          .vip-aura{
            position:absolute;inset:-40%;
            filter:blur(26px);opacity:.16;transform:scale(1);
            animation:vipBreath 5.5s ease-in-out infinite;pointer-events:none;
          }
          @keyframes vipBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
          .vip-particles{
            position:absolute;inset:0;opacity:.22;pointer-events:none;
            background-image:
              radial-gradient(circle, rgba(255,255,255,.18) 0 1px, transparent 2px),
              radial-gradient(circle, rgba(255,255,255,.12) 0 1px, transparent 2px);
            background-size:26px 26px, 44px 44px;
            animation:vipDrift 8s ease-in-out infinite;
          }
          @keyframes vipDrift{0%,100%{transform:translate(-1%,-1%)}50%{transform:translate(1%,1%)}}
          .vip-name{margin:12px 0 6px;font-size:16px;font-weight:950}
          .vip-desc{font-size:13px;opacity:.86;line-height:1.45}
          .vip-benefits{margin:10px 0 0;padding-left:18px}
          .vip-benefits li{font-size:13px;margin:6px 0;opacity:.92}
          .vip-price-row{
            display:flex;align-items:baseline;justify-content:space-between;gap:10px;
            margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.10);
          }
          .vip-price{font-weight:950;font-size:18px}
          .vip-sub{font-size:12px;opacity:.75}
          .vip-select{
            width:100%;margin-top:10px;padding:10px 12px;border-radius:12px;
            border:1px solid rgba(255,255,255,.20);
            background:rgba(0,0,0,.50);color:#fff;
          }
          .vip-actions{margin-top:14px;display:flex;flex-direction:column;gap:10px}
          .vip-actions button{width:100%}
        </style>

        <div class="vip-head">
          <div class="vip-title">VIP статусы</div>
          <div class="vip-hint">Листай →</div>
        </div>

        <div class="vip-row" id="vipRow">
          ${vipTiers.map(v => {
            const price = calcVipPrice(v.pricePerMonth, 1);
            return `
              <div class="vip-card" data-key="${v.key}">
                <div class="vip-check">✓</div>

                <div class="vip-rank">
                  <div class="vip-badge" style="border-color: rgba(255,255,255,.14);">
                    <span style="width:10px;height:10px;border-radius:999px;background:${v.color};display:inline-block"></span>
                    ${v.title}
                  </div>
                  <div class="vip-crown" style="color:${v.color}">
                    ${crownSVG(v.color)}
                  </div>
                </div>

                <div class="vip-hero">
                  <div class="vip-particles"></div>
                  <div class="vip-aura" style="background: radial-gradient(circle, ${v.color}55, transparent 60%);"></div>
                </div>

                <div class="vip-name">${v.title}</div>
                <div class="vip-desc">${v.desc}</div>

                <ul class="vip-benefits">
                  ${v.benefits.map(b => `<li>${b}</li>`).join("")}
                </ul>

                <div class="vip-price-row">
                  <div>
                    <div class="vip-sub">Цена:</div>
                    <div class="vip-price" data-price>${price} USDT</div>
                  </div>
                  <div class="vip-sub" style="text-align:right">
                    Период: <b data-period-label>1 мес.</b>
                  </div>
                </div>

                <select class="vip-select" data-period>
                  ${vipPeriods.map(m => `<option value="${m}">${m} мес.</option>`).join("")}
                </select>

                <button class="detail-add-btn" data-choose style="margin-top:10px;">Выбрать</button>
              </div>
            `;
          }).join("")}
        </div>

        <div class="vip-actions">
          <button id="vipPayBtn" class="detail-add-btn" disabled style="opacity:.6;cursor:not-allowed;">
            Перейти к оплате
          </button>
          <button class="detail-add-btn" id="vipBackBtn">Назад</button>
        </div>
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

    // auto-hint: очень мягко, редко, чтобы не бесило
    if (vipHintTimer) clearInterval(vipHintTimer);
    let hintDir = 1;
    vipHintTimer = setInterval(() => {
      if (!vipRow) return;
      vipRow.scrollBy({ left: 18 * hintDir, behavior: "smooth" });
      hintDir *= -1;
    }, 7000);

    cards.forEach(card => {
      const key = card.dataset.key;
      const tier = vipTiers.find(x => x.key === key);

      const periodSelect = card.querySelector("[data-period]");
      const priceEl = card.querySelector("[data-price]");
      const periodLabel = card.querySelector("[data-period-label]");
      const chooseBtn = card.querySelector("[data-choose]");

      periodSelect.addEventListener("change", () => {
        const months = +periodSelect.value;
        const price = calcVipPrice(tier.pricePerMonth, months);
        priceEl.textContent = `${price} USDT`;
        periodLabel.textContent = `${months} мес.`;
        if (selectedVip?.key === key) selectedVip = { key, months, price, title: tier.title };
      });

      chooseBtn.addEventListener("click", () => {
        cards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        const months = +periodSelect.value;
        const price = calcVipPrice(tier.pricePerMonth, months);

        selectedVip = { key, months, price, title: tier.title };
        setPayEnabled(true);

        tg.hapticFeedback?.impactOccurred?.("light");
      });
    });

    payBtn.addEventListener("click", () => {
      if (!selectedVip) return;
      tg.showAlert(
        `VIP: ${selectedVip.title}\nПериод: ${selectedVip.months} мес.\nЦена: ${selectedVip.price} USDT\n\nОплату подключим позже.`
      );
    });

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

  // ===== ABOUT =====
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