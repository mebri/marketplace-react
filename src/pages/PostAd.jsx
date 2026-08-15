import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

function PostAd() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  // Phone number
  const [phone, setPhone] = useState("");

  // Special fields for ምንአለሽ ተራ
  const [condition, setCondition] = useState("");
  const [materialType, setMaterialType] = useState("");

  const submitAd = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please log in before posting an advertisement.");
      return;
    }

    try {
      let imageUrl = "";

      // Upload image to Cloudinary
      if (image) {
        const formData = new FormData();

        formData.append("file", image);
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

        if (response.ok && data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          alert(
            "Cloudinary Error: " +
              (data.error?.message || "Unknown error")
          );
          return;
        }
      }

      // Save advertisement to Firestore
      await addDoc(collection(db, "ads"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,

        phone,

        title,
        price,
        city,
        category,
        description,

        image: imageUrl,

        // Special information
        condition:
          category === "ምንአለሽ ተራ"
            ? condition
            : "",

        materialType:
          category === "ምንአለሽ ተራ"
            ? materialType
            : "",

        createdAt: new Date(),
      });

      alert("Advertisement posted successfully! 🎉");

      // Clear form
      setTitle("");
      setPrice("");
      setCity("");
      setCategory("");
      setDescription("");
      setImage(null);
      setPhone("");
      setCondition("");
      setMaterialType("");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="post-ad-page">

      <h1>📢 Post Advertisement</h1>

      <form
        className="post-form"
        onSubmit={submitAd}
      >

        {/* Title */}
        <input
          type="text"
          placeholder="Advertisement Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

        {/* Category */}
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

        {/* Special fields */}
        {category === "ምንአለሽ ተራ" && (
          <>
            {/* Condition */}
            <select
              value={condition}
              onChange={(e) =>
                setCondition(e.target.value)
              }
              required
            >
              <option value="">
                Select Condition
              </option>

              <option value="Used">
                Used
              </option>

              <option value="Like New">
                Like New
              </option>

              <option value="Refurbished">
                Refurbished
              </option>
            </select>

            {/* Material Type */}
            <select
              value={materialType}
              onChange={(e) =>
                setMaterialType(e.target.value)
              }
              required
            >
              <option value="">
                Select Material Type
              </option>

              <option value="Metal">
                🔩 Metal
              </option>

              <option value="Wood">
                🪵 Wood
              </option>

              <option value="Doors and Windows">
                🚪 Doors & Windows
              </option>

              <option value="Machinery">
                ⚙️ Machinery
              </option>

              <option value="Construction Materials">
                🧱 Construction Materials
              </option>

              <option value="Other">
                📦 Other
              </option>
            </select>
          </>
        )}

        {/* Price */}
        <input
          type="number"
          placeholder="Price (ETB)"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          required
        />

        {/* City */}
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
          required
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number (+251...)"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          required
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          rows="5"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          required
        />

        {/* Image */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files[0])
          }
        />

        {/* Submit */}
        <button type="submit">
          Publish Advertisement
        </button>

      </form>
    </div>
  );
}

export default PostAd;