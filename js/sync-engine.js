/**
 * NathKhat - Real-Time Multi-Device Synchronization Engine
 * Powered by WebRTC (PeerJS) for instant mobile <-> laptop live sync,
 * BroadcastChannel for zero-latency cross-tab sync, and optional Cloud DB REST.
 */

const SyncEngine = (function() {
  const STORAGE_KEY_CLOUD_URL = 'nathkhat_cloud_url_v1';
  const DEFAULT_CLOUD_URL = '';
  const ROOM_PREFIX = 'nathkhat-tricks-vault-v1';
  const MAX_SLOTS = 4;

  let cloudUrl = localStorage.getItem(STORAGE_KEY_CLOUD_URL) || DEFAULT_CLOUD_URL;
  let broadcastChannel = null;
  let peerInstance = null;
  let mySlot = null;
  let activePeerConns = [];
  let pollInterval = null;
  let callbacks = {
    getCurrentData: null,
    onMergeData: null,
    onTopicReceived: null,
    onTopicDeleted: null,
    onNoteReceived: null,
    onNoteDeleted: null
  };

  // 1. Setup Cross-Tab BroadcastChannel
  try {
    if (window.BroadcastChannel) {
      broadcastChannel = new BroadcastChannel('nathkhat_tab_sync');
      broadcastChannel.onmessage = (event) => {
        if (!event.data) return;
        const { type, payload } = event.data;
        handleIncomingMessage(type, payload);
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }

  function handleIncomingMessage(type, payload) {
    if (!type || !payload) return;
    if (type === 'HANDSHAKE' && typeof callbacks.onMergeData === 'function') {
      callbacks.onMergeData(payload);
    } else if (type === 'TOPIC_SAVED' && typeof callbacks.onTopicReceived === 'function') {
      callbacks.onTopicReceived(payload);
    } else if (type === 'TOPIC_DELETED' && typeof callbacks.onTopicDeleted === 'function') {
      callbacks.onTopicDeleted(payload);
    } else if (type === 'NOTE_SAVED' && typeof callbacks.onNoteReceived === 'function') {
      callbacks.onNoteReceived(payload);
    } else if (type === 'NOTE_DELETED' && typeof callbacks.onNoteDeleted === 'function') {
      callbacks.onNoteDeleted(payload);
    }
  }

  // Update UI Pill Status
  function updatePillStatus(state, text) {
    const pill = document.getElementById('liveSyncPill');
    const pillText = document.getElementById('liveSyncText');
    const badge = document.getElementById('syncStatusBadge');

    if (pill) {
      pill.className = `live-sync-pill ${state}`;
    }
    if (pillText) {
      pillText.textContent = text;
    }
    if (badge) {
      if (state === 'connected') {
        badge.textContent = `🟢 ${text}`;
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#10b981';
      } else {
        badge.textContent = `🟡 ${text}`;
        badge.style.background = 'rgba(245, 158, 11, 0.15)';
        badge.style.color = '#f59e0b';
      }
    }
  }

  // 2. PeerJS WebRTC Multi-Device Sync Engine
  function initPeerSync() {
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS library not available, continuing with local & broadcast sync.');
      updatePillStatus('connecting', 'Local Storage Ready');
      return;
    }

    trySlot(1);
  }

  function trySlot(slotNum) {
    if (slotNum > MAX_SLOTS) {
      console.log('All primary peer slots occupied, running client listener.');
      updatePillStatus('connecting', 'Waiting for peer...');
      return;
    }

    const slotId = `${ROOM_PREFIX}-s${slotNum}`;
    const p = new Peer(slotId, {
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    p.on('open', (id) => {
      mySlot = slotNum;
      peerInstance = p;
      console.log(`Registered PeerJS slot: ${slotId}`);
      updatePillStatus('connecting', 'Live Sync: Ready');

      // Listen for incoming connections
      peerInstance.on('connection', (conn) => {
        setupPeerConnection(conn);
      });

      // Connect to other slots
      connectToOtherSlots();

      // Periodically probe for new/reconnecting devices every 12 seconds
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(() => {
        if (activePeerConns.length === 0) {
          connectToOtherSlots();
        }
      }, 12000);
    });

    p.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // Slot is already claimed by another device (e.g. laptop), try next slot!
        try { p.destroy(); } catch (e) {}
        trySlot(slotNum + 1);
      } else {
        console.warn('PeerJS error:', err.type, err);
      }
    });
  }

  function connectToOtherSlots() {
    if (!peerInstance || !mySlot) return;

    for (let i = 1; i <= MAX_SLOTS; i++) {
      if (i === mySlot) continue;
      const targetId = `${ROOM_PREFIX}-s${i}`;
      // Check if already connected
      const exists = activePeerConns.some(c => c.peer === targetId);
      if (exists) continue;

      try {
        const conn = peerInstance.connect(targetId, { reliable: true });
        setupPeerConnection(conn);
      } catch (e) {}
    }
  }

  function setupPeerConnection(conn) {
    if (!conn) return;

    conn.on('open', () => {
      console.log('Peer connected:', conn.peer);
      if (!activePeerConns.includes(conn)) {
        activePeerConns.push(conn);
      }
      updatePillStatus('connected', 'Live: Connected');

      // Send local data to remote peer on connect
      if (typeof callbacks.getCurrentData === 'function') {
        const localData = callbacks.getCurrentData();
        try {
          conn.send({ type: 'HANDSHAKE', payload: localData });
        } catch (e) {}
      }
    });

    conn.on('data', (msg) => {
      if (!msg || !msg.type) return;
      handleIncomingMessage(msg.type, msg.payload);
    });

    conn.on('close', () => {
      activePeerConns = activePeerConns.filter(c => c !== conn);
      if (activePeerConns.length === 0) {
        updatePillStatus('connecting', 'Waiting for device...');
      } else {
        updatePillStatus('connected', `Live: Connected (${activePeerConns.length})`);
      }
    });

    conn.on('error', () => {
      activePeerConns = activePeerConns.filter(c => c !== conn);
    });
  }

  // 3. Broadcast to all active peer connections & local tabs
  function broadcast(type, payload) {
    // A. Send to all open WebRTC peers (mobile, laptop)
    activePeerConns.forEach(conn => {
      try {
        if (conn && conn.open) {
          conn.send({ type, payload });
        }
      } catch (e) {}
    });

    // B. Send to local browser tabs
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type, payload });
      } catch (e) {}
    }
  }

  function pushTopic(topic) {
    if (!topic || !topic.id) return;
    broadcast('TOPIC_SAVED', topic);
    pushCloudTopic(topic);
  }

  function deleteTopic(topicId) {
    if (!topicId) return;
    broadcast('TOPIC_DELETED', topicId);
    deleteCloudTopic(topicId);
  }

  function pushNote(note) {
    if (!note || !note.id) return;
    broadcast('NOTE_SAVED', note);
    pushCloudNote(note);
  }

  function deleteNote(noteId) {
    if (!noteId) return;
    broadcast('NOTE_DELETED', noteId);
    deleteCloudNote(noteId);
  }

  // 4. Cloud REST Engine (Optional fallback for Firebase / custom endpoint)
  function getCloudUrl() {
    return cloudUrl;
  }

  function setCloudUrl(url) {
    cloudUrl = url ? url.trim().replace(/\/+$/, '') : '';
    localStorage.setItem(STORAGE_KEY_CLOUD_URL, cloudUrl);
    testConnection();
  }

  async function testConnection() {
    if (!cloudUrl) {
      updatePillStatus('connecting', 'Live Sync Active');
      return true;
    }
    try {
      const res = await fetch(`${cloudUrl}/health.json`, { method: 'GET', mode: 'cors' });
      const ok = res.ok || res.status === 404;
      updatePillStatus(ok ? 'connected' : 'connecting', ok ? 'Cloud Sync Online' : 'Cloud Offline');
      return ok;
    } catch (e) {
      updatePillStatus('connecting', 'Cloud Offline');
      return false;
    }
  }

  async function pushCloudTopic(topic) {
    if (!cloudUrl || !topic || !topic.id) return;
    try {
      await fetch(`${cloudUrl}/topics/${encodeURIComponent(topic.id)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic),
        mode: 'cors'
      });
    } catch (e) {}
  }

  async function deleteCloudTopic(topicId) {
    if (!cloudUrl || !topicId) return;
    try {
      await fetch(`${cloudUrl}/topics/${encodeURIComponent(topicId)}.json`, {
        method: 'DELETE',
        mode: 'cors'
      });
    } catch (e) {}
  }

  async function pushCloudNote(note) {
    if (!cloudUrl || !note || !note.id) return;
    try {
      await fetch(`${cloudUrl}/notes/${encodeURIComponent(note.id)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
        mode: 'cors'
      });
    } catch (e) {}
  }

  async function deleteCloudNote(noteId) {
    if (!cloudUrl || !noteId) return;
    try {
      await fetch(`${cloudUrl}/notes/${encodeURIComponent(noteId)}.json`, {
        method: 'DELETE',
        mode: 'cors'
      });
    } catch (e) {}
  }

  // 5. Initialize Live Sync with App Callbacks
  function startLiveSync(appCallbacks) {
    callbacks = { ...callbacks, ...appCallbacks };

    // Start WebRTC peer discovery & sync
    initPeerSync();
  }

  return {
    getCloudUrl,
    setCloudUrl,
    testConnection,
    pushTopic,
    deleteTopic,
    pushNote,
    deleteNote,
    startLiveSync
  };
})();
