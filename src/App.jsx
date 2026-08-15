import "./App.css";
import UsedMaterials from "./pages/UsedMaterials";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import MinAleshTera from "./pages/MinAleshTera";
import Cars from "./pages/Cars";
import Houses from "./pages/Houses";
import Rentals from "./pages/Rentals";
import SpareParts from "./pages/SpareParts";
import BuildingMaterials from "./pages/BuildingMaterials";
import PostAd from "./pages/PostAd";
import MyAds from "./pages/MyAds";
import EditAd from "./pages/EditAd";
import Dashboard from "./pages/Dashboard";
import AdDetails from "./pages/AdDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
                path="/minalesh-tera"
               element={<MinAleshTera />}
               />
        <Route path="/cars" element={<Cars />} />
        <Route path="/houses" element={<Houses />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/spare-parts" element={<SpareParts />} />
        <Route
          path="/building-materials"
          element={<BuildingMaterials />}
        />

        <Route
         path="/used-materials"
         element={<UsedMaterials />}
         />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/my-ads" element={<MyAds />} />
        <Route path="/ad/:id" element={<AdDetails />} />
        <Route path="/edit-ad/:id" element={<EditAd />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;