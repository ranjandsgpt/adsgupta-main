# Deploy blog.adsgupta.com

## Option A: Vercel (recommended)

### 1. Push to GitHub (if you have local changes)

```bash
cd /Users/ranjan.dasgupta/blog.adsgupta.com
git add -A && git status
git commit -m "Prepare for deploy"   # if there are changes
git push origin main
```

### 2. Deploy from Vercel Dashboard

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. **Import** the repo: `ranjandsgpt/adsgupta-blog`.
3. **Important:** Set **Root Directory** to **`frontend`** (Edit → Root Directory → `frontend`). If you leave root as `.`, the repo has a root `vercel.json` that builds from `frontend/` and serves `frontend/build` — either way works.
4. Add **Environment Variable** (if your app uses an API):
   - Name: `REACT_APP_BACKEND_URL`  
   - Value: your backend URL (e.g. `https://your-api.vercel.app` or your API domain).
5. Click **Deploy**. Vercel will build and deploy. Future pushes to `main` auto-deploy.

### 3. Connect domain

- In the project: **Settings → Domains** → Add **blog.adsgupta.com**.
- In your DNS: add a **CNAME** for `blog` pointing to `cname.vercel-dns.com` (or the value Vercel shows).

---

## Option B: Deploy from your machine (Vercel CLI)

```bash
# One-time: install Vercel CLI and log in
npm i -g vercel
vercel login

# From repo root, deploy the frontend
cd /Users/ranjan.dasgupta/blog.adsgupta.com/frontend
npm install
npm run build
vercel --prod
```

Follow the prompts (link to existing project or create new, then production deploy). Your site will be at the `.vercel.app` URL; add **blog.adsgupta.com** in Vercel project **Settings → Domains**.

---

## Option C: Run the deploy script

From the repo root:

```bash
cd /Users/ranjan.dasgupta/blog.adsgupta.com
chmod +x deploy.sh
./deploy.sh
```

Requires Node.js and (for CLI deploy) Vercel CLI.
