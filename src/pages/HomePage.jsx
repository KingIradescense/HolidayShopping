import React from "react";
import { useNavigate } from "react-router-dom";
import giftImage from "../assets/funnel.png";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate(); // React Router hook for navigation

  const handleGetStarted = () => {
    navigate("/recommend"); // Navigate to the Recommendation Form page
  };

  return (
    <div className="home-page">
      <div className="content">
        <h1>Welcome to the Gift Recommender!</h1>
        <p>
          Find the perfect gifts for your loved ones with ease. Just answer a few
          questions about their preferences and let us do the rest!
        </p>
        <button onClick={handleGetStarted} className="cta-button">
          Find Gifts
        </button>
      </div>
      <div className="illustration">
        <img
          src={giftImage}
          alt="Gift Illustration"
          className="illustration-image"
        />
      </div>
    </div>
  );
}

export default HomePage;
