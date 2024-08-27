import React, { useState, useEffect } from "react";
import "./styles.css";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../utils/axios";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HikingRoundedIcon from "@mui/icons-material/HikingRounded";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import AdminPanelSettingsSharpIcon from "@mui/icons-material/AdminPanelSettingsSharp";
import ReceiptLongSharpIcon from "@mui/icons-material/ReceiptLongSharp";
import WorkOffIcon from "@mui/icons-material/WorkOff";
import SchoolIcon from "@mui/icons-material/School";
import AddTaskIcon from '@mui/icons-material/AddTask';

function getIconComponent(iconPath) {
  switch (iconPath) {
    case "DashboardRoundedIcon":
      return DashboardRoundedIcon;
    case "HikingRoundedIcon":
      return HikingRoundedIcon;
    case "CalendarMonthIcon":
      return CalendarMonthIcon;
    case "DateRangeIcon":
      return DateRangeIcon;
    case "ScheduleSendIcon":
      return ScheduleSendIcon;
    case "AdminPanelSettingsSharpIcon":
      return AdminPanelSettingsSharpIcon;
    case "ReceiptLongSharpIcon":
      return ReceiptLongSharpIcon;
    case "WorkOffIcon":
      return WorkOffIcon;
    case "SchoolIcon":
      return SchoolIcon;
    case "AddTaskIcon":
      return AddTaskIcon

    default:
      // If the icon path is not found, return a default icon or null
      return null;
  }

  // return eval(iconPath)
}

function SideBar(props) {
  const [activeItem, setActiveItem] = useState("");
  const [sidebarItems, setSidebarItems] = useState([]);

  const location = useLocation();

  useEffect(() => {
    const fetchSidebarItems = async () => {
      try {
        // Decrypt the role from cookies
        const encryptedGmail = Cookies.get("role");
        const bytes = CryptoJS.AES.decrypt(encryptedGmail, "secretKey123");
        const decryptedGmail = bytes.toString(CryptoJS.enc.Utf8);

        const response = await requestApi(
          "GET",
          `/auth/resources?role=${decryptedGmail}`
        );
        if (response.success) {
          setSidebarItems(response.data);
        } else {
          console.error("Error fetching sidebar items:", response.error);
        }
      } catch (error) {
        console.error("Error fetching sidebar items:", error);
      }
    };

    fetchSidebarItems();
  }, []);

  useEffect(() => {
    // Extract the pathname from the location object
    const pathname = location.pathname;

    // Set the active item based on the current pathname
    const activeItem = sidebarItems.find((item) => item.path === pathname);
    if (activeItem) {
      setActiveItem(activeItem.name);
    }
  }, [location, sidebarItems]);

  return (
    <div
      className={props.open ? "app-sidebar sidebar-open" : "app-sidebar"}
      style={{
        backgroundColor: "#ffffff",
        borderRight: "1px solid #f2f2f2",
        // borderRight: "0.1px solid rgba(128, 128, 128, 0.296)"
      }}
    >
      <ul className="list-div">
        {sidebarItems.map((item) => (
          <li
            key={item.path}
            className={`list-items ${activeItem === item.name ? "active" : ""}`}
            onClick={() => setActiveItem(item.name)}
          >
            <Link className="link" to={item.path}>
              {getIconComponent(item.icon_path) &&
                React.createElement(getIconComponent(item.icon_path), {
                  sx: {
                    marginRight: "10px",
                    backgroundColor: "white",
                    color: "#2c7cf3",
                    padding: "2px",
                    borderRadius: "5px",
                  },
                })}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
