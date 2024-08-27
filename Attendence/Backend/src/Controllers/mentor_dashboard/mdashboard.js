const { get_database } = require("../../config/db_utils");

exports.get_mdashboard = async (req, res) => {
  const mentor = req.query.mentor;
  if (!mentor) {
    return res.status(400).json({ error: "Mentor id is required." });
  }
  try {
    const ms_count_query = `
      SELECT COUNT(student) AS student_count
      FROM mentor_student
      WHERE mentor = ?
      AND status = '1'
    `;
    const [ms_count] = await get_database(ms_count_query, [mentor]);

    const studentAttendanceQuery = `
      SELECT students.id, students.name, students.register_number, mentor_student.mentor, attendance.date, attendance.forenoon, attendance.afternoon
      FROM students
      LEFT JOIN mentor_student ON students.id = mentor_student.student
      LEFT JOIN attendance ON students.id = attendance.student
      WHERE mentor_student.mentor = ?
      AND DATE(attendance.date) = CURRENT_DATE()
      AND mentor_student.status = '1'
    `;
    const studentAttendance = await get_database(studentAttendanceQuery, [mentor]);

    const studentAbsent = `
        SELECT students.id, students.name, students.register_number, mentor_student.mentor, attendance.date, attendance.forenoon, attendance.afternoon
FROM students
LEFT JOIN mentor_student ON students.id = mentor_student.student
LEFT JOIN attendance ON students.id = attendance.student AND DATE(attendance.date) = CURRENT_DATE()
WHERE mentor_student.mentor = ?
AND attendance.date IS NULL
AND mentor_student.status = '1';
    `
    const Absent = await get_database(studentAbsent, [mentor])

    const attCountQuery = `
      SELECT COUNT(DISTINCT students.id) AS student_attendance_count
      FROM students
      LEFT JOIN mentor_student ON students.id = mentor_student.student
      LEFT JOIN attendance ON students.id = attendance.student
      WHERE mentor_student.mentor = ?
      AND DATE(attendance.date) = CURRENT_DATE()
      AND attendance.forenoon = '1' AND attendance.afternoon = '1'
      AND mentor_student.status = '1'
    `;
    const [att_count] = await get_database(attCountQuery, [mentor]);

    return res.json({
      student_count: ms_count.student_count,
      today_attendance_records: studentAttendance,
      today_attendance_count: att_count.student_attendance_count,
      today_absent_records: Absent,
      todat_absent:ms_count.student_count - att_count.student_attendance_count

    });
  } catch (err) {
    console.error("Error fetching students' details.", err);
    return res.status(500).json({ error: "Error fetching students' details." });
  }
};

exports.dashboard = async (req, res) => {
  const mentor = req.query.mentor;

  if (!mentor) {
    return res.status(400).json({ error: "Mentor id is required." });
  }

  try {
    const query = `
WITH past_seven_days AS (
  SELECT CURDATE() - INTERVAL n DAY AS date
  FROM (
    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
  ) AS days
)
SELECT 
    d.date,
    COUNT(a.student) AS present_count
FROM 
    past_seven_days d
LEFT JOIN 
    attendance a ON d.date = a.date
LEFT JOIN 
    mentor_student m ON a.student = m.student
    AND m.mentor = ?
    AND m.status = '1'
WHERE 
    a.forenoon = '1'
    AND a.afternoon = '1'
GROUP BY 
    d.date
ORDER BY 
    d.date DESC;
    `;
    const stuData = await get_database(query, [mentor]);

    const ms_count_query = `
      SELECT COUNT(student) AS student_count
      FROM mentor_student
      WHERE mentor = ?
      AND status = '1'
    `;
    const [ms_count] = await get_database(ms_count_query, [mentor]);

    const result = stuData.map((day) => ({
      date: day.date,
      present_count: day.present_count,
      absent_count: ms_count.student_count - day.present_count
    }));

    res.json({
      student_count: ms_count.student_count,
      attendance_summary: result,
    });
  } catch (err) {
    console.error("Error Fetching Dashboard Data..", err);
    return res.status(500).json({ error: "Error Fetching Dashboard data." });
  }
};
