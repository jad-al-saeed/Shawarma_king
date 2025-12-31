import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // env

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// JWT Secret from .env
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify token
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


app.get("/api/admin/stats", verifyToken, (req, res) => {// Admin stats endpoint
  if (!req.isAdmin) {// check if user is admin
    return res.status(403).json({ error: "Admin access required" });// Forbidden
  }
  
  const queries = [ // queries to get counts
    "SELECT COUNT(*) as count FROM messages", // total messages
    "SELECT COUNT(*) as count FROM users", // total users
    "SELECT (SELECT COUNT(*) FROM main) + (SELECT COUNT(*) FROM appetizers) + (SELECT COUNT(*) FROM sauces) + (SELECT COUNT(*) FROM beverages) as count" // total menu items
  ];
  
  db.query(queries[0], (err, messageResult) => { // execute first query
    if (err) return res.status(500).json({ error: "Database error" });  // internal server error
    
    db.query(queries[1], (err, userResult) => { // execute second query
      if (err) return res.status(500).json({ error: "Database error" }); // internal server error
      
      db.query(queries[2], (err, menuResult) => { // execute third query
        if (err) return res.status(500).json({ error: "Database error" }); // internal server error
        
        res.json({ // send stats response
          totalMessages: messageResult[0].count || 0, // total messages
          totalUsers: userResult[0].count || 0, // total users
          totalMenuItems: menuResult[0].count || 0, // total menu items
          revenue: 0 // placeholder for revenue
        });
      });
    });
  });
});
//crud for menu items
const menuTables = { //mapping of table names to categories
  'main': 'MAIN COURSE', // main course table
  'appetizers': 'APPETIZERS', // appetizers table
  'sauces': 'SAUCES & DIPS', // sauces & dips table
  'beverages': 'BEVERAGES' // beverages table
};
//crud starts here below:
// Update menu item
app.put("/api/menu/:table/:id", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const { table, id } = req.params; // get table and id from params
  const { name, price } = req.body; // get name and price from body
  
  if (!menuTables[table]) {
    return res.status(400).json({ error: "Invalid table name" }); // bad request
  }
  
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });// bad request
  }
  
  const q = `UPDATE ${table} SET name = ?, price = ? WHERE id = ?`;// update query
  db.query(q, [name, price, id], (err, result) => { // execute query
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to update item" }); // error
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });// error item not found
    }
    
    res.json({ 
      success: true,  // success response
      message: "Item updated", // success message
      item: { id, name, price, category: menuTables[table] } // updated item details
    });
  });
});

// Delete menu item
app.delete("/api/menu/:table/:id", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const { table, id } = req.params; // get table and id from params
  
  if (!menuTables[table]) {
    return res.status(400).json({ error: "Invalid table name" }); 
  }
  
  const q = `DELETE FROM ${table} WHERE id = ?`; // delete query
  db.query(q, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to delete item" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ success: true, message: "Item deleted" }); // success response
  });
});

// Add new menu item
app.post("/api/menu/:table", verifyToken, (req, res) => { // add new item
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
  
  const q = `INSERT INTO ${table} (name, price) VALUES (?, ?)`; // insert query to add
  db.query(q, [name, price], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to add item" });
    }
    
    res.status(201).json({ 
      success: true, 
      message: "Item added",
      item: { id: result.insertId, name, price, category: menuTables[table] } // new item details
    });
  });
});
// 1. get the messages
app.get("/api/messages", (req, res) => { 
  const q = "SELECT * FROM messages ORDER BY created_at DESC"; // query to get messages
  
  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    return res.json(data);
  });
});

// 2. create a new message
app.post("/api/messages", (req, res) => {
  const { name, email, message } = req.body; // get data from request body
  
  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const q = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)"; // insert query
  const values = [name, email, message]; // values to insert
  
  db.query(q, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to save message" });
    }
    
    // Get the newly created message with ID
    const newMessage = {
      id: result.insertId,
      name,
      email,
      message,
      created_at: new Date() // current timestamp
    };
    
    return res.status(201).json(newMessage); // return the new message
  });
});

// 3.  delete message (only for admins)
app.delete("/api/messages/:id", verifyToken, (req, res) => { // verifyToken middleware to check admin
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const messageId = req.params.id;
  const q = "DELETE FROM messages WHERE id = ?"; // delete query
  
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

// 4. edit/update message (only for admins)
app.put("/api/messages/:id", verifyToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  const messageId = req.params.id; // get message ID from params
  const { message } = req.body; // get updated message content
  
  if (!message) {
    return res.status(400).json({ error: "Message content is required" });
  }
  
  const q = "UPDATE messages SET message = ? WHERE id = ?"; // update query
  
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
// menu read
app.get("/api/menu", (req, res) => {
  // Query to fetch all menu items from different tables
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

// 1. registration for user (sign up)
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body; // get data from request body
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  
  try {
    // Check if user exists
    const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?"; // check existing user
    db.query(checkQuery, [email, username], async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10); // hash password with salt rounds 10. salt rounds are used to increase security. 10 is a good balance between security and performance since higher salt rounds increase security but also increase computation time.
      
      // Insert new user
      const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"; // insert new user query
      db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Failed to create user" });
        }
        
        // Create token
        const token = jwt.sign(
          { userId: result.insertId, username, isAdmin: false }, //this will create a token with userId, username and isAdmin false for users
          JWT_SECRET, // secret key
          { expiresIn: '24h' } // token expiry time
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

// 2. user login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  
  const q = "SELECT * FROM users WHERE email = ?"; // query to get user by email
  db.query(q, [email], async (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const user = results[0];
    
    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password); // compare hashed password to check if it matches
    if (!validPassword) { //if it doesntmatch
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.is_admin }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: "Login successful",
      token,
      user: { // return user details
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  });
});

// 3. verify the token so that user doesnt have to login again and again
app.get("/api/auth/verify", verifyToken, (req, res) => {
  const q = "SELECT id, username, email, is_admin FROM users WHERE id = ?"; // query to get user by id
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
