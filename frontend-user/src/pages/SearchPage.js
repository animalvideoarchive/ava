import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchPage.css";
import { styled } from "@mui/material/styles";
import SearchBar from "../components/Input/SearchBar";
import logo from "../assets/images/logo/logo.png";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

import Typography from "@mui/material/Typography";
import { api_baseurl } from "../constants";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { DatePicker } from "antd";
import VideoCard from "../components/Display/VideoCard";
import { CartContext } from "../components/CartContext";
const { RangePicker } = DatePicker;
const Accordion = styled((props) => <MuiAccordion disableGutters elevation={2} square {...props} />)(({ theme }) => ({
  backgroundColor: "#EEECE5",
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />} {...props} />)(({ theme }) => ({
  backgroundColor: "#EEECE5",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const options = {
  duration: [
    { label: "5 - 10 Minutes", value: "5 - 10 Min" },
    { label: "10 - 30 Minutes", value: "10 - 30 Min" },
    { label: "30 - 60 Minutes", value: "30 - 60 Min" },
    { label: "1 - 3 Hours", value: "1 - 3 Hr" },
    { label: "3 - 5 Hours", value: "3 - 5 Hr" },
    { label: "More than 5 Hours", value: "> 5 Hr" },
  ],

  zoooraquarium: [{ label: "Saint Louis Zoo", value: "saint-louis-zoo" }],
  groupsize: [
    { label: "One Animal", value: "One Animal" },
    { label: "Two Animals", value: "Two Animals" },
    { label: "Three or More Animals", value: "Three or more Animals" },
  ],
  sexofanimals: [
    { label: "Only Males", value: "Males" },
    { label: "Only Females", value: "Female" },
    { label: "Any/All", value: "Mixed" },
  ],

  ageofindividuals: [
    { label: "Adult", value: "Adult" },
    { label: "Juvenile", value: "Juvenile" },
    { label: "Infant", value: "Infant" },
  ],
  animalvisibility: [
    { label: "Publicly Viewable", value: "Publicly viewable" },
    { label: "Behind-the-Scenes", value: "Behind-the-scenes" },
  ],
  areaoptions: [
    { label: "Indoor", value: "Indoor" },
    { label: "Outdoor", value: "Outdoor" },
  ],
  videocontext: [
    //not in lambda
    { label: "Normal circumstances", value: "Normal circumstances" },
    { label: "An experimental manipulation of the subject or its environment", value: "An experimental manipulation of the subject or its environment" },
    { label: "Rare/unusual life events", value: "Rare/unusual life events" },
  ],
  datacollection: [
    //not in lambda

    { label: "Completed", value: "Yes" },
    { label: "Not Collected", value: "No" },
  ],
};
const SearchPage = () => {
  const [expanded, setExpanded] = useState({
    duration: true,
    zoooraquarium: true,
    sexofanimals: true,
    groupsize: true,
    ageofindividuals: true,
    animalvisibility: true,
    areaoptions: true,
    videocontext: true,
    datacollection: true,
    videodate: true,
    commonname: true,
    scientificname: true,
    starttime: true,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addVideoToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // State for inputs
  const filtersTemplate = {
    keyword: "",
    duration: "",
    zoooraquarium: "",
    sexofanimals: "",
    groupsize: "",
    ageofindividuals: "",
    animalvisibility: "",
    areaoptions: "",
    videocontext: "",
    datacollection: "",
    // non checkbox or radio
    // videodate: [null, null],
    commonname: "",
    scientificname: "",
    // starttime: ["", ""],
  };
  const [filters, setFilters] = useState(filtersTemplate);
  const [videodate, setVideoDate] = useState([null, null]); // State to hold the selected range

  // Helper function to format the date in MM-DD-YYYY
  const formatDate = (tDate) => {
    const date = tDate.$d;
    const month = date.getMonth() + 1; // Months are 0-based, so add 1
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}-${year}`;
  }; // Handle the change event
  const onVideoDateChange = (value, dateString) => {
    setVideoDate(value); // Update the state with the new selected range
    const formattedDates = value.map((date) => formatDate(date));
    filterChange(formattedDates, "videodate");
  };
  const handleAccordianChange = (key) => (event, value) => {
    setExpanded((prev) => {
      prev = { ...prev, [key]: value };
      return prev;
    });
  };
  const filterChange = (value, key) => {
    setFilters((prev) => {
      prev = { ...prev, [key]: value };
      return prev;
    });
  };
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const cleanedObj = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""));
      // // Make API call with the filters
      const response = await fetch(api_baseurl + "/GetSearchResults", {
        method: "POST", // or 'GET', depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: cleanedObj,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSearchResults(data.body); // Adjust based on your API response structure
      setShowResults(true);
      console.log("cleanedobj", cleanedObj);
      console.log("data", data.body);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <aside className="sidebar" style={{ position: "sticky", top: 0, left: 0, width: "30%" }}>
        <div className="filter-header-container">
          <h3 className="filter-header">Filters/Tags</h3>

          <button
            onClick={() => {
              setFilters(filtersTemplate); // Reset filters to initial state
              setVideoDate([null, null]); // Reset video date filter
              // setSearchResults([]); // Optionally, clear search results
              // setShowResults(false); // Optionally, hide results
              // setSearchClicked(false); // Reset search clicked state
            }}
            className="reset"
          >
            Reset
          </button>
        </div>

        <div className="accordion-container">
          {/* Video Duration Filter */}
          <Accordion expanded={expanded.duration} onChange={handleAccordianChange("duration")}>
            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
              <Typography>Video Duration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "duration");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  name="radio-buttons-group"
                >
                  {options.duration.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.duration === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Video Date Filter */}
          <Accordion expanded={expanded.videodate} onChange={handleAccordianChange("videodate")}>
            <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
              <Typography>Video Date</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RangePicker
                  value={videodate} // Controlled value, tied to the state
                  onChange={onVideoDateChange} // Update state on change
                  format="YYYY-MM-DD" // Optional: specify the date format
                />
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Zoo or Aquarium Filter */}
          <Accordion expanded={expanded.zoooraquarium} onChange={handleAccordianChange("zoooraquarium")} defaultValue="saint-louis-zoo">
            <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
              <Typography>Zoo or Aquarium</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  // onChange={(e) => {
                  //   filterChange(e.target.value, "zoooraquarium");
                  // }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.zoooraquarium.map((option) => (
                    <FormControlLabel key={option.value} checked={true} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Common Name Filter */}
          <Accordion expanded={expanded.commonname} onChange={handleAccordianChange("commonname")}>
            <AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
              <Typography>Common Name</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <input
                  type="text"
                  value={filters.commonname}
                  onChange={(e) => {
                    filterChange(e.target.value, "commonname");
                  }}
                />
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Scientific Name Filter */}
          <Accordion expanded={expanded.scientificname} onChange={handleAccordianChange("scientificname")}>
            <AccordionSummary aria-controls="panel5d-content" id="panel5d-header">
              <Typography>Scientific Name</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <input
                  type="text"
                  value={filters.scientificname}
                  onChange={(e) => {
                    filterChange(e.target.value, "scientificname");
                  }}
                />
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Group Size Filter */}
          <Accordion expanded={expanded.groupsize} onChange={handleAccordianChange("groupsize")}>
            <AccordionSummary aria-controls="panel6d-content" id="panel6d-header">
              <Typography>Group Size</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "groupsize");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.groupsize.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.groupsize === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Sex Filter */}
          <Accordion expanded={expanded.sexofanimals} onChange={handleAccordianChange("sexofanimals")}>
            <AccordionSummary aria-controls="panel7d-content" id="panel7d-header">
              <Typography>Sex(es) of animals</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "sexofanimals");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.sexofanimals.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.sexofanimals === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Life Stages Filter */}
          <Accordion expanded={expanded.ageofindividuals} onChange={handleAccordianChange("ageofindividuals")}>
            <AccordionSummary aria-controls="panel8d-content" id="panel8d-header">
              <Typography>Life Stages in video</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "ageofindividuals");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.ageofindividuals.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.ageofindividuals === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Animal Visibility Filter */}
          <Accordion expanded={expanded.animalvisibility} onChange={handleAccordianChange("animalvisibility")}>
            <AccordionSummary aria-controls="panel9d-content" id="panel9d-header">
              <Typography>Animal Visibility</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "animalvisibility");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.animalvisibility.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.animalvisibility === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Area Filter */}
          <Accordion expanded={expanded.areaoptions} onChange={handleAccordianChange("areaoptions")}>
            <AccordionSummary aria-controls="panel10d-content" id="panel10d-header">
              <Typography>Is this video from an Indoor or Outdoor area?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "areaoptions");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.areaoptions.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.areaoptions === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Video Collected During Filter */}
          <Accordion expanded={expanded.videocontext} onChange={handleAccordianChange("videocontext")}>
            <AccordionSummary aria-controls="panel11d-content" id="panel11d-header">
              <Typography>Video Collected During</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "videocontext");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.videocontext.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.videocontext === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Data Collection Ongoing Filter */}
          <Accordion expanded={expanded.datacollection} onChange={handleAccordianChange("datacollection")}>
            <AccordionSummary aria-controls="panel14d-content" id="panel14d-header">
              <Typography>Data Collection Ongoing</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: " 10px" }}>
                <RadioGroup
                  onChange={(e) => {
                    filterChange(e.target.value, "datacollection");
                  }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue=""
                  name="radio-buttons-group"
                >
                  {options.datacollection.map((option) => (
                    <FormControlLabel key={option.value} checked={filters.duration === option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Start Time Filter */}
          <Accordion expanded={expanded.starttime} onChange={handleAccordianChange("starttime")}>
            <AccordionSummary aria-controls="panel16d-content" id="panel16d-header">
              <Typography>Start Time</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: "grid", gap: "10px" }}>
                <input type="time" />
                <input type="time" />
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </aside>

      <main className="main-content">
        <div className="main-container">
          {!searchClicked && <img src={logo} alt="Logo" className="logo" />}
          <div className="search-bar-wrapper">
            <SearchBar handleSearch={handleSearch} filters filterChange={filterChange} />
          </div>

          {/* Search Results Display */}
          {showResults && (
            <div className="results-container">
              {searchResults.length > 0 ? <h2>Search Results</h2> : <h2>No Search Results Found</h2>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {searchResults.map((result) => (
                  <VideoCard
                    video={result}
                    key={result.id}
                    title={result._source.commonname}
                    duration={result._source.duration}
                    date={result._source.videodate}
                    thumbnailUrl={result._source.presigned_thumbnailstartpath}
                    videoUrl={result._source.presigned_clippedvideopath}
                    handleButtonClick={() => addVideoToCart(result)} // Define your button click handler
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchPage;

//duration mapping
//data collection ongoing
// start date
