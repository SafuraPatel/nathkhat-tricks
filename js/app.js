/**
 * NathKhat - UGC NET Paper 1 & Paper 2 (Computer Science) Revision Hub
 * Core Application Logic, Reactive State, Live Search Highlighting, 
 * Rich-Text WYSIWYG, Index Jumping & Recycle Bin.
 */

// State Management
const STATE = {
  topics: [],
  bin: [],
  notes: [],
  resources: [],
  activeResourceTypeFilter: 'all', // 'all' | 'pdf' | 'image' | 'doc' | 'other'
  resourceSearchQuery: '',
  resourceSortBy: 'newest', // 'newest' | 'oldest' | 'name' | 'size-desc' | 'size-asc'
  editingResourceId: null,
  activePreviewResourceId: null,
  currentSelectedUploadFile: null,
  editingNoteId: null,
  notepad: '',
  theme: 'dark',
  activePaper: 'ALL', // 'ALL' | 'P1' | 'P2'
  activeView: 'topicsView', // 'topicsView' | 'notepadView' | 'resourcesView' | 'binView'
  searchQuery: '',
  indexFilter: '',
  sortBy: 'newest', // 'newest' | 'alphabetical' | 'paper'
  editingTopicId: null
};

// Storage Keys
const STORAGE_KEYS = {
  TOPICS: 'nathkhat_topics_v1',
  BIN: 'nathkhat_bin_v1',
  NOTES: 'nathkhat_notes_v1',
  RESOURCES: 'nathkhat_resources_v1',
  NOTEPAD: 'nathkhat_notepad_v1',
  THEME: 'nathkhat_theme_v1',
  ACTIVE_VIEW: 'nathkhat_active_view_v1',
  ACTIVE_PAPER: 'nathkhat_active_paper_v1',
  LAST_SYNC: 'nathkhat_last_sync_v1',
  TOPICS_MODIFIED: 'nathkhat_topics_modified_v1'
};

// DOM Elements
const DOM = {
  // Theme & Brand
  html: document.documentElement,
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  brandBtn: document.getElementById('brandBtn'),

  // Filters & Search
  filterAll: document.getElementById('filterAll'),
  filterP1: document.getElementById('filterP1'),
  filterP2: document.getElementById('filterP2'),
  countAllBadge: document.getElementById('countAllBadge'),
  countP1Badge: document.getElementById('countP1Badge'),
  countP2Badge: document.getElementById('countP2Badge'),
  globalSearchInput: document.getElementById('globalSearchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),

  // Navigation Tabs
  tabTopicsView: document.getElementById('tabTopicsView'),
  tabNotepadView: document.getElementById('tabNotepadView'),
  tabResourcesView: document.getElementById('tabResourcesView'),
  tabBinView: document.getElementById('tabBinView'),
  activeTopicsBadge: document.getElementById('activeTopicsBadge'),
  notesCountBadge: document.getElementById('notesCountBadge'),
  resourcesCountBadge: document.getElementById('resourcesCountBadge'),
  binCountBadge: document.getElementById('binCountBadge'),
  quickStatsText: document.getElementById('quickStatsText'),

  // Views
  topicsView: document.getElementById('topicsView'),
  notepadView: document.getElementById('notepadView'),
  resourcesView: document.getElementById('resourcesView'),
  binView: document.getElementById('binView'),

  // Index (Section 1)
  indexSidebar: document.getElementById('indexSidebar'),
  indexCountBadge: document.getElementById('indexCountBadge'),
  indexFilterInput: document.getElementById('indexFilterInput'),
  indexList: document.getElementById('indexList'),
  mobileIndexToggleBtn: document.getElementById('mobileIndexToggleBtn'),
  closeMobileSidebarBtn: document.getElementById('closeMobileSidebarBtn'),
  sidebarBackdrop: document.getElementById('sidebarBackdrop'),

  // Topics (Section 2)
  topicsContainer: document.getElementById('topicsContainer'),
  topicsEmptyState: document.getElementById('topicsEmptyState'),
  sortSelect: document.getElementById('sortSelect'),
  openAddTopicBtn: document.getElementById('openAddTopicBtn'),
  emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),

  // Notepad (Section 3: Multi-Note Cards)
  notesContainer: document.getElementById('notesContainer'),
  notesEmptyState: document.getElementById('notesEmptyState'),
  emptyStateAddNoteBtn: document.getElementById('emptyStateAddNoteBtn'),
  openAddNoteBtn: document.getElementById('openAddNoteBtn'),

  // Resources Section
  resourcesContainer: document.getElementById('resourcesContainer'),
  resourcesEmptyState: document.getElementById('resourcesEmptyState'),
  openUploadResourceBtn: document.getElementById('openUploadResourceBtn'),
  emptyStateUploadBtn: document.getElementById('emptyStateUploadBtn'),
  resourcesDropzone: document.getElementById('resourcesDropzone'),
  resourceDropInput: document.getElementById('resourceDropInput'),
  dropzoneBrowseBtn: document.getElementById('dropzoneBrowseBtn'),
  batchResourceFileInput: document.getElementById('batchResourceFileInput'),
  resourceSearchInput: document.getElementById('resourceSearchInput'),
  clearResourceSearchBtn: document.getElementById('clearResourceSearchBtn'),
  resourceSortSelect: document.getElementById('resourceSortSelect'),
  resourcesStatsOverview: document.getElementById('resourcesStatsOverview'),
  pillTypeAll: document.getElementById('pillTypeAll'),
  pillTypePdf: document.getElementById('pillTypePdf'),
  pillTypeImage: document.getElementById('pillTypeImage'),
  pillTypeDoc: document.getElementById('pillTypeDoc'),
  pillTypeOther: document.getElementById('pillTypeOther'),
  typeCountAll: document.getElementById('typeCountAll'),
  typeCountPdf: document.getElementById('typeCountPdf'),
  typeCountImage: document.getElementById('typeCountImage'),
  typeCountDoc: document.getElementById('typeCountDoc'),
  typeCountOther: document.getElementById('typeCountOther'),

  // Resource Modal
  resourceModal: document.getElementById('resourceModal'),
  resourceModalTitle: document.getElementById('resourceModalTitle'),
  closeResourceModalBtn: document.getElementById('closeResourceModalBtn'),
  cancelResourceModalBtn: document.getElementById('cancelResourceModalBtn'),
  saveResourceBtn: document.getElementById('saveResourceBtn'),
  resourceForm: document.getElementById('resourceForm'),
  resourceIdInput: document.getElementById('resourceIdInput'),
  resourceTitleInput: document.getElementById('resourceTitleInput'),
  resourcePaperInput: document.getElementById('resourcePaperInput'),
  resourceCategoryInput: document.getElementById('resourceCategoryInput'),
  resourceUnitInput: document.getElementById('resourceUnitInput'),
  resourceDescInput: document.getElementById('resourceDescInput'),
  modalFileDropzone: document.getElementById('modalFileDropzone'),
  modalFileInput: document.getElementById('modalFileInput'),
  modalFilePrompt: document.getElementById('modalFilePrompt'),
  modalFileSelected: document.getElementById('modalFileSelected'),
  modalSelectedBadge: document.getElementById('modalSelectedBadge'),
  modalSelectedFileName: document.getElementById('modalSelectedFileName'),
  modalSelectedFileMeta: document.getElementById('modalSelectedFileMeta'),
  modalChangeFileBtn: document.getElementById('modalChangeFileBtn'),

  // Resource Preview Modal
  resourcePreviewModal: document.getElementById('resourcePreviewModal'),
  previewModalTitle: document.getElementById('previewModalTitle'),
  previewTypeBadge: document.getElementById('previewTypeBadge'),
  previewMetaSub: document.getElementById('previewMetaSub'),
  previewOpenNewTabBtn: document.getElementById('previewOpenNewTabBtn'),
  previewDownloadBtn: document.getElementById('previewDownloadBtn'),
  closeResourcePreviewBtn: document.getElementById('closeResourcePreviewBtn'),
  resourcePreviewBody: document.getElementById('resourcePreviewBody'),

  // Note Modal (Word-like Rich Text)
  noteModal: document.getElementById('noteModal'),
  noteModalTitle: document.getElementById('noteModalTitle'),
  closeNoteModalBtn: document.getElementById('closeNoteModalBtn'),
  cancelNoteModalBtn: document.getElementById('cancelNoteModalBtn'),
  saveNoteBtn: document.getElementById('saveNoteBtn'),
  noteForm: document.getElementById('noteForm'),
  noteIdInput: document.getElementById('noteIdInput'),
  noteTitleInput: document.getElementById('noteTitleInput'),
  noteTagInput: document.getElementById('noteTagInput'),
  noteExplanationEditor: document.getElementById('noteExplanationEditor'),
  noteEditorToolbar: document.getElementById('noteEditorToolbar'),
  noteForeColorPicker: document.getElementById('noteForeColorPicker'),
  noteHiliteColorPicker: document.getElementById('noteHiliteColorPicker'),
  noteImageFileInput: document.getElementById('noteImageFileInput'),
  noteScreenClipBtn: document.getElementById('noteScreenClipBtn'),
  noteInsertTableBtn: document.getElementById('noteInsertTableBtn'),
  noteAddRowBtn: document.getElementById('noteAddRowBtn'),
  noteAddColBtn: document.getElementById('noteAddColBtn'),

  // Recycle Bin (Section 4)
  binContainer: document.getElementById('binContainer'),
  binEmptyState: document.getElementById('binEmptyState'),
  emptyBinBtn: document.getElementById('emptyBinBtn'),

  // Topic Modal
  topicModal: document.getElementById('topicModal'),
  topicModalTitle: document.getElementById('topicModalTitle'),
  closeTopicModalBtn: document.getElementById('closeTopicModalBtn'),
  cancelTopicModalBtn: document.getElementById('cancelTopicModalBtn'),
  saveTopicBtn: document.getElementById('saveTopicBtn'),
  topicForm: document.getElementById('topicForm'),
  topicIdInput: document.getElementById('topicIdInput'),
  topicTitleInput: document.getElementById('topicTitleInput'),
  topicPaperInput: document.getElementById('topicPaperInput'),
  topicUnitInput: document.getElementById('topicUnitInput'),
  topicTrickInput: document.getElementById('topicTrickInput'),
  topicExplanationEditor: document.getElementById('topicExplanationEditor'),
  editorToolbar: document.getElementById('editorToolbar'),
  foreColorPicker: document.getElementById('foreColorPicker'),
  hiliteColorPicker: document.getElementById('hiliteColorPicker'),
  imageFileInput: document.getElementById('imageFileInput'),
  screenClipBtn: document.getElementById('screenClipBtn'),
  insertTableBtn: document.getElementById('insertTableBtn'),
  addRowBtn: document.getElementById('addRowBtn'),
  addColBtn: document.getElementById('addColBtn'),

  // Backup Modal
  backupDataBtn: document.getElementById('backupDataBtn'),
  backupModal: document.getElementById('backupModal'),
  closeBackupModalBtn: document.getElementById('closeBackupModalBtn'),
  closeBackupModalFooterBtn: document.getElementById('closeBackupModalFooterBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  importJsonInput: document.getElementById('importJsonInput'),

  // Toasts
  toastContainer: document.getElementById('toastContainer')
};

/* ==========================================================================
   Initialization
   ========================================================================== */

function initApp() {
  try {
    loadStoredData();
    setupEventListeners();
    applyTheme(STATE.theme);
    updateBadges();

    // Prevent browser from jumping to top or erratic position on reload
    if (window.history && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Initialize history navigation so Back button NEVER exits the site
    initHistoryNavigation();
    setupScrollPersistence();

    // Sync paper filter buttons with restored active paper
    [DOM.filterAll, DOM.filterP1, DOM.filterP2].forEach(btn => {
      if (btn && btn.getAttribute('data-paper') === STATE.activePaper) {
        btn.classList.add('active');
      } else if (btn) {
        btn.classList.remove('active');
      }
    });

    renderIndex();
    renderTopics();
    renderNotepad();
    renderResources();
    renderBin();

    // Restore exact active section after refresh!
    switchView(STATE.activeView, false);

    // Restore exact scroll position on refresh (stay on same spot, don't move)
    restoreScrollPosition();

    // Start Live Cloud Sync so changes are visible to all instantly
    initCloudSync();
  } catch (err) {
    console.error('NathKhat initialization error:', err);
  }
}

function loadStoredData() {
  // Load Theme
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) {
    STATE.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    STATE.theme = 'light';
  }

  // Load Active View & Filter across refreshes
  const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
  const savedView = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
  const validViews = ['topicsView', 'notepadView', 'resourcesView', 'binView'];

  if (validViews.includes(hash)) {
    STATE.activeView = hash;
  } else if (savedView && validViews.includes(savedView)) {
    STATE.activeView = savedView;
  }

  const savedPaper = localStorage.getItem(STORAGE_KEYS.ACTIVE_PAPER);
  if (savedPaper && ['ALL', 'P1', 'P2'].includes(savedPaper)) {
    STATE.activePaper = savedPaper;
  }

  // Load Topics
  const savedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);
  if (savedTopics) {
    try {
      STATE.topics = JSON.parse(savedTopics);
      if (!Array.isArray(STATE.topics) || STATE.topics.length === 0) {
        if (typeof SEED_TOPICS !== 'undefined' && SEED_TOPICS.length > 0) {
          STATE.topics = [...SEED_TOPICS];
          saveTopics();
        }
      }
    } catch (e) {
      console.error('Failed to parse stored topics, loading seed data.', e);
      STATE.topics = typeof SEED_TOPICS !== 'undefined' ? [...SEED_TOPICS] : [];
      saveTopics();
    }
  } else {
    // Initial Seed Data
    STATE.topics = typeof SEED_TOPICS !== 'undefined' ? [...SEED_TOPICS] : [];
    saveTopics();
  }

  // Load Recycle Bin
  const savedBin = localStorage.getItem(STORAGE_KEYS.BIN);
  if (savedBin) {
    try {
      STATE.bin = JSON.parse(savedBin);
    } catch (e) {
      STATE.bin = [];
    }
  }

  // Load Notes (Multi-Note Cards System with legacy notepad migration)
  const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
  if (savedNotes) {
    try {
      STATE.notes = JSON.parse(savedNotes);
      if (!Array.isArray(STATE.notes) || STATE.notes.length === 0) {
        if (typeof SEED_NOTES !== 'undefined' && SEED_NOTES.length > 0) {
          STATE.notes = [...SEED_NOTES];
          saveNotes();
        }
      }
    } catch (e) {
      STATE.notes = typeof SEED_NOTES !== 'undefined' ? [...SEED_NOTES] : [];
      saveNotes();
    }
  } else {
    // Check if user has legacy raw notepad text to migrate
    const legacyNotepad = localStorage.getItem(STORAGE_KEYS.NOTEPAD);
    if (legacyNotepad && legacyNotepad.trim().length > 0) {
      STATE.notes = [
        {
          id: 'note-' + Date.now(),
          title: 'General Revision Points',
          tag: 'Revision',
          content: legacyNotepad,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
    } else if (typeof SEED_NOTES !== 'undefined') {
      STATE.notes = [...SEED_NOTES];
    } else {
      STATE.notes = [];
    }
    saveNotes();
  }

  // Load Resources (PDFs, Images, Documents, Any Files)
  const savedResources = localStorage.getItem(STORAGE_KEYS.RESOURCES);
  if (savedResources) {
    try {
      STATE.resources = JSON.parse(savedResources);
      if (!Array.isArray(STATE.resources) || STATE.resources.length === 0) {
        if (typeof SEED_RESOURCES !== 'undefined' && SEED_RESOURCES.length > 0) {
          STATE.resources = [...SEED_RESOURCES];
          saveResources();
        }
      }
    } catch (e) {
      STATE.resources = typeof SEED_RESOURCES !== 'undefined' ? [...SEED_RESOURCES] : [];
      saveResources();
    }
  } else if (typeof SEED_RESOURCES !== 'undefined') {
    STATE.resources = [...SEED_RESOURCES];
    saveResources();
  } else {
    STATE.resources = [];
    saveResources();
  }
}

function saveTopics() {
  localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(STATE.topics));
}

function saveBin() {
  localStorage.setItem(STORAGE_KEYS.BIN, JSON.stringify(STATE.bin));
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(STATE.notes));
  if (DOM.notesCountBadge) DOM.notesCountBadge.textContent = STATE.notes.length;
}

function saveResources() {
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(STATE.resources));
  if (DOM.resourcesCountBadge) DOM.resourcesCountBadge.textContent = STATE.resources.length;
}

function saveNotepad() {
  localStorage.setItem(STORAGE_KEYS.NOTEPAD, STATE.notepad);
}

/* ==========================================================================
   Theme Management
   ========================================================================== */

function applyTheme(theme) {
  STATE.theme = theme;
  DOM.html.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  DOM.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  const newTheme = STATE.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme`, 'info');
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */

function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/* ==========================================================================
   Section & Tab Switching
   ========================================================================== */

function switchView(viewName, updateUrl = true) {
  STATE.activeView = viewName;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, viewName);

  if (updateUrl && window.history && window.history.replaceState) {
    window.history.replaceState(null, '', '#' + viewName);
  }

  // Update tabs
  [DOM.tabTopicsView, DOM.tabNotepadView, DOM.tabResourcesView, DOM.tabBinView].forEach(btn => {
    if (btn && btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else if (btn) {
      btn.classList.remove('active');
    }
  });

  // Update Views
  [DOM.topicsView, DOM.notepadView, DOM.resourcesView, DOM.binView].forEach(view => {
    if (view && view.id === viewName) {
      view.classList.add('active');
    } else if (view) {
      view.classList.remove('active');
    }
  });

  if (viewName === 'topicsView') {
    renderTopics();
    renderIndex();
  } else if (viewName === 'notepadView') {
    renderNotepad();
  } else if (viewName === 'resourcesView') {
    renderResources();
  } else if (viewName === 'binView') {
    renderBin();
  }
}

/* ==========================================================================
   Paper Filter & Search Filtering
   ========================================================================== */

function setPaperFilter(paper) {
  STATE.activePaper = paper;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PAPER, paper);

  [DOM.filterAll, DOM.filterP1, DOM.filterP2].forEach(btn => {
    if (btn && btn.getAttribute('data-paper') === paper) {
      btn.classList.add('active');
    } else if (btn) {
      btn.classList.remove('active');
    }
  });

  renderIndex();
  renderTopics();
  if (DOM.resourcesView) renderResources();
}

function updateBadges() {
  const total = STATE.topics.length;
  const p1Count = STATE.topics.filter(t => t.paper === 'P1').length;
  const p2Count = STATE.topics.filter(t => t.paper === 'P2').length;
  const binCount = STATE.bin.length;
  const notesCount = STATE.notes ? STATE.notes.length : 0;
  const resourcesCount = STATE.resources ? STATE.resources.length : 0;

  DOM.countAllBadge.textContent = total;
  DOM.countP1Badge.textContent = p1Count;
  DOM.countP2Badge.textContent = p2Count;
  DOM.activeTopicsBadge.textContent = total;
  DOM.binCountBadge.textContent = binCount;
  if (DOM.notesCountBadge) DOM.notesCountBadge.textContent = notesCount;
  if (DOM.resourcesCountBadge) DOM.resourcesCountBadge.textContent = resourcesCount;
  if (DOM.indexCountBadge) DOM.indexCountBadge.textContent = total;
  if (DOM.quickStatsText) {
    DOM.quickStatsText.textContent = `${total} Topics Ready • P1: ${p1Count} | P2: ${p2Count}`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   Filtering & Sorting Helper
   ========================================================================== */

function getFilteredTopics() {
  let list = [...STATE.topics];

  // 1. Paper Filter
  if (STATE.activePaper !== 'ALL') {
    list = list.filter(t => t.paper === STATE.activePaper);
  }

  // 2. Global Search Query
  if (STATE.searchQuery.trim() !== '') {
    const q = STATE.searchQuery.toLowerCase();
    list = list.filter(t => {
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchTrick = (t.trick || '').toLowerCase().includes(q);
      const matchUnit = (t.unit || '').toLowerCase().includes(q);
      // Clean HTML tags from explanation for text matching
      const cleanExpl = (t.explanation || '').replace(/<[^>]*>?/gm, '').toLowerCase();
      const matchExpl = cleanExpl.includes(q);
      return matchTitle || matchTrick || matchUnit || matchExpl;
    });
  }

  // 3. Sorting
  if (STATE.sortBy === 'newest') {
    // Newest created/updated first
    list.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  } else if (STATE.sortBy === 'alphabetical') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (STATE.sortBy === 'paper') {
    list.sort((a, b) => a.paper.localeCompare(b.paper));
  }

  return list;
}

/* ==========================================================================
   Real-Time Search Keyword Highlighting
   ========================================================================== */

function highlightText(text, query) {
  if (!query || !query.trim() || !text) return text;
  
  // Escape regex special chars
  const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function highlightHtmlContent(html, query) {
  if (!query || !query.trim() || !html) return html;
  
  // Highlighting inside HTML without breaking HTML tags
  const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match text nodes outside tags
  return html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, textNode) => {
    if (tag) return tag; // Return tag unchanged
    if (textNode) {
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return textNode.replace(regex, '<mark class="search-highlight">$1</mark>');
    }
    return match;
  });
}

/* ==========================================================================
   SECTION 1: Index Sidebar (Quick Jump Navigator)
   Rule: When a new topic is added, it is visible at the top!
   ========================================================================== */

function renderIndex() {
  let list = getFilteredTopics();

  // If index filter input is active
  if (STATE.indexFilter.trim() !== '') {
    const filterQ = STATE.indexFilter.toLowerCase();
    list = list.filter(t => 
      t.title.toLowerCase().includes(filterQ) || 
      (t.unit && t.unit.toLowerCase().includes(filterQ))
    );
  }

  DOM.indexList.innerHTML = '';

  if (list.length === 0) {
    DOM.indexList.innerHTML = `
      <div style="padding: 1.5rem 1rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        No topics in index matching filter
      </div>
    `;
    return;
  }

  list.forEach((topic, idx) => {
    const item = document.createElement('a');
    item.className = 'index-item';
    item.href = `#topic-${topic.id}`;
    item.dataset.topicId = topic.id;

    // Highlight search match in index title
    const displayTitle = highlightText(topic.title, STATE.searchQuery || STATE.indexFilter);
    const displayUnit = highlightText(topic.unit || 'General', STATE.searchQuery || STATE.indexFilter);

    item.innerHTML = `
      <span class="index-badge-tag ${topic.paper}">${topic.paper}</span>
      <div class="index-item-content">
        <div class="index-item-title">${displayTitle}</div>
        <div class="index-item-unit">${displayUnit}</div>
      </div>
    `;

    // Click handler: Jump to Topic smoothly!
    item.addEventListener('click', (e) => {
      e.preventDefault();
      jumpToTopic(topic.id);
    });

    DOM.indexList.appendChild(item);
  });
}

function closeMobileIndex(triggerHistoryBack = false) {
  if (DOM.indexSidebar) DOM.indexSidebar.classList.remove('mobile-open');
  if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.remove('active');

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function toggleMobileIndex() {
  if (DOM.indexSidebar) {
    const isOpening = !DOM.indexSidebar.classList.contains('mobile-open');
    DOM.indexSidebar.classList.toggle('mobile-open');
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.toggle('active');
    if (isOpening) {
      pushModalHistory('indexSidebar');
    }
  }
}

function jumpToTopic(topicId) {
  // Ensure mobile sidebar closes smoothly
  closeMobileIndex();

  // Ensure we are in topics view
  if (STATE.activeView !== 'topicsView') {
    switchView('topicsView');
  }

  // Clear paper filter if this topic is not in the currently active filter
  const targetTopic = STATE.topics.find(t => t.id === topicId);
  if (targetTopic && STATE.activePaper !== 'ALL' && targetTopic.paper !== STATE.activePaper) {
    setPaperFilter('ALL');
  }

  // Re-render topics to make sure element is in DOM
  renderTopics();

  const targetCard = document.getElementById(`topic-${topicId}`);
  if (targetCard) {
    // Smooth scroll directly to the card
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Trigger visual pulse animation to wow the user
    targetCard.classList.remove('jump-highlight');
    // Force reflow
    void targetCard.offsetWidth;
    targetCard.classList.add('jump-highlight');

    // Highlight active item in index sidebar
    document.querySelectorAll('.index-item').forEach(el => el.classList.remove('active-scroll'));
    const indexItem = document.querySelector(`.index-item[data-topic-id="${topicId}"]`);
    if (indexItem) {
      indexItem.classList.add('active-scroll');
    }

    setTimeout(() => {
      targetCard.classList.remove('jump-highlight');
    }, 2000);
  }
}

/* ==========================================================================
   SECTION 2: Topics & Desi Tricks View
   ========================================================================== */

function renderTopics() {
  const list = getFilteredTopics();
  DOM.topicsContainer.innerHTML = '';

  if (list.length === 0) {
    DOM.topicsEmptyState.style.display = 'block';
    DOM.topicsContainer.style.display = 'none';
    return;
  }

  DOM.topicsEmptyState.style.display = 'none';
  DOM.topicsContainer.style.display = 'flex';

  list.forEach(topic => {
    const card = document.createElement('article');
    card.className = 'topic-card';
    card.id = `topic-${topic.id}`;

    // Apply keyword highlighting if query exists
    const q = STATE.searchQuery;
    const titleHighlighted = highlightText(topic.title, q);
    const trickHighlighted = highlightText(topic.trick, q);
    const unitHighlighted = highlightText(topic.unit || 'General', q);
    const explanationHighlighted = highlightHtmlContent(topic.explanation, q);

    card.innerHTML = `
      <!-- Card Header -->
      <div class="topic-card-header">
        <div class="topic-card-title-group">
          <div class="topic-meta-row">
            <span class="badge-paper ${topic.paper}">${topic.paper}:</span>
            <span class="badge-unit">${unitHighlighted}</span>
          </div>
          <h3 class="topic-card-title">${titleHighlighted}</h3>
        </div>
        <div class="topic-actions">
          <button type="button" class="btn-card-action" title="Edit Topic" data-action="edit" data-id="${topic.id}">
            ✏️
          </button>
          <button type="button" class="btn-card-action danger" title="Move to Recycle Bin" data-action="bin" data-id="${topic.id}">
            🗑️
          </button>
        </div>
      </div>

      <!-- Distinct Box 1: Tricks Box -->
      <div class="desi-trick-box">
        <div class="desi-trick-header">
          <span class="desi-trick-tag">
            <span>💡</span> Tricks
          </span>
          <button type="button" class="btn-copy-trick" data-action="copy-trick" data-trick="${encodeURIComponent(topic.trick)}">
            <span>📋</span> Copy Trick
          </button>
        </div>
        <div class="desi-trick-content">${trickHighlighted}</div>
      </div>

      <!-- Distinct Box 2: Explanation Box -->
      <div class="explanation-box">
        <div class="explanation-label">
          <span>📖</span> Explanation &amp; Key Details:
        </div>
        <div class="explanation-body">
          ${explanationHighlighted}
        </div>
      </div>
    `;

    // Bind card actions
    card.querySelector('[data-action="edit"]').addEventListener('click', () => openEditTopicModal(topic.id));
    card.querySelector('[data-action="bin"]').addEventListener('click', () => moveToBin(topic.id));
    card.querySelector('[data-action="copy-trick"]').addEventListener('click', (e) => {
      const trickText = decodeURIComponent(e.currentTarget.getAttribute('data-trick'));
      navigator.clipboard.writeText(trickText).then(() => {
        showToast('Trick copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Copied to clipboard', 'info');
      });
    });

    DOM.topicsContainer.appendChild(card);
  });
}

/* ==========================================================================
   Topic CRUD & Modal Operations
   Rule: New topic is visible in index section at the TOP!
   ========================================================================== */

function openAddTopicModal() {
  STATE.editingTopicId = null;
  DOM.topicModalTitle.innerHTML = '<span>💡</span> Add New Study Topic &amp; Trick';
  DOM.topicIdInput.value = '';
  DOM.topicTitleInput.value = '';
  DOM.topicPaperInput.value = STATE.activePaper !== 'ALL' ? STATE.activePaper : 'P1';
  DOM.topicUnitInput.value = '';
  DOM.topicTrickInput.value = '';
  DOM.topicExplanationEditor.innerHTML = '';
  
  DOM.topicModal.classList.add('open');
  pushModalHistory('topicModal');
  setTimeout(() => DOM.topicTitleInput.focus(), 100);
}

function openEditTopicModal(topicId) {
  const topic = STATE.topics.find(t => t.id === topicId);
  if (!topic) return;

  STATE.editingTopicId = topicId;
  DOM.topicModalTitle.innerHTML = '<span>✏️</span> Edit Study Topic &amp; Trick';
  DOM.topicIdInput.value = topic.id;
  DOM.topicTitleInput.value = topic.title;
  DOM.topicPaperInput.value = topic.paper;
  DOM.topicUnitInput.value = topic.unit || '';
  DOM.topicTrickInput.value = topic.trick || '';
  DOM.topicExplanationEditor.innerHTML = topic.explanation || '';

  DOM.topicModal.classList.add('open');
  pushModalHistory('topicModal');
  setTimeout(() => DOM.topicTitleInput.focus(), 100);
}

function closeTopicModal(triggerHistoryBack = false) {
  if (DOM.topicModal) {
    DOM.topicModal.classList.remove('open');
  }
  STATE.editingTopicId = null;
  if (DOM.topicTitleInput) DOM.topicTitleInput.value = '';
  if (DOM.topicTrickInput) DOM.topicTrickInput.value = '';
  if (DOM.topicExplanationEditor) DOM.topicExplanationEditor.innerHTML = '';

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function sanitizeHtml(rawHtml) {
  if (!rawHtml) return '';
  const div = document.createElement('div');
  div.innerHTML = rawHtml;

  // Strip dangerous tags to keep site 100% secure
  const unsafe = div.querySelectorAll('script, iframe, object, embed, form, input, button:not([class*="custom"]), link, meta, base');
  unsafe.forEach(el => el.remove());

  // Strip inline JavaScript execution attributes
  const allElements = div.querySelectorAll('*');
  allElements.forEach(el => {
    for (let i = el.attributes.length - 1; i >= 0; i--) {
      const attr = el.attributes[i];
      if (attr.name.toLowerCase().startsWith('on') || attr.value.trim().toLowerCase().startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    }
  });

  return div.innerHTML;
}

function saveTopicForm() {
  const title = DOM.topicTitleInput.value.trim();
  const paper = DOM.topicPaperInput.value;
  const unit = DOM.topicUnitInput.value.trim() || (paper === 'P1' ? 'General Aptitude' : 'Computer Science');
  const trick = DOM.topicTrickInput.value.trim();
  const rawExplanation = DOM.topicExplanationEditor.innerHTML.trim();
  const explanation = sanitizeHtml(rawExplanation) || '<p>No detailed explanation added yet.</p>';

  if (!title) {
    alert('Please enter a topic name');
    DOM.topicTitleInput.focus();
    return;
  }

  if (!trick) {
    alert('Please enter a Trick or memory hook');
    DOM.topicTrickInput.focus();
    return;
  }

  const now = Date.now();
  let savedTopicItem = null;

  if (STATE.editingTopicId) {
    // Update existing topic
    const index = STATE.topics.findIndex(t => t.id === STATE.editingTopicId);
    if (index !== -1) {
      STATE.topics[index] = {
        ...STATE.topics[index],
        title,
        paper,
        unit,
        trick,
        explanation,
        updatedAt: now
      };
      // Move edited topic to TOP of array as recently updated
      const updatedTopic = STATE.topics.splice(index, 1)[0];
      STATE.topics.unshift(updatedTopic);
      savedTopicItem = updatedTopic;
    }
  } else {
    // ADD NEW TOPIC: Place at the VERY TOP of the array so it's top on Index!
    const newTopic = {
      id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      paper,
      unit,
      trick,
      explanation,
      createdAt: now,
      updatedAt: now
    };

    STATE.topics.unshift(newTopic); // Top of the list
    savedTopicItem = newTopic;
  }

  saveTopics();
  updateBadges();
  renderIndex();
  renderTopics();

  // CLOSE the add or edit section immediately!
  closeTopicModal(false);

  // Directly apply and push to cloud sync so it is instantly visible to all
  syncGlobally();

  // NOTE: Do not scroll away, stay on the exact same page position!
}

function duplicateTopic(topicId) {
  const topic = STATE.topics.find(t => t.id === topicId);
  if (!topic) return;

  const now = Date.now();
  const cloned = {
    ...topic,
    id: `topic-${now}-${Math.random().toString(36).substr(2, 5)}`,
    title: `${topic.title} (Copy)`,
    createdAt: now,
    updatedAt: now
  };

  // Add at top
  STATE.topics.unshift(cloned);
  saveTopics();
  updateBadges();
  renderIndex();
  renderTopics();
  syncGlobally();
  showToast(`Duplicated "${topic.title}" and added to top of Index!`, 'success');
  jumpToTopic(cloned.id);
}

/* ==========================================================================
   Rich-Text Editor Tools (WYSIWYG & Table Row/Col Controls & Clipboard Paste)
   ========================================================================== */

function setupRichTextEditor() {
  // 1. Topic Explanation Editor
  setupSingleEditor({
    toolbar: DOM.editorToolbar,
    editor: DOM.topicExplanationEditor,
    foreColorPicker: DOM.foreColorPicker,
    hiliteColorPicker: DOM.hiliteColorPicker,
    imageFileInput: DOM.imageFileInput,
    screenClipBtn: DOM.screenClipBtn,
    insertTableBtn: DOM.insertTableBtn,
    addRowBtn: DOM.addRowBtn,
    addColBtn: DOM.addColBtn
  });

  // 2. Notepad Word-like Editor
  if (DOM.noteExplanationEditor) {
    setupSingleEditor({
      toolbar: DOM.noteEditorToolbar,
      editor: DOM.noteExplanationEditor,
      foreColorPicker: DOM.noteForeColorPicker,
      hiliteColorPicker: DOM.noteHiliteColorPicker,
      imageFileInput: DOM.noteImageFileInput,
      screenClipBtn: DOM.noteScreenClipBtn,
      insertTableBtn: DOM.noteInsertTableBtn,
      addRowBtn: DOM.noteAddRowBtn,
      addColBtn: DOM.noteAddColBtn
    });
  }
}

function setupSingleEditor(config) {
  const { toolbar, editor, foreColorPicker, hiliteColorPicker, imageFileInput, screenClipBtn, insertTableBtn, addRowBtn, addColBtn } = config;
  if (!editor) return;

  // Toolbar basic command execution (B, U, H2, P, lists)
  if (toolbar) {
    toolbar.querySelectorAll('.editor-btn[data-command]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        const val = btn.getAttribute('data-val') || null;
        document.execCommand(command, false, val);
        editor.focus();
      });
    });
  }

  // Text Color Picker
  if (foreColorPicker) {
    foreColorPicker.addEventListener('input', (e) => {
      document.execCommand('foreColor', false, e.target.value);
      editor.focus();
    });
  }

  // Highlight Color Picker
  if (hiliteColorPicker) {
    hiliteColorPicker.addEventListener('input', (e) => {
      document.execCommand('hiliteColor', false, e.target.value);
      editor.focus();
    });
  }

  // Fast Image File Picker -> Opens Crop & Zoom Tool
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        if (typeof ImageCropper !== 'undefined' && ImageCropper.openCropper) {
          ImageCropper.openCropper(file, editor);
        }
      }
      e.target.value = '';
    });
  }

  // Screen Clipping Button (✂️ Screen Clip like MS Word)
  if (screenClipBtn) {
    screenClipBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof ImageCropper !== 'undefined' && ImageCropper.startScreenClipping) {
        ImageCropper.startScreenClipping(editor);
      }
    });
  }

  // Direct Clipboard Paste Listener (Ctrl+V screenshots / images -> Fast Crop & Zoom)
  editor.addEventListener('paste', (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    const items = clipboardData.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith('image/')) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof ImageCropper !== 'undefined' && ImageCropper.openCropper) {
            ImageCropper.openCropper(blob, editor);
          }
          break;
        }
      }
    }
  });

  // Table Creation Button (📊 Table)
  if (insertTableBtn) {
    insertTableBtn.addEventListener('click', (e) => {
      e.preventDefault();
      insertTableIntoEditor(editor);
    });
  }

  // Table Add Row Button (➕ Row)
  if (addRowBtn) {
    addRowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addTableRowToEditor(editor);
    });
  }

  // Table Add Column Button (➕ Col)
  if (addColBtn) {
    addColBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addTableColToEditor(editor);
    });
  }

  // Inline Click Handler on tables for Word-like floating + buttons
  editor.addEventListener('click', (e) => {
    const tableAddRow = e.target.closest('.table-add-row');
    const tableAddCol = e.target.closest('.table-add-col');
    const tableDel = e.target.closest('.table-del');

    if (tableAddRow) {
      e.preventDefault();
      const wrapper = tableAddRow.closest('.table-wrapper');
      const table = wrapper ? wrapper.querySelector('table') : tableAddRow.closest('table');
      if (table) appendTableRow(table);
    } else if (tableAddCol) {
      e.preventDefault();
      const wrapper = tableAddCol.closest('.table-wrapper');
      const table = wrapper ? wrapper.querySelector('table') : tableAddCol.closest('table');
      if (table) appendTableCol(table);
    } else if (tableDel) {
      e.preventDefault();
      if (confirm('Are you sure you want to delete this table?')) {
        const wrapper = tableDel.closest('.table-wrapper');
        if (wrapper) wrapper.remove();
        else {
          const table = tableDel.closest('table');
          if (table) table.remove();
        }
        showToast('Table deleted', 'info');
      }
    }
  });
}

function insertTableIntoEditor(editor) {
  const rowsInput = prompt('Enter number of rows (including header):', '3');
  if (rowsInput === null) return;
  const colsInput = prompt('Enter number of columns:', '3');
  if (colsInput === null) return;

  const rows = Math.min(Math.max(parseInt(rowsInput, 10) || 3, 2), 20);
  const cols = Math.min(Math.max(parseInt(colsInput, 10) || 3, 1), 10);

  let tableHtml = '<div class="table-wrapper"><div class="table-control-bar"><button type="button" class="btn-table-action table-add-row" title="Add Row">➕ Row</button><button type="button" class="btn-table-action table-add-col" title="Add Column">➕ Col</button><button type="button" class="btn-table-action table-del" title="Delete Table">🗑️</button></div><table class="custom-rich-table"><thead><tr>';
  for (let c = 1; c <= cols; c++) {
    tableHtml += `<th>Header ${c}</th>`;
  }
  tableHtml += '</tr></thead><tbody>';

  for (let r = 1; r < rows; r++) {
    tableHtml += '<tr>';
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<td>Cell ${r},${c}</td>`;
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody></table></div><p><br></p>';

  editor.focus();
  document.execCommand('insertHTML', false, tableHtml);
  showToast(`Inserted ${rows}x${cols} table! Click cells to type or use + to add rows/cols.`, 'success');
}

function appendTableRow(table) {
  const tbody = table.querySelector('tbody') || table;
  let colCount = 0;
  const ths = table.querySelectorAll('thead th');
  if (ths.length > 0) colCount = ths.length;
  else {
    const firstTr = table.querySelector('tr');
    colCount = firstTr ? firstTr.children.length : 3;
  }

  const rowNum = tbody.querySelectorAll('tr').length + 1;
  const newTr = document.createElement('tr');
  for (let c = 1; c <= colCount; c++) {
    const td = document.createElement('td');
    td.textContent = `Cell ${rowNum},${c}`;
    newTr.appendChild(td);
  }
  tbody.appendChild(newTr);
  showToast('Added row to table (➕ Row)', 'success');
  newTr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function appendTableCol(table) {
  const headerTr = table.querySelector('thead tr') || table.querySelector('tr');
  if (headerTr) {
    const newColNum = headerTr.children.length + 1;
    const th = document.createElement('th');
    th.textContent = `Header ${newColNum}`;
    headerTr.appendChild(th);
  }

  const colIdx = headerTr ? headerTr.children.length : 1;
  const bodyRows = table.querySelectorAll('tbody tr');
  bodyRows.forEach((tr, rIdx) => {
    const td = document.createElement('td');
    td.textContent = `Cell ${rIdx + 1},${colIdx}`;
    tr.appendChild(td);
  });
  showToast('Added column to table (➕ Col)', 'success');
}

function addTableRowToEditor(editor) {
  const selection = window.getSelection();
  let table = null;
  if (selection.rangeCount > 0) {
    let node = selection.anchorNode;
    while (node && node !== editor) {
      if (node.nodeName === 'TABLE') {
        table = node;
        break;
      }
      node = node.parentNode;
    }
  }
  if (!table) {
    const tables = editor.querySelectorAll('table');
    if (tables.length > 0) table = tables[tables.length - 1];
  }

  if (!table) {
    showToast('Please insert a table first or click inside a table to add row', 'info');
    return;
  }
  appendTableRow(table);
}

function addTableColToEditor(editor) {
  const selection = window.getSelection();
  let table = null;
  if (selection.rangeCount > 0) {
    let node = selection.anchorNode;
    while (node && node !== editor) {
      if (node.nodeName === 'TABLE') {
        table = node;
        break;
      }
      node = node.parentNode;
    }
  }
  if (!table) {
    const tables = editor.querySelectorAll('table');
    if (tables.length > 0) table = tables[tables.length - 1];
  }

  if (!table) {
    showToast('Please insert a table first or click inside a table to add column', 'info');
    return;
  }
  appendTableCol(table);
}

/* ==========================================================================
   SECTION 3: Notepad (Multi-Note System & Word-like Rich Text)
   ========================================================================== */

function renderNotepad() {
  renderNotes();
}

function renderNotes() {
  if (!DOM.notesContainer) return;
  DOM.notesContainer.innerHTML = '';

  if (!STATE.notes || STATE.notes.length === 0) {
    if (DOM.notesEmptyState) DOM.notesEmptyState.style.display = 'block';
    return;
  }

  if (DOM.notesEmptyState) DOM.notesEmptyState.style.display = 'none';

  STATE.notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.id = `note-${note.id}`;

    const dateStr = new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const tagHtml = note.tag ? `<span class="note-card-tag">${escapeHtml(note.tag)}</span>` : '';

    // Render content with rich-text HTML support!
    const noteHtmlContent = sanitizeHtml(note.content);

    card.innerHTML = `
      <div class="note-card-header">
        <div class="note-card-title-group">
          <div class="note-card-title">${escapeHtml(note.title)}</div>
          <div class="note-card-meta">
            ${tagHtml}
            <span class="note-card-date">🕒 ${dateStr}</span>
          </div>
        </div>
        <div class="note-card-actions">
          <button type="button" class="btn-card-action edit-note-btn" title="Edit Note" aria-label="Edit Note">
            ✏️
          </button>
          <button type="button" class="btn-card-action copy-note-btn" title="Copy Note Content" aria-label="Copy Note">
            📋
          </button>
          <button type="button" class="btn-card-action delete-note-btn" title="Delete Note" aria-label="Delete Note">
            🗑️
          </button>
        </div>
      </div>
      <div class="note-card-content">${noteHtmlContent}</div>
    `;

    // Action Listeners
    const editBtn = card.querySelector('.edit-note-btn');
    const copyBtn = card.querySelector('.copy-note-btn');
    const deleteBtn = card.querySelector('.delete-note-btn');

    editBtn.addEventListener('click', () => openEditNoteModal(note.id));
    copyBtn.addEventListener('click', () => copyNote(note.id));
    deleteBtn.addEventListener('click', () => deleteNote(note.id));

    DOM.notesContainer.appendChild(card);
  });
}

function openAddNoteModal() {
  STATE.editingNoteId = null;
  DOM.noteIdInput.value = '';
  DOM.noteTitleInput.value = '';
  DOM.noteTagInput.value = '';
  if (DOM.noteExplanationEditor) {
    DOM.noteExplanationEditor.innerHTML = '';
  }
  DOM.noteModalTitle.innerHTML = '<span>📝</span> Add New Note';
  DOM.noteModal.classList.add('open');
  pushModalHistory('noteModal');
  setTimeout(() => DOM.noteTitleInput.focus(), 100);
}

function openEditNoteModal(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return;

  STATE.editingNoteId = noteId;
  DOM.noteIdInput.value = note.id;
  DOM.noteTitleInput.value = note.title;
  DOM.noteTagInput.value = note.tag || '';
  if (DOM.noteExplanationEditor) {
    DOM.noteExplanationEditor.innerHTML = note.content;
  }
  DOM.noteModalTitle.innerHTML = '<span>✏️</span> Edit Note';
  DOM.noteModal.classList.add('open');
  pushModalHistory('noteModal');
  setTimeout(() => DOM.noteTitleInput.focus(), 100);
}

function closeNoteModal(triggerHistoryBack = false) {
  if (DOM.noteModal) {
    DOM.noteModal.classList.remove('open');
  }
  if (DOM.noteForm) DOM.noteForm.reset();
  if (DOM.noteExplanationEditor) {
    DOM.noteExplanationEditor.innerHTML = '';
  }
  STATE.editingNoteId = null;

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function saveNoteForm(e) {
  if (e) e.preventDefault();

  const title = DOM.noteTitleInput.value.trim();
  const tag = DOM.noteTagInput.value.trim();
  const rawContent = DOM.noteExplanationEditor ? DOM.noteExplanationEditor.innerHTML.trim() : '';
  const textCheck = DOM.noteExplanationEditor ? DOM.noteExplanationEditor.textContent.trim() : '';

  if (!title) {
    alert('Please enter a note title');
    DOM.noteTitleInput.focus();
    return;
  }

  if (!textCheck && !rawContent.includes('<img') && !rawContent.includes('<table')) {
    alert('Please write some content for the note');
    if (DOM.noteExplanationEditor) DOM.noteExplanationEditor.focus();
    return;
  }

  const content = sanitizeHtml(rawContent);
  let savedNoteItem = null;

  if (STATE.editingNoteId) {
    // Update existing note
    const note = STATE.notes.find(n => n.id === STATE.editingNoteId);
    if (note) {
      note.title = title;
      note.tag = tag;
      note.content = content;
      note.updatedAt = Date.now();
      savedNoteItem = note;
    }
  } else {
    // Create new note (add to TOP)
    const newNote = {
      id: 'note-' + Date.now(),
      title,
      tag,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    STATE.notes.unshift(newNote);
    savedNoteItem = newNote;
  }

  saveNotes();
  updateBadges();
  renderNotes();

  // CLOSE the add/edit note section immediately!
  closeNoteModal(false);

  // Directly apply and push to persistent cloud sync
  syncGlobally();
}

function deleteNote(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return;

  if (!confirm(`Are you sure you want to delete note "${note.title}"?`)) {
    return;
  }

  STATE.notes = STATE.notes.filter(n => n.id !== noteId);
  saveNotes();
  updateBadges();
  renderNotes();

  syncGlobally();

  showToast(`Deleted note: "${note.title}"`, 'info');
}

function copyNote(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = note.content;
  const plainText = tempDiv.innerText || tempDiv.textContent || '';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(plainText).then(() => {
      showToast('Note content copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopyText(plainText);
    });
  } else {
    fallbackCopyText(plainText);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  showToast('Note content copied!', 'success');
}

/* ==========================================================================
   SECTION: Study Resources & Files Engine (PDFs, Images, Documents, Any File)
   ========================================================================== */

const IdbResourceStore = {
  dbPromise: null,

  getDB() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve) => {
      try {
        if (!window.indexedDB) {
          resolve(null);
          return;
        }
        const req = indexedDB.open('NathKhat_Resources_DB', 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
    return this.dbPromise;
  },

  async saveFile(id, fileData, mimeType, name) {
    const db = await this.getDB();
    if (!db) {
      try { sessionStorage.setItem('nk_file_' + id, fileData); } catch (e) {}
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        store.put({ id, data: fileData, mimeType, name, updatedAt: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  },

  async getFile(id) {
    const db = await this.getDB();
    if (!db) {
      try { return sessionStorage.getItem('nk_file_' + id); } catch (e) { return null; }
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  },

  async deleteFile(id) {
    const db = await this.getDB();
    if (!db) {
      try { sessionStorage.removeItem('nk_file_' + id); } catch (e) {}
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }
};

function getFileTypeGroup(fileName, mimeType) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (ext === 'pdf' || mime.includes('pdf')) return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext) || mime.startsWith('image/')) return 'image';
  if (['doc', 'docx', 'odt', 'rtf', 'txt', 'md'].includes(ext) || mime.includes('word') || mime.includes('text/plain') || mime.includes('markdown')) return 'doc';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) return 'sheet';
  if (['ppt', 'pptx', 'odp'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) return 'doc';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) return 'archive';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext) || mime.startsWith('audio/')) return 'audio';
  return 'other';
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function generateImageThumbnail(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 380;
        const maxH = 220;
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function renderResources() {
  if (!DOM.resourcesContainer) return;
  DOM.resourcesContainer.innerHTML = '';

  const resources = STATE.resources || [];

  // Update breakdown counts
  const totalCount = resources.length;
  const pdfCount = resources.filter(r => r.typeGroup === 'pdf').length;
  const imgCount = resources.filter(r => r.typeGroup === 'image').length;
  const docCount = resources.filter(r => r.typeGroup === 'doc' || r.typeGroup === 'sheet').length;
  const otherCount = resources.filter(r => !['pdf', 'image', 'doc', 'sheet'].includes(r.typeGroup)).length;

  if (DOM.typeCountAll) DOM.typeCountAll.textContent = totalCount;
  if (DOM.typeCountPdf) DOM.typeCountPdf.textContent = pdfCount;
  if (DOM.typeCountImage) DOM.typeCountImage.textContent = imgCount;
  if (DOM.typeCountDoc) DOM.typeCountDoc.textContent = docCount;
  if (DOM.typeCountOther) DOM.typeCountOther.textContent = otherCount;

  // Calculate total size
  const totalBytes = resources.reduce((acc, r) => acc + (r.size || 0), 0);
  const formattedTotalSize = formatFileSize(totalBytes);
  if (DOM.resourcesStatsOverview) {
    DOM.resourcesStatsOverview.textContent = `${totalCount} Resource${totalCount === 1 ? '' : 's'} (${formattedTotalSize}) • ${pdfCount} PDFs • ${imgCount} Images • ${docCount} Docs`;
  }

  // Filter by Paper
  let filtered = [...resources];
  if (STATE.activePaper !== 'ALL') {
    filtered = filtered.filter(r => r.paper === STATE.activePaper || r.paper === 'ALL');
  }

  // Filter by File Type Pill
  if (STATE.activeResourceTypeFilter !== 'all') {
    if (STATE.activeResourceTypeFilter === 'doc') {
      filtered = filtered.filter(r => r.typeGroup === 'doc' || r.typeGroup === 'sheet');
    } else if (STATE.activeResourceTypeFilter === 'other') {
      filtered = filtered.filter(r => !['pdf', 'image', 'doc', 'sheet'].includes(r.typeGroup));
    } else {
      filtered = filtered.filter(r => r.typeGroup === STATE.activeResourceTypeFilter);
    }
  }

  // Filter by Search Query
  const q = (STATE.resourceSearchQuery || STATE.searchQuery || '').trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(r => {
      return (
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.fileName && r.fileName.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q)) ||
        (r.unit && r.unit.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }

  // Sort
  if (STATE.resourceSortBy === 'newest') {
    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (STATE.resourceSortBy === 'oldest') {
    filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  } else if (STATE.resourceSortBy === 'name') {
    filtered.sort((a, b) => (a.title || a.fileName || '').localeCompare(b.title || b.fileName || ''));
  } else if (STATE.resourceSortBy === 'size-desc') {
    filtered.sort((a, b) => (b.size || 0) - (a.size || 0));
  } else if (STATE.resourceSortBy === 'size-asc') {
    filtered.sort((a, b) => (a.size || 0) - (b.size || 0));
  }

  // Empty state handling
  if (filtered.length === 0) {
    if (DOM.resourcesEmptyState) DOM.resourcesEmptyState.style.display = 'block';
    return;
  }
  if (DOM.resourcesEmptyState) DOM.resourcesEmptyState.style.display = 'none';

  // Render cards
  filtered.forEach(res => {
    const card = document.createElement('div');
    card.className = `resource-card type-${res.typeGroup || 'other'}`;
    card.id = `res-card-${res.id}`;

    // Type badge label & icon
    let typeBadgeText = 'FILE';
    let typeBadgeClass = 'badge-other';
    if (res.typeGroup === 'pdf') {
      typeBadgeText = '📄 PDF';
      typeBadgeClass = 'badge-pdf';
    } else if (res.typeGroup === 'image') {
      typeBadgeText = '🖼️ IMAGE';
      typeBadgeClass = 'badge-image';
    } else if (res.typeGroup === 'doc') {
      typeBadgeText = '📑 DOC';
      typeBadgeClass = 'badge-doc';
    } else if (res.typeGroup === 'sheet') {
      typeBadgeText = '📊 DATA';
      typeBadgeClass = 'badge-sheet';
    } else if (res.typeGroup === 'archive') {
      typeBadgeText = '📦 ZIP';
      typeBadgeClass = 'badge-archive';
    } else if (res.typeGroup === 'audio') {
      typeBadgeText = '🎵 AUDIO';
      typeBadgeClass = 'badge-audio';
    }

    // Paper Tag
    const paperTagClass = res.paper === 'P1' ? 'tag-p1' : (res.paper === 'P2' ? 'tag-p2' : 'tag-all');
    const paperTagText = res.paper === 'P1' ? 'Paper 1' : (res.paper === 'P2' ? 'Paper 2' : 'All Papers');

    // Date
    const dateStr = new Date(res.updatedAt || res.createdAt || Date.now()).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Media Preview Stage
    let previewStageHtml = '';
    if (res.typeGroup === 'image') {
      const imgSrc = res.thumbnail || res.dataUrl || '';
      previewStageHtml = `
        <div class="resource-preview-stage" title="Click to inspect image in full resolution">
          <img class="resource-img-thumb" src="${imgSrc || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><text y=\'50\' font-size=\'30\'>🖼️</text></svg>'}" alt="${escapeHtml(res.title)}" />
        </div>
      `;
    } else if (res.typeGroup === 'pdf') {
      previewStageHtml = `
        <div class="resource-preview-stage" title="Click to preview PDF document">
          <div class="resource-pdf-preview-box">
            <span class="pdf-icon-large">📄</span>
            <span class="pdf-click-hint">Click to Preview PDF</span>
          </div>
        </div>
      `;
    } else {
      let icon = '📎';
      if (res.typeGroup === 'doc') icon = '📑';
      if (res.typeGroup === 'sheet') icon = '📊';
      if (res.typeGroup === 'archive') icon = '📦';
      if (res.typeGroup === 'audio') icon = '🎵';

      previewStageHtml = `
        <div class="resource-preview-stage" title="Click to view file details">
          <div class="resource-file-preview-box">
            <span class="file-icon-large">${icon}</span>
            <span class="file-click-hint">Click to Preview File</span>
          </div>
        </div>
      `;
    }

    // Highlight search match in title
    const highlightedTitle = q ? highlightSearchMatch(res.title || res.fileName, q) : escapeHtml(res.title || res.fileName);

    card.innerHTML = `
      <div class="resource-card-header">
        <div class="resource-card-badges">
          <span class="resource-type-tag ${typeBadgeClass}">${typeBadgeText}</span>
          <span class="resource-paper-tag ${paperTagClass}">${paperTagText}</span>
        </div>
        <div class="resource-card-actions">
          <button type="button" class="btn-card-action res-preview-btn" title="Preview / View file" aria-label="Preview">👁️</button>
          <button type="button" class="btn-card-action res-download-btn" title="Download file" aria-label="Download">⬇️</button>
          <button type="button" class="btn-card-action res-edit-btn" title="Edit resource details" aria-label="Edit">✏️</button>
          <button type="button" class="btn-card-action res-delete-btn" title="Delete resource" aria-label="Delete">🗑️</button>
        </div>
      </div>

      ${previewStageHtml}

      <div class="resource-card-content">
        <div class="resource-card-title">${highlightedTitle}</div>
        <div class="resource-file-name-row">
          <span>📎</span>
          <span style="overflow: hidden; text-overflow: ellipsis;">${escapeHtml(res.fileName || 'file')}</span>
          <span class="resource-size-pill">${res.sizeFormatted || formatFileSize(res.size)}</span>
        </div>

        <div class="resource-card-meta-row">
          ${res.category ? `<span class="resource-cat-tag">${escapeHtml(res.category)}</span>` : ''}
          ${res.unit ? `<span class="resource-unit-tag">${escapeHtml(res.unit)}</span>` : ''}
        </div>

        ${res.description ? `<div class="resource-card-desc">${escapeHtml(res.description)}</div>` : ''}
      </div>

      <div class="resource-card-footer">
        <span class="resource-date-str">🕒 ${dateStr}</span>
        <div class="resource-footer-buttons">
          <button type="button" class="btn-card-preview res-preview-btn">👁️ Preview</button>
          <button type="button" class="btn-card-download res-download-btn">⬇️ Download</button>
        </div>
      </div>
    `;

    // Event listeners
    card.querySelectorAll('.res-preview-btn').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      openResourcePreview(res.id);
    }));

    const stage = card.querySelector('.resource-preview-stage');
    if (stage) {
      stage.addEventListener('click', () => openResourcePreview(res.id));
    }

    card.querySelectorAll('.res-download-btn').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadResource(res.id);
    }));

    card.querySelectorAll('.res-edit-btn').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditResourceModal(res.id);
    }));

    card.querySelectorAll('.res-delete-btn').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteResource(res.id);
    }));

    DOM.resourcesContainer.appendChild(card);
  });
}

function openAddResourceModal(preloadedFile = null) {
  STATE.editingResourceId = null;
  STATE.currentSelectedUploadFile = null;

  if (DOM.resourceForm) DOM.resourceForm.reset();
  if (DOM.resourceIdInput) DOM.resourceIdInput.value = '';
  if (DOM.resourceModalTitle) DOM.resourceModalTitle.innerHTML = '<span>📁</span> Upload Study Resource';
  if (DOM.resourcePaperInput) DOM.resourcePaperInput.value = STATE.activePaper !== 'ALL' ? STATE.activePaper : 'ALL';

  // Modal file picker state
  if (DOM.modalFileSelectGroup) DOM.modalFileSelectGroup.style.display = 'block';
  if (DOM.modalFilePrompt) DOM.modalFilePrompt.style.display = 'flex';
  if (DOM.modalFileSelected) DOM.modalFileSelected.style.display = 'none';

  if (preloadedFile) {
    handleModalFilePicked(preloadedFile);
  }

  if (DOM.resourceModal) {
    DOM.resourceModal.classList.add('open');
    pushModalHistory('resourceModal');
    if (DOM.resourceTitleInput) DOM.resourceTitleInput.focus();
  }
}

function openEditResourceModal(resourceId) {
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res) return;

  STATE.editingResourceId = resourceId;
  STATE.currentSelectedUploadFile = null;

  if (DOM.resourceForm) DOM.resourceForm.reset();
  if (DOM.resourceIdInput) DOM.resourceIdInput.value = res.id;
  if (DOM.resourceModalTitle) DOM.resourceModalTitle.innerHTML = '<span>✏️</span> Edit Resource Details';
  if (DOM.resourceTitleInput) DOM.resourceTitleInput.value = res.title || '';
  if (DOM.resourcePaperInput) DOM.resourcePaperInput.value = res.paper || 'ALL';
  if (DOM.resourceCategoryInput) DOM.resourceCategoryInput.value = res.category || 'PDF Document';
  if (DOM.resourceUnitInput) DOM.resourceUnitInput.value = res.unit || '';
  if (DOM.resourceDescInput) DOM.resourceDescInput.value = res.description || '';

  // Show selected file indicator
  if (DOM.modalFilePrompt) DOM.modalFilePrompt.style.display = 'none';
  if (DOM.modalFileSelected) DOM.modalFileSelected.style.display = 'flex';
  if (DOM.modalSelectedFileName) DOM.modalSelectedFileName.textContent = res.fileName || 'file';
  if (DOM.modalSelectedFileMeta) DOM.modalSelectedFileMeta.textContent = `${res.sizeFormatted || formatFileSize(res.size)} • ${res.mimeType || 'file'}`;
  if (DOM.modalSelectedBadge) DOM.modalSelectedBadge.textContent = res.extension ? res.extension.toUpperCase() : 'FILE';

  if (DOM.resourceModal) {
    DOM.resourceModal.classList.add('open');
    pushModalHistory('resourceModal');
    if (DOM.resourceTitleInput) DOM.resourceTitleInput.focus();
  }
}

function closeResourceModal(triggerHistoryBack = false) {
  if (DOM.resourceModal) {
    DOM.resourceModal.classList.remove('open');
  }
  if (DOM.resourceForm) DOM.resourceForm.reset();
  STATE.editingResourceId = null;
  STATE.currentSelectedUploadFile = null;

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function handleModalFilePicked(file) {
  if (!file) return;
  STATE.currentSelectedUploadFile = file;

  if (DOM.modalFilePrompt) DOM.modalFilePrompt.style.display = 'none';
  if (DOM.modalFileSelected) DOM.modalFileSelected.style.display = 'flex';
  if (DOM.modalSelectedFileName) DOM.modalSelectedFileName.textContent = file.name;
  if (DOM.modalSelectedFileMeta) DOM.modalSelectedFileMeta.textContent = `${formatFileSize(file.size)} • ${file.type || 'unknown type'}`;

  const ext = file.name.split('.').pop().toUpperCase();
  if (DOM.modalSelectedBadge) DOM.modalSelectedBadge.textContent = ext || 'FILE';

  // Auto populate title if title field is currently blank
  if (DOM.resourceTitleInput && !DOM.resourceTitleInput.value.trim()) {
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    DOM.resourceTitleInput.value = cleanTitle;
  }

  // Auto detect category
  if (DOM.resourceCategoryInput) {
    const group = getFileTypeGroup(file.name, file.type);
    if (group === 'pdf') DOM.resourceCategoryInput.value = 'PDF Document';
    else if (group === 'image') DOM.resourceCategoryInput.value = 'Diagram / Chart';
    else if (group === 'sheet') DOM.resourceCategoryInput.value = 'Formula Sheet';
  }
}

async function saveResourceForm(e) {
  if (e) e.preventDefault();

  const title = (DOM.resourceTitleInput ? DOM.resourceTitleInput.value : '').trim();
  if (!title) {
    showToast('Please enter a Resource Title.', 'error');
    if (DOM.resourceTitleInput) DOM.resourceTitleInput.focus();
    return;
  }

  const paper = DOM.resourcePaperInput ? DOM.resourcePaperInput.value : 'ALL';
  const category = DOM.resourceCategoryInput ? DOM.resourceCategoryInput.value : 'PDF Document';
  const unit = (DOM.resourceUnitInput ? DOM.resourceUnitInput.value : '').trim();
  const desc = (DOM.resourceDescInput ? DOM.resourceDescInput.value : '').trim();

  // If editing an existing resource
  if (STATE.editingResourceId) {
    const idx = STATE.resources.findIndex(r => r.id === STATE.editingResourceId);
    if (idx !== -1) {
      STATE.resources[idx].title = title;
      STATE.resources[idx].paper = paper;
      STATE.resources[idx].category = category;
      STATE.resources[idx].unit = unit;
      STATE.resources[idx].description = desc;
      STATE.resources[idx].updatedAt = Date.now();

      // If user also replaced the file
      if (STATE.currentSelectedUploadFile) {
        const file = STATE.currentSelectedUploadFile;
        const group = getFileTypeGroup(file.name, file.type);
        const ext = file.name.split('.').pop().toLowerCase();
        let thumb = '';
        if (group === 'image') {
          thumb = await generateImageThumbnail(file);
        }

        const fileDataUrl = await readFileAsDataURL(file);
        await IdbResourceStore.saveFile(STATE.editingResourceId, fileDataUrl, file.type, file.name);

        STATE.resources[idx].fileName = file.name;
        STATE.resources[idx].size = file.size;
        STATE.resources[idx].sizeFormatted = formatFileSize(file.size);
        STATE.resources[idx].mimeType = file.type || 'application/octet-stream';
        STATE.resources[idx].extension = ext;
        STATE.resources[idx].typeGroup = group;
        if (thumb) STATE.resources[idx].thumbnail = thumb;
      }

      saveResources();
      renderResources();
      updateBadges();
      syncGlobally();
      closeResourceModal();
      showToast(`Updated resource: "${title}"`, 'success');
      return;
    }
  }

  // Adding a new resource
  const file = STATE.currentSelectedUploadFile;
  if (!file) {
    showToast('Please select a file to upload.', 'error');
    return;
  }

  const resId = 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  const group = getFileTypeGroup(file.name, file.type);
  const ext = file.name.split('.').pop().toLowerCase();

  let thumb = '';
  if (group === 'image') {
    thumb = await generateImageThumbnail(file);
  }

  const fileDataUrl = await readFileAsDataURL(file);
  await IdbResourceStore.saveFile(resId, fileDataUrl, file.type, file.name);

  const newResource = {
    id: resId,
    title,
    fileName: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    mimeType: file.type || 'application/octet-stream',
    extension: ext,
    typeGroup: group,
    paper,
    category,
    unit,
    description: desc,
    thumbnail: thumb,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  STATE.resources.unshift(newResource);
  saveResources();
  renderResources();
  updateBadges();
  syncGlobally();
  closeResourceModal();
  showToast(`Uploaded "${title}" successfully!`, 'success');
}

async function handleBatchResourceFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const files = Array.from(fileList);

  if (files.length === 1) {
    openAddResourceModal(files[0]);
    return;
  }

  showToast(`Uploading ${files.length} files...`, 'info');

  for (const file of files) {
    const resId = 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const group = getFileTypeGroup(file.name, file.type);
    const ext = file.name.split('.').pop().toLowerCase();
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

    let thumb = '';
    if (group === 'image') {
      thumb = await generateImageThumbnail(file);
    }

    const fileDataUrl = await readFileAsDataURL(file);
    await IdbResourceStore.saveFile(resId, fileDataUrl, file.type, file.name);

    let category = 'Other Resource';
    if (group === 'pdf') category = 'PDF Document';
    else if (group === 'image') category = 'Diagram / Chart';
    else if (group === 'sheet') category = 'Formula Sheet';
    else if (group === 'doc') category = 'Handout / Book Chapter';

    const newResource = {
      id: resId,
      title: cleanTitle,
      fileName: file.name,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      mimeType: file.type || 'application/octet-stream',
      extension: ext,
      typeGroup: group,
      paper: STATE.activePaper !== 'ALL' ? STATE.activePaper : 'ALL',
      category,
      unit: '',
      description: '',
      thumbnail: thumb,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    STATE.resources.unshift(newResource);
  }

  saveResources();
  renderResources();
  updateBadges();
  syncGlobally();
  showToast(`Successfully added ${files.length} resources!`, 'success');
}

async function deleteResource(resourceId) {
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res) return;

  if (!confirm(`Are you sure you want to delete "${res.title}"?`)) {
    return;
  }

  STATE.resources = STATE.resources.filter(r => r.id !== resourceId);
  await IdbResourceStore.deleteFile(resourceId);

  saveResources();
  renderResources();
  updateBadges();
  syncGlobally();
  showToast(`Deleted resource: "${res.title}"`, 'info');
}

async function downloadResource(resourceId) {
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res) return;

  let data = await IdbResourceStore.getFile(resourceId);
  if (!data && (res.thumbnail || res.dataUrl)) {
    data = res.thumbnail || res.dataUrl;
  }

  if (!data) {
    const sampleText = `${res.title}\n${res.description || ''}\nPaper: ${res.paper}\nCategory: ${res.category}\nUnit: ${res.unit}\n\nGenerated by NathKhat Revision Hub`;
    const blob = new Blob([sampleText], { type: res.mimeType || 'text/plain' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = res.fileName || 'resource.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(blobUrl);
    }, 1000);
    showToast(`Downloaded: ${res.fileName}`, 'success');
    return;
  }

  const a = document.createElement('a');
  a.href = data;
  a.download = res.fileName || 'download';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 1000);
  showToast(`Downloaded: ${res.fileName}`, 'success');
}

async function openResourcePreview(resourceId) {
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res) return;

  STATE.activePreviewResourceId = resourceId;

  if (DOM.previewModalTitle) DOM.previewModalTitle.textContent = res.title;
  if (DOM.previewMetaSub) DOM.previewMetaSub.textContent = `${res.fileName} • ${res.sizeFormatted || formatFileSize(res.size)} • ${res.paper}`;
  if (DOM.previewTypeBadge) DOM.previewTypeBadge.textContent = res.extension ? res.extension.toUpperCase() : 'FILE';

  if (!DOM.resourcePreviewBody) return;
  DOM.resourcePreviewBody.innerHTML = '<div style="padding: 2rem; color: var(--text-dim);">Loading preview...</div>';

  let data = await IdbResourceStore.getFile(resourceId);
  if (!data && (res.thumbnail || res.dataUrl)) {
    data = res.thumbnail || res.dataUrl;
  }

  if (DOM.previewOpenNewTabBtn) {
    DOM.previewOpenNewTabBtn.onclick = () => {
      if (data) {
        const newWin = window.open();
        if (newWin) {
          if (res.typeGroup === 'pdf' || res.typeGroup === 'image') {
            newWin.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
          } else {
            newWin.document.write(`<pre style="font-family: monospace; padding: 20px; white-space: pre-wrap;">${escapeHtml(res.description || res.title)}</pre>`);
          }
        }
      } else {
        downloadResource(resourceId);
      }
    };
  }

  if (DOM.previewDownloadBtn) {
    DOM.previewDownloadBtn.onclick = () => downloadResource(resourceId);
  }

  if (res.typeGroup === 'image') {
    const imgSrc = data || res.thumbnail || '';
    DOM.resourcePreviewBody.innerHTML = `
      <img class="image-preview-full" src="${imgSrc}" alt="${escapeHtml(res.title)}" />
    `;
  } else if (res.typeGroup === 'pdf') {
    if (data && data.startsWith('data:')) {
      DOM.resourcePreviewBody.innerHTML = `
        <iframe class="pdf-preview-iframe" src="${data}" title="${escapeHtml(res.title)}"></iframe>
      `;
    } else {
      DOM.resourcePreviewBody.innerHTML = `
        <div class="generic-file-view">
          <span class="generic-file-icon">📄</span>
          <div class="generic-file-title">${escapeHtml(res.title)}</div>
          <div class="generic-file-specs">${escapeHtml(res.fileName)} • ${res.sizeFormatted || formatFileSize(res.size)}</div>
          <p style="color: var(--text-muted); max-width: 500px; line-height: 1.6;">${escapeHtml(res.description || 'PDF Document ready for exam revision.')}</p>
          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button type="button" class="btn-primary" onclick="downloadResource('${res.id}')">⬇️ Download PDF</button>
          </div>
        </div>
      `;
    }
  } else if (res.typeGroup === 'doc' && (res.extension === 'txt' || res.extension === 'md')) {
    let textContent = res.description || 'Text content';
    if (data && data.startsWith('data:text')) {
      try {
        const base64Part = data.split(',')[1];
        textContent = decodeURIComponent(escape(atob(base64Part)));
      } catch (e) {
        textContent = data;
      }
    }
    DOM.resourcePreviewBody.innerHTML = `
      <pre class="text-preview-code"><code>${escapeHtml(textContent)}</code></pre>
    `;
  } else if (res.typeGroup === 'audio') {
    DOM.resourcePreviewBody.innerHTML = `
      <div class="media-preview-container">
        <span style="font-size: 3.5rem;">🎵</span>
        <div class="generic-file-title">${escapeHtml(res.title)}</div>
        <audio controls src="${data || ''}" style="width: 100%; max-width: 480px;"></audio>
      </div>
    `;
  } else {
    let fileIcon = '📁';
    if (res.typeGroup === 'doc') fileIcon = '📑';
    if (res.typeGroup === 'sheet') fileIcon = '📊';
    if (res.typeGroup === 'archive') fileIcon = '📦';

    DOM.resourcePreviewBody.innerHTML = `
      <div class="generic-file-view">
        <span class="generic-file-icon">${fileIcon}</span>
        <div class="generic-file-title">${escapeHtml(res.title)}</div>
        <div class="generic-file-specs">${escapeHtml(res.fileName)} • ${res.sizeFormatted || formatFileSize(res.size)} • ${res.mimeType || 'file'}</div>
        ${res.description ? `<p style="color: var(--text-muted); max-width: 550px; line-height: 1.6;">${escapeHtml(res.description)}</p>` : ''}
        <button type="button" class="btn-primary" style="margin-top: 1rem;" onclick="downloadResource('${res.id}')">
          <span>⬇️</span> Download File
        </button>
      </div>
    `;
  }

  if (DOM.resourcePreviewModal) {
    DOM.resourcePreviewModal.classList.add('open');
    pushModalHistory('resourcePreviewModal');
  }
}

function closeResourcePreview(triggerHistoryBack = false) {
  if (DOM.resourcePreviewModal) {
    DOM.resourcePreviewModal.classList.remove('open');
  }
  if (DOM.resourcePreviewBody) {
    DOM.resourcePreviewBody.innerHTML = '';
  }
  STATE.activePreviewResourceId = null;

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function setupResourceEventListeners() {
  // Navigation tab
  if (DOM.tabResourcesView) {
    DOM.tabResourcesView.addEventListener('click', () => switchView('resourcesView'));
  }

  // Open Upload Modal Buttons
  if (DOM.openUploadResourceBtn) {
    DOM.openUploadResourceBtn.addEventListener('click', () => openAddResourceModal());
  }
  if (DOM.emptyStateUploadBtn) {
    DOM.emptyStateUploadBtn.addEventListener('click', () => openAddResourceModal());
  }

  // Modal Close & Form
  if (DOM.closeResourceModalBtn) {
    DOM.closeResourceModalBtn.addEventListener('click', () => closeResourceModal(false));
  }
  if (DOM.cancelResourceModalBtn) {
    DOM.cancelResourceModalBtn.addEventListener('click', () => closeResourceModal(false));
  }
  if (DOM.saveResourceBtn) {
    DOM.saveResourceBtn.addEventListener('click', saveResourceForm);
  }
  if (DOM.resourceForm) {
    DOM.resourceForm.addEventListener('submit', saveResourceForm);
  }

  // Modal File Selector
  if (DOM.modalFileDropzone) {
    DOM.modalFileDropzone.addEventListener('click', (e) => {
      if (e.target.id === 'modalChangeFileBtn' || !e.target.closest('#modalChangeFileBtn')) {
        if (DOM.modalFileInput) DOM.modalFileInput.click();
      }
    });
  }
  if (DOM.modalFileInput) {
    DOM.modalFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleModalFilePicked(e.target.files[0]);
      }
    });
  }
  if (DOM.modalChangeFileBtn) {
    DOM.modalChangeFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (DOM.modalFileInput) DOM.modalFileInput.click();
    });
  }

  // Drag and Drop on Modal Dropzone
  if (DOM.modalFileDropzone) {
    DOM.modalFileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      DOM.modalFileDropzone.style.borderColor = 'var(--primary)';
    });
    DOM.modalFileDropzone.addEventListener('dragleave', () => {
      DOM.modalFileDropzone.style.borderColor = '';
    });
    DOM.modalFileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      DOM.modalFileDropzone.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleModalFilePicked(e.dataTransfer.files[0]);
      }
    });
  }

  // Interactive Big Dropzone on Resources View
  if (DOM.resourcesDropzone) {
    DOM.resourcesDropzone.addEventListener('click', (e) => {
      if (e.target.id === 'dropzoneBrowseBtn' || !e.target.closest('#dropzoneBrowseBtn')) {
        if (DOM.resourceDropInput) DOM.resourceDropInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(evt => {
      DOM.resourcesDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        DOM.resourcesDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      DOM.resourcesDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        DOM.resourcesDropzone.classList.remove('dragover');
      });
    });

    DOM.resourcesDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleBatchResourceFiles(e.dataTransfer.files);
      }
    });
  }

  if (DOM.resourceDropInput) {
    DOM.resourceDropInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleBatchResourceFiles(e.target.files);
        e.target.value = '';
      }
    });
  }

  if (DOM.dropzoneBrowseBtn) {
    DOM.dropzoneBrowseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (DOM.resourceDropInput) DOM.resourceDropInput.click();
    });
  }

  // Type Filter Pills
  const pills = [
    { el: DOM.pillTypeAll, val: 'all' },
    { el: DOM.pillTypePdf, val: 'pdf' },
    { el: DOM.pillTypeImage, val: 'image' },
    { el: DOM.pillTypeDoc, val: 'doc' },
    { el: DOM.pillTypeOther, val: 'other' }
  ];

  pills.forEach(p => {
    if (p.el) {
      p.el.addEventListener('click', () => {
        STATE.activeResourceTypeFilter = p.val;
        pills.forEach(item => {
          if (item.el) {
            if (item.val === p.val) item.el.classList.add('active');
            else item.el.classList.remove('active');
          }
        });
        renderResources();
      });
    }
  });

  // Resource Search Input
  if (DOM.resourceSearchInput) {
    DOM.resourceSearchInput.addEventListener('input', (e) => {
      STATE.resourceSearchQuery = e.target.value;
      if (DOM.clearResourceSearchBtn) {
        DOM.clearResourceSearchBtn.style.display = STATE.resourceSearchQuery ? 'block' : 'none';
      }
      renderResources();
    });
  }

  if (DOM.clearResourceSearchBtn) {
    DOM.clearResourceSearchBtn.addEventListener('click', () => {
      STATE.resourceSearchQuery = '';
      if (DOM.resourceSearchInput) DOM.resourceSearchInput.value = '';
      DOM.clearResourceSearchBtn.style.display = 'none';
      renderResources();
    });
  }

  // Resource Sorting
  if (DOM.resourceSortSelect) {
    DOM.resourceSortSelect.addEventListener('change', (e) => {
      STATE.resourceSortBy = e.target.value;
      renderResources();
    });
  }

  // Preview Modal Close
  if (DOM.closeResourcePreviewBtn) {
    DOM.closeResourcePreviewBtn.addEventListener('click', () => closeResourcePreview(false));
  }

  // Paste shortcut (Ctrl+V) when in Resources view
  window.addEventListener('paste', (e) => {
    if (STATE.activeView !== 'resourcesView') return;
    if (DOM.resourceModal && DOM.resourceModal.classList.contains('open')) return;

    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    if (!items) return;

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item.kind === 'file') {
        const blob = item.getAsFile();
        if (blob) {
          openAddResourceModal(blob);
          showToast('File captured from clipboard!', 'info');
          break;
        }
      }
    }
  });
}


/* ==========================================================================
   SECTION 4: Recycle Bin (Safe Trash & 1-Click Restore)
   ========================================================================== */

function moveToBin(topicId) {
  const index = STATE.topics.findIndex(t => t.id === topicId);
  if (index === -1) return;

  const topicTitle = STATE.topics[index].title || 'this topic';
  if (!confirm(`Are you sure you want to delete "${topicTitle}"?`)) {
    return;
  }

  const [topic] = STATE.topics.splice(index, 1);
  topic.deletedAt = Date.now();

  STATE.bin.unshift(topic); // Most recently deleted at top

  saveTopics();
  saveBin();
  updateBadges();
  renderIndex();
  renderTopics();
  renderBin();

  syncGlobally();

  showToast(`Moved "${topic.title}" to Recycle Bin`, 'info');
}

function restoreFromBin(topicId) {
  const index = STATE.bin.findIndex(t => t.id === topicId);
  if (index === -1) return;

  const [topic] = STATE.bin.splice(index, 1);
  delete topic.deletedAt;
  topic.updatedAt = Date.now();

  // Restore directly to the TOP of active topics and TOP of Index!
  STATE.topics.unshift(topic);

  saveTopics();
  saveBin();
  updateBadges();
  renderIndex();
  renderBin();

  syncGlobally();

  showToast(`Restored "${topic.title}" back to top of Index!`, 'success');
}

function deletePermanently(topicId) {
  const item = STATE.bin.find(t => t.id === topicId);
  const title = item ? `"${item.title}"` : 'this topic';

  if (!confirm(`Are you sure you want to permanently delete ${title}? It cannot be recovered.`)) {
    return;
  }

  STATE.bin = STATE.bin.filter(t => t.id !== topicId);
  saveBin();
  updateBadges();
  renderBin();
  syncGlobally();
  showToast('Topic permanently deleted', 'error');
}

function emptyBin() {
  if (STATE.bin.length === 0) {
    showToast('Recycle bin is already empty', 'info');
    return;
  }

  if (!confirm(`Are you sure you want to permanently delete all ${STATE.bin.length} items in the Recycle Bin? This action is irreversible.`)) {
    return;
  }

  STATE.bin = [];
  saveBin();
  updateBadges();
  renderBin();
  syncGlobally();
  showToast('Recycle Bin emptied completely', 'error');
}

function renderBin() {
  DOM.binContainer.innerHTML = '';

  if (STATE.bin.length === 0) {
    DOM.binEmptyState.style.display = 'block';
    return;
  }

  DOM.binEmptyState.style.display = 'none';

  STATE.bin.forEach(item => {
    const card = document.createElement('div');
    card.className = 'bin-item-card';

    const dateStr = item.deletedAt ? new Date(item.deletedAt).toLocaleString() : 'Recently';

    card.innerHTML = `
      <div class="bin-item-details">
        <div class="bin-item-title">${item.title}</div>
        <div class="bin-item-meta">
          <span class="badge-paper ${item.paper}">${item.paper}</span>
          <span>Deleted on: ${dateStr}</span>
        </div>
      </div>
      <div class="bin-actions">
        <button type="button" class="btn-restore" data-id="${item.id}" title="Restore to active topics &amp; top of index">
          <span>🔄</span> Restore to Index
        </button>
        <button type="button" class="btn-delete-perm" data-id="${item.id}" title="Delete forever">
          <span>✕</span> Delete Forever
        </button>
      </div>
    `;

    card.querySelector('.btn-restore').addEventListener('click', () => restoreFromBin(item.id));
    card.querySelector('.btn-delete-perm').addEventListener('click', () => deletePermanently(item.id));

    DOM.binContainer.appendChild(card);
  });
}

/* ==========================================================================
   Backup & Restore (JSON Export / Import)
   ========================================================================== */

function openBackupModal() {
  DOM.backupModal.classList.add('open');
  pushModalHistory('backupModal');
}

function closeBackupModal(triggerHistoryBack = false) {
  if (DOM.backupModal) {
    DOM.backupModal.classList.remove('open');
  }
  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function exportBackupJson() {
  const data = {
    app: 'NathKhat UGC NET Revision Hub',
    version: '2.8.0',
    exportDate: new Date().toISOString(),
    topics: STATE.topics,
    bin: STATE.bin,
    notes: STATE.notes,
    resources: STATE.resources,
    notepad: STATE.notepad
  };

  const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', jsonString);
  dlAnchor.setAttribute('download', `nathkhat_backup_${new Date().toISOString().slice(0, 10)}.json`);
  dlAnchor.click();
  showToast('Backup JSON downloaded successfully!', 'success');
}

function importBackupJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed && Array.isArray(parsed.topics)) {
        STATE.topics = parsed.topics;
        if (Array.isArray(parsed.bin)) STATE.bin = parsed.bin;
        if (Array.isArray(parsed.notes)) {
          STATE.notes = parsed.notes;
        } else if (typeof parsed.notepad === 'string' && parsed.notepad.trim()) {
          STATE.notes = [{
            id: 'note-' + Date.now(),
            title: 'Imported Revision Notes',
            tag: 'Imported',
            content: parsed.notepad,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }];
        }
        if (Array.isArray(parsed.resources)) {
          STATE.resources = parsed.resources;
        }

        saveTopics();
        saveBin();
        saveNotes();
        saveResources();
        syncGlobally();

        updateBadges();
        renderIndex();
        renderTopics();
        renderNotepad();
        renderResources();
        renderBin();

        closeBackupModal();
        showToast('Backup restored successfully!', 'success');
      } else {
        showToast('Invalid backup file format.', 'error');
      }
    } catch (err) {
      showToast('Error parsing JSON backup file.', 'error');
    }
  };
  reader.readAsText(file);
}

/* ==========================================================================
   Event Listeners Setup
   ========================================================================== */

function setupEventListeners() {
  // Brand Click -> Return to top of topics
  DOM.brandBtn.addEventListener('click', () => {
    switchView('topicsView');
    setPaperFilter('ALL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Theme Toggle
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

  // Paper Filters
  DOM.filterAll.addEventListener('click', () => setPaperFilter('ALL'));
  DOM.filterP1.addEventListener('click', () => setPaperFilter('P1'));
  DOM.filterP2.addEventListener('click', () => setPaperFilter('P2'));

  // Global Search
  DOM.globalSearchInput.addEventListener('input', (e) => {
    STATE.searchQuery = e.target.value;
    DOM.clearSearchBtn.style.display = STATE.searchQuery ? 'block' : 'none';
    renderIndex();
    renderTopics();
    if (DOM.resourcesView) renderResources();
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.globalSearchInput.value = '';
    STATE.searchQuery = '';
    DOM.clearSearchBtn.style.display = 'none';
    renderIndex();
    renderTopics();
    if (DOM.resourcesView) renderResources();
    DOM.globalSearchInput.focus();
  });

  // Keyboard shortcut '/' to focus search
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && 
        document.activeElement !== DOM.globalSearchInput && 
        document.activeElement !== DOM.topicExplanationEditor &&
        document.activeElement !== DOM.noteExplanationEditor &&
        document.activeElement !== DOM.noteTitleInput &&
        document.activeElement !== DOM.noteTagInput &&
        document.activeElement !== DOM.resourceTitleInput &&
        document.activeElement !== DOM.resourceSearchInput) {
      e.preventDefault();
      DOM.globalSearchInput.focus();
    }
    if (e.key === 'Escape') {
      closeTopicModal();
      closeNoteModal();
      closeResourceModal();
      closeResourcePreview();
      closeBackupModal();
      closeMobileIndex();
    }
  });

  // Index Filter Input
  DOM.indexFilterInput.addEventListener('input', (e) => {
    STATE.indexFilter = e.target.value;
    renderIndex();
  });

  // Section Tabs Navigation
  DOM.tabTopicsView.addEventListener('click', () => switchView('topicsView'));
  DOM.tabNotepadView.addEventListener('click', () => switchView('notepadView'));
  if (DOM.tabResourcesView) DOM.tabResourcesView.addEventListener('click', () => switchView('resourcesView'));
  DOM.tabBinView.addEventListener('click', () => switchView('binView'));

  // Setup Resources Event Listeners
  setupResourceEventListeners();

  // Sort Selection
  DOM.sortSelect.addEventListener('change', (e) => {
    STATE.sortBy = e.target.value;
    renderIndex();
    renderTopics();
  });

  // Add Topic Buttons
  if (DOM.openAddTopicBtn) DOM.openAddTopicBtn.addEventListener('click', openAddTopicModal);
  if (DOM.emptyStateAddBtn) DOM.emptyStateAddBtn.addEventListener('click', openAddTopicModal);

  // Topic Modal Controls
  DOM.closeTopicModalBtn.addEventListener('click', closeTopicModal);
  DOM.cancelTopicModalBtn.addEventListener('click', closeTopicModal);
  DOM.saveTopicBtn.addEventListener('click', saveTopicForm);

  // Notepad & Note Modal Controls
  if (DOM.openAddNoteBtn) DOM.openAddNoteBtn.addEventListener('click', openAddNoteModal);
  if (DOM.emptyStateAddNoteBtn) DOM.emptyStateAddNoteBtn.addEventListener('click', openAddNoteModal);
  if (DOM.closeNoteModalBtn) DOM.closeNoteModalBtn.addEventListener('click', closeNoteModal);
  if (DOM.cancelNoteModalBtn) DOM.cancelNoteModalBtn.addEventListener('click', closeNoteModal);
  if (DOM.saveNoteBtn) DOM.saveNoteBtn.addEventListener('click', saveNoteForm);
  if (DOM.noteForm) DOM.noteForm.addEventListener('submit', saveNoteForm);

  // Bin Controls
  DOM.emptyBinBtn.addEventListener('click', emptyBin);

  // Backup Controls
  if (DOM.backupDataBtn) DOM.backupDataBtn.addEventListener('click', openBackupModal);
  if (DOM.closeBackupModalBtn) DOM.closeBackupModalBtn.addEventListener('click', closeBackupModal);
  if (DOM.closeBackupModalFooterBtn) DOM.closeBackupModalFooterBtn.addEventListener('click', closeBackupModal);
  if (DOM.exportJsonBtn) DOM.exportJsonBtn.addEventListener('click', exportBackupJson);
  if (DOM.importJsonInput) DOM.importJsonInput.addEventListener('change', importBackupJson);

  // 1-Tap Clipboard Data Transfer
  const copyClipboardDataBtn = document.getElementById('copyClipboardDataBtn');
  const pasteClipboardDataBtn = document.getElementById('pasteClipboardDataBtn');

  if (copyClipboardDataBtn) {
    copyClipboardDataBtn.addEventListener('click', () => {
      const exportData = {
        app: 'NathKhat',
        version: '2.8',
        topics: STATE.topics,
        notes: STATE.notes,
        resources: STATE.resources,
        bin: STATE.bin
      };
      const text = JSON.stringify(exportData, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied all data to clipboard! Paste it on your other device.', 'success');
        }).catch(() => {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    });
  }

  if (pasteClipboardDataBtn) {
    pasteClipboardDataBtn.addEventListener('click', async () => {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          text = await navigator.clipboard.readText();
        } catch (e) {}
      }
      if (!text || !text.includes('topics')) {
        text = prompt('Paste your NathKhat JSON data here:');
      }
      if (!text) return;

      try {
        const parsed = JSON.parse(text);
        if (parsed && (Array.isArray(parsed.topics) || Array.isArray(parsed.notes))) {
          if (Array.isArray(parsed.topics)) {
            parsed.topics.forEach(rt => {
              if (!rt || !rt.id) return;
              const idx = STATE.topics.findIndex(t => t.id === rt.id);
              if (idx === -1) {
                STATE.topics.unshift(rt);
              } else if ((rt.updatedAt || 0) > (STATE.topics[idx].updatedAt || 0)) {
                STATE.topics[idx] = rt;
              }
            });
            saveTopics();
          }
          if (Array.isArray(parsed.notes)) {
            parsed.notes.forEach(rn => {
              if (!rn || !rn.id) return;
              const idx = STATE.notes.findIndex(n => n.id === rn.id);
              if (idx === -1) {
                STATE.notes.unshift(rn);
              } else if ((rn.updatedAt || 0) > (STATE.notes[idx].updatedAt || 0)) {
                STATE.notes[idx] = rn;
              }
            });
            saveNotes();
          }
          if (Array.isArray(parsed.resources)) {
            parsed.resources.forEach(rr => {
              if (!rr || !rr.id) return;
              const idx = STATE.resources.findIndex(r => r.id === rr.id);
              if (idx === -1) {
                STATE.resources.unshift(rr);
              } else if ((rr.updatedAt || 0) > (STATE.resources[idx].updatedAt || 0)) {
                STATE.resources[idx] = rr;
              }
            });
            saveResources();
          }
          syncGlobally();
          updateBadges();
          renderIndex();
          renderTopics();
          renderNotes();
          renderResources();
          closeBackupModal();
          showToast('Data merged successfully!', 'success');
        } else {
          showToast('Invalid JSON data format.', 'error');
        }
      } catch (err) {
        showToast('Error parsing clipboard data.', 'error');
      }
    });
  }

  // Mobile Sidebar Toggle & Close (with touch support)
  if (DOM.mobileIndexToggleBtn) {
    DOM.mobileIndexToggleBtn.addEventListener('click', toggleMobileIndex);
  }
  if (DOM.closeMobileSidebarBtn) {
    DOM.closeMobileSidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileIndex();
    });
    DOM.closeMobileSidebarBtn.addEventListener('touchend', (e) => {
      e.stopPropagation();
      e.preventDefault();
      closeMobileIndex();
    });
  }
  if (DOM.sidebarBackdrop) {
    DOM.sidebarBackdrop.addEventListener('click', closeMobileIndex);
    DOM.sidebarBackdrop.addEventListener('touchend', (e) => {
      e.preventDefault();
      closeMobileIndex();
    });
  }

  // Setup WYSIWYG
  setupRichTextEditor();

  // Listen for browser back/forward or hash changes to sync view
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['topicsView', 'notepadView', 'resourcesView', 'binView'].includes(hash) && STATE.activeView !== hash) {
      switchView(hash, false);
    }
  });
}

/* ==========================================================================
   History & Mobile Back-Button Management (Never throw user outside site)
   ========================================================================== */

function initHistoryNavigation() {
  if (!window.history || !window.history.pushState) return;

  // Set an anchor so pressing Back on the main page doesn't exit the site
  if (!window.history.state || !window.history.state.app) {
    window.history.replaceState({ app: 'nathkhat', root: true }, '');
    window.history.pushState({ app: 'nathkhat', view: STATE.activeView }, '');
  }

  window.addEventListener('popstate', (e) => {
    let handled = false;

    // 1. If Add/Edit Topic modal is open -> close it!
    if (DOM.topicModal && DOM.topicModal.classList.contains('open')) {
      closeTopicModal(false);
      handled = true;
    }

    // 2. If Add/Edit Note modal is open -> close it!
    if (DOM.noteModal && DOM.noteModal.classList.contains('open')) {
      closeNoteModal(false);
      handled = true;
    }

    // 3. If Resource Modal is open -> close it!
    if (DOM.resourceModal && DOM.resourceModal.classList.contains('open')) {
      closeResourceModal(false);
      handled = true;
    }

    // 4. If Resource Preview Modal is open -> close it!
    if (DOM.resourcePreviewModal && DOM.resourcePreviewModal.classList.contains('open')) {
      closeResourcePreview(false);
      handled = true;
    }

    // 5. If Backup modal is open -> close it!
    if (DOM.backupModal && DOM.backupModal.classList.contains('open')) {
      closeBackupModal(false);
      handled = true;
    }

    // 6. If Mobile Index drawer is open -> close it!
    if (DOM.indexSidebar && DOM.indexSidebar.classList.contains('mobile-open')) {
      closeMobileIndex(false);
      handled = true;
    }

    if (handled) return;

    // 7. If on secondary tab (Notepad, Resources, Bin) -> go back to Topics tab!
    if (STATE.activeView !== 'topicsView') {
      switchView('topicsView', false);
      return;
    }

    // 8. If already on Topics view, prevent exiting by re-pushing app state
    if (window.history && window.history.pushState) {
      window.history.pushState({ app: 'nathkhat', view: 'topicsView' }, '');
    }
  });
}

function pushModalHistory(modalName) {
  if (window.history && window.history.pushState) {
    window.history.pushState({ modalOpen: true, modalName: modalName }, '');
  }
}

/* ==========================================================================
   Scroll Position Persistence (Stay on same page, don't move on refresh)
   ========================================================================== */

function setupScrollPersistence() {
  let scrollTimeout = null;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      try {
        sessionStorage.setItem('nathkhat_scroll_pos', window.scrollY);
      } catch (e) {}
    }, 120);
  }, { passive: true });
}

function restoreScrollPosition() {
  try {
    const saved = sessionStorage.getItem('nathkhat_scroll_pos');
    if (saved !== null) {
      const y = parseInt(saved, 10);
      if (!isNaN(y) && y > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
          setTimeout(() => window.scrollTo(0, y), 80);
        });
      }
    }
  } catch (e) {}
}

/* ==========================================================================
   Silent Cloud Persistence & Synchronization (Visible to all users directly)
   ========================================================================== */

function syncGlobally() {
  const now = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
  localStorage.setItem(STORAGE_KEYS.TOPICS_MODIFIED, 'true');

  if (typeof SyncEngine !== 'undefined' && SyncEngine.pushData) {
    SyncEngine.pushData({
      topics: STATE.topics,
      notes: STATE.notes,
      resources: STATE.resources,
      bin: STATE.bin,
      updatedAt: now
    });
  }
}

function onRemoteDataReceived(remote, source) {
  if (!remote) return;

  const localLastSync = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '0', 10);
  const remoteUpdatedAt = remote.updatedAt || 0;

  // Check if local is only initial untouched seed data
  const isLocalSeedOnly = (
    STATE.topics.length <= 4 &&
    STATE.topics.every(t => t.id && t.id.startsWith('topic-p')) &&
    !localStorage.getItem(STORAGE_KEYS.TOPICS_MODIFIED)
  );

  const hasContentDifferences = (
    (Array.isArray(remote.topics) && (remote.topics.length !== STATE.topics.length || JSON.stringify(remote.topics) !== JSON.stringify(STATE.topics))) ||
    (Array.isArray(remote.notes) && (remote.notes.length !== STATE.notes.length || JSON.stringify(remote.notes) !== JSON.stringify(STATE.notes))) ||
    (Array.isArray(remote.resources) && (remote.resources.length !== STATE.resources.length || JSON.stringify(remote.resources) !== JSON.stringify(STATE.resources))) ||
    (Array.isArray(remote.bin) && (remote.bin.length !== STATE.bin.length))
  );

  const shouldApplyRemote = (
    remoteUpdatedAt > localLastSync ||
    (isLocalSeedOnly && Array.isArray(remote.topics) && remote.topics.length > 0) ||
    (source === 'tab') ||
    (hasContentDifferences && remoteUpdatedAt >= localLastSync)
  );

  if (shouldApplyRemote) {
    if (Array.isArray(remote.topics)) {
      STATE.topics = remote.topics;
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(STATE.topics));
    }
    if (Array.isArray(remote.notes)) {
      STATE.notes = remote.notes;
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(STATE.notes));
    }
    if (Array.isArray(remote.resources)) {
      STATE.resources = remote.resources;
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(STATE.resources));
    }
    if (Array.isArray(remote.bin)) {
      STATE.bin = remote.bin;
      localStorage.setItem(STORAGE_KEYS.BIN, JSON.stringify(STATE.bin));
    }

    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Math.max(remoteUpdatedAt, Date.now()).toString());

    // Seamlessly update badges and views without any alerts, toasts, or scroll jumps
    updateBadges();
    renderIndex();
    renderTopics();
    renderNotes();
    renderResources();
    renderBin();
  }
}

function initCloudSync() {
  if (typeof SyncEngine === 'undefined') return;

  // Multi-tab / cross-window real-time synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.TOPICS && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (Array.isArray(updated)) {
          STATE.topics = updated;
          updateBadges();
          renderIndex();
          renderTopics();
        }
      } catch (err) {}
    } else if (e.key === STORAGE_KEYS.NOTES && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (Array.isArray(updated)) {
          STATE.notes = updated;
          updateBadges();
          renderNotes();
        }
      } catch (err) {}
    } else if (e.key === STORAGE_KEYS.RESOURCES && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (Array.isArray(updated)) {
          STATE.resources = updated;
          updateBadges();
          renderResources();
        }
      } catch (err) {}
    } else if (e.key === STORAGE_KEYS.BIN && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (Array.isArray(updated)) {
          STATE.bin = updated;
          updateBadges();
          renderBin();
        }
      } catch (err) {}
    }
  });

  // Start silent cloud sync (Netlify Blobs + BroadcastChannel)
  SyncEngine.startSilentSync({
    onRemoteUpdate: (remote, source) => {
      onRemoteDataReceived(remote, source);
    }
  });
}

// Kickstart App on DOM Ready or immediately if document is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
