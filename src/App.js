import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AboutPage from "./pages/AboutPage"; // Import AboutPage
import HomePage from "./pages/HomePage";
import RecommendationForm from "./pages/RecommendationForm";
import ResultsPage from "./pages/ResultsPage";
import WishlistPage from "./pages/WishlistPage";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommend" element={<RecommendationForm />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/about" element={<AboutPage />} /> {/* Add About Page route */}
      </Routes>
    </Router>
  );
}

export default App;
