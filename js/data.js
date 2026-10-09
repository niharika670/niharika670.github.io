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
    { id: "festive", label: "Festive Collection 2026" },
    { id: "crafts", label: "Handcrafted Decor & Art" },
    { id: "textiles", label: "Linen & Textiles" },
    { id: "journals", label: "Handbound Journals" },
    { id: "pottery", label: "Studio Ceramics" }
  ],
  products: [
    {
      id: "prod-01",
      title: "Single Urli (Peacock Design)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 160,
      image: "assets/images/products/image2.jpg",
      description: "Beautifully handcrafted single urli with elegant peacock designs.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-02",
      title: "Single Urli (Floral Design)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 80,
      image: "assets/images/products/image3.jpg",
      description: "Floral motif single urli, perfect for festive decor.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-03",
      title: "Single Urli (Butterfly Design)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 160,
      image: "assets/images/products/image4.jpg",
      description: "Delicate butterfly design single urli to elevate your spaces.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-04",
      title: "Single Urli (Multi-Peacock)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 125,
      image: "assets/images/products/image5.jpg",
      description: "Intricate multi-peacock urli for a grand festive look.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-05",
      title: "Single Urli (Turtle Base)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 150,
      image: "assets/images/products/image6.jpg",
      description: "Auspicious turtle base single urli.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-06",
      title: "Rangoli Combo (Elephant Theme)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 300,
      image: "assets/images/products/image7.jpg",
      description: "Complete rangoli combo featuring an elephant design theme.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-07",
      title: "Rangoli Combo (Pearl & Red)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 250,
      image: "assets/images/products/image8.jpg",
      description: "Stunning pearl and red styled rangoli combo set.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-08",
      title: "Rangoli Combo (Floral Base)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 300,
      image: "assets/images/products/image9.jpg",
      description: "Festive rangoli combo set with floral base details.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-09",
      title: "Rangoli Combo (Baby Elephant Stand)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 300,
      image: "assets/images/products/image10.jpg",
      description: "Festive rangoli combo set featuring a baby elephant stand.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-10",
      title: "Rangoli Combo (Turtle Base)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 300,
      image: "assets/images/products/image11.jpg",
      description: "Beautiful rangoli combo set featuring an auspicious turtle base.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-11",
      title: "Rangoli Combo (Peacock Set)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 350,
      image: "assets/images/products/image12.jpg",
      description: "Elaborate peacock themed rangoli combo set.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-12",
      title: "Urli with Single Matki (Elephant Stand)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 250,
      image: "assets/images/products/image13.jpg",
      description: "Beautiful urli with a single matki resting on an elephant stand.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-13",
      title: "Urli with Single Matki (Turtle Stand)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 250,
      image: "assets/images/products/image14.jpg",
      description: "Elegant urli with a single matki on a turtle stand.",
      origin: "Handcrafted in Meerut",
      inStock: true
    },
    {
      id: "prod-14",
      title: "Urli with Single Matki (Sitting Elephant Stand)",
      category: "festive",
      categoryLabel: "Festive Collection 2026",
      price: 250,
      image: "assets/images/products/image15.jpg",
      description: "Beautiful handcrafted urli with a single matki resting on a sitting elephant stand.",
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

