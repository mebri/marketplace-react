function Categories() {
  const categories = [
    { icon: "🚗", title: "Cars", ads: "2,450 Ads" },
    
    { icon: "🏠", title: "Houses", ads: "1,180 Ads" },
    { icon: "🏢", title: "Rentals", ads: "860 Ads" },
    { icon: "🔧", title: "Spare Parts", ads: "940 Ads" },
    { icon: "🧱", title: "Building Materials", ads: "720 Ads" },
    { icon: "📱", title: "Electronics", ads: "1,320 Ads" }
  ];
<div
  className="category-card"
  onClick={() => window.location.href = "/minalesh-tera"}
>
  <div className="category-icon">🏪</div>

  <h3>ምንአለሽ ተራ</h3>

  <p>Used & reusable materials</p>
</div>
  return (
    <section className="categories">
      <h2>Browse Categories</h2>

      <div className="category-grid">
        {categories.map((category, index) => (
          <div className="category-card" key={index}>
            <div className="category-icon">{category.icon}</div>

            <h3>{category.title}</h3>

            <p>{category.ads}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;