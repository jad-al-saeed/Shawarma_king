import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL connection (Railway)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to Railway MySQL database");
  }
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/api/admin/stats", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const queries = [
    "SELECT COUNT(*) as count FROM messages",
    "SELECT COUNT(*) as count FROM users",
    "SELECT (SELECT COUNT(*) FROM main) + (SELECT COUNT(*) FROM appetizers) + (SELECT COUNT(*) FROM sauces) + (SELECT COUNT(*) FROM beverages) as count"
  ];
  
  db.query(queries[0], (err, messageResult) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    db.query(queries[1], (err, userResult) => {
      if (err) return res.status(500).json({ error: "Database error" });
      
      db.query(queries[2], (err, menuResult) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        res.json({
          totalMessages: messageResult[0].count || 0,
          totalUsers: userResult[0].count || 0,
          totalMenuItems: menuResult[0].count || 0,
          revenue: 0
        });
      });
    });
  });
});

const menuTables = {
  'main': 'MAIN COURSE',
  'appetizers': 'APPETIZERS',
  'sauces': 'SAUCES & DIPS',
  'beverages': 'BEVERAGES'
};

app.put("/api/menu/:table/:id", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const { table, id } = req.params;
  const { name, price } = req.body;
  
  if (!menuTables[table]) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }
  
  const q = `UPDATE ${table} SET name = ?, price = ? WHERE id = ?`;
  db.query(q, [name, price, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to update item" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ 
      success: true,
      message: "Item updated",
      item: { id, name, price, category: menuTables[table] }
    });
  });
});

app.delete("/api/menu/:table/:id", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const { table, id } = req.params;
  
  if (!menuTables[table]) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  
  const q = `DELETE FROM ${table} WHERE id = ?`;
  db.query(q, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to delete item" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ success: true, message: "Item deleted" });
  });
});

app.post("/api/menu/:table", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const { table } = req.params;
  const { name, price } = req.body;
  
  if (!menuTables[table]) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }
  
  const q = `INSERT INTO ${table} (name, price) VALUES (?, ?)`;
  db.query(q, [name, price], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to add item" });
    }
    
    res.status(201).json({ 
      success: true, 
      message: "Item added",
      item: { id: result.insertId, name, price, category: menuTables[table] }
    });
  });
});

app.get("/api/messages", (req, res) => {
  const q = "SELECT * FROM messages ORDER BY created_at DESC";
  
  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    return res.json(data);
  });
});

app.post("/api/messages", (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const q = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";
  const values = [name, email, message];
  
  db.query(q, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to save message" });
    }
    
    const newMessage = {
      id: result.insertId,
      name,
      email,
      message,
      created_at: new Date()
    };
    
    return res.status(201).json(newMessage);
  });
});

app.delete("/api/messages/:id", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const messageId = req.params.id;
  const q = "DELETE FROM messages WHERE id = ?";
  
  db.query(q, [messageId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to delete message" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    return res.json({ success: true, message: "Message deleted" });
  });
});

app.put("/api/messages/:id", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const messageId = req.params.id;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message content is required" });
  }
  
  const q = "UPDATE messages SET message = ? WHERE id = ?";
  
  db.query(q, [message, messageId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to update message" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    return res.json({ success: true, message: "Message updated" });
  });
});

app.get("/api/menu", (req, res) => {
  const q = `
    SELECT id, name, price, 'MAIN COURSE' AS category FROM main
    UNION ALL
    SELECT id, name, price, 'APPETIZERS' FROM appetizers
    UNION ALL
    SELECT id, name, price, 'SAUCES & DIPS' FROM sauces
    UNION ALL
    SELECT id, name, price, 'BEVERAGES' FROM beverages
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json(data);
  });
});

app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  
  try {
    const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.query(checkQuery, [email, username], async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Failed to create user" });
        }
        
        const token = jwt.sign(
          { userId: result.insertId, username, isAdmin: false },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.status(201).json({
          message: "User created successfully",
          token,
          user: { id: result.insertId, username, email, isAdmin: false }
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  
  const q = "SELECT * FROM users WHERE email = ?";
  db.query(q, [email], async (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const user = results[0];
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  });
});

app.get("/api/auth/verify", verifyToken, (req, res) => {
  const q = "SELECT id, username, email, is_admin FROM users WHERE id = ?";
  db.query(q, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const user = results[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});