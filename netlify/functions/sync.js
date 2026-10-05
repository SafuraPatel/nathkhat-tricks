const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    // Connect Lambda context for Netlify Blobs compatibility
    if (typeof connectLambda === "function") {
      try {
        connectLambda(event);
      } catch (e) {}
    }

    const store = getStore("nathkhat_vault");

    if (event.httpMethod === "GET") {
      const query = event.queryStringParameters || {};

      // 1. Fetch individual Drive file by file_id
      if (query.file_id) {
        let fileRecord = null;
        try {
          fileRecord = await store.get("file_" + query.file_id, { type: "json" });
        } catch (getErr) {
          console.warn("Netlify Blobs file read notice:", getErr.message);
        }

        if (fileRecord) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(fileRecord)
          };
        } else {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: "File not found" })
          };
        }
      }

      // 2. Lightweight timestamp check
      if (query.timestamp_only === "1") {
        let data = null;
        try {
          data = await store.get("app_data", { type: "json" });
        } catch (getErr) {}
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            updatedAt: data && data.updatedAt ? data.updatedAt : 0
          })
        };
      }

      // 3. Full app data snapshot
      let data = null;
      try {
        data = await store.get("app_data", { type: "json" });
      } catch (getErr) {
        console.warn("Netlify Blobs read notice:", getErr.message);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || {
          topics: null,
          notes: null,
          bin: null,
          resources: null,
          updatedAt: 0
        })
      };
    }

    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body || "{}");

      // A. Save individual Drive file
      if (payload.action === "save_file" && payload.fileId && payload.dataUrl) {
        const fileRecord = {
          id: payload.fileId,
          dataUrl: payload.dataUrl,
          mimeType: payload.mimeType || "",
          fileName: payload.fileName || "",
          updatedAt: Date.now()
        };
        await store.setJSON("file_" + payload.fileId, fileRecord);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, fileId: payload.fileId })
        };
      }

      // B. Delete individual Drive file
      if (payload.action === "delete_file" && payload.fileId) {
        try {
          await store.delete("file_" + payload.fileId);
        } catch (delErr) {
          console.warn("Netlify Blobs file delete notice:", delErr.message);
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, deleted: payload.fileId })
        };
      }

      // C. Save full app snapshot
      const record = {
        topics: Array.isArray(payload.topics) ? payload.topics : [],
        notes: Array.isArray(payload.notes) ? payload.notes : [],
        bin: Array.isArray(payload.bin) ? payload.bin : [],
        resources: Array.isArray(payload.resources) ? payload.resources : [],
        updatedAt: payload.updatedAt || Date.now()
      };

      await store.setJSON("app_data", record);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          updatedAt: record.updatedAt,
          counts: {
            topics: record.topics.length,
            notes: record.notes.length,
            bin: record.bin.length,
            resources: record.resources.length
          }
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  } catch (err) {
    console.error("Netlify sync handler error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Internal server error" })
    };
  }
};
