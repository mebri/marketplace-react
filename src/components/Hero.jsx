import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    navigate(
      `/search?search=${encodeURIComponent(
        search
      )}&category=${encodeURIComponent(category)}`
    );
  };

  return (
    <section className="hero">

      <div className="hero-content">

        <h1>የኛ ገበያ</h1>

        <h2>
          Buy • Sell • Rent Across Ethiopia
        </h2>

        <p>
          Find cars, houses, rentals, spare parts,
          building materials and more anywhere in
          Ethiopia.
        </p>

        <form
          className="search-box"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            placeholder="Search cars, houses, spare parts..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

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

            <option value="Houses">
              🏠 Houses
            </option>

            <option value="Rentals">
              🏢 Rentals
            </option>

            <option value="Spare Parts">
              🔧 Spare Parts
            </option>

            <option value="Building Materials">
              🧱 Building Materials
            </option>

            <option value="Electronics">
              📱 Electronics
            </option>

            <option value="ምንአለሽ ተራ">
              🏪 ምንአለሽ ተራ
            </option>

          </select>

          <button type="submit">
            🔎 Search
          </button>

        </form>

      </div>

    </section>
  );
}

export default Hero;