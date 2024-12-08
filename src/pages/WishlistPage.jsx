import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WishlistPage.css";

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  }, []);

  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist); // Update state to re-render
  };

  return (
    <div className="container">
      <h1 className="my-4">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty!</p>
      ) : (
        <div className="row">
          {wishlist.map((gift) => (
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
                  <button
                    onClick={() => removeFromWishlist(gift.id)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-secondary mt-4" onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
}

export default WishlistPage;
