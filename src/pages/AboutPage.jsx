import React from "react";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">
      <h1>About the Gift Recommender</h1>
      <p>
        Welcome to the Gift Recommender! Our goal is to make gift shopping
        easy and fun. By answering a few simple questions about the recipient,
        we help you find the perfect gift for any occasion. Whether you're buying
        for a birthday, holiday, or just because, we’ve got you covered!
      </p>
      <h2>Our Team</h2>
      <p>
        We are a passionate team of developers and designers working hard to
        provide a seamless user experience and the best gift recommendations.
      </p>
      <h2>Feedback</h2>
      <p>
        We’d love to hear from you! If you have any questions, suggestions, or
        feedback, feel free to <a href="mailto:feedback@giftrecommender.com">email us</a>.
      </p>
    </div>
  );
}

export default AboutPage;