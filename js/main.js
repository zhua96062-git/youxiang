/* ============================================
   BohaoGroup - Interactive v2
   Scroll, Navigation, Reveal, Counter, Language, Form
   ============================================ */

(function () {
    "use strict";

    /* ========== 配置 ========== */
    const CURRENT_LANG = localStorage.getItem("bohao-lang") || "cn";
    const API_ENDPOINT = "/api/inquiry";

    /* ========== DOM refs ========== */
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    const revealEls = document.querySelectorAll(".reveal");
    const statNumbers = document.querySelectorAll(".stat-number");
    const inquiryForm = document.getElementById("inquiryForm");
    const langToggle = document.getElementById("langToggle");

    let statsAnimated = false;
    let currentLang = CURRENT_LANG;

    /* ========== 翻译字典 ========== */
    const LANG = {
        cn: {
            "nav-home": "首页",
            "nav-about": "关于我们",
            "nav-services": "核心服务",
            "nav-blog": "行业洞察",
            "nav-contact": "联系我们",
            "hero-tag": "BohaoGroup · 国际物流专家",
            "hero-title": "全球物流<span class=\"text-gold\"> · </span>通达欧美",
            "hero-subtitle": "欧美整柜订舱 &nbsp;|&nbsp; 专业清关 &nbsp;|&nbsp; 门到门物流方案",
            "hero-cta": "立即咨询",
            "section-title-about": "关于我们",
            "section-subtitle-about": "About BohaoGroup",
            "about-intro-cn": "BohaoGroup 是一家专注于<strong>欧美航线</strong>的综合国际物流服务商。我们深耕整柜订舱（FCL）、专业清关及门到门物流领域，凭借丰富的行业经验与一手资源优势，为全球贸易商提供高效、可靠、透明的物流解决方案。",
            "about-intro-en": "BohaoGroup is a comprehensive international logistics provider specializing in <strong>Europe &amp; North America routes</strong>. With deep expertise in FCL booking, professional customs clearance, and door-to-door delivery, we deliver efficient, reliable, and transparent logistics solutions for global traders.",
            "stat-year": "年行业经验",
            "stat-client": "服务客户",
            "stat-country": "航线覆盖国家",
            "section-title-services": "核心服务",
            "section-subtitle-services": "Our Core Services",
            "service-fcl-title": "整柜订舱",
            "service-fcl-sub": "FCL Booking",
            "service-fcl-desc": "欧美航线一手舱位资源，与多家船公司深度合作，价格竞争力强，船期稳定保障。无论旺季淡季，确保您的货物准时出运。",
            "service-customs-title": "专业清关",
            "service-customs-sub": "Customs Clearance",
            "service-customs-desc": "覆盖欧美主要口岸的双清包税服务，熟悉各国海关法规与流程，快速通关，合规无忧，让您的货物顺利入境。",
            "service-d2d-title": "门到门物流",
            "service-d2d-sub": "Door-to-Door",
            "service-d2d-desc": "从提货、仓储、海运/空运到末端配送，全程可视化跟踪，一站式交付。我们提供定制化物流方案，满足您的个性化需求。",
            "why-title": "为什么选择我们",
            "why-subtitle": "Why Choose Us",
            "why-1-title": "航线资源优势",
            "why-1-desc": "合作船公司覆盖 MSK、MSC、COSCO 等主流船东，欧美航线一手舱位，旺季保舱保柜。",
            "why-2-title": "清关经验丰富",
            "why-2-desc": "多年欧美清关经验，熟悉各国海关政策与合规要点，双清包税，确保货物快速通关。",
            "why-3-title": "全程可视追踪",
            "why-3-desc": "自研物流追踪系统，从起运港到目的港全程节点透明，实时推送货物状态，让您随时掌握动态。",
            "why-4-title": "专属客服对接",
            "why-4-desc": "每位客户配备专属客服经理，中英双语服务，快速响应，7×24小时为您解决物流问题。",
            "gallery-title": "我们的办公室",
            "gallery-subtitle": "Meet Our Team",
            "contact-title": "联系我们",
            "contact-subtitle": "Get In Touch",
            "contact-wechat": "17512028116",
            "contact-whatsapp": "+86 17833155778",
            "chat-now": "立即聊天",
            "contact-email": "zhua96062@gmail.com",
            "contact-email2": "i1032782359@outlook.com",
            "form-title": "发送询价",
            "form-name-placeholder": "您的姓名 / Your Name",
            "form-email-placeholder": "您的邮箱 / Your Email",
            "form-msg-placeholder": "请简述您的需求 / Please describe your needs...",
            "form-submit": "发送询价 / Send Inquiry",
            "form-sending": "发送中...",
            "form-success": "感谢您的询价！我们会在24小时内与您联系。",
            "form-error": "提交失败，请稍后再试或直接发送邮件。",
            "form-required": "请填写所有字段 / Please fill in all fields.",
            "footer-desc": "全球物流 · 通达欧美",
            "cta-title": "准备好发货了吗？", "cta-subtitle": "获取专属物流方案与实时报价", "section-title-gallery": "我们的团队",
            "section-subtitle-gallery": "Our Team"
        },
        en: {
            "nav-home": "Home",
            "nav-about": "About Us",
            "nav-services": "Services",
            "nav-blog": "Insights",
            "nav-contact": "Contact",
            "hero-tag": "BohaoGroup · Global Logistics Expert",
            "hero-title": "Global Logistics<span class=\"text-gold\"> for </span>Europe &amp; USA",
            "hero-subtitle": "FCL Booking &nbsp;|&nbsp; Customs Clearance &nbsp;|&nbsp; Door-to-Door",
            "hero-cta": "Get a Quote",
            "section-title-about": "About Us",
            "section-subtitle-about": "关于博皓",
            "about-intro-cn": "BohaoGroup is a comprehensive international logistics provider specializing in <strong>Europe &amp; North America routes</strong>. With deep expertise in FCL booking, professional customs clearance, and door-to-door delivery, we deliver efficient, reliable, and transparent logistics solutions for global traders.",
            "about-intro-en": "BohaoGroup 是一家专注于<strong>欧美航线</strong>的综合国际物流服务商。我们深耕整柜订舱（FCL）、专业清关及门到门物流领域，凭借丰富的行业经验与一手资源优势，为全球贸易商提供高效、可靠、透明的物流解决方案。",
            "stat-year": "Years Experience",
            "stat-client": "Clients Served",
            "stat-country": "Countries Covered",
            "section-title-services": "Our Services",
            "section-subtitle-services": "核心服务",
            "service-fcl-title": "FCL Booking",
            "service-fcl-sub": "整柜订舱",
            "service-fcl-desc": "Direct space allocation on Europe & USA routes with deep partnerships across major carriers (MSK, MSC, COSCO). Competitive pricing, stable schedules, guaranteed space even during peak seasons.",
            "service-customs-title": "Customs Clearance",
            "service-customs-sub": "专业清关",
            "service-customs-desc": "DDP customs clearance services at major European and American ports. Deep knowledge of local customs regulations and procedures ensuring fast, compliant clearance.",
            "service-d2d-title": "Door-to-Door",
            "service-d2d-sub": "门到门物流",
            "service-d2d-desc": "Full visibility tracking from pickup, warehousing, ocean/air freight to final delivery. One-stop solution tailored to your specific logistics needs.",
            "why-title": "Why Choose Us",
            "why-subtitle": "为什么选择我们",
            "why-1-title": "Carrier Network",
            "why-1-desc": "Strategic partnerships with MSK, MSC, COSCO and other major carriers. Direct space allocation with guaranteed capacity during peak seasons.",
            "why-2-title": "Customs Expertise",
            "why-2-desc": "Years of experience in European and American customs clearance. Deep understanding of regulations and compliance for fast clearance.",
            "why-3-title": "Real-Time Tracking",
            "why-3-desc": "Proprietary tracking system provides end-to-end visibility. Real-time cargo status updates pushed to your phone or email.",
            "why-4-title": "Dedicated Support",
            "why-4-desc": "Every client gets a dedicated account manager. Bilingual support (Chinese & English), fast response, 7×24 availability.",
            "gallery-title": "Our Office",
            "gallery-subtitle": "我们的办公室",
            "contact-title": "Contact Us",
            "contact-subtitle": "联系我们",
            "contact-wechat": "17512028116",
            "contact-whatsapp": "+86 17833155778",
            "chat-now": "Chat Now",
            "contact-email": "zhua96062@gmail.com",
            "contact-email2": "i1032782359@outlook.com",
            "form-title": "Send Inquiry",
            "form-name-placeholder": "Your Name / 您的姓名",
            "form-email-placeholder": "Your Email / 您的邮箱",
            "form-msg-placeholder": "Describe your needs... / 请简述您的需求",
            "form-submit": "Send Inquiry / 发送询价",
            "form-sending": "Sending...",
            "form-success": "Thank you! We will contact you within 24 hours.",
            "form-error": "Submission failed. Please try again or email us directly.",
            "form-required": "Please fill in all fields / 请填写所有字段",
            "services-hero-subtitle": "FCL Booking | Customs Clearance | Door-to-Door", "footer-desc": "Global Logistics · Europe & USA",
            "cta-title": "Ready to Ship?", "cta-subtitle": "Get a customized solution & real-time quote", "section-title-gallery": "Our Team",
            "section-subtitle-gallery": "我们的团队",
            "gallery-1": "Operations Team",
            "gallery-2": "Customer Service",
            "gallery-3": "Warehouse Inspection",
            "gallery-4": "Team Meeting"
        }
    };

    // English captions for gallery
    const EN_GALLERY = ["Operations Team", "Customer Service", "Warehouse Inspection", "Team Meeting"];

    /* ========== 语言切换 ========== */
    function setLang(lang) {
        currentLang = lang;
        localStorage.setItem("bohao-lang", lang);

        // 切换 langToggle 按钮文字
        if (langToggle) {
            langToggle.textContent = lang === "cn" ? "EN" : "中文";
            langToggle.classList.toggle("lang-cn", lang === "cn");
            langToggle.classList.toggle("lang-en", lang !== "cn");
        }

        // 更新所有 data-i18n 元素
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            const key = el.getAttribute("data-i18n");
            const text = LANG[lang] && LANG[lang][key];
            if (text) {
                el.innerHTML = text;
            }
        });

        // 更新所有 data-lang 元素的显示
        document.querySelectorAll("[data-lang]").forEach(function (el) {
            el.style.display = el.getAttribute("data-lang") === lang ? "" : "none";
        });

        // 更新占位符
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            const key = el.getAttribute("data-i18n-placeholder");
            const text = LANG[lang] && LANG[lang][key];
            if (text) {
                el.placeholder = text;
            }
        });

        // 更新 HTML lang 属性
        document.documentElement.lang = lang === "cn" ? "zh-CN" : "en";

        // 更新图库英文图注
        if (lang === "en") {
            document.querySelectorAll(".gallery-caption").forEach(function (el, i) {
                if (EN_GALLERY[i]) el.textContent = EN_GALLERY[i];
            });
        } else {
            document.querySelectorAll(".gallery-caption").forEach(function (el, i) {
                const cnCaps = ["运营团队", "客服团队", "仓库检查", "团队会议"];
                if (cnCaps[i]) el.textContent = cnCaps[i];
            });
        }

        // 触发自定义事件，其他组件可以监听
        document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
    }

    // 语言切换按钮点击
    if (langToggle) {
        langToggle.addEventListener("click", function () {
            setLang(currentLang === "cn" ? "en" : "cn");
        });
    }

    /* ========== 滚动导航效果 ========== */
    function onScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // 高亮当前 section 的导航链接
        const sections = document.querySelectorAll("section[id]");
        let current = "";
        sections.forEach(function (section) {
            const top = section.offsetTop - 120;
            if (scrollY >= top) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }
        });

        // 数字动画触发
        if (!statsAnimated && isInViewport(document.getElementById("about"))) {
            animateCounters();
            statsAnimated = true;
        }
    }

    /* ========== 移动端菜单 ========== */
    if (navToggle) {
        navToggle.addEventListener("click", function () {
            navToggle.classList.toggle("active");
            navMenu.classList.toggle("open");
            document.body.style.overflow = navMenu.classList.contains("open") ? "hidden" : "";
        });
    }

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navToggle.classList.remove("active");
            navMenu.classList.remove("open");
            document.body.style.overflow = "";
        });
    });

    /* ========== 滚动显示动画 (Intersection Observer) ========== */
    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
        observer.observe(el);
    });

    /* ========== 数字递增动画 ========== */
    function animateCounters() {
        statNumbers.forEach(function (el) {
            const target = parseInt(el.getAttribute("data-count"), 10);
            const duration = 2000;
            const step = Math.ceil(target / (duration / 16));
            let current = 0;

            function tick() {
                current += step;
                if (current >= target) {
                    el.textContent = target;
                    return;
                }
                el.textContent = current;
                requestAnimationFrame(tick);
            }
            tick();
        });
    }

    function isInViewport(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    if (isInViewport(document.getElementById("about"))) {
        statsAnimated = true;
        animateCounters();
    }

    /* ========== 询价表单提交 ========== */
    if (inquiryForm) {
        inquiryForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();

            if (!name || !email || !message) {
                showFormMessage(
                    currentLang === "cn" ? "请填写所有字段" : "Please fill in all fields.",
                    "error"
                );
                return;
            }

            const submitBtn = inquiryForm.querySelector(".form-submit");
            const originalText = submitBtn.textContent;
            submitBtn.textContent = currentLang === "cn" ? "发送中..." : "Sending...";
            submitBtn.disabled = true;

            // 创建 AbortController 添加 10 秒超时
            const controller = new AbortController();
            const timeoutId = setTimeout(function () { controller.abort(); }, 10000);

            // POST 到 Cloudflare Pages Function
            fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, email: email, message: message }),
                signal: controller.signal
            })
            .then(function (resp) {
                clearTimeout(timeoutId);
                return resp.json().then(function (data) {
                    return { status: resp.status, data: data };
                });
            })
            .then(function (result) {
                clearTimeout(timeoutId);
                if (result.data.success) {
                    showFormMessage(
                        currentLang === "cn"
                            ? "✅ 询价已发送！我们会在24小时内联系您。"
                            : "✅ Inquiry sent! We will contact you within 24 hours.",
                        "success"
                    );
                    inquiryForm.reset();
                } else {
                    showFormMessage(
                        result.data.error || (currentLang === "cn"
                            ? "提交失败，请稍后再试。"
                            : "Submission failed, please try again."),
                        "error"
                    );
                }
            })
            .catch(function () {
                clearTimeout(timeoutId);
                // 超时或网络错误时，使用 mailto 作为备用
                const mailto = "mailto:zhua96062@gmail.com?subject="
                    + encodeURIComponent("Inquiry from " + name)
                    + "&body="
                    + encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);
                window.open(mailto, "_blank");
                showFormMessage(
                    currentLang === "cn"
                        ? "网络异常，已打开邮件客户端作为备用。\nNetwork error. Email client opened as backup."
                        : "Network error. Email client opened as backup.\n网络异常，已打开邮件客户端作为备用。",
                    "info"
                );
            })
            .finally(function () {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    function showFormMessage(msg, type) {
        var old = document.querySelector(".form-msg");
        if (old) old.remove();

        var div = document.createElement("div");
        div.className = "form-msg form-msg--" + type;
        div.innerHTML = msg;
        div.style.cssText =
            "margin-top:16px;padding:12px 16px;border-radius:6px;font-size:13px;text-align:center;animation:fadeInUp 0.4s ease-out;";

        if (type === "success") {
            div.style.background = "rgba(46,204,113,0.15)";
            div.style.color = "#2ecc71";
            div.style.border = "1px solid rgba(46,204,113,0.3)";
        } else if (type === "error") {
            div.style.background = "rgba(220,80,60,0.15)";
            div.style.color = "#e88";
            div.style.border = "1px solid rgba(220,80,60,0.3)";
        } else {
            div.style.background = "rgba(100,140,200,0.15)";
            div.style.color = "#9cf";
            div.style.border = "1px solid rgba(100,140,200,0.3)";
        }

        inquiryForm.after(div);

        setTimeout(function () {
            div.style.opacity = "0";
            div.style.transition = "opacity 0.4s";
            setTimeout(function () { div.remove(); }, 400);
        }, 4000);
    }

    /* ========== 事件绑定 ========== */
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 点击外部关闭移动菜单
    document.addEventListener("click", function (e) {
        if (
            navMenu &&
            navMenu.classList.contains("open") &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)
        ) {
            navToggle.classList.remove("active");
            navMenu.classList.remove("open");
            document.body.style.overflow = "";
        }
    });

    /* ========== 初始化语言 ========== */
    setLang(currentLang);

})();
