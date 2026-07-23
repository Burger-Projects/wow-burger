import React from "react";
import "./about.css";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="section-title">
          <span className="subtitle">Our Story</span>
          <h2>About Burger House</h2>
          <p>
            Discover the passion and love that goes into every burger we serve.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-image-wrapper">
            <div className="about-image-card">
              <div className="about-image-placeholder">
                <i className="fas fa-hamburger"></i>
                <div className="about-experience-badge">
                  <span className="experience-number">10+</span>
                  <span className="experience-text">Years of Excellence</span>
                </div>
              </div>
            </div>
            <div className="about-image-decor"></div>
          </div>

          <div className="about-content">
            <h3>
              We Serve The <span className="highlight-text">Juiciest</span>{" "}
              Burgers Since 2015
            </h3>
            <p>
              At Burger House, we believe that a great burger is more than just
              food - it's an experience. Every patty is hand-formed, every bun
              is freshly baked, and every ingredient is carefully selected to
              bring you the most unforgettable taste.
            </p>
            <p>
              Our secret lies in our signature blend of premium beef, our
              house-made sauces, and the passion our chefs put into crafting
              each burger. We source locally whenever possible and never
              compromise on quality.
            </p>

            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-leaf"></i>
                </div>
                <div className="feature-text">
                  <h4>Fresh Ingredients</h4>
                  <p>100% fresh, locally sourced produce daily</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-medal"></i>
                </div>
                <div className="feature-text">
                  <h4>Premium Quality</h4>
                  <p>Only the finest cuts of AAA-grade beef</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <div className="feature-text">
                  <h4>Made with Love</h4>
                  <p>Every burger crafted with passion and care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
