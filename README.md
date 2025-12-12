# PrakerinID - Platform Magang Digital

Platform digital untuk memudahkan proses magang antara siswa/mahasiswa, sekolah/universitas, dan perusahaan.

## 🚀 Performance Optimizations

Aplikasi ini telah dioptimalkan untuk production dengan berbagai perbaikan performance:

- ✅ **API Timeout & Retry Logic** - Mengatasi nginx gateway timeout
- ✅ **Lazy Loading & Code Splitting** - Mengurangi bundle size dan loading time
- ✅ **Caching Strategy** - Client-side caching untuk data yang sering diakses
- ✅ **React Optimizations** - memo, useCallback, useMemo untuk mencegah re-renders
- ✅ **Bundle Optimization** - Menghapus dependencies yang tidak terpakai
- ✅ **Image Optimization** - WebP, AVIF support dengan Next.js Image

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

## 🛠 Development Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd PrakerinID
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗 Production Build

### Quick Build
```bash
npm run build
npm start
```

### Optimized Deployment
```bash
# Use the deployment script for optimized build
./deploy.sh

# With bundle analysis
./deploy.sh --analyze
```

## 📊 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size
- `npm run clean` - Clean build directories

## 🔧 Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.prakerin.id
NEXT_PUBLIC_API_TIMEOUT=30000

# Performance Settings
NEXT_PUBLIC_ENABLE_CACHE=true
NEXT_PUBLIC_CACHE_DURATION=900000

# Security
NEXT_PUBLIC_ENABLE_CSP=true
```

## 🚀 Production Deployment

### 1. Server Requirements
- Node.js >= 18.0.0
- Nginx (recommended)
- SSL Certificate

### 2. Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name prakerin.id;
    
    # Increase timeout settings
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Enable compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Cache static assets
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Deployment Steps
```bash
# 1. Build application
./deploy.sh

# 2. Copy files to server
scp -r .next package*.json user@server:/path/to/app/

# 3. Install production dependencies
npm ci --production

# 4. Start application
npm start

# Or use PM2 for process management
pm2 start npm --name "prakerin-id" -- start
```

## 📈 Performance Monitoring

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Monitoring Tools
- Google PageSpeed Insights
- Lighthouse CI
- Web Vitals Extension

## 🔍 Troubleshooting

### Common Issues

1. **Gateway Timeout**
   - Check API timeout settings
   - Verify nginx configuration
   - Monitor server resources

2. **Slow Loading**
   - Enable caching
   - Optimize images
   - Check bundle size

3. **Build Errors**
   - Clear cache: `npm run clean`
   - Update dependencies
   - Check TypeScript errors

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── dashboard/       # Dashboard pages
│   ├── globals.css      # Global styles
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
├── hooks/              # Custom React hooks
├── libs/               # Utility libraries
├── models/             # TypeScript interfaces
├── stores/             # State management
├── types/              # Type definitions
└── utils/              # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: support@prakerin.id
- Documentation: [OPTIMIZATION.md](./OPTIMIZATION.md)

---

**Note**: This application has been optimized for production use with comprehensive performance improvements to handle high traffic and prevent gateway timeouts.
