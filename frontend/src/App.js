import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CloudWatchDashboard from "./components/Dashboard";

export default function App() {
  return (
    <Router>
      <div style={{ scrollBehavior: "smooth", overflowX: "hidden" }}>
        <LandingPage />
        <div style={{ height: "100vh" }}>
          <CloudWatchDashboard />
        </div>
      </div>
    </Router>
  );
}
