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

/* cart page */
document.addEventListener('DOMContentLoaded', function () {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;

  const TAX_RATE = 0.10;
  const money = value => '$' + value.toFixed(2);
  const parseMoney = text => parseFloat((text || '').replace(/[^0-9.]/g, '')) || 0;

  function recalculate() {
    let subtotal = 0;
    cartItems.querySelectorAll('.cart-row').forEach(function (row) {
      const unitPrice = parseMoney(row.querySelector('.cart-unit-price')?.textContent);
      const quantity = parseInt(row.querySelector('.quantity')?.textContent, 10) || 0;
      const rowTotal = unitPrice * quantity;
      const totalCell = row.querySelector('.cart-row-total');
      if (totalCell) totalCell.textContent = money(rowTotal);
      subtotal += rowTotal;
    });

    const tax = subtotal * TAX_RATE;
    const shipping = 0;
    const total = subtotal + tax + shipping;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = money(value);
    };
    setText('cart-subtotal', subtotal);
    setText('cart-tax', tax);
    setText('cart-shipping', shipping);
    setText('cart-total', total);
  }

  cartItems.addEventListener('click', function (e) {
    const incrementBtn = e.target.closest('.cart-increment');
    const decrementBtn = e.target.closest('.cart-decrement');
    const removeBtn = e.target.closest('.cart-remove');

    if (incrementBtn) {
      const q = incrementBtn.previousElementSibling;
      q.textContent = (parseInt(q.textContent, 10) || 0) + 1;
      recalculate();
    } else if (decrementBtn) {
      const q = decrementBtn.nextElementSibling;
      const current = parseInt(q.textContent, 10) || 1;
      if (current > 1) {
        q.textContent = current - 1;
        recalculate();
      }
    } else if (removeBtn) {
      removeBtn.closest('.cart-row').remove();
      recalculate();
    }
  });

  const emptyBtn = document.getElementById('cart-empty');
  if (emptyBtn) {
    emptyBtn.addEventListener('click', function () {
      cartItems.querySelectorAll('.cart-row').forEach(row => row.remove());
      recalculate();
    });
  }

  const updateBtn = document.getElementById('cart-update');
  if (updateBtn) {
    updateBtn.addEventListener('click', function (e) {
      e.preventDefault();
      recalculate();
    });
  }

  recalculate();
});