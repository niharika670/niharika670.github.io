/**
 * Data store for WeSakhi (wesakhi.com)
 * Brand: WeSakhi
 * Venture 1: Accounts Sakhi (Accounting • Tax • Compliance • AI Guidance)
 * Venture 2: Sakhi Creations ("Where Her Hands Create Her Future" - Handcrafted in Meerut)
 */

const BRAND_CONFIG = {
  domain: "wesakhi.com",
  brandName: "WeSakhi",
  tagline: "One Platform. Two Passions.",
  statement: "Connecting professional financial expertise with authentic handmade craftsmanship.",
  location: "Meerut & New Delhi, India",
  phone: "9068711159",
  whatsappUrl: "https://wa.me/919068711159",
  email: "contact@wesakhi.com",
  currency: { symbol: "₹", code: "INR" }
};

const ACCOUNTS_SAKHI_CONTENT = {
  title: "Accounts Sakhi",
  hindiTitle: "Accounts सखी™",
  logo: "assets/images/accounts-sakhi-logo.jpg",
  tagline: "Accounting • Tax • Compliance • AI Guidance",
  hero: {
    heading: "Making CA, Taxation and Financial Compliance Simple & Intuitive.",
    subheading: "Comprehensive educational content, tax guides, Ind AS walkthroughs, and modern AI guidance for CA aspirants, students, and businesses."
  },
  categories: [
    { id: "all", label: "All Content" },
    { id: "taxation", label: "Taxation & GST" },
    { id: "accounting", label: "Accounting & Ind AS" },
    { id: "compliance", label: "Corporate Compliance" },
    { id: "ca-strategy", label: "CA Exam Strategy" }
  ],
  videos: [
    {
      id: "vid-01",
      title: "Deconstructing Ind AS 115: Revenue from Contracts with Customers — 5-Step Practical Model",
      category: "accounting",
      categoryLabel: "Accounting & Ind AS",
      duration: "24:18",
      views: "64K views",
      thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80",
      description: "A complete conceptual breakdown of performance obligations, variable consideration, and transaction price allocation with practical examples.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: "vid-02",
      title: "Section 54 to 54F Capital Gains Exemptions: Practical Case Studies & Common Traps",
      category: "taxation",
      categoryLabel: "Taxation & GST",
      duration: "31:05",
      views: "89K views",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80",
      description: "Comparing tax relief options across residential property purchases, construction timelines, and capital gain account schemes.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: "vid-03",
      title: "How to Read an Indian Corporate Annual Report in 60 Minutes",
      category: "compliance",
      categoryLabel: "Corporate Compliance",
      duration: "42:12",
      views: "142K views",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
      description: "A forensic walk-through of Auditor's Report, Key Audit Matters (KAMs), and Cash Flow reconciliation.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: "vid-04",
      title: "CA Preparation Blueprint: Structured Revision Velocity & Study System",
      category: "ca-strategy",
      categoryLabel: "CA Exam Strategy",
      duration: "18:40",
      views: "115K views",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80",
      description: "How to structure multi-cycle revisions and daily active recall answer-writing for ICAI examinations.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ],
  resources: [
    {
      id: "res-01",
      title: "Ind AS Summary & Master Standard Index Guide",
      type: "PDF Comprehensive Guide",
      size: "4.8 MB",
      badge: "Core Framework",
      description: "An executive summary covering all active Indian Accounting Standards and key disclosure requirements."
    },
    {
      id: "res-02",
      title: "GST ITC Reversal & Blocked Credit Checklist (Sec 17(5))",
      type: "Actionable Cheat-Sheet",
      size: "1.4 MB",
      badge: "Compliance",
      description: "A practical decision tree for identifying blocked input tax credits and audit reconciliations."
    },
    {
      id: "res-03",
      title: "Personal Finance & Advance Tax Calculator Model",
      type: "Excel Model (.xlsx)",
      size: "2.5 MB",
      badge: "Financial Tool",
      description: "Automated advance tax calculation workbook for professionals and businesses."
    }
  ]
};

const SAKHI_CREATIONS_CONTENT = {
  title: "Sakhi Creations",
  hindiTitle: "सखी CREATIONS",
  logo: "assets/images/sakhi-creations-logo.jpg",
  tagline: "Where Her Hands Create Her Future",
  origin: "Handcrafted in Meerut",
  phone: "9068711159",
  whatsappUrl: "https://wa.me/919068711159?text=Hello%20Sakhi%20Creations,%20I%20am%20interested%20in%20your%20handmade%20products.",
  hero: {
    heading: "Where Her Hands Create Her Future.",
    subheading: "Authentic handmade creations, studio craft, and artisanal products lovingly handcrafted in Meerut."
  },
  categories: [
    { id: "all", label: "All Creations" },
    { id: "crafts", label: "Handcrafted Decor & Art" },
    { id: "textiles", label: "Linen & Textiles" },
    { id: "journals", label: "Handbound Journals" },
    { id: "pottery", label: "Studio Ceramics" }
  ],
  products: [
    {
      id: "prod-01",
      title: "Handcrafted Terracotta Vessel",
      category: "pottery",
      categoryLabel: "Studio Ceramics",
      price: 1850,
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80",
      description: "Hand-thrown natural clay vessel crafted slowly on traditional wheels with mineral finish.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-02",
      title: "Handbound Cotton Rag Journal",
      category: "journals",
      categoryLabel: "Handbound Journals",
      price: 1250,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
      description: "Archival handmade journal crafted with 100% recycled cotton deckled paper and natural fabric binding.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-03",
      title: "Artisanal Wooden Desk Organizer",
      category: "crafts",
      categoryLabel: "Handcrafted Decor & Art",
      price: 1450,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
      description: "Carved from seasoned natural wood, finished with organic oils for study and desk rituals.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-04",
      title: "Handwoven Block-Printed Linen",
      category: "textiles",
      categoryLabel: "Linen & Textiles",
      price: 2200,
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
      description: "Organic handspun cotton textile featuring traditional handcrafted block prints.",
      origin: "Handcrafted in Meerut",
      inStock: true
    }
  ]
};

// Export to global window context
if (typeof window !== "undefined") {
  window.BRAND_CONFIG = BRAND_CONFIG;
  window.ACCOUNTS_SAKHI_CONTENT = ACCOUNTS_SAKHI_CONTENT;
  window.SAKHI_CREATIONS_CONTENT = SAKHI_CREATIONS_CONTENT;
}
