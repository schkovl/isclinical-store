#!/usr/bin/env node
/**
 * Static site generator for The Skin Stockist.
 * Reads data/products.json, writes HTML into site/.
 * Run: node build.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SITE = path.join(ROOT, "site");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "data/products.json"), "utf8"));
const { store, steps, products } = DATA;

const stepById = Object.fromEntries(steps.map((s) => [s.id, s]));
const money = (n) => `$${n.toFixed(2)}`;

/* ---------------------------------- SVG art ---------------------------------- */

const ART_COLORS = {
  cleanse: "#7fa895",
  treat: "#446b5c",
  hydrate: "#8fb3a6",
  protect: "#b7a97a",
  eyes: "#6e8f83",
  recovery: "#a3937b",
};

function bottleArt(p) {
  const c = ART_COLORS[p.step] || "#446b5c";
  const label = `
    <rect x="70" y="150" width="60" height="70" fill="#ffffff" stroke="${c}" stroke-width="1"/>
    <text x="100" y="172" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="1" fill="#1c2422">${p.sku}</text>
    <line x1="80" y1="184" x2="120" y2="184" stroke="${c}" stroke-width="1"/>
    <line x1="80" y1="194" x2="120" y2="194" stroke="#c8d0cb" stroke-width="1"/>
    <line x1="80" y1="204" x2="112" y2="204" stroke="#c8d0cb" stroke-width="1"/>`;
  const shapes = {
    dropper: `
      <rect x="92" y="30" width="16" height="26" rx="3" fill="${c}"/>
      <rect x="97" y="56" width="6" height="34" fill="${c}" opacity="0.55"/>
      <path d="M70 96 h60 v134 a10 10 0 0 1 -10 10 h-40 a10 10 0 0 1 -10 -10 z" fill="${c}" opacity="0.16" stroke="${c}" stroke-width="1.5"/>
      ${label}`,
    pump: `
      <rect x="96" y="26" width="30" height="10" rx="2" fill="${c}"/>
      <rect x="94" y="36" width="12" height="22" fill="${c}"/>
      <rect x="86" y="58" width="28" height="16" fill="${c}" opacity="0.75"/>
      <rect x="72" y="74" width="56" height="166" rx="6" fill="${c}" opacity="0.16" stroke="${c}" stroke-width="1.5"/>
      ${label}`,
    tube: `
      <rect x="82" y="36" width="36" height="18" rx="3" fill="${c}"/>
      <path d="M76 66 h48 l6 150 a12 12 0 0 1 -12 12 h-36 a12 12 0 0 1 -12 -12 z" fill="${c}" opacity="0.16" stroke="${c}" stroke-width="1.5"/>
      ${label}`,
    jar: `
      <rect x="64" y="88" width="72" height="20" rx="4" fill="${c}"/>
      <rect x="60" y="108" width="80" height="118" rx="10" fill="${c}" opacity="0.16" stroke="${c}" stroke-width="1.5"/>
      <rect x="70" y="150" width="60" height="56" fill="#ffffff" stroke="${c}" stroke-width="1"/>
      <text x="100" y="172" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="1" fill="#1c2422">${p.sku}</text>
      <line x1="80" y1="184" x2="120" y2="184" stroke="${c}" stroke-width="1"/>
      <line x1="80" y1="194" x2="120" y2="194" stroke="#c8d0cb" stroke-width="1"/>`,
    box: `
      <path d="M56 92 l44 -22 l44 22 v118 l-44 22 l-44 -22 z" fill="${c}" opacity="0.16" stroke="${c}" stroke-width="1.5"/>
      <path d="M56 92 l44 22 l44 -22 M100 114 v118" fill="none" stroke="${c}" stroke-width="1.5"/>
      <text x="78" y="170" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="1" fill="#1c2422" transform="rotate(26 78 170)">${p.sku}</text>`,
  };
  return `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name} packaging illustration">
  ${shapes[p.form] || shapes.pump}
</svg>`;
}

/* --------------------------------- layout ---------------------------------- */

function page({ title, desc, canonicalPath, body, depth = 0, current = "" }) {
  const r = depth === 0 ? "." : "..";
  const nav = [
    ["shop.html", "Shop"],
    ["about.html", "About & FAQ"],
  ]
    .map(
      ([href, label]) =>
        `<a href="${r}/${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a>`
    )
    .join("\n        ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="https://theskinstockist.com/${canonicalPath}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${r}/css/main.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231c2422'/><text x='50' y='68' font-size='52' text-anchor='middle' fill='%23f6f7f5' font-family='serif'>S</text></svg>">
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="${r}/index.html">${store.name}<small>${store.tagline}</small></a>
      <nav class="site-nav" aria-label="Main navigation">
        ${nav}
      </nav>
    </div>
  </header>
  <main>
${body}
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <div>
        <strong>${store.name}</strong> — ${store.tagline}<br>
        <a href="mailto:${store.email}">${store.email}</a>
      </div>
      <p class="disclaimer">${store.name} is an independent authorized retailer of iS CLINICAL® products.
      iS CLINICAL® is a registered trademark of Science of Skincare, LLC. This store is not owned by or
      affiliated with the brand beyond an authorized stockist relationship.</p>
    </div>
  </footer>
  <script src="${r}/js/store.js" defer></script>
</body>
</html>
`;
}

function buyButton(p, r) {
  if (p.stripeLink) {
    return `<a class="btn" href="${p.stripeLink}">Buy now — ${money(p.price)}</a>`;
  }
  const subject = encodeURIComponent(`Order: ${p.name} (${p.sku})`);
  return `<a class="btn" href="mailto:${store.email}?subject=${subject}">Order by email — ${money(p.price)}</a>
      <p class="buy-note">Online checkout is being set up. Email orders ship the same way — we confirm availability and send a secure payment link.</p>`;
}

function card(p, r) {
  return `      <a class="card reveal" href="${r}/products/${p.slug}.html">
        ${p.bestseller ? '<span class="flag">Bestseller</span>' : ""}
        <span class="art-frame"><span class="art">${bottleArt(p)}</span></span>
        <span class="sku">${p.sku}</span>
        <h3>${p.name}</h3>
        <p class="tagline">${p.tagline}</p>
        <span class="price-row"><span>${money(p.price)}</span><span class="go">→</span></span>
      </a>`;
}

/* ---------------------------------- pages ---------------------------------- */

function indexPage() {
  const hero = products.find((p) => p.slug === "active-serum");
  const bestsellers = products.filter((p) => p.bestseller);
  const rail = steps
    .map(
      (s) =>
        `<a href="shop.html#${s.id}"><span class="num">${s.num}</span>${s.label}</a>`
    )
    .join("\n        ");
  const body = `
    <section class="hero" aria-labelledby="hero-heading">
      <div class="wrap hero-grid">
        <div>
          <p class="mono">Pharmaceutical-grade skincare · Genuine stock only</p>
          <h1 id="hero-heading">Skin, treated as <em>science</em>.</h1>
          <p class="hero-lede">Every iS CLINICAL® product we ship is sourced directly through
          authorized distribution — fresh batches, full potency, no gray market. Build your
          protocol across eight steps and let the chemistry work.</p>
          <div class="hero-actions">
            <a class="btn accent" href="shop.html">Shop the full line</a>
            <a class="btn ghost" href="about.html">Why buy from a stockist</a>
          </div>
          <div class="stat-strip">
            <div><strong>${products.length}</strong><span>Formulas</span></div>
            <div><strong>${steps.length}</strong><span>Protocol steps</span></div>
            <div><strong>100%</strong><span>Authorized stock</span></div>
          </div>
        </div>
        <aside class="specimen" aria-label="Featured product">
          <span class="art-frame"><span class="art">${bottleArt(hero)}</span></span>
          <dl class="specimen-meta">
            <div><dt>Specimen</dt><dd>${hero.name}</dd></div>
            <div><dt>Step</dt><dd>${stepById[hero.step].num} ${stepById[hero.step].label}</dd></div>
            <div><dt>Size</dt><dd>${hero.size}</dd></div>
            <div><dt>Price</dt><dd>${money(hero.price)}</dd></div>
          </dl>
          <a class="btn ghost" href="products/${hero.slug}.html">View specimen →</a>
        </aside>
      </div>
    </section>

    <nav class="rail" aria-label="Protocol steps">
      <div class="wrap rail-inner">
        ${rail}
      </div>
    </nav>

    <section class="section" aria-labelledby="bestsellers-heading">
      <div class="wrap">
        <div class="section-head">
          <h2 id="bestsellers-heading">The five most re-ordered formulas</h2>
          <a class="mono" href="shop.html">All 16 products →</a>
        </div>
        <div class="grid">
${bestsellers.map((p) => card(p, ".")).join("\n")}
        </div>
      </div>
    </section>

    <section class="assure" aria-label="Store assurances">
      <div class="wrap">
        <div>
          <p class="mono">Authenticity</p>
          <h3>Authorized stock, traceable batches</h3>
          <p>We buy through authorized distribution only. Batch codes intact, storage controlled, expiry always long-dated.</p>
        </div>
        <div>
          <p class="mono">Guidance</p>
          <h3>Protocols, not just products</h3>
          <p>Not sure where to start? Email us your current routine and skin goals — we answer with a specific four-step protocol.</p>
        </div>
        <div>
          <p class="mono">Shipping</p>
          <h3>Fast, tracked, temperature-aware</h3>
          <p>Orders leave within one business day. Actives are shipped with heat protection in summer months.</p>
        </div>
      </div>
    </section>
`;
  return page({
    title: `${store.name} — Authorized iS CLINICAL Retailer`,
    desc: "Genuine iS CLINICAL skincare from an authorized stockist. Cleansers, serums, moisturizers and SPF — fresh authorized stock, protocol guidance included.",
    canonicalPath: "",
    body,
    depth: 0,
    current: "index.html",
  });
}

function shopPage() {
  const rail = steps
    .map(
      (s) => `<a href="#${s.id}"><span class="num">${s.num}</span>${s.label}</a>`
    )
    .join("\n        ");
  const groups = steps
    .map((s) => {
      const items = products.filter((p) => p.step === s.id);
      if (!items.length) return "";
      return `
    <section class="step-group" id="${s.id}" aria-labelledby="h-${s.id}">
      <div class="wrap">
        <div class="step-head">
          <span class="num">STEP ${s.num}</span>
          <h2 id="h-${s.id}">${s.label}</h2>
          <span class="rule" aria-hidden="true"></span>
        </div>
        <div class="grid">
${items.map((p) => card(p, ".")).join("\n")}
        </div>
      </div>
    </section>`;
    })
    .join("\n");
  const body = `
    <section class="section tight" aria-labelledby="shop-heading">
      <div class="wrap">
        <p class="mono">Full line · ${products.length} formulas</p>
        <h1 id="shop-heading" style="font-size: var(--text-h2); margin-top: 0.5rem;">Shop by protocol step</h1>
      </div>
    </section>
    <nav class="rail" aria-label="Protocol steps">
      <div class="wrap rail-inner">
        ${rail}
      </div>
    </nav>
${groups}
    <div style="height: var(--space-section);"></div>
`;
  return page({
    title: `Shop — ${store.name}`,
    desc: "The full iS CLINICAL line organized by protocol step: cleanse, treat, hydrate, protect, eyes and recovery.",
    canonicalPath: "shop.html",
    body,
    depth: 0,
    current: "shop.html",
  });
}

function productPage(p) {
  const s = stepById[p.step];
  const related = products
    .filter((x) => x.step === p.step && x.slug !== p.slug)
    .slice(0, 4);
  const relatedHtml = related.length
    ? `
    <section class="section tight" aria-labelledby="related-heading">
      <div class="wrap">
        <div class="section-head">
          <h2 id="related-heading" style="font-size: var(--text-h3);">Also in step ${s.num} ${s.label}</h2>
        </div>
        <div class="grid">
${related.map((x) => card(x, "..")).join("\n")}
        </div>
      </div>
    </section>`
    : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    brand: { "@type": "Brand", name: "iS CLINICAL" },
    description: p.desc,
    offers: {
      "@type": "Offer",
      price: p.price.toFixed(2),
      priceCurrency: store.currency,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: store.name },
    },
  };
  const body = `
    <article class="wrap pdp">
      <div class="pdp-art"><span class="art">${bottleArt(p)}</span></div>
      <div>
        <div class="eyebrow">
          <p class="mono">Step ${s.num} · ${s.label} · ${p.sku}</p>
          ${p.bestseller ? '<span class="flag">Bestseller</span>' : ""}
        </div>
        <h1>${p.name}</h1>
        <p class="tagline">${p.tagline}</p>
        <p class="price">${money(p.price)} <small>${p.size}</small></p>
        <p>${p.desc}</p>

        <div class="buy-box">
          ${buyButton(p, "..")}
        </div>

        <div class="tab-block">
          <h4>Key ingredients</h4>
          <div class="chip-row">${p.actives.map((a) => `<span class="chip">${a}</span>`).join("")}</div>
        </div>
        <div class="tab-block">
          <h4>Best for</h4>
          <p>${p.skin}</p>
        </div>
        <div class="tab-block">
          <h4>How to use</h4>
          <p>${p.how}</p>
        </div>
        <div class="tab-block">
          <h4>Sourcing</h4>
          <p>Genuine iS CLINICAL®, authorized distribution — full size ${p.size}.</p>
        </div>
      </div>
    </article>
${relatedHtml}
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
`;
  return page({
    title: `${p.name} — ${store.name}`,
    desc: `${p.name} (${p.size}) — ${p.tagline}. Genuine iS CLINICAL from an authorized stockist. ${money(p.price)}.`,
    canonicalPath: `products/${p.slug}.html`,
    body,
    depth: 1,
  });
}

function aboutPage() {
  const body = `
    <section class="section" aria-labelledby="about-heading">
      <div class="wrap prose">
        <p class="mono">About the store</p>
        <h1 id="about-heading" style="font-size: var(--text-h2); margin-top: 0.5rem;">An independent stockist for people who take actives seriously</h1>
        <p style="margin-top: 1.5rem;">${store.name} exists for one reason: iS CLINICAL® is a
        professional line, and where you buy it matters. Gray-market listings on big marketplaces
        are routinely expired, diluted or stored badly — and vitamin C and retinol formulas lose
        potency fast when they are. We stock directly through authorized distribution, keep
        inventory small and fresh, and answer routine questions personally.</p>

        <h2>Frequently asked</h2>
        <details>
          <summary>Are your products genuine?</summary>
          <p>Yes. Every unit is sourced through authorized iS CLINICAL distribution with batch
          codes intact. If you ever want to verify a batch, email us the code before or after
          purchase and we will confirm it.</p>
        </details>
        <details>
          <summary>How does ordering work right now?</summary>
          <p>Use the order button on any product page — it opens an email with the product
          pre-filled. We confirm stock the same day and reply with a secure card payment link.
          Direct online checkout is rolling out product by product.</p>
        </details>
        <details>
          <summary>What if a product doesn't suit my skin?</summary>
          <p>Unopened products can be returned within 30 days for a full refund. If a product is
          opened and genuinely disagrees with your skin within the first 14 days, contact us —
          we handle those case by case, and fairly.</p>
        </details>
        <details>
          <summary>Which products should I start with?</summary>
          <p>The classic starter protocol is Cleansing Complex, Active Serum at night,
          Hydra-Cool Serum in the morning, and Eclipse SPF 50+ every day. Email us your current
          routine and goals for a specific recommendation.</p>
        </details>
        <details>
          <summary>Do you ship internationally?</summary>
          <p>Currently we ship domestically with tracked courier. International shipping is
          available on request — email us first so we can quote duties and transit time.</p>
        </details>
      </div>
    </section>
`;
  return page({
    title: `About & FAQ — ${store.name}`,
    desc: "Why buy iS CLINICAL from an authorized stockist: genuine batches, fresh stock, protocol guidance, and fair returns.",
    canonicalPath: "about.html",
    body,
    depth: 0,
    current: "about.html",
  });
}

/* ---------------------------------- write ---------------------------------- */

fs.mkdirSync(path.join(SITE, "products"), { recursive: true });
fs.mkdirSync(path.join(SITE, "js"), { recursive: true });

fs.writeFileSync(path.join(SITE, "index.html"), indexPage());
fs.writeFileSync(path.join(SITE, "shop.html"), shopPage());
fs.writeFileSync(path.join(SITE, "about.html"), aboutPage());
for (const p of products) {
  fs.writeFileSync(path.join(SITE, "products", `${p.slug}.html`), productPage(p));
}

const urls = ["", "shop.html", "about.html", ...products.map((p) => `products/${p.slug}.html`)];
fs.writeFileSync(
  path.join(SITE, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>https://theskinstockist.com/${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`
);
fs.writeFileSync(
  path.join(SITE, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://theskinstockist.com/sitemap.xml\n"
);

console.log(`Built ${3 + products.length} pages + sitemap + robots.`);
