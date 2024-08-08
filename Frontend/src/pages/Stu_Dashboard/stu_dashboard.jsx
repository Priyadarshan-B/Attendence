import React, { useEffect, useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import Cookies from "js-cookie";
import requestApi from "../../components/utils/axios";
import "./stu_dashboard.css";
import Chart from "react-apexcharts";

function StuDashboard() {
  return <AppLayout rId={2} body={<Body />} />;
}

function Body() {
  const roll = Cookies.get("roll");
  const id = Cookies.get("id");
  const [studentDetails, setStudentDetails] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);

  const getNextWednesday = () => {
    const now = new Date();
    const nextWednesday = new Date(
      now.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7 || 7))
    );
    nextWednesday.setHours(0, 0, 0, 0);
    return nextWednesday;
  };

  const calculateTimeLeft = () => {
    const nextWednesday = getNextWednesday();
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
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await requestApi("GET", `/student-details?id=${id}`);
        setStudentDetails(response.data[0]);
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    const fetchAttendanceDetails = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/att-details?student=${roll}`
        );
        setAttendanceDetails(response.data);
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      }
    };

    fetchStudentDetails();
    fetchAttendanceDetails();

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [roll, id]);

  if (!studentDetails) {
    return <div>Loading...</div>;
  }

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
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes, seconds] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }

      if (modifier === 'PM') {
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
    if (todayAttendance.some((detail) => isTimeInRange(detail.time, interval.start, interval.end))) {
      return count + 1;
    }
    return count;
  }, 0);

// console.log(uniqueIntervals)
const radialChartData = {
    series: [(uniqueIntervals/3) *100],
    options: {
      chart: {
        height: 500,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "60%",
          },

          startAngle: 0,
          endAngle: 360,
          track: {
            background: '#f2f2f2',
            strokeWidth: '100%',
        
          },
          dataLabels: {
            name: {
              offsetY: 0,
              color: '#',
              fontSize: '25px',
            },
            value: {
              color: '#111',
              fontSize: '3px',
              show: false, 
              formatter: function (val) {
                return parseInt(val);
              },
            },
          },
        },
      },
      labels: [`${uniqueIntervals}/3`],
    },
  };
  


  return (
    <div>
      <h3>Biometric Details - {roll} </h3>
      <div className="student-details-container">
        <div className="student-details">
          <div className="detail-row">
            <div className="detail-label">Name:</div>
            <div className="detail-value">{studentDetails.name}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Register Number:</div>
            <div className="detail-value">{studentDetails.register_number}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Attendance Status:</div>
            <div className="detail-value">
              {studentDetails.att_status === "1" ? (
                <span>
                  <h5 style={{ color: "green" }}>Approved..</h5> {timeLeft.days}
                  d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              ) : (
                <h5 className="n_approve">Pending Approval..</h5>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="att_det">
        <div className="att_det_today">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h4>Today's Biometric Details - {todayDate}</h4>
            {todayAttendance.length > 0 ? (
              todayAttendance.map((detail, index) => (
                <div key={index} className="attendance-row">
                  <b>Time</b> - {detail.time}
                </div>
              ))
            ) : (
              <p>No attendance recorded for today.</p>
            )}
          </div>
          <div className="radial-chart">
            <Chart
              options={radialChartData.options}
              series={radialChartData.series}
              type="radialBar"
              height={250}
            />
          </div>
         
        </div>

        <div className="att_det_others">
          <h4>Other Biometric Timings..</h4>
          {otherAttendance.length > 0 ? (
            otherAttendance.map((detail, index) => (
              <div key={index} className="attendance-row">
                <b>Date:</b> {detail.date}
                <b> -Time: </b> {detail.time}
              </div>
            ))
          ) : (
            <p>No other attendance records.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StuDashboard;
