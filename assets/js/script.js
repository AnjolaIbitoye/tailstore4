/* mobile menu */
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById('hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!hamburgerBtn || !mobileMenu || !closeBtn) return;

  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    document.body.classList.add('mobile-menu-open');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('mobile-menu-open');
  }

  hamburgerBtn.addEventListener('click', function () {
    if (mobileMenu.classList.contains('is-open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  closeBtn.addEventListener('click', closeMobileMenu);

  document.addEventListener('click', function (e) {
    if (!mobileMenu.classList.contains('is-open')) return;
    const clickedInsideMenu = mobileMenu.contains(e.target);
    const clickedHamburger = hamburgerBtn.contains(e.target);
    if (!clickedInsideMenu && !clickedHamburger) {
      closeMobileMenu();
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
  const productGrid = document.getElementById('products-grid');
  const sortSelect = document.getElementById('product-sort');
  const featuredOrder = new Map(Array.from(productCards).map(function (card, index) { return [card, index]; }));
  const absorbencyRank = { Regular: 1, Heavy: 2, 'Super Heavy': 3 };
  let searchQuery = '';

  if ((!categoryPills.length && !absorbencyPills.length) || !productCards.length) return;

  function getActive(pills) {
    return Array.from(pills).filter(pill => pill.classList.contains('is-active'));
  }

  function sortProducts(sortValue) {
    if (!productGrid) return;

    const cards = Array.from(productCards);
    cards.sort(function (leftCard, rightCard) {
      const featuredDifference = featuredOrder.get(leftCard) - featuredOrder.get(rightCard);

      if (sortValue === 'name-asc' || sortValue === 'name-desc') {
        const leftName = leftCard.querySelector('img')?.alt || '';
        const rightName = rightCard.querySelector('img')?.alt || '';
        const nameDifference = leftName.localeCompare(rightName, undefined, { sensitivity: 'base' });
        return sortValue === 'name-desc' ? -nameDifference : nameDifference;
      }

      if (sortValue === 'absorbency-asc' || sortValue === 'absorbency-desc') {
        const rankDifference = absorbencyRank[leftCard.dataset.absorbency] - absorbencyRank[rightCard.dataset.absorbency];
        if (rankDifference !== 0) {
          return sortValue === 'absorbency-desc' ? -rankDifference : rankDifference;
        }
      }

      return featuredDifference;
    });

    const fragment = document.createDocumentFragment();
    cards.forEach(function (card) { fragment.appendChild(card); });
    productGrid.appendChild(fragment);
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

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortProducts(sortSelect.value);
    });
  }
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

/* Help / contact form - opens the user's email app via a mailto: link, no backend needed */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('help-form');
  const success = document.getElementById('help-form-success');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.querySelector('#help-name').value;
    const email = form.querySelector('#help-email').value;
    const phone = form.querySelector('#help-phone').value;
    const message = form.querySelector('#help-message').value;

    const subject = 'Website contact from ' + name;
    const body = 'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + phone + '\n\n' +
      message;

    const mailto = 'mailto:info@hailaflo.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = mailto;

    if (success) success.classList.remove('hidden');
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Stretchy%20Briefs', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'Period Underwear',
    price: 19.99,
    comparePrice: 24.99,
    absorbency: ['Light', 'Regular', 'Heavy'],
    defaultAbsorbency: 'Regular',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Boxer%20Shorts', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'Period Underwear',
    price: 27.99,
    absorbency: ['Regular', 'Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Heavy',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Lace%20Briefs', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'Period Underwear',
    price: 22.99,
    comparePrice: 27.99,
    absorbency: ['Light', 'Regular'],
    defaultAbsorbency: 'Regular',
    sizes: ['XS', 'S', 'M', 'L'],
    defaultSize: 'S',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Gym%20Leggings', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'HailaFlo Active',
    price: 34.99,
    absorbency: ['Regular', 'Heavy'],
    defaultAbsorbency: 'Heavy',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Gym%20Shorts', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'HailaFlo Active',
    price: 24.99,
    comparePrice: 29.99,
    absorbency: ['Regular', 'Heavy'],
    defaultAbsorbency: 'Regular',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Swimwear', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'HailaFlo Active',
    price: 44.99,
    absorbency: ['Regular', 'Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Super Heavy',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Period%20Activewear', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'Other',
    price: 32.99,
    comparePrice: 39.99,
    absorbency: ['Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Super Heavy',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'L',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Postpartum%20Recovery%20Set', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/shop', // TODO: replace with the real TikTok Shop listing URL
    category: 'Postpartum',
    price: 36.99,
    absorbency: ['Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Super Heavy',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    defaultSize: 'L',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
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
  const buyAmazonEl = document.getElementById('sp-buy-amazon');
  const buyTiktokEl = document.getElementById('sp-buy-tiktok');
  const highlightText1 = document.getElementById('sp-highlight-text-1');
  const highlightText2 = document.getElementById('sp-highlight-text-2');

  if (titleEl) titleEl.textContent = 'HailaFlo ' + product.name;
  if (h1 && h1 !== titleEl) h1.textContent = 'HailaFlo ' + product.name;
  if (codeEl) codeEl.textContent = ' ' + product.code;
  if (shortDescriptionEl) shortDescriptionEl.textContent = product.shortDescription;
  if (longTitleEl) longTitleEl.textContent = product.longTitle;
  if (longDescriptionEl) longDescriptionEl.textContent = product.longDescription;
  if (highlightText1) highlightText1.textContent = product.highlight1;
  if (highlightText2) highlightText2.textContent = product.highlight2;

  if (mainImageEl) {
    mainImageEl.src = product.image;
    mainImageEl.alt = product.name;
  }

  if (buyAmazonEl) buyAmazonEl.href = product.amazonUrl || '#';
  if (buyTiktokEl) buyTiktokEl.href = product.tiktokUrl || '#';

  if (thumbsEl) {
    thumbsEl.innerHTML = product.gallery.map(function (img, idx) {
      return '<div><img onclick="changeImage(this)" data-full="' + img + '" src="' + img + '" class="object-cover object-center max-h-30 max-w-full rounded-lg cursor-pointer" alt="' + product.name + ' image ' + (idx + 1) + '"></div>';
    }).join('');
  }

  if (highlightImage1) highlightImage1.src = product.gallery[1] || product.image;
  if (highlightImage2) highlightImage2.src = product.gallery[2] || product.image;

  if (absorbencyEl) {
    absorbencyEl.innerHTML = product.absorbency.map(function (value) {
      return '<span class="product-option-value">' + value + '</span>';
    }).join('');
  }

  if (sizeEl) {
    sizeEl.innerHTML = product.sizes.map(function (value) {
      return '<span class="product-option-value">' + value + '</span>';
    }).join('');
  }

  if (colorsEl) {
    const COLOR_HEX = { 'Black': '#1a1a1a', 'Grey': '#9ca3af', 'Gray': '#9ca3af' };
    colorsEl.innerHTML = product.colors.map(function (value) {
      const hex = COLOR_HEX[value] || '#cccccc';
      return '<span class="product-option-value product-option-value--color"><span class="product-option-swatch" style="background-color:' + hex + '"></span>' + value + '</span>';
    }).join('');
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
      return '<div class="w-[72%] shrink-0 snap-start px-2 mb-8 sm:w-1/2 sm:shrink sm:px-4 lg:w-1/4">' +
               '<a href="single-product-page.html?product=' + item.slug + '" class="bg-white p-3 block rounded-none overflow-hidden hover-lift hover-zoom">' +
                 '<img src="' + item.image + '" alt="' + item.name + '" class="w-full object-cover mb-4 rounded-none">' +
                 '<p class="text-lg font-semibold mb-2 block">' + item.name + '</p>' +
                 '<p class="my-2">' + item.category + '</p>' +
                 '<p class="product-marketplace-cue"><i class="fa-solid fa-store" aria-hidden="true"></i> Marketplace options</p>' +
               '</a>' +
             '</div>';
    }).join('');
  }

  document.title = 'HailaFlo | ' + product.name;
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

/* ------- Language switch (English / German) ------- */
document.addEventListener('DOMContentLoaded', function () {
  const LANG_KEY = 'haila_lang';

  const de = {
    // Announcement bar

    'Cruelty-Free & Sustainably Made': 'Tierversuchsfrei & nachhaltig hergestellt',
    // Nav / header
    'Shop': 'Shop',
    'Period Underwear': 'Periodenunterwäsche',
    'HailaFlo Active': 'HailaFlo Active',
    'Postpartum': 'Wochenbett',
    'Other': 'Sonstiges',
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
    'Follow Us': 'Folge uns',
    'Contact Us': 'Kontakt',
    'Home': 'Startseite',
    'Privacy Policy': 'Datenschutz',
    'Terms of Service': 'Nutzungsbedingungen',
    'FAQ': 'FAQ',
    // Shop page
    'Show Filters': 'Filter anzeigen',
    'Featured': 'Empfohlen',
    'Name: A to Z': 'Name: A bis Z',
    'Name: Z to A': 'Name: Z bis A',
    'Absorbency: Low to High': 'Saugstärke: niedrig bis hoch',
    'Absorbency: High to Low': 'Saugstärke: hoch bis niedrig',
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
    'Browse here, purchase on your preferred marketplace.': 'Hier entdecken und auf deinem bevorzugten Marktplatz kaufen.',
    'Current prices, checkout, delivery, and order support are provided by Amazon or TikTok Shop.': 'Aktuelle Preise, Bezahlung, Lieferung und Bestellservice werden von Amazon oder TikTok Shop bereitgestellt.',
    'View marketplace options': 'Marktplatzoptionen ansehen',
    'Marketplace options': 'Marktplatzoptionen',
    'Choose a marketplace below to view current pricing, availability, and delivery options.': 'Wähle unten einen Marktplatz, um aktuelle Preise, Verfügbarkeit und Lieferoptionen zu sehen.',
    'Available sizes': 'Verfügbare Größen',
    'Available colors': 'Verfügbare Farben',
    'Available from': 'Erhältlich bei',
    'Where to buy': 'Wo erhältlich',
    'Choose a product to continue securely on Amazon or TikTok Shop.': 'Wähle ein Produkt, um sicher bei Amazon oder TikTok Shop fortzufahren.',
    'Browse products': 'Produkte ansehen',
    'Official shopping options': 'Offizielle Einkaufsmöglichkeiten',
    'Continue with your preferred marketplace': 'Auf deinem bevorzugten Marktplatz fortfahren',
    'View current pricing, delivery, and order support directly from the marketplace.': 'Aktuelle Preise, Lieferung und Bestellservice findest du direkt beim Marktplatz.',
    'Shop HailaFlo on Amazon': 'HailaFlo bei Amazon kaufen',
    'Shop HailaFlo on TikTok': 'HailaFlo bei TikTok kaufen',
  };

  const fr = {
    // Announcement bar
    'Cruelty-Free & Sustainably Made': 'Sans cruauté et fabriqué durablement',
    // Nav / header
    'Shop': 'Boutique',
    'Period Underwear': 'Culottes menstruelles',
    'HailaFlo Active': 'HailaFlo Active',
    'Postpartum': 'Post-partum',
    'Other': 'Autre',
    'Search for products...': 'Rechercher des produits...',
    'items': 'articles',
    // Hero
    'Reusable period care': 'Protection périodique réutilisable',
    'SHOP ALL': 'TOUT VOIR',
    'Comfort, confidence, and leak protection for every cycle.': 'Confort, confiance et protection contre les fuites à chaque cycle.',
    'Shop now': 'Achetez maintenant',
    'Shop Now': 'Achetez maintenant',
    'New Arrivals': 'Nouveautés',
    'Sale': 'Soldes',
    // Category banners
    'Activewear': 'Vêtements de sport',
    // Benefits section
    'Why HailaFlo': 'Pourquoi HailaFlo',
    'Discover HailaFlo Benefits': 'Découvrez les avantages HailaFlo',
    'Comfort, reusability, and leak protection for every cycle.': 'Confort, réutilisabilité et protection contre les fuites à chaque cycle.',
    // Popular products
    'Bestsellers': 'Meilleures ventes',
    'Shop HailaFlo Products': 'Achetez les produits HailaFlo',
    'High-waist period brief': 'Culotte menstruelle taille haute',
    'Seamless period brief': 'Culotte menstruelle sans couture',
    'Overnight period boxer': 'Boxer menstruel de nuit',
    'Period Underwear, Accessories': 'Culottes menstruelles, accessoires',
    // Welcome banner
    'Welcome to HailaFlo': 'Bienvenue chez HailaFlo',
    // Blog / care guide
    'Care Guide': "Guide d'entretien",
    'Discover HailaFlo Care Guide': "Découvrez le guide d'entretien HailaFlo",
    'Learn how to choose the right absorbency, fit, and care routine for period underwear.': "Apprenez à choisir la bonne absorption, la coupe et l'entretien adaptés à vos culottes menstruelles.",
    'Fit Guide': 'Guide des tailles',
    'Choosing the Right Absorbency': 'Choisir la bonne absorption',
    'Learn how to match absorbency, rise, and fabric to your cycle so you stay dry and comfortable.': "Apprenez à adapter l'absorption, la hauteur de taille et le tissu à votre cycle pour rester au sec et à l'aise.",
    'Care Tips': "Conseils d'entretien",
    'How to Wash Period Underwear': 'Comment laver les culottes menstruelles',
    'Rinse cold, wash gently, and air dry to keep your HailaFlo pieces performing well longer.': "Rincez à l'eau froide, lavez délicatement et laissez sécher à l'air libre pour préserver vos articles HailaFlo plus longtemps.",
    'Cycle Confidence': 'Confiance à chaque cycle',
    'Real Stories from HailaFlo Wearers': 'Témoignages de nos clientes HailaFlo',
    'Read how HailaFlo helps customers feel secure, comfortable, and confident throughout the day.': "Découvrez comment HailaFlo aide nos clientes à se sentir en sécurité, à l'aise et confiantes tout au long de la journée.",
    'Read more': 'Lire la suite',
    // Newsletter
    'Enter your email address': 'Entrez votre adresse e-mail',
    'Subscribe': "S'abonner",
    // Footer
    'Pages': 'Pages',
    'Follow Us': 'Suivez-nous',
    'Contact Us': 'Contactez-nous',
    'Home': 'Accueil',
    'Privacy Policy': 'Politique de confidentialité',
    'Terms of Service': "Conditions d'utilisation",
    'FAQ': 'FAQ',
    // Shop page
    'Show Filters': 'Afficher les filtres',
    'Featured': 'Sélection',
    'Name: A to Z': 'Nom : A à Z',
    'Name: Z to A': 'Nom : Z à A',
    'Absorbency: Low to High': 'Absorption : faible à élevée',
    'Absorbency: High to Low': 'Absorption : élevée à faible',
    'Collection': 'Collection',
    'Absorbency': 'Absorption',
    'Coverage': 'Couverture',
    'Fit': 'Coupe',
    'Protection level': 'Niveau de protection',
    'Regular': 'Normal',
    'Heavy': 'Abondant',
    'Super Heavy': 'Très abondant',
    'Day': 'Jour',
    'Active': 'Actif',
    'Overnight': 'Nuit',
    'Brief': 'Culotte',
    'High-waist': 'Taille haute',
    'Full coverage': 'Couverture intégrale',
    'Light': 'Léger',
    'Moderate': 'Modéré',
    'Max': 'Maximum',
    'Stretchy Briefs': 'Culotte extensible',
    'Soft, stretchy comfort for everyday wear.': 'Confort doux et extensible pour un usage quotidien.',
    'Boxer Shorts': 'Boxer',
    'Relaxed fit with reliable leak protection.': 'Coupe décontractée avec une protection fiable contre les fuites.',
    'Lace Briefs': 'Culotte en dentelle',
    'Delicate lace design with hidden absorbency.': 'Dentelle délicate avec absorption invisible.',
    'Gym Leggings': 'Leggings de sport',
    'High-performance leggings built for movement.': 'Leggings haute performance conçus pour le mouvement.',
    'Gym Shorts': 'Short de sport',
    'Breathable shorts made for high-intensity workouts.': 'Short respirant conçu pour les entraînements intenses.',
    'Swimwear': 'Maillot de bain',
    'Leak-proof swimwear for worry-free days at the pool.': 'Maillot de bain anti-fuites pour des journées sereines à la piscine.',
    'Period Activewear': 'Vêtements de sport menstruels',
    'Versatile activewear designed for period days.': 'Vêtements de sport polyvalents conçus pour les jours de règles.',
    'Postpartum Recovery Set': 'Ensemble de récupération post-partum',
    'Gentle, high-coverage support for the postpartum weeks.': 'Soutien doux et couvrant pour les semaines post-partum.',
    'The HailaFlo Collection': 'La collection HailaFlo',
    'Period underwear, activewear & more': 'Culottes menstruelles, vêtements de sport et plus',
    "HailaFlo's collection spans four families — Period Underwear (stretchy briefs, boxer shorts, and lace briefs), HailaFlo Active (gym leggings, gym shorts, and swimwear), Other (period activewear), and Postpartum recovery essentials.": "La collection HailaFlo comprend quatre familles — Culottes menstruelles (culottes extensibles, boxers et culottes en dentelle), HailaFlo Active (leggings, shorts de sport et maillots de bain), Autre (vêtements de sport menstruels) et les essentiels de récupération post-partum.",
    'Browse the collection and pick the style that matches your day — everyday comfort, a workout, or a swim.': "Parcourez la collection et choisissez le style qui correspond à votre journée — confort au quotidien, entraînement ou baignade.",
    'Browse here, purchase on your preferred marketplace.': 'Découvrez ici, puis achetez sur la marketplace de votre choix.',
    'Current prices, checkout, delivery, and order support are provided by Amazon or TikTok Shop.': 'Les prix actuels, le paiement, la livraison et le suivi de commande sont fournis par Amazon ou TikTok Shop.',
    'View marketplace options': 'Voir les options marketplace',
    'Marketplace options': 'Options marketplace',
    'Choose a marketplace below to view current pricing, availability, and delivery options.': 'Choisissez une marketplace ci-dessous pour voir les prix, la disponibilité et les options de livraison.',
    'Available sizes': 'Tailles disponibles',
    'Available colors': 'Couleurs disponibles',
    'Available from': 'Disponible chez',
    'Where to buy': 'Où acheter',
    'Choose a product to continue securely on Amazon or TikTok Shop.': 'Choisissez un produit pour continuer en toute sécurité sur Amazon ou TikTok Shop.',
    'Browse products': 'Voir les produits',
    'Official shopping options': 'Options officielles pour acheter',
    'Continue with your preferred marketplace': 'Continuez sur la marketplace de votre choix',
    'View current pricing, delivery, and order support directly from the marketplace.': 'Consultez les prix, la livraison et le suivi de commande directement sur la marketplace.',
    'Shop HailaFlo on Amazon': 'Acheter HailaFlo sur Amazon',
    'Shop HailaFlo on TikTok': 'Acheter HailaFlo sur TikTok',
  };

  const dictionaries = { de: de, fr: fr };
  const norm = s => s.trim().replace(/\s+/g, ' ');
  const currentLang = () => localStorage.getItem(LANG_KEY) || 'en';

  function translateNodes(lang) {
    const dict = dictionaries[lang];
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
      node.nodeValue = (dict && dict[key]) ? dict[key] : node.__orig;
    }
    document.querySelectorAll('[placeholder]').forEach(function (el) {
      if (el.__origPh === undefined) el.__origPh = el.getAttribute('placeholder');
      const key = norm(el.__origPh || '');
      el.setAttribute('placeholder', (dict && dict[key]) ? dict[key] : el.__origPh);
    });    document.querySelectorAll('select:not(.lang-select) option').forEach(function (option) {
      if (option.__origText === undefined) option.__origText = option.textContent;
      const key = norm(option.__origText || '');
      option.textContent = (dict && dict[key]) ? dict[key] : option.__origText;
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
    sel.innerHTML = '<option value="en">EN</option><option value="de">DE</option><option value="fr">FR</option>';
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
    if (currentLang() !== 'en') translateNodes(currentLang());
  });

  applyLang(currentLang());
});

/* back-to-top button */
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '&uarr;';
  document.body.appendChild(btn);

  function toggleVisibility() {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
});