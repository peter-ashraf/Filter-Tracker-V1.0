// AquaTracker PWA - Water Filter Management App

class AquaTracker {
  constructor() {
    this.filters = [];
    this.settings = {
      defaultBuyReminder: 14,
      defaultReplaceReminder: 7,
      theme: 'auto',
      notificationsEnabled: false
    };
    this.currentView = 'dashboard';
    this.currentEditingFilter = null;
    this.deferredPrompt = null;
    
    // Sample data from the provided JSON
    this.filterTypes = [
      {id: "sediment", name: "Sediment Filter", defaultInterval: 6, description: "Removes dirt, rust, and large particles"},
      {id: "carbon", name: "Carbon Filter", defaultInterval: 6, description: "Removes chlorine, taste, and odor"},
      {id: "ro-membrane", name: "RO Membrane", defaultInterval: 24, description: "Reverse osmosis membrane for pure water"},
      {id: "whole-house", name: "Whole House Filter", defaultInterval: 12, description: "Filters all water entering the home"},
      {id: "pitcher", name: "Pitcher Filter", defaultInterval: 3, description: "Small pitcher or dispenser filter"},
      {id: "faucet-mount", name: "Faucet Mount Filter", defaultInterval: 4, description: "Attaches directly to faucet"},
      {id: "shower", name: "Shower Filter", defaultInterval: 6, description: "Removes chlorine from shower water"},
      {id: "refrigerator", name: "Refrigerator Filter", defaultInterval: 6, description: "Built-in fridge water/ice filter"},
      {id: "uv-lamp", name: "UV Lamp", defaultInterval: 12, description: "UV sterilization lamp"}
    ];
    
    this.init();
  }
  
  init() {
    this.loadSampleData();
    this.setupServiceWorker();
    this.setupEventListeners();
    this.setupPWAFeatures();
    this.populateFilterTypes();
    this.renderDashboard();
    this.updateStats();
    this.checkOnlineStatus();
  }
  
  loadSampleData() {
    // Load sample filters for demonstration
    this.filters = [
      {
        id: "filter-1",
        name: "Kitchen Sink Main",
        location: "Kitchen",
        type: "carbon",
        brand: "Aquasana",
        installDate: "2024-09-01",
        replacementInterval: 6,
        nextDueDate: "2025-03-01",
        notificationSettings: {buyReminder: 14, replaceReminder: 7},
        replacementHistory: [
          {date: "2024-09-01", cost: 45, notes: "Initial installation"},
          {date: "2024-03-01", cost: 45, notes: "Scheduled replacement"}
        ],
        notes: "Main kitchen filter for drinking water",
        isActive: true
      },
      {
        id: "filter-2", 
        name: "RO System Stage 1",
        location: "Under Kitchen Sink",
        type: "sediment",
        brand: "APEC",
        installDate: "2024-07-15",
        replacementInterval: 6,
        nextDueDate: "2025-01-15",
        notificationSettings: {buyReminder: 14, replaceReminder: 7},
        replacementHistory: [
          {date: "2024-07-15", cost: 25, notes: "Pre-filter replacement"}
        ],
        notes: "First stage sediment filter",
        isActive: true
      },
      {
        id: "filter-3",
        name: "RO Membrane",
        location: "Under Kitchen Sink", 
        type: "ro-membrane",
        brand: "APEC",
        installDate: "2023-12-01",
        replacementInterval: 24,
        nextDueDate: "2025-12-01",
        notificationSettings: {buyReminder: 30, replaceReminder: 14},
        replacementHistory: [
          {date: "2023-12-01", cost: 85, notes: "RO membrane replacement"}
        ],
        notes: "Main RO membrane - lasts 2 years",
        isActive: true
      },
      {
        id: "filter-4",
        name: "Shower Filter",
        location: "Master Bathroom",
        type: "shower", 
        brand: "Culligan",
        installDate: "2024-06-01",
        replacementInterval: 6,
        nextDueDate: "2024-12-01",
        notificationSettings: {buyReminder: 14, replaceReminder: 7},
        replacementHistory: [
          {date: "2024-06-01", cost: 35, notes: "New shower filter installed"}
        ],
        notes: "Removes chlorine for softer skin and hair",
        isActive: true
      },
      {
        id: "filter-5",
        name: "Fridge Water Filter",
        location: "Kitchen Refrigerator",
        type: "refrigerator",
        brand: "Samsung",
        installDate: "2024-08-15", 
        replacementInterval: 6,
        nextDueDate: "2025-02-15",
        notificationSettings: {buyReminder: 14, replaceReminder: 7},
        replacementHistory: [
          {date: "2024-08-15", cost: 55, notes: "OEM Samsung filter"}
        ],
        notes: "For ice maker and water dispenser",
        isActive: true
      }
    ];
  }
  
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Create a simple service worker inline
      const swCode = `
        const CACHE_NAME = 'aquatracker-v1';
        const urlsToCache = [
          '/',
          '/style.css',
          '/app.js',
          '/manifest.json'
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
              }
            )
          );
        });
      `;
      
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(error => {
          console.log('ServiceWorker registration failed');
        });
    }
  }
  
  setupPWAFeatures() {
    // Create and add manifest
    const manifest = {
      name: "AquaTracker - Water Filter Manager",
      short_name: "AquaTracker",
      description: "Track and manage your water filter cartridge replacements",
      start_url: "/",
      display: "standalone",
      background_color: "#1F2121",
      theme_color: "#21808D",
      icons: [
        {
          src: "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#21808D"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">💧</text></svg>'),
          sizes: "192x192",
          type: "image/svg+xml"
        },
        {
          src: "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#21808D"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">💧</text></svg>'),
          sizes: "512x512",
          type: "image/svg+xml"
        }
      ]
    };
    
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);
    
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });
  }
  
  showInstallBanner() {
    const banner = document.getElementById('install-banner');
    banner.classList.remove('hidden');
  }
  
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
      });
    });
    
    // PWA Install
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.installPWA();
      });
    }
    
    const dismissBtn = document.getElementById('dismiss-banner');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('install-banner').classList.add('hidden');
      });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
    }
    
    // Notifications
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView('settings');
      });
    }
    
    const requestNotificationsBtn = document.getElementById('request-notifications');
    if (requestNotificationsBtn) {
      requestNotificationsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.requestNotificationPermission();
      });
    }
    
    // Filter management
    const addFilterBtn = document.getElementById('add-filter-btn');
    if (addFilterBtn) {
      addFilterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openAddFilterModal();
      });
    }
    
    // Modal event listeners with proper binding
    this.setupModalEventListeners();
    
    // Search
    const filterSearch = document.getElementById('filter-search');
    if (filterSearch) {
      filterSearch.addEventListener('input', (e) => {
        this.searchFilters(e.target.value);
      });
    }
    
    // Settings
    const defaultBuyReminder = document.getElementById('default-buy-reminder');
    if (defaultBuyReminder) {
      defaultBuyReminder.addEventListener('change', (e) => {
        this.settings.defaultBuyReminder = parseInt(e.target.value);
      });
    }
    
    const defaultReplaceReminder = document.getElementById('default-replace-reminder');
    if (defaultReplaceReminder) {
      defaultReplaceReminder.addEventListener('change', (e) => {
        this.settings.defaultReplaceReminder = parseInt(e.target.value);
      });
    }
    
    // Filter type change
    const filterType = document.getElementById('filter-type');
    if (filterType) {
      filterType.addEventListener('change', (e) => {
        const selectedType = this.filterTypes.find(t => t.id === e.target.value);
        if (selectedType) {
          document.getElementById('filter-interval').value = selectedType.defaultInterval;
        }
      });
    }
    
    // Close toast
    const toastClose = document.getElementById('toast-close');
    if (toastClose) {
      toastClose.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideToast();
      });
    }
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const visibleModal = document.querySelector('.modal:not(.hidden)');
        if (visibleModal) {
          this.closeModal(visibleModal.id);
        }
      }
    });
    
    // Online/offline status
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }
  
  setupModalEventListeners() {
    // Filter modal listeners
    const closeModalBtn = document.getElementById('close-modal');
    const cancelFilterBtn = document.getElementById('cancel-filter');
    const filterForm = document.getElementById('filter-form');
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal('filter-modal');
      });
    }
    
    if (cancelFilterBtn) {
      cancelFilterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal('filter-modal');
      });
    }
    
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveFilter();
      });
    }
    
    // Replace modal listeners
    const closeReplaceModalBtn = document.getElementById('close-replace-modal');
    const cancelReplaceBtn = document.getElementById('cancel-replace');
    const replaceForm = document.getElementById('replace-form');
    
    if (closeReplaceModalBtn) {
      closeReplaceModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal('replace-modal');
      });
    }
    
    if (cancelReplaceBtn) {
      cancelReplaceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal('replace-modal');
      });
    }
    
    if (replaceForm) {
      replaceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveReplacement();
      });
    }
    
    // Backdrop click handlers - using event delegation on document
    document.addEventListener('click', (e) => {
      // Check if click is on modal backdrop
      if (e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.closest('.modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal(modal.id);
        }
      }
    });
  }
  
  populateFilterTypes() {
    const select = document.getElementById('filter-type');
    if (select) {
      this.filterTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        select.appendChild(option);
      });
    }
  }
  
  switchView(viewName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('nav-tab--active');
    });
    const activeTab = document.querySelector(`[data-view="${viewName}"]`);
    if (activeTab) {
      activeTab.classList.add('nav-tab--active');
    }
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('view--active');
    });
    const activeView = document.getElementById(`${viewName}-view`);
    if (activeView) {
      activeView.classList.add('view--active');
    }
    
    this.currentView = viewName;
    
    // Render view-specific content
    switch (viewName) {
      case 'dashboard':
        this.renderDashboard();
        this.updateStats();
        break;
      case 'history':
        this.renderHistory();
        break;
      case 'statistics':
        this.renderStatistics();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  }
  
  renderDashboard() {
    const grid = document.getElementById('filters-grid');
    if (!grid) return;
    
    if (this.filters.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💧</div>
          <div class="empty-state-message">No filters added yet</div>
          <div class="empty-state-description">Add your first water filter to start tracking replacements</div>
          <button class="btn btn--primary" onclick="aquaTracker.openAddFilterModal()">Add Your First Filter</button>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = '';
    this.filters.forEach(filter => {
      if (filter.isActive) {
        const card = this.createFilterCard(filter);
        grid.appendChild(card);
      }
    });
  }
  
  createFilterCard(filter) {
    const card = document.createElement('div');
    card.className = 'filter-card';
    
    const daysRemaining = this.calculateDaysRemaining(filter.nextDueDate);
    const status = this.getFilterStatus(daysRemaining);
    const filterType = this.filterTypes.find(t => t.id === filter.type);
    
    card.innerHTML = `
      <div class="filter-header">
        <div>
          <h4 class="filter-title">${filter.name}</h4>
          <div class="filter-location">${filter.location}</div>
        </div>
        <div class="filter-status filter-status--${status.class}"></div>
      </div>
      
      <div class="filter-details">
        <div class="filter-detail">
          <span class="filter-detail-label">Type:</span>
          <span class="filter-detail-value">${filterType ? filterType.name : filter.type}</span>
        </div>
        <div class="filter-detail">
          <span class="filter-detail-label">Brand:</span>
          <span class="filter-detail-value">${filter.brand}</span>
        </div>
        <div class="filter-detail">
          <span class="filter-detail-label">Installed:</span>
          <span class="filter-detail-value">${this.formatDate(filter.installDate)}</span>
        </div>
        <div class="filter-detail">
          <span class="filter-detail-label">Next due:</span>
          <span class="filter-detail-value">${this.formatDate(filter.nextDueDate)}</span>
        </div>
        <div class="filter-detail">
          <span class="filter-detail-label">Days remaining:</span>
          <span class="filter-detail-value days-remaining days-remaining--${status.class}">
            ${daysRemaining > 0 ? daysRemaining : 'Overdue'}
          </span>
        </div>
      </div>
      
      <div class="filter-actions">
        <button class="btn btn--outline btn--sm" onclick="aquaTracker.editFilter('${filter.id}')">Edit</button>
        <button class="btn btn--primary btn--sm" onclick="aquaTracker.openReplaceModal('${filter.id}')">Mark Replaced</button>
      </div>
    `;
    
    return card;
  }
  
  calculateDaysRemaining(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  
  getFilterStatus(daysRemaining) {
    if (daysRemaining < 0) {
      return { class: 'overdue', label: 'Overdue' };
    } else if (daysRemaining <= 7) {
      return { class: 'warning', label: 'Due Soon' };
    } else {
      return { class: 'good', label: 'Good' };
    }
  }
  
  updateStats() {
    const totalFilters = this.filters.filter(f => f.isActive).length;
    let dueSoon = 0;
    let overdue = 0;
    
    this.filters.forEach(filter => {
      if (filter.isActive) {
        const daysRemaining = this.calculateDaysRemaining(filter.nextDueDate);
        if (daysRemaining < 0) {
          overdue++;
        } else if (daysRemaining <= 14) {
          dueSoon++;
        }
      }
    });
    
    const totalElement = document.getElementById('total-filters');
    const dueSoonElement = document.getElementById('due-soon');
    const overdueElement = document.getElementById('overdue');
    
    if (totalElement) totalElement.textContent = totalFilters;
    if (dueSoonElement) dueSoonElement.textContent = dueSoon;
    if (overdueElement) overdueElement.textContent = overdue;
  }
  
  openAddFilterModal() {
    this.currentEditingFilter = null;
    const modalTitle = document.getElementById('modal-title');
    const saveButton = document.getElementById('save-filter');
    
    if (modalTitle) modalTitle.textContent = 'Add New Filter';
    if (saveButton) saveButton.textContent = 'Save Filter';
    
    this.clearFilterForm();
    
    // Set default date to today
    const installDateInput = document.getElementById('filter-install-date');
    if (installDateInput) {
      installDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    this.showModal('filter-modal');
  }
  
  editFilter(filterId) {
    const filter = this.filters.find(f => f.id === filterId);
    if (!filter) return;
    
    this.currentEditingFilter = filterId;
    const modalTitle = document.getElementById('modal-title');
    const saveButton = document.getElementById('save-filter');
    
    if (modalTitle) modalTitle.textContent = 'Edit Filter';
    if (saveButton) saveButton.textContent = 'Update Filter';
    
    // Populate form
    const nameInput = document.getElementById('filter-name');
    const locationInput = document.getElementById('filter-location');
    const typeSelect = document.getElementById('filter-type');
    const brandInput = document.getElementById('filter-brand');
    const installDateInput = document.getElementById('filter-install-date');
    const intervalSelect = document.getElementById('filter-interval');
    const notesTextarea = document.getElementById('filter-notes');
    
    if (nameInput) nameInput.value = filter.name;
    if (locationInput) locationInput.value = filter.location;
    if (typeSelect) typeSelect.value = filter.type;
    if (brandInput) brandInput.value = filter.brand;
    if (installDateInput) installDateInput.value = filter.installDate;
    if (intervalSelect) intervalSelect.value = filter.replacementInterval;
    if (notesTextarea) notesTextarea.value = filter.notes || '';
    
    this.showModal('filter-modal');
  }
  
  saveFilter() {
    const nameInput = document.getElementById('filter-name');
    const locationInput = document.getElementById('filter-location');
    const typeSelect = document.getElementById('filter-type');
    const brandInput = document.getElementById('filter-brand');
    const installDateInput = document.getElementById('filter-install-date');
    const intervalSelect = document.getElementById('filter-interval');
    const notesTextarea = document.getElementById('filter-notes');
    
    const formData = {
      name: nameInput ? nameInput.value : '',
      location: locationInput ? locationInput.value : '',
      type: typeSelect ? typeSelect.value : '',
      brand: brandInput ? brandInput.value : '',
      installDate: installDateInput ? installDateInput.value : '',
      replacementInterval: intervalSelect ? parseInt(intervalSelect.value) : 6,
      notes: notesTextarea ? notesTextarea.value : ''
    };
    
    if (this.currentEditingFilter) {
      // Update existing filter
      const filter = this.filters.find(f => f.id === this.currentEditingFilter);
      if (filter) {
        Object.assign(filter, formData);
        filter.nextDueDate = this.calculateNextDueDate(filter.installDate, filter.replacementInterval);
        this.showToast('Filter updated successfully!', 'Filter information has been saved.');
      }
    } else {
      // Add new filter
      const newFilter = {
        id: `filter-${Date.now()}`,
        ...formData,
        nextDueDate: this.calculateNextDueDate(formData.installDate, formData.replacementInterval),
        notificationSettings: {
          buyReminder: this.settings.defaultBuyReminder,
          replaceReminder: this.settings.defaultReplaceReminder
        },
        replacementHistory: [{
          date: formData.installDate,
          cost: 0,
          notes: 'Initial installation'
        }],
        isActive: true
      };
      
      this.filters.push(newFilter);
      this.showToast('Filter added successfully!', `${newFilter.name} has been added to your tracking list.`);
    }
    
    this.closeModal('filter-modal');
    this.renderDashboard();
    this.updateStats();
  }
  
  calculateNextDueDate(installDate, intervalMonths) {
    const install = new Date(installDate);
    const nextDue = new Date(install);
    nextDue.setMonth(nextDue.getMonth() + intervalMonths);
    return nextDue.toISOString().split('T')[0];
  }
  
  openReplaceModal(filterId) {
    const filter = this.filters.find(f => f.id === filterId);
    if (!filter) return;
    
    this.currentEditingFilter = filterId;
    const filterNameElement = document.getElementById('replace-filter-name');
    const replacementDateInput = document.getElementById('replacement-date');
    const replacementCostInput = document.getElementById('replacement-cost');
    const replacementNotesTextarea = document.getElementById('replacement-notes');
    
    if (filterNameElement) filterNameElement.textContent = filter.name;
    if (replacementDateInput) replacementDateInput.value = new Date().toISOString().split('T')[0];
    if (replacementCostInput) replacementCostInput.value = '';
    if (replacementNotesTextarea) replacementNotesTextarea.value = '';
    
    this.showModal('replace-modal');
  }
  
  saveReplacement() {
    const filter = this.filters.find(f => f.id === this.currentEditingFilter);
    if (!filter) return;
    
    const replacementDateInput = document.getElementById('replacement-date');
    const replacementCostInput = document.getElementById('replacement-cost');
    const replacementNotesTextarea = document.getElementById('replacement-notes');
    
    const replacementDate = replacementDateInput ? replacementDateInput.value : '';
    const cost = replacementCostInput ? parseFloat(replacementCostInput.value) || 0 : 0;
    const notes = replacementNotesTextarea ? replacementNotesTextarea.value : '';
    
    // Add to history
    filter.replacementHistory.push({
      date: replacementDate,
      cost: cost,
      notes: notes || 'Filter replaced'
    });
    
    // Update filter dates
    filter.installDate = replacementDate;
    filter.nextDueDate = this.calculateNextDueDate(replacementDate, filter.replacementInterval);
    
    this.showToast('Filter marked as replaced!', `${filter.name} replacement has been logged.`);
    this.closeModal('replace-modal');
    this.renderDashboard();
    this.updateStats();
  }
  
  clearFilterForm() {
    const form = document.getElementById('filter-form');
    if (form) {
      form.reset();
    }
  }
  
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      // Focus management for accessibility
      const firstInput = modal.querySelector('input, select, textarea, button');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }
  
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.currentEditingFilter = null;
      
      // Clear forms when closing
      if (modalId === 'filter-modal') {
        this.clearFilterForm();
      } else if (modalId === 'replace-modal') {
        const form = document.getElementById('replace-form');
        if (form) {
          form.reset();
        }
      }
    }
  }
  
  searchFilters(query) {
    const cards = document.querySelectorAll('.filter-card');
    const lowerQuery = query.toLowerCase();
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(lowerQuery)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const allReplacements = [];
    
    this.filters.forEach(filter => {
      filter.replacementHistory.forEach(replacement => {
        allReplacements.push({
          ...replacement,
          filterName: filter.name,
          filterLocation: filter.location
        });
      });
    });
    
    // Sort by date descending
    allReplacements.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allReplacements.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-message">No replacement history</div>
          <div class="empty-state-description">Filter replacements will appear here once you mark them as replaced</div>
        </div>
      `;
      return;
    }
    
    historyList.innerHTML = '';
    allReplacements.forEach(replacement => {
      const item = document.createElement('div');
      item.className = 'history-item';
      
      item.innerHTML = `
        <div class="history-header">
          <div class="history-filter-name">${replacement.filterName}</div>
          <div class="history-date">${this.formatDate(replacement.date)}</div>
        </div>
        <div class="history-details">
          <span>Location: ${replacement.filterLocation}</span>
          ${replacement.cost > 0 ? `<span>Cost: $${replacement.cost.toFixed(2)}</span>` : ''}
          ${replacement.notes ? `<span>Notes: ${replacement.notes}</span>` : ''}
        </div>
      `;
      
      historyList.appendChild(item);
    });
  }
  
  renderStatistics() {
    // Calculate environmental impact
    const activeFilters = this.filters.filter(f => f.isActive);
    const totalReplacements = this.filters.reduce((sum, filter) => sum + filter.replacementHistory.length, 0);
    const bottlesSaved = Math.floor(totalReplacements * 400); // Assuming 400 bottles per filter
    const moneySaved = Math.floor(totalReplacements * 120); // Assuming $120 saved per replacement
    
    const bottlesSavedElement = document.getElementById('bottles-saved');
    const moneySavedElement = document.getElementById('money-saved');
    
    if (bottlesSavedElement) bottlesSavedElement.textContent = bottlesSaved.toLocaleString();
    if (moneySavedElement) moneySavedElement.textContent = `$${moneySaved.toLocaleString()}`;
    
    // Filter type breakdown
    const typeBreakdown = {};
    activeFilters.forEach(filter => {
      const typeName = this.filterTypes.find(t => t.id === filter.type)?.name || filter.type;
      typeBreakdown[typeName] = (typeBreakdown[typeName] || 0) + 1;
    });
    
    const breakdown = document.getElementById('filter-type-breakdown');
    if (breakdown) {
      breakdown.innerHTML = '';
      
      Object.entries(typeBreakdown).forEach(([type, count]) => {
        const item = document.createElement('div');
        item.className = 'filter-type-stat';
        item.innerHTML = `
          <span>${type}</span>
          <span>${count} filter${count !== 1 ? 's' : ''}</span>
        `;
        breakdown.appendChild(item);
      });
    }
  }
  
  renderSettings() {
    const defaultBuyReminder = document.getElementById('default-buy-reminder');
    const defaultReplaceReminder = document.getElementById('default-replace-reminder');
    
    if (defaultBuyReminder) defaultBuyReminder.value = this.settings.defaultBuyReminder;
    if (defaultReplaceReminder) defaultReplaceReminder.value = this.settings.defaultReplaceReminder;
  }
  
  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.settings.notificationsEnabled = true;
          this.showToast('Notifications enabled!', 'You will receive reminders about filter replacements.');
          
          // Show a test notification
          setTimeout(() => {
            new Notification('AquaTracker Test', {
              body: 'Notifications are working! You\'ll receive reminders when filters need attention.',
              icon: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#21808D"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">💧</text></svg>'),
              tag: 'aquatracker-test'
            });
          }, 1000);
        } else {
          this.showToast('Notifications blocked', 'Please enable notifications in your browser settings to receive filter reminders.');
        }
      });
    } else {
      this.showToast('Notifications not supported', 'Your browser does not support push notifications.');
    }
  }
  
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-color-scheme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-color-scheme', next);
    
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = next === 'dark' ? '☀️' : '🌙';
    }
    
    this.settings.theme = next;
  }
  
  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.showToast('App installed!', 'AquaTracker has been added to your home screen.');
        }
        this.deferredPrompt = null;
        const banner = document.getElementById('install-banner');
        if (banner) {
          banner.classList.add('hidden');
        }
      });
    }
  }
  
  showToast(title, message) {
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toast = document.getElementById('notification-toast');
    
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    
    if (toast) {
      toast.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideToast();
      }, 5000);
    }
  }
  
  hideToast() {
    const toast = document.getElementById('notification-toast');
    if (toast) {
      toast.classList.add('hidden');
    }
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  checkOnlineStatus() {
    this.updateOnlineStatus(navigator.onLine);
  }
  
  updateOnlineStatus(isOnline) {
    const status = document.getElementById('offline-status');
    if (status) {
      if (isOnline) {
        status.textContent = 'Online';
        status.className = 'status status--success';
        // Remove offline indicator if it exists
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
          indicator.remove();
        }
      } else {
        status.textContent = 'Offline';
        status.className = 'status status--warning';
        // Show offline indicator
        if (!document.querySelector('.offline-indicator')) {
          const indicator = document.createElement('div');
          indicator.className = 'offline-indicator';
          indicator.textContent = '📴 Offline - Changes will sync when online';
          document.body.appendChild(indicator);
        }
      }
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.aquaTracker = new AquaTracker();
});

// Check for filter due dates and send notifications
function checkForDueFilters() {
  if (window.aquaTracker && window.aquaTracker.settings.notificationsEnabled) {
    window.aquaTracker.filters.forEach(filter => {
      if (filter.isActive) {
        const daysRemaining = window.aquaTracker.calculateDaysRemaining(filter.nextDueDate);
        const buyReminder = filter.notificationSettings.buyReminder;
        const replaceReminder = filter.notificationSettings.replaceReminder;
        
        // Check if we should send notifications
        if (daysRemaining === buyReminder) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Time to buy new ${filter.name} filter!`, {
              body: `Your ${filter.name} filter will need replacement in ${buyReminder} days. Consider ordering a replacement now.`,
              icon: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#21808D"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">💧</text></svg>'),
              tag: `buy-${filter.id}`,
              requireInteraction: true
            });
          }
        } else if (daysRemaining === replaceReminder) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Time to replace ${filter.name} filter!`, {
              body: `Your ${filter.name} filter needs replacement in ${replaceReminder} days. Don't forget to mark it as replaced in the app.`,
              icon: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#21808D"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">💧</text></svg>'),
              tag: `replace-${filter.id}`,
              requireInteraction: true
            });
          }
        } else if (daysRemaining <= 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${filter.name} filter is overdue!`, {
              body: `Your ${filter.name} filter was due for replacement ${Math.abs(daysRemaining)} days ago. Please replace it as soon as possible.`,
              icon: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#C0152F"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">⚠️</text></svg>'),
              tag: `overdue-${filter.id}`,
              requireInteraction: true
            });
          }
        }
      }
    });
  }
}

// Check for due filters every hour
setInterval(checkForDueFilters, 3600000);

// Also check when the app becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkForDueFilters();
  }
});