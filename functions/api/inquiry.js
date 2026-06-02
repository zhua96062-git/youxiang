// 询价表单处理 - Cloudflare Pages Function
// 通过 Telegram 和 邮件 发送通知
//
// Cloudflare Dashboard 环境变量设置:
//   TG_TOKEN = 7687861392:xxx  ← Telegram Bot Token
//   TG_CHAT_ID = 8617809067     ← 你的Telegram Chat ID
//   RESEND_API_KEY = re_xxxxx   ← Resend API Key (注册 resend.com 免费获取)

export async function onRequest(context) {
    const { request } = context;
    
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
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
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }
        
        // ===== 1. 发送 Telegram 通知 =====
        const tgToken = context.env.TG_TOKEN;
        const chatId = context.env.TG_CHAT_ID || "8617809067";
        
        if (tgToken) {
            const tgText = `🔔 \u65b0\u8be2\u4ef7\n\n👤 ${name}\n📧 ${email}\n\n💬 ${message}`;
            try {
                await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: chatId, text: tgText })
                });
            } catch (e) { console.error("TG error:", e); }
        }
        
        // ===== 2. 发送邮件到 Gmail (通过 Resend) =====
        const resendKey = context.env.RESEND_API_KEY;
        
        if (resendKey) {
            const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f7fa;border-radius:8px;">
                <h2 style="color:#c9a84c;border-bottom:2px solid #c9a84c;padding-bottom:10px;">新询价通知</h2>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;color:#666;width:80px;"><strong>姓名</strong></td><td style="padding:8px;color:#333;">${name}</td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>邮箱</strong></td><td style="padding:8px;color:#333;"><a href="mailto:${email}">${email}</a></td></tr>
                    <tr><td style="padding:8px;color:#666;"><strong>时间</strong></td><td style="padding:8px;color:#333;">${new Date().toLocaleString("zh-CN", {timeZone:"Asia/Shanghai"})}</td></tr>
                </table>
                <div style="background:#fff;padding:16px;border-radius:6px;border-left:4px solid #c9a84c;">
                    <p style="margin:0;color:#333;line-height:1.6;">${message.replace(/\n/g, "<br>")}</p>
                </div>
                <p style="color:#999;font-size:12px;margin-top:20px;">来自 bohaoshipping.com 询价系统</p>
            </div>`;
            
            try {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${resendKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        from: "BohaoGroup <onboarding@resend.dev>",
                        to: ["zhua96062@gmail.com"],
                        subject: `新询价 - ${name}`,
                        html: emailHtml
                    })
                });
            } catch (e) { console.error("Email error:", e); }
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: "感谢您的询价！我们会在24小时内与您联系。
Thank you! We will contact you within 24 hours."
        }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
        
    } catch (err) {
        console.error("Inquiry handler error:", err);
        return new Response(JSON.stringify({
            error: "服务器繁忙，请稍后再试。"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
}
