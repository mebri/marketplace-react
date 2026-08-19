import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";

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

import Dashboard from "./pages/Dashboard";
import MyAds from "./pages/MyAds";

import Contact from "./pages/Contact";
import AdDetails from "./pages/AdDetails";
import Search from "./pages/Search";

import EditAd from "./pages/EditAd";
function App() {
  return (
    <HashRouter>

      <Navbar />

      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =========================
            CARS
        ========================= */}

        <Route
          path="/cars"
          element={<Cars />}
        />


        {/* =========================
            HOUSES
        ========================= */}

        <Route
          path="/houses"
          element={<Houses />}
        />


        {/* =========================
            RENTALS
        ========================= */}

        <Route
          path="/rentals"
          element={<Rentals />}
        />


        {/* =========================
            SPARE PARTS
        ========================= */}

        <Route
          path="/spare-parts"
          element={<SpareParts />}
        />


        {/* =========================
            BUILDING MATERIALS
        ========================= */}

        <Route
          path="/building-materials"
          element={<BuildingMaterials />}
        />


        {/* =========================
            SEARCH
        ========================= */}

        <Route
          path="/search"
          element={<Search />}
        />


        {/* =========================
            AD DETAILS
        ========================= */}

        <Route
          path="/ad/:id"
          element={<AdDetails />}
        />


        {/* =========================
            POST ADVERTISEMENT
        ========================= */}

        <Route
          path="/post-ad"
          element={<PostAd />}
        />


        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =========================
            REGISTER
        ========================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =========================
            MY ADS
        ========================= */}

        <Route
          path="/my-ads"
          element={<MyAds />}
        />


        {/* =========================
            CONTACT
        ========================= */}

        <Route
          path="/contact"
          element={<Contact />}
        />
<Route
  path="/edit-ad/:id"
  element={<EditAd />}
/>
      </Routes>

    </HashRouter>
  );
}

export default App;
