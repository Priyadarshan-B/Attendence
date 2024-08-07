import React, { useState, useEffect } from "react";
import "./styles.css";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import requestApi from "../utils/axios";
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import LibraryBooksTwoToneIcon from '@mui/icons-material/LibraryBooksTwoTone';
import BookmarkAddedTwoToneIcon from '@mui/icons-material/BookmarkAddedTwoTone';
import TravelExploreTwoToneIcon from '@mui/icons-material/TravelExploreTwoTone';
import ExploreTwoToneIcon from '@mui/icons-material/ExploreTwoTone';
import DangerousTwoToneIcon from '@mui/icons-material/DangerousTwoTone';
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
// import colors from "react-multi-date-picker/plugins/colors";

function getIconComponent(iconPath) {
  switch (iconPath) {
    case "TravelExploreTwoToneIcon":
      return TravelExploreTwoToneIcon;
    case "AssignmentTwoToneIcon":
      return AssignmentTwoToneIcon;
    case "LibraryBooksTwoToneIcon":
      return LibraryBooksTwoToneIcon;
    case "BookmarkAddedTwoToneIcon":
      return BookmarkAddedTwoToneIcon;
    case "ExploreTwoToneIcon":
      return ExploreTwoToneIcon;
    case "CalendarMonthTwoToneIcon":
      return CalendarMonthTwoToneIcon;
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
        const role = Cookies.get('role');
        const response = await requestApi("GET", `/auth/resources?role=${role}`);
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
    const activeItem = sidebarItems.find(item => item.path === pathname);
    if (activeItem) {
      setActiveItem(activeItem.name);
    }
  }, [location, sidebarItems]);

  return (
    <div
      className={props.open ? "app-sidebar sidebar-open" : "app-sidebar"}
      style={{
        backgroundColor: "white",
        borderRight: "0.1px solid rgba(128, 128, 128, 0.296)"
      }}
    >
      <ul className="list-div">
        {sidebarItems.map(item => (
          <li
            key={item.path}
            className={`list-items ${activeItem === item.name ? "active" : ""}`}
            onClick={() => setActiveItem(item.name)}
          >
            <Link className="link" to={item.path}>
              {/* Dynamically render the icon component */}
              {getIconComponent(item.icon_path) && React.createElement(getIconComponent(item.icon_path), { sx: { marginRight: "10px", color:"#1c0c6a" } })}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
