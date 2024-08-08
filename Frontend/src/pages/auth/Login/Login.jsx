import React, { useEffect, useState } from "react";
import "./Login.css";
import google from "../../../assets/google.png";
// import Globalization from "../../../assets/Globalization.gif";
import LoginGif from "../../../assets/Calendar.gif"
import apiHost from "../../../components/utils/api";

function Login() {
  const handleGoogleLogin = () => {
    window.location.href = `${apiHost}/auth/google`;
  };

  return (
    <div>
      <div className="total-login-page">
        <div className="login-card">
          <img src={LoginGif} alt="Login Image" className="login-image" />
          <button className="signin-button" onClick={handleGoogleLogin}>
            <img src={google} alt="GoogleImage" className="google-logo" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
