import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

// =========================
// COMPONENTS
// =========================

import Navbar from "./components/Navbar";

// =========================
// PAGES
// =========================

import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Houses from "./pages/Houses";
import Rentals from "./pages/Rentals";

import Search from "./pages/Search";
import AdDetails from "./pages/AdDetails";

import PostAd from "./pages/PostAd";
import EditAd from "./pages/EditAd";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import MyAds from "./pages/MyAds";

import Contact from "./pages/Contact";

import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <HashRouter>

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar />

      {/* =========================
          ROUTES
      ========================= */}

      <Routes>

        {/* HOME */}

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
            SEARCH
            Used for:
            Electronics
            Furniture
            Labor & Services
            ምንአለሽ ተራ
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
            POST AD
        ========================= */}

        <Route
          path="/post-ad"
          element={<PostAd />}
        />


        {/* =========================
            EDIT AD
        ========================= */}

        <Route
          path="/edit-ad/:id"
          element={<EditAd />}
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
            PROFILE
        ========================= */}

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* =========================
            PUBLIC USER PROFILE
        ========================= */}

        <Route
          path="/user/:uid"
          element={<UserProfile />}
        />


        {/* =========================
            CONTACT
        ========================= */}

        <Route
          path="/contact"
          element={<Contact />}
        />

      </Routes>

    </HashRouter>
  );
}

export default App;