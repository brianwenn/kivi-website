/**
 * KIVI Checkout Page Functionality
 * Handles cart display, quantity updates, and payment initiation
 */

/**
 * Initialize checkout page
 */
function initCheckoutPage() {
  displayCartItems();
  updateCheckoutTotals();
  
  // Setup checkout button
  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      initiateCheckout();
    });
  }
}

/**
 * Display cart items in checkout page
 */
function displayCartItems() {
  const cart = Cart.get();
  const cartItemsContainer = document.getElementById('checkout-items');
  
  if (!cartItemsContainer) {
    console.warn('Checkout items container not found');
    return;
  }

  // Empty cart state
  if (cart.items.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <button class="btn btn-secondary" onclick="showPage('product')">
          Continue Shopping
        </button>
      </div>
    `;
    
    const checkoutBtn = document.getElementById('checkout-button');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.cursor = 'not-allowed';
    }
    return;
  }

  // Build cart items HTML
  let itemsHTML = '';
  
  cart.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    
    itemsHTML += `
      <div class="checkout-item" data-id="${item.id}">
        <div class="checkout-item-image">${item.image}</div>
        <div class="checkout-item-details">
          <h3>${item.name}</h3>
          <div class="checkout-item-quantity">
            <button class="qty-btn" onclick="updateCheckoutQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCheckoutQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="checkout-item-price">
          ${Cart.formatPrice(itemTotal)}
        </div>
        <button class="checkout-item-remove" onclick="removeCheckoutItem('${item.id}')" aria-label="Remove item">
          ✕
        </button>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = itemsHTML;
  
  // Enable checkout button
  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.cursor = 'pointer';
  }
}

/**
 * Update item quantity in checkout
 * @param {string} itemId - Item ID
 * @param {number} change - Quantity change (+1 or -1)
 */
function updateCheckoutQuantity(itemId, change) {
  const cart = Cart.get();
  const item = cart.items.find(i => i.id === itemId);
  
  if (item) {
    const newQuantity = item.quantity + change;
    
    // Validate quantity range
    if (newQuantity >= 1 && newQuantity <= Cart.MAX_QUANTITY) {
      Cart.updateQuantity(itemId, newQuantity);
      displayCartItems();
      updateCheckoutTotals();
    }
  }
}

/**
 * Remove item from cart in checkout
 * @param {string} itemId - Item ID to remove
 */
function removeCheckoutItem(itemId) {
  if (confirm('Remove this item from your cart?')) {
    Cart.remove(itemId);
    displayCartItems();
    updateCheckoutTotals();
  }
}

/**
 * Update checkout totals (subtotal, shipping, total)
 */
function updateCheckoutTotals() {
  const subtotal = Cart.getTotal();
  const shipping = 0;  // Free shipping
  const total = subtotal + shipping;

  // Update subtotal
  const subtotalEl = document.getElementById('checkout-subtotal');
  if (subtotalEl) {
    subtotalEl.textContent = Cart.formatPrice(subtotal);
  }

  // Update shipping
  const shippingEl = document.getElementById('checkout-shipping');
  if (shippingEl) {
    shippingEl.textContent = shipping === 0 ? 'Free' : Cart.formatPrice(shipping);
  }

  // Update total
  const totalEl = document.getElementById('checkout-total');
  if (totalEl) {
    totalEl.textContent = Cart.formatPrice(total);
  }
}

/**
 * Initiate Stripe checkout process
 */
async function initiateCheckout() {
  const checkoutBtn = document.getElementById('checkout-button');
  
  if (!checkoutBtn) return;

  // Disable button and show loading state
  const originalText = checkoutBtn.textContent;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Processing...';
  checkoutBtn.style.opacity = '0.7';

  try {
    const cart = Cart.get();
    
    // Validate cart is not empty
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Call backend to create Stripe Checkout Session
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        items: cart.items 
      })
    });

    // Check response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Checkout failed');
    }

    const data = await response.json();

    // Redirect to Stripe Checkout
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }

  } catch (error) {
    console.error('Checkout error:', error);
    
    // Show user-friendly error message
    alert('Sorry, something went wrong with checkout. Please try again or contact support.');
    
    // Restore button
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = originalText;
    checkoutBtn.style.opacity = '1';
  }
}

/**
 * Initialize checkout page when DOM is ready
 */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on checkout page
    const checkoutPage = document.getElementById('checkout');
    if (checkoutPage && checkoutPage.classList.contains('active')) {
      initCheckoutPage();
    }
  });
}

// Re-initialize when checkout page becomes active (for SPA navigation)
function onCheckoutPageShow() {
  initCheckoutPage();
}
