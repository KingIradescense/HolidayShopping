import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResultsPage.css";

function ResultsPage() {
  const allGifts = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99,
      description: "Noise-cancelling headphones with 40-hour battery life.",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "Coffee Maker",
      price: 75,
      description: "Compact coffee machine with programmable timer.",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "Fitness Tracker",
      price: 50,
      description: "Tracks steps, heart rate, and calories burned.",
      image: "https://via.placeholder.com/150",
    },
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || { budget: Infinity };

  const [filteredGifts, setFilteredGifts] = useState([]);

  useEffect(() => {
    const matchingGifts = allGifts.filter((gift) => gift.price <= formData.budget);
    setFilteredGifts(matchingGifts);
  }, [formData.budget]);

  const addToWishlist = (id) => {
    const giftToAdd = allGifts.find((gift) => gift.id === id);
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    storedWishlist.push(giftToAdd);
    localStorage.setItem("wishlist", JSON.stringify(storedWishlist));
    console.log(`Gift with ID ${id} added to wishlist`);
  };

  const buyNow = (id) => {
    console.log(`Gift with ID ${id} purchased`);
  };

  return (
    <div className="container">
      <h1 className="my-4">Recommended Gifts</h1>
      <div className="row">
        {filteredGifts.length > 0 ? (
          filteredGifts.map((gift) => (
            <div key={gift.id} className="col-md-4">
              <div className="card">
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title">{gift.name}</h5>
                  <p className="card-text">{gift.description}</p>
                  <p className="price">${gift.price}</p>
                  <div className="d-flex justify-content-between">
                    <button
                      onClick={() => addToWishlist(gift.id)}
                      className="btn btn-success"
                    >
                      Add to Wishlist
                    </button>
                    <button
                      onClick={() => buyNow(gift.id)}
                      className="btn btn-primary"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No gifts found within your budget.</p>
        )}
      </div>

      <button className="btn btn-secondary mt-4" onClick={() => navigate("/wishlist")}>
        Go to Wishlist
      </button>
    </div>
  );
}

export default ResultsPage;
