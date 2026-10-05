# Ananya Joshi — Personal Brand Gateway & Dual-Venture Platform

A modern, high-end editorial website frontend designed for a Chartered Accountant and Creator based in India who runs two distinct ventures under one unified personal brand:

1. **CA & Education / Knowledge** — Educational content, masterclasses, and frameworks for CA aspirants, finance professionals, and students (primarily distributed via YouTube).
2. **Handmade Products / Craft Studio** — Intentional, slow-crafted studio objects (stoneware ceramics, archival Khadi paper journals, reclaimed teak desk ware, and hand-hammered brass).

---

## 🌟 Brand Concept & Philosophy

> **“One person. Two passions. Building through knowledge. Creating through craft.”**

The design sits at the intersection of **quiet luxury, editorial credibility, and modern Indian craftsmanship**. It avoids generic corporate accounting templates or flashy influencer aesthetics in favor of thoughtful typography, generous whitespace, tactile imagery, and restrained micro-interactions.

---

## 🏛️ Architecture & Views

The application is built as a responsive Single-Page Architecture (SPA) with deep hash routing:

| Route | View | Description |
|---|---|---|
| `#/` or `#/gateway` | **Main Gateway Landing Page** | Minimal brand hero, the core **Two-Path Split Interactive Panels**, Founder's Duality manifesto, side-by-side comparison, and direct access. |
| `#/ca` | **CA & Education Platform** | Sub-brand hub: YouTube spotlight, filterable masterclass video library, free study vault & downloadable toolkits, and educational philosophy. |
| `#/craft` | **Handmade Studio** | Sub-brand hub: The 3 pillars of slow craft, curated product catalog with live **INR (₹) / USD ($)** currency toggle, interactive product modal, and studio journal notes. |
| `#/about` | **The Ethos & Story** | Narrative exploring how analytical rigor and mindful craft strengthen each other. |
| `#/contact` | **Direct Inquiries** | Dual-track inquiry form for corporate finance training vs custom studio commissions. |

---

## 🎨 Visual Design System

- **Background & Canvas**: Warm Ivory (`#FAF8F5`), Soft Stone Linen (`#F3EFEA`), Pure Crisp White (`#FFFFFF`).
- **Typography**:
  - **Display Serif**: *Cormorant Garamond* (Editorial elegance, timeless character).
  - **Body Sans**: *Plus Jakarta Sans* (Clean, modern readability).
  - **Monospace / Metadata**: *Space Mono* (Technical precision, timestamps, edition numbers).
- **Sub-Brand Palettes**:
  - **CA & Education**: Deep Slate (`#1C2D3D`) & Muted Botanical Sage (`#2E4B3D`).
  - **Handmade Studio**: Warm Terracotta (`#8C442D`) & Burnt Clay Rose (`#BD6E52`).
- **Micro-Interactions**:
  - Parallax depth on split panels.
  - Interactive video modal with takeaways and YouTube direct link.
  - Product modal with multi-image gallery switcher, specs accordion, and reservation bag drawer.
  - Toast feedback for downloads and inquiries.
  - Full `prefers-reduced-motion` and keyboard accessibility compliance.

---

## 📁 File Structure

```
d:\WeSakhi/
├── index.html            # Meticulously structured, accessible semantic HTML5
├── css/
│   ├── design-tokens.css # Color variables, font families, shadows, easings
│   ├── base.css          # Reset, typography scale, buttons, noise texture
│   ├── components.css    # Header, split-cards, video cards, product cards, modals, drawer, footer
│   └── views.css         # View layouts, breadcrumbs, and mobile responsive queries
├── js/
│   ├── data.js           # Central data store for videos, products, resources, and brand config
│   ├── router.js         # Single-page hash routing and document title manager
│   ├── split-cards.js    # Interactive desktop hover mechanics & parallax
│   ├── modals.js         # Video player modal, product detail sheet, reservation drawer, toasts
│   └── main.js           # Dynamic DOM rendering, category filters, and currency toggle
└── README.md             # Project documentation
```

---

## 🚀 How to Run Locally

You can serve the directory using any static file server:

```powershell
# Using Python
python -m http.server 8080

# Or open index.html directly in any modern browser
```

Visit: `http://localhost:8080`
