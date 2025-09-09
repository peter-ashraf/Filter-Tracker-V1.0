// AquaTracker - Complete App with Mobile PWA Theme Fix
console.log('🌊 AquaTracker: Starting with bulletproof theme system...');

class ThemeController {
    constructor() {
        this.STORAGE_KEY = 'aquatracker-theme-override';
        this.currentTheme = null;
        this.isSystemOverride = false;
    }

    init() {
        console.log('🎨 ThemeController: Initializing theme system...');
        
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const initialTheme = savedTheme || 'light';
        
        console.log('🎨 Saved theme preference:', savedTheme);
        console.log('🎨 Initial theme will be:', initialTheme);
        
        this.forceApplyTheme(initialTheme);
        this.bindToggleEvent();
        this.disableSystemThemeSync();
        
        console.log('✅ ThemeController: Initialization complete');
    }

    forceApplyTheme(theme) {
        console.log('🎨 FORCE applying theme:', theme);
        
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--text-primary', '#f9fafb', 'important');
            root.style.setProperty('--text-secondary', '#d1d5db', 'important');
            root.style.setProperty('--text-muted', '#9ca3af', 'important');
            root.style.setProperty('--bg-primary', '#1f2937', 'important');
            root.style.setProperty('--bg-secondary', '#111827', 'important');
            root.style.setProperty('--bg-tertiary', '#374151', 'important');
            root.style.setProperty('--border-color', '#374151', 'important');
            root.style.setProperty('--border-light', '#4b5563', 'important');
        } else {
            root.style.setProperty('--text-primary', '#1f2937', 'important');
            root.style.setProperty('--text-secondary', '#6b7280', 'important');
            root.style.setProperty('--text-muted', '#9ca3af', 'important');
            root.style.setProperty('--bg-primary', '#ffffff', 'important');
            root.style.setProperty('--bg-secondary', '#f9fafb', 'important');
            root.style.setProperty('--bg-tertiary', '#f3f4f6', 'important');
            root.style.setProperty('--border-color', '#e5e7eb', 'important');
            root.style.setProperty('--border-light', '#f3f4f6', 'important');
        }
        
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.currentTheme = theme;
        this.isSystemOverride = true;
        
        this.updateToggleState(theme);
        document.body.offsetHeight;
        
        console.log('🎨 Theme FORCE applied successfully:', theme);
        console.log('🎨 Document theme attribute:', document.documentElement.getAttribute('data-theme'));
    }

    updateToggleState(theme) {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.checked = (theme === 'dark');
            console.log('🎨 Toggle updated:', theme === 'dark' ? 'checked' : 'unchecked');
        }
    }

    toggleTheme() {
        console.log('🎨 Theme toggle triggered!');
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log('🎨 Switching from', this.currentTheme, 'to', newTheme);
        this.forceApplyTheme(newTheme);
    }

    bindToggleEvent() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.removeEventListener('change', this.handleToggleChange.bind(this));
            toggle.addEventListener('change', this.handleToggleChange.bind(this));
            console.log('✅ Theme toggle event bound');
        } else {
            console.error('❌ Theme toggle element not found');
        }
    }

    handleToggleChange(event) {
        console.log('🎨 Toggle change event:', event.target.checked);
        this.toggleTheme();
    }

    disableSystemThemeSync() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', () => {});
            }
            console.log('🚫 System theme sync disabled');
        }
    }
}

class AquaTracker {
    constructor() {
        this.filters = [];
        this.history = [];
        this.editingFilterId = null;
        this.currentTab = 'dashboard';
        this.installPromptEvent = null;
        this.currency = 'EGP';
        this.pendingDeleteId = null;
        this.themeController = new ThemeController();
        
        console.log('AquaTracker: Initializing complete application...');
        this.init();
    }

    init() {
        try {
            this.themeController.init();
            
            this.loadInitialData();
            this.bindEvents();
            this.updateStats();
            this.renderFilters();
            this.initializeTabs();
            this.initializePWA();
            this.loadCurrency();
            console.log('✅ AquaTracker: Complete application loaded successfully');
        } catch (error) {
            console.error('❌ AquaTracker: Initialization error:', error);
        }
    }

    loadInitialData() {
        console.log('📊 Loading initial data with EGP currency...');
        
        const storedFilters = localStorage.getItem('waterFilters');
        const storedHistory = localStorage.getItem('filterHistory');
        
        if (storedFilters) {
            this.filters = JSON.parse(storedFilters);
        } else {
            this.filters = [
                {
                    id: 'stage-1',
                    name: 'Sediment Pre-Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 1',
                    type: 'Sediment',
                    brand: 'APEC',
                    model: 'FI-SED-10',
                    installDate: '2024-03-15',
                    replacementInterval: 6,
                    nextDueDate: '2024-09-15',
                    cost: 240,
                    notes: 'First stage - removes sediment, dirt, and rust particles',
                    isActive: true,
                    notificationSettings: {
                        buyReminder: {
                            enabled: true,
                            timing: 14,
                            frequency: 'weekly',
                            time: '09:00',
                            stopDays: 7
                        },
                        replaceReminder: {
                            enabled: true,
                            timing: 1,
                            frequency: 'daily',
                            time: '10:00',
                            overdueEscalation: 'every-2-hours'
                        },
                        criticalReminder: {
                            enabled: false,
                            threshold: 14,
                            frequency: 'hourly'
                        }
                    }
                },
                {
                    id: 'stage-2',
                    name: 'Carbon Pre-Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 2',
                    type: 'Carbon',
                    brand: 'APEC',
                    model: 'FI-GAC-10',
                    installDate: '2024-04-01',
                    replacementInterval: 6,
                    nextDueDate: '2024-10-01',
                    cost: 288,
                    notes: 'Second stage - removes chlorine, taste, and odor',
                    isActive: true,
                    notificationSettings: {
                        buyReminder: {
                            enabled: true,
                            timing: 14,
                            frequency: 'weekly',
                            time: '09:00',
                            stopDays: 7
                        },
                        replaceReminder: {
                            enabled: true,
                            timing: 1,
                            frequency: 'daily',
                            time: '10:00',
                            overdueEscalation: 'every-2-hours'
                        },
                        criticalReminder: {
                            enabled: false,
                            threshold: 14,
                            frequency: 'hourly'
                        }
                    }
                },
                {
                    id: 'stage-3',
                    name: 'Carbon Block Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 3',
                    type: 'Carbon Block',
                    brand: 'APEC',
                    model: 'FI-CB-10',
                    installDate: '2024-01-20',
                    replacementInterval: 9,
                    nextDueDate: '2024-10-20',
                    cost: 400,
                    notes: 'Third stage - final pre-filtration before RO membrane',
                    isActive: true,
                    notificationSettings: {
                        buyReminder: {
                            enabled: true,
                            timing: 21,
                            frequency: 'weekly',
                            time: '09:00',
                            stopDays: 14
                        },
                        replaceReminder: {
                            enabled: true,
                            timing: 3,
                            frequency: 'daily',
                            time: '10:00',
                            overdueEscalation: 'every-2-hours'
                        },
                        criticalReminder: {
                            enabled: false,
                            threshold: 14,
                            frequency: 'hourly'
                        }
                    }
                },
                {
                    id: 'stage-4',
                    name: 'RO Membrane',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 4',
                    type: 'RO Membrane',
                    brand: 'APEC',
                    model: 'MEM-75-RO',
                    installDate: '2023-08-10',
                    replacementInterval: 24,
                    nextDueDate: '2025-08-10',
                    cost: 1360,
                    notes: 'Fourth stage - reverse osmosis membrane for pure water',
                    isActive: true,
                    notificationSettings: {
                        buyReminder: {
                            enabled: true,
                            timing: 30,
                            frequency: 'weekly',
                            time: '09:00',
                            stopDays: 14
                        },
                        replaceReminder: {
                            enabled: true,
                            timing: 7,
                            frequency: 'daily',
                            time: '10:00',
                            overdueEscalation: 'every-6-hours'
                        },
                        criticalReminder: {
                            enabled: true,
                            threshold: 30,
                            frequency: 'hourly'
                        }
                    }
                },
                {
                    id: 'stage-5',
                    name: 'Post Carbon Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 5',
                    type: 'Post Carbon',
                    brand: 'APEC',
                    model: 'FI-GAC-T33',
                    installDate: '2023-12-05',
                    replacementInterval: 12,
                    nextDueDate: '2024-12-05',
                    cost: 352,
                    notes: 'Fifth stage - final taste and odor polishing',
                    isActive: true,
                    notificationSettings: {
                        buyReminder: {
                            enabled: true,
                            timing: 21,
                            frequency: 'weekly',
                            time: '09:00',
                            stopDays: 7
                        },
                        replaceReminder: {
                            enabled: true,
                            timing: 3,
                            frequency: 'daily',
                            time: '10:00',
                            overdueEscalation: 'every-2-hours'
                        },
                        criticalReminder: {
                            enabled: false,
                            threshold: 14,
                            frequency: 'hourly'
                        }
                    }
                },
                {
                    id: 'stage-6',
                    name: 'Alkaline Mineral Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 6',
                    type: 'Mineral',
                    brand: 'APEC',
                    model: 'FI-AL-10',
                    installDate: '2024-02-28',
                    replacementInterval: 12,
                    nextDueDate: '2025-02-28',
                    cost: 560,
                    notes: 'Sixth stage - adds beneficial minerals and balances pH',
                    isActive: true,
                    notificationSettings: {
                        buyReminder: {
                            enabled: true,
                            timing: 21,
                            frequency: 'weekly',
                            time: '09:00',
                            stopDays: 7
                        },
                        replaceReminder: {
                            enabled: true,
                            timing: 3,
                            frequency: 'daily',
                            time: '10:00',
                            overdueEscalation: 'every-2-hours'
                        },
                        criticalReminder: {
                            enabled: false,
                            threshold: 14,
                            frequency: 'hourly'
                        }
                    }
                },
                {
                    id: 'stage-7',
                    name: 'UV Sterilizer Lamp',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 7',
                    type: 'UV Lamp',
                    brand: 'APEC',
                    model: 'UV-11W',
                    installDate: '2024-01-15',
                    replacementInterval: 12,
                    nextDueDate: '2025-01-15',
                    cost: 720,
                    notes: 'Seventh stage - UV sterilization for bacteria-free water',
                    isActive: true,
                    notificationSettings: {
                        buyReminder: {
                            enabled: true,
                            timing: 30,
                            frequency: 'weekly',
                            time: '09:00',
                            stopDays: 14
                        },
                        replaceReminder: {
                            enabled: true,
                            timing: 7,
                            frequency: 'daily',
                            time: '10:00',
                            overdueEscalation: 'every-6-hours'
                        },
                        criticalReminder: {
                            enabled: true,
                            threshold: 14,
                            frequency: 'hourly'
                        }
                    }
                }
            ];
            this.saveData();
        }

        if (storedHistory) {
            this.history = JSON.parse(storedHistory);
        } else {
            this.history = this.generateSampleHistory();
            this.saveHistory();
        }
        
        console.log(`📊 Loaded ${this.filters.length} filters and ${this.history.length} history items with EGP pricing`);
    }

    generateSampleHistory() {
        const sampleHistory = [];
        const today = new Date();
        
        for (let i = 0; i < 16; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i * 30 + Math.random() * 20));
            
            const randomFilter = this.filters[Math.floor(Math.random() * this.filters.length)];
            
            sampleHistory.push({
                id: 'history-' + Date.now() + '-' + i,
                filterId: randomFilter.id,
                filterName: randomFilter.name,
                date: date.toISOString().split('T')[0],
                cost: randomFilter.cost || 0,
                notes: `Scheduled replacement - ${randomFilter.name}`,
                type: 'replacement'
            });
        }
        
        return sampleHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    bindEvents() {
        console.log('🔗 Binding events...');
        
        // Notification toggle
        const notificationToggle = document.getElementById('notification-toggle');
        if (notificationToggle) {
            notificationToggle.addEventListener('click', () => this.toggleNotifications());
            console.log('✅ Notification toggle bound');
        }

        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Add filter button
        const addBtn = document.getElementById('add-filter-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddFilterModal());
        }

        // Search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchFilters(e.target.value));
        }

        // History controls
        const historyFilter = document.getElementById('history-filter');
        if (historyFilter) {
            historyFilter.addEventListener('change', () => this.renderHistory());
        }

        const exportHistory = document.getElementById('export-history');
        if (exportHistory) {
            exportHistory.addEventListener('click', () => this.exportHistory());
        }

        const clearHistory = document.getElementById('clear-history');
        if (clearHistory) {
            clearHistory.addEventListener('click', () => this.clearHistory());
        }

        // Settings
        const exportData = document.getElementById('export-data');
        if (exportData) {
            exportData.addEventListener('click', () => this.exportAllData());
        }

        const importData = document.getElementById('import-data');
        const importFile = document.getElementById('import-file');
        if (importData && importFile) {
            importData.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => this.importData(e));
        }

        const resetData = document.getElementById('reset-data');
        if (resetData) {
            resetData.addEventListener('click', () => this.confirmResetData());
        }

        // Currency selector
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => this.setCurrency(e.target.value));
        }

        // Mobile PWA Cache Controls
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        const checkUpdatesBtn = document.getElementById('check-updates-btn');
        
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCacheAndRefresh());
        }
        
        if (checkUpdatesBtn) {
            checkUpdatesBtn.addEventListener('click', () => this.checkForUpdates());
        }

        // Advanced notification toggles
        const buyReminderEnabled = document.getElementById('buy-reminder-enabled');
        const replaceReminderEnabled = document.getElementById('replace-reminder-enabled');
        const criticalReminderEnabled = document.getElementById('critical-reminder-enabled');

        if (buyReminderEnabled) {
            buyReminderEnabled.addEventListener('change', () => this.toggleNotificationSection('buy-reminder-settings', buyReminderEnabled.checked));
        }
        if (replaceReminderEnabled) {
            replaceReminderEnabled.addEventListener('change', () => this.toggleNotificationSection('replace-reminder-settings', replaceReminderEnabled.checked));
        }
        if (criticalReminderEnabled) {
            criticalReminderEnabled.addEventListener('change', () => this.toggleNotificationSection('critical-reminder-settings', criticalReminderEnabled.checked));
        }

        this.bindModalEvents();

        const installBtn = document.getElementById('install-btn');
        const installDismiss = document.getElementById('install-dismiss');
        if (installBtn) installBtn.addEventListener('click', () => this.installPWA());
        if (installDismiss) installDismiss.addEventListener('click', () => this.dismissInstallPrompt());
    }

    // Mobile PWA Cache Management
    async clearCacheAndRefresh() {
        console.log('🗂️ Clearing PWA cache...');
        
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                
                for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                    console.log('🗑️ Deleted cache:', cacheName);
                }
                
                // Also clear localStorage theme to reset completely
                localStorage.removeItem(this.themeController.STORAGE_KEY);
                
                alert('✅ Cache cleared! The app will now reload with fresh files.');
                
                // Force reload
                window.location.reload(true);
            } else {
                alert('Cache API not available in this browser.');
            }
        } catch (error) {
            console.error('❌ Cache clearing error:', error);
            alert('❌ Error clearing cache. Try closing and reopening the app.');
        }
    }

    async checkForUpdates() {
        console.log('🔍 Checking for updates...');
        
        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Force service worker to check for updates
                navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
                
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    console.log('🔄 Service worker updated');
                }
                
                alert('🔍 Update check complete! If theme switching still doesn\'t work, try "Clear Cache & Refresh".');
            } else {
                alert('Service worker not available. Try refreshing the page.');
            }
        } catch (error) {
            console.error('❌ Update check error:', error);
            alert('❌ Error checking for updates.');
        }
    }

    bindModalEvents() {
        const filterForm = document.getElementById('filter-form');
        const cancelBtn = document.getElementById('cancel-btn');
        const closeButtons = document.querySelectorAll('.modal-close');

        if (filterForm) {
            filterForm.addEventListener('submit', (e) => this.handleFilterSubmit(e));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal('filter-modal'));
        }

        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });

        const confirmOk = document.getElementById('confirm-ok');
        const confirmCancel = document.getElementById('confirm-cancel');
        if (confirmOk) confirmOk.addEventListener('click', () => this.handleConfirmOk());
        if (confirmCancel) confirmCancel.addEventListener('click', () => this.closeModal('confirm-modal'));

        const notificationEnable = document.getElementById('notification-enable');
        const notificationCancel = document.getElementById('notification-cancel');
        if (notificationEnable) notificationEnable.addEventListener('click', () => this.enableNotifications());
        if (notificationCancel) notificationCancel.addEventListener('click', () => this.closeModal('notification-modal'));

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    // Currency Management
    loadCurrency() {
        const saved = localStorage.getItem('currency') || 'EGP';
        this.setCurrency(saved);
    }

    setCurrency(currency) {
        this.currency = currency;
        localStorage.setItem('currency', currency);
        
        const select = document.getElementById('currency-select');
        if (select) {
            select.value = currency;
        }
        
        this.updateStats();
        this.renderFilters();
        if (this.currentTab === 'statistics') {
            this.renderStatistics();
        }
        if (this.currentTab === 'history') {
            this.renderHistory();
        }
        
        console.log(`💱 Currency set to: ${currency}`);
    }

    formatCurrency(amount) {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'CAD': '$',
            'EGP': 'ج.م'
        };
        
        const symbol = symbols[this.currency] || this.currency;
        
        if (this.currency === 'EGP') {
            return `${symbol} ${amount.toLocaleString('ar-EG')}`;
        } else {
            return `${symbol}${amount.toLocaleString()}`;
        }
    }

    // Notification Management
    toggleNotifications() {
        const enabled = localStorage.getItem('notifications-enabled') === 'true';
        if (enabled) {
            this.disableNotifications();
        } else {
            this.showModal('notification-modal');
        }
    }

    enableNotifications() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    localStorage.setItem('notifications-enabled', 'true');
                    this.updateNotificationIcon(true);
                    this.closeModal('notification-modal');
                    
                    new Notification('🔔 AquaTracker', {
                        body: 'Advanced notifications enabled! You\'ll get customized reminders for each filter.'
                    });
                } else {
                    alert('Please enable notifications in your browser settings to receive advanced filter reminders.');
                }
            });
        }
    }

    disableNotifications() {
        localStorage.setItem('notifications-enabled', 'false');
        this.updateNotificationIcon(false);
    }

    updateNotificationIcon(enabled) {
        const icon = document.querySelector('.notification-icon');
        if (icon) {
            icon.textContent = enabled ? '🔔' : '🔕';
        }
    }

    toggleNotificationSection(sectionId, enabled) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = enabled ? 'block' : 'none';
        }
    }

    // Tab Management
    initializeTabs() {
        this.switchTab('dashboard');
    }

    switchTab(tabName) {
        console.log(`📑 Switching to tab: ${tabName}`);
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) activeContent.classList.add('active');

        this.currentTab = tabName;

        if (tabName === 'history') {
            this.renderHistory();
        } else if (tabName === 'statistics') {
            this.renderStatistics();
        }
    }

    // Filter Management
    renderFilters() {
        console.log('🔄 Rendering filters...');
        const grid = document.getElementById('filters-grid');
        if (!grid) {
            console.error('❌ Filters grid not found');
            return;
        }

        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const filteredFilters = this.filters.filter(filter => 
            filter.name.toLowerCase().includes(searchTerm) ||
            filter.location.toLowerCase().includes(searchTerm) ||
            filter.type.toLowerCase().includes(searchTerm)
        );

        if (filteredFilters.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">💧</div>
                    <h3>No Filters Found</h3>
                    <p>Try adjusting your search or add a new filter.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredFilters.map(filter => this.createFilterCard(filter)).join('');
        
        grid.querySelectorAll('.filter-card').forEach(card => {
            const filterId = card.dataset.filterId;
            
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.filter-actions')) {
                    this.editFilter(filterId);
                }
            });
            
            const deleteBtn = card.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteFilter(filterId);
                });
            }

            const replaceBtn = card.querySelector('.replace-btn');
            if (replaceBtn) {
                replaceBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.markAsReplaced(filterId);
                });
            }
        });

        console.log(`✅ Rendered ${filteredFilters.length} filter cards`);
    }

    createFilterCard(filter) {
        const status = this.getFilterStatus(filter);
        const daysUntilDue = this.getDaysUntilDue(filter.nextDueDate);
        
        return `
            <div class="filter-card ${status}" data-filter-id="${filter.id}">
                <div class="filter-header">
                    <div class="filter-stage">${filter.stage || 'Filter'}</div>
                    <div class="filter-actions">
                        <button class="action-btn replace-btn" title="Mark as Replaced">🔄</button>
                        <button class="action-btn delete-btn" title="Delete Filter">🗑️</button>
                    </div>
                </div>
                <div class="filter-content">
                    <h3 class="filter-name">${filter.name}</h3>
                    <p class="filter-location">📍 ${filter.location}</p>
                    <p class="filter-type">🔧 ${filter.type}</p>
                    <div class="filter-status">
                        <span class="status-indicator ${status}"></span>
                        <span class="status-text">${this.getStatusText(status, daysUntilDue)}</span>
                    </div>
                    <div class="filter-details">
                        <div class="detail-item">
                            <span class="detail-label">Due:</span>
                            <span class="detail-value">${this.formatDate(filter.nextDueDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Interval:</span>
                            <span class="detail-value">${filter.replacementInterval} months</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cost:</span>
                            <span class="detail-value">${this.formatCurrency(filter.cost)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Notifications:</span>
                            <span class="detail-value">${this.getNotificationSummary(filter)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getNotificationSummary(filter) {
        const settings = filter.notificationSettings;
        if (!settings) return 'None';
        
        let summary = [];
        if (settings.buyReminder?.enabled) summary.push('Buy');
        if (settings.replaceReminder?.enabled) summary.push('Replace');
        if (settings.criticalReminder?.enabled) summary.push('Critical');
        
        return summary.length > 0 ? summary.join(', ') : 'None';
    }

    getFilterStatus(filter) {
        const today = new Date();
        const dueDate = new Date(filter.nextDueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) return 'overdue';
        if (daysUntilDue <= 30) return 'due-soon';
        return 'good';
    }

    getDaysUntilDue(dueDateString) {
        const today = new Date();
        const dueDate = new Date(dueDateString);
        return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    }

    getStatusText(status, daysUntilDue) {
        switch (status) {
            case 'overdue':
                return `Overdue by ${Math.abs(daysUntilDue)} days`;
            case 'due-soon':
                return `Due in ${daysUntilDue} days`;
            case 'good':
                return `${daysUntilDue} days remaining`;
            default:
                return 'Unknown';
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    showAddFilterModal() {
        this.editingFilterId = null;
        document.getElementById('modal-title').textContent = 'Add Filter';
        this.resetFilterForm();
        this.showModal('filter-modal');
    }

    editFilter(filterId) {
        const filter = this.filters.find(f => f.id === filterId);
        if (!filter) return;

        this.editingFilterId = filterId;
        document.getElementById('modal-title').textContent = 'Edit Filter';
        this.populateFilterForm(filter);
        this.showModal('filter-modal');
    }

    deleteFilter(filterId) {
        const filter = this.filters.find(f => f.id === filterId);
        if (!filter) return;

        document.getElementById('confirm-message').textContent = 
            `Are you sure you want to delete "${filter.name}"? This action cannot be undone.`;
        
        this.pendingDeleteId = filterId;
        this.showModal('confirm-modal');
    }

    handleConfirmOk() {
        if (this.pendingDeleteId) {
            this.filters = this.filters.filter(f => f.id !== this.pendingDeleteId);
            this.saveData();
            this.updateStats();
            this.renderFilters();
            this.pendingDeleteId = null;
            
            console.log('🗑️ Filter deleted successfully');
        }
        this.closeModal('confirm-modal');
    }

    markAsReplaced(filterId) {
        const filter = this.filters.find(f => f.id === filterId);
        if (!filter) return;

        const today = new Date();
        const nextDue = new Date(today);
        nextDue.setMonth(nextDue.getMonth() + filter.replacementInterval);

        this.history.unshift({
            id: 'history-' + Date.now(),
            filterId: filter.id,
            filterName: filter.name,
            date: today.toISOString().split('T')[0],
            cost: filter.cost || 0,
            notes: `Filter replaced - ${filter.name}`,
            type: 'replacement'
        });

        filter.installDate = today.toISOString().split('T')[0];
        filter.nextDueDate = nextDue.toISOString().split('T')[0];

        this.saveData();
        this.saveHistory();
        this.updateStats();
        this.renderFilters();

        alert(`✅ ${filter.name} marked as replaced! Next due: ${this.formatDate(filter.nextDueDate)}`);
        console.log(`🔄 Filter ${filter.name} marked as replaced`);
    }

    // Form Management
    resetFilterForm() {
        const form = document.getElementById('filter-form');
        if (form) form.reset();
        
        document.getElementById('filter-install-date').value = new Date().toISOString().split('T')[0];
        
        document.getElementById('buy-reminder-enabled').checked = true;
        document.getElementById('replace-reminder-enabled').checked = true;
        document.getElementById('critical-reminder-enabled').checked = false;
        
        document.getElementById('buy-reminder-settings').style.display = 'block';
        document.getElementById('replace-reminder-settings').style.display = 'block';
        document.getElementById('critical-reminder-settings').style.display = 'none';
    }

    populateFilterForm(filter) {
        document.getElementById('filter-name').value = filter.name || '';
        document.getElementById('filter-location').value = filter.location || '';
        document.getElementById('filter-stage').value = filter.stage || '';
        document.getElementById('filter-type').value = filter.type || '';
        document.getElementById('filter-interval').value = filter.replacementInterval || 6;
        document.getElementById('filter-brand').value = filter.brand || '';
        document.getElementById('filter-model').value = filter.model || '';
        document.getElementById('filter-install-date').value = filter.installDate || '';
        document.getElementById('filter-cost').value = filter.cost || '';
        document.getElementById('filter-notes').value = filter.notes || '';

        const settings = filter.notificationSettings || {};
        
        if (settings.buyReminder) {
            document.getElementById('buy-reminder-enabled').checked = settings.buyReminder.enabled;
            document.getElementById('buy-reminder-timing').value = settings.buyReminder.timing;
            document.getElementById('buy-reminder-frequency').value = settings.buyReminder.frequency;
            document.getElementById('buy-reminder-time').value = settings.buyReminder.time;
            document.getElementById('buy-stop-days').value = settings.buyReminder.stopDays || 0;
            document.getElementById('buy-reminder-settings').style.display = settings.buyReminder.enabled ? 'block' : 'none';
        }
        
        if (settings.replaceReminder) {
            document.getElementById('replace-reminder-enabled').checked = settings.replaceReminder.enabled;
            document.getElementById('replace-reminder-timing').value = settings.replaceReminder.timing;
            document.getElementById('replace-reminder-frequency').value = settings.replaceReminder.frequency;
            document.getElementById('replace-reminder-time').value = settings.replaceReminder.time;
            document.getElementById('overdue-escalation').value = settings.replaceReminder.overdueEscalation;
            document.getElementById('replace-reminder-settings').style.display = settings.replaceReminder.enabled ? 'block' : 'none';
        }
        
        if (settings.criticalReminder) {
            document.getElementById('critical-reminder-enabled').checked = settings.criticalReminder.enabled;
            document.getElementById('critical-threshold').value = settings.criticalReminder.threshold;
            document.getElementById('critical-frequency').value = settings.criticalReminder.frequency;
            document.getElementById('critical-reminder-settings').style.display = settings.criticalReminder.enabled ? 'block' : 'none';
        }
    }

    handleFilterSubmit(e) {
        e.preventDefault();
        
        const filterData = {
            name: document.getElementById('filter-name').value,
            location: document.getElementById('filter-location').value,
            stage: document.getElementById('filter-stage').value,
            type: document.getElementById('filter-type').value,
            replacementInterval: parseInt(document.getElementById('filter-interval').value),
            brand: document.getElementById('filter-brand').value,
            model: document.getElementById('filter-model').value,
            installDate: document.getElementById('filter-install-date').value,
            cost: parseFloat(document.getElementById('filter-cost').value) || 0,
            notes: document.getElementById('filter-notes').value,
            isActive: true,
            notificationSettings: {
                buyReminder: {
                    enabled: document.getElementById('buy-reminder-enabled').checked,
                    timing: parseInt(document.getElementById('buy-reminder-timing').value),
                    frequency: document.getElementById('buy-reminder-frequency').value,
                    time: document.getElementById('buy-reminder-time').value,
                    stopDays: parseInt(document.getElementById('buy-stop-days').value)
                },
                replaceReminder: {
                    enabled: document.getElementById('replace-reminder-enabled').checked,
                    timing: parseInt(document.getElementById('replace-reminder-timing').value),
                    frequency: document.getElementById('replace-reminder-frequency').value,
                    time: document.getElementById('replace-reminder-time').value,
                    overdueEscalation: document.getElementById('overdue-escalation').value
                },
                criticalReminder: {
                    enabled: document.getElementById('critical-reminder-enabled').checked,
                    threshold: parseInt(document.getElementById('critical-threshold').value),
                    frequency: document.getElementById('critical-frequency').value
                }
            }
        };

        const installDate = new Date(filterData.installDate);
        const nextDue = new Date(installDate);
        nextDue.setMonth(nextDue.getMonth() + filterData.replacementInterval);
        filterData.nextDueDate = nextDue.toISOString().split('T')[0];

        if (this.editingFilterId) {
            const index = this.filters.findIndex(f => f.id === this.editingFilterId);
            if (index !== -1) {
                this.filters[index] = { ...this.filters[index], ...filterData };
                console.log(`✏️ Filter updated: ${filterData.name}`);
            }
        } else {
            filterData.id = 'filter-' + Date.now();
            this.filters.push(filterData);
            console.log(`➕ New filter added: ${filterData.name}`);
        }

        this.saveData();
        this.updateStats();
        this.renderFilters();
        this.closeModal('filter-modal');
    }

    searchFilters(searchTerm) {
        console.log(`🔍 Searching for: ${searchTerm}`);
        this.renderFilters();
    }

    // History Management
    renderHistory() {
        const historyList = document.getElementById('history-list');
        const filterValue = document.getElementById('history-filter')?.value || 'all';
        
        if (!historyList) return;

        let filteredHistory = [...this.history];
        
        if (filterValue !== 'all') {
            const days = parseInt(filterValue);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            filteredHistory = this.history.filter(item => 
                new Date(item.date) >= cutoffDate
            );
        }

        if (filteredHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No History Found</h3>
                    <p>No filter replacements recorded for the selected period.</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = filteredHistory.map(item => `
            <div class="history-item">
                <div class="history-content">
                    <div class="history-header">
                        <h4>${item.filterName}</h4>
                        <span class="history-date">${this.formatDate(item.date)}</span>
                    </div>
                    <p class="history-notes">${item.notes}</p>
                    <div class="history-details">
                        ${item.cost > 0 ? `<span class="history-cost">${this.formatCurrency(item.cost)}</span>` : ''}
                        <span class="history-type">${item.type === 'replacement' ? '🔄 Replacement' : '📝 Note'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    exportHistory() {
        const data = {
            history: this.history,
            currency: this.currency,
            exported: new Date().toISOString(),
            version: '3.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquatracker-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            console.log('🗑️ History cleared');
        }
    }

    // Statistics Management
    renderStatistics() {
        this.updateStatistics();
    }

    updateStatistics() {
        const totalCost = this.history.reduce((sum, item) => sum + (item.cost || 0), 0);
        const avgCost = this.history.length > 0 ? totalCost / this.history.length : 0;
        
        const oldestDate = this.history.length > 0 ? 
            new Date(Math.min(...this.history.map(h => new Date(h.date)))) : 
            new Date();
        const monthsDiff = Math.max(1, (Date.now() - oldestDate) / (1000 * 60 * 60 * 24 * 30));
        const monthlyCost = totalCost / monthsDiff;
        const yearlyProjection = monthlyCost * 12;

        document.getElementById('total-cost').textContent = this.formatCurrency(totalCost);
        document.getElementById('avg-cost').textContent = this.formatCurrency(avgCost);
        document.getElementById('monthly-cost').textContent = this.formatCurrency(monthlyCost);
        document.getElementById('yearly-projection').textContent = this.formatCurrency(yearlyProjection);

        const totalReplacements = this.history.length;
        const bottlesSaved = totalReplacements * 600;
        const co2Saved = Math.round(bottlesSaved * 0.16);
        const wasteReduced = Math.round(bottlesSaved * 0.032);

        document.getElementById('bottles-saved').textContent = bottlesSaved.toLocaleString();
        document.getElementById('co2-saved').textContent = `${co2Saved} lbs`;
        document.getElementById('waste-reduced').textContent = `${wasteReduced} lbs`;

        this.updateFilterPerformance();
    }

    updateFilterPerformance() {
        const performanceList = document.getElementById('performance-list');
        if (!performanceList) return;

        const filterStats = this.filters.map(filter => {
            const filterHistory = this.history.filter(h => h.filterId === filter.id);
            const totalCost = filterHistory.reduce((sum, h) => sum + (h.cost || 0), 0);
            const replacements = filterHistory.length;
            const costPerMonth = replacements > 0 ? totalCost / (replacements * filter.replacementInterval) : filter.cost / filter.replacementInterval;

            return {
                ...filter,
                totalCost,
                replacements,
                costPerMonth
            };
        }).sort((a, b) => b.costPerMonth - a.costPerMonth);

        if (filterStats.length === 0) {
            performanceList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📈</div>
                    <h3>No Performance Data</h3>
                    <p>Performance data will appear after filter replacements.</p>
                </div>
            `;
            return;
        }

        performanceList.innerHTML = filterStats.map(filter => `
            <div class="performance-item">
                <div class="performance-header">
                    <h4>${filter.name}</h4>
                    <span class="performance-cost">${this.formatCurrency(filter.costPerMonth)}/month</span>
                </div>
                <div class="performance-details">
                    <span>Replacements: ${filter.replacements}</span>
                    <span>Total Cost: ${this.formatCurrency(filter.totalCost)}</span>
                    <span>Type: ${filter.type}</span>
                    <span>Interval: ${filter.replacementInterval} months</span>
                    <span>Notifications: ${this.getNotificationSummary(filter)}</span>
                </div>
            </div>
        `).join('');
    }

    // Stats and Data
    updateStats() {
        const stats = this.calculateStats();
        
        document.getElementById('total-filters').textContent = stats.total;
        document.getElementById('overdue-filters').textContent = stats.overdue;
        document.getElementById('due-soon-filters').textContent = stats.dueSoon;
        document.getElementById('good-filters').textContent = stats.good;

        console.log(`📊 Stats updated:`, stats);
    }

    calculateStats() {
        const today = new Date();
        let overdue = 0, dueSoon = 0, good = 0;

        this.filters.forEach(filter => {
            const dueDate = new Date(filter.nextDueDate);
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntilDue < 0) overdue++;
            else if (daysUntilDue <= 30) dueSoon++;
            else good++;
        });

        return {
            total: this.filters.length,
            overdue,
            dueSoon,
            good
        };
    }

    // Data Management
    saveData() {
        localStorage.setItem('waterFilters', JSON.stringify(this.filters));
        console.log('💾 Filter data saved to localStorage');
    }

    saveHistory() {
        localStorage.setItem('filterHistory', JSON.stringify(this.history));
        console.log('💾 History data saved to localStorage');
    }

    exportAllData() {
        const data = {
            filters: this.filters,
            history: this.history,
            settings: {
                theme: this.themeController.currentTheme,
                notificationsEnabled: localStorage.getItem('notifications-enabled'),
                currency: this.currency
            },
            exported: new Date().toISOString(),
            version: '3.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquatracker-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📤 Complete data exported');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('This will replace all current data. Are you sure?')) {
                    if (data.filters) this.filters = data.filters;
                    if (data.history) this.history = data.history;
                    if (data.settings) {
                        if (data.settings.theme) {
                            this.themeController.forceApplyTheme(data.settings.theme);
                        }
                        if (data.settings.notificationsEnabled) {
                            localStorage.setItem('notifications-enabled', data.settings.notificationsEnabled);
                        }
                        if (data.settings.currency) {
                            this.setCurrency(data.settings.currency);
                        }
                    }
                    
                    this.saveData();
                    this.saveHistory();
                    this.updateStats();
                    this.renderFilters();
                    
                    alert('✅ Complete data imported successfully with all notification settings!');
                    console.log('📥 Complete data imported');
                }
            } catch (error) {
                alert('❌ Invalid file format. Please select a valid AquaTracker backup file.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }

    confirmResetData() {
        if (confirm('⚠️ This will delete all filters, history, notification settings, and preferences. This cannot be undone. Are you sure?')) {
            if (confirm('🚨 Are you absolutely sure? This will permanently delete everything including all advanced notification configurations.')) {
                localStorage.clear();
                location.reload();
            }
        }
    }

    // PWA Features
    initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('✅ SW registered:', registration);
                })
                .catch(error => {
                    console.log('❌ SW registration failed:', error);
                });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPromptEvent = e;
            this.showInstallPrompt();
        });

        const enabled = localStorage.getItem('notifications-enabled') === 'true';
        this.updateNotificationIcon(enabled);
    }

    showInstallPrompt() {
        const prompt = document.getElementById('install-prompt');
        if (prompt && this.installPromptEvent) {
            prompt.style.display = 'flex';
        }
    }

    dismissInstallPrompt() {
        const prompt = document.getElementById('install-prompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    installPWA() {
        if (this.installPromptEvent) {
            this.installPromptEvent.prompt();
            this.installPromptEvent.userChoice.then((result) => {
                if (result.outcome === 'accepted') {
                    console.log('✅ PWA installed');
                }
                this.installPromptEvent = null;
                this.dismissInstallPrompt();
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing AquaTracker...');
    window.aquaTracker = new AquaTracker();
    console.log('🎉 AquaTracker initialized successfully!');
});
