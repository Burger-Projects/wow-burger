import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../../api/client";
import "./RateExperience.css";

const TOP_BURGER_IMG =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80";
const HAND_BURGER_IMG =
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80";

const RateExperience = () => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter your feedback message");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/reviews", {
        customer_name: name,
        email: email,
        rating: rating,
        comment: comment,
        created_at: date,
      });

      toast.success(
        res.data?.message || "Thank you! Your feedback has been submitted for moderation.",
      );

      // Reset form
      setName("");
      setEmail("");
      setComment("");
      setRating(5);
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="rate-experience" className="rate-experience-section">
      <div className="rate-container-outer">
        {/* Outer White Card Background */}
        <div className="rate-card-outer">
          {/* Top Right Floating Burger Decoration */}
          <div className="decor-top-right">
            <img src={TOP_BURGER_IMG} alt="Delicious Burger" />
          </div>

          {/* Inner Golden Card */}
          <div className="rate-card-inner">
            <h2 className="rate-title">RATE YOUR EXPERIENCE</h2>

            <form className="rate-form" onSubmit={handleSubmit}>
              {/* Row 1: Date & Rating */}
              <div className="rate-form-row">
                <div className="rate-field-group">
                  <label htmlFor="rate-date">Date</label>
                  <input
                    id="rate-date"
                    type="date"
                    className="rate-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="rate-field-group">
                  <label>Rating</label>
                  <div className="rate-stars-picker">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          className={`rate-star-btn ${active ? "active" : ""}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <FaStar />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 2: Name & Email */}
              <div className="rate-form-row">
                <div className="rate-field-group">
                  <label htmlFor="rate-name">Name</label>
                  <input
                    id="rate-name"
                    type="text"
                    className="rate-input"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="rate-field-group">
                  <label htmlFor="rate-email">Email</label>
                  <input
                    id="rate-email"
                    type="email"
                    className="rate-input"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Feedback Message */}
              <div className="rate-field-group full-width">
                <label htmlFor="rate-comment">Feedback</label>
                <textarea
                  id="rate-comment"
                  className="rate-textarea"
                  rows={4}
                  placeholder="Write your messege"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              {/* Row 4: Submit Button */}
              <div className="rate-submit-row">
                <button
                  type="submit"
                  className="rate-send-btn"
                  disabled={submitting}
                >
                  {submitting ? "SENDING..." : "SEND →"}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Left Floating Hand Burger Decoration */}
          <div className="decor-bottom-left">
            <img src={HAND_BURGER_IMG} alt="Hand holding burger" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RateExperience;
