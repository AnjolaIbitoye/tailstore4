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
      const matchesAbsorbency = activeAbsorbencies.length === 0 || card.dataset.absorbency === 'Any' || activeAbsorbencies.includes(card.dataset.absorbency);
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
    document.dispatchEvent(new Event('haila:rerender'));
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

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') !== '1') return;

  const form = document.getElementById('help-form');
  const success = document.getElementById('help-form-success');
  if (!form || !success) return;

  form.classList.add('hidden');
  success.classList.remove('hidden');
  success.focus();
  window.history.replaceState({}, document.title, window.location.pathname);
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
    name: 'High Waist Period Briefs',
    code: 'HAILAFLO-001',
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Stretchy%20Briefs', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
    category: 'Period Underwear',
    price: 19.99,
    comparePrice: 24.99,
    absorbency: ['Light', 'Regular', 'Heavy'],
    defaultAbsorbency: 'Regular',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
    image: 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/1.PNG',
    gallery: ['assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/1.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/2.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/3.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/4.PNG'],
    imagesByColor: {
      Black: ['assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/1.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/2.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/3.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20black-/4.PNG'],
      Grey: ['assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20grey/1.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20grey/2.png', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20grey/3.PNG', 'assets/images/HailaFlo%20High%20Waist%20Period%20Briefs%20grey/4.PNG']
    },
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
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
    category: 'Period Underwear',
    price: 27.99,
    absorbency: ['Regular', 'Heavy', 'Super Heavy'],
    defaultAbsorbency: 'Heavy',
    sizes: ['S', 'M', 'L', 'XL'],
    defaultSize: 'M',
    colors: ['Black', 'Grey'],
    defaultColor: 'Black',
    image: 'assets/images/HailaFlo%20Boxer%20Shorts%20black/1.PNG',
    gallery: ['assets/images/HailaFlo%20Boxer%20Shorts%20black/1.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20black/2.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20black/3.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20black/4.PNG'],
    imagesByColor: {
      Black: ['assets/images/HailaFlo%20Boxer%20Shorts%20black/1.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20black/2.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20black/3.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20black/4.PNG'],
      Grey: ['assets/images/HailaFlo%20Boxer%20Shorts%20grey/1.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20grey/2.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20grey/3.PNG', 'assets/images/HailaFlo%20Boxer%20Shorts%20grey/4.PNG']
    },
    shortDescription: 'Relaxed fit with reliable leak protection and wider coverage.',
    longTitle: 'Extended coverage for rest days and overnight confidence.',
    longDescription: 'Boxer Shorts provide fuller cut support and dependable absorbency for heavier-flow moments and longer wear windows.',
    highlight1: 'Longer leg design helps prevent shifting and supports secure movement.',
    highlight2: 'High-capacity gusset offers extended absorbency for all-day and overnight use.'
  },
  {
    slug: 'period-starter-pack',
    name: 'HailaFlo Period Starter Pack',
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
    category: 'Period Underwear',
    absorbency: [],
    sizes: [],
    colors: [],
    image: 'assets/images/Haila%20_period_kit.png',
    gallery: ['assets/images/Haila%20_period_kit.png'],
    shortDescription: 'A thoughtfully put-together kit with period underwear and useful care essentials.',
    longTitle: 'A convenient introduction to HailaFlo period care.',
    longDescription: 'The HailaFlo Period Starter Pack brings together period-care essentials in one convenient kit. Visit TikTok Shop for current pack contents and availability.'
  },
  {
    slug: 'gym-leggings',
    name: 'Gym Leggings',
    code: 'HAILAFLO-004',
    amazonUrl: 'https://www.amazon.com/s?k=HailaFlo%20Gym%20Leggings', // TODO: replace with the real Amazon listing URL
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
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
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
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
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
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
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
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
    tiktokUrl: 'https://www.tiktok.com/@hailaflo.ng',
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
  if (product.category !== 'Period Underwear') {
    window.location.replace('coming-soon.html');
    return;
  }
  const requestedColor = params.get('color');
  const selectedColor = product.colors.find(function (color) {
    return color.toLowerCase() === (requestedColor || product.defaultColor).toLowerCase();
  }) || product.defaultColor;

  const selectedGallery = product.imagesByColor?.[selectedColor] || product.gallery;
  const selectedImage = selectedGallery?.[0] || product.image;
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
    mainImageEl.src = selectedImage;
    mainImageEl.alt = product.name;
  }

  if (buyAmazonEl) buyAmazonEl.href = product.amazonUrl || '#';
  if (buyTiktokEl) buyTiktokEl.href = product.tiktokUrl || '#';
  if (buyAmazonEl) buyAmazonEl.hidden = !product.amazonUrl;
  if (buyTiktokEl) buyTiktokEl.hidden = !product.tiktokUrl;

  [
    [absorbencyEl, product.absorbency],
    [sizeEl, product.sizes],
    [colorsEl, product.colors]
  ].forEach(function ([optionEl, values]) {
    const optionSummary = optionEl?.closest('.product-option-summary');
    if (optionSummary) optionSummary.hidden = !values.length;
  });

  if (!product.sizes.length) {
    const sizeChartBtn = document.getElementById('open-size-chart');
    const sizeTab = document.getElementById('size-shape-tab');
    const sizeContent = document.getElementById('size-shape-content');
    if (sizeChartBtn) sizeChartBtn.hidden = true;
    if (sizeTab) sizeTab.hidden = true;
    if (sizeContent) sizeContent.hidden = true;
  }

  if (product.slug === 'period-starter-pack') {
    const overviewGrid = document.querySelector('.product-overview-grid');
    const specificationGroups = overviewGrid?.querySelectorAll('.product-spec-group');
    const detailsIntroHeading = document.querySelector('.product-description-heading');
    const additionalInfoTab = document.getElementById('additional-info-tab');
    const additionalInfoContent = document.getElementById('additional-info-content');
    if (detailsIntroHeading) detailsIntroHeading.textContent = 'A convenient place to start';
    if (specificationGroups?.[0]) {
      specificationGroups[0].querySelector('h3').textContent = 'Pack details';
      const detailParagraphs = specificationGroups[0].querySelectorAll('p');
      detailParagraphs[0].textContent = 'See TikTok Shop for current pack contents and availability.';
      detailParagraphs[1].hidden = true;
      detailParagraphs[2].hidden = true;
    }
    if (specificationGroups?.[1]) specificationGroups[1].hidden = true;
    if (additionalInfoTab) additionalInfoTab.hidden = true;
    if (additionalInfoContent) additionalInfoContent.hidden = true;
  }

  if (thumbsEl) {
    thumbsEl.innerHTML = selectedGallery.map(function (img, idx) {
      return '<div><img onclick="changeImage(this)" data-full="' + img + '" src="' + img + '" class="object-cover object-center max-h-30 max-w-full rounded-lg cursor-pointer" alt="' + product.name + ' image ' + (idx + 1) + '"></div>';
    }).join('');
  }

  if (highlightImage1) highlightImage1.src = selectedGallery[1] || selectedImage;
  if (highlightImage2) highlightImage2.src = selectedGallery[2] || selectedImage;

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
      const selected = value === selectedColor;
      return '<span class="product-option-value product-option-value--color' + (selected ? ' is-selected' : '') + '" role="img" aria-label="' + value + (selected ? ', selected' : '') + '"><span class="product-option-swatch" style="background-color:' + hex + '"></span></span>';
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
    const related = PRODUCT_CATALOG.filter(function (item) { return item.category === 'Period Underwear' && item.slug !== product.slug; }).slice(0, 4);
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
            document.dispatchEvent(new Event('haila:rerender'));
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
  const LANGUAGE_PREFERENCE_KEY = 'haila_lang_preference';

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
    'High Waist Period Briefs': 'Periodenslip mit hoher Taille',
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
    "HailaFlo's collection spans four families - Period Underwear (High Waist Period Briefs and Boxer Shorts), HailaFlo Active (gym leggings, gym shorts, and swimwear), Other (period activewear), and Postpartum recovery essentials.": "La collection HailaFlo comprend quatre familles - Culottes menstruelles (culottes taille haute et boxers), HailaFlo Active (leggings, shorts de sport et maillots de bain), Autre (vêtements de sport menstruels) et les essentiels de récupération post-partum.",
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
    'High Waist Period Briefs': 'Culotte menstruelle taille haute',
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
    "HailaFlo's collection spans four families - Period Underwear (High Waist Period Briefs and Boxer Shorts), HailaFlo Active (gym leggings, gym shorts, and swimwear), Other (period activewear), and Postpartum recovery essentials.": "La collection HailaFlo comprend quatre familles - Culottes menstruelles (culottes taille haute et boxers), HailaFlo Active (leggings, shorts de sport et maillots de bain), Autre (vêtements de sport menstruels) et les essentiels de récupération post-partum.",
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

  const additionalTranslations = {
    de: {

      "! On average, our advanced 4-layer technology is built to maintain its maximum, high-performance absorbency for at least": "! Im Durchschnitt ist unsere fortschrittliche 4-Lagen-Technologie so aufgebaut, dass sie ihre maximale, leistungsstarke Saugfähigkeit für mindestens einen Zeitraum beibehält",
      "(one for daytime and one for overnight protection), rinsing them after use and washing the entire set at the end of your cycle.": "(eines für den Tages- und eines für den Nachtschutz), spülen Sie sie nach Gebrauch aus und waschen Sie das gesamte Set am Ende Ihres Zyklus.",
      ",": ",",
      ", a great starting point for a full menstrual cycle is": ", ein guter Ausgangspunkt für einen vollständigen Menstruationszyklus",
      ", as our distribution operations extend to": ", wie sich unsere Vertriebsaktivitäten erstrecken",
      ", highly breathable fabrics.": ", hoch atmungsaktive Stoffe.",
      ", we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website, purchase our 4-layer period underwear, or interact with our brand across multi-channel platforms like TikTok Shop.": "Wir legen Wert auf Ihre Privatsphäre und verpflichten uns zum Schutz Ihrer persönlichen Daten. Diese Datenschutzrichtlinie beschreibt, wie wir Ihre Daten erfassen, verwenden, offenlegen und schützen, wenn Sie unsere Website besuchen, unsere 4-lagige Periodenunterwäsche kaufen oder mit unserer Marke über Multi-Channel-Plattformen wie TikTok Shop interagieren.",
      ", which subjects our fabrics to rigorous, independent testing against a list of over 1,000 harmful chemicals. To achieve this standard for safety, our 4-layer technology is strictly required to be free from dangerous levels of toxins, chemical finishes, and \"forever chemicals\".": ", bei dem unsere Stoffe strengen, unabhängigen Tests auf eine Liste von über 1.000 schädlichen Chemikalien unterzogen werden. Um diesen Sicherheitsstandard zu erreichen, muss unsere 4-Lagen-Technologie unbedingt frei von gefährlichen Mengen an Giftstoffen, chemischen Oberflächen und „ewigen Chemikalien“ sein.",
      ", without regard to its conflict of law principles.": ", ohne Rücksicht auf seine Kollisionsrechtsgrundsätze.",
      ", your identity and shipping data (name, delivery address, phone number) are securely transferred to our German distributor to pack and dispatch your orders. This cross-border data transfer is protected by strict data processing agreements that meet European GDPR security standards.": "werden Ihre Identitäts- und Versanddaten (Name, Lieferadresse, Telefonnummer) sicher an unseren deutschen Vertriebspartner übermittelt, um Ihre Bestellungen zu verpacken und zu versenden. Dieser grenzüberschreitende Datentransfer ist durch strenge Datenverarbeitungsvereinbarungen geschützt, die den europäischen DSGVO-Sicherheitsstandards entsprechen.",
      ", your order details are securely synchronized with our backend systems to facilitate fast processing and shipping.": "Ihre Bestelldaten werden sicher mit unseren Backend-Systemen synchronisiert, um eine schnelle Bearbeitung und einen schnellen Versand zu ermöglichen.",
      ", your period underwear should fit snugly around your legs and waist without digging in. If the leg openings are too loose, gaps can cause leaks even if the underwear isn't full. We recommend checking our detailed size guide and measuring your hips to find your true match.": ", Ihre Periodenunterwäsche sollte eng an Ihren Beinen und Ihrer Taille anliegen, ohne einzuschneiden. Wenn die Beinöffnungen zu locker sind, können Lücken zu Undichtigkeiten führen, selbst wenn die Unterwäsche nicht voll ist. Wir empfehlen Ihnen, unsere detaillierte Größentabelle zu konsultieren und Ihre Hüften zu messen, um die richtige Passform zu finden.",
      ".": ".",
      ". However, like any menstrual product, it can leak if it reaches full capacity or if it fits poorly.": ". Allerdings kann es, wie jedes Menstruationsprodukt, auslaufen, wenn es seine volle Kapazität erreicht oder schlecht sitzt.",
      ". If you ever start to feel a slight sensation of moisture on the top layer, it is simply a sign that the core is at full capacity and it is time to swap to a fresh pair.": ". Wenn Sie jemals ein leichtes Gefühl von Feuchtigkeit auf der obersten Schicht spüren, ist das einfach ein Zeichen dafür, dass der Kern voll ausgelastet ist und es an der Zeit ist, auf ein frisches Paar umzusteigen.",
      ". Softeners leave a microscopic film on the fabric that clogs the fibers, trapping moisture and bacteria inside the absorbent core. Always allow them to air-dry completely before putting them away!": ". Weichmacher hinterlassen einen mikroskopisch kleinen Film auf dem Stoff, der die Fasern verstopft und Feuchtigkeit und Bakterien im absorbierenden Kern festhält. Lassen Sie sie immer vollständig an der Luft trocknen, bevor Sie sie wegräumen!",
      ". The very first layer—the": ". Die allererste Schicht – die",
      "0% Plastic-Backed Stickiness:": "0 % Klebrigkeit auf Kunststoffrückseite:",
      "01": "01",
      "02": "02",
      "03": "03",
      "04": "04",
      "1": "1",
      "1. Information We Collect": "1. Informationen, die wir sammeln",
      "1. The Full Switch (5 to 7 Pairs)": "1. Der vollständige Schalter (5 bis 7 Paare)",
      "100% cotton": "100% Baumwolle",
      "100% sealed in its original product packaging": "100 % versiegelt in der Originalverpackung",
      "10ml": "10 ml",
      "1–2 business days": "1–2 Werktage",
      "2": "2",
      "2 pairs per day": "2 Paar pro Tag",
      "2. How We Use Your Data": "2. Wie wir Ihre Daten verwenden",
      "2. The Part-Time Switch (3 to 4 Pairs)": "2. Der Teilzeitschalter (3 bis 4 Paare)",
      "20ml": "20 ml",
      "28-30": "28-30",
      "2x Heavy Plus Pairs": "2x Heavy Plus Paare",
      "2x Regular Flow Pairs": "2x reguläre Flusspaare",
      "3": "3",
      "3. Data Sharing and Cross-Border Transfers (Germany Distribution)": "3. Datenaustausch und grenzüberschreitende Übermittlungen (Deutschland-Verteilung)",
      "3. The Backup / Starter Option (1 to 2 Pairs)": "3. Die Backup-/Starter-Option (1 bis 2 Paare)",
      "30 days from the date of delivery": "30 Tage ab Lieferdatum",
      "32-33": "32-33",
      "32-34": "32-34",
      "33-34": "33-34",
      "34-35": "34-35",
      "34-36": "34-36",
      "35-36": "35-36",
      "36-38": "36-38",
      "38-40": "38-40",
      "3x Regular-Heavy Flow Pairs": "3x Regular-Heavy-Flow-Paare",
      "4": "4",
      "4-layer leak-proof technology": "4-lagige auslaufsichere Technologie",
      "4-layer technology": "4-Lagen-Technologie",
      "4. Data Retention and Security": "4. Datenaufbewahrung und Sicherheit",
      "40-42": "40-42",
      "40ml": "40 ml",
      "42-44": "42-44",
      "46-48": "46-48",
      "5 to 7 pairs": "5 bis 7 Paare",
      "5. Your Legal Rights (NDPA & GDPR)": "5. Ihre gesetzlichen Rechte (NDPA & DSGVO)",
      "50 to 100 washes": "50 bis 100 Wäschen",
      "60ml": "60 ml",
      "8 to 12 hours": "8 bis 12 Stunden",
      "A close-fitting gusset and suitable absorbency can help reduce leaks; no menstrual product can guarantee against leaks in every situation.": "Ein eng anliegender Zwickel und eine geeignete Saugfähigkeit können dazu beitragen, Undichtigkeiten zu reduzieren; Kein Menstruationsprodukt kann in jeder Situation ein Auslaufen verhindern.",
      "A five-pair starter collection can help cover a typical school week, depending on your teen's cycle and laundry routine:": "Eine Starterkollektion mit fünf Paaren kann dabei helfen, eine typische Schulwoche abzudecken, abhängig vom Zyklus und der Wäscheroutine Ihres Teenagers:",
      "A gentle wash protects the absorbent layers": "Eine schonende Wäsche schont die saugfähigen Schichten",
      "A slim multi-layer core absorbs quickly while staying flexible under clothing.": "Ein schlanker, mehrschichtiger Kern zieht schnell ein und bleibt gleichzeitig unter der Kleidung flexibel.",
      "A small rotation makes care easier. Most people begin with three to five pairs, with a mix of absorbencies for lighter days, heavier flow, and overnight wear.": "Eine kleine Drehung erleichtert die Pflege. Die meisten Menschen beginnen mit drei bis fünf Paaren, mit einer Mischung aus Saugfähigkeiten für leichtere Tage, stärkeres Fließen und Tragen über Nacht.",
      "Absorbency & fit": "Saugfähigkeit und Passform",
      "Absorbency Level": "Saugfähigkeitsgrad",
      "Absorbency:": "Saugfähigkeit:",
      "Absorbency: Heavy": "Saugfähigkeit: Schwer",
      "Absorbency: Regular": "Saugfähigkeit: Normal",
      "Absorbent Core:": "Absorbierender Kern:",
      "Absorbs up to": "Absorbiert bis zu",
      "Access": "Zugang",
      "Accuracy:": "Genauigkeit:",
      "Adaptive fit contours to movement for all-day wear comfort.": "Adaptive Passform passt sich der Bewegung an und sorgt für ganztägigen Tragekomfort.",
      "Additional information": "Weitere Informationen",
      "After wear, rinse under cold water until the water begins to run clear. Avoid hot water, which can set stains.": "Nach dem Tragen unter kaltem Wasser abspülen, bis das Wasser klar zu werden beginnt. Vermeiden Sie heißes Wasser, da es Flecken hinterlassen kann.",
      "After wearing, rinse your underwear under cold running water or soak them until the water runs clear.": "Spülen Sie Ihre Unterwäsche nach dem Tragen unter fließendem kaltem Wasser aus oder lassen Sie sie einweichen, bis das Wasser klar ist.",
      "Air dry": "An der Luft trocknen",
      "All orders are processed, packed, and shipped fast within": "Alle Bestellungen werden innerhalb kürzester Zeit bearbeitet, verpackt und versendet",
      "All-day comfort": "Ganztägiger Komfort",
      "All-day support from commute to cooldown.": "Ganztägige Unterstützung vom Arbeitsweg bis zum Cooldown.",
      "Amazon": "Amazonas",
      "Analytical services like Google Analytics and social media advertising pixels (such as the TikTok Pixel) to optimize your browsing experience.": "Analysedienste wie Google Analytics und Social-Media-Werbepixel (wie das TikTok-Pixel) zur Optimierung Ihres Surferlebnisses.",
      "Answers about absorbency, fit, materials, care, and everyday use.": "Antworten zu Saugfähigkeit, Passform, Materialien, Pflege und Alltagsgebrauch.",
      "As your flow leaves your body, Hailaflo’s moisture-wicking top layer immediately pulls the fluid down and locks it into the absorbent core.": "Sobald Ihre Flüssigkeit Ihren Körper verlässt, zieht die feuchtigkeitsableitende Oberschicht von Hailaflo die Flüssigkeit sofort nach unten und schließt sie im absorbierenden Kern ein.",
      "At": "Bei",
      "Available colors:": "Verfügbare Farben:",
      "Available now": "Jetzt verfügbar",
      "Avoid": "Vermeiden",
      "Back to top": "Zurück nach oben",
      "Because our distribution center is located in": "Denn unser Vertriebszentrum befindet sich in",
      "Because your flow changes throughout the week, your perfect number depends entirely on your unique cycle, your laundry habits, and how you plan to use them.": "Da sich Ihr Durchfluss im Laufe der Woche ändert, hängt Ihre perfekte Zahl vollständig von Ihrem individuellen Zyklus, Ihren Wäschegewohnheiten und der geplanten Verwendung ab.",
      "Beginners wanting to test our advanced 4-layer technology, or anyone looking for extra": "Einsteiger, die unsere fortschrittliche 4-Lagen-Technologie testen möchten, oder alle, die etwas Besonderes suchen",
      "Best For": "Am besten für",
      "Best For:": "Am besten geeignet für:",
      "Black": "Schwarz",
      "Bleach": "Bleichen",
      "Blush": "Erröten",
      "Boxer Shorts in Black": "Boxershorts in Schwarz",
      "Boxer Shorts provide fuller cut support and dependable absorbency for heavier-flow moments and longer wear windows.": "Boxershorts bieten eine umfassendere Passform und zuverlässige Saugfähigkeit für Momente mit stärkerer Durchblutung und längere Tragezeiten.",
      "Brand": "Marke",
      "Bring them home to wash": "Bringen Sie sie zum Waschen nach Hause",
      "Browse HailaFlo products": "Durchsuchen Sie HailaFlo-Produkte",
      "Build a routine that keeps each pair ready": "Erstellen Sie eine Routine, die jedes Paar bereit hält",
      "Building Your Care Routine": "Bauen Sie Ihre Pflegeroutine auf",
      "Burgundy": "Burgund",
      "By eliminating the damp environment where bacteria usually thrive, the underwear naturally stays clean, fresh, and completely odour-free for up to 8 to 12 hours.": "Durch die Eliminierung der feuchten Umgebung, in der sich normalerweise Bakterien vermehren, bleibt die Unterwäsche bis zu 8 bis 12 Stunden lang auf natürliche Weise sauber, frisch und völlig geruchsfrei.",
      "By matching your unique flow to our 4-layer technology, you can experience a completely": "Durch die Abstimmung Ihres einzigartigen Flusses auf unsere 4-Schichten-Technologie können Sie ein vollkommenes Erlebnis erleben",
      "By placing an order, you confirm that you are at least the age of majority in your country, state, or province of residence. If you create an account on our store, you are responsible for maintaining the confidentiality of your login credentials.": "Indem Sie eine Bestellung aufgeben, bestätigen Sie, dass Sie in Ihrem Land, Bundesstaat oder der Provinz, in der Sie wohnen, mindestens volljährig sind. Wenn Sie ein Konto in unserem Shop erstellen, sind Sie für die Wahrung der Vertraulichkeit Ihrer Anmeldedaten verantwortlich.",
      "Can I wear HailaFlo for workouts and long days?": "Kann ich HailaFlo beim Training und an langen Tagen tragen?",
      "Can period underwear leak?": "Kann Periodenunterwäsche auslaufen?",
      "Capacity in Millilitres": "Kapazität in Millilitern",
      "Care & Performance": "Sorgfalt & Leistung",
      "Care guide sections": "Abschnitte mit Pflegehinweisen",
      "Care instructions:": "Pflegehinweise:",
      "Care routine": "Pflegeroutine",
      "Caring for your": "Kümmert sich um Ihr",
      "Change language": "Sprache ändern",
      "Change when needed": "Ändern Sie es bei Bedarf",
      "Changes to These Terms": "Änderungen dieser Bedingungen",
      "Check product details and certification information for the specific style, especially for sensitive skin.": "Überprüfen Sie die Produktdetails und Zertifizierungsinformationen für den jeweiligen Stil, insbesondere für empfindliche Haut.",
      "Check the fit": "Überprüfen Sie die Passform",
      "Chest (inches)": "Brust (Zoll)",
      "Choose Your Routine": "Wählen Sie Ihre Routine",
      "Choose from High Waist Period Briefs and Boxer Shorts, each available in Black and Grey.": "Wählen Sie aus Periodenslips und Boxershorts mit hoher Taille, jeweils erhältlich in Schwarz und Grau.",
      "Choose protection for your flow, not just the day": "Wählen Sie Schutz für Ihren Fluss, nicht nur für den Tag",
      "Choose the absorbency and fit that match your flow, then follow simple care steps to keep your HailaFlo underwear performing well.": "Wählen Sie die Saugfähigkeit und Passform, die zu Ihrem Durchfluss passen, und befolgen Sie dann einfache Pflegeschritte, damit Ihre HailaFlo-Unterwäsche weiterhin gut funktioniert.",
      "Clear": "Klar",
      "Close menu": "Menü schließen",
      "Colors": "Farben",
      "Comfort that lasts, cycle after cycle": "Komfort, der anhält, Zyklus für Zyklus",
      "Comfort-forward essentials for postpartum care.": "Bequeme Essentials für die Pflege nach der Geburt.",
      "Coming Soon": "Demnächst verfügbar",
      "Coming soon": "Kommt bald",
      "Committing to an entirely": "Sich ganz und gar verpflichten",
      "Completely dry, fresh, and lightweight.": "Völlig trocken, frisch und leicht.",
      "Compression-inspired fit keeps fabric stable through high-motion workouts.": "Die von der Kompression inspirierte Passform hält den Stoff auch bei bewegungsintensiven Trainingseinheiten stabil.",
      "Contact Us | HailaFlo": "Kontaktieren Sie uns | HailaFlo",
      "Contact information": "Kontaktinformationen",
      "Conventional disposable pads use plastic backings that trap heat, moisture, and sweat. This can cause fluid to smear and pool, making your flow look and feel much heavier than it actually is.": "Herkömmliche Einweg-Einlagen verwenden eine Kunststoffunterlage, die Wärme, Feuchtigkeit und Schweiß speichert. Dies kann dazu führen, dass die Flüssigkeit verschmiert und sich ansammelt, wodurch Ihr Fluss viel schwerer aussieht und sich schwerer anfühlt, als er tatsächlich ist.",
      "Conventional products often contain synthetic fragrances and chemical bleaching agents that can irritate your skin and increase cramping discomfort. Switching to": "Herkömmliche Produkte enthalten häufig synthetische Duftstoffe und chemische Bleichmittel, die Ihre Haut reizen und die Krämpfe verstärken können. Wechseln zu",
      "Cookie Policy": "Cookie-Richtlinie",
      "Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used to make websites work efficiently, remember your shopping preferences, and provide analytical data to the website owners.": "Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät abgelegt werden, wenn Sie eine Website besuchen. Sie werden häufig verwendet, um dafür zu sorgen, dass Websites effizient funktionieren, Ihre Einkaufspräferenzen gespeichert werden und den Website-Eigentümern analytische Daten zur Verfügung gestellt werden.",
      "Create an easy wash, dry, and storage routine that keeps every pair ready for your next cycle.": "Erstellen Sie eine einfache Wasch-, Trocknungs- und Aufbewahrungsroutine, die jedes Paar für den nächsten Zyklus bereit hält.",
      "Cycle & Everyday Use": "Zyklus und Alltagsgebrauch",
      "Damaged or Defective Items:": "Beschädigte oder defekte Artikel:",
      "Data Portability": "Datenportabilität",
      "Delivery estimates and shipping options are shown by Amazon or TikTok Shop before you place your order there.": "Liefervoranschläge und Versandoptionen werden von Amazon oder TikTok Shop angezeigt, bevor Sie dort Ihre Bestellung aufgeben.",
      "Depending on your flow intensity and the absorbency level you chose, your pair will last anywhere from": "Abhängig von Ihrer Durchflussintensität und der von Ihnen gewählten Saugfähigkeit hält Ihr Paar überall",
      "Depending on your location, you hold specific data rights regarding your personal information under the NDPA 2023 or EU GDPR. You have the right to:": "Abhängig von Ihrem Standort haben Sie bestimmte Datenrechte in Bezug auf Ihre personenbezogenen Daten gemäß NDPA 2023 oder EU-DSGVO. Sie haben das Recht:",
      "Description": "Beschreibung",
      "Designed around your day": "Entworfen rund um Ihren Tag",
      "Designed for Comfort": "Auf Komfort ausgelegt",
      "Details about payments made by you and products you have purchased from us.": "Details zu von Ihnen getätigten Zahlungen und Produkten, die Sie bei uns gekauft haben.",
      "Discreet Packaging:": "Diskrete Verpackung:",
      "Discreet:": "Diskret:",
      "Disposable pads can feel bulky or move during activity, and tampons may feel intimidating for beginners. Reusable period underwear is worn like regular underwear and can be one option for period care.": "Einwegeinlagen können sich während der Aktivität sperrig anfühlen oder sich bewegen, und Tampons können für Anfänger einschüchternd wirken. Wiederverwendbare Periodenunterwäsche wird wie normale Unterwäsche getragen und kann eine Option für die Menstruationspflege sein.",
      "Do": "Tun",
      "Do not fill this out:": "Füllen Sie dies nicht aus:",
      "Do period pants feel wet when you’re wearing them?": "Fühlen sich Periodenhosen beim Tragen nass an?",
      "Do you offer returns or size exchanges?": "Bieten Sie Rücksendungen oder Größenumtausch an?",
      "Does HailaFlo contain PFAS?": "Enthält HailaFlo PFAS?",
      "Does HailaFlo use nanotechnology?": "Verwendet HailaFlo Nanotechnologie?",
      "Does wearing period underwear change your period or make it lighter?": "Verändert das Tragen von Periodenunterwäsche Ihre Periode oder macht sie sie leichter?",
      "Dry completely": "Vollständig trocknen",
      "Due to strict health protection and hygiene reasons, any period underwear that has been opened, tried on, or has a broken hygiene seal": "Aus strikten Gründen des Gesundheitsschutzes und der Hygiene ist jede Periodenunterwäsche, die geöffnet, anprobiert wurde oder deren Hygienesiegel gebrochen ist, ausgeschlossen",
      "E-Commerce and Marketplace Platforms:": "E-Commerce- und Marktplatzplattformen:",
      "Eligibility & Account Registration": "Berechtigung und Kontoregistrierung",
      "Email": "E-Mail",
      "Email: support@hailaflo.com": "E-Mail: support@hailaflo.com",
      "Erasure (\"Right to be Forgotten\")": "Löschung („Recht auf Vergessenwerden“)",
      "Essential Cookies:": "Wesentliche Cookies:",
      "Even after hitting their maximum wash milestone, your Hailaflo underwear won't suddenly stop working. The built-in fabric tech will simply begin to very slowly decline in absorbency. When you eventually notice this change, you can seamlessly retire them to be used on your lighter flow days, for spotting, or as a backup to a menstrual cup.": "Auch nach Erreichen des maximalen Waschmeilensteins hört Ihre Hailaflo-Unterwäsche nicht plötzlich auf zu funktionieren. Die eingebaute Stofftechnologie wird ganz langsam an Saugfähigkeit verlieren. Wenn Sie diese Veränderung irgendwann bemerken, können Sie sie problemlos zurückziehen, um sie an Tagen mit geringerem Blutfluss, zur Schmierblutung oder als Ersatz für eine Menstruationstasse zu verwenden.",
      "Everyday comfort designed to move with your routine.": "Alltagskomfort, der sich Ihrer Routine anpasst.",
      "Everyday flow, work, school, and regular daytime wear.": "Alltags-Flow, Arbeit, Schule und normale Tageskleidung.",
      "Everyday routine": "Alltag",
      "Exactly like putting on a pair of premium, high-quality everyday underwear.": "Genau so, als würde man ein Paar hochwertige Alltagsunterwäsche anziehen.",
      "Explore HailaFlo": "Entdecken Sie HailaFlo",
      "Explore common questions about materials, wear time, sizing, and cycle use.": "Entdecken Sie häufige Fragen zu Materialien, Tragedauer, Größen und Zyklusnutzung.",
      "Explore period underwear designed for everyday comfort.": "Entdecken Sie Periodenunterwäsche für alltäglichen Komfort.",
      "Extended coverage for rest days and overnight confidence.": "Erweiterter Versicherungsschutz für Ruhetage und Sicherheit über Nacht.",
      "FAQs": "FAQs",
      "Fabric softener": "Weichspüler",
      "Fabric:": "Stoff:",
      "Find Your Perfect Hailaflo Absorbency Level": "Finden Sie Ihren perfekten Hailaflo-Absorptionsgrad",
      "Find your everyday comfort": "Finden Sie Ihren Alltagskomfort",
      "First-period guide": "Leitfaden für die erste Stunde",
      "Fit:": "Fit:",
      "Follow HailaFlo on TikTok": "Folgen Sie HailaFlo auf TikTok",
      "Free standard shipping is available on purchase of 3 items. Standard shipping rates apply for smaller orders.": "Beim Kauf von 3 Artikeln ist der Standardversand kostenlos. Für kleinere Bestellungen gelten die Standardversandtarife.",
      "Frequently Asked Questions": "Häufig gestellte Fragen",
      "Functional Cookies:": "Funktionale Cookies:",
      "Gallery Image 1": "Galeriebild 1",
      "Gallery Image 2": "Galeriebild 2",
      "Gallery Image 3": "Galeriebild 3",
      "Gallery Image 4": "Galeriebild 4",
      "Gallery Image 5": "Galeriebild 5",
      "General Data Protection Regulation (GDPR)": "Datenschutz-Grundverordnung (DSGVO)",
      "Gentle, high-coverage support for postpartum recovery weeks.": "Sanfte, hochdeckende Unterstützung für die Erholungswochen nach der Geburt.",
      "Germany": "Deutschland",
      "Go about your day": "Gehen Sie Ihrem Tag nach",
      "Governing Law": "Geltendes Recht",
      "Grey": "Grau",
      "Gym Leggings are built with stretch recovery and absorbent support, helping you train confidently through every session.": "Gym-Leggings sind mit elastischem Rückstellsystem und saugfähiger Unterstützung ausgestattet und helfen Ihnen, bei jeder Trainingseinheit souverän zu trainieren.",
      "Gym Shorts are optimized for airflow and stretch, with core absorbency support for confidence during active hours.": "Gym-Shorts sind für Luftzirkulation und Dehnbarkeit optimiert und unterstützen die Saugfähigkeit des Rumpfes für Selbstvertrauen während aktiver Stunden.",
      "Haila Flo is OEKO TEX Certified , What does the OEKO-TEX® Standard 100 certification mean?": "Haila Flo ist OEKO-TEX-zertifiziert. Was bedeutet die OEKO-TEX® Standard 100-Zertifizierung?",
      "HailaFlo": "HailaFlo",
      "HailaFlo Active, Postpartum, and other collections are coming soon.": "HailaFlo Active, Postpartum und andere Kollektionen sind bald erhältlich.",
      "HailaFlo Boxer Shorts": "HailaFlo Boxershorts",
      "HailaFlo Everyday Brief": "HailaFlo Alltags-Slip",
      "HailaFlo Gym Leggings": "HailaFlo Gym-Leggings",
      "HailaFlo Gym Shorts": "HailaFlo Gym Shorts",
      "HailaFlo High Waist Period Briefs": "HailaFlo Perioden-Slip mit hoher Taille",
      "HailaFlo Period Activewear": "HailaFlo Period Activewear",
      "HailaFlo Postpartum Recovery Set": "HailaFlo Erholungsset nach der Geburt",
      "HailaFlo Swimwear": "HailaFlo-Bademode",
      "HailaFlo logo": "HailaFlo-Logo",
      "HailaFlo makes reusable period underwear with breathable comfort, leak protection, and a fit designed for everyday confidence.": "HailaFlo stellt wiederverwendbare Periodenunterwäsche mit atmungsaktivem Komfort, Auslaufschutz und einer Passform her, die für alltägliches Selbstvertrauen konzipiert ist.",
      "HailaFlo period underwear is built for soft, secure comfort from morning to night.": "Die Periodenunterwäsche von HailaFlo ist für weichen, sicheren Komfort von morgens bis abends konzipiert.",
      "HailaFlo | Care Guide": "HailaFlo | Pflegeratgeber",
      "HailaFlo | Coming Soon": "HailaFlo | Demnächst verfügbar",
      "HailaFlo | Frequently Asked Questions": "HailaFlo | Häufig gestellte Fragen",
      "HailaFlo | Period Underwear": "HailaFlo | Periodenunterwäsche",
      "HailaFlo | Privacy Policy": "HailaFlo | Datenschutzrichtlinie",
      "HailaFlo | Shipping, Returns & Exchanges": "HailaFlo | Versand, Rückgabe und Umtausch",
      "HailaFlo | Shop": "HailaFlo | Geschäft",
      "HailaFlo | Terms of Service": "HailaFlo | Nutzungsbedingungen",
      "Hailaflo": "Hailaflo",
      "Hailaflo Period Underwear": "Hailaflo Periodenunterwäsche",
      "Hailaflo Period Underwear: Frequently Asked Questions": "Hailaflo Periodenunterwäsche: Häufig gestellte Fragen",
      "Hailaflo period underwear": "Periodenunterwäsche von Hailaflo",
      "Hailaflo period underwear can last up to 4 years": "Die Periodenunterwäsche von Hailaflo kann bis zu 4 Jahre halten",
      "Hailaflo products are designed for personal menstrual hygiene management. We do not provide medical advice. Hailaflo is not liable for any indirect, incidental, or consequential damages resulting from the misuse of our products or the inability to use our website.": "Hailaflo-Produkte sind für das persönliche Menstruationshygienemanagement konzipiert. Wir bieten keine medizinische Beratung an. Hailaflo haftet nicht für indirekte, zufällige oder Folgeschäden, die sich aus dem Missbrauch unserer Produkte oder der Unfähigkeit, unsere Website zu nutzen, ergeben.",
      "Hailaflo’s advanced": "Hailaflo ist fortgeschritten",
      "Hang your underwear to air dry completely. Avoid tumble dryers and direct radiator heat, as high heat can damage the waterproof leak-proof barrier.": "Hängen Sie Ihre Unterwäsche zum vollständigen Trocknen an der Luft auf. Vermeiden Sie Wäschetrockner und direkte Heizkörperhitze, da hohe Hitze die wasserdichte, auslaufsichere Barriere beschädigen kann.",
      "Heavier days, longer outings, and overnight protection.": "Schwerere Tage, längere Ausflüge und Schutz über Nacht.",
      "Heavy Plus": "Schweres Plus",
      "Heavy days or overnight protection": "Schutz an schweren Tagen oder über Nacht",
      "Help and FAQ": "Hilfe und FAQ",
      "Help us understand how visitors interact with our site (e.g., which pages are visited most often) so we can optimize performance and fix bugs.": "Helfen Sie uns zu verstehen, wie Besucher mit unserer Website interagieren (z. B. welche Seiten am häufigsten besucht werden), damit wir die Leistung optimieren und Fehler beheben können.",
      "Hide Filters": "Filter ausblenden",
      "High Waist Period Briefs in Black": "Perioden-Slip mit hoher Taille in Schwarz",
      "High-capacity absorbent core supports longer intervals between changes.": "Der saugfähige Kern mit hoher Kapazität unterstützt längere Wechselintervalle.",
      "High-capacity gusset offers extended absorbency for all-day and overnight use.": "Der Zwickel mit hoher Kapazität bietet eine längere Saugfähigkeit für den ganztägigen und übernächtlichen Gebrauch.",
      "High-coverage cut supports comfort throughout longer rest periods.": "Der hochdeckende Schnitt unterstützt den Komfort auch bei längeren Ruhephasen.",
      "High-performance leggings built for movement and secure protection.": "Hochleistungs-Leggings für Bewegungsfreiheit und sicheren Schutz.",
      "How Hailaflo Uses Cookies": "Wie Hailaflo Cookies verwendet",
      "How Many Pairs of Period Underwear Do I Need?": "Wie viele Paar Periodenunterwäsche benötige ich?",
      "How do I choose the right absorbency level?": "Wie wähle ich die richtige Saugfähigkeit?",
      "How do I find the perfect fit?": "Wie finde ich die perfekte Passform?",
      "How do I wash and care for Hailaflo period underwear?": "Wie wasche und pflege ich die Periodenunterwäsche von Hailaflo?",
      "How long does shipping usually take?": "Wie lange dauert der Versand normalerweise?",
      "How long they last in your wardrobe depends on your laundry rotation:": "Wie lange sie in Ihrem Kleiderschrank halten, hängt von Ihrem Wäschewechsel ab:",
      "How long will my HailaFlo garments last?": "Wie lange halten meine HailaFlo-Kleidungsstücke?",
      "How should I wash period underwear?": "Wie soll ich Periodenunterwäsche waschen?",
      "However, many women who switch to Hailaflo report that their periods": "Allerdings berichten viele Frauen, die auf Hailaflo umsteigen, dass ihre Periode ausbleibt",
      "Hygiene Policy, Shipping, & Returns": "Hygienerichtlinien, Versand und Rückgabe",
      "Identity and Contact Data:": "Identitäts- und Kontaktdaten:",
      "If a pair begins leaking sooner than expected, check the fit, review whether your flow has changed, and make sure fabric softener has not coated the absorbent fibers.": "Wenn ein Paar früher als erwartet zu lecken beginnt, überprüfen Sie den Sitz, prüfen Sie, ob sich Ihr Durchfluss verändert hat, und stellen Sie sicher, dass sich die saugfähigen Fasern nicht mit Weichspüler überzogen haben.",
      "If the surface starts to feel damp or the gusset feels full, change into a fresh pair.": "Wenn sich die Oberfläche feucht anfühlt oder sich der Zwickel voll anfühlt, ziehen Sie ein neues Paar an.",
      "If you are between sizes, use your hip measurement and preferred fit as your guide.": "Wenn Sie zwischen zwei Größen liegen, orientieren Sie sich an Ihrem Hüftumfang und Ihrer bevorzugten Passform.",
      "If you are making the switch to": "Wenn Sie auf wechseln",
      "If you own a full set (5–7 pairs) and only wash each pair once per cycle, they will easily last up to 4 years or longer.": "Wenn Sie ein komplettes Set (5–7 Paar) besitzen und jedes Paar nur einmal pro Zyklus waschen, halten diese problemlos bis zu 4 Jahre oder länger.",
      "If you own a smaller collection (3–4 pairs) and wash and wear them multiple times during a single period week, they will still reliably last you up to 3 years.": "Wenn Sie eine kleinere Kollektion besitzen (3–4 Paare) und diese mehrmals während einer Periodewoche waschen und tragen, halten sie Ihnen dennoch zuverlässig bis zu 3 Jahre.",
      "If you purchase Hailaflo garments via": "Wenn Sie Hailaflo-Kleidung über kaufen",
      "If you purchase Hailaflo products through third-party platforms (such as TikTok Shop), your transaction is additionally subject to that platform's terms of service and processing rules.": "Wenn Sie Hailaflo-Produkte über Plattformen Dritter (z. B. TikTok Shop) kaufen, unterliegt Ihre Transaktion zusätzlich den Nutzungsbedingungen und Verarbeitungsregeln dieser Plattform.",
      "If you start to feel moisture on the top layer, it is simply a sign that the core is completely full and it is time to change into a fresh pair.": "Wenn Sie anfangen, Feuchtigkeit auf der obersten Schicht zu spüren, ist das einfach ein Zeichen dafür, dass der Kern vollständig gefüllt ist und es Zeit ist, ein frisches Paar anzuziehen.",
      "If your item arrives damaged, defective, or incorrect, please": "Wenn Ihr Artikel beschädigt, defekt oder falsch ankommt, wenden Sie sich bitte an uns",
      "If your underwear doesn't fit snugly against your body, the moisture-wicking layer cannot pull the fluid away efficiently.": "Wenn Ihre Unterwäsche nicht eng am Körper anliegt, kann die feuchtigkeitsableitende Schicht die Flüssigkeit nicht effizient ableiten.",
      "Instagram": "Instagram",
      "Instant Absorption:": "Sofortige Absorption:",
      "Instead of relying on synthetic chemical treatments for waterproofing or stain resistance, we engineered our leak-proof barriers and absorbent cores using the physical weave and capillary action of the fabrics themselves. When you wear Hailaflo, you can be entirely confident that you are keeping toxic chemicals away from your body's most sensitive skin": "Anstatt uns auf synthetische chemische Behandlungen für Wasserdichtigkeit oder Fleckenbeständigkeit zu verlassen, haben wir unsere auslaufsicheren Barrieren und absorbierenden Kerne mithilfe der physikalischen Webart und Kapillarwirkung der Stoffe selbst entwickelt. Wenn Sie Hailaflo tragen, können Sie absolut sicher sein, dass giftige Chemikalien von der empfindlichsten Haut Ihres Körpers ferngehalten werden",
      "International Distribution & Warehouse Partners:": "Internationale Vertriebs- und Lagerpartner:",
      "Ironing the gusset": "Den Zwickel bügeln",
      "Join our newsletter": "Abonnieren Sie unseren Newsletter",
      "Keep pairs unfolded or loosely folded in a clean, dry drawer away from direct heat.": "Bewahren Sie die Paare ungefaltet oder lose gefaltet in einer sauberen, trockenen Schublade auf, fern von direkter Hitze.",
      "Large": "Groß",
      "Large Rotation (Lasts 4+ Years):": "Große Rotation (dauert 4+ Jahre):",
      "Last Updated: September 12, 2026": "Letzte Aktualisierung: 12. September 2026",
      "Leak-proof protection": "Auslaufsicherer Schutz",
      "Leak-proof swimwear for worry-free pool and beach days.": "Auslaufsichere Badebekleidung für sorgenfreie Pool- und Strandtage.",
      "Leg openings should feel snug but should not leave painful marks.": "Die Beinöffnungen sollten eng anliegen, aber keine schmerzhaften Spuren hinterlassen.",
      "Legal": "Legal",
      "Length:": "Länge:",
      "Light Flow": "Lichtfluss",
      "Light days, spotting, or backup": "Leichte Tage, Spotting oder Backup",
      "Lightweight mobility for training, errands, and recovery.": "Leichte Mobilität für Training, Besorgungen und Erholung.",
      "Limitation of Liability": "Haftungsbeschränkung",
      "Logistics and Delivery Partners:": "Logistik- und Lieferpartner:",
      "Longer leg design helps prevent shifting and supports secure movement.": "Das längere Beindesign verhindert ein Verrutschen und unterstützt eine sichere Bewegung.",
      "Looking for quick answers? Visit our FAQ": "Suchen Sie nach schnellen Antworten? Besuchen Sie unsere FAQ",
      "Machine wash at 30°C, do not tumble dry, iron on low heat, do not bleach": "Maschinenwäsche bei 30 °C, nicht im Trockner trocknen, bei niedriger Temperatur bügeln, nicht bleichen",
      "Machine wash at 40°C, do not tumble dry, iron at medium temperature, do not bleach.": "Maschinenwäsche bei 40 °C, nicht im Trockner trocknen, bei mittlerer Temperatur bügeln, nicht bleichen.",
      "Machine wash on a cool, gentle cycle with similar colors and mild detergent. A mesh laundry bag can reduce fabric stress.": "Maschinenwäsche im kühlen Schonwaschgang mit ähnlichen Farben und Feinwaschmittel. Ein Mesh-Wäschesack kann die Stoffbeanspruchung reduzieren.",
      "Made to Last": "Für die Ewigkeit gemacht",
      "Main Product Image": "Hauptproduktbild",
      "Making the switch to": "Der Wechsel zu",
      "Manage your customer account, process secure payments, and handle returns or size exchanges.": "Verwalten Sie Ihr Kundenkonto, wickeln Sie sichere Zahlungen ab und wickeln Sie Retouren oder Größenumtausch ab.",
      "Managing Your Cookie Choices": "Verwalten Ihrer Cookie-Auswahl",
      "Marketing and Analytics Partners:": "Marketing- und Analysepartner:",
      "Material & Care": "Material & Pflege",
      "Material & Washing": "Material & Waschen",
      "Material:": "Material:",
      "Materials & Safety": "Materialien und Sicherheit",
      "Materials:": "Materialien:",
      "Medium": "Medium",
      "Message": "Nachricht",
      "Message sent successfully": "Nachricht erfolgreich gesendet",
      "Model height:": "Modellgröße:",
      "Moisture trapped during storage can cause odor. Store only when every layer is fully dry.": "Während der Lagerung eingeschlossene Feuchtigkeit kann Geruch verursachen. Nur lagern, wenn jede Schicht vollständig trocken ist.",
      "Moisture-Wicking Top Layer:": "Feuchtigkeitsableitende Oberschicht:",
      "More answers": "Weitere Antworten",
      "More from HailaFlo": "Mehr von HailaFlo",
      "Multi-layer absorbent core keeps you dry and confident, day or night.": "Der mehrschichtige absorbierende Kern hält Sie Tag und Nacht trocken und sicher.",
      "Name": "Name",
      "Necessary for the website to function properly. They allow you to add items to your shopping cart, securely log into your account, and complete your checkout.": "Notwendig, damit die Website ordnungsgemäß funktioniert. Sie ermöglichen es Ihnen, Artikel in Ihren Warenkorb zu legen, sich sicher in Ihr Konto einzuloggen und den Kaufvorgang abzuschließen.",
      "Need product or sizing guidance? Send us a message. For payment, delivery, returns, or an existing order, contact the Amazon or TikTok Shop support team shown in your order.": "Benötigen Sie Produkt- oder Größenberatung? Senden Sie uns eine Nachricht. Für Zahlungen, Lieferungen, Rücksendungen oder eine bestehende Bestellung wenden Sie sich an das in Ihrer Bestellung angegebene Support-Team von Amazon oder TikTok Shop.",
      "Nigeria Data Protection Act (NDPA) 2023": "Nigeria Data Protection Act (NDPA) 2023",
      "No pad wrappers to carry or dispose of at school.": "Keine Blockverpackungen, die in der Schule getragen oder entsorgt werden müssen.",
      "No questions match your search. Try another keyword, such as size, absorbency, or washing.": "Zu Ihrer Suche passen keine Fragen. Versuchen Sie es mit einem anderen Schlüsselwort, z. B. Größe, Saugfähigkeit oder Waschbarkeit.",
      "No, Hailaflo period underwear does not feel wet while you are wearing it.": "Nein, die Periodenunterwäsche von Hailaflo fühlt sich beim Tragen nicht nass an.",
      "No, Hailaflo period underwear is free from detectable PFAS (per- and polyfluoroalkyl substances).": "Nein, die Periodenunterwäsche von Hailaflo ist frei von nachweisbaren PFAS (Per- und Polyfluoralkylsubstanzen).",
      "No, Hailaflo period underwear will not smell while you are wearing it.": "Nein, die Periodenunterwäsche von Hailaflo riecht beim Tragen nicht.",
      "No, wearing period underwear cannot change your menstrual cycle or make your flow lighter.": "Nein, das Tragen von Periodenunterwäsche kann Ihren Menstruationszyklus nicht verändern oder Ihre Menstruation erleichtern.",
      "Normal, everyday flow": "Normaler, alltäglicher Fluss",
      "Note: We do not directly store your credit card or bank account details; all payments are securely processed by authorized third-party payment gateways (e.g., Paystack, Flutterwave, or Shopify Payments).": "Hinweis: Wir speichern Ihre Kreditkarten- oder Bankkontodaten nicht direkt; Alle Zahlungen werden sicher über autorisierte Zahlungsgateways von Drittanbietern verarbeitet (z. B. Paystack, Flutterwave oder Shopify Payments).",
      "OEKO-TEX® Standard 100": "OEKO-TEX® Standard 100",
      "OEKO-TEX® Standard 100 certification": "OEKO-TEX® Standard 100-Zertifizierung",
      "OEKO-TEX® certified": "OEKO-TEX® zertifiziert",
      "Odor & moisture control": "Geruchs- und Feuchtigkeitskontrolle",
      "On heavier days, or if the pair feels damp or full, change in a private place and store the used pair in the wet bag.": "An schwereren Tagen oder wenn sich das Paar feucht oder voll anfühlt, ziehen Sie es an einem privaten Ort um und bewahren Sie das gebrauchte Paar im Nassbeutel auf.",
      "Once the fluid passes through this top layer, it is locked tightly inside the absorbent core beneath it. Because the surface dries almost immediately, you won’t experience that cold, damp, or sticky sensation often associated with traditional disposable sanitary pads.": "Sobald die Flüssigkeit diese obere Schicht passiert, wird sie fest im darunter liegenden absorbierenden Kern eingeschlossen. Da die Oberfläche fast sofort trocknet, verspüren Sie nicht das Kälte-, Feuchtigkeits- oder Klebrigkeitsgefühl, das oft bei herkömmlichen Einweg-Damenbinden auftritt.",
      "Opened or Tried-On Items:": "Geöffnete oder anprobierte Artikel:",
      "Organic cotton blend": "Bio-Baumwollmischung",
      "Our": "Unser",
      "Our advanced fabric technology features four high-performance layers that work together seamlessly to keep you dry, fresh, and confident:": "Unsere fortschrittliche Stofftechnologie besteht aus vier Hochleistungsschichten, die nahtlos zusammenarbeiten, um Sie trocken, frisch und selbstbewusst zu halten:",
      "Our model is 180 cm tall and is wearing size M": "Unser Model ist 180 cm groß und trägt Größe M",
      "Our products are hygiene-sensitive. For processing times, shipping rates, return eligibility, exchanges, and damaged or incorrect items, please read our": "Unsere Produkte sind hygienesensibel. Für Bearbeitungszeiten, Versandkosten, Rückgaberecht, Umtausch sowie beschädigte oder falsche Artikel lesen Sie bitte unsere",
      "Our products hold the": "Unsere Produkte halten das",
      "Overview": "Überblick",
      "Pack a small pouch so your teen has what they need if they want to change during the school day:": "Packen Sie einen kleinen Beutel ein, damit Ihr Teenager alles hat, was er braucht, wenn er sich während des Schultages umziehen möchte:",
      "Parent ;& Teen Guide": "Leitfaden für Eltern und Jugendliche",
      "Pay attention to how they feel. Wear time depends on flow and absorbency, so check and change as needed.": "Achten Sie darauf, wie sie sich fühlen. Die Tragedauer hängt vom Durchfluss und der Saugfähigkeit ab. Überprüfen Sie sie daher und wechseln Sie sie bei Bedarf aus.",
      "Performance & Analytics Cookies:": "Leistungs- und Analyse-Cookies:",
      "Performance support engineered for active cycle days.": "Leistungsunterstützung speziell für Tage mit aktivem Zyklus.",
      "Period": "Zeitraum",
      "HailaFlo Period Starter Pack": "HailaFlo Perioden-Starterpaket",
      "A thoughtfully put-together kit with period underwear and useful care essentials.": "Ein sorgfältig zusammengestelltes Set mit Periodenunterwäsche und praktischen Pflege-Essentials.",
      "Explore on TikTok": "Auf TikTok ansehen",
      "Explore HailaFlo Period Starter Pack on TikTok": "HailaFlo Perioden-Starterpaket auf TikTok ansehen",
      "Period Activewear bridges lifestyle and performance with reliable absorbency and stretch-first comfort.": "Period Activewear verbindet Lifestyle und Leistung mit zuverlässiger Saugfähigkeit und Stretch-First-Komfort.",
      "Phone number": "Telefonnummer",
      "Pick based on your heaviest flow day. Light is ideal for spotting, Regular for everyday use, and Heavy or Super Heavy for overnight or high-flow days.": "Wählen Sie basierend auf Ihrem Tag mit dem stärksten Blutfluss. „Light“ ist ideal zum Spotting, „Regular“ für den täglichen Gebrauch und „Heavy“ oder „Super Heavy“ für die Nacht oder an Tagen mit hohem Blutfluss.",
      "Platform Sales:": "Plattformverkäufe:",
      "Pop them in the washing machine on a cold, gentle cycle (30°C to 40°C). You can wash them with your normal laundry.": "Geben Sie sie im kalten Schonwaschgang (30 °C bis 40 °C) in die Waschmaschine. Sie können sie mit Ihrer normalen Wäsche waschen.",
      "Postpartum Recovery Set provides soft structure, extended coverage, and absorbent peace of mind during early recovery.": "Das Postpartum Recovery Set bietet eine weiche Struktur, eine erweiterte Abdeckung und absorbierende Sicherheit während der frühen Genesung.",
      "Premium Outer Fabric Layer:": "Hochwertige äußere Stoffschicht:",
      "Prevents blood and fluid from seeping through, protecting your clothes and bedsheets from stains.": "Verhindert das Durchsickern von Blut und Flüssigkeit und schützt Ihre Kleidung und Bettwäsche vor Flecken.",
      "Pricing & Availability:": "Preise und Verfügbarkeit:",
      "Privacy at Hailaflo": "Datenschutz bei Hailaflo",
      "Pro-Tip to Keep Them Fresh": "Profi-Tipp, um sie frisch zu halten",
      "Process, package, and ship your orders in plain, discreet packaging.": "Verarbeiten, verpacken und versenden Sie Ihre Bestellungen in einer schlichten, diskreten Verpackung.",
      "Processing & Shipping:": "Abwicklung & Versand:",
      "Product 1": "Produkt 1",
      "Product Basics & Protection": "Produktgrundlagen und Schutz",
      "Product details": "Produktdetails",
      "Product information": "Produktinformationen",
      "Products & Pricing": "Produkte und Preise",
      "Provides the final structural layer of security while looking and feeling exactly like high-quality, everyday underwear.": "Bietet die letzte strukturelle Sicherheitsschicht und sieht und fühlt sich genauso an wie hochwertige Alltagsunterwäsche.",
      "Purchases & Payment": "Einkäufe und Zahlung",
      "Purchases are completed through Amazon or TikTok Shop.": "Käufe werden über Amazon oder den TikTok Shop abgewickelt.",
      "Put them on in the morning": "Zieh sie morgens an",
      "Quick answers about absorbency, fit, care, and shipping so you can shop HailaFlo with confidence.": "Schnelle Antworten zu Saugfähigkeit, Passform, Pflege und Versand, damit Sie HailaFlo beruhigt kaufen können.",
      "Quick-drying outer fabric keeps the short feeling light during movement.": "Das schnell trocknende Obermaterial sorgt dafür, dass sich die Shorts bei Bewegung leicht anfühlen.",
      "Quick-rinse fabrics support clean transitions from water to dry wear.": "Schnell abwaschbare Stoffe unterstützen saubere Übergänge vom Wasser zum Trockenkleidungsstück.",
      "Rapidly pulls fluid away from your skin, ensuring you feel completely dry, fresh, and comfortable.": "Entzieht Ihrer Haut schnell Flüssigkeit und sorgt dafür, dass Sie sich vollkommen trocken, frisch und angenehm fühlen.",
      "Read guide": "Leitfaden lesen",
      "Recommended Starter Set by Flow": "Empfohlenes Starterset von Flow",
      "Rectify or update": "Korrigieren oder aktualisieren",
      "Regular Flow": "Regelmäßiger Fluss",
      "Regular-Heavy Flow": "Normal-starker Fluss",
      "Relaxed fit with reliable leak protection and wider coverage.": "Entspannte Passform mit zuverlässigem Auslaufschutz und breiterer Abdeckung.",
      "Remember choices you make, such as your preferred language or region, to provide a more personalized shopping experience.": "Merken Sie sich die von Ihnen getroffenen Entscheidungen, beispielsweise Ihre bevorzugte Sprache oder Region, um ein persönlicheres Einkaufserlebnis zu ermöglichen.",
      "Remove HailaFlo Active filter": "Entfernen Sie den HailaFlo Active-Filter",
      "Remove Heavy filter": "Entfernen Sie den Heavy-Filter",
      "Remove Light filter": "Entfernen Sie den Lichtfilter",
      "Remove Other filter": "Entfernen Sie den Filter „Andere“.",
      "Remove Period Underwear filter": "Entfernen Sie den Filter „Periodenunterwäsche“.",
      "Remove Postpartum filter": "Entfernen Sie den Postpartum-Filter",
      "Remove Regular filter": "Entfernen Sie den regulären Filter",
      "Remove Super Heavy filter": "Entfernen Sie den Super Heavy-Filter",
      "Reshape the garment and hang or lay it flat in a ventilated place. Make sure it is completely dry before storing.": "Formen Sie das Kleidungsstück um und hängen oder legen Sie es flach an einen belüfteten Ort. Stellen Sie sicher, dass es vollständig trocken ist, bevor Sie es lagern.",
      "Returns & Exchanges Policy": "Rückgabe- und Umtauschrichtlinien",
      "Returns and size exchanges are handled by the marketplace where you placed your order. Review the Amazon or TikTok Shop policy shown on the product listing before purchasing.": "Rücksendungen und Größenumtausch werden über den Marktplatz abgewickelt, auf dem Sie Ihre Bestellung aufgegeben haben. Lesen Sie vor dem Kauf die in der Produktliste aufgeführten Amazon- oder TikTok-Shop-Richtlinien.",
      "Reusable & sustainable": "Wiederverwendbar und nachhaltig",
      "Reusable Period Care": "Wiederverwendbare Periodenpflege",
      "Rinse cold": "Kalt ausspülen",
      "Rinse in cold water first, machine wash on a gentle cycle, and air dry. Avoid fabric softeners and high heat to protect absorbency performance.": "Zuerst in kaltem Wasser abspülen, im Schonwaschgang in der Maschine waschen und an der Luft trocknen. Vermeiden Sie Weichspüler und hohe Hitze, um die Saugfähigkeit zu schützen.",
      "Rinse under cold tap water until it runs clear, then follow the garment's care instructions.": "Unter kaltem Leitungswasser abspülen, bis es klar ist, und dann die Pflegehinweise des Kleidungsstücks befolgen.",
      "Sage": "Salbei",
      "Search": "Suchen",
      "Search FAQ questions": "Suchen Sie nach FAQ-Fragen",
      "Search questions, e.g. absorbency, size, washing...": "Suchfragen, z.B. Saugfähigkeit, Größe, Waschen...",
      "Secure fit:": "Sicherer Sitz:",
      "Send": "Schicken",
      "Send you order updates, tracking information, and customer support communications.": "Senden Sie Ihnen Bestellaktualisierungen, Tracking-Informationen und Kundensupport-Mitteilungen.",
      "Shipping & Delivery": "Versand & Lieferung",
      "Shipping & Returns": "Versand und Rücksendungen",
      "Shipping Rates:": "Versandkosten:",
      "Shipping, Returns & Exchanges": "Versand, Rückgabe und Umtausch",
      "Shipping, Returns & Exchanges Policy": "Versand-, Rückgabe- und Umtauschbedingungen",
      "Shop HailaFlo on TikTok Shop": "Kaufen Sie HailaFlo im TikTok Shop",
      "Shop Period Underwear": "Kaufen Sie Periodenunterwäsche",
      "Shopping Policies": "Einkaufsrichtlinien",
      "Simple guidance for choosing, wearing, washing, and storing your HailaFlo period underwear.": "Einfache Anleitung zum Auswählen, Tragen, Waschen und Aufbewahren Ihrer HailaFlo-Periodenunterwäsche.",
      "Single product page": "Einzelne Produktseite",
      "Size": "Größe",
      "Size & Shape": "Größe und Form",
      "Sleeve Length (inches)": "Ärmellänge (Zoll)",
      "Small": "Klein",
      "Small Rotation (Lasts 3 Years):": "Kleine Rotation (dauert 3 Jahre):",
      "Smooth and invisible. You won't feel any bulkiness or the \"crinkling\" sound of plastic disposable pads when you walk.": "Glatt und unsichtbar. Beim Gehen werden Sie weder ein voluminöses Tragegefühl noch das „knisternde“ Geräusch der Einwegeinlagen aus Kunststoff spüren.",
      "Soft edge seams reduce pressure and help prevent digging around the waist and legs.": "Weiche Kantennähte reduzieren den Druck und verhindern ein Einschneiden an Taille und Beinen.",
      "Soft jersey": "Weicher Jersey",
      "Soft, breathable fabric with a smooth, second-skin fit.": "Weiches, atmungsaktives Material mit einer glatten Passform wie eine zweite Haut.",
      "Soft, stretchy comfort for everyday wear with reliable leak protection.": "Weicher, dehnbarer Tragekomfort für den Alltag mit zuverlässigem Auslaufschutz.",
      "Soft-touch waistband and seams are designed to feel gentle on sensitive skin.": "Der Soft-Touch-Bund und die Nähte sind so konzipiert, dass sie sich sanft auf empfindlicher Haut anfühlen.",
      "Sort products": "Produkte sortieren",
      "Spotting, discharge, lighter cycle days, or backup protection.": "Spotting-, Entladungs-, Tage mit leichterem Zyklus oder Backup-Schutz.",
      "Standard": "Standard",
      "Step 1: Rinse.": "Schritt 1: Spülen.",
      "Step 2: Wash.": "Schritt 2: Waschen.",
      "Step 3: Skip the Additives.": "Schritt 3: Überspringen Sie die Zusatzstoffe.",
      "Step 4: Air Dry.": "Schritt 4: Lufttrocknen.",
      "Still deciding what works for you?": "Überlegen Sie immer noch, was für Sie funktioniert?",
      "Store with care": "Vorsichtig aufbewahren",
      "Streamlined silhouette offers active support with minimal bulk.": "Die stromlinienförmige Silhouette bietet aktiven Halt bei minimalem Volumen.",
      "Stretchy Briefs combine breathable fabric and absorbent layers for a smooth, secure fit from morning to night.": "Dehnbare Slips kombinieren atmungsaktives Material und saugfähige Schichten für einen glatten, sicheren Sitz von morgens bis abends.",
      "Support": "Unterstützung",
      "Supporting your child through their first period is a big milestone. With preparation and a plan, you can help them feel more confident and ready for the day.": "Die Unterstützung Ihres Kindes während seiner ersten Periode ist ein großer Meilenstein. Mit Vorbereitung und einem Plan können Sie ihnen helfen, sich selbstbewusster und bereit für den Tag zu fühlen.",
      "Supportive inner layer helps keep protection centered while you train.": "Die stützende Innenschicht sorgt dafür, dass der Schutz während des Trainings zentriert bleibt.",
      "Swap if needed": "Bei Bedarf austauschen",
      "Sweat-managing and absorbent layers work together for dry, focused training.": "Schweißregulierende und absorbierende Schichten sorgen gemeinsam für ein trockenes, konzentriertes Training.",
      "Swimwear combines secure fit construction with absorbent protection designed for confidence in and around water.": "Badebekleidung kombiniert eine sichere Passform mit absorbierendem Schutz und sorgt für Sicherheit im und am Wasser.",
      "Switch to Hailaflo for reliable,": "Wechseln Sie zu Hailaflo für zuverlässige,",
      "Tampon Equivalent": "Tampon-Äquivalent",
      "Targeting & Advertising Cookies:": "Targeting- und Werbe-Cookies:",
      "Technical and Usage Data:": "Technische Daten und Nutzungsdaten:",
      "Terms for using the Hailaflo website and information about cookies.": "Bedingungen für die Nutzung der Hailaflo-Website und Informationen zu Cookies.",
      "Terms of Service (Terms & Conditions)": "Nutzungsbedingungen (Allgemeine Geschäftsbedingungen)",
      "Thank you for reaching out. We’ll be in touch as soon as we can.": "Vielen Dank, dass Sie sich gemeldet haben. Wir werden uns so schnell wie möglich mit Ihnen in Verbindung setzen.",
      "The": "Der",
      "The Cleanup:": "Die Bereinigung:",
      "The Fit:": "Die Passform:",
      "The Magic:": "Die Magie:",
      "The Moisture-Wicking Top Layer": "Die feuchtigkeitsableitende Oberschicht",
      "The Reality:": "Die Realität:",
      "The Routine:": "Die Routine:",
      "The Silhouette:": "Die Silhouette:",
      "The Ultimate First Period Guide: A Parent's Guide to Stress-Free Cycles": "Der ultimative Leitfaden für die erste Periode: Ein Leitfaden für Eltern für stressfreie Zyklen",
      "The fit is too loose:": "Die Passform ist zu locker:",
      "The gusset should lie close to the body without gaps.": "Der Zwickel sollte lückenlos eng am Körper anliegen.",
      "The secret lies in our advanced": "Das Geheimnis liegt in unserem Fortschritt",
      "The waistband should sit securely without digging in.": "Der Bund sollte fest sitzen, ohne einzuschneiden.",
      "These Terms of Service are governed by and construed in accordance with the laws of": "Diese Nutzungsbedingungen unterliegen den Gesetzen von und werden in Übereinstimmung mit diesen ausgelegt",
      "These Terms of Service govern your use of our website and the purchase of any Hailaflo products. By accessing our site or placing an order, you agree to be bound by these terms.": "Diese Nutzungsbedingungen regeln Ihre Nutzung unserer Website und den Kauf von Hailaflo-Produkten. Indem Sie auf unsere Website zugreifen oder eine Bestellung aufgeben, erklären Sie sich mit diesen Bedingungen einverstanden.",
      "They have reached full capacity:": "Sie haben ihre volle Kapazität erreicht:",
      "They will feel snugly secure around your waist and leg openings. This snug fit is exactly what ensures": "Sie liegen bequem und sicher an Ihren Taillen- und Beinöffnungen an. Genau dieser gute Sitz sorgt dafür",
      "Third-Party Cookies": "Cookies von Drittanbietern",
      "This period underwear brief is designed for comfort, leak protection, and all-day confidence. Made with a breathable absorbent core to ensure comfort and durability.": "Dieser Periodenunterwäsche-Slip ist auf Komfort, Auslaufschutz und ganztägiges Selbstvertrauen ausgelegt. Hergestellt mit einem atmungsaktiven, saugfähigen Kern, um Komfort und Haltbarkeit zu gewährleisten.",
      "This period underwear brief is made by": "Dieser Periodenunterwäsche-Slip wird hergestellt von",
      "This policy is written in strict compliance with the": "Diese Richtlinie wurde in strikter Übereinstimmung mit der verfasst",
      "TikTok": "TikTok",
      "TikTok Shop": "TikTok-Shop",
      "To comply with strict health and safety regulations, our reusable period underwear is classified as a hygiene-sensitive item.": "Um den strengen Gesundheits- und Sicherheitsvorschriften zu entsprechen, ist unsere wiederverwendbare Periodenunterwäsche als hygienesensibler Artikel eingestuft.",
      "To ensure your underwear never develops a post-wash, musty scent,": "Um sicherzustellen, dass Ihre Unterwäsche nach dem Waschen keinen muffigen Geruch entwickelt,",
      "To get the ultimate": "Um das Ultimative zu erreichen",
      "To guarantee": "Zu garantieren",
      "To prevent leaks, it is essential to choose the right fit and the correct absorbency level for your menstrual cycle. We offer a range of styles designed for everything from light spotting to a": "Um Auslaufen zu vermeiden, wähle die passende Passform und Saugstärke für deinen Zyklus. Unsere Modelle reichen von leichten Schmierblutungen bis hin zu",
      "To respect your privacy, all Hailaflo orders are delivered in plain, unbranded packaging.": "Um Ihre Privatsphäre zu respektieren, werden alle Hailaflo-Bestellungen in einer schlichten Verpackung ohne Markenzeichen geliefert.",
      "Toxin-Free Comfort:": "Giftfreier Komfort:",
      "Transaction and Financial Data:": "Transaktions- und Finanzdaten:",
      "Traps and locks in liquid using advanced capillary action to handle everything from light spotting to a": "Bindet Flüssigkeit mithilfe der Kapillarwirkung und hält sie sicher zurück – von leichten Schmierblutungen bis hin zu",
      "Trusted local and international courier services to ensure your orders arrive safely at your doorstep.": "Zuverlässige lokale und internationale Kurierdienste sorgen dafür, dass Ihre Bestellungen sicher vor Ihrer Haustür ankommen.",
      "Tumble drying": "Trocknergeeignet",
      "Ultra-heavy days and maximum security": "Ultraschwere Tage und maximale Sicherheit",
      "Unlike conventional disposable pads that feature plastic backings that trap heat, sweat, and moisture, Hailaflo is crafted from": "Im Gegensatz zu herkömmlichen Einweg-Einlagen, die über eine Kunststoffrückseite verfügen, die Wärme, Schweiß und Feuchtigkeit einfängt, ist Hailaflo aus Material gefertigt",
      "Unopened & Sealed Items:": "Ungeöffnete und versiegelte Artikel:",
      "Used to deliver relevant advertisements to you on other platforms (like Instagram, Facebook, or TikTok) based on your browsing habits on our store.": "Wird verwendet, um Ihnen relevante Werbung auf anderen Plattformen (wie Instagram, Facebook oder TikTok) basierend auf Ihren Surfgewohnheiten in unserem Shop anzuzeigen.",
      "Versatile activewear designed for period days and busy routines.": "Vielseitige Aktivkleidung für Menstruationstage und geschäftige Routinen.",
      "View size chart": "Größentabelle ansehen",
      "Visit the FAQs": "Besuchen Sie die FAQs",
      "Waist (inches)": "Taille (Zoll)",
      "Wash gently": "Vorsichtig waschen",
      "Washable and long-lasting. one pair replaces months of disposables.": "Waschbar und langlebig. Ein Paar ersetzt monatelange Einwegartikel.",
      "Washing": "Waschen",
      "Water-ready protection without compromising style.": "Wasserfester Schutz ohne Kompromisse beim Stil.",
      "Waterproof Leak-Proof Barrier:": "Wasserdichte, auslaufsichere Barriere:",
      "We are preparing our Activewear, Postpartum, and other collections. In the meantime, explore our available period underwear.": "Wir bereiten unsere Activewear-, Postpartum- und andere Kollektionen vor. Entdecken Sie in der Zwischenzeit unsere verfügbare Periodenunterwäsche.",
      "We collect personal information that you voluntarily provide to us when purchasing our products or communicating with us. This includes:": "Wir erfassen personenbezogene Daten, die Sie uns beim Kauf unserer Produkte oder bei der Kommunikation mit uns freiwillig zur Verfügung stellen. Dazu gehört:",
      "We do not sell, rent, or trade your personal information. To fulfill your orders and manage our international logistics, your data is securely shared with:": "Wir verkaufen, vermieten oder handeln Ihre persönlichen Daten nicht. Um Ihre Bestellungen zu erfüllen und unsere internationale Logistik zu verwalten, werden Ihre Daten sicher weitergegeben an:",
      "We implement strict physical, electronic, and administrative security measures to protect your personal data against unauthorized access, loss, or manipulation. In accordance with Nigerian and EU data laws, we only retain your personal data for as long as necessary to fulfill the business purposes for which it was collected, or to satisfy legal, accounting, and regulatory reporting requirements.": "Wir setzen strenge physische, elektronische und administrative Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Verlust oder Manipulation zu schützen. Gemäß den nigerianischen und EU-Datengesetzen bewahren wir Ihre personenbezogenen Daten nur so lange auf, wie es zur Erfüllung der Geschäftszwecke, für die sie erhoben wurden, oder zur Erfüllung gesetzlicher, buchhalterischer und behördlicher Meldepflichten erforderlich ist.",
      "We make every effort to display the colors and features of our 4-layer period underwear as accurately as possible. However, your screen display may slightly alter colors.": "Wir bemühen uns, die Farben und Eigenschaften unserer 4-lagigen Periodenunterwäsche so genau wie möglich darzustellen. Allerdings kann es bei der Bildschirmdarstellung zu geringfügigen Farbveränderungen kommen.",
      "We process your personal data under lawful bases recognized by the NDPA and GDPR to fulfill our contract with you and improve our services. We use this data to:": "Wir verarbeiten Ihre personenbezogenen Daten auf der Grundlage der vom NDPA und der DSGVO anerkannten Rechtsgrundlagen, um unseren Vertrag mit Ihnen zu erfüllen und unsere Dienstleistungen zu verbessern. Wir verwenden diese Daten, um:",
      "We reserve the right to modify prices, update product descriptions, or discontinue items at any time without prior notice.": "Wir behalten uns das Recht vor, Preise jederzeit und ohne vorherige Ankündigung zu ändern, Produktbeschreibungen zu aktualisieren oder Artikel einzustellen.",
      "We reserve the right to update or modify these Terms of Service at any time. Your continued use of our website following any changes constitutes acceptance of those updates.": "Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu aktualisieren oder zu ändern. Wenn Sie unsere Website nach etwaigen Änderungen weiterhin nutzen, akzeptieren Sie diese Aktualisierungen.",
      "We use cookies to improve your browsing and shopping experience in the following ways:": "Wir verwenden Cookies, um Ihr Surf- und Einkaufserlebnis auf folgende Weise zu verbessern:",
      "We want to get your": "Wir wollen Ihr bekommen",
      "We're here for you": "Wir sind für Sie da",
      "Wear them like regular underwear and check that the fit feels secure and comfortable.": "Tragen Sie sie wie normale Unterwäsche und achten Sie darauf, dass sie sicher und bequem sitzt.",
      "Wearing period underwear on your heaviest days, using them exclusively for overnight security, or doing quick mid-week laundry loads.": "Tragen Sie an Ihren anstrengendsten Tagen Periodenunterwäsche, verwenden Sie sie ausschließlich zur Sicherheit über Nacht oder erledigen Sie schnelle Wäscheladungen unter der Woche.",
      "Welcome to Hailaflo": "Willkommen bei Hailaflo",
      "What Are Cookies?": "Was sind Cookies?",
      "What is Hailaflo Period Underwear and how does it work?": "Was ist Hailaflo Periodenunterwäsche und wie funktioniert sie?",
      "What it feels like:": "Wie es sich anfühlt:",
      "What to Expect on Your First Day Wearing Hailaflo": "Was Sie an Ihrem ersten Tag mit Hailaflo erwarten können",
      "What to expect when your Hailaflo order is on its way, and how returns and exchanges work.": "Was Sie erwartet, wenn Ihre Hailaflo-Bestellung unterwegs ist und wie Rückgabe und Umtausch funktionieren.",
      "When performance changes:": "Wenn sich die Leistung ändert:",
      "When to change:": "Wann ändern:",
      "When you shop with us, third-party services—such as Google Analytics, Shopify Payments, or the TikTok Pixel—may also place cookies on your device to facilitate smooth checkout transactions and track advertising campaign performance.": "Wenn Sie bei uns einkaufen, können auch Dienste von Drittanbietern – wie Google Analytics, Shopify Payments oder TikTok Pixel – Cookies auf Ihrem Gerät platzieren, um reibungslose Checkout-Transaktionen zu ermöglichen und die Leistung von Werbekampagnen zu verfolgen.",
      "When you take them off, just run the gusset under cold tap water in the sink or shower. Squeeze it gently until the water runs completely clear, then pop them into your laundry basket or washing machine!": "Wenn Sie sie abnehmen, halten Sie den Zwickel einfach unter kaltem Leitungswasser im Waschbecken oder in der Dusche. Drücken Sie es vorsichtig zusammen, bis das Wasser völlig klar ist, und legen Sie es dann in Ihren Wäschekorb oder Ihre Waschmaschine!",
      "White": "Weiß",
      "Why might they ever feel wet?": "Warum könnten sie sich jemals nass anfühlen?",
      "Why period underwear can help with first periods": "Warum Periodenunterwäsche bei der ersten Periode helfen kann",
      "Wicking layers stay fresh so you feel clean all cycle.": "Die feuchtigkeitsableitenden Schichten bleiben frisch, sodass Sie sich den ganzen Zyklus über sauber fühlen.",
      "With proper care,": "Bei richtiger Pflege",
      "With your explicit consent, send you promotional emails, product launch newsletters, or targeted advertisements on social media platforms like Instagram and TikTok.": "Senden Sie Ihnen mit Ihrer ausdrücklichen Zustimmung Werbe-E-Mails, Newsletter zur Produkteinführung oder gezielte Werbung auf Social-Media-Plattformen wie Instagram und TikTok.",
      "Withdraw Consent": "Einwilligung widerrufen",
      "Would my period pant smell?": "Riecht meine Periodenunterwäsche beim Tragen unangenehm?",
      "X": "X",
      "X-Large": "XL",
      "Yes. The fit is designed to stay secure through movement, while layered gusset construction helps keep you dry and comfortable for extended wear.": "Ja. Die Passform ist so konzipiert, dass sie bei Bewegungen sicher bleibt, während die geschichtete Zwickelkonstruktion dafür sorgt, dass Sie auch bei längerem Tragen trocken und komfortabel bleiben.",
      "You agree to provide current, complete, and accurate purchase and account information for all orders. We accept major credit cards, debit cards, and authorized digital payment gateways. We reserve the right to refuse or cancel any order if fraudulent or unauthorized activity is suspected.": "Sie erklären sich damit einverstanden, für alle Bestellungen aktuelle, vollständige und genaue Kauf- und Kontoinformationen anzugeben. Wir akzeptieren gängige Kreditkarten, Debitkarten und autorisierte digitale Zahlungsgateways. Wir behalten uns das Recht vor, Bestellungen abzulehnen oder zu stornieren, wenn der Verdacht betrügerischer oder unbefugter Aktivitäten besteht.",
      "You have": "Du hast",
      "You have the right to accept or decline optional cookies. You can adjust your cookie preferences through the interactive cookie banner popup when you first visit our site. Alternatively, you can modify your web browser settings to block or delete cookies entirely. Please note that disabling essential cookies may impact your ability to use certain features of our online store, including the shopping cart.": "Sie haben das Recht, optionale Cookies zu akzeptieren oder abzulehnen. Sie können Ihre Cookie-Einstellungen über das interaktive Cookie-Banner-Popup anpassen, wenn Sie unsere Website zum ersten Mal besuchen. Alternativ können Sie die Einstellungen Ihres Webbrowsers ändern, um Cookies vollständig zu blockieren oder zu löschen. Bitte beachten Sie, dass die Deaktivierung wesentlicher Cookies Ihre Fähigkeit zur Nutzung bestimmter Funktionen unseres Online-Shops, einschließlich des Warenkorbs, beeinträchtigen kann.",
      "You may also like": "Vielleicht gefällt es Ihnen auch",
      "You might automatically find yourself going to the bathroom to check for leaks out of habit. When you do, you will see that the top layer looks and feels remarkably dry, and there is absolutely zero odour.": "Möglicherweise gehen Sie aus Gewohnheit automatisch auf die Toilette, um nach Undichtigkeiten zu suchen. Wenn Sie dies tun, werden Sie feststellen, dass die oberste Schicht bemerkenswert trocken aussieht und sich auch so anfühlt, und dass es überhaupt keinen Geruch gibt.",
      "You wash and dry your pairs quickly during the week so you can reuse them before your cycle ends.": "Sie waschen und trocknen Ihre Paare unter der Woche schnell, damit Sie sie vor dem Ende Ihres Zyklus wiederverwenden können.",
      "You wear": "Du trägst",
      "Your IP address, browser type, device information, and details about how you browse and interact with our online storefront.": "Ihre IP-Adresse, Browsertyp, Geräteinformationen und Details darüber, wie Sie in unserem Online-Shop surfen und mit ihm interagieren.",
      "Your flow can change throughout your cycle. Match each pair to when and how you plan to wear it, and keep a higher-absorbency option available for heavier hours or overnight use.": "Ihr Fluss kann sich im Laufe Ihres Zyklus ändern. Stimmen Sie jedes Paar darauf ab, wann und wie Sie es tragen möchten, und halten Sie eine Option mit höherer Saugfähigkeit für längere Stunden oder den Einsatz über Nacht bereit.",
      "Your full name, delivery address, billing address, email address, and phone number.": "Ihr vollständiger Name, Lieferadresse, Rechnungsadresse, E-Mail-Adresse und Telefonnummer.",
      "Your period is regulated entirely by your internal hormones, your genetics, and your reproductive health. No external menstrual product—whether it is a disposable pad, a tampon, a menstrual cup, or": "Ihre Periode wird vollständig von Ihren inneren Hormonen, Ihrer Genetik und Ihrer reproduktiven Gesundheit reguliert. Kein externes Menstruationsprodukt – sei es eine Einwegbinde, ein Tampon, eine Menstruationstasse o.ä",
      "[Insert Your Country/State, e.g., the United Kingdom]": "[Geben Sie Ihr Land/Ihren Staat ein, z. B. das Vereinigte Königreich]",
      "a copy of the personal data we hold about you.": "eine Kopie der personenbezogenen Daten, die wir über Sie gespeichert haben.",
      "absorb your flow directly, giving you complete peace of mind and sustainable comfort all day long.": "den Menstruationsfluss direkt auf und bieten dir den ganzen Tag Sicherheit und nachhaltigen Komfort.",
      "across a typical 5-day cycle, we recommend a balanced mix of absorbencies:": "Über einen typischen 5-Tage-Zyklus hinweg empfehlen wir eine ausgewogene Mischung von Absorptionsmitteln:",
      "actively prevents odour from developing:": "verhindert aktiv die Entstehung von Gerüchen:",
      "advanced 4-layer technology": "fortschrittliche 4-Lagen-Technologie",
      "alongside a menstrual cup or tampon.": "neben einer Menstruationstasse oder einem Tampon.",
      "and keeps the 4-layer gusset pressed comfortably against your body.": "und hält den 4-lagigen Zwickel angenehm an Ihren Körper gedrückt.",
      "and the European Union's": "und der Europäischen Union",
      "at any time from our marketing emails by clicking the \"Unsubscribe\" link at the bottom of any message.": "Sie können unsere Marketing-E-Mails jederzeit abbestellen, indem Sie am Ende jeder Nachricht auf den Link „Abbestellen“ klicken.",
      "by requesting that we permanently delete your data, provided it is no longer required for legal or contractual fulfillment.": "indem Sie uns auffordern, Ihre Daten dauerhaft zu löschen, sofern diese nicht mehr für die gesetzliche oder vertragliche Erfüllung erforderlich sind.",
      "cannot be returned or exchanged": "Eine Rückgabe oder ein Umtausch ist nicht möglich",
      "contact us": "Kontaktieren Sie uns",
      "designed to replace traditional pads and tampons. Engineered with a built-in, 4-layer gusset, our": "die herkömmliche Binden und Tampons ersetzt. Mit ihrem integrierten, 4-lagigen Zwickel nehmen unsere",
      "eco-friendly menstrual products": "umweltfreundlichen Menstruationsprodukte",
      "eco-friendly period": "umweltfreundliche Zeit",
      "feel": "fühlen",
      "filter arrow": "Filterpfeil",
      "heavy flow": "starken Menstruationsblutungen",
      "immediately. We will arrange a replacement or refund right away.": "sofort. Wir werden umgehend einen Ersatz oder eine Rückerstattung veranlassen.",
      "inaccurate or incomplete personal data.": "unrichtige oder unvollständige personenbezogene Daten.",
      "is exciting, but it is completely normal to feel a little nervous or skeptical before your first day. To give you total peace of mind, here is exactly what your first day with Hailaflo will look and feel like.": "ist aufregend, aber es ist völlig normal, vor dem ersten Tag etwas nervös oder skeptisch zu sein. Um Ihnen völlige Sicherheit zu geben, erfahren Sie hier genau, wie Ihr erster Tag mit Hailaflo aussehen und sich anfühlen wird.",
      "is highly effective and designed to give you ultimate": "ist hochwirksam und darauf ausgelegt, Ihnen das Beste zu bieten",
      "is one of the world's best-known labels for textiles tested for harmful substances. For Hailaflo, this means that every single component of our": "ist eines der weltweit bekanntesten Labels für schadstoffgeprüfte Textilien. Für Hailaflo bedeutet das, dass jede einzelne Komponente unseres",
      "is simple! Proper care ensures that your 4-layer leak-proof technology stays highly effective and lasts for years. Just follow these four easy steps:": "ist einfach! Die richtige Pflege stellt sicher, dass Ihre 4-lagige auslaufsichere Technologie hochwirksam bleibt und jahrelang hält. Befolgen Sie einfach diese vier einfachen Schritte:",
      "is the ultimate": "ist eine hochwertige",
      "leak-proof protection": "auslaufsicherer Schutz",
      "lighter, shorter, and much more comfortable. Here is why:": "leichter, kürzer und viel bequemer. Hier ist der Grund:",
      "moisture-wicking top layer": "feuchtigkeitsableitende Oberschicht",
      "never use fabric softeners": "Verwenden Sie niemals Weichspüler",
      "not": "nicht",
      "of": "von",
      "rapidly pulls menstrual fluid away from your skin and dries almost instantly.": "Zieht die Menstruationsflüssigkeit schnell von der Haut ab und trocknet fast sofort.",
      "reusable period underwear": "wiederverwendbare Periodenunterwäsche,",
      "stain-free protection": "fleckenfreier Schutz",
      "stain-free, eco-friendly period": "fleckenfreie, umweltfreundliche Zeit",
      "support@hailaflo.com": "support@hailaflo.com",
      "sustainable period care": "Nachhaltige Periodenpflege",
      "that protects both you and the planet.": "Das schützt Sie und den Planeten.",
      "to request a return or exchange for a full refund. To be eligible, the item must be completely unworn, unwashed, and remain": "um eine Rückgabe oder einen Umtausch gegen eine vollständige Rückerstattung zu beantragen. Um teilnahmeberechtigt zu sein, muss der Artikel vollständig ungetragen und ungewaschen sein",
      "to request a transfer of your data to another service provider.": "eine Übermittlung Ihrer Daten an einen anderen Dienstleister zu verlangen.",
      "to you as quickly as possible!": "so schnell wie möglich bei Ihnen!",
      "toxin-free menstrual products": "Toxinfreie Menstruationsprodukte",
      "underwear removes that chemical irritation completely.": "Unterwäsche beseitigt diese chemische Reizung vollständig.",
      "use fabric softener, bleach, or stain removers. These can coat the fibers and destroy the built-in absorbent core.": "Verwenden Sie Weichspüler, Bleichmittel oder Fleckentferner. Diese können die Fasern umhüllen und den eingebauten Saugkern zerstören.",
      "uses an instant-dry moisture-wicking top layer. Because it pulls fluid away from your skin immediately, you don't feel the blood pooling, creating the sensation of a lighter, cleaner cycle.": "verwendet eine sofort trocknende, feuchtigkeitsableitende Oberschicht. Da die Flüssigkeit sofort von der Haut weggezogen wird, spüren Sie nicht, wie sich das Blut ansammelt, wodurch das Gefühl eines leichteren, saubereren Zyklus entsteht.",
      "with total confidence, knowing they are completely safe for your body.": "mit vollem Vertrauen und dem Wissen, dass sie für Ihren Körper völlig sicher sind.",
      "without doing laundry every single day.": "ohne jeden Tag Wäsche zu waschen.",
      "~12 regular pads": "~12 normale Pads",
      "~2 regular Pads": "~2 normale Pads",
      "~4 regular Pads": "~4 normale Pads",
      "~8 regular pads": "~8 normale Pads",
      "© 2026 HailaFlo. All rights reserved.": "© 2026 HailaFlo. Alle Rechte vorbehalten.",
      "– For complete, worry-free overnight protection and ultra-heavy days.": "– Für umfassenden, sorgenfreien Schutz über Nacht und an extrem anstrengenden Tagen.",
      "– For your light to moderate days at the start and end of your cycle.": "– Für Ihre leichten bis mittelschweren Tage zu Beginn und am Ende Ihres Zyklus.",
      "– For your peak daytime flow and reliable work/school wear.": "– Für Ihren besten Tagesfluss und zuverlässige Arbeits-/Schulkleidung.",
      "—from the moisture-wicking top layer down to the threads and elastics—is certified free from dangerous levels of toxins, PFAS, heavy metals, and formaldehyde. You can wear our": "– von der feuchtigkeitsableitenden Oberschicht bis hin zu den Fäden und Gummibändern – ist zertifiziert frei von gefährlichen Mengen an Giftstoffen, PFAS, Schwermetallen und Formaldehyd. Sie können unsere tragen",
      "—has the ability to influence your actual internal uterine lining shedding.": "– hat die Fähigkeit, die tatsächliche Ablösung der inneren Gebärmutterschleimhaut zu beeinflussen.",
      "—is made from a high-performance fabric that pulls liquid away from your skin instantly.": "– besteht aus einem Hochleistungsgewebe, das Flüssigkeit sofort von Ihrer Haut wegzieht.",
      "☀️ Afternoon: The \"Dryness Check\"": "☀️ Nachmittag: Der „Trockenheits-Check“",
      "﻿": "﻿",
      "🌅 Morning: Putting Them On": "🌅 Morgen: Anziehen",
      "🌆 Evening: Changing and Rinsing": "🌆 Abends: Umziehen und Spülen",
      "🍬 A comforting snack, if school rules allow.": "🍬 Ein beruhigender Snack, wenn die Schulregeln es zulassen.",
      "🎒 School Bag Essentials": "🎒 Schultaschen-Essentials",
      "👩‍🏫 Simple Instructions for Your Teen": "👩‍🏫 Einfache Anleitung für Ihren Teenager",
      "🗓️ Starting Their First Collection": "🗓️ Starten ihrer ersten Kollektion",
      "🛍️ A small waterproof wet bag for a used pair until they get home.": "🛍️ Eine kleine wasserdichte Nasstasche für ein gebrauchtes Paar, bis es nach Hause kommt.",
      "🧴 Travel wipes for extra freshness; dispose of wipes in a bin, not the toilet.": "🧴 Reisetücher für zusätzliche Frische; Entsorgen Sie die Tücher in einem Mülleimer und nicht in der Toilette.",
      "🩲 1 Heavy Plus pair for overnight use or heavier flow.": "🩲 1 Paar Heavy Plus für den Einsatz über Nacht oder stärkeren Durchfluss.",
      "🩲 2 Regular Flow pairs for lighter days or the days leading up to a period.": "🩲 2 Regular Flow-Paare für leichtere Tage oder die Tage vor einer Periode.",
      "🩲 2 Regular-Heavy Flow pairs for longer school days.": "🩲 2 Regular-Heavy Flow-Paare für längere Schultage.",
      "🩸": "🩸",
      "🩸🩸": "🩸🩸",
      "🩸🩸🩸": "🩸🩸🩸",
      "🩺 A fresh pair of Hailaflo underwear in an absorbency that suits their flow.": "🩺 Ein frisches Paar Hailaflo-Unterwäsche in einer Saugfähigkeit, die zu ihrem Flow passt.",
    },
    fr: {

      "! On average, our advanced 4-layer technology is built to maintain its maximum, high-performance absorbency for at least": "! En moyenne, notre technologie avancée à 4 couches est conçue pour maintenir sa capacité d'absorption maximale et haute performance pendant au moins",
      "(one for daytime and one for overnight protection), rinsing them after use and washing the entire set at the end of your cycle.": "(un pour la protection de jour et un pour la protection de nuit), en les rinçant après utilisation et en lavant l'ensemble à la fin de votre cycle.",
      ",": ",",
      ", a great starting point for a full menstrual cycle is": ", un excellent point de départ pour un cycle menstruel complet est",
      ", as our distribution operations extend to": ", car nos opérations de distribution s'étendent à",
      ", highly breathable fabrics.": ", tissus hautement respirants.",
      ", we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website, purchase our 4-layer period underwear, or interact with our brand across multi-channel platforms like TikTok Shop.": ", nous accordons une grande importance à votre vie privée et nous engageons à protéger vos données personnelles. Cette politique de confidentialité décrit la manière dont nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site Web, achetez nos sous-vêtements menstruels à 4 couches ou interagissez avec notre marque sur des plateformes multicanaux comme TikTok Shop.",
      ", which subjects our fabrics to rigorous, independent testing against a list of over 1,000 harmful chemicals. To achieve this standard for safety, our 4-layer technology is strictly required to be free from dangerous levels of toxins, chemical finishes, and \"forever chemicals\".": ", qui soumet nos tissus à des tests rigoureux et indépendants par rapport à une liste de plus de 1 000 produits chimiques nocifs. Pour atteindre cette norme de sécurité, notre technologie à 4 couches doit strictement être exempte de niveaux dangereux de toxines, de finitions chimiques et de « produits chimiques éternels ».",
      ", without regard to its conflict of law principles.": ", sans égard à ses principes de conflit de lois.",
      ", your identity and shipping data (name, delivery address, phone number) are securely transferred to our German distributor to pack and dispatch your orders. This cross-border data transfer is protected by strict data processing agreements that meet European GDPR security standards.": ", votre identité et vos données d'expédition (nom, adresse de livraison, numéro de téléphone) sont transférées en toute sécurité à notre distributeur allemand pour emballer et expédier vos commandes. Ce transfert de données transfrontalier est protégé par des accords de traitement de données stricts qui répondent aux normes de sécurité européennes GDPR.",
      ", your order details are securely synchronized with our backend systems to facilitate fast processing and shipping.": ", les détails de votre commande sont synchronisés en toute sécurité avec nos systèmes backend pour faciliter un traitement et une expédition rapides.",
      ", your period underwear should fit snugly around your legs and waist without digging in. If the leg openings are too loose, gaps can cause leaks even if the underwear isn't full. We recommend checking our detailed size guide and measuring your hips to find your true match.": ", vos sous-vêtements menstruels doivent être bien ajustés autour de vos jambes et de votre taille sans s'enfoncer. Si les ouvertures pour les jambes sont trop lâches, les espaces peuvent provoquer des fuites même si les sous-vêtements ne sont pas pleins. Nous vous recommandons de consulter notre guide des tailles détaillé et de mesurer vos hanches pour trouver votre véritable correspondance.",
      ".": ".",
      ". However, like any menstrual product, it can leak if it reaches full capacity or if it fits poorly.": ". Cependant, comme tout produit menstruel, il peut fuir s’il atteint sa pleine capacité ou s’il est mal ajusté.",
      ". If you ever start to feel a slight sensation of moisture on the top layer, it is simply a sign that the core is at full capacity and it is time to swap to a fresh pair.": ". Si jamais vous commencez à ressentir une légère sensation d’humidité sur la couche supérieure, c’est simplement le signe que le noyau est à pleine capacité et qu’il est temps de passer à une nouvelle paire.",
      ". Softeners leave a microscopic film on the fabric that clogs the fibers, trapping moisture and bacteria inside the absorbent core. Always allow them to air-dry completely before putting them away!": ". Les adoucissants laissent un film microscopique sur le tissu qui obstrue les fibres, emprisonnant l'humidité et les bactéries à l'intérieur du noyau absorbant. Laissez-les toujours sécher complètement à l’air libre avant de les ranger !",
      ". The very first layer—the": ". La toute première couche, la",
      "0% Plastic-Backed Stickiness:": "0 % d'adhésivité du support en plastique :",
      "01": "01",
      "02": "02",
      "03": "03",
      "04": "04",
      "1": "1",
      "1. Information We Collect": "1. Informations que nous collectons",
      "1. The Full Switch (5 to 7 Pairs)": "1. Le Switch Complet (5 à 7 Paires)",
      "100% cotton": "100% coton",
      "100% sealed in its original product packaging": "100% scellé dans son emballage d'origine",
      "10ml": "10 ml",
      "1–2 business days": "1 à 2 jours ouvrables",
      "2": "2",
      "2 pairs per day": "2 paires par jour",
      "2. How We Use Your Data": "2. Comment nous utilisons vos données",
      "2. The Part-Time Switch (3 to 4 Pairs)": "2. Le commutateur à temps partiel (3 à 4 paires)",
      "20ml": "20 ml",
      "28-30": "28-30",
      "2x Heavy Plus Pairs": "2x paires Heavy Plus",
      "2x Regular Flow Pairs": "2x paires à flux régulier",
      "3": "3",
      "3. Data Sharing and Cross-Border Transfers (Germany Distribution)": "3. Partage de données et transferts transfrontaliers (distribution en Allemagne)",
      "3. The Backup / Starter Option (1 to 2 Pairs)": "3. L'option Backup/Starter (1 à 2 paires)",
      "30 days from the date of delivery": "30 jours à compter de la date de livraison",
      "32-33": "32-33",
      "32-34": "32-34",
      "33-34": "33-34",
      "34-35": "34-35",
      "34-36": "34-36",
      "35-36": "35-36",
      "36-38": "36-38",
      "38-40": "38-40",
      "3x Regular-Heavy Flow Pairs": "3x paires à flux régulier-fort",
      "4": "4",
      "4-layer leak-proof technology": "Technologie anti-fuite à 4 couches",
      "4-layer technology": "Technologie à 4 couches",
      "4. Data Retention and Security": "4. Conservation et sécurité des données",
      "40-42": "40-42",
      "40ml": "40 ml",
      "42-44": "42-44",
      "46-48": "46-48",
      "5 to 7 pairs": "5 à 7 paires",
      "5. Your Legal Rights (NDPA & GDPR)": "5. Vos droits légaux (NDPA et RGPD)",
      "50 to 100 washes": "50 à 100 lavages",
      "60ml": "60 ml",
      "8 to 12 hours": "8 à 12 heures",
      "A close-fitting gusset and suitable absorbency can help reduce leaks; no menstrual product can guarantee against leaks in every situation.": "Un gousset bien ajusté et un pouvoir absorbant approprié peuvent aider à réduire les fuites ; aucun produit menstruel ne peut garantir contre les fuites dans toutes les situations.",
      "A five-pair starter collection can help cover a typical school week, depending on your teen's cycle and laundry routine:": "Une collection de démarrage de cinq paires peut aider à couvrir une semaine scolaire typique, en fonction du cycle et de la routine de lessive de votre adolescent :",
      "A gentle wash protects the absorbent layers": "Un lavage doux protège les couches absorbantes",
      "A slim multi-layer core absorbs quickly while staying flexible under clothing.": "Un noyau multicouche mince absorbe rapidement tout en restant flexible sous les vêtements.",
      "A small rotation makes care easier. Most people begin with three to five pairs, with a mix of absorbencies for lighter days, heavier flow, and overnight wear.": "Une petite rotation facilite les soins. La plupart des gens commencent avec trois à cinq paires, avec un mélange de tissus absorbants pour les journées plus légères, les flux plus abondants et les vêtements de nuit.",
      "Absorbency & fit": "Absorption et ajustement",
      "Absorbency Level": "Niveau d'absorption",
      "Absorbency:": "Capacité d'absorption :",
      "Absorbency: Heavy": "Capacité d'absorption : lourde",
      "Absorbency: Regular": "Capacité d'absorption : Régulière",
      "Absorbent Core:": "Noyau absorbant :",
      "Absorbs up to": "Absorbe jusqu'à",
      "Access": "Accéder",
      "Accuracy:": "Précision:",
      "Adaptive fit contours to movement for all-day wear comfort.": "L'ajustement adaptatif épouse les mouvements pour un confort de port tout au long de la journée.",
      "Additional information": "Informations Complémentaires",
      "After wear, rinse under cold water until the water begins to run clear. Avoid hot water, which can set stains.": "Après le port, rincez à l'eau froide jusqu'à ce que l'eau commence à devenir claire. Évitez l’eau chaude, qui peut fixer les taches.",
      "After wearing, rinse your underwear under cold running water or soak them until the water runs clear.": "Après l'avoir porté, rincez vos sous-vêtements sous l'eau froide courante ou faites-les tremper jusqu'à ce que l'eau soit claire.",
      "Air dry": "Sécher à l'air libre",
      "All orders are processed, packed, and shipped fast within": "Toutes les commandes sont traitées, emballées et expédiées rapidement dans",
      "All-day comfort": "Confort toute la journée",
      "All-day support from commute to cooldown.": "Assistance toute la journée, du trajet jusqu'au temps de recharge.",
      "Amazon": "Amazone",
      "Analytical services like Google Analytics and social media advertising pixels (such as the TikTok Pixel) to optimize your browsing experience.": "Des services d'analyse comme Google Analytics et des pixels publicitaires sur les réseaux sociaux (comme le Pixel TikTok) pour optimiser votre expérience de navigation.",
      "Answers about absorbency, fit, materials, care, and everyday use.": "Réponses sur l'absorption, l'ajustement, les matériaux, l'entretien et l'utilisation quotidienne.",
      "As your flow leaves your body, Hailaflo’s moisture-wicking top layer immediately pulls the fluid down and locks it into the absorbent core.": "Lorsque votre flux quitte votre corps, la couche supérieure évacuant l’humidité de Hailaflo attire immédiatement le fluide vers le bas et le verrouille dans le noyau absorbant.",
      "At": "À",
      "Available colors:": "Couleurs disponibles :",
      "Available now": "Disponible maintenant",
      "Avoid": "Éviter",
      "Back to top": "Retour en haut",
      "Because our distribution center is located in": "Parce que notre centre de distribution est situé à",
      "Because your flow changes throughout the week, your perfect number depends entirely on your unique cycle, your laundry habits, and how you plan to use them.": "Parce que votre flux change tout au long de la semaine, votre numéro parfait dépend entièrement de votre cycle unique, de vos habitudes de lessive et de la façon dont vous prévoyez de les utiliser.",
      "Beginners wanting to test our advanced 4-layer technology, or anyone looking for extra": "Débutants souhaitant tester notre technologie avancée à 4 couches, ou toute personne recherchant un supplément",
      "Best For": "Idéal pour",
      "Best For:": "Idéal pour :",
      "Black": "Noir",
      "Bleach": "Eau de Javel",
      "Blush": "Rougir",
      "Boxer Shorts in Black": "Boxer en noir",
      "Boxer Shorts provide fuller cut support and dependable absorbency for heavier-flow moments and longer wear windows.": "Les boxers offrent un soutien plus complet et une absorption fiable pour les moments de flux plus abondants et les fenêtres d'usure plus longues.",
      "Brand": "Marque",
      "Bring them home to wash": "Ramenez-les à la maison pour les laver",
      "Browse HailaFlo products": "Parcourir les produits HailaFlo",
      "Build a routine that keeps each pair ready": "Créez une routine qui garde chaque paire prête",
      "Building Your Care Routine": "Construire votre routine de soins",
      "Burgundy": "Bourgogne",
      "By eliminating the damp environment where bacteria usually thrive, the underwear naturally stays clean, fresh, and completely odour-free for up to 8 to 12 hours.": "En éliminant l'environnement humide où les bactéries se développent habituellement, les sous-vêtements restent naturellement propres, frais et totalement sans odeur pendant 8 à 12 heures.",
      "By matching your unique flow to our 4-layer technology, you can experience a completely": "En faisant correspondre votre flux unique à notre technologie à 4 couches, vous pouvez vivre une expérience complètement",
      "By placing an order, you confirm that you are at least the age of majority in your country, state, or province of residence. If you create an account on our store, you are responsible for maintaining the confidentiality of your login credentials.": "En passant une commande, vous confirmez que vous avez au moins l'âge de la majorité dans votre pays, état ou province de résidence. Si vous créez un compte sur notre boutique, vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion.",
      "Can I wear HailaFlo for workouts and long days?": "Puis-je porter HailaFlo pour les entraînements et les longues journées ?",
      "Can period underwear leak?": "Les sous-vêtements menstruels peuvent-ils fuir ?",
      "Capacity in Millilitres": "Capacité en millilitres",
      "Care & Performance": "Entretien et performances",
      "Care guide sections": "Sections du guide d'entretien",
      "Care instructions:": "Conseils d'entretien :",
      "Care routine": "Routine de soins",
      "Caring for your": "Prendre soin de votre",
      "Change language": "Changer de langue",
      "Change when needed": "Changer si nécessaire",
      "Changes to These Terms": "Modifications de ces conditions",
      "Check product details and certification information for the specific style, especially for sensitive skin.": "Vérifiez les détails du produit et les informations de certification pour le style spécifique, en particulier pour les peaux sensibles.",
      "Check the fit": "Vérifiez l'ajustement",
      "Chest (inches)": "Poitrine (pouces)",
      "Choose Your Routine": "Choisissez votre routine",
      "Choose from High Waist Period Briefs and Boxer Shorts, each available in Black and Grey.": "Choisissez parmi des slips menstruels taille haute et des boxers, chacun disponible en noir et gris.",
      "Choose protection for your flow, not just the day": "Choisissez une protection pour votre flux, pas seulement pour la journée",
      "Choose the absorbency and fit that match your flow, then follow simple care steps to keep your HailaFlo underwear performing well.": "Choisissez le pouvoir absorbant et la coupe qui correspondent à votre flux, puis suivez des étapes d'entretien simples pour que vos sous-vêtements HailaFlo restent performants.",
      "Clear": "Clair",
      "Close menu": "Fermer le menu",
      "Colors": "Couleurs",
      "Comfort that lasts, cycle after cycle": "Un confort qui dure, cycle après cycle",
      "Comfort-forward essentials for postpartum care.": "Des essentiels de confort pour les soins post-partum.",
      "Coming Soon": "À venir",
      "Coming soon": "À venir",
      "Committing to an entirely": "S'engager entièrement",
      "Completely dry, fresh, and lightweight.": "Complètement sec, frais et léger.",
      "Compression-inspired fit keeps fabric stable through high-motion workouts.": "La coupe inspirée de la compression maintient le tissu stable lors des entraînements à mouvements intenses.",
      "Contact Us | HailaFlo": "Contactez-nous | HailaFlo",
      "Contact information": "Coordonnées",
      "Conventional disposable pads use plastic backings that trap heat, moisture, and sweat. This can cause fluid to smear and pool, making your flow look and feel much heavier than it actually is.": "Les serviettes jetables conventionnelles utilisent des supports en plastique qui retiennent la chaleur, l'humidité et la sueur. Cela peut provoquer des taches et des accumulations de liquide, ce qui rend votre flux beaucoup plus lourd qu'il ne l'est en réalité.",
      "Conventional products often contain synthetic fragrances and chemical bleaching agents that can irritate your skin and increase cramping discomfort. Switching to": "Les produits conventionnels contiennent souvent des parfums synthétiques et des agents de blanchiment chimiques qui peuvent irriter votre peau et augmenter les crampes. Passer à",
      "Cookie Policy": "Politique en matière de cookies",
      "Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used to make websites work efficiently, remember your shopping preferences, and provide analytical data to the website owners.": "Les cookies sont de petits fichiers texte placés sur votre ordinateur ou appareil mobile lorsque vous visitez un site Web. Ils sont largement utilisés pour que les sites Web fonctionnent efficacement, mémorisent vos préférences d'achat et fournissent des données analytiques aux propriétaires de sites Web.",
      "Create an easy wash, dry, and storage routine that keeps every pair ready for your next cycle.": "Créez une routine de lavage, de séchage et de rangement facile qui permet à chaque paire de rester prête pour votre prochain cycle.",
      "Cycle & Everyday Use": "Cycle et utilisation quotidienne",
      "Damaged or Defective Items:": "Articles endommagés ou défectueux :",
      "Data Portability": "Portabilité des données",
      "Delivery estimates and shipping options are shown by Amazon or TikTok Shop before you place your order there.": "Les estimations de livraison et les options d'expédition sont affichées par Amazon ou TikTok Shop avant que vous n'y passiez votre commande.",
      "Depending on your flow intensity and the absorbency level you chose, your pair will last anywhere from": "En fonction de l'intensité de votre flux et du niveau d'absorption que vous avez choisi, votre paire durera de",
      "Depending on your location, you hold specific data rights regarding your personal information under the NDPA 2023 or EU GDPR. You have the right to:": "En fonction de votre emplacement, vous disposez de droits spécifiques en matière de données concernant vos informations personnelles en vertu de la NDPA 2023 ou du RGPD de l'UE. Vous avez le droit de :",
      "Description": "Description",
      "Designed around your day": "Conçu autour de votre journée",
      "Designed for Comfort": "Conçu pour le confort",
      "Details about payments made by you and products you have purchased from us.": "Détails sur les paiements effectués par vous et les produits que vous avez achetés chez nous.",
      "Discreet Packaging:": "Emballage discret :",
      "Discreet:": "Discret:",
      "Disposable pads can feel bulky or move during activity, and tampons may feel intimidating for beginners. Reusable period underwear is worn like regular underwear and can be one option for period care.": "Les serviettes jetables peuvent sembler volumineuses ou bouger pendant l’activité, et les tampons peuvent sembler intimidants pour les débutants. Les sous-vêtements menstruels réutilisables se portent comme des sous-vêtements ordinaires et peuvent constituer une option pour les soins menstruels.",
      "Do": "Faire",
      "Do not fill this out:": "Ne remplissez pas ceci :",
      "Do period pants feel wet when you’re wearing them?": "Les culottes menstruelles sont-elles mouillées lorsque vous les portez ?",
      "Do you offer returns or size exchanges?": "Proposez-vous des retours ou des échanges de tailles ?",
      "Does HailaFlo contain PFAS?": "HailaFlo contient-il des PFAS ?",
      "Does HailaFlo use nanotechnology?": "HailaFlo utilise-t-il la nanotechnologie ?",
      "Does wearing period underwear change your period or make it lighter?": "Le port de sous-vêtements menstruels modifie-t-il vos règles ou les rend-elle plus légères ?",
      "Dry completely": "Sécher complètement",
      "Due to strict health protection and hygiene reasons, any period underwear that has been opened, tried on, or has a broken hygiene seal": "Pour des raisons strictes de protection de la santé et d'hygiène, tout sous-vêtement menstruel ouvert, essayé ou dont le sceau d'hygiène est brisé",
      "E-Commerce and Marketplace Platforms:": "Plateformes de commerce électronique et de marché :",
      "Eligibility & Account Registration": "Admissibilité et enregistrement de compte",
      "Email": "E-mail",
      "Email: support@hailaflo.com": "E-mail : support@hailaflo.com",
      "Erasure (\"Right to be Forgotten\")": "Effacement (« Droit à l’oubli »)",
      "Essential Cookies:": "Cookies essentiels :",
      "Even after hitting their maximum wash milestone, your Hailaflo underwear won't suddenly stop working. The built-in fabric tech will simply begin to very slowly decline in absorbency. When you eventually notice this change, you can seamlessly retire them to be used on your lighter flow days, for spotting, or as a backup to a menstrual cup.": "Même après avoir atteint leur objectif de lavage maximum, vos sous-vêtements Hailaflo ne cesseront pas soudainement de fonctionner. La technologie du tissu intégrée commencera simplement à diminuer très lentement en termes d’absorption. Lorsque vous remarquerez finalement ce changement, vous pourrez facilement les retirer pour les utiliser lors de vos journées de flux plus légers, pour effectuer des repérages ou comme solution de secours pour une coupe menstruelle.",
      "Everyday comfort designed to move with your routine.": "Un confort quotidien conçu pour suivre votre routine.",
      "Everyday flow, work, school, and regular daytime wear.": "Flux quotidien, travail, école et tenue régulière de jour.",
      "Everyday routine": "Routine quotidienne",
      "Exactly like putting on a pair of premium, high-quality everyday underwear.": "Exactement comme enfiler une paire de sous-vêtements de qualité supérieure au quotidien.",
      "Explore HailaFlo": "Explorez HailaFlo",
      "Explore common questions about materials, wear time, sizing, and cycle use.": "Explorez les questions courantes sur les matériaux, la durée de port, la taille et l'utilisation du vélo.",
      "Explore period underwear designed for everyday comfort.": "Découvrez des sous-vêtements menstruels conçus pour un confort quotidien.",
      "Extended coverage for rest days and overnight confidence.": "Couverture étendue pour les jours de repos et la confiance pendant la nuit.",
      "FAQs": "FAQ",
      "Fabric softener": "Adoucissant",
      "Fabric:": "Tissu:",
      "Find Your Perfect Hailaflo Absorbency Level": "Trouvez votre niveau d’absorption Hailaflo parfait",
      "Find your everyday comfort": "Trouvez votre confort au quotidien",
      "First-period guide": "Guide de première période",
      "Fit:": "Ajuster:",
      "Follow HailaFlo on TikTok": "Suivez HailaFlo sur TikTok",
      "Free standard shipping is available on purchase of 3 items. Standard shipping rates apply for smaller orders.": "La livraison standard gratuite est disponible à l'achat de 3 articles. Les tarifs d'expédition standard s'appliquent pour les petites commandes.",
      "Frequently Asked Questions": "Foire aux questions",
      "Functional Cookies:": "Cookies fonctionnels :",
      "Gallery Image 1": "Galerie Image 1",
      "Gallery Image 2": "Galerie Image 2",
      "Gallery Image 3": "Galerie Image 3",
      "Gallery Image 4": "Galerie Image 4",
      "Gallery Image 5": "Galerie Image 5",
      "General Data Protection Regulation (GDPR)": "Règlement Général sur la Protection des Données (RGPD)",
      "Gentle, high-coverage support for postpartum recovery weeks.": "Soutien doux et hautement couvrant pour les semaines de récupération post-partum.",
      "Germany": "Allemagne",
      "Go about your day": "Continuez votre journée",
      "Governing Law": "Loi applicable",
      "Grey": "Gris",
      "Gym Leggings are built with stretch recovery and absorbent support, helping you train confidently through every session.": "Les leggings de sport sont conçus avec une récupération extensible et un soutien absorbant, vous aidant à vous entraîner en toute confiance à chaque séance.",
      "Gym Shorts are optimized for airflow and stretch, with core absorbency support for confidence during active hours.": "Les shorts de sport sont optimisés pour la circulation de l'air et l'étirement, avec un soutien absorbant pour la confiance pendant les heures actives.",
      "Haila Flo is OEKO TEX Certified , What does the OEKO-TEX® Standard 100 certification mean?": "Haila Flo est certifiée OEKO TEX. Que signifie la certification OEKO-TEX® Standard 100 ?",
      "HailaFlo": "HailaFlo",
      "HailaFlo Active, Postpartum, and other collections are coming soon.": "HailaFlo Active, Postpartum et d'autres collections arriveront bientôt.",
      "HailaFlo Boxer Shorts": "Caleçon HailaFlo",
      "HailaFlo Everyday Brief": "HailaFlo Slip de tous les jours",
      "HailaFlo Gym Leggings": "HailaFlo Legging de sport",
      "HailaFlo Gym Shorts": "Short de sport HailaFlo",
      "HailaFlo High Waist Period Briefs": "HailaFlo Culotte menstruelle taille haute",
      "HailaFlo Period Activewear": "Vêtements de sport d’époque HailaFlo",
      "HailaFlo Postpartum Recovery Set": "Ensemble de récupération post-partum HailaFlo",
      "HailaFlo Swimwear": "Maillots de bain HailaFlo",
      "HailaFlo logo": "Logo HailaFlo",
      "HailaFlo makes reusable period underwear with breathable comfort, leak protection, and a fit designed for everyday confidence.": "HailaFlo fabrique des sous-vêtements menstruels réutilisables offrant un confort respirant, une protection contre les fuites et une coupe conçue pour une confiance quotidienne.",
      "HailaFlo period underwear is built for soft, secure comfort from morning to night.": "Les sous-vêtements menstruels HailaFlo sont conçus pour un confort doux et sécurisé du matin au soir.",
      "HailaFlo | Care Guide": "HailaFlo | Guide d'entretien",
      "HailaFlo | Coming Soon": "HailaFlo | À venir",
      "HailaFlo | Frequently Asked Questions": "HailaFlo | Foire aux questions",
      "HailaFlo | Period Underwear": "HailaFlo | Sous-vêtements menstruels",
      "HailaFlo | Privacy Policy": "HailaFlo | politique de confidentialité",
      "HailaFlo | Shipping, Returns & Exchanges": "HailaFlo | Expédition, retours et échanges",
      "HailaFlo | Shop": "HailaFlo | Boutique",
      "HailaFlo | Terms of Service": "HailaFlo | Conditions d'utilisation",
      "Hailaflo": "Haïlaflo",
      "Hailaflo Period Underwear": "Sous-vêtements menstruels Hailaflo",
      "Hailaflo Period Underwear: Frequently Asked Questions": "Sous-vêtements menstruels Hailaflo : Foire aux questions",
      "Hailaflo period underwear": "Sous-vêtements menstruels Hailaflo",
      "Hailaflo period underwear can last up to 4 years": "Les sous-vêtements menstruels Hailaflo peuvent durer jusqu'à 4 ans",
      "Hailaflo products are designed for personal menstrual hygiene management. We do not provide medical advice. Hailaflo is not liable for any indirect, incidental, or consequential damages resulting from the misuse of our products or the inability to use our website.": "Les produits Hailaflo sont conçus pour la gestion de l'hygiène menstruelle personnelle. Nous ne fournissons pas de conseils médicaux. Hailaflo n'est pas responsable des dommages indirects, accessoires ou consécutifs résultant d'une mauvaise utilisation de nos produits ou de l'impossibilité d'utiliser notre site Web.",
      "Hailaflo’s advanced": "L’avancée d’Hailaflo",
      "Hang your underwear to air dry completely. Avoid tumble dryers and direct radiator heat, as high heat can damage the waterproof leak-proof barrier.": "Suspendez vos sous-vêtements pour qu'ils sèchent complètement à l'air. Évitez les sèche-linge et la chaleur directe du radiateur, car une chaleur élevée peut endommager la barrière étanche et étanche.",
      "Heavier days, longer outings, and overnight protection.": "Des journées plus lourdes, des sorties plus longues et une protection de nuit.",
      "Heavy Plus": "Lourd Plus",
      "Heavy days or overnight protection": "Protection de jours lourds ou de nuit",
      "Help and FAQ": "Aide et FAQ",
      "Help us understand how visitors interact with our site (e.g., which pages are visited most often) so we can optimize performance and fix bugs.": "Aidez-nous à comprendre comment les visiteurs interagissent avec notre site (par exemple, quelles pages sont visitées le plus souvent) afin que nous puissions optimiser les performances et corriger les bugs.",
      "Hide Filters": "Masquer les filtres",
      "High Waist Period Briefs in Black": "Culotte menstruelle taille haute en noir",
      "High-capacity absorbent core supports longer intervals between changes.": "Le noyau absorbant haute capacité prend en charge des intervalles plus longs entre les changements.",
      "High-capacity gusset offers extended absorbency for all-day and overnight use.": "Le gousset haute capacité offre une capacité d'absorption étendue pour une utilisation toute la journée et la nuit.",
      "High-coverage cut supports comfort throughout longer rest periods.": "La coupe à haute couverture favorise le confort pendant les périodes de repos plus longues.",
      "High-performance leggings built for movement and secure protection.": "Legging haute performance conçu pour le mouvement et une protection sécurisée.",
      "How Hailaflo Uses Cookies": "Comment Hailaflo utilise les cookies",
      "How Many Pairs of Period Underwear Do I Need?": "De combien de paires de sous-vêtements menstruels ai-je besoin ?",
      "How do I choose the right absorbency level?": "Comment choisir le bon niveau d’absorption ?",
      "How do I find the perfect fit?": "Comment trouver la solution idéale ?",
      "How do I wash and care for Hailaflo period underwear?": "Comment laver et entretenir les sous-vêtements menstruels Hailaflo ?",
      "How long does shipping usually take?": "Combien de temps prend habituellement l'expédition ?",
      "How long they last in your wardrobe depends on your laundry rotation:": "Leur durée de conservation dans votre garde-robe dépend de la rotation de votre linge :",
      "How long will my HailaFlo garments last?": "Combien de temps mes vêtements HailaFlo dureront-ils ?",
      "How should I wash period underwear?": "Comment dois-je laver mes sous-vêtements menstruels ?",
      "However, many women who switch to Hailaflo report that their periods": "Cependant, de nombreuses femmes qui passent à Hailaflo signalent que leurs règles",
      "Hygiene Policy, Shipping, & Returns": "Politique d'hygiène, expédition et retours",
      "Identity and Contact Data:": "Données d’identité et de contact :",
      "If a pair begins leaking sooner than expected, check the fit, review whether your flow has changed, and make sure fabric softener has not coated the absorbent fibers.": "Si une paire commence à fuir plus tôt que prévu, vérifiez l'ajustement, vérifiez si votre débit a changé et assurez-vous que l'assouplissant n'a pas enduit les fibres absorbantes.",
      "If the surface starts to feel damp or the gusset feels full, change into a fresh pair.": "Si la surface commence à être humide ou si le gousset semble plein, changez-en une nouvelle paire.",
      "If you are between sizes, use your hip measurement and preferred fit as your guide.": "Si vous êtes entre deux tailles, utilisez votre tour de hanches et votre coupe préférée comme guide.",
      "If you are making the switch to": "Si vous passez à",
      "If you own a full set (5–7 pairs) and only wash each pair once per cycle, they will easily last up to 4 years or longer.": "Si vous possédez un ensemble complet (5 à 7 paires) et que vous ne lavez chaque paire qu'une fois par cycle, elles dureront facilement jusqu'à 4 ans ou plus.",
      "If you own a smaller collection (3–4 pairs) and wash and wear them multiple times during a single period week, they will still reliably last you up to 3 years.": "Si vous possédez une collection plus petite (3 à 4 paires) et que vous les lavez et les portez plusieurs fois au cours d'une même semaine, elles dureront toujours jusqu'à 3 ans.",
      "If you purchase Hailaflo garments via": "Si vous achetez des vêtements Hailaflo via",
      "If you purchase Hailaflo products through third-party platforms (such as TikTok Shop), your transaction is additionally subject to that platform's terms of service and processing rules.": "Si vous achetez des produits Hailaflo via des plateformes tierces (telles que TikTok Shop), votre transaction est en outre soumise aux conditions de service et aux règles de traitement de cette plateforme.",
      "If you start to feel moisture on the top layer, it is simply a sign that the core is completely full and it is time to change into a fresh pair.": "Si vous commencez à sentir de l'humidité sur la couche supérieure, c'est simplement le signe que le noyau est complètement plein et qu'il est temps d'enfiler une nouvelle paire.",
      "If your item arrives damaged, defective, or incorrect, please": "Si votre article arrive endommagé, défectueux ou incorrect, veuillez",
      "If your underwear doesn't fit snugly against your body, the moisture-wicking layer cannot pull the fluid away efficiently.": "Si vos sous-vêtements ne sont pas bien ajustés contre votre corps, la couche qui évacue l'humidité ne peut pas évacuer efficacement le liquide.",
      "Instagram": "Instagram",
      "Instant Absorption:": "Absorption instantanée :",
      "Instead of relying on synthetic chemical treatments for waterproofing or stain resistance, we engineered our leak-proof barriers and absorbent cores using the physical weave and capillary action of the fabrics themselves. When you wear Hailaflo, you can be entirely confident that you are keeping toxic chemicals away from your body's most sensitive skin": "Au lieu de compter sur des traitements chimiques synthétiques pour l'imperméabilisation ou la résistance aux taches, nous avons conçu nos barrières étanches et nos âmes absorbantes en utilisant le tissage physique et l'action capillaire des tissus eux-mêmes. Lorsque vous portez Hailaflo, vous pouvez être entièrement sûr que vous éloignez les produits chimiques toxiques de la peau la plus sensible de votre corps.",
      "International Distribution & Warehouse Partners:": "Partenaires de distribution et d'entrepôt internationaux :",
      "Ironing the gusset": "Repassage du gousset",
      "Join our newsletter": "Rejoignez notre newsletter",
      "Keep pairs unfolded or loosely folded in a clean, dry drawer away from direct heat.": "Conservez les paires dépliées ou légèrement pliées dans un tiroir propre et sec, à l'abri de la chaleur directe.",
      "Large": "Grand",
      "Large Rotation (Lasts 4+ Years):": "Grande rotation (dure plus de 4 ans) :",
      "Last Updated: September 12, 2026": "Dernière mise à jour : 12 septembre 2026",
      "Leak-proof protection": "Protection anti-fuite",
      "Leak-proof swimwear for worry-free pool and beach days.": "Maillots de bain anti-fuites pour des journées à la piscine et à la plage sans souci.",
      "Leg openings should feel snug but should not leave painful marks.": "Les ouvertures pour les jambes doivent être bien ajustées mais ne doivent pas laisser de marques douloureuses.",
      "Legal": "Légal",
      "Length:": "Longueur:",
      "Light Flow": "Flux de lumière",
      "Light days, spotting, or backup": "Jours-lumière, repérage ou sauvegarde",
      "Lightweight mobility for training, errands, and recovery.": "Mobilité légère pour l'entraînement, les courses et la récupération.",
      "Limitation of Liability": "Limitation de responsabilité",
      "Logistics and Delivery Partners:": "Partenaires logistiques et livraison :",
      "Longer leg design helps prevent shifting and supports secure movement.": "La conception des jambes plus longues aide à empêcher les déplacements et permet un mouvement sécurisé.",
      "Looking for quick answers? Visit our FAQ": "Vous cherchez des réponses rapides ? Visitez notre FAQ",
      "Machine wash at 30°C, do not tumble dry, iron on low heat, do not bleach": "Lavage en machine à 30°C, ne pas mettre au sèche-linge, repasser à basse température, ne pas blanchir",
      "Machine wash at 40°C, do not tumble dry, iron at medium temperature, do not bleach.": "Lavage en machine à 40°C, ne pas mettre au sèche-linge, repasser à température moyenne, ne pas blanchir.",
      "Machine wash on a cool, gentle cycle with similar colors and mild detergent. A mesh laundry bag can reduce fabric stress.": "Lavage en machine sur cycle frais et délicat avec des couleurs similaires et un détergent doux. Un sac à linge en filet peut réduire le stress du tissu.",
      "Made to Last": "Conçu pour durer",
      "Main Product Image": "Image principale du produit",
      "Making the switch to": "Passer à",
      "Manage your customer account, process secure payments, and handle returns or size exchanges.": "Gérez votre compte client, traitez les paiements sécurisés et gérez les retours ou les échanges de taille.",
      "Managing Your Cookie Choices": "Gérer vos choix en matière de cookies",
      "Marketing and Analytics Partners:": "Partenaires marketing et analytique :",
      "Material & Care": "Matériel et entretien",
      "Material & Washing": "Matériel et Lavage",
      "Material:": "Matériel:",
      "Materials & Safety": "Matériaux et sécurité",
      "Materials:": "Matériels:",
      "Medium": "Moyen",
      "Message": "Message",
      "Message sent successfully": "Message envoyé avec succès",
      "Model height:": "Hauteur du modèle :",
      "Moisture trapped during storage can cause odor. Store only when every layer is fully dry.": "L'humidité emprisonnée pendant le stockage peut provoquer des odeurs. Conserver uniquement lorsque chaque couche est complètement sèche.",
      "Moisture-Wicking Top Layer:": "Couche supérieure évacuant l'humidité :",
      "More answers": "Plus de réponses",
      "More from HailaFlo": "Plus de HailaFlo",
      "Multi-layer absorbent core keeps you dry and confident, day or night.": "Le noyau absorbant multicouche vous garde au sec et en confiance, de jour comme de nuit.",
      "Name": "Nom",
      "Necessary for the website to function properly. They allow you to add items to your shopping cart, securely log into your account, and complete your checkout.": "Nécessaire au bon fonctionnement du site Internet. Ils vous permettent d'ajouter des articles à votre panier, de vous connecter en toute sécurité à votre compte et de finaliser votre commande.",
      "Need product or sizing guidance? Send us a message. For payment, delivery, returns, or an existing order, contact the Amazon or TikTok Shop support team shown in your order.": "Besoin de conseils sur un produit ou une taille ? Envoyez-nous un message. Pour le paiement, la livraison, les retours ou une commande existante, contactez l'équipe d'assistance Amazon ou TikTok Shop indiquée dans votre commande.",
      "Nigeria Data Protection Act (NDPA) 2023": "Loi nigériane sur la protection des données (NDPA) 2023",
      "No pad wrappers to carry or dispose of at school.": "Aucun emballage de bloc-notes à transporter ou à jeter à l'école.",
      "No questions match your search. Try another keyword, such as size, absorbency, or washing.": "Aucune question ne correspond à votre recherche. Essayez un autre mot clé, tel que taille, pouvoir absorbant ou lavage.",
      "No, Hailaflo period underwear does not feel wet while you are wearing it.": "Non, les sous-vêtements menstruels Hailaflo ne sont pas mouillés lorsque vous les portez.",
      "No, Hailaflo period underwear is free from detectable PFAS (per- and polyfluoroalkyl substances).": "Non, les sous-vêtements menstruels Hailaflo sont exempts de PFAS (substances per- et polyfluoroalkyles) détectables.",
      "No, Hailaflo period underwear will not smell while you are wearing it.": "Non, les sous-vêtements menstruels Hailaflo ne dégageront aucune odeur lorsque vous les porterez.",
      "No, wearing period underwear cannot change your menstrual cycle or make your flow lighter.": "Non, le port de sous-vêtements menstruels ne peut pas modifier votre cycle menstruel ni alléger votre flux.",
      "Normal, everyday flow": "Flux normal et quotidien",
      "Note: We do not directly store your credit card or bank account details; all payments are securely processed by authorized third-party payment gateways (e.g., Paystack, Flutterwave, or Shopify Payments).": "Remarque : Nous ne stockons pas directement les détails de votre carte de crédit ou de votre compte bancaire ; tous les paiements sont traités en toute sécurité par des passerelles de paiement tierces autorisées (par exemple, Paystack, Flutterwave ou Shopify Payments).",
      "OEKO-TEX® Standard 100": "OEKO-TEX® Norme 100",
      "OEKO-TEX® Standard 100 certification": "Certification OEKO-TEX® Standard 100",
      "OEKO-TEX® certified": "Certifié OEKO-TEX®",
      "Odor & moisture control": "Contrôle des odeurs et de l'humidité",
      "On heavier days, or if the pair feels damp or full, change in a private place and store the used pair in the wet bag.": "Les jours plus lourds, ou si la paire est humide ou pleine, changez-vous dans un endroit privé et rangez la paire usagée dans le sac humide.",
      "Once the fluid passes through this top layer, it is locked tightly inside the absorbent core beneath it. Because the surface dries almost immediately, you won’t experience that cold, damp, or sticky sensation often associated with traditional disposable sanitary pads.": "Une fois que le fluide traverse cette couche supérieure, il est fermement enfermé dans le noyau absorbant situé en dessous. Parce que la surface sèche presque immédiatement, vous ne ressentirez pas cette sensation de froid, d’humidité ou collante souvent associée aux serviettes hygiéniques jetables traditionnelles.",
      "Opened or Tried-On Items:": "Articles ouverts ou essayés :",
      "Organic cotton blend": "Mélange de coton biologique",
      "Our": "Notre",
      "Our advanced fabric technology features four high-performance layers that work together seamlessly to keep you dry, fresh, and confident:": "Notre technologie de tissu avancée comprend quatre couches haute performance qui fonctionnent ensemble de manière transparente pour vous garder au sec, au frais et en confiance :",
      "Our model is 180 cm tall and is wearing size M": "Notre mannequin mesure 180 cm et porte une taille M",
      "Our products are hygiene-sensitive. For processing times, shipping rates, return eligibility, exchanges, and damaged or incorrect items, please read our": "Nos produits sont sensibles à l'hygiène. Pour connaître les délais de traitement, les tarifs d'expédition, l'éligibilité aux retours, les échanges et les articles endommagés ou incorrects, veuillez lire notre",
      "Our products hold the": "Nos produits détiennent le",
      "Overview": "Aperçu",
      "Pack a small pouch so your teen has what they need if they want to change during the school day:": "Emportez une petite pochette pour que votre ado ait ce dont il a besoin s'il veut se changer pendant la journée d'école :",
      "Parent ;& Teen Guide": "Guide parents et adolescents",
      "Pay attention to how they feel. Wear time depends on flow and absorbency, so check and change as needed.": "Faites attention à ce qu'ils ressentent. Le temps de port dépend du débit et de la capacité d'absorption, alors vérifiez et changez si nécessaire.",
      "Performance & Analytics Cookies:": "Cookies de performances et d'analyse :",
      "Performance support engineered for active cycle days.": "Support de performance conçu pour les jours de cycle actif.",
      "Period": "Période",
      "HailaFlo Period Starter Pack": "Kit pour les premières règles HailaFlo",
      "A thoughtfully put-together kit with period underwear and useful care essentials.": "Un kit soigneusement composé de sous-vêtements menstruels et d’accessoires de soin pratiques.",
      "Explore on TikTok": "Découvrir sur TikTok",
      "Explore HailaFlo Period Starter Pack on TikTok": "Découvrir le kit pour les premières règles HailaFlo sur TikTok",
      "Period Activewear bridges lifestyle and performance with reliable absorbency and stretch-first comfort.": "Period Activewear allie style de vie et performance avec une absorption fiable et un confort extensible.",
      "Phone number": "Numéro de téléphone",
      "Pick based on your heaviest flow day. Light is ideal for spotting, Regular for everyday use, and Heavy or Super Heavy for overnight or high-flow days.": "Choisissez en fonction de votre jour de flux le plus abondant. Light est idéal pour le repérage, Regular pour un usage quotidien et Heavy ou Super Heavy pour la nuit ou les jours à fort débit.",
      "Platform Sales:": "Ventes de plateforme :",
      "Pop them in the washing machine on a cold, gentle cycle (30°C to 40°C). You can wash them with your normal laundry.": "Passez-les en machine à laver sur cycle doux et froid (30°C à 40°C). Vous pouvez les laver avec votre linge habituel.",
      "Postpartum Recovery Set provides soft structure, extended coverage, and absorbent peace of mind during early recovery.": "L'ensemble de récupération post-partum offre une structure douce, une couverture étendue et une tranquillité d'esprit absorbante pendant la récupération précoce.",
      "Premium Outer Fabric Layer:": "Couche de tissu extérieur de qualité supérieure :",
      "Prevents blood and fluid from seeping through, protecting your clothes and bedsheets from stains.": "Empêche le sang et les liquides de s'infiltrer, protégeant ainsi vos vêtements et draps des taches.",
      "Pricing & Availability:": "Prix ​​et disponibilité :",
      "Privacy at Hailaflo": "Confidentialité chez Hailaflo",
      "Pro-Tip to Keep Them Fresh": "Conseil de pro pour les garder au frais",
      "Process, package, and ship your orders in plain, discreet packaging.": "Traitez, emballez et expédiez vos commandes dans un emballage neutre et discret.",
      "Processing & Shipping:": "Traitement et expédition :",
      "Product 1": "Produit 1",
      "Product Basics & Protection": "Bases et protection du produit",
      "Product details": "Détails du produit",
      "Product information": "Informations sur le produit",
      "Products & Pricing": "Produits et prix",
      "Provides the final structural layer of security while looking and feeling exactly like high-quality, everyday underwear.": "Fournit la couche structurelle finale de sécurité tout en ressemblant et en se sentant exactement comme des sous-vêtements de haute qualité au quotidien.",
      "Purchases & Payment": "Achats et paiement",
      "Purchases are completed through Amazon or TikTok Shop.": "Les achats sont effectués via Amazon ou TikTok Shop.",
      "Put them on in the morning": "Mettez-les le matin",
      "Quick answers about absorbency, fit, care, and shipping so you can shop HailaFlo with confidence.": "Des réponses rapides sur l'absorption, l'ajustement, l'entretien et l'expédition afin que vous puissiez acheter HailaFlo en toute confiance.",
      "Quick-drying outer fabric keeps the short feeling light during movement.": "Le tissu extérieur à séchage rapide permet au short de rester léger pendant les mouvements.",
      "Quick-rinse fabrics support clean transitions from water to dry wear.": "Les tissus à rinçage rapide facilitent les transitions propres de l'eau au séchage.",
      "Rapidly pulls fluid away from your skin, ensuring you feel completely dry, fresh, and comfortable.": "Évacue rapidement le liquide de votre peau, vous assurant ainsi une sensation complètement sèche, fraîche et confortable.",
      "Read guide": "Lire le guide",
      "Recommended Starter Set by Flow": "Kit de démarrage recommandé par Flow",
      "Rectify or update": "Rectifier ou mettre à jour",
      "Regular Flow": "Flux régulier",
      "Regular-Heavy Flow": "Débit régulier-fort",
      "Relaxed fit with reliable leak protection and wider coverage.": "Coupe décontractée avec protection fiable contre les fuites et couverture plus large.",
      "Remember choices you make, such as your preferred language or region, to provide a more personalized shopping experience.": "Mémorisez les choix que vous faites, tels que votre langue ou région préférée, pour offrir une expérience d'achat plus personnalisée.",
      "Remove HailaFlo Active filter": "Supprimer le filtre HailaFlo Active",
      "Remove Heavy filter": "Supprimer le filtre lourd",
      "Remove Light filter": "Supprimer le filtre de lumière",
      "Remove Other filter": "Supprimer l'autre filtre",
      "Remove Period Underwear filter": "Supprimer le filtre Sous-vêtements menstruels",
      "Remove Postpartum filter": "Supprimer le filtre post-partum",
      "Remove Regular filter": "Supprimer le filtre régulier",
      "Remove Super Heavy filter": "Supprimer le filtre Super lourd",
      "Reshape the garment and hang or lay it flat in a ventilated place. Make sure it is completely dry before storing.": "Remodelez le vêtement et suspendez-le ou posez-le à plat dans un endroit aéré. Assurez-vous qu'il est complètement sec avant de le ranger.",
      "Returns & Exchanges Policy": "Politique de retours et d'échanges",
      "Returns and size exchanges are handled by the marketplace where you placed your order. Review the Amazon or TikTok Shop policy shown on the product listing before purchasing.": "Les retours et les échanges de tailles sont gérés par la place de marché où vous avez passé votre commande. Consultez la politique d'Amazon ou de TikTok Shop indiquée sur la liste des produits avant d'acheter.",
      "Reusable & sustainable": "Réutilisable et durable",
      "Reusable Period Care": "Soins périodiques réutilisables",
      "Rinse cold": "Rincer à froid",
      "Rinse in cold water first, machine wash on a gentle cycle, and air dry. Avoid fabric softeners and high heat to protect absorbency performance.": "Rincez d'abord à l'eau froide, lavez en machine sur cycle délicat et séchez à l'air libre. Évitez les assouplissants textiles et la chaleur élevée pour protéger les performances d’absorption.",
      "Rinse under cold tap water until it runs clear, then follow the garment's care instructions.": "Rincez sous l'eau froide du robinet jusqu'à ce qu'elle soit claire, puis suivez les instructions d'entretien du vêtement.",
      "Sage": "Sage",
      "Search": "Recherche",
      "Search FAQ questions": "Rechercher des questions dans la FAQ",
      "Search questions, e.g. absorbency, size, washing...": "Questions de recherche, par ex. capacité d'absorption, taille, lavage...",
      "Secure fit:": "Ajustement sécurisé :",
      "Send": "Envoyer",
      "Send you order updates, tracking information, and customer support communications.": "Vous envoyer des mises à jour de commande, des informations de suivi et des communications d'assistance client.",
      "Shipping & Delivery": "Expédition et livraison",
      "Shipping & Returns": "Expéditions et retours",
      "Shipping Rates:": "Tarifs d'expédition :",
      "Shipping, Returns & Exchanges": "Expédition, retours et échanges",
      "Shipping, Returns & Exchanges Policy": "Politique d'expédition, de retour et d'échange",
      "Shop HailaFlo on TikTok Shop": "Achetez HailaFlo sur TikTok Shop",
      "Shop Period Underwear": "Achetez des sous-vêtements menstruels",
      "Shopping Policies": "Politiques d'achat",
      "Simple guidance for choosing, wearing, washing, and storing your HailaFlo period underwear.": "Des conseils simples pour choisir, porter, laver et ranger vos sous-vêtements menstruels HailaFlo.",
      "Single product page": "Page produit unique",
      "Size": "Taille",
      "Size & Shape": "Taille et forme",
      "Sleeve Length (inches)": "Longueur des manches (pouces)",
      "Small": "Petit",
      "Small Rotation (Lasts 3 Years):": "Petite rotation (dure 3 ans) :",
      "Smooth and invisible. You won't feel any bulkiness or the \"crinkling\" sound of plastic disposable pads when you walk.": "Lisse et invisible. Vous ne ressentirez aucun encombrement ni le bruit « froissé » des serviettes jetables en plastique lorsque vous marchez.",
      "Soft edge seams reduce pressure and help prevent digging around the waist and legs.": "Les coutures aux bords doux réduisent la pression et aident à éviter de creuser autour de la taille et des jambes.",
      "Soft jersey": "Jersey doux",
      "Soft, breathable fabric with a smooth, second-skin fit.": "Tissu doux et respirant avec une coupe seconde peau lisse.",
      "Soft, stretchy comfort for everyday wear with reliable leak protection.": "Confort doux et extensible pour un usage quotidien avec une protection fiable contre les fuites.",
      "Soft-touch waistband and seams are designed to feel gentle on sensitive skin.": "La ceinture et les coutures douces au toucher sont conçues pour être douces sur les peaux sensibles.",
      "Sort products": "Trier les produits",
      "Spotting, discharge, lighter cycle days, or backup protection.": "Dépistage, décharge, jours de cycle plus légers ou protection de secours.",
      "Standard": "Standard",
      "Step 1: Rinse.": "Étape 1 : Rincer.",
      "Step 2: Wash.": "Étape 2 : Laver.",
      "Step 3: Skip the Additives.": "Étape 3 : ignorez les additifs.",
      "Step 4: Air Dry.": "Étape 4 : Sécher à l’air libre.",
      "Still deciding what works for you?": "Vous êtes toujours en train de décider ce qui fonctionne pour vous ?",
      "Store with care": "Conserver avec soin",
      "Streamlined silhouette offers active support with minimal bulk.": "La silhouette profilée offre un soutien actif avec un encombrement minimal.",
      "Stretchy Briefs combine breathable fabric and absorbent layers for a smooth, secure fit from morning to night.": "Les slips extensibles combinent un tissu respirant et des couches absorbantes pour un ajustement doux et sécurisé du matin au soir.",
      "Support": "Soutien",
      "Supporting your child through their first period is a big milestone. With preparation and a plan, you can help them feel more confident and ready for the day.": "Soutenir votre enfant pendant ses premières règles est une étape importante. Avec une préparation et un plan, vous pouvez les aider à se sentir plus confiants et prêts pour la journée.",
      "Supportive inner layer helps keep protection centered while you train.": "La couche intérieure de soutien aide à maintenir la protection centrée pendant que vous vous entraînez.",
      "Swap if needed": "Échanger si besoin",
      "Sweat-managing and absorbent layers work together for dry, focused training.": "Les couches absorbantes et anti-transpiration fonctionnent ensemble pour un entraînement sec et ciblé.",
      "Swimwear combines secure fit construction with absorbent protection designed for confidence in and around water.": "Les maillots de bain combinent une construction à ajustement sécurisé avec une protection absorbante conçue pour la confiance dans et autour de l'eau.",
      "Switch to Hailaflo for reliable,": "Passez à Hailaflo pour un service fiable,",
      "Tampon Equivalent": "Équivalent tampon",
      "Targeting & Advertising Cookies:": "Cookies de ciblage et de publicité :",
      "Technical and Usage Data:": "Données techniques et d'utilisation :",
      "Terms for using the Hailaflo website and information about cookies.": "Conditions d'utilisation du site Hailaflo et informations sur les cookies.",
      "Terms of Service (Terms & Conditions)": "Conditions d'utilisation (Conditions générales)",
      "Thank you for reaching out. We’ll be in touch as soon as we can.": "Merci de nous avoir contactés. Nous vous contacterons dès que possible.",
      "The": "Le",
      "The Cleanup:": "Le nettoyage :",
      "The Fit:": "La coupe :",
      "The Magic:": "La Magie :",
      "The Moisture-Wicking Top Layer": "La couche supérieure qui évacue l'humidité",
      "The Reality:": "La réalité :",
      "The Routine:": "La routine :",
      "The Silhouette:": "La silhouette :",
      "The Ultimate First Period Guide: A Parent's Guide to Stress-Free Cycles": "Le guide ultime des premières règles : un guide destiné aux parents pour des cycles sans stress",
      "The fit is too loose:": "La coupe est trop ample :",
      "The gusset should lie close to the body without gaps.": "Le gousset doit être près du corps, sans espaces.",
      "The secret lies in our advanced": "Le secret réside dans notre avancée",
      "The waistband should sit securely without digging in.": "La ceinture doit être bien en place sans s'enfoncer.",
      "These Terms of Service are governed by and construed in accordance with the laws of": "Ces conditions d'utilisation sont régies et interprétées conformément aux lois de",
      "These Terms of Service govern your use of our website and the purchase of any Hailaflo products. By accessing our site or placing an order, you agree to be bound by these terms.": "Ces conditions d'utilisation régissent votre utilisation de notre site Web et l'achat de tout produit Hailaflo. En accédant à notre site ou en passant une commande, vous acceptez d'être lié par ces conditions.",
      "They have reached full capacity:": "Ils ont atteint leur pleine capacité :",
      "They will feel snugly secure around your waist and leg openings. This snug fit is exactly what ensures": "Ils seront bien ajustés autour de votre taille et de vos jambes. Cet ajustement parfait est exactement ce qui garantit",
      "Third-Party Cookies": "Cookies tiers",
      "This period underwear brief is designed for comfort, leak protection, and all-day confidence. Made with a breathable absorbent core to ensure comfort and durability.": "Ce slip de règles est conçu pour le confort, la protection contre les fuites et la confiance tout au long de la journée. Fabriqué avec un noyau absorbant respirant pour garantir confort et durabilité.",
      "This period underwear brief is made by": "Cette culotte menstruelle est confectionnée par",
      "This policy is written in strict compliance with the": "Cette politique est rédigée dans le strict respect des",
      "TikTok": "Tik Tok",
      "TikTok Shop": "Boutique TikTok",
      "To comply with strict health and safety regulations, our reusable period underwear is classified as a hygiene-sensitive item.": "Afin de respecter des règles strictes d'hygiène et de sécurité, nos sous-vêtements menstruels réutilisables sont classés comme articles sensibles à l'hygiène.",
      "To ensure your underwear never develops a post-wash, musty scent,": "Pour garantir que vos sous-vêtements ne développent jamais de parfum de moisi après le lavage,",
      "To get the ultimate": "Pour obtenir l'ultime",
      "To guarantee": "Pour garantir",
      "To prevent leaks, it is essential to choose the right fit and the correct absorbency level for your menstrual cycle. We offer a range of styles designed for everything from light spotting to a": "Pour éviter les fuites, choisissez une coupe et un niveau d’absorption adaptés à votre cycle. Nos modèles conviennent aux flux légers, comme aux",
      "To respect your privacy, all Hailaflo orders are delivered in plain, unbranded packaging.": "Pour respecter votre vie privée, toutes les commandes Hailaflo sont livrées dans un emballage neutre et sans marque.",
      "Toxin-Free Comfort:": "Confort sans toxines :",
      "Transaction and Financial Data:": "Données transactionnelles et financières :",
      "Traps and locks in liquid using advanced capillary action to handle everything from light spotting to a": "Retient le liquide grâce à l’action capillaire, des petites pertes jusqu’aux",
      "Trusted local and international courier services to ensure your orders arrive safely at your doorstep.": "Des services de messagerie locaux et internationaux de confiance pour garantir que vos commandes arrivent en toute sécurité à votre porte.",
      "Tumble drying": "Séchage en machine",
      "Ultra-heavy days and maximum security": "Journées ultra lourdes et sécurité maximale",
      "Unlike conventional disposable pads that feature plastic backings that trap heat, sweat, and moisture, Hailaflo is crafted from": "Contrairement aux serviettes jetables classiques dotées d'un support en plastique qui emprisonne la chaleur, la sueur et l'humidité, Hailaflo est fabriquée à partir de",
      "Unopened & Sealed Items:": "Articles non ouverts et scellés :",
      "Used to deliver relevant advertisements to you on other platforms (like Instagram, Facebook, or TikTok) based on your browsing habits on our store.": "Utilisé pour vous proposer des publicités pertinentes sur d'autres plateformes (comme Instagram, Facebook ou TikTok) en fonction de vos habitudes de navigation sur notre boutique.",
      "Versatile activewear designed for period days and busy routines.": "Vêtements de sport polyvalents conçus pour les journées de règles et les routines chargées.",
      "View size chart": "Voir le tableau des tailles",
      "Visit the FAQs": "Visitez la FAQ",
      "Waist (inches)": "Taille (pouces)",
      "Wash gently": "Laver délicatement",
      "Washable and long-lasting. one pair replaces months of disposables.": "Lavable et durable. une paire remplace des mois de produits jetables.",
      "Washing": "Lavage",
      "Water-ready protection without compromising style.": "Protection prête à l'eau sans compromettre le style.",
      "Waterproof Leak-Proof Barrier:": "Barrière étanche et anti-fuite :",
      "We are preparing our Activewear, Postpartum, and other collections. In the meantime, explore our available period underwear.": "Nous préparons nos collections Activewear, Postpartum et autres. En attendant, découvrez nos sous-vêtements menstruels disponibles.",
      "We collect personal information that you voluntarily provide to us when purchasing our products or communicating with us. This includes:": "Nous collectons les informations personnelles que vous nous fournissez volontairement lors de l'achat de nos produits ou lorsque vous communiquez avec nous. Cela comprend :",
      "We do not sell, rent, or trade your personal information. To fulfill your orders and manage our international logistics, your data is securely shared with:": "Nous ne vendons, ne louons ni n’échangeons vos informations personnelles. Pour honorer vos commandes et gérer notre logistique internationale, vos données sont partagées en toute sécurité avec :",
      "We implement strict physical, electronic, and administrative security measures to protect your personal data against unauthorized access, loss, or manipulation. In accordance with Nigerian and EU data laws, we only retain your personal data for as long as necessary to fulfill the business purposes for which it was collected, or to satisfy legal, accounting, and regulatory reporting requirements.": "Nous mettons en œuvre des mesures de sécurité physiques, électroniques et administratives strictes pour protéger vos données personnelles contre tout accès non autorisé, perte ou manipulation. Conformément aux lois nigérianes et européennes sur les données, nous ne conservons vos données personnelles que le temps nécessaire pour atteindre les objectifs commerciaux pour lesquels elles ont été collectées ou pour satisfaire aux exigences légales, comptables et réglementaires en matière de reporting.",
      "We make every effort to display the colors and features of our 4-layer period underwear as accurately as possible. However, your screen display may slightly alter colors.": "Nous mettons tout en œuvre pour afficher le plus fidèlement possible les couleurs et les caractéristiques de nos sous-vêtements menstruels 4 couches. Cependant, l'affichage de votre écran peut légèrement modifier les couleurs.",
      "We process your personal data under lawful bases recognized by the NDPA and GDPR to fulfill our contract with you and improve our services. We use this data to:": "Nous traitons vos données personnelles sur des bases juridiques reconnues par la NDPA et le RGPD pour remplir notre contrat avec vous et améliorer nos services. Nous utilisons ces données pour :",
      "We reserve the right to modify prices, update product descriptions, or discontinue items at any time without prior notice.": "Nous nous réservons le droit de modifier les prix, de mettre à jour les descriptions de produits ou d'interrompre des articles à tout moment sans préavis.",
      "We reserve the right to update or modify these Terms of Service at any time. Your continued use of our website following any changes constitutes acceptance of those updates.": "Nous nous réservons le droit de mettre à jour ou de modifier ces conditions de service à tout moment. Votre utilisation continue de notre site Web après toute modification constitue une acceptation de ces mises à jour.",
      "We use cookies to improve your browsing and shopping experience in the following ways:": "Nous utilisons des cookies pour améliorer votre expérience de navigation et d'achat des manières suivantes :",
      "We want to get your": "Nous voulons obtenir votre",
      "We're here for you": "Nous sommes là pour vous",
      "Wear them like regular underwear and check that the fit feels secure and comfortable.": "Portez-les comme des sous-vêtements ordinaires et vérifiez que la coupe est sûre et confortable.",
      "Wearing period underwear on your heaviest days, using them exclusively for overnight security, or doing quick mid-week laundry loads.": "Portez des sous-vêtements menstruels lors de vos journées les plus chargées, utilisez-les exclusivement pour la sécurité pendant la nuit ou faites des charges de lessive rapides en milieu de semaine.",
      "Welcome to Hailaflo": "Bienvenue à Hailaflo",
      "What Are Cookies?": "Que sont les cookies ?",
      "What is Hailaflo Period Underwear and how does it work?": "Qu’est-ce que les sous-vêtements menstruels Hailaflo et comment fonctionnent-ils ?",
      "What it feels like:": "Ce que ça fait :",
      "What to Expect on Your First Day Wearing Hailaflo": "À quoi vous attendre lors de votre premier jour de port de Hailaflo",
      "What to expect when your Hailaflo order is on its way, and how returns and exchanges work.": "À quoi vous attendre lorsque votre commande Hailaflo est en route et comment fonctionnent les retours et les échanges.",
      "When performance changes:": "Lorsque les performances changent :",
      "When to change:": "Quand changer :",
      "When you shop with us, third-party services—such as Google Analytics, Shopify Payments, or the TikTok Pixel—may also place cookies on your device to facilitate smooth checkout transactions and track advertising campaign performance.": "Lorsque vous effectuez des achats chez nous, des services tiers, tels que Google Analytics, Shopify Payments ou TikTok Pixel, peuvent également placer des cookies sur votre appareil pour faciliter les transactions de paiement fluides et suivre les performances des campagnes publicitaires.",
      "When you take them off, just run the gusset under cold tap water in the sink or shower. Squeeze it gently until the water runs completely clear, then pop them into your laundry basket or washing machine!": "Lorsque vous les enlevez, passez simplement le gousset sous l’eau froide du robinet dans l’évier ou la douche. Pressez-le doucement jusqu'à ce que l'eau soit complètement claire, puis mettez-les dans votre panier à linge ou votre machine à laver !",
      "White": "Blanc",
      "Why might they ever feel wet?": "Pourquoi pourraient-ils se sentir mouillés ?",
      "Why period underwear can help with first periods": "Pourquoi les sous-vêtements menstruels peuvent aider lors des premières règles",
      "Wicking layers stay fresh so you feel clean all cycle.": "Les couches absorbantes restent fraîches pour que vous vous sentiez propre tout au long du cycle.",
      "With proper care,": "Avec des soins appropriés,",
      "With your explicit consent, send you promotional emails, product launch newsletters, or targeted advertisements on social media platforms like Instagram and TikTok.": "Avec votre consentement explicite, envoyez-vous des e-mails promotionnels, des newsletters de lancement de produits ou des publicités ciblées sur les plateformes de réseaux sociaux comme Instagram et TikTok.",
      "Withdraw Consent": "Retirer le consentement",
      "Would my period pant smell?": "Ma culotte menstruelle risque-t-elle de dégager une odeur ?",
      "X": "X",
      "X-Large": "X-Large",
      "Yes. The fit is designed to stay secure through movement, while layered gusset construction helps keep you dry and comfortable for extended wear.": "Oui. La coupe est conçue pour rester en sécurité pendant les mouvements, tandis que la construction à soufflets superposés vous aide à rester au sec et à l'aise pour un port prolongé.",
      "You agree to provide current, complete, and accurate purchase and account information for all orders. We accept major credit cards, debit cards, and authorized digital payment gateways. We reserve the right to refuse or cancel any order if fraudulent or unauthorized activity is suspected.": "Vous acceptez de fournir des informations d’achat et de compte à jour, complètes et exactes pour toutes les commandes. Nous acceptons les principales cartes de crédit, cartes de débit et passerelles de paiement numérique autorisées. Nous nous réservons le droit de refuser ou d'annuler toute commande si une activité frauduleuse ou non autorisée est suspectée.",
      "You have": "Tu as",
      "You have the right to accept or decline optional cookies. You can adjust your cookie preferences through the interactive cookie banner popup when you first visit our site. Alternatively, you can modify your web browser settings to block or delete cookies entirely. Please note that disabling essential cookies may impact your ability to use certain features of our online store, including the shopping cart.": "Vous avez le droit d'accepter ou de refuser les cookies facultatifs. Vous pouvez ajuster vos préférences en matière de cookies via la bannière contextuelle interactive des cookies lorsque vous visitez notre site pour la première fois. Vous pouvez également modifier les paramètres de votre navigateur Web pour bloquer ou supprimer complètement les cookies. Veuillez noter que la désactivation des cookies essentiels peut avoir un impact sur votre capacité à utiliser certaines fonctionnalités de notre boutique en ligne, notamment le panier.",
      "You may also like": "Vous aimerez peut-être aussi",
      "You might automatically find yourself going to the bathroom to check for leaks out of habit. When you do, you will see that the top layer looks and feels remarkably dry, and there is absolutely zero odour.": "Par habitude, vous pourriez automatiquement vous retrouver aux toilettes pour vérifier les fuites. Ce faisant, vous verrez que la couche supérieure semble remarquablement sèche et qu’elle n’a absolument aucune odeur.",
      "You wash and dry your pairs quickly during the week so you can reuse them before your cycle ends.": "Vous lavez et séchez vos paires rapidement dans la semaine afin de pouvoir les réutiliser avant la fin de votre cycle.",
      "You wear": "Tu portes",
      "Your IP address, browser type, device information, and details about how you browse and interact with our online storefront.": "Votre adresse IP, votre type de navigateur, les informations sur votre appareil et les détails sur la façon dont vous naviguez et interagissez avec notre vitrine en ligne.",
      "Your flow can change throughout your cycle. Match each pair to when and how you plan to wear it, and keep a higher-absorbency option available for heavier hours or overnight use.": "Votre flux peut changer tout au long de votre cycle. Adaptez chaque paire au moment et à la manière dont vous prévoyez de la porter, et gardez une option à plus forte absorption disponible pour les heures plus longues ou une utilisation nocturne.",
      "Your full name, delivery address, billing address, email address, and phone number.": "Votre nom complet, votre adresse de livraison, votre adresse de facturation, votre adresse e-mail et votre numéro de téléphone.",
      "Your period is regulated entirely by your internal hormones, your genetics, and your reproductive health. No external menstrual product—whether it is a disposable pad, a tampon, a menstrual cup, or": "Vos règles sont entièrement régulées par vos hormones internes, votre génétique et votre santé reproductive. Aucun produit menstruel externe, qu'il s'agisse d'une serviette jetable, d'un tampon, d'une coupe menstruelle ou d'un",
      "[Insert Your Country/State, e.g., the United Kingdom]": "[Insérez votre pays/État, par exemple le Royaume-Uni]",
      "a copy of the personal data we hold about you.": "une copie des données personnelles que nous détenons à votre sujet.",
      "absorb your flow directly, giving you complete peace of mind and sustainable comfort all day long.": "absorbent directement le flux menstruel et vous offrent sérénité et confort durable tout au long de la journée.",
      "across a typical 5-day cycle, we recommend a balanced mix of absorbencies:": "sur un cycle typique de 5 jours, nous recommandons un mélange équilibré de niveaux d'absorption :",
      "actively prevents odour from developing:": "empêche activement le développement des odeurs :",
      "advanced 4-layer technology": "technologie avancée à 4 couches",
      "alongside a menstrual cup or tampon.": "à côté d’une coupe menstruelle ou d’un tampon.",
      "and keeps the 4-layer gusset pressed comfortably against your body.": "et maintient le gousset à 4 couches confortablement pressé contre votre corps.",
      "and the European Union's": "et l'Union européenne",
      "at any time from our marketing emails by clicking the \"Unsubscribe\" link at the bottom of any message.": "à tout moment depuis nos e-mails marketing en cliquant sur le lien « Se désabonner » situé en bas de n'importe quel message.",
      "by requesting that we permanently delete your data, provided it is no longer required for legal or contractual fulfillment.": "en nous demandant de supprimer définitivement vos données, à condition qu'elles ne soient plus nécessaires à l'exécution légale ou contractuelle.",
      "cannot be returned or exchanged": "ne peut être ni repris ni échangé",
      "contact us": "Contactez-nous",
      "designed to replace traditional pads and tampons. Engineered with a built-in, 4-layer gusset, our": "conçue pour remplacer les serviettes et tampons classiques. Grâce à son gousset intégré à 4 couches, notre",
      "eco-friendly menstrual products": "produits menstruels écologiques",
      "eco-friendly period": "période écolo",
      "feel": "sentir",
      "filter arrow": "flèche de filtre",
      "heavy flow": "flux abondants",
      "immediately. We will arrange a replacement or refund right away.": "immédiatement. Nous organiserons immédiatement un remplacement ou un remboursement.",
      "inaccurate or incomplete personal data.": "données personnelles inexactes ou incomplètes.",
      "is exciting, but it is completely normal to feel a little nervous or skeptical before your first day. To give you total peace of mind, here is exactly what your first day with Hailaflo will look and feel like.": "est excitant, mais il est tout à fait normal de se sentir un peu nerveux ou sceptique avant votre premier jour. Pour vous offrir une totale tranquillité d'esprit, voici exactement à quoi ressemblera votre première journée avec Hailaflo.",
      "is highly effective and designed to give you ultimate": "est très efficace et conçu pour vous offrir l'ultime",
      "is one of the world's best-known labels for textiles tested for harmful substances. For Hailaflo, this means that every single component of our": "est l'un des labels les plus connus au monde pour les textiles certifiés sans substances nocives. Pour Hailaflo, cela signifie que chaque composant de notre",
      "is simple! Proper care ensures that your 4-layer leak-proof technology stays highly effective and lasts for years. Just follow these four easy steps:": "c'est simple ! Un entretien approprié garantit que votre technologie anti-fuite à 4 couches reste très efficace et dure des années. Suivez simplement ces quatre étapes simples :",
      "is the ultimate": "sont une solution de",
      "leak-proof protection": "protection anti-fuite",
      "lighter, shorter, and much more comfortable. Here is why:": "plus léger, plus court et beaucoup plus confortable. Voici pourquoi :",
      "moisture-wicking top layer": "couche supérieure qui évacue l'humidité",
      "never use fabric softeners": "n'utilisez jamais d'assouplissant",
      "not": "pas",
      "of": "de",
      "rapidly pulls menstrual fluid away from your skin and dries almost instantly.": "éloigne rapidement le liquide menstruel de votre peau et sèche presque instantanément.",
      "reusable period underwear": "protection menstruelle réutilisable",
      "stain-free protection": "protection sans taches",
      "stain-free, eco-friendly period": "période sans taches et respectueuse de l'environnement",
      "support@hailaflo.com": "support@hailaflo.com",
      "sustainable period care": "soins menstruels durables",
      "that protects both you and the planet.": "qui vous protège ainsi que la planète.",
      "to request a return or exchange for a full refund. To be eligible, the item must be completely unworn, unwashed, and remain": "pour demander un retour ou un échange pour un remboursement complet. Pour être éligible, l'article doit être entièrement non porté, non lavé et rester",
      "to request a transfer of your data to another service provider.": "de demander un transfert de vos données vers un autre prestataire de services.",
      "to you as quickly as possible!": "à vous au plus vite !",
      "toxin-free menstrual products": "produits menstruels sans toxines",
      "underwear removes that chemical irritation completely.": "les sous-vêtements éliminent complètement cette irritation chimique.",
      "use fabric softener, bleach, or stain removers. These can coat the fibers and destroy the built-in absorbent core.": "utilisez un assouplissant, de l'eau de Javel ou des détachants. Ceux-ci peuvent recouvrir les fibres et détruire le noyau absorbant intégré.",
      "uses an instant-dry moisture-wicking top layer. Because it pulls fluid away from your skin immediately, you don't feel the blood pooling, creating the sensation of a lighter, cleaner cycle.": "utilise une couche supérieure qui évacue l'humidité à séchage instantané. Parce qu'il élimine immédiatement le liquide de votre peau, vous ne sentez pas le sang s'accumuler, créant la sensation d'un cycle plus léger et plus propre.",
      "with total confidence, knowing they are completely safe for your body.": "en toute confiance, sachant qu'ils sont totalement sans danger pour votre corps.",
      "without doing laundry every single day.": "sans faire la lessive tous les jours.",
      "~12 regular pads": "~12 tampons réguliers",
      "~2 regular Pads": "~2 tampons réguliers",
      "~4 regular Pads": "~4 tampons réguliers",
      "~8 regular pads": "~8 tampons réguliers",
      "© 2026 HailaFlo. All rights reserved.": "© 2026 HailaFlo. Tous droits réservés.",
      "– For complete, worry-free overnight protection and ultra-heavy days.": "– Pour une protection complète et sans souci pendant la nuit et les journées ultra lourdes.",
      "– For your light to moderate days at the start and end of your cycle.": "– Pour vos journées légères à modérées en début et fin de cycle.",
      "– For your peak daytime flow and reliable work/school wear.": "– Pour votre flux de pointe pendant la journée et des vêtements de travail/école fiables.",
      "—from the moisture-wicking top layer down to the threads and elastics—is certified free from dangerous levels of toxins, PFAS, heavy metals, and formaldehyde. You can wear our": "— de la couche supérieure qui évacue l'humidité jusqu'aux fils et élastiques — est certifié exempt de niveaux dangereux de toxines, de PFAS, de métaux lourds et de formaldéhyde. Vous pouvez porter notre",
      "—has the ability to influence your actual internal uterine lining shedding.": "– a la capacité d’influencer la perte réelle de la muqueuse utérine interne.",
      "—is made from a high-performance fabric that pulls liquid away from your skin instantly.": "-est fabriqué à partir d'un tissu haute performance qui élimine instantanément le liquide de votre peau.",
      "☀️ Afternoon: The \"Dryness Check\"": "☀️ Après-midi : Le « Dryness Check »",
      "﻿": "﻿",
      "🌅 Morning: Putting Them On": "🌅 Matin : les mettre",
      "🌆 Evening: Changing and Rinsing": "🌆 Soirée : Change et rinçage",
      "🍬 A comforting snack, if school rules allow.": "🍬 Une collation réconfortante, si le règlement scolaire le permet.",
      "🎒 School Bag Essentials": "🎒 Essentiels du sac d'école",
      "👩‍🏫 Simple Instructions for Your Teen": "👩‍🏫 Instructions simples pour votre adolescent",
      "🗓️ Starting Their First Collection": "🗓️ Début de leur première collection",
      "🛍️ A small waterproof wet bag for a used pair until they get home.": "🛍️ Un petit sac étanche pour une paire usagée jusqu'à son retour à la maison.",
      "🧴 Travel wipes for extra freshness; dispose of wipes in a bin, not the toilet.": "🧴 Lingettes de voyage pour plus de fraîcheur ; jetez les lingettes dans une poubelle, pas dans les toilettes.",
      "🩲 1 Heavy Plus pair for overnight use or heavier flow.": "🩲 1 paire Heavy Plus pour une utilisation de nuit ou un flux plus abondant.",
      "🩲 2 Regular Flow pairs for lighter days or the days leading up to a period.": "🩲 2 paires Regular Flow pour les journées plus légères ou les jours précédant les règles.",
      "🩲 2 Regular-Heavy Flow pairs for longer school days.": "🩲 2 paires Regular-Heavy Flow pour des journées scolaires plus longues.",
      "🩸": "🩸",
      "🩸🩸": "🩸🩸",
      "🩸🩸🩸": "🩸🩸🩸",
      "🩺 A fresh pair of Hailaflo underwear in an absorbency that suits their flow.": "🩺 Une nouvelle paire de sous-vêtements Hailaflo dans un pouvoir absorbant adapté à leur flux.",
    },
  };

  const dictionaries = {
    de: { ...de, ...additionalTranslations.de },
    fr: { ...fr, ...additionalTranslations.fr },
  };
  const supportedLanguages = ['en', 'de', 'fr'];
  const norm = s => s.trim().replace(/\s+/g, ' ');
  const browserLanguage = () => {
    const preferences = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
    const language = preferences
      .map(preference => preference.toLowerCase().split(/[-_]/)[0])
      .find(preference => supportedLanguages.includes(preference));
    return language || 'en';
  };
  const currentLang = () => {
    const savedPreference = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (supportedLanguages.includes(savedPreference)) return savedPreference;

    const legacyPreference = localStorage.getItem(LANG_KEY);
    if (legacyPreference === 'de' || legacyPreference === 'fr') return legacyPreference;

    return browserLanguage();
  };

  function translateNodes(lang) {
    const dict = dictionaries[lang];
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
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
      if (dict && dict[key]) {
        const leadingWhitespace = node.__orig.match(/^\s*/)[0];
        const trailingWhitespace = node.__orig.match(/\s*$/)[0];
        node.nodeValue = leadingWhitespace + dict[key] + trailingWhitespace;
      } else {
        node.nodeValue = node.__orig;
      }
    }
    document.querySelectorAll('[placeholder], [aria-label], [alt], [title]').forEach(function (el) {
      ['placeholder', 'aria-label', 'alt', 'title'].forEach(function (attribute) {
        if (!el.hasAttribute(attribute)) return;
        const originalKey = `__orig_${attribute.replace('-', '_')}`;
        if (el[originalKey] === undefined) el[originalKey] = el.getAttribute(attribute);
        const originalValue = el[originalKey] || '';
        const key = norm(originalValue);
        el.setAttribute(attribute, (dict && dict[key]) ? dict[key] : originalValue);
      });
    });
    document.querySelectorAll('select:not(.lang-select) option').forEach(function (option) {
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

  function applyLang(lang, savePreference = false) {
    translateNodes(lang);
    document.documentElement.lang = lang;
    if (savePreference) localStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
    updateToggles(lang);
  }

  function makeToggle() {
    const sel = document.createElement('select');
    sel.className = 'lang-select';
    sel.setAttribute('aria-label', 'Change language');
    sel.innerHTML = '<option value="en">EN</option><option value="de">DE</option><option value="fr">FR</option>';
    sel.value = currentLang();
    sel.addEventListener('change', function () {
      applyLang(sel.value, true);
    });
    return sel;
  }

  const desktopActions = document.querySelector('.hidden.lg\\:flex.items-center');
  if (desktopActions) desktopActions.appendChild(makeToggle());
  const mobileMenuLinks = document.querySelector('.mobile-menu ul');
  if (mobileMenuLinks) mobileMenuLinks.after(makeToggle());

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
  document.dispatchEvent(new Event('haila:rerender'));

  function toggleVisibility() {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
});