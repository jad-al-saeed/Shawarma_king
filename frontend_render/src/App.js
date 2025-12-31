import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Branches from './pages/Branches';
import Hire from './pages/Hire';
import Menu from './pages/Menu';

// Render backend URL
const BACKEND_URL = 'https://shawarma-king-backend.onrender.com';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    // If token and user data exist, verify with backend
    if (token && savedUser) {
      try {
        // Verify token with backend
        fetch(`${BACKEND_URL}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setUser(data.user);
            } else { // Invalid token
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          })
          .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          })
          .finally(() => setLoading(false));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>Loading Shawarma King...</h2>
      </div>
    );
  }

  return ( // main app structure
    <div className="App">
      <NavBar user={user} logout={logout} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact user={user} />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/hire" element={<Hire />} />
        <Route path="/menu" element={<Menu user={user} />} />
        
        {/* login/signup page */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" /> : <LoginSignup setUser={setUser} />
          } 
        />
        
        {/* admin route - only for admins */}
        <Route 
          path="/admin" 
          element={
            user?.isAdmin ? <AdminPanel user={user} logout={logout} /> : <UserDashboard user={user} logout={logout} />
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <Footer />
    </div>
  );
}

// login/signup component
function LoginSignup({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      // redirect based on user type
      if (data.user.isAdmin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-signup-page">
      <div className="auth-container">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p>{isLogin ? 'Sign in to your account' : 'Join Shawarma King family'}</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="switch-btn">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
        
        <div className="demo-info">
          <h4>Demo Credentials:</h4>
          <p><strong>Admin:</strong> admin@shawarma.com / admin123</p>
          <p><strong>User:</strong> user@gmail.com / user123</p>
          <p><small>Or create your own account!</small></p>
        </div>
      </div>
    </div>
  );
}

// admin panel - Only for admins
function AdminPanel({ user, logout }) { //admin dashboard
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    revenue: 0
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` } //auth header
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch stats');
        })
        .then(data => {
          setStats({ // set stats from backend
            totalMessages: data.totalMessages || 0, 
            totalUsers: data.totalUsers || 0,
            totalMenuItems: data.totalMenuItems || 0,
            revenue: data.revenue || 0
          });
          setLoading(false);
        })
        .catch(() => {
          // fallback to mock data
          fetch(`${BACKEND_URL}/api/messages`)
            .then(res => res.json())
            .then(messages => {
              setStats({
                totalMessages: messages.length || 0,
                totalUsers: 'N/A',
                totalMenuItems: 'N/A',
                revenue: 'N/A'
              });
              setLoading(false);
            });
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <div className="admin-info">
          <p>Welcome back, <strong>{user.username}</strong>!</p>
          <button onClick={logout} className="logout-admin-btn">Logout</button>
        </div>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'messages' ? 'active' : ''}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button 
          className={activeTab === 'menu' ? 'active' : ''}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
      </div>
      
      <div className="admin-content">
        {loading ? (
          <div className="loading-stats">
            <div className="loading-spinner-small"></div>
            <p>Loading admin data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <>
                <h2>Overview</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>📨 Messages</h3>
                    <p className="stat-number">{stats.totalMessages}</p>
                    <p className="stat-label">Contact Form Submissions</p>
                    <a href="/contact" className="stat-action">View All</a>
                  </div>
                  
                  <div className="stat-card">
                    <h3>👥 Users</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                    <p className="stat-label">Registered Users</p>
                    <button className="stat-action" onClick={() => alert('User management coming soon!')}>Manage</button>
                  </div>
                  
                  <div className="stat-card">
                    <h3>🍽️ Menu Items</h3>
                    <p className="stat-number">{stats.totalMenuItems}</p>
                    <p className="stat-label">Total Items</p>
                    <a href="/menu?edit=true" className="stat-action">Edit Menu</a>
                  </div>
                  
                  <div className="stat-card">
                    <h3>💰 Revenue</h3>
                    <p className="stat-number">${stats.revenue}</p>
                    <p className="stat-label">This Month</p>
                    <button className="stat-action" onClick={() => alert('Reports coming soon!')}>View Reports</button>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'messages' && (
              <div className="tab-content">
                <h2>Recent Messages</h2>
                <p>Go to <a href="/contact">Contact Page</a> to view and manage all messages.</p>
                <div className="quick-actions">
                  <a href="/contact" className="action-btn">
                    📝 Go to Messages
                  </a>
                </div>
              </div>
            )}
            
            {activeTab === 'menu' && (
              <div className="tab-content">
                <h2>Menu Management</h2>
                <p>Edit your restaurant menu items, prices, and categories.</p>
                <div className="quick-actions">
                  <a href="/menu?edit=true" className="action-btn primary">
                    ✏️ Edit Full Menu
                  </a>
                  <button className="action-btn" onClick={() => alert('Add new item feature coming soon!')}>
                    ➕ Add New Item
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// user dashboard - For regular users
function UserDashboard({ user, logout }) {
  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username || 'Guest'}!</h1>
        {user ? ( // if logged in
          <div className="user-actions">
            <p>You are logged in as a regular user.</p>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <div className="guest-actions">
            <p>Please log in to access your dashboard.</p>
            <a href="/login" className="login-link">Login</a>
          </div>
        )}
      </div>
      
      <div className="dashboard-content">
        <h2>Your Shawarma King Dashboard</h2>
        
        <div className="user-features">
          <div className="feature-card">
            <h3>🍽️ View Menu</h3>
            <p>Browse our delicious shawarma selections</p>
            <a href="/menu" className="feature-btn">View Menu</a>
          </div>
          
          <div className="feature-card">
            <h3>📝 Contact Us</h3>
            <p>Send us a message or view guestbook</p>
            <a href="/contact" className="feature-btn">Go to Contact</a>
          </div>
          
          <div className="feature-card">
            <h3>📍 Find Us</h3>
            <p>Visit our restaurant locations</p>
            <a href="/branches" className="feature-btn">View Branches</a>
          </div>
          
          <div className="feature-card">
            <h3>💼 Apply</h3>
            <p>Join our Shawarma King team</p>
            <a href="/hire" className="feature-btn">Apply Now</a>
          </div>
        </div>
        
        {user && (
          <div className="user-info-section">
            <h3>Your Account Info</h3>
            <div className="info-grid"> 
              <div className="info-item">
                <strong>Username:</strong>
                <span>{user.username}</span> 
              </div>
              <div className="info-item">
                <strong>Email:</strong>
                <span>{user.email}</span> 
              </div>
              <div className="info-item">
                <strong>Account Type:</strong>
                <span>Regular User</span>
              </div>
              <div className="info-item">
                <strong>Member Since:</strong>
                <span>Today</span> 
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;