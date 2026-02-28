// 主应用模块
class EnglishMasteryApp {
    constructor() {
        this.storage = storage;
        this.ui = uiManager;
        this.init();
    }

    // 初始化应用
    init() {
        console.log('英语成神之路应用初始化...');
        
        // 检查浏览器兼容性
        this.checkCompatibility();
        
        // 初始化主题
        this.initTheme();
        
        // 初始化服务工作者（PWA支持）
        this.initServiceWorker();
        
        // 初始化离线检测
        this.initOfflineDetection();
        
        // 显示欢迎消息
        this.showWelcomeMessage();
        
        // 定期自动保存
        this.initAutoSave();
        
        console.log('应用初始化完成');
    }

    // 检查浏览器兼容性
    checkCompatibility() {
        const requiredFeatures = [
            'localStorage',
            'JSON',
            'Promise',
            'fetch'
        ];
        
        const missingFeatures = requiredFeatures.filter(feature => !window[feature]);
        
        if (missingFeatures.length > 0) {
            this.ui.showNotification(
                `您的浏览器不支持以下功能：${missingFeatures.join(', ')}。请使用现代浏览器。`,
                'error'
            );
            return false;
        }
        
        return true;
    }

    // 初始化主题
    initTheme() {
        const savedTheme = this.storage.getSettings().theme;
        
        if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.storage.getSettings().theme === 'auto') {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }

    // 初始化服务工作者（PWA支持）
    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('ServiceWorker 注册成功:', registration.scope);
                
                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('发现新版本 ServiceWorker');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.ui.showNotification('新版本可用，刷新页面以更新', 'info');
                        }
                    });
                });
            } catch (error) {
                console.warn('ServiceWorker 注册失败:', error);
            }
        }
    }

    // 初始化离线检测
    initOfflineDetection() {
        const updateOnlineStatus = () => {
            if (!navigator.onLine) {
                this.ui.showNotification('您已离线，数据将保存在本地', 'warning');
            } else {
                this.ui.showNotification('已恢复在线连接', 'success');
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // 初始状态
        if (!navigator.onLine) {
            updateOnlineStatus();
        }
    }

    // 显示欢迎消息
    showWelcomeMessage() {
        const isFirstVisit = !localStorage.getItem('english_mastery_visited');
        
        if (isFirstVisit) {
            setTimeout(() => {
                this.ui.showNotification(
                    '欢迎使用英语成神之路！开始添加你的第一个单词吧。',
                    'info'
                );
                localStorage.setItem('english_mastery_visited', 'true');
            }, 1000);
        }
        
        // 显示单词总数
        const totalWords = this.storage.getStats().totalWords;
        if (totalWords > 0) {
            setTimeout(() => {
                this.ui.showNotification(
                    `欢迎回来！你已累计学习 ${totalWords} 个单词。`,
                    'info'
                );
            }, 1500);
        }
    }

    // 初始化自动保存
    initAutoSave() {
        // 每5分钟自动保存一次
        setInterval(() => {
            if (this.storage.saveData()) {
                this.ui.updateLastSync();
            }
        }, 5 * 60 * 1000);
        
        // 页面关闭前保存
        window.addEventListener('beforeunload', () => {
            this.storage.saveData();
        });
    }

    // 添加键盘快捷键
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S 保存
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.storage.saveData()) {
                    this.ui.showNotification('已保存', 'success');
                }
            }
            
            // Ctrl/Cmd + N 添加新单词
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.ui.switchPage('add');
                document.getElementById('word').focus();
            }
            
            // Ctrl/Cmd + F 搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.ui.switchPage('list');
                setTimeout(() => {
                    document.getElementById('search-input').focus();
                }, 100);
            }
            
            // Ctrl/Cmd + R 开始复习
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.ui.switchPage('review');
                setTimeout(() => {
                    document.getElementById('start-review').click();
                }, 100);
            }
        });
    }

    // 添加PWA安装提示
    initPWAInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // 阻止默认安装提示
            e.preventDefault();
            deferredPrompt = e;
            
            // 显示自定义安装按钮
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('应用已安装');
            this.ui.showNotification('应用已成功安装！', 'success');
            deferredPrompt = null;
        });
    }

    // 显示安装按钮
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-primary install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> 安装应用';
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.right = '20px';
        installBtn.style.zIndex = '1000';
        
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('用户接受了安装提示');
            } else {
                console.log('用户拒绝了安装提示');
            }
            
            deferredPrompt = null;
            installBtn.remove();
        });
        
        document.body.appendChild(installBtn);
        
        // 7天后自动隐藏
        setTimeout(() => {
            if (installBtn.parentNode) {
                installBtn.remove();
            }
        }, 7 * 24 * 60 * 60 * 1000);
    }

    // 添加分享功能
    initShareFeature() {
        if (navigator.share) {
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-outline share-btn';
            shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> 分享';
            shareBtn.style.position = 'fixed';
            shareBtn.style.bottom = '20px';
            shareBtn.style.left = '20px';
            shareBtn.style.zIndex = '1000';
            
            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: '英语成神之路',
                        text: '我正在使用这个超棒的英语学习应用！',
                        url: window.location.href
                    });
                    this.ui.showNotification('分享成功！', 'success');
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.log('分享失败:', error);
                    }
                }
            });
            
            document.body.appendChild(shareBtn);
        }
    }

    // 添加数据分析（匿名）
    initAnalytics() {
        // 简单的使用统计（不收集个人信息）
        const trackEvent = (eventName, data = {}) => {
            const events = JSON.parse(localStorage.getItem('english_mastery_analytics') || '[]');
            events.push({
                timestamp: new Date().toISOString(),
                event: eventName,
                ...data
            });
            
            // 只保留最近1000个事件
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }
            
            localStorage.setItem('english_mastery_analytics', JSON.stringify(events));
        };
        
        // 跟踪页面访问
        trackEvent('app_start', {
            totalWords: this.storage.getStats().totalWords,
            userAgent: navigator.userAgent
        });
        
        // 跟踪单词添加
        this.storage.on('wordAdded', (e) => {
            trackEvent('word_added', {
                wordLength: e.detail.word.word.length,
                hasExample: !!e.detail.word.example,
                tagCount: e.detail.word.tags.length
            });
        });
        
        // 跟踪复习
        this.storage.on('wordUpdated', (e) => {
            if (e.detail.word.lastReviewed) {
                trackEvent('word_reviewed', {
                    mastery: e.detail.word.mastery,
                    reviewCount: e.detail.word.reviewCount
                });
            }
        });
    }

    // 导出分析数据（仅用于改进应用）
    exportAnalytics() {
        const events = JSON.parse(localStorage.getItem('english_mastery_analytics') || '[]');
        const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `english-mastery-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.ui.showNotification('分析数据已导出', 'success');
    }

    // 重置分析数据
    resetAnalytics() {
        localStorage.removeItem('english_mastery_analytics');
        this.ui.showNotification('分析数据已重置', 'success');
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    // 等待所有资源加载完成
    window.addEventListener('load', () => {
        const app = new EnglishMasteryApp();
        
        // 将应用实例挂载到window以便调试
        window.EnglishMasteryApp = app;
        
        // 显示加载完成消息
        setTimeout(() => {
            const stats = storage.getStats();
            if (stats.totalWords > 0) {
                uiManager.showNotification(
                    `应用已就绪！你有 ${stats.totalWords} 个单词需要复习。`,
                    'success'
                );
            }
        }, 500);
    });
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
    
    // 显示友好的错误消息
    uiManager.showNotification(
        '应用发生错误，请刷新页面重试。如果问题持续，请联系开发者。',
        'error'
    );
    
    // 记录错误
    const errors = JSON.parse(localStorage.getItem('english_mastery_errors') || '[]');
    errors.push({
        timestamp: new Date().toISOString(),
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        col: event.colno
    });
    
    // 只保留最近100个错误
    if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
    }
    
    localStorage.setItem('english_mastery_errors', JSON.stringify(errors));
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    
    uiManager.showNotification(
        '应用发生错误，请刷新页面重试。',
        'error'
    );
});

// 导出全局函数用于调试
window.debugApp = {
    exportData: () => storage.exportData(),
    importData: (json) => storage.importData(json),
    clearData: () => storage.clearAllData(),
    getStats: () => storage.getStats(),
    getAllWords: () => storage.getAllWords(),
    exportAnalytics: () => window.EnglishMasteryApp?.exportAnalytics(),
    resetAnalytics: () => window.EnglishMasteryApp?.resetAnalytics()
};