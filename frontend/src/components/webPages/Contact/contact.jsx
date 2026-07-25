import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import BranchMap from "./BranchMap";
import "./contact.css";

const Contact = () => {
  const [branches, setBranches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/branches");
        const list = res.data.data || [];
        if (cancelled) return;
        setBranches(list);
        const primary = list.find((b) => b.is_primary) || list[0];
        setSelectedId(primary?.id ?? null);
      } catch {
        if (!cancelled) setBranches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected =
    branches.find((b) => b.id === selectedId) || branches[0] || null;
  const hasMultiple = branches.length > 1;

  const formatHours = (hours) => {
    if (!hours) return null;
    return hours.split("\n").filter(Boolean);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-title">
          <span className="subtitle">Get In Touch</span>
          <h2>Visit Or Message Us</h2>
          <p>
            Questions, catering, or just craving something bold? Reach out —
            we’re ready.
          </p>
        </div>

        <div className="contact-wrapper">
          <div className="contact-info">
            <div className="contact-info-panel">
              <h3>Come Hungry</h3>
              <p className="contact-tagline">
                Open seven days a week. Walk in, call ahead, or drop us a note.
              </p>

              {hasMultiple && (
                <div className="branch-picker">
                  <h4>Our Branches</h4>
                  <div className="branch-picker-list">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        type="button"
                        className={`branch-chip ${
                          selected?.id === branch.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedId(branch.id)}
                      >
                        {branch.name}
                        {branch.is_primary ? " · Main" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && branches.length > 0 && (
                <>
                  <BranchMap
                    branches={branches}
                    selectedId={selected?.id}
                    onSelect={setSelectedId}
                  />
                  {selected && (
                    <a
                      className="contact-directions-btn"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-location-arrow" aria-hidden="true"></i>
                      Take me there
                    </a>
                  )}
                </>
              )}

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>
                      {hasMultiple && selected
                        ? selected.name
                        : "Location"}
                    </h4>
                    {selected ? (
                      <>
                        <p>{selected.address}</p>
                        {selected.city ? <p>{selected.city}</p> : null}
                      </>
                    ) : (
                      <p>
                        {loading
                          ? "Loading location…"
                          : "Address coming soon — check back shortly."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>Call</h4>
                    <p>{selected?.phone || "+1 (555) 123-4567"}</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>Email</h4>
                    <p>{selected?.email || "hello@burgerhouse.com"}</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="contact-item-text">
                    <h4>Hours</h4>
                    {selected?.hours ? (
                      formatHours(selected.hours).map((line) => (
                        <p key={line}>{line}</p>
                      ))
                    ) : (
                      <>
                        <p>Mon – Fri: 10:00 AM – 11:00 PM</p>
                        <p>Sat – Sun: 9:00 AM – 12:00 AM</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="contact-socials">
                <h4>Follow</h4>
                <div className="social-links">
                  <a href="#!" className="social-link" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#!" className="social-link" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#!" className="social-link" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#!" className="social-link" aria-label="TikTok">
                    <i className="fab fa-tiktok"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <h3>Send a Message</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" type="text" placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" placeholder="you@email.com" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input id="subject" type="text" placeholder="How can we help?" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows="5"
                  placeholder="Tell us what’s on your mind..."
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
