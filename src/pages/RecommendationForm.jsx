import React, { useState } from "react";
import { Dropdown } from "react-bootstrap"; // Importing Bootstrap Dropdown
import { useNavigate } from "react-router-dom"; // Importing useNavigate
import "./RecommendationForm.css";

function RecommendationForm() {
  const navigate = useNavigate(); // Hook to navigate programmatically

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    interests: [],
    budget: 50,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    let newInterests = [...formData.interests];
    if (checked) {
      newInterests.push(value);
    } else {
      newInterests = newInterests.filter((interest) => interest !== value);
    }
    setFormData({ ...formData, interests: newInterests });
  };

  const handleDropdownSelect = (value) => {
    setFormData({ ...formData, age: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // For testing

    // After the form is submitted, navigate to the results page and pass formData as state
    navigate("/results", { state: { formData } });
  };

  return (
    <div className="recommendation-form">
      <h1>Tell Us About the Recipient</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>
            Age:
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-age">
                {formData.age || "Select Age"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleDropdownSelect("child")}>
                  Child
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleDropdownSelect("teen")}>
                  Teen
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleDropdownSelect("adult")}>
                  Adult
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </label>
        </div>

        <div className="form-section">
          <label>
            Gender:
            <div>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleInputChange}
              />
              Male
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleInputChange}
              />
              Female
            </div>
          </label>
        </div>

        <div className="form-section">
          <label>
            Interests:
            <div>
              <input
                type="checkbox"
                value="sports"
                onChange={handleInterestChange}
              />
              Sports
              <input
                type="checkbox"
                value="books"
                onChange={handleInterestChange}
              />
              Books
              <input
                type="checkbox"
                value="tech"
                onChange={handleInterestChange}
              />
              Tech
            </div>
          </label>
        </div>

        <div className="form-section">
          <label>
            Budget:
            <input
              type="range"
              name="budget"
              min="0"
              max="200"
              value={formData.budget}
              onChange={handleInputChange}
            />
            <span>${formData.budget}</span>
          </label>
        </div>

        <button type="submit">Find Gifts</button>
      </form>
    </div>
  );
}

export default RecommendationForm;
