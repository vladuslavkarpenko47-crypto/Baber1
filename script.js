// script.js

// Инициализация Telegram WebApp
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

/* === ПРОМОКОДЫ === */
const PROMO_CODES = {
  COSMO10: 10,
  COSMO20: 20,
};

let activePromo = null; // { code: 'COSMO10', percent: 10 } или null

/* === ТОВАРЫ === */
const products = [
  {
    id: 1,
    name: "Fox Toy",
    shortDescription: "Soft toy fox 25cm",
    fullDescription: "Very soft fox toy, 25cm. Hypoallergenic.",
    priceUsdt: 10,
    images: [
      "https://picsum.photos/seed/fox1/600/400",
      "https://picsum.photos/seed/fox2/600/400",
    ],
  },
  {
    id: 2,
    name: "Penguin",
    shortDescription: "Small cute penguin toy",
    fullDescription: "Cute small penguin plush toy.",
    priceUsdt: 12.5,
    images: ["https://picsum.photos/seed/penguin1/600/400"],
  },
  {
    id: 3,
    name: "Toy Car",
    shortDescription: "Metallic toy car",
    fullDescription: "A premium quality metal toy car.",
    priceUsdt: 15,
    images: [
      "https://picsum.photos/seed/car1/600/400",
      "https://picsum.photos/seed/car2/600/400",
    ],
  },
  {
    id: 4,
    name: "Space Bear",
    shortDescription: "Bear in a space suit",
    fullDescription: "Cute plush bear in a shiny silver space suit.",
    priceUsdt: 18,
    images: ["https://picsum.photos/seed/bear1/600/400"],
  },
  {
    id: 5,
    name: "Rocket Lamp",
    shortDescription: "Night lamp rocket",
    fullDescription: "Soft warm light, rocket-shaped night lamp.",
    priceUsdt: 22,
    images: ["https://picsum.photos/seed/rocket1/600/400"],
  },
  {
    id: 6,
    name: "Moon Pillow",
    shortDescription: "Crescent moon pillow",
    fullDescription: "Comfortable crescent-shaped pillow for sleep.",
    priceUsdt: 14.5,
    images: ["https://picsum.photos/seed/moon1/600/400"],
  },
  {
    id: 7,
    name: "Star String",
    shortDescription: "String of LED stars",
    fullDescription: "Warm LED garland with little stars.",
    priceUsdt: 16,
    images: ["https://picsum.photos/seed/star1/600/400"],
  },
];

let cart = {};
products.forEach((p) => (cart[p.id] = { product: p, qty: 0 }));

const viewEl = document.getElementById("view");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");

/* === Цена с учётом промокода === */
function getProductPrice(product) {
  if (activePromo) {
    const discounted = product.priceUsdt * (1 - activePromo.percent / 100);
    return +discounted.toFixed(2);
  }
  return product.priceUsdt;
}

/* === Итоговая сумма === */
function updateTotal() {
  let total = 0;
  Object.values(cart).forEach(({ product, qty }) => {
    total += getProductPrice(product) * qty;
  });
  totalEl.textContent = total.toFixed(2);
}

/* === СПИСОК ТОВАРОВ === */
function renderListView() {
  const listHtml = `
    <div class="product-list">
      ${products
        .map(
          (p) => `
        <article class="product-card" data-id="${p.id}">
          <img src="${p.images[0]}" class="product-thumb" />
          <div class="product-info">
            <h2 class="product-name">${p.name}</h2>
            <p class="product-desc">${p.shortDescription}</p>
            <div class="product-price-row">
              <span class="product-price">${getProductPrice(p)} USDT</span>
            </div>
            <div class="product-controls" data-id="${p.id}">
              <button class="qty-btn minus">−</button>
              <span class="quantity">${cart[p.id].qty}</span>
              <button class="qty-btn plus">+</button>
            </div>
          </div>
        </article>
      `
        )
        .join("")}
    </div>
  `;

  viewEl.innerHTML = listHtml;

  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".product-controls")) return;
      openProductDetail(Number(card.dataset.id));
    });
  });

  document.querySelectorAll(".product-controls").forEach((controls) => {
    const id = Number(controls.dataset.id);
    const qtyEl = controls.querySelector(".quantity");

    controls.querySelector(".minus").addEventListener("click", (e) => {
      e.stopPropagation();
      if (cart[id].qty > 0) cart[id].qty--;
      qtyEl.textContent = cart[id].qty;
      updateTotal();
    });

    controls.querySelector(".plus").addEventListener("click", (e) => {
      e.stopPropagation();
      cart[id].qty++;
      qtyEl.textContent = cart[id].qty;
      updateTotal();
    });
  });
}

/* === ДЕТАЛЬ ТОВАРА === */
function openProductDetail(id) {
  const { product, qty } = cart[id];
  let idx = 0;

  const html = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>

      <div class="detail-slider">
        <img id="detail-image" src="${product.images[0]}" class="detail-image" />
        <div class="slider-controls">
          <button id="prev-slide" class="slider-btn prev">‹</button>
          <button id="next-slide" class="slider-btn next">›</button>
        </div>
      </div>

      <h1 class="product-detail-title">${product.name}</h1>

      <div class="detail-price-row">
        <span class="detail-price">${getProductPrice(product)} USDT</span>
      </div>

      <div class="detail-qty-row">
        <button id="detail-minus" class="qty-btn">−</button>
        <span id="detail-qty" class="quantity">${qty}</span>
        <button id="detail-plus" class="qty-btn">+</button>
      </div>

      <div class="detail-actions">
        <button id="detail-add" class="detail-add-btn">Добавить</button>

        <p class="product-detail-short">${product.shortDescription}</p>
        <p class="product-detail-full">${product.fullDescription}</p>
      </div>
    </div>
  `;

  viewEl.innerHTML = html;

  document.querySelector(".back-btn").onclick = () => renderListView();

  const img = document.getElementById("detail-image");
  document.getElementById("prev-slide").onclick = () => {
    idx = (idx - 1 + product.images.length) % product.images.length;
    img.src = product.images[idx];
  };
  document.getElementById("next-slide").onclick = () => {
    idx = (idx + 1) % product.images.length;
    img.src = product.images[idx];
  };

  let curQty = qty;
  const detailQtyEl = document.getElementById("detail-qty");

  document.getElementById("detail-minus").onclick = () => {
    if (curQty > 0) curQty--;
    detailQtyEl.textContent = curQty;
  };
  document.getElementById("detail-plus").onclick = () => {
    curQty++;
    detailQtyEl.textContent = curQty;
  };

  document.getElementById("detail-add").onclick = () => {
    cart[id].qty = curQty;
    updateTotal();
    renderListView();
  };

  const shortDesc = document.querySelector(".product-detail-short");
  const fullDesc = document.querySelector(".product-detail-full");

  shortDesc.addEventListener("click", () => {
    shortDesc.classList.toggle("expanded");
    fullDesc.classList.toggle("visible");
  });
}

/* === СТРАНИЦА ПРОМОКОДА === */
function renderPromoView() {
  const html = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">Промокод</h1>

      <div class="detail-actions">
        <p class="product-detail-short expanded">
          Введите промокод для получения скидки.
        </p>

        <input id="promo-input"
          placeholder="Например, COSMO10"
          class="promo-input"
          style="
            width:100%; padding:10px 12px; border-radius:12px;
            border:1px solid rgba(255,255,255,0.25);
            background:rgba(0,0,0,0.6); color:#fff; font-size:14px;
            outline:none; margin-top:10px;
          "
        />

        <button id="promo-apply" class="detail-add-btn" style="margin-top:6px;">Активировать</button>

        <p id="promo-message" style="margin-top:8px; opacity:0.85;"></p>
      </div>
    </div>
  `;

  viewEl.innerHTML = html;

  document.querySelector(".back-btn").onclick = () => renderListView();

  const input = document.getElementById("promo-input");
  const msg = document.getElementById("promo-message");

  document.getElementById("promo-apply").onclick = () => {
    const code = input.value.trim().toUpperCase();
    if (!PROMO_CODES[code]) {
      msg.textContent = "Неверный или устаревший промокод.";
      msg.style.color = "#ff6b6b";
      return;
    }

    activePromo = { code, percent: PROMO_CODES[code] };
    msg.textContent = `Промокод ${code} активирован! Скидка ${activePromo.percent}%`;
    msg.style.color = "#aaffaa";

    updateTotal();
  };
}

/* === О МАГАЗИНЕ === */
function renderAboutView() {
  viewEl.innerHTML = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">О магазине</h1>

      <p class="product-detail-short expanded">
        COSMO SHOP — мини-магазин в Telegram.
      </p>

      <p class="product-detail-full visible">
        Тут будут информация, FAQ, контакты и условия доставки.
      </p>
    </div>
  `;

  document.querySelector(".back-btn").onclick = () => renderListView();
}

/* === ОФОРМЛЕНИЕ ЗАКАЗА === */
checkoutBtn.onclick = () => {
  const items = Object.values(cart).filter((x) => x.qty > 0);
  if (!items.length) {
    alert("Корзина пуста");
    return;
  }

  const total = items.reduce(
    (s, x) => s + getProductPrice(x.product) * x.qty,
    0
  );

  const order = {
    currency: "USDT",
    total: +total.toFixed(2),
    promo: activePromo,
    items: items.map(({ product, qty }) => ({
      id: product.id,
      name: product.name,
      price: getProductPrice(product),
      qty,
    })),
  };

  if (tg) {
    tg.sendData(JSON.stringify(order));
    tg.close();
  } else {
    console.log(order);
  }
};

/* === ИНИЦИАЛИЗАЦИЯ === */
renderListView();
updateTotal();

/* === БУРГЕР-МЕНЮ === */
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const sideMenuBackdrop = document.getElementById("sideMenuBackdrop");

let closeMenu = () => {
  sideMenu.classList.remove("open");
  sideMenuBackdrop.classList.remove("visible");
};

menuToggle.addEventListener("click", () => {
  sideMenu.classList.add("open");
  sideMenuBackdrop.classList.add("visible");
});

sideMenuBackdrop.addEventListener("click", closeMenu);

/* === КНОПКИ В МЕНЮ === */
const sideMenuButtons = document.querySelectorAll(".side-menu-btn");
const [promoBtn, catalogBtn, aboutBtn] = sideMenuButtons;

promoBtn.onclick = () => {
  closeMenu();
  renderPromoView();
};

catalogBtn.onclick = () => {
  closeMenu();
  renderListView();
};

aboutBtn.onclick = () => {
  closeMenu();
  renderAboutView();
};