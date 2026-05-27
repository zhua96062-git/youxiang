/* ============================================
   BohaoGroup - Interactive
   Scroll, Navigation, Reveal, Counter
   ============================================ */

(function () {
    "use strict";

    /* ---- DOM refs ---- */
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    const revealEls = document.querySelectorAll(".reveal");
    const statNumbers = document.querySelectorAll(".stat-number");
    const inquiryForm = document.getElementById("inquiryForm");

    let statsAnimated = false;

    /* ---- Nav scroll effect ---- */
    function onScroll() {
        const scrollY = window.scrollY;

        /* Add background when scrolled */
        if (scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        /* Active nav link */
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

        /* Stats counter trigger */
        if (!statsAnimated && isInViewport(document.getElementById("about"))) {
            animateCounters();
            statsAnimated = true;
        }
    }

    /* ---- Mobile toggle ---- */
    navToggle.addEventListener("click", function () {
        navToggle.classList.toggle("active");
        navMenu.classList.toggle("open");
        document.body.style.overflow = navMenu.classList.contains("open") ? "hidden" : "";
    });

    /* Close mobile menu on link click */
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navToggle.classList.remove("active");
            navMenu.classList.remove("open");
            document.body.style.overflow = "";
        });
    });

    /* ---- Reveal on scroll (Intersection Observer) ---- */
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

    /* ---- Counter animation ---- */
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

    /* ---- Helper: is element in viewport ---- */
    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    /* ---- Inline check for counters on load ---- */
    if (isInViewport(document.getElementById("about"))) {
        statsAnimated = true;
        animateCounters();
    }

    /* ---- Form submit ---- */
    if (inquiryForm) {
        inquiryForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();

            if (!name || !email || !message) {
                showFormMessage("请填写所有字段 / Please fill in all fields.", "error");
                return;
            }

            /* Construct mailto as fallback; in production, wire to a real backend */
            const mailto = "mailto:zhua96062@gmail.com?subject="
                + encodeURIComponent("询价 Inquiry from " + name)
                + "&body="
                + encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);

            /* Try opening mail client */
            try {
                window.open(mailto, "_blank");
                showFormMessage("感谢您的询价！正在打开邮件客户端... / Thank you! Opening email client...", "success");
            } catch (err) {
                showFormMessage("请直接发送邮件至 zhua96062@gmail.com / Please email us directly.", "info");
            }

            inquiryForm.reset();
        });
    }

    function showFormMessage(msg, type) {
        /* Remove existing */
        const old = document.querySelector(".form-msg");
        if (old) old.remove();

        const div = document.createElement("div");
        div.className = "form-msg form-msg--" + type;
        div.textContent = msg;
        div.style.cssText =
            "margin-top:16px;padding:12px 16px;border-radius:6px;font-size:13px;text-align:center;animation:fadeInUp 0.4s ease-out;";

        if (type === "success") {
            div.style.background = "rgba(201,168,76,0.15)";
            div.style.color = "#c9a84c";
            div.style.border = "1px solid rgba(201,168,76,0.3)";
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

    /* ---- Events ---- */
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); /* Initial call */

    /* ---- Click outside mobile menu to close ---- */
    document.addEventListener("click", function (e) {
        if (
            navMenu.classList.contains("open") &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)
        ) {
            navToggle.classList.remove("active");
            navMenu.classList.remove("open");
            document.body.style.overflow = "";
        }
    });
})();
