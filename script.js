document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    alert("❌ Telegram WebApp не найден. Открой магазин через кнопку в боте.");
    return;
  }

  tg.ready();
  tg.expand();

  const products = [
    { id: 1, name: "Fox Toy", priceUsdt: 10 },
    { id: 2, name: "Penguin", priceUsdt: 12.5 },
    { id: 3, name: "Toy Car", priceUsdt: 15 },
  ];

  const cart = {};
  products.forEach(p => (cart[p.id] = { ...p, qty: 0 }));

  const viewEl = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout");

  function updateTotal() {
    let total = 0;
    Object.values(cart).forEach(i => (total += i.qty * i.priceUsdt));
    totalEl.textContent = total.toFixed(2);
  }

  function render() {
    viewEl.innerHTML = `
      <div style="padding:16px; display:flex; flex-direction:column; gap:10px;">
        ${products.map(p => `
          <div style="padding:12px;border:1px solid #ffffff33;border-radius:12px;">
            <b>${p.name}</b> — ${p.priceUsdt} USDT<br/>
            <button onclick="window.dec(${p.id})">−</button>
            <span style="margin:0 10px;">${cart[p.id].qty}</span>
            <button onclick="window.inc(${p.id})">+</button>
          </div>
        `).join("")}
      </div>
    `;
    updateTotal();
  }

  window.inc = id => { cart[id].qty++; render(); };
  window.dec = id => { if (cart[id].qty > 0) cart[id].qty--; render(); };

  if (!checkoutBtn) {
    tg.showAlert("❌ Кнопка #checkout не найдена в index.html");
    return;
  }

  checkoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    tg.showAlert("✅ Кнопка Оформить заказ нажата");

    const items = Object.values(cart).filter(i => i.qty > 0);
    if (!items.length) {
      tg.showAlert("Корзина пуста");
      return;
    }

    const order = {
      type: "order",
      total_usdt: +items.reduce((s, i) => s + i.qty * i.priceUsdt, 0).toFixed(2),
      items: items.map(i => ({ name: i.name, qty: i.qty, priceUsdt: i.priceUsdt })),
    };

    try {
      tg.sendData(JSON.stringify(order));
tg.close();
      tg.showAlert("✅ sendData отправлен в бота");
    } catch (err) {
      tg.showAlert("❌ Ошибка sendData: " + String(err));
    }
  });

  tg.showAlert("✅ script.js загружен");
  render();
});