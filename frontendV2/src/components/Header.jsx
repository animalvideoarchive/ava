import React from 'react';
// import '../assets'
const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src="./assets/zoo-logo.png" alt="Saint Louis Zoo" />
        <span>Saint Louis Zoo</span>
      </div>
      <nav>
        <ul>
          <li className="active">Home</li>
          <li>Logout</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
