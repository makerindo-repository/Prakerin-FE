#!/bin/bash

# Production Deployment Script for PrakerinID
# This script optimizes and builds the application for production

set -e

echo "🚀 Starting PrakerinID Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js version is compatible
check_node_version() {
    echo "Checking Node.js version..."
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_status "Node.js version $NODE_VERSION is compatible"
    else
        print_error "Node.js version $NODE_VERSION is not compatible. Required: >= $REQUIRED_VERSION"
        exit 1
    fi
}

# Clean previous builds
clean_build() {
    echo "Cleaning previous builds..."
    rm -rf .next
    rm -rf out
    rm -rf node_modules/.cache
    print_status "Build directories cleaned"
}

# Install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    print_status "Dependencies installed"
}

# Run linting
run_lint() {
    echo "Running ESLint..."
    npm run lint
    print_status "Linting completed"
}

# Build application
build_app() {
    echo "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
    
    # Build with optimizations
    npm run build
    
    print_status "Application built successfully"
}

# Analyze bundle size (optional)
analyze_bundle() {
    if [ "$1" = "--analyze" ]; then
        echo "Analyzing bundle size..."
        ANALYZE=true npm run build
        print_status "Bundle analysis completed"
    fi
}

# Verify build
verify_build() {
    echo "Verifying build..."
    
    if [ ! -d ".next" ]; then
        print_error "Build directory not found"
        exit 1
    fi
    
    if [ ! -f ".next/BUILD_ID" ]; then
        print_error "Build ID not found"
        exit 1
    fi
    
    BUILD_ID=$(cat .next/BUILD_ID)
    print_status "Build verified (ID: $BUILD_ID)"
}

# Create deployment info
create_deployment_info() {
    echo "Creating deployment info..."
    
    cat > deployment-info.json << EOF
{
  "buildId": "$(cat .next/BUILD_ID)",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "nodeVersion": "$(node -v)",
  "npmVersion": "$(npm -v)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
    
    print_status "Deployment info created"
}

# Performance recommendations
show_performance_tips() {
    echo ""
    echo "📊 Performance Recommendations:"
    echo "================================"
    echo "1. Enable gzip compression in your web server"
    echo "2. Set proper cache headers for static assets"
    echo "3. Use CDN for static files"
    echo "4. Monitor Core Web Vitals"
    echo "5. Set up error tracking"
    echo ""
    echo "Nginx configuration example:"
    echo "----------------------------"
    echo "gzip on;"
    echo "gzip_types text/plain text/css application/json application/javascript;"
    echo "proxy_connect_timeout 60s;"
    echo "proxy_send_timeout 60s;"
    echo "proxy_read_timeout 60s;"
    echo ""
}

# Main deployment process
main() {
    echo "PrakerinID Production Deployment"
    echo "==============================="
    echo ""
    
    # Check prerequisites
    check_node_version
    
    # Clean and prepare
    clean_build
    
    # Install and build
    install_dependencies
    run_lint
    build_app
    
    # Optional bundle analysis
    analyze_bundle "$1"
    
    # Verify and document
    verify_build
    create_deployment_info
    
    # Show recommendations
    show_performance_tips
    
    print_status "Deployment preparation completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Copy .next directory to your production server"
    echo "2. Copy package.json and package-lock.json"
    echo "3. Run 'npm ci --production' on the server"
    echo "4. Start the application with 'npm start'"
    echo ""
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [--analyze] [--help]"
        echo ""
        echo "Options:"
        echo "  --analyze    Run bundle analyzer"
        echo "  --help       Show this help message"
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac