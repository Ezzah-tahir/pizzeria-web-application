
const API_BASE = 'http://localhost:5000/api';

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  setupNavScroll();
  setupMenuTabs();
  setupHamburger();
  setupScrollAnimations();
});


function getStoredUser() {
  try { return JSON.parse(sessionStorage.getItem('pizzeria_user')); } catch { return null; }
}

function isLoggedIn() {
  return !!getStoredUser();
}


function guardedAction(modalId, event) {
  if (event) event.preventDefault();
  if (isLoggedIn()) {
    openModal(modalId);
  } else {
    openModal('authGuardModal');
  }
}


async function checkLoginStatus() {
  // Verify session with server on every page load
  try {
    const res  = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('pizzeria_user', JSON.stringify(data.user));
      updateNavForLoggedInUser(data.user);
    } else {
      sessionStorage.removeItem('pizzeria_user');
      updateNavForGuest();
    }
  } catch {
    
    const user = getStoredUser();
    user ? updateNavForLoggedInUser(user) : updateNavForGuest();
  }
}

function updateNavForLoggedInUser(user) {
  const loginItem  = document.getElementById('nav-login-item');
  const signupItem = document.getElementById('nav-signup-item');
  if (loginItem)  loginItem.style.display  = 'none';
  if (signupItem) signupItem.style.display = 'none';

  const userItem = document.getElementById('nav-user-item');
  const userName  = document.getElementById('nav-user-name');
  if (userItem) userItem.style.display = '';
  if (userName)  userName.textContent   = `👤 ${user.name}`;

  const logoutItem = document.getElementById('nav-logout-item');
  if (logoutItem) logoutItem.style.display = '';
}

function updateNavForGuest() {
  const loginItem  = document.getElementById('nav-login-item');
  const signupItem = document.getElementById('nav-signup-item');
  if (loginItem)  loginItem.style.display  = '';
  if (signupItem) signupItem.style.display = '';

  const userItem   = document.getElementById('nav-user-item');
  const logoutItem = document.getElementById('nav-logout-item');
  if (userItem)   userItem.style.display   = 'none';
  if (logoutItem) logoutItem.style.display = 'none';
}

async function logoutUser(event) {
  if (event) event.preventDefault();
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {}
  sessionStorage.removeItem('pizzeria_user');
  showToast('Logged out successfully. See you soon! 🍕');
  setTimeout(() => updateNavForGuest(), 400);
}

// ============================================================
// ── NAVBAR: Scroll & Mobile Toggle ────────────────────────
// ============================================================

function setupNavScroll() {
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('open');
      btn.classList.toggle('active');
    });
  }
}

// ============================================================
// ── MENU: Tab Filter ──────────────────────────────────────
// ============================================================

function setupMenuTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? '' : 'none';
      });
    });
  });
}

// ============================================================
// ── CART: Add, Remove, Update Qty ─────────────────────────
// ============================================================

function addToCart(name, price, btn) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartUI();
  showToast(`${name} added to cart! 🍕`);

  if (btn) {
    const originalHTML = btn.innerHTML;
    const originalBg   = btn.style.background;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.style.background = '#27ae60';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = originalBg;
    }, 1000);
  }
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  updateCartUI();
}

function updateQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(name);
  else updateCartUI();
}

function updateCartUI() {
  const count    = cart.reduce((sum, i) => sum + i.quantity, 0);
  const total    = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const countEl  = document.getElementById('cartCount');
  const totalEl  = document.getElementById('cartTotal');
  const emptyEl  = document.getElementById('cartEmpty');
  const itemsEl  = document.getElementById('cartItems');

  if (countEl) {
    countEl.textContent = count;
    countEl.classList.toggle('hidden', count === 0);
  }
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  if (itemsEl && emptyEl) {
    if (cart.length === 0) {
      emptyEl.style.display = '';
    } else {
      emptyEl.style.display = 'none';
      const existing = itemsEl.querySelectorAll('.cart-item-row');
      existing.forEach(el => el.remove());

      cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <div class="cart-item-controls">
            <button onclick="updateQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
            <button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">🗑</button>
          </div>
        `;
        itemsEl.insertBefore(div, emptyEl);
      });
    }
  }
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

// ============================================================
// ── CHECKOUT ──────────────────────────────────────────────
// ============================================================

function checkout() {
  if (cart.length === 0) { showToast('Your cart is empty!', true); return; }

  if (!isLoggedIn()) {
    toggleCart();
    openModal('authGuardModal');
    return;
  }

  toggleCart();
  const summaryEl    = document.getElementById('checkoutSummary');
  const grandTotalEl = document.getElementById('checkoutGrandTotal');
  const total        = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (summaryEl) {
    summaryEl.innerHTML = cart.map(i =>
      `<div class="checkout-item-row">
        <span>${i.name} × ${i.quantity}</span>
        <span>$${(i.price * i.quantity).toFixed(2)}</span>
      </div>`
    ).join('');
  }
  if (grandTotalEl) grandTotalEl.textContent = `$${total.toFixed(2)}`;

  openModal('checkoutModal');
}

async function submitCheckout() {
  const name    = document.getElementById('ch-name')?.value.trim();
  const phone   = document.getElementById('ch-phone')?.value.trim();
  const address = document.getElementById('ch-address')?.value.trim();
  const payment = document.getElementById('ch-payment')?.value;

  if (!name || !phone || !address) { showToast('Please fill in all fields!', true); return; }
  if (!/^\+?[\d\s\-()]{7,}$/.test(phone)) { showToast('Please enter a valid phone number.', true); return; }
  if (cart.length === 0) { showToast('Your cart is empty!', true); return; }

  const paymentMap = { 'Cash on Delivery': 'cash', 'Credit / Debit Card': 'card', 'Online Transfer': 'online' };

  try {
    const res  = await fetch(`${API_BASE}/orders`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include', // Send session cookie
      body: JSON.stringify({
        customerName:    name,
        customerPhone:   phone,
        orderType:       'delivery',
        deliveryAddress: address,
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
        paymentMethod:   paymentMap[payment] || 'cash',
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`🍕 Order placed! ID: ${data.shortId}`);
      cart = []; updateCartUI(); closeModal('checkoutModal');
    } else {
      showToast(data.message || 'Order failed. Try again.', true);
    }
  } catch {
    showToast('Cannot connect to server. Please try again.', true);
  }
}

// ============================================================
// ── DELIVERY / TAKEOUT / BOOKING SUBMIT ───────────────────
// ============================================================

async function submitDelivery() {
  const name    = document.getElementById('d-name')?.value.trim();
  const phone   = document.getElementById('d-phone')?.value.trim();
  const address = document.getElementById('d-address')?.value.trim();
  const notes   = document.getElementById('d-notes')?.value.trim();
  if (!name || !phone || !address) { showToast('Please fill in all required fields!', true); return; }
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        customerName: name, customerPhone: phone,
        orderType: 'delivery', deliveryAddress: address,
        items: [{ name: 'Custom Delivery Order', price: 0, quantity: 1 }],
        specialInstructions: notes,
      }),
    });
    const data = await res.json();
    if (data.success) { showToast('🛵 Delivery order placed!'); closeModal('deliveryModal'); }
    else showToast(data.message || 'Failed to place order.', true);
  } catch {
    showToast('Cannot connect to server.', true);
  }
}

async function submitTakeout() {
  const name     = document.getElementById('t-name')?.value.trim();
  const phone    = document.getElementById('t-phone')?.value.trim();
  const location = document.getElementById('t-location')?.value;
  const time     = document.getElementById('t-time')?.value;
  if (!name || !phone || !location || !time) { showToast('Please fill in all required fields!', true); return; }
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        customerName: name, customerPhone: phone,
        orderType: 'takeout', pickupLocation: location,
        items: [{ name: 'Custom Takeout Order', price: 0, quantity: 1 }],
        specialInstructions: `Pickup at ${time}`,
      }),
    });
    const data = await res.json();
    if (data.success) { showToast(`🛍️ Takeout confirmed! Pickup at ${location}`); closeModal('takeoutModal'); }
    else showToast(data.message || 'Failed.', true);
  } catch {
    showToast('Cannot connect to server.', true);
  }
}

async function submitBooking() {
  const name    = document.getElementById('b-name')?.value.trim();
  const phone   = document.getElementById('b-phone')?.value.trim();
  const date    = document.getElementById('b-date')?.value;
  const time    = document.getElementById('b-time')?.value;
  const guests  = parseInt(document.getElementById('b-guests')?.value); 

  if (!name || !phone || !date || !time) { showToast('Please fill in all required fields!', true); return; }
  if (new Date(date) < new Date().setHours(0,0,0,0)) { showToast('Please select a future date.', true); return; }

  // 
  if (isNaN(guests) || guests < 1 || guests > 20) { showToast('Guest count must be between 1 and 20.', true); return; }

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, phone, date, time, numberOfGuests: guests }), // ✅ number jayega ab
    });
    const data = await res.json();
    if (data.success) { showToast(`🍽️ Table booked for ${guests} on ${date}!`); closeModal('bookingModal'); }
    else showToast(data.message || 'Booking failed.', true);
  } catch {
    showToast('Cannot connect to server.', true);
  }
}

// ============================================================
// ── MODAL HELPERS ─────────────────────────────────────────
// ============================================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function closeModalOnOverlay(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

// ============================================================
// ── TOAST ─────────────────────────────────────────────────
// ============================================================

function showToast(message, isError = false) {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;
  if (toastMsg) toastMsg.textContent = message;
  toast.style.background = isError ? '#e74c3c' : '#27ae60';
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
// ── SCROLL ANIMATIONS ─────────────────────────────────────
// ============================================================

function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}
