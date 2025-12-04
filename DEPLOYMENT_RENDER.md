# Deploying to Render

This guide explains how to deploy the Online Coding Interview Platform to Render.

## Prerequisites

1. **GitHub account** with the repository pushed
2. **Render account** (free at https://render.com)

## Deployment Steps

### 1. Push Code to GitHub

Make sure your repository is pushed to GitHub:

```bash
git add .
git commit -m "Add Dockerfile and deployment config"
git push origin main
```

### 2. Create a Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 3. Create a New Web Service

1. From the Render dashboard, click **"New +"** → **"Web Service"**
2. Select your `zoomcamp-02` repository
3. Connect and authorize if prompted

### 4. Configure the Service

Fill in the deployment settings:

| Setting | Value |
|---------|-------|
| **Name** | `zoomcamp-interview` |
| **Environment** | `Docker` |
| **Region** | Choose closest to your users (e.g., `Oregon`) |
| **Branch** | `main` |
| **Plan** | Free (or Starter if you need more resources) |

### 5. Environment Variables (Optional)

If needed, add environment variables:
- Click **"Advanced"** → **"Environment Variables"**
- Add `NODE_ENV=production`

### 6. Deploy

Click **"Create Web Service"** and wait for the deployment:

- Render will build the Docker image
- Container will start with both backend (3000) and frontend (8080)
- You'll get a public URL like `https://zoomcamp-interview.onrender.com`

## After Deployment

### Access Your App

- **Frontend:** `https://zoomcamp-interview.onrender.com:8080`
- **Backend API:** `https://zoomcamp-interview.onrender.com:3000`

### Update Frontend to Use Production Backend

The frontend currently connects to `http://localhost:3000`. For production, update `frontend/script.js`:

```javascript
// Change from:
const response = await fetch('http://localhost:3000/api/session', {

// To (use current domain):
const response = await fetch('/api/session', {
```

Then push the change and Render will auto-redeploy.

### WebSocket Configuration

The WebSocket should work automatically since both frontend and backend are served from the same domain.

## Important Notes

- **Free tier limitations:** Render spins down inactive services after 15 minutes of no traffic
- **Logs:** View real-time logs from the Render dashboard
- **Auto-redeploy:** Push to main branch for automatic redeployment
- **Custom domain:** Add a custom domain in Render settings (paid feature)

## Troubleshooting

**Service won't start:**
- Check logs: Click **"Logs"** in the Render dashboard
- Ensure Docker build succeeds
- Verify all dependencies are installed

**Frontend can't reach backend:**
- Update fetch URLs to use relative paths (`/api/session` instead of `http://localhost:3000/api/session`)
- Check WebSocket connection in browser console

**Slow performance on free tier:**
- Consider upgrading to Starter plan
- Free tier is subject to spinning down

## Updating Your Deployment

Simply push changes to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render automatically rebuilds and redeploys.
