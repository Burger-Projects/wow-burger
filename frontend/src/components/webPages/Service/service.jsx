import React, { useState } from "react";
import "./service.css";

const menuItems = [
  {
    id: 1,
    name: "Classic Beef Burger",
    description:
      "Juicy beef patty with lettuce, tomato, onions, and our signature sauce",
    price: "$12.99",
    category: "classic",
    icon: "fa-hamburger",
    popular: true,
  },
  {
    id: 2,
    name: "Double Cheese Deluxe",
    description:
      "Double beef patties with melted cheddar, pickles, and special sauce",
    price: "$16.99",
    category: "classic",
    icon: "fa-hamburger",
    popular: true,
  },
  {
    id: 3,
    name: "BBQ Bacon Smash",
    description:
      "Smoked bacon, caramelized onions, BBQ sauce, and crispy onion rings",
    price: "$18.99",
    category: "premium",
    icon: "fa-fire",
    popular: true,
  },
  {
    id: 4,
    name: "Mushroom Swiss",
    description:
      "Sauteed mushrooms, Swiss cheese, garlic aioli on a brioche bun",
    price: "$15.99",
    category: "premium",
    icon: "fa-mushroom",
    popular: false,
  },
  {
    id: 5,
    name: "Spicy Jalapeno",
    description:
      "Pepper jack cheese, jalapenos, hot sauce, and cool ranch dressing",
    price: "$14.99",
    category: "spicy",
    icon: "fa-pepper-hot",
    popular: false,
  },
  {
    id: 6,
    name: "Veggie Garden",
    description:
      "Plant-based patty, fresh greens, roasted peppers, and hummus spread",
    price: "$13.99",
    category: "veggie",
    icon: "fa-seedling",
    popular: false,
  },
  {
    id: 7,
    name: "Truffle Mushroom",
    description: "Black truffle aioli, wild mushrooms, arugula, and parmesan",
    price: "$21.99",
    category: "premium",
    icon: "fa-crown",
    popular: true,
  },
  {
    id: 8,
    name: "Hawaiian Paradise",
    description: "Grilled pineapple, ham, Swiss cheese, and sweet chili glaze",
    price: "$15.99",
    category: "classic",
    icon: "fa-umbrella-beach",
    popular: false,
  },
];

const categories = [
  { id: "all", label: "All Burgers" },
  { id: "classic", label: "Classic" },
  { id: "premium", label: "Premium" },
  { id: "spicy", label: "Spicy" },
  { id: "veggie", label: "Veggie" },
];

const Service = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        <div className="section-title">
          <span className="subtitle">Our Menu</span>
          <h2>Delicious Burgers</h2>
          <p>Choose from our wide selection of hand-crafted gourmet burgers</p>
        </div>

        <div className="menu-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`menu-card ${item.popular ? "popular" : ""}`}
            >
              {item.popular && (
                <div className="popular-badge">Most Popular</div>
              )}
              <div className="menu-card-icon">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div className="menu-card-content">
                <div className="menu-card-header">
                  <h3>{item.name}</h3>
                  <span className="menu-price">{item.price}</span>
                </div>
                <p>{item.description}</p>
                <button className="btn btn-primary add-btn">
                  <i className="fas fa-plus"></i> Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Service;
