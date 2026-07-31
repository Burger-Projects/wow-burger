import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { api, resolveImageUrl } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./MenuPage.css";

const MenuPage = () => {
  const { user, isCustomer, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
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
        setCategories(catRes.data.data || []);
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
      list = list.filter(
        (item) => String(item.category_id) === String(activeCategory),
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [items, activeCategory, searchQuery]);

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
      } else {
        await api.post(`/api/favorites/${itemId}`);
        setFavoriteIds((prev) => new Set(prev).add(itemId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update favorites");
    }
  };

  if (loading) {
    return (
      <section className="menu-page-section">
        <LoadingSpinner message="Loading menu..." />
      </section>
    );
  }

  return (
    <section className="menu-page-section">
      {/* Hero Banner */}
      <div className="menu-page-hero">
        <div className="menu-page-hero-bg"></div>
        <div className="menu-page-hero-content">
          <div className="share-the-love-quote">
            <i className="fas fa-heart"></i> Share the love
          </div>
          <span className="menu-page-hero-badge">Our Menu</span>
          <h1>Signature Burgers, Wraps & Pizzas</h1>
          <p>
            Bold flavors from the kitchen — hand-crafted smash burgers, wraps, sandwiches, pizzas & secret sauces.
          </p>
        </div>
      </div>

      <div className="menu-page-container">
        {/* Toolbar */}
        <div className="menu-page-toolbar">
          <div className="menu-page-categories">
            <button
              className={`menu-page-cat-btn ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`menu-page-cat-btn ${String(activeCategory) === String(cat.id) ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="menu-page-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search burgers, wraps, pizza..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="menu-page-search-clear"
                onClick={() => setSearchQuery("")}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Favorites hint */}
        {!canFavorite && (
          <p className="menu-page-hint">
            <Link to="/login">Sign in</Link> or{" "}
            <Link to="/register">create an account</Link> to save favorites.
          </p>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="menu-page-empty">
            <i className="fas fa-search"></i>
            <h3>No items found</h3>
            <p>Try a different category or search term.</p>
          </div>
        ) : (
          <>
            <p className="menu-page-count">
              Showing <strong>{filteredItems.length}</strong>{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </p>
            <div className="menu-page-grid">
              {filteredItems.map((item) => {
                const image = resolveImageUrl(item.image_url);
                const isFav = favoriteIds.has(item.id);
                return (
                  <article key={item.id} className="menu-page-card">
                  <div className="menu-page-card-media">
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
                      <div className="menu-page-card-placeholder">
                        <i className="fas fa-hamburger"></i>
                      </div>
                    )}
                    {canFavorite && (
                      <button
                        type="button"
                        className={`menu-page-fav-btn ${isFav ? "active" : ""}`}
                        aria-label={isFav ? "Remove favorite" : "Add favorite"}
                        onClick={() => toggleFavorite(item.id)}
                      >
                        <i className={`${isFav ? "fas" : "far"} fa-heart`}></i>
                      </button>
                    )}
                    {item.category_name && (
                      <span className="menu-page-card-category">
                        {item.category_name}
                      </span>
                    )}
                  </div>
                  <div className="menu-page-card-body">
                    <div className="menu-page-card-header">
                      <h3>{item.name}</h3>
                      <span className="menu-page-price">
                        {Number(item.price).toFixed(2)} ETB
                      </span>
                    </div>
                    <p>{item.description || "Chef's special."}</p>
                    <div className="menu-page-card-footer">
                      <span className="menu-page-availability">
                        {item.is_available ? (
                          <>
                            <i className="fas fa-check-circle"></i> Available
                          </>
                        ) : (
                          <>
                            <i className="fas fa-clock"></i> Sold out
                          </>
                        )}
                      </span>
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
          </>
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

export default MenuPage;