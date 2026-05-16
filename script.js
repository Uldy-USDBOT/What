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

// Helper function to get plain text from HTML answer
function getPlainText(html) {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

// Display all questions as cards with question + short answer
async function displayAllQuestions() {
    const container = document.getElementById('questionsList');
    if (!container) return;

    const questions = await loadQuestions();
    if (questions.length === 0) {
        container.innerHTML = '<div class="loading">No questions found.</div>';
        return;
    }

    let html = '';
    for (const q of questions) {
        let plainAnswer = getPlainText(q.answer);
        let shortAnswer = plainAnswer.length > 130 ? plainAnswer.substring(0, 130) + '...' : plainAnswer;
        html += `
            <div class="question-card">
                <h3><a href="question.html?id=${q.id}">${q.title}</a></h3>
                <p class="short-answer">${shortAnswer}</p>
                <span class="category">${q.category}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

// Display single question on question.html
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

    // Update meta tags for SEO
    document.title = `${question.title} | what.ly`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', question.question);
    }

    // Update canonical link
    const canonicalLink = document.getElementById('canonicalLink');
    if (canonicalLink) {
        canonicalLink.setAttribute('href', `question.html?id=${question.id}`);
    }

    // Add JSON-LD Schema.org (FAQPage)
    const plainAnswer = getPlainText(question.answer);
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
            "@type": "Question",
            "name": question.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": plainAnswer
            }
        }]
    };
    const schemaScript = document.getElementById('schemaData');
    if (schemaScript) {
        schemaScript.textContent = JSON.stringify(schemaData);
    }

    // Render content
    const html = `
        <h1>${question.question}</h1>
        <div class="answer">
            ${question.answer}
        </div>
        <hr style="margin: 2rem 0;">
        <p><small>Category: ${question.category} | Published: ${question.date}</small></p>
        <p><a href="index.html" style="color: #1a4a6f;">← Back to all questions</a></p>
    `;
    container.innerHTML = html;
}

// Live search on homepage
async function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const questions = await loadQuestions();
    const container = document.getElementById('questionsList');

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (term === '') {
            displayAllQuestions();
            return;
        }

        const filtered = questions.filter(q => 
            q.title.toLowerCase().includes(term) || 
            q.question.toLowerCase().includes(term) ||
            q.category.toLowerCase().includes(term)
        );

        if (filtered.length === 0) {
            container.innerHTML = '<div class="loading">No matching questions found.</div>';
            return;
        }

        let html = '';
        for (const q of filtered) {
            let plainAnswer = getPlainText(q.answer);
            let shortAnswer = plainAnswer.length > 130 ? plainAnswer.substring(0, 130) + '...' : plainAnswer;
            html += `
                <div class="question-card">
                    <h3><a href="question.html?id=${q.id}">${q.title}</a></h3>
                    <p class="short-answer">${shortAnswer}</p>
                    <span class="category">${q.category}</span>
                </div>
            `;
        }
        container.innerHTML = html;
    });
}

// ========== PREMIUM DOMAINS FOR SALE (UPDATED LIST) ==========
const domainsForSale = [
    { name: "what.ly", price: "$10,000", desc: "Premium question‑based domain – perfect for Q&A or knowledge platform" },
    { name: "downloader.ly", price: "$4,990", desc: "Ideal for video/social media downloader tools" },
    { name: "haste.ly", price: "$3,000", desc: "Short, fast, memorable – great for productivity or SaaS" },
    { name: "twig.ly", price: "$2,800", desc: "Nature‑friendly, unique brand for eco or dev tools" },
    { name: "digitally.ly", price: "$1,990", desc: "Modern digital agency, marketing, or tech startup" }
];

// Function to display domains (only on homepage)
function displayDomains() {
    const container = document.getElementById('domainsList');
    if (!container) return;

    if (domainsForSale.length === 0) {
        container.innerHTML = '<div class="loading">No domains available at the moment. Check back soon!</div>';
        return;
    }

    let html = '';
    for (const domain of domainsForSale) {
        html += `
            <div class="domain-card">
                <div class="domain-name">${domain.name}</div>
                <div class="domain-price">${domain.price}</div>
                <div class="domain-desc">${domain.desc}</div>
                <a href="https://wa.me/218918883918?text=I'm%20interested%20in%20${domain.name}" target="_blank" rel="noopener noreferrer" class="buy-btn">Inquire →</a>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ========== INITIALIZE BASED ON CURRENT PAGE ==========
if (window.location.pathname.includes('question.html')) {
    displaySingleQuestion();
} else {
    displayAllQuestions();
    setupSearch();
    // Check if domains container exists on homepage
    if (document.getElementById('domainsList')) {
        displayDomains();
    }
}
