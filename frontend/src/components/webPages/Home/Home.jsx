import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <section id="home" className="hero-section">
      {/* Background Overlay Elements */}
      <div className="hero-bg-pattern"></div>
      <div className="hero-blob hero-blob-1"></div>
      <div className="hero-blob hero-blob-2"></div>
      <div className="hero-blob hero-blob-3"></div>

      {/* Floating Food Elements */}
      <div className="floating-element float-bun">
        <i className="fas fa-circle"></i>
      </div>
      <div className="floating-element float-cheese">
        <i className="fas fa-certificate"></i>
      </div>
      <div className="floating-element float-fries">
        <i className="fas fa-french-fries"></i>
      </div>
      <div className="floating-element float-leaf">
        <i className="fas fa-leaf"></i>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-fire"></i>
            <span>Since 2015</span>
          </div>

          <h1 className="hero-title">
            Taste the <span className="highlight">Best</span>
            <br />
            Burgers in Town
          </h1>

          <p className="hero-description">
            Experience the perfect blend of premium ingredients, secret spices,
            and passion in every bite. Our hand-crafted burgers are made to
            satisfy your cravings and leave you wanting more.
          </p>

          <div className="hero-buttons">
            <button
              className="btn btn-primary btn-lg"
              onClick={() =>
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <i className="fas fa-utensils"></i>
              View Our Menu
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <i className="fas fa-phone-alt"></i>
              Contact Us
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Burger Varieties</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-burger-card">
            <div className="burger-plate">
              <div className="burger-3d">
                <div className="burger-top-bun">
                  <div className="sesame-seed s1"></div>
                  <div className="sesame-seed s2"></div>
                  <div className="sesame-seed s3"></div>
                  <div className="sesame-seed s4"></div>
                  <div className="sesame-seed s5"></div>
                </div>
                <div className="burger-layer lettuce"></div>
                <div className="burger-layer tomato"></div>
                <div className="burger-layer cheese"></div>
                <div className="burger-layer patty"></div>
                <div className="burger-bottom-bun"></div>
              </div>
            </div>
            <div className="burger-glow"></div>
          </div>

          <div className="hero-decorations">
            <div className="decoration-chip">
              <i className="fas fa-french-fries"></i>
              <span>Free Fries</span>
            </div>
            <div className="decoration-chip">
              <i className="fas fa-truck"></i>
              <span>Free Delivery</span>
            </div>
            <div className="decoration-chip">
              <i className="fas fa-tag"></i>
              <span>50% Off First Order</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="hero-wave">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Home;
