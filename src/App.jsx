import { HashRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Houses from "./pages/Houses";
import Rentals from "./pages/Rentals";
import SpareParts from "./pages/SpareParts";
import BuildingMaterials from "./pages/BuildingMaterials";
import PostAd from "./pages/PostAd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import AdDetails from "./pages/AdDetails";
import Search from "./pages/Search";

function App() {
  return (
    <HashRouter>
      <Navbar />

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Cars */}
        <Route
          path="/cars"
          element={<Cars />}
        />

        {/* Houses */}
        <Route
          path="/houses"
          element={<Houses />}
        />

        {/* Rentals */}
        <Route
          path="/rentals"
          element={<Rentals />}
        />

        {/* Spare Parts */}
        <Route
          path="/spare-parts"
          element={<SpareParts />}
        />

        {/* Building Materials */}
        <Route
          path="/building-materials"
          element={<BuildingMaterials />}
        />

        {/* Search */}
        <Route
          path="/search"
          element={<Search />}
        />

        {/* Advertisement Details */}
        <Route
          path="/ad/:id"
          element={<AdDetails />}
        />

        {/* Post Advertisement */}
        <Route
          path="/post-ad"
          element={<PostAd />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Contact */}
        <Route
          path="/contact"
          element={<Contact />}
        />

      </Routes>
    </HashRouter>
  );
}

export default App;