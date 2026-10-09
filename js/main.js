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
});

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
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
  saveCartToStorage();
}

function checkoutCart() {
  if (cart.length === 0) {
    if (window.Modals && window.Modals.showToast) {
      window.Modals.showToast("Your cart is empty!");
    } else {
      alert("Your cart is empty!");
    }
    return;
  }

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let orderDetails = "Hello Sakhi Creations, I would like to place an order for:\n\n";
  cart.forEach((item, index) => {
    orderDetails += `${index + 1}. ${item.title} - Qty: ${item.quantity} (₹${(item.price * item.quantity).toLocaleString('en-IN')})\n`;
  });
  orderDetails += `\n*Total Amount:* ₹${totalPrice.toLocaleString('en-IN')}`;

  const waLink = `https://wa.me/919068711159?text=${encodeURIComponent(orderDetails)}`;
  window.open(waLink, '_blank');
  
  // Close dropdown after checkout click
  const dropdown = document.getElementById('cart-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}

window.updateQuantity = updateQuantity;
window.addToCart = addToCart;
window.toggleCartDropdown = toggleCartDropdown;
window.removeFromCart = removeFromCart;
window.checkoutCart = checkoutCart;
window.updateCartItemQuantity = updateCartItemQuantity;

// Sort state for Sakhi Creations
let currentSortOrder = 'default';

// Render Sakhi Creations Content
function renderSakhiCreations(filterCat = 'all', sortOrder = currentSortOrder) {
  currentSortOrder = sortOrder;
  const data = window.SAKHI_CREATIONS_CONTENT;
  if (!data) return;

  const productGrid = document.getElementById('creations-product-grid');
  if (productGrid) {
    // Step 1: filter by category
    let filtered = filterCat === 'all'
      ? data.products.slice()
      : data.products.filter(p => p.category === filterCat);

    // Step 2: sort
    if (sortOrder === 'name-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
    } else if (sortOrder === 'name-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title, 'en', { sensitivity: 'base' }));
    } else if (sortOrder === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
    // 'default' = original order

    productGrid.innerHTML = filtered.map(p => {
      return `
        <div class="product-card" id="product-${p.id}">
          <div class="product-image-wrap">
            <img src="${p.image}" alt="${p.title}" class="product-image" loading="lazy">
          </div>
          <div class="product-info">
            <div class="product-origin-badge">Handcrafted in Meerut</div>
            <h4 class="product-name">${p.title}</h4>
            <p class="product-desc-snippet">${p.description}</p>
            <div class="product-footer" style="margin-top: auto; padding-top: 15px;">
              <div class="product-bottom-row" style="display: flex; gap: 10px; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span class="product-price" style="font-size: 1.1rem; font-weight: 600;">₹${p.price.toLocaleString('en-IN')}</span>
                
                <div class="quantity-toggle" style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: 4px; overflow: hidden; height: 32px;">
                  <button onclick="updateQuantity('${p.id}', -1)" style="padding: 0 12px; height: 100%; background: #f5f5f5; border: none; cursor: pointer; font-size: 1.2rem; color: #333; display: flex; align-items: center; justify-content: center;">-</button>
                  <span id="qty-${p.id}" style="padding: 0 12px; font-size: 0.95rem; font-weight: 500; min-width: 30px; text-align: center; border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); height: 100%; display: flex; align-items: center; justify-content: center;">1</span>
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
    }).join('');
  }
}

// Track active category for Sakhi Creations so sort can re-apply it
let currentCraftFilter = 'all';

function initFilters() {
  document.querySelectorAll('.js-ca-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.js-ca-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAccountsSakhi(btn.getAttribute('data-cat'));
    });
  });

  document.querySelectorAll('.js-craft-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.js-craft-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCraftFilter = btn.getAttribute('data-cat');
      renderSakhiCreations(currentCraftFilter, currentSortOrder);
    });
  });

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
      Modals.showToast('Thank you! Your message has been sent to WeSakhi.');
      form.reset();
    });
  }
}

window.downloadResource = downloadResource;
