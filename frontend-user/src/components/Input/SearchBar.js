// SearchBar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import searchIcon from "../../assets/icons/searchIcon.png";
import { api_baseurl } from "../../constants";

const SearchBar = ({ filters, handleSearch, filterChange }) => {
  const searchLabelStyle = {
    marginBottom: "5px",
    fontWeight: "bold",
    fontFamily: "Metapro Normal, sans-serif",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <label style={searchLabelStyle}>Search</label>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => {
            filterChange(e.target.value, "keyword");
          }}
          placeholder="Search..."
          style={{
            padding: "10px",
            fontFamily: "Metapro Normal, sans-serif",
            border: "1px solid #ccc",
            borderRight: "none",
            flexGrow: 1,
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            backgroundColor: "#FDBD57",
            padding: "8px 12px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <img src={searchIcon} alt="Search" style={{ width: "20px" }} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
