/* === ГЛОБАЛЬНО === */
* { box-sizing: border-box; }

html, body {
  margin: 0; padding: 0; height: 100%;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #fff; background: #0c0c0c;
}

body::before {
  content: "";
  position: fixed; inset: 0;
  background-image: url("img/background.webp");
  background-size: cover;
  background-position: center;
  opacity: 0.18;
  filter: blur(18px);
  transform: scale(1.1);
  z-index: -1;
}

/* === ПРИЛОЖЕНИЕ === */
.app {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 150px;
}

/* === ХЕДЕР === */
.top-bar {
  position: sticky; top: 0; z-index: 150;
  padding: 14px 18px;
  background: rgba(0, 0, 0, 0.9);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.header-inner {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shop-title {
  font-size: 22px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-align: center;
  text-shadow: 0 0 8px #000, 0 0 14px #000;
}

/* === БУРГЕР === */
#menuToggle {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  z-index: 200;
}
#menuToggle span {
  display: block;
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(255,255,255,0.9);
}

/* === BACKDROP === */
#sideMenuBackdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
  z-index: 180;
}
#sideMenuBackdrop.visible {
  opacity: 1;
  pointer-events: auto;
}

/* === SIDE MENU === */
#sideMenu {
  position: fixed; top: 0; left: -70%;
  width: 70%; max-width: 300px; height: 100%;
  background: radial-gradient(circle at top, rgba(255,255,255,0.08), rgba(0,0,0,0.96) 55%);
  backdrop-filter: blur(18px);
  padding: 24px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: left 0.26s ease-out;
  box-shadow: 10px 0 26px rgba(0,0,0,0.9);
  z-index: 190;
}
#sideMenu.open { left: 0; }

.side-menu-btn {
  padding: 12px 16px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #ffb800, #ffe58a);
  color: #201300;
  font-weight: 700;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 22px rgba(0,0,0,0.85);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.side-menu-btn:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.14), 0 12px 26px rgba(0,0,0,0.95);
}
.side-menu-btn:active { transform: translateY(1px) scale(0.97); }

/* === КАТАЛОГ === */
.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding: 14px;
}
.product-card {
  position: relative;
  background: rgba(0,0,0,0.55);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.7);
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  transform-origin: center center;
}
.product-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 30px rgba(0,0,0,0.95), 0 0 18px rgba(255,184,0,0.45);
  border-color: rgba(255,219,120,0.7);
}
.product-card:active {
  transform: translateY(-1px) scale(0.99);
  box-shadow: 0 6px 16px rgba(0,0,0,0.85);
}
.product-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
  transition: transform 0.28s ease;
}
.product-card:hover .product-thumb {
  transform: scale(1.07) translateY(-2px);
}
.product-info { padding: 10px; }
.product-name { font-weight: 700; margin: 0 0 4px; font-size: 15px; }
.product-desc { font-size: 12px; opacity: 0.78; margin-bottom: 6px; }

.product-price-row, .detail-price-row, .cart-price {
  display: flex;
  align-items: center;
  gap: 6px;
}
.old-price { opacity: 0.6; text-decoration: line-through; font-size: 13px; }
.new-price { color: #ffdd55; font-weight: 700; font-size: 15px; }

/* qty */
.product-controls, .detail-qty-row, .cart-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}
.qty-btn {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.45), inset 0 0 4px rgba(255,255,255,0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.qty-btn:hover { background: rgba(255,255,255,0.24); transform: translateY(-1px); }
.qty-btn:active { transform: translateY(1px) scale(0.95); }
.quantity { font-size: 14px; font-weight: 600; }

/* === DETAIL === */
.product-detail { padding: 14px; }
.detail-slider { position: relative; margin-bottom: 12px; }
.detail-image {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.7);
}
.slider-btn {
  position: absolute; top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.75);
  border: 1px solid rgba(255,255,255,0.28);
  color: #fff;
  width: 42px; height: 42px;
  border-radius: 50%;
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.8);
}
.slider-btn.left { left: 10px; }
.slider-btn.right { right: 10px; }

.product-detail-title {
  font-size: 20px;
  font-weight: 700;
  margin: 14px 0 8px;
  text-align: center;
}
.product-detail-short {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.9;
  cursor: pointer;
}
.product-detail-full {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.5;
  margin-top: 4px;
  display: none;
}
.product-detail-full.visible { display: block; }

/* === CART === */
.cart-list { display: flex; flex-direction: column; gap: 14px; margin-top: 10px; }
.cart-card {
  background: rgba(0,0,0,0.55);
  border-radius: 16px;
  display: flex;
  padding: 10px;
  gap: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.7);
}
.cart-thumb { width: 110px; height: 110px; border-radius: 12px; object-fit: cover; }
.cart-info h2 { margin: 0 0 6px; font-size: 16px; }
.empty-cart { text-align: center; opacity: 0.7; margin-top: 12px; }
.cart-total { margin-top: 16px; font-size: 18px; font-weight: 700; text-align: center; }

/* === BUTTONS === */
.detail-add-btn, #checkout {
  background: linear-gradient(135deg, #ffb800, #ffe58a);
  padding: 12px 24px;
  border-radius: 999px;
  border: none;
  font-weight: 700;
  color: #201300;
  font-size: 16px;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 10px 24px rgba(0,0,0,0.8);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.detail-add-btn:hover, #checkout:hover {
  filter: brightness(1.04);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 14px 30px rgba(0,0,0,0.9);
  transform: translateY(-1px);
}
.detail-add-btn::after, #checkout::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 0 0, rgba(255,255,255,0.55), transparent 60%);
  opacity: 0;
  transform: translateX(-40%);
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.detail-add-btn:hover::after, #checkout:hover::after {
  opacity: 1;
  transform: translateX(40%);
}
.detail-add-btn:active, #checkout:active { transform: translateY(1px) scale(0.97); }

/* === BOTTOM BAR === */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 12px 16px;
  background: rgba(0,0,0,0.78);
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 -8px 18px rgba(0,0,0,0.85);
}
.total-text { font-size: 15px; opacity: 0.9; }

/* ===== VIP minimal helpers (под наш script) ===== */
.vip-page { padding: 14px; }
.vip-title {
  text-align:center;
  font-size: 22px;
  font-weight: 900;
  margin: 12px 0 14px;
  letter-spacing: .10em;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0,0,0,0.85);
}

.vip-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px;}
.vip-hint{font-size:12px;opacity:.70;user-select:none;white-space:nowrap; animation: vipHintFade 4.5s ease-in-out infinite;}
@keyframes vipHintFade { 0%,100%{opacity:.55} 50%{opacity:.85} }

.vip-row { display:flex; gap:14px; overflow-x:auto; padding-bottom:10px; }
.vip-row::-webkit-scrollbar{height:8px;}
.vip-row::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:999px;}
.vip-row-snap{scroll-snap-type:x mandatory;}
.vip-row-snap .vip-card{scroll-snap-align:start;}

.vip-card{
  min-width: 275px;
  flex:0 0 auto;
  background: rgba(0,0,0,0.55);
  border-radius: 18px;
  padding: 14px;
  position: relative;
  overflow:hidden;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 10px 24px rgba(0,0,0,0.85);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.vip-card.selected{
  border-color: rgba(255,219,120,0.95);
  box-shadow: 0 22px 40px rgba(0,0,0,1), 0 0 34px rgba(255,200,80,0.55);
}
.vip-check{
  position:absolute; top:12px; right:12px;
  width:34px; height:34px; border-radius:50%;
  background: rgba(0,0,0,0.65);
  border:1px solid rgba(255,255,255,0.25);
  display:grid; place-items:center;
  font-weight:950;
  opacity:0; transform:scale(.85);
  transition:.18s ease;
}
.vip-card.selected .vip-check{opacity:1; transform:scale(1);}

.vip-rank{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}
.vip-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 12px;border-radius:999px;
  font-weight:900;letter-spacing:.08em;text-transform:uppercase;
  border:1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.35);
  box-shadow: inset 0 0 12px rgba(0,0,0,0.55);
}
.vip-crown{
  width:34px;height:34px;border-radius:12px;
  display:grid;place-items:center;
  border:1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.35);
}
.vip-crown svg{width:20px;height:20px;}

.vip-hero{height:135px;border-radius:16px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,0.15); box-shadow: inset 0 0 26px rgba(0,0,0,0.55);}
.vip-particles{
  position:absolute; inset:0; pointer-events:none; opacity:.35;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.22) 0 1px, transparent 2px),
    radial-gradient(circle, rgba(255,255,255,.14) 0 1px, transparent 2px);
  background-size: 26px 26px, 42px 42px;
  animation: vipParticlesDrift 8s ease-in-out infinite;
}
@keyframes vipParticlesDrift{
  0%{transform:translate3d(-1%,-1%,0)}
  50%{transform:translate3d(1%,1%,0)}
  100%{transform:translate3d(-1%,-1%,0)}
}
.vip-aura{
  position:absolute; inset:-40%;
  filter: blur(26px);
  opacity: .18;
  transform: scale(1);
  animation: vipSoftBreath 5.2s ease-in-out infinite;
  pointer-events:none;
}
.vip-aura.diamond{opacity:.22; animation-duration:4.4s;}
@keyframes vipSoftBreath{0%,100%{transform:scale(1)} 50%{transform:scale(1.05)}}

.vip-name{margin:12px 0 6px;font-size:17px;font-weight:950;}
.vip-desc{font-size:13px;opacity:.86;line-height:1.5;}
.vip-benefits{margin:10px 0 0;padding-left:18px;}
.vip-benefits li{font-size:13px;margin:6px 0;opacity:.92;}

.vip-price-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.10);}
.vip-price{font-weight:950;font-size:18px;letter-spacing:.03em;}
.vip-sub{font-size:12px;opacity:.75;}

.vip-select{
  width:100%;
  margin-top:10px;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,0.20);
  background: rgba(0,0,0,0.50);
  color:#fff;
}

.vip-hero.bronze { background: radial-gradient(circle at top, rgba(205,127,50,0.40), rgba(0,0,0,0.75) 62%); }
.vip-hero.silver { background: radial-gradient(circle at top, rgba(210,210,210,0.35), rgba(0,0,0,0.75) 62%); }
.vip-hero.gold   { background: radial-gradient(circle at top, rgba(255,215,0,0.33), rgba(0,0,0,0.75) 62%); }
.vip-hero.diamond{ background: radial-gradient(circle at top, rgba(120,220,255,0.38), rgba(0,0,0,0.80) 65%); }

.vip-aura.bronze { background: radial-gradient(circle, rgba(205,127,50,0.55), transparent 60%); }
.vip-aura.silver { background: radial-gradient(circle, rgba(210,210,210,0.50), transparent 60%); }
.vip-aura.gold   { background: radial-gradient(circle, rgba(255,215,0,0.50), transparent 60%); }
.vip-aura.diamond{ background: radial-gradient(circle, rgba(120,220,255,0.60), transparent 60%); }

/* === ABOUT PAGE === */
.about-page { padding: 16px; line-height: 1.6; }
.about-page h2 {
  text-align:center;
  margin: 10px 0 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.about-page p { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
.about-footer { text-align:center; margin-top: 18px; opacity: 0.6; font-size: 12px; }