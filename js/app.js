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
  editingNoteId: null,
  notepad: '',
  theme: 'dark',
  activePaper: 'ALL', // 'ALL' | 'P1' | 'P2'
  activeView: 'topicsView', // 'topicsView' | 'notepadView' | 'binView'
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
  NOTEPAD: 'nathkhat_notepad_v1',
  THEME: 'nathkhat_theme_v1',
  ACTIVE_VIEW: 'nathkhat_active_view_v1',
  ACTIVE_PAPER: 'nathkhat_active_paper_v1'
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
  tabBinView: document.getElementById('tabBinView'),
  activeTopicsBadge: document.getElementById('activeTopicsBadge'),
  notesCountBadge: document.getElementById('notesCountBadge'),
  binCountBadge: document.getElementById('binCountBadge'),
  quickStatsText: document.getElementById('quickStatsText'),

  // Views
  topicsView: document.getElementById('topicsView'),
  notepadView: document.getElementById('notepadView'),
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
  const validViews = ['topicsView', 'notepadView', 'binView'];

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
  [DOM.tabTopicsView, DOM.tabNotepadView, DOM.tabBinView].forEach(btn => {
    if (btn && btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else if (btn) {
      btn.classList.remove('active');
    }
  });

  // Update Views
  [DOM.topicsView, DOM.notepadView, DOM.binView].forEach(view => {
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
}

function updateBadges() {
  const total = STATE.topics.length;
  const p1Count = STATE.topics.filter(t => t.paper === 'P1').length;
  const p2Count = STATE.topics.filter(t => t.paper === 'P2').length;
  const binCount = STATE.bin.length;
  const notesCount = STATE.notes ? STATE.notes.length : 0;

  DOM.countAllBadge.textContent = total;
  DOM.countP1Badge.textContent = p1Count;
  DOM.countP2Badge.textContent = p2Count;
  DOM.activeTopicsBadge.textContent = total;
  DOM.binCountBadge.textContent = binCount;
  if (DOM.notesCountBadge) DOM.notesCountBadge.textContent = notesCount;
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

  // Push to cloud sync so it is instantly visible to all other users
  if (savedTopicItem && typeof SyncEngine !== 'undefined') {
    SyncEngine.pushTopic(savedTopicItem);
  }

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
      insertTableBtn: DOM.noteInsertTableBtn,
      addRowBtn: DOM.noteAddRowBtn,
      addColBtn: DOM.noteAddColBtn
    });
  }
}

function setupSingleEditor(config) {
  const { toolbar, editor, foreColorPicker, hiliteColorPicker, imageFileInput, insertTableBtn, addRowBtn, addColBtn } = config;
  if (!editor) return;

  // Toolbar basic command execution (B, U, H2, H3, P, lists)
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

  // Image File Picker -> Base64 inline insertion
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.execCommand('insertImage', false, event.target.result);
          showToast('Image inserted successfully!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Direct Clipboard Paste Listener (Ctrl+V screenshots / images)
  editor.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          document.execCommand('insertImage', false, event.target.result);
          showToast('Pasted image from clipboard!', 'success');
        };
        reader.readAsDataURL(blob);
        e.preventDefault();
        break;
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
      if (confirm('Delete this table?')) {
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

  // Directly apply and push to cloud sync
  if (savedNoteItem && typeof SyncEngine !== 'undefined' && SyncEngine.pushNote) {
    SyncEngine.pushNote(savedNoteItem);
  }
}

function deleteNote(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return;

  if (confirm(`Delete note "${note.title}"?`)) {
    STATE.notes = STATE.notes.filter(n => n.id !== noteId);
    saveNotes();
    updateBadges();
    renderNotes();

    if (typeof SyncEngine !== 'undefined' && SyncEngine.deleteNote) {
      SyncEngine.deleteNote(noteId);
    }

    showToast(`Deleted note: "${note.title}"`, 'info');
  }
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
   SECTION 4: Recycle Bin (Safe Trash & 1-Click Restore)
   ========================================================================== */

function moveToBin(topicId) {
  const index = STATE.topics.findIndex(t => t.id === topicId);
  if (index === -1) return;

  const [topic] = STATE.topics.splice(index, 1);
  topic.deletedAt = Date.now();

  STATE.bin.unshift(topic); // Most recently deleted at top

  saveTopics();
  saveBin();
  updateBadges();
  renderIndex();
  renderTopics();
  renderBin();

  if (typeof SyncEngine !== 'undefined') {
    SyncEngine.deleteTopic(topicId);
  }

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

  if (typeof SyncEngine !== 'undefined') {
    SyncEngine.pushTopic(topic);
  }

  showToast(`Restored "${topic.title}" back to top of Index!`, 'success');
}

function deletePermanently(topicId) {
  if (confirm('Permanently delete this topic? It cannot be recovered.')) {
    STATE.bin = STATE.bin.filter(t => t.id !== topicId);
    saveBin();
    updateBadges();
    renderBin();
    if (typeof SyncEngine !== 'undefined') {
      SyncEngine.deleteTopic(topicId);
    }
    showToast('Topic permanently deleted', 'error');
  }
}

function emptyBin() {
  if (STATE.bin.length === 0) {
    showToast('Recycle bin is already empty', 'info');
    return;
  }

  if (confirm(`Permanently delete all ${STATE.bin.length} items in the Recycle Bin? This action is irreversible.`)) {
    STATE.bin = [];
    saveBin();
    updateBadges();
    renderBin();
    showToast('Recycle Bin emptied completely', 'error');
  }
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
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    topics: STATE.topics,
    bin: STATE.bin,
    notes: STATE.notes,
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

        saveTopics();
        saveBin();
        saveNotes();

        updateBadges();
        renderIndex();
        renderTopics();
        renderNotepad();
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
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.globalSearchInput.value = '';
    STATE.searchQuery = '';
    DOM.clearSearchBtn.style.display = 'none';
    renderIndex();
    renderTopics();
    DOM.globalSearchInput.focus();
  });

  // Keyboard shortcut '/' to focus search
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && 
        document.activeElement !== DOM.globalSearchInput && 
        document.activeElement !== DOM.topicExplanationEditor &&
        document.activeElement !== DOM.noteExplanationEditor &&
        document.activeElement !== DOM.noteTitleInput &&
        document.activeElement !== DOM.noteTagInput) {
      e.preventDefault();
      DOM.globalSearchInput.focus();
    }
    if (e.key === 'Escape') {
      closeTopicModal();
      closeNoteModal();
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
  DOM.tabBinView.addEventListener('click', () => switchView('binView'));

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
    if (['topicsView', 'notepadView', 'binView'].includes(hash) && STATE.activeView !== hash) {
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

    // 3. If Backup modal is open -> close it!
    if (DOM.backupModal && DOM.backupModal.classList.contains('open')) {
      closeBackupModal(false);
      handled = true;
    }

    // 4. If Mobile Index drawer is open -> close it!
    if (DOM.indexSidebar && DOM.indexSidebar.classList.contains('mobile-open')) {
      closeMobileIndex(false);
      handled = true;
    }

    if (handled) return;

    // 5. If on secondary tab (Notepad, Bin) -> go back to Topics tab!
    if (STATE.activeView !== 'topicsView') {
      switchView('topicsView', false);
      return;
    }

    // 6. If already on Topics view, prevent exiting by re-pushing app state
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
   Dynamic Cloud Synchronization (Visible to all users instantly)
   ========================================================================== */

function initCloudSync() {
  if (typeof SyncEngine === 'undefined') return;

  const cloudInput = document.getElementById('cloudDbUrlInput');
  const saveCloudBtn = document.getElementById('saveCloudSyncBtn');

  if (cloudInput) {
    cloudInput.value = SyncEngine.getCloudUrl() || '';
  }

  if (saveCloudBtn && cloudInput) {
    saveCloudBtn.addEventListener('click', async () => {
      const url = cloudInput.value.trim();
      SyncEngine.setCloudUrl(url);
      const ok = await SyncEngine.testConnection();
      if (ok) {
        // Sync and push local topics to cloud so everyone gets them
        SyncEngine.pushAllTopics(STATE.topics);
        alert('Connected to Cloud Sync! Changes are now visible to all users.');
      } else {
        alert('Could not connect to that endpoint. Please check URL.');
      }
    });
  }

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

  // Start live sync and merge remote topics into local view
  SyncEngine.startLiveSync((remoteTopics, deletedTopicId) => {
    if (deletedTopicId) {
      const idx = STATE.topics.findIndex(t => t.id === deletedTopicId);
      if (idx !== -1) {
        STATE.topics.splice(idx, 1);
        saveTopics();
        updateBadges();
        renderIndex();
        renderTopics();
      }
      return;
    }

    if (!Array.isArray(remoteTopics) || remoteTopics.length === 0) return;
    let hasNew = false;
    remoteTopics.forEach(remote => {
      if (!remote || !remote.id) return;
      const existingIdx = STATE.topics.findIndex(t => t.id === remote.id);
      if (existingIdx === -1) {
        STATE.topics.unshift(remote);
        hasNew = true;
      } else if (remote.updatedAt && remote.updatedAt > (STATE.topics[existingIdx].updatedAt || 0)) {
        STATE.topics[existingIdx] = remote;
        hasNew = true;
      }
    });

    if (hasNew) {
      saveTopics();
      updateBadges();
      renderIndex();
      renderTopics();
    }
  });

  // Start live sync for notes
  if (SyncEngine.startNoteLiveSync) {
    SyncEngine.startNoteLiveSync((remoteNotes, deletedNoteId) => {
      if (deletedNoteId) {
        const idx = STATE.notes.findIndex(n => n.id === deletedNoteId);
        if (idx !== -1) {
          STATE.notes.splice(idx, 1);
          saveNotes();
          updateBadges();
          renderNotes();
        }
        return;
      }

      if (!Array.isArray(remoteNotes) || remoteNotes.length === 0) return;
      let hasNew = false;
      remoteNotes.forEach(remote => {
        if (!remote || !remote.id) return;
        const existingIdx = STATE.notes.findIndex(n => n.id === remote.id);
        if (existingIdx === -1) {
          STATE.notes.unshift(remote);
          hasNew = true;
        } else if (remote.updatedAt && remote.updatedAt > (STATE.notes[existingIdx].updatedAt || 0)) {
          STATE.notes[existingIdx] = remote;
          hasNew = true;
        }
      });

      if (hasNew) {
        saveNotes();
        updateBadges();
        renderNotes();
      }
    });
  }
}

// Kickstart App on DOM Ready or immediately if document is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
