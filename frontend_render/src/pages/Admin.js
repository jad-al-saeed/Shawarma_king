import React from 'react';
import '../styles/Admin.css';

const Admin = ({ user, logout }) => {
  return (
    <div className="admin-page"> {/* Admin page container */}
      <div className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <div className="admin-info">
          <p>Welcome, <strong>{user?.username}</strong>!</p>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="admin-content"> {/* Main admin content */}
        <h2>Shawarma King Administration</h2>
        <p>This is the admin panel. Here you can manage:</p>
        
        <div className="admin-links"> {/* Admin management links */}
          <a href="/contact" className="admin-link">📝 Manage Messages</a>
          <a href="/menu" className="admin-link">🍽️ Edit Menu</a>
          <div className="admin-link" onClick={() => alert('Feature coming soon!')}>  
            📊 View Reports
          </div>
          <div className="admin-link" onClick={() => alert('Feature coming soon!')}>
            👥 Manage Users
          </div>
        </div>
        
        <div className="admin-stats"> {/* Quick stats section */}
          <h3>Quick Stats</h3> 
          <p>• Messages in guestbook: Check Contact page</p>
          <p>• Admin privileges: Active</p>
          <p>• User since: Today</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;