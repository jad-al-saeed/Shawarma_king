import React, { useState, useEffect } from 'react';
import '../styles/Contact.css';

const Contact = ({ user }) => {
  const [messages, setMessages] = useState([]); 
  const [form, setForm] = useState({ 
    name: user ? user.username.split(' ')[0] : '',  // first name
    lastname: user ? (user.username.includes(' ') ? user.username.split(' ').slice(1).join(' ') : '') : '',  // last name
    email: user ? user.email : '', 
    message: '' 
  });
  const [errors, setErrors] = useState({}); // form validation errors
  const [editingId, setEditingId] = useState(null); // currently editing message ID
  const [showOverlay, setShowOverlay] = useState(false); // success overlay
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // check if user is logged in
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  // fetch messages
  useEffect(() => {
    fetch('http://localhost:5000/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  // validate
  const validate = () => {
    const newErrors = {};
    
    if (!form.name.trim() || /\d/.test(form.name)) {
      newErrors.name = isLoggedIn ? 'Invalid name in your profile' : 'Invalid name';
    }
    
    if (!form.lastname.trim() || /\d/.test(form.lastname)) {
      newErrors.lastname = isLoggedIn ? 'Invalid last name in your profile' : 'Invalid last name';
    }
    
    if (!form.email.trim() || !form.email.includes('@')) {
      newErrors.email = isLoggedIn ? 'Invalid email in your profile' : 'Must be a valid email';
    }
    
    if (!form.message.trim()) {
      newErrors.message = 'Message required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // return true if no errors
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fullName = isLoggedIn ? user.username : `${form.name} ${form.lastname}`; // full name
    const userEmail = isLoggedIn ? user.email : form.email; // email
    
    const res = await fetch('http://localhost:5000/api/messages', {
      method: 'POST', // create
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({  // stringify body
        name: fullName,  
        email: userEmail, 
        message: form.message 
      })
    });

    if (res.ok) {
      const newMsg = await res.json(); // get new message
      setMessages([newMsg, ...messages]);
      setForm({ 
        ...form, // keep existing form data
        message: '' // only clear the message field
      });
      setShowOverlay(true); // show success overlay
      setTimeout(() => setShowOverlay(false), 2000); // hide after 2s
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to send message');
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!user?.isAdmin) {
      alert('Only administrators can delete messages');
      return;
    }
    
    if (window.confirm('Delete this message?')) { // confirm
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setMessages(messages.filter(msg => msg.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete message');
      }
    }
  };

  // update
  const handleUpdate = async (id, newText) => {
    if (!user?.isAdmin) {
      alert('Only administrators can edit messages');
      return;
    }

    if (!newText.trim()) return;
    
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/messages/${id}`, {
      method: 'PUT',
      headers: { // headers will include auth token
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // auth header
      },
      body: JSON.stringify({ message: newText })
    });

    if (res.ok) {
      setMessages(messages.map(msg => msg.id === id ? { ...msg, message: newText } : msg)); // update local state
      setEditingId(null); // clear editing state
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to update message');
    }
  };

  // helper function to check if user can edit/delete
  const canEditDelete = () => {
    return user?.isAdmin; // only admins can edit/delete
  };

  return (
    <>
      {showOverlay && ( // success overlay
        <div className="overlay-contact">
          <div className="overlay-box">
            <h3>✅ Message Sent!</h3>
            <p>Added to guestbook</p>
          </div>
        </div>
      )}

      <main className="contact-page">
        {/* user info banner */}
        {isLoggedIn && (
          <div className="user-info-banner">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h3>Welcome, {user.username}!</h3>
              <p>Your message will be sent as <strong>{user.username}</strong> ({user.email})</p>
            </div>
          </div>
        )}

        {/* admin notification banner */}
        {user?.isAdmin && (
          <div className="admin-banner">
            👑 You are viewing as Administrator. You can edit and delete messages.
          </div>
        )}

        {/* top section */}
        <div className="top-section">
          <div className="contact-box">
            <h2>Contact Shawarma King</h2>
            <div className="contact-info">
              <p>📍 Hamra Street, Beirut</p>
              <p>📧 shawarmaking@gmail.com</p>
              <p>⏰ Daily: 10AM - 11PM</p>
              {!isLoggedIn && (
                <p className="login-suggestion">
                  💡 <a href="/login">Login</a> to auto-fill your details!
                </p>
              )}
            </div>
          </div>

          <div className="contact-box">
            <h3>Send Message</h3>
            <form onSubmit={handleSubmit}>
              {!isLoggedIn ? (
                <>
                  <div className="form-row">
                    <input
                      placeholder="First Name"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className={errors.name ? 'error' : ''}
                    />
                    <input
                      placeholder="Last Name"
                      value={form.lastname}
                      onChange={(e) => setForm({...form, lastname: e.target.value})}
                      className={errors.lastname ? 'error' : ''}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="your@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className={errors.email ? 'error' : ''}
                  />
                </>
              ) : (
                <div className="logged-in-info">
                  <div className="user-display">
                    <div className="field-display">
                      <label>Name:</label>
                      <span>{user.username}</span>
                    </div>
                    <div className="field-display">
                      <label>Email:</label>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <textarea
                placeholder="Your message..."
                rows="4"
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                className={errors.message ? 'error' : ''}
              />
              
              <button type="submit" className="submit-btn">
                {isLoggedIn ? 'Send Message as ' + user.username.split(' ')[0] : 'Send Message'}
              </button>
              
              <p className="form-note">
                Note: Your name and message will appear in the public guestbook below. 
                Email address remains private.
              </p>
            </form>
          </div>
        </div>

        {/* guestbook section */}
        <div className="guestbook-section">
          <div className="section-header">
            <h2>📝 Guestbook ({messages.length} messages)</h2>
            <p>What our visitors say</p>
            {!user && (
              <p className="login-notice">
                ⓘ <a href="/login">Log in</a> as admin to edit or delete messages
              </p>
            )}
          </div>

          <div className="messages-grid">
            {messages.length === 0 ? (
              <div className="empty">No messages yet. Be the first!</div>
            ) : (
              messages.map((msg) => ( // message card
                <div key={msg.id} className="message-card">
                  <div className="card-header">
                    <div className="user">
                      <div className="avatar">{msg.name.charAt(0)}</div>
                      <div>
                        <strong>{msg.name}</strong>
                        <small>{new Date(msg.created_at).toLocaleDateString()}</small>
                      </div>
                    </div>
                    {/* Only show actions if user is admin */}
                    {canEditDelete() && (
                      <div className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            const newText = prompt('Edit message:', msg.message);
                            if (newText !== null) handleUpdate(msg.id, newText);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(msg.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="message-text">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Contact;