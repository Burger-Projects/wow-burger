import React, { useEffect, useState } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { api } from "../../../api/client";
import "./Testimonials.css";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

    // Initial fetch
    fetchApprovedReviews();

    // 1. Same tab event listener
    const handleRefresh = () => fetchApprovedReviews();
    window.addEventListener("reviews-updated", handleRefresh);

    // 2. Cross-tab localStorage event listener
    const handleStorageChange = (e) => {
      if (e.key === "reviews_updated_at") {
        fetchApprovedReviews();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 3. Short polling fallback (every 4s) so new approvals appear live
    const intervalId = setInterval(fetchApprovedReviews, 4000);

    return () => {
      cancelled = true;
      window.removeEventListener("reviews-updated", handleRefresh);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return null;
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-title">
          <span className="subtitle">Testimonials</span>
          <h2>What People Say</h2>
          <p>Real reviews from customers who keep coming back for more</p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="testimonial-card">
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fas fa-star ${star <= rev.rating ? "active-star" : "inactive-star"}`}
                  ></i>
                ))}
              </div>

              <p className="testimonial-text">"{rev.comment}"</p>

              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <span>{getInitials(rev.customer_name)}</span>
                </div>
                <div className="testimonial-info">
                  <h4>{rev.customer_name}</h4>
                  {rev.created_at && (
                    <span>
                      {new Date(rev.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
