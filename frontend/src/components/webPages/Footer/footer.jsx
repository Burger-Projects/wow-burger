import React from "react";
import wowLogo from "../../../Assets/wow-burger-logo.png";
import "./footer.css";

const Footer = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={wowLogo} alt="WOW Burger Logo" className="footer-logo-img" />
                <span className="footer-logo-text">
                  WOW <span>BURGER</span>
                </span>
              </div>
              <p>
                Hand-crafted smash burgers, signature spicy sauces, and bold flavors hit hard in every single bite.
              </p>
              <div className="footer-socials">
                <a href="#!" className="footer-social-link" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#!" className="footer-social-link" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#!" className="footer-social-link" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#!" className="footer-social-link" aria-label="TikTok">
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Explore</h4>
              <ul>
                {[
                  ["home", "Home"],
                  ["about", "About"],
                  ["menu", "Menu"],
                  ["testimonials", "Reviews"],
                  ["contact", "Contact"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(id);
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links">
              <h4>Favorites</h4>
              <ul>
                <li>
                  <a href="#menu">WOW Smash Special</a>
                </li>
                <li>
                  <a href="#menu">Double Golden Deluxe</a>
                </li>
                <li>
                  <a href="#menu">Red Hot BBQ Smash</a>
                </li>
                <li>
                  <a href="#menu">Truffle Crisp Burger</a>
                </li>
              </ul>
            </div>

            <div className="footer-newsletter">
              <h4>Stay Hungry</h4>
              <p>Get drops on WOW specials and fresh menu items.</p>
              <form
                className="newsletter-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <input type="email" placeholder="Email address" />
                <button type="submit" className="btn btn-primary">
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 WOW Burger. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#!">Privacy</a>
              <a href="#!">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
