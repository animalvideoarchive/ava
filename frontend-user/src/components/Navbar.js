import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation
import logo from "../assets/images/logo/logo.png";
import { CartContext } from "./CartContext";
import Badge from "@mui/material/Badge";
const Navbar = () => {
  // State to track the selected tab
  const [selectedTab, setSelectedTab] = useState("search");
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Get the current location
  const { cart } = useContext(CartContext);

  // Inline CSS for the Navbar and its elements
  const navBarStyle = {
    backgroundColor: "#EEECE5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    marginBottom: "0px",
    fontFamily: "Metapro Normal, sans-serif",
    position: "sticky", // Makes the Navbar sticky
    top: "0", // Sticks the Navbar to the top of the page
    zIndex: "1000",
    height: "50px",
  };

  const welcomeStyle = {
    color: "#000",
    fontSize: "22px",
  };

  const logoNavStyle = {
    height: "50px",
  };

  const navOptionsStyle = {
    display: "flex",
    gap: "20px",
    position: "relative",
  };

  const tabStyle = (tab) => ({
    color: "#000",
    padding: "10px",
    cursor: "pointer",
    fontFamily: "Metapro Normal, sans-serif",
    borderBottom: selectedTab === tab ? "2px solid #FDBD57" : "none",
    fontWeight: selectedTab === tab ? "bold" : "normal",
  });

  // Handler for switching tabs
  const handleTabClick = (tab) => {
    if (tab === "search") {
      navigate("/search"); // Navigate to search page
    } else if (tab === "cart") {
      navigate("/cart"); // Navigate to cart page
    }
  };
  // Update selectedTab based on the current URL path
  useEffect(() => {
    if (location.pathname.includes("search")) {
      setSelectedTab("search");
    } else if (location.pathname.includes("cart")) {
      setSelectedTab("cart");
    } else if (!location.pathname.includes("search") && !location.pathname.includes("cart") && cart.length === 0) {
      setSelectedTab("search");
      navigate("/search"); // Navigate to cart page
    }
  }, [location.pathname]); // Runs whenever location.pathname changes

  return (
    <nav style={navBarStyle}>
      {location.pathname === "/search" ? ( // Check if the current path is '/search'
        <div style={welcomeStyle}>Welcome!</div>
      ) : (
        <img src={logo} alt="Logo" style={logoNavStyle} />
      )}

      <div style={navOptionsStyle}>
        <div style={tabStyle("search")} onClick={() => handleTabClick("search")}>
          Search
        </div>

        <Badge badgeContent={cart.length} color="secondary">
          <div style={tabStyle("cart")} onClick={() => handleTabClick("cart")}>
            Shopping Cart
          </div>
        </Badge>
      </div>
    </nav>
  );
};

export default Navbar;
