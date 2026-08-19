import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function Home() {
  const [openCategory, setOpenCategory] = useState(null);
  const [latestAds, setLatestAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);

  const categories = [
    {
      id: "cars",
      icon: "🚗",
      title: "Cars",
      description: "New and used cars",
      options: [
        {
          name: "🚗 New Cars",
          link: "/cars?condition=new",
        },
        {
          name: "🚙 Used Cars",
          link: "/cars?condition=used",
        },
      ],
    },

    {
      id: "houses",
      icon: "🏠",
      title: "Houses",
      description: "Houses for sale and rent",
      options: [
        {
          name: "🏠 Houses for Sale",
          link: "/houses?type=sale",
        },
        {
          name: "🏠 Houses for Rent",
          link: "/houses?type=rent",
        },
      ],
    },

    {
      id: "rentals",
      icon: "🏢",
      title: "Rentals",
      description: "Apartments, houses, shops and offices",
      options: [
        {
          name: "🏢 Apartments",
          link: "/rentals?type=apartment",
        },
        {
          name: "🏠 Houses",
          link: "/rentals?type=house",
        },
        {
          name: "🏪 Shops",
          link: "/rentals?type=shop",
        },
        {
          name: "🏢 Offices",
          link: "/rentals?type=office",
        },
      ],
    },

    {
      id: "spare-parts",
      icon: "🔧",
      title: "Spare Parts",
      description: "New and used spare parts",
      options: [
        {
          name: "🔧 New Spare Parts",
          link: "/spare-parts?condition=new",
        },
        {
          name: "🔧 Used Spare Parts",
          link: "/spare-parts?condition=used",
        },
      ],
    },

    {
      id: "building-materials",
      icon: "🧱",
      title: "Building Materials",
      description: "New and used building materials",
      options: [
        {
          name: "🧱 New Building Materials",
          link: "/building-materials?condition=new",
        },
        {
          name: "🧱 Used Building Materials",
          link: "/building-materials?condition=used",
        },
      ],
    },

    {
      id: "electronics",
      icon: "📱",
      title: "Electronics",
      description: "Phones, computers, TVs and more",
      options: [
        {
          name: "📱 New Phones",
          link:
            "/search?category=Electronics&subcategory=Phones&condition=new",
        },
        {
          name: "📱 Used Phones",
          link:
            "/search?category=Electronics&subcategory=Phones&condition=used",
        },
        {
          name: "💻 New Computers & Laptops",
          link:
            "/search?category=Electronics&subcategory=Computers&condition=new",
        },
        {
          name: "💻 Used Computers & Laptops",
          link:
            "/search?category=Electronics&subcategory=Computers&condition=used",
        },
        {
          name: "📺 New TVs",
          link:
            "/search?category=Electronics&subcategory=TVs&condition=new",
        },
        {
          name: "📺 Used TVs",
          link:
            "/search?category=Electronics&subcategory=TVs&condition=used",
        },
        {
          name: "🎧 Audio & Accessories",
          link:
            "/search?category=Electronics&subcategory=Audio",
        },
        {
          name: "🔌 Other Electronics",
          link:
            "/search?category=Electronics&subcategory=Other",
        },
      ],
    },

    {
      id: "min-alish-tera",
      icon: "🏪",
      title: "ምንአለሽ ተራ",
      description: "Used and second-hand items",
      options: [
        {
          name: "🧱 Used Materials",
          link:
            "/search?category=ምንአለሽ%20ተራ&subcategory=Materials",
        },
        {
          name: "📦 Used Items",
          link:
            "/search?category=ምንአለሽ%20ተራ&subcategory=Items",
        },
        {
          name: "♻️ Other Second-Hand Goods",
          link:
            "/search?category=ምንአለሽ%20ተራ&subcategory=Other",
        },
      ],
    },
  ];

  // =========================
  // LOAD ALL ADS
  // =========================

  useEffect(() => {
    loadLatestAds();
  }, []);

  const loadLatestAds = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const ads = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      // Newest first
      ads.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;

        return dateB - dateA;
      });

      // =====================================
      // IMPORTANT:
      // NO LIMIT
      // Show ALL advertisements
      // =====================================

      setLatestAds(ads);

    } catch (error) {
      console.error(
        "Error loading latest advertisements:",
        error
      );
    } finally {
      setAdsLoading(false);
    }
  };

  const toggleCategory = (id) => {
    setOpenCategory(
      openCategory === id ? null : id
    );
  };

  return (
    <main className="home-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="home-hero">

        <h1>የኛ ገበያ</h1>

        <h2>
          Buy • Sell • Rent Across Ethiopia
        </h2>

        <p>
          Find cars, houses, rentals, spare parts,
          building materials and more anywhere in Ethiopia.
        </p>

        <div className="home-search">

          <input
            type="text"
            placeholder="🔎 Search cars, houses, electronics and more..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value =
                  e.target.value.trim();

                if (value) {
                  window.location.hash =
                    `/search?search=${encodeURIComponent(
                      value
                    )}`;
                } else {
                  window.location.hash =
                    "/search";
                }
              }
            }}
          />

          <Link
            to="/search"
            className="home-search-button"
          >
            🔎 Search
          </Link>

        </div>

      </section>


      {/* =========================
          CATEGORIES
      ========================= */}

      <section className="home-categories">

        <h2 className="home-section-title">
          All Categories
        </h2>

        <div className="home-category-grid">

          {categories.map((category) => {

            const isOpen =
              openCategory === category.id;

            return (
              <div
                key={category.id}
                className="home-category-wrapper"
              >

                <div
                  className={`home-card ${
                    isOpen
                      ? "home-card-open"
                      : ""
                  }`}
                  onClick={() =>
                    toggleCategory(category.id)
                  }
                >

                  <div className="home-card-icon">
                    {category.icon}
                  </div>

                  <h3>
                    {category.title}
                  </h3>

                  <p>
                    {category.description}
                  </p>

                  <span>
                    {isOpen
                      ? "Hide options ↑"
                      : "Choose an option →"}
                  </span>

                </div>

                {isOpen && (
                  <div className="category-options-panel">

                    <h4>
                      {category.title}
                    </h4>

                    {category.options.map(
                      (option) => (
                        <Link
                          key={option.name}
                          to={option.link}
                          className="category-option-button"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          {option.name}
                        </Link>
                      )
                    )}

                  </div>
                )}

              </div>
            );
          })}


          

        </div>

      </section>


      {/* =========================
          LATEST ADS
      ========================= */}

      <section className="latest-ads-section">

        <div className="latest-ads-header">

          <div>

            <h2>
              🆕 Latest Advertisements
            </h2>

            <p>
              Recently posted items on የኛ ገበያ
            </p>

          </div>

          <Link
            to="/search"
            className="view-all-ads"
          >
            View All →
          </Link>

        </div>


        {adsLoading ? (

          <div className="latest-ads-loading">

            <h3>
              Loading advertisements...
            </h3>

          </div>

        ) : latestAds.length === 0 ? (

          <div className="latest-ads-empty">

            <h3>
              No advertisements yet.
            </h3>

            <p>
              Be the first person to post an advertisement.
            </p>

            <Link to="/post-ad">
              📢 Post Advertisement
            </Link>

          </div>

        ) : (

          <div className="latest-ads-grid">

            {/* =====================================
                ALL ADS — NO LIMIT
                ===================================== */}

            {latestAds.map((ad) => {

              /*
               * Your Firestore has both:
               *
               * image
               * images[]
               *
               * We support both.
               */

              const adImage =
                Array.isArray(ad.images) &&
                ad.images.length > 0
                  ? ad.images[0]
                  : ad.image;

              return (

                <div
                  className="latest-ad-card"
                  key={ad.id}
                >

                  {/* IMAGE */}

                  <div className="latest-ad-image">

                    {adImage ? (

                      <img
                        src={adImage}
                        alt={
                          ad.title ||
                          "Advertisement"
                        }
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";

                          const parent =
                            e.currentTarget.parentElement;

                          if (parent) {
                            parent.innerHTML =
                              '<div class="latest-no-image">📷</div>';
                          }
                        }}
                      />

                    ) : (

                      <div className="latest-no-image">
                        📷
                      </div>

                    )}

                  </div>


                  {/* INFORMATION */}

                  <div className="latest-ad-info">

                    <span>
                      {ad.category ||
                        "Advertisement"}
                    </span>

                    <h3>
                      {ad.title ||
                        "Untitled Advertisement"}
                    </h3>

                    <h4>
                      ETB {ad.price || "0"}
                    </h4>

                    <p>
                      📍 {ad.city || "Ethiopia"}
                    </p>

                    {ad.condition && (
                      <p>
                        🔄 {ad.condition}
                      </p>
                    )}

                    {ad.subcategory && (
                      <p>
                        📂 {ad.subcategory}
                      </p>
                    )}

                    <Link
                      to={`/ad/${ad.id}`}
                      className="latest-view-button"
                    >
                      👁 View Details
                    </Link>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}

export default Home;