// =============================
//   Telegram WebApp init
// =============================
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

// =============================
//   Промокоды
// =============================
const PROMO_CODES = {
  COSMO10: 10,
  COSMO20: 20,
};

let activePromo = null;

// =============================
//   Товары
// =============================
const products = [
  { id: 1, name: "Fox Toy", shortDescription: "Soft toy fox 25cm", fullDescription: "Very soft fox toy, 25cm. Hypoallergenic.", priceUsdt: 10, images: ["https://picsum.photos/seed/fox1/600/400","https://picsum.photos/seed/fox2/600/400"] },
  { id: 2, name: "Penguin", shortDescription: "Small cute penguin toy", fullDescription: "Cute small penguin plush toy.", priceUsdt: 12.5, images: ["https://picsum.photos/seed/penguin1/600/400"] },
  { id: 3, name: "Toy Car", shortDescription: "Metallic toy car", fullDescription: "Premium metal toy car.", priceUsdt: 15, images: ["https://picsum.photos/seed/car1/600/400","https://picsum.photos/seed/car2/600/400"] },
  { id: 4, name: "Space Bear", shortDescription: "Bear in space suit", fullDescription: "Cute plush bear in a silver astronaut suit.", priceUsdt: 18, images: ["https://picsum.photos/seed/bear1/600/400"] },
  { id: 5, name: "Rocket Lamp", shortDescription: "Rocket night lamp", fullDescription: "Soft warm rocket-shaped night lamp.", priceUsdt: 22, images: ["https://picsum.photos/seed/rocket1/600/400"] },
  { id: 6, name: "Moon Pillow", shortDescription: "Moon pillow", fullDescription: "Comfortable crescent pillow for sleep.", priceUsdt: 14.5, images: ["https://picsum.photos/seed/moon1/600/400"] },
  { id: 7, name: "Star Garland", shortDescription: "LED star garland", fullDescription: "Warm LED garland with glowing stars.", priceUsdt: 16, images: ["https://picsum.photos/seed/star1/600/400"] },
];

// =============================
//   Корзина
// =============================
let cart = {};
products.forEach((p) => (cart[p.id] = { product: p, qty: 0 }));

const viewEl = document.getElementById("view");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");

// =============================
//   Цена со скидкой
// =============================
function getDiscountedPrice(product) {
  if (!activePromo) return product.priceUsdt;
  return +(product.priceUsdt * (1 - activePromo.percent / 100)).toFixed(2);
}

// =============================
//   Итоговая сумма внизу
// =============================
function updateTotal() {
  let total = 0;
  Object.values(cart).forEach(({ product, qty }) => {
    total += getDiscountedPrice(product) * qty;
  });
  totalEl.textContent = total.toFixed(2);
}

// =============================
//   Каталог товаров
// =============================
function renderListView() {
  const listHtml = `
    <div class="product-list">
      ${products
        .map((p) => {
          const newPrice = getDiscountedPrice(p);
          const hasDiscount = activePromo !== null;

          return `
        <article class="product-card" data-id="${p.id}">
          <img src="${p.images[0]}" class="product-thumb" />
          <div class="product-info">
            <h2 class="product-name">${p.name}</h2>
            <p class="product-desc">${p.shortDescription}</p>

            <div class="product-price-row">
              ${
                hasDiscount
                  ? `
                <span class="old-price">${p.priceUsdt} USDT</span>
                <span class="product-price new-price">${newPrice} USDT</span>
              `
                  : `<span class="product-price">${p.priceUsdt} USDT</span>`
              }
            </div>

            <div class="product-controls" data-id="${p.id}">
              <button class="qty-btn minus">−</button>
              <span class="quantity">${cart[p.id].qty}</span>
              <button class="qty-btn plus">+</button>
            </div>
          </div>
        </article>
      `;
        })
        .join("")}
    </div>
  `;

  viewEl.innerHTML = listHtml;

  // Открытие карточки
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".product-controls")) return;
      openProductDetail(Number(card.dataset.id));
    });
  });

  // + -
  document.querySelectorAll(".product-controls").forEach((controls) => {
    const id = Number(controls.dataset.id);
    const qtyEl = controls.querySelector(".quantity");

    controls.querySelector(".minus").onclick = (e) => {
      e.stopPropagation();
      if (cart[id].qty > 0) cart[id].qty--;
      qtyEl.textContent = cart[id].qty;
      updateTotal();
    };

    controls.querySelector(".plus").onclick = (e) => {
      e.stopPropagation();
      cart[id].qty++;
      qtyEl.textContent = cart[id].qty;
      updateTotal();
    };
  });
}

// =============================
//   Детальная страница товара
// =============================
function openProductDetail(id) {
  const { product, qty } = cart[id];
  let idx = 0;
  const newPrice = getDiscountedPrice(product);
  const hasDiscount = activePromo !== null;

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
        ${
          hasDiscount
            ? `
          <span class="old-price">${product.priceUsdt} USDT</span>
          <span class="new-price detail-price">${newPrice} USDT</span>
        `
            : `<span class="detail-price">${product.priceUsdt} USDT</span>`
        }
      </div>

      <div class="detail-qty-row">
        <button id="detail-minus" class="qty-btn">−</button>
        <span id="detail-qty" class="quantity">${qty}</span>
        <button id="detail-plus" class="qty-btn">+</button>
      </div>

      <button id="detail-add" class="detail-add-btn">Добавить</button>

      <p class="product-detail-short">${product.shortDescription}</p>
      <p class="product-detail-full">${product.fullDescription}</p>

    </div>
  `;

  viewEl.innerHTML = html;

  // назад
  document.querySelector(".back-btn").onclick = () => renderListView();

  // слайдер
  const img = document.getElementById("detail-image");
  document.getElementById("prev-slide").onclick = () => {
    idx = (idx - 1 + product.images.length) % product.images.length;
    img.src = product.images[idx];
  };
  document.getElementById("next-slide").onclick = () => {
    idx = (idx + 1) % product.images.length;
    img.src = product.images[idx];
  };

  // количество
  let curQty = qty;
  document.getElementById("detail-minus").onclick = () => {
    if (curQty > 0) curQty--;
    document.getElementById("detail-qty").textContent = curQty;
  };
  document.getElementById("detail-plus").onclick = () => {
    curQty++;
    document.getElementById("detail-qty").textContent = curQty;
  };

  // добавить
  document.getElementById("detail-add").onclick = () => {
    cart[id].qty = curQty;
    updateTotal();
    renderListView();
  };
}

// =============================
//   Страница корзины
// =============================
function renderCartView() {
  const items = Object.values(cart).filter((x) => x.qty > 0);

  const total = items.reduce(
    (s, x) => s + getDiscountedPrice(x.product) * x.qty,
    0
  );

  const html = `
    <div class="product-detail">

      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">Корзина</h1>

      <div class="cart-items">
        ${
          items.length
            ? items
                .map(
                  (x) => `
          <div class="cart-item">
            <img src="${x.product.images[0]}" class="cart-thumb" />

            <div class="cart-info">
              <h3>${x.product.name}</h3>

              <div class="cart-price">
                ${
                  activePromo
                    ? `
                  <span class="old-price">${x.product.priceUsdt} USDT</span>
                  <span class="new-price">${getDiscountedPrice(x.product)} USDT</span>
                `
                    : `<span class="new-price">${x.product.priceUsdt} USDT</span>`
                }
              </div>

              <div class="cart-qty-controls" data-id="${x.product.id}">
                <button class="qty-btn minus">−</button>
                <span class="quantity">${x.qty}</span>
                <button class="qty-btn plus">+</button>
              </div>
            </div>
          </div>
        `
                )
                .join("")
            : `<p class="empty-cart">Корзина пуста</p>`
        }
      </div>

      ${
        items.length
          ? `
      <h2 class="cart-total">Итого: ${total.toFixed(2)} USDT</h2>
      <button id="go-pay" class="detail-add-btn">Перейти к оплате</button>
      `
          : ""
      }

    </div>
  `;

  viewEl.innerHTML = html;

  // назад
  document.querySelector(".back-btn").onclick = () => renderListView();

  // + -
  document.querySelectorAll(".cart-qty-controls").forEach((controls) => {
    const id = Number(controls.dataset.id);

    controls.querySelector(".minus").onclick = () => {
      if (cart[id].qty > 0) cart[id].qty--;
      if (cart[id].qty === 0) return renderCartView();
      updateTotal();
      renderCartView();
    };

    controls.querySelector(".plus").onclick = () => {
      cart[id].qty++;
      updateTotal();
      renderCartView();
    };
  });

  // Перейти к оплате
  const payBtn = document.getElementById("go-pay");
  if (payBtn) payBtn.onclick = () => checkoutBtn.click();
}

// =============================
//   Страница промокода
// =============================
function renderPromoView() {
  const html = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">Промокоды</h1>

      <input id="promo-input"
        placeholder="Например: COSMO10"
        style="width:100%; padding:12px; border-radius:12px;
        border:1px solid #ffffff30; background:#00000070; color:white;"
      />

      <button id="promo-apply" class="detail-add-btn" style="margin-top:10px;">
        Активировать
      </button>

      <p id="promo-msg" style="margin-top:10px; opacity:0.85;"></p>
    </div>
  `;

  viewEl.innerHTML = html;

  document.querySelector(".back-btn").onclick = () => renderListView();

  const input = document.getElementById("promo-input");
  const msg = document.getElementById("promo-msg");

  document.getElementById("promo-apply").onclick = () => {
    const code = input.value.trim().toUpperCase();

    if (!PROMO_CODES[code]) {
      msg.textContent = "Неверный промокод.";
      msg.style.color = "#ff6b6b";
      return;
    }

    activePromo = { code, percent: PROMO_CODES[code] };

    msg.textContent = `Промокод активирован: скидка ${activePromo.percent}%`;
    msg.style.color = "#aaffaa";

    updateTotal();
    renderListView();
  };
}

// =============================
//   Страница "О магазине"
// =============================
function renderAboutView() {
  viewEl.innerHTML = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">О магазине</h1>

      <p class="product-detail-short expanded">
        COSMO SHOP — мини-магазин в Telegram.
      </p>

      <p class="product-detail-full visible">
        Тут будет информация, FAQ и контакты.
      </p>
    </div>
  `;

  document.querySelector(".back-btn").onclick = () => renderListView();
}

// =============================
//   Оформление заказа
// =============================
checkoutBtn.onclick = () => {
  const items = Object.values(cart).filter((x) => x.qty > 0);

  if (!items.length) return alert("Корзина пуста");

  const total = items.reduce(
    (s, x) => s + getDiscountedPrice(x.product) * x.qty,
    0
  );

  const order = {
    promo: activePromo,
    currency: "USDT",
    total: +total.toFixed(2),
    items: items.map((x) => ({
      id: x.product.id,
      name: x.product.name,
      qty: x.qty,
      price: getDiscountedPrice(x.product),
    })),
  };

  if (tg) {
    tg.sendData(JSON.stringify(order));
    tg.close();
  } else {
    console.log(order);
  }
};

// =============================
//   Запуск
// =============================
renderListView();
updateTotal();

// =============================
//   Бургер меню
// =============================
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const sideMenuBackdrop = document.getElementById("sideMenuBackdrop");

function closeMenu() {
  sideMenu.classList.remove("open");
  sideMenuBackdrop.classList.remove("visible");
}

menuToggle.onclick = () => {
  sideMenu.classList.add("open");
  sideMenuBackdrop.classList.add("visible");
};

sideMenuBackdrop.onclick = closeMenu;

// Кнопки меню
const buttons = document.querySelectorAll(".side-menu-btn");

buttons[0].onclick = () => { closeMenu(); renderPromoView(); };
buttons[1].onclick = () => { closeMenu(); renderListView(); };
buttons[2].onclick = () => { closeMenu(); renderCartView(); };
buttons[3].onclick = () => { closeMenu(); renderAboutView(); };