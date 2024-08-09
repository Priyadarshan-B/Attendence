import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/applayout/AppLayout';
import '../../components/applayout/styles.css';
import requestApi from '../../components/utils/axios';
import RoleCheck from '../auth/RoleResource/resources';
import Cookies from "js-cookie";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    TablePagination
} from '@mui/material';
import './attendence.css';

function Attendence(props) {
    const rId = 3;
    const [roleIds, setRoleIds] = useState(null);
    const gmail = Cookies.get('gmail');
    const [data, setData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchRoleIds = async () => {
            try {
                const response = await requestApi("GET", `/auth/rolecheck?resources_id=${rId}`);
                setRoleIds(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching role IDs:", error);
            }
        };

        const fetchData = async () => {
            try {
                const studentResponse = await requestApi("GET", `/students-arr?email=${gmail}`);
                setData(studentResponse.data);

                const attendanceResponse = await requestApi("GET", `/attendance`);
                setAttendanceData(attendanceResponse.data);
            } catch (error) {
                console.error("Error fetching attendance data:", error);
            }
        };

        fetchRoleIds();
        fetchData();
    }, [rId, gmail]);

    if (roleIds === null) {
        return <div>Loading...</div>;
    }

    const RoleCheckedExplore = RoleCheck(() => (
        <AppLayout rId={rId} body={<Body data={data} attendanceData={attendanceData} page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />} />
    ), roleIds);

    return <RoleCheckedExplore {...props} />;
}

function Body({ data, attendanceData, page, setPage, rowsPerPage, setRowsPerPage }) {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const now = new Date();
        const hours = now.getHours() % 12 || 12;
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hours}:${minutes}${ampm}`;
        setCurrentTime(formattedTime);
    }, []);

    const isCheckboxChecked = (registerNumber, timeSlot) => {
        if (!attendanceData || !Array.isArray(attendanceData)) {
            return false;
        }
    
        const matchingRecord = attendanceData.find(
            (record) =>
                record.register_number === registerNumber &&
                record.slot === timeSlot &&
                record.time === currentTime
        );
        return Boolean(matchingRecord);
    };
    const handleCheckboxClick = async (studentId) => {
        const timestamp = new Date().toISOString();
        try {
            await requestApi("POST", "/arr-students", { studentId, timestamp });
            console.log(`Sent data for student ID: ${studentId}, Timestamp: ${timestamp}`);
        } catch (error) {
            console.error("Error sending attendance data:", error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (!data || data.length === 0) {
        return <div>No data available</div>;
    }

    const isCheckboxEnabled = (timeSlot) => {
        const parseTime = (time) => {
            const match = time.match(/(\d{1,2}):(\d{2})(AM|PM)/);
            if (!match) return null;
            let [_, hour, minute, ampm] = match;
            hour = parseInt(hour);
            minute = parseInt(minute);
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            return hour * 60 + minute;
        };

        const [start, end] = timeSlot.split(' - ').map(parseTime);
        if (start === null || end === null) return false;
        const current = parseTime(currentTime);
        if (current === null) return false;

        return current >= start && current <= end;
    };

    return (
        <div>
            <div>
                <h3>Re Appear Student Attendance..</h3>
            </div>
            <div>
                <h4>Student List</h4>
            </div>
            <Paper className="attendance-container">
                <TableContainer>
                    <Table className="custom-table">
                        <TableHead>
                            <TableRow>
                                <TableCell><h3>S.No</h3></TableCell>
                                <TableCell><h3>Name</h3></TableCell>
                                <TableCell><h3>Register Number</h3></TableCell>
                                <TableCell><h3>8:45AM - 9:45AM</h3></TableCell>
                                <TableCell><h3>9:45AM - 10:45AM</h3></TableCell>
                                <TableCell><h3>11AM - 12PM</h3></TableCell>
                                <TableCell><h3>1PM - 2PM</h3></TableCell>
                                <TableCell><h3>2PM - 3PM</h3></TableCell>
                                <TableCell><h3>8PM - 10PM</h3></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.register_number}</TableCell>
                                    {['8:45AM - 9:45AM', '9:45AM - 10:45AM', '11:00AM - 12:00PM', '1:00PM - 2:00PM', '2:00PM - 3:00PM', '8:00PM - 10:00PM'].map((slot, idx) => (
                                        <TableCell key={idx}>
                                            <Checkbox
                                                checked={isCheckboxChecked(row.register_number, slot)}
                                                disabled={!isCheckboxEnabled(slot)}
                                                onClick={() => handleCheckboxClick(row.id)}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 15, 25, 100]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}

export default Attendence;
