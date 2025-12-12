document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    alert("Открой магазин через кнопку в боте");
    return;
  }

  tg.ready();      // 🔴 ОБЯЗАТЕЛЬНО
  tg.expand();

  const products = [
    { id: 1, name: "Fox Toy", priceUsdt: 10 },
    { id: 2, name: "Penguin", priceUsdt: 12.5 },
    { id: 3, name: "Toy Car", priceUsdt: 15 },
  ];

  const cart = {};
  products.forEach(p => cart[p.id] = { ...p, qty: 0 });

  const view = document.getElementById("view");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkout");

  function render() {
    view.innerHTML = products.map(p => `
      <div style="padding:12px;border:1px solid #ccc;margin:6px">
        <b>${p.name}</b> — ${p.priceUsdt} USDT
        <button onclick="dec(${p.id})">−</button>
        <span>${cart[p.id].qty}</span>
        <button onclick="inc(${p.id})">+</button>
      </div>
    `).join("");

    let total = 0;
    Object.values(cart).forEach(i => total += i.qty * i.priceUsdt);
    totalEl.textContent = total.toFixed(2);
  }

  window.inc = id => { cart[id].qty++; render(); }
  window.dec = id => { if (cart[id].qty > 0) cart[id].qty--; render(); }

  checkoutBtn.onclick = () => {
    tg.showAlert("Кнопка нажата");

    const items = Object.values(cart).filter(i => i.qty > 0);
    if (!items.length) {
      tg.showAlert("Корзина пуста");
      return;
    }

    const order = {
      type: "order",
      total_usdt: +items.reduce((s, i) => s + i.qty * i.priceUsdt, 0).toFixed(2),
      items: items.map(i => ({
        name: i.name,
        qty: i.qty,
        priceUsdt: i.priceUsdt
      }))
    };

    tg.sendData(JSON.stringify(order));
    tg.close(); // 🔴 ОБЯЗАТЕЛЬНО
  };

  render();
});