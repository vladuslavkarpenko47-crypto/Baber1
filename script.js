// Telegram WebApp init
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
} else {
  alert("Открой магазин внутри Telegram (через кнопку в боте).");
}

// Товары (поставь свои)
const products = [
  { id: 1, name: "Fox Toy", shortDescription: "Soft toy fox 25cm", priceUsdt: 10 },
  { id: 2, name: "Penguin", shortDescription: "Small cute penguin toy", priceUsdt: 12.5 },
  { id: 3, name: "Toy Car", shortDescription: "Metallic toy car", priceUsdt: 15 },
];

// Корзина
const cart = {};
products.forEach(p => (cart[p.id] = { ...p, qty: 0 }));

const viewEl = document.getElementById("view");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");

function updateTotal() {
  let total = 0;
  Object.values(cart).forEach(i => {
    total += i.qty * i.priceUsdt;
  });
  totalEl.textContent = total.toFixed(2);
}

function renderCatalog() {
  const html = `
    <div style="padding:16px; display:flex; flex-direction:column; gap:12px;">
      ${products.map(p => `
        <div style="padding:14px; border:1px solid #ffffff33; border-radius:14px; background:#00000055;">
          <div style="font-weight:700; font-size:16px; color:white;">${p.name}</div>
          <div style="opacity:.8; margin-top:4px; color:white;">${p.shortDescription}</div>
          <div style="margin-top:10px; color:white;">Цена: <b>${p.priceUsdt} USDT</b></div>

          <div style="margin-top:10px; display:flex; align-items:center; gap:10px;">
            <button onclick="dec(${p.id})" style="width:38px; height:38px; border-radius:10px;">−</button>
            <span style="min-width:24px; text-align:center; color:white;">${cart[p.id].qty}</span>
            <button onclick="inc(${p.id})" style="width:38px; height:38px; border-radius:10px;">+</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
  viewEl.innerHTML = html;
}

window.inc = id => {
  cart[id].qty++;
  renderCatalog();
  updateTotal();
};

window.dec = id => {
  if (cart[id].qty > 0) cart[id].qty--;
  renderCatalog();
  updateTotal();
};

// Оформить заказ → отправляем в бота
checkoutBtn.onclick = () => {
  const items = Object.values(cart).filter(i => i.qty > 0);
  if (!items.length) {
    if (tg) tg.showAlert("Корзина пуста");
    return;
  }

  const totalUsdt = items.reduce((s, i) => s + i.qty * i.priceUsdt, 0);

  const order = {
    type: "order",
    total_usdt: +totalUsdt.toFixed(2),
    items: items.map(i => ({
      name: i.name,
      qty: i.qty,
      priceUsdt: i.priceUsdt
    }))
  };

  tg.sendData(JSON.stringify(order));
  // tg.close(); // можно включить позже
};

renderCatalog();
updateTotal();