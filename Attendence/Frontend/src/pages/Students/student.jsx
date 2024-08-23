import React, { useEffect, useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import "../Stu_Dashboard/stu_dashboard.css";
import Chart from "react-apexcharts";
import LiquidGauge from "react-liquid-gauge";
import moment from "moment";
import EventAvailableTwoToneIcon from "@mui/icons-material/EventAvailableTwoTone";
import EventBusyTwoToneIcon from "@mui/icons-material/EventBusyTwoTone";
import calendar from "../../assets/calendar.png";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import Select from "react-select";

function Student() {
  return <AppLayout rId={2} body={<Body />} />;
}

function Body() {
  const [yearOptions, setYearOptions] = useState([
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentDetails, setStudentDetails] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [attendancePercent, setAttendancePercent] = useState({});
  const [percent, setPercent] = useState([]);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pageNip, setPageNip] = useState(0);
  const [rowPage, setRowPage] = useState(5);

  function calculateTimeLeft() {
    const now = new Date();
    const nextWednesday = new Date(
      now.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7 || 7))
    );
    nextWednesday.setHours(0, 0, 0, 0);
    const difference = +nextWednesday - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const fetchStudentOptions = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/all-students?year=${selectedYear}`
        );
        const students = response.data.map((student) => ({
          value: student.id,
          label: `${student.name}-${student.register_number}`,
        }));
        setStudentOptions(students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    if (selectedYear) {
      fetchStudentOptions();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedStudent) return;

    const fetchStudentData = async () => {
      try {
        const studentResponse = await requestApi(
          "GET",
          `/student-details?id=${selectedStudent}`
        );
        setStudentDetails(studentResponse.data[0]);

        const attendanceResponse = await requestApi(
          "GET",
          `/percent?student=${selectedStudent}`
        );
        setAttendancePercent(attendanceResponse.data);
        setPercent(parseFloat(attendanceResponse.data.attendance_percentage));

        const attendanceRecordsResponse = await requestApi(
          "GET",
          `/type2_attendence?student=${selectedStudent}`
        );
        setAttendanceRecords(attendanceRecordsResponse.data);

        const attendanceDetailsResponse = await requestApi(
          "GET",
          `/att-details?student=${studentResponse.data[0].register_number}`
        );
        if (attendanceDetailsResponse.data.error) {
          setAttendanceDetails([]);
          console.log(attendanceDetailsResponse.data.error);
        } else {
          setAttendanceDetails(attendanceDetailsResponse.data);
        }

        const leaveDetailsResponse = await requestApi(
          "GET",
          `/leave-student?student=${selectedStudent}`
        );
        setLeaveDetails(leaveDetailsResponse.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedStudent]);

  const todayDate = new Date()
    .toLocaleDateString("en-GB")
    .split("/")
    .join(" / ");
  const todayAttendance = attendanceDetails.filter(
    (detail) => detail.date === todayDate
  );
  const otherAttendance = attendanceDetails.filter(
    (detail) => detail.date !== todayDate
  );

  const timeIntervals = [
    { start: "08:00:00 AM", end: "10:00:00 AM" },
    { start: "12:00:00 PM", end: "03:00:00 PM" },
    { start: "07:00:00 PM", end: "09:00:00 PM" },
  ];

  const isTimeInRange = (time, start, end) => {
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes, seconds] = time.split(":");

      if (hours === "12") {
        hours = "00";
      }

      if (modifier === "PM") {
        hours = parseInt(hours, 10) + 12;
      }

      return `${hours}:${minutes}:${seconds}`;
    };

    const t = new Date(`1970-01-01T${parseTime(time)}Z`);
    const s = new Date(`1970-01-01T${parseTime(start)}Z`);
    const e = new Date(`1970-01-01T${parseTime(end)}Z`);

    return t >= s && t <= e;
  };

  const uniqueIntervals = timeIntervals.reduce((count, interval) => {
    if (
      todayAttendance.some((detail) =>
        isTimeInRange(detail.time, interval.start, interval.end)
      )
    ) {
      return count + 1;
    }
    return count;
  }, 0);

  const radialChartData = {
    series: [(uniqueIntervals / 3) * 100],
    options: {
      chart: {
        height: 300,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          track: {
            background: "#f5f5f5",
            strokeWidth: "100%",
          },
          dataLabels: {
            name: {
              fontSize: "22px",
              color: "black",
              offsetY: 0,
            },
            value: {
              color: "#111",
              fontSize: "16px",
              show: false,
              formatter: function (val) {
                return parseInt(val);
              },
            },
          },
        },
      },
      fill: {
        colors: ["#00E396"],
      },
      stroke: {
        lineCap: "round",
      },
      labels: [`${uniqueIntervals}/3`],
    },
  };

  const formatLeaveDate = (date) => {
    return moment(date).format("DD/MM/YYYY");
  };
  const formatLeaveTime = (time) => {
    return moment(time, "HH:mm:ss").format("hh:mm A");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handlePage = (event, newPage1) => {
    setPageNip(newPage1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeRowsPage = (event) => {
    setRowPage(parseInt(event.target.value, 10));
    setPageNip(0);
  };

  return (
    <div>
      <div className="dropdown">
        <div className="label-dropdown">
          <h4>Year</h4>
          <div
            style={{
              flex: "1",
            }}
          >
            <Select
              options={yearOptions}
              onChange={(option) => setSelectedYear(option?.value)}
              placeholder="Select Year"
            />
          </div>
        </div>
        <div className="label-dropdown">
          <h4>Student</h4>
          <div
            style={{
              flex: "1",
            }}
          >
            <Select
              options={studentOptions}
              onChange={(option) => setSelectedStudent(option?.value)}
              placeholder="Select Student"
              isDisabled={!selectedYear}
            />
          </div>
        </div>
      </div>
      {!selectedStudent ? (
        <div>Select a student to view details.</div>
      ) : !studentDetails ? (
        <div>Loading...</div>
      ) : (
        <>
          <h3>
            Biometric Details - {studentDetails.name} (
            {studentDetails.register_number}){" "}
          </h3>
          <div className="dashboard-flex">
            <div className="attendance-percentage-and-status">
              <div className="student-details-container">
                <div className="guage">
                  <h3>Attendance Percentage</h3>
                  <div>
                    <LiquidGauge
                      value={percent}
                      width={200}
                      height={150}
                      waveFrequency={2}
                      waveAmplitude={5}
                      waveAnimation={true}
                      waveCount={10}
                      circleStyle={{
                        fill: "#55e77a",
                      }}
                      waveStyle={{
                        fill: "#35dc61",
                      }}
                    />
                  </div>
                </div>
                <div className="student-details">
                  {/* <div className="detail-row">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{studentDetails.name}</div>
              </div> */}
                  <div className="detail-row">
                    <div className="detail-label">Register Number:</div>
                    <div className="detail-value">
                      {studentDetails.register_number}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Attendance Status:</div>
                    <div className="detail-value">
                      {studentDetails.att_status === "1" ? (
                        <span>
                          <h5 style={{ color: "#4dcd6e" }}>Approved..</h5>
                        </span>
                      ) : (
                        <h5 className="n_approve">Pending Approval..</h5>
                      )}
                    </div>
                  </div>
                  {studentDetails.att_status === "1" && (
                    <div className="detail-row">
                      <div className="detail-label">Time Left:</div>
                      <div
                        className="time"
                        style={{
                          color: "#4c91e2",
                          fontSize: "17px",
                          fontWeight: "600",
                        }}
                      >
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                        {timeLeft.seconds}s
                      </div>
                    </div>
                  )}
                  <div className="detail-row">
                    <div className="detail-label">Today's Attendance:</div>
                    <div
                      className="time"
                      style={{
                        fontSize: "17px",
                        fontWeight: "600",
                      }}
                    >
                      {attendancePercent.present_absent &&
                        attendancePercent.present_absent.length > 0 &&
                        attendancePercent.present_absent.map(
                          (attendance, index) => {
                            const forenoonStatus =
                              attendance.forenoon === "1" ? "P" : "A";
                            const afternoonStatus =
                              attendance.afternoon === "1" ? "P" : "A";
                            return (
                              <h4 key={index}>
                                {forenoonStatus} | {afternoonStatus}
                              </h4>
                            );
                          }
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="attendance-percent-container">
                <h3
                  style={{
                    backgroundColor: "white",
                    padding: "10px",
                    margin: "0px 0px 0px 0px",
                    borderRadius: "5px",
                    boxShadow:
                      "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
                  }}
                >
                  Attendance Details
                </h3>
                <div className="attendance-summary">
                  <div className="summary-item">
                    <div className="icons-flex">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <EventAvailableTwoToneIcon
                          style={{
                            color: "#4dcd6e",
                            fontSize: "30px",
                          }}
                        />
                        <p>
                          <h4>Present Days</h4>
                        </p>
                      </div>
                      <hr style={{ width: "100%" }} />
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "40px",
                          marginTop: "10px",
                        }}
                      >
                        <p>{attendancePercent.present_days}</p>
                      </div>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="icons-flex">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <EventBusyTwoToneIcon
                          style={{
                            color: "#ff6968",
                            fontSize: "30px",
                          }}
                        />
                        <p>
                          <h4>Absent Days</h4>
                        </p>
                      </div>
                      <hr style={{ width: "100%" }} />
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "40px",
                          marginTop: "10px",
                        }}
                      >
                        <b>{attendancePercent.absent_days}</b>
                      </div>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="icons-flex">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <div>
                          <img
                            src={calendar}
                            alt="Total Days"
                            style={{
                              width: "30px",
                              margin: "3px",
                            }}
                          ></img>
                        </div>
                        <p>
                          <h4>Total Days</h4>
                        </p>
                      </div>
                      <hr style={{ width: "100%" }} />
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "40px",
                          marginTop: "10px",
                        }}
                      >
                        <b>{attendancePercent.current_days}</b>
                      </div>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="icons-flex">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <div>
                          <img
                            src={calendar}
                            alt="Total Days"
                            style={{
                              width: "30px",
                            }}
                          ></img>
                        </div>

                        <p>
                          <h4>Total Days (Sem)</h4>
                        </p>
                      </div>
                      <hr style={{ width: "100%" }} />
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "40px",
                          marginTop: "10px",
                        }}
                      >
                        <b>{attendancePercent.total_days}</b>
                      </div>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="icons-flex">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <div>
                          <img
                            src={calendar}
                            alt="Total Days"
                            style={{
                              width: "30px",
                            }}
                          ></img>
                        </div>
                        <p>
                          <h4>Attendance (%)</h4>
                        </p>
                      </div>
                      <hr style={{ width: "100%" }} />
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "40px",
                          marginTop: "10px",
                        }}
                      >
                        <b>{attendancePercent.attendance_percentage}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="att_det">
              <div className="leave-details">
                <h3>Leave Details</h3>
                <div className="leave-data">
                  {leaveDetails.length > 0 ? (
                    leaveDetails.map((leave, index) => (
                      <div
                        key={index}
                        className="leave-row"
                        style={{
                          backgroundColor:
                            leave.status === "2"
                              ? "#fcf9ec"
                              : leave.status === "3"
                              ? "#ffe6e6"
                              : leave.status === "1"
                              ? "#e6fff2"
                              : "transparent",
                          //  borderColor:
                          //       leave.status === "2"
                          //         ? " 1px solid #ded2a2"
                          //         : leave.status === "3"
                          //         ? "1px solid#76292e"
                          //         : leave.status === "1"
                          //         ? "1px solid #7eac8d"
                          //         : "transparent",
                        }}
                      >
                        <div>
                          <b>{leave.type}</b>
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              width: "100%",
                              gap: "15px",
                              flexDirection: "column",
                            }}
                          >
                            <div className="space">
                              <b>From date:</b>{" "}
                              {formatLeaveDate(leave.from_date)} <br />
                            </div>
                            <div className="space">
                              <b>From time:</b>{" "}
                              {formatLeaveTime(leave.from_time)} <br />
                            </div>

                            <div className="space">
                              <b>To date:</b> {formatLeaveDate(leave.to_date)}
                            </div>
                            <div className="space">
                              <b>To time:</b> {formatLeaveTime(leave.to_time)}
                            </div>
                          </div>
                        </div>
                        <div className="space reason">
                          <b>Reason:</b> {leave.reason} <br />
                        </div>
                        <div
                          className="space status"
                          style={{
                            backgroundColor:
                              leave.status === "2"
                                ? "#e5c137"
                                : leave.status === "3"
                                ? "#ec0041"
                                : leave.status === "1"
                                ? "#00ac3b"
                                : "transparent",
                          }}
                        >
                          {leave.status === "2" ? (
                            <b>Approval Pending</b>
                          ) : leave.status === "3" ? (
                            <b>Rejected</b>
                          ) : leave.status === "1" ? (
                            <b>Approved!!</b>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No leave applied.</p>
                  )}
                </div>
              </div>
              <div className="att_det_today">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    width: "100%",
                    border: "1px solid lightgray",
                    maxHeight: "180px",
                    overflowY: "scroll",
                    overflowX: "hidden",
                  }}
                >
                  <h4>Today's Biometric Details - {todayDate}</h4>
                  <hr style={{ width: "100%" }} />
                  {todayAttendance.length > 0 ? (
                    todayAttendance.map((detail, index) => (
                      <div key={index} className="attendance-row">
                        <b>Time</b>
                        {detail.time}
                      </div>
                    ))
                  ) : (
                    <p>No attendance recorded for today.</p>
                  )}
                </div>
                <div className="radial-chart">
                  <h3>
                    <center>Today's Biometrics</center>
                  </h3>
                  <Chart
                    options={radialChartData.options}
                    series={radialChartData.series}
                    type="radialBar"
                    height={300}
                  />
                </div>
              </div>

              <div className="att_det_others">
                <h3>
                  <center>Biometric History</center>
                </h3>
                <br />
                {otherAttendance.length > 0 ? (
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <b>Date</b>
                            </TableCell>
                            <TableCell>
                              <b>Time</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {otherAttendance
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                            .map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell>{detail.date}</TableCell>
                                <TableCell>{detail.time}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={otherAttendance.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </TableContainer>
                  </div>
                ) : (
                  <p>No attendance recorded for today.</p>
                )}
              </div>
            </div>

            {studentDetails.type === 2 && (
              <div className="type2-table">
                <h3>NIP/ Re-Appear Attendance Records</h3>
                {attendanceRecords.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Faculty</b>
                          </TableCell>
                          <TableCell>
                            <b>Slots</b>
                          </TableCell>
                          <TableCell>
                            <b>Attendance Session</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendanceRecords
                          .slice(pageNip * rowPage, pageNip * rowPage + rowPage)
                          .map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{record.name}</TableCell>
                              <TableCell>{record.label}</TableCell>
                              <TableCell>
                                {new Date(record.att_session).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={attendanceRecords.length}
                      rowsPerPage={rowPage}
                      page={pageNip}
                      onPageChange={handlePage}
                      onRowsPerPageChange={handleChangeRowsPage}
                    />
                  </TableContainer>
                ) : (
                  <p>No records found</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Student;
