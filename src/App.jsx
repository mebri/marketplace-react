import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Chat from "./pages/Chat";
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
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/houses" element={<Houses />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/search" element={<Search />} />
        <Route path="/ad/:id" element={<AdDetails />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/edit-ad/:id" element={<EditAd />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-ads" element={<MyAds />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:uid" element={<UserProfile />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
