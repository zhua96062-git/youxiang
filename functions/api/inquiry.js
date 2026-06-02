// 询价表单处理 - Cloudflare Pages Function
// 处理 POST /api/inquiry，通过Telegram发送通知
//
// 部署后必须在 Cloudflare Dashboard 设置环境变量 (Settings > Variables):
//   TG_TOKEN = 7687861392:xxxxxxxxxx  ← Telegram Bot Token
//   TG_CHAT_ID = 8617809067          ← 你的Telegram Chat ID

export async function onRequest(context) {
    const { request } = context;
    
    // 只接受 POST
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
    
    try {
        // 解析表单数据 (支持 JSON 和 FormData)
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
        
        // 从环境变量读取 TG 配置
        const tgToken = context.env.TG_TOKEN;
        const chatId = context.env.TG_CHAT_ID || "8617809067";
        
        if (!tgToken) {
            console.error("TG_TOKEN not configured - set in Cloudflare Dashboard > Environment Variables");
            // 即使 TG 没配好也返回成功，不暴露错误给用户
            return new Response(JSON.stringify({
                success: true,
                message: "感谢您的询价！我们会在24小时内与您联系。\nThank you! We will contact you within 24 hours."
            }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }
        
        // 发送 Telegram 通知
        const tgText = `\ud83d\udd14 \u65b0\u8be2\u4ef7\n\n\ud83d\udc64 \u59d3\u540d: ${name}\n\ud83d\udce7 \u90ae\u7bb1: ${email}\n\n\ud83d\udcac \u7559\u8a00:\n${message}\n\n\u23f0 ${new Date().toLocaleString("zh-CN", {timeZone:"Asia/Shanghai"})}`;
        
        const tgResp = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: tgText,
                parse_mode: "HTML"
            })
        });
        
        const tgResult = await tgResp.json();
        if (!tgResult.ok) {
            console.error("TG send failed:", tgResult);
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: "感谢您的询价！我们会在24小时内与您联系。\nThank you! We will contact you within 24 hours."
        }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
        
    } catch (err) {
        console.error("Inquiry handler error:", err);
        return new Response(JSON.stringify({
            error: "服务器繁忙，请稍后再试 / Server busy, please try again later."
        }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
}
