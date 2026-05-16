
# what.ly – FAQ Knowledge Base

A clean, fast, and SEO-optimized Q&A website that answers the most common "What is...?" questions.  
Built with pure HTML, CSS, and JavaScript – no frameworks, no build tools.

🔗 **Live demo:** [https://what.ly](https://what.ly) *(replace with your actual URL)*

---

## ✨ Features

- ✅ **30+ popular questions** (AI, crypto, climate change, SEO, VPN, NFTs, etc.)
- ✅ **Instant search** – filter questions as you type
- ✅ **SEO ready** – dynamic meta tags, JSON-LD schema (FAQPage), sitemap.xml
- ✅ **Responsive design** – works perfectly on mobile, tablet, and desktop
- ✅ **Fast & lightweight** – pure static files, no dependencies
- ✅ **Easy to extend** – just add new entries to `data.json`
- ✅ **Free hosting** – deploy on GitHub Pages, Netlify, or any static host

---

## 📁 Project Structure

```

what.ly/
├── index.html          # Homepage – displays all question cards
├── question.html       # Detail page – shows single question & answer
├── style.css           # Styling (modern, responsive)
├── script.js           # Logic (load data, search, render)
├── data.json           # All questions & answers (30+ entries)
├── sitemap.xml         # XML sitemap for search engines
├── robots.txt          # Crawler instructions
└── README.md           # This file

```

---

## 🚀 Quick Start

### 1. Clone or download the repository

```bash
git clone https://github.com/your-username/what.ly.git
cd what.ly
```

2. Run locally

You can use any local server. For example:

```bash
# Using Python 3
python -m http.server 8000

# Using npx
npx http-server

# Using VS Code Live Server extension
```

Then open http://localhost:8000 in your browser.

3. Deploy to GitHub Pages

1. Push the code to a GitHub repository.
2. Go to Settings → Pages.
3. Under Branch, select main and / (root) folder.
4. Click Save.
5. Your site will be live at https://your-username.github.io/repo-name/.

Optional: Add a custom domain (e.g., what.ly) by:

· Creating a CNAME file containing your domain.
· Configuring DNS records at your domain registrar.

---

📝 How to Add More Questions

1. Open data.json.
2. Add a new object inside the questions array. Follow this structure:

```json
{
  "id": "what-is-example",
  "title": "What is Example?",
  "question": "What is Example?",
  "answer": "<p>Your detailed answer here. You can use HTML tags like <strong>bold</strong>, <ul><li>lists</li></ul>, and <a href='...'>links</a>.</p>",
  "date": "2026-05-16",
  "category": "Technology"
}
```

1. Important: The id must be unique and URL-friendly (lowercase, hyphens instead of spaces).
2. Save the file. The homepage and search will automatically include the new question.

💡 Pro tip: To help Google find new questions, update sitemap.xml by adding a new <url> entry for each new question.

---

🔧 Customization

Change the design

Edit style.css – it contains all colors, fonts, spacing, and responsive rules.

Modify the search behavior

Open script.js and adjust the setupSearch() function. You can change which fields are searched (title, question, category, etc.).

Update meta tags & schema

The question.html page automatically sets:

· Page title = question title
· Meta description = the question text
· JSON-LD schema (FAQPage)

You can customize the schema inside displaySingleQuestion() in script.js.

---

🌐 SEO & Sitemap

· Sitemap: sitemap.xml lists all 30+ question URLs. Submit it to Google Search Console.
· Robots.txt: Allows all crawlers and points to the sitemap.
· Canonical URLs: Each question page has a rel="canonical" link to avoid duplicate content.
· JSON-LD: Google uses it to show rich snippets (FAQ in search results).

To resubmit your sitemap after adding new questions:

1. Go to Google Search Console.
2. Choose your property.
3. Click Sitemaps → enter sitemap.xml → Submit.

---

📦 Dependencies

Zero. The project uses vanilla HTML/CSS/JS. No npm, no build steps, no external libraries.

---

🤝 Contributing

Contributions are welcome! If you want to add more high-quality questions or improve the code, please:

1. Fork the repository.
2. Create a new branch (git checkout -b improve/question).
3. Commit your changes (git commit -am 'Add new question about ...').
4. Push to the branch (git push origin improve/question).
5. Open a Pull Request.

Please ensure:

· Each question is factual, clear, and well-formatted.
· The answer uses simple HTML (<p>, <ul>, <strong>, etc.).
· The id is URL-friendly and unique.

---

📄 License

This project is open source and available under the MIT License. You are free to use, modify, and distribute it.

---

🙏 Acknowledgments

· Inspired by the need for simple, direct answers to common "What is...?" queries.
· Built with the goal of being lightweight and SEO-friendly for the what.ly domain.

---

📬 Contact

For questions or suggestions, please open an issue on GitHub or contact the repository owner.

---

Enjoy answering the world's curiosity! 🌍❓
