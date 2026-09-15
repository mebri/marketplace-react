import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

// =========================
// COMPONENTS
// =========================

import Navbar from "./components/Navbar";
import ScrollManager from "./components/ScrollManager";

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

// =========================
// CHAT PAGES
// =========================

import Chats from "./pages/Chats";
import ChatRoom from "./pages/ChatRoom";

function App() {
  return (
    <HashRouter>

      {/* Scroll Manager - restores scroll position on back */}
      <ScrollManager />

      {/* Navbar - only ONCE */}
      <Navbar />

      {/* Routes */}
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* CATEGORIES */}
        <Route path="/cars" element={<Cars />} />
        <Route path="/houses" element={<Houses />} />
        <Route path="/rentals" element={<Rentals />} />

        {/* SEARCH */}
        <Route path="/search" element={<Search />} />

        {/* AD DETAILS */}
        <Route path="/ad/:id" element={<AdDetails />} />

        {/* POST / EDIT AD */}
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/edit-ad/:id" element={<EditAd />} />

        {/* DASHBOARD / MY ADS */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-ads" element={<MyAds />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROFILE */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:uid" element={<UserProfile />} />

        {/* CONTACT */}
        <Route path="/contact" element={<Contact />} />

        {/* CHAT */}
        <Route path="/chats" element={<Chats />} />
        <Route path="/chat/:chatId" element={<ChatRoom />} />

      </Routes>

    </HashRouter>
  );
}

export default App;
