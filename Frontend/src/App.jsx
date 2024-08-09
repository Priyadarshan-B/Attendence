import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login/Login";
import Welcome from "./pages/welcome/welcome";
import Attendence from "./pages/Attendence/attendence";
import Approvals from "./pages/Approvals/approval";
import StuDashboard from "./pages/Stu_Dashboard/stu_dashboard";
import TimeUpload from "./pages/Time_Upload/time_upload";
import Error from "./pages/error";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="*" element={<Error />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/attendence" element={<Attendence />} />
          <Route path="/approval" element={<Approvals />} />
          <Route path="/dashboard" element={<StuDashboard />} />
          <Route path="/timeslot" element={<TimeUpload />} />  
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
