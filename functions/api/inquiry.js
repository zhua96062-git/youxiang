// 询价表单处理 - Cloudflare Pages Function
// 注意: TG/邮件都在后台异步发送，不阻塞用户
// context.waitUntil() 确保 return 后继续执行

export async function onRequest(context) {
    const { request } = context;
    
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }
    
    let name, email, message;
    
    try {
        const ct = request.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const data = await request.json();
            name = data.name;
            email = data.email;
            message = data.message;
        } else {
            const form = await request.formData();
            name = form.get("name");
            email = form.get("email");
            message = form.get("message");
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: "请求格式错误" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
    
    if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: "请填写所有字段" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
    
    // === 关键: 先立即返回成功给用户，不等待后台任务 ===
    // 这样中国用户即使连不上 Telegram，也能瞬间收到成功提示
    
    const response = new Response(JSON.stringify({
        success: true,
        message: "感谢您的询价！我们会在24小时内与您联系。"
    }), {
        headers: { "Content-Type": "application/json" }
    });
    
    // 后台异步发送通知 (不阻塞用户)
    context.waitUntil((async () => {
        // 1. Telegram 通知
        const tgToken = context.env.TG_TOKEN;
        if (tgToken) {
            try {
                const chatId = context.env.TG_CHAT_ID || "8617809067";
                const tgText = `🔔 新询价

👤 ${name}\n📧 ${email}\n\n💬 ${message}`;
                await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: chatId, text: tgText })
                });
            } catch (e) { console.error("TG notify error (non-blocking):", e); }
        }
        
        // 2. 邮件通知 (MailChannels)
        try {
            const emailBody = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
            await fetch("https://api.mailchannels.net/tx/v1/send", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: "zhua96062@gmail.com" }] }],
                    from: { email: "noreply@bohaoshipping.com", name: "BohaoGroup" },
                    subject: `新询价 - ${name}`,
                    content: [{ type: "text/plain", value: emailBody }]
                })
            });
        } catch (e) { console.error("Email error (non-blocking):", e); }
    })());
    
    return response;
}
