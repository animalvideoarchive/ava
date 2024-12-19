import React, { useContext, useEffect, useState } from "react";
import ToggleButton from "../Buttons/ToggleButton";
import Popover from "./Popover";
import { CartContext } from "../CartContext";

const VideoCard = ({ video, index, title, duration, date, videoUrl, thumbnailUrl }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [addVideo, setAddVideo] = useState(false);
  const { cart, removeVideoFromCart, addVideoToCart } = useContext(CartContext);
  useEffect(() => {
    let check = false;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i]._id === video._id) {
        check = true;
        break;
      }
    }
    setAddVideo(check);
  }, [addVideo]);
  // Function to handle opening the popover
  const handleThumbnailClick = () => {
    setIsPopoverOpen(true);
  };

  const onClickAdd = (bAdd) => {
    if (bAdd) addVideoToCart(video);
    else removeVideoFromCart(video._id);
    setAddVideo(bAdd);
  };

  // Function to handle closing the popover
  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
  };

  const formatDuration = (seconds) => {
    // Convert input to a number and validate
    const numSeconds = Number(seconds);
    if (isNaN(numSeconds) || numSeconds < 0) {
      return "Invalid input";
    }

    const totalMinutes = Math.floor(numSeconds / 60); // Total minutes
    const remainingSeconds = (numSeconds % 60).toFixed(0); // Remaining seconds

    if (totalMinutes < 60) {
      // If less than an hour, return minutes and seconds
      return `${totalMinutes}min ${remainingSeconds}s`;
    } else {
      // Convert to hours and minutes
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}hr ${minutes}min`;
    }
  };

  const videoContainerStyle = {
    height: "225px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "270px",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    background: "#EEECE5",
    margin: "2px",
  };

  const thumbnailStyle = {
    width: "100%",
    height: "125px",
    borderRadius: "10px",
    objectFit: "cover",
    cursor: "pointer",
  };

  const videoInfoContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    marginTop: "20px",
  };

  const titleStyle = {
    fontSize: "15px",
    fontWeight: "bold",
  };

  const metaDataContainerStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  };

  const metaDataStyle = {
    fontSize: "10px",
    color: "#666",
    marginRight: "20px",
  };

  return (
    <div style={videoContainerStyle}>
      {/* Thumbnail with click handler */}
      <div style={{ width: "100%" }} onClick={handleThumbnailClick}>
        <img src={thumbnailUrl} alt={title} style={thumbnailStyle} />
      </div>

      {/* Video Information */}
      <div style={videoInfoContainerStyle}>
        <div style={titleStyle}>{title}</div>

        {/* Metadata and Button */}
        <div style={metaDataContainerStyle}>
          <div>
            <div style={metaDataStyle}>{formatDuration(duration)}</div>
            <div style={metaDataStyle}>{date}</div>
          </div>

          {/* ToggleButton */}
          <div>
            <ToggleButton video={video} setAddVideo={onClickAdd} addVideo={addVideo} />
          </div>
        </div>
      </div>

      {/* Popover component for video preview */}
      <Popover addVideo={addVideo} setAddVideo={onClickAdd} isOpen={isPopoverOpen} onClose={handlePopoverClose} videoData={{ title, duration, date, videoUrl }} id={video._id} />
    </div>
  );
};

export default VideoCard;
