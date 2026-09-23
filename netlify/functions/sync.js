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
      let data = null;
      try {
        data = await store.get("app_data", { type: "json" });
      } catch (getErr) {
        console.warn("Netlify Blobs read notice:", getErr.message);
      }

      // Lightweight timestamp check
      const query = event.queryStringParameters || {};
      if (query.timestamp_only === "1") {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            updatedAt: data && data.updatedAt ? data.updatedAt : 0
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || {
          topics: null,
          notes: null,
          bin: null,
          updatedAt: 0
        })
      };
    }

    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body || "{}");
      
      const record = {
        topics: Array.isArray(payload.topics) ? payload.topics : [],
        notes: Array.isArray(payload.notes) ? payload.notes : [],
        bin: Array.isArray(payload.bin) ? payload.bin : [],
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
            bin: record.bin.length
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
