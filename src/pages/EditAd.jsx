import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // TEXT FIELDS
  // =========================
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [type, setType] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // =========================
  // IMAGES
  // =========================

  // Images already stored in Firestore
  const [existingImages, setExistingImages] = useState([]);

  // New files selected from computer
  const [newImages, setNewImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD ADVERTISEMENT
  // =========================

  useEffect(() => {
    loadAd();
  }, [id]);

  const loadAd = async () => {
    try {
      setLoading(true);

      const adRef = doc(db, "ads", id);
      const adSnap = await getDoc(adRef);

      if (!adSnap.exists()) {
        alert("Advertisement not found.");
        navigate("/my-ads");
        return;
      }

      const ad = adSnap.data();

      // =========================
      // SECURITY CHECK
      // =========================

      if (
        auth.currentUser &&
        ad.userId &&
        ad.userId !== auth.currentUser.uid
      ) {
        alert("You can only edit your own advertisements.");
        navigate("/my-ads");
        return;
      }

      // =========================
      // LOAD TEXT
      // =========================

      setTitle(ad.title || "");
      setPrice(ad.price || "");
      setCity(ad.city || "");
      setCategory(ad.category || "");
      setCondition(ad.condition || "");
      setType(ad.type || "");
      setSubcategory(ad.subcategory || "");
      setMaterialType(ad.materialType || "");
      setPhone(ad.phone || "");
      setDescription(ad.description || "");

      // =========================
      // LOAD IMAGES
      // =========================

      let loadedImages = [];

      if (Array.isArray(ad.images) && ad.images.length > 0) {
        loadedImages = ad.images.filter(Boolean);
      }

      // Old advertisements may only have "image"
      if (
        loadedImages.length === 0 &&
        ad.image
      ) {
        loadedImages = [ad.image];
      }

      // Remove duplicate URLs
      loadedImages = [...new Set(loadedImages)];

      setExistingImages(loadedImages);

    } catch (error) {
      console.error("Error loading advertisement:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REMOVE EXISTING IMAGE
  // =========================

  const removeExistingImage = (index) => {
    setExistingImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // =========================
  // SELECT NEW IMAGES
  // =========================

  const handleNewImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const availableSlots =
      10 - existingImages.length;

    if (availableSlots <= 0) {
      alert("You already have 10 images.");
      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(
      0,
      availableSlots
    );

    if (selectedFiles.length > availableSlots) {
      alert(
        `You can have a maximum of 10 images. Only ${availableSlots} image(s) were added.`
      );
    }

    setNewImages((current) => [
      ...current,
      ...filesToAdd,
    ]);

    event.target.value = "";
  };

  // =========================
  // REMOVE NEW IMAGE
  // =========================

  const removeNewImage = (index) => {
    setNewImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // =========================
  // UPLOAD IMAGE TO CLOUDINARY
  // =========================

  const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      "yeegna_uploads"
    );

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/lisqr7zn/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      throw new Error(
        data.error?.message ||
          "Cloudinary image upload failed."
      );
    }

    return data.secure_url;
  };

  // =========================
  // UPDATE AD
  // =========================

  const updateAd = async (event) => {
    event.preventDefault();

    if (!auth.currentUser) {
      alert("Please log in first.");
      return;
    }

    // Must have at least one image
    if (
      existingImages.length === 0 &&
      newImages.length === 0
    ) {
      alert("Please keep or add at least one image.");
      return;
    }

    try {
      setSaving(true);

      // =========================
      // UPLOAD NEW IMAGES
      // =========================

      const uploadedImages = [];

      for (const file of newImages) {
        const url = await uploadImage(file);
        uploadedImages.push(url);
      }

      // =========================
      // COMBINE OLD + NEW
      // =========================

      const allImages = [
        ...existingImages,
        ...uploadedImages,
      ].slice(0, 10);

      if (allImages.length === 0) {
        throw new Error(
          "The advertisement must have at least one image."
        );
      }

      // First image is the main image
      const mainImage = allImages[0];

      // =========================
      // UPDATE FIRESTORE
      // =========================

      const adRef = doc(db, "ads", id);

      await updateDoc(adRef, {
        title: title.trim(),
        price: price.trim(),
        city: city.trim(),
        category,
        condition,
        type,
        subcategory: subcategory.trim(),
        materialType: materialType.trim(),
        phone: phone.trim(),
        description: description.trim(),

        // Main image
        image: mainImage,

        // All images
        images: allImages,
      });

      alert(
        "Advertisement updated successfully!"
      );

      navigate("/my-ads");

    } catch (error) {
      console.error(
        "Advertisement update error:",
        error
      );

      alert(
        error.message ||
          "Could not update advertisement."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="edit-ad-page">
        <div className="edit-loading">
          <h2>Loading Advertisement...</h2>
        </div>
      </div>
    );
  }

  // =========================
  // TOTAL IMAGE COUNT
  // =========================

  const totalImages =
    existingImages.length + newImages.length;

  // =========================
  // PAGE
  // =========================

  return (
    <div className="edit-ad-page">

      <div className="edit-ad-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="edit-ad-header">

          <div>
            <h1>
              ✏️ Edit Advertisement
            </h1>

            <p>
              Update your advertisement information
              and images.
            </p>
          </div>

          <button
            type="button"
            className="edit-back-button"
            onClick={() =>
              navigate("/my-ads")
            }
          >
            ← Back to My Ads
          </button>

        </div>

        {/* =========================
            FORM
        ========================= */}

        <form
          className="edit-ad-form"
          onSubmit={updateAd}
        >

          {/* =========================
              IMAGES
          ========================= */}

          <section className="edit-section">

            <div className="edit-section-title">

              <div>
                <h2>
                  🖼️ Advertisement Images
                </h2>

                <p>
                  You can have up to 10 images.
                </p>
              </div>

              <strong className="image-count">
                {totalImages} / 10
              </strong>

            </div>

            {/* IMAGE GRID */}

            <div className="edit-image-grid">

              {/* EXISTING IMAGES */}

              {existingImages.map(
                (image, index) => (
                  <div
                    className="edit-image-card"
                    key={`${image}-${index}`}
                  >

                    <img
                      src={image}
                      alt={`Advertisement ${index + 1}`}
                    />

                    {index === 0 && (
                      <span className="main-image-label">
                        Main Image
                      </span>
                    )}

                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() =>
                        removeExistingImage(index)
                      }
                    >
                      ×
                    </button>

                  </div>
                )
              )}

              {/* NEW IMAGES */}

              {newImages.map(
                (file, index) => (
                  <div
                    className="edit-image-card"
                    key={`${file.name}-${index}`}
                  >

                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                    />

                    <span className="new-image-label">
                      New
                    </span>

                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() =>
                        removeNewImage(index)
                      }
                    >
                      ×
                    </button>

                  </div>
                )
              )}

              {/* ADD IMAGE BUTTON */}

              {totalImages < 10 && (
                <label className="add-image-card">

                  <span className="add-image-icon">
                    +
                  </span>

                  <strong>
                    Add Image
                  </strong>

                  <small>
                    {10 - totalImages} slot(s)
                    remaining
                  </small>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImages}
                  />

                </label>
              )}

            </div>

            <p className="image-help">
              JPG, PNG or WEBP images are supported.
              Maximum 10 images.
            </p>

          </section>

          {/* =========================
              BASIC INFORMATION
          ========================= */}

          <section className="edit-section">

            <h2>
              📋 Advertisement Information
            </h2>

            <div className="edit-form-grid">

              {/* TITLE */}

              <div className="edit-field full-width">

                <label>
                  Advertisement Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Example: Toyota Yaris 2020"
                  required
                />

              </div>

              {/* PRICE */}

              <div className="edit-field">

                <label>
                  Price (ETB)
                </label>

                <input
  type="text"
  inputMode="numeric"
  placeholder="Price (ETB)"
  value={
    price
      ? Number(
          String(price).replace(/,/g, "")
        ).toLocaleString()
      : ""
  }
  onChange={(e) => {
    const value = e.target.value.replace(
      /,/g,
      ""
    );

    if (/^\d*$/.test(value)) {
      setPrice(value);
    }
  }}
  required
/>

              </div>

              {/* CITY */}

              <div className="edit-field">

                <label>
                  City
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="Example: Addis Ababa"
                  required
                />

              </div>

              {/* CATEGORY */}

              <div className="edit-field">

                <label>
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  required
                >

                  <option value="">
                    Select Category
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

              </div>

              {/* CONDITION */}

              <div className="edit-field">

                <label>
                  Condition
                </label>

                <select
                  value={condition}
                  onChange={(e) =>
                    setCondition(e.target.value)
                  }
                >

                  <option value="">
                    Select Condition
                  </option>

                  <option value="New">
                    New
                  </option>

                  <option value="Used">
                    Used
                  </option>

                  <option value="Like New">
                    Like New
                  </option>

                </select>

              </div>

              {/* TYPE */}

              <div className="edit-field">

                <label>
                  Type
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value)
                  }
                >

                  <option value="">
                    Select Type
                  </option>

                  <option value="sale">
                    Sale
                  </option>

                  <option value="rent">
                    Rent
                  </option>

                </select>

              </div>

              {/* SUBCATEGORY */}

              <div className="edit-field">

                <label>
                  Subcategory
                </label>

                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) =>
                    setSubcategory(e.target.value)
                  }
                  placeholder="Example: Toyota, Apartment..."
                />

              </div>

              {/* MATERIAL TYPE */}

              <div className="edit-field">

                <label>
                  Material Type
                </label>

                <input
                  type="text"
                  value={materialType}
                  onChange={(e) =>
                    setMaterialType(e.target.value)
                  }
                  placeholder="Material type"
                />

              </div>

              {/* PHONE */}

              <div className="edit-field">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="09XXXXXXXX"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="edit-field full-width">

                <label>
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe your advertisement..."
                  rows="8"
                  required
                />

              </div>

            </div>

          </section>

          {/* =========================
              BUTTONS
          ========================= */}

          <div className="edit-form-actions">

            <button
              type="button"
              className="cancel-edit-button"
              onClick={() =>
                navigate("/my-ads")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-edit-button"
              disabled={saving}
            >
              {saving
                ? "⏳ Saving..."
                : "💾 Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditAd;