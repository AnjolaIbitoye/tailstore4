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

  if (!hamburgerBtn || !mobileMenu || !closeBtn) return;

  hamburgerBtn.addEventListener('click', function () {
    mobileMenu.classList.toggle('is-open');
  });

  closeBtn.addEventListener('click', function () {
    mobileMenu.classList.remove('is-open');
  });

  document.addEventListener('click', function (e) {
    if (!mobileMenu.classList.contains('is-open')) return;
    const clickedInsideMenu = mobileMenu.contains(e.target);
    const clickedHamburger = hamburgerBtn.contains(e.target);
    if (!clickedInsideMenu && !clickedHamburger) {
      mobileMenu.classList.remove('is-open');
    }
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

/* mobile footer accordion */
document.addEventListener('DOMContentLoaded', function () {
  const footer = document.querySelector('.footer-sage');
  if (!footer) return;

  const mq = window.matchMedia('(max-width: 639px)');
  const topFooterRow = footer.querySelector('.container .flex.flex-wrap.-mx-4');
  if (!topFooterRow) return;

  const sections = Array.from(topFooterRow.children).map(function (col, index) {
    const heading = col.querySelector(':scope > h3');
    if (!heading) return null;

    const content = Array.from(col.children).find(function (child) {
      return child !== heading;
    });
    if (!content) return null;

    if (!content.id) content.id = 'footer-accordion-content-' + index;
    heading.setAttribute('aria-controls', content.id);

    return { col: col, heading: heading, content: content };
  }).filter(Boolean);

  if (!sections.length) return;

  function applyDesktopState() {
    sections.forEach(function (section) {
      section.col.classList.remove('footer-accordion-section', 'is-open');
      section.heading.classList.remove('footer-accordion-heading');
      section.heading.removeAttribute('role');
      section.heading.removeAttribute('tabindex');
      section.heading.removeAttribute('aria-expanded');
      section.content.classList.remove('footer-accordion-content');
      section.content.hidden = false;
    });
  }

  function setOpenSection(openIndex) {
    sections.forEach(function (section, index) {
      const isOpen = index === openIndex;
      section.col.classList.toggle('is-open', isOpen);
      section.heading.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      section.content.hidden = !isOpen;
    });
  }

  function applyMobileState() {
    sections.forEach(function (section) {
      section.col.classList.add('footer-accordion-section');
      section.heading.classList.add('footer-accordion-heading');
      section.heading.setAttribute('role', 'button');
      section.heading.setAttribute('tabindex', '0');
      section.content.classList.add('footer-accordion-content');
    });
    setOpenSection(0);
  }

  function syncState() {
    if (mq.matches) applyMobileState();
    else applyDesktopState();
  }

  sections.forEach(function (section, index) {
    section.heading.addEventListener('click', function () {
      if (!mq.matches) return;
      const isOpen = section.col.classList.contains('is-open');
      setOpenSection(isOpen ? -1 : index);
    });

    section.heading.addEventListener('keydown', function (e) {
      if (!mq.matches) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const isOpen = section.col.classList.contains('is-open');
      setOpenSection(isOpen ? -1 : index);
    });
  });

  syncState();
  mq.addEventListener('change', syncState);
});

/* FAQ page search/filter */
document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('faq-search-input');
  const clearBtn = document.getElementById('faq-clear-search');
  const emptyState = document.getElementById('faq-empty-state');
  const items = Array.from(document.querySelectorAll('[data-faq-item]'));
  if (!input || !clearBtn || !items.length) return;

  const groups = Array.from(document.querySelectorAll('.faq-page-group'));

  function applyFaqFilter() {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    items.forEach(function (item) {
      const text = item.textContent.toLowerCase();
      const show = query === '' || text.includes(query);
      item.classList.toggle('hidden', !show);
      if (show) visibleCount += 1;
    });

    groups.forEach(function (group) {
      const groupItems = Array.from(group.querySelectorAll('[data-faq-item]'));
      const hasVisibleItems = groupItems.some(function (item) {
        return !item.classList.contains('hidden');
      });
      group.classList.toggle('hidden', !hasVisibleItems);
    });

    if (emptyState) {
      emptyState.classList.toggle('hidden', visibleCount !== 0);
    }
  }

  input.addEventListener('input', applyFaqFilter);
  clearBtn.addEventListener('click', function () {
    input.value = '';
    applyFaqFilter();
    input.focus();
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
  if (!mainImage) return;
  mainImage.src = element.getAttribute('data-full');
}

const PRODUCT_CATALOG = [
  {
    slug: 'stretchy-briefs',
    name: 'Stretchy Briefs',
    code: 'HAILAFLO-001',
    category: 'Period Underwear',
    price: 19.99,
    comparePrice: 24.99,
    absorbency: ['Light', 'Regular', 'Heavy'],
    defaultAbsorbency: 'Regular',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Midnight Black', 'Blush', 'Sage'],
    defaultColor: 'Midnight Black',
    image: 'assets/images/products/1.jpg',
    gallery: ['assets/images/products/1.jpg', 'assets/images/single-product/1.jpg', 'assets/images/single-product/2.jpg', 'assets/images/single-product/3.jpg', 'assets/images/single-product/4.jpg'],
    shortDescription: 'Soft, stretchy comfort for everyday wear with reliable leak protection.',
    longTitle: 'Everyday comfort designed to move with your routine.',
    longDescription: 'Stretchy Briefs combine breathable fabric and absorbent layers for a smooth, secure fit from morning to night.',
    highlight1: 'A slim multi-layer core absorbs quickly while staying flexible under clothing.',
    highlight2: 'Soft edge seams reduce pressure and help prevent digging around the waist and legs.'
  },
  {
    slug: 'boxer-shorts',
    name: 'Boxer Shorts',
    code: 'HAILAFLO-002',
    category: 'Period Underwear',
    price: 27.99,
    absorbency: ['Regular', 'Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Heavy',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Midnight Black', 'Charcoal', 'Burgundy'],
    defaultColor: 'Charcoal',
    image: 'assets/images/products/2.jpg',
    gallery: ['assets/images/products/2.jpg', 'assets/images/single-product/2.jpg', 'assets/images/single-product/3.jpg', 'assets/images/single-product/4.jpg', 'assets/images/single-product/5.jpg'],
    shortDescription: 'Relaxed fit with reliable leak protection and wider coverage.',
    longTitle: 'Extended coverage for rest days and overnight confidence.',
    longDescription: 'Boxer Shorts provide fuller cut support and dependable absorbency for heavier-flow moments and longer wear windows.',
    highlight1: 'Longer leg design helps prevent shifting and supports secure movement.',
    highlight2: 'High-capacity gusset offers extended absorbency for all-day and overnight use.'
  },
  {
    slug: 'lace-briefs',
    name: 'Lace Briefs',
    code: 'HAILAFLO-003',
    category: 'Period Underwear',
    price: 22.99,
    comparePrice: 27.99,
    absorbency: ['Light', 'Regular'],
    defaultAbsorbency: 'Regular',
    sizes: ['XS', 'S', 'M', 'L'],
    defaultSize: 'S',
    colors: ['Rosewood', 'Midnight Black', 'Ivory'],
    defaultColor: 'Rosewood',
    image: 'assets/images/products/3.jpg',
    gallery: ['assets/images/products/3.jpg', 'assets/images/single-product/1.jpg', 'assets/images/single-product/3.jpg', 'assets/images/single-product/4.jpg', 'assets/images/single-product/5.jpg'],
    shortDescription: 'Delicate lace design with hidden absorbency for lighter to regular days.',
    longTitle: 'Elegant styling meets dependable daily protection.',
    longDescription: 'Lace Briefs pair a flattering silhouette with discreet absorbent technology so you can feel polished and protected.',
    highlight1: 'Breathable lace panels balance style with comfort throughout the day.',
    highlight2: 'Low-profile absorbent core stays invisible under fitted outfits.'
  },
  {
    slug: 'gym-leggings',
    name: 'Gym Leggings',
    code: 'HAILAFLO-004',
    category: 'HailaFlo Active',
    price: 34.99,
    absorbency: ['Regular', 'Heavy'],
    defaultAbsorbency: 'Heavy',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Onyx', 'Ocean Blue', 'Forest'],
    defaultColor: 'Onyx',
    image: 'assets/images/products/4.jpg',
    gallery: ['assets/images/products/4.jpg', 'assets/images/single-product/2.jpg', 'assets/images/single-product/3.jpg', 'assets/images/single-product/4.jpg', 'assets/images/single-product/5.jpg'],
    shortDescription: 'High-performance leggings built for movement and secure protection.',
    longTitle: 'Performance support engineered for active cycle days.',
    longDescription: 'Gym Leggings are built with stretch recovery and absorbent support, helping you train confidently through every session.',
    highlight1: 'Compression-inspired fit keeps fabric stable through high-motion workouts.',
    highlight2: 'Sweat-managing and absorbent layers work together for dry, focused training.'
  },
  {
    slug: 'gym-shorts',
    name: 'Gym Shorts',
    code: 'HAILAFLO-005',
    category: 'HailaFlo Active',
    price: 24.99,
    comparePrice: 29.99,
    absorbency: ['Regular', 'Heavy'],
    defaultAbsorbency: 'Regular',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Graphite', 'Berry', 'Sage'],
    defaultColor: 'Graphite',
    image: 'assets/images/products/5.jpg',
    gallery: ['assets/images/products/5.jpg', 'assets/images/single-product/1.jpg', 'assets/images/single-product/2.jpg', 'assets/images/single-product/4.jpg', 'assets/images/single-product/5.jpg'],
    shortDescription: 'Breathable shorts made for high-intensity workouts.',
    longTitle: 'Lightweight mobility for training, errands, and recovery.',
    longDescription: 'Gym Shorts are optimized for airflow and stretch, with core absorbency support for confidence during active hours.',
    highlight1: 'Quick-drying outer fabric keeps the short feeling light during movement.',
    highlight2: 'Supportive inner layer helps keep protection centered while you train.'
  },
  {
    slug: 'swimwear',
    name: 'Swimwear',
    code: 'HAILAFLO-006',
    category: 'HailaFlo Active',
    price: 44.99,
    absorbency: ['Regular', 'Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Super Heavy',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Midnight', 'Teal', 'Merlot'],
    defaultColor: 'Midnight',
    image: 'assets/images/products/6.jpg',
    gallery: ['assets/images/products/6.jpg', 'assets/images/single-product/2.jpg', 'assets/images/single-product/3.jpg', 'assets/images/single-product/4.jpg', 'assets/images/single-product/5.jpg'],
    shortDescription: 'Leak-proof swimwear for worry-free pool and beach days.',
    longTitle: 'Water-ready protection without compromising style.',
    longDescription: 'Swimwear combines secure fit construction with absorbent protection designed for confidence in and around water.',
    highlight1: 'Quick-rinse fabrics support clean transitions from water to dry wear.',
    highlight2: 'Streamlined silhouette offers active support with minimal bulk.'
  },
  {
    slug: 'period-activewear',
    name: 'Period Activewear',
    code: 'HAILAFLO-007',
    category: 'Other',
    price: 32.99,
    comparePrice: 39.99,
    absorbency: ['Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Super Heavy',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    colors: ['Carbon', 'Plum', 'Navy'],
    defaultColor: 'Carbon',
    image: 'assets/images/products/7.jpg',
    gallery: ['assets/images/products/7.jpg', 'assets/images/single-product/1.jpg', 'assets/images/single-product/2.jpg', 'assets/images/single-product/3.jpg', 'assets/images/single-product/4.jpg'],
    shortDescription: 'Versatile activewear designed for period days and busy routines.',
    longTitle: 'All-day support from commute to cooldown.',
    longDescription: 'Period Activewear bridges lifestyle and performance with reliable absorbency and stretch-first comfort.',
    highlight1: 'Adaptive fit contours to movement for all-day wear comfort.',
    highlight2: 'High-capacity absorbent core supports longer intervals between changes.'
  },
  {
    slug: 'postpartum-recovery-set',
    name: 'Postpartum Recovery Set',
    code: 'HAILAFLO-008',
    category: 'Postpartum',
    price: 36.99,
    absorbency: ['Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Super Heavy',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultSize: 'L',
    colors: ['Warm Gray', 'Soft Black', 'Mauve'],
    defaultColor: 'Warm Gray',
    image: 'assets/images/products/8.jpg',
    gallery: ['assets/images/products/8.jpg', 'assets/images/single-product/2.jpg', 'assets/images/single-product/3.jpg', 'assets/images/single-product/4.jpg', 'assets/images/single-product/5.jpg'],
    shortDescription: 'Gentle, high-coverage support for postpartum recovery weeks.',
    longTitle: 'Comfort-forward essentials for postpartum care.',
    longDescription: 'Postpartum Recovery Set provides soft structure, extended coverage, and absorbent peace of mind during early recovery.',
    highlight1: 'Soft-touch waistband and seams are designed to feel gentle on sensitive skin.',
    highlight2: 'High-coverage cut supports comfort throughout longer rest periods.'
  }
];

const PRODUCT_BY_SLUG = PRODUCT_CATALOG.reduce(function (map, item) {
  map[item.slug] = item;
  return map;
}, {});

/* dynamic single-product-page rendering */
document.addEventListener('DOMContentLoaded', function () {
  const productPageRoot = document.querySelector('[data-product-page]');
  if (!productPageRoot) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('product') || 'stretchy-briefs';
  const product = PRODUCT_BY_SLUG[slug] || PRODUCT_CATALOG[0];

  const titleEl = document.getElementById('sp-title');
  const codeEl = document.getElementById('sp-code');
  const priceEl = document.getElementById('sp-price');
  const compareEl = document.getElementById('sp-compare-price');
  const shortDescriptionEl = document.getElementById('sp-short-description');
  const longTitleEl = document.getElementById('sp-long-title');
  const longDescriptionEl = document.getElementById('sp-long-description');
  const mainImageEl = document.getElementById('main-image');
  const thumbsEl = document.getElementById('product-thumbnails');
  const absorbencyEl = document.getElementById('sp-absorbency');
  const sizeEl = document.getElementById('sp-size');
  const colorsEl = document.getElementById('sp-color-options');
  const relatedEl = document.getElementById('related-products-grid');
  const h1 = document.querySelector('h1');
  const highlightImage1 = document.getElementById('sp-highlight-image-1');
  const highlightImage2 = document.getElementById('sp-highlight-image-2');
  const highlightText1 = document.getElementById('sp-highlight-text-1');
  const highlightText2 = document.getElementById('sp-highlight-text-2');

  const money = function (v) { return '$' + Number(v).toFixed(2); };
  if (titleEl) titleEl.textContent = 'HailaFlo ' + product.name;
  if (h1 && h1 !== titleEl) h1.textContent = 'HailaFlo ' + product.name;
  if (codeEl) codeEl.textContent = ' ' + product.code;
  if (priceEl) priceEl.textContent = money(product.price);
  if (compareEl) {
    compareEl.textContent = product.comparePrice ? money(product.comparePrice) : '';
    compareEl.classList.toggle('hidden', !product.comparePrice);
  }
  if (shortDescriptionEl) shortDescriptionEl.textContent = product.shortDescription;
  if (longTitleEl) longTitleEl.textContent = product.longTitle;
  if (longDescriptionEl) longDescriptionEl.textContent = product.longDescription;
  if (highlightText1) highlightText1.textContent = product.highlight1;
  if (highlightText2) highlightText2.textContent = product.highlight2;

  if (mainImageEl) {
    mainImageEl.src = product.image;
    mainImageEl.alt = product.name;
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = product.gallery.map(function (img, idx) {
      return '<div><img onclick="changeImage(this)" data-full="' + img + '" src="' + img + '" class="object-cover object-center max-h-30 max-w-full rounded-lg cursor-pointer" alt="' + product.name + ' image ' + (idx + 1) + '"></div>';
    }).join('');
  }

  if (highlightImage1) highlightImage1.src = product.gallery[1] || product.image;
  if (highlightImage2) highlightImage2.src = product.gallery[2] || product.image;

  if (absorbencyEl) {
    absorbencyEl.innerHTML = product.absorbency.map(function (value) {
      const selected = value === product.defaultAbsorbency ? ' selected' : '';
      return '<option' + selected + '>' + value + '</option>';
    }).join('');
  }

  if (sizeEl) {
    sizeEl.innerHTML = product.sizes.map(function (value) {
      const selected = value === product.defaultSize ? ' selected' : '';
      return '<option' + selected + '>' + value + '</option>';
    }).join('');
  }

  if (colorsEl) {
    colorsEl.innerHTML = product.colors.map(function (value) {
      const active = value === product.defaultColor ? ' is-active' : '';
      return '<button type="button" class="product-color-chip' + active + '" data-color="' + value + '">' + value + '</button>';
    }).join('');

    colorsEl.addEventListener('click', function (e) {
      const chip = e.target.closest('.product-color-chip');
      if (!chip) return;
      colorsEl.querySelectorAll('.product-color-chip').forEach(function (btn) {
        btn.classList.remove('is-active');
      });
      chip.classList.add('is-active');
    });
  }

  const sizeChartBtn = document.getElementById('open-size-chart');
  const sizeTab = document.getElementById('size-shape-tab');
  if (sizeChartBtn && sizeTab) {
    sizeChartBtn.addEventListener('click', function () {
      sizeTab.click();
      document.getElementById('size-shape-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (relatedEl) {
    const related = PRODUCT_CATALOG.filter(function (item) { return item.slug !== product.slug; }).slice(0, 4);
    relatedEl.innerHTML = related.map(function (item) {
      return '<div class="w-full sm:w-1/2 lg:w-1/4 px-4 mb-8">' +
               '<div class="bg-white p-3 rounded-lg shadow-lg">' +
                 '<a href="single-product-page.html?product=' + item.slug + '"><img src="' + item.image + '" alt="' + item.name + '" class="w-full object-cover mb-4 rounded-lg"></a>' +
                 '<a href="single-product-page.html?product=' + item.slug + '" class="text-lg font-semibold mb-2 block">' + item.name + '</a>' +
                 '<p class="my-2">' + item.category + '</p>' +
                 '<div class="flex items-center mb-4">' +
                   '<span class="text-lg font-bold text-black">' + money(item.price) + '</span>' +
                   (item.comparePrice ? '<span class="text-sm line-through ml-2">' + money(item.comparePrice) + '</span>' : '') +
                 '</div>' +
                 '<button class="bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-4 rounded-none w-full">Add to Cart</button>' +
               '</div>' +
             '</div>';
    }).join('');
  }

  document.title = 'HailaFlo | ' + product.name;
});

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
      { name: 'HailaFlo Everyday Brief', price: 19.99, image: 'assets/images/single-product/1.jpg', qty: 1 },
      { name: 'HailaFlo Overnight Boxer', price: 24.99, image: 'assets/images/single-product/2.jpg', qty: 1 }
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
    renderCheckout();
    document.dispatchEvent(new CustomEvent('haila:rerender'));
  }

  function renderCheckout() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    const items = readCart();
    container.innerHTML = items.length
      ? items.map(function (i) {
          return '<div class="flex justify-between items-center text-sm">' +
                   '<span>' + escapeHtml(i.name) + ' <span class="text-gray-500">&times; ' + i.qty + '</span></span>' +
                   '<span class="font-semibold">' + money(i.price * i.qty) + '</span>' +
                 '</div>';
        }).join('')
      : '<p class="text-sm text-center">Your cart is empty.</p>';
    const sub = subtotal();
    const tax = sub * TAX_RATE;
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = money(v); };
    setText('checkout-subtotal', sub);
    setText('checkout-tax', tax);
    setText('checkout-shipping', 0);
    setText('checkout-total', sub + tax);
  }

  // Pull product details from the surrounding markup so no per-button data is needed.
  function extractProduct(btn) {
    const spInfo = btn.closest('.pb-8');
    if (spInfo && spInfo.querySelector('#quantity')) {
      const baseName = (spInfo.querySelector('h1')?.textContent || 'Item').trim();
      const absorbency = document.getElementById('sp-absorbency')?.value;
      const size = document.getElementById('sp-size')?.value;
      const color = document.querySelector('.product-color-chip.is-active')?.dataset.color;
      const selectedOptions = [absorbency, size, color].filter(Boolean).join(' / ');
      const name = selectedOptions ? baseName + ' (' + selectedOptions + ')' : baseName;
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

/* ------- Language switch (English / German) ------- */
document.addEventListener('DOMContentLoaded', function () {
  const LANG_KEY = 'haila_lang';

  const de = {
    // Announcement bar
    'Free Shipping on Orders Over $50': 'Kostenloser Versand ab 50 $',
    '30-Day Hassle-Free Returns': '30 Tage unkomplizierte Rückgabe',
    'Cruelty-Free & Sustainably Made': 'Tierversuchsfrei & nachhaltig hergestellt',
    // Nav / header
    'Shop': 'Shop',
    'Period Underwear': 'Periodenunterwäsche',
    'HailaFlo Active': 'HailaFlo Active',
    'Postpartum': 'Wochenbett',
    'Other': 'Sonstiges',
    'Register': 'Registrieren',
    'Login': 'Anmelden',
    'Registration': 'Registrierung',
    'Search for products...': 'Produkte suchen...',
    'items': 'Artikel',
    // Hero
    'Reusable period care': 'Wiederverwendbare Periodenpflege',
    'SHOP ALL': 'ALLES SHOPPEN',
    'Comfort, confidence, and leak protection for every cycle.': 'Komfort, Selbstvertrauen und Auslaufschutz für jeden Zyklus.',
    'Shop now': 'Jetzt shoppen',
    'Shop Now': 'Jetzt shoppen',
    'New Arrivals': 'Neuheiten',
    'Sale': 'Sale',
    // Category banners
    'Activewear': 'Sportkleidung',
    // Benefits section
    'Why HailaFlo': 'Warum HailaFlo',
    'Discover HailaFlo Benefits': 'Entdecke die HailaFlo-Vorteile',
    'Comfort, reusability, and leak protection for every cycle.': 'Komfort, Wiederverwendbarkeit und Auslaufschutz für jeden Zyklus.',
    // Popular products
    'Bestsellers': 'Bestseller',
    'Shop HailaFlo Products': 'HailaFlo-Produkte shoppen',
    'High-waist period brief': 'Perioden-Slip mit hohem Bund',
    'Seamless period brief': 'Nahtloser Perioden-Slip',
    'Overnight period boxer': 'Perioden-Boxer für die Nacht',
    'Period Underwear, Accessories': 'Periodenunterwäsche, Accessoires',
    'Add to Cart': 'In den Warenkorb',
    // Welcome banner
    'Welcome to HailaFlo': 'Willkommen bei HailaFlo',
    // Blog / care guide
    'Care Guide': 'Pflegeratgeber',
    'Discover HailaFlo Care Guide': 'Entdecke den HailaFlo-Pflegeratgeber',
    'Learn how to choose the right absorbency, fit, and care routine for period underwear.': 'Erfahre, wie du die richtige Saugstärke, Passform und Pflege für Periodenunterwäsche wählst.',
    'Fit Guide': 'Passform-Guide',
    'Choosing the Right Absorbency': 'Die richtige Saugstärke wählen',
    'Learn how to match absorbency, rise, and fabric to your cycle so you stay dry and comfortable.': 'Erfahre, wie du Saugstärke, Bundhöhe und Stoff auf deinen Zyklus abstimmst, damit du trocken und bequem bleibst.',
    'Care Tips': 'Pflegetipps',
    'How to Wash Period Underwear': 'Periodenunterwäsche richtig waschen',
    'Rinse cold, wash gently, and air dry to keep your HailaFlo pieces performing well longer.': 'Kalt ausspülen, sanft waschen und an der Luft trocknen, damit deine HailaFlo-Teile länger gut funktionieren.',
    'Cycle Confidence': 'Selbstsicher im Zyklus',
    'Real Stories from HailaFlo Wearers': 'Echte Geschichten von HailaFlo-Trägerinnen',
    'Read how HailaFlo helps customers feel secure, comfortable, and confident throughout the day.': 'Lies, wie HailaFlo Kundinnen hilft, sich den ganzen Tag sicher, bequem und selbstbewusst zu fühlen.',
    'Read more': 'Mehr lesen',
    // Newsletter
    'Enter your email address': 'E-Mail-Adresse eingeben',
    'Subscribe': 'Abonnieren',
    // Footer
    'Pages': 'Seiten',
    'Account': 'Konto',
    'Follow Us': 'Folge uns',
    'Contact Us': 'Kontakt',
    'Home': 'Startseite',
    'Checkout': 'Kasse',
    'Cart': 'Warenkorb',
    'Privacy Policy': 'Datenschutz',
    'Terms of Service': 'Nutzungsbedingungen',
    'FAQ': 'FAQ',
    // Shop page
    'Show Filters': 'Filter anzeigen',
    'Sort by Latest': 'Nach Neuheit sortieren',
    'Sort by Popularity': 'Nach Beliebtheit sortieren',
    'Sort by A-Z': 'Nach A-Z sortieren',
    'Collection': 'Kollektion',
    'Absorbency': 'Saugstärke',
    'Coverage': 'Abdeckung',
    'Fit': 'Passform',
    'Protection level': 'Schutzstufe',
    'Regular': 'Normal',
    'Heavy': 'Stark',
    'Super Heavy': 'Sehr stark',
    'Day': 'Tag',
    'Active': 'Aktiv',
    'Overnight': 'Nacht',
    'Brief': 'Slip',
    'High-waist': 'Hoher Bund',
    'Full coverage': 'Volle Abdeckung',
    'Light': 'Leicht',
    'Moderate': 'Mittel',
    'Max': 'Maximal',
    'Stretchy Briefs': 'Dehnbarer Slip',
    'Soft, stretchy comfort for everyday wear.': 'Weicher, dehnbarer Komfort für jeden Tag.',
    'Boxer Shorts': 'Boxershorts',
    'Relaxed fit with reliable leak protection.': 'Lockere Passform mit zuverlässigem Auslaufschutz.',
    'Lace Briefs': 'Spitzenslip',
    'Delicate lace design with hidden absorbency.': 'Zartes Spitzendesign mit verborgener Saugkraft.',
    'Gym Leggings': 'Sport-Leggings',
    'High-performance leggings built for movement.': 'Leistungsstarke Leggings für jede Bewegung.',
    'Gym Shorts': 'Sport-Shorts',
    'Breathable shorts made for high-intensity workouts.': 'Atmungsaktive Shorts für intensive Workouts.',
    'Swimwear': 'Bademode',
    'Leak-proof swimwear for worry-free days at the pool.': 'Auslaufsichere Bademode für sorgenfreie Tage am Pool.',
    'Period Activewear': 'Perioden-Sportkleidung',
    'Versatile activewear designed for period days.': 'Vielseitige Sportkleidung für die Periodentage.',
    'Postpartum Recovery Set': 'Wochenbett-Set',
    'Gentle, high-coverage support for the postpartum weeks.': 'Sanfter Halt mit hoher Abdeckung für die Wochen nach der Geburt.',
    'The HailaFlo Collection': 'Die HailaFlo-Kollektion',
    'Period underwear, activewear & more': 'Periodenunterwäsche, Sportkleidung & mehr',
    "HailaFlo's collection spans four families — Period Underwear (stretchy briefs, boxer shorts, and lace briefs), HailaFlo Active (gym leggings, gym shorts, and swimwear), Other (period activewear), and Postpartum recovery essentials.": 'Die HailaFlo-Kollektion umfasst vier Familien – Periodenunterwäsche (dehnbare Slips, Boxershorts und Spitzenslips), HailaFlo Active (Sport-Leggings, Sport-Shorts und Bademode), Sonstiges (Perioden-Sportkleidung) und Wochenbett-Essentials.',
    'Browse the collection and pick the style that matches your day — everyday comfort, a workout, or a swim.': 'Stöbere durch die Kollektion und wähle den Stil, der zu deinem Tag passt – Alltagskomfort, Workout oder Schwimmen.',
    // Cart page
    'Shopping Cart': 'Warenkorb',
    'Product': 'Produkt',
    'Price': 'Preis',
    'Quantity': 'Menge',
    'Total': 'Gesamt',
    'Coupon code': 'Gutscheincode',
    'Apply Coupon': 'Gutschein einlösen',
    'Empty Cart': 'Warenkorb leeren',
    'Update Cart': 'Warenkorb aktualisieren',
    'Summary': 'Zusammenfassung',
    'Subtotal': 'Zwischensumme',
    'Taxes': 'Steuern',
    'Shipping': 'Versand',
    'Proceed to checkout': 'Zur Kasse',
    'Remove': 'Entfernen',
    'Your cart is empty.': 'Dein Warenkorb ist leer.',
    'Continue shopping': 'Weiter einkaufen',
    // Checkout page
    'Billing Details': 'Rechnungsdaten',
    'Full Name': 'Vollständiger Name',
    'Email': 'E-Mail',
    'Address': 'Adresse',
    'City': 'Stadt',
    'State': 'Bundesland',
    'ZIP Code': 'Postleitzahl',
    'Phone Number': 'Telefonnummer',
    'Ship to a different address?': 'An eine andere Adresse liefern?',
    'Yes': 'Ja',
    'Order Summary': 'Bestellübersicht',
    'Proceed to Payment': 'Zur Zahlung'
  };

  const norm = s => s.trim().replace(/\s+/g, ' ');
  const currentLang = () => localStorage.getItem(LANG_KEY) || 'en';

  function translateNodes(lang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'OPTION' || tag === 'SELECT') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      if (node.__orig === undefined) node.__orig = node.nodeValue;
      const key = norm(node.__orig);
      node.nodeValue = (lang === 'de' && de[key]) ? de[key] : node.__orig;
    }
    document.querySelectorAll('[placeholder]').forEach(function (el) {
      if (el.__origPh === undefined) el.__origPh = el.getAttribute('placeholder');
      const key = norm(el.__origPh || '');
      el.setAttribute('placeholder', (lang === 'de' && de[key]) ? de[key] : el.__origPh);
    });
  }

  function updateToggles(lang) {
    document.querySelectorAll('.lang-select').forEach(function (sel) {
      sel.value = lang;
    });
  }

  function applyLang(lang) {
    translateNodes(lang);
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    updateToggles(lang);
  }

  function makeToggle() {
    const sel = document.createElement('select');
    sel.className = 'lang-select';
    sel.setAttribute('aria-label', 'Change language');
    sel.innerHTML = '<option value="en">EN</option><option value="de">DE</option>';
    sel.value = currentLang();
    sel.addEventListener('change', function () {
      applyLang(sel.value);
    });
    return sel;
  }

  const desktopActions = document.querySelector('.hidden.lg\\:flex.items-center');
  if (desktopActions) desktopActions.appendChild(makeToggle());
  const mobileActions = document.querySelector('.mobile-menu .flex.flex-col.mt-6');
  if (mobileActions) mobileActions.appendChild(makeToggle());

  // Re-apply the current language whenever the cart re-renders dynamic content.
  document.addEventListener('haila:rerender', function () {
    if (currentLang() === 'de') translateNodes('de');
  });

  applyLang(currentLang());
});