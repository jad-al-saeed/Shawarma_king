## Database Design

The database consists of **6 main tables**:

- `users` – User authentication & roles
- `messages` – Contact form & feedback
- `main` – Main course items
- `appetizers` – Starter items
- `beverages` – Drinks
- `sauces` – Condiments

The menu system uses **table mapping** and **SQL UNION queries** to retrieve all menu items efficiently.

---

##  Authentication & Security

- Password hashing using **bcrypt**
- Token-based authentication using **JWT**
- 24-hour token expiration
- Role-based authorization (Admin vs User)
- Protected routes with middleware

---

##  API Overview

### Public Endpoints
- `GET /api/menu`
- `GET /api/messages`
- `POST /api/messages`
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Authenticated Endpoints
- `GET /api/auth/verify`

### Admin-Only Endpoints
- Menu CRUD operations
- Message moderation
- System statistics dashboard

---

## 📊 Admin Dashboard

Admins can:
- View total users, messages, and menu items
- Manage menu items (add/edit/delete)
- Moderate customer messages
- Access system analytics

---

##  Frontend Pages

- Home
- About
- Contact
- Branches
- Hire
- Menu
- Login / Signup
- Admin Dashboard

---

##  Future possibilities

- Online ordering system
- Payment integration
- Email notifications
- Mobile app (React Native)
- Inventory & employee management
- AI-based menu recommendations

---

##  Authors

- **Jad Al Saeed**
- **Hadi Al Haj Hasan**

---
## Learning Outcomes

- Full-stack web development
- RESTful API design
- Secure authentication & authorization
- MySQL database integration
- React state & routing management
- Real-world project structure and deployment

