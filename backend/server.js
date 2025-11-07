const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./ecommerce.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create tables
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT
  )`);

  // Cart table
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    FOREIGN KEY(productId) REFERENCES products(id)
  )`);

  // Insert mock products if table is empty
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products:', err);
      return;
    }
    
    if (row.count === 0) {
      const products = [
        { name: 'Wireless Headphones', price: 79.99, image: '🎧' },
        { name: 'Smart Watch', price: 199.99, image: '⌚' },
        { name: 'Laptop Stand', price: 49.99, image: '💻' },
        { name: 'Mechanical Keyboard', price: 129.99, image: '⌨️' },
        { name: 'USB-C Hub', price: 39.99, image: '🔌' },
        { name: 'Webcam HD', price: 89.99, image: '📷' },
        { name: 'Phone Case', price: 24.99, image: '📱' },
        { name: 'Portable Charger', price: 34.99, image: '🔋' }
      ];

      const stmt = db.prepare('INSERT INTO products (name, price, image) VALUES (?, ?, ?)');
      products.forEach(p => stmt.run(p.name, p.price, p.image));
      stmt.finalize();
      console.log('✅ Mock products inserted into database');
    }
  });
});

// ==================== API ROUTES ====================

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// GET /api/cart - Get cart with total
app.get('/api/cart', (req, res) => {
  db.all(`
    SELECT cart.id, cart.productId, cart.qty, products.name, products.price, products.image
    FROM cart
    JOIN products ON cart.productId = products.id
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching cart:', err);
      res.status(500).json({ error: err.message });
    } else {
      const total = rows.reduce((sum, item) => sum + (item.price * item.qty), 0);
      res.json({ items: rows, total });
    }
  });
});

// POST /api/cart - Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, qty = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  // Check if item already exists in cart
  db.get('SELECT * FROM cart WHERE productId = ?', [productId], (err, row) => {
    if (err) {
      console.error('Error checking cart:', err);
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      // Update quantity if item exists
      db.run('UPDATE cart SET qty = qty + ? WHERE productId = ?', [qty, productId], (err) => {
        if (err) {
          console.error('Error updating cart:', err);
          res.status(500).json({ error: err.message });
        } else {
          res.json({ message: 'Cart updated', productId, qty: row.qty + qty });
        }
      });
    } else {
      // Insert new item
      db.run('INSERT INTO cart (productId, qty) VALUES (?, ?)', [productId, qty], function(err) {
        if (err) {
          console.error('Error adding to cart:', err);
          res.status(500).json({ error: err.message });
        } else {
          res.json({ message: 'Item added to cart', id: this.lastID, productId, qty });
        }
      });
    }
  });
});

// PUT /api/cart/:id - Update cart item quantity
app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (!qty || qty < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  db.run('UPDATE cart SET qty = ? WHERE id = ?', [qty, id], function(err) {
    if (err) {
      console.error('Error updating cart item:', err);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Cart item not found' });
    } else {
      res.json({ message: 'Cart item updated', id, qty });
    }
  });
});

// DELETE /api/cart/:id - Remove item from cart
app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM cart WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error removing cart item:', err);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Cart item not found' });
    } else {
      res.json({ message: 'Item removed from cart', id });
    }
  });
});

// POST /api/checkout - Process checkout
app.post('/api/checkout', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Get cart items
  db.all(`
    SELECT cart.id, cart.productId, cart.qty, products.name as productName, products.price
    FROM cart
    JOIN products ON cart.productId = products.id
  `, (err, rows) => {
    if (err) {
      console.error('Error fetching cart for checkout:', err);
      return res.status(500).json({ error: err.message });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const items = rows.map(item => ({
      name: item.productName,
      qty: item.qty,
      price: item.price,
      subtotal: item.price * item.qty
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    const receipt = {
      orderId: `ORD-${Date.now()}`,
      customerName: name,
      customerEmail: email,
      items,
      total,
      timestamp: new Date().toISOString()
    };

    // Clear cart after checkout
    db.run('DELETE FROM cart', (err) => {
      if (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({ error: err.message });
      } else {
        console.log('✅ Order completed:', receipt.orderId);
        res.json(receipt);
      }
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});