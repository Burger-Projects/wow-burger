import React from "react";
import "./contact.css";

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-title">
          <span className="subtitle">Get In Touch</span>
          <h2>Contact Us</h2>
          <p>
            Have a question, feedback, or want to place a large order? We'd love
            to hear from you!
          </p>
        </div>

        <div className="contact-wrapper">
          <div className="contact-info">
            <div className="contact-info-card">
              <h3>Visit Us Today!</h3>
              <p className="contact-tagline">
                Come experience the best burgers in town. We're open 7 days a
                week!
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>Our Location</h4>
                    <p>
                      123 Burger Avenue, Foodie District, New York, NY 10001
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>Email Us</h4>
                    <p>hello@burgerhouse.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>Opening Hours</h4>
                    <p>Mon - Fri: 10:00 AM - 11:00 PM</p>
                    <p>Sat - Sun: 9:00 AM - 12:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="contact-socials">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="#!" className="social-link">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#!" className="social-link">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#!" className="social-link">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#!" className="social-link">
                    <i className="fab fa-tiktok"></i>
                  </a>
                  <a href="#!" className="social-link">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <form className="contact-form">
              <h3>Send Us a Message</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Your Email</label>
                  <input type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" placeholder="How can we help you?" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="5"
                  placeholder="Tell us about your experience..."
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-submit">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
