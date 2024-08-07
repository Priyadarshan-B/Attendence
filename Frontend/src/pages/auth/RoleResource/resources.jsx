import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const RoleCheck = (WrappedComponent, allowedRoles) => {
  return (props) => {
    const role = Cookies.get("role");

    if (allowedRoles.includes(parseInt(role))) {
      return <WrappedComponent {...props} />;
    } else {
      return <Navigate to="*" />;
    }
  };
};

export default RoleCheck;
