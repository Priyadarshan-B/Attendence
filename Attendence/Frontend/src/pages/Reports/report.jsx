import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import requestApi from "../../components/utils/axios";
import Select from "react-select";
import Button from "../../components/Button/Button";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import customStyles from "../../components/applayout/selectTheme";
import moment from "moment";
import "./report.css";

function ReportPage() {
  return <Body />;
}

function Body() {
  const [absentYear, setAbsentYear] = useState();
  const [presentYear, setPresentYear] = useState();
  const [absentDate, setAbsentDate] = useState(null);
  const [presentDate, setPresentDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [slotYear, setSlotYear] = useState();
  const [slot, setSlot] = useState([]);
  const [slotOptions, setSlotOptions] = useState([]);
  const [absentSlotDate, setAbsentSlotDate] = useState(null);
  const [presentSlot, setPresentSlot] = useState([]);
  const [presentSlotYear, setPresentSlotYear] = useState(null);
  const [presentSlotDate, setPresentSlotDate] = useState(null);
  const [presentSlotOptions, setPresentSlotOptions] = useState([]);
  const [consolidateFDate, setConsolidateFDate] = useState(null);
  const [consolidateTDate, setConsolidateTDate] = useState(null);
  const [conYear, setConYear] = useState();

  const handleDownload = async (type) => {
    try {
      let apiEndpoint;
      let fileName;
      let requestBody;

      if (type === "absent") {
        apiEndpoint = `/ab-report?year=${absentYear.value}&date=${formatDate(
          absentDate
        )}`;
        fileName = `studentsAbsent-${absentYear.value}-${formatDate(
          absentDate
        )}.xlsx`;
      } else if (type === "present") {
        apiEndpoint = `/pre-report?year=${presentYear.value}&date=${formatDate(
          presentDate
        )}`;
        fileName = `studentsPresent-${presentYear.value}-${formatDate(
          presentDate
        )}.xlsx`;
      } else if (type === "student") {
        const year = selectedYear?.value || "All";
        apiEndpoint = `/student-report?year=${year}`;
        fileName = `StudentReport-${year}.xlsx`;
      } else if (type === "absent-slot") {
        apiEndpoint = `/abs-report?year=${slotYear.value}&date=${formatDate(
          absentSlotDate
        )}&slot=${slot.value || "All"}`;
        fileName = `studentsAbsent-${slotYear.value}-${formatDate(
          absentSlotDate
        )}.xlsx`;
      } else if (type === "present-slot") {
        apiEndpoint = `/pres-report?year=${
          presentSlotYear.value
        }&date=${formatDate(presentSlotDate)}&slot=${
          presentSlot.value || "All"
        }`;
        fileName = `studentsPresent-${presentSlotYear.value}-${formatDate(
          presentSlotDate
        )}-${presentSlot.label || "All"}.xlsx`;
      } 
      // consolidate
      else if (type === "consolidate") {
        apiEndpoint = `/consolidate?from_date=${formatDate(consolidateFDate)}&to_date=${formatDate(consolidateTDate)}&year=${conYear.value}`;
        fileName = `ConsolidateReport-${conYear?.value || "All"}-${formatDate(
          consolidateFDate
        )}-to-${formatDate(consolidateTDate)}.xlsx`;
        console.log("Request Body:", requestBody);
      }


      if (!apiEndpoint || !fileName) return;

      const response = await requestApi("GET", apiEndpoint);
      let data = response.data;
      console.log("API Response Data:", data);

      let workbook = XLSX.utils.book_new();
      let worksheet;

      if (type === "absent-slot") {
        const totalAbsentStudents = `Total Absent Students: ${data.total_absent_students}`;
        const totalAbsentRow = [totalAbsentStudents];
        const studentHeader = [
          "student_name",
          "register_number",
          "mail",
          "mentor_name",
          "slot",
        ];
        const studentRows = data.students.map(
          ({ student_name, register_number, mail, mentor_name, slot }) => [
            student_name,
            register_number,
            mail,
            mentor_name,
            slot,
          ]
        );
        worksheet = XLSX.utils.aoa_to_sheet([
          totalAbsentRow,
          [],
          [],
          studentHeader,
          ...studentRows,
        ]);
      } else if (type === "present-slot") {
        const totalPresentStudents = `Total Present Students: ${data.total_present_students}`;
        const totalPresentRow = [totalPresentStudents];
        const studentHeader = [
          "student_name",
          "register_number",
          "mail",
          "mentor_name",
          "attendance_taken",
          "slot",
        ];
        const studentRows = data.students.map(
          ({
            student_name,
            register_number,
            mail,
            mentor_name,
            attendance_taken,
            slot,
          }) => [
            student_name,
            register_number,
            mail,
            mentor_name,
            attendance_taken,
            slot,
          ]
        );
        worksheet = XLSX.utils.aoa_to_sheet([
          totalPresentRow,
          [],
          [],
          studentHeader,
          ...studentRows,
        ]);
      } else if (type === "consolidate") {
        if (!data.attendance_details || !data.student_summary) {
          throw new Error("Invalid data format: Missing 'attendance_details' or 'student_summary'");
        }
      
        let attendanceDetails = data.attendance_details;
        let studentSummary = data.student_summary;
      
        // Collect unique dates
        let dates = [...new Set(attendanceDetails.map(detail => detail.date))];
      
        // Create a map for student attendance
        let studentsMap = {};
      
        attendanceDetails.forEach(detail => {
          detail.attendance.forEach(entry => {
            if (!studentsMap[entry.student_id]) {
              studentsMap[entry.student_id] = {
                student_name: entry.student_name,
                register_number: entry.register_number,
                gmail: entry.gmail,
                attendance: {},
                total_present: 0,
                total_absent: 0,
                total_days: 0,
                percentage_present: "0.00"
              };
            }
            studentsMap[entry.student_id].attendance[detail.date] = entry.STATUS;
          });
        });
      
        studentSummary.forEach(summary => {
          if (studentsMap[summary.student_id]) {
            studentsMap[summary.student_id].total_present = summary.total_present;
            studentsMap[summary.student_id].total_absent = summary.total_absent;
            studentsMap[summary.student_id].total_days = summary.total_days;
            studentsMap[summary.student_id].percentage_present = summary.percentage_present;
          }
        });
      
        // Prepare headers
        let headers = ["Name", "Register Number", "Email", ...dates, "Present", "Absent", "Total Days", "Percentage"];
        let rows = [];
      
        Object.values(studentsMap).forEach(student => {
          let row = [
            student.student_name,
            student.register_number,
            student.gmail,
            ...dates.map(date => student.attendance[date] || "NA"),
            student.total_present,
            student.total_absent,
            student.total_days,
            student.percentage_present
          ];
          rows.push(row);
        });
      
        let worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      
        XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidate Report");
        XLSX.writeFile(workbook, fileName);
      }
    } catch (error) {
      console.error(`Error downloading the ${type} report`, error);
    }
  };

  useEffect(() => {
    if (slotYear) {
      fetchSlotOptions(slotYear.value, "absent");
    }
  }, [slotYear]);

  useEffect(() => {
    if (presentSlotYear) {
      fetchSlotOptions(presentSlotYear.value, "present");
    }
  }, [presentSlotYear]);

  const fetchSlotOptions = async (year, type) => {
    try {
      const response = await requestApi("GET", `/slot-year?year=${year}`);
      const slots = response.data.map((slot) => ({
        value: slot.id,
        label: slot.label,
      }));

      const allOption = { value: "All", label: "All" };
      const All = { value: "AllSlots", label: "All Slots" };
      const updatedSlots = [allOption, All, ...slots];

      if (type === "absent") {
        setSlotOptions(updatedSlots);
      } else if (type === "present") {
        setPresentSlotOptions(updatedSlots);
      }
    } catch (error) {
      console.error("Error fetching slot options:", error);
    }
  };

  // Using moment.js for date formatting
  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  const yearOptions = [
    { value: "All", label: "All" },
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];


  return (
    <div className="report-container">
      <h2>Summary</h2>
      <div className="report-flex">
        <div className="absentReport" style={{ flex: "1" }}>
          <h3>Absentee Report</h3>
          <br />
          <div>
            <div className="select-date">
              <div style={{ flex: "1", width: "300px" }}>
                <Select
                  value={absentYear}
                  onChange={setAbsentYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", textAlign: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={absentDate}
                    onChange={(newValue) => setAbsentDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <Button
              onClick={() => handleDownload("absent")}
              label="Download Absent Report"
            />
          </div>
        </div>
        <div className="presentReport" style={{ flex: "1" }}>
          <h3>Present Report</h3>
          <br />
          <div>
            <div className="select-date">
              <div style={{ flex: "1", width: "300px" }}>
                <Select
                  value={presentYear}
                  onChange={setPresentYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", textAlign: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={presentDate}
                    onChange={(newValue) => setPresentDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <Button
              onClick={() => handleDownload("present")}
              label="Download Present Report"
            />
          </div>
        </div>
        <div className="presentReport">
          <h3>Student Report</h3>
          <br />
          <div className="select-year">
            <div style={{ flex: "1", width: "300px" }}>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
                styles={customStyles}
                placeholder="Select Year.."
                isClearable
              />
            </div>
            <Button
              onClick={() => handleDownload("student")}
              label="Download Student Report"
            />
          </div>
        </div>
        <div className="presentReport">
          <h3>Absent Report(Slot Wise)</h3>
          <br />
          <div className="select-year">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ flex: "1" }}>
                <Select
                  value={slotYear}
                  onChange={setSlotYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1" }}>
                <Select
                  value={slot}
                  onChange={setSlot}
                  options={slotOptions}
                  styles={customStyles}
                  placeholder="Select Slot.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", textAlign: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={absentSlotDate}
                    onChange={(newValue) => setAbsentSlotDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <Button
              onClick={() => handleDownload("absent-slot")}
              label="Download Absent Slot Report"
            />
          </div>
        </div>
        <div className="presentReport">
          <h3>Present Report (Slot Wise)</h3>
          <br />
          <div className="select-year">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div style={{ flex: "1" }}>
                <Select
                  value={presentSlotYear}
                  onChange={setPresentSlotYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1" }}>
                <Select
                  value={presentSlot}
                  onChange={setPresentSlot}
                  options={presentSlotOptions}
                  styles={customStyles}
                  placeholder="Select Slot.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", textAlign: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={presentSlotDate}
                    onChange={(newValue) => setPresentSlotDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <Button
              onClick={() => handleDownload("present-slot")}
              label="Download Present Slot Report"
            />
          </div>
        </div>
        <div className="presentReport">
          <h3>Consolidate Report</h3>
          <br />
          <div className="select-year">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <Select
                value={conYear}
                onChange={(e) => setConYear(e)}
                options={yearOptions}
                placeholder="Select Year"
                styles={customStyles}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={consolidateFDate}
                  onChange={(newValue) => setConsolidateFDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={consolidateTDate}
                  onChange={(newValue) => setConsolidateTDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <Button
                name="Download"
                className="save-btn"
                onClick={() => handleDownload("consolidate")}
                label='Download Consolidate Report..'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
