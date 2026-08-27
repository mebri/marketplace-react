import { Link } from "react-router-dom";

function LatestAds({ latestAds = [] }) {

  return (
    <div className="latest-ads-grid">

      {latestAds.map((ad) => {

        // =========================
        // GET FIRST IMAGE
        // =========================

        const imageUrl =
          Array.isArray(ad.images) &&
          ad.images.length > 0
            ? ad.images[0]
            : ad.image;

        // =========================
        // SHORT DESCRIPTION
        // =========================

        const shortDescription =
          ad.description
            ? ad.description.length > 100
              ? `${ad.description.substring(
                  0,
                  100
                )}...`
              : ad.description
            : "No description available.";

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

                {imageUrl ? (

                  <img
                    src={imageUrl}
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

              {/* CATEGORY */}

              <span className="latest-ad-category">
                {ad.category ||
                  "Advertisement"}
              </span>


              {/* TITLE */}

              <h3>
                {ad.title ||
                  "Untitled Advertisement"}
              </h3>


              {/* PRICE */}

              <h4>
                ETB{" "}
                {Number(
                  ad.price || 0
                ).toLocaleString()}
              </h4>


              {/* CITY */}

              {ad.city && (
                <p>
                  📍 {ad.city}
                </p>
              )}


              {/* CONDITION */}

              {ad.condition && (
                <p>
                  🔄 {ad.condition}
                </p>
              )}


              {/* SUBCATEGORY */}

              {ad.subcategory && (
                <p>
                  📂 {ad.subcategory}
                </p>
              )}


              {/* SHORT DESCRIPTION */}

              <p className="latest-ad-description">
                {shortDescription}
              </p>


              {/* IMAGE COUNT */}

              {Array.isArray(ad.images) &&
                ad.images.length > 1 && (

                  <p className="image-count">
                    🖼️{" "}
                    {ad.images.length} images
                  </p>

                )}


              {/* =========================
                  VIEW DETAILS
              ========================= */}

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
  );
}

export default LatestAds;