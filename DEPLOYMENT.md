# CI/CD & Deployment Guide

This project uses **GitHub Actions** for CI/CD and **Netlify** for hosting.

## 📁 Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Runs lint and build on every push/PR |
| `.github/workflows/cd.yml` | Deploys to Netlify production on push to `main` |
| `.github/workflows/preview.yml` | Creates preview deployments for Pull Requests |
| `netlify.toml` | Netlify configuration (build settings, redirects, headers) |

---

## 🚀 Quick Setup

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Set Up Netlify

#### Option A: Git Integration (Recommended - Easiest)

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account and select your repository
4. Build settings will be auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy site"**

#### Option B: Using GitHub Actions (Manual Control)

If you want full control via GitHub Actions:

1. **Get Netlify credentials:**
   - Go to [Netlify User Settings → Applications](https://app.netlify.com/user/applications#personal-access-tokens)
   - Generate a **Personal Access Token** → Copy it
   - Go to your site's **Site settings → General** → Copy **Site ID**

2. **Add secrets to GitHub:**
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Add `NETLIFY_AUTH_TOKEN` (your personal access token)
   - Add `NETLIFY_SITE_ID` (your site ID)

3. **Update workflow (if needed):**
   Edit `.github/workflows/cd.yml` and `.github/workflows/preview.yml` - update the `if` condition in `preview.yml`:
   ```yaml
   if: github.event.pull_request.head.repo.full_name == github.repository || github.repository_owner == 'YOUR_GITHUB_USERNAME'
   ```

---

## 🔧 Workflows Explained

### CI Workflow (`ci.yml`)

Triggers: Push/PR to `main` or `develop` branches

| Job | Description |
|-----|-------------|
| `lint` | Runs ESLint to check code quality |
| `build` | Builds the project and uploads artifacts |

### CD Workflow (`cd.yml`)

Triggers: Push to `main` branch or manual trigger

- Builds the project
- Deploys to Netlify production
- Creates a deployment comment on the commit

### Preview Workflow (`preview.yml`)

Triggers: Pull Request to `main` branch

- Builds the project
- Creates a **preview deployment** with unique URL
- Comments the preview URL on the PR

---

## 🌐 Netlify Configuration (`netlify.toml`)

### Build Settings
- **Publish directory:** `dist` (Vite's default output)
- **Node version:** 20

### SPA Support
- All routes redirect to `index.html` (for React Router)

### Caching Headers
- Static assets cached for 1 year (optimal for Vite's hashed filenames)
- JS/CSS files cached for 1 year

### Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy` - Controls referrer information
- `Permissions-Policy` - Restricts browser features

---

## 📋 Environment Variables

If your app needs environment variables:

### For GitHub Actions CI/CD:
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add your variables under **Variables** (not Secrets, unless sensitive)
3. Use them in workflows:
   ```yaml
   env:
     VITE_API_URL: ${{ vars.VITE_API_URL }}
   ```

### For Netlify:
1. Go to **Site settings** → **Environment variables**
2. Add variables with prefix `VITE_` to access in your React app
3. Or add them in `netlify.toml`:
   ```toml
   [build.environment]
     VITE_API_URL = "https://api.example.com"
   ```

---

## 🔄 Deployment Flow

```
Developer pushes code
        ↓
GitHub Actions CI runs (lint + build)
        ↓
   ┌────┴────┐
   │         │
   ▼         ▼
  PR       main branch
   │         │
   ▼         ▼
Preview  Production Deploy
Deploy     (Netlify)
(Netlify)
```

---

## 🛠️ Troubleshooting

### Build fails on Netlify
- Check **Node version** matches your local (set in `netlify.toml`)
- Check **build command** is correct
- View deploy logs in Netlify dashboard

### GitHub Actions fails
- Check `package-lock.json` is committed
- Verify Node version in workflow matches your project
- Check secrets are correctly set

### Preview deploy not showing
- Verify `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets are set
- Check if PR is from a fork (forks don't have access to secrets by default)

---

## 📝 Useful Commands

```bash
# Test build locally
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```
