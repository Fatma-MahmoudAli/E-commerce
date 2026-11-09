const products = [
  {
    id: 'headphones',
    name: 'Studio Headphones',
    category: 'Electronics',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
    alt: 'Over-ear headphones in a warm orange color'
  },
  {
    id: 'tote',
    name: 'Everyday Tote',
    category: 'Fashion',
    price: 34.00,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80',
    alt: 'A stylish everyday bag'
  },
  {
    id: 'watch',
    name: 'Minimal Watch',
    category: 'Accessories',
    price: 64.50,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
    alt: 'Minimal wristwatch with a clean modern face'
  },
  {
    id: 'sneakers',
    name: 'City Sneakers',
    category: 'Fashion',
    price: 72.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80',
    alt: 'Bright red casual sneakers'
  },
  {
    id: 'camera',
    name: 'Pocket Camera',
    category: 'Electronics',
    price: 119.00,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80',
    alt: 'Compact camera ready for everyday adventures'
  },
  {
    id: 'sunglasses',
    name: 'Weekend Shades',
    category: 'Accessories',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80',
    alt: 'Classic sunglasses with a dark frame'
  }
];

const productGrid = document.querySelector('#product-grid');
const cartCount = document.querySelector('#cart-count');
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const cartHeadingCount = document.querySelector('#cart-heading-count');
const cartPanel = document.querySelector('#cart-panel');
const pageOverlay = document.querySelector('#page-overlay');
const cartEmpty = document.querySelector('#cart-empty');
const cartFooter = document.querySelector('#cart-footer');
const successModal = document.querySelector('#success-modal');

let cart = loadCart();
let activeCategory = 'All';
let lastFocusedElement = null;

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem('vibestore-cart') || '[]');
    if (!Array.isArray(savedCart)) return [];
    return savedCart.filter((item) =>
      item && products.some((product) => product.id === item.id) &&
      Number.isInteger(item.quantity) && item.quantity > 0
    );
  } catch (error) {
    console.warn('Could not restore the saved cart.', error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('vibestore-cart', JSON.stringify(cart));
  } catch (error) {
    console.warn('Could not save the cart in this browser.', error);
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function renderProducts() {
  const visibleProducts = activeCategory === 'All'
    ? products
    : products.filter((product) => product.category === activeCategory);

  document.querySelector('#results-count').textContent =
    `${String(visibleProducts.length).padStart(2, '0')} FINDS`;

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<p class="no-products">No finds in this category just yet.</p>';
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy">
        <span class="product-number">${String(products.indexOf(product) + 1).padStart(2, '0')}</span>
      </div>
      <span class="product-category">${product.category}</span>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
      <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">
        Add to cart <span aria-hidden="true">+</span>
      </button>
    </article>
  `).join('');
}

function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = itemCount;
  cartHeadingCount.textContent = `(${itemCount})`;
  cartTotal.textContent = formatPrice(total);
  cartEmpty.classList.toggle('visible', cart.length === 0);
  cartFooter.classList.toggle('hidden', cart.length === 0);
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return '';
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.alt}">
        <div>
          <h3 class="cart-item-title">${product.name}${item.quantity > 1 ? ` × ${item.quantity}` : ''}</h3>
          <span class="cart-item-category">${product.category}</span>
          <span class="cart-item-price">${formatPrice(product.price * item.quantity)}</span>
        </div>
        <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name} from cart">Remove</button>
      </article>
    `;
  }).join('');
}

function setOverlay(visible) {
  pageOverlay.hidden = false;
  requestAnimationFrame(() => pageOverlay.classList.toggle('visible', visible));
  if (!visible) {
    window.setTimeout(() => {
      if (!cartPanel.classList.contains('open')) pageOverlay.hidden = true;
    }, 250);
  }
}

function openCart() {
  lastFocusedElement = document.activeElement;
  cartPanel.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
  setOverlay(true);
  document.body.classList.add('no-scroll');
  document.querySelector('#close-cart').focus();
}

function closeCart() {
  cartPanel.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
  setOverlay(false);
  document.body.classList.remove('no-scroll');
  if (lastFocusedElement) lastFocusedElement.focus();
}

function openSuccessModal() {
  successModal.classList.add('open');
  successModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  document.querySelector('#close-modal').focus();
}

function closeSuccessModal() {
  successModal.classList.remove('open');
  successModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  document.querySelector('#cart-trigger').focus();
}

document.querySelector('.filter-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;

  activeCategory = button.dataset.category;
  document.querySelectorAll('.filter-button').forEach((filterButton) => {
    const selected = filterButton === button;
    filterButton.classList.toggle('active', selected);
    filterButton.setAttribute('aria-pressed', String(selected));
  });
  renderProducts();
});

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;

  const existingItem = cart.find((item) => item.id === button.dataset.add);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ id: button.dataset.add, quantity: 1 });
  saveCart();
  renderCart();
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;

  cart = cart.filter((item) => item.id !== button.dataset.remove);
  saveCart();
  renderCart();
});

document.querySelector('#cart-trigger').addEventListener('click', openCart);
document.querySelector('#close-cart').addEventListener('click', closeCart);
pageOverlay.addEventListener('click', closeCart);
document.querySelector('#continue-shopping').addEventListener('click', () => {
  closeCart();
  document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
});
document.querySelector('#checkout-button').addEventListener('click', () => {
  if (!cart.length) return;
  closeCart();
  openSuccessModal();
  cart = [];
  saveCart();
  renderCart();
});
document.querySelector('#close-modal').addEventListener('click', closeSuccessModal);
document.querySelector('#done-button').addEventListener('click', closeSuccessModal);
successModal.addEventListener('click', (event) => {
  if (event.target === successModal) closeSuccessModal();
});

document.querySelector('#menu-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const nav = document.querySelector('#main-nav');
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('open', !expanded);
});
document.querySelector('#main-nav').addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  document.querySelector('#main-nav').classList.remove('open');
  document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (successModal.classList.contains('open')) closeSuccessModal();
  else if (cartPanel.classList.contains('open')) closeCart();
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
renderProducts();
renderCart();
