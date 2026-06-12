// BohaoGroup 批量邮件发送 API (MailChannels)
// POST /api/send
// Redeploy trigger: $(date /t)
// 调用方式见 README

const RATE_LIMIT_PER_SECOND = 20;
const rateLimitBuckets = new Map();

function checkRateLimit(clientIp) {
    const now = Date.now();
    const bucket = rateLimitBuckets.get(clientIp) || { count: 0, resetAt: now + 1000 };
    if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + 1000; }
    bucket.count++;
    return bucket.count <= RATE_LIMIT_PER_SECOND;
}

export async function onRequest(context) {
    const { request, env } = context;
    const startTime = Date.now();

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Api-Key", "Access-Control-Max-Age": "86400" } });
    }
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }

    const apiKey = request.headers.get("X-Api-Key");
    if (env.SEND_API_KEY && apiKey !== env.SEND_API_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
    if (!checkRateLimit(clientIp)) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    let body;
    try { body = await request.json(); }
    catch (e) { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

    const { to, subject, html, text, from_name, batch_priority } = body;
    if (!to || !Array.isArray(to) || to.length === 0) { return new Response(JSON.stringify({ error: "to must be a non-empty array" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
    if (!subject) { return new Response(JSON.stringify({ error: "subject is required" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
    if (!html && !text) { return new Response(JSON.stringify({ error: "html or text content is required" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

    const corsHeaders = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

    if (batch_priority) {
        const batch = to.slice(0, 20);
        const results = [];
        for (const rec of batch) {
            const email = rec.email;
            const name = rec.name || email.split("@")[0];
            const pHtml = (html || "").replace(/{{name}}/g, name);
            const pText = (text || "").replace(/{{name}}/g, name);
            try {
                const mc = await fetch("https://api.mailchannels.net/tx/v1/send", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        personalizations: [{ to: [{ email, name }] }],
                        from: { email: "alex1@bohaoshipping.com", name: from_name || "Alex Zhang" },
                        reply_to: { email: "alex1@bohaoshipping.com", name: "Alex Zhang" },
                        subject,
                        content: [...(html ? [{ type: "text/html", value: pHtml }] : []), ...(text ? [{ type: "text/plain", value: pText }] : [])]
                    })
                });
                results.push({ email, status: mc.ok ? "sent" : "failed", statusCode: mc.status });
            } catch (e) { results.push({ email, status: "error", error: e.message }); }
        }
        return new Response(JSON.stringify({ success: true, mode: "batch", batchSize: batch.length, results, elapsed: Date.now() - startTime + "ms" }), { headers: corsHeaders });
    } else {
        const recipients = to.map(r => ({ email: r.email, name: r.name || r.email.split("@")[0] }));
        try {
            const mc = await fetch("https://api.mailchannels.net/tx/v1/send", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    personalizations: [{ to: recipients }],
                    from: { email: "alex1@bohaoshipping.com", name: from_name || "Alex Zhang" },
                        reply_to: { email: "alex1@bohaoshipping.com", name: "Alex Zhang" },
                    subject,
                    content: [...(html ? [{ type: "text/html", value: html }] : []), ...(text ? [{ type: "text/plain", value: text }] : [])]
                })
            });
            const rb = await mc.text();
            return new Response(JSON.stringify({ success: mc.ok, mode: "single", toCount: recipients.length, statusCode: mc.status, responseBody: rb, elapsed: Date.now() - startTime + "ms" }), { headers: corsHeaders });
        } catch (e) { return new Response(JSON.stringify({ success: false, error: e.message, elapsed: Date.now() - startTime + "ms" }), { status: 500, headers: corsHeaders }); }
    }
}
