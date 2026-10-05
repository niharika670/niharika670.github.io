/**
 * Split Cards Module — Subtle interactive physics and hover states for Two-Path Gateway
 */

const SplitCards = {
  init() {
    const container = document.querySelector('.two-path-container');
    const panels = document.querySelectorAll('.path-panel');

    if (!container || panels.length === 0) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    panels.forEach(panel => {
      // Mouse Move Subtle Parallax on Background Artwork
      if (!prefersReducedMotion && window.innerWidth > 1024) {
        panel.addEventListener('mousemove', (e) => {
          const rect = panel.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          const img = panel.querySelector('.panel-bg-img');
          if (img) {
            img.style.transform = `scale(1.05) translate(${x * 14}px, ${y * 14}px)`;
          }
        });

        panel.addEventListener('mouseleave', () => {
          const img = panel.querySelector('.panel-bg-img');
          if (img) {
            img.style.transform = 'scale(1) translate(0, 0)';
          }
        });
      }

      // Dynamic Grid Ratio Hover for Desktop
      if (window.innerWidth > 1024) {
        panel.addEventListener('mouseenter', () => {
          if (panel.classList.contains('ca-panel')) {
            container.style.gridTemplateColumns = '1.15fr 0.85fr';
          } else if (panel.classList.contains('craft-panel')) {
            container.style.gridTemplateColumns = '0.85fr 1.15fr';
          }
        });

        container.addEventListener('mouseleave', () => {
          container.style.gridTemplateColumns = '1fr 1fr';
        });
      }

      // Keyboard Accessibility (Enter or Space to select)
      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const route = panel.getAttribute('data-route');
          if (route && window.Router) {
            window.Router.navigate(route);
          }
        }
      });
    });

    // Reset grid on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 1024) {
        container.style.gridTemplateColumns = '1fr';
      } else {
        container.style.gridTemplateColumns = '1fr 1fr';
      }
    });
  }
};

if (typeof window !== "undefined") {
  window.SplitCards = SplitCards;
}
