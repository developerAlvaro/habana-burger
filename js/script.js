// This file contains the JavaScript code for the web application. 
// It handles interactivity, DOM manipulation, and any other client-side logic required for the application.

document.addEventListener('DOMContentLoaded', function() {
    console.log('Document is ready!');
    
    // Animate skill bars when they come into view
    animateSkillBars();

    // Setup contact form validation and mailto submit
    setupContactForm();

    // Smooth accelerated scroll for navbar links
    setupSmoothNavbarScroll();

    // Setup scroll-to-top button
    setupScrollToTopButton();

    // Setup sales cart
    setupSalesCart();

    // Setup app-like mobile experience
    setupMobileAppMode();
});

/**
 * Animates skill bars using Intersection Observer
 */
function animateSkillBars() {
    const aboutSection = document.getElementById('sobre-mi');
    const skillProgresses = document.querySelectorAll('#sobre-mi .skill-progress');

    if (!aboutSection || !skillProgresses.length) return;

    let hasAnimated = false;

    function runAnimation() {
        if (hasAnimated) return;
        hasAnimated = true;

        skillProgresses.forEach((progress, index) => {
            const rawPercent = Number(progress.getAttribute('data-percent')) || 0;
            const percent = Math.max(0, Math.min(100, rawPercent));
            const skillItem = progress.closest('.skill-item');

            if (skillItem) {
                skillItem.style.animationDelay = `${index * 0.12}s`;
            }

            progress.style.setProperty('--percent', `${percent}%`);

            requestAnimationFrame(() => {
                progress.classList.add('animated');
                progress.style.width = `${percent}%`;
            });
        });
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries, obs) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runAnimation();
                    obs.disconnect();
                }
            });
        }, {
            threshold: 0.25
        });

        observer.observe(aboutSection);
        return;
    }

    runAnimation();
}

/**
 * Validates the contact form and opens the default mail client
 */
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
        nombre: document.getElementById('nombre'),
        telefono: document.getElementById('telefono'),
        mensaje: document.getElementById('mensaje')
    };

    const alertBox = document.getElementById('contactFormAlert');
    const WHATSAPP_NUMBER = '+59893484775';
    const phoneRegex = /^[0-9+\s()-]{8,20}$/;

    function setFieldState(field, message) {
        const errorElement = form.querySelector(`[data-error-for="${field.id}"]`);
        const hasError = Boolean(message);

        field.classList.toggle('is-invalid', hasError);
        field.classList.toggle('is-valid', !hasError);

        if (errorElement) errorElement.textContent = message || '';
    }

    function showAlert(message, type) {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = `contact-alert show ${type}`;
    }

    function clearAlert() {
        if (!alertBox) return;
        alertBox.textContent = '';
        alertBox.className = 'contact-alert';
    }

    function validateForm() {
        let isValid = true;

        const nombre = fields.nombre.value.trim();
        const telefono = fields.telefono.value.trim();
        const mensaje = fields.mensaje.value.trim();

        if (nombre.length < 3) {
            setFieldState(fields.nombre, 'Ingresar un nombre válido de al menos 3 caracteres.');
            isValid = false;
        } else {
            setFieldState(fields.nombre, '');
        }

        if (!phoneRegex.test(telefono)) {
            setFieldState(fields.telefono, 'Ingresar un teléfono válido.');
            isValid = false;
        } else {
            setFieldState(fields.telefono, '');
        }

        if (mensaje.length < 10) {
            setFieldState(fields.mensaje, 'Ingresar un mensaje de al menos 10 caracteres.');
            isValid = false;
        } else {
            setFieldState(fields.mensaje, '');
        }

        return isValid;
    }

    Object.values(fields).forEach(field => {
        field?.addEventListener('input', function () {
            clearAlert();
            validateForm();
        });
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearAlert();

        if (!validateForm()) {
            showAlert('Revisar los campos marcados antes de enviar.', 'error');
            return;
        }

        const nombre = fields.nombre.value.trim();
        const telefono = fields.telefono.value.trim();
        const mensaje = fields.mensaje.value.trim();

        const text = [
            'Hola, te envío una consulta desde la web:',
            '',
            `Nombre: ${nombre}`,
            `Teléfono: ${telefono}`,
            '',
            `Mensaje:`,
            mensaje
        ].join('\n');

        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

        showAlert('Validación correcta. Abriendo WhatsApp...', 'success');
        const win = window.open(waUrl, '_blank');
        if (!win) window.location.href = waUrl;
    });
}

/**
 * Smooth accelerated scrolling for in-page navbar anchors
 */
function setupSmoothNavbarScroll() {
    const navLinks = document.querySelectorAll('.navbar a.nav-link[href^="#"], .navbar a.navbar-brand[href^="#"]');
    const navbar = document.querySelector('.navbar');

    if (!navLinks.length) return;

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function smoothScrollTo(targetY, duration) {
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);

            window.scrollTo(0, startY + distance * eased);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const hash = this.getAttribute('href');
            if (!hash || hash === '#') return;

            const target = document.querySelector(hash);
            if (!target) return;

            event.preventDefault();

            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetY = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 8;

            // Duration adaptable para escritorio/móvil según distancia
            const distance = Math.abs(targetY - window.pageYOffset);
            const duration = Math.max(450, Math.min(1100, distance * 0.6));

            smoothScrollTo(targetY, duration);

            // Actualiza hash sin salto brusco
            history.pushState(null, '', hash);

            // Cierra menú colapsado en móvil (Bootstrap)
            const navCollapse = document.querySelector('#mainNavbar');
            if (navCollapse && navCollapse.classList.contains('show') && window.bootstrap?.Collapse) {
                window.bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
            }
        });
    });
}

/**
 * Shows a floating button on scroll and scrolls smoothly to top
 */
function setupScrollToTopButton() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (!scrollTopBtn) return;

    function toggleButtonVisibility() {
        const shouldShow = window.scrollY > 300;
        scrollTopBtn.classList.toggle('show', shouldShow);
    }

    window.addEventListener('scroll', toggleButtonVisibility);
    toggleButtonVisibility();

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Adds app-like mobile UX: compact navbar + floating quick actions
 */
function setupMobileAppMode() {
    const navbar = document.querySelector('.navbar');
    const body = document.body;

    if (!navbar || !body) return;

    let ticking = false;

    function updateNavbarCompact() {
        navbar.classList.toggle('navbar-compact', window.scrollY > 12);
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateNavbarCompact();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateNavbarCompact();

    const mediaMobile = window.matchMedia('(max-width: 991.98px)');
    const existingBar = document.getElementById('mobileQuickActions');

    if (existingBar) existingBar.remove();

    const actionsBar = document.createElement('div');
    actionsBar.id = 'mobileQuickActions';
    actionsBar.className = 'mobile-quick-actions';
    actionsBar.setAttribute('aria-label', 'Acciones rápidas');

    const cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'mobile-action-btn mobile-action-cart';
    cartBtn.innerHTML = '<i class="bi bi-cart3"></i><span>Carrito</span><span id="mobileQuickCartCount" class="mobile-cart-count d-none">0</span>';

    const waBtn = document.createElement('a');
    waBtn.className = 'mobile-action-btn mobile-action-wa';
    waBtn.innerHTML = '<i class="bi bi-whatsapp"></i><span>WhatsApp</span>';
    waBtn.setAttribute('rel', 'noopener noreferrer');
    waBtn.setAttribute('target', '_blank');

    const waLink = document.querySelector('a[href*="wa.me"]');
    waBtn.href = waLink ? waLink.getAttribute('href') : 'https://wa.me/59893484775';

    const desktopCartBadge = document.getElementById('cartCountBadge');
    const mobileCartBadge = cartBtn.querySelector('#mobileQuickCartCount');
    const initialCount = Number(desktopCartBadge?.textContent || 0);
    if (mobileCartBadge) {
        mobileCartBadge.textContent = String(initialCount);
        mobileCartBadge.classList.toggle('d-none', initialCount <= 0);
    }

    cartBtn.addEventListener('click', function () {
        const cartOffcanvasEl = document.getElementById('cartOffcanvas');
        if (window.bootstrap?.Offcanvas && cartOffcanvasEl) {
            window.bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasEl).show();
            return;
        }

        const fallbackCartBtn = document.getElementById('openCartBtn');
        fallbackCartBtn?.click();
    });

    actionsBar.appendChild(cartBtn);
    actionsBar.appendChild(waBtn);

    function handleMobileBar() {
        if (mediaMobile.matches) {
            if (!document.getElementById('mobileQuickActions')) {
                body.appendChild(actionsBar);
            }
            body.classList.add('has-mobile-actions');
        } else {
            actionsBar.remove();
            body.classList.remove('has-mobile-actions');
        }
    }

    handleMobileBar();

    if (typeof mediaMobile.addEventListener === 'function') {
        mediaMobile.addEventListener('change', handleMobileBar);
    } else if (typeof mediaMobile.addListener === 'function') {
        mediaMobile.addListener(handleMobileBar);
    }
}

/**
 * Shopping cart for Roblox cards
 */
function setupSalesCart() {
    const STORAGE_KEY = 'food_cart_v3';
    const WHATSAPP_NUMBER = '+59893484775';

    const INGREDIENTS_BY_PRODUCT = {
        hamburguesa: ['Queso', 'Huevo', 'Panceta', 'Ketchup', 'Mayonesa', 'Moztaza', 'Salza de pepinillos'],
        pancho: ['Queso', 'Panceta', 'Papas pai', 'Mayonesa', 'Ketchup', 'Salza de pepinillos']
    };

    const EXTRA_INGREDIENTS_BY_PRODUCT = {
        hamburguesa: [
            { name: 'Queso extra', price: 15 },
            { name: 'Huevo extra', price: 15 },
            { name: 'Panceta extra', price: 15 },
            { name: 'Carne extra', price: 50 }
        ],
        pancho: [
            { name: 'Queso extra', price: 15 },
            { name: 'Panceta extra', price: 15 }
        ]
    };

    const serviciosSection = document.getElementById('servicios');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const addedToCartModalEl = document.getElementById('addedToCartModal');
    const addedToCartProductNameEl = document.getElementById('addedToCartProductName');
    const goToCartBtn = document.getElementById('goToCartBtn');
    const cartOffcanvasEl = document.getElementById('cartOffcanvas');

    if (!serviciosSection || !cartItemsEl || !cartTotalEl || !cartCountBadge) return;

    let cart = loadCart();
    const addedToCartModal = (window.bootstrap && addedToCartModalEl)
        ? window.bootstrap.Modal.getOrCreateInstance(addedToCartModalEl)
        : null;
    const cartOffcanvas = (window.bootstrap && cartOffcanvasEl)
        ? window.bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasEl)
        : null;

    addButtonsToCards();
    renderCart();

    serviciosSection.addEventListener('click', function (event) {
        const btn = event.target.closest('.add-to-cart-btn');
        if (!btn) return;

        const card = btn.closest('.service-card');
        const imageEl = card?.querySelector('.service-img');

        const name = btn.dataset.product || 'Producto';
        const price = Number(btn.dataset.price || 0);
        const image = btn.dataset.image || imageEl?.getAttribute('src') || 'img/hamburguesa.jpg';

        if (price <= 0) return;
        addItem(name, price, image);
        showPostAddChoice(name);
    });

    goToCartBtn?.addEventListener('click', function () {
        addedToCartModal?.hide();
        if (cartOffcanvas) return cartOffcanvas.show();
        window.location.hash = '#cartOffcanvas';
    });

    cartItemsEl.addEventListener('click', function (event) {
        const btn = event.target.closest('button[data-action]');
        if (!btn) return;

        const id = btn.dataset.id || '';
        const action = btn.dataset.action;

        if (action === 'inc') duplicateItem(id);
        if (action === 'dec' || action === 'remove') removeItemById(id);
    });

    cartItemsEl.addEventListener('change', function (event) {
        const ingredientInput = event.target.closest('.ingredient-checkbox');
        if (ingredientInput) {
            const id = ingredientInput.dataset.id || '';
            const ingredient = decodeURIComponent(ingredientInput.dataset.ingredient || '');
            toggleIngredientById(id, ingredient, ingredientInput.checked);

            const item = cart.find(x => x.id === id);
            const row = ingredientInput.closest('.cart-row');
            const badgeContainer = row?.querySelector('.ingredient-status-badge');
            if (!item || !badgeContainer) return;

            const isComplete = allIngredientsSelected(item);
            badgeContainer.innerHTML = isComplete
                ? '<span class="badge bg-success-subtle text-success border border-success-subtle me-1"><i class="bi bi-check-all"></i> Completa</span>'
                : '<span class="badge bg-warning-subtle text-warning border border-warning-subtle me-1"><i class="bi bi-pencil"></i> Personalizada</span>';
            return;
        }

        const extraInput = event.target.closest('.extra-checkbox');
        if (!extraInput) return;

        const id = extraInput.dataset.id || '';
        const extraName = decodeURIComponent(extraInput.dataset.extra || '');
        toggleExtraById(id, extraName, extraInput.checked);

        const item = cart.find(x => x.id === id);
        const row = extraInput.closest('.cart-row');
        if (!item || !row) return;

        const extrasLine = row.querySelector('.item-extras-line');
        const itemTotalLine = row.querySelector('.item-total-line');
        const extrasTotal = getItemExtrasTotal(item);

        if (extrasLine) {
            extrasLine.textContent = `Extras: +${formatCurrency(extrasTotal)}`;
            extrasLine.classList.toggle('d-none', extrasTotal <= 0);
        }

        if (itemTotalLine) {
            itemTotalLine.textContent = `Total item: ${formatCurrency(getItemFinalPrice(item))}`;
        }

        const totalPrice = cart.reduce((sum, currentItem) => sum + getItemFinalPrice(currentItem), 0);
        cartTotalEl.textContent = formatCurrency(totalPrice);
    });

    clearCartBtn?.addEventListener('click', function () {
        cart = [];
        persistCart();
        renderCart();
    });

    checkoutBtn?.addEventListener('click', function () {
        if (!cart.length) return alert('Tu carrito está vacío.');

        const customerNameInput = document.getElementById('cartCustomerName');
        const customerNameError = document.getElementById('cartCustomerNameError');
        const customerName = (customerNameInput?.value || '').trim();

        if (!customerName) {
            if (customerNameError) customerNameError.style.display = 'block';
            customerNameInput?.focus();
            return;
        }
        if (customerNameError) customerNameError.style.display = 'none';

        const total = cart.reduce((sum, item) => sum + getItemFinalPrice(item), 0);
        const message = buildWhatsAppOrderMessage(cart, total, customerName);
        const waNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        const win = window.open(waUrl, '_blank');
        if (!win) window.location.href = waUrl;

        cart = [];
        if (customerNameInput) customerNameInput.value = '';
        persistCart();
        renderCart();
    });

    document.getElementById('cartCustomerName')?.addEventListener('input', function () {
        const customerNameError = document.getElementById('cartCustomerNameError');
        if (this.value.trim() && customerNameError) customerNameError.style.display = 'none';
    });

    function uid() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function getDefaultIngredients(productName) {
        const name = (productName || '').toLowerCase();
        if (name.includes('hamburguesa')) return [...INGREDIENTS_BY_PRODUCT.hamburguesa];
        if (name.includes('pancho')) return [...INGREDIENTS_BY_PRODUCT.pancho];
        return [];
    }

    function getDefaultExtras(productName) {
        const name = (productName || '').toLowerCase();
        if (name.includes('hamburguesa')) return EXTRA_INGREDIENTS_BY_PRODUCT.hamburguesa.map(extra => ({ ...extra }));
        if (name.includes('pancho')) return EXTRA_INGREDIENTS_BY_PRODUCT.pancho.map(extra => ({ ...extra }));
        return [];
    }

    function getItemExtraByName(item, extraName) {
        return (item.availableExtras || []).find(extra => extra.name === extraName) || null;
    }

    function getItemExtrasTotal(item) {
        return (item.selectedExtras || []).reduce((sum, extraName) => {
            const extra = getItemExtraByName(item, extraName);
            return sum + (extra ? Number(extra.price || 0) : 0);
        }, 0);
    }

    function getItemFinalPrice(item) {
        return Number(item.price || 0) + getItemExtrasTotal(item);
    }

    function allIngredientsSelected(item) {
        const available = item.availableIngredients || [];
        const selected = item.selectedIngredients || [];
        return available.length > 0 && available.every(ing => selected.includes(ing));
    }

    function buildWhatsAppOrderMessage(items, total, customerName) {
        const lines = items.map((item, idx) => {
            let selectedIngredients;
            if (!item.selectedIngredients?.length) {
                selectedIngredients = 'Sin ingredientes';
            } else if (allIngredientsSelected(item)) {
                selectedIngredients = 'Completa';
            } else {
                selectedIngredients = item.selectedIngredients.join(', ');
            }

            const selectedExtras = item.selectedExtras?.length
                ? item.selectedExtras.map(extraName => {
                    const extra = getItemExtraByName(item, extraName);
                    return extra ? `${extra.name} (+${formatCurrency(extra.price)})` : extraName;
                }).join(', ')
                : 'Sin extras';

            return [
                `${idx + 1}. ${item.name}`,
                `   Base: ${formatCurrency(item.price)}`,
                `   Ingredientes: ${selectedIngredients}`,
                `   Extras: ${selectedExtras}`
            ].join('\n');
        }).join('\n\n');

        return [
            `Hola, soy *${customerName}* y quiero realizar este pedido:`,
            '',
            lines,
            '',
            `Total: ${formatCurrency(total)}`,
        ].join('\n');
    }

    function addButtonsToCards() {
        const cards = serviciosSection.querySelectorAll('.service-card');

        cards.forEach(card => {
            const body = card.querySelector('.card-body');
            const titleEl = card.querySelector('.service-card-title');
            const priceEl = card.querySelector('.service-price');
            const imageEl = card.querySelector('.service-img');

            if (!body || !titleEl || !priceEl) return;
            if (body.querySelector('.add-to-cart-btn')) return;

            const name = titleEl.textContent.trim();
            const price = Number((priceEl.textContent || '').replace(/[^0-9.]/g, ''));
            const image = imageEl?.getAttribute('src') || 'img/hamburguesa.jpg';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary w-100 mt-3 add-to-cart-btn';
            button.dataset.product = name;
            button.dataset.price = String(price);
            button.dataset.image = image;
            button.innerHTML = '<i class="bi bi-cart-plus"></i> Agregar al carrito';

            body.appendChild(button);
        });
    }

    function addItem(name, price, image) {
        const defaults = getDefaultIngredients(name);
        const extras = getDefaultExtras(name);

        cart.push({
            id: uid(),
            name,
            price,
            image,
            availableIngredients: defaults,
            selectedIngredients: [...defaults],
            availableExtras: extras,
            selectedExtras: []
        });

        persistCart();
        renderCart();
    }

    function duplicateItem(id) {
        const current = cart.find(x => x.id === id);
        if (!current) return;

        cart.push({
            ...current,
            id: uid(),
            selectedIngredients: [...(current.selectedIngredients || [])],
            availableIngredients: [...(current.availableIngredients || [])],
            selectedExtras: [...(current.selectedExtras || [])],
            availableExtras: (current.availableExtras || []).map(extra => ({ ...extra }))
        });

        persistCart();
        renderCart();
    }

    function removeItemById(id) {
        cart = cart.filter(item => item.id !== id);
        persistCart();
        renderCart();
    }

    function toggleIngredientById(id, ingredient, checked) {
        const item = cart.find(x => x.id === id);
        if (!item) return;

        if (!Array.isArray(item.selectedIngredients)) item.selectedIngredients = [];

        if (checked) {
            if (!item.selectedIngredients.includes(ingredient)) item.selectedIngredients.push(ingredient);
        } else {
            item.selectedIngredients = item.selectedIngredients.filter(i => i !== ingredient);
        }

        persistCart();
    }

    function toggleExtraById(id, extraName, checked) {
        const item = cart.find(x => x.id === id);
        if (!item) return;

        if (!Array.isArray(item.selectedExtras)) item.selectedExtras = [];

        if (checked) {
            if (!item.selectedExtras.includes(extraName)) item.selectedExtras.push(extraName);
        } else {
            item.selectedExtras = item.selectedExtras.filter(name => name !== extraName);
        }

        persistCart();
    }

    function showPostAddChoice(productName) {
        if (!addedToCartModal) return;
        if (addedToCartProductNameEl) {
            addedToCartProductNameEl.textContent = productName || 'tu producto';
        }
        addedToCartModal.show();
    }

    function renderCart() {
        if (!cart.length) {
            cartItemsEl.innerHTML = `
                <div class="alert alert-light border text-center mb-0" role="alert">
                    <i class="bi bi-cart-x me-1"></i> No hay productos en el carrito.
                </div>
            `;
            cartTotalEl.textContent = '$0.00';
            cartCountBadge.textContent = '0';
            return;
        }

        cartItemsEl.innerHTML = `
            <ul class="list-group list-group-flush">
                ${cart.map((item, index) => {
                    const collapseId = `ingredients-${item.id}`;

                    const ingredientHtml = (item.availableIngredients || []).map((ing, ingIndex) => {
                        const checked = (item.selectedIngredients || []).includes(ing) ? 'checked' : '';
                        const inputId = `${collapseId}-ingredient-${ingIndex}`;
                        return `
                            <div class="form-check">
                                <input
                                    class="form-check-input ingredient-checkbox"
                                    type="checkbox"
                                    id="${inputId}"
                                    data-id="${item.id}"
                                    data-ingredient="${encodeURIComponent(ing)}"
                                    ${checked}
                                >
                                <label class="form-check-label small" for="${inputId}">${ing}</label>
                            </div>
                        `;
                    }).join('');

                    const extrasHtml = (item.availableExtras || []).map((extra, extraIndex) => {
                        const checked = (item.selectedExtras || []).includes(extra.name) ? 'checked' : '';
                        const inputId = `${collapseId}-extra-${extraIndex}`;
                        return `
                            <div class="form-check">
                                <input
                                    class="form-check-input extra-checkbox"
                                    type="checkbox"
                                    id="${inputId}"
                                    data-id="${item.id}"
                                    data-extra="${encodeURIComponent(extra.name)}"
                                    ${checked}
                                >
                                <label class="form-check-label small d-flex justify-content-between gap-2" for="${inputId}">
                                    <span>${extra.name}</span>
                                    <span class="text-primary fw-semibold">+${formatCurrency(extra.price)}</span>
                                </label>
                            </div>
                        `;
                    }).join('');

                    const extrasTotal = getItemExtrasTotal(item);
                    const isComplete = allIngredientsSelected(item);
                    const ingredientLabel = isComplete
                        ? '<span class="badge bg-success-subtle text-success border border-success-subtle me-1"><i class="bi bi-check-all"></i> Completa</span>'
                        : '<span class="badge bg-warning-subtle text-warning border border-warning-subtle me-1"><i class="bi bi-pencil"></i> Personalizada</span>';

                    return `
                        <li class="list-group-item px-0 cart-row">
                            <div class="d-flex align-items-center gap-3">
                                <img src="${item.image || 'img/hamburguesa.jpg'}" alt="${item.name}" class="cart-product-image rounded-3 border">
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 cart-item-title">${item.name} <small class="text-muted">#${index + 1}</small></h6>
                                    <div class="small text-muted">Base: ${formatCurrency(item.price)}</div>
                                    <div class="small text-primary fw-semibold item-extras-line ${extrasTotal > 0 ? '' : 'd-none'}">Extras: +${formatCurrency(extrasTotal)}</div>
                                    <div class="small fw-semibold text-dark item-total-line">Total item: ${formatCurrency(getItemFinalPrice(item))}</div>
                                    <div class="mt-1 ingredient-status-badge">${ingredientLabel}</div>

                                    <button class="btn btn-link btn-sm p-0 mt-1 text-decoration-none" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false">
                                        Ingredientes y extras
                                    </button>

                                    <div class="collapse mt-2" id="${collapseId}">
                                        <div class="border rounded-3 p-2 bg-light-subtle">
                                            <div class="small fw-semibold text-secondary mb-2">Ingredientes incluidos</div>
                                            ${ingredientHtml || '<small class="text-muted d-block">Sin ingredientes configurables.</small>'}

                                            ${(item.availableExtras || []).length ? `
                                                <hr class="my-2">
                                                <div class="small fw-semibold text-secondary mb-2">Ingredientes extra</div>
                                                ${extrasHtml}
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>

                                <div class="btn-group btn-group-sm" role="group" aria-label="Acciones">
                                    <button class="btn btn-outline-secondary" data-action="inc" data-id="${item.id}" title="Duplicar item">+</button>
                                    <button class="btn btn-outline-danger" data-action="remove" data-id="${item.id}" title="Eliminar">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;

        const totalItems = cart.length;
        const totalPrice = cart.reduce((sum, item) => sum + getItemFinalPrice(item), 0);

        cartCountBadge.textContent = String(totalItems);
        const mobileQuickCartCount = document.getElementById('mobileQuickCartCount');
        if (mobileQuickCartCount) {
            mobileQuickCartCount.textContent = String(totalItems);
            mobileQuickCartCount.classList.toggle('d-none', totalItems <= 0);
        }
        cartTotalEl.textContent = formatCurrency(totalPrice);
    }

    function formatCurrency(value) {
        return `$${Number(value).toFixed(2)}`;
    }

    function persistCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function loadCart() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const parsed = data ? JSON.parse(data) : [];
            if (!Array.isArray(parsed)) return [];

            const migrated = [];
            parsed.forEach(item => {
                const defaults = getDefaultIngredients(item.name || '');
                const extras = getDefaultExtras(item.name || '');

                const availableIngredients = Array.isArray(item.availableIngredients) && item.availableIngredients.length
                    ? item.availableIngredients
                    : defaults;

                const selectedIngredients = Array.isArray(item.selectedIngredients)
                    ? item.selectedIngredients.filter(i => availableIngredients.includes(i))
                    : [...availableIngredients];

                const availableExtras = Array.isArray(item.availableExtras) && item.availableExtras.length
                    ? item.availableExtras.map(extra => ({
                        name: extra.name,
                        price: Number(extra.price || 0)
                    }))
                    : extras;

                const validExtraNames = availableExtras.map(extra => extra.name);
                const selectedExtras = Array.isArray(item.selectedExtras)
                    ? item.selectedExtras.filter(extraName => validExtraNames.includes(extraName))
                    : [];

                const qty = Math.max(1, Number(item.qty || 1));
                for (let i = 0; i < qty; i++) {
                    migrated.push({
                        id: uid(),
                        name: item.name || 'Producto',
                        price: Number(item.price || 0),
                        image: item.image || 'img/hamburguesa.jpg',
                        availableIngredients: [...availableIngredients],
                        selectedIngredients: [...selectedIngredients],
                        availableExtras: availableExtras.map(extra => ({ ...extra })),
                        selectedExtras: [...selectedExtras]
                    });
                }
            });

            return migrated;
        } catch {
            return [];
        }
    }
}