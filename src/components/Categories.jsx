import { useState } from "react";
import { Link } from "react-router-dom";
import "./Categories.css";

function Categories() {
  const [openCategory, setOpenCategory] = useState(null);

  const categories = [
    {
      icon: "🚗",
      title: "Cars",
      items: [
        { name: "🚗 New Cars", link: "/cars?condition=new" },
        { name: "🚙 Used Cars", link: "/cars?condition=used" },
      ],
    },
    {
      icon: "🏠",
      title: "Houses",
      items: [
        { name: "🏠 Houses for Sale", link: "/houses?type=sale" },
        { name: "🏠 Houses for Rent", link: "/houses?type=rent" },
      ],
    },
    {
      icon: "🏢",
      title: "Rentals",
      items: [
        { name: "🏢 Apartments", link: "/rentals?type=apartment" },
        { name: "🏠 Houses", link: "/rentals?type=house" },
        { name: "🏪 Shops", link: "/rentals?type=shop" },
        { name: "🏢 Offices", link: "/rentals?type=office" },
      ],
    },
    {
      icon: "📱",
      title: "Electronics",
      items: [
        {
          name: "📱 New Phones",
          link: "/search?category=Electronics&subcategory=Phones&condition=new",
        },
        {
          name: "📱 Used Phones",
          link: "/search?category=Electronics&subcategory=Phones&condition=used",
        },
        {
          name: "💻 New Computers & Laptops",
          link: "/search?category=Electronics&subcategory=Computers&condition=new",
        },
        {
          name: "💻 Used Computers & Laptops",
          link: "/search?category=Electronics&subcategory=Computers&condition=used",
        },
        {
          name: "📺 New TVs",
          link: "/search?category=Electronics&subcategory=TVs&condition=new",
        },
        {
          name: "📺 Used TVs",
          link: "/search?category=Electronics&subcategory=TVs&condition=used",
        },
        {
          name: "🎧 Audio & Accessories",
          link: "/search?category=Electronics&subcategory=Audio",
        },
        {
          name: "🔌 Other Electronics",
          link: "/search?category=Electronics&subcategory=Other",
        },
      ],
    },
    {
      icon: "🛋️",
      title: "Furniture",
      items: [
        {
          name: "🛋️ Sofas",
          link: "/search?category=Furniture&subcategory=Sofas",
        },
        {
          name: "🛏️ Beds",
          link: "/search?category=Furniture&subcategory=Beds",
        },
        {
          name: "🪑 Chairs & Tables",
          link: "/search?category=Furniture&subcategory=Chairs%20%26%20Tables",
        },
        {
          name: "🗄️ Cabinets",
          link: "/search?category=Furniture&subcategory=Cabinets",
        },
        {
          name: "📦 Other Furniture",
          link: "/search?category=Furniture&subcategory=Other",
        },
      ],
    },
    {
      icon: "🔧",
      title: "Labor & Services",
      items: [
        {
          name: "🏗️ Construction",
          link: "/search?category=Labor%20%26%20Services&subcategory=Construction",
        },
        {
          name: "⚡ Electrician",
          link: "/search?category=Labor%20%26%20Services&subcategory=Electrician",
        },
        {
          name: "🚰 Plumber",
          link: "/search?category=Labor%20%26%20Services&subcategory=Plumber",
        },
        {
          name: "🎨 Painter",
          link: "/search?category=Labor%20%26%20Services&subcategory=Painter",
        },
        {
          name: "🧹 Cleaning",
          link: "/search?category=Labor%20%26%20Services&subcategory=Cleaning",
        },
        {
          name: "🚚 Moving",
          link: "/search?category=Labor%20%26%20Services&subcategory=Moving",
        },
        {
          name: "🛠️ Other Services",
          link: "/search?category=Labor%20%26%20Services&subcategory=Other",
        },
      ],
    },
    {
      icon: "🏪",
      title: "ምንአለሽ ተራ",
      items: [
        {
          name: "🧱 Used Materials",
          link: "/search?category=ምንአለሽ%20ተራ",
        },
        {
          name: "🏪 Used Items",
          link: "/search?category=ምንአለሽ%20ተራ",
        },
        {
          name: "📦 Other Second-Hand Goods",
          link: "/search?category=ምንአለሽ%20ተራ",
        },
      ],
    },
  ];

  const toggleCategory = (title) => {
    setOpenCategory((current) =>
      current === title ? null : title
    );
  };

  return (
    <section className="categories">
      <h2 className="categories-title">Browse Categories</h2>

      <div className="category-grid">
        {categories.map((category) => {
          const isOpen = openCategory === category.title;

          return (
            <div
              key={category.title}
              className={`category-card ${
                isOpen ? "category-open" : ""
              }`}
            >
              <button
                type="button"
                className="category-header"
                onClick={() => toggleCategory(category.title)}
              >
                <div className="category-icon">
                  <span>{category.icon}</span>
                </div>

                <div className="category-title">
                  {category.title}
                </div>

                <div className="category-arrow">
                  {isOpen ? "▲" : "▼"}
                </div>
              </button>

              {isOpen && (
                <div className="category-options">
                  {category.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.link}
                      className="category-option"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;