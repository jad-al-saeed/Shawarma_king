import '../styles/NavBar.css';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NavBar = ({ user, logout }) => {
  const [openLinks, setOpenLinks] = useState(false); // State to manage mobile menu visibility
  const navigate = useNavigate();

  const handleLogout = () => { // Logout function
    logout();
    setOpenLinks(false);
    navigate('/');
  };

  const handleLoginClick = () => { // Navigate to login
    setOpenLinks(false);
    navigate('/login');
  };

  const handleAdminClick = () => { // Navigate to admin for mobile
    setOpenLinks(false);
    navigate('/admin');
  };

  // Close menu when clicking outside the menu links for mobile
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('mobile-menu')) {
      setOpenLinks(false);
    }
  };

  return (
    <nav>
      <div className="left">
        <Link to="/about">About Us</Link>
        <Link to="/menu">Menu</Link>
        {user?.isAdmin && (
          <Link to="/admin" className="admin-nav-link">
            👑 Admin 
          </Link>//add admin link for desktop
        )}
      </div>

      <div className="logo">
        <Link to="/" onClick={() => setOpenLinks(false)}> 
          <img src={logo} alt="Logo not found" />
        </Link> 
      </div>
      <div className="right">
        <Link to="/contact">Contact</Link>
        <Link to="/hire">Apply</Link>
        {user ? (
          <div className="user-nav-section">
            <span className="welcome-nav">Hi, {user.username}!</span> 
            <button onClick={handleLogout} className="logout-nav-btn">
              Logout
            </button> {/*logout button for desktop */}
          </div>
        ) : (
          <Link to="/login" className="login-nav-link">
            Login
          </Link>
        )}
      </div>
        {/*menu button for mobile */}
      <button className="menu-button" onClick={() => setOpenLinks(!openLinks)}>
        {openLinks ? '✕' : '☰'} {/* Hamburger menu button */}
      </button>
        {/* menu overlay */}
      {openLinks && (
        <div className="mobile-menu-overlay" onClick={handleBackdropClick}>
          <div className={`left mobile-menu ${openLinks ? 'open' : ''}`}> {/* Mobile menu links */}
            <Link to="/" onClick={() => setOpenLinks(false)}>Home</Link>
            <Link to="/about" onClick={() => setOpenLinks(false)}>About Us</Link>
            <Link to="/menu" onClick={() => setOpenLinks(false)}>Menu</Link>
            <Link to="/branches" onClick={() => setOpenLinks(false)}>Branches</Link>
            <Link to="/contact" onClick={() => setOpenLinks(false)}>Contact</Link>
            <Link to="/hire" onClick={() => setOpenLinks(false)}>Apply</Link>
            
            {user?.isAdmin && ( 
              <Link to="/admin" onClick={() => setOpenLinks(false)} className="admin-nav-link">
                👑 Admin
              </Link>
            )}
            
            {/* authentication*/}
            {user ? (
              <div className="user-nav-section">
                <span className="welcome-nav">Hi, {user.username}!</span>
                <button onClick={handleLogout} className="logout-nav-btn">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpenLinks(false)} className="login-nav-link">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;