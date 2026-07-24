import React, { useEffect, useState } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { api } from "../../../api/client";
import "./Testimonials.css";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchApprovedReviews = async () => {
      try {
        const res = await api.get("/api/reviews");
        if (!cancelled) {
          setReviews(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load approved reviews:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchApprovedReviews();

    // Listen to custom event or refresh periodically
    const handleRefresh = () => fetchApprovedReviews();
    window.addEventListener("reviews-updated", handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("reviews-updated", handleRefresh);
    };
  }, []);

  if (loading) {
    return null;
  }

  if (reviews.length === 0) {
    return null; // Don't render empty section if no approved reviews exist yet
  }

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-title">
          <span className="subtitle">Customer Feedback</span>
          <h2>What People Say</h2>
          <p>Real stories & reviews from burger lovers</p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="testimonial-card">
              <div className="quote-icon">
                <FaQuoteLeft />
              </div>

              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={star <= rev.rating ? "star-filled" : "star-empty"}
                  />
                ))}
              </div>

              <p className="testimonial-comment">"{rev.comment}"</p>

              <div className="testimonial-footer">
                <span className="customer-name">{rev.customer_name}</span>
                {rev.created_at && (
                  <span className="review-date">
                    {new Date(rev.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
