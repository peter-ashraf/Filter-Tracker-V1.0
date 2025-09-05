// AquaTracker - Simplified Working Version
console.log('AquaTracker: Starting...');

class AquaTracker {
    constructor() {
        this.filters = [];
        this.history = [];
        this.currentTab = 'dashboard';
        console.log('AquaTracker: Initializing...');
        this.init();
    }

    init() {
        console.log('AquaTracker: Init started');
        this.loadInitialData();
        this.bindEvents();
        this.updateStats();
        this.renderFilters();
        this.initializeTheme();
        this.initializeTabs();
        console.log('AquaTracker: Initialization complete');
    }

    loadInitialData() {
        console.log('Loading initial data...');
        
        const stored = localStorage.getItem('waterFilters');
        if (stored) {
            this.filters = JSON.parse(stored);
        } else {
            // 7-stage RO system
            this.filters = [
                {
                    id: 'stage-1',
                    name: 'Sediment Pre-Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 1',
                    type: 'Sediment',
                    brand: 'APEC',
                    installDate: '2024-03-15',
                    replacementInterval: 6,
                    nextDueDate: '2024-09-15',
                    cost: 15,
                    notes: 'First stage - removes sediment, dirt, and rust particles'
                },
                {
                    id: 'stage-2',
                    name: 'Carbon Pre-Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 2',
                    type: 'Carbon',
                    brand: 'APEC',
                    installDate: '2024-04-01',
                    replacementInterval: 6,
                    nextDueDate: '2024-10-01',
                    cost: 18,
                    notes: 'Second stage - removes chlorine, taste, and odor'
                },
                {
                    id: 'stage-3',
                    name: 'Carbon Block Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 3',
                    type: 'Carbon Block',
                    brand: 'APEC',
                    installDate: '2024-01-20',
                    replacementInterval: 9,
                    nextDueDate: '2024-10-20',
                    cost: 25,
                    notes: 'Third stage - final pre-filtration before RO membrane'
                },
                {
                    id: 'stage-4',
                    name: 'RO Membrane',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 4',
                    type: 'RO Membrane',
                    brand: 'APEC',
                    installDate: '2023-08-10',
                    replacementInterval: 24,
                    nextDueDate: '2025-08-10',
                    cost: 85,
                    notes: 'Fourth stage - reverse osmosis membrane for pure water'
                },
                {
                    id: 'stage-5',
                    name: 'Post Carbon Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 5',
                    type: 'Post Carbon',
                    brand: 'APEC',
                    installDate: '2023-12-05',
                    replacementInterval: 12,
                    nextDueDate: '2024-12-05',
                    cost: 22,
                    notes: 'Fifth stage - final taste and odor polishing'
                },
                {
                    id: 'stage-6',
                    name: 'Alkaline Mineral Filter',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 6',
                    type: 'Mineral',
                    brand: 'APEC',
                    installDate: '2024-02-28',
                    replacementInterval: 12,
                    nextDueDate: '2025-02-28',
                    cost: 35,
                    notes: 'Sixth stage - adds beneficial minerals and balances pH'
                },
                {
                    id: 'stage-7',
                    name: 'UV Sterilizer Lamp',
                    location: 'RO System - Kitchen',
                    stage: 'Stage 7',
                    type: 'UV Lamp',
                    brand: 'APEC',
                    installDate: '2024-01-15',
                    replacementInterval: 12,
                    nextDueDate: '2025-01-15',
                    cost: 45,
                    notes: 'Seventh stage - UV sterilization for bacteria-free water'
                }
            ];
            this.saveData();
        }
        console.log(`Loaded ${this.filters.length} filters`);
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            console.log('Theme toggle bound');
        }

        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        console.log(`Bound ${tabButtons.length} tab buttons`);

        // Add filter button
        const addBtn = document.getElementById('add-filter-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => alert('Add filter functionality coming soon!'));
            console.log('Add button bound');
        }

        // Search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchFilters(e.target.value));
            console.log('Search input bound');
        }
    }

    initializeTabs() {
        this.switchTab('dashboard');
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
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
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
        console.log('Theme set to:', theme);
    }

    renderFilters() {
        console.log('Rendering filters...');
        const grid = document.getElementById('filters-grid');
        if (!grid) {
            console.error('Filters grid not found');
            return;
        }

        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const filteredFilters = this.filters.filter(filter => 
            filter.name.toLowerCase().includes(searchTerm) ||
            filter.location.toLowerCase().includes(searchTerm) ||
            filter.type.toLowerCase().includes(searchTerm)
        );

        grid.innerHTML = filteredFilters.map(filter => this.createFilterCard(filter)).join('');
        console.log(`Rendered ${filteredFilters.length} filter cards`);
    }

    createFilterCard(filter) {
        const status = this.getFilterStatus(filter);
        const daysUntilDue = this.getDaysUntilDue(filter.nextDueDate);
        
        return `
            <div class="filter-card ${status}" data-filter-id="${filter.id}">
                <div class="filter-header">
                    <div class="filter-stage">${filter.stage || ''}</div>
                    <div class="filter-actions">
                        <button class="action-btn replace-btn" title="Mark as Replaced" onclick="alert('Replace functionality coming soon!')">🔄</button>
                        <button class="action-btn delete-btn" title="Delete Filter" onclick="alert('Delete functionality coming soon!')">🗑️</button>
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

    updateStats() {
        const stats = this.calculateStats();
        
        const elements = {
            'total-filters': stats.total,
            'overdue-filters': stats.overdue,
            'due-soon-filters': stats.dueSoon,
            'good-filters': stats.good
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        console.log('Stats updated:', stats);
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

    searchFilters(searchTerm) {
        console.log('Searching for:', searchTerm);
        this.renderFilters();
    }

    saveData() {
        localStorage.setItem('waterFilters', JSON.stringify(this.filters));
        console.log('Data saved to localStorage');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AquaTracker...');
    window.aquaTracker = new AquaTracker();
    console.log('AquaTracker initialized successfully!');
});