// script.js

let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

const products = [
  {
    id: 1,
    name: "Fox Toy",
    shortDescription: "Soft toy fox 25cm",
    fullDescription: "Very soft fox toy, 25cm. Hypoallergenic.",
    priceUsdt: 10,
    discountPercent: 30, // пока не используем
    images: [
      "https://picsum.photos/seed/fox1/600/400",
      "https://picsum.photos/seed/fox2/600/400"
    ],
  },
  {
    id: 2,
    name: "Penguin",
    shortDescription: "Small cute penguin toy",
    fullDescription: "Cute small penguin plush toy.",
    priceUsdt: 12.5,
    discountPercent: 25,
    images: [
      "https://picsum.photos/seed/penguin1/600/400"
    ],
  },
  {
    id: 3,
    name: "Toy Car",
    shortDescription: "Metallic toy car",
    fullDescription: "A premium quality metal toy car.",
    priceUsdt: 15,
    discountPercent: 40,
    images: [
      "https://picsum.photos/seed/car1/600/400",
      "https://picsum.photos/seed/car2/600/400"
    ],
  },
];

let cart = {};
products.forEach((p) => (cart[p.id] = { product: p, qty: 0 }));

const viewEl = document.getElementById("view");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");

function updateTotal() {
  let total = 0;
  Object.values(cart).forEach(({ product, qty }) => {
    total += product.priceUsdt * qty;
  });
  totalEl.textContent = total.toFixed(2);
}

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
              <span class="product-price">${p.priceUsdt} USDT</span>
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
        <span class="detail-price">${product.priceUsdt} USDT</span>
      </div>

      <div class="detail-qty-row">
        <button id="detail-minus" class="qty-btn">−</button>
        <span id="detail-qty" class="quantity">${qty}</span>
        <button id="detail-plus" class="qty-btn">+</button>
      </div>

      <div class="detail-actions">
        <button id="detail-add" class="detail-add-btn">Добавить</button>

        <p class="product-detail-short">
          ${product.shortDescription}
        </p>
        <p class="product-detail-full">
          ${product.fullDescription}
        </p>
      </div>
    </div>
  `;

  viewEl.innerHTML = html;

  // Кнопка назад
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

  // Добавить в корзину
  document.getElementById("detail-add").onclick = () => {
    cart[id].qty = curQty;
    updateTotal();
    renderListView();
  };

  // Краткое + полное описание (раскрытие по клику)
  const shortDesc = document.querySelector(".product-detail-short");
  const fullDesc = document.querySelector(".product-detail-full");

  if (shortDesc && fullDesc) {
    shortDesc.addEventListener("click", () => {
      shortDesc.classList.toggle("expanded");
      fullDesc.classList.toggle("visible");
    });
  }
}

// Оформление заказа
checkoutBtn.onclick = () => {
  const items = Object.values(cart).filter((x) => x.qty > 0);
  if (!items.length) {
    alert("Корзина пуста");
    return;
  }

  const order = {
    currency: "USDT",
    total: items.reduce((s, x) => s + x.product.priceUsdt * x.qty, 0),
    items,
  };

  if (tg) {
    tg.sendData(JSON.stringify(order));
    tg.close();
  } else {
    console.log(order);
  }
};

renderListView();
updateTotal();

/* === ЛОГИКА БОКОВОГО МЕНЮ (бургер) === */
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const sideMenuBackdrop = document.getElementById("sideMenuBackdrop");

if (menuToggle && sideMenu && sideMenuBackdrop) {
  const closeMenu = () => {
    sideMenu.classList.remove("open");
    sideMenuBackdrop.classList.remove("visible");
  };

  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("open");
    sideMenuBackdrop.classList.add("visible");
  });

  sideMenuBackdrop.addEventListener("click", closeMenu);
}