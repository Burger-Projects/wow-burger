import React from "react";
import "./chiefMassage.css";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Regular Customer",
    text: "The best burgers in town! The Double Cheese Deluxe is absolutely incredible. I've been coming here for years and the quality never drops.",
    rating: 5,
    initials: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Food Critic",
    text: "Exceptional quality and flavor. The Truffle Mushroom burger is a masterpiece. You can taste the passion in every single bite.",
    rating: 5,
    initials: "MC",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Loyal Fan",
    text: "I love their vegan options! The Veggie Garden burger is so flavorful, even my meat-lover friends order it. Highly recommended!",
    rating: 5,
    initials: "ER",
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Food Blogger",
    text: "Hands down the best BBQ Bacon Smash I've ever had. The smoked bacon and caramelized onions are a match made in heaven.",
    rating: 5,
    initials: "DT",
  },
];

const ChiefMassage = () => {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-title">
          <span className="subtitle">Testimonials</span>
          <h2>What Our Customers Say</h2>
          <p>Don't just take our word for it - hear from our happy customers</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-quote">
                <i className="fas fa-quote-left"></i>
              </div>
              <div className="testimonial-stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <span>{testimonial.initials}</span>
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChiefMassage;
