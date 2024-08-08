import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import RoleCheck from "../auth/RoleResource/resources";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
} from "@mui/material";
import InputBox from "../../components/TextBox/textbox";
import Popup from "../../components/popup/popup";
import "./approval.css";  

function Approvals(props) {
  const rId = 1;
  const [roleIds, setRoleIds] = useState(null);

  useEffect(() => {
    const fetchRoleIds = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/auth/rolecheck?resources_id=${rId}`
        );
        setRoleIds(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching role IDs:", error);
      }
    };

    fetchRoleIds();
  }, [rId]);

  if (roleIds === null) {
    return <div>Loading...</div>;
  }
  const RoleCheckedExplore = RoleCheck(
    () => <AppLayout rId={rId} body={<Body />} />,
    roleIds
  );

  return <RoleCheckedExplore {...props} />;
}

function Body() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const id = Cookies.get("id");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);

  useEffect(() => {
    requestApi("GET", `/mentor-students?mentor=${id}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
        } else {
          console.error("API response is not an array:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, [id]);

  const handleApprove = (index) => {
    const updatedStudents = [...filteredStudents];
    const student = updatedStudents[index];
    const url = student.att_status === "1"
      ? `/att-disapprove?student=${student.id}`
      : `/att-approve?student=${student.id}`;

    requestApi("PUT", url)
      .then(() => {
        updatedStudents[index].att_status = student.att_status === "1" ? "0" : "1";
        setFilteredStudents(updatedStudents);
        setStudents(updatedStudents);
      })
      .catch((error) =>
        console.error(`Error updating student approval status:`, error)
      );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(value) ||
        student.register_number.toLowerCase().includes(value)
    );
    setFilteredStudents(filtered);
  };

  const getNextWednesday = () => {
    const now = new Date();
    const nextWednesday = new Date(
      now.setDate(
        now.getDate() + ((3 + 7 - now.getDay()) % 7 || 7)
      )
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
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const handleOpenDialog = (index) => {
    setSelectedStudentIndex(index);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedStudentIndex(null);
  };

  const handleConfirmDisapprove = () => {
    if (selectedStudentIndex !== null) {
      handleApprove(selectedStudentIndex);
      console.log(selectedStudentIndex)
    }
    handleCloseDialog();
  };

  return (
    <div>
      <h2>Students Attendance Approvals</h2>
      <div>
        <div>
          <InputBox
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search.."
          />
        </div>
        <Paper className="table-container">
          <TableContainer>
            <Table className="custom-table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{width:"10%"}}>
                    <h3>S.No</h3>
                  </TableCell>
                  <TableCell>
                    <h3>Name</h3>
                  </TableCell>
                  <TableCell>
                    <h3>Register Number</h3>
                  </TableCell>
                  <TableCell>
                    <h3>Actions</h3>
                  </TableCell>
                  <TableCell>
                    <h3>Time Left</h3>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow key={student.register_number}>
                      <TableCell><b>{page * rowsPerPage + index + 1}</b></TableCell>
                      <TableCell><b>{student.name}</b></TableCell>
                      <TableCell><b>{student.register_number}</b></TableCell>
                      <TableCell>
                      <Button
        variant="contained"
        sx={{
            backgroundColor: student.att_status === "1" ? "#da0000" : "#0012ee", 
            color: '#fff', 
            '&:hover': {
                backgroundColor: student.att_status === "1" ? "#cc0000" : "#2f30ff" 
            }
        }}
        onClick={
            student.att_status === "1"
                ? () => handleOpenDialog(index)
                : () => handleApprove(index)
        }
    >
        {student.att_status === "1" ? "Disapprove" : "Approve"}
    </Button>
                      </TableCell>
                      <TableCell>
                        {student.att_status === "1" ? (
                          <span>
                            <b>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</b>
                          </span>
                        ) : (
                          "--"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 15, 25]}
            component="div"
            count={students.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
      <Popup
        open={open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDisapprove}
        text={"Are you sure you want to disapprove this student's biometric attendance? "}
      />
    </div>
  );
}

export default Approvals;
