/**
 * KIVI Product Page Functionality
 * Handles quantity controls and add to cart
 * FIXED: Single listener attachment, no quantity multiplication
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
 * CRITICAL FIX: Only attach listeners ONCE per page load
 */
function initProductPage() {
  // CRITICAL: Prevent duplicate listener attachment
  if (listenersAttached) {
    console.log('Product page already initialized, skipping');
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
  // CRITICAL FIX: Each handler modifies quantity EXACTLY ONCE
  decreaseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (productQuantity > 1) {
      productQuantity = productQuantity - 1;  // Explicit decrement
      quantityDisplay.textContent = productQuantity;
      console.log('Decreased to:', productQuantity);
    }
  });

  // Increase quantity
  // CRITICAL FIX: Each handler modifies quantity EXACTLY ONCE
  increaseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (productQuantity < Cart.MAX_QUANTITY) {
      productQuantity = productQuantity + 1;  // Explicit increment
      quantityDisplay.textContent = productQuantity;
      console.log('Increased to:', productQuantity);
    }
  });

  // Add to cart
  addToCartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart();
  });

  // CRITICAL: Mark listeners as attached and NEVER reset this during session
  listenersAttached = true;
  console.log('Product page initialized, listeners attached');
}

/**
 * Add current product to cart
 * CRITICAL FIX: Pass quantity exactly once, no multiplication
 */
function addToCart() {
  // Prevent double-click
  if (isAddingToCart) {
    console.log('Already adding to cart, ignoring click');
    return;
  }
  
  isAddingToCart = true;
  
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  
  if (!addToCartBtn) {
    isAddingToCart = false;
    return;
  }

  // CRITICAL FIX: Create item with EXACT quantity value
  const item = {
    id: KIVI_PRODUCT.id,
    name: KIVI_PRODUCT.name,
    price: KIVI_PRODUCT.price,
    quantity: productQuantity,  // Pass exact value, no multiplication
    image: KIVI_PRODUCT.image
  };

  console.log('Adding to cart:', item);

  // Add to cart
  Cart.add(item);
  
  // Visual feedback
  const originalText = addToCartBtn.textContent;
  
  addToCartBtn.textContent = 'Added! ✓';
  addToCartBtn.style.backgroundColor = 'var(--earth)';
  addToCartBtn.disabled = true;
  
  // CRITICAL FIX: Reset button state after delay
  setTimeout(function() {
    const btn = document.getElementById('add-to-cart-btn');
    if (btn) {
      btn.textContent = 'Add to Cart';
      btn.style.backgroundColor = '';
      btn.disabled = false;
    }
    isAddingToCart = false;
    console.log('Button state reset');
  }, 1500);
}

/**
 * Reset product page UI state
 * CRITICAL FIX: Reset UI but NOT listener flag
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
  
  // CRITICAL FIX: DO NOT reset listenersAttached flag
  // This prevents duplicate listener attachment
  console.log('Product page UI reset (listeners remain attached)');
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