import React, { useState, useEffect } from "react";
import RenderJson from "./RenderJson"; // Import the RenderJson component

const App = () => {
  const [data, setData] = useState([]);

  // Fetch JSON data from the public directory
  useEffect(() => {
    fetch("/input.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <RenderJson data={data} />
    </div>
  );
};

export default App;
