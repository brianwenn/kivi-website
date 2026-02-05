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

/**
 * Initialize product page controls
 */
function initProductPage() {
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
    if (productQuantity > 1) {
      productQuantity--;
      quantityDisplay.textContent = productQuantity;
    }
  });

  // Increase quantity
  increaseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (productQuantity < Cart.MAX_QUANTITY) {
      productQuantity++;
      quantityDisplay.textContent = productQuantity;
    }
  });

  // Add to cart
  addToCartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    addToCart();
  });
}

/**
 * Add current product to cart
 */
function addToCart() {
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  
  if (!addToCartBtn) return;

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
    
    // Optional: Show cart or redirect to checkout
    // Uncomment one of these if desired:
    // showCartNotification();
    // showPage('checkout');
  }, 1500);
}

/**
 * Optional: Show cart notification (can be implemented later)
 */
function showCartNotification() {
  // Could show a toast notification
  // For now, just log
  console.log('Item added to cart');
}

/**
 * Reset quantity to 1 (useful when page loads or product changes)
 */
function resetProductQuantity() {
  productQuantity = 1;
  const quantityDisplay = document.getElementById('quantity-value');
  if (quantityDisplay) {
    quantityDisplay.textContent = productQuantity;
  }
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    initProductPage();
  });
}
