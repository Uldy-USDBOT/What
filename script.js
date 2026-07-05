// ========== CATEGORY → CALL-NUMBER CODE ==========
const CATEGORY_CODES = {
    'Technology': 'TEC',
    'Environment': 'ENV',
    'Finance': 'FIN',
    'Marketing': 'MKT',
    'Security': 'SEC',
    'Digital Assets': 'DGA',
    'Business': 'BUS',
    'Internet': 'WEB',
    'Programming': 'DEV',
    'Data': 'DAT',
    'Health': 'HEA',
    'Law': 'LAW',
    'History': 'HIS',
    'Economics': 'ECO',
    'AI': 'AI'
};
function categoryCode(cat) {
    return CATEGORY_CODES[cat] || cat.substring(0, 3).toUpperCase();
}

// ========== DARK MODE ==========
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const thumb  = document.getElementById('toggleThumb');
    if (!toggle) return;

    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (thumb) thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}
initTheme();

// ========== LOAD QUESTIONS FROM data.json ==========
async function loadQuestions() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        return data.questions;
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Helper: strip HTML to plain text
function getPlainText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

// Helper: assign a stable call number "TEC·03" per question, based on its
// position within its own category in the source data (first-seen order).
function assignCallNumbers(questions) {
    const counters = {};
    const map = {};
    questions.forEach(q => {
        const code = categoryCode(q.category);
        counters[code] = (counters[code] || 0) + 1;
        map[q.id] = `${code}·${String(counters[code]).padStart(2, '0')}`;
    });
    return map;
}

// Helper: show toast notification
function showToast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ========== BUILD QUESTION CARD HTML ==========
function buildCard(q) {
    const plain = getPlainText(q.answer);
    const short = plain.length > 118 ? plain.substring(0, 118) + '…' : plain;
    const callNumber = callNumbers[q.id] || '—';
    return `
        <div class="question-card"
             data-id="${q.id}"
             data-category="${q.category}"
             tabindex="0"
             role="button"
             aria-label="Read answer: ${q.title}">
            <div class="card-callnumber">
                <span>${callNumber}</span>
                <span class="cat-name">${q.category}</span>
            </div>
            <h3><a href="question.html?id=${q.id}" tabindex="-1">${q.title}</a></h3>
            <p class="short-answer">${short}</p>
            <div class="card-footer">
                <span class="category">${q.category}</span>
                <span class="card-arrow">→</span>
            </div>
        </div>`;
}

// ========== CATEGORY FILTERS ==========
function buildCategoryFilters(questions) {
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    const cats = ['All', ...new Set(questions.map(q => q.category))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));
    container.innerHTML = cats.map(c =>
        `<button class="cat-btn${c === 'All' ? ' active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');
}

// ========== TRENDING / FEATURED KEYWORDS ==========
function renderTrending(questions) {
    const container = document.getElementById('trendingList');
    if (!container) return;
    const featured = questions.filter(q => q.featured);
    if (featured.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = featured.map((q, i) => `
        <a class="trending-chip" href="question.html?id=${q.id}">
            <span>${q.title.replace(/\?$/, '')}</span>
            <span class="rank">${String(i + 1).padStart(2, '0')}</span>
        </a>
    `).join('');
}

// ========== POPUP ==========
let allQuestions = [];
let callNumbers = {};

function openPopup(id) {
    const q = allQuestions.find(q => q.id === id);
    if (!q) return;
    document.getElementById('popupCategory').textContent = `${callNumbers[id] || ''} · ${q.category}`;
    document.getElementById('popupTitle').textContent = q.question;
    document.getElementById('popupAnswer').innerHTML = q.answer;
    document.getElementById('popupLink').href = `question.html?id=${q.id}`;
    document.getElementById('popupOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    document.getElementById('popupOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function initPopup() {
    const overlay = document.getElementById('popupOverlay');
    const closeBtn = document.getElementById('popupClose');
    if (!overlay || !closeBtn) return;

    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    });
}

// ========== DISPLAY QUESTIONS ==========
function renderCards(questions) {
    const container = document.getElementById('questionsList');
    if (!container) return;
    if (questions.length === 0) {
        container.innerHTML = '<div class="loading">No matching questions found.</div>';
        return;
    }
    container.innerHTML = questions.map(q => buildCard(q)).join('');

    container.querySelectorAll('.question-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;
            openPopup(card.dataset.id);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPopup(card.dataset.id);
            }
        });
    });
}

async function displayAllQuestions() {
    const container = document.getElementById('questionsList');
    if (!container) return;

    allQuestions = await loadQuestions();
    if (allQuestions.length === 0) {
        container.innerHTML = '<div class="loading">No questions found.</div>';
        return;
    }
    callNumbers = assignCallNumbers(allQuestions);

    renderTrending(allQuestions);
    buildCategoryFilters(allQuestions);
    renderCards(allQuestions);

    const filterContainer = document.getElementById('categoryFilters');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.cat-btn');
            if (!btn) return;
            filterContainer.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.cat;
            const filtered = cat === 'All' ? allQuestions : allQuestions.filter(q => q.category === cat);
            renderCards(filtered);
            updateMeta(filtered.length, allQuestions.length);
        });
    }
}

function updateMeta(shown, total) {
    const meta = document.getElementById('searchMeta');
    if (meta) meta.textContent = shown === total ? `${total} ENTRIES ON FILE` : `${shown} of ${total} ENTRIES`;
}

// ========== BREADCRUMBS ==========
function renderBreadcrumb(question) {
    const nav = document.getElementById('breadcrumbNav');
    if (!nav) return;
    nav.innerHTML = `
        <a href="index.html">Index</a>
        <span class="sep">/</span>
        <a href="index.html">${question.category}</a>
        <span class="sep">/</span>
        <span class="current">${question.title}</span>
    `;

    const data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Index", "item": "https://what.ly/" },
            { "@type": "ListItem", "position": 2, "name": question.category, "item": `https://what.ly/index.html` },
            { "@type": "ListItem", "position": 3, "name": question.title, "item": `https://what.ly/question.html?id=${question.id}` }
        ]
    };
    const el = document.getElementById('breadcrumbSchema');
    if (el) el.textContent = JSON.stringify(data);
}

// ========== RELATED ENTRIES (internal linking) ==========
function renderRelated(question, allQ) {
    const section = document.getElementById('relatedSection');
    const grid = document.getElementById('relatedGrid');
    if (!section || !grid) return;

    const related = allQ.filter(q => q.category === question.category && q.id !== question.id).slice(0, 4);
    if (related.length === 0) { section.style.display = 'none'; return; }

    grid.innerHTML = related.map(q => `
        <a class="related-card" href="question.html?id=${q.id}">
            ${q.title}
            <span>${callNumbers[q.id] || ''} · ${q.category}</span>
        </a>
    `).join('');
    section.style.display = '';
}

// ========== SINGLE QUESTION PAGE ==========
async function displaySingleQuestion() {
    const container = document.getElementById('questionDetail');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('id');

    if (!questionId) {
        container.innerHTML = '<div class="loading">No question specified.</div>';
        return;
    }

    const questions = await loadQuestions();
    callNumbers = assignCallNumbers(questions);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        container.innerHTML = '<div class="loading">Question not found. <a href="index.html">Return to the index →</a></div>';
        return;
    }

    // ----- SEO: title, description, keywords -----
    const plainAnswer = getPlainText(question.answer);
    const shortDesc = plainAnswer.length > 155 ? plainAnswer.substring(0, 155).trim() + '…' : plainAnswer;
    const pageUrl = `https://what.ly/question.html?id=${question.id}`;

    document.title = `${question.title.replace(/\?$/, '')} — Definition & Meaning | what.ly`;

    const setMeta = (id, value) => { const el = document.getElementById(id); if (el) el.setAttribute('content', value); };
    setMeta('pageDescription', shortDesc);
    setMeta('pageKeywords', (question.keywords || []).join(', '));
    setMeta('ogTitle', `${question.title} — what.ly`);
    setMeta('ogDescription', shortDesc);
    setMeta('ogUrl', pageUrl);
    setMeta('twitterTitle', `${question.title} — what.ly`);
    setMeta('twitterDescription', shortDesc);

    const canonicalLink = document.getElementById('canonicalLink');
    if (canonicalLink) canonicalLink.setAttribute('href', pageUrl);

    // JSON-LD FAQPage schema
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
            "@type": "Question",
            "name": question.question,
            "acceptedAnswer": { "@type": "Answer", "text": plainAnswer }
        }]
    };
    const schemaScript = document.getElementById('schemaData');
    if (schemaScript) schemaScript.textContent = JSON.stringify(schemaData);

    // ----- Render content -----
    renderBreadcrumb(question);

    container.innerHTML = `
        <h1>${question.question}</h1>
        <div class="answer-meta">
            <span>${callNumbers[question.id]} · ${question.category.toUpperCase()}</span>
            <span>FILED · ${question.date}</span>
        </div>
        <div class="answer">${question.answer}</div>
        <a href="index.html" class="back-link">← Back to the full index</a>
    `;

    renderRelated(question, questions);
}

// ========== LIVE SEARCH ==========
async function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();

        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        const allBtn = document.querySelector('.cat-btn[data-cat="All"]');
        if (allBtn) allBtn.classList.add('active');

        if (term === '') {
            renderCards(allQuestions);
            updateMeta(allQuestions.length, allQuestions.length);
            return;
        }

        const filtered = allQuestions.filter(q =>
            q.title.toLowerCase().includes(term) ||
            q.question.toLowerCase().includes(term) ||
            q.category.toLowerCase().includes(term) ||
            (q.keywords || []).some(k => k.toLowerCase().includes(term)) ||
            getPlainText(q.answer).toLowerCase().includes(term)
        );

        renderCards(filtered);
        updateMeta(filtered.length, allQuestions.length);
    });
}

// ========== PREMIUM DOMAINS ==========
const domainsForSale = [
    { name: "what.ly",        price: "$", desc: "Premium question‑based domain – perfect for Q&A or knowledge platform" },
    { name: "downloader.ly",  price: "$",  desc: "Ideal for video/social media downloader tools" },
    { name: "haste.ly",       price: "$",  desc: "Short, fast, memorable – great for productivity or SaaS" },
    { name: "twig.ly",        price: "$",  desc: "Nature‑friendly, unique brand for eco or dev tools" },
    { name: "vlog.ly",        price: "$",  desc: "Nature-friendly, Featured Personal Video" },
    { name: "digitally.ly",   price: "$",  desc: "Modern digital agency, marketing, or tech startup" }
];

function displayDomains() {
    const container = document.getElementById('domainsList');
    if (!container) return;
    if (domainsForSale.length === 0) {
        container.innerHTML = '<div class="loading">No domains available at the moment.</div>';
        return;
    }
    container.innerHTML = domainsForSale.map(domain => `
        <div class="domain-card">
            <div class="domain-name">${domain.name}</div>
            <div class="domain-price">${domain.price}</div>
            <div class="domain-desc">${domain.desc}</div>
            <a href="https://wa.me/218918883918?text=I'm%20interested%20in%20${domain.name}"
               target="_blank" rel="noopener noreferrer" class="buy-btn">Inquire →</a>
        </div>
    `).join('');
}

// ========== SCROLL TO TOP ==========
function initScrollTop() {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== INITIALIZE ==========
if (window.location.pathname.includes('question.html')) {
    displaySingleQuestion();
    initScrollTop();
} else {
    displayAllQuestions().then(() => {
        updateMeta(allQuestions.length, allQuestions.length);
    });
    setupSearch();
    initPopup();
    initScrollTop();
    if (document.getElementById('domainsList')) displayDomains();
}
