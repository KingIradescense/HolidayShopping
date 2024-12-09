import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResultsPage.css";

function ResultsPage() {
  const [allGifts, setAllGifts] = useState([]);

useEffect(() => {
  const fetchGiftsFromJson = async () => {
    try {
      const response = await fetch("valid_records.json");
      const data = await response.json();

      // Format data to match the structure expected by allGifts
      const formattedData = data.slice(0, 2000).map((item, index) => ({
        id: index + 1,
        name: item.Name || "Unknown Gift",
        price: parseFloat(item.Price.replace("$", "")) || 0,
        description: "", // Description not available in JSON
        image: item["Image URL"] || "https://via.placeholder.com/150",
      }));

      setAllGifts(formattedData);
    } catch (error) {
      console.error("Error loading JSON data:", error);
    }
  };

  fetchGiftsFromJson();
}, []);


  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || { budget: Infinity };

  const [filteredGifts, setFilteredGifts] = useState([]);
  
  // Fetch wishlist from localStorage when the component mounts
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem("wishlist")) || []);

  useEffect(() => {
    const matchingGifts = allGifts.filter((gift) => gift.price <= formData.budget);
    setFilteredGifts(matchingGifts);
  }, [formData.budget]);

  // Add gift to wishlist and update localStorage
  const addToWishlist = (id) => {
    const giftToAdd = allGifts.find((gift) => gift.id === id);
    const updatedWishlist = [...wishlist, giftToAdd];

    // Update the state and localStorage
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

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
