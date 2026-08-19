import { useState } from "react";
import {
  collection,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

function PostAd() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Images
  const [images, setImages] = useState([]);

  // Seller phone
  const [phone, setPhone] = useState("");

  // Condition
  const [condition, setCondition] = useState("");

  // Material type
  const [materialType, setMaterialType] = useState("");

  // Electronics subcategory
  const [subcategory, setSubcategory] = useState("");

  // House / Rental type
  const [type, setType] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);

  // =========================
  // IMAGE SELECTION
  // =========================

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    // Maximum 10 images
    if (selectedFiles.length > 10) {
      alert("You can select a maximum of 10 images.");
      e.target.value = "";
      return;
    }

    // Check file types
    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      alert("Please select image files only.");
      e.target.value = "";
      return;
    }

    // Check file size
    const tooLarge = selectedFiles.find(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (tooLarge) {
      alert(
        "Each image must be 10 MB or smaller."
      );
      e.target.value = "";
      return;
    }

    setImages(selectedFiles);
  };

  // =========================
  // REMOVE IMAGE
  // =========================

  const removeImage = (index) => {
    setImages((currentImages) =>
      currentImages.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  };

  // =========================
  // SUBMIT AD
  // =========================

  const submitAd = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert(
        "Please log in before posting an advertisement."
      );
      return;
    }

    if (images.length === 0) {
      alert(
        "Please select at least one image."
      );
      return;
    }

    if (images.length > 10) {
      alert(
        "You can upload a maximum of 10 images."
      );
      return;
    }

    try {
      setUploading(true);

      // =========================
      // CLOUDINARY UPLOAD
      // =========================

      const imageUrls = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const formData = new FormData();

        formData.append("file", image);

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

        console.log(
          `Cloudinary Image ${i + 1}:`,
          data
        );

        if (
          !response.ok ||
          !data.secure_url
        ) {
          throw new Error(
            data.error?.message ||
              `Failed to upload image ${i + 1}.`
          );
        }

        imageUrls.push(data.secure_url);
      }

      // =========================
      // SAVE TO FIREBASE
      // =========================

      await addDoc(
        collection(db, "ads"),
        {
          userId:
            auth.currentUser.uid,

          userEmail:
            auth.currentUser.email || "",

          title: title.trim(),

          price: price,

          city: city.trim(),

          category,

          description:
            description.trim(),

          // Seller phone
          phone: phone.trim(),

          // Keep first image for
          // compatibility with existing pages
          image:
            imageUrls.length > 0
              ? imageUrls[0]
              : "",

          // New multiple-image field
          images: imageUrls,

          // Condition
          condition,

          // Electronics
          subcategory,

          // House / Rental
          type,

          // ምንአለሽ ተራ
          materialType:
            category === "ምንአለሽ ተራ"
              ? materialType
              : "",

          createdAt: new Date(),
        }
      );

      alert(
        "Advertisement posted successfully! 🎉"
      );

      // =========================
      // CLEAR FORM
      // =========================

      setTitle("");
      setPrice("");
      setCity("");
      setCategory("");
      setDescription("");
      setPhone("");
      setImages([]);
      setCondition("");
      setMaterialType("");
      setSubcategory("");
      setType("");

      // Clear file input
      const fileInput =
        document.getElementById(
          "ad-images"
        );

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {
      console.error(
        "Post advertisement error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while posting the advertisement."
      );

    } finally {
      setUploading(false);
    }
  };

  // =========================
  // CATEGORY CHANGE
  // =========================

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;

    setCategory(newCategory);

    // Clear dependent fields
    setCondition("");
    setMaterialType("");
    setSubcategory("");
    setType("");
  };

  return (
    <div className="post-ad-page">

      <h1>
        📢 Post Advertisement
      </h1>

      <form
        className="post-form"
        onSubmit={submitAd}
      >

        {/* =========================
            TITLE
        ========================= */}

        <input
          type="text"
          placeholder="Advertisement Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

        {/* =========================
            CATEGORY
        ========================= */}

        <select
          value={category}
          onChange={handleCategoryChange}
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

        {/* =========================
            CARS
        ========================= */}

        {category === "Cars" && (
          <select
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value)
            }
            required
          >
            <option value="">
              Select Car Condition
            </option>

            <option value="New">
              New Car
            </option>

            <option value="Used">
              Used Car
            </option>
          </select>
        )}

        {/* =========================
            ELECTRONICS
        ========================= */}

        {category === "Electronics" && (
          <>
            <select
              value={subcategory}
              onChange={(e) =>
                setSubcategory(
                  e.target.value
                )
              }
              required
            >
              <option value="">
                Select Electronics Type
              </option>

              <option value="Phones">
                📱 Phones
              </option>

              <option value="Computers">
                💻 Computers & Laptops
              </option>

              <option value="TVs">
                📺 TVs
              </option>

              <option value="Audio">
                🎧 Audio & Accessories
              </option>

              <option value="Other">
                🔌 Other Electronics
              </option>
            </select>

            <select
              value={condition}
              onChange={(e) =>
                setCondition(
                  e.target.value
                )
              }
              required
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
            </select>
          </>
        )}

        {/* =========================
            ምንአለሽ ተራ
        ========================= */}

        {category === "ምንአለሽ ተራ" && (
          <>
            <select
              value={condition}
              onChange={(e) =>
                setCondition(
                  e.target.value
                )
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

            <select
              value={materialType}
              onChange={(e) =>
                setMaterialType(
                  e.target.value
                )
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

        {/* =========================
            BUILDING MATERIALS
        ========================= */}

        {category === "Building Materials" && (
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

            <option value="New">
              New Building Materials
            </option>

            <option value="Used">
              Used Building Materials
            </option>
          </select>
        )}

        {/* =========================
            SPARE PARTS
        ========================= */}

        {category === "Spare Parts" && (
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

            <option value="New">
              New Spare Parts
            </option>

            <option value="Used">
              Used Spare Parts
            </option>
          </select>
        )}

        {/* =========================
            HOUSES
        ========================= */}

        {category === "Houses" && (
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            required
          >
            <option value="">
              Select House Type
            </option>

            <option value="sale">
              🏠 House for Sale
            </option>

            <option value="rent">
              🏠 House for Rent
            </option>
          </select>
        )}

        {/* =========================
            RENTALS
        ========================= */}

        {category === "Rentals" && (
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            required
          >
            <option value="">
              Select Rental Type
            </option>

            <option value="apartment">
              🏢 Apartment
            </option>

            <option value="house">
              🏠 House
            </option>

            <option value="shop">
              🏪 Shop
            </option>

            <option value="office">
              🏢 Office
            </option>
          </select>
        )}

        {/* =========================
            PRICE
        ========================= */}

        <input
          type="number"
          placeholder="Price (ETB)"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          required
        />

        {/* =========================
            CITY
        ========================= */}

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
          required
        />

        {/* =========================
            PHONE
        ========================= */}

        <input
          type="tel"
          placeholder="Phone Number (+251...)"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          required
        />

        {/* =========================
            DESCRIPTION
        ========================= */}

        <textarea
          placeholder="Description"
          rows="5"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          required
        />

        {/* =========================
            IMAGES
        ========================= */}

        <div className="post-images-section">

          <label htmlFor="ad-images">
            🖼️ Upload Images
          </label>

          <p>
            Select up to 10 images.
            You can upload 1–10 images.
          </p>

          <input
            id="ad-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

          {/* IMAGE PREVIEWS */}

          {images.length > 0 && (
            <div className="post-image-preview-grid">

              {images.map(
                (image, index) => (
                  <div
                    className="post-image-preview"
                    key={`${image.name}-${index}`}
                  >

                    <img
                      src={URL.createObjectURL(
                        image
                      )}
                      alt={`Preview ${
                        index + 1
                      }`}
                    />

                    <span>
                      {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>
                )
              )}

            </div>
          )}

          <p className="image-count">
            {images.length} / 10 images selected
          </p>

        </div>

        {/* =========================
            SUBMIT
        ========================= */}

        <button
          type="submit"
          disabled={uploading}
        >
          {uploading
            ? "⏳ Uploading images..."
            : "📢 Publish Advertisement"}
        </button>

      </form>

    </div>
  );
}

export default PostAd;