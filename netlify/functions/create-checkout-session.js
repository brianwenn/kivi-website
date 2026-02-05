/**
 * Netlify Function: Create Stripe Checkout Session
 * Path: netlify/functions/create-checkout-session.js
 * 
 * This serverless function creates a Stripe Checkout Session
 * and returns the URL for redirection.
 * 
 * IMPORTANT: Set environment variables in Netlify dashboard:
 * - STRIPE_SECRET_KEY (your Stripe secret key)
 * - URL (your site URL, e.g., https://kivi.netlify.app)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Define allowed products (server-side price validation)
const ALLOWED_PRODUCTS = {
  'kivi-sauna-hat': {
    name: 'KIVI Sauna Hat',
    price: 7900,  // $79.00 AUD in cents
    currency: 'aud'
  }
};

exports.handler = async (event, context) => {
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      })
    };
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid request body',
          message: 'Request body must be valid JSON'
        })
      };
    }

    const { items } = requestBody;

    // Validate items exist and is array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid cart items',
          message: 'Cart must contain at least one item'
        })
      };
    }

    // Build and validate line items for Stripe
    const lineItems = [];
    
    for (const item of items) {
      // Validate item structure
      if (!item.id || !item.quantity) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid item',
            message: 'Each item must have id and quantity'
          })
        };
      }

      // Get product details from allowed list
      const product = ALLOWED_PRODUCTS[item.id];
      
      if (!product) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid product',
            message: `Product ${item.id} is not available`
          })
        };
      }

      // Validate quantity
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity < 1 || quantity > 99) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid quantity',
            message: 'Quantity must be between 1 and 99'
          })
        };
      }

      // Add to line items
      lineItems.push({
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: '100% merino wool sauna hat',
          },
          unit_amount: product.price,
        },
        quantity: quantity,
      });
    }

    // Determine success and cancel URLs
    const baseUrl = process.env.URL || 'http://localhost:8888';
    const successUrl = `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/cancel.html`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      
      // Collect shipping address
      shipping_address_collection: {
        allowed_countries: ['AU', 'NZ', 'US', 'GB', 'CA', 'DE', 'FR', 'IT', 'ES'],
      },
      
      // Free shipping option
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { 
              amount: 0, 
              currency: 'aud' 
            },
            display_name: 'Free Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      
      // Optional: Customer email collection
      customer_email: undefined,  // Can be set if you have user email
      
      // Metadata for order tracking
      metadata: {
        source: 'kivi-website',
        items: JSON.stringify(items.map(i => ({
          id: i.id,
          quantity: i.quantity
        })))
      }
    });

    // Return checkout URL
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      })
    };

  } catch (error) {
    // Log error server-side
    console.error('Stripe Checkout Session Error:', error);
    
    // Return sanitized error to client
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Checkout session creation failed',
        message: error.message || 'An unexpected error occurred'
      })
    };
  }
};
