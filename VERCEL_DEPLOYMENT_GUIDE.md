# 🚀 Vercel Frontend Deployment Guide

## 📋 Prerequisites

- ✅ Backend deployed on Render at: `https://alwrity.onrender.com`
- ✅ GitHub repository connected
- ✅ Vercel account created

---

## 🎯 Step-by-Step Deployment

### **1. Initial Setup**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `AJaySi/ALwrity`

### **2. Configure Project Settings**

#### **Framework Preset:**
- Select: **Create React App**

#### **Root Directory:**
- Leave as: **.** (root)
- The `vercel.json` will handle the frontend directory

#### **Build Settings:**
- **Build Command:** `cd frontend && npm install && npm run build`
- **Output Directory:** `frontend/build`
- **Install Command:** `npm install` (auto-detected)

### **3. Environment Variables**

Add these in Vercel dashboard under "Environment Variables":

```bash
# Required
REACT_APP_API_URL=https://alwrity.onrender.com
REACT_APP_ENVIRONMENT=production

# Clerk (from your Clerk dashboard)
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Important:** 
- Get your Clerk publishable key from: https://dashboard.clerk.com
- After deployment, update OAuth redirect URIs in:
  - Google Search Console
  - WordPress
  - Wix

---

## 🔧 Post-Deployment Configuration

### **1. Update Backend CORS**

After getting your Vercel URL (e.g., `https://alwrity.vercel.app`), update backend CORS:

Edit `backend/app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://alwrity.vercel.app",  # Add your Vercel URL
        "https://your-custom-domain.com"  # If using custom domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **2. Update OAuth Redirect URIs**

Update these in respective platforms:

**Google Search Console:**
- Redirect URI: `https://alwrity.vercel.app/gsc/callback`

**WordPress:**
- Redirect URI: `https://alwrity.vercel.app/wp/callback`

**Wix:**
- Redirect URI: `https://alwrity.vercel.app/wix/callback`

**Clerk:**
- Add allowed origins in Clerk dashboard

### **3. Update Backend Environment Variables**

On Render, update these environment variables:
```bash
GSC_REDIRECT_URI=https://alwrity.vercel.app/gsc/callback
WORDPRESS_REDIRECT_URI=https://alwrity.vercel.app/wp/callback
WIX_REDIRECT_URI=https://alwrity.vercel.app/wix/callback
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Frontend loads at Vercel URL
- [ ] Health check works: `https://alwrity.vercel.app`
- [ ] Backend API accessible from frontend
- [ ] Clerk authentication works
- [ ] Google Search Console OAuth works
- [ ] WordPress OAuth works
- [ ] Wix OAuth works
- [ ] All routes work (React Router)

---

## 🔍 Troubleshooting

### **Issue: Blank page or 404 errors**
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set correctly
- Check that `vercel.json` has proper rewrites

### **Issue: API calls failing**
- Verify backend CORS includes Vercel URL
- Check backend is deployed and healthy
- Verify `REACT_APP_API_URL` doesn't have trailing slash

### **Issue: OAuth redirects failing**
- Verify redirect URIs match exactly (including https://)
- Check environment variables in Vercel dashboard
- Verify Clerk allowed origins

### **Issue: Build failures**
- Check TypeScript errors (we fixed Wix issue)
- Verify all dependencies install correctly
- Check build logs in Vercel dashboard

---

## 📊 Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Edge caching
- ✅ Gzip compression
- ✅ Brotli compression

Additional optimizations in `vercel.json`:
- Static asset caching (1 year)
- Security headers
- SPA routing support

---

## 🎨 Custom Domain (Optional)

1. Go to your Vercel project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update all OAuth redirect URIs with new domain

---

## 🚀 Continuous Deployment

Vercel is now set up for automatic deployments:

- **Push to `main`** → Deploys to production
- **Pull requests** → Creates preview deployments
- **Any branch** → Can create preview deployments

---

## 📝 Quick Commands

```bash
# Test build locally
cd frontend
npm run build
npx serve -s build

# Check for TypeScript errors
npm run build

# Clear node_modules if issues
rm -rf node_modules package-lock.json
npm install
```

---

## 🔗 Important URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Backend (Render):** https://alwrity.onrender.com
- **Backend Health:** https://alwrity.onrender.com/health
- **Backend API Docs:** https://alwrity.onrender.com/api/docs

---

Your ALwrity frontend is now ready to deploy on Vercel! 🎉

