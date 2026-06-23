// AquaTracker - Complete App with Mobile PWA Theme Fix

class ThemeController {
    constructor() {
        this.STORAGE_KEY = 'aquatracker-theme-override';
        this.MODES = ['light', 'dark', 'system'];
        this.currentMode = 'system';
        this.currentTheme = 'light';
        this.systemMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
        this.handleToggleClick = this.handleToggleClick.bind(this);
    }

    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'system';
        this.setMode(this.MODES.includes(savedTheme) ? savedTheme : 'system');
        this.bindToggleEvent();
        if (this.systemMedia) {
            this.systemMedia.addEventListener('change', this.handleSystemThemeChange);
        }
    }

    getSystemTheme() {
        return this.systemMedia?.matches ? 'dark' : 'light';
    }

    setMode(mode) {
        this.currentMode = this.MODES.includes(mode) ? mode : 'system';
        localStorage.setItem(this.STORAGE_KEY, this.currentMode);
        const appliedTheme = this.currentMode === 'system' ? this.getSystemTheme() : this.currentMode;
        this.applyTheme(appliedTheme);
        this.updateToggleState();
    }

    forceApplyTheme(theme) {
        this.setMode(this.MODES.includes(theme) ? theme : 'system');
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme-mode', this.currentMode);
        document.body.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme-mode', this.currentMode);

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
    }

    updateToggleState() {
        const toggle = document.querySelector('.theme-switch__checkbox');
        const switchEl = document.querySelector('.compact-theme-switch');
        const label = document.getElementById('theme-mode-label');
        if (toggle) toggle.checked = this.currentTheme === 'dark';
        if (switchEl) {
            switchEl.dataset.mode = this.currentMode;
            switchEl.title = `Theme: ${this.getModeLabel()}`;
            switchEl.setAttribute('aria-label', `Theme: ${this.getModeLabel()}`);
        }
        if (label) label.textContent = this.getModeLabel();
    }

    getModeLabel() {
        if (this.currentMode === 'system') return 'System';
        return this.currentMode === 'dark' ? 'Dark' : 'Light';
    }

    toggleTheme() {
        const currentIndex = this.MODES.indexOf(this.currentMode);
        this.setMode(this.MODES[(currentIndex + 1) % this.MODES.length]);
    }

    bindToggleEvent() {
        const switchEl = document.querySelector('.compact-theme-switch');
        if (switchEl) {
            switchEl.removeEventListener('click', this.handleToggleClick);
            switchEl.addEventListener('click', this.handleToggleClick);
            switchEl.setAttribute('role', 'button');
            switchEl.setAttribute('tabindex', '0');
            switchEl.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.toggleTheme();
                }
            });
        }
    }

    handleToggleClick(event) {
        event.preventDefault();
        this.toggleTheme();
    }

    handleSystemThemeChange() {
        if (this.currentMode === 'system') {
            this.applyTheme(this.getSystemTheme());
            this.updateToggleState();
        }
    }
}

const AQUATRACKER_CLOUD_CONFIG = {
    supabaseUrl: window.AQUATRACKER_ENV?.SUPABASE_URL || '',
    supabaseAnonKey: window.AQUATRACKER_ENV?.SUPABASE_ANON_KEY || '',
    vapidPublicKey: window.AQUATRACKER_ENV?.VAPID_PUBLIC_KEY || ''
};

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
        this.cloudSyncManager = new CloudSyncManager(this);
        this.pushNotificationManager = new PushNotificationManager(this);
        this.backupManager = new BackupManager(this);
        
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
            this.cloudSyncManager.init();
            
            // Initialize new features
            this.pushNotificationManager.init();
            this.backupManager.init();
            
        } catch (error) {
            
        }
    }

    loadInitialData() {
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
        
        
        // Notification toggle
        const notificationToggle = document.getElementById('notification-toggle');
        if (notificationToggle) {
            notificationToggle.addEventListener('click', () => this.toggleNotifications());
            
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

        const filtersSearchInput = document.getElementById('filters-search-input');
        if (filtersSearchInput) {
            filtersSearchInput.addEventListener('input', () => this.renderFiltersScreen());
        }

        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(item => item.classList.remove('active'));
                chip.classList.add('active');
                this.renderFiltersScreen();
            });
        });

        document.querySelectorAll('[data-jump-tab]').forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.jumpTab));
        });

        const homeAddFilter = document.getElementById('home-add-filter');
        if (homeAddFilter) homeAddFilter.addEventListener('click', () => this.showAddFilterModal());

        const filtersAddFilter = document.getElementById('filters-add-filter');
        if (filtersAddFilter) filtersAddFilter.addEventListener('click', () => this.showAddFilterModal());

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

        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => this.setCurrency(e.target.value));
        }

        const resetData = document.getElementById('reset-data');
        if (resetData) {
            resetData.addEventListener('click', () => this.resetAllData());
        }

        // Backup settings
        const backupFrequency = document.getElementById('backup-frequency');
        if (backupFrequency) {
            backupFrequency.addEventListener('change', (e) => {
                this.backupManager.setBackupSchedule(e.target.value);
            });
        }

        const manualBackup = document.getElementById('manual-backup');
        if (manualBackup) {
            manualBackup.addEventListener('click', () => this.backupManager.performBackup());
        }

        const viewBackupHistory = document.getElementById('view-backup-history');
        if (viewBackupHistory) {
            viewBackupHistory.addEventListener('click', () => this.showBackupHistory());
        }

        const cloudSignIn = document.getElementById('cloud-sign-in');
        if (cloudSignIn) {
            cloudSignIn.addEventListener('click', () => this.cloudSyncManager.signInFromUI());
        }

        const cloudSignUp = document.getElementById('cloud-sign-up');
        if (cloudSignUp) {
            cloudSignUp.addEventListener('click', () => this.cloudSyncManager.signUpFromUI());
        }

        const cloudSignOut = document.getElementById('cloud-sign-out');
        if (cloudSignOut) {
            cloudSignOut.addEventListener('click', () => this.cloudSyncManager.signOut());
        }

        const migrateCloudData = document.getElementById('migrate-cloud-data');
        if (migrateCloudData) {
            migrateCloudData.addEventListener('click', () => this.cloudSyncManager.migrateLocalData());
        }

        const restoreCloudData = document.getElementById('restore-cloud-data');
        if (restoreCloudData) {
            restoreCloudData.addEventListener('click', () => this.cloudSyncManager.restoreCloudData());
        }

        const subscribeCloudPush = document.getElementById('subscribe-cloud-push');
        if (subscribeCloudPush) {
            subscribeCloudPush.addEventListener('click', () => this.pushNotificationManager.subscribe());
        }

        const unsubscribeCloudPush = document.getElementById('unsubscribe-cloud-push');
        if (unsubscribeCloudPush) {
            unsubscribeCloudPush.addEventListener('click', () => this.pushNotificationManager.unsubscribe());
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

        const testNotification = document.getElementById('test-notification');
        if (testNotification) {
            testNotification.addEventListener('click', () => this.testNotification());
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
        
        
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                
                for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                    
                }
                
                // Also clear localStorage theme to reset completely
                localStorage.removeItem(this.themeController.STORAGE_KEY);
                
                this.showNiceModal('✅ Cache Cleared', 'The app will now reload with fresh files.');
                
                // Force reload
                window.location.reload(true);
            } else {
                this.showNiceModal('❌ Cache Unavailable', 'Cache API not available in this browser.');
            }
        } catch (error) {
            
            this.showNiceModal('❌ Cache Error', 'Error clearing cache. Try closing and reopening the app.');
        }
    }

    async checkForUpdates() {
        
        
        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Force service worker to check for updates
                navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
                
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    
                }
                
                this.showNiceModal('✅ Update Complete', 'Update check complete! If theme switching still doesn\'t work, try "Clear Cache & Refresh".');
            } else {
                this.showNiceModal('❌ Service Worker Error', 'Service worker not available. Try refreshing the page.');
            }
        } catch (error) {
            
            this.showNiceModal('❌ Update Error', 'Error checking for updates.');
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
        if (confirmCancel) confirmCancel.addEventListener('click', () => {
            this.pendingConfirmCallback = null;
            this.closeModal('confirm-modal');
        });

        const notificationEnable = document.getElementById('notification-enable');
        const notificationCancel = document.getElementById('notification-cancel');
        const resetPermission = document.getElementById('reset-permission');
        
        // Show reset button if permission is already granted
        if (Notification.permission === 'granted') {
            resetPermission.style.display = 'inline-block';
        }
        
        if (notificationEnable) {
            
            notificationEnable.addEventListener('click', (e) => {
                
                this.enableNotifications();
            });
        } else {
            
        }
        
        if (notificationCancel) {
            notificationCancel.addEventListener('click', () => this.closeModal('notification-modal'));
        }
        
        if (resetPermission) {
            resetPermission.addEventListener('click', () => this.resetNotificationPermission());
        }

        // Generic modal events
        const genericModalClose = document.getElementById('generic-modal-close');
        const genericModalOk = document.getElementById('generic-modal-ok');
        
        if (genericModalClose) {
            genericModalClose.addEventListener('click', () => this.closeModal('generic-modal'));
        }
        
        if (genericModalOk) {
            genericModalOk.addEventListener('click', () => this.closeModal('generic-modal'));
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    showNiceModal(title, message) {
        const modal = document.getElementById('generic-modal');
        const titleElement = document.getElementById('generic-modal-title');
        const bodyElement = document.getElementById('generic-modal-body');
        
        if (modal && titleElement && bodyElement) {
            titleElement.textContent = title;
            bodyElement.innerHTML = `<p>${message}</p>`;
            modal.style.display = 'flex';
        }
    }

    showConfirmModal(message, callback) {
        const modal = document.getElementById('confirm-modal');
        const messageElement = document.getElementById('confirm-message');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            this.pendingConfirmCallback = callback;
            this.showModal('confirm-modal');
        }
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
        
        
    }

    formatCurrency(amount) {
        const value = Number(amount) || 0;
        const formatted = value.toLocaleString('en-US', {
            minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
            maximumFractionDigits: 2
        });
        const codes = {
            USD: 'USD',
            EUR: 'EUR',
            GBP: 'GBP',
            CAD: 'CAD',
            EGP: 'EGP'
        };
        return `${codes[this.currency] || this.currency} ${formatted}`;
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

    async enableNotifications() {
        
        // Check current permission state first
        const currentPermission = Notification.permission;
        
        
        if ('Notification' in window) {
            try {
                if (currentPermission === 'default') {
                    
                    // Request browser notification permission first
                    const permission = await Notification.requestPermission();
                    
                    
                    if (permission === 'granted') {
                        
                        localStorage.setItem('notifications-enabled', 'true');
                        this.updateNotificationIcon(true);
                        this.closeModal('notification-modal');
                        
                        // Test notification immediately
                        
                        new Notification('🔔 AquaTracker', {
                            body: 'Notifications enabled! You\'ll get reminders for your water filters.'
                        });
                        
                        // Try to enable push notifications
                        try {
                            await this.pushNotificationManager.subscribe();
                            
                            // Test reminder check
                            setTimeout(() => {
                                this.pushNotificationManager.checkAndScheduleReminders();
                            }, 1000);
                            
                        } catch (pushError) {
                            
                        }
                    } else if (permission === 'denied') {
                        
                        this.showPermissionDeniedState();
                    }
                } else if (currentPermission === 'granted') {
                    
                    localStorage.setItem('notifications-enabled', 'true');
                    this.updateNotificationIcon(true);
                    this.closeModal('notification-modal');
                    
                    // Test notification immediately
                    
                    new Notification('🔔 AquaTracker', {
                            body: 'Notifications already enabled! You’ll get reminders for your water filters.'
                        });
                    
                    // Try to enable push notifications
                    try {
                        await this.pushNotificationManager.subscribe();
                        
// ... (rest of the code remains the same)
                        // Test reminder check
                        setTimeout(() => {
                            this.pushNotificationManager.checkAndScheduleReminders();
                        }, 1000);
                        
                    } catch (pushError) {
                        
                    }
                } else if (currentPermission === 'denied') {
                    
                    this.showPermissionDeniedState();
                }
            } catch (error) {
                
                this.showNiceModal(' Enable Error', 'Failed to enable notifications. Please check your browser settings.');
            }
        } else {
            this.showNiceModal(' Not Supported', 'Notifications are not supported in this browser.');
        }
    }

    showPermissionDeniedState() {
        // Show reset permission button
        const resetBtn = document.getElementById('reset-permission');
        if (resetBtn) {
            resetBtn.style.display = 'inline-block';
        }
        
        // Update modal content to show permission denied state
        const modalBody = document.querySelector('#notification-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <p style="color: var(--danger-color); font-weight: bold; margin-bottom: 1rem;">
                    ❌ Notifications were blocked
                </p>
                <p>To enable notifications for AquaTracker:</p>
                <ol style="margin-left: 1.5rem; line-height: 1.8;">
                    <li>Click the 🔔 icon in your browser's address bar</li>
                    <li>Select "Allow" when prompted</li>
                    <li>Or go to browser settings > Privacy > Notifications</li>
                    <li>Refresh this page and try again</li>
                </ol>
                <p style="margin-top: 1rem;">
                    <strong>💡 Tip:</strong> Some browsers permanently block notifications after multiple denials. Use the "Reset Permission" button below to clear the blocked state.
                </p>
            `;
        }
    }

    resetNotificationPermission() {
        
        
        // Clear local storage
        localStorage.removeItem('notifications-enabled');
        this.updateNotificationIcon(false);
        
        // Clear service worker registration if exists
        if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                    
                });
            });
        }
        
        // Show instructions using modal instead of alert
        this.showNiceModal('🔄 Permission Reset Complete!', `To test notifications again:
1. ${this.getBrowserSpecificInstructions()}
2. Refresh the page
3. Click the notification button to try again

Note: Some browsers may require you to clear site data completely.`);
        
        this.closeModal('notification-modal');
    }
    
    getBrowserSpecificInstructions() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('chrome')) {
            return 'Click lock icon (🔒) in address bar → Site settings → Notifications → Reset';
        } else if (userAgent.includes('firefox')) {
            return 'Click lock icon (🔒) in address bar → Permissions → Notifications → Remove';
        } else if (userAgent.includes('safari')) {
            return 'Safari → Preferences → Websites → Notifications → Remove this site';
        } else if (userAgent.includes('edge')) {
            return 'Click lock icon (🔒) in address bar → Site permissions → Notifications → Reset';
        }
        
        return 'Go to browser settings → Privacy/Security → Site permissions → Notifications';
    }

    disableNotifications() {
        localStorage.setItem('notifications-enabled', 'false');
        this.updateNotificationIcon(false);
    }

    updateNotificationIcon(enabled) {
        const icon = document.querySelector('.notification-icon');
        if (icon) {
            if (enabled) {
                icon.classList.add('enabled');
            } else {
                icon.classList.remove('enabled');
            }
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

        if (tabName === 'dashboard') {
            this.renderFilters();
        } else if (tabName === 'filters') {
            this.renderFiltersScreen();
        } else if (tabName === 'history') {
            this.renderHistory();
        } else if (tabName === 'statistics') {
            this.renderStatistics();
        }
    }

    // Filter Management
    renderFilters() {
        const grid = document.getElementById('filters-grid');
        if (!grid) return;

        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const filteredFilters = this.filters.filter(filter => 
            filter.name.toLowerCase().includes(searchTerm) ||
            filter.location.toLowerCase().includes(searchTerm) ||
            filter.type.toLowerCase().includes(searchTerm)
        );

        this.renderSystemOverview();

        if (filteredFilters.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">AT</div>
                    <h3>No stages found</h3>
                    <p>Try adjusting your search or add a new filter stage.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredFilters.map(filter => this.createFilterCard(filter)).join('');
        this.bindFilterCardActions(grid, '.filter-card');
    }

    renderSystemOverview() {
        const stageMap = document.getElementById('system-stage-map');
        const attentionList = document.getElementById('attention-list');
        const previewList = document.getElementById('home-filter-preview');
        if (!stageMap || !attentionList) return;

        const filters = this.sortedFilters();
        const stats = this.calculateStats();
        const healthScore = document.getElementById('system-health-score');
        const healthCaption = document.getElementById('system-health-caption');
        const healthCard = document.getElementById('system-health-card');
        const summary = document.getElementById('system-summary-text');

        if (healthScore) {
            healthScore.textContent = stats.overdue ? `${stats.overdue} filter${stats.overdue === 1 ? ' needs' : 's need'} replacement` : stats.dueSoon ? `${stats.dueSoon} due soon` : 'All filters healthy';
        }
        if (healthCaption) healthCaption.textContent = stats.overdue ? `${stats.overdue} stage${stats.overdue === 1 ? ' needs' : 's need'} replacement` : 'All active stages are on track';
        if (healthCard) healthCard.dataset.status = stats.overdue ? 'overdue' : stats.dueSoon ? 'due-soon' : 'good';
        if (summary) {
            if (!filters.length) {
                summary.textContent = 'Add your first filter stage to start tracking the system.';
            } else if (stats.overdue) {
                summary.textContent = 'Your water system needs attention. Replace overdue filters to keep water quality stable.';
            } else if (stats.dueSoon) {
                summary.textContent = 'Plan purchases now so replacement day does not sneak up on you.';
            } else {
                summary.textContent = 'Your system is on schedule. Keep monitoring replacement dates.';
            }
        }

        if (!filters.length) {
            stageMap.innerHTML = '<div class="empty-inline">No stages yet</div>';
            attentionList.innerHTML = '<div class="attention-empty"><strong>No urgent actions</strong><span>Add filters to begin tracking.</span></div>';
            if (previewList) previewList.innerHTML = '';
            return;
        }

        stageMap.innerHTML = filters.map(filter => this.createStageDot(filter)).join('');
        this.bindFilterCardActions(stageMap, '.stage-dot');

        const priority = filters
            .map(filter => ({ filter, status: this.getFilterStatus(filter), days: this.getDaysUntilDue(filter.nextDueDate) }))
            .filter(item => item.status !== 'good')
            .sort((a, b) => a.days - b.days)
            .slice(0, 3);

        attentionList.innerHTML = priority.length ? priority.map(item => this.createAttentionItem(item)).join('') : `
            <div class="attention-empty">
                <strong>No urgent actions</strong>
                <span>Your system is currently on schedule.</span>
            </div>
        `;
        this.bindFilterCardActions(attentionList, '.attention-item');

        if (previewList) {
            previewList.innerHTML = filters.slice(0, 4).map(filter => this.createFilterRow(filter, { compact: true })).join('');
            this.bindFilterCardActions(previewList, '.filter-row');
        }
    }

    renderFiltersScreen() {
        const list = document.getElementById('filters-list');
        if (!list) return;

        const query = document.getElementById('filters-search-input')?.value.toLowerCase().trim() || '';
        const activeChip = document.querySelector('.filter-chip.active')?.dataset.filterStatus || 'all';
        let filters = this.sortedFilters().filter(filter => {
            const matchesSearch = !query || [filter.name, filter.type, filter.stage, filter.location].some(value => String(value || '').toLowerCase().includes(query));
            const status = this.getFilterStatus(filter);
            const matchesStatus = activeChip === 'all' || status === activeChip;
            return matchesSearch && matchesStatus;
        });

        if (!filters.length) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">AT</div>
                    <h3>No filters found</h3>
                    <p>Try another search or status filter.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = filters.map(filter => this.createFilterRow(filter)).join('');
        this.bindFilterCardActions(list, '.filter-row');
    }

    sortedFilters() {
        return [...this.filters].sort((a, b) => this.getStageNumber(a) - this.getStageNumber(b));
    }

    bindFilterCardActions(root, selector) {
        root.querySelectorAll(selector).forEach(card => {
            const filterId = card.dataset.filterId;
            if (!filterId) return;

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
    }

    createStageDot(filter) {
        const status = this.getFilterStatus(filter);
        const stageNumber = this.getStageNumber(filter) || '?';
        const label = this.getStageShortLabel(filter);
        return `
            <button class="stage-dot ${status}" data-filter-id="${filter.id}" type="button" aria-label="${filter.name} ${this.getStatusText(status, this.getDaysUntilDue(filter.nextDueDate))}">
                <span>${stageNumber}</span>
                <small>${label}</small>
            </button>
        `;
    }

    createAttentionItem({ filter, status, days }) {
        return `
            <article class="attention-item ${status}" data-filter-id="${filter.id}">
                <div class="stage-badge ${status}">${this.getStageNumber(filter) || 'F'}</div>
                <div class="attention-copy">
                    <h4>${filter.name}</h4>
                    <p>${this.getShortStatusText(status, days)} - due ${this.formatDate(filter.nextDueDate)}</p>
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary btn-sm replace-btn" type="button">Replace</button>
                </div>
            </article>
        `;
    }

    createFilterRow(filter, options = {}) {
        const status = this.getFilterStatus(filter);
        const daysUntilDue = this.getDaysUntilDue(filter.nextDueDate);
        const progress = this.getFilterProgress(filter, daysUntilDue);
        const compactClass = options.compact ? ' compact' : '';
        return `
            <article class="filter-row ${status}${compactClass}" data-filter-id="${filter.id}">
                <div class="stage-badge ${status}">${this.getStageNumber(filter) || 'F'}</div>
                <div class="filter-row-main">
                    <div class="filter-row-title">
                        <h4>${filter.name}</h4>
                        <span class="status-chip ${status}">${this.getShortStatusText(status, daysUntilDue)}</span>
                    </div>
                    <p>${filter.stage || filter.type} - ${filter.type}</p>
                    <div class="mini-progress" aria-label="Filter lifecycle progress">
                        <span style="width: ${progress}%"></span>
                    </div>
                    <small>${this.getStatusText(status, daysUntilDue)} - ${this.formatDate(filter.nextDueDate)}</small>
                </div>
                <span class="chevron" aria-hidden="true"></span>
            </article>
        `;
    }

    createFilterCard(filter) {
        return this.createFilterRow(filter);
    }

    getFilterProgress(filter, daysUntilDue) {
        const lifetime = Math.max(1, Number(this.cloudSyncManager?.expectedLifetimeDays?.(filter)) || (Number(filter.replacementInterval) || 1) * 30);
        const used = Math.max(0, lifetime - Math.max(0, daysUntilDue));
        if (daysUntilDue < 0) return 100;
        return Math.min(100, Math.max(4, Math.round((used / lifetime) * 100)));
    }

    getStageShortLabel(filter) {
        const type = String(filter.type || filter.name || '').toUpperCase();
        if (type.includes('SED')) return 'SED';
        if (type.includes('CARBON BLOCK')) return 'CTO';
        if (type.includes('CARBON')) return 'CARB';
        if (type.includes('RO')) return 'RO';
        if (type.includes('POST')) return 'POST';
        if (type.includes('MIN')) return 'MIN';
        if (type.includes('ALK')) return 'ALK';
        if (type.includes('UV')) return 'UV';
        return type.slice(0, 4) || 'FLT';
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
                return daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} days`;
            case 'good':
                return `${daysUntilDue} days remaining`;
            default:
                return 'Unknown';
        }
    }

    getShortStatusText(status, daysUntilDue) {
        switch (status) {
            case 'overdue':
                return `${Math.abs(daysUntilDue)}d overdue`;
            case 'due-soon':
                return daysUntilDue === 0 ? 'Due today' : `${daysUntilDue}d left`;
            case 'good':
                return 'Healthy';
            default:
                return 'Unknown';
        }
    }

    getStageNumber(filter) {
        const fromStage = String(filter.stage || '').match(/\d+/);
        if (fromStage) return Number(fromStage[0]);
        const fromId = String(filter.id || '').match(/\d+/);
        return fromId ? Number(fromId[0]) : 0;
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
        }
        if (this.pendingConfirmCallback) {
            this.pendingConfirmCallback();
            this.pendingConfirmCallback = null;
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

        this.showNiceModal('Filter Replaced', `✅ ${filter.name} marked as replaced! Next due: ${this.formatDate(filter.nextDueDate)}`);
        this.cloudSyncManager?.markFilterReplaced(filter, this.history[0]);
        
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
                
            }
        } else {
            filterData.id = 'filter-' + Date.now();
            this.filters.push(filterData);
            
        }

        this.saveData();
        this.updateStats();
        this.renderFilters();
        this.closeModal('filter-modal');
    }

    searchFilters(searchTerm) {
        
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
        this.showConfirmModal('Are you sure you want to clear all history? This cannot be undone.', () => {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
        });
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
        this.cloudSyncManager?.queueFiltersSync();
        
    }

    saveHistory() {
        localStorage.setItem('filterHistory', JSON.stringify(this.history));
        this.cloudSyncManager?.queueHistorySync();
        
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
            metadata: {
                timestamp: new Date().toISOString(),
                exported: new Date().toISOString(),
                version: '3.1.0',
                type: 'manual',
                checksum: this.backupManager.calculateChecksum()
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquatracker-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        
        
        // Show success notification
        new Notification('📤 AquaTracker', {
            body: 'Data exported successfully! Save this file in a safe location.'
        });
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                this.showConfirmModal('This will replace all current data. Are you sure?', async () => {
                    // Use backup manager to restore data with validation
                    await this.backupManager.restoreFromBackup(data);
                    
                    this.showNiceModal('Import Complete', 'Data imported successfully. All filters and history have been restored.');
                });
            } catch (error) {
                this.showNiceModal('Import Error', error.message || 'Invalid file format. Please select a valid AquaTracker backup file.');
                
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }

    confirmResetData() {
        this.showConfirmModal('⚠️ This will delete all filters, history, notification settings, and preferences. This cannot be undone. Are you sure?', () => {
            this.showConfirmModal('🚨 Are you absolutely sure? This will permanently delete everything including all advanced notification configurations.', () => {
                localStorage.clear();
                location.reload();
            });
        });
    }

    // PWA Features
    initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    
                    
                    // Wait for service worker to be active
                    if (registration.active) {
                        
                    } else if (registration.installing) {
                        registration.installing.addEventListener('statechange', () => {
                            if (registration.installing && registration.installing.state === 'activated') {
                                
                            }
                        });
                    }
                })
                .catch(error => {
                    
                });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPromptEvent = e;
            this.showInstallPrompt();
        });

        // Listen for messages from service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                const { type } = event.data;
                
                if (type === 'GET_FILTERS') {
                    // Send filters back to service worker
                    event.ports[0].postMessage({
                        type: 'FILTERS_DATA',
                        filters: this.filters
                    });
                }
            });
        }

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

    showBackupHistory() {
        const history = this.backupManager.backupHistory;
        
        if (history.length === 0) {
            this.showNiceModal('Backup History', 'No backup history available yet.');
            return;
        }
        
        let historyText = 'Backup History:\n\n';
        history.forEach((backup, index) => {
            const date = new Date(backup.timestamp);
            const sizeKB = (backup.size / 1024).toFixed(2);
            historyText += `${index + 1}. ${date.toLocaleString()} - ${backup.type} - ${sizeKB} KB\n`;
        });
        
        this.showNiceModal('Backup History', historyText);
    }

    resetNotificationPermission() {
        
        
        // Clear the existing permission state
        localStorage.removeItem('notifications-enabled');
        this.updateNotificationIcon(false);
        
        // Show instructions for manual reset
        const instructions = `To reset notification permissions:

1. Click the 🔔 icon in your browser's address bar
2. Click "Remove" or "Block" 
3. Refresh the page
4. Try enabling notifications again

This will clear the blocked state and allow you to try again.`;
        
        this.showNiceModal('Reset Notification Permission', instructions);
        this.closeModal('notification-modal');
    }

    testNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('🔔 AquaTracker Test', {
                    body: 'This is a test notification! Your notifications are working correctly.',
                    tag: 'test-notification',
                    requireInteraction: false
                });
                
                // Also test reminder scheduling
                setTimeout(() => {
                    this.pushNotificationManager.checkAndScheduleReminders();
                }, 1000);
                
            } else {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.testNotification();
                    } else {
                        this.showNiceModal('Notifications Disabled', 'Please enable notifications in your browser settings to test notifications.');
                    }
                });
            }
        } else {
            this.showNiceModal('Not Supported', 'Notifications are not supported in this browser.');
        }
    }

    installPWA() {
        if (this.installPromptEvent) {
            this.installPromptEvent.prompt();
            this.installPromptEvent.userChoice.then((result) => {
                if (result.outcome === 'accepted') {
                    
                }
                this.installPromptEvent = null;
                this.dismissInstallPrompt();
            });
        }
    }
}

// Cloud Sync Manager - keeps existing localStorage backups intact while adding Supabase sync
class CloudSyncManager {
    constructor(app) {
        this.app = app;
        this.client = null;
        this.session = null;
        this.syncTimer = null;
        this.historySyncTimer = null;
        this.configKey = 'aquatracker-cloud-config';
        this.statusKey = 'aquatracker-cloud-status';
    }

    init() {
        this.populateConfigUI();
        this.updateStatus(localStorage.getItem(this.statusKey) || 'Cloud sync not configured. Local backups remain active.');
        if (this.isConfigured()) {
            this.restoreSession().catch(() => this.updateAuthStatus(null));
        } else {
            this.updateAuthStatus(null);
        }
    }

    getConfig() {
        return {
            supabaseUrl: AQUATRACKER_CLOUD_CONFIG.supabaseUrl,
            supabaseAnonKey: AQUATRACKER_CLOUD_CONFIG.supabaseAnonKey,
            vapidPublicKey: AQUATRACKER_CLOUD_CONFIG.vapidPublicKey
        };
    }

    isConfigured() {
        const config = this.getConfig();
        return Boolean(config.supabaseUrl && config.supabaseAnonKey && config.vapidPublicKey);
    }

    populateConfigUI() {
        const status = document.getElementById('cloud-config-status');
        if (!status) return;
        const config = this.getConfig();
        const missing = [];
        if (!config.supabaseUrl) missing.push('Supabase URL');
        if (!config.supabaseAnonKey) missing.push('anon key');
        if (!config.vapidPublicKey) missing.push('VAPID public key');
        status.textContent = missing.length ? `Missing ${missing.join(', ')} in config.js` : 'Loaded from config.js';
    }

    saveConfigFromUI() {
        this.showConfigInstructions();
    }

    showConfigInstructions() {
        this.app.showNiceModal('Cloud Config', 'Public browser values load from config.js. Keep VAPID private key, service role key, and cron secret in Supabase secrets.');
    }

    readAuthFields() {
        const email = document.getElementById('cloud-email')?.value.trim() || '';
        const password = document.getElementById('cloud-password')?.value || '';
        if (!email || !password) {
            throw new Error('Enter your email and password first.');
        }
        return { email, password };
    }

    updateAuthStatus(user) {
        const status = document.getElementById('cloud-auth-status');
        if (status) status.textContent = user?.email ? `Signed in as ${user.email}` : 'Not signed in';
    }

    async restoreSession() {
        const client = await this.getClient();
        const { data } = await client.auth.getSession();
        this.session = data.session;
        this.updateAuthStatus(this.session?.user || null);
        if (this.session?.user) {
            await this.ensureProfile(this.session.user);
            this.updateStatus('Cloud account ready. Local data remains on this device until you sync it.');
        }
        client.auth.onAuthStateChange((_event, session) => {
            this.session = session;
            this.updateAuthStatus(session?.user || null);
        });
        return this.session;
    }

    async signInFromUI() {
        try {
            const { email, password } = this.readAuthFields();
            const client = await this.getClient();
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            this.session = data.session;
            await this.ensureProfile(data.user);
            this.updateAuthStatus(data.user);
            this.updateStatus('Signed in. You can now sync local data or enable server push.');
        } catch (error) {
            this.updateStatus(`Sign in failed: ${error.message}`);
            this.app.showNiceModal('Sign In Failed', error.message);
        }
    }

    async signUpFromUI() {
        try {
            const { email, password } = this.readAuthFields();
            const client = await this.getClient();
            const { data, error } = await client.auth.signUp({ email, password });
            if (error) throw error;
            this.session = data.session;
            if (data.user) await this.ensureProfile(data.user);
            this.updateAuthStatus(data.user || null);
            this.updateStatus(data.session ? 'Account created and signed in.' : 'Account created. Check your email if confirmation is required, then sign in.');
        } catch (error) {
            this.updateStatus(`Account creation failed: ${error.message}`);
            this.app.showNiceModal('Account Creation Failed', error.message);
        }
    }

    async signOut() {
        try {
            const client = await this.getClient();
            await client.auth.signOut();
            this.session = null;
            this.updateAuthStatus(null);
            this.updateStatus('Signed out of cloud sync. Local data is still available.');
        } catch (error) {
            this.updateStatus(`Sign out failed: ${error.message}`);
        }
    }

    async ensureProfile(user) {
        if (!user) throw new Error('Sign in before using cloud sync.');
        const client = await this.getClient();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        await client.schema('aquatracker').from('profiles').upsert({ id: user.id, email: user.email || null, timezone }, { onConflict: 'id' });
        await client.schema('aquatracker').from('notification_preferences').upsert({ user_id: user.id, push_enabled: true }, { onConflict: 'user_id' });
    }

    updateStatus(message) {
        localStorage.setItem(this.statusKey, message);
        const status = document.getElementById('cloud-sync-status');
        if (status) status.textContent = message;
    }

    async loadSupabaseSDK() {
        if (window.supabase?.createClient) return;
        await new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-supabase-sdk]');
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.defer = true;
            script.dataset.supabaseSdk = 'true';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async getClient() {
        if (this.client) return this.client;
        const config = this.getConfig();
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            throw new Error('Cloud sync is not configured.');
        }
        await this.loadSupabaseSDK();
        this.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
            auth: { persistSession: true, autoRefreshToken: true }
        });
        return this.client;
    }

    async ensureUser() {
        const client = await this.getClient();
        const { data } = await client.auth.getSession();
        const session = data.session || this.session;
        if (!session?.user) {
            this.updateAuthStatus(null);
            throw new Error('Sign in before using cloud sync or server push.');
        }
        this.session = session;
        await this.ensureProfile(session.user);
        this.updateAuthStatus(session.user);
        return session.user;
    }

    expectedLifetimeDays(filter) {
        if (filter.installDate && filter.nextDueDate) {
            const start = Date.parse(`${filter.installDate}T00:00:00`);
            const end = Date.parse(`${filter.nextDueDate}T00:00:00`);
            if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
                return Math.max(1, Math.round((end - start) / 86400000));
            }
        }
        return Math.max(1, Math.round((Number(filter.replacementInterval) || 1) * 30.4375));
    }

    filterPayload(filter, userId) {
        const settings = filter.notificationSettings || {};
        return {
            user_id: userId,
            legacy_local_id: filter.id,
            name: filter.name,
            location: filter.location || null,
            stage: filter.stage || null,
            filter_type: filter.type || 'Other',
            brand: filter.brand || null,
            model: filter.model || null,
            installed_date: filter.installDate,
            expected_lifetime_days: this.expectedLifetimeDays(filter),
            replacement_interval_months: Number(filter.replacementInterval) || null,
            expected_replacement_date: filter.nextDueDate,
            purchase_reminder_lead_days: Number(settings.buyReminder?.timing ?? 14),
            replacement_status: filter.isActive === false ? 'disabled' : 'active',
            last_replaced_date: filter.lastReplacedDate || null,
            cost: Number(filter.cost) || 0,
            notes: filter.notes || null,
            reminders_enabled: settings.buyReminder?.enabled !== false || settings.replaceReminder?.enabled !== false || settings.criticalReminder?.enabled === true,
            notification_settings: settings
        };
    }

    async migrateLocalData() {
        try {
            this.updateStatus('Creating a local backup before cloud migration...');
            await this.app.backupManager.performBackup();
            const user = await this.ensureUser();
            const client = await this.getClient();

            const filterPayloads = this.app.filters.map(filter => this.filterPayload(filter, user.id));
            if (filterPayloads.length) {
                const { data, error } = await client
                    .schema('aquatracker').from('filters')
                    .upsert(filterPayloads, { onConflict: 'user_id,legacy_local_id' })
                    .select('id, legacy_local_id');
                if (error) throw error;
                const cloudIds = new Map((data || []).map(row => [row.legacy_local_id, row.id]));
                this.app.filters.forEach(filter => {
                    if (cloudIds.has(filter.id)) filter.cloudId = cloudIds.get(filter.id);
                });
                localStorage.setItem('waterFilters', JSON.stringify(this.app.filters));
            }

            await this.syncHistoryNow(user.id);
            this.updateStatus(`Cloud migration complete: ${this.app.filters.length} filters and ${this.app.history.length} history rows synced.`);
        } catch (error) {
            this.updateStatus(`Cloud migration failed: ${error.message}`);
            throw error;
        }
    }

    cloudFilterToLocal(row) {
        const settings = row.notification_settings || {};
        const intervalMonths = Number(row.replacement_interval_months) || Math.max(1, Math.round((Number(row.expected_lifetime_days) || 30) / 30.4375));
        return {
            id: row.legacy_local_id || `cloud-${row.id}`,
            cloudId: row.id,
            name: row.name,
            location: row.location || '',
            stage: row.stage || '',
            type: row.filter_type || 'Other',
            brand: row.brand || '',
            model: row.model || '',
            installDate: row.installed_date,
            replacementInterval: intervalMonths,
            nextDueDate: row.expected_replacement_date,
            cost: Number(row.cost) || 0,
            notes: row.notes || '',
            isActive: row.replacement_status !== 'disabled',
            lastReplacedDate: row.last_replaced_date || null,
            notificationSettings: {
                buyReminder: {
                    enabled: settings.buyReminder?.enabled ?? row.reminders_enabled !== false,
                    timing: Number(settings.buyReminder?.timing ?? row.purchase_reminder_lead_days ?? 14),
                    frequency: settings.buyReminder?.frequency || 'weekly',
                    time: settings.buyReminder?.time || '09:00',
                    stopDays: Number(settings.buyReminder?.stopDays ?? 7)
                },
                replaceReminder: {
                    enabled: settings.replaceReminder?.enabled ?? row.reminders_enabled !== false,
                    timing: Number(settings.replaceReminder?.timing ?? 1),
                    frequency: settings.replaceReminder?.frequency || 'daily',
                    time: settings.replaceReminder?.time || '10:00',
                    overdueEscalation: settings.replaceReminder?.overdueEscalation || 'every-2-hours'
                },
                criticalReminder: {
                    enabled: settings.criticalReminder?.enabled ?? false,
                    threshold: Number(settings.criticalReminder?.threshold ?? 14),
                    frequency: settings.criticalReminder?.frequency || 'hourly'
                }
            }
        };
    }

    cloudHistoryToLocal(row, filterIdByCloudId) {
        return {
            id: row.legacy_local_id || `cloud-history-${row.id}`,
            filterId: filterIdByCloudId.get(row.filter_id) || null,
            filterName: row.filter_name || 'Filter',
            date: row.replaced_on,
            cost: Number(row.cost) || 0,
            notes: row.notes || '',
            type: row.log_type || 'replacement'
        };
    }

    async restoreCloudData() {
        try {
            const confirmed = await new Promise(resolve => {
                this.app.showConfirmModal('Restore cloud data onto this device? A local backup will be created first, then current local filters and history will be replaced.', () => resolve(true));
            });
            if (!confirmed) return;
            this.updateStatus('Creating a local backup before cloud restore...');
            await this.app.backupManager.performBackup();
            const user = await this.ensureUser();
            const client = await this.getClient();

            this.updateStatus('Downloading filters and history from cloud...');
            const filtersResult = await client
                .schema('aquatracker').from('filters')
                .select('*')
                .eq('user_id', user.id)
                .order('stage', { ascending: true });
            if (filtersResult.error) throw filtersResult.error;

            const cloudFilters = filtersResult.data || [];
            const localFilters = cloudFilters.map(row => this.cloudFilterToLocal(row));
            const filterNameByCloudId = new Map(cloudFilters.map(row => [row.id, row.name]));
            const filterIdByCloudId = new Map(localFilters.map(filter => [filter.cloudId, filter.id]));

            const historyResult = await client
                .schema('aquatracker').from('filter_replacement_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('replaced_on', { ascending: false });
            if (historyResult.error) throw historyResult.error;

            const localHistory = (historyResult.data || []).map(row => ({
                ...this.cloudHistoryToLocal(row, filterIdByCloudId),
                filterName: filterNameByCloudId.get(row.filter_id) || 'Filter'
            }));

            this.app.filters = localFilters;
            this.app.history = localHistory;
            this.app.saveData();
            this.app.saveHistory();
            this.app.updateStats();
            this.app.renderFilters();
            if (this.app.currentTab === 'history') this.app.renderHistory();
            if (this.app.currentTab === 'statistics') this.app.renderStatistics();

            this.updateStatus(`Cloud restore complete: ${localFilters.length} filters and ${localHistory.length} history rows restored to this device.`);
            this.app.showNiceModal('Cloud Restore Complete', `${localFilters.length} filters and ${localHistory.length} history rows were restored to this device. A local backup was created first.`);
        } catch (error) {
            this.updateStatus(`Cloud restore failed: ${error.message}`);
            this.app.showNiceModal('Cloud Restore Failed', error.message);
        }
    }

    queueFiltersSync() {
        if (!this.isConfigured()) return;
        clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => this.syncFiltersNow().catch(error => this.updateStatus(`Filter cloud sync failed: ${error.message}`)), 1200);
    }

    queueHistorySync() {
        if (!this.isConfigured()) return;
        clearTimeout(this.historySyncTimer);
        this.historySyncTimer = setTimeout(() => this.syncHistoryNow().catch(error => this.updateStatus(`History cloud sync failed: ${error.message}`)), 1200);
    }

    async syncFiltersNow() {
        const user = await this.ensureUser();
        const client = await this.getClient();
        const payloads = this.app.filters.map(filter => this.filterPayload(filter, user.id));
        if (!payloads.length) return;
        const { data, error } = await client.schema('aquatracker').from('filters').upsert(payloads, { onConflict: 'user_id,legacy_local_id' }).select('id, legacy_local_id');
        if (error) throw error;
        const cloudIds = new Map((data || []).map(row => [row.legacy_local_id, row.id]));
        this.app.filters.forEach(filter => {
            if (cloudIds.has(filter.id)) filter.cloudId = cloudIds.get(filter.id);
        });
        localStorage.setItem('waterFilters', JSON.stringify(this.app.filters));
        this.updateStatus('Filters synced to cloud. Local copy preserved.');
    }

    async syncHistoryNow(existingUserId) {
        const user = existingUserId ? { id: existingUserId } : await this.ensureUser();
        const client = await this.getClient();
        const filterRows = await client.schema('aquatracker').from('filters').select('id, legacy_local_id').eq('user_id', user.id);
        if (filterRows.error) throw filterRows.error;
        const filterIdByLegacy = new Map((filterRows.data || []).map(row => [row.legacy_local_id, row.id]));
        const payloads = this.app.history.map(item => ({
            user_id: user.id,
            filter_id: filterIdByLegacy.get(item.filterId) || null,
            legacy_local_id: item.id,
            replaced_on: item.date,
            cost: Number(item.cost) || 0,
            notes: item.notes || null,
            log_type: item.type || 'replacement'
        }));
        if (!payloads.length) return;
        const { error } = await client.schema('aquatracker').from('filter_replacement_logs').upsert(payloads, { onConflict: 'user_id,legacy_local_id' });
        if (error) throw error;
        this.updateStatus('Replacement history synced to cloud. Local copy preserved.');
    }

    async markFilterReplaced(filter, historyItem) {
        if (!this.isConfigured()) return;
        try {
            await this.syncFiltersNow();
            await this.syncHistoryNow();
            this.updateStatus(`Cloud reminders reset for ${filter.name}.`);
        } catch (error) {
            this.updateStatus(`Cloud replacement reset failed: ${error.message}`);
        }
    }

    async getAccessToken() {
        const client = await this.getClient();
        const { data } = await client.auth.getSession();
        const token = data.session?.access_token || this.session?.access_token;
        if (!token) throw new Error('Missing cloud auth token.');
        return token;
    }
}
// Push Notification Manager Class
class PushNotificationManager {
    constructor(app) {
        this.app = app; // Reference to parent AquaTracker instance
        this.subscription = null;
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        // Remove VAPID requirement for browser notifications
        this.usePushNotifications = false;
    }

    async init() {
        if (!this.isSupported) {
            
            this.usePushNotifications = false;
            return;
        }

        try {
            // Register service worker for push notifications
            const registration = await navigator.serviceWorker.ready;
            
            // Check existing subscription
            this.subscription = await registration.pushManager.getSubscription();
            
            if (this.subscription) {
                
                this.usePushNotifications = true;
                this.updateUI(true);
            } else {
                
                this.usePushNotifications = false;
                this.updateUI(false);
            }

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event);
            });

        } catch (error) {
            
            this.usePushNotifications = false;
        }
    }

    async subscribe() {
        if (!this.isSupported) {
            this.app.showNiceModal('Push Not Supported', 'This browser does not support Web Push. In-app reminders and local backups still work.');
            return false;
        }

        if (!this.app.cloudSyncManager.isConfigured()) {
            this.app.showNiceModal('Cloud Setup Required', 'Add your Supabase URL, anon key, and VAPID public key in Settings before enabling server-side push.');
            return false;
        }

        try {
            const permission = Notification.permission === 'granted'
                ? 'granted'
                : await Notification.requestPermission();

            if (permission !== 'granted') {
                this.app.showNiceModal('Notifications Disabled', 'Browser notification permission is required for server-side push.');
                return false;
            }

            await this.app.cloudSyncManager.migrateLocalData();
            const registration = await navigator.serviceWorker.ready;
            const config = this.app.cloudSyncManager.getConfig();
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(config.vapidPublicKey)
            });

            await this.sendSubscriptionToServer(this.subscription);
            localStorage.setItem('notifications-enabled', 'true');
            localStorage.setItem('pushSubscription', JSON.stringify(this.subscription));
            this.usePushNotifications = true;
            this.updateUI(true);
            this.app.cloudSyncManager.updateStatus('Server-side push is active for this browser.');
            this.app.showNiceModal('Notifications Enabled', 'Server-side push notifications are active. Reminders can be delivered even when the app is closed.');
            return true;
        } catch (error) {
            this.app.cloudSyncManager.updateStatus(`Push subscribe failed: ${error.message}`);
            this.app.showNiceModal('Push Setup Failed', error.message || 'Could not enable server-side push notifications.');
            return false;
        }
    }

    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = this.subscription || await registration.pushManager.getSubscription();
            const endpoint = this.subscription?.endpoint;

            if (this.subscription) {
                await this.subscription.unsubscribe();
            }

            if (endpoint && this.app.cloudSyncManager.isConfigured()) {
                await this.removeSubscriptionFromServer(endpoint);
            }

            this.subscription = null;
            localStorage.removeItem('pushSubscription');
            localStorage.setItem('notifications-enabled', 'false');
            this.updateUI(false);
            this.app.cloudSyncManager.updateStatus('Server-side push disabled for this browser.');
        } catch (error) {
            this.app.cloudSyncManager.updateStatus(`Push unsubscribe failed: ${error.message}`);
        }
    }

    async sendSubscriptionToServer(subscription) {
        const client = await this.app.cloudSyncManager.getClient();
        const token = await this.app.cloudSyncManager.getAccessToken();
        const { data, error } = await client.functions.invoke('aquatracker-push-subscriptions', {
            body: {
                subscription: subscription.toJSON(),
                userAgent: navigator.userAgent
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        if (error) throw error;
        return data;
    }

    async removeSubscriptionFromServer(endpoint) {
        const client = await this.app.cloudSyncManager.getClient();
        const token = await this.app.cloudSyncManager.getAccessToken();
        const { error } = await client.functions.invoke('aquatracker-push-subscriptions', {
            method: 'DELETE',
            body: { endpoint },
            headers: { Authorization: `Bearer ${token}` }
        });
        if (error) throw error;
    }

    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;
        
        switch (type) {
            case 'CHECK_REMINDERS':
                this.checkAndScheduleRemindersEvenWhenClosed();
                break;
            case 'SCHEDULE_NOTIFICATION':
                this.scheduleNotification(data);
                break;
            case 'CANCEL_NOTIFICATION':
                this.cancelNotification(data.id);
                break;
            default:
                
        }
    }

    async checkAndScheduleReminders() {
        
        
        // Get filters from main app
        const filters = window.aquaTracker.filters;
        const today = new Date();
        
        for (const filter of filters) {
            await this.checkFilterReminders(filter, today);
        }
    }

    async checkAndScheduleRemindersEvenWhenClosed() {
        
        // Get filters from main app (try to access even if app is closed)
        let filters = [];
        try {
            filters = window.aquaTracker?.filters || [];
        } catch (error) {
            
            filters = [];
        }
        
        const today = new Date();
        
        for (const filter of filters) {
            await this.checkFilterReminders(filter, today);
        }
    }

    async checkFilterReminders(filter, today) {
        const settings = filter.notificationSettings;
        if (!settings) return;

        const dueDate = new Date(filter.nextDueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        // Check buy reminder
        if (settings.buyReminder && settings.buyReminder.enabled) {
            const buyReminderDays = settings.buyReminder.timing;
            if (daysUntilDue === buyReminderDays) {
                await this.scheduleNotification({
                    type: 'buy-reminder',
                    filter: filter,
                    title: `🛒 Time to buy ${filter.name}`,
                    body: `${filter.name} at ${filter.location} needs replacement in ${buyReminderDays} days. Order now to avoid interruption!`,
                    tag: `buy-${filter.id}`,
                    data: { filterId: filter.id, type: 'buy-reminder' }
                });
            }
        }

        // Check replace reminder
        if (settings.replaceReminder && settings.replaceReminder.enabled) {
            const replaceReminderDays = settings.replaceReminder.timing;
            if (daysUntilDue <= replaceReminderDays) {
                await this.scheduleNotification({
                    type: 'replace-reminder',
                    filter: filter,
                    title: '🔄 Replace ' + filter.name,
                    body: filter.name + ' at ' + filter.location + ' is due for replacement today!',
                    tag: 'replace-' + filter.id,
                    data: { filterId: filter.id, type: 'replace-reminder' },
                    requireInteraction: true,
                    actions: [
                        { action: 'view-filter', title: 'View Filter' },
                        { action: 'dismiss', title: 'Dismiss' }
                    ]
                });
            }
        }

        // Check critical overdue
        if (settings.criticalReminder && settings.criticalReminder.enabled) {
            const criticalDays = settings.criticalReminder.threshold;
            if (daysUntilDue < -criticalDays) {
                await this.scheduleNotification({
                    type: 'critical-overdue',
                    filter: filter,
                    title: `⚠️ ${filter.name} is CRITICALLY OVERDUE`,
                    body: `${filter.name} at ${filter.location} is ${Math.abs(daysUntilDue)} days overdue! Immediate replacement required!`,
                    tag: `critical-${filter.id}`,
                    data: { filterId: filter.id, type: 'critical-overdue' },
                    requireInteraction: true,
                    actions: [
                        { action: 'view-filter', title: 'View Filter' },
                        { action: 'dismiss', title: 'Dismiss' }
                    ]
                });
            }
        }
    }

    async scheduleNotification(options) {
        
        
        // For browser notifications, show immediately
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(options.title, {
                body: options.body,
                tag: options.tag || 'aquatracker',
                requireInteraction: options.requireInteraction || false
                // Note: actions are only supported in Service Worker notifications
            });
        }
        
        // Also try to send to service worker for background processing
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_NOTIFICATION',
                data: {
                    id: `${options.type}-${options.filter.id}-${Date.now()}`,
                    ...options,
                    immediate: true
                }
            });
        }
    }

    updateUI(subscribed) {
        // Use the parent app's CSS-based notification icon update
        this.app.updateNotificationIcon(subscribed);
        
        const enabled = localStorage.getItem('notifications-enabled') === 'true';
        if (subscribed && enabled) {
            
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
}

// Backup Manager Class
class BackupManager {
    constructor(app) {
        this.app = app;
        this.backupSchedule = localStorage.getItem('backup-schedule') || 'daily';
        this.lastBackup = localStorage.getItem('last-backup');
        this.backupHistory = JSON.parse(localStorage.getItem('backup-history') || '[]');
    }

    async init() {
        
        
        // Register periodic sync for daily backups
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
                registration.active.postMessage({
                    type: 'REGISTER_PERIODIC_SYNC',
                    data: { tag: 'daily-backup', minInterval: 24 * 60 * 60 * 1000 }
                });
            }
        }

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event);
        });

        // Check if backup is needed
        this.checkBackupNeeded();
        
        
    }

    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;
        
        switch (type) {
            case 'PERFORM_BACKUP':
                this.performBackup();
                break;
            default:
                
        }
    }

    checkBackupNeeded() {
        const now = new Date();
        const lastBackupDate = this.lastBackup ? new Date(this.lastBackup) : new Date(0);
        const daysSinceBackup = Math.floor((now - lastBackupDate) / (1000 * 60 * 60 * 24));

        if (this.backupSchedule !== 'disabled' && daysSinceBackup >= this.getBackupInterval()) {
            
            this.performBackup();
        }
    }

    getBackupInterval() {
        switch (this.backupSchedule) {
            case 'daily': return 1;
            case 'weekly': return 7;
            case 'monthly': return 30;
            default: return 1;
        }
    }

    async performBackup() {
        try {
            
            
            const backup = {
                filters: this.app.filters,
                history: this.app.history,
                settings: {
                    theme: this.app.themeController.currentTheme,
                    notificationsEnabled: localStorage.getItem('notifications-enabled'),
                    currency: this.app.currency
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '3.1.0',
                    type: 'automatic',
                    checksum: this.calculateChecksum()
                }
            };

            // Save to localStorage
            await this.saveLocalBackup(backup);
            
            // Update last backup time
            this.lastBackup = new Date().toISOString();
            localStorage.setItem('last-backup', this.lastBackup);
            
            // Update backup history
            this.updateBackupHistory(backup);
            
            // Update UI
            this.updateBackupStatus();
            
            
            
        } catch (error) {
            
        }
    }

    async saveLocalBackup(backup) {
        // Save current backup
        localStorage.setItem('latest-backup', JSON.stringify(backup));
        
        // Compress and save to backup history
        const backupKey = `backup-${backup.metadata.timestamp.split('T')[0]}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));
        
        // Clean up old backups
        this.cleanupOldBackups();
    }

    cleanupOldBackups() {
        const maxBackups = 7; // Keep last 7 days
        const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('backup-'));
        
        if (backupKeys.length > maxBackups) {
            backupKeys.sort().slice(0, backupKeys.length - maxBackups).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }

    updateBackupHistory(backup) {
        this.backupHistory.unshift({
            timestamp: backup.metadata.timestamp,
            type: backup.metadata.type,
            size: JSON.stringify(backup).length
        });
        
        // Keep only last 30 backups in history
        this.backupHistory = this.backupHistory.slice(0, 30);
        
        localStorage.setItem('backup-history', JSON.stringify(this.backupHistory));
    }

    calculateChecksum() {
        const data = JSON.stringify(this.app.filters) + JSON.stringify(this.app.history);
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    updateBackupStatus() {
        const lastBackupElement = document.getElementById('last-backup-time');
        if (lastBackupElement && this.lastBackup) {
            const lastBackupDate = new Date(this.lastBackup);
            lastBackupElement.textContent = this.formatDate(lastBackupDate);
        }

        const storageUsedElement = document.getElementById('backup-storage');
        if (storageUsedElement) {
            const storageUsed = this.calculateStorageUsed();
            storageUsedElement.textContent = `${storageUsed} MB`;
        }
    }

    calculateStorageUsed() {
        let totalSize = 0;
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('backup-') || key === 'latest-backup') {
                totalSize += localStorage.getItem(key).length;
            }
        });
        return (totalSize / (1024 * 1024)).toFixed(2);
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return date.toLocaleDateString();
    }

    setBackupSchedule(schedule) {
        this.backupSchedule = schedule;
        localStorage.setItem('backup-schedule', schedule);
        this.checkBackupNeeded();
    }

    async restoreFromBackup(backupData) {
        try {
            // Validate backup data
            if (!this.validateBackup(backupData)) {
                throw new Error('Invalid backup data');
            }

            // Restore data
            if (backupData.filters) this.app.filters = backupData.filters;
            if (backupData.history) this.app.history = backupData.history;
            if (backupData.settings) {
                if (backupData.settings.theme) {
                    this.app.themeController.forceApplyTheme(backupData.settings.theme);
                }
                if (backupData.settings.notificationsEnabled) {
                    localStorage.setItem('notifications-enabled', backupData.settings.notificationsEnabled);
                }
                if (backupData.settings.currency) {
                    this.app.currency = backupData.settings.currency;
                }
            }

            // Save restored data
            this.app.saveData();
            this.app.saveHistory();
            
            // Update UI
            this.app.updateStats();
            this.app.renderFilters();
            
            
            
        } catch (error) {
            
            throw error;
        }
    }

    validateBackup(backup) {
        if (!backup || !Array.isArray(backup.filters)) return false;
        if (backup.history && !Array.isArray(backup.history)) return false;
        if (!backup.metadata || typeof backup.metadata !== 'object') return false;

        const exportedAt = backup.metadata.timestamp || backup.metadata.exported;
        return Boolean(exportedAt && !Number.isNaN(Date.parse(exportedAt)));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aquaTracker = new AquaTracker();
});
