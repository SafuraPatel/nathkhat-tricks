/**
 * NathKhat - Real-Time Dynamic Cloud Synchronization Engine
 * Delivers sub-second live updates across all devices worldwide without user intervention.
 * Powered by Server-Sent Events (SSE), Netlify Blobs, and BroadcastChannel.
 * Operates 100% silently in the background with zero UI indicators or banners.
 */

const SyncEngine = (function() {
  const NETLIFY_SYNC_ENDPOINT = '/.netlify/functions/sync';
  const REALTIME_SIGNAL_STREAM = 'https://ntfy.sh/nathkhat_live_vault_9786/sse';
  const REALTIME_SIGNAL_PUBLISH = 'https://ntfy.sh/nathkhat_live_vault_9786';
  const STORAGE_KEY_CUSTOM_URL = 'nathkhat_cloud_url_v1';

  let broadcastChannel = null;
  let eventSource = null;
  let customCloudUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || '';
  let onRemoteUpdateCallback = null;
  let isPushing = false;
  let lastPushTimestamp = 0;
  let lastKnownUpdatedAt = 0;
  let heartbeatInterval = null;

  // 1. Instant Cross-Tab Sync via BroadcastChannel
  try {
    if (window.BroadcastChannel) {
      broadcastChannel = new BroadcastChannel('nathkhat_tab_sync');
      broadcastChannel.onmessage = (event) => {
        if (!event || !event.data) return;
        const { type, payload } = event.data;
        if (type === 'SNAPSHOT_UPDATE' && payload && typeof onRemoteUpdateCallback === 'function') {
          if (payload.updatedAt) lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, payload.updatedAt);
          onRemoteUpdateCallback(payload, 'tab');
        }
      };
    }
  } catch (e) {}

  // 2. Ultra-Fast Multi-Device Real-Time Push Stream (SSE)
  function initRealtimeStream() {
    try {
      if (!window.EventSource) return;
      if (eventSource) {
        try { eventSource.close(); } catch (e) {}
      }

      eventSource = new EventSource(REALTIME_SIGNAL_STREAM);

      eventSource.onmessage = (event) => {
        if (!event || !event.data) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.event === 'message' && parsed.message) {
            let msg = {};
            try { msg = JSON.parse(parsed.message); } catch (err) { msg = { raw: parsed.message }; }
            
            const remoteTime = msg.updatedAt || 0;
            // Ignore if this is our own recent push
            if (remoteTime && (Date.now() - lastPushTimestamp < 1500)) return;

            if (remoteTime > lastKnownUpdatedAt) {
              triggerBackgroundPull(true);
            }
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        // EventSource will auto-reconnect natively
      };
    } catch (e) {}
  }

  // 3. Fetch Full Remote Data from Serverless Netlify Blobs or Cloud DB
  async function fetchRemoteData() {
    // A. Netlify Serverless Cloud Persistence
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(NETLIFY_SYNC_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && (Array.isArray(data.topics) || Array.isArray(data.notes) || Array.isArray(data.resources))) {
          if (data.updatedAt) lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, data.updatedAt);
          return data;
        }
      }
    } catch (e) {}

    // B. Custom Cloud Endpoint Fallback (if configured)
    if (customCloudUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${customCloudUrl}/vault.json`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && (Array.isArray(data.topics) || Array.isArray(data.notes) || Array.isArray(data.resources))) {
            if (data.updatedAt) lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, data.updatedAt);
            return data;
          }
        }
      } catch (e) {}
    }

    return null;
  }

  // 4. Lightweight Fast Timestamp Check (heartbeat backup)
  async function checkTimestampRemote() {
    if (isPushing || Date.now() - lastPushTimestamp < 2500) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${NETLIFY_SYNC_ENDPOINT}?timestamp_only=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const info = await res.json();
        if (info && info.updatedAt && info.updatedAt > lastKnownUpdatedAt) {
          triggerBackgroundPull(true);
        }
      }
    } catch (e) {}
  }

  // 5. Silently Push Snapshot to Cloud & Broadcast Instantly to All Devices
  async function pushData(data) {
    if (!data) return;
    const now = Date.now();
    lastPushTimestamp = now;
    lastKnownUpdatedAt = now;

    const rawResources = Array.isArray(data.resources) ? data.resources : [];

    // Ensure all individual files are pushed to Netlify Blobs storage
    // and keep the main snapshot payload light (< 3MB) to guarantee 100% reliable cloud sync
    let totalPayloadEst = 0;
    const cleanResources = rawResources.map(r => {
      if (!r) return r;
      const dataLen = (r.dataUrl && typeof r.dataUrl === 'string') ? r.dataUrl.length : 0;
      totalPayloadEst += dataLen;

      // Always backup file data to Netlify Blobs file store
      if (r.dataUrl && typeof r.dataUrl === 'string' && r.dataUrl.startsWith('data:')) {
        pushFile(r.id, r.dataUrl, r.mimeType, r.fileName).catch(() => {});
      }

      // If single file > 1.2MB, or total data > 3MB, omit dataUrl from main snapshot to prevent hitting Netlify 6MB body limit
      if (dataLen > 1200000 || totalPayloadEst > 3000000) {
        return {
          ...r,
          dataUrl: '' // Will be fetched seamlessly on-demand via fetchFile
        };
      }
      return r;
    });

    const payload = {
      topics: Array.isArray(data.topics) ? data.topics : [],
      notes: Array.isArray(data.notes) ? data.notes : [],
      resources: cleanResources,
      bin: Array.isArray(data.bin) ? data.bin : [],
      updatedAt: now
    };

    // A. Instant 0ms broadcast to local tabs (send rawResources with all full dataUrls for 0ms cross-tab speed)
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type: 'SNAPSHOT_UPDATE',
          payload: {
            ...payload,
            resources: rawResources
          }
        });
      } catch (e) {}
    }

    // B. Sub-second global broadcast signal to all other devices in the world
    try {
      fetch(REALTIME_SIGNAL_PUBLISH, {
        method: 'POST',
        headers: { 'Title': 'NathKhatSync' },
        body: JSON.stringify({ type: 'UPDATE', updatedAt: now })
      }).catch(() => {});
    } catch (e) {}

    // C. Persist to Netlify Blobs Cloud Storage
    isPushing = true;
    try {
      fetch(NETLIFY_SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}

    // D. Persist to Custom Cloud URL if configured
    if (customCloudUrl) {
      try {
        fetch(`${customCloudUrl}/vault.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }

    setTimeout(() => {
      isPushing = false;
    }, 1500);
  }

  // 6. Push Individual File to Netlify Blobs Cloud Storage
  async function pushFile(fileId, dataUrl, mimeType = '', fileName = '') {
    if (!fileId || !dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return false;
    try {
      const res = await fetch(NETLIFY_SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_file',
          fileId,
          dataUrl,
          mimeType: mimeType || 'application/octet-stream',
          fileName: fileName || 'file'
        })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // 7. Fetch Individual File from Netlify Blobs Cloud Storage
  async function fetchFile(fileId) {
    if (!fileId) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(`${NETLIFY_SYNC_ENDPOINT}?file_id=${encodeURIComponent(fileId)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json && json.dataUrl) {
          return json.dataUrl;
        }
      }
    } catch (e) {}
    return null;
  }

  // 8. Delete Individual File from Netlify Blobs Cloud Storage
  async function deleteFile(fileId) {
    if (!fileId) return;
    try {
      fetch(NETLIFY_SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_file',
          fileId
        })
      }).catch(() => {});
    } catch (e) {}
  }

  // 9. Start Real-Time Silent Sync Engine
  function startSilentSync(callbacks) {
    if (callbacks && typeof callbacks.onRemoteUpdate === 'function') {
      onRemoteUpdateCallback = callbacks.onRemoteUpdate;
    }

    // Connect Real-Time SSE channel
    initRealtimeStream();

    // Pull initial cloud data on startup
    triggerBackgroundPull(true);

    // Fast lightweight heartbeat every 4 seconds as a reliable backup
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      checkTimestampRemote();
    }, 4000);

    // Immediate check on tab focus or visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        initRealtimeStream();
        triggerBackgroundPull(true);
      }
    });

    window.addEventListener('focus', () => {
      triggerBackgroundPull(true);
    });
  }

  async function triggerBackgroundPull(force = false) {
    if (!force && (isPushing || Date.now() - lastPushTimestamp < 2000)) return;

    const remote = await fetchRemoteData();
    if (remote && typeof onRemoteUpdateCallback === 'function') {
      onRemoteUpdateCallback(remote, 'cloud');
    }
  }

  function setCustomUrl(url) {
    customCloudUrl = url ? url.trim().replace(/\/+$/, '') : '';
    if (customCloudUrl) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, customCloudUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    }
  }

  function getCustomUrl() {
    return customCloudUrl;
  }

  return {
    fetchRemoteData,
    pushData,
    pushFile,
    fetchFile,
    deleteFile,
    startSilentSync,
    getCustomUrl,
    setCustomUrl
  };
})();
