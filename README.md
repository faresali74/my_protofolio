# 🚀 Fares Ali — Frontend Developer Portfolio

> A high-performance personal portfolio built with vanilla HTML, Tailwind CSS, and JavaScript — featuring live GitHub integration, dark mode, and dynamic project descriptions.

![Portfolio Preview](./img.png)

---

## ✨ Features

- **GitHub API Integration** — Automatically pulls the 5 most recently updated repos and displays them as project cards
- **Smart Caching** — Repos cached in `localStorage` for 6 hours to avoid rate limits, with stale-cache fallback
- **Dynamic Descriptions** — Resolves project descriptions via a 3-step pipeline: GitHub description → README first paragraph → Claude AI generation
- **Vercel Integration** — Matches GitHub repos with live Vercel deployments and shows live demo buttons automatically
- **Live Previews** — Screenshot thumbnails generated via [microlink.io](https://microlink.io) for projects with a demo URL
- **Dark Mode** — Full-page dark mode with `localStorage` persistence and `prefers-color-scheme` detection
- **Scroll Spy** — Active nav link highlights as you scroll through sections
- **Contact Form** — Powered by [Web3Forms](https://web3forms.com) with validation and success/error feedback
- **Smooth Scroll** — All anchor links scroll smoothly to their sections

---

## 🗂 Project Structure

```
portfolio/
├── index.html       # Main HTML file
├── img.png          # Your profile photo
├── cv.pdf           # Your CV (optional)
└── js/
    └── main.js      # All JavaScript logic
```

---

## ⚙️ Setup & Configuration

### 1. Clone the repo

```bash
git clone https://github.com/faresali74/portfolio.git
cd portfolio
```

### 2. Add your profile photo

Replace `img.png` with your own photo.

### 3. Configure `js/main.js`

Open `js/main.js` and update the config block at the top:

```js
const GITHUB_USERNAME = "faresali74";   // ✅ already set
const GITHUB_TOKEN    = "";             // optional — adds 5000 req/hr
const VERCEL_TOKEN    = "";             // optional — enables live demo links
```

#### Getting a GitHub Token (optional but recommended)

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scope: `public_repo` only
4. Paste the token in `GITHUB_TOKEN`

> ⚠️ Without a token: 60 requests/hour limit. With a token: 5,000/hour. The cache means most visitors won't hit the API at all.

#### Getting a Vercel Token (optional)

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a token with **Read** scope
3. Paste it in `VERCEL_TOKEN`

### 4. Set up the Contact Form

The form uses [Web3Forms](https://web3forms.com) — free, no backend needed.

1. Go to [web3forms.com](https://web3forms.com) and get your access key
2. The key is already in the HTML as a hidden input:
```html
<input type="hidden" name="access_key" value="YOUR_KEY_HERE">
```

### 5. Add your CV

Drop your CV as `cv.pdf` in the root folder. The Download CV button already points to `./cv.pdf`.

---

## 🌐 Deployment

### GitHub Pages

1. Push the project to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to `main` branch → `/ (root)`
4. Your site will be live at `https://faresali74.github.io/portfolio`

### Netlify / Vercel

Just drag and drop the folder — no build step needed.

---

## 🧠 How the Description Pipeline Works

For each GitHub repo, the JS resolves the best available description:

```
1. repo.description (if > 20 chars)   → used immediately
         ↓ if empty or too short
2. README.md first paragraph           → fetched in background
         ↓ if no README
3. Claude AI                           → generated from name + language + topics
```

Cards render instantly with whatever is available, then silently update with a fade if a better description is found.

---

## 🛠 Tech Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| Markup      | HTML5                         |
| Styling     | Tailwind CSS (CDN)            |
| Icons       | Google Material Symbols       |
| Fonts       | Inter (Google Fonts)          |
| Logic       | Vanilla JavaScript (ES2022)   |
| GitHub Data | GitHub REST API v3            |
| Screenshots | microlink.io                  |
| Deployments | Vercel REST API               |
| Contact     | Web3Forms                     |
| AI Desc     | Anthropic Claude API          |

---

## 📄 License

MIT — feel free to fork and customise for your own portfolio.

---

<p align="center">Built by <a href="https://github.com/faresali74">Fares Ali</a></p>
