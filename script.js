// Load questions from data.json
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

// Display all questions as cards on homepage
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
        // Short preview (first 100 chars of question)
        let preview = q.question.length > 100 ? q.question.substring(0, 100) + '...' : q.question;
        html += `
            <div class="question-card">
                <h3><a href="question.html?id=${q.id}">${q.title}</a></h3>
                <p>${preview}</p>
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

    // Add JSON-LD Schema.org (FAQPage)
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
            "@type": "Question",
            "name": question.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": question.answer.replace(/<[^>]*>/g, '') // Plain text for schema
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
        <p><a href="/" style="color: #1a4a6f;">← Back to all questions</a></p>
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
            // Re-render all cards if search cleared
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
            let preview = q.question.length > 100 ? q.question.substring(0, 100) + '...' : q.question;
            html += `
                <div class="question-card">
                    <h3><a href="question.html?id=${q.id}">${q.title}</a></h3>
                    <p>${preview}</p>
                    <span class="category">${q.category}</span>
                </div>
            `;
        }
        container.innerHTML = html;
    });
}

// Initialize based on current page
if (window.location.pathname.includes('question.html')) {
    displaySingleQuestion();
} else {
    displayAllQuestions();
    setupSearch();
}
