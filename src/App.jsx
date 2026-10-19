import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PostAd from "./pages/PostAd";
import AdDetails from "./pages/AdDetails";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import MyAds from "./pages/MyAds";
import Chats from "./pages/Chats";
import ChatRoom from "./pages/ChatRoom";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";
import EditAd from "./pages/EditAd";
import Cars from "./pages/Cars";
import ResetPassword from "./pages/ResetPassword";
import VideoCall from "./pages/VideoCall"; // ✅ Added

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/ad/:id" element={<AdDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-ads" element={<MyAds />} />
        <Route path="/edit-ad/:id" element={<EditAd />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chat/:chatId" element={<ChatRoom />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* ✅ Video Call Route */}
        <Route path="/video-call/:roomId" element={<VideoCall />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
