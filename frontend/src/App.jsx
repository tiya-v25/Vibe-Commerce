import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [view, setView] = useState('products');
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '' });
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`);
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, qty: 1 })
      });
      await loadCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleUpdateQty = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await fetch(`${API_URL}/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty })
      });
      await loadCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await fetch(`${API_URL}/cart/${id}`, { method: 'DELETE' });
      await loadCart();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutForm.name || !checkoutForm.email) {
      alert('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutForm)
      });
      const receiptData = await res.json();
      setReceipt(receiptData);
      setCheckoutForm({ name: '', email: '' });
      await loadCart();
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Checkout failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Vibe Commerce</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setView('products')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'products' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setView('cart')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                view === 'cart' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.items.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'products' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-6xl">
                    {product.image}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-purple-600 mb-4">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
            
            {cart.items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                <button
                  onClick={() => setView('products')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-3xl">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                          className="p-2 rounded-lg border hover:bg-gray-100 transition"
                          disabled={item.qty <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                          className="p-2 rounded-lg border hover:bg-gray-100 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-24 text-right font-bold text-lg">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between text-2xl font-bold mb-6">
                    <span>Total:</span>
                    <span className="text-purple-600">${cart.total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Checkout Information</h3>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                    >
                      <CreditCard className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Complete Checkout'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Successful!</h2>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold">{receipt.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">{receipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{receipt.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{new Date(receipt.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold mb-3">Order Items:</h3>
              {receipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{item.name} x{item.qty}</span>
                  <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-purple-600">${receipt.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setReceipt(null);
                setView('products');
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}