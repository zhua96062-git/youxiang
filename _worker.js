// BohaoGroup - Cloudflare Workers + Static Assets
// Handles API routes (/api/send, /api/inquiry) and serves static files

// --- Helper: JSON response ---
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

// --- Rate limiter ---
const RATE_LIMIT_PER_SECOND = 20;
const rateLimitBuckets = new Map();
function checkRateLimit(clientIp) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(clientIp) || { count: 0, resetAt: now + 1000 };
  if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + 1000; }
  bucket.count++;
  return bucket.count <= RATE_LIMIT_PER_SECOND;
}

// --- Send via MailChannels ---
async function sendViaMailChannels(to, subject, html, text, fromName) {
  const recipients = to.map(r => ({ email: r.email, name: r.name || r.email.split("@")[0] }));
  const mcBody = {
    personalizations: [{ to: recipients }],
    from: { email: "noreply@bohaoshipping.com", name: fromName || "BohaoGroup" },
    subject,
    content: [
      ...(html ? [{ type: "text/html", value: html }] : []),
      ...(text ? [{ type: "text/plain", value: text }] : [])
    ]
  };
  const mc = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(mcBody)
  });
  return mc;
}

// --- Send handler ---
async function handleSend(request) {
  const apiKey = request.headers.get("X-Api-Key") || "";
  const expectedKey = "bohao-send-2024";
  if (apiKey !== expectedKey) {
    return json({ error: "Unauthorized" }, 401);
  }
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(clientIp)) {
    return json({ error: "Rate limited" }, 429);
  }
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }

  const { to, subject, html, text, from_name } = body;
  if (!to || !Array.isArray(to) || to.length === 0) return json({ error: "to must be a non-empty array" }, 400);
  if (!subject) return json({ error: "subject is required" }, 400);
  if (!html && !text) return json({ error: "html or text content is required" }, 400);

  const start = Date.now();
  const mc = await sendViaMailChannels(to, subject, html, text, from_name || "BohaoGroup");
  return json({
    success: mc.ok,
    sent: mc.ok ? to.length : 0,
    failed: mc.ok ? 0 : to.length,
    total: to.length,
    results: to.map(t => ({ email: t.email, status: mc.ok ? "sent" : "failed", statusCode: mc.status })),
    elapsed: Date.now() - start + "ms"
  });
}

// --- Inquiry handler (send TG + email) ---
async function handleInquiry(request) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }
  const { name, email, phone, company, message } = body;
  if (!name || !email) return json({ error: "name and email required" }, 400);

  try {
    // Send Telegram notification
    const tgMsg = \`📩 新询价\n姓名: \${name}\n邮箱: \${email}\n电话: \${phone || "—"}\n公司: \${company || "—"}\n留言: \${(message || "").slice(0, 200)}\`;
    const tgToken = "7880945789:AAHdzqVBQo8YzXEBK5e4TYsNHK73G7lM_V0";
    const tgChatId = "8617809067";
    await fetch(\`https://api.telegram.org/bot\${tgToken}/sendMessage\`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tgChatId, text: tgMsg })
    });
  } catch {}

  try {
    // Send confirmation via MailChannels
    const html = \`<p>Hi \${name},</p><p>Thanks for your inquiry. We will respond within 24 hours.</p><p>Boha Shipping</p>\`;
    const mcBody = {
      personalizations: [{ to: [{ email, name }] }],
      from: { email: "noreply@bohaoshipping.com", name: "BohaoGroup" },
      subject: "Thank you for your inquiry - BohaoGroup",
      content: [{ type: "text/html", value: html }]
    };
    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(mcBody)
    });
  } catch {}

  return json({ success: true, message: "Inquiry received" });
}

// --- Main handler ---
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Api-Key", "Access-Control-Max-Age": "86400" }
      });
    }

    // API routes
    if (path === "/api/send" && request.method === "POST") return handleSend(request);
    if (path === "/api/inquiry" && request.method === "POST") return handleInquiry(request);

    // If API route not found
    if (path.startsWith("/api/")) {
      return json({ error: "Not found" }, 404);
    }

    // Static assets - let the default asset handler serve them
    return env.ASSETS.fetch(request);
  }
};
