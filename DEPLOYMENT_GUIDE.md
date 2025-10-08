# 🚀 ALwrity Deployment Guide

## Vercel Deployment Strategy

Since Vercel is optimized for frontend applications, we'll deploy the frontend on Vercel and the backend on a separate platform.

### **Architecture Overview**
```
Frontend (Vercel) ←→ Backend (Railway/Render) ←→ Database (SQLite/PostgreSQL)
```

---

## 🎯 **Step-by-Step Deployment**

### **Part 1: Deploy Backend (Railway - Recommended)**

#### **Option A: Railway (Recommended)**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Project:**
   ```bash
   cd backend
   railway init
   ```

4. **Add Environment Variables:**
   ```bash
   railway variables set GEMINI_API_KEY=your_gemini_key
   railway variables set OPENAI_API_KEY=your_openai_key
   railway variables set ANTHROPIC_API_KEY=your_anthropic_key
   railway variables set MISTRAL_API_KEY=your_mistral_key
   railway variables set TAVILY_API_KEY=your_tavily_key
   railway variables set EXA_API_KEY=your_exa_key
   railway variables set SERPER_API_KEY=your_serper_key
   railway variables set CLERK_SECRET_KEY=your_clerk_secret
   railway variables set GSC_REDIRECT_URI=https://your-frontend.vercel.app/gsc/callback
   railway variables set WORDPRESS_REDIRECT_URI=https://your-frontend.vercel.app/wp/callback
   railway variables set WIX_REDIRECT_URI=https://your-frontend.vercel.app/wix/callback
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get Backend URL:**
   ```bash
   railway domain
   ```
   Copy the URL (e.g., `https://your-app.railway.app`)

#### **Option B: Render**

1. Go to [render.com](https://render.com) and connect your GitHub
2. Create a new "Web Service"
3. Select your repository
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python start_alwrity_backend.py`
   - **Environment:** Python 3
5. Add all environment variables in the dashboard
6. Deploy and get your backend URL

---

### **Part 2: Deploy Frontend (Vercel)**

#### **1. Prepare Frontend for Production**

Create a `.env.production` file in the `frontend` directory:
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_ENVIRONMENT=production
```

#### **2. Deploy to Vercel**

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

3. **Add Environment Variables:**
   ```
   REACT_APP_API_URL = https://your-backend-url.railway.app
   REACT_APP_ENVIRONMENT = production
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Get your frontend URL (e.g., `https://your-app.vercel.app`)

#### **3. Update Backend URLs**

After getting your frontend URL, update the backend environment variables:

```bash
# Update redirect URIs with your actual Vercel URL
railway variables set GSC_REDIRECT_URI=https://your-app.vercel.app/gsc/callback
railway variables set WORDPRESS_REDIRECT_URI=https://your-app.vercel.app/wp/callback
railway variables set WIX_REDIRECT_URI=https://your-app.vercel.app/wix/callback
```

---

## 🔧 **Alternative: Full-Stack on Vercel (Advanced)**

If you want to deploy everything on Vercel, you can use Vercel's serverless functions:

### **1. Create API Routes**

Create `api/` directory in your project root:

```
api/
├── auth/
│   └── [...auth].ts
├── content/
│   └── generate.ts
└── seo/
    └── analyze.ts
```

### **2. Convert FastAPI to Vercel Functions**

This requires significant refactoring of your backend code to work with Vercel's serverless functions.

### **3. Deploy as Monorepo**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🛠️ **Environment Variables Checklist**

### **Backend Environment Variables:**
```bash
# AI API Keys
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
MISTRAL_API_KEY=your_mistral_key

# Research APIs
TAVILY_API_KEY=your_tavily_key
EXA_API_KEY=your_exa_key
SERPER_API_KEY=your_serper_key

# Authentication
CLERK_SECRET_KEY=your_clerk_secret

# OAuth Redirects (update with your Vercel URL)
GSC_REDIRECT_URI=https://your-app.vercel.app/gsc/callback
WORDPRESS_REDIRECT_URI=https://your-app.vercel.app/wp/callback
WIX_REDIRECT_URI=https://your-app.vercel.app/wix/callback
```

### **Frontend Environment Variables:**
```bash
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_ENVIRONMENT=production
```

---

## 🚀 **Post-Deployment Steps**

### **1. Test Your Deployment**
- Visit your Vercel URL
- Complete the onboarding process
- Test content generation
- Verify OAuth integrations

### **2. Configure Custom Domain (Optional)**
- In Vercel dashboard, go to your project
- Click "Domains"
- Add your custom domain
- Update redirect URIs with custom domain

### **3. Monitor Performance**
- Check Vercel analytics
- Monitor Railway/Render logs
- Set up error tracking (Sentry, etc.)

---

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors:**
   - Add your Vercel domain to backend CORS settings
   - Update `allowed_origins` in FastAPI CORS middleware

2. **Environment Variables:**
   - Ensure all variables are set in both platforms
   - Check variable names match exactly

3. **OAuth Redirects:**
   - Update all redirect URIs with production URLs
   - Test OAuth flows end-to-end

4. **Database Issues:**
   - Consider upgrading to PostgreSQL for production
   - Set up database backups

### **Performance Optimization:**

1. **Frontend:**
   - Enable Vercel's edge caching
   - Optimize bundle size
   - Use CDN for static assets

2. **Backend:**
   - Implement connection pooling
   - Add caching layers
   - Monitor memory usage

---

## 📊 **Monitoring & Maintenance**

### **Health Checks:**
- Frontend: `https://your-app.vercel.app/health`
- Backend: `https://your-backend.railway.app/health`

### **Logs:**
- Vercel: Built-in function logs
- Railway: `railway logs`
- Render: Dashboard logs section

### **Scaling:**
- Vercel: Automatic scaling
- Railway: Manual scaling in dashboard
- Render: Auto-scaling available

---

## 🎯 **Recommended Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React App     │    │ • FastAPI      │    │ • User Data     │
│ • Static Files │    │ • AI Services   │    │ • Content       │
│ • CDN Cached    │    │ • OAuth APIs    │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

This setup provides:
- ✅ **Fast frontend delivery** via Vercel's global CDN
- ✅ **Scalable backend** with Railway's infrastructure
- ✅ **Reliable database** with PostgreSQL
- ✅ **Easy maintenance** with separate concerns
- ✅ **Cost-effective** scaling based on usage

---

## 🚀 **Next Steps**

1. **Deploy backend** to Railway/Render
2. **Deploy frontend** to Vercel
3. **Configure environment variables**
4. **Test all integrations**
5. **Set up monitoring**
6. **Configure custom domain** (optional)

Your ALwrity platform will be live and accessible worldwide! 🌍
