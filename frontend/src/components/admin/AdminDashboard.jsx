import React, { useEffect, useState, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { api, resolveImageUrl } from "../../api/client";
import LoadingSpinner from "../common/LoadingSpinner";
import "./admin.css";

const emptyItemForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  is_available: true,
  image: null,
};

const emptyCategoryForm = {
  name: "",
  slug: "",
};

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [tab, setTab] = useState("menu");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // ─── Category State ─────────────────────────────────────────────────────────
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryBusy, setCategoryBusy] = useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [reviews, setReviews] = useState([]);

  const loadMenu = async () => {
    const [menuRes, catRes] = await Promise.all([
      api.get("/api/menu/menu-items"),
      api.get("/api/menu/categories"),
    ]);
    setItems(menuRes.data.data || []);
    setCategories(catRes.data.data || []);
  };

  const loadUsers = async () => {
    const res = await api.get("/api/users");
    setUsers(res.data.data || []);
  };

  const loadReviews = async () => {
    const res = await api.get("/api/reviews/admin");
    setReviews(res.data.data || []);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadMenu().catch((e) =>
      toast.error(e.response?.data?.message || "Failed to load menu"),
    );
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || (tab !== "users" && tab !== "categories" && tab !== "reviews")) return;
    if (tab === "users") {
      loadUsers().catch((e) =>
        toast.error(e.response?.data?.message || "Failed to load users"),
      );
    } else if (tab === "reviews") {
      loadReviews().catch((e) =>
        toast.error(e.response?.data?.message || "Failed to load reviews"),
      );
    }
  }, [isAdmin, tab]);

  // ─── Menu Item Form Handlers ────────────────────────────────────────────────

  const onItemFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files?.[0] || null;
      setItemForm((prev) => ({ ...prev, image: file }));
      // Create preview URL
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
      return;
    }
    setItemForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startEdit = (item) => {
    // Clear form first
    resetItemForm();
    // Then populate with edit data (setTimeout ensures state settles)
    setTimeout(() => {
      setEditingId(item.id);
      setEditingImageUrl(item.image_url || null);
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: String(item.price),
        category_id: String(item.category_id),
        is_available: Boolean(item.is_available),
        image: null,
      });
      setImagePreview(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const resetItemForm = () => {
    setEditingId(null);
    setEditingImageUrl(null);
    setImagePreview(null);
    setItemForm({
      ...emptyItemForm,
      category_id: categories[0] ? String(categories[0].id) : "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitMenuItem = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = new FormData();
      data.append("name", itemForm.name);
      data.append("description", itemForm.description);
      data.append("price", itemForm.price);
      data.append("category_id", itemForm.category_id);
      data.append("is_available", String(itemForm.is_available));
      if (itemForm.image) data.append("image", itemForm.image);

      if (editingId) {
        await api.put(`/api/menu/menu-items/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Menu item updated");
      } else {
        await api.post("/api/menu/menu-items", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Menu item created");
      }
      resetItemForm();
      await loadMenu();
    } catch (error) {
      toast.error(
        error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          "Save failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await api.delete(`/api/menu/menu-items/${id}`);
      toast.success("Deleted");
      await loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // ─── Category Handlers ──────────────────────────────────────────────────────

  const onCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
    // Auto-generate slug from name
    if (name === "name") {
      setCategoryForm((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }));
    }
  };

  const startEditCategory = (cat) => {
    resetCategoryForm();
    setTimeout(() => {
      setEditingCategoryId(cat.id);
      setCategoryForm({
        name: cat.name,
        slug: cat.slug,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    setCategoryBusy(true);
    try {
      if (editingCategoryId) {
        await api.put(`/api/menu/categories/${editingCategoryId}`, categoryForm);
        toast.success("Category updated");
      } else {
        await api.post("/api/menu/categories", categoryForm);
        toast.success("Category created");
      }
      resetCategoryForm();
      await loadMenu();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save category",
      );
    } finally {
      setCategoryBusy(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? All menu items in it will also be deleted.")) return;
    try {
      await api.delete(`/api/menu/categories/${id}`);
      toast.success("Category deleted");
      resetCategoryForm();
      await loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // ─── User Handlers ──────────────────────────────────────────────────────────

  const createUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/api/users", userForm);
      toast.success("User created");
      setUserForm({ name: "", email: "", password: "", role: "customer" });
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create user");
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/api/users/${id}/role`, { role });
      toast.success("Role updated");
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Role update failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success("User deleted");
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // ─── Review Handlers ────────────────────────────────────────────────────────

  const toggleReviewApproval = async (id) => {
    try {
      const res = await api.patch(`/api/reviews/${id}/toggle`);
      toast.success(res.data?.message || "Status updated");
      window.dispatchEvent(new Event("reviews-updated"));
      await loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/api/reviews/${id}`);
      toast.success("Review deleted");
      window.dispatchEvent(new Event("reviews-updated"));
      await loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Signed in as <strong>{user.name || user.email}</strong>
          </p>
        </div>
        <div className="admin-topbar-actions">
          <Link to="/" className="admin-link">
            View site
          </Link>
          <button type="button" className="btn btn-primary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === "menu" ? "active" : ""}
          onClick={() => setTab("menu")}
        >
          Menu Items
        </button>
        <button
          type="button"
          className={tab === "categories" ? "active" : ""}
          onClick={() => setTab("categories")}
        >
          Categories
        </button>
        <button
          type="button"
          className={tab === "reviews" ? "active" : ""}
          onClick={() => setTab("reviews")}
        >
          Reviews ({reviews.length})
        </button>
        <button
          type="button"
          className={tab === "users" ? "active" : ""}
          onClick={() => setTab("users")}
        >
          Users
        </button>
      </div>

      {/* ─── Menu Items Tab ─────────────────────────────────────────────────── */}
      {tab === "menu" && (
        <div className="admin-grid">
          <form className="admin-card" onSubmit={submitMenuItem}>
            <h2>{editingId ? "Edit Menu Item" : "Add Menu Item"}</h2>
            <label>
              Name
              <input
                name="name"
                value={itemForm.name}
                onChange={onItemFormChange}
                required
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows={3}
                value={itemForm.description}
                onChange={onItemFormChange}
              />
            </label>
            <label>
              Price
              <input
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={itemForm.price}
                onChange={onItemFormChange}
                required
              />
            </label>
            <label>
              Category
              <select
                name="category_id"
                value={itemForm.category_id}
                onChange={onItemFormChange}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                name="is_available"
                checked={itemForm.is_available}
                onChange={onItemFormChange}
              />
              Available
            </label>
            <label>
              Image {editingId ? "(optional — leave empty to keep)" : ""}
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onItemFormChange}
              />
            </label>

            {/* Image Preview */}
            {(imagePreview || (editingId && editingImageUrl && !imagePreview)) && (
              <div className="admin-image-preview">
                <img
                  src={imagePreview || resolveImageUrl(editingImageUrl)}
                  alt="Preview"
                />
                {imagePreview && <span className="admin-image-label">New image selected</span>}
                {!imagePreview && editingImageUrl && (
                  <span className="admin-image-label">Current image</span>
                )}
              </div>
            )}

            <div className="admin-form-actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetItemForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-card admin-list">
            <h2>All Items ({items.length})</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const img = resolveImageUrl(item.image_url);
                    return (
                      <tr key={item.id}>
                        <td>
                          {img ? (
                            <img src={img} alt="" className="admin-thumb" />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{item.name}</td>
                        <td>{item.category_name}</td>
                        <td>${Number(item.price).toFixed(2)}</td>
                        <td>
                          {item.is_available ? (
                            <span className="badge ok">In stock</span>
                          ) : (
                            <span className="badge off">Hidden</span>
                          )}
                        </td>
                        <td className="admin-row-actions">
                          <button type="button" onClick={() => startEdit(item)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => deleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Categories Tab ─────────────────────────────────────────────────── */}
      {tab === "categories" && (
        <div className="admin-grid">
          <form className="admin-card" onSubmit={submitCategory}>
            <h2>{editingCategoryId ? "Edit Category" : "Add Category"}</h2>
            <label>
              Name
              <input
                name="name"
                value={categoryForm.name}
                onChange={onCategoryFormChange}
                required
              />
            </label>
            <label>
              Slug
              <input
                name="slug"
                value={categoryForm.slug}
                onChange={onCategoryFormChange}
                required
                pattern="^[a-z0-9-]+$"
                title="Lowercase alphanumeric with hyphens only"
              />
            </label>
            <div className="admin-form-actions">
              <button className="btn btn-primary" type="submit" disabled={categoryBusy}>
                {categoryBusy ? "Saving..." : editingCategoryId ? "Update" : "Create"}
              </button>
              {editingCategoryId && (
                <button type="button" className="btn btn-secondary" onClick={resetCategoryForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-card admin-list">
            <h2>All Categories ({categories.length})</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td><code>{cat.slug}</code></td>
                      <td>{new Date(cat.created_at).toLocaleDateString()}</td>
                      <td className="admin-row-actions">
                        <button type="button" onClick={() => startEditCategory(cat)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Users Tab ──────────────────────────────────────────────────────── */}
      {tab === "users" && (
        <div className="admin-grid">
          <form className="admin-card" onSubmit={createUser}>
            <h2>Create User</h2>
            <label>
              Name
              <input
                value={userForm.name}
                onChange={(e) =>
                  setUserForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={6}
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((p) => ({ ...p, password: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Role
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((p) => ({ ...p, role: e.target.value }))
                }
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              Create User
            </button>
          </form>

          <div className="admin-card admin-list">
            <h2>Users ({users.length})</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          disabled={u.id === user.id}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                        >
                          <option value="customer">customer</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        {u.id !== user.id && (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => deleteUser(u.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reviews Tab ──────────────────────────────────────────────────────── */}
      {tab === "reviews" && (
        <div className="admin-grid single-col">
          <div className="admin-card admin-list">
            <h2>Customer Reviews & Moderation ({reviews.length})</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Feedback Comment</th>
                    <th>Date</th>
                    <th>Display on Site</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                        No reviews submitted yet.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((rev) => (
                      <tr key={rev.id}>
                        <td>
                          <strong>{rev.customer_name}</strong>
                          {rev.email && <div style={{ fontSize: "0.82rem", color: "#666" }}>{rev.email}</div>}
                        </td>
                        <td>
                          <span style={{ color: "#f5b301", fontWeight: "bold", fontSize: "1.1rem" }}>
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          </span>
                        </td>
                        <td style={{ maxWidth: "320px", wordBreak: "break-word" }}>
                          {rev.comment}
                        </td>
                        <td>
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={Boolean(rev.is_approved)}
                              onChange={() => toggleReviewApproval(rev.id)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <span className={`badge ${rev.is_approved ? "ok" : "off"}`} style={{ marginLeft: "8px" }}>
                            {rev.is_approved ? "Visible" : "Hidden"}
                          </span>
                        </td>
                        <td className="admin-row-actions">
                          <button
                            type="button"
                            className="danger"
                            onClick={() => deleteReview(rev.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;