import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/Menu.css";

import shawarma from "../assets/shawarma.png";
import fries from "../assets/fries.png";
import hommus from "../assets/hommus.png";
import orangejuice from "../assets/Orange juice.png";

// Render backend URL
const BACKEND_URL = 'https://shawarma-king-backend.onrender.com';

const images = {
  "MAIN COURSE": shawarma,
  "APPETIZERS": fries,
  "SAUCES & DIPS": hommus,
  "BEVERAGES": orangejuice,
};

const Menu = ({ user }) => {
  const [menu, setMenu] = useState({});
  const [searchParams] = useSearchParams();
  const isEditMode = user?.isAdmin && searchParams.get('edit') === 'true';
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        data.forEach((item) => {
          if (!grouped[item.category]) {
            grouped[item.category] = [];
          }
          grouped[item.category].push(item);
        });
        setMenu(grouped);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveItem = async () => {
    if (!editingItem || !editingItem.name.trim() || editingItem.price <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      // determine which table to update based on category
      let tableName = '';
      switch(editingItem.category) {
        case 'MAIN COURSE': tableName = 'main'; break;
        case 'APPETIZERS': tableName = 'appetizers'; break;
        case 'SAUCES & DIPS': tableName = 'sauces'; break;
        case 'BEVERAGES': tableName = 'beverages'; break;
        default: return;
      }

      const response = await fetch(`${BACKEND_URL}/api/menu/${tableName}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editingItem.name,
          price: editingItem.price
        })
      });

      if (response.ok) {
        // update local state
        setMenu(prev => {
          const newMenu = { ...prev };
          const categoryItems = newMenu[editingItem.category];
          const index = categoryItems.findIndex(item => item.id === editingItem.id);
          if (index !== -1) {
            categoryItems[index] = editingItem;
          }
          return newMenu;
        });
        setEditingItem(null);
        alert('Item updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    try {
      let tableName = '';
      switch(item.category) {
        case 'MAIN COURSE': tableName = 'main'; break;
        case 'APPETIZERS': tableName = 'appetizers'; break;
        case 'SAUCES & DIPS': tableName = 'sauces'; break;
        case 'BEVERAGES': tableName = 'beverages'; break;
        default: return;
      }

      const response = await fetch(`${BACKEND_URL}/api/menu/${tableName}/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // remove from local state
        setMenu(prev => {
          const newMenu = { ...prev };
          newMenu[item.category] = newMenu[item.category].filter(i => i.id !== item.id);
          return newMenu;
        });
        alert('Item deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleAddItem = () => {
    alert('Add item feature - To be implemented with backend');
  };

  return (
    <main className="main-Menu">
      <div className="menu-container">
        <div className="all">
          <h1 className="title">SHAWARMA PALACE MENU</h1>
          <p className="subtitle">Taste the Royal Flavors of the Middle East</p>

          {/* admin edit mode */}
          {isEditMode && (
            <div className="menu-admin-banner">
              <h3>👑 ADMIN EDIT MODE</h3>
              <div className="admin-controls">
                <button onClick={handleAddItem} className="admin-btn add-btn">
                  ➕ Add New Item
                </button>
                <button 
                  onClick={() => window.location.href = '/menu'} 
                  className="admin-btn exit-btn"
                >
                  ✖ Exit Editor
                </button>
                <p className="admin-note">Click Edit on any item to modify it</p>
              </div>
            </div>
          )}

          {Object.keys(menu).map((category, index) => (
            <div
              key={category}
              className={`section-row ${index % 2 !== 0 ? "reverse" : ""}`} // alternating layout
            >
              <div className="section-content">
                <h2 className="section-title">{category}</h2>
                <ul className="menu-list">
                  {menu[category].map((item) => (
                    <li key={item.id}>
                      <div className="menu-item-content">
                        {editingItem?.id === item.id ? (
                          <div className="edit-form">
                            <input
                              type="text"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} // update name
                              className="edit-input"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={editingItem.price}
                              onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})} // update price
                              className="edit-input price-input"
                            />
                            <div className="edit-actions">
                              <button onClick={handleSaveItem} className="save-btn">Save</button>
                              <button onClick={() => setEditingItem(null)} className="cancel-btn">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span>{item.name}</span>
                            <span className="price">${item.price.toFixed(2)}</span>
                            {isEditMode && (
                              <div className="item-actions">
                                <button 
                                  onClick={() => handleEditItem(item)}
                                  className="action-btn edit-btn"
                                  title="Edit item"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item)}
                                  className="action-btn delete-btn"
                                  title="Delete item"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="image-circle">
                <img src={images[category]} alt={category} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Menu;