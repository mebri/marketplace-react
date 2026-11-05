import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import AnimatedCar from "../components/AnimatedCar";

const categories = [
  { id: "cars", icon: "🚗", title: "Cars", options: [["🚗 New Cars", "/cars?condition=new"], ["🚙 Used Cars", "/cars?condition=used"], ["⚡ Electric Cars", "/cars?condition=electric"], ["🚘 Cars for Rent", "/cars?condition=rent"]] },
  { id: "houses", icon: "🏠", title: "Houses", options: [["🏠 Houses for Sale", "/houses?type=sale"], ["🏠 Houses for Rent", "/houses?type=rent"]] },
  { id: "rentals", icon: "🏢", title: "Rentals", options: [["🏢 Apartments", "/rentals?type=apartment"], ["🏪 Shops", "/rentals?type=shop"], ["🏢 Offices", "/rentals?type=office"]] },
  { id: "electronics", icon: "📱", title: "Electronics", options: [["📱 New Phones", "/search?category=Electronics&subcategory=Phones&condition=new"], ["📱 Used Phones", "/search?category=Electronics&subcategory=Phones&condition=used"], ["💻 New Computers & Laptops", "/search?category=Electronics&subcategory=Computers&condition=new"], ["💻 Used Computers & Laptops", "/search?category=Electronics&subcategory=Computers&condition=used"], ["📺 New TVs", "/search?category=Electronics&subcategory=TVs&condition=new"], ["📺 Used TVs", "/search?category=Electronics&subcategory=TVs&condition=used"], ["🎧 Audio & Accessories", "/search?category=Electronics&subcategory=Audio"], ["🔌 Other Electronics", "/search?category=Electronics&subcategory=Other"]] },
  { id: "furniture", icon: "🛋️", title: "Furniture", options: [["🛋️ Sofas", "/search?category=Furniture&subcategory=Sofas"], ["🛏️ Beds", "/search?category=Furniture&subcategory=Beds"], ["🪑 Chairs & Tables", "/search?category=Furniture&subcategory=Chairs%20and%20Tables"], ["🗄️ Cabinets", "/search?category=Furniture&subcategory=Cabinets"], ["🪞 Other Furniture", "/search?category=Furniture&subcategory=Other"]] },
  { id: "labor", icon: "👷", title: "Labor & Services", options: [["👷 Construction Worker", "/search?category=Labor%20%26%20Services&subcategory=Construction"], ["⚡ Electrician", "/search?category=Labor%20%26%20Services&subcategory=Electrician"], ["🚰 Plumber", "/search?category=Labor%20%26%20Services&subcategory=Plumber"], ["🎨 Painter", "/search?category=Labor%20%26%20Services&subcategory=Painter"], ["🧹 Cleaning", "/search?category=Labor%20%26%20Services&subcategory=Cleaning"], ["🚚 Moving & Transport", "/search?category=Labor%20%26%20Services&subcategory=Moving"], ["🔧 Other Services", "/search?category=Labor%20%26%20Services&subcategory=Other"]] },
  { id: "min-alish-tera", icon: "🏪", title: "ምንአለሽ ተራ", options: [["📦 Used Items", "/search?category=ምንአለሽ%20ተራ&subcategory=Items"], ["♻️ Second-Hand Goods", "/search?category=ምንአለሽ%20ተራ&subcategory=Other"]] },
];

function adTime(ad) {
  const createdAt = ad?.createdAt;
  if (!createdAt) return 0;
  if (typeof createdAt.toMillis === "function") return createdAt.toMillis();
  if (typeof createdAt === "object" && createdAt.seconds) return createdAt.seconds * 1000;
  const date = new Date(createdAt).getTime();
  return Number.isNaN(date) ? 0 : date;
}

function postedTime(createdAt) {
  if (!createdAt) return "";
  const date = typeof createdAt.toDate === "function" ? createdAt.toDate() : createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  const difference = Date.now() - date.getTime();
  if (difference < 0 || difference < 60000) return "Just now";
  const minutes = Math.floor(difference / 60000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Home() {
  const [openCategory, setOpenCategory] = useState(null);
  const [latestAds, setLatestAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);

  useEffect(() => {
    const loadLatestAds = async () => {
      try {
        const snapshot = await getDocs(collection(db, "ads"));
        const ads = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
        ads.sort((a, b) => adTime(b) - adTime(a));
        setLatestAds(ads);
      } catch (error) {
        console.error("Error loading latest advertisements:", error);
      } finally {
        setAdsLoading(false);
      }
    };
    loadLatestAds();
  }, []);

  return (
    <main className="home-page">
      <section className="home-hero">
        <h1>የኛ ገበያ</h1>
        <h2>Buy • Sell • Rent Across Ethiopia</h2>
        <p>Find cars, houses, rentals, electronics, furniture, labor and more anywhere in Ethiopia.</p>
        <div className="home-search">
          <input type="text" placeholder="🔎 Search cars, houses, furniture, labor and more..." onKeyDown={(event) => {
            if (event.key === "Enter") {
              const value = event.target.value.trim();
              window.location.hash = value ? `/search?search=${encodeURIComponent(value)}` : "/search";
            }
          }} />
          <Link to="/search" className="home-search-button">🔎 Search</Link>
        </div>
      </section>

      <section className="home-categories">
        <h2 className="home-section-title">All Categories</h2>
        <div className="home-category-scroll">
          {categories.map((category) => (
            <button key={category.id} type="button" className={`home-category-circle-item ${openCategory === category.id ? "active" : ""}`} onClick={() => setOpenCategory(openCategory === category.id ? null : category.id)}>
              <div className="home-main-circle">{category.icon}</div>
              <div className="home-main-category-name">{category.title}</div>
            </button>
          ))}
        </div>
        {openCategory && (
          <div className="home-selected-options">
            {categories.filter((category) => category.id === openCategory).map((category) => (
              <div key={category.id} className="home-options-box">
                <h3>{category.title}</h3>
                <div className="home-options-list">
                  {category.options.map(([name, link]) => <Link key={name} to={link} className="home-option-button">{name}</Link>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ marginTop: "15px", marginBottom: "-5px" }}>
        <AnimatedCar speed={6} />
      </div>

      <section className="latest-ads-section">
        <div className="latest-ads-header">
          <div>
            <h2>🆕 Latest Advertisements</h2>
            <p>Recently posted items on የኛ ገበያ</p>
          </div>
          <Link to="/search" className="view-all-ads">View All →</Link>
        </div>
        {adsLoading ? (
          <div className="latest-ads-loading"><h3>Loading advertisements...</h3></div>
        ) : latestAds.length === 0 ? (
          <div className="latest-ads-empty">
            <h3>No advertisements yet.</h3>
            <p>Be the first person to post an advertisement.</p>
            <Link to="/post-ad">📢 Post Advertisement</Link>
          </div>
        ) : (
          <div className="latest-ads-grid">
            {latestAds.map((ad) => {
              const adImage = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : ad.image;
              const description = ad.description ? ad.description.length > 100 ? `${ad.description.substring(0, 100)}...` : ad.description : "No description available.";
              const time = postedTime(ad.createdAt);
              return (
                <div className="latest-ad-card" key={ad.id}>
                  <Link to={`/ad/${ad.id}`} className="latest-ad-image-link" aria-label={`View ${ad.title || "Advertisement"}`}>
                    <div className="latest-ad-image">
                      {adImage ? <img src={adImage} alt={ad.title || "Advertisement"} loading="lazy" className="latest-ad-photo" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="latest-no-image">📷 No Image</div>}
                    </div>
                  </Link>
                  <div className="latest-ad-info">
                    <span className="latest-ad-category">{ad.category || "Advertisement"}</span>
                    <h3>{ad.title || "Untitled Advertisement"}</h3>
                    <h4>ETB {Number(ad.price || 0).toLocaleString()}</h4>
                    {time && <p className="latest-ad-posted-time">🕒 Posted {time}</p>}
                    {ad.city && <p>📍 {ad.city}</p>}
                    {ad.condition && <p>🔄 {ad.condition}</p>}
                    {ad.subcategory && <p>📂 {ad.subcategory}</p>}
                    <p className="latest-ad-description">{description}</p>
                    {Array.isArray(ad.images) && ad.images.length > 1 && <p className="image-count">🖼️ {ad.images.length} images</p>}
                    <Link to={`/ad/${ad.id}`} className="latest-view-button">👁 View Details</Link>
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
