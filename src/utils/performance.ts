// Production optimization utilities
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  PROVINCES: 'provinces',
  CITY_REGENCIES: 'city_regencies',
  SECTORS: 'sectors',
  MAJORS: 'majors',
} as const;

// Cache duration in milliseconds
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Simple in-memory cache for client-side
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; duration: number }>();

  set(key: string, data: any, duration: number = CACHE_DURATION.MEDIUM) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.duration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.duration) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Cleanup cache every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 10 * 60 * 1000);
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Image optimization helper
export const getOptimizedImageUrl = (url: string, width?: number, quality?: number) => {
  if (!url) return '';
  
  // If it's already optimized or external, return as is
  if (url.includes('/_next/image') || url.startsWith('http')) {
    return url;
  }
  
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (quality) params.set('q', quality.toString());
  
  return `/_next/image?url=${encodeURIComponent(url)}&${params.toString()}`;
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
    return 0;
  },
  
  clearMarks: () => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
};