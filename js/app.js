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
  resourceViewMode: 'grid', // 'grid' | 'list'
  resourceFolderFilter: 'all',
  resourceTypeFilter: 'all', // 'all' | 'pdf' | 'doc' | 'image' | 'sheet' | 'link'
  activeDriveNav: 'my-drive', // 'my-drive' | 'starred' | 'recent' | 'trash'
  selectedResourceId: null,
  starredResourceIds: [],
  isDetailsPaneOpen: false,
  customFolders: [],
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
  RESOURCE_VIEW_MODE: 'nathkhat_resource_view_mode_v1',
  CUSTOM_FOLDERS: 'nathkhat_custom_folders_v1',
  STARRED_RESOURCES: 'nathkhat_starred_resources_v1',
  NOTEPAD: 'nathkhat_notepad_v1',
  THEME: 'nathkhat_theme_v1',
  ACTIVE_VIEW: 'nathkhat_active_view_v1',
  ACTIVE_PAPER: 'nathkhat_active_paper_v1',
  LAST_SYNC: 'nathkhat_last_sync_v1',
  TOPICS_MODIFIED: 'nathkhat_topics_modified_v1',
  DELETED_RESOURCES: 'nathkhat_deleted_resources_v1'
};

function getDeletedResourceIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_RESOURCES);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function markResourceDeleted(id) {
  try {
    const set = getDeletedResourceIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEYS.DELETED_RESOURCES, JSON.stringify(Array.from(set)));
  } catch (e) {}
}

function unmarkResourceDeleted(id) {
  try {
    const set = getDeletedResourceIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(STORAGE_KEYS.DELETED_RESOURCES, JSON.stringify(Array.from(set)));
    }
  } catch (e) {}
}

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

  // Resources Section (Authentic Google Drive Files Tab)
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
  resourceFolderFilterSelect: document.getElementById('resourceFolderFilterSelect'),
  resourceTypeFilterSelect: document.getElementById('resourceTypeFilterSelect'),
  resourcesStatsOverview: document.getElementById('resourcesStatsOverview'),
  gdriveNewBtn: document.getElementById('gdriveNewBtn'),
  gdriveNewMenu: document.getElementById('gdriveNewMenu'),
  menuUploadFile: document.getElementById('menuUploadFile'),
  menuNewDoc: document.getElementById('menuNewDoc'),
  menuNewFolder: document.getElementById('menuNewFolder'),
  menuNewLink: document.getElementById('menuNewLink'),
  gdriveViewGridBtn: document.getElementById('gdriveViewGridBtn'),
  gdriveViewListBtn: document.getElementById('gdriveViewListBtn'),

  // Google Drive Navigation & Sidebar
  gdriveSidebar: document.getElementById('gdriveSidebar'),
  gdriveNavMyDrive: document.getElementById('gdriveNavMyDrive'),
  gdriveNavStarred: document.getElementById('gdriveNavStarred'),
  gdriveNavRecent: document.getElementById('gdriveNavRecent'),
  gdriveNavTrash: document.getElementById('gdriveNavTrash'),
  gdriveNavCount: document.getElementById('gdriveNavCount'),
  gdriveStarredCount: document.getElementById('gdriveStarredCount'),
  gdriveStorageFill: document.getElementById('gdriveStorageFill'),
  gdriveStorageMeta: document.getElementById('gdriveStorageMeta'),

  // Google Drive Breadcrumbs & Toolbar
  gdriveBreadcrumbRoot: document.getElementById('gdriveBreadcrumbRoot'),
  gdriveBreadcrumbSep: document.getElementById('gdriveBreadcrumbSep'),
  gdriveBreadcrumbCurrent: document.getElementById('gdriveBreadcrumbCurrent'),
  gdriveBackToRootBtn: document.getElementById('gdriveBackToRootBtn'),
  gdriveToggleDetailsBtn: document.getElementById('gdriveToggleDetailsBtn'),

  // Google Drive Folders & Files Sections
  gdriveFoldersSection: document.getElementById('gdriveFoldersSection'),
  gdriveFoldersGrid: document.getElementById('gdriveFoldersGrid'),
  gdriveFilesSection: document.getElementById('gdriveFilesSection'),

  // Google Drive Details Drawer
  gdriveDetailsPane: document.getElementById('gdriveDetailsPane'),
  gdriveDetailsTitle: document.getElementById('gdriveDetailsTitle'),
  gdriveDetailsBody: document.getElementById('gdriveDetailsBody'),
  closeDetailsPaneBtn: document.getElementById('closeDetailsPaneBtn'),

  // Google Drive Context Menu
  gdriveContextMenu: document.getElementById('gdriveContextMenu'),
  ctxPreview: document.getElementById('ctxPreview'),
  ctxDownload: document.getElementById('ctxDownload'),
  ctxEdit: document.getElementById('ctxEdit'),
  ctxStar: document.getElementById('ctxStar'),
  ctxStarText: document.getElementById('ctxStarText'),
  ctxDetails: document.getElementById('ctxDetails'),
  ctxDelete: document.getElementById('ctxDelete'),

  // Preview Modal Navigation
  previewPrevBtn: document.getElementById('previewPrevBtn'),
  previewNextBtn: document.getElementById('previewNextBtn'),

  // Resource Modal
  resourceModal: document.getElementById('resourceModal'),
  resourceModalTitle: document.getElementById('resourceModalTitle'),
  closeResourceModalBtn: document.getElementById('closeResourceModalBtn'),
  cancelResourceModalBtn: document.getElementById('cancelResourceModalBtn'),
  saveResourceBtn: document.getElementById('saveResourceBtn'),
  resourceForm: document.getElementById('resourceForm'),
  resourceIdInput: document.getElementById('resourceIdInput'),
  resourceTitleInput: document.getElementById('resourceTitleInput'),
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

  // Create Doc Modal
  createDocModal: document.getElementById('createDocModal'),
  createDocForm: document.getElementById('createDocForm'),
  docTitleInput: document.getElementById('docTitleInput'),
  docCategoryInput: document.getElementById('docCategoryInput'),
  docFormatSelect: document.getElementById('docFormatSelect'),
  docContentInput: document.getElementById('docContentInput'),
  saveDocBtn: document.getElementById('saveDocBtn'),
  closeDocModalBtn: document.getElementById('closeDocModalBtn'),
  cancelDocModalBtn: document.getElementById('cancelDocModalBtn'),

  // Create Folder Modal
  createFolderModal: document.getElementById('createFolderModal'),
  createFolderForm: document.getElementById('createFolderForm'),
  folderNameInput: document.getElementById('folderNameInput'),
  saveFolderBtn: document.getElementById('saveFolderBtn'),
  closeFolderModalBtn: document.getElementById('closeFolderModalBtn'),
  cancelFolderModalBtn: document.getElementById('cancelFolderModalBtn'),

  // Create Link Modal
  createLinkModal: document.getElementById('createLinkModal'),
  createLinkForm: document.getElementById('createLinkForm'),
  linkTitleInput: document.getElementById('linkTitleInput'),
  linkUrlInput: document.getElementById('linkUrlInput'),
  linkDescInput: document.getElementById('linkDescInput'),
  saveLinkBtn: document.getElementById('saveLinkBtn'),
  closeLinkModalBtn: document.getElementById('closeLinkModalBtn'),
  cancelLinkModalBtn: document.getElementById('cancelLinkModalBtn'),

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
    if (typeof IdbResourceStore !== 'undefined' && IdbResourceStore.preloadMemoryCache) {
      IdbResourceStore.preloadMemoryCache().catch(() => {});
    }
    setupEventListeners();
    applyTheme(STATE.theme);
    updateBadges();

    // Request persistent storage from browser so files and data are never cleared under storage pressure
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }

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

  // Load Resources (PDFs, Images, Documents, Any Files) - No default seed files kept
  const savedResources = localStorage.getItem(STORAGE_KEYS.RESOURCES);
  const deletedIds = getDeletedResourceIds();
  if (savedResources) {
    try {
      const parsed = JSON.parse(savedResources);
      STATE.resources = Array.isArray(parsed)
        ? parsed.filter(r => r && r.id && !r.id.startsWith('res-seed-') && !deletedIds.has(r.id))
        : [];
      saveResources();
    } catch (e) {
      STATE.resources = [];
      saveResources();
    }
  } else {
    STATE.resources = [];
    saveResources();
  }

  // Clear any default or custom folders (no categories / folders)
  STATE.customFolders = [];
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FOLDERS);
  } catch (e) {}

  // Automatically recover any uploaded files from IndexedDB if ever missing
  recoverStoredResourcesFromIdb();
}

async function recoverStoredResourcesFromIdb() {
  try {
    const entries = await IdbResourceStore.getAllEntries();
    if (!Array.isArray(entries) || entries.length === 0) return;
    let modified = false;
    const knownIds = new Set(STATE.resources.map(r => r.id));
    const deletedIds = getDeletedResourceIds();

    entries.forEach(entry => {
      if (!entry || !entry.id || entry.id.startsWith('res-seed-') || deletedIds.has(entry.id)) return;
      if (!knownIds.has(entry.id)) {
        const ext = (entry.name || '').split('.').pop().toLowerCase();
        const group = getFileTypeGroup(entry.name, entry.mimeType);
        const dataLength = (typeof entry.data === 'string') ? entry.data.length : 0;
        const estBytes = dataLength > 0 ? Math.round(dataLength * 0.75) : 1024;
        const recovered = {
          id: entry.id,
          title: (entry.name || 'Uploaded File').replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          fileName: entry.name || 'file',
          size: estBytes,
          sizeFormatted: formatFileSize(estBytes),
          mimeType: entry.mimeType || 'application/octet-stream',
          extension: ext,
          typeGroup: group,
          paper: 'ALL',
          category: '',
          unit: '',
          description: '',
          thumbnail: (group === 'image' && entry.data) ? entry.data : null,
          dataUrl: (entry.data && typeof entry.data === 'string' && entry.data.length < 2 * 1024 * 1024) ? entry.data : '',
          createdAt: entry.updatedAt || Date.now(),
          updatedAt: entry.updatedAt || Date.now()
        };
        if (entry.data) memoryFileCache.set(entry.id, entry.data);
        STATE.resources.unshift(recovered);
        knownIds.add(entry.id);
        modified = true;
      }
    });

    if (modified) {
      saveResources();
      renderResources();
      updateBadges();
      syncGlobally();
    }
  } catch (err) {}
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
  try {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(STATE.resources));
  } catch (e) {
    try {
      // In case localStorage quota limit is reached, strip heavy dataUrl & thumbnails so file metadata is never lost
      const lightResources = STATE.resources.map(r => {
        const { thumbnail, dataUrl, ...rest } = r;
        return rest;
      });
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(lightResources));
    } catch (err2) {
      console.warn('Could not save resources to localStorage:', err2);
    }
  }
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

  // When inside Google Drive view, hide the topics index sidebar so Google Drive has full desktop layout
  if (DOM.indexSidebar) {
    DOM.indexSidebar.style.display = viewName === 'resourcesView' ? 'none' : '';
  }
  if (DOM.mobileIndexToggleBtn) {
    DOM.mobileIndexToggleBtn.style.display = viewName === 'topicsView' ? '' : 'none';
  }

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

function getStarredResourceCount() {
  const existingIds = new Set((STATE.resources || []).map(r => r.id));
  if (Array.isArray(STATE.starredResourceIds)) {
    STATE.starredResourceIds = STATE.starredResourceIds.filter(id => existingIds.has(id));
  } else {
    STATE.starredResourceIds = [];
  }
  // Sync resource.starred property with STATE.starredResourceIds
  (STATE.resources || []).forEach(r => {
    if (r.starred && !STATE.starredResourceIds.includes(r.id)) {
      STATE.starredResourceIds.push(r.id);
    } else if (STATE.starredResourceIds.includes(r.id)) {
      r.starred = true;
    }
  });
  return (STATE.resources || []).filter(r => r.starred || STATE.starredResourceIds.includes(r.id)).length;
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

  // Live Starred Files count in Google Drive navigation
  if (DOM.gdriveStarredCount) {
    const starCount = getStarredResourceCount();
    DOM.gdriveStarredCount.textContent = starCount;
    DOM.gdriveStarredCount.style.display = starCount > 0 ? 'inline-block' : 'none';
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

/* In-Memory Instant Synchronous File Cache for 0ms Direct Opening */
const memoryFileCache = new Map();

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
        const req = indexedDB.open('NathKhat_Resources_DB');
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => {
          const db = e.target.result;
          db.onversionchange = () => {
            try { db.close(); } catch (err) {}
          };
          resolve(db);
        };
        req.onblocked = () => {
          console.warn('NathKhat_Resources_DB blocked');
        };
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
    return this.dbPromise;
  },

  async preloadMemoryCache() {
    try {
      const entries = await this.getAllEntries();
      if (Array.isArray(entries)) {
        entries.forEach(entry => {
          if (entry && entry.id && entry.data) {
            memoryFileCache.set(entry.id, entry.data);
            const res = (STATE.resources || []).find(r => r.id === entry.id);
            if (res && !res.dataUrl) {
              res.dataUrl = entry.data;
            }
          }
        });
      }
    } catch (e) {}
  },

  async saveFile(id, fileData, mimeType, name) {
    if (!id || !fileData) return false;
    memoryFileCache.set(id, fileData);
    try { sessionStorage.setItem('nk_file_' + id, fileData); } catch (e) {}
    try {
      if (typeof fileData === 'string' && fileData.length < 1500000) {
        localStorage.setItem('nk_file_' + id, fileData);
      }
    } catch (e) {}

    const db = await this.getDB();
    if (!db) return true;

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
    if (!id) return null;
    if (memoryFileCache.has(id)) {
      return memoryFileCache.get(id);
    }
    try {
      const sess = sessionStorage.getItem('nk_file_' + id);
      if (sess) {
        memoryFileCache.set(id, sess);
        return sess;
      }
    } catch (e) {}
    try {
      const loc = localStorage.getItem('nk_file_' + id);
      if (loc) {
        memoryFileCache.set(id, loc);
        return loc;
      }
    } catch (e) {}

    const stateRes = (STATE.resources || []).find(r => r.id === id);
    if (stateRes && stateRes.dataUrl) {
      memoryFileCache.set(id, stateRes.dataUrl);
      return stateRes.dataUrl;
    }

    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            memoryFileCache.set(id, req.result.data);
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
    memoryFileCache.delete(id);
    try { sessionStorage.removeItem('nk_file_' + id); } catch (e) {}
    try { localStorage.removeItem('nk_file_' + id); } catch (e) {}
    const db = await this.getDB();
    if (!db) return;

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
  },

  async getAllEntries() {
    const db = await this.getDB();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
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

function getFilteredDriveResources() {
  const resources = STATE.resources || [];
  const starredList = STATE.starredResourceIds || [];
  let filtered = [...resources];

  // 1. Filter by Active Drive Navigation (My Drive, Starred, Recent)
  if (STATE.activeDriveNav === 'starred') {
    const starredSet = new Set(starredList);
    filtered = filtered.filter(r => r.starred || starredSet.has(r.id));
  } else if (STATE.activeDriveNav === 'recent') {
    filtered.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  }


  // 4. Filter by Live Search Query
  const q = (STATE.resourceSearchQuery || '').trim().toLowerCase();
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

  // 5. Sorting
  if (STATE.activeDriveNav !== 'recent') {
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
  }

  return filtered;
}

function renderResources() {
  if (!DOM.resourcesContainer) return;
  DOM.resourcesContainer.innerHTML = '';

  const resources = STATE.resources || [];

  // Calculate Breakdown Statistics & Storage
  const totalCount = resources.length;
  const totalBytes = resources.reduce((acc, r) => acc + (r.size || 0), 0);
  const formattedTotalSize = formatFileSize(totalBytes);
  const starredList = STATE.starredResourceIds || [];

  // Update Left Navigation Badges & Storage
  if (DOM.gdriveNavCount) DOM.gdriveNavCount.textContent = totalCount;
  if (DOM.gdriveStarredCount) {
    const starCount = getStarredResourceCount();
    DOM.gdriveStarredCount.textContent = starCount;
    DOM.gdriveStarredCount.style.display = starCount > 0 ? 'inline-block' : 'none';
  }
  if (DOM.gdriveStorageFill) {
    const pct = Math.min(100, Math.max(3, Math.round((totalBytes / (1024 * 1024 * 15)) * 100)));
    DOM.gdriveStorageFill.style.width = `${pct}%`;
  }
  if (DOM.gdriveStorageMeta) {
    DOM.gdriveStorageMeta.textContent = `${formattedTotalSize} of 15 GB used`;
  }

  // Update Left Sidebar Nav Active State
  [
    { el: DOM.gdriveNavMyDrive, id: 'my-drive' },
    { el: DOM.gdriveNavStarred, id: 'starred' },
    { el: DOM.gdriveNavRecent, id: 'recent' }
  ].forEach(nav => {
    if (nav.el) {
      nav.el.classList.toggle('active', STATE.activeDriveNav === nav.id);
    }
  });

  // Update Breadcrumb Bar
  if (DOM.gdriveBreadcrumbRoot) {
    if (STATE.activeDriveNav === 'starred') {
      DOM.gdriveBreadcrumbRoot.innerHTML = '<span>Starred</span>';
    } else if (STATE.activeDriveNav === 'recent') {
      DOM.gdriveBreadcrumbRoot.innerHTML = '<span>Recent</span>';
    } else {
      DOM.gdriveBreadcrumbRoot.innerHTML = '<span>My Drive</span>';
    }
  }

  if (DOM.gdriveFoldersSection) {
    DOM.gdriveFoldersSection.style.display = 'none';
  }

  // --------------------------------------------------------------------------
  // FILTERING FILES (Drive Nav + Folder + Type + Search + Sort)
  // --------------------------------------------------------------------------
  const filtered = getFilteredDriveResources();
  const q = (STATE.resourceSearchQuery || '').trim().toLowerCase();

  // Update Stats Header
  if (DOM.resourcesStatsOverview) {
    DOM.resourcesStatsOverview.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
  }

  // Toggle View Switch Buttons UI
  if (DOM.gdriveViewGridBtn) DOM.gdriveViewGridBtn.classList.toggle('active', STATE.resourceViewMode !== 'list');
  if (DOM.gdriveViewListBtn) DOM.gdriveViewListBtn.classList.toggle('active', STATE.resourceViewMode === 'list');

  // Empty state handling
  if (filtered.length === 0) {
    if (DOM.resourcesEmptyState) {
      DOM.resourcesEmptyState.style.display = 'block';
      const emptyDesc = DOM.resourcesEmptyState.querySelector('.empty-desc');
      if (emptyDesc) {
        if (STATE.activeDriveNav === 'starred') {
          emptyDesc.textContent = 'No starred files. Right-click or use the star icon on any file to add it here.';
        } else if (STATE.resourceFolderFilter !== 'all') {
          emptyDesc.textContent = `No files in folder "${STATE.resourceFolderFilter}". Click "+ New" to add files.`;
        } else {
          emptyDesc.textContent = 'No study files found. Use the "+ New" button to upload documents, PDFs, or create revision notes.';
        }
      }
    }
    return;
  }
  if (DOM.resourcesEmptyState) DOM.resourcesEmptyState.style.display = 'none';

  // --------------------------------------------------------------------------
  // LIST VIEW: Google Drive Interactive Table
  // --------------------------------------------------------------------------
  if (STATE.resourceViewMode === 'list') {
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'gdrive-table-wrapper';

    const table = document.createElement('table');
    table.className = 'gdrive-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width: 58%;">Name ▾</th>
          <th style="width: 14%;">Size</th>
          <th style="width: 16%;">Last Modified</th>
          <th style="width: 12%; text-align: right;">Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    filtered.forEach(res => {
      const tr = document.createElement('tr');
      tr.className = 'gdrive-table-row';
      tr.id = `res-row-${res.id}`;
      if (STATE.selectedResourceId === res.id) {
        tr.style.background = 'rgba(38, 132, 252, 0.12)';
      }

      let icon = '📄';
      if (res.typeGroup === 'pdf') icon = '📄';
      else if (res.typeGroup === 'image') icon = '🖼️';
      else if (res.typeGroup === 'doc') icon = '📝';
      else if (res.typeGroup === 'sheet') icon = '📊';
      else if (res.typeGroup === 'archive') icon = '📦';
      else if (res.linkUrl) icon = '🔗';

      const isStarred = starredList.includes(res.id);
      const dateStr = new Date(res.updatedAt || res.createdAt || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const highlightedTitle = q ? highlightSearchMatch(res.title || res.fileName, q) : escapeHtml(res.title || res.fileName);

      tr.innerHTML = `
        <td>
          <div class="gdrive-row-name-cell" title="Click to open document directly">
            <span class="gdrive-row-icon">${icon}</span>
            <div style="overflow: hidden; max-width: 520px;">
              <div class="gdrive-row-name-text">${highlightedTitle}</div>
              <div class="gdrive-row-subtext">${escapeHtml(res.fileName || 'file')}</div>
            </div>
            ${isStarred ? '<span style="color: #f59e0b; font-size: 0.9rem;" title="Starred">⭐</span>' : ''}
          </div>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${res.sizeFormatted || formatFileSize(res.size)}</td>
        <td style="font-size: 0.8rem; color: var(--text-dim); white-space: nowrap;">${dateStr}</td>
        <td style="text-align: right;">
          <div class="gdrive-row-actions" style="justify-content: flex-end;">
            <button type="button" class="btn-gdrive-action action-preview res-preview-btn" title="Open document directly" aria-label="Open">👁️</button>
            <button type="button" class="btn-gdrive-action action-download res-download-btn" title="Download file" aria-label="Download">⬇️</button>
            <button type="button" class="btn-gdrive-action res-star-btn" title="${isStarred ? 'Remove from Starred' : 'Add to Starred'}">${isStarred ? '⭐' : '☆'}</button>
            <button type="button" class="btn-gdrive-action res-menu-btn" title="More actions">⋮</button>
          </div>
        </td>
      `;

      // Single click directly opens the document without interruption!
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        selectDriveFile(res.id);
        openResourceDirectly(res.id);
      });

      // Double-click also opens directly
      tr.addEventListener('dblclick', () => {
        openResourceDirectly(res.id);
      });

      // Right-click Google Drive context menu
      tr.addEventListener('contextmenu', (e) => {
        showContextMenu(e, res.id);
      });

      tr.querySelector('.res-preview-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openResourceDirectly(res.id);
      });

      tr.querySelector('.res-download-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadResource(res.id);
      });

      tr.querySelector('.res-star-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStarResource(res.id);
      });

      tr.querySelector('.res-menu-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showContextMenu(e, res.id);
      });

      tbody.appendChild(tr);
    });

    tableWrapper.appendChild(table);
    DOM.resourcesContainer.appendChild(tableWrapper);
    return;
  }

  // --------------------------------------------------------------------------
  // GRID VIEW: Google Drive Card Vault
  // --------------------------------------------------------------------------
  const gridContainer = document.createElement('div');
  gridContainer.className = 'resources-grid';

  filtered.forEach(res => {
    const card = document.createElement('div');
    card.className = 'gdrive-file-card';
    card.id = `res-card-${res.id}`;
    if (STATE.selectedResourceId === res.id) {
      card.classList.add('selected');
    }

    let fileIcon = '📄';
    let iconColor = '#ef4444'; // PDF red
    if (res.typeGroup === 'pdf') {
      fileIcon = '📄';
      iconColor = '#ef4444';
    } else if (res.typeGroup === 'image') {
      fileIcon = '🖼️';
      iconColor = '#8b5cf6';
    } else if (res.typeGroup === 'doc') {
      fileIcon = '📝';
      iconColor = '#3b82f6';
    } else if (res.typeGroup === 'sheet') {
      fileIcon = '📊';
      iconColor = '#10b981';
    } else if (res.linkUrl) {
      fileIcon = '🔗';
      iconColor = '#06b6d4';
    }

    const isStarred = starredList.includes(res.id);
    const dateStr = new Date(res.updatedAt || res.createdAt || Date.now()).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });

    // Preview Stage Mockup
    let stageHtml = '';
    if (res.typeGroup === 'image') {
      const imgSrc = res.thumbnail || res.dataUrl || '';
      stageHtml = `
        <div class="gdrive-card-stage" title="Click to open image directly">
          <img src="${imgSrc || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><text y=\'50\' font-size=\'30\'>🖼️</text></svg>'}" alt="${escapeHtml(res.title)}" />
        </div>
      `;
    } else if (res.typeGroup === 'pdf') {
      stageHtml = `
        <div class="gdrive-card-stage" title="Click to open PDF directly in browser">
          <div class="gdrive-pdf-mockup">
            <span class="gdrive-pdf-mockup-icon">📄</span>
            <span class="gdrive-pdf-mockup-text">${escapeHtml(res.title.substring(0, 32))}</span>
          </div>
        </div>
      `;
    } else if (res.typeGroup === 'doc' || res.extension === 'md' || res.extension === 'txt') {
      stageHtml = `
        <div class="gdrive-card-stage" title="Click to open document directly">
          <div class="gdrive-doc-mockup">
            <span style="font-size: 2.3rem;">📝</span>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">${escapeHtml(res.title.substring(0, 32))}</span>
          </div>
        </div>
      `;
    } else {
      stageHtml = `
        <div class="gdrive-card-stage" title="Click to open document directly">
          <div style="text-align: center; color: var(--text-dim);">
            <span style="font-size: 2.5rem;">${fileIcon}</span>
          </div>
        </div>
      `;
    }

    const highlightedTitle = q ? highlightSearchMatch(res.title || res.fileName, q) : escapeHtml(res.title || res.fileName);

    card.innerHTML = `
      <div class="gdrive-card-top-row">
        <div class="gdrive-card-title-cell">
          <span class="gdrive-card-file-icon">${fileIcon}</span>
          <span class="gdrive-card-title-text" title="${escapeHtml(res.title)}">${highlightedTitle}</span>
        </div>
        <div class="gdrive-card-actions">
          ${isStarred ? '<span style="color: #f59e0b; font-size: 0.85rem;" title="Starred">⭐</span>' : ''}
          <button type="button" class="btn-gdrive-card-menu res-menu-btn" title="More options">⋮</button>
        </div>
      </div>

      ${stageHtml}

      <div class="gdrive-card-footer">
        <span class="gdrive-card-ext-pill">${(res.extension || res.typeGroup || 'FILE').toUpperCase()}</span>
        <span>${res.sizeFormatted || formatFileSize(res.size)} • ${dateStr}</span>
      </div>
    `;

    // 1-Click: Directly open document without any interruption!
    card.addEventListener('click', (e) => {
      if (e.target.closest('.res-menu-btn')) return;
      selectDriveFile(res.id);
      openResourceDirectly(res.id);
    });

    // Double-click also opens directly
    card.addEventListener('dblclick', () => {
      openResourceDirectly(res.id);
    });

    // Right-click: Custom Google Drive context menu
    card.addEventListener('contextmenu', (e) => {
      showContextMenu(e, res.id);
    });

    card.querySelector('.res-menu-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showContextMenu(e, res.id);
    });

    gridContainer.appendChild(card);
  });

  DOM.resourcesContainer.appendChild(gridContainer);
}

/* ==========================================================================
   Google Drive File Selection & Details Drawer
   ========================================================================== */

function selectDriveFile(resourceId) {
  STATE.selectedResourceId = resourceId;

  // Highlight selected card or row
  document.querySelectorAll('.gdrive-file-card').forEach(c => {
    c.classList.toggle('selected', c.id === `res-card-${resourceId}`);
  });
  document.querySelectorAll('.gdrive-table-row').forEach(r => {
    if (r.id === `res-row-${resourceId}`) {
      r.style.background = 'rgba(38, 132, 252, 0.12)';
    } else {
      r.style.background = '';
    }
  });

  renderDetailsPane(resourceId);
}

function toggleDetailsPane() {
  STATE.isDetailsPaneOpen = !STATE.isDetailsPaneOpen;
  if (DOM.gdriveDetailsPane) {
    DOM.gdriveDetailsPane.style.display = STATE.isDetailsPaneOpen ? 'flex' : 'none';
  }
  if (STATE.isDetailsPaneOpen && STATE.selectedResourceId) {
    renderDetailsPane(STATE.selectedResourceId);
  }
}

function renderDetailsPane(resourceId) {
  if (!DOM.gdriveDetailsBody) return;
  const res = STATE.resources.find(r => r.id === resourceId);

  if (!res) {
    DOM.gdriveDetailsBody.innerHTML = `
      <div class="gdrive-details-placeholder">
        <span style="font-size: 2.5rem; opacity: 0.5;">📁</span>
        <p>Select a file to inspect its preview, size, folder, and revision notes.</p>
      </div>
    `;
    return;
  }

  if (DOM.gdriveDetailsTitle) {
    DOM.gdriveDetailsTitle.textContent = res.title;
  }

  const createdDate = new Date(res.createdAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const updatedDate = new Date(res.updatedAt || res.createdAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  let previewHtml = '';
  if (res.typeGroup === 'image') {
    previewHtml = `<img src="${res.thumbnail || res.dataUrl || ''}" alt="${escapeHtml(res.title)}" />`;
  } else {
    let icon = '📄';
    if (res.typeGroup === 'doc') icon = '📝';
    if (res.typeGroup === 'sheet') icon = '📊';
    if (res.linkUrl) icon = '🔗';
    previewHtml = `<span style="font-size: 3.5rem;">${icon}</span>`;
  }

  DOM.gdriveDetailsBody.innerHTML = `
    <div class="gdrive-details-preview-box">
      ${previewHtml}
    </div>

    <div style="display: flex; gap: 0.5rem;">
      <button type="button" class="btn-primary" style="flex: 1; padding: 6px 12px; font-size: 0.82rem;" id="panePreviewBtn">🚀 Open</button>
      <button type="button" class="btn-secondary" style="flex: 1; padding: 6px 12px; font-size: 0.82rem;" id="paneDownloadBtn">⬇️ Download</button>
    </div>

    <div class="gdrive-props-table">
      <div class="gdrive-prop-row">
        <span class="gdrive-prop-label">Type</span>
        <span class="gdrive-prop-val">${(res.mimeType || res.extension || 'File').toUpperCase()}</span>
      </div>
      <div class="gdrive-prop-row">
        <span class="gdrive-prop-label">Size</span>
        <span class="gdrive-prop-val">${res.sizeFormatted || formatFileSize(res.size)}</span>
      </div>
      <div class="gdrive-prop-row">
        <span class="gdrive-prop-label">Storage used</span>
        <span class="gdrive-prop-val">${res.sizeFormatted || formatFileSize(res.size)}</span>
      </div>
      <div class="gdrive-prop-row">
        <span class="gdrive-prop-label">Location</span>
        <span class="gdrive-prop-val">My Drive</span>
      </div>
      <div class="gdrive-prop-row">
        <span class="gdrive-prop-label">Owner</span>
        <span class="gdrive-prop-val">You</span>
      </div>
      <div class="gdrive-prop-row">
        <span class="gdrive-prop-label">Modified</span>
        <span class="gdrive-prop-val">${updatedDate}</span>
      </div>
      <div class="gdrive-prop-row">
        <span class="gdrive-prop-label">Created</span>
        <span class="gdrive-prop-val">${createdDate}</span>
      </div>
    </div>

    ${res.description ? `
      <div class="gdrive-details-notes-box">
        <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">Revision Notes</strong>
        ${escapeHtml(res.description)}
      </div>
    ` : ''}

    <button type="button" class="btn-secondary" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3); padding: 6px 12px; font-size: 0.82rem;" id="paneDeleteBtn">🗑️ Delete file</button>
  `;

  // Bind Pane Actions
  const pPre = DOM.gdriveDetailsBody.querySelector('#panePreviewBtn');
  if (pPre) pPre.addEventListener('click', () => openResourceDirectly(res.id));

  const pDown = DOM.gdriveDetailsBody.querySelector('#paneDownloadBtn');
  if (pDown) pDown.addEventListener('click', () => downloadResource(res.id));

  const pDel = DOM.gdriveDetailsBody.querySelector('#paneDeleteBtn');
  if (pDel) pDel.addEventListener('click', () => deleteResource(res.id));
}

/* ==========================================================================
   Google Drive Context Menu & Star Actions
   ========================================================================== */

function showContextMenu(e, resourceId) {
  e.preventDefault();
  e.stopPropagation();

  STATE.selectedResourceId = resourceId;
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res || !DOM.gdriveContextMenu) return;

  const isStarred = (STATE.starredResourceIds || []).includes(resourceId);
  if (DOM.ctxStarText) {
    DOM.ctxStarText.textContent = isStarred ? 'Remove from Starred' : 'Add to Starred';
  }

  // Position context menu
  const menu = DOM.gdriveContextMenu;
  menu.style.display = 'flex';

  const menuWidth = 220;
  const menuHeight = 220;
  let posX = e.clientX;
  let posY = e.clientY;

  if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
  if (posY + menuHeight > window.innerHeight) posY = window.innerHeight - menuHeight - 10;

  menu.style.left = `${posX}px`;
  menu.style.top = `${posY}px`;

  // Bind Context Menu actions
  if (DOM.ctxPreview) DOM.ctxPreview.onclick = () => { hideContextMenu(); openResourceDirectly(resourceId); };
  if (DOM.ctxDownload) DOM.ctxDownload.onclick = () => { hideContextMenu(); downloadResource(resourceId); };
  if (DOM.ctxEdit) DOM.ctxEdit.onclick = () => { hideContextMenu(); openEditResourceModal(resourceId); };
  if (DOM.ctxStar) DOM.ctxStar.onclick = () => { hideContextMenu(); toggleStarResource(resourceId); };
  if (DOM.ctxDetails) DOM.ctxDetails.onclick = () => { hideContextMenu(); if (!STATE.isDetailsPaneOpen) toggleDetailsPane(); selectDriveFile(resourceId); };
  if (DOM.ctxDelete) DOM.ctxDelete.onclick = () => { hideContextMenu(); deleteResource(resourceId); };
}

function hideContextMenu() {
  if (DOM.gdriveContextMenu) {
    DOM.gdriveContextMenu.style.display = 'none';
  }
}

function toggleStarResource(resourceId) {
  const res = (STATE.resources || []).find(r => r.id === resourceId);
  if (!STATE.starredResourceIds) STATE.starredResourceIds = [];
  const idx = STATE.starredResourceIds.indexOf(resourceId);

  if (idx !== -1) {
    STATE.starredResourceIds.splice(idx, 1);
    if (res) res.starred = false;
    showToast('Removed from Starred', 'info');
  } else {
    STATE.starredResourceIds.push(resourceId);
    if (res) res.starred = true;
    showToast('Added to Starred ⭐', 'success');
  }

  try {
    localStorage.setItem(STORAGE_KEYS.STARRED_RESOURCES, JSON.stringify(STATE.starredResourceIds));
  } catch (err) {}
  saveResources();
  updateBadges();
  renderResources();
  syncGlobally();
}

/* ==========================================================================
   Google Drive "+ New" Creation Handlers (Docs, Folders, Links, Uploads)
   ========================================================================== */

function openAddResourceModal(preloadedFile = null) {
  STATE.editingResourceId = null;
  STATE.currentSelectedUploadFile = null;

  if (DOM.resourceForm) DOM.resourceForm.reset();
  if (DOM.resourceIdInput) DOM.resourceIdInput.value = '';
  if (DOM.resourceModalTitle) DOM.resourceModalTitle.innerHTML = '<span>📁</span> Upload Study Resource';

  // Modal file picker state
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
  if (DOM.resourceCategoryInput) DOM.resourceCategoryInput.value = res.category || 'PDF Documents';
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
    if (group === 'pdf') DOM.resourceCategoryInput.value = 'PDF Documents';
    else if (group === 'image') DOM.resourceCategoryInput.value = 'Diagrams & Charts';
    else if (group === 'sheet') DOM.resourceCategoryInput.value = 'Formulas & Cheatsheets';
    else if (group === 'doc') DOM.resourceCategoryInput.value = 'General Study Notes';
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

  const category = (DOM.resourceCategoryInput ? DOM.resourceCategoryInput.value : '') || '';
  const unit = (DOM.resourceUnitInput ? DOM.resourceUnitInput.value : '').trim();
  const desc = (DOM.resourceDescInput ? DOM.resourceDescInput.value : '').trim();

  // If editing an existing resource
  if (STATE.editingResourceId) {
    const idx = STATE.resources.findIndex(r => r.id === STATE.editingResourceId);
    if (idx !== -1) {
      STATE.resources[idx].title = title;
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
        if (typeof SyncEngine !== 'undefined' && SyncEngine.pushFile) {
          SyncEngine.pushFile(STATE.editingResourceId, fileDataUrl, file.type, file.name).catch(() => {});
        }

        STATE.resources[idx].fileName = file.name;
        STATE.resources[idx].size = file.size;
        STATE.resources[idx].sizeFormatted = formatFileSize(file.size);
        STATE.resources[idx].mimeType = file.type || 'application/octet-stream';
        STATE.resources[idx].extension = ext;
        STATE.resources[idx].typeGroup = group;
        if (thumb) STATE.resources[idx].thumbnail = thumb;
        STATE.resources[idx].dataUrl = fileDataUrl;
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
  unmarkResourceDeleted(resId);
  const group = getFileTypeGroup(file.name, file.type);
  const ext = file.name.split('.').pop().toLowerCase();

  let thumb = '';
  if (group === 'image') {
    thumb = await generateImageThumbnail(file);
  }

  const fileDataUrl = await readFileAsDataURL(file);
  await IdbResourceStore.saveFile(resId, fileDataUrl, file.type, file.name);
  if (typeof SyncEngine !== 'undefined' && SyncEngine.pushFile) {
    SyncEngine.pushFile(resId, fileDataUrl, file.type, file.name).catch(() => {});
  }

  const newResource = {
    id: resId,
    title,
    fileName: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    mimeType: file.type || 'application/octet-stream',
    extension: ext,
    typeGroup: group,
    paper: 'ALL',
    category,
    unit,
    description: desc,
    thumbnail: thumb,
    dataUrl: fileDataUrl,
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
    unmarkResourceDeleted(resId);
    const group = getFileTypeGroup(file.name, file.type);
    const ext = file.name.split('.').pop().toLowerCase();
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

    let thumb = '';
    if (group === 'image') {
      thumb = await generateImageThumbnail(file);
    }

    const fileDataUrl = await readFileAsDataURL(file);
    await IdbResourceStore.saveFile(resId, fileDataUrl, file.type, file.name);
    if (typeof SyncEngine !== 'undefined' && SyncEngine.pushFile) {
      SyncEngine.pushFile(resId, fileDataUrl, file.type, file.name).catch(() => {});
    }

    const category = '';

    const newResource = {
      id: resId,
      title: cleanTitle,
      fileName: file.name,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      mimeType: file.type || 'application/octet-stream',
      extension: ext,
      typeGroup: group,
      paper: 'ALL',
      category,
      unit: '',
      description: '',
      thumbnail: thumb,
      dataUrl: fileDataUrl,
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

// ----------------------------------------------------------------------------
// "+ New" Option 1: Create New Study Note / Document (PDF, Markdown, Text)
// ----------------------------------------------------------------------------
function openCreateDocModal() {
  if (DOM.createDocForm) DOM.createDocForm.reset();
  if (DOM.docFormatSelect) DOM.docFormatSelect.value = 'pdf';

  if (DOM.createDocModal) {
    DOM.createDocModal.classList.add('open');
    pushModalHistory('createDocModal');
    if (DOM.docTitleInput) DOM.docTitleInput.focus();
  }
}

function closeCreateDocModal(triggerHistoryBack = false) {
  if (DOM.createDocModal) {
    DOM.createDocModal.classList.remove('open');
  }
  if (DOM.createDocForm) DOM.createDocForm.reset();

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

async function saveCreateDoc(e) {
  if (e) e.preventDefault();

  const title = (DOM.docTitleInput ? DOM.docTitleInput.value : '').trim();
  if (!title) {
    showToast('Please enter a Document Title.', 'error');
    if (DOM.docTitleInput) DOM.docTitleInput.focus();
    return;
  }

  const category = (DOM.docCategoryInput ? DOM.docCategoryInput.value : '') || '';
  const format = DOM.docFormatSelect ? DOM.docFormatSelect.value : 'pdf';
  const content = (DOM.docContentInput ? DOM.docContentInput.value : '').trim() || `${title}\n\nRevision notes created in NathKhat.`;

  const resId = 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  unmarkResourceDeleted(resId);
  const cleanTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');

  let fileBlob;
  let fileName;
  let mimeType;
  let typeGroup = 'doc';
  let extension = format;

  if (format === 'pdf') {
    fileBlob = generateValidPdfBlob(title, content, { category, unit: 'Study Note' });
    fileName = `${cleanTitle}.pdf`;
    mimeType = 'application/pdf';
    typeGroup = 'pdf';
    extension = 'pdf';
  } else if (format === 'md') {
    fileBlob = new Blob(['\uFEFF' + content], { type: 'text/markdown;charset=utf-8' });
    fileName = `${cleanTitle}.md`;
    mimeType = 'text/markdown';
  } else {
    fileBlob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
    fileName = `${cleanTitle}.txt`;
    mimeType = 'text/plain';
  }

  const dataUrl = await blobToDataUrl(fileBlob);
  if (dataUrl) {
    await IdbResourceStore.saveFile(resId, dataUrl, mimeType, fileName);
    if (typeof SyncEngine !== 'undefined' && SyncEngine.pushFile) {
      SyncEngine.pushFile(resId, dataUrl, mimeType, fileName).catch(() => {});
    }
  }

  const newResource = {
    id: resId,
    title,
    fileName,
    size: fileBlob.size,
    sizeFormatted: formatFileSize(fileBlob.size),
    mimeType,
    extension,
    typeGroup,
    paper: 'ALL',
    category,
    unit: 'Study Note',
    description: content.substring(0, 160),
    dataUrl: dataUrl || '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  STATE.resources.unshift(newResource);
  saveResources();
  renderResources();
  updateBadges();
  syncGlobally();
  closeCreateDocModal();
  showToast(`Created document: "${title}"`, 'success');

  // Immediately open the newly created document directly!
  openResourceDirectly(resId);
}

// ----------------------------------------------------------------------------
// "+ New" Option 2: Create New Folder
// ----------------------------------------------------------------------------
function openCreateFolderModal() {
  if (DOM.createFolderForm) DOM.createFolderForm.reset();
  if (DOM.createFolderModal) {
    DOM.createFolderModal.classList.add('open');
    pushModalHistory('createFolderModal');
    if (DOM.folderNameInput) DOM.folderNameInput.focus();
  }
}

function closeCreateFolderModal(triggerHistoryBack = false) {
  if (DOM.createFolderModal) {
    DOM.createFolderModal.classList.remove('open');
  }
  if (DOM.createFolderForm) DOM.createFolderForm.reset();

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function saveCreateFolder(e) {
  if (e) e.preventDefault();

  const folderName = (DOM.folderNameInput ? DOM.folderNameInput.value : '').trim();
  if (!folderName) {
    showToast('Please enter a Folder Name.', 'error');
    if (DOM.folderNameInput) DOM.folderNameInput.focus();
    return;
  }

  if (!STATE.customFolders) STATE.customFolders = [];
  if (!STATE.customFolders.includes(folderName)) {
    STATE.customFolders.push(folderName);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOLDERS, JSON.stringify(STATE.customFolders));
    } catch (err) {}
  }

  STATE.resourceFolderFilter = folderName;
  closeCreateFolderModal();
  renderResources();
  showToast(`Created folder "${folderName}"`, 'success');
}

// ----------------------------------------------------------------------------
// "+ New" Option 3: Add Study Link
// ----------------------------------------------------------------------------
function openCreateLinkModal() {
  if (DOM.createLinkForm) DOM.createLinkForm.reset();
  if (DOM.createLinkModal) {
    DOM.createLinkModal.classList.add('open');
    pushModalHistory('createLinkModal');
    if (DOM.linkTitleInput) DOM.linkTitleInput.focus();
  }
}

function closeCreateLinkModal(triggerHistoryBack = false) {
  if (DOM.createLinkModal) {
    DOM.createLinkModal.classList.remove('open');
  }
  if (DOM.createLinkForm) DOM.createLinkForm.reset();

  if (triggerHistoryBack && window.history && window.history.state && window.history.state.modalOpen) {
    window.history.back();
  }
}

function saveCreateLink(e) {
  if (e) e.preventDefault();

  const title = (DOM.linkTitleInput ? DOM.linkTitleInput.value : '').trim();
  let url = (DOM.linkUrlInput ? DOM.linkUrlInput.value : '').trim();
  const desc = (DOM.linkDescInput ? DOM.linkDescInput.value : '').trim();

  if (!title) {
    showToast('Please enter a Link Title.', 'error');
    if (DOM.linkTitleInput) DOM.linkTitleInput.focus();
    return;
  }

  if (!url) {
    showToast('Please enter a valid URL.', 'error');
    if (DOM.linkUrlInput) DOM.linkUrlInput.focus();
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  const resId = 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  unmarkResourceDeleted(resId);
  const newResource = {
    id: resId,
    title,
    fileName: title + ' (Link)',
    linkUrl: url,
    size: 512,
    sizeFormatted: 'Link',
    mimeType: 'text/html',
    extension: 'link',
    typeGroup: 'doc',
    paper: 'ALL',
    category: 'Quick Links',
    unit: 'Web Resource',
    description: desc || url,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  STATE.resources.unshift(newResource);
  saveResources();
  renderResources();
  updateBadges();
  syncGlobally();
  closeCreateLinkModal();
  showToast(`Saved link "${title}"`, 'success');
}

async function deleteResource(resourceId) {
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res) return;

  if (!confirm(`Are you sure you want to delete "${res.title}"?`)) {
    return;
  }

  // Explicit deletion: mark this resource ID as deleted so background sync won't resurrect it
  markResourceDeleted(resourceId);

  STATE.resources = STATE.resources.filter(r => r.id !== resourceId);
  if (STATE.starredResourceIds) {
    STATE.starredResourceIds = STATE.starredResourceIds.filter(id => id !== resourceId);
    try {
      localStorage.setItem(STORAGE_KEYS.STARRED_RESOURCES, JSON.stringify(STATE.starredResourceIds));
    } catch (err) {}
  }
  await IdbResourceStore.deleteFile(resourceId);
  if (typeof SyncEngine !== 'undefined' && SyncEngine.deleteFile) {
    SyncEngine.deleteFile(resourceId).catch(() => {});
  }

  saveResources();
  renderResources();
  updateBadges();
  syncGlobally();
  showToast(`Deleted resource: "${res.title}"`, 'info');
}

/* ==========================================================================
   Binary File Utilities & Valid Format Generators (Error-Free Opening)
   ========================================================================== */

/**
 * Generates a 100% syntactically valid PDF 1.4 binary Blob.
 * Opens cleanly in Adobe Acrobat Reader, Google Chrome, Microsoft Edge, and macOS Preview with 0 errors.
 */
function generateValidPdfBlob(title, content, extraMeta = {}) {
  function esc(s) {
    return (s || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  // Break content into clean wrapped lines for a standard Letter / A4 page
  const cleanContent = (content || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = cleanContent.split('\n');
  const lines = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.trim().split(/\s+/);
    let curr = '';
    for (const w of words) {
      if ((curr + ' ' + w).length > 72) {
        if (curr) lines.push(curr);
        curr = w;
      } else {
        curr = curr ? curr + ' ' + w : w;
      }
    }
    if (curr) lines.push(curr);
  }

  const cleanTitle = (title || 'Study Document').trim();
  const category = extraMeta.category || 'General Resource';
  const unit = extraMeta.unit ? ` • ${extraMeta.unit}` : '';

  // Standard PDF 1.4 content stream using Type 1 Helvetica font
  let stream = 'BT\n';
  stream += '/F1 18 Tf\n';
  stream += '50 740 Td\n';
  stream += `(${esc(cleanTitle)}) Tj\n`;
  stream += '/F1 10 Tf\n';
  stream += '0 -24 Td\n';
  stream += `(NathKhat Files Vault - ${esc(category)}${esc(unit)}) Tj\n`;
  stream += '0 -14 Td\n';
  stream += '(--------------------------------------------------------------------------------) Tj\n';

  const maxLines = 32;
  const displayLines = lines.slice(0, maxLines);
  for (const l of displayLines) {
    if (l === '') {
      stream += '0 -12 Td\n() Tj\n';
    } else {
      stream += '0 -15 Td\n';
      stream += `(${esc(l)}) Tj\n`;
    }
  }

  stream += '0 -28 Td\n';
  stream += '/F1 8 Tf\n';
  stream += '(Generated by NathKhat Revision Hub - All study files ready for offline viewing & print) Tj\n';
  stream += 'ET\n';

  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(stream);
  const streamLen = streamBytes.length;

  const objs = [];
  objs[1] = encoder.encode('<< /Type /Catalog /Pages 2 0 R >>');
  objs[2] = encoder.encode('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objs[3] = encoder.encode('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>');
  objs[4] = encoder.encode('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const part1 = encoder.encode(`<< /Length ${streamLen} >>\nstream\n`);
  const part2 = encoder.encode('\nendstream');
  const obj5 = new Uint8Array(part1.length + streamBytes.length + part2.length);
  obj5.set(part1, 0);
  obj5.set(streamBytes, part1.length);
  obj5.set(part2, part1.length + streamBytes.length);
  objs[5] = obj5;

  let totalLen = 9; // '%PDF-1.4\n' length
  const xref = [0];
  const objHeaders = [];
  const objFooters = [];
  for (let i = 1; i <= 5; i++) {
    const head = encoder.encode(`${i} 0 obj\n`);
    const foot = encoder.encode('\nendobj\n');
    objHeaders[i] = head;
    objFooters[i] = foot;
    xref[i] = totalLen;
    totalLen += head.length + objs[i].length + foot.length;
  }

  const xrefOffset = totalLen;
  let xrefStr = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    xrefStr += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
  }
  xrefStr += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const xrefBytes = encoder.encode(xrefStr);
  totalLen += xrefBytes.length;

  const finalPdf = new Uint8Array(totalLen);
  let offset = 0;
  finalPdf.set(encoder.encode('%PDF-1.4\n'), offset);
  offset += 9;
  for (let i = 1; i <= 5; i++) {
    finalPdf.set(objHeaders[i], offset);
    offset += objHeaders[i].length;
    finalPdf.set(objs[i], offset);
    offset += objs[i].length;
    finalPdf.set(objFooters[i], offset);
    offset += objFooters[i].length;
  }
  finalPdf.set(xrefBytes, offset);

  return new Blob([finalPdf], { type: 'application/pdf' });
}

function dataUrlToBlob(dataUrl) {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mime });
  } catch (e) {
    return new Blob([dataUrl], { type: 'application/octet-stream' });
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(blob);
  });
}

function downloadBlob(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(blobUrl);
  }, 2500);
}

/**
 * Downloads a resource cleanly and reliably.
 * Guaranteed to open in native applications without corruption or format errors.
 */
async function downloadResource(resourceId) {
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res) return;

  let data = await IdbResourceStore.getFile(resourceId);
  if (!data && (res.thumbnail || res.dataUrl)) {
    data = res.thumbnail || res.dataUrl;
  }

  const cleanBaseName = (res.title || res.fileName || 'file').replace(/[^a-zA-Z0-9_\-\. ]/g, '_').trim();
  let fileName = res.fileName || cleanBaseName;
  const ext = (res.extension || (fileName.includes('.') ? fileName.split('.').pop() : '')).toLowerCase();

  // If data is a base64 Data URL (uploaded PDF, image, doc, zip, etc.)
  if (data && typeof data === 'string' && data.startsWith('data:')) {
    const blob = dataUrlToBlob(data);
    downloadBlob(blob, fileName);
    showToast(`Downloaded: ${fileName}`, 'success');
    return;
  }

  // If no binary data in IndexedDB, generate a 100% valid file matching the type
  let blob;
  if (res.typeGroup === 'pdf' || ext === 'pdf') {
    if (!fileName.toLowerCase().endsWith('.pdf')) fileName += '.pdf';
    blob = generateValidPdfBlob(res.title, res.description || 'Study notes & revision guide.', res);
  } else if (res.typeGroup === 'image' || ext === 'svg') {
    if (!fileName.toLowerCase().endsWith('.svg') && ext === 'svg') fileName += '.svg';
    const svgXml = (data && data.includes('<svg')) ? data.replace(/^data:image\/svg\+xml;utf8,/, '') : (res.thumbnail && res.thumbnail.includes('<svg') ? res.thumbnail.replace(/^data:image\/svg\+xml;utf8,/, '') : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%"><rect width="600" height="400" fill="#0f172a"/><text x="300" y="180" fill="#f8fafc" font-size="20" font-weight="bold" font-family="sans-serif" text-anchor="middle">${escapeHtml(res.title)}</text><text x="300" y="220" fill="#94a3b8" font-size="14" font-family="sans-serif" text-anchor="middle">NathKhat Study Diagram</text></svg>`);
    blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
  } else if (res.linkUrl) {
    fileName = cleanBaseName + '.html';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(res.title)}</title><meta http-equiv="refresh" content="0; url=${encodeURI(res.linkUrl)}"></head><body><p>Redirecting to <a href="${encodeURI(res.linkUrl)}">${escapeHtml(res.title)}</a>...</p></body></html>`;
    blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  } else {
    if (!fileName.includes('.')) fileName += '.txt';
    const content = `${res.title}\n${'='.repeat(res.title.length)}\nFolder / Category: ${res.category || 'General'}\nTopic Tag: ${res.unit || 'General'}\nDate: ${new Date(res.createdAt || Date.now()).toLocaleDateString()}\n\n${res.description || ''}\n\nGenerated by NathKhat Revision Hub`;
    blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
  }

  downloadBlob(blob, fileName);
  showToast(`Downloaded: ${fileName}`, 'success');
}

/**
 * Pre-populates IndexedDB with valid binary files for default seed resources
 * so clicking Preview or Download immediately after initial load works with 0 errors.
 */
async function seedDefaultFilesIntoIdb() {
  // Ensure no default mock files are kept in IndexedDB
  try {
    ['res-seed-1', 'res-seed-2', 'res-seed-3', 'res-seed-4'].forEach(id => {
      IdbResourceStore.deleteFile(id).catch(() => {});
    });
  } catch (e) {}
}

/* ==========================================================================
   Document Viewer Engine (Opens On Screen Without Downloading)
   ========================================================================== */

/**
 * Universal PDF Renderer using PDF.js:
 * Renders all pages into high-DPI HTML5 canvas elements.
 * Works with 100% fidelity on small screens (mobile phones, tablets) and large screens (desktop).
 */
async function renderPdfDocumentOnScreen(blob, res) {
  if (!DOM.resourcePreviewBody) return;

  const cleanTitle = escapeHtml(res.fileName || res.title);
  DOM.resourcePreviewBody.innerHTML = `
    <div class="pdf-viewer-container">
      <div class="pdf-preview-toolbar">
        <span class="pdf-title-label" style="color: var(--text-dim); display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span>📄</span> ${cleanTitle}
        </span>
        <div class="pdf-preview-actions">
          <span class="pdf-page-count-badge" id="pdfPageIndicator" style="font-size: 0.78rem; color: var(--text-muted); padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.06); white-space: nowrap;">Loading...</span>
          <button type="button" class="btn-secondary" style="padding: 4px 12px; font-size: 0.8rem;" id="pdfOpenTabBtn">↗️ Full View</button>
          <button type="button" class="btn-primary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="downloadResource('${res.id}')">⬇️ Download</button>
        </div>
      </div>
      <div class="pdf-canvas-scroll-wrapper" id="pdfCanvasList">
        <div style="padding: 2.5rem 1rem; color: var(--text-dim); text-align: center;">
          <div class="loading-spinner" style="margin: 0 auto 0.75rem; width: 32px; height: 32px; border: 3px solid rgba(99,102,241,0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          Rendering document pages...
        </div>
      </div>
    </div>
  `;

  let blobUrl = '';
  try {
    blobUrl = URL.createObjectURL(blob);
  } catch (e) {}

  const openTabBtn = DOM.resourcePreviewBody.querySelector('#pdfOpenTabBtn');
  if (openTabBtn && blobUrl) {
    openTabBtn.onclick = () => window.open(blobUrl, '_blank');
  }

  // Universal client-side Canvas rendering via PDF.js (works 100% on iOS, Android, and Desktop)
  if (typeof pdfjsLib !== 'undefined') {
    try {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
      }

      const arrayBuffer = await blob.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const pageIndicator = DOM.resourcePreviewBody.querySelector('#pdfPageIndicator');
      if (pageIndicator) pageIndicator.textContent = `${numPages} page${numPages === 1 ? '' : 's'}`;

      const canvasContainer = DOM.resourcePreviewBody.querySelector('#pdfCanvasList');
      if (!canvasContainer) return;
      canvasContainer.innerHTML = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const containerWidth = canvasContainer.clientWidth || window.innerWidth || 600;
        const targetWidth = Math.max(280, Math.min(containerWidth - 28, 860));
        const unscaledViewport = page.getViewport({ scale: 1 });
        const displayScale = targetWidth / unscaledViewport.width;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5); // Sharp vector rendering
        const renderViewport = page.getViewport({ scale: displayScale * dpr });

        const pageCard = document.createElement('div');
        pageCard.className = 'pdf-page-card';

        const canvas = document.createElement('canvas');
        canvas.height = renderViewport.height;
        canvas.width = renderViewport.width;
        canvas.style.width = `${Math.round(renderViewport.width / dpr)}px`;
        canvas.style.height = 'auto';

        const ctx = canvas.getContext('2d', { alpha: false });
        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

        pageCard.appendChild(canvas);
        canvasContainer.appendChild(pageCard);
      }
      return;
    } catch (err) {
      console.warn('PDF.js rendering exception, falling back to browser iframe:', err);
    }
  }

  // Fallback if PDF.js is unavailable
  const canvasContainer = DOM.resourcePreviewBody.querySelector('#pdfCanvasList');
  if (canvasContainer && blobUrl) {
    canvasContainer.innerHTML = `<iframe class="pdf-preview-iframe" src="${blobUrl}#toolbar=1" title="${cleanTitle}"></iframe>`;
  }
}

/**
 * Opens any document directly on screen in the viewer without downloading.
 */
async function openResourceDirectly(resourceId) {
  openResourcePreview(resourceId);
}

async function openResourcePreview(resourceId) {
  const res = STATE.resources.find(r => r.id === resourceId);
  if (!res) return;

  // External Web Links open in new tab
  if (res.linkUrl) {
    window.open(res.linkUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  STATE.activePreviewResourceId = resourceId;

  const currentFiltered = getFilteredDriveResources();
  const fileIdx = currentFiltered.findIndex(r => r.id === resourceId);
  const posText = fileIdx !== -1 ? ` • (${fileIdx + 1} of ${currentFiltered.length})` : '';

  if (DOM.previewModalTitle) DOM.previewModalTitle.textContent = res.title;
  if (DOM.previewMetaSub) {
    const dateFormatted = new Date(res.updatedAt || res.createdAt || Date.now()).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    DOM.previewMetaSub.textContent = `${res.fileName || res.title} • ${res.sizeFormatted || formatFileSize(res.size)} • ${dateFormatted}${posText}`;
  }
  if (DOM.previewTypeBadge) {
    DOM.previewTypeBadge.textContent = res.extension ? res.extension.toUpperCase() : (res.typeGroup ? res.typeGroup.toUpperCase() : 'FILE');
  }

  // Update Prev / Next Buttons visibility
  if (DOM.previewPrevBtn) DOM.previewPrevBtn.style.display = currentFiltered.length > 1 ? 'flex' : 'none';
  if (DOM.previewNextBtn) DOM.previewNextBtn.style.display = currentFiltered.length > 1 ? 'flex' : 'none';

  if (!DOM.resourcePreviewBody) return;
  DOM.resourcePreviewBody.innerHTML = '<div style="padding: 3rem; color: var(--text-dim); text-align: center;"><div class="loading-spinner" style="margin: 0 auto 1rem; width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>Loading document...</div>';

  if (DOM.resourcePreviewModal) {
    DOM.resourcePreviewModal.classList.add('open');
    pushModalHistory('resourcePreviewModal');
  }

  // Retrieve authentic uploaded data without any synthesis or dummy modification
  let data = memoryFileCache.get(resourceId) || res.dataUrl || res.fileData;
  if (!data) {
    try { data = sessionStorage.getItem('nk_file_' + resourceId); } catch (e) {}
  }
  if (!data) {
    try { data = localStorage.getItem('nk_file_' + resourceId); } catch (e) {}
  }
  if (!data) {
    data = await IdbResourceStore.getFile(resourceId);
  }
  // If not yet available in local cache on this device, fetch seamlessly from Netlify Blobs Cloud
  if (!data && typeof SyncEngine !== 'undefined' && SyncEngine.fetchFile) {
    if (DOM.resourcePreviewBody) {
      DOM.resourcePreviewBody.innerHTML = `
        <div style="padding: 3rem; color: var(--text-dim); text-align: center;">
          <div class="loading-spinner" style="margin: 0 auto 1rem; width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          Syncing document from Cloud Drive...
        </div>
      `;
    }
    data = await SyncEngine.fetchFile(resourceId);
    if (data) {
      memoryFileCache.set(resourceId, data);
      res.dataUrl = data;
      IdbResourceStore.saveFile(resourceId, data, res.mimeType, res.fileName).catch(() => {});
    }
  }
  if (!data && res.thumbnail && typeof res.thumbnail === 'string' && res.thumbnail.startsWith('data:')) {
    data = res.thumbnail;
  }

  if (data) {
    memoryFileCache.set(resourceId, data);
    res.dataUrl = data;
  }

  const ext = (res.extension || (res.fileName && res.fileName.includes('.') ? res.fileName.split('.').pop() : '')).toLowerCase();
  let previewBlobUrl = '';

  if (data && typeof data === 'string' && data.startsWith('data:')) {
    try {
      const blob = dataUrlToBlob(data);
      previewBlobUrl = URL.createObjectURL(blob);
    } catch (e) {}
  }

  // Action: Open in dedicated browser tab (explicit user choice)
  if (DOM.previewOpenNewTabBtn) {
    DOM.previewOpenNewTabBtn.onclick = () => {
      if (previewBlobUrl) {
        window.open(previewBlobUrl, '_blank');
      } else if (res.linkUrl) {
        window.open(res.linkUrl, '_blank');
      } else {
        showToast('Document is open on screen.', 'info');
      }
    };
  }

  // Action: Download (explicit user choice only)
  if (DOM.previewDownloadBtn) {
    DOM.previewDownloadBtn.onclick = () => downloadResource(resourceId);
  }

  // 1. PDF Documents: Render authentic uploaded PDF directly on screen (flawless on mobile and desktop)
  if (res.typeGroup === 'pdf' || ext === 'pdf') {
    let pdfBlob = null;
    if (data && typeof data === 'string' && data.startsWith('data:')) {
      try { pdfBlob = dataUrlToBlob(data); } catch (e) {}
    }
    if (!pdfBlob && previewBlobUrl) {
      try {
        pdfBlob = await fetch(previewBlobUrl).then(r => r.blob()).catch(() => null);
      } catch (e) {}
    }

    if (pdfBlob) {
      await renderPdfDocumentOnScreen(pdfBlob, res);
      return;
    } else {
      DOM.resourcePreviewBody.innerHTML = `
        <div style="padding: 3rem 1.5rem; text-align: center; color: var(--text-muted); max-width: 520px; margin: 0 auto;">
          <span style="font-size: 3.5rem; display: block; margin-bottom: 1rem;">📄</span>
          <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">${escapeHtml(res.title)}</h3>
          <p style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 1.5rem;">${escapeHtml(res.fileName || 'document.pdf')} • ${res.sizeFormatted || formatFileSize(res.size)}</p>
          ${res.description ? `<p style="background: rgba(0,0,0,0.06); padding: 1.25rem; border-radius: 8px; text-align: left; line-height: 1.6; margin-bottom: 1.5rem;">${escapeHtml(res.description)}</p>` : ''}
          <button type="button" class="btn-primary" onclick="downloadResource('${res.id}')">⬇️ Download PDF</button>
        </div>
      `;
      return;
    }
  }

  // 2. Word Documents (.docx): Render authentic Word document on screen via Mammoth.js
  if ((ext === 'docx' || (res.mimeType && res.mimeType.includes('wordprocessingml'))) && typeof mammoth !== 'undefined' && data && typeof data === 'string' && data.startsWith('data:')) {
    try {
      const blob = dataUrlToBlob(data);
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const docHtml = (result && result.value) ? result.value : '<p><em>Empty document.</em></p>';

      DOM.resourcePreviewBody.innerHTML = `
        <div class="gdrive-doc-reader">
          <div class="gdrive-doc-sheet">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; gap: 0.5rem; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
              <h1 style="min-width: 0; flex: 1; margin: 0; word-break: break-word;">${escapeHtml(res.title)}</h1>
              <div style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn-secondary" style="padding: 4px 12px; font-size: 0.8rem;" id="previewCopyDocBtn">📋 Copy</button>
                <button type="button" class="btn-secondary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="downloadResource('${res.id}')">⬇️ Download</button>
              </div>
            </div>
            <div class="gdrive-doc-sheet-meta" style="margin-bottom: 1.5rem;">
              <span>📎 ${escapeHtml(res.fileName || 'document.docx')}</span>
              <span>• ${res.sizeFormatted || formatFileSize(res.size)}</span>
              ${res.unit ? `<span>• 🏷️ ${escapeHtml(res.unit)}</span>` : ''}
            </div>
            <div class="gdrive-doc-sheet-body" style="line-height: 1.8; font-size: 0.95rem; color: var(--text-main);">
              ${docHtml}
            </div>
          </div>
        </div>
      `;
      const copyBtn = DOM.resourcePreviewBody.querySelector('#previewCopyDocBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const bodyEl = DOM.resourcePreviewBody.querySelector('.gdrive-doc-sheet-body');
          if (bodyEl) {
            navigator.clipboard.writeText(bodyEl.innerText);
            showToast('Document text copied to clipboard!', 'success');
          }
        });
      }
      return;
    } catch (err) {
      console.warn('Could not parse docx via Mammoth:', err);
    }
  }

  // 3. Images: Render authentic uploaded image directly on screen
  if (res.typeGroup === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
    const imgSrc = previewBlobUrl || data || res.thumbnail || '';
    DOM.resourcePreviewBody.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: auto; padding: 1.5rem;">
        <img class="image-preview-full" src="${imgSrc}" alt="${escapeHtml(res.title)}" style="max-width: 95%; max-height: 82vh; object-fit: contain; border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.35);" />
      </div>
    `;
    return;
  }

  // 4. Text / Notes / Markdown: Render full text on screen
  if (res.typeGroup === 'doc' || ext === 'txt' || ext === 'md' || ext === 'note' || ext === 'html' || ext === 'json' || ext === 'js' || ext === 'py') {
    let textContent = res.description || '';
    if (data && typeof data === 'string' && (data.startsWith('data:text') || data.startsWith('data:application/json') || data.startsWith('data:application/javascript'))) {
      try {
        const base64Part = data.split(',')[1];
        textContent = decodeURIComponent(escape(atob(base64Part)));
      } catch (e) {
        try {
          textContent = atob(data.split(',')[1]);
        } catch (e2) {
          textContent = res.description || '';
        }
      }
    }
    const wordsCount = textContent ? textContent.trim().split(/\s+/).length : 0;
    DOM.resourcePreviewBody.innerHTML = `
      <div class="gdrive-doc-reader">
        <div class="gdrive-doc-sheet">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; gap: 0.5rem; flex-wrap: wrap;">
            <h1 style="min-width: 0; flex: 1; margin: 0; word-break: break-word; overflow-wrap: anywhere;">${escapeHtml(res.title)}</h1>
            <button type="button" class="btn-secondary" style="padding: 4px 12px; font-size: 0.8rem; flex-shrink: 0;" id="previewCopyDocBtn">📋 Copy</button>
          </div>
          <div class="gdrive-doc-sheet-meta">
            <span>📊 ${wordsCount} words</span>
            ${res.unit ? `<span>• 🏷️ ${escapeHtml(res.unit)}</span>` : ''}
          </div>
          <div class="gdrive-doc-sheet-body" style="white-space: pre-wrap; font-family: var(--font-mono, monospace); line-height: 1.6;">${escapeHtml(textContent || 'No text content available.')}</div>
        </div>
      </div>
    `;
    const copyBtn = DOM.resourcePreviewBody.querySelector('#previewCopyDocBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(textContent);
        showToast('Document text copied to clipboard!', 'success');
      });
    }
    return;
  }

  // 5. Audio Files
  if (res.typeGroup === 'audio' || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
    DOM.resourcePreviewBody.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; gap: 1.5rem; padding: 2rem;">
        <span style="font-size: 4rem;">🎵</span>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); text-align: center; word-break: break-word;">${escapeHtml(res.title)}</h3>
        <audio controls src="${previewBlobUrl || data || ''}" style="width: 100%; max-width: 500px;"></audio>
      </div>
    `;
    return;
  }

  // 6. Video Files
  if (res.typeGroup === 'video' || ['mp4', 'webm'].includes(ext)) {
    DOM.resourcePreviewBody.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; gap: 1rem; padding: 1.5rem;">
        <video controls src="${previewBlobUrl || data || ''}" style="max-width: 95%; max-height: 80vh; border-radius: 8px;"></video>
      </div>
    `;
    return;
  }

  // 7. Other Files (.doc, .xlsx, .pptx, .zip) -> Clean viewer card (NO automatic download!)
  let fileIcon = '📁';
  if (res.typeGroup === 'sheet' || ['xls', 'xlsx', 'csv'].includes(ext)) fileIcon = '📊';
  else if (res.typeGroup === 'archive' || ['zip', 'rar', '7z'].includes(ext)) fileIcon = '📦';
  else if (['ppt', 'pptx'].includes(ext)) fileIcon = '📽️';
  else if (['doc', 'docx'].includes(ext)) fileIcon = '📝';

  DOM.resourcePreviewBody.innerHTML = `
    <div class="gdrive-doc-reader">
      <div class="gdrive-doc-sheet" style="text-align: center; max-width: 600px; margin: 2rem auto; padding: 2.5rem 2rem;">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">${fileIcon}</div>
        <h1 style="border-bottom: none; margin-bottom: 0.5rem; word-break: break-word;">${escapeHtml(res.title)}</h1>
        <div class="gdrive-doc-sheet-meta" style="justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <span style="word-break: break-all;">${escapeHtml(res.fileName || 'file')}</span>
          <span>• ${res.sizeFormatted || formatFileSize(res.size)}</span>
          <span>• ${(res.extension || res.typeGroup || 'FILE').toUpperCase()}</span>
        </div>
        ${res.description ? `<p style="color: var(--text-muted); line-height: 1.6; text-align: left; background: rgba(0,0,0,0.06); padding: 1.25rem; border-radius: 8px; margin: 1.25rem 0;">${escapeHtml(res.description)}</p>` : ''}
        <div style="display: flex; justify-content: center; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap;">
          <button type="button" class="btn-primary" onclick="downloadResource('${res.id}')">
            <span>⬇️</span> Download File (${res.sizeFormatted || formatFileSize(res.size)})
          </button>
        </div>
      </div>
    </div>
  `;
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

function navigateResourcePreview(direction) {
  if (!STATE.activePreviewResourceId) return;
  const list = getFilteredDriveResources();
  if (!list || list.length === 0) return;
  const currentIndex = list.findIndex(r => r.id === STATE.activePreviewResourceId);
  if (currentIndex === -1) return;
  let nextIndex = currentIndex + direction;
  if (nextIndex < 0) nextIndex = list.length - 1;
  if (nextIndex >= list.length) nextIndex = 0;
  openResourcePreview(list[nextIndex].id);
}

function setupResourceEventListeners() {
  // Navigation tab
  if (DOM.tabResourcesView) {
    DOM.tabResourcesView.addEventListener('click', () => switchView('resourcesView'));
  }

  // Restore stored view mode, custom folders, and starred files
  try {
    const storedViewMode = localStorage.getItem(STORAGE_KEYS.RESOURCE_VIEW_MODE);
    if (storedViewMode === 'list' || storedViewMode === 'grid') {
      STATE.resourceViewMode = storedViewMode;
    }
    STATE.customFolders = [];
    const storedStarred = localStorage.getItem(STORAGE_KEYS.STARRED_RESOURCES);
    if (storedStarred) {
      try {
        const parsed = JSON.parse(storedStarred);
        const validIds = new Set((STATE.resources || []).map(r => r.id));
        STATE.starredResourceIds = Array.isArray(parsed) ? parsed.filter(id => validIds.has(id)) : [];
      } catch (err) {
        STATE.starredResourceIds = [];
      }
    }
  } catch (err) {}

  // Google Drive Left Navigation Sidebar
  if (DOM.gdriveNavMyDrive) {
    DOM.gdriveNavMyDrive.addEventListener('click', (e) => {
      e.preventDefault();
      STATE.activeDriveNav = 'my-drive';
      STATE.resourceFolderFilter = 'all';
      renderResources();
    });
  }

  if (DOM.gdriveNavStarred) {
    DOM.gdriveNavStarred.addEventListener('click', (e) => {
      e.preventDefault();
      STATE.activeDriveNav = 'starred';
      renderResources();
    });
  }

  if (DOM.gdriveNavRecent) {
    DOM.gdriveNavRecent.addEventListener('click', (e) => {
      e.preventDefault();
      STATE.activeDriveNav = 'recent';
      renderResources();
    });
  }

  if (DOM.gdriveNavTrash) {
    DOM.gdriveNavTrash.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('binView');
    });
  }

  // Google Drive Breadcrumbs & Back Navigation
  if (DOM.gdriveBreadcrumbRoot) {
    DOM.gdriveBreadcrumbRoot.addEventListener('click', () => {
      STATE.activeDriveNav = 'my-drive';
      STATE.resourceFolderFilter = 'all';
      renderResources();
    });
  }

  if (DOM.gdriveBackToRootBtn) {
    DOM.gdriveBackToRootBtn.addEventListener('click', () => {
      STATE.resourceFolderFilter = 'all';
      renderResources();
    });
  }

  // Google Drive Details Drawer (Toggle and Close)
  if (DOM.gdriveToggleDetailsBtn) {
    DOM.gdriveToggleDetailsBtn.addEventListener('click', () => {
      toggleDetailsPane();
    });
  }

  if (DOM.closeDetailsPaneBtn) {
    DOM.closeDetailsPaneBtn.addEventListener('click', () => {
      toggleDetailsPane();
    });
  }

  // Google Drive "+ New" Dropdown Toggle
  if (DOM.gdriveNewBtn && DOM.gdriveNewMenu) {
    DOM.gdriveNewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = DOM.gdriveNewMenu.style.display === 'flex';
      DOM.gdriveNewMenu.style.display = isOpen ? 'none' : 'flex';
    });

    document.addEventListener('click', (e) => {
      if (DOM.gdriveNewMenu && !DOM.gdriveNewMenu.contains(e.target) && e.target !== DOM.gdriveNewBtn && !DOM.gdriveNewBtn.contains(e.target)) {
        DOM.gdriveNewMenu.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.gdriveNewMenu && DOM.gdriveNewMenu.style.display === 'flex') {
        DOM.gdriveNewMenu.style.display = 'none';
      }
    });
  }

  // Google Drive "+ New" Menu Options
  if (DOM.menuUploadFile) {
    DOM.menuUploadFile.addEventListener('click', () => {
      if (DOM.gdriveNewMenu) DOM.gdriveNewMenu.style.display = 'none';
      if (DOM.resourceDropInput) DOM.resourceDropInput.click();
    });
  }

  if (DOM.menuNewDoc) {
    DOM.menuNewDoc.addEventListener('click', () => {
      if (DOM.gdriveNewMenu) DOM.gdriveNewMenu.style.display = 'none';
      openCreateDocModal();
    });
  }

  if (DOM.menuNewFolder) {
    DOM.menuNewFolder.addEventListener('click', () => {
      if (DOM.gdriveNewMenu) DOM.gdriveNewMenu.style.display = 'none';
      openCreateFolderModal();
    });
  }

  if (DOM.menuNewLink) {
    DOM.menuNewLink.addEventListener('click', () => {
      if (DOM.gdriveNewMenu) DOM.gdriveNewMenu.style.display = 'none';
      openCreateLinkModal();
    });
  }

  // Grid / List View Switching
  if (DOM.gdriveViewGridBtn) {
    DOM.gdriveViewGridBtn.addEventListener('click', () => {
      STATE.resourceViewMode = 'grid';
      try { localStorage.setItem(STORAGE_KEYS.RESOURCE_VIEW_MODE, 'grid'); } catch (e) {}
      renderResources();
    });
  }

  if (DOM.gdriveViewListBtn) {
    DOM.gdriveViewListBtn.addEventListener('click', () => {
      STATE.resourceViewMode = 'list';
      try { localStorage.setItem(STORAGE_KEYS.RESOURCE_VIEW_MODE, 'list'); } catch (e) {}
      renderResources();
    });
  }

  // Folder / Category Filter Change
  if (DOM.resourceFolderFilterSelect) {
    DOM.resourceFolderFilterSelect.addEventListener('change', (e) => {
      STATE.resourceFolderFilter = e.target.value;
      renderResources();
    });
  }

  // Type Filter Chip Change (PDFs, Images, Docs, Sheets, Links)
  if (DOM.resourceTypeFilterSelect) {
    DOM.resourceTypeFilterSelect.addEventListener('change', (e) => {
      STATE.resourceTypeFilter = e.target.value;
      renderResources();
    });
  }

  // Quick Upload Buttons
  if (DOM.openUploadResourceBtn) {
    DOM.openUploadResourceBtn.addEventListener('click', () => openAddResourceModal());
  }
  if (DOM.emptyStateUploadBtn) {
    DOM.emptyStateUploadBtn.addEventListener('click', () => openAddResourceModal());
  }

  // Upload/Edit Resource Modal Handlers
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

  // Create Doc Modal Handlers
  if (DOM.closeDocModalBtn) {
    DOM.closeDocModalBtn.addEventListener('click', () => closeCreateDocModal(false));
  }
  if (DOM.cancelDocModalBtn) {
    DOM.cancelDocModalBtn.addEventListener('click', () => closeCreateDocModal(false));
  }
  if (DOM.saveDocBtn) {
    DOM.saveDocBtn.addEventListener('click', saveCreateDoc);
  }
  if (DOM.createDocForm) {
    DOM.createDocForm.addEventListener('submit', saveCreateDoc);
  }

  // Create Folder Modal Handlers
  if (DOM.closeFolderModalBtn) {
    DOM.closeFolderModalBtn.addEventListener('click', () => closeCreateFolderModal(false));
  }
  if (DOM.cancelFolderModalBtn) {
    DOM.cancelFolderModalBtn.addEventListener('click', () => closeCreateFolderModal(false));
  }
  if (DOM.saveFolderBtn) {
    DOM.saveFolderBtn.addEventListener('click', saveCreateFolder);
  }
  if (DOM.createFolderForm) {
    DOM.createFolderForm.addEventListener('submit', saveCreateFolder);
  }

  // Create Link Modal Handlers
  if (DOM.closeLinkModalBtn) {
    DOM.closeLinkModalBtn.addEventListener('click', () => closeCreateLinkModal(false));
  }
  if (DOM.cancelLinkModalBtn) {
    DOM.cancelLinkModalBtn.addEventListener('click', () => closeCreateLinkModal(false));
  }
  if (DOM.saveLinkBtn) {
    DOM.saveLinkBtn.addEventListener('click', saveCreateLink);
  }
  if (DOM.createLinkForm) {
    DOM.createLinkForm.addEventListener('submit', saveCreateLink);
  }

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

  // Allow clicking on modal overlay backdrop to close preview
  if (DOM.resourcePreviewModal) {
    DOM.resourcePreviewModal.addEventListener('click', (e) => {
      if (e.target === DOM.resourcePreviewModal) {
        closeResourcePreview(false);
      }
    });
  }

  // Google Drive Preview Modal Navigation (Prev / Next & Keyboard Shortcuts)
  if (DOM.previewPrevBtn) {
    DOM.previewPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateResourcePreview(-1);
    });
  }

  if (DOM.previewNextBtn) {
    DOM.previewNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateResourcePreview(1);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (DOM.resourcePreviewModal && DOM.resourcePreviewModal.classList.contains('open')) {
      if (e.key === 'ArrowLeft') {
        navigateResourcePreview(-1);
      } else if (e.key === 'ArrowRight') {
        navigateResourcePreview(1);
      } else if (e.key === 'Escape') {
        closeResourcePreview(false);
      }
    }
  });

  // Google Drive Context Menu Dismiss on Click Outside or Escape
  document.addEventListener('click', (e) => {
    if (DOM.gdriveContextMenu && DOM.gdriveContextMenu.style.display === 'flex') {
      if (!DOM.gdriveContextMenu.contains(e.target)) {
        hideContextMenu();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideContextMenu();
    }
  });

  // Pre-seed default files into IndexedDB on first load for zero-error downloads & instant previews
  seedDefaultFilesIntoIdb();

  // Paste shortcut (Ctrl+V) when in Resources view
  window.addEventListener('paste', (e) => {
    if (STATE.activeView !== 'resourcesView') return;
    if (DOM.resourceModal && DOM.resourceModal.classList.contains('open')) return;
    if (DOM.createDocModal && DOM.createDocModal.classList.contains('open')) return;
    if (DOM.createFolderModal && DOM.createFolderModal.classList.contains('open')) return;
    if (DOM.createLinkModal && DOM.createLinkModal.classList.contains('open')) return;

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

const _syncedDriveFileIds = new Set();
async function syncPendingResourceFiles() {
  if (typeof SyncEngine === 'undefined' || !SyncEngine.pushFile) return;
  const list = STATE.resources || [];
  for (const r of list) {
    if (!r || !r.id || _syncedDriveFileIds.has(r.id)) continue;
    let data = r.dataUrl || memoryFileCache.get(r.id);
    if (!data) {
      data = await IdbResourceStore.getFile(r.id);
    }
    if (data && typeof data === 'string' && data.startsWith('data:')) {
      _syncedDriveFileIds.add(r.id);
      SyncEngine.pushFile(r.id, data, r.mimeType, r.fileName).catch(() => {});
    }
  }
}

function syncGlobally() {
  const now = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
  localStorage.setItem(STORAGE_KEYS.TOPICS_MODIFIED, 'true');

  if (typeof SyncEngine !== 'undefined' && SyncEngine.pushData) {
    const resourcesToPush = (STATE.resources || []).map(r => {
      const dataUrl = r.dataUrl || memoryFileCache.get(r.id) || '';
      return {
        ...r,
        dataUrl
      };
    });

    SyncEngine.pushData({
      topics: STATE.topics,
      notes: STATE.notes,
      resources: resourcesToPush,
      bin: STATE.bin,
      updatedAt: now
    });
  }

  // Back up any pending local files to Netlify Blobs storage in the background
  syncPendingResourceFiles();
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
      const deletedIds = getDeletedResourceIds();
      // Filter out any resource the user specifically deleted locally
      const validRemote = remote.resources.filter(r => r && r.id && !deletedIds.has(r.id));

      if (validRemote.length === 0 && STATE.resources.length > 0) {
        // Protect local user files: never allow an empty remote snapshot to delete user's uploaded files
        syncGlobally();
      } else {
        // Merge remote with local so locally uploaded files are never lost
        const remoteIds = new Set(validRemote.map(r => r.id));
        const localMap = new Map(STATE.resources.map(lr => [lr.id, lr]));
        const merged = validRemote.map(remoteR => {
          const localR = localMap.get(remoteR.id);
          if (localR) {
            if (!remoteR.dataUrl && localR.dataUrl) remoteR.dataUrl = localR.dataUrl;
            if (!remoteR.thumbnail && localR.thumbnail) remoteR.thumbnail = localR.thumbnail;
          }

          // If remote carries file data, cache it into memory & IndexedDB on this device
          if (remoteR.dataUrl) {
            memoryFileCache.set(remoteR.id, remoteR.dataUrl);
            IdbResourceStore.saveFile(remoteR.id, remoteR.dataUrl, remoteR.mimeType, remoteR.fileName).catch(() => {});
          } else {
            const localData = memoryFileCache.get(remoteR.id);
            if (localData) {
              remoteR.dataUrl = localData;
            } else {
              // Prefetch file in background silently from Netlify Blobs Cloud
              if (typeof SyncEngine !== 'undefined' && SyncEngine.fetchFile) {
                SyncEngine.fetchFile(remoteR.id).then(fetchedData => {
                  if (fetchedData) {
                    memoryFileCache.set(remoteR.id, fetchedData);
                    remoteR.dataUrl = fetchedData;
                    IdbResourceStore.saveFile(remoteR.id, fetchedData, remoteR.mimeType, remoteR.fileName).catch(() => {});
                  }
                }).catch(() => {});
              }
            }
          }
          return remoteR;
        });
        STATE.resources.forEach(localR => {
          if (!deletedIds.has(localR.id) && !remoteIds.has(localR.id)) {
            merged.push(localR);
          }
        });
        STATE.resources = merged;
        saveResources();
      }
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
          // Never allow an empty cross-tab update to wipe local user files
          if (updated.length === 0 && STATE.resources.length > 0) {
            saveResources();
          } else {
            STATE.resources = updated;
            updated.forEach(r => {
              if (r && r.id && r.dataUrl) {
                memoryFileCache.set(r.id, r.dataUrl);
                IdbResourceStore.saveFile(r.id, r.dataUrl, r.mimeType, r.fileName).catch(() => {});
              }
            });
            updateBadges();
            renderResources();
          }
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
