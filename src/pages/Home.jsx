import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedListings from "../components/FeaturedListings";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedListings />
      <Footer />
    </>
  );
}

export default Home;