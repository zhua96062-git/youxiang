// 询价表单处理 - Cloudflare Pages Function
// 通过 Telegram + Email (MailChannels) 发送通知
//
// 重要: 邮件发送需要添加一条 DNS TXT 记录到 bohaoshipping.com
// (见下方说明)

export async function onRequest(context) {
    const { request } = context;
    
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }
    
    try {
        let name, email, message;
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
        
        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: "请填写所有字段 / Please fill in all fields." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
        
        // ===== 1. 发送 Telegram 通知 (主通道) =====
        const tgToken = context.env.TG_TOKEN;
        const chatId = context.env.TG_CHAT_ID || "8617809067";
        
        if (tgToken) {
            try {
                const tgText = `🔔 新询价

👤 ${name}\n📧 ${email}\n\n💬 ${message}`;
                await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: chatId, text: tgText })
                });
            } catch (e) { console.error("TG error:", e); }
        }
        
        // ===== 2. 发送邮件到 Gmail (通过 MailChannels) =====
        // MailChannels 是 Cloudflare 原生支持的免费邮件发送服务
        try {
            const emailBody = `姓名: ${name}\n邮箱: ${email}\n留言: ${message}`;
            
            await fetch("https://api.mailchannels.net/tx/v1/send", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    personalizations: [
                        { to: [{ email: "zhua96062@gmail.com", name: "Alex Zhang" }] }
                    ],
                    from: { email: "noreply@bohaoshipping.com", name: "BohaoGroup" },
                    subject: `新询价 - ${name}`,
                    content: [{ type: "text/plain", value: emailBody }]
                })
            });
        } catch (e) { console.error("Email error:", e); }
        
        return new Response(JSON.stringify({
            success: true,
            message: "感谢您的询价！我们会在24小时内与您联系。"
        }), {
            headers: { "Content-Type": "application/json" }
        });
        
    } catch (err) {
        console.error("Handler error:", err);
        return new Response(JSON.stringify({
            error: "服务器繁忙，请稍后再试。"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
