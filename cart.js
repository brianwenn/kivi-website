/**
 * KIVI Cart Management System
 * Handles all cart operations using localStorage
 * Production-ready with error handling and validation
 */

const Cart = {
  
  STORAGE_KEY: 'kivi_cart',
  MAX_QUANTITY: 99,

  /**
   * Get current cart from localStorage
   * @returns {Object} Cart object with items array
   */
  get: function() {
    try {
      const cartData = localStorage.getItem(this.STORAGE_KEY);
      if (cartData) {
        const cart = JSON.parse(cartData);
        // Validate cart structure
        if (cart && Array.isArray(cart.items)) {
          return cart;
        }
      }
    } catch (e) {
      console.error('Error reading cart:', e);
      this.clear();
    }
    return this.empty();
  },

  /**
   * Create empty cart structure
   * @returns {Object} Empty cart object
   */
  empty: function() {
    return {
      items: [],
      created_at: Date.now(),
      updated_at: Date.now()
    };
  },

  /**
   * Save cart to localStorage
   * @param {Object} cart - Cart object to save
   */
  save: function(cart) {
    try {
      cart.updated_at = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
      this.updateHeaderCount();
      return true;
    } catch (e) {
      console.error('Error saving cart:', e);
      return false;
    }
  },

  /**
   * Add item to cart or update quantity if exists
   * @param {Object} item - Item to add {id, name, price, quantity}
   * @returns {Object} Updated cart
   */
  add: function(item) {
    // Validate item
    if (!item || !item.id || !item.name || !item.price || !item.quantity) {
      console.error('Invalid item:', item);
      return this.get();
    }

    const cart = this.get();
    
    // Check if item already exists
    const existingIndex = cart.items.findIndex(i => i.id === item.id);
    
    if (existingIndex > -1) {
      // Update quantity (don't exceed max)
      const newQuantity = Math.min(
        cart.items[existingIndex].quantity + item.quantity,
        this.MAX_QUANTITY
      );
      cart.items[existingIndex].quantity = newQuantity;
    } else {
      // Add new item (enforce max quantity)
      item.quantity = Math.min(item.quantity, this.MAX_QUANTITY);
      cart.items.push(item);
    }
    
    this.save(cart);
    return cart;
  },

  /**
   * Update item quantity
   * @param {string} itemId - Item ID
   * @param {number} quantity - New quantity
   */
  updateQuantity: function(itemId, quantity) {
    const cart = this.get();
    const item = cart.items.find(i => i.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        this.remove(itemId);
      } else if (quantity <= this.MAX_QUANTITY) {
        item.quantity = quantity;
        this.save(cart);
      }
    }
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Item ID to remove
   */
  remove: function(itemId) {
    const cart = this.get();
    cart.items = cart.items.filter(i => i.id !== itemId);
    this.save(cart);
  },

  /**
   * Clear entire cart
   */
  clear: function() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateHeaderCount();
  },

  /**
   * Get total item count
   * @returns {number} Total quantity of all items
   */
  getCount: function() {
    const cart = this.get();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * Get total price in cents
   * @returns {number} Total price in cents
   */
  getTotal: function() {
    const cart = this.get();
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  /**
   * Update cart count badge in header
   */
  updateHeaderCount: function() {
    const count = this.getCount();
    const cartBadge = document.getElementById('cart-count');
    
    if (cartBadge) {
      if (count > 0) {
        cartBadge.textContent = count;
        cartBadge.style.display = 'flex';
      } else {
        cartBadge.style.display = 'none';
      }
    }
  },

  /**
   * Format price from cents to display format
   * @param {number} cents - Price in cents
   * @returns {string} Formatted price (e.g., "$79.00")
   */
  formatPrice: function(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
};

// Initialize cart count on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    Cart.updateHeaderCount();
  });
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cart;
}
