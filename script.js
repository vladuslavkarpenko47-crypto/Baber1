document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  } else {
    alert("Открой магазин через кнопку в боте");
    return;
  }

  // ====== DOM ======
  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout");

  // ====== MENU ======
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

  // ====== NAV ======
  function navigate(where) {
    closeMenu();
    if (where === "catalog") renderCatalog();
    if (where === "vip") renderVip();
    if (where === "promo") renderPromo();
    if (where === "about") renderAbout();
  }

  // привязка кнопок меню по data-nav
  document.querySelectorAll("#sideMenu .side-menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nav = btn.getAttribute("data-nav");
      if (nav) navigate(nav);
    });
  });

  // Telegram back button (закрыть меню, иначе на каталог)
  tg.onEvent("backButtonClicked", () => {
    if (sideMenu?.classList.contains("open")) closeMenu();
    else navigate("catalog");
  });

  // ====== CATALOG (пока заглушка) ======
  function renderCatalog() {
    tg.BackButton.hide();
    if (checkoutBtn) checkoutBtn.style.display = "";
    if (totalEl) totalEl.textContent = "0.00";

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">Каталог</div>
        <div style="opacity:.85;line-height:1.6;text-align:center">
          Здесь будет каталог товаров.<br/>
          Сейчас мы доделываем меню + VIP.
        </div>
      </div>
    `;
  }

  // ====== PROMO (заглушка) ======
  function renderPromo() {
    tg.BackButton.show();
    if (checkoutBtn) checkoutBtn.style.display = "none";

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">Промокоды</div>
        <div style="opacity:.85;line-height:1.6;text-align:center">
          Раздел в разработке.
        </div>
        <div style="margin-top:14px; text-align:center;">
          <button class="detail-add-btn" id="goBackPromo">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("goBackPromo").onclick = () => navigate("catalog");
  }

  // ====== ABOUT ======
  function renderAbout() {
    tg.BackButton.show();
    if (checkoutBtn) checkoutBtn.style.display = "none";

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-title">О магазине</div>
        <div style="opacity:.88;line-height:1.6">
          COSMO SHOP — цифровой магазин. VIP статусы дают дополнительные преимущества,
          скидки и доступ к закрытым позициям.
        </div>
        <div style="margin-top:14px; text-align:center;">
          <button class="detail-add-btn" id="goBackAbout">Назад</button>
        </div>
      </div>
    `;
    document.getElementById("goBackAbout").onclick = () => navigate("catalog");
  }

  // ====== VIP DATA ======
  const vipTiers = [
    {
      key: "bronze",
      title: "Bronze VIP",
      basePricePerMonth: 10,
      desc: "Стартовый VIP уровень для уверенного начала.",
      benefits: ["VIP товары", "Базовые скидки", "Ранний доступ"]
    },
    {
      key: "silver",
      title: "Silver VIP",
      basePricePerMonth: 20,
      desc: "Больше выгод и приоритет в обслуживании.",
      benefits: ["Все из Bronze", "Выше скидки", "Приоритет поддержки"]
    },
    {
      key: "gold",
      title: "Gold VIP",
      basePricePerMonth: 35,
      desc: "Премиальный уровень с максимальной выгодой.",
      benefits: ["Все из Silver", "Эксклюзивные позиции", "Персональные офферы"]
    },
    {
      key: "diamond",
      title: "Diamond VIP",
      basePricePerMonth: 60,
      desc: "Максимальный доступ: закрытый раздел и лучшие условия.",
      benefits: ["Макс. скидки", "Закрытый контент", "Личный приоритет", "Подарки/бонусы"]
    }
  ];

  const vipPeriods = [1, 3, 6, 12];
  let selectedVip = null;

  function calcVipPrice(base, months) {
    // мягкая скидка за длительность (чтобы выглядело “богаче”)
    let k = 1;
    if (months === 3) k = 0.97;
    if (months === 6) k = 0.93;
    if (months === 12) k = 0.88;
    return +(base * months * k).toFixed(2);
  }

  // ====== Inject “anti-glare” CSS overrides (чтобы не править style.css) ======
  function ensureVipSoftCssOnce() {
    if (document.getElementById("vip-soft-overrides")) return;

    const style = document.createElement("style");
    style.id = "vip-soft-overrides";
    style.textContent = `
      /* --- VIP: убираем яркие переливы/шиммеры --- */
      .vip-crown::before,
      .vip-card .vip-anim::before,
      .vip-hero::before,
      .vip-hero::after {
        animation: none !important;
        opacity: 0 !important;
      }

      /* --- VIP: делаем спокойное “дыхание” --- */
      .vip-aura {
        animation: vipSoftBreath 5.2s ease-in-out infinite !important;
        opacity: .18 !important;
        filter: blur(26px) !important;
      }
      .vip-aura.diamond {
        animation-duration: 4.4s !important;
        opacity: .22 !important;
      }
      @keyframes vipSoftBreath {
        0%, 100% { transform: scale(1.00); }
        50% { transform: scale(1.05); }
      }

      /* --- VIP: частицы (не режут глаз) --- */
      .vip-particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: .35;
        background-image:
          radial-gradient(circle, rgba(255,255,255,.22) 0 1px, transparent 2px),
          radial-gradient(circle, rgba(255,255,255,.14) 0 1px, transparent 2px);
        background-size: 26px 26px, 42px 42px;
        animation: vipParticlesDrift 8s ease-in-out infinite;
      }
      @keyframes vipParticlesDrift {
        0% { transform: translate3d(-1%, -1%, 0); }
        50% { transform: translate3d(1%, 1%, 0); }
        100% { transform: translate3d(-1%, -1%, 0); }
      }

      /* --- VIP: горизонтальный “snap” + подсказка --- */
      .vip-head {
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:10px;
        margin-bottom:10px;
      }
      .vip-hint {
        font-size: 12px;
        opacity: .70;
        user-select: none;
        white-space: nowrap;
      }
      .vip-row-snap {
        scroll-snap-type: x mandatory;
      }
      .vip-row-snap .vip-card {
        scroll-snap-align: start;
      }
    `;
    document.head.appendChild(style);
  }

  // ====== CROWNS (разные “богатые” иконки без яркого блеска) ======
  function crownSvg(key) {
    // простые SVG, без анимации
    if (key === "bronze") {
      return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 18l2-8 4 5 4-5 2 8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    }
    if (key === "silver") {
      return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5.5 18l2-10 4.5 6 4.5-6 2 10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="7.5" cy="8.2" r="1.3" fill="currentColor"/><circle cx="16.5" cy="8.2" r="1.3" fill="currentColor"/></svg>`;
    }
    if (key === "gold") {
      return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 18l2-10 5 6 5-6 2 10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="7" cy="8" r="1.4" fill="currentColor"/><circle cx="12" cy="13" r="1.4" fill="currentColor"/><circle cx="17" cy="8" r="1.4" fill="currentColor"/></svg>`;
    }
    // diamond
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 18l2-11 5 7 5-7 2 11" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 7l4 6 4-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13.2" r="1.6" fill="currentColor"/></svg>`;
  }

  // ====== VIP VIEW (горизонтально, все статусы видно) ======
  function renderVip() {
    ensureVipSoftCssOnce();

    tg.BackButton.show();
    if (checkoutBtn) checkoutBtn.style.display = "none";

    // по умолчанию сбрасываем выбор при каждом заходе (можно позже хранить)
    selectedVip = null;

    view.innerHTML = `
      <div class="vip-page">
        <div class="vip-head">
          <div class="vip-title" style="margin:0;">VIP СТАТУСЫ</div>
          <div class="vip-hint">Листай →</div>
        </div>

        <div class="vip-row vip-row-snap" id="vipRow">
          ${vipTiers
            .map((v) => {
              const defaultMonths = 1;
              const price = calcVipPrice(v.basePricePerMonth, defaultMonths);

              return `
                <div class="vip-card vip-${v.key}" data-key="${v.key}">
                  <div class="vip-check">✓</div>

                  <div class="vip-rank">
                    <div class="vip-badge">${v.title}</div>
                    <div class="vip-crown" style="position:relative; color:#fff;">
                      ${crownSvg(v.key)}
                    </div>
                  </div>

                  <div class="vip-hero ${v.key}" style="position:relative;">
                    <div class="vip-particles"></div>
                    <div class="vip-aura ${v.key === "diamond" ? "diamond" : ""} ${v.key}"></div>
                  </div>

                  <div class="vip-name">${v.title}</div>
                  <div class="vip-desc">${v.desc}</div>

                  <ul class="vip-benefits">
                    ${v.benefits.map((b) => `<li>${b}</li>`).join("")}
                  </ul>

                  <div class="vip-price-row">
                    <div>
                      <div class="vip-sub">Цена:</div>
                      <div class="vip-price" data-price>${price} USDT</div>
                    </div>
                    <div class="vip-sub" style="text-align:right">
                      Период: <b data-period-label>${defaultMonths} мес.</b>
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

        <div style="margin-top:14px;">
          <button id="vipPayBtn" class="detail-add-btn" disabled style="opacity:.6;cursor:not-allowed;width:100%;">
            Перейти к оплате
          </button>
          <div style="margin-top:10px;text-align:center;">
            <button class="detail-add-btn" id="vipBackBtn">Назад</button>
          </div>
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
      const priceEl = card.querySelector("[data-price]");
      const periodLabel = card.querySelector("[data-period-label]");
      const chooseBtn = card.querySelector("[data-choose]");

      periodSelect.addEventListener("change", () => {
        const months = +periodSelect.value;
        const price = calcVipPrice(tier.basePricePerMonth, months);
        priceEl.textContent = `${price} USDT`;
        periodLabel.textContent = `${months} мес.`;

        // если выбран этот VIP — обновляем выбранное
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

        // мягкая подсказка “выбрано”
        tg.hapticFeedback?.impactOccurred?.("light");
      });
    });

    payBtn.addEventListener("click", () => {
      if (!selectedVip) return;

      tg.showAlert(
        `VIP: ${selectedVip.key.toUpperCase()}\n` +
        `Период: ${selectedVip.months} мес.\n` +
        `Цена: ${selectedVip.price} USDT\n\n` +
        `Оплату подключим позже.`
      );
    });

    document.getElementById("vipBackBtn").onclick = () => navigate("catalog");
  }

  // ====== CHECKOUT (пока просто сигнал, чтобы не мешал) ======
  checkoutBtn.onclick = () => {
    tg.showAlert("Каталог и корзину доделаем на следующем этапе.");
  };

  // ====== START ======
  navigate("catalog");

  // expose navigate if нужно дергать из консоли
  window.__navigate = navigate;
});