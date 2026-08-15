import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";
function FeaturedListings() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    const snapshot = await getDocs(collection(db, "ads"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setAds(data);
  };

  return (
    <section className="featured">
      <h2>Latest Advertisements</h2>

      <div className="listing-grid">
        {ads.length === 0 ? (
          <p>No advertisements found.</p>
        ) : (
          ads.map((ad) => (
            <div className="listing-card" key={ad.id}>

              <div className="listing-image">
  {ad.image ? (
    <img
      src={ad.image}
      alt={ad.title}
      className="listing-photo"
    />
  ) : (
    <div className="no-image">📷 No Image</div>
  )}
</div>
                
          

              <div className="listing-info">

                <span className="category">
                  {ad.category}
                </span>

                <h3>{ad.title}</h3>

                <h2>ETB {ad.price}</h2>

                <p>📍 {ad.city}</p>

                <p>{ad.description}</p>

               <Link to={`/ad/${ad.id}`}>
  <button>View Details</button>
</Link> 
                

              </div>

            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default FeaturedListings;