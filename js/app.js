/**
 * NathKhat - UGC NET Paper 1 & Paper 2 (Computer Science) Revision Hub
 * Core Application Logic, Reactive State, Live Search Highlighting, 
 * Rich-Text WYSIWYG, Index Jumping & Recycle Bin.
 */

// State Management
const STATE = {
  topics: [],
  bin: [],
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

  // Topics (Section 2)
  topicsContainer: document.getElementById('topicsContainer'),
  topicsEmptyState: document.getElementById('topicsEmptyState'),
  sortSelect: document.getElementById('sortSelect'),
  openAddTopicBtn: document.getElementById('openAddTopicBtn'),
  emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),

  // Notepad (Section 3)
  notepadEditor: document.getElementById('notepadEditor'),
  notepadSyncStatus: document.getElementById('notepadSyncStatus'),
  notepadStats: document.getElementById('notepadStats'),
  notepadLastSaved: document.getElementById('notepadLastSaved'),
  downloadNotepadBtn: document.getElementById('downloadNotepadBtn'),
  clearNotepadBtn: document.getElementById('clearNotepadBtn'),

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

  // Load Notepad
  const savedNotepad = localStorage.getItem(STORAGE_KEYS.NOTEPAD);
  if (savedNotepad !== null) {
    STATE.notepad = savedNotepad;
  } else {
    STATE.notepad = typeof SEED_NOTEPAD !== 'undefined' ? SEED_NOTEPAD : '';
    saveNotepad();
  }
}

function saveTopics() {
  localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(STATE.topics));
}

function saveBin() {
  localStorage.setItem(STORAGE_KEYS.BIN, JSON.stringify(STATE.bin));
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

  DOM.countAllBadge.textContent = total;
  DOM.countP1Badge.textContent = p1Count;
  DOM.countP2Badge.textContent = p2Count;
  DOM.activeTopicsBadge.textContent = total;
  DOM.binCountBadge.textContent = binCount;
  DOM.indexCountBadge.textContent = total;

  DOM.quickStatsText.textContent = `${total} Topics Ready • P1: ${p1Count} | P2: ${p2Count}`;
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

function jumpToTopic(topicId) {
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
          <button type="button" class="btn-card-action" title="Duplicate Topic" data-action="duplicate" data-id="${topic.id}">
            📑
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
    card.querySelector('[data-action="duplicate"]').addEventListener('click', () => duplicateTopic(topic.id));
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

function saveTopicForm() {
  const title = DOM.topicTitleInput.value.trim();
  const paper = DOM.topicPaperInput.value;
  const unit = DOM.topicUnitInput.value.trim() || (paper === 'P1' ? 'General Aptitude' : 'Computer Science');
  const trick = DOM.topicTrickInput.value.trim();
  const explanation = DOM.topicExplanationEditor.innerHTML.trim();

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
        explanation: explanation || '<p>No detailed explanation added yet.</p>',
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
      explanation: explanation || '<p>No detailed explanation added yet.</p>',
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
}

/* ==========================================================================
   SECTION 3: Notepad (General Points & Scratchpad)
   ========================================================================== */

let notepadSaveTimeout = null;

function renderNotepad() {
  DOM.notepadEditor.value = STATE.notepad;
  updateNotepadStats();
}

function handleNotepadInput() {
  STATE.notepad = DOM.notepadEditor.value;
  DOM.notepadSyncStatus.className = 'notepad-sync-pill saving';
  DOM.notepadSyncStatus.innerHTML = '<span>●</span> Saving...';

  updateNotepadStats();

  // Debounced auto-save to localStorage
  clearTimeout(notepadSaveTimeout);
  notepadSaveTimeout = setTimeout(() => {
    saveNotepad();
    DOM.notepadSyncStatus.className = 'notepad-sync-pill';
    DOM.notepadSyncStatus.innerHTML = '<span>●</span> Saved locally';
    DOM.notepadLastSaved.textContent = `Auto-saved at ${new Date().toLocaleTimeString()}`;
  }, 400);
}

function updateNotepadStats() {
  const text = DOM.notepadEditor.value.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const charCount = text.length;
  DOM.notepadStats.textContent = `${wordCount} words • ${charCount} characters`;
}

function downloadNotepad() {
  const blob = new Blob([DOM.notepadEditor.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NathKhat_UGC_NET_Revision_Notes_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Notes downloaded as TXT file', 'success');
}

function clearNotepad() {
  if (confirm('Are you sure you want to clear your notepad? This cannot be undone.')) {
    DOM.notepadEditor.value = '';
    handleNotepadInput();
    showToast('Notepad cleared', 'info');
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
        if (typeof parsed.notepad === 'string') STATE.notepad = parsed.notepad;

        saveTopics();
        saveBin();
        saveNotepad();

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
    if (e.key === '/' && document.activeElement !== DOM.globalSearchInput && document.activeElement !== DOM.notepadEditor && document.activeElement !== DOM.topicExplanationEditor) {
      e.preventDefault();
      DOM.globalSearchInput.focus();
    }
    if (e.key === 'Escape') {
      closeTopicModal();
      closeBackupModal();
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
  DOM.openAddTopicBtn.addEventListener('click', openAddTopicModal);
  DOM.emptyStateAddBtn.addEventListener('click', openAddTopicModal);

  // Topic Modal Controls
  DOM.closeTopicModalBtn.addEventListener('click', closeTopicModal);
  DOM.cancelTopicModalBtn.addEventListener('click', closeTopicModal);
  DOM.saveTopicBtn.addEventListener('click', saveTopicForm);

  // Notepad Controls
  DOM.notepadEditor.addEventListener('input', handleNotepadInput);
  DOM.downloadNotepadBtn.addEventListener('click', downloadNotepad);
  DOM.clearNotepadBtn.addEventListener('click', clearNotepad);

  // Bin Controls
  DOM.emptyBinBtn.addEventListener('click', emptyBin);

  // Backup Controls
  DOM.backupDataBtn.addEventListener('click', openBackupModal);
  DOM.closeBackupModalBtn.addEventListener('click', closeBackupModal);
  DOM.closeBackupModalFooterBtn.addEventListener('click', closeBackupModal);
  DOM.exportJsonBtn.addEventListener('click', exportBackupJson);
  DOM.importJsonInput.addEventListener('change', importBackupJson);

  // Setup WYSIWYG
  setupRichTextEditor();
}

// Kickstart App on DOM Ready
document.addEventListener('DOMContentLoaded', initApp);
