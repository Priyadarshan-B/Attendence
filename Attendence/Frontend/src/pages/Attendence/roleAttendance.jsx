import React, { useState, useEffect } from "react";
import Select from "react-select"; // Import react-select for the dropdown
import debounce from "lodash/debounce";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import RoleCheck from "../auth/RoleResource/resources";
import Cookies from "js-cookie";
import InputBox from "../../components/TextBox/textbox";
import "./attendence.css";


function RoleAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [roles, setRoles] = useState([]); // State for role dropdown options
  const [selectedRole, setSelectedRole] = useState(null); // State for selected role

  const id = Cookies.get("id");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await requestApi("GET", "/map-role");
        setRoles(
          response.data.map((role) => ({
            value: role.id,
            label: role.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const fetchData = async (roleId) => {
    console.log(roleId)
    try {
      const studentResponse = await requestApi(
        "GET",
        `/role-student?role=${roleId}`
      );
      setData(studentResponse.data);
      setFilterData(studentResponse.data);
    } catch (error) {
      console.error("Error fetching Role attendance data:", error);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchData(selectedRole.value); 
      console.log(selectedRole.value)
    }
  }, [selectedRole]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await requestApi("GET", "/slots");
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    fetchTimeSlots();
  }, []);

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const formattedTime = `${hours}:${minutes}${ampm}`;
    setCurrentTime(formattedTime);
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = data.filter(
      (student) =>
        student.name.toLowerCase().includes(value) ||
        student.register_number.toLowerCase().includes(value)
    );

    setFilterData(filtered);
  };

  const parseTime = (time) => {
    const match = time.match(/(\d{1,2}):(\d{2})(AM|PM)/);
    if (!match) return null;
    let [_, hour, minute, ampm] = match;
    hour = parseInt(hour);
    minute = parseInt(minute);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const getEnabledSlots = () => {
    const current = parseTime(currentTime);
    if (current === null) return [];

    return timeSlots.filter((slot) => {
      const start = parseTime(slot.start_time);
      const end = parseTime(slot.end_time);
      return current >= start && current <= end;
    });
  };

  const enabledSlots = getEnabledSlots();

  const handleCheckboxClick = async (event, studentId, slotId) => {
    event.stopPropagation();
    try {
      const isChecked = attendanceData.some(
        (record) => record.student === studentId && record.slot === slotId
      );

      if (isChecked) {
        await requestApi("POST", "/role-student", {
          role: selectedRole.value, 
          student: studentId,
          slot: slotId,
        });
      } else {
        console.log("sabaschjs")
        console.log(selectedRole.value)
        console.log(studentId, slotId)
        await requestApi("POST", "/role-student", {
          role: selectedRole.value, 
          student: studentId,
          slot: slotId,
        });
      }

      setAttendanceData((prev) => {
        if (isChecked) {
          return prev.filter(
            (record) =>
              !(record.student === studentId && record.slot === slotId)
          );
        } else {
          return [...prev, { student: studentId, slot: slotId }];
        }
      });
    } catch (error) {
      console.error("Error handling attendance data:", error);

      if (error.response && error.response.data) {
        alert(
          `Error: ${
            error.response.data.error ||
            "An error occurred while handling attendance."
          }`
        );
      } else {
        alert("Student is not approved.");
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    event.preventDefault();
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (rowId) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  const renderTimeSlots = (row) => {
    return (
      <div className="time-slots">
        {timeSlots.map((slot) => (
          <div key={slot.id} className="time-slot">
            <input
              type="checkbox"
              checked={attendanceData.some(
                (record) =>
                  record.student === row.id && record.slot === slot.id
              )}
              onChange={(event) =>
                handleCheckboxClick(event, row.id, slot.id)
              }
              disabled={false}
              onClick={(event) => event.stopPropagation()}
            />
            <span>{slot.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="attendance-container">
      <h2>Role Students Attendance (Hour Wise)</h2>

      <div className="flex-box">
        <h4>NIP / Re Appear Student List</h4>
<div className="react-select">
  
          <Select
            options={roles}
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder="Select Role..."
            className="role-select"
          />
</div>

        <div>
          <InputBox
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: "300px" }}
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="att-table">
        <table className="custom-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Register Number</th>
            </tr>
          </thead>
          <tbody>
            {filterData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr onClick={() => handleRowClick(row.id)}>
                    <td>{page * rowsPerPage + index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.register_number}</td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr>
                      <td colSpan="3">{renderTimeSlots(row)}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={(event) => handleChangePage(event, page - 1)}
            disabled={page === 0}
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {Math.ceil(filterData.length / rowsPerPage)}
          </span>
          <button
            onClick={(event) => handleChangePage(event, page + 1)}
            disabled={page >= Math.ceil(filterData.length / rowsPerPage) - 1}
          >
            Next
          </button>
          <div>
            Rows per page:{" "}
            <select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
              {[5, 10, 15, 25, 100].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleAttendance;