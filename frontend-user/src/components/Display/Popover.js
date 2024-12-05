import React, { useContext, useEffect, useState } from "react";
import cancelIcon from "../../assets/icons/cancelPopup.png";
import ToggleButton from "../Buttons/ToggleButton";
import { CartContext } from "../CartContext";

const Popover = ({ addVideo, setAddVideo, isOpen, onClose, id, videoData }) => {
  const { cart, addVideoToCart, removeVideoFromCart } = useContext(CartContext);
  // If the popover is closed, don't render anything
  if (!isOpen || !videoData) return null;

  // Format the video duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  // Close the popover if the overlay is clicked
  const handleOverlayClick = (e) => {
    // Close only if the click happens outside the modal content
    if (e.target === e.currentTarget) {
      handleClose();
    }
    // console.log(addVideo);
  };

  const handleClose = () => {
    onClose();
    if (addVideo) {
      let check = false;
      for (let i = 0; i < cart.length; i++) {
        if (cart[i] === id) {
          check = true;
          break;
        }
      }
      if (!check) addVideoToCart(id);
    } else {
      removeVideoFromCart(id);
    }
  };
  // Overlay styling
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 1000,
  };

  // Modal styling
  const modalStyle = {
    width: "80vw",
    height: "70vh",
    backgroundColor: "#EEECE5",
    borderRadius: "10px",
    position: "relative",
    padding: "20px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    marginTop: "150px",
  };

  // Close button styling
  const closeButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    cursor: "pointer",
  };

  // Content area styling
  const contentStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "10px",
    paddingBottom: "10px",
    height: "100%",
  };

  // Text content styling
  const textContainerStyle = {
    flex: 1,
    paddingRight: "20px",
    alignSelf: "flex-start",
  };

  // Video preview styling
  const videoPreviewStyle = {
    width: "60%",
    height: "100%",
    marginTop: "30px",
    marginRight: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  // Video element styling
  const videoStyle = {
    maxWidth: "100%",
    height: "100%",
  };

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={modalStyle}>
        {/* Close Icon */}
        <img src={cancelIcon} alt="Close" style={closeButtonStyle} onClick={handleClose} />

        <div style={contentStyle}>
          {/* Video Details and Preview */}
          <div style={textContainerStyle}>
            <h2 style={{ fontWeight: "bold" }}>{videoData.title}</h2>
            <p>Duration: {formatDuration(videoData.duration)}</p>
            <p>Date: {videoData.date}</p>
          </div>

          {/* Video Preview on the Right */}
          <div style={videoPreviewStyle}>
            <video style={videoStyle} controls>
              <source src={videoData.presigned_clippedvideopath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Bottom Section */}
        <div>
          <ToggleButton video={id} addVideo={addVideo} setAddVideo={setAddVideo} />
        </div>
      </div>
    </div>
  );
};

export default Popover;
