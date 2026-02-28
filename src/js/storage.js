// 数据存储模块
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'english_mastery_data';
        this.DEFAULT_DATA = {
            words: [],
            settings: {
                theme: 'auto',
                reviewMode: 'spaced',
                dailyGoal: 10,
                notifications: true
            },
            stats: {
                totalWords: 0,
                masteredWords: 0,
                todayAdded: 0,
                streakDays: 0,
                lastStudyDate: null,
                learningHistory: []
            },
            achievements: []
        };
        this.data = this.loadData();
        this.initDefaultWords();
    }

    // 加载数据
    loadData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // 合并默认数据以确保新字段存在
                return this.mergeWithDefaults(parsed);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        }
        return { ...this.DEFAULT_DATA };
    }

    // 合并默认数据
    mergeWithDefaults(savedData) {
        const result = { ...this.DEFAULT_DATA };
        
        // 深度合并
        for (const key in savedData) {
            if (typeof savedData[key] === 'object' && savedData[key] !== null && !Array.isArray(savedData[key])) {
                result[key] = { ...result[key], ...savedData[key] };
            } else {
                result[key] = savedData[key];
            }
        }
        
        return result;
    }

    // 保存数据
    saveData() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 初始化一些示例单词
    initDefaultWords() {
        if (this.data.words.length === 0) {
            const defaultWords = [
                {
                    id: this.generateId(),
                    word: 'serendipity',
                    meaning: '意外发现珍奇事物的本领',
                    example: 'Finding this book was a real serendipity.',
                    tags: ['名词', '高级词汇'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    mastery: 0, // 0-100
                    lastReviewed: null,
                    nextReview: null,
                    reviewCount: 0
                },
                {
                    id: this.generateId(),
                    word: 'ephemeral',
                    meaning: '短暂的，瞬息的',
                    example: 'The beauty of cherry blossoms is ephemeral.',
                    tags: ['形容词', '文学词汇'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    mastery: 0,
                    lastReviewed: null,
                    nextReview: null,
                    reviewCount: 0
                },
                {
                    id: this.generateId(),
                    word: 'resilient',
                    meaning: '有弹性的，适应力强的',
                    example: 'Children are often more resilient than adults.',
                    tags: ['形容词', '心理学'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    mastery: 0,
                    lastReviewed: null,
                    nextReview: null,
                    reviewCount: 0
                }
            ];
            
            this.data.words.push(...defaultWords);
            this.updateStats();
            this.saveData();
        }
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 添加新单词
    addWord(wordData) {
        const word = {
            id: this.generateId(),
            word: wordData.word.trim(),
            meaning: wordData.meaning.trim(),
            example: wordData.example ? wordData.example.trim() : '',
            tags: wordData.tags ? wordData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            mastery: 0,
            lastReviewed: null,
            nextReview: null,
            reviewCount: 0
        };

        this.data.words.unshift(word); // 添加到开头
        this.updateStats();
        this.saveData();
        
        // 触发自定义事件
        this.dispatchEvent('wordAdded', { word });
        
        return word;
    }

    // 更新单词
    updateWord(id, updates) {
        const index = this.data.words.findIndex(w => w.id === id);
        if (index !== -1) {
            this.data.words[index] = {
                ...this.data.words[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            
            // 触发自定义事件
            this.dispatchEvent('wordUpdated', { word: this.data.words[index] });
            
            return true;
        }
        return false;
    }

    // 删除单词
    deleteWord(id) {
        const index = this.data.words.findIndex(w => w.id === id);
        if (index !== -1) {
            const deletedWord = this.data.words.splice(index, 1)[0];
            this.updateStats();
            this.saveData();
            
            // 触发自定义事件
            this.dispatchEvent('wordDeleted', { word: deletedWord });
            
            return true;
        }
        return false;
    }

    // 获取单词
    getWord(id) {
        return this.data.words.find(w => w.id === id);
    }

    // 获取所有单词
    getAllWords() {
        return [...this.data.words];
    }

    // 搜索单词
    searchWords(query) {
        const q = query.toLowerCase().trim();
        if (!q) return this.getAllWords();
        
        return this.data.words.filter(word => 
            word.word.toLowerCase().includes(q) ||
            word.meaning.toLowerCase().includes(q) ||
            word.example.toLowerCase().includes(q) ||
            word.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }

    // 按标签筛选
    filterByTag(tag) {
        if (!tag) return this.getAllWords();
        return this.data.words.filter(word => 
            word.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }

    // 获取所有标签
    getAllTags() {
        const tags = new Set();
        this.data.words.forEach(word => {
            word.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }

    // 获取需要复习的单词
    getWordsForReview() {
        const now = new Date();
        return this.data.words.filter(word => {
            // 从未复习过或已达到复习时间
            if (!word.nextReview) return true;
            return new Date(word.nextReview) <= now;
        });
    }

    // 更新复习状态
    updateReviewStatus(wordId, difficulty) {
        const word = this.getWord(wordId);
        if (!word) return false;

        const now = new Date();
        const intervals = [1, 3, 7, 14, 30]; // 复习间隔（天）
        const currentInterval = intervals[Math.min(word.reviewCount, intervals.length - 1)];
        
        // 根据难度调整间隔
        let interval = currentInterval;
        if (difficulty === 'easy') {
            interval = Math.min(interval * 1.5, 365); // 最长一年
        } else if (difficulty === 'hard') {
            interval = Math.max(Math.floor(interval * 0.7), 1); // 至少一天
        }

        // 计算下次复习时间
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + interval);

        return this.updateWord(wordId, {
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
            reviewCount: word.reviewCount + 1,
            mastery: Math.min(word.mastery + (difficulty === 'easy' ? 25 : 10), 100)
        });
    }

    // 更新统计信息
    updateStats() {
        const now = new Date();
        const today = now.toDateString();
        
        // 计算今日新增
        const todayAdded = this.data.words.filter(word => {
            const wordDate = new Date(word.createdAt).toDateString();
            return wordDate === today;
        }).length;

        // 计算连续学习天数
        let streakDays = this.data.stats.streakDays || 0;
        const lastStudyDate = this.data.stats.lastStudyDate;
        
        if (lastStudyDate) {
            const lastDate = new Date(lastStudyDate);
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streakDays++;
            } else if (diffDays > 1) {
                streakDays = 1; // 中断后重新开始
            }
        } else {
            streakDays = 1;
        }

        // 更新学习历史
        const learningHistory = [...this.data.stats.learningHistory];
        const todayHistory = learningHistory.find(h => h.date === today);
        
        if (todayHistory) {
            todayHistory.wordsAdded = todayAdded;
            todayHistory.wordsReviewed = this.data.words.filter(w => 
                w.lastReviewed && new Date(w.lastReviewed).toDateString() === today
            ).length;
        } else {
            learningHistory.push({
                date: today,
                wordsAdded: todayAdded,
                wordsReviewed: 0
            });
            
            // 只保留最近30天的记录
            if (learningHistory.length > 30) {
                learningHistory.shift();
            }
        }

        this.data.stats = {
            totalWords: this.data.words.length,
            masteredWords: this.data.words.filter(w => w.mastery >= 80).length,
            todayAdded,
            streakDays,
            lastStudyDate: now.toISOString(),
            learningHistory
        };

        this.saveData();
    }

    // 获取统计信息
    getStats() {
        return { ...this.data.stats };
    }

    // 获取设置
    getSettings() {
        return { ...this.data.settings };
    }

    // 更新设置
    updateSettings(updates) {
        this.data.settings = { ...this.data.settings, ...updates };
        this.saveData();
        return true;
    }

    // 导出数据
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // 导入数据
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            this.data = this.mergeWithDefaults(importedData);
            this.saveData();
            
            // 触发自定义事件
            this.dispatchEvent('dataImported', { data: this.data });
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    // 清空所有数据
    clearAllData() {
        this.data = { ...this.DEFAULT_DATA };
        localStorage.removeItem(this.STORAGE_KEY);
        
        // 触发自定义事件
        this.dispatchEvent('dataCleared');
        
        return true;
    }

    // 事件系统
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`storage:${eventName}`, { detail });
        window.dispatchEvent(event);
    }

    // 添加事件监听器
    on(eventName, callback) {
        window.addEventListener(`storage:${eventName}`, callback);
    }

    // 移除事件监听器
    off(eventName, callback) {
        window.removeEventListener(`storage:${eventName}`, callback);
    }
}

// 创建全局存储实例
const storage = new StorageManager();