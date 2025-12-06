import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./NavBar.css";

export default function NavBar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          TruSky
        </Link>

        <div className="nav-links">
          <Link
            to="/weather"
            className={`nav-item ${isActive("/weather") ? "active" : ""}`}
          >
            Weather
          </Link>

          <Link
            to="/sports"
            className={`nav-item ${isActive("/sports") ? "active" : ""}`}
          >
            Sports
          </Link>
        </div>
      </div>

      {/* Right Section */}
      <div className="nav-right">
        <Link
          to="/account"
          className={`nav-icon ${isActive("/account") ? "active" : ""}`}
        >
          <FaUserCircle size={30} />
        </Link>
      </div>
    </nav>
  );
}

