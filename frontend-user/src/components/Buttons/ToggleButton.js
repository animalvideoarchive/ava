import React, { useState, useContext } from "react";
import AddShoppingCart from "@mui/icons-material/AddShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { CartContext } from "../CartContext";

const ToggleButton = ({ video, addVideo, setAddVideo }) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {addVideo ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            style={{
              backgroundColor: "#6EEB83",
              border: "none",
              padding: "8px 16px",
              color: "black",
              display: "flex",
              alignItems: "center",
              borderRadius: "5px",
            }}
            onClick={() => {
              setAddVideo(false);
            }}
          >
            <CheckCircleIcon style={{ marginRight: "8px" }} />
            Added
          </button>
          {/* <DeleteIcon
            style={{
              width: "20px",
              height: "20px",
              marginLeft: "12px",
              cursor: "pointer",
            }}
            onClick={handleButtonClick}
          /> */}
        </div>
      ) : (
        <button
          style={{
            backgroundColor: "#FDBD57",
            width: "100px",
            height: "40px",
            border: "none",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => {
            setAddVideo(true);
          }}
        >
          <AddShoppingCart style={{ marginRight: "18px", height: "20px" }} />
          Add
        </button>
      )}
    </div>
  );
};

export default ToggleButton;
