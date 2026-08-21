/* cart */
document.addEventListener('DOMContentLoaded', function () {
  const cartIcon = document.querySelector('.cart-wrapper');
  const cartDropdown = cartIcon.querySelector('.group-hover\\:block');

  cartIcon.addEventListener('mouseenter', function () {
      clearTimeout(cartIcon.__timer);
      cartDropdown.classList.remove('hidden');
  });

  cartIcon.addEventListener('mouseleave', function () {
      cartIcon.__timer = setTimeout(() => {
          cartDropdown.classList.add('hidden');
      }, 1300);
  });

  cartDropdown.addEventListener('mouseenter', function () {
      clearTimeout(cartIcon.__timer);
  });

  cartDropdown.addEventListener('mouseleave', function () {
      cartIcon.__timer = setTimeout(() => {
          cartDropdown.classList.add('hidden');
      }, 1300);
  });
});

/* mobile menu */
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById('hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  hamburgerBtn.addEventListener('click', function () {
    mobileMenu.classList.toggle('is-open');
  });

  closeBtn.addEventListener('click', function () {
    mobileMenu.classList.remove('is-open');
  });
});

/* shop collection + absorbency filter */
document.addEventListener('DOMContentLoaded', function () {
  const categoryPills = document.querySelectorAll('.collection-filter');
  const absorbencyPills = document.querySelectorAll('.absorbency-filter');
  const allPills = document.querySelectorAll('.filter-pill');
  const productCards = document.querySelectorAll('#products-grid > [data-category]');
  const activeFiltersContainer = document.getElementById('active-filters');
  const searchInputs = document.querySelectorAll('input[placeholder="Search for products..."]');
  let searchQuery = '';

  if ((!categoryPills.length && !absorbencyPills.length) || !productCards.length) return;

  function getActive(pills) {
    return Array.from(pills).filter(pill => pill.classList.contains('is-active'));
  }

  function applyFilter() {
    const activeCategories = getActive(categoryPills).map(pill => pill.dataset.value);
    const activeAbsorbencies = getActive(absorbencyPills).map(pill => pill.dataset.value);

    productCards.forEach(function (card) {
      const matchesCategory = activeCategories.length === 0 || activeCategories.includes(card.dataset.category);
      const matchesAbsorbency = activeAbsorbencies.length === 0 || activeAbsorbencies.includes(card.dataset.absorbency);
      const title = (card.querySelector('a')?.textContent || card.querySelector('img')?.alt || '').toLowerCase();
      const matchesSearch = searchQuery === '' || title.includes(searchQuery);
      card.classList.toggle('hidden', !(matchesCategory && matchesAbsorbency && matchesSearch));
    });
  }

  function renderActiveFilters() {
    if (!activeFiltersContainer) return;
    activeFiltersContainer.innerHTML = '';

    const activeFilters = [
      ...getActive(categoryPills).map(pill => ({ type: 'category', value: pill.dataset.value })),
      ...getActive(absorbencyPills).map(pill => ({ type: 'absorbency', value: pill.dataset.value }))
    ];

    activeFilters.forEach(function (filter) {
      const tag = document.createElement('span');
      tag.className = 'active-filter-tag inline-flex items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded-full';
      tag.textContent = filter.value + ' ';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'active-filter-remove';
      removeBtn.setAttribute('aria-label', 'Remove ' + filter.value + ' filter');
      removeBtn.dataset.type = filter.type;
      removeBtn.dataset.value = filter.value;
      removeBtn.textContent = '\u00D7';

      tag.appendChild(removeBtn);
      activeFiltersContainer.appendChild(tag);
    });
  }

  function handleFilterChange() {
    applyFilter();
    renderActiveFilters();
  }

  allPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pill.classList.toggle('is-active');
      if (pill.classList.contains('collection-filter') || pill.classList.contains('absorbency-filter')) {
        handleFilterChange();
      }
    });
  });

  if (activeFiltersContainer) {
    activeFiltersContainer.addEventListener('click', function (e) {
      const removeBtn = e.target.closest('.active-filter-remove');
      if (!removeBtn) return;

      const pills = removeBtn.dataset.type === 'category' ? categoryPills : absorbencyPills;
      const matchingPill = Array.from(pills).find(pill => pill.dataset.value === removeBtn.dataset.value);

      if (matchingPill) {
        matchingPill.classList.remove('is-active');
        handleFilterChange();
      }
    });
  }

  // Live product search from the header/mobile search fields
  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      searchQuery = input.value.trim().toLowerCase();
      searchInputs.forEach(function (other) { if (other !== input) other.value = input.value; });
      applyFilter();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFilter();
      }
    });
  });

  // Pre-select a category filter when arriving via a nav link like shop.html?category=Postpartum
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get('category');
  if (requestedCategory) {
    const matchingCategoryPill = Array.from(categoryPills).find(pill => pill.dataset.value === requestedCategory);
    if (matchingCategoryPill) {
      matchingCategoryPill.classList.add('is-active');
      handleFilterChange();
    }
  }

  // Apply a search term passed from another page, e.g. shop.html?search=leggings
  const requestedSearch = params.get('search');
  if (requestedSearch) {
    searchQuery = requestedSearch.trim().toLowerCase();
    searchInputs.forEach(function (input) { input.value = requestedSearch; });
    const searchField = document.getElementById('search-field');
    if (searchField) {
      searchField.classList.remove('hidden');
      searchField.classList.add('search-slide-down');
    }
    applyFilter();
  }
});

/* premium scroll-reveal for product cards */
document.addEventListener('DOMContentLoaded', function () {
  const revealCards = document.querySelectorAll('.scroll-reveal');
  if (!revealCards.length) return;

  if (!('IntersectionObserver' in window)) {
    revealCards.forEach(function (card) {
      card.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const card = entry.target;
        const indexInRow = Array.prototype.indexOf.call(revealCards, card) % 3;
        card.style.transitionDelay = (indexInRow * 0.12) + 's';
        card.classList.add('is-visible');
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealCards.forEach(function (card) {
    observer.observe(card);
  });
});

/* swiper slider */
if (typeof Swiper !== 'undefined') {
  var swiper = new Swiper('.swiper', {
    slidesPerView: 2,
    loop: true,
    autoplay: {
        delay: 3000,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        1024: {
            slidesPerView: 6,
        },
    },
  });

  var swiper = new Swiper('.main-slider', {
    slidesPerView: 1,
    loop: true,
    autoplay: {
      delay: 5000,
  },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
}

/* search icon show/hide */
document.getElementById('search-icon').addEventListener('click', function() {
  var searchField = document.getElementById('search-field');
  if (searchField.classList.contains('hidden')) {
      searchField.classList.remove('hidden');
      searchField.classList.add('search-slide-down');
      var input = searchField.querySelector('input');
      if (input) input.focus();
  } else {
      searchField.classList.add('hidden');
      searchField.classList.remove('search-slide-down');
  }
});

/* search submit on pages without a product grid -> go to shop with the query */
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('products-grid')) return;
  const searchInputs = document.querySelectorAll('input[placeholder="Search for products..."]');
  searchInputs.forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const query = input.value.trim();
      if (query) window.location.href = 'shop.html?search=' + encodeURIComponent(query);
    });
  });
});

function toggleDropdown(id, show) {
  const dropdown = document.getElementById(id);
  if (show) {
      dropdown.classList.remove('hidden');
  } else {
      dropdown.classList.add('hidden');
  }
}

function changeImage(element) {
  var mainImage = document.getElementById('main-image');
  mainImage.src = element.getAttribute('data-full');
}

/* single page product count */
document.addEventListener('DOMContentLoaded', function () {
    const decreaseButton = document.getElementById('decrease');
    const increaseButton = document.getElementById('increase');
    const quantityInput = document.getElementById('quantity');
  
    if (decreaseButton && increaseButton && quantityInput) {
        decreaseButton.addEventListener('click', function () {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantity -= 1;
                quantityInput.value = quantity;
            }
            updateButtons();
        });
  
        increaseButton.addEventListener('click', function () {
            let quantity = parseInt(quantityInput.value);
            quantity += 1;
            quantityInput.value = quantity;
            updateButtons();
        });
  
        function updateButtons() {
            if (parseInt(quantityInput.value) === 1) {
                decreaseButton.setAttribute('disabled', true);
            } else {
                decreaseButton.removeAttribute('disabled');
            }
        }
    }
  });

/* single product tabs */
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    if (tabs.length > 0 && contents.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                contents.forEach(c => c.classList.add('hidden'));

                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                document.querySelector(`#${this.id.replace('-tab', '-content')}`).classList.remove('hidden');
            });
        });

        tabs[0].click();
    }
});


/* shop page filter show/hide */
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('products-toggle-filters');
    const filters = document.getElementById('filters');

    if (toggleButton && filters) {
        toggleButton.addEventListener('click', function() {
            if (filters.classList.contains('hidden')) {
                filters.classList.remove('hidden');
                this.textContent = 'Hide Filters';
            } else {
                filters.classList.add('hidden');
                this.textContent = 'Show Filters';
            }
        });
    }
});

/* shop page filter*/
document.addEventListener('DOMContentLoaded', function () {
    const selectElement = document.querySelector('select');
    const arrowDown = document.getElementById('arrow-down');
    const arrowUp = document.getElementById('arrow-up');

    if (selectElement && arrowDown && arrowUp) {
        selectElement.addEventListener('click', function () {
            arrowDown.classList.toggle('hidden');
            arrowUp.classList.toggle('hidden');
        });
    }
});

/* ------- Shopping cart (persisted in localStorage) ------- */
document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'haila_cart';
  const TAX_RATE = 0.10;

  const money = v => '$' + (v || 0).toFixed(2);
  const readCart = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; } };
  const writeCart = items => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Seed a sample cart on the first ever visit so the UI isn't empty by default.
  if (localStorage.getItem(STORAGE_KEY) === null) {
    writeCart([
      { name: 'Haila Everyday Brief', price: 19.99, image: 'assets/images/single-product/1.jpg', qty: 1 },
      { name: 'Haila Overnight Boxer', price: 24.99, image: 'assets/images/single-product/2.jpg', qty: 1 }
    ]);
  }

  const totalCount = () => readCart().reduce((s, i) => s + i.qty, 0);
  const subtotal = () => readCart().reduce((s, i) => s + i.price * i.qty, 0);

  function addItem(product) {
    const items = readCart();
    const existing = items.find(i => i.name === product.name);
    if (existing) existing.qty += product.qty || 1;
    else items.push({ name: product.name, price: product.price, image: product.image, qty: product.qty || 1 });
    writeCart(items);
    renderAll();
  }
  function setQty(name, qty) {
    let items = readCart();
    const it = items.find(i => i.name === name);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) items = items.filter(i => i.name !== name);
    writeCart(items);
    renderAll();
  }
  function removeItem(name) {
    writeCart(readCart().filter(i => i.name !== name));
    renderAll();
  }

  function renderDropdown() {
    document.querySelectorAll('.cart-wrapper').forEach(function (wrapper) {
      const container = wrapper.querySelector('.space-y-4');
      if (!container) return;
      const items = readCart();
      if (!items.length) {
        container.innerHTML = '<p class="text-sm py-4 text-center">Your cart is empty.</p>';
        return;
      }
      container.innerHTML = items.map(function (i) {
        return '<div class="flex items-center justify-between pb-4 border-b border-gray-line">' +
                 '<div class="flex items-center">' +
                   '<img src="' + escapeHtml(i.image) + '" alt="' + escapeHtml(i.name) + '" class="h-12 w-12 object-cover rounded mr-2">' +
                   '<div><p class="font-semibold">' + escapeHtml(i.name) + '</p><p class="text-sm">Quantity: ' + i.qty + '</p></div>' +
                 '</div>' +
                 '<p class="font-semibold">' + money(i.price * i.qty) + '</p>' +
               '</div>';
      }).join('');
    });
  }

  function renderCount() {
    const c = totalCount();
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = c; });
    document.querySelectorAll('.cart-wrapper > a').forEach(function (link) {
      let badge = link.querySelector('.cart-count-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-count-badge';
        link.appendChild(badge);
      }
      badge.textContent = c;
      badge.style.display = c > 0 ? 'flex' : 'none';
    });
  }

  function renderCartPage() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    const items = readCart();
    if (!items.length) {
      cartItems.innerHTML = '<tr><td colspan="4" class="py-10 text-center">Your cart is empty. <a href="shop.html" class="text-primary underline">Continue shopping</a></td></tr>';
    } else {
      cartItems.innerHTML = items.map(function (i, idx) {
        return '<tr class="cart-row pb-4 border-b border-gray-line" data-index="' + idx + '">' +
          '<td class="px-1 py-4"><div class="flex items-center flex-col sm:flex-row text-center sm:text-left">' +
            '<img class="h-16 w-16 md:h-24 md:w-24 sm:mr-8 mb-4 sm:mb-0" src="' + escapeHtml(i.image) + '" alt="' + escapeHtml(i.name) + '">' +
            '<div><p class="text-sm md:text-base md:font-semibold">' + escapeHtml(i.name) + '</p>' +
            '<button type="button" class="cart-remove text-xs text-primary underline mt-1">Remove</button></div>' +
          '</div></td>' +
          '<td class="cart-unit-price px-1 py-4 text-center">' + money(i.price) + '</td>' +
          '<td class="px-1 py-4 text-center"><div class="flex items-center justify-center">' +
            '<button class="cart-decrement border border-primary bg-primary text-white hover:bg-transparent hover:text-primary rounded-none w-10 h-10 flex items-center justify-center">-</button>' +
            '<p class="quantity text-center w-8">' + i.qty + '</p>' +
            '<button class="cart-increment border border-primary bg-primary text-white hover:bg-transparent hover:text-primary rounded-none w-10 h-10 flex items-center justify-center">+</button>' +
          '</div></td>' +
          '<td class="cart-row-total px-1 py-4 text-right">' + money(i.price * i.qty) + '</td>' +
        '</tr>';
      }).join('');
    }
    const sub = subtotal();
    const tax = sub * TAX_RATE;
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = money(v); };
    setText('cart-subtotal', sub);
    setText('cart-tax', tax);
    setText('cart-shipping', 0);
    setText('cart-total', sub + tax);
  }

  function renderAll() {
    renderDropdown();
    renderCount();
    renderCartPage();
  }

  // Pull product details from the surrounding markup so no per-button data is needed.
  function extractProduct(btn) {
    const spInfo = btn.closest('.pb-8');
    if (spInfo && spInfo.querySelector('#quantity')) {
      const name = (spInfo.querySelector('h1')?.textContent || 'Item').trim();
      const price = parseFloat((spInfo.querySelector('.text-2xl')?.textContent || '').replace(/[^0-9.]/g, '')) || 0;
      const qty = parseInt(document.getElementById('quantity')?.value, 10) || 1;
      const image = document.getElementById('main-image')?.getAttribute('src') || '';
      return { name, price, image, qty };
    }
    const card = btn.closest('.scroll-reveal') || btn.closest('.bg-white') || btn.closest('[data-category]');
    if (!card) return null;
    const name = (card.querySelector('a[href]')?.textContent || card.querySelector('img')?.alt || 'Item').trim();
    const price = parseFloat((card.querySelector('.font-bold')?.textContent || '').replace(/[^0-9.]/g, '')) || 0;
    const image = card.querySelector('img')?.getAttribute('src') || '';
    return { name, price, image, qty: 1 };
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.textContent.replace(/\s+/g, ' ').trim().toLowerCase() !== 'add to cart') return;
    e.preventDefault();
    const product = extractProduct(btn);
    if (product && product.name) {
      addItem(product);
      document.querySelectorAll('.cart-count-badge').forEach(function (b) {
        b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
      });
    }
  });

  // Cart page interactions
  const cartItems = document.getElementById('cart-items');
  if (cartItems) {
    cartItems.addEventListener('click', function (e) {
      const row = e.target.closest('.cart-row');
      if (!row) return;
      const item = readCart()[parseInt(row.dataset.index, 10)];
      if (!item) return;
      if (e.target.closest('.cart-increment')) setQty(item.name, item.qty + 1);
      else if (e.target.closest('.cart-decrement')) setQty(item.name, item.qty - 1);
      else if (e.target.closest('.cart-remove')) removeItem(item.name);
    });
    const emptyBtn = document.getElementById('cart-empty');
    if (emptyBtn) emptyBtn.addEventListener('click', function () { writeCart([]); renderAll(); });
    const updateBtn = document.getElementById('cart-update');
    if (updateBtn) updateBtn.addEventListener('click', function (e) { e.preventDefault(); renderAll(); });
  }

  renderAll();
});