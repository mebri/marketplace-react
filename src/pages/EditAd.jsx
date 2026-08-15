import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Image states
  const [oldImage, setOldImage] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAd();
  }, [id]);

  const loadAd = async () => {
    try {
      const docRef = doc(db, "ads", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Advertisement not found.");
        navigate("/my-ads");
        return;
      }

      const ad = docSnap.data();

      setTitle(ad.title || "");
      setPrice(ad.price || "");
      setCity(ad.city || "");
      setCategory(ad.category || "");
      setDescription(ad.description || "");
      setOldImage(ad.image || "");

      setLoading(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
    }
  };

  const updateAd = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please log in first.");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = oldImage;

      // Upload new image if user selected one
      if (newImage) {
        const formData = new FormData();

        formData.append("file", newImage);
        formData.append("upload_preset", "yeegna_uploads");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/lisqr7zn/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        console.log("Cloudinary Response:", data);

        if (!response.ok || !data.secure_url) {
          throw new Error(
            data.error?.message || "Image upload failed."
          );
        }

        imageUrl = data.secure_url;
      }

      // Update Firestore
      await updateDoc(doc(db, "ads", id), {
        title,
        price,
        city,
        category,
        description,
        image: imageUrl,
      });

      alert("Advertisement updated successfully!");

      navigate("/my-ads");

    } catch (error) {
      console.error("Update error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="post-ad-page">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="post-ad-page">

      <h1>✏️ Edit Advertisement</h1>

      <form className="post-form" onSubmit={updateAd}>

        {/* Current Image */}
        {oldImage && (
          <div>
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
              Current Image
            </p>

            <img
              src={oldImage}
              alt={title}
              style={{
                width: "100%",
                maxHeight: "350px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        )}

        {/* New Image */}
        <label style={{ fontWeight: "bold" }}>
          Change Image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files[0])}
        />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          required
        />

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="Cars">Cars</option>
          <option value="Houses">Houses</option>
          <option value="Rentals">Rentals</option>
          <option value="Spare Parts">Spare Parts</option>
          <option value="Building Materials">
            Building Materials
          </option>
          <option value="Electronics">Electronics</option>
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows="5"
          required
        />

        <button
          type="submit"
          disabled={saving}
          style={{
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>

      </form>

    </div>
  );
}

export default EditAd;