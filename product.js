/**
 * KIVI Product Page Functionality
 * Handles quantity controls and add to cart
 */

// Product configuration
const KIVI_PRODUCT = {
  id: 'kivi-sauna-hat',
  name: 'KIVI Sauna Hat',
  price: 7900,  // $79.00 in cents
  image: '🧢'
};

// Current product quantity
let productQuantity = 1;

// Flag to prevent duplicate listener attachment
let listenersAttached = false;

// Flag to prevent double-click add to cart
let isAddingToCart = false;

/**
 * Initialize product page controls
 */
function initProductPage() {
  // Prevent duplicate listener attachment
  if (listenersAttached) {
    return;
  }

  const decreaseBtn = document.getElementById('decrease-qty');
  const increaseBtn = document.getElementById('increase-qty');
  const quantityDisplay = document.getElementById('quantity-value');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  if (!decreaseBtn || !increaseBtn || !quantityDisplay || !addToCartBtn) {
    console.warn('Product page elements not found');
    return;
  }

  // Decrease quantity
  decreaseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (productQuantity > 1) {
      productQuantity--;
      quantityDisplay.textContent = productQuantity;
    }
  });

  // Increase quantity
  increaseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (productQuantity < Cart.MAX_QUANTITY) {
      productQuantity++;
      quantityDisplay.textContent = productQuantity;
    }
  });

  // Add to cart
  addToCartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart();
  });

  // Mark listeners as attached
  listenersAttached = true;
}

/**
 * Add current product to cart
 */
function addToCart() {
  // Prevent double-click
  if (isAddingToCart) {
    return;
  }
  
  isAddingToCart = true;
  
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  
  if (!addToCartBtn) {
    isAddingToCart = false;
    return;
  }

  // Create item object
  const item = {
    id: KIVI_PRODUCT.id,
    name: KIVI_PRODUCT.name,
    price: KIVI_PRODUCT.price,
    quantity: productQuantity,
    image: KIVI_PRODUCT.image
  };

  // Add to cart
  Cart.add(item);
  
  // Visual feedback
  const originalText = addToCartBtn.textContent;
  const originalBg = addToCartBtn.style.backgroundColor;
  
  addToCartBtn.textContent = 'Added! ✓';
  addToCartBtn.style.backgroundColor = 'var(--earth)';
  addToCartBtn.disabled = true;
  
  // Reset after animation
  setTimeout(function() {
    addToCartBtn.textContent = originalText;
    addToCartBtn.style.backgroundColor = originalBg;
    addToCartBtn.disabled = false;
    isAddingToCart = false;
  }, 1500);
}

/**
 * Reset product page UI state
 */
function resetProductPageUI() {
  // Reset quantity to 1
  productQuantity = 1;
  const quantityDisplay = document.getElementById('quantity-value');
  if (quantityDisplay) {
    quantityDisplay.textContent = productQuantity;
  }
  
  // Reset add to cart button
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.textContent = 'Add to Cart';
    addToCartBtn.style.backgroundColor = '';
    addToCartBtn.disabled = false;
  }
  
  // Reset adding flag
  isAddingToCart = false;
  
  // Reset listeners flag so they can be reattached
  listenersAttached = false;
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if product page is active
    const productPage = document.getElementById('product');
    if (productPage && productPage.classList.contains('active')) {
      initProductPage();
    }
  });
}
