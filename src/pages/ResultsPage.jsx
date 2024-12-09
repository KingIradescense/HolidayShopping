import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResultsPage.css";
import validRecordsData from './valid_records.json';
import productSimilarityData from './product_similarity.json';

function readRecords() {
  // helper function: normalize price string to a number
  const normalizePrice = (priceString) => parseFloat(priceString.replace('$', ''));

  // helper function: extract rating as a number
  const extractRating = (ratingString) => parseFloat(ratingString.split(' ')[0]);

  // helper function: filter by age
  const filterByAge = (record, ageFilter) => {
    const ageString = record["Recommended Age"] || "";
    if (!ageFilter) return true; // if no age filter, include all
    if (ageFilter === "Child") {
      return ageString.includes("years") && !ageString.includes("months");
    }
    if (ageFilter === "Teen" || ageFilter === "Adult") {
      return ageString.includes("+");
    }
    return true; // default to include all if no specific match
  };

  // Helper function: Filter by category
  const filterByCategory = (record, categoryFilter) => {
    if (!categoryFilter) return true; // if no category filter, include all
    const category = record["Category"] || "";
    const categoryMappings = {
      //? manual assignments of known unique categoires in valid_records.json to closest given sorting category
      Sports: ["Bikes", "Boy Shoes", "Baby Shoes", "Men Coats & Jackets", "Boy Coats & Jackets", "Girl Coats & Jackets", "Women Coats & Jackets", "Men Shoes", "Girl Shoes", "Women Shoes"],  
      Books: ["Toys", "Dolls"],  
      Tech: ["Headphones", "Tablets", "Laptops", "Jewelry", "Cameras", "Handbags", "Phones", "Fragrance", "Accessories", "Game Consoles"]

    };
    return categoryMappings[categoryFilter]?.includes(category) ?? true;
  };

  // main filtering and processing logic
  const filters = {
    age: null, // example: no age filter applies
    category: null, // example: no category filter applied
    price: 200, // example: maximum price based on slider
    //? above filters should show all items which are less than $200 regarldess of other defining features
  };

  // step 1: filter valid records
  let filteredRecords = validRecordsData.filter(
    (record) =>
      filterByAge(record, filters.age) &&
      normalizePrice(record["Price"]) <= filters.price &&
      filterByCategory(record, filters.category)
  );

  // step 2: sort by rating and pick the top 10
  filteredRecords = filteredRecords
    .sort((a, b) => extractRating(b["Rating"]) - extractRating(a["Rating"]))
    .slice(0, 10);

  // step 3: use product similarity to expand the list
  const productIds = new Set(filteredRecords.map((record) => record["Product ID"]));
  productSimilarityData.forEach((entry) => {
    if (productIds.has(entry["Product ID"])) {
      entry["Similar Products"].forEach((similar) => {
        if (similar["Similarity Score"] > 0.84) {
          productIds.add(similar["Product ID"]);
        }
      });
    }
  });

  // step 4: create the final array in the given format
  const finalRecords = [];
  let idCounter = 1; // for assigning numeric IDs

  for (const record of validRecordsData) {
    if (productIds.has(record["Product ID"])) {
      finalRecords.push({
        id: idCounter++,
        name: record["Name"],
        price: normalizePrice(record["Price"]),
        description: "", // leave blank for now
        image: record["Image URL"] || "https://via.placeholder.com/150",
      });
    }
  }

  // return the formatted results
  return finalRecords;
}

function ResultsPage() {
  //? if readRecords() works as intended:
  const allGifts = readRecords();

  // const allGifts = [
  //   {
  //     id: 1,
  //     name: "Wireless Headphones",
  //     price: 99,
  //     description: "Noise-cancelling headphones with 40-hour battery life.",
  //     image: "https://via.placeholder.com/150",
  //   },
  //   {
  //     id: 2,
  //     name: "Coffee Maker",
  //     price: 75,
  //     description: "Compact coffee machine with programmable timer.",
  //     image: "https://via.placeholder.com/150",
  //   },
  //   {
  //     id: 3,
  //     name: "Fitness Tracker",
  //     price: 50,
  //     description: "Tracks steps, heart rate, and calories burned.",
  //     image: "https://via.placeholder.com/150",
  //   },
  // ];

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
