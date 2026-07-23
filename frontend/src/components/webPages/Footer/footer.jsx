import React from "react";
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
      <div className="footer-wave">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>

      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <i className="fas fa-hamburger"></i>
                </div>
                <div className="footer-logo-text">
                  <span>Burger</span>
                  <span className="accent">House</span>
                </div>
              </div>
              <p>
                Experience the best burgers in town. Fresh ingredients, secret
                recipes, and passion in every bite. Visit us today!
              </p>
              <div className="footer-socials">
                <a href="#!" className="footer-social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#!" className="footer-social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#!" className="footer-social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#!" className="footer-social-link">
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a
                    href="#home"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("home");
                    }}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("about");
                    }}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#menu"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("menu");
                    }}
                  >
                    Our Menu
                  </a>
                </li>
                <li>
                  <a
                    href="#service"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("service");
                    }}
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("contact");
                    }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Popular Items</h4>
              <ul>
                <li>
                  <a href="#menu">Classic Beef Burger</a>
                </li>
                <li>
                  <a href="#menu">Double Cheese Deluxe</a>
                </li>
                <li>
                  <a href="#menu">BBQ Bacon Smash</a>
                </li>
                <li>
                  <a href="#menu">Truffle Mushroom</a>
                </li>
                <li>
                  <a href="#menu">Veggie Garden</a>
                </li>
              </ul>
            </div>

            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Subscribe for exclusive offers and new menu items!</p>
              <form
                className="newsletter-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <input type="email" placeholder="Your email address" />
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-arrow-right"></i>
                </button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Burger House. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#!">Privacy Policy</a>
              <a href="#!">Terms of Service</a>
              <a href="#!">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
