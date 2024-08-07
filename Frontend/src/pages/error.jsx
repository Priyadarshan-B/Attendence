import React from "react";
import './auth/Login/Login.css'
import { Link } from "react-router-dom";
import error from "../assets/error.png"

function Error() {
  return (
    <div className="error-page">
      <div className="error-card">
        
          <img src={error} alt="404" className="error-img"/>
        
        <p
          style={{
            margin: "0px",
            color: "#1c0c6a",
            fontWeight: "700",
          }}
        >
          OOPS! PAGE NOT FOUND
        </p>
        <Link style={{ fontWeight: "700" }} to="/login">
          BACK TO LOGIN
        </Link>
      </div>
    </div>
  );
}

export default Error;
