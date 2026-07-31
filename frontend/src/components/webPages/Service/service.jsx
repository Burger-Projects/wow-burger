import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { api, resolveImageUrl } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./service.css";

const Service = () => {
  const { user, isCustomer, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "All", slug: "all" }]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hoverRatings, setHoverRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});

  const canFavorite = Boolean(user) && (isCustomer || isAdmin);
  const canRate = Boolean(user) && (isCustomer || isAdmin);

  useEffect(() => {
    if (!canRate || !user?.id) {
      setUserRatings({});
      return;
    }
    try {
      const saved = localStorage.getItem(`user_menu_ratings_${user.id}`);
      setUserRatings(saved ? JSON.parse(saved) : {});
    } catch {
      setUserRatings({});
    }
  }, [canRate, user?.id]);

  const handleRateItem = async (itemId, ratingVal) => {
    if (!canRate) {
      toast.info("Sign in as a customer to rate menu items");
      return;
    }

    try {
      const res = await api.post(`/api/menu/menu-items/${itemId}/rate`, { rating: ratingVal });
      toast.success(res.data?.message || "Thank you for rating!");

      setUserRatings((prev) => {
        const next = { ...prev, [itemId]: ratingVal };
        if (user?.id) {
          try {
            localStorage.setItem(`user_menu_ratings_${user.id}`, JSON.stringify(next));
          } catch (e) {
            console.error("Failed to save rating:", e);
          }
        }
        return next;
      });

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                avg_rating: res.data.data.avg_rating,
                rating_count: res.data.data.rating_count,
              }
            : item,
        ),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Rating failed");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [menuRes, catRes] = await Promise.all([
          api.get("/api/menu/menu-items", { params: { is_available: true } }),
          api.get("/api/menu/categories"),
        ]);

        if (cancelled) return;

        setItems(menuRes.data.data || []);
        setCategories([
          { id: "all", label: "All", slug: "all" },
          ...(catRes.data.data || []).map((c) => ({
            id: c.id,
            label: c.name,
            slug: c.slug,
          })),
        ]);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load menu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!canFavorite) {
      setFavoriteIds(new Set());
      return;
    }

    api
      .get("/api/favorites/ids")
      .then((res) => setFavoriteIds(new Set(res.data.data || [])))
      .catch(() => setFavoriteIds(new Set()));
  }, [canFavorite, user?.id]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeCategory !== "all") {
      const cat = categories.find((c) => String(c.id) === String(activeCategory));
      list = list.filter(
        (item) =>
          String(item.category_id) === String(activeCategory) ||
          item.category_slug === cat?.slug,
      );
    }
    if (showFavoritesOnly) {
      list = list.filter((item) => favoriteIds.has(item.id));
    }
    return list;
  }, [items, activeCategory, categories, showFavoritesOnly, favoriteIds]);

  const toggleFavorite = async (itemId) => {
    if (!canFavorite) {
      toast.info("Sign in as a customer to save favorites");
      return;
    }

    const isFav = favoriteIds.has(itemId);
    try {
      if (isFav) {
        await api.delete(`/api/favorites/${itemId}`);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        await api.post(`/api/favorites/${itemId}`);
        setFavoriteIds((prev) => new Set(prev).add(itemId));
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update favorites");
    }
  };

  if (loading) {
    return (
      <section id="menu" className="menu-section">
        <LoadingSpinner message="Loading menu..." />
      </section>
    );
  }

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        <div className="section-title">
          <div className="share-the-love-quote">
            <i className="fas fa-heart"></i> Share the love
          </div>
          <span className="subtitle">Our Menu</span>
          <h2>Signature Burgers & Menu</h2>
          <p>Bold flavors from the kitchen — hand-crafted smash burgers, wraps, sandwiches & pizzas</p>
        </div>

        <div className="menu-toolbar">
          <div className="menu-categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${String(activeCategory) === String(cat.id) ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {canFavorite && (
            <button
              type="button"
              className={`favorites-toggle ${showFavoritesOnly ? "active" : ""}`}
              onClick={() => setShowFavoritesOnly((v) => !v)}
            >
              <i className="fas fa-heart"></i>
              {showFavoritesOnly ? "Show All" : "My Favorites"}
            </button>
          )}
        </div>

        {!canFavorite && (
          <p className="menu-hint">
            <Link to="/login">Sign in</Link> or{" "}
            <Link to="/register">create an account</Link> to save favorites.
          </p>
        )}

        {filteredItems.length === 0 ? (
          <p className="menu-empty">No menu items in this view yet.</p>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => {
              const image = resolveImageUrl(item.image_url);
              const isFav = favoriteIds.has(item.id);
              return (
                <article key={item.id} className="menu-card">
                  <div className="menu-card-media">
                    {/* Top Left Average Rating Badge */}
                    <div
                      className="menu-card-rating-badge"
                      title={`${item.rating_count || 0} customer ratings`}
                    >
                      <i className="fas fa-star"></i>
                      <span>{Number(item.avg_rating || 0).toFixed(1)}</span>
                      {Number(item.rating_count) > 0 && (
                        <small>({item.rating_count})</small>
                      )}
                    </div>

                    {image ? (
                      <img src={image} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="menu-card-placeholder">
                        <i className="fas fa-hamburger"></i>
                      </div>
                    )}
                    {canFavorite && (
                      <button
                        type="button"
                        className={`fav-btn ${isFav ? "active" : ""}`}
                        aria-label={isFav ? "Remove favorite" : "Add favorite"}
                        onClick={() => toggleFavorite(item.id)}
                      >
                        <i className={`${isFav ? "fas" : "far"} fa-heart`}></i>
                      </button>
                    )}
                  </div>
                  <div className="menu-card-content">
                    <div className="menu-card-header">
                      <h3>{item.name}</h3>
                      <span className="menu-price">
                        {Number(item.price).toFixed(2)} ETB
                      </span>
                    </div>
                    <p>{item.description || "Chef’s special."}</p>
                    <div className="menu-card-footer-row">
                      {item.category_name && (
                        <span className="menu-cat-tag">{item.category_name}</span>
                      )}
                      {/* Bottom Right 5-Star Rating Picker */}
                      <div className="menu-card-star-picker">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const hoverVal = hoverRatings[item.id] || 0;
                          const userVal = userRatings[item.id] || 0;
                          const isFilled = hoverVal > 0 ? hoverVal >= star : userVal >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              className={`card-star-btn ${isFilled ? "active" : ""}`}
                              onMouseEnter={() =>
                                setHoverRatings((prev) => ({
                                  ...prev,
                                  [item.id]: star,
                                }))
                              }
                              onMouseLeave={() =>
                                setHoverRatings((prev) => ({
                                  ...prev,
                                  [item.id]: 0,
                                }))
                              }
                              onClick={() => handleRateItem(item.id, star)}
                              aria-label={`Rate ${star} star`}
                            >
                              <i
                                className={`${isFilled ? "fas" : "far"} fa-star`}
                              ></i>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Physical Menu Bottom VAT Banner & Wow! Stamp */}
        <div className="wow-vat-banner">
          <span>All price are excluding 15% VAT / ሁሉንም ዋጋ 15% ታክስ አይጨምርም</span>
          <span className="wow-stamp-badge">Wow!</span>
        </div>
      </div>
    </section>
  );
};

export default Service;
