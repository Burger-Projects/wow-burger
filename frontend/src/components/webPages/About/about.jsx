import React from "react";
import "./about.css";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-image-wrapper">
            <img src={ABOUT_IMAGE} alt="Signature smash burger" />
            <div className="about-image-accent" aria-hidden="true"></div>
          </div>

          <div className="about-content">
            <span className="about-eyebrow">Our Story</span>
            <h2>
              We Cook Burgers
              <br />
              With Attitude
            </h2>
            <p>
              Burger House started with one grill and a simple rule: fresh beef,
              bold seasoning, and no shortcuts. Today we still smash every patty
              to order and build flavors that keep people coming back.
            </p>
            <p>
              From classic cheeseburgers to loaded smash stacks, every bite is
              made to satisfy — fast, loud, and unforgettable.
            </p>

            <div className="about-points">
              <div className="about-point">
                <strong>01</strong>
                <div>
                  <h4>Fresh Daily</h4>
                  <p>Local produce and never-frozen beef</p>
                </div>
              </div>
              <div className="about-point">
                <strong>02</strong>
                <div>
                  <h4>Secret Sauces</h4>
                  <p>House-made recipes you won’t find anywhere else</p>
                </div>
              </div>
              <div className="about-point">
                <strong>03</strong>
                <div>
                  <h4>Fast & Hot</h4>
                  <p>Served sizzling — dine-in or takeaway</p>
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
