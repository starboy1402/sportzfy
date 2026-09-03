# Sportzfy Vercel & Cloud Deployment Guide
**Course:** CSE-355 Software Engineering (Sessional), CUET  
**Team:** Mahmudul Hasan (2204040), Sakib Alif (2204051), Ayan Barua (2204053)  

---

## Step 1: Create a GitHub Repository

1. Open your browser and go to **[https://github.com/new](https://github.com/new)**.
2. Set **Repository name**: `sportzfy` (or `swe_project`).
3. Choose **Public** (or Private).
4. **Important:** Leave *"Add a README file"*, *"Add .gitignore"*, and *"Choose a license"* **UNCHECKED** (we already have all commits locally).
5. Click **"Create repository"**.
6. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/sportzfy.git`).

---

## Step 2: Push Local Code to GitHub

In your project terminal, link and push your commits:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sportzfy.git
git branch -M main
git push -u origin main
```

*(You can also simply paste your GitHub repository URL in this chat, and Antigravity will run the push command for you!)*

---

## Step 3: Deploy on Vercel

1. Go to **[https://vercel.com/new](https://vercel.com/new)** (sign in with GitHub).
2. Find your **`sportzfy`** repository and click **"Import"**.
3. In the configuration screen:
   - **Root Directory:** Click **Edit** and select **`sportzfy-web`**.
   - **Framework Preset:** Next.js (detected automatically).
   - **Build Command:** `prisma generate && next build` (already configured).
4. **Database Setup (Free Cloud Postgres):**
   - In your Vercel Dashboard, go to the **"Storage"** tab.
   - Click **"Create Database"** $\rightarrow$ select **"Postgres (Neon)"**.
   - Connect it to your `sportzfy` project. This automatically sets `DATABASE_URL`!
   - In `sportzfy-web/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` if connecting to Neon.
5. Click **"Deploy"**!
6. In ~60 seconds, your site will be live at:
   👉 **`https://sportzfy.vercel.app`** (or your assigned Vercel URL).
