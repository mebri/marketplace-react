import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (category) {
      params.set("category", category);
    }

    const query = params.toString();

    navigate(
      query
        ? `/search?${query}`
        : "/search"
    );
  };

  return (
    <section className="hero">

      <div className="hero-content">

        {/* =========================
            TITLE
        ========================= */}

        <h1>የኛ ገበያ</h1>

        <h2>
          Buy • Sell • Rent Across Ethiopia
        </h2>

        <p>
          Find cars, houses, rentals,
          electronics, furniture,
          labor and more anywhere in
          Ethiopia.
        </p>

        {/* =========================
            SEARCH
        ========================= */}

        <form
          className="search-box"
          onSubmit={handleSearch}
        >

          {/* SEARCH TEXT */}

          <input
            type="text"
            placeholder="Search cars, houses, electronics, furniture..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />


          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >

            <option value="">
              All Categories
            </option>

            <option value="Cars">
              🚗 Cars
            </option>

            <option value="Electronics">
              📱 Electronics
            </option>

            <option value="Furniture">
              🛋️ Furniture
            </option>

            <option value="Home">
              🏠 Home
            </option>

            <option value="Labor & Services">
              🛠️ Labor & Services
            </option>

            <option value="ምንአለሽ ተራ">
              🏪 ምንአለሽ ተራ
            </option>

          </select>


          {/* SEARCH BUTTON */}

          <button type="submit">
            🔎 Search
          </button>

        </form>

      </div>

    </section>
  );
}

export default Hero;