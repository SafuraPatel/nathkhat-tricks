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
  THEME: 'nathkhat_theme_v1'
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
  clearNotepadBtn: document.getElementById('clearNotepadBtn'),
  notepadSyncStatus: document.getElementById('notepadSyncStatus'),

  // Note Modal
  noteModal: document.getElementById('noteModal'),
  noteModalTitle: document.getElementById('noteModalTitle'),
  closeNoteModalBtn: document.getElementById('closeNoteModalBtn'),
  cancelNoteModalBtn: document.getElementById('cancelNoteModalBtn'),
  saveNoteBtn: document.getElementById('saveNoteBtn'),
  noteForm: document.getElementById('noteForm'),
  noteIdInput: document.getElementById('noteIdInput'),
  noteTitleInput: document.getElementById('noteTitleInput'),
  noteTagInput: document.getElementById('noteTagInput'),
  noteContentInput: document.getElementById('noteContentInput'),

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
  loadStoredData();
  setupEventListeners();
  applyTheme(STATE.theme);
  updateBadges();
  renderIndex();
  renderTopics();
  renderNotepad();
  renderBin();
}

function loadStoredData() {
  // Load Theme
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) {
    STATE.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    STATE.theme = 'light';
  }

  // Load Topics
  const savedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);
  if (savedTopics) {
    try {
      STATE.topics = JSON.parse(savedTopics);
    } catch (e) {
      console.error('Failed to parse stored topics, loading seed data.', e);
      STATE.topics = [...SEED_TOPICS];
    }
  } else {
    // Initial Seed Data
    STATE.topics = [...SEED_TOPICS];
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
    } catch (e) {
      STATE.notes = [];
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

function switchView(viewName) {
  STATE.activeView = viewName;

  // Update tabs
  [DOM.tabTopicsView, DOM.tabNotepadView, DOM.tabBinView].forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Views
  [DOM.topicsView, DOM.notepadView, DOM.binView].forEach(view => {
    if (view.id === viewName) {
      view.classList.add('active');
    } else {
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

  [DOM.filterAll, DOM.filterP1, DOM.filterP2].forEach(btn => {
    if (btn.getAttribute('data-paper') === paper) {
      btn.classList.add('active');
    } else {
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

function closeMobileIndex() {
  if (DOM.indexSidebar) DOM.indexSidebar.classList.remove('mobile-open');
  if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.remove('active');
}

function toggleMobileIndex() {
  if (DOM.indexSidebar) DOM.indexSidebar.classList.toggle('mobile-open');
  if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.toggle('active');
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
            <span class="badge-paper ${topic.paper}">${topic.paper} : ${topic.paper === 'P1' ? 'Paper 1 General' : 'Paper 2 Computer Science'}</span>
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

      <!-- Distinct Box 1: Desi Tricks Box -->
      <div class="desi-trick-box">
        <div class="desi-trick-header">
          <span class="desi-trick-tag">
            <span>💡</span> DESI TRICK / देशी जुगाड़
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
        showToast('Desi Trick copied to clipboard!', 'success');
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
  DOM.topicModalTitle.innerHTML = '<span>💡</span> Add New Study Topic &amp; Desi Trick';
  DOM.topicIdInput.value = '';
  DOM.topicTitleInput.value = '';
  DOM.topicPaperInput.value = STATE.activePaper !== 'ALL' ? STATE.activePaper : 'P1';
  DOM.topicUnitInput.value = '';
  DOM.topicTrickInput.value = '';
  DOM.topicExplanationEditor.innerHTML = '';
  
  DOM.topicModal.classList.add('open');
  setTimeout(() => DOM.topicTitleInput.focus(), 100);
}

function openEditTopicModal(topicId) {
  const topic = STATE.topics.find(t => t.id === topicId);
  if (!topic) return;

  STATE.editingTopicId = topicId;
  DOM.topicModalTitle.innerHTML = '<span>✏️</span> Edit Study Topic &amp; Desi Trick';
  DOM.topicIdInput.value = topic.id;
  DOM.topicTitleInput.value = topic.title;
  DOM.topicPaperInput.value = topic.paper;
  DOM.topicUnitInput.value = topic.unit || '';
  DOM.topicTrickInput.value = topic.trick || '';
  DOM.topicExplanationEditor.innerHTML = topic.explanation || '';

  DOM.topicModal.classList.add('open');
  setTimeout(() => DOM.topicTitleInput.focus(), 100);
}

function closeTopicModal() {
  DOM.topicModal.classList.remove('open');
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
    showToast('Please enter a topic name', 'error');
    DOM.topicTitleInput.focus();
    return;
  }

  if (!trick) {
    showToast('Please enter a Desi Trick or memory hook', 'error');
    DOM.topicTrickInput.focus();
    return;
  }

  const now = Date.now();

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
      showToast(`Updated "${title}" and moved to top of index`, 'success');
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
    showToast(`New topic "${title}" added to the top of Index!`, 'success');
  }

  saveTopics();
  updateBadges();
  renderIndex();
  renderTopics();
  closeTopicModal();

  // Scroll and jump highlight the saved topic!
  const targetId = STATE.editingTopicId || STATE.topics[0].id;
  setTimeout(() => {
    jumpToTopic(targetId);
  }, 150);
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
   Rich-Text Editor Tools (WYSIWYG & Clipboard Image Paste)
   ========================================================================== */

function setupRichTextEditor() {
  // Toolbar command execution
  DOM.editorToolbar.querySelectorAll('.editor-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.getAttribute('data-command');
      const val = btn.getAttribute('data-val') || null;
      document.execCommand(command, false, val);
      DOM.topicExplanationEditor.focus();
    });
  });

  // Text Color Picker
  DOM.foreColorPicker.addEventListener('input', (e) => {
    document.execCommand('foreColor', false, e.target.value);
    DOM.topicExplanationEditor.focus();
  });

  // Highlight Color Picker
  DOM.hiliteColorPicker.addEventListener('input', (e) => {
    document.execCommand('hiliteColor', false, e.target.value);
    DOM.topicExplanationEditor.focus();
  });

  // Image File Picker -> Base64 inline insertion
  DOM.imageFileInput.addEventListener('change', (e) => {
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

  // Direct Clipboard Paste Listener (Supports pasting screenshots Ctrl+V)
  DOM.topicExplanationEditor.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let containsImage = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        containsImage = true;
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
    // If not image, default rich-text paste behavior preserves HTML formatting and colors!
  });

  // Table Creation Button (📊 Table)
  const insertTableBtn = document.getElementById('insertTableBtn');
  if (insertTableBtn) {
    insertTableBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const rowsInput = prompt('Enter number of rows (including header):', '3');
      if (rowsInput === null) return;
      const colsInput = prompt('Enter number of columns:', '3');
      if (colsInput === null) return;

      const rows = Math.min(Math.max(parseInt(rowsInput, 10) || 3, 2), 20);
      const cols = Math.min(Math.max(parseInt(colsInput, 10) || 3, 1), 10);

      let tableHtml = '<table class="custom-rich-table"><thead><tr>';
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
      tableHtml += '</tbody></table><p><br></p>';

      DOM.topicExplanationEditor.focus();
      document.execCommand('insertHTML', false, tableHtml);
      showToast(`Inserted ${rows}x${cols} table! Click any cell to type.`, 'success');
    });
  }
}

/* ==========================================================================
   SECTION 3: Notepad (Multi-Note System & CRUD)
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
      <div class="note-card-content">${escapeHtml(note.content)}</div>
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
  DOM.noteContentInput.value = '';
  DOM.noteModalTitle.innerHTML = '<span>📝</span> Add New Note';
  DOM.noteModal.classList.add('open');
  setTimeout(() => DOM.noteTitleInput.focus(), 100);
}

function openEditNoteModal(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return;

  STATE.editingNoteId = noteId;
  DOM.noteIdInput.value = note.id;
  DOM.noteTitleInput.value = note.title;
  DOM.noteTagInput.value = note.tag || '';
  DOM.noteContentInput.value = note.content;
  DOM.noteModalTitle.innerHTML = '<span>✏️</span> Edit Note';
  DOM.noteModal.classList.add('open');
  setTimeout(() => DOM.noteTitleInput.focus(), 100);
}

function closeNoteModal() {
  DOM.noteModal.classList.remove('open');
  DOM.noteForm.reset();
  STATE.editingNoteId = null;
}

function saveNoteForm(e) {
  if (e) e.preventDefault();

  const title = DOM.noteTitleInput.value.trim();
  const tag = DOM.noteTagInput.value.trim();
  const content = DOM.noteContentInput.value.trim();

  if (!title) {
    showToast('Please enter a note title', 'error');
    DOM.noteTitleInput.focus();
    return;
  }

  if (!content) {
    showToast('Please write some content for the note', 'error');
    DOM.noteContentInput.focus();
    return;
  }

  if (STATE.editingNoteId) {
    // Update existing note
    const note = STATE.notes.find(n => n.id === STATE.editingNoteId);
    if (note) {
      note.title = title;
      note.tag = tag;
      note.content = content;
      note.updatedAt = Date.now();
      showToast(`Updated note: "${title}"`, 'success');
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
    showToast(`Added new note: "${title}"`, 'success');
  }

  saveNotes();
  updateBadges();
  renderNotes();
  closeNoteModal();
}

function deleteNote(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return;

  if (confirm(`Delete note "${note.title}"?`)) {
    STATE.notes = STATE.notes.filter(n => n.id !== noteId);
    saveNotes();
    updateBadges();
    renderNotes();
    showToast(`Deleted note: "${note.title}"`, 'info');
  }
}

function copyNote(noteId) {
  const note = STATE.notes.find(n => n.id === noteId);
  if (!note) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(note.content).then(() => {
      showToast('Note content copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopyText(note.content);
    });
  } else {
    fallbackCopyText(note.content);
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

function clearAllNotes() {
  if (!STATE.notes || STATE.notes.length === 0) {
    showToast('Notepad is already empty', 'info');
    return;
  }
  if (confirm('Are you sure you want to clear all notes from your notepad? This cannot be undone.')) {
    STATE.notes = [];
    saveNotes();
    updateBadges();
    renderNotes();
    showToast('All notes cleared from notepad', 'info');
  }
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

  showToast(`Restored "${topic.title}" back to top of Index!`, 'success');
}

function deletePermanently(topicId) {
  if (confirm('Permanently delete this topic? It cannot be recovered.')) {
    STATE.bin = STATE.bin.filter(t => t.id !== topicId);
    saveBin();
    updateBadges();
    renderBin();
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
}

function closeBackupModal() {
  DOM.backupModal.classList.remove('open');
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
        document.activeElement !== DOM.noteTitleInput &&
        document.activeElement !== DOM.noteContentInput &&
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
  if (DOM.clearNotepadBtn) DOM.clearNotepadBtn.addEventListener('click', clearAllNotes);
  if (DOM.closeNoteModalBtn) DOM.closeNoteModalBtn.addEventListener('click', closeNoteModal);
  if (DOM.cancelNoteModalBtn) DOM.cancelNoteModalBtn.addEventListener('click', closeNoteModal);
  if (DOM.saveNoteBtn) DOM.saveNoteBtn.addEventListener('click', saveNoteForm);
  if (DOM.noteForm) DOM.noteForm.addEventListener('submit', saveNoteForm);

  // Bin Controls
  DOM.emptyBinBtn.addEventListener('click', emptyBin);

  // Backup Controls
  DOM.backupDataBtn.addEventListener('click', openBackupModal);
  DOM.closeBackupModalBtn.addEventListener('click', closeBackupModal);
  DOM.closeBackupModalFooterBtn.addEventListener('click', closeBackupModal);
  DOM.exportJsonBtn.addEventListener('click', exportBackupJson);
  DOM.importJsonInput.addEventListener('change', importBackupJson);

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
}

// Kickstart App on DOM Ready
document.addEventListener('DOMContentLoaded', initApp);
