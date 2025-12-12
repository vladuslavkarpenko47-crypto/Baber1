// Telegram WebApp init
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

// Промокоды
const PROMO_CODES = {
  COSMO10: 10,
  COSMO20: 20,
};

let activePromo = null;

// Товары
const products = [
  { id: 1, name: "Fox Toy", shortDescription: "Soft toy fox 25cm", fullDescription: "Very soft fox toy, 25cm. Hypoallergenic.", priceUsdt: 10, images: ["https://picsum.photos/seed/fox1/600/400","https://picsum.photos/seed/fox2/600/400"] },
  { id: 2, name: "Penguin", shortDescription: "Small cute penguin toy", fullDescription: "Cute small penguin plush toy.", priceUsdt: 12.5, images: ["https://picsum.photos/seed/penguin1/600/400"] },
  { id: 3, name: "Toy Car", shortDescription: "Metallic toy car", fullDescription: "Premium metal toy car.", priceUsdt: 15, images: ["https://picsum.photos/seed/car1/600/400","https://picsum.photos/seed/car2/600/400"] },
  { id: 4, name: "Space Bear", shortDescription: "Bear in space suit", fullDescription: "Cute plush bear in a silver astronaut suit.", priceUsdt: 18, images: ["https://picsum.photos/seed/bear1/600/400"] },
  { id: 5, name: "Rocket Lamp", shortDescription: "Rocket night lamp", fullDescription: "Warm rocket night lamp with soft light.", priceUsdt: 22, images: ["https://picsum.photos/seed/rocket1/600/400"] },
  { id: 6, name: "Moon Pillow", shortDescription: "Moon pillow", fullDescription: "Comfortable crescent pillow for sleep.", priceUsdt: 14.5, images: ["https://picsum.photos/seed/moon1/600/400"] },
  { id: 7, name: "Star Garland", shortDescription: "LED star garland", fullDescription: "Warm LED garland with glowing stars.", priceUsdt: 16, images: ["https://picsum.photos/seed/star1/600/400"] },
];

// Корзина
let cart = {};
products.forEach(p => cart[p.id] = { product: p, qty: 0 });

const viewEl = document.getElementById("view");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");

// Цена со скидкой
function getDiscountedPrice(product) {
  if (!activePromo) return product.priceUsdt;
  return +(product.priceUsdt * (1 - activePromo.percent / 100)).toFixed(2);
}

// Обновить сумму
function updateTotal() {
  let total = 0;
  Object.values(cart).forEach(({ product, qty }) => {
    total += qty * getDiscountedPrice(product);
  });
  totalEl.textContent = total.toFixed(2);
}

// Главный каталог
function renderListView() {
  document.querySelector(".bottom-bar").style.display = "flex";

  const html = `
    <div class="product-list">
      ${products
        .map(p => {
          const newPrice = getDiscountedPrice(p);
          const discounted = activePromo !== null;
          return `
            <article class="product-card" data-id="${p.id}">
              <img src="${p.images[0]}" class="product-thumb">
              <div class="product-info">
                <h2 class="product-name">${p.name}</h2>
                <p class="product-desc">${p.shortDescription}</p>

                <div class="product-price-row">
                  ${
                    discounted
                      ? `<span class="old-price">${p.priceUsdt} USDT</span><span class="new-price">${newPrice} USDT</span>`
                      : `<span class="new-price">${p.priceUsdt} USDT</span>`
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
  viewEl.innerHTML = html;

  // клик карточки
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest(".product-controls")) return;
      openProductDetail(Number(card.dataset.id));
    });
  });

  // кнопки +/- 
  document.querySelectorAll(".product-controls").forEach(ctrl => {
    const id = Number(ctrl.dataset.id);
    const qtyEl = ctrl.querySelector(".quantity");

    ctrl.querySelector(".minus").onclick = e => {
      e.stopPropagation();
      if (cart[id].qty > 0) cart[id].qty--;
      qtyEl.textContent = cart[id].qty;
      updateTotal();
    };

    ctrl.querySelector(".plus").onclick = e => {
      e.stopPropagation();
      cart[id].qty++;
      qtyEl.textContent = cart[id].qty;
      updateTotal();
    };
  });
}

// Детальная страница товара
function openProductDetail(id) {
  const { product, qty } = cart[id];
  let idx = 0;

  const html = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>

      <div class="detail-slider">
        <img id="detail-image" src="${product.images[0]}" class="detail-image">
        <button class="slider-btn left" id="prev-slide">‹</button>
        <button class="slider-btn right" id="next-slide">›</button>
      </div>

      <h1 class="product-detail-title">${product.name}</h1>

      <div class="detail-price-row">
        ${
          activePromo
            ? `<span class="old-price">${product.priceUsdt} USDT</span><span class="new-price">${getDiscountedPrice(product)} USDT</span>`
            : `<span class="new-price">${product.priceUsdt} USDT</span>`
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

  // Назад
  document.querySelector(".back-btn").onclick = () => renderListView();

  // Слайдер
  const img = document.getElementById("detail-image");
  document.getElementById("prev-slide").onclick = () => {
    idx = (idx - 1 + product.images.length) % product.images.length;
    img.src = product.images[idx];
  };
  document.getElementById("next-slide").onclick = () => {
    idx = (idx + 1) % product.images.length;
    img.src = product.images[idx];
  };

  // Количество
  let current = qty;
  document.getElementById("detail-minus").onclick = () => {
    if (current > 0) current--;
    document.getElementById("detail-qty").textContent = current;
  };
  document.getElementById("detail-plus").onclick = () => {
    current++;
    document.getElementById("detail-qty").textContent = current;
  };

  // Добавить
  document.getElementById("detail-add").onclick = () => {
    cart[id].qty = current;
    updateTotal();
    renderListView();
  };
}

// КОРЗИНА
function renderCartView() {
  document.querySelector(".bottom-bar").style.display = "none";

  const items = Object.values(cart).filter(x => x.qty > 0);

  const html = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">Корзина</h1>

      <div class="cart-list">
        ${
          items.length
            ? items.map(x => `
              <div class="cart-card">
                <img src="${x.product.images[0]}" class="cart-thumb">

                <div class="cart-info">
                  <h2>${x.product.name}</h2>

                  <div class="cart-price">
                    ${
                      activePromo
                        ? `<span class="old-price">${x.product.priceUsdt} USDT</span>`
                        : ""
                    }
                    <span class="new-price">${getDiscountedPrice(x.product)} USDT</span>
                  </div>

                  <div class="cart-controls" data-id="${x.product.id}">
                    <button class="qty-btn minus">−</button>
                    <span class="quantity">${x.qty}</span>
                    <button class="qty-btn plus">+</button>
                  </div>
                </div>
              </div>
            `).join("")
            : `<p class="empty-cart">Корзина пуста</p>`
        }
      </div>

      ${
        items.length
          ? `
        <h2 class="cart-total">
          Итого: ${items.reduce((s, x) => s + getDiscountedPrice(x.product) * x.qty, 0).toFixed(2)} USDT
        </h2>

        <button id="go-pay" class="detail-add-btn">Перейти к оплате</button>
        `
          : ""
      }
    </div>
  `;
  viewEl.innerHTML = html;

  // Назад
  document.querySelector(".back-btn").onclick = () => {
    renderListView();
    document.querySelector(".bottom-bar").style.display = "flex";
  };

  // Управление количеством
  document.querySelectorAll(".cart-controls").forEach(ctrl => {
    const id = Number(ctrl.dataset.id);

    ctrl.querySelector(".minus").onclick = () => {
      if (cart[id].qty > 0) cart[id].qty--;
      renderCartView();
      updateTotal();
    };

    ctrl.querySelector(".plus").onclick = () => {
      cart[id].qty++;
      renderCartView();
      updateTotal();
    };
  });

  // Перейти к оплате → отправляем заказ в бота
  const pay = document.getElementById("go-pay");
  if (pay && tg) {
    pay.onclick = () => {
      const itemsPayload = items.map(x => ({
        id: x.product.id,
        name: x.product.name,
        qty: x.qty,
        priceUsdt: getDiscountedPrice(x.product)
      }));

      const totalUsdt = items.reduce(
        (s, x) => s + getDiscountedPrice(x.product) * x.qty,
        0
      );

      const order = {
        type: "order",
        currency: "USDT",
        total_usdt: +totalUsdt.toFixed(2),
        items: itemsPayload,
        promo: activePromo
      };

      tg.sendData(JSON.stringify(order));
      tg.close();
    };
  }
}

// ПРОМОКОДЫ
function renderPromoView() {
  document.querySelector(".bottom-bar").style.display = "flex";

  const html = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">Промокоды</h1>

      <input id="promo-input" placeholder="Введите промокод"
        style="width:100%; padding:12px; margin-top:12px;
        border-radius:12px; background:#00000070; border:1px solid #ffffff33; color:white;">

      <button id="promo-apply" class="detail-add-btn" style="margin-top:14px;">
        Активировать
      </button>

      <p id="promo-msg" style="margin-top:10px;"></p>
    </div>
  `;
  viewEl.innerHTML = html;

  // Назад
  document.querySelector(".back-btn").onclick = () => renderListView();

  const input = document.getElementById("promo-input");
  const msg = document.getElementById("promo-msg");

  document.getElementById("promo-apply").onclick = () => {
    const code = input.value.trim().toUpperCase();
    if (!PROMO_CODES[code]) {
      msg.textContent = "Неверный промокод.";
      msg.style.color = "#ff6666";
      return;
    }

    activePromo = { code, percent: PROMO_CODES[code] };
    msg.textContent = `Промокод активирован: -${activePromo.percent}%`;
    msg.style.color = "#aaffaa";

    updateTotal();
    renderListView();
  };
}

// О магазине
function renderAboutView() {
  document.querySelector(".bottom-bar").style.display = "flex";

  viewEl.innerHTML = `
    <div class="product-detail">
      <button class="back-btn">← Назад</button>
      <h1 class="product-detail-title">О магазине</h1>

      <p class="product-detail-short expanded">
        COSMO SHOP — мини-магазин в Telegram.
      </p>
      <p class="product-detail-full visible">
        Здесь будет информация о доставке, оплате и поддержке.
      </p>
    </div>
  `;

  document.querySelector(".back-btn").onclick = () => renderListView();
}

// Нижняя кнопка «Оформить заказ»
checkoutBtn.onclick = () => {
  renderCartView();
  document.querySelector(".bottom-bar").style.display = "none";
};

// Запуск
renderListView();
updateTotal();

// Бургер-меню
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const backdrop = document.getElementById("sideMenuBackdrop");
const sideButtons = document.querySelectorAll(".side-menu-btn");

menuToggle.onclick = () => {
  sideMenu.classList.add("open");
  backdrop.classList.add("visible");
};

backdrop.onclick = () => {
  sideMenu.classList.remove("open");
  backdrop.classList.remove("visible");
};

sideButtons[0].onclick = () => {
  sideMenu.classList.remove("open");
  backdrop.classList.remove("visible");
  renderPromoView();
};

sideButtons[1].onclick = () => {
  sideMenu.classList.remove("open");
  backdrop.classList.remove("visible");
  renderListView();
};

sideButtons[2].onclick = () => {
  sideMenu.classList.remove("open");
  backdrop.classList.remove("visible");
  renderAboutView();
};
// --- TELEGRAM WEBAPP INIT ---
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

// --- TEST ORDER (потом заменим на реальную корзину) ---
function buildOrderForBot() {
  return {
    type: "order",
    total_usdt: 1,
    items: [{ name: "TEST", qty: 1, priceUsdt: 1 }]
  };
}

// --- CHECKOUT CLICK ---
function onCheckoutClick(e) {
  e.preventDefault();

  if (!tg) {
    alert("Открой магазин внутри Telegram (через кнопку в боте), а не в браузере.");
    return;
  }

  const order = buildOrderForBot();

  // чтобы ты точно видел, что клик отработал
  tg.showAlert("Отправляю заказ в бота…");

  tg.sendData(JSON.stringify(order));
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkout");
  if (!btn) {
    if (tg) tg.showAlert("Кнопка #checkout не найдена в index.html");
    return;
  }
  btn.addEventListener("click", onCheckoutClick);
});