import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <div className="logo" onClick={() => scrollToSection("home")}>
          <span className="logo-mark">BH</span>
          <span className="logo-name">
            Burger<span>House</span>
          </span>
        </div>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <ul className="nav-list">
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
            {user ? (
              <>
                {isAdmin && (
                  <li>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    className="nav-text-btn"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="header-actions">
          {isAdmin ? (
            <Link to="/admin" className="btn btn-primary order-btn">
              Admin
            </Link>
          ) : (
            <button
              className="btn btn-primary order-btn"
              onClick={() => scrollToSection("menu")}
            >
              Order Now
            </button>
          )}
          {!user && (
            <Link to="/login" className="btn btn-secondary order-btn header-login-btn">
              Login
            </Link>
          )}
          <button
            type="button"
            className={`hamburger ${menuOpen ? "active" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;