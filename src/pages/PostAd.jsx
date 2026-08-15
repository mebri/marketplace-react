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

  // Seller phone
  const [phone, setPhone] = useState("");

  // Condition
  const [condition, setCondition] = useState("");

  // Material type for ምንአለሽ ተራ
  const [materialType, setMaterialType] = useState("");

  // Electronics subcategory
  const [subcategory, setSubcategory] = useState("");

  // House / Rental type
  const [type, setType] = useState("");

  const submitAd = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please log in before posting an advertisement.");
      return;
    }

    try {
      let imageUrl = "";

      // =========================
      // CLOUDINARY IMAGE UPLOAD
      // =========================

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

      // =========================
      // SAVE ADVERTISEMENT
      // =========================

      await addDoc(collection(db, "ads"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,

        title,
        price,
        city,
        category,
        description,

        // Seller phone
        phone,

        // Image
        image: imageUrl,

        // Condition
        condition,

        // Electronics subcategory
        subcategory,

        // House / Rental type
        type,

        // ምንአለሽ ተራ material
        materialType:
          category === "ምንአለሽ ተራ"
            ? materialType
            : "",

        createdAt: new Date(),
      });

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
      setImage(null);
      setCondition("");
      setMaterialType("");
      setSubcategory("");
      setType("");

    } catch (error) {
      console.error(error);
      alert(error.message);
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

      <h1>📢 Post Advertisement</h1>

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
            {/* Electronics type */}

            <select
              value={subcategory}
              onChange={(e) =>
                setSubcategory(e.target.value)
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

            {/* New / Used */}

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

            {/* Material */}

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
            setDescription(e.target.value)
          }
          required
        />

        {/* =========================
            IMAGE
        ========================= */}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files[0])
          }
        />

        {/* =========================
            SUBMIT
        ========================= */}

        <button type="submit">
          Publish Advertisement
        </button>

      </form>
    </div>
  );
}

export default PostAd;