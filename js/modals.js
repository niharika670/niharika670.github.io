/**
 * Modals & Notifications for WeSakhi
 */

const Modals = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop || e.target.closest('.modal-close-btn')) {
          this.closeAllModals();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        const cartDropdown = document.getElementById('cart-dropdown');
        if (cartDropdown) cartDropdown.style.display = 'none';
        if (window.closeMobileNav) window.closeMobileNav();
      }
    });
  },

  openVideoModal(videoId) {
    const video = window.ACCOUNTS_SAKHI_CONTENT?.videos.find(v => v.id === videoId);
    if (!video) return;

    const modal = document.getElementById('modal-video');
    const container = modal.querySelector('.video-modal-container');

    container.innerHTML = `
      <div style="aspect-ratio:16/9; background:#000; border-radius:var(--radius-md); overflow:hidden; margin-bottom:20px;">
        <iframe 
          src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1" 
          title="${video.title}" 
          style="width:100%; height:100%; border:none;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span class="badge" style="background:#EBF2F7; color:#17324D;">${video.categoryLabel}</span>
          <span style="font-family:var(--font-mono); font-size:var(--font-size-xs); color:var(--color-text-tertiary);">${video.duration} &bull; ${video.views}</span>
        </div>
        <h3 style="font-family:var(--font-serif); font-size:1.5rem; line-height:1.25; margin-bottom:10px; color:var(--color-text-main);">${video.title}</h3>
        <p style="font-size:0.95rem; color:var(--color-text-secondary); line-height:1.6; margin-bottom:20px;">${video.description}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:16px; border-top:1px solid var(--color-border);">
          <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--color-text-tertiary);">Accounts सखी™ &bull; YouTube Masterclasses</span>
          <a href="https://youtube.com" target="_blank" rel="noopener" class="btn" style="background:#17324D; color:#FAF8F5; padding:8px 18px; font-size:0.85rem;">
            Watch Full Series on YouTube ↗
          </a>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeAllModals() {
    // Stop any playing video iframes to prevent audio leak
    document.querySelectorAll('.modal-backdrop iframe').forEach(iframe => {
      iframe.src = '';
    });
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  },

  showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('active'));

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

if (typeof window !== "undefined") {
  window.Modals = Modals;
}
