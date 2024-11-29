import React from 'react';
import './welcome.css'; // Import the updated CSS file
import logo from './logo.png';


// const quotes = [
//   {
//     name: "Mahatma Gandhi",
//     username: "@gandhi",
//     body: "The best way to find yourself is to lose yourself in the service of others.",
//     img: "https://avatar.vercel.sh/gandhi",
//   },
//   {
//     name: "Helen Keller",
//     username: "@helenkeller",
//     body: "Alone we can do so little; together we can do so much.",
//     img: "https://avatar.vercel.sh/helenkeller",
//   },
//   {
//     name: "Martin Luther King Jr.",
//     username: "@mlk",
//     body: "Life's most persistent and urgent question is, 'What are you doing for others?'",
//     img: "https://avatar.vercel.sh/mlk",
//   },
//   {
//     name: "Audrey Hepburn",
//     username: "@audrey",
//     body: "As you grow older, you will discover that you have two hands — one for helping yourself, <br />and the other for helping others.",
//     img: "https://avatar.vercel.sh/audrey",
//   },
//   {
//     name: "Mother Teresa",
//     username: "@motherteresa",
//     body: "It's not how much we give, but how much love we put into giving.",
//     img: "https://avatar.vercel.sh/motherteresa",
//   },
//   {
//     name: "Winston Churchill",
//     username: "@churchill",
//     body: "We make a living by what we get, but we make a life by what we give.",
//     img: "https://avatar.vercel.sh/churchill",
//   },
// ];

// const firstRow = quotes.slice(0, quotes.length / 2);
// const secondRow = quotes.slice(quotes.length / 2);

// function ReviewCard({ img, name, username, body }) {
//   return (
//     <figure className="review-card">
//       <div className="review-header">
//         <img className="review-avatar" width="32" height="32" alt={name} src={img} />
//         <div className="review-info">
//           <figcaption className="review-name">{name}</figcaption>
//           <p className="review-username">{username}</p>
//         </div>
//       </div>
//       <blockquote className="review-body">{body}</blockquote>
//     </figure>
//   );
// }

function WelcomePage({ onGetStarted }) {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <img src={logo} alt="Voluntree Logo" className="logo" />
        <h1 className="welcome-title">LET'S UNITE AND SAVE</h1>
        <p className="welcome-text">
          Join a network of passionate individuals making a difference. 
          Connect, support, and contribute to disaster relief efforts and community projects.
        </p>
        <button className="get-started-button" onClick={onGetStarted}>
          Get Started →
        </button>
      {/* Emergency Button */}
      
      </div>

      {/* Marquee Section */}
      {/*<div className="marquee-container">
        <div className="marquee-content">
          {firstRow.map((quote) => (
            <ReviewCard key={quote.username} {...quote} />
          ))}
        </div>
        <div className="marquee-content reverse">
          {secondRow.map((quote) => (
            <ReviewCard key={quote.username} {...quote} />
          ))}
        </div>
    </div>*/}
    </div>
  );
}

export default WelcomePage;