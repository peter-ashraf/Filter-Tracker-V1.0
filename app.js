// AquaTracker - Complete App with Mobile PWA Theme Fix

class ThemeController {
    constructor() {
        this.STORAGE_KEY = 'aquatracker-theme-override';
        this.currentTheme = null;
        this.isSystemOverride = false;
    }

    init() {
        
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const initialTheme = savedTheme || 'light';
        
        this.forceApplyTheme(initialTheme);
        this.bindToggleEvent();
        this.disableSystemThemeSync();
    }

    forceApplyTheme(theme) {
        
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
    }

    updateToggleState(theme) {
        const toggle = document.querySelector('.theme-switch__checkbox');
        if (toggle) {
            // Only update if the toggle state doesn't match the theme
            if (toggle.checked !== (theme === 'dark')) {
                // Temporarily remove event listener to prevent recursive loop
                toggle.removeEventListener('change', this.handleToggleChange.bind(this));
                toggle.checked = (theme === 'dark');
                // Re-add event listener
                setTimeout(() => {
                    toggle.addEventListener('change', this.handleToggleChange.bind(this));
                }, 0);
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.forceApplyTheme(newTheme);
    }

    bindToggleEvent() {
        const toggle = document.querySelector('.theme-switch__checkbox');
        if (toggle) {
            toggle.removeEventListener('change', this.handleToggleChange.bind(this));
            toggle.addEventListener('change', this.handleToggleChange.bind(this));
        } else {
            
        }
    }

    handleToggleChange(event) {
        this.toggleTheme();
    }

    disableSystemThemeSync() {
        // Remove any system theme detection to prevent conflicts
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.handleSystemThemeChange);
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
        if (confirmCancel) confirmCancel.addEventListener('click', () => this.closeModal('confirm-modal'));

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

        if (tabName === 'history') {
            this.renderHistory();
        } else if (tabName === 'statistics') {
            this.renderStatistics();
        }
    }

    // Filter Management
    renderFilters() {
        
        const grid = document.getElementById('filters-grid');
        if (!grid) {
            
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
        if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            
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
        
    }

    saveHistory() {
        localStorage.setItem('filterHistory', JSON.stringify(this.history));
        
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
                
                if (confirm('This will replace all current data. Are you sure?')) {
                    // Use backup manager to restore data with validation
                    await this.backupManager.restoreFromBackup(data);
                    
                    // Show success notification
                    new Notification('✅ AquaTracker', {
                        body: 'Data imported successfully! All filters and history have been restored.'
                    });
                    
                    
                }
            } catch (error) {
                this.showNiceModal('Import Error', '❌ Invalid file format. Please select a valid AquaTracker backup file.');
                
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
        // For now, just enable browser notifications
        this.updateUI(true);
        return true;
    }

    async unsubscribe() {
        if (!this.subscription) {
            return;
        }

        try {
            await this.subscription.unsubscribe();
            this.subscription = null;
            localStorage.removeItem('pushSubscription');
            this.updateUI(false);
            
        } catch (error) {
            
        }
    }

    async sendSubscriptionToServer(subscription) {
        // In a real implementation, send to your server
        
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
        return backup && 
               backup.filters && 
               Array.isArray(backup.filters) && 
               backup.metadata &&
               backup.metadata.timestamp;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aquaTracker = new AquaTracker();
});
