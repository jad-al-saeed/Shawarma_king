import React from "react";
import '../styles/Footer.css';
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className = "fall">
      <div className="footer-container">
        <div className="footer-links">
          <Link to="/">Home</Link> |
          <Link to="/about">About Us</Link> |
          <Link to="/contact">Contact Us</Link> |
          <Link to="/Hire">Apply</Link> |
          <Link to="/menu">Menu</Link>
        </div>

        <div className="social-links">
          <a href="https://www.instagram.com" target="_blank">
            <InstagramIcon />
          </a>
          <a href="https://www.twitter.com" target="_blank">
            <TwitterIcon />
          </a>
          <a href="https://www.facebook.com" target="_blank">
            <FacebookIcon />
          </a>
        </div>

        <p>&copy; 2025 Shawarma King. All rights reserved.</p>
      </div>
      </div>
    </footer>
  );
}

export default Footer;