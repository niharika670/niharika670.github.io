/**
 * Router Module for WeSakhi (wesakhi.com)
 * Handles clean hash routing between Gateway, Accounts Sakhi, Sakhi Creations, About, Contact
 */

const Router = {
  currentRoute: 'gateway',

  routes: {
    '': 'gateway',
    '#': 'gateway',
    '#/': 'gateway',
    '#/gateway': 'gateway',
    '#/accounts-sakhi': 'accounts-sakhi',
    '#/ca': 'accounts-sakhi',
    '#/education': 'accounts-sakhi',
    '#/sakhi-creations': 'sakhi-creations',
    '#/craft': 'sakhi-creations',
    '#/handmade': 'sakhi-creations',
    '#/about': 'about',
    '#/contact': 'contact'
  },

  titles: {
    'gateway': 'WeSakhi — Accounts Sakhi & Sakhi Creations | Official Gateway',
    'accounts-sakhi': 'Accounts Sakhi — Accounting • Tax • Compliance • AI Guidance',
    'sakhi-creations': 'Sakhi Creations — Where Her Hands Create Her Future | Handcrafted in Meerut',
    'about': 'About WeSakhi — Professional Finance & Authentic Craft',
    'contact': 'Contact WeSakhi & Direct Inquiries'
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    // Intercept internal routing links with data-route attribute
    document.addEventListener('click', (e) => {
      const routeTarget = e.target.closest('[data-route]');
      if (routeTarget) {
        e.preventDefault();
        const route = routeTarget.getAttribute('data-route');
        this.navigate(route);
      }
    });
  },

  navigate(route) {
    const cleanRoute = route.startsWith('#') ? route : `#/${route}`;
    if (window.location.hash !== cleanRoute) {
      window.location.hash = cleanRoute;
    } else {
      this.handleRoute();
    }
  },

  handleRoute() {
    const hash = window.location.hash || '#/';

    // If it's an in-page anchor (e.g. #ca-resources-box) rather than a view route (#/...)
    if (hash.startsWith('#') && !hash.startsWith('#/')) {
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    const targetView = this.routes[hash] || 'gateway';
    this.currentRoute = targetView;

    // Update Document Title
    document.title = this.titles[targetView] || this.titles['gateway'];

    // Update View DOM Visibility
    const allViews = document.querySelectorAll('.view-section');
    allViews.forEach(view => {
      if (view.id === `view-${targetView}`) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    // Update Header Navigation Active States
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkRoute = link.getAttribute('data-route') || link.getAttribute('href');
      if (linkRoute && (linkRoute === targetView || linkRoute === `#/${targetView}`)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Header Sub-Brand Pills
    const venturePills = document.querySelectorAll('.venture-pill');
    venturePills.forEach(pill => {
      const pillRoute = pill.getAttribute('data-route');
      if (pillRoute === targetView) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Scroll to Top Smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close Mobile Drawer if Open
    if (window.closeMobileNav) {
      window.closeMobileNav();
    }
  }
};

if (typeof window !== "undefined") {
  window.Router = Router;
}
