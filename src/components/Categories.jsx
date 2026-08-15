import { Link } from "react-router-dom";

function Categories() {
  const categories = [
    // =========================
    // CARS
    // =========================
    {
      icon: "🚗",
      title: "Cars",
      items: [
        {
          name: "New Cars",
          link: "/cars?condition=new",
        },
        {
          name: "Used Cars",
          link: "/cars?condition=used",
        },
      ],
    },

    // =========================
    // ምንአለሽ ተራ
    // =========================
    {
      icon: "🏪",
      title: "ምንአለሽ ተራ",
      items: [
        {
          name: "Used Materials",
          link: "/search?category=ምንአለሽ%20ተራ",
        },
        {
          name: "Used Items",
          link: "/search?category=ምንአለሽ%20ተራ",
        },
        {
          name: "Other Second-Hand Goods",
          link: "/search?category=ምንአለሽ%20ተራ",
        },
      ],
    },

    // =========================
    // BUILDING MATERIALS
    // =========================
    {
      icon: "🧱",
      title: "Building Materials",
      items: [
        {
          name: "New Building Materials",
          link: "/building-materials?condition=new",
        },
        {
          name: "Used Building Materials",
          link: "/building-materials?condition=used",
        },
      ],
    },

    // =========================
    // SPARE PARTS
    // =========================
    {
      icon: "🔧",
      title: "Spare Parts",
      items: [
        {
          name: "New Spare Parts",
          link: "/spare-parts?condition=new",
        },
        {
          name: "Used Spare Parts",
          link: "/spare-parts?condition=used",
        },
      ],
    },

    // =========================
    // ELECTRONICS
    // =========================
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

    // =========================
    // HOUSES
    // =========================
    {
      icon: "🏠",
      title: "Houses",
      items: [
        {
          name: "Houses for Sale",
          link: "/houses?type=sale",
        },
        {
          name: "Houses for Rent",
          link: "/houses?type=rent",
        },
      ],
    },

    // =========================
    // RENTALS
    // =========================
    {
      icon: "🏢",
      title: "Rentals",
      items: [
        {
          name: "Apartments",
          link: "/rentals?type=apartment",
        },
        {
          name: "Houses",
          link: "/rentals?type=house",
        },
        {
          name: "Shops",
          link: "/rentals?type=shop",
        },
        {
          name: "Offices",
          link: "/rentals?type=office",
        },
      ],
    },
  ];

  return (
    <section className="categories">

      <h2>Browse Categories</h2>

      <div className="category-grid">

        {categories.map((category) => (
          <div
            className="category-card"
            key={category.title}
          >

            {/* Icon */}
            <div className="category-icon">
              {category.icon}
            </div>

            {/* Category name */}
            <h3>{category.title}</h3>

            {/* Subcategories */}
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

          </div>
        ))}

      </div>

    </section>
  );
}

export default Categories;