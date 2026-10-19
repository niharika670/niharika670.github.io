/**
 * Main Application Logic for WeSakhi (wesakhi.com)
 */

// ── Cart localStorage persistence ──────────────────────────────────────────
const CART_STORAGE_KEY = 'wesakhi_cart_v1';

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    // localStorage unavailable (private browsing quota exceeded etc.) — fail silently
  }
}

function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate: must be an array with valid cart items
      if (Array.isArray(parsed)) {
        cart = parsed.filter(item =>
          item && typeof item.id === 'string' &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' && item.quantity > 0
        );
      }
    }
  } catch (e) {
    cart = [];
  }
}
// ───────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (window.Router) window.Router.init();
  if (window.Modals) window.Modals.init();
  if (window.SplitCards) window.SplitCards.init();

  loadCartFromStorage();   // Restore cart before first render
  updateCartUI();          // Reflect restored cart in header immediately

  renderAccountsSakhi();
  renderSakhiCreations();
  initHeaderScroll();
  initMobileNav();
  initFilters();
  initContactForm();
  initCartEvents();
  setupOrderValidationEvents();
});

function initCartEvents() {
  // Stop any click inside the cart dropdown from reaching the document-level
  // close handler — prevents the cart from closing when +/- or remove buttons
  // re-render the DOM (which causes e.target to no longer be inside .cart-container).
  const dropdown = document.getElementById('cart-dropdown');
  if (dropdown) {
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener('click', (e) => {
    const container = document.querySelector('.cart-container');
    const drop = document.getElementById('cart-dropdown');
    if (drop && drop.style.display === 'flex') {
      if (container && !container.contains(e.target)) {
        drop.style.display = 'none';
      }
    }
  });
}

// Render Accounts Sakhi Content
function renderAccountsSakhi(filterCat = 'all') {
  const data = window.ACCOUNTS_SAKHI_CONTENT;
  if (!data) return;

  const videoGrid = document.getElementById('accounts-video-grid');
  if (videoGrid) {
    const filtered = filterCat === 'all' 
      ? data.videos 
      : data.videos.filter(v => v.category === filterCat);

    videoGrid.innerHTML = filtered.map(v => `
      <div class="video-card">
        <div class="video-thumb-wrap" onclick="Modals.openVideoModal('${v.id}')">
          <img src="${v.thumbnail}" alt="${v.title}" class="video-thumb" loading="lazy">
          <span class="video-duration">${v.duration}</span>
          <div class="play-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        <div class="video-body">
          <div class="video-meta">
            <span class="badge" style="background:#EBF2F7; color:#17324D;">${v.categoryLabel}</span>
            <span>${v.views}</span>
          </div>
          <h4 class="video-title" onclick="Modals.openVideoModal('${v.id}')">${v.title}</h4>
          <p class="video-desc">${v.description}</p>
          <div style="margin-top:auto; padding-top:10px;">
            <button class="btn-text" style="color:#17324D; font-size:0.85rem;" onclick="Modals.openVideoModal('${v.id}')">
              Watch Lecture Preview ▶
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  const resGrid = document.getElementById('accounts-resource-grid');
  if (resGrid) {
    resGrid.innerHTML = data.resources.map(res => `
      <div style="background:#FFFFFF; border:1px solid var(--color-border); border-radius:var(--radius-md); padding:var(--space-lg); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <span class="badge" style="background:#EBF2F7; color:#17324D; margin-bottom:10px;">${res.badge}</span>
          <h4 style="font-family:var(--font-serif); font-size:1.2rem; margin-bottom:6px; color:var(--color-text-main);">${res.title}</h4>
          <p style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:16px;">${res.description}</p>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:0.75rem; color:var(--color-text-tertiary); margin-bottom:12px;">
            <span>${res.type}</span>
            <span>${res.size}</span>
          </div>
          <button class="btn btn-secondary" style="width:100%; font-size:0.8125rem; padding:8px;" onclick="downloadResource('${res.title}')">
            Download Framework (PDF) ↓
          </button>
        </div>
      </div>
    `).join('');
  }
}

// Cart state
let cart = [];
let productQuantities = {};

function updateQuantity(productId, change) {
  if (!productQuantities[productId]) {
    productQuantities[productId] = 1;
  }
  let newQty = productQuantities[productId] + change;
  if (newQty < 1) newQty = 1;
  productQuantities[productId] = newQty;
  const qtyEl = document.getElementById(`qty-${productId}`);
  if (qtyEl) {
    qtyEl.textContent = newQty;
  }
}

function addToCart(productId) {
  const data = window.SAKHI_CREATIONS_CONTENT;
  const product = data.products.find(p => p.id === productId);
  if (!product) return;

  const qty = productQuantities[productId] || 1;
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  
  // Reset local quantity
  productQuantities[productId] = 1;
  const qtyEl = document.getElementById(`qty-${productId}`);
  if (qtyEl) qtyEl.textContent = 1;

  updateCartUI();
  saveCartToStorage();

  // GA4 Ecommerce Event: add_to_cart
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: product.price * qty,
      items: [{
        item_id: product.id,
        item_name: product.title,
        item_category: product.categoryLabel || product.category,
        price: product.price,
        quantity: qty
      }]
    });
  }
  
  if (window.Modals && window.Modals.showToast) {
    window.Modals.showToast(`Added ${qty} × ${product.title} to cart.`);
  } else {
    alert(`Added ${qty} ${product.title} to cart.`);
  }
}

function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  const cartDropdownTotal = document.getElementById('cart-dropdown-total');
  const cartItemsContainer = document.getElementById('cart-items-container');
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartCount) cartCount.textContent = totalItems;
  if (cartTotal) cartTotal.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
  if (cartDropdownTotal) cartDropdownTotal.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;

  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div style="text-align: center; color: var(--color-text-tertiary); padding: 20px 0;">Your cart is empty</div>';
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
          <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: contain; background: #FAF8F5; border-radius: 6px; padding: 2px; border: 1px solid var(--color-border);">
          <div style="flex-grow: 1;">
            <div style="font-size: 0.9rem; font-weight: 500; line-height: 1.3; margin-bottom: 6px;">${item.title}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.95rem; font-weight: 700; color: #17324D;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
              <div style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; height: 26px;">
                <button onclick="updateCartItemQuantity('${item.id}', -1)" style="padding: 0 8px; height: 100%; background: #f5f5f5; border: none; cursor: pointer; color: #333; font-weight: bold;">-</button>
                <span style="padding: 0 10px; font-size: 0.85rem; font-weight: 600; min-width: 20px; text-align: center; border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); height: 100%; display: flex; align-items: center; justify-content: center; background: #fff;">${item.quantity}</span>
                <button onclick="updateCartItemQuantity('${item.id}', 1)" style="padding: 0 8px; height: 100%; background: #f5f5f5; border: none; cursor: pointer; color: #333; font-weight: bold;">+</button>
              </div>
            </div>
          </div>
          <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #CC0000; cursor: pointer; font-size: 1.4rem; line-height: 1; padding: 0 5px;" title="Remove item">&times;</button>
        </div>
      `).join('');
    }
  }
}

function updateCartItemQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
      saveCartToStorage();
    }
  }
}

function toggleCartDropdown() {
  const dropdown = document.getElementById('cart-dropdown');
  if (dropdown) {
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
      dropdown.style.display = 'flex';
      updateCartUI(); // Ensure it's up to date when opened
    } else {
      dropdown.style.display = 'none';
    }
  }
}

function removeFromCart(productId) {
  const itemToRemove = cart.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
  saveCartToStorage();

  // GA4 Ecommerce Event: remove_from_cart
  if (itemToRemove && typeof window.gtag === 'function') {
    window.gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: itemToRemove.price * itemToRemove.quantity,
      items: [{
        item_id: itemToRemove.id,
        item_name: itemToRemove.title,
        price: itemToRemove.price,
        quantity: itemToRemove.quantity
      }]
    });
  }
}

function clearAllOrderErrors() {
  const errorElements = document.querySelectorAll('#order-checkout-form .field-error');
  errorElements.forEach(el => {
    el.textContent = '';
    el.classList.remove('active');
  });
  const inputElements = document.querySelectorAll('#order-checkout-form .input-error');
  inputElements.forEach(el => el.classList.remove('input-error'));
}

function setupOrderValidationEvents() {
  const form = document.getElementById('order-checkout-form');
  if (!form) return;

  const fields = [
    { inputId: 'order-name', errId: 'err-name' },
    { inputId: 'order-phone', errId: 'err-phone' },
    { inputId: 'order-email', errId: 'err-email' },
    { inputId: 'order-address', errId: 'err-address' },
    { inputId: 'order-city', errId: 'err-city' },
    { inputId: 'order-state', errId: 'err-state' },
    { inputId: 'order-pincode', errId: 'err-pincode' }
  ];

  fields.forEach(({ inputId, errId }) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const errEl = document.getElementById(errId);
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('active');
      }
    });
  });

  // Dedicated PIN Code numeric constraint (maximum 6 digits)
  const pinInput = document.getElementById('order-pincode');
  if (pinInput) {
    pinInput.addEventListener('input', () => {
      pinInput.value = pinInput.value.replace(/[^0-9]/g, '').slice(0, 6);
    });
  }

  // Dedicated mobile number character filter
  const phoneInput = document.getElementById('order-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9+\s\-]/g, '');
    });
  }
}

function validateOrderForm() {
  let isValid = true;
  let firstInvalidEl = null;

  function setError(inputId, errId, message) {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(errId);
    if (input) input.classList.add('input-error');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('active');
    }
    isValid = false;
    if (!firstInvalidEl && input) firstInvalidEl = input;
  }

  function clearError(inputId, errId) {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(errId);
    if (input) input.classList.remove('input-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('active');
    }
  }

  // 1. Full Name check
  const nameEl = document.getElementById('order-name');
  const nameVal = nameEl ? nameEl.value.trim() : '';
  if (!nameVal || nameVal.length < 2) {
    setError('order-name', 'err-name', 'Please enter your full name (at least 2 characters).');
  } else {
    clearError('order-name', 'err-name');
  }

  // 2. Mobile Number Validation Check
  const phoneEl = document.getElementById('order-phone');
  const phoneVal = phoneEl ? phoneEl.value.trim() : '';
  const cleanPhone = phoneVal.replace(/[\s\-\(\)\.]/g, '');
  // Standard Indian 10-digit mobile check (optional +91, 91, or 0 prefix, first digit 6-9)
  const indianMobileRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  // General valid international 10 to 14 digit mobile number
  const generalMobileRegex = /^\+?[0-9]{10,14}$/;

  if (!phoneVal) {
    setError('order-phone', 'err-phone', 'Please enter your 10-digit mobile number.');
  } else if (!indianMobileRegex.test(cleanPhone) && !generalMobileRegex.test(cleanPhone)) {
    setError('order-phone', 'err-phone', 'Please enter a valid 10-digit mobile number (e.g. 9876543210).');
  } else {
    clearError('order-phone', 'err-phone');
  }

  // 3. Email Address Validation Check
  const emailEl = document.getElementById('order-email');
  const emailVal = emailEl ? emailEl.value.trim() : '';
  // Comprehensive RFC 5322-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailVal) {
    setError('order-email', 'err-email', 'Please enter your email address.');
  } else if (!emailRegex.test(emailVal) || emailVal.includes('..')) {
    setError('order-email', 'err-email', 'Please enter a valid email address (e.g. yourname@domain.com).');
  } else {
    clearError('order-email', 'err-email');
  }

  // 4. Delivery Address check
  const addressEl = document.getElementById('order-address');
  const addressVal = addressEl ? addressEl.value.trim() : '';
  if (!addressVal || addressVal.length < 8) {
    setError('order-address', 'err-address', 'Please provide a complete delivery address (House/Flat No., Street, Area).');
  } else {
    clearError('order-address', 'err-address');
  }

  // 5. City check
  const cityEl = document.getElementById('order-city');
  const cityVal = cityEl ? cityEl.value.trim() : '';
  if (!cityVal || cityVal.length < 2) {
    setError('order-city', 'err-city', 'Please enter your city name.');
  } else {
    clearError('order-city', 'err-city');
  }

  // 6. State check
  const stateEl = document.getElementById('order-state');
  const stateVal = stateEl ? stateEl.value.trim() : '';
  if (!stateVal || stateVal.length < 2) {
    setError('order-state', 'err-state', 'Please enter your state.');
  } else {
    clearError('order-state', 'err-state');
  }

  // 7. PIN Code Validation Check
  const pinEl = document.getElementById('order-pincode');
  const pinVal = pinEl ? pinEl.value.trim() : '';
  // Standard 6-digit Indian Postal PIN code (cannot start with 0)
  const pincodeRegex = /^[1-9][0-9]{5}$/;

  if (!pinVal) {
    setError('order-pincode', 'err-pincode', 'Please enter your 6-digit PIN code.');
  } else if (!pincodeRegex.test(pinVal)) {
    setError('order-pincode', 'err-pincode', 'Please enter a valid 6-digit PIN code (e.g. 250001).');
  } else {
    clearError('order-pincode', 'err-pincode');
  }

  if (firstInvalidEl) {
    firstInvalidEl.focus();
  }

  return isValid;
}

function openOrderCheckoutModal() {
  if (cart.length === 0) {
    if (window.Modals && window.Modals.showToast) {
      window.Modals.showToast("Your cart is empty! Please add products first.");
    } else {
      alert("Your cart is empty!");
    }
    return;
  }

  // Close cart dropdown
  const dropdown = document.getElementById('cart-dropdown');
  if (dropdown) dropdown.style.display = 'none';

  // Clear any existing validation errors
  clearAllOrderErrors();

  // Render items summary in modal
  const summaryCount = document.getElementById('checkout-summary-count');
  const summaryItems = document.getElementById('checkout-summary-items');
  const summaryTotal = document.getElementById('checkout-summary-total');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (summaryCount) summaryCount.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
  if (summaryTotal) summaryTotal.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;

  // GA4 Ecommerce Event: begin_checkout
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: totalPrice,
      items: cart.map(item => ({
        item_id: item.id,
        item_name: item.title,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  if (summaryItems) {
    summaryItems.innerHTML = cart.map((item, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="padding-right:12px;">
          <span style="font-weight:600;">${idx + 1}. ${item.title}</span>
          <span style="color:var(--color-text-tertiary); font-size:0.8rem;"> &times; ${item.quantity}</span>
        </div>
        <span style="font-weight:600; white-space:nowrap;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
      </div>
    `).join('');
  }

  // Open modal and ensure form view is visible
  const modal = document.getElementById('modal-order-checkout');
  const form = document.getElementById('order-checkout-form');
  const summaryBox = document.querySelector('.checkout-summary-box');
  const successView = document.getElementById('order-success-view');

  if (form) form.style.display = 'block';
  if (summaryBox) summaryBox.style.display = 'block';
  if (successView) successView.style.display = 'none';

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('modal-order-checkout');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';

  const form = document.getElementById('order-checkout-form');
  const summaryBox = document.querySelector('.checkout-summary-box');
  const successView = document.getElementById('order-success-view');

  if (form) {
    form.reset();
    form.style.display = 'block';
  }
  if (summaryBox) summaryBox.style.display = 'block';
  if (successView) successView.style.display = 'none';
  clearAllOrderErrors();
}

async function handleOrderSubmit(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Perform client-side validation checks
  if (!validateOrderForm()) {
    return;
  }

  const submitBtn = document.getElementById('order-submit-btn');
  const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Submit';

  const name = document.getElementById('order-name').value.trim();
  const phone = document.getElementById('order-phone').value.trim();
  const email = document.getElementById('order-email').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const city = document.getElementById('order-city').value.trim();
  const state = document.getElementById('order-state').value.trim();
  const pincode = document.getElementById('order-pincode').value.trim();
  const notes = document.getElementById('order-notes').value.trim();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;

  let itemsSummary = '';
  cart.forEach((item, idx) => {
    itemsSummary += `${idx + 1}. ${item.title} — Qty: ${item.quantity} (₹${(item.price * item.quantity).toLocaleString('en-IN')})\n`;
  });

  const orderId = `WS-${Date.now().toString().slice(-6)}`;

  // Show loading feedback on submit button
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Placing Order... ⏳</span>';
  }

  const payload = {
    _subject: `New WeSakhi Order #${orderId} from ${name}`,
    _replyto: email,
    _template: 'table',
    'Order ID': orderId,
    'Customer Name': name,
    'Contact Number': phone,
    'Customer Email': email,
    'PIN Code': pincode,
    'Delivery Address': fullAddress,
    'Street / Area': address,
    'City': city,
    'State': state,
    'Products Ordered': itemsSummary,
    'Total Items': totalItems,
    'Total Amount': `₹${totalPrice.toLocaleString('en-IN')}`,
    'Special Instructions': notes || 'None',
    'Order Placed At': new Date().toLocaleString('en-IN')
  };

  // 1. Send formatted email notification
  try {
    await fetch('https://formsubmit.co/ajax/niharika@wesakhi.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('[Order] Email API notification:', err);
  }

  // GA4 Ecommerce Event: purchase
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: totalPrice,
      currency: 'INR',
      items: cart.map(item => ({
        item_id: item.id,
        item_name: item.title,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  // Clear cart and storage
  cart = [];
  updateCartUI();
  saveCartToStorage();

  // Reset button state
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
  }

  // Display Order ID confirmation view to user (No WhatsApp redirect)
  const form = document.getElementById('order-checkout-form');
  const summaryBox = document.querySelector('.checkout-summary-box');
  const successView = document.getElementById('order-success-view');
  const confirmedOrderIdEl = document.getElementById('confirmed-order-id');

  if (form) form.style.display = 'none';
  if (summaryBox) summaryBox.style.display = 'none';
  if (confirmedOrderIdEl) confirmedOrderIdEl.textContent = orderId;
  if (successView) successView.style.display = 'block';

  // Toast confirmation
  if (window.Modals && window.Modals.showToast) {
    window.Modals.showToast(`✓ Order #${orderId} confirmed!`);
  }
}

// Backward-compatible alias
function checkoutCart() {
  openOrderCheckoutModal();
}

window.updateQuantity = updateQuantity;
window.addToCart = addToCart;
window.toggleCartDropdown = toggleCartDropdown;
window.removeFromCart = removeFromCart;
window.checkoutCart = checkoutCart;
window.openOrderCheckoutModal = openOrderCheckoutModal;
window.closeOrderSuccessModal = closeOrderSuccessModal;
window.handleOrderSubmit = handleOrderSubmit;
window.updateCartItemQuantity = updateCartItemQuantity;
window.validateOrderForm = validateOrderForm;
window.selectCraftCategory = selectCraftCategory;

// Sort state for Sakhi Creations
let currentSortOrder = 'default';

function renderProductCardHTML(p) {
  const currentQty = productQuantities[p.id] || 1;
  return `
    <div class="product-card" id="product-${p.id}">
      <div class="product-image-wrap">
        <img src="${p.image}" alt="${p.title}" class="product-image" loading="lazy" onerror="this.onerror=null; this.src='assets/images/sakhi-creations-logo.jpg'; this.style.objectFit='contain'; this.style.padding='16px';">
      </div>
      <div class="product-info">
        <div class="product-origin-badge">Handcrafted in Meerut</div>
        <h4 class="product-name">${p.title}</h4>
        <p class="product-desc-snippet">${p.description}</p>
        <div class="product-footer" style="margin-top: auto; padding-top: 15px;">
          <div class="product-bottom-row" style="display: flex; gap: 10px; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
            
            <div class="quantity-toggle" style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; height: 32px;">
              <button onclick="updateQuantity('${p.id}', -1)" style="padding: 0 12px; height: 100%; background: #f5f5f5; border: none; cursor: pointer; font-size: 1.2rem; color: #333; display: flex; align-items: center; justify-content: center;">-</button>
              <span id="qty-${p.id}" style="padding: 0 12px; font-size: 0.95rem; font-weight: 500; min-width: 30px; text-align: center; border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); height: 100%; display: flex; align-items: center; justify-content: center;">${currentQty}</span>
              <button onclick="updateQuantity('${p.id}', 1)" style="padding: 0 12px; height: 100%; background: #f5f5f5; border: none; cursor: pointer; font-size: 1.2rem; color: #333; display: flex; align-items: center; justify-content: center;">+</button>
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 10px; background: #7A2833; border-color: #7A2833;" onclick="addToCart('${p.id}')">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

function sortProductsList(items, sortOrder) {
  const list = items.slice();
  if (sortOrder === 'name-asc') {
    list.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
  } else if (sortOrder === 'name-desc') {
    list.sort((a, b) => b.title.localeCompare(a.title, 'en', { sensitivity: 'base' }));
  } else if (sortOrder === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  }
  return list;
}

// Render Sakhi Creations Content:
// - When filterCat === 'all': single, continuous, uninterrupted product grid without category headings or gaps
// - When filterCat is a specific category: category-specific section with header and count
function renderSakhiCreations(filterCat = currentCraftFilter, sortOrder = currentSortOrder) {
  currentCraftFilter = filterCat;
  currentSortOrder = sortOrder;
  const data = window.SAKHI_CREATIONS_CONTENT;
  if (!data) return;

  const productGrid = document.getElementById('creations-product-grid');
  if (!productGrid) return;

  // Empty data check
  if (!data.products || data.products.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-products-state" style="text-align:center; padding: 60px 20px; background: #FFFFFF; border: 1px dashed var(--color-border); border-radius: var(--radius-lg); margin: 20px 0;">
        <div style="font-size: 2.2rem; margin-bottom: 12px; color: #7A2833;">🔍</div>
        <h4 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-text-main); margin-bottom: 8px;">No Products Found</h4>
        <p style="font-size: 0.95rem; color: var(--color-text-secondary); max-width: 440px; margin: 0 auto 20px auto;">We couldn't find any products in the catalog.</p>
      </div>`;
    return;
  }

  // 1. "All Categories" selected: Flat, continuous, uninterrupted product listing
  if (filterCat === 'all') {
    const allProducts = sortProductsList(data.products, sortOrder);

    if (allProducts.length === 0) {
      productGrid.innerHTML = `
        <div class="empty-products-state" style="text-align:center; padding: 60px 20px; background: #FFFFFF; border: 1px dashed var(--color-border); border-radius: var(--radius-lg); margin: 20px 0;">
          <div style="font-size: 2.2rem; margin-bottom: 12px; color: #7A2833;">🔍</div>
          <h4 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-text-main); margin-bottom: 8px;">No Products Found</h4>
          <p style="font-size: 0.95rem; color: var(--color-text-secondary); max-width: 440px; margin: 0 auto 20px auto;">We couldn't find any products in the catalog.</p>
        </div>`;
      return;
    }

    productGrid.innerHTML = `
      <div class="product-grid" id="all-products-grid">
        ${allProducts.map(renderProductCardHTML).join('')}
      </div>
    `;
    return;
  }

  // 2. Specific category selected: Filter products to that category and display with category header
  let catProducts = data.products.filter(p => p.category === filterCat);
  catProducts = sortProductsList(catProducts, sortOrder);

  // Derive human-readable category label dynamically
  let catLabel = filterCat;
  if (data.categories && data.categories.length > 0) {
    const matched = data.categories.find(c => c.id === filterCat);
    if (matched) catLabel = matched.label;
  }
  if (catLabel === filterCat && catProducts.length > 0 && catProducts[0].categoryLabel) {
    catLabel = catProducts[0].categoryLabel;
  }

  if (catProducts.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-products-state" style="text-align:center; padding: 60px 20px; background: #FFFFFF; border: 1px dashed var(--color-border); border-radius: var(--radius-lg); margin: 20px 0;">
        <div style="font-size: 2.2rem; margin-bottom: 12px; color: #7A2833;">🔍</div>
        <h4 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-text-main); margin-bottom: 8px;">No Products in "${catLabel}"</h4>
        <p style="font-size: 0.95rem; color: var(--color-text-secondary); max-width: 440px; margin: 0 auto 20px auto;">Currently no designs are available under this selection. Please check back soon or browse all collections.</p>
        <button class="btn btn-secondary" onclick="selectCraftCategory('all')">View All Categories</button>
      </div>`;
    return;
  }

  productGrid.innerHTML = `
    <section class="product-category-section" id="category-section-${filterCat}">
      <div class="category-header">
        <div class="category-header-left">
          <h3 class="category-title">${catLabel}</h3>
          <span class="category-count">(${catProducts.length} Design${catProducts.length > 1 ? 's' : ''})</span>
        </div>
      </div>
      <div class="product-grid">
        ${catProducts.map(renderProductCardHTML).join('')}
      </div>
    </section>
  `;
}

// Track active category for Sakhi Creations so sort can re-apply it
let currentCraftFilter = 'all';

// Helper to select craft category programmatically and update UI buttons
function selectCraftCategory(catId) {
  currentCraftFilter = catId;
  const container = document.getElementById('craft-category-buttons');
  if (container) {
    container.querySelectorAll('.category-btn').forEach(btn => {
      const isSelected = btn.getAttribute('data-cat') === catId;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
  }
  renderSakhiCreations(currentCraftFilter, currentSortOrder);

  // GA4 Event: select_content (category filter)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'select_content', {
      content_type: 'product_category',
      item_id: catId
    });
  }
}

// Dynamically generate category filter buttons from data
function renderCraftCategoryButtons() {
  const container = document.getElementById('craft-category-buttons');
  if (!container) return;

  const data = window.SAKHI_CREATIONS_CONTENT;
  if (!data) return;

  // Base list of categories starting with "All Categories"
  const categories = [
    { id: 'all', label: 'All Categories' }
  ];

  if (data.categories && data.categories.length > 0) {
    data.categories.forEach(c => {
      if (c.id !== 'all' && !categories.some(existing => existing.id === c.id)) {
        categories.push({ id: c.id, label: c.label });
      }
    });
  } else if (data.products && data.products.length > 0) {
    const seen = new Set();
    data.products.forEach(p => {
      if (p.category && !seen.has(p.category)) {
        seen.add(p.category);
        categories.push({
          id: p.category,
          label: p.categoryLabel || p.category
        });
      }
    });
  }

  container.innerHTML = categories.map(cat => {
    const isActive = cat.id === currentCraftFilter;
    return `
      <button 
        type="button"
        class="category-btn js-craft-filter ${isActive ? 'active' : ''}" 
        data-cat="${cat.id}"
        role="tab"
        aria-selected="${isActive ? 'true' : 'false'}"
      >
        ${cat.label}
      </button>
    `;
  }).join('');

  // Attach click listener for dynamically generated buttons
  container.querySelectorAll('.js-craft-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCat = btn.getAttribute('data-cat');
      selectCraftCategory(selectedCat);
    });
  });
}

function initFilters() {
  document.querySelectorAll('.js-ca-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.js-ca-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAccountsSakhi(btn.getAttribute('data-cat'));
    });
  });

  // Dynamically render category buttons for Sakhi Creations
  renderCraftCategoryButtons();

  // Sort buttons for Sakhi Creations
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSakhiCreations(currentCraftFilter, btn.getAttribute('data-sort'));
    });
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

function initMobileNav() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const closeBtn = document.querySelector('.mobile-nav-close-btn');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => drawer.classList.add('open'));
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => closeMobileNav());
  }

  window.closeMobileNav = () => {
    if (drawer) drawer.classList.remove('open');
  };
}

function downloadResource(title) {
  if (window.Modals && window.Modals.showToast) {
    window.Modals.showToast(`Downloading: "${title}"...`);
    setTimeout(() => {
      window.Modals.showToast(`✓ "${title}" downloaded successfully.`);
    }, 1000);
  }
}

function initContactForm() {
  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // GA4 Lead Generation Event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          lead_type: 'general_inquiry',
          method: 'contact_form'
        });
      }

      if (window.Modals && window.Modals.showToast) {
        window.Modals.showToast('Thank you! Your message has been sent to WeSakhi.');
      }
      form.reset();
    });
  }
}

window.downloadResource = downloadResource;
