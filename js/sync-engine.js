/**
 * NathKhat - Seamless Cloud Persistence & Cross-Tab Synchronization Engine
 * Operates completely in the background without UI banners, status pills, or connection prompts.
 * Automatically synchronizes topics, notes, and recycle bin data via Netlify Blobs
 * and BroadcastChannel so changes are visible to all users across all devices.
 */

const SyncEngine = (function() {
  const NETLIFY_SYNC_ENDPOINT = '/.netlify/functions/sync';
  const STORAGE_KEY_CUSTOM_URL = 'nathkhat_cloud_url_v1';
  const STORAGE_KEY_LAST_PULL = 'nathkhat_last_cloud_pull_v1';

  let broadcastChannel = null;
  let customCloudUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || '';
  let backgroundInterval = null;
  let onRemoteUpdateCallback = null;
  let isPushing = false;
  let lastPushTimestamp = 0;

  // 1. Instant Cross-Tab BroadcastChannel
  try {
    if (window.BroadcastChannel) {
      broadcastChannel = new BroadcastChannel('nathkhat_tab_sync');
      broadcastChannel.onmessage = (event) => {
        if (!event || !event.data) return;
        const { type, payload } = event.data;
        if (type === 'SNAPSHOT_UPDATE' && payload && typeof onRemoteUpdateCallback === 'function') {
          onRemoteUpdateCallback(payload, 'tab');
        }
      };
    }
  } catch (e) {
    // BroadcastChannel unsupported in private or older browsers; fails gracefully
  }

  // 2. Fetch Latest Remote Data from Serverless Netlify Blobs or Cloud DB
  async function fetchRemoteData() {
    // Try Netlify Serverless Cloud Persistence first
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
        if (data && (Array.isArray(data.topics) || Array.isArray(data.notes))) {
          return data;
        }
      }
    } catch (e) {
      // Netlify function unreachable (e.g. running offline or local static server)
    }

    // Optional Custom Cloud Endpoint (Firebase RTDB / REST)
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
          if (data && (Array.isArray(data.topics) || Array.isArray(data.notes))) {
            return data;
          }
        }
      } catch (e) {}
    }

    return null;
  }

  // 3. Silently Push Snapshot to Cloud & Local Tabs
  async function pushData(data) {
    if (!data) return;
    const now = Date.now();
    lastPushTimestamp = now;

    const payload = {
      topics: Array.isArray(data.topics) ? data.topics : [],
      notes: Array.isArray(data.notes) ? data.notes : [],
      bin: Array.isArray(data.bin) ? data.bin : [],
      updatedAt: now
    };

    // A. Broadcast to any other open tabs immediately
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type: 'SNAPSHOT_UPDATE',
          payload
        });
      } catch (e) {}
    }

    // B. Push to Netlify Blobs Serverless Backend
    isPushing = true;
    try {
      fetch(NETLIFY_SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}

    // C. Push to Custom Cloud URL if configured
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

  // 4. Start Background Silent Sync (No UI Clutter)
  function startSilentSync(callbacks) {
    if (callbacks && typeof callbacks.onRemoteUpdate === 'function') {
      onRemoteUpdateCallback = callbacks.onRemoteUpdate;
    }

    // Initial check in background
    triggerBackgroundPull();

    // Check periodically in background every 25 seconds
    if (backgroundInterval) clearInterval(backgroundInterval);
    backgroundInterval = setInterval(() => {
      triggerBackgroundPull();
    }, 25000);

    // Also check when tab becomes active / user refocuses window
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        triggerBackgroundPull();
      }
    });

    window.addEventListener('focus', () => {
      triggerBackgroundPull();
    });
  }

  async function triggerBackgroundPull() {
    // Don't pull immediately if we just pushed data ourselves
    if (isPushing || Date.now() - lastPushTimestamp < 3000) return;

    const remote = await fetchRemoteData();
    if (remote && typeof onRemoteUpdateCallback === 'function') {
      onRemoteUpdateCallback(remote, 'cloud');
    }
  }

  function getCustomUrl() {
    return customCloudUrl;
  }

  function setCustomUrl(url) {
    customCloudUrl = url ? url.trim().replace(/\/+$/, '') : '';
    if (customCloudUrl) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, customCloudUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    }
  }

  return {
    fetchRemoteData,
    pushData,
    startSilentSync,
    getCustomUrl,
    setCustomUrl
  };
})();
