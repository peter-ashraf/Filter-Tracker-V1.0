// AquaTracker - Complete Working Application
console.log('🌊 AquaTracker: Starting application...');

class AquaTracker {
    constructor() {
        this.filters = [];
        this.history = [];
        this.editingFilterId = null;
        this.currentTab = 'dashboard';
        this.installPromptEvent = null;
        
        console.log('AquaTracker: Initializing...');
        this.init();
    }

    init() {
        try {
            this.loadInitialData();
            this.bindEvents();
            this.updateStats();
            this.renderFilters();
            this.initializeTheme();
            this.initializeTabs();
            this.initializePWA();
            console.log('✅ AquaTracker: Application loaded successfully');
        } catch (error) {
            console.error('❌ AquaTracker: Initialization error:', error);
        }
    }

    loadInitialData() {
        console.log('📊 Loading initial data...');
        
        const storedFilters = localStorage.getItem('waterFilters');
        const storedHistory = localStorage.getItem('filterHistory');
        
        if (storedFilters) {
            this.filters = JSON.parse(storedFilters);
        } else {
            // Pre-install 7-stage RO system
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
                    cost: 15,
                    notes: 'First stage - removes sediment, dirt, and rust particles',
                    isActive: true
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
                    cost: 18,
                    notes: 'Second stage - removes chlorine, taste, and odor',
                    isActive: true
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
                    cost: 25,
                    notes: 'Third stage - final pre-filtration before RO membrane',
                    isActive: true
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
                    cost: 85,
                    notes: 'Fourth stage - reverse osmosis membrane for pure water',
                    isActive: true
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
                    cost: 22,
                    notes: 'Fifth stage - final taste and odor polishing',
                    isActive: true
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
                    cost: 35,
                    notes: 'Sixth stage - adds beneficial minerals and balances pH',
                    isActive: true
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
                    cost: 45,
                    notes: 'Seventh stage - UV sterilization for bacteria-free water',
                    isActive: true
                }
            ];
            this.saveData();
        }

        // Load history
        if (storedHistory) {
            this.history = JSON.parse(storedHistory);
        } else {
            this.history = this.generateSampleHistory();
            this.saveHistory();
        }
        
        console.log(`📊 Loaded ${this.filters.length} filters and ${this.history.length} history items`);
    }

    generateSampleHistory() {
        const sampleHistory = [];
        const today = new Date();
        
        // Generate some realistic history
        for (let i = 0; i < 8; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i * 45 + Math.random() * 30));
            
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
        
        // Theme toggle switch
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => this.toggleTheme());
            console.log('✅ Theme toggle bound');
        }

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
        console.log(`✅ Bound ${tabButtons.length} tab buttons`);

        // Add filter button
        const addBtn = document.getElementById('add-filter-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddFilterModal());
            console.log('✅ Add filter button bound');
        }

        // Search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchFilters(e.target.value));
            console.log('✅ Search input bound');
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

        // Modal events
        this.bindModalEvents();

        // Install prompt
        const installBtn = document.getElementById('install-btn');
        const installDismiss = document.getElementById('install-dismiss');
        if (installBtn) installBtn.addEventListener('click', () => this.installPWA());
        if (installDismiss) installDismiss.addEventListener('click', () => this.dismissInstallPrompt());
    }

    bindModalEvents() {
        // Filter modal
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

        // Confirm modal
        const confirmOk = document.getElementById('confirm-ok');
        const confirmCancel = document.getElementById('confirm-cancel');
        if (confirmOk) confirmOk.addEventListener('click', () => this.handleConfirmOk());
        if (confirmCancel) confirmCancel.addEventListener('click', () => this.closeModal('confirm-modal'));
    }

    // Theme Management
    initializeTheme() {
        console.log('🎨 Initializing theme...');
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        console.log(`🎨 Theme toggled to: ${newTheme}`);
    }

    setTheme(theme) {
        // Set the data attribute on html element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update toggle switch position
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = (theme === 'dark');
        }
        
        console.log(`🎨 Theme set to: ${theme}`);
    }

    // Notification Management
    toggleNotifications() {
        const enabled = localStorage.getItem('notifications-enabled') === 'true';
        if (enabled) {
            this.disableNotifications();
        } else {
            this.enableNotifications();
        }
    }

    enableNotifications() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    localStorage.setItem('notifications-enabled', 'true');
                    this.updateNotificationIcon(true);
                    
                    new Notification('🔔 AquaTracker', {
                        body: 'Notifications enabled! You\'ll be reminded about filter replacements.',
                        icon: './icon-192.png'
                    });
                } else {
                    alert('Please enable notifications in your browser settings to receive filter reminders.');
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

    // Tab Management
    initializeTabs() {
        this.switchTab('dashboard');
    }

    switchTab(tabName) {
        console.log(`📑 Switching to tab: ${tabName}`);
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) activeContent.classList.add('active');

        this.currentTab = tabName;

        // Load content for specific tabs
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
        
        // Bind filter card events
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
                            <span class="detail-value">$${filter.cost}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Brand:</span>
                            <span class="detail-value">${filter.brand}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

        // Add to history
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

        // Show success message
        alert(`✅ ${filter.name} marked as replaced! Next due: ${this.formatDate(filter.nextDueDate)}`);
    }

    // Form Management
    resetFilterForm() {
        const form = document.getElementById('filter-form');
        if (form) form.reset();
        
        // Set default date to today
        document.getElementById('filter-install-date').value = new Date().toISOString().split('T')[0];
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
            isActive: true
        };

        // Calculate next due date
        const installDate = new Date(filterData.installDate);
        const nextDue = new Date(installDate);
        nextDue.setMonth(nextDue.getMonth() + filterData.replacementInterval);
        filterData.nextDueDate = nextDue.toISOString().split('T')[0];

        if (this.editingFilterId) {
            // Update existing filter
            const index = this.filters.findIndex(f => f.id === this.editingFilterId);
            if (index !== -1) {
                this.filters[index] = { ...this.filters[index], ...filterData };
            }
        } else {
            // Add new filter
            filterData.id = 'filter-' + Date.now();
            this.filters.push(filterData);
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
                        ${item.cost > 0 ? `<span class="history-cost">$${item.cost}</span>` : ''}
                        <span class="history-type">${item.type === 'replacement' ? '🔄 Replacement' : '📝 Note'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    exportHistory() {
        const data = {
            history: this.history,
            exported: new Date().toISOString(),
            version: '2.0.0'
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
        // Calculate real statistics from actual data
        const totalCost = this.history.reduce((sum, item) => sum + (item.cost || 0), 0);
        const avgCost = this.history.length > 0 ? totalCost / this.history.length : 0;
        
        // Calculate monthly average based on history timespan
        const oldestDate = this.history.length > 0 ? 
            new Date(Math.min(...this.history.map(h => new Date(h.date)))) : 
            new Date();
        const monthsDiff = Math.max(1, (Date.now() - oldestDate) / (1000 * 60 * 60 * 24 * 30));
        const monthlyCost = totalCost / monthsDiff;
        const yearlyProjection = monthlyCost * 12;

        document.getElementById('total-cost').textContent = `$${totalCost.toFixed(0)}`;
        document.getElementById('avg-cost').textContent = `$${avgCost.toFixed(0)}`;
        document.getElementById('monthly-cost').textContent = `$${monthlyCost.toFixed(0)}`;
        document.getElementById('yearly-projection').textContent = `$${yearlyProjection.toFixed(0)}`;

        // Environmental impact (estimated)
        const totalReplacements = this.history.length;
        const bottlesSaved = totalReplacements * 600; // Conservative estimate
        const co2Saved = Math.round(bottlesSaved * 0.16); // lbs of CO2 per bottle
        const wasteReduced = Math.round(bottlesSaved * 0.032); // lbs of plastic per bottle

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
                    <span class="performance-cost">$${filter.costPerMonth.toFixed(2)}/month</span>
                </div>
                <div class="performance-details">
                    <span>Replacements: ${filter.replacements}</span>
                    <span>Total Cost: $${filter.totalCost.toFixed(2)}</span>
                    <span>Type: ${filter.type}</span>
                    <span>Interval: ${filter.replacementInterval} months</span>
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
                theme: localStorage.getItem('theme'),
                notificationsEnabled: localStorage.getItem('notifications-enabled'),
                currency: localStorage.getItem('currency') || 'USD'
            },
            exported: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aquatracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
                            localStorage.setItem('theme', data.settings.theme);
                            this.setTheme(data.settings.theme);
                        }
                        if (data.settings.notificationsEnabled) {
                            localStorage.setItem('notifications-enabled', data.settings.notificationsEnabled);
                        }
                    }
                    
                    this.saveData();
                    this.saveHistory();
                    this.updateStats();
                    this.renderFilters();
                    
                    alert('✅ Data imported successfully!');
                }
            } catch (error) {
                alert('❌ Invalid file format. Please select a valid AquaTracker backup file.');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    confirmResetData() {
        if (confirm('⚠️ This will delete all filters, history, and settings. This cannot be undone. Are you sure?')) {
            if (confirm('🚨 Are you absolutely sure? This will permanently delete everything.')) {
                localStorage.clear();
                location.reload();
            }
        }
    }

    // PWA Features
    initializePWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('✅ SW registered:', registration);
                })
                .catch(error => {
                    console.log('❌ SW registration failed:', error);
                });
        }

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPromptEvent = e;
            this.showInstallPrompt();
        });
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing AquaTracker...');
    window.aquaTracker = new AquaTracker();
    console.log('🎉 AquaTracker initialized successfully!');
});