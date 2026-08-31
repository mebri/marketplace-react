import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function Home() {
  const [openCategory, setOpenCategory] =
    useState(null);

  const [latestAds, setLatestAds] =
    useState([]);

  const [adsLoading, setAdsLoading] =
    useState(true);

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    {
      id: "cars",
      icon: "🚗",
      title: "Cars",
      description:
        "New, used, electric cars and car rental",
      options: [
        {
          name: "🚗 New Cars",
          link: "/cars?condition=new",
        },
        {
          name: "🚙 Used Cars",
          link: "/cars?condition=used",
        },
        {
          name: "⚡ Electric Cars",
          link: "/cars?condition=electric",
        },
        {
          name: "🚘 Cars for Rent",
          link: "/cars?condition=rent",
        },
      ],
    },

    {
      id: "houses",
      icon: "🏠",
      title: "Houses",
      description:
        "Houses for sale and rent",
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
      description:
        "Apartments, shops and offices",
      options: [
        {
          name: "🏢 Apartments",
          link: "/rentals?type=apartment",
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

    // =========================
    // ELECTRONICS
    // =========================

    {
      id: "electronics",
      icon: "📱",
      title: "Electronics",
      description:
        "Phones, computers, TVs and more",
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

    // =========================
    // FURNITURE
    // =========================

    {
      id: "furniture",
      icon: "🛋️",
      title: "Furniture",
      description:
        "New and used furniture",
      options: [
        {
          name: "🛋️ Sofas",
          link:
            "/search?category=Furniture&subcategory=Sofas",
        },
        {
          name: "🛏️ Beds",
          link:
            "/search?category=Furniture&subcategory=Beds",
        },
        {
          name: "🪑 Chairs & Tables",
          link:
            "/search?category=Furniture&subcategory=Chairs%20and%20Tables",
        },
        {
          name: "🗄️ Cabinets",
          link:
            "/search?category=Furniture&subcategory=Cabinets",
        },
        {
          name: "🪞 Other Furniture",
          link:
            "/search?category=Furniture&subcategory=Other",
        },
      ],
    },

    // =========================
    // LABOR & SERVICES
    // =========================

    {
      id: "labor",
      icon: "👷",
      title: "Labor & Services",
      description:
        "Find skilled workers and services",
      options: [
        {
          name: "👷 Construction Worker",
          link:
            "/search?category=Labor%20%26%20Services&subcategory=Construction",
        },
        {
          name: "⚡ Electrician",
          link:
            "/search?category=Labor%20%26%20Services&subcategory=Electrician",
        },
        {
          name: "🚰 Plumber",
          link:
            "/search?category=Labor%20%26%20Services&subcategory=Plumber",
        },
        {
          name: "🎨 Painter",
          link:
            "/search?category=Labor%20%26%20Services&subcategory=Painter",
        },
        {
          name: "🧹 Cleaning",
          link:
            "/search?category=Labor%20%26%20Services&subcategory=Cleaning",
        },
        {
          name: "🚚 Moving & Transport",
          link:
            "/search?category=Labor%20%26%20Services&subcategory=Moving",
        },
        {
          name: "🔧 Other Services",
          link:
            "/search?category=Labor%20%26%20Services&subcategory=Other",
        },
      ],
    },

    // =========================
    // ምንአለሽ ተራ
    // =========================

    {
      id: "min-alish-tera",
      icon: "🏪",
      title: "ምንአለሽ ተራ",
      description:
        "Used and second-hand items",
      options: [
        {
          name: "📦 Used Items",
          link:
            "/search?category=ምንአለሽ%20ተራ&subcategory=Items",
        },
        {
          name: "♻️ Second-Hand Goods",
          link:
            "/search?category=ምንአለሽ%20ተራ&subcategory=Other",
        },
      ],
    },
  ];

  // =========================
  // LOAD ADS
  // =========================

  useEffect(() => {
    loadLatestAds();
  }, []);

  const loadLatestAds = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const ads = snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

      // =========================
      // NEWEST FIRST
      // =========================

      ads.sort((a, b) => {
        return (
          getAdTime(b) -
          getAdTime(a)
        );
      });

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

  // =========================
  // GET AD TIME
  // =========================

  const getAdTime = (ad) => {
    if (!ad?.createdAt) {
      return 0;
    }

    // Firestore Timestamp
    if (
      typeof ad.createdAt.toMillis ===
      "function"
    ) {
      return ad.createdAt.toMillis();
    }

    // Firestore timestamp object
    if (
      typeof ad.createdAt === "object" &&
      ad.createdAt.seconds
    ) {
      return (
        ad.createdAt.seconds * 1000
      );
    }

    // JavaScript Date
    if (
      ad.createdAt instanceof Date
    ) {
      return ad.createdAt.getTime();
    }

    // String / number fallback
    const date = new Date(
      ad.createdAt
    ).getTime();

    return Number.isNaN(date)
      ? 0
      : date;
  };

  // =========================
  // DISPLAY POST TIME
  // =========================

  const getPostedTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    let postedDate;

    // Firestore Timestamp
    if (
      typeof createdAt.toDate ===
      "function"
    ) {
      postedDate =
        createdAt.toDate();
    }

    // Firestore timestamp object
    else if (createdAt.seconds) {
      postedDate = new Date(
        createdAt.seconds * 1000
      );
    }

    // JavaScript Date
    else if (
      createdAt instanceof Date
    ) {
      postedDate = createdAt;
    }

    // String / number
    else {
      postedDate = new Date(
        createdAt
      );
    }

    if (
      Number.isNaN(
        postedDate.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      postedDate.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    // Future timestamp
    if (difference < 0) {
      return "Just now";
    }

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1 ? "" : "s"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    return postedDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // CATEGORY TOGGLE
  // =========================

  const toggleCategory = (id) => {
    setOpenCategory(
      openCategory === id
        ? null
        : id
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
          Find cars, houses, rentals,
          electronics, furniture,
          labor and more anywhere
          in Ethiopia.
        </p>

        {/* SEARCH */}

        <div className="home-search">

          <input
            type="text"
            placeholder="🔎 Search cars, houses, furniture, labor and more..."
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

          {categories.map(
            (category) => {

              const isOpen =
                openCategory ===
                category.id;

              return (

                <div
                  key={category.id}
                  className="home-category-wrapper"
                >

                  {/* CATEGORY CARD */}

                  <div
                    className={`home-card ${
                      isOpen
                        ? "home-card-open"
                        : ""
                    }`}
                    onClick={() =>
                      toggleCategory(
                        category.id
                      )
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

                  {/* OPTIONS */}

                  {isOpen && (

                    <div className="category-options-panel">

                      <h4>
                        {category.title}
                      </h4>

                      {category.options.map(
                        (option) => (

                          <Link
                            key={
                              option.name
                            }
                            to={
                              option.link
                            }
                            className="category-option-button"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            {
                              option.name
                            }
                          </Link>

                        )
                      )}

                    </div>

                  )}

                </div>

              );

            }
          )}

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

        {/* =========================
            LOADING
        ========================= */}

        {adsLoading ? (

          <div className="latest-ads-loading">

            <h3>
              Loading advertisements...
            </h3>

          </div>

        ) : latestAds.length === 0 ? (

          /* =========================
             EMPTY
          ========================= */

          <div className="latest-ads-empty">

            <h3>
              No advertisements yet.
            </h3>

            <p>
              Be the first person to post
              an advertisement.
            </p>

            <Link to="/post-ad">
              📢 Post Advertisement
            </Link>

          </div>

        ) : (

          /* =========================
             ADS
          ========================= */

          <div className="latest-ads-grid">

            {latestAds.map((ad) => {

              // =========================
              // FIRST IMAGE
              // =========================

              const adImage =
                Array.isArray(
                  ad.images
                ) &&
                ad.images.length > 0
                  ? ad.images[0]
                  : ad.image;

              // =========================
              // SHORT DESCRIPTION
              // =========================

              const shortDescription =
                ad.description
                  ? ad.description.length >
                    100
                    ? `${ad.description.substring(
                        0,
                        100
                      )}...`
                    : ad.description
                  : "No description available.";

              // =========================
              // POST TIME
              // =========================

              const postedTime =
                getPostedTime(
                  ad.createdAt
                );

              return (

                <div
                  className="latest-ad-card"
                  key={ad.id}
                >

                  {/* =========================
                      CLICKABLE IMAGE
                  ========================= */}

                  <Link
                    to={`/ad/${ad.id}`}
                    className="latest-ad-image-link"
                    aria-label={`View ${
                      ad.title ||
                      "Advertisement"
                    }`}
                  >

                    <div className="latest-ad-image">

                      {adImage ? (

                        <img
                          src={adImage}
                          alt={
                            ad.title ||
                            "Advertisement"
                          }
                          loading="lazy"
                          className="latest-ad-photo"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div className="latest-no-image">
                          📷 No Image
                        </div>

                      )}

                    </div>

                  </Link>

                  {/* =========================
                      INFORMATION
                  ========================= */}

                  <div className="latest-ad-info">

                    <span className="latest-ad-category">
                      {ad.category ||
                        "Advertisement"}
                    </span>

                    <h3>
                      {ad.title ||
                        "Untitled Advertisement"}
                    </h3>

                    <h4>
                      ETB{" "}
                      {Number(
                        ad.price || 0
                      ).toLocaleString()}
                    </h4>

                    {/* POSTED TIME */}

                    {postedTime && (
                      <p className="latest-ad-posted-time">
                        🕒 Posted{" "}
                        {postedTime}
                      </p>
                    )}

                    {/* CITY */}

                    {ad.city && (
                      <p>
                        📍 {ad.city}
                      </p>
                    )}

                    {/* CONDITION */}

                    {ad.condition && (
                      <p>
                        🔄{" "}
                        {ad.condition}
                      </p>
                    )}

                    {/* SUBCATEGORY */}

                    {ad.subcategory && (
                      <p>
                        📂{" "}
                        {ad.subcategory}
                      </p>
                    )}

                    {/* SHORT DESCRIPTION */}

                    <p className="latest-ad-description">
                      {shortDescription}
                    </p>

                    {/* IMAGE COUNT */}

                    {Array.isArray(
                      ad.images
                    ) &&
                      ad.images.length >
                        1 && (

                        <p className="image-count">
                          🖼️{" "}
                          {ad.images.length} images
                        </p>

                      )}

                    {/* VIEW DETAILS */}

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