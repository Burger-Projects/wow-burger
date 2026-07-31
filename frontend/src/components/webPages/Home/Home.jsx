import React from "react";
import "./Home.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=2000&q=80";

const Home = () => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-media" aria-hidden="true">
        <img src={HERO_IMAGE} alt="" className="hero-bg-image" />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-brand">WOW BURGER</p>
          <h1 className="hero-title">
            Taste The
            <br />
            <span>Bold Bite</span>
          </h1>
          <p className="hero-description">
            Hand-crafted smash burgers, secret signature sauces, and hot flavors that hit hard — built for true burger lovers.
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
              View Menu
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Find Us
            </button>
          </div>
        </div>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <i className="fas fa-chevron-down"></i>
      </div>
    </section>
  );
};

export default Home;
