viewWords.length;
        
        // 更新按钮状态
        this.prevCardBtn.disabled = this.currentReviewIndex === 0;
        this.nextCardBtn.disabled = this.currentReviewIndex === this.reviewWords.length - 1;
    }

    // 翻转卡片
    flipCard() {
        this.flashcard.classList.toggle('flipped');
    }

    // 处理卡片难度
    handleCardDifficulty(difficulty) {
        const word = this.reviewWords[this.currentReviewIndex];
        if (!word) return;
        
        this.storage.updateReviewStatus(word.id, difficulty);
        
        // 移动到下一张卡片
        this.navigateCard(1);
    }

    // 导航卡片
    navigateCard(direction) {
        this.currentReviewIndex += direction;
        
        // 边界检查
        if (this.currentReviewIndex < 0) {
            this.currentReviewIndex = 0;
        } else if (this.currentReviewIndex >= this.reviewWords.length) {
            this.endReview();
            return;
        }
        
        this.showCurrentCard();
    }

    // 结束复习
    endReview() {
        this.isReviewing = false;
        
        // 重置UI状态
        this.startReviewBtn.disabled = false;
        this.reviewFilter.disabled = false;
        this.shuffleCardsCheckbox.disabled = false;
        
        // 显示完成消息
        this.showNotification('复习完成！', 'success');
        
        // 更新统计
        this.updateReviewStats();
    }

    // 更新统计页面
    updateStatsPage() {
        const stats = this.storage.getStats();
        const tags = this.storage.getAllTags();
        
        // 更新统计数据
        this.totalWordsStat.textContent = stats.totalWords;
        this.todayAddedStat.textContent = stats.todayAdded;
        this.masteredWordsStat.textContent = stats.masteredWords;
        this.streakDaysStat.textContent = stats.streakDays;
        
        // 更新标签分布
        if (tags.length === 0) {
            this.tagsDistribution.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <p>还没有添加标签</p>
                </div>
            `;
        } else {
            // 计算标签使用频率
            const tagCounts = {};
            this.storage.getAllWords().forEach(word => {
                word.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });
            
            // 生成标签云
            this.tagsDistribution.innerHTML = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => {
                    const size = Math.min(20 + count * 2, 40);
                    return `
                        <div class="tag-cloud-item" style="font-size: ${size}px">
                            ${this.escapeHtml(tag)} <span class="tag-count">(${count})</span>
                        </div>
                    `;
                })
                .join('');
        }
        
        // 更新学习成就
        this.updateAchievements();
        
        // 更新图表（如果Chart.js已加载）
        if (typeof Chart !== 'undefined') {
            this.updateLearningChart();
        }
    }

    // 更新学习图表
    updateLearningChart() {
        const ctx = document.getElementById('learning-chart');
        if (!ctx) return;
        
        const stats = this.storage.getStats();
        const history = stats.learningHistory.slice(-7); // 最近7天
        
        const dates = history.map(h => h.date.split(' ')[1]); // 只取月份和日期
        const added = history.map(h => h.wordsAdded);
        const reviewed = history.map(h => h.wordsReviewed);
        
        // 销毁旧图表
        if (this.learningChart) {
            this.learningChart.destroy();
        }
        
        this.learningChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: '新增单词',
                        data: added,
                        borderColor: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '复习单词',
                        data: reviewed,
                        borderColor: '#f72585',
                        backgroundColor: 'rgba(247, 37, 133, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // 更新学习成就
    updateAchievements() {
        const stats = this.storage.getStats();
        const achievements = [
            {
                id: 'first-word',
                title: '初学乍练',
                description: '添加第一个单词',
                icon: 'fas fa-star',
                condition: () => stats.totalWords >= 1,
                unlocked: false
            },
            {
                id: 'ten-words',
                title: '小有所成',
                description: '累计学习10个单词',
                icon: 'fas fa-trophy',
                condition: () => stats.totalWords >= 10,
                unlocked: false
            },
            {
                id: 'master-10',
                title: '融会贯通',
                description: '掌握10个单词',
                icon: 'fas fa-crown',
                condition: () => stats.masteredWords >= 10,
                unlocked: false
            },
            {
                id: 'streak-7',
                title: '持之以恒',
                description: '连续学习7天',
                icon: 'fas fa-fire',
                condition: () => stats.streakDays >= 7,
                unlocked: false
            },
            {
                id: 'daily-goal',
                title: '日积月累',
                description: '单日学习10个单词',
                icon: 'fas fa-bullseye',
                condition: () => stats.todayAdded >= 10,
                unlocked: false
            }
        ];
        
        // 检查成就解锁状态
        achievements.forEach(achievement => {
            achievement.unlocked = achievement.condition();
        });
        
        // 渲染成就
        this.achievementsList.innerHTML = achievements.map(achievement => `
            <div class="achievement ${achievement.unlocked ? '' : 'locked'}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.unlocked ? 
                    '<div class="achievement-badge"><i class="fas fa-check"></i> 已解锁</div>' : 
                    '<div class="achievement-badge"><i class="fas fa-lock"></i> 未解锁</div>'
                }
            </div>
        `).join('');
    }

    // 处理导出数据
    handleExport() {
        const data = this.storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `english-mastery-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('数据已导出', 'success');
    }

    // 显示导入对话框
    showImportDialog() {
        this.importFileInput.value = '';
        this.importDialog.classList.add('active');
    }

    // 隐藏导入对话框
    hideImportDialog() {
        this.importDialog.classList.remove('active');
    }

    // 处理导入确认
    handleImportConfirm() {
        const file = this.importFileInput.files[0];
        if (!file) {
            this.showNotification('请选择文件', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = this.storage.importData(e.target.result);
            if (success) {
                this.showNotification('数据导入成功', 'success');
                this.hideImportDialog();
                this.updateAllUI();
            } else {
                this.showNotification('导入失败，请检查文件格式', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 处理清空所有数据
    handleClearAll() {
        this.showConfirmDialog(
            '清空所有数据',
            '确定要清空所有单词和学习记录吗？此操作不可撤销！',
            () => {
                if (this.storage.clearAllData()) {
                    this.showNotification('所有数据已清空', 'success');
                    this.updateAllUI();
                }
            }
        );
    }

    // 显示确认对话框
    showConfirmDialog(title, message, onConfirm) {
        this.confirmTitle.textContent = title;
        this.confirmMessage.textContent = message;
        this.confirmDialog.classList.add('active');
        
        // 存储确认回调
        this.currentConfirmCallback = onConfirm;
    }

    // 隐藏确认对话框
    hideConfirmDialog() {
        this.confirmDialog.classList.remove('active');
        this.currentConfirmCallback = null;
    }

    // 处理确认确定
    handleConfirmOk() {
        if (this.currentConfirmCallback) {
            this.currentConfirmCallback();
        }
        this.hideConfirmDialog();
    }

    // 显示通知
    showNotification(message, type = 'info') {
        this.notificationMessage.textContent = message;
        
        // 设置通知类型样式
        this.notification.className = 'notification';
        this.notification.classList.add(type);
        
        // 显示通知
        this.notification.classList.add('show');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    // 更新最后同步时间
    updateLastSync() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.lastSyncSpan.textContent = `最后同步: ${timeStr}`;
    }

    // 工具函数：转义HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 工具函数：格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '今天';
        } else if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
}

// 创建全局UI管理器实例
const uiManager = new UIManager();