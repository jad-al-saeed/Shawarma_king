import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
// handle input changes
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

    // simple validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // we used mock data here
      // note that later on we removed it from the mySQl database later on, but we kept it  as a code in here
      const mockUser = {
        id: 1,
        username: isLogin ? 'demo' : formData.username,
        email: formData.email,
        isAdmin: formData.email === 'admin@shawarma.com'
      };

      // Save to localStorage
      localStorage.setItem('token', 'demo_token_123');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);

      // redirect
      if (mockUser.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        <form onSubmit={handleSubmit}>
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
          
          <button type="submit" className="login-btn">
            {isLogin ? 'Login' : 'Sign Up'}  {/* submit button text */}
          </button>
        </form>
        
        <p className="switch-mode">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="switch-btn">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
        {/* demo credentials info */}
        <div className="demo-info">
          <p><strong>Demo Admin:</strong> admin@gmail.com / admin123</p>
          <p><strong>Demo User:</strong> user@gmail.com / user123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;