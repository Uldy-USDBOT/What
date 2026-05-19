// ========== DARK MODE ==========
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const thumb  = document.getElementById('toggleThumb');
    if (!toggle) return;

    // Load saved preference, default to light
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

// Helper: show toast notification
function showToast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ========== BUILD QUESTION CARD HTML ==========
function buildCard(q, index) {
    const plain = getPlainText(q.answer);
    const short = plain.length > 120 ? plain.substring(0, 120) + '…' : plain;
    const num = String(index + 1).padStart(2, '0');
    return `
        <div class="question-card" 
             data-id="${q.id}"
             data-category="${q.category}"
             tabindex="0"
             role="button"
             aria-label="Read answer: ${q.title}">
            <div class="card-number">${num} · ${q.category.toUpperCase()}</div>
            <h3><a href="question.html?id=${q.id}" tabindex="-1">${q.title}</a></h3>
            <p class="short-answer">${short}</p>
            <span class="category">${q.category}</span>
            <span class="card-arrow">→</span>
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

// ========== POPUP ==========
let allQuestions = [];

function openPopup(id) {
    const q = allQuestions.find(q => q.id === id);
    if (!q) return;
    document.getElementById('popupCategory').textContent = q.category;
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
    container.innerHTML = questions.map((q, i) => buildCard(q, i)).join('');

    // Card click → popup (not link click)
    container.querySelectorAll('.question-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // If user clicked the <a> link directly, let it navigate
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

    buildCategoryFilters(allQuestions);
    renderCards(allQuestions);

    // Category filter events
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
            // Update search meta
            updateMeta(filtered.length, allQuestions.length);
        });
    }
}

function updateMeta(shown, total) {
    const meta = document.getElementById('searchMeta');
    if (meta) meta.textContent = shown === total ? `${total} ANSWERS` : `${shown} of ${total} ANSWERS`;
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
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        container.innerHTML = '<div class="loading">Question not found.</div>';
        return;
    }

    // SEO meta
    document.title = `${question.title} | what.ly`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', question.question);

    const canonicalLink = document.getElementById('canonicalLink');
    if (canonicalLink) canonicalLink.setAttribute('href', `question.html?id=${question.id}`);

    // JSON-LD Schema
    const plainAnswer = getPlainText(question.answer);
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

    container.innerHTML = `
        <h1>${question.question}</h1>
        <div class="answer-meta">
            <span>CATEGORY · ${question.category.toUpperCase()}</span>
            <span>PUBLISHED · ${question.date}</span>
        </div>
        <div class="answer">${question.answer}</div>
        <a href="index.html" class="back-link">← Back to all questions</a>
    `;
}

// ========== LIVE SEARCH ==========
async function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();

        // Reset category filters
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
            getPlainText(q.answer).toLowerCase().includes(term)
        );

        renderCards(filtered);
        updateMeta(filtered.length, allQuestions.length);
    });
}

// ========== PREMIUM DOMAINS ==========
const domainsForSale = [
    { name: "what.ly",        price: "$10,000", desc: "Premium question‑based domain – perfect for Q&A or knowledge platform" },
    { name: "downloader.ly",  price: "$4,990",  desc: "Ideal for video/social media downloader tools" },
    { name: "haste.ly",       price: "$3,000",  desc: "Short, fast, memorable – great for productivity or SaaS" },
    { name: "twig.ly",        price: "$2,800",  desc: "Nature‑friendly, unique brand for eco or dev tools" },
    { name: "digitally.ly",   price: "$1,990",  desc: "Modern digital agency, marketing, or tech startup" }
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

// ========== SEARCH META INIT ==========
async function initSearchMeta() {
    // Wait until questions are loaded
    setTimeout(() => updateMeta(allQuestions.length, allQuestions.length), 300);
}

// ========== INITIALIZE ==========
if (window.location.pathname.includes('question.html')) {
    displaySingleQuestion();
} else {
    displayAllQuestions().then(() => {
        updateMeta(allQuestions.length, allQuestions.length);
    });
    setupSearch();
    initPopup();
    initScrollTop();
    if (document.getElementById('domainsList')) displayDomains();
}
