// Water Filter Tracker PWA - Final Fixed Version
class FilterTracker {
    constructor() {
        this.filters = [];
        this.editingFilterId = null;
        this.installPromptEvent = null;
        this.pendingDeleteId = null;
        
        console.log('FilterTracker: Initializing application...');
        
        // Initialize with error handling
        try {
            this.init();
        } catch (error) {
            console.error('FilterTracker: Initialization failed:', error);
            this.handleCriticalError('Failed to initialize the application');
        }
    }

    init() {
        console.log('FilterTracker: Starting initialization sequence...');
        
        try {
            // Ensure all modals are hidden FIRST
            this.ensureModalsHidden();
            
            // Load data first
            this.loadInitialData();
            console.log('FilterTracker: Initial data loaded successfully');
            
            // Bind events
            this.bindEvents();
            console.log('FilterTracker: Events bound successfully');
            
            // Update UI
            this.updateStats();
            this.renderFilters();
            console.log('FilterTracker: UI rendered successfully');
            
            // Initialize additional features
            this.initializeTheme();
            this.checkNotificationStatus();
            this.initializePWA();
            
            console.log('FilterTracker: Application initialized successfully');
        } catch (error) {
            console.error('FilterTracker: Error during initialization:', error);
            this.handleCriticalError('Application failed to start properly');
        }
    }

    ensureModalsHidden() {
        try {
            // Force hide all modals immediately
            const modals = ['filter-modal', 'confirm-modal', 'notification-modal', 'install-prompt'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none'; // Force hide with CSS too
                }
            });
            
            // Reset body overflow
            document.body.style.overflow = '';
            
            console.log('FilterTracker: All modals hidden');
        } catch (error) {
            console.error('FilterTracker: Error hiding modals:', error);
        }
    }

    loadInitialData() {
        try {
            // Try to load from localStorage
            const stored = localStorage.getItem('waterFilters');
            
            if (stored) {
                this.filters = JSON.parse(stored);
                console.log('FilterTracker: Loaded filters from storage:', this.filters.length);
            } else {
                // Load default 7-stage RO system
                this.loadDefaultFilters();
                this.saveFilters();
                console.log('FilterTracker: Loaded default 7-stage RO system');
            }
        } catch (error) {
            console.error('FilterTracker: Error loading data, using defaults:', error);
            this.loadDefaultFilters();
        }
    }

    loadDefaultFilters() {
        this.filters = [
            {
                id: "ro-stage-1",
                name: "Sediment Pre-Filter",
                location: "RO System - Kitchen",
                stage: "Stage 1",
                type: "sediment",
                brand: "APEC",
                model: "FI-SED-10",
                installDate: "2024-03-15",
                replacementInterval: 6,
                nextDueDate: "2024-09-15",
                notes: "First stage - removes sediment, dirt, and rust particles",
                isActive: true
            },
            {
                id: "ro-stage-2", 
                name: "Carbon Pre-Filter",
                location: "RO System - Kitchen",
                stage: "Stage 2",
                type: "carbon",
                brand: "APEC",
                model: "FI-GAC-10",
                installDate: "2024-04-01",
                replacementInterval: 6,
                nextDueDate: "2024-10-01",
                notes: "Second stage - removes chlorine, taste, and odor",
                isActive: true
            },
            {
                id: "ro-stage-3",
                name: "Carbon Block Filter", 
                location: "RO System - Kitchen",
                stage: "Stage 3",
                type: "carbon",
                brand: "APEC",
                model: "FI-CB-10",
                installDate: "2024-01-20",
                replacementInterval: 9,
                nextDueDate: "2024-10-20",
                notes: "Third stage - final pre-filtration before RO membrane",
                isActive: true
            },
            {
                id: "ro-stage-4",
                name: "RO Membrane",
                location: "RO System - Kitchen", 
                stage: "Stage 4",
                type: "ro-membrane",
                brand: "APEC",
                model: "MEM-75-RO",
                installDate: "2023-08-10",
                replacementInterval: 24,
                nextDueDate: "2025-08-10",
                notes: "Fourth stage - reverse osmosis membrane for pure water",
                isActive: true
            },
            {
                id: "ro-stage-5",
                name: "Post Carbon Filter",
                location: "RO System - Kitchen",
                stage: "Stage 5", 
                type: "carbon",
                brand: "APEC",
                model: "FI-GAC-T33",
                installDate: "2023-12-05",
                replacementInterval: 12,
                nextDueDate: "2024-12-05",
                notes: "Fifth stage - final taste and odor polishing",
                isActive: true
            },
            {
                id: "ro-stage-6",
                name: "Alkaline Mineral Filter",
                location: "RO System - Kitchen",
                stage: "Stage 6",
                type: "mineral",
                brand: "APEC", 
                model: "FI-AL-10",
                installDate: "2024-02-28",
                replacementInterval: 12,
                nextDueDate: "2025-02-28",
                notes: "Sixth stage - adds beneficial minerals and balances pH",
                isActive: true
            },
            {
                id: "ro-stage-7",
                name: "UV Sterilizer Lamp",
                location: "RO System - Kitchen",
                stage: "Stage 7",
                type: "uv-lamp", 
                brand: "APEC",
                model: "UV-11W",
                installDate: "2024-01-15",
                replacementInterval: 12,
                nextDueDate: "2025-01-15",
                notes: "Seventh stage - UV sterilization for bacteria-free water",
                isActive: true
            }
        ];
    }

    bindEvents() {
        try {
            // Theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleTheme();
                });
            }
            
            // Notification toggle - ONLY show modal when clicked, never auto-show
            const notificationToggle = document.getElementById('notification-toggle');
            if (notificationToggle) {
                notificationToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleNotifications();
                });
            }
            
            // Add filter buttons
            const addFilterBtn = document.getElementById('add-filter-btn');
            if (addFilterBtn) {
                addFilterBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }
            
            const emptyAddBtn = document.getElementById('empty-add-btn');
            if (emptyAddBtn) {
                emptyAddBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAddModal();
                });
            }
            
            // Sort dropdown
            const sortFilters = document.getElementById('sort-filters');
            if (sortFilters) {
                sortFilters.addEventListener('change', (e) => this.sortFilters(e.target.value));
            }
            
            // Modal events
            this.bindModalEvents();
            
            // Keyboard events
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllModals();
                }
            });
            
            console.log('FilterTracker: All event listeners bound successfully');
        } catch (error) {
            console.error('FilterTracker: Error binding events:', error);
        }
    }

    bindModalEvents() {
        try {
            // Filter modal
            const closeModal = document.getElementById('close-modal');
            if (closeModal) {
                closeModal.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeModal();
                });
            }
            
            const cancelBtn = document.getElementById('cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeModal();
                });
            }
            
            const filterForm = document.getElementById('filter-form');
            if (filterForm) {
                filterForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }
            
            // Confirmation modal
            const confirmCancel = document.getElementById('confirm-cancel');
            if (confirmCancel) {
                confirmCancel.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeConfirmModal();
                });
            }
            
            const confirmOk = document.getElementById('confirm-ok');
            if (confirmOk) {
                confirmOk.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleConfirmAction();
                });
            }
            
            // Notification modal - Fixed with proper event handling
            const notificationAllow = document.getElementById('notification-allow');
            if (notificationAllow) {
                // Remove any existing listeners
                notificationAllow.replaceWith(notificationAllow.cloneNode(true));
                // Add new listener to the replaced element
                document.getElementById('notification-allow').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('Allow notifications clicked');
                    this.enableNotifications();
                });
            }
            
            const notificationDeny = document.getElementById('notification-deny');
            if (notificationDeny) {
                // Remove any existing listeners
                notificationDeny.replaceWith(notificationDeny.cloneNode(true));
                // Add new listener to the replaced element
                document.getElementById('notification-deny').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    console.log('Deny notifications clicked');
                    this.closeNotificationModal();
                });
            }
            
            // Install prompt
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.installPWA();
                });
            }
            
            const dismissInstall = document.getElementById('dismiss-install');
            if (dismissInstall) {
                dismissInstall.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.dismissInstallPrompt();
                });
            }
            
            // Close modals when clicking backdrop
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                backdrop.addEventListener('click', (e) => {
                    if (e.target === backdrop) {
                        this.closeAllModals();
                    }
                });
            });
        } catch (error) {
            console.error('FilterTracker: Error binding modal events:', error);
        }
    }

    updateStats() {
        try {
            const today = new Date();
            const dueSoonDays = 30;
            
            let total = 0;
            let overdue = 0;
            let dueSoon = 0;
            
            this.filters.forEach(filter => {
                if (!filter.isActive) return;
                
                total++;
                const dueDate = new Date(filter.nextDueDate);
                const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysDiff < 0) {
                    overdue++;
                } else if (daysDiff <= dueSoonDays) {
                    dueSoon++;
                }
            });
            
            // Update DOM elements safely
            const totalElement = document.getElementById('total-filters');
            if (totalElement) totalElement.textContent = total;
            
            const overdueElement = document.getElementById('overdue-filters');
            if (overdueElement) overdueElement.textContent = overdue;
            
            const dueSoonElement = document.getElementById('due-soon-filters');
            if (dueSoonElement) dueSoonElement.textContent = dueSoon;
            
            console.log('FilterTracker: Stats updated -', {total, overdue, dueSoon});
        } catch (error) {
            console.error('FilterTracker: Error updating stats:', error);
        }
    }

    renderFilters() {
        try {
            const container = document.getElementById('filters-container');
            const emptyState = document.getElementById('empty-state');
            
            if (!container) {
                console.error('FilterTracker: Filters container not found');
                return;
            }
            
            const activeFilters = this.filters.filter(f => f.isActive);
            
            if (activeFilters.length === 0) {
                container.style.display = 'none';
                if (emptyState) emptyState.classList.remove('hidden');
                return;
            }
            
            container.style.display = 'grid';
            if (emptyState) emptyState.classList.add('hidden');
            
            container.innerHTML = activeFilters
                .map(filter => this.createFilterCard(filter))
                .join('');
            
            // Bind filter-specific events
            this.bindFilterEvents();
            
            console.log('FilterTracker: Rendered', activeFilters.length, 'filters');
        } catch (error) {
            console.error('FilterTracker: Error rendering filters:', error);
        }
    }

    createFilterCard(filter) {
        try {
            const today = new Date();
            const dueDate = new Date(filter.nextDueDate);
            const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let statusClass = 'healthy';
            let statusText = `${daysDiff} days left`;
            
            if (daysDiff < 0) {
                statusClass = 'overdue';
                statusText = `${Math.abs(daysDiff)} days overdue`;
            } else if (daysDiff <= 30) {
                statusClass = 'due-soon';
                statusText = `Due in ${daysDiff} days`;
            }
            
            const formattedDueDate = new Date(filter.nextDueDate).toLocaleDateString();
            const formattedInstallDate = new Date(filter.installDate).toLocaleDateString();
            
            return `
                <div class="filter-card ${statusClass}" data-filter-id="${filter.id}">
                    <div class="filter-header">
                        ${filter.stage ? `<div class="filter-stage">${filter.stage}</div>` : ''}
                        <h3 class="filter-name">${this.escapeHtml(filter.name)}</h3>
                        <div class="filter-location">
                            📍 ${this.escapeHtml(filter.location)}
                        </div>
                    </div>
                    <div class="filter-body">
                        <div class="filter-info">
                            <div class="info-item">
                                <div class="info-label">Due Date</div>
                                <div class="info-value due-date ${statusClass}">${formattedDueDate}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Status</div>
                                <div class="info-value due-date ${statusClass}">${statusText}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Installed</div>
                                <div class="info-value">${formattedInstallDate}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Replace Every</div>
                                <div class="info-value">${filter.replacementInterval} months</div>
                            </div>
                        </div>
                        ${filter.brand || filter.model ? `
                            <div class="filter-info">
                                ${filter.brand ? `
                                    <div class="info-item">
                                        <div class="info-label">Brand</div>
                                        <div class="info-value">${this.escapeHtml(filter.brand)}</div>
                                    </div>
                                ` : ''}
                                ${filter.model ? `
                                    <div class="info-item">
                                        <div class="info-label">Model</div>
                                        <div class="info-value">${this.escapeHtml(filter.model)}</div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                        <div class="filter-actions">
                            <button class="btn btn-replace" data-action="replace">✅ Mark Replaced</button>
                            <button class="btn-icon btn-edit" data-action="edit" title="Edit Filter">✏️</button>
                            <button class="btn-icon btn-delete" data-action="delete" title="Delete Filter">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('FilterTracker: Error creating filter card:', error);
            return `<div class="filter-card"><div class="filter-header"><h3>Error loading filter</h3></div></div>`;
        }
    }

    bindFilterEvents() {
        try {
            document.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    try {
                        e.preventDefault();
                        const action = e.target.dataset.action;
                        const filterCard = e.target.closest('.filter-card');
                        if (!filterCard) return;
                        
                        const filterId = filterCard.dataset.filterId;
                        
                        switch (action) {
                            case 'replace':
                                this.markAsReplaced(filterId);
                                break;
                            case 'edit':
                                this.openEditModal(filterId);
                                break;
                            case 'delete':
                                this.confirmDelete(filterId);
                                break;
                        }
                    } catch (error) {
                        console.error('FilterTracker: Error handling filter action:', error);
                    }
                });
            });
        } catch (error) {
            console.error('FilterTracker: Error binding filter events:', error);
        }
    }

    // Theme Management
    initializeTheme() {
        try {
            const savedTheme = localStorage.getItem('theme') || 'light';
            this.applyTheme(savedTheme);
        } catch (error) {
            console.error('FilterTracker: Error initializing theme:', error);
            this.applyTheme('light');
        }
    }

    toggleTheme() {
        try {
            const html = document.documentElement;
            const currentTheme = html.dataset.colorScheme || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            this.applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            this.showToast(`Switched to ${newTheme} theme`, 'success');
        } catch (error) {
            console.error('FilterTracker: Error toggling theme:', error);
        }
    }

    applyTheme(theme) {
        try {
            const html = document.documentElement;
            const themeIcon = document.querySelector('.theme-icon');
            
            if (theme === 'dark') {
                html.dataset.colorScheme = 'dark';
                if (themeIcon) themeIcon.textContent = '☀️';
            } else {
                html.dataset.colorScheme = 'light';
                if (themeIcon) themeIcon.textContent = '🌙';
            }
        } catch (error) {
            console.error('FilterTracker: Error applying theme:', error);
        }
    }

    // Notifications Management - NEVER AUTO-SHOW
    checkNotificationStatus() {
        try {
            const enabled = localStorage.getItem('notificationsEnabled') === 'true';
            const notificationIcon = document.querySelector('.notification-icon');
            
            if (notificationIcon) {
                if (enabled && 'Notification' in window && Notification.permission === 'granted') {
                    notificationIcon.textContent = '🔔';
                } else {
                    notificationIcon.textContent = '🔕';
                }
            }
        } catch (error) {
            console.error('FilterTracker: Error checking notification status:', error);
        }
    }

    toggleNotifications() {
        try {
            if (!('Notification' in window)) {
                this.showToast('Notifications are not supported in this browser.', 'error');
                return;
            }

            const enabled = localStorage.getItem('notificationsEnabled') === 'true';
            
            if (!enabled) {
                if (Notification.permission === 'default') {
                    // Only show modal when user explicitly clicks notification toggle
                    this.showNotificationModal();
                } else if (Notification.permission === 'granted') {
                    this.setNotificationState(true);
                } else {
                    this.showToast('Notifications are blocked. Please enable in browser settings.', 'error');
                }
            } else {
                this.setNotificationState(false);
            }
        } catch (error) {
            console.error('FilterTracker: Error toggling notifications:', error);
        }
    }

    showNotificationModal() {
        try {
            const modal = document.getElementById('notification-modal');
            if (modal) {
                modal.style.display = 'flex'; // Force show
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                console.log('Notification modal shown');
            }
        } catch (error) {
            console.error('FilterTracker: Error showing notification modal:', error);
        }
    }

    closeNotificationModal() {
        try {
            const modal = document.getElementById('notification-modal');
            if (modal) {
                modal.style.display = 'none'; // Force hide
                modal.classList.add('hidden');
                document.body.style.overflow = '';
                console.log('Notification modal closed');
            }
        } catch (error) {
            console.error('FilterTracker: Error closing notification modal:', error);
        }
    }

    async enableNotifications() {
        try {
            console.log('Requesting notification permission...');
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.setNotificationState(true);
                this.showToast('Notifications enabled successfully!', 'success');
            } else {
                this.showToast('Notification permission denied.', 'error');
            }
        } catch (error) {
            console.error('FilterTracker: Notification error:', error);
            this.showToast('Failed to enable notifications.', 'error');
        }
        this.closeNotificationModal();
    }

    setNotificationState(enabled) {
        try {
            localStorage.setItem('notificationsEnabled', enabled.toString());
            const notificationIcon = document.querySelector('.notification-icon');
            
            if (notificationIcon) {
                notificationIcon.textContent = enabled ? '🔔' : '🔕';
            }
            
            this.showToast(
                enabled ? 'Notifications enabled!' : 'Notifications disabled!', 
                'success'
            );
        } catch (error) {
            console.error('FilterTracker: Error setting notification state:', error);
        }
    }

    // PWA Management
    initializePWA() {
        try {
            // Register service worker
            if ('serviceWorker' in navigator) {
                this.createAndRegisterServiceWorker();
            }

            // Handle install prompt - don't auto-show
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.installPromptEvent = e;
                // Don't auto-show install prompt
            });
        } catch (error) {
            console.error('FilterTracker: Error initializing PWA:', error);
        }
    }

    createAndRegisterServiceWorker() {
        try {
            const swCode = `
const CACHE_NAME = 'filter-tracker-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            })
    );
});
`;
            
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);
            
            navigator.serviceWorker.register(swUrl)
                .then(() => {
                    console.log('FilterTracker: Service Worker registered successfully');
                })
                .catch(error => {
                    console.log('FilterTracker: Service Worker registration failed:', error);
                });
        } catch (error) {
            console.error('FilterTracker: Error creating service worker:', error);
        }
    }

    async installPWA() {
        try {
            if (this.installPromptEvent) {
                this.installPromptEvent.prompt();
                const result = await this.installPromptEvent.userChoice;
                
                if (result.outcome === 'accepted') {
                    this.showToast('App installed successfully!', 'success');
                }
                
                this.installPromptEvent = null;
            }
            this.dismissInstallPrompt();
        } catch (error) {
            console.error('FilterTracker: Error installing PWA:', error);
        }
    }

    dismissInstallPrompt() {
        try {
            const installPrompt = document.getElementById('install-prompt');
            if (installPrompt) {
                installPrompt.classList.add('hidden');
            }
            localStorage.setItem('installPromptDismissed', 'true');
        } catch (error) {
            console.error('FilterTracker: Error dismissing install prompt:', error);
        }
    }

    // Filter Operations - All fully functional
    openAddModal() {
        try {
            this.editingFilterId = null;
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) modalTitle.textContent = 'Add New Filter';
            
            const filterForm = document.getElementById('filter-form');
            if (filterForm) filterForm.reset();
            
            // Set default install date to today
            const installDate = document.getElementById('install-date');
            if (installDate) installDate.value = new Date().toISOString().split('T')[0];
            
            this.showModal();
        } catch (error) {
            console.error('FilterTracker: Error opening add modal:', error);
            this.showToast('Error opening add filter dialog', 'error');
        }
    }

    openEditModal(filterId) {
        try {
            const filter = this.filters.find(f => f.id === filterId);
            if (!filter) {
                this.showToast('Filter not found', 'error');
                return;
            }
            
            this.editingFilterId = filterId;
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) modalTitle.textContent = 'Edit Filter';
            
            // Populate form safely
            this.setInputValue('filter-name', filter.name);
            this.setInputValue('filter-location', filter.location);
            this.setInputValue('filter-stage', filter.stage || '');
            this.setInputValue('filter-type', filter.type);
            this.setInputValue('filter-brand', filter.brand || '');
            this.setInputValue('filter-model', filter.model || '');
            this.setInputValue('install-date', filter.installDate);
            this.setInputValue('replacement-interval', filter.replacementInterval);
            this.setInputValue('filter-notes', filter.notes || '');
            
            this.showModal();
        } catch (error) {
            console.error('FilterTracker: Error opening edit modal:', error);
            this.showToast('Error opening edit dialog', 'error');
        }
    }

    setInputValue(id, value) {
        try {
            const input = document.getElementById(id);
            if (input) input.value = value;
        } catch (error) {
            console.error(`FilterTracker: Error setting input value for ${id}:`, error);
        }
    }

    markAsReplaced(filterId) {
        try {
            const filter = this.filters.find(f => f.id === filterId);
            if (!filter) {
                this.showToast('Filter not found', 'error');
                return;
            }
            
            const today = new Date().toISOString().split('T')[0];
            
            // Update install date and calculate new due date
            filter.installDate = today;
            filter.nextDueDate = this.calculateNextDueDate(today, filter.replacementInterval);
            
            this.saveFilters();
            this.updateStats();
            this.renderFilters();
            this.showToast(`${filter.name} marked as replaced!`, 'success');
        } catch (error) {
            console.error('FilterTracker: Error marking as replaced:', error);
            this.showToast('Error updating filter', 'error');
        }
    }

    confirmDelete(filterId) {
        try {
            const filter = this.filters.find(f => f.id === filterId);
            if (!filter) {
                this.showToast('Filter not found', 'error');
                return;
            }
            
            this.pendingDeleteId = filterId;
            
            const confirmTitle = document.getElementById('confirm-title');
            if (confirmTitle) confirmTitle.textContent = 'Delete Filter';
            
            const confirmMessage = document.getElementById('confirm-message');
            if (confirmMessage) {
                confirmMessage.textContent = `Are you sure you want to delete "${filter.name}"? This action cannot be undone.`;
            }
            
            const confirmModal = document.getElementById('confirm-modal');
            if (confirmModal) {
                confirmModal.style.display = 'flex';
                confirmModal.classList.remove('hidden');
            }
        } catch (error) {
            console.error('FilterTracker: Error confirming delete:', error);
            this.showToast('Error opening delete confirmation', 'error');
        }
    }

    sortFilters(criteria) {
        try {
            const sortFunctions = {
                dueDate: (a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate),
                name: (a, b) => a.name.localeCompare(b.name),
                location: (a, b) => a.location.localeCompare(b.location),
                stage: (a, b) => {
                    const aStage = a.stage ? parseInt(a.stage.replace('Stage ', '')) || 999 : 999;
                    const bStage = b.stage ? parseInt(b.stage.replace('Stage ', '')) || 999 : 999;
                    return aStage - bStage;
                }
            };
            
            if (sortFunctions[criteria]) {
                this.filters.sort(sortFunctions[criteria]);
                this.renderFilters();
                this.showToast(`Sorted by ${criteria}`, 'success');
            }
        } catch (error) {
            console.error('FilterTracker: Error sorting filters:', error);
            this.showToast('Error sorting filters', 'error');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = {
                name: this.getInputValue('filter-name'),
                location: this.getInputValue('filter-location'),
                stage: this.getInputValue('filter-stage'),
                type: this.getInputValue('filter-type'),
                brand: this.getInputValue('filter-brand'),
                model: this.getInputValue('filter-model'),
                installDate: this.getInputValue('install-date'),
                replacementInterval: parseInt(this.getInputValue('replacement-interval')) || 6,
                notes: this.getInputValue('filter-notes')
            };
            
            if (this.editingFilterId) {
                this.updateFilter(this.editingFilterId, formData);
            } else {
                this.addFilter(formData);
            }
            
            this.closeModal();
        } catch (error) {
            console.error('FilterTracker: Error handling form submit:', error);
            this.showToast('Error saving filter', 'error');
        }
    }

    getInputValue(id) {
        try {
            const input = document.getElementById(id);
            return input ? input.value : '';
        } catch (error) {
            console.error(`FilterTracker: Error getting input value for ${id}:`, error);
            return '';
        }
    }

    addFilter(data) {
        try {
            const filter = {
                ...data,
                id: 'filter-' + Date.now(),
                nextDueDate: this.calculateNextDueDate(data.installDate, data.replacementInterval),
                isActive: true
            };
            
            this.filters.push(filter);
            this.saveFilters();
            this.updateStats();
            this.renderFilters();
            this.showToast('Filter added successfully!', 'success');
        } catch (error) {
            console.error('FilterTracker: Error adding filter:', error);
            this.showToast('Error adding filter', 'error');
        }
    }

    updateFilter(id, data) {
        try {
            const filterIndex = this.filters.findIndex(f => f.id === id);
            if (filterIndex === -1) {
                this.showToast('Filter not found', 'error');
                return;
            }
            
            const filter = this.filters[filterIndex];
            const oldInstallDate = filter.installDate;
            
            // Update filter data
            Object.assign(filter, data);
            
            // Recalculate due date if install date or interval changed
            if (oldInstallDate !== data.installDate || filter.replacementInterval !== data.replacementInterval) {
                filter.nextDueDate = this.calculateNextDueDate(data.installDate, data.replacementInterval);
            }
            
            this.saveFilters();
            this.updateStats();
            this.renderFilters();
            this.showToast('Filter updated successfully!', 'success');
        } catch (error) {
            console.error('FilterTracker: Error updating filter:', error);
            this.showToast('Error updating filter', 'error');
        }
    }

    handleConfirmAction() {
        try {
            if (this.pendingDeleteId) {
                this.deleteFilter(this.pendingDeleteId);
                this.pendingDeleteId = null;
            }
            this.closeConfirmModal();
        } catch (error) {
            console.error('FilterTracker: Error handling confirm action:', error);
        }
    }

    deleteFilter(id) {
        try {
            const filterIndex = this.filters.findIndex(f => f.id === id);
            if (filterIndex === -1) {
                this.showToast('Filter not found', 'error');
                return;
            }
            
            const filterName = this.filters[filterIndex].name;
            this.filters[filterIndex].isActive = false; // Soft delete
            
            this.saveFilters();
            this.updateStats();
            this.renderFilters();
            this.showToast(`${filterName} deleted successfully!`, 'success');
        } catch (error) {
            console.error('FilterTracker: Error deleting filter:', error);
            this.showToast('Error deleting filter', 'error');
        }
    }

    // Modal Management
    showModal() {
        try {
            const modal = document.getElementById('filter-modal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('FilterTracker: Error showing modal:', error);
        }
    }

    closeModal() {
        try {
            const modal = document.getElementById('filter-modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
            this.editingFilterId = null;
        } catch (error) {
            console.error('FilterTracker: Error closing modal:', error);
        }
    }

    closeConfirmModal() {
        try {
            const modal = document.getElementById('confirm-modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.add('hidden');
            }
        } catch (error) {
            console.error('FilterTracker: Error closing confirm modal:', error);
        }
    }

    closeAllModals() {
        try {
            const modals = ['filter-modal', 'confirm-modal', 'notification-modal', 'install-prompt'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                    modal.classList.add('hidden');
                }
            });
            document.body.style.overflow = '';
            this.editingFilterId = null;
        } catch (error) {
            console.error('FilterTracker: Error closing all modals:', error);
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        try {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            toast.innerHTML = `
                <div class="toast-content">
                    <div class="toast-icon">${icons[type]}</div>
                    <div class="toast-message">${this.escapeHtml(message)}</div>
                    <button class="toast-close">&times;</button>
                </div>
            `;
            
            // Add close functionality
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    toast.remove();
                });
            }
            
            // Auto remove after 4 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 4000);
            
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.appendChild(toast);
            }
        } catch (error) {
            console.error('FilterTracker: Error showing toast:', error);
        }
    }

    // Utility Methods
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveFilters() {
        try {
            localStorage.setItem('waterFilters', JSON.stringify(this.filters));
        } catch (error) {
            console.error('FilterTracker: Failed to save filters:', error);
            this.showToast('Failed to save data. Storage may be full.', 'error');
        }
    }

    calculateNextDueDate(installDate, intervalMonths) {
        try {
            const date = new Date(installDate);
            date.setMonth(date.getMonth() + intervalMonths);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('FilterTracker: Error calculating due date:', error);
            return installDate;
        }
    }

    handleCriticalError(message) {
        console.error('FilterTracker: Critical error -', message);
        
        // Show user-friendly error message
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #c01521; font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 50px auto;">
                <h2>⚠️ App Loading Issue</h2>
                <p style="margin: 20px 0; color: #666;">${message}</p>
                <p style="margin: 20px 0; color: #666;">Please try refreshing the page. If the problem persists, your browser's local storage may be full or corrupted.</p>
                <button onclick="localStorage.clear(); location.reload();" style="padding: 10px 20px; background: #218085; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 10px;">
                    Clear Data & Refresh
                </button>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 10px;">
                    Just Refresh
                </button>
            </div>
        `;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('FilterTracker: DOM loaded, starting app...');
    
    try {
        // CRITICAL: Ensure all modals are hidden on page load
        const modals = ['filter-modal', 'confirm-modal', 'notification-modal', 'install-prompt'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.add('hidden');
            }
        });
        
        // Reset body overflow
        document.body.style.overflow = '';
        
        // Initialize the app
        new FilterTracker();
        
        console.log('FilterTracker: App started successfully');
    } catch (error) {
        console.error('FilterTracker: Failed to start app:', error);
        
        // Fallback error display
        setTimeout(() => {
            const container = document.querySelector('.container') || document.body;
            if (container) {
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #c01521;">
                        <h2>⚠️ App Failed to Load</h2>
                        <p>There was an error loading the Water Filter Tracker.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: #218085; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </div>
                `;
            }
        }, 100);
    }
});