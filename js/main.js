/**
 * Main Application Logic for WeSakhi (wesakhi.com)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.Router) window.Router.init();
  if (window.Modals) window.Modals.init();

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

// Render Sakhi Creations Content
function renderSakhiCreations(filterCat = 'all') {
  const data = window.SAKHI_CREATIONS_CONTENT;
  if (!data) return;

  const productGrid = document.getElementById('creations-product-grid');
  if (productGrid) {
    const filtered = filterCat === 'all'
      ? data.products
      : data.products.filter(p => p.category === filterCat);

    productGrid.innerHTML = filtered.map(p => {
      const waLink = `https://wa.me/919068711159?text=${encodeURIComponent(`Hello Sakhi Creations, I would like to order/inquire about: "${p.title}" (₹${p.price})`)}`;

      return `
        <div class="product-card">
          <div class="product-image-wrap">
            <img src="${p.image}" alt="${p.title}" class="product-image" loading="lazy">
          </div>
          <div class="product-info">
            <div class="product-origin-badge">Handcrafted in Meerut</div>
            <h4 class="product-name">${p.title}</h4>
            <p class="product-desc-snippet">${p.description}</p>
            <div class="product-bottom-row">
              <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
              <a href="${waLink}" target="_blank" rel="noopener" class="product-order-btn" title="Order via WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.981.536 1.777.82 2.796.82 3.183 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.766-5.769-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.701 0-3.32-.429-4.757-1.196l-5.243 1.375 1.4-5.109c-.838-1.488-1.4-3.237-1.4-5.07 0-5.514 4.486-10 10-10s10 4.486 10 10z"/></svg>
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

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
      renderSakhiCreations(btn.getAttribute('data-cat'));
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
  Modals.showToast(`Downloading: "${title}"...`);
  setTimeout(() => {
    Modals.showToast(`✓ "${title}" downloaded successfully.`);
  }, 1000);
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
