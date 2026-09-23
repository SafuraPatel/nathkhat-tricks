/**
 * NathKhat - Cloud Synchronization Engine
 * Enables instant multi-user synchronization across devices and browsers.
 * Integrates with Firebase Realtime Database REST / SSE streaming and BroadcastChannel.
 */

const SyncEngine = (function() {
  const STORAGE_KEY_CLOUD_URL = 'nathkhat_cloud_url_v1';
  // Default cloud database endpoint (Firebase Realtime Database REST API)
  const DEFAULT_CLOUD_URL = 'https://nathkhat-sync-default-rtdb.firebaseio.com';

  let cloudUrl = localStorage.getItem(STORAGE_KEY_CLOUD_URL) || DEFAULT_CLOUD_URL;
  let broadcastChannel = null;
  let isConnected = false;
  let pollInterval = null;
  let liveTopicsCallback = null;
  let liveNotesCallback = null;

  try {
    if (window.BroadcastChannel) {
      broadcastChannel = new BroadcastChannel('nathkhat_tab_sync');
      broadcastChannel.onmessage = (event) => {
        if (!event.data) return;
        const { type, payload } = event.data;

        if (type === 'SYNC_TOPIC' && payload && typeof liveTopicsCallback === 'function') {
          liveTopicsCallback([payload]);
        } else if (type === 'DELETE_TOPIC' && payload && typeof liveTopicsCallback === 'function') {
          liveTopicsCallback([], payload);
        } else if (type === 'SYNC_NOTE' && payload && typeof liveNotesCallback === 'function') {
          liveNotesCallback([payload]);
        } else if (type === 'DELETE_NOTE' && payload && typeof liveNotesCallback === 'function') {
          liveNotesCallback([], payload);
        }
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel not supported in this browser environment', e);
  }

  function getCloudUrl() {
    return cloudUrl;
  }

  function setCloudUrl(url) {
    if (!url || !url.trim()) {
      cloudUrl = DEFAULT_CLOUD_URL;
    } else {
      cloudUrl = url.trim().replace(/\/+$/, '');
    }
    localStorage.setItem(STORAGE_KEY_CLOUD_URL, cloudUrl);
    testConnection();
  }

  async function testConnection() {
    if (!cloudUrl) return false;
    try {
      const endpoint = `${cloudUrl}/health.json`;
      const res = await fetch(endpoint, { method: 'GET', mode: 'cors' });
      isConnected = res.ok || res.status === 404;
      updateSyncBadge(isConnected);
      return isConnected;
    } catch (e) {
      isConnected = false;
      updateSyncBadge(false);
      return false;
    }
  }

  function updateSyncBadge(connected) {
    const badge = document.getElementById('syncStatusBadge');
    if (badge) {
      if (connected) {
        badge.textContent = '🟢 Online Sync Active';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#10b981';
      } else {
        badge.textContent = '⚪ Local Storage (Offline Ready)';
        badge.style.background = 'rgba(148, 163, 184, 0.15)';
        badge.style.color = '#94a3b8';
      }
    }
  }

  // Fetch all shared topics from cloud
  async function fetchCloudTopics() {
    if (!cloudUrl) return [];
    try {
      const endpoint = `${cloudUrl}/topics.json`;
      const res = await fetch(endpoint, { method: 'GET', mode: 'cors' });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data) return [];

      let list = [];
      if (Array.isArray(data)) {
        list = data.filter(Boolean);
      } else if (typeof data === 'object') {
        list = Object.keys(data).map(key => ({
          ...data[key],
          id: data[key].id || key
        }));
      }
      isConnected = true;
      updateSyncBadge(true);
      return list;
    } catch (e) {
      isConnected = false;
      updateSyncBadge(false);
      return [];
    }
  }

  // Push single topic to cloud and broadcast to other tabs
  async function pushTopic(topic) {
    if (!topic || !topic.id) return;

    // 1. Broadcast to any other open tabs/windows immediately
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'SYNC_TOPIC', payload: topic });
      } catch (e) {}
    }

    // 2. Broadcast to cloud database
    if (cloudUrl) {
      try {
        const endpoint = `${cloudUrl}/topics/${encodeURIComponent(topic.id)}.json`;
        await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topic),
          mode: 'cors'
        });
        isConnected = true;
        updateSyncBadge(true);
      } catch (e) {}
    }
  }

  // Push full topic list to cloud
  async function pushAllTopics(topicsList) {
    if (!cloudUrl || !Array.isArray(topicsList)) return;
    try {
      const endpoint = `${cloudUrl}/topics.json`;
      const payload = {};
      topicsList.forEach(t => {
        if (t && t.id) payload[t.id] = t;
      });
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors'
      });
      isConnected = true;
      updateSyncBadge(true);
    } catch (e) {}
  }

  // Delete topic from cloud
  async function deleteTopic(topicId) {
    if (!topicId) return;

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'DELETE_TOPIC', payload: topicId });
      } catch (e) {}
    }

    if (cloudUrl) {
      try {
        const endpoint = `${cloudUrl}/topics/${encodeURIComponent(topicId)}.json`;
        await fetch(endpoint, { method: 'DELETE', mode: 'cors' });
      } catch (e) {}
    }
  }

  // Notes synchronization
  async function fetchCloudNotes() {
    if (!cloudUrl) return [];
    try {
      const endpoint = `${cloudUrl}/notes.json`;
      const res = await fetch(endpoint, { method: 'GET', mode: 'cors' });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data) return [];

      let list = [];
      if (Array.isArray(data)) {
        list = data.filter(Boolean);
      } else if (typeof data === 'object') {
        list = Object.keys(data).map(key => ({
          ...data[key],
          id: data[key].id || key
        }));
      }
      return list;
    } catch (e) {
      return [];
    }
  }

  async function pushNote(note) {
    if (!note || !note.id) return;

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'SYNC_NOTE', payload: note });
      } catch (e) {}
    }

    if (cloudUrl) {
      try {
        const endpoint = `${cloudUrl}/notes/${encodeURIComponent(note.id)}.json`;
        await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(note),
          mode: 'cors'
        });
      } catch (e) {}
    }
  }

  async function deleteNote(noteId) {
    if (!noteId) return;

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'DELETE_NOTE', payload: noteId });
      } catch (e) {}
    }

    if (cloudUrl) {
      try {
        const endpoint = `${cloudUrl}/notes/${encodeURIComponent(noteId)}.json`;
        await fetch(endpoint, { method: 'DELETE', mode: 'cors' });
      } catch (e) {}
    }
  }

  // Initialize background live sync for topics
  function startLiveSync(onUpdateCallback) {
    liveTopicsCallback = onUpdateCallback;

    // Initial fetch
    fetchCloudTopics().then(cloudList => {
      if (cloudList && cloudList.length > 0 && typeof liveTopicsCallback === 'function') {
        liveTopicsCallback(cloudList);
      }
    });

    // Periodic live pull every 20 seconds
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      const cloudList = await fetchCloudTopics();
      if (cloudList && cloudList.length > 0 && typeof liveTopicsCallback === 'function') {
        liveTopicsCallback(cloudList);
      }
    }, 20000);
  }

  // Initialize background live sync for notes
  function startNoteLiveSync(onUpdateCallback) {
    liveNotesCallback = onUpdateCallback;

    fetchCloudNotes().then(cloudNotes => {
      if (cloudNotes && cloudNotes.length > 0 && typeof liveNotesCallback === 'function') {
        liveNotesCallback(cloudNotes);
      }
    });
  }

  return {
    getCloudUrl,
    setCloudUrl,
    testConnection,
    fetchCloudTopics,
    pushTopic,
    pushAllTopics,
    deleteTopic,
    fetchCloudNotes,
    pushNote,
    deleteNote,
    startLiveSync,
    startNoteLiveSync
  };
})();
