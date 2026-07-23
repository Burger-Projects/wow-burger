import React, { useState, useEffect } from "react";
import "./header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <div className="logo" onClick={() => scrollToSection("home")}>
          <div className="logo-icon">
            <i className="fas fa-hamburger"></i>
          </div>
          <div className="logo-text">
            <span className="logo-name">Burger</span>
            <span className="logo-name-accent">House</span>
          </div>
        </div>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <ul className="nav-list">
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
                About
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
                Menu
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
        </nav>

        <div className="header-actions">
          <button
            className="btn btn-primary order-btn"
            onClick={() => scrollToSection("contact")}
          >
            <i className="fas fa-shopping-cart"></i> Order Now
          </button>
          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
