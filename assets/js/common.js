/**
 * BeMe+ 共通JavaScript (common.js)
 * 全ページで使用される共通機能を提供
 */

// =================================================
// 定数定義
// =================================================
const BEME_CONFIG = {
    // サイト設定
    siteName: 'BeMe+',
    baseUrl: window.location.origin,
    
    // アニメーション設定
    animationDuration: 800,
    staggerDelay: 100,
    
    // Google Analytics ID (実際のIDに変更してください)
    gaTrackingId: 'GA_TRACKING_ID',
    
    // APIエンドポイント (将来的にフォーム送信等で使用)
    api: {
        contact: '/api/contact',
        newsletter: '/api/newsletter'
    }
};

// =================================================
// ユーティリティ関数
// =================================================

/**
 * 要素がビューポートに入っているかチェック
 */
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * スムーススクロール
 */
function smoothScrollTo(target, duration = 800) {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
    if (!targetElement) return;

    const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
    const targetPosition = targetElement.offsetTop - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

/**
 * スロットル関数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * デバウンス関数
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * ランダムな遅延時間を生成
 */
function getRandomDelay(min = 0, max = 500) {
    return Math.random() * (max - min) + min;
}

// =================================================
// 共通機能クラス
// =================================================

/**
 * ヘッダー制御クラス
 */
class HeaderController {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        if (!this.header) return;
        
        // スクロール監視
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 16));
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // 背景の透明度調整
        if (currentScrollY > 100) {
            this.header.style.background = 'rgba(10, 10, 10, 0.95)';
            this.header.style.backdropFilter = 'blur(30px)';
        } else {
            this.header.style.background = 'rgba(10, 10, 10, 0.9)';
            this.header.style.backdropFilter = 'blur(20px)';
        }

        this.lastScrollY = currentScrollY;
    }
}

/**
 * アニメーション制御クラス
 */
class AnimationController {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupStaggerAnimations();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // ランダムな遅延を追加
                    const delay = getRandomDelay(100, 300);
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, delay);
                }
            });
        }, this.observerOptions);

        // 観察対象の要素を取得
        const elementsToObserve = document.querySelectorAll(
            '.card, .story-card, .feature-item, .process-step, .result-item, .faq-item, .philosophy, .message'
        );

        elementsToObserve.forEach(el => {
            // 初期状態を設定
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            observer.observe(el);
        });
    }

    setupStaggerAnimations() {
        // グリッド系要素のスタガーアニメーション
        const grids = document.querySelectorAll('.process-grid, .features-grid, .results-grid, .faq-grid');
        
        grids.forEach(grid => {
            const children = grid.children;
            Array.from(children).forEach((child, index) => {
                setTimeout(() => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(20px)';
                    child.style.animation = `fadeInUp ${BEME_CONFIG.animationDuration}ms ease-out forwards`;
                    child.style.animationDelay = `${index * BEME_CONFIG.staggerDelay}ms`;
                }, 500);
            });
        });
    }
}

/**
 * ナビゲーション制御クラス
 */
class NavigationController {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScroll();
        this.setupActiveLinks();
    }

    setupSmoothScroll() {
        // アンカーリンクのスムーススクロール
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    smoothScrollTo(target);
                }
            });
        });
    }

    setupActiveLinks() {
        // 現在のセクションに応じてナビゲーションリンクをアクティブ化
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.7
        });

        sections.forEach(section => observer.observe(section));
    }
}

/**
 * フォーム制御クラス
 */
class FormController {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupFormSubmission();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        this.validateField(input);
                    }
                });
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // 必須チェック
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'この項目は必須です';
        }

        // メールアドレスチェック
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = '正しいメールアドレスを入力してください';
            }
        }

        // エラー表示の制御
        this.toggleFieldError(field, !isValid, errorMessage);
        
        return isValid;
    }

    toggleFieldError(field, hasError, message = '') {
        const errorElement = field.parentNode.querySelector('.error-message');
        
        if (hasError) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = message;
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                field.parentNode.appendChild(errorDiv);
            }
        } else {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    setupFormSubmission() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    }

    async handleFormSubmit(form) {
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        
        // ボタンを無効化
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '送信中...';
        }

        try {
            // ここで実際のAPI送信処理を行う
            // 現在はNetlify Forms対応のダミー処理
            await this.simulateSubmission();
            
            this.showMessage('送信が完了しました。ありがとうございます！', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('送信に失敗しました。もう一度お試しください。', 'error');
        } finally {
            // ボタンを復元
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = '送信する';
            }
        }
    }

    simulateSubmission() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000); // 1秒の遅延をシミュレート
        });
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // スタイルを追加
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });

        if (type === 'success') {
            messageDiv.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else if (type === 'error') {
            messageDiv.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            messageDiv.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)';
        }

        document.body.appendChild(messageDiv);

        // アニメーション表示
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // 3秒後に削除
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

/**
 * Google Analytics初期化
 */
function initGoogleAnalytics() {
    if (BEME_CONFIG.gaTrackingId && BEME_CONFIG.gaTrackingId !== 'GA_TRACKING_ID') {
        // Google Analytics 4
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${BEME_CONFIG.gaTrackingId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', BEME_CONFIG.gaTrackingId);

        // カスタムイベントトラッキング
        window.trackEvent = function(eventName, parameters = {}) {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }
        };
    }
}

/**
 * パフォーマンス監視
 */
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // ページロード時間の測定
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.measurePageLoadTime();
            }, 0);
        });

        // コアウェブバイタルの測定
        this.measureCoreWebVitals();
    }

    measurePageLoadTime() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                console.log(`Page load time: ${loadTime}ms`);
                
                // Google Analyticsに送信（設定されている場合）
                if (typeof window.trackEvent === 'function') {
                    window.trackEvent('page_load_time', {
                        value: Math.round(loadTime),
                        custom_parameter: 'load_time_ms'
                    });
                }
            }
        }
    }

    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime);
                });
                lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
            } catch (e) {
                console.warn('LCP measurement not supported');
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({entryTypes: ['first-input']});
            } catch (e) {
                console.warn('FID measurement not supported');
            }
        }
    }
}

/**
 * エラーハンドリング
 */
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        // JavaScript エラーをキャッチ
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Promise rejection をキャッチ
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason
            });
        });
    }

    logError(type, details) {
        console.error(`${type}:`, details);
        
        // 本番環境では外部サービスにエラーログを送信
        // 例: Sentry, LogRocket, etc.
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('error', {
                error_type: type,
                error_details: JSON.stringify(details)
            });
        }
    }
}

/**
 * ユーティリティ関数群
 */
const BeMe = {
    // 要素の表示/非表示切り替え
    toggle: (element) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    },

    // 要素にクラスを追加
    addClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.add(className);
        }
    },

    // 要素からクラスを削除
    removeClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    },

    // 要素のクラスを切り替え
    toggleClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.toggle(className);
        }
    },

    // 複数要素にイベントリスナーを追加
    addEventListeners: (selector, event, callback) => {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener(event, callback);
        });
    },

    // ローカルストレージのヘルパー
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('LocalStorage not available:', e);
                return false;
            }
        },
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.warn('LocalStorage not available:', e);
                return null;
            }
        },
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('LocalStorage not available:', e);
                return false;
            }
        }
    },

    // URLパラメータの取得
    getUrlParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // デバイス判定
    device: {
        isMobile: () => window.innerWidth <= 768,
        isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: () => window.innerWidth > 1024,
        isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
    },

    // ブラウザ判定
    browser: {
        isChrome: () => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
        isSafari: () => /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
        isFirefox: () => /Firefox/.test(navigator.userAgent),
        isEdge: () => /Edge/.test(navigator.userAgent)
    }
};

// =================================================
// 初期化処理
// =================================================

/**
 * DOMContentLoaded時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('BeMe+ Common Script Loaded');

    // 各コントローラーを初期化
    new HeaderController();
    new AnimationController();
    new NavigationController();
    new FormController();
    new PerformanceMonitor();
    new ErrorHandler();

    // Google Analytics初期化
    initGoogleAnalytics();

    // レスポンシブ対応
    handleResponsiveFeatures();

    // カスタムイベントの発火
    window.dispatchEvent(new CustomEvent('bemeLoaded', {
        detail: { timestamp: Date.now() }
    }));
});

/**
 * レスポンシブ対応の処理
 */
function handleResponsiveFeatures() {
    // ウィンドウリサイズ時の処理
    const handleResize = debounce(() => {
        // モバイルメニューの制御など
        if (BeMe.device.isMobile()) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }

        // カスタムイベントの発火
        window.dispatchEvent(new CustomEvent('bemeResize', {
            detail: { 
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: BeMe.device.isMobile()
            }
        }));
    }, 250);

    window.addEventListener('resize', handleResize);
    
    // 初回実行
    handleResize();
}

/**
 * ページ離脱時の処理
 */
window.addEventListener('beforeunload', function() {
    // 必要に応じてデータの保存やクリーンアップ
    console.log('Page unloading...');
});

/**
 * ページ表示時の処理（Back/Forward対応）
 */
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // ページがキャッシュから復元された場合
        console.log('Page restored from cache');
        
        // 必要に応じて状態の再初期化
        window.dispatchEvent(new CustomEvent('bemePageRestore'));
    }
});

// =================================================
// グローバルに公開
// =================================================

// BeMe オブジェクトをグローバルに公開
window.BeMe = BeMe;
window.BEME_CONFIG = BEME_CONFIG;

// デバッグ用（開発時のみ）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.BeMe.debug = {
        config: BEME_CONFIG,
        performance: new PerformanceMonitor(),
        version: '1.0.0'
    };
}