import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import {
  Link,
  useSearchParams,
} from "react-router-dom";
import { db } from "../firebase/firebase";

function Cars() {
  const [searchParams] = useSearchParams();

  const selectedCondition =
    searchParams.get("condition") || "";

  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD CARS
  // =========================

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const carAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter(
          (ad) => ad.category === "Cars"
        );

      setCars(carAds);
    } catch (error) {
      console.error(
        "Error loading cars:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CONDITION FILTER
  // =========================

  const conditionFilteredCars =
    cars.filter((car) => {
      if (!selectedCondition) {
        return true;
      }

      return (
        car.condition?.toLowerCase() ===
        selectedCondition.toLowerCase()
      );
    });

  // =========================
  // SEARCH
  // =========================

  const filteredCars =
    conditionFilteredCars.filter((car) => {
      const text =
        search.toLowerCase().trim();

      if (!text) {
        return true;
      }

      return (
        car.title
          ?.toLowerCase()
          .includes(text) ||
        car.city
          ?.toLowerCase()
          .includes(text) ||
        car.description
          ?.toLowerCase()
          .includes(text)
      );
    });

 
// =========================
// SORT
// =========================

const getAdTime = (ad) => {
  if (!ad.createdAt) return 0;

  // Firestore Timestamp
  if (
    typeof ad.createdAt.toMillis === "function"
  ) {
    return ad.createdAt.toMillis();
  }

  // Firestore timestamp object
  if (ad.createdAt.seconds) {
    return ad.createdAt.seconds * 1000;
  }

  // JavaScript Date
  if (ad.createdAt instanceof Date) {
    return ad.createdAt.getTime();
  }

  // String / number
  const date = new Date(
    ad.createdAt
  ).getTime();

  return Number.isNaN(date) ? 0 : date;
};

const sortedCars = [...filteredCars].sort(
  (a, b) => {

    const priceA =
      Number(a.price) || 0;

    const priceB =
      Number(b.price) || 0;

    const timeA = getAdTime(a);
    const timeB = getAdTime(b);

    // Newest first
    if (sort === "newest") {
      return timeB - timeA;
    }

    // Oldest first
    if (sort === "oldest") {
      return timeA - timeB;
    }

    // Cheapest first
    if (sort === "low") {
      return priceA - priceB;
    }

    // Most expensive first
    if (sort === "high") {
      return priceB - priceA;
    }

    // Default = newest first
    return timeB - timeA;
  }
);

  // =========================
  // PAGE TITLE
  // =========================

  let pageTitle = "🚗 Cars";

  if (
    selectedCondition.toLowerCase() ===
    "new"
  ) {
    pageTitle = "🚗 New Cars";
  }

  if (
    selectedCondition.toLowerCase() ===
    "used"
  ) {
    pageTitle = "🚙 Used Cars";
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Loading Cars...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      {/* =========================
          TITLE
      ========================= */}

      <h1>{pageTitle}</h1>


      {/* =========================
          SEARCH + SORT
      ========================= */}

      <div className="cars-controls">

        <input
          className="car-search"
          type="text"
          placeholder="🔎 Search car, city, description..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

       <select
  value={sort}
  onChange={(e) =>
    setSort(e.target.value)
  }
>
  <option value="newest">
    🕐 Newest → Oldest
  </option>

  <option value="oldest">
    🕐 Oldest → Newest
  </option>

  <option value="low">
    💰 Price: Low → High
  </option>

  <option value="high">
    💰 Price: High → Low
  </option>
</select> 

      </div>


      {/* =========================
          RESULT COUNT
      ========================= */}

      <p className="cars-result-count">
        {sortedCars.length} car(s) found
      </p>


      {/* =========================
          CARS
      ========================= */}

      <div className="cars-grid">

        {sortedCars.length === 0 ? (

          <div className="cars-no-results">

            <h2>
              No cars found.
            </h2>

            <p>
              Try another search or condition.
            </p>

          </div>

        ) : (

          sortedCars.map((car) => {

            // =========================
            // GET FIRST IMAGE
            // =========================

            const imageUrl =
              Array.isArray(car.images) &&
              car.images.length > 0
                ? car.images[0]
                : car.image;

            // =========================
            // SHORT DESCRIPTION
            // =========================

            const shortDescription =
              car.description
                ? car.description.length > 100
                  ? `${car.description.substring(
                      0,
                      100
                    )}...`
                  : car.description
                : "No description available.";

            return (

              <div
                className="car-card"
                key={car.id}
              >

                {/* =========================
                    CLICKABLE IMAGE
                ========================= */}

                <Link
                  to={`/ad/${car.id}`}
                  className="car-image-link"
                >

                  <div className="listing-image">

                    {imageUrl ? (

                      <img
                        src={imageUrl}
                        alt={
                          car.title ||
                          "Car"
                        }
                        className="listing-photo"
                        loading="lazy"
                      />

                    ) : (

                      <div className="no-image">
                        📷 No Image
                      </div>

                    )}

                  </div>

                </Link>


                {/* =========================
                    INFORMATION
                ========================= */}

                <div className="car-info">

                  <span className="category">
                    🚗 Cars
                  </span>


                  <h3>
                    {car.title ||
                      "Untitled Car"}
                  </h3>


                  {/* PRICE */}

                  <h2>
                    ETB{" "}
                    {Number(
                      car.price || 0
                    ).toLocaleString()}
                  </h2>


                  {/* CONDITION */}

                  {car.condition && (
                    <p>
                      🔄 Condition:{" "}
                      {car.condition}
                    </p>
                  )}


                  {/* CITY */}

                  {car.city && (
                    <p>
                      📍 {car.city}
                    </p>
                  )}


                  {/* SHORT DESCRIPTION */}

                  <p className="car-description">
                    {shortDescription}
                  </p>


                  {/* =========================
                      VIEW DETAILS
                  ========================= */}

                  <Link
                    to={`/ad/${car.id}`}
                    className="car-details-button"
                  >
                    👁 View Details
                  </Link>


                  {/* =========================
                      CALL SELLER
                  ========================= */}

                  {car.phone && (

                    <a
                      href={`tel:${car.phone}`}
                      className="phone-link"
                    >
                      📞 Call Seller
                    </a>

                  )}

                </div>

              </div>

            );
          })

        )}

      </div>

    </div>
  );
}

export default Cars;