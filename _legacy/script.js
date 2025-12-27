/* ============================================
   BUCCI PRODUCTS - Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initScrollAnimations();
    initMobileMenu();
    initFormHandler();
    initSmoothScroll();
});

/* ============================================
   NAVIGATION
   ============================================ */

function initNavigation() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class for background
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */

function initScrollAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger children animations
                const children = entry.target.querySelectorAll('.animate-child');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    child.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    // Observe sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('animate-section');
        observer.observe(section);
    });

    // Add animation classes
    addAnimationClasses();
}

function addAnimationClasses() {
    // Feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
    });

    // Testimonials
    document.querySelectorAll('.testimonial').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`;
    });

    // Stats
    document.querySelectorAll('.stat').forEach((stat, index) => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        stat.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
    });

    // Intersection Observer for these elements
    const animatedElements = document.querySelectorAll('.feature-card, .testimonial, .stat');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
}

/* ============================================
   MOBILE MENU
   ============================================ */

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    let isOpen = false;

    menuBtn.addEventListener('click', () => {
        isOpen = !isOpen;

        if (isOpen) {
            menuBtn.classList.add('active');
            // Create mobile menu overlay
            createMobileMenu();
        } else {
            menuBtn.classList.remove('active');
            closeMobileMenu();
        }
    });
}

function createMobileMenu() {
    const nav = document.querySelector('.nav');
    const links = document.querySelector('.nav-links').cloneNode(true);

    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.innerHTML = `
        <div class="mobile-menu-content">
            ${links.outerHTML}
            <a href="#product" class="btn btn-primary mobile-cta">Shop Now</a>
        </div>
    `;

    // Add styles
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(10, 10, 10, 0.98);
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const content = overlay.querySelector('.mobile-menu-content');
    content.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    `;

    const navList = overlay.querySelector('.nav-links');
    navList.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        list-style: none;
    `;

    navList.querySelectorAll('a').forEach(link => {
        link.style.cssText = `
            font-size: 1.5rem;
            letter-spacing: 0.2em;
        `;
        link.addEventListener('click', closeMobileMenu);
    });

    overlay.querySelector('.mobile-cta').addEventListener('click', closeMobileMenu);

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Trigger animation
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });
}

function closeMobileMenu() {
    const overlay = document.querySelector('.mobile-menu-overlay');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 300);
    }

    menuBtn.classList.remove('active');
}

/* ============================================
   FORM HANDLER
   ============================================ */

function initFormHandler() {
    const form = document.querySelector('.contact-form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Show success message (in production, this would send to a server)
            showFormSuccess(form);

            // Reset form
            form.reset();
        });
    }
}

function showFormSuccess(form) {
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p>Message sent successfully!</p>
        <span>We'll get back to you soon.</span>
    `;

    successMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #141414;
        border: 1px solid #c9a962;
        padding: 3rem;
        text-align: center;
        z-index: 1000;
        animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const svg = successMsg.querySelector('svg');
    svg.style.cssText = `
        color: #c9a962;
        margin-bottom: 1rem;
    `;

    const p = successMsg.querySelector('p');
    p.style.cssText = `
        font-family: 'Bodoni Moda', serif;
        font-size: 1.5rem;
        color: #f5f0e8;
        margin-bottom: 0.5rem;
    `;

    const span = successMsg.querySelector('span');
    span.style.cssText = `
        font-size: 0.9rem;
        color: #888;
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999;
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(successMsg);

    // Remove after 3 seconds
    setTimeout(() => {
        successMsg.style.opacity = '0';
        backdrop.style.opacity = '0';
        successMsg.style.transition = 'opacity 0.3s';
        backdrop.style.transition = 'opacity 0.3s';

        setTimeout(() => {
            successMsg.remove();
            backdrop.remove();
        }, 300);
    }, 3000);

    // Click to close
    backdrop.addEventListener('click', () => {
        successMsg.remove();
        backdrop.remove();
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   PARALLAX EFFECT (Optional Enhancement)
   ============================================ */

function initParallax() {
    const hero = document.querySelector('.hero-visual');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

/* ============================================
   CURSOR EFFECT (Optional Enhancement)
   ============================================ */

function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 1px solid #c9a962;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease, opacity 0.3s ease;
        transform: translate(-50%, -50%);
    `;

    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.borderColor = '#d4b978';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.borderColor = '#c9a962';
        });
    });
}

// Uncomment to enable custom cursor:
// initCustomCursor();
