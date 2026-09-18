import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";

const DRAFT_KEY = "post_ad_draft";

function PostAd() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");

  const [images, setImages] = useState([]);

  const [condition, setCondition] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [type, setType] = useState("");
  const [furnitureType, setFurnitureType] = useState("");
  const [laborType, setLaborType] = useState("");

  const [uploading, setUploading] = useState(false);

  // =========================
  // DRAFT STATE
  // =========================
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const saveTimerRef = useRef(null);

  // =========================
  // LOAD DRAFT ON MOUNT
  // =========================
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;

      const draft = JSON.parse(saved);

      // Only restore if there's meaningful data
      const hasData =
        draft.title ||
        draft.price ||
        draft.city ||
        draft.category ||
        draft.description ||
        draft.phone;

      if (!hasData) return;

      if (draft.title) setTitle(draft.title);
      if (draft.price) setPrice(draft.price);
      if (draft.city) setCity(draft.city);
      if (draft.category) setCategory(draft.category);
      if (draft.description) setDescription(draft.description);
      if (draft.phone) setPhone(draft.phone);
      if (draft.whatsapp) setWhatsapp(draft.whatsapp);
      if (draft.telegram) setTelegram(draft.telegram);
      if (draft.condition) setCondition(draft.condition);
      if (draft.subcategory) setSubcategory(draft.subcategory);
      if (draft.type) setType(draft.type);
      if (draft.furnitureType) setFurnitureType(draft.furnitureType);
      if (draft.laborType) setLaborType(draft.laborType);

      setDraftRestored(true);

      // Auto-hide the restored message after 5 seconds
      setTimeout(() => setDraftRestored(false), 5000);
    } catch (err) {
      console.error("Draft restore error:", err);
    }
  }, []);

  // =========================
  // AUTO-SAVE DRAFT (debounced)
  // =========================
  useEffect(() => {
    // Skip the very first render if nothing has been typed yet
    const hasAnyData =
      title || price || city || category || description || phone;

    if (!hasAnyData) return;

    clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      try {
        const draft = {
          title,
          price,
          city,
          category,
          description,
          phone,
          whatsapp,
          telegram,
          condition,
          subcategory,
          type,
          furnitureType,
          laborType,
          savedAt: new Date().toISOString(),
        };

        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

        // Show the "Draft saved" indicator briefly
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch (err) {
        console.error("Draft save error:", err);
      }
    }, 1000);

    return () => clearTimeout(saveTimerRef.current);
  }, [
    title,
    price,
    city,
    category,
    description,
    phone,
    whatsapp,
    telegram,
    condition,
    subcategory,
    type,
    furnitureType,
    laborType,
  ]);

  // =========================
  // CLEAR DRAFT
  // =========================
  const clearDraft = () => {
    if (!window.confirm("Clear your saved draft?")) return;

    localStorage.removeItem(DRAFT_KEY);

    // Reset all fields
    setTitle("");
    setPrice("");
    setCity("");
    setCategory("");
    setDescription("");
    setPhone("");
    setWhatsapp("");
    setTelegram("");
    setImages([]);
    setCondition("");
    setSubcategory("");
    setType("");
    setFurnitureType("");
    setLaborType("");

    const fileInput = document.getElementById("ad-images");
    if (fileInput) fileInput.value = "";

    setDraftRestored(false);
    setDraftSaved(false);
  };

  // =========================
  // IMAGE SELECTION
  // =========================
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 10) {
      alert("You can select a maximum of 10 images.");
      e.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFile) {
      alert("Please select image files only.");
      e.target.value = "";
      return;
    }

    const tooLarge = selectedFiles.find(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (tooLarge) {
      alert("Each image must be 10 MB or smaller.");
      e.target.value = "";
      return;
    }

    setImages(selectedFiles);
  };

  const removeImage = (index) => {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setCondition("");
    setSubcategory("");
    setType("");
    setFurnitureType("");
    setLaborType("");
  };

  const formatPrice = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString();
  };

  // =========================
  // SUBMIT ADVERTISEMENT
  // =========================
  const submitAd = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please log in before posting an advertisement.");
      return;
    }

    if (images.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    if (images.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    try {
      setUploading(true);

      const imageUrls = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "yeegna_uploads");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/lisqr7zn/image/upload",
          { method: "POST", body: formData }
        );

        const data = await response.json();

        if (!response.ok || !data.secure_url) {
          throw new Error(
            data.error?.message || `Failed to upload image ${i + 1}.`
          );
        }

        imageUrls.push(data.secure_url);
      }

      await addDoc(collection(db, "ads"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "",
        title: title.trim(),
        price: price.replace(/,/g, ""),
        city: city.trim(),
        category,
        description: description.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        telegram: telegram.trim(),
        image: imageUrls.length > 0 ? imageUrls[0] : "",
        images: imageUrls,
        condition,
        subcategory,
        type,
        furnitureType: category === "Furniture" ? furnitureType : "",
        laborType: category === "Labor & Services" ? laborType : "",
        createdAt: serverTimestamp(),
      });

      alert("Advertisement posted successfully! 🎉");

      // CLEAR DRAFT AFTER SUCCESS
      localStorage.removeItem(DRAFT_KEY);

      // CLEAR FORM
      setTitle("");
      setPrice("");
      setCity("");
      setCategory("");
      setDescription("");
      setPhone("");
      setWhatsapp("");
      setTelegram("");
      setImages([]);
      setCondition("");
      setSubcategory("");
      setType("");
      setFurnitureType("");
      setLaborType("");

      const fileInput = document.getElementById("ad-images");
      if (fileInput) fileInput.value = "";

      setDraftRestored(false);
      setDraftSaved(false);
    } catch (error) {
      console.error("Post advertisement error:", error);
      alert(
        error.message ||
          "Something went wrong while posting the advertisement."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="post-ad-page">
      <h1>📢 Post Advertisement</h1>

      {/* DRAFT STATUS BANNER */}
      {draftRestored && (
        <div className="draft-banner draft-restored">
          📝 Draft restored from your last session. Don't forget to re-select
          your images!
          <button
            type="button"
            className="draft-banner-close"
            onClick={() => setDraftRestored(false)}
          >
            ✕
          </button>
        </div>
      )}

      {draftSaved && !draftRestored && (
        <div className="draft-banner draft-saved">💾 Draft saved</div>
      )}

      <form className="post-form" onSubmit={submitAd}>
        <input
          type="text"
          placeholder="Advertisement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select
          value={category}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Cars">🚗 Cars</option>
          <option value="Houses">🏠 Houses</option>
          <option value="Rentals">🏢 Rentals</option>
          <option value="Electronics">📱 Electronics</option>
          <option value="Furniture">🛋️ Furniture</option>
          <option value="Labor & Services">👷 Labor & Services</option>
          <option value="ምንአለሽ ተራ">🏪 ምንአለሽ ተራ</option>
        </select>

        {category === "Cars" && (
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          >
            <option value="">Select Car Type</option>
            <option value="New">🚗 New Car</option>
            <option value="Used">🚙 Used Car</option>
            <option value="Electric">⚡ Electric Car</option>
            <option value="Rent">🚘 Car for Rent</option>
          </select>
        )}

        {category === "Electronics" && (
          <>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              required
            >
              <option value="">Select Electronics Type</option>
              <option value="Phones">📱 Phones</option>
              <option value="Computers">💻 Computers & Laptops</option>
              <option value="TVs">📺 TVs</option>
              <option value="Audio">🎧 Audio & Accessories</option>
              <option value="Other">🔌 Other Electronics</option>
            </select>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </>
        )}

        {category === "Furniture" && (
          <>
            <select
              value={furnitureType}
              onChange={(e) => setFurnitureType(e.target.value)}
              required
            >
              <option value="">Select Furniture Type</option>
              <option value="Sofas">🛋️ Sofas</option>
              <option value="Beds">🛏️ Beds</option>
              <option value="Chairs and Tables">🪑 Chairs & Tables</option>
              <option value="Cabinets">🗄️ Cabinets</option>
              <option value="Other">🪞 Other Furniture</option>
            </select>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="">Select Condition</option>
              <option value="New">New Furniture</option>
              <option value="Used">Used Furniture</option>
            </select>
          </>
        )}

        {category === "Labor & Services" && (
          <select
            value={laborType}
            onChange={(e) => setLaborType(e.target.value)}
            required
          >
            <option value="">Select Service</option>
            <option value="Construction">👷 Construction Worker</option>
            <option value="Electrician">⚡ Electrician</option>
            <option value="Plumber">🚰 Plumber</option>
            <option value="Painter">🎨 Painter</option>
            <option value="Cleaning">🧹 Cleaning</option>
            <option value="Moving">🚚 Moving & Transport</option>
            <option value="Other">🔧 Other Services</option>
          </select>
        )}

        {category === "ምንአለሽ ተራ" && (
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          >
            <option value="">Select Condition</option>
            <option value="Used">Used</option>
            <option value="Like New">Like New</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        )}

        {category === "Houses" && (
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select House Type</option>
            <option value="sale">🏠 House for Sale</option>
            <option value="rent">🏠 House for Rent</option>
          </select>
        )}

        {category === "Rentals" && (
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Rental Type</option>
            <option value="apartment">🏢 Apartment</option>
            <option value="shop">🏪 Shop</option>
            <option value="office">🏢 Office</option>
          </select>
        )}

        <input
          type="text"
          inputMode="numeric"
          placeholder="Price (ETB)"
          value={formatPrice(price)}
          onChange={(e) => {
            const value = e.target.value.replace(/,/g, "");
            if (/^\d*$/.test(value)) {
              setPrice(value);
            }
          }}
          required
        />

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <h3 className="contact-section-title">
          📞 Seller Contact Information
        </h3>

        <input
          type="tel"
          placeholder="📞 Phone Number (+251...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="💬 WhatsApp Number (+251...)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />

        <input
          type="text"
          placeholder="✈️ Telegram Username or Phone Number"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
        />

        <textarea
          placeholder="Description"
          rows="5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="post-images-section">
          <label htmlFor="ad-images">🖼️ Upload Images</label>

          <p>
            Select up to 10 images. Each image must be 10 MB or smaller.
          </p>

          <input
            id="ad-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

          {images.length > 0 && (
            <div className="post-image-preview-grid">
              {images.map((image, index) => (
                <div
                  className="post-image-preview"
                  key={`${image.name}-${index}`}
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                  />
                  <span>{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

         </div>

{/* PUBLISH BUTTON */}
<button
  type="submit"
  disabled={uploading}
  className="publish-ad-btn"
>
  {uploading
    ? "⏳ Uploading images..."
    : "📢 Publish Advertisement"}
</button>

{/* CLEAR DRAFT (secondary) */}
<button
  type="button"
  onClick={clearDraft}
  className="clear-draft-btn-small"
>
  🗑️ Clear Draft
</button>
        </div>
      </form>
    </div>
  );
}

export default PostAd;
