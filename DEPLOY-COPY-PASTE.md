# Apna Home CRM Deploy Copy-Paste Guide

Use this file while deploying. The app code is already prepared. You do not need to rewrite the project files manually.

## Step 1: Push this project to GitHub

Create an empty GitHub repository first, then run these commands in the project folder:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit - Apna Home CRM"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace:

- `YOUR_GITHUB_USERNAME`
- `YOUR_REPO_NAME`

## Step 2: MongoDB Atlas

Create a free Atlas cluster and copy your connection string.

It will look like this:

```text
mongodb+srv://DB_USERNAME:DB_PASSWORD@cluster-name.mongodb.net/apna-home-crm?retryWrites=true&w=majority
```

## Step 3: Render backend environment values

When Render asks for environment variables, use:

### `MONGODB_URI`

```text
mongodb+srv://DB_USERNAME:DB_PASSWORD@cluster-name.mongodb.net/apna-home-crm?retryWrites=true&w=majority
```

### `CLIENT_URLS`

```text
https://YOUR_GITHUB_USERNAME.github.io
```

If later you add a custom domain, use:

```text
https://YOUR_GITHUB_USERNAME.github.io,https://yourdomain.com
```

## Step 4: GitHub Actions repository variables

In GitHub:

`Settings -> Secrets and variables -> Actions -> Variables`

Create these 3 variables:

### `VITE_API_URL`

```text
https://YOUR_RENDER_BACKEND_NAME.onrender.com/api
```

### `VITE_SOCKET_URL`

```text
https://YOUR_RENDER_BACKEND_NAME.onrender.com
```

### `VITE_BASE_PATH`

```text
/YOUR_REPO_NAME/
```

If you later use a custom domain instead of the normal GitHub Pages URL:

```text
/
```

## Step 5: GitHub Pages

In GitHub go to:

`Settings -> Pages`

Set:

- Source: `GitHub Actions`

Then push a small change to `main`, or manually run the workflow.

Your frontend URL will look like:

```text
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/
```

## Files already included in this project

These are already ready. No need to manually recreate them unless you want to:

- `.github/workflows/deploy-pages.yml`
- `render.yaml`
- `client/vite.config.js`
- `server/src/config/env.js`
- `server/src/app.js`
- `server/src/config/socket.js`

## If you need to edit the Pages workflow

The workflow file path is:

`/Users/amamdanish/Documents/Codex/2026-05-01/build-a-full-stack-web-application/.github/workflows/deploy-pages.yml`

## If you need to edit the Render blueprint

The Render file path is:

`/Users/amamdanish/Documents/Codex/2026-05-01/build-a-full-stack-web-application/render.yaml`
