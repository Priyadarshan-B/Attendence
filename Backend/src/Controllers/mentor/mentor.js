const { get_database, post_database } = require("../../config/db_utils");
const moment = require('moment');

exports.get_students = async (req, res) => {
  const mentor = req.query.mentor;

  if (!mentor) {
    return res.status(400).json({ error: "Mentor Id not found" });
  }
  try {
    const query = `
    SELECT id, name , register_number, att_status
     FROM students
      WHERE mentor = ?
     AND status = '1';
    `;

    const students = await get_database(query, [mentor]);
    res.json(students);
  } catch (err) {
    console.error("Error Fetching Mentor-Student List", err);
    res.status(500).json({ error: "Error fetching Mentor-Student List" });
  }
};

exports.update_students_no_att = async (req, res) => {
   const mentor = req.query.mentor;
 
   if (!mentor) {
     return res.status(400).json({ error: "Mentor Id not found" });
   }
   try {
     const query = `
     SELECT  name , register_number
      FROM students
       WHERE mentor = ?
      AND att_status = '0'
      AND status = '1'
`;
 
     const students = await get_database(query, [mentor]);
     res.json(students);
   } catch (err) {
     console.error("Error Fetching Mentor-Student List", err);
     res.status(500).json({ error: "Error fetching Mentor-Student List" });
   }
 };
 
 exports.get_students_type_2 = async (req, res) => {
  const { email } = req.query;
  const currentTime = moment().format('h:mmA'); 

  try {
    const timeRangeQuery = `
      SELECT time_range
      FROM arrear_attendence
      WHERE email = ?
      AND status = '1';
    `;
    
    const result = await get_database(timeRangeQuery, [email]);

    if (result.length === 0) {
      return res.status(403).json({ error: "Email not found or status mismatch" });
    }

    const timeRange = result[2].time_range;
    const [startTime, endTime] = timeRange.split(' - ').map(time => moment(time, 'h:mmA'));

    const currentMoment = moment(currentTime, 'h:mmA');

    if (currentMoment.isBetween(startTime, endTime, null, '[]')) {
      const query = `
        SELECT id, name, register_number, att_status
        FROM students
        WHERE type = 2
        AND status = '1';
      `;
      
      const students = await get_database(query);
      res.json(students);
    } else {
      return res.status(403).json({ error: "Time range mismatch" });
    }
  } catch (err) {
    console.error("Error Fetching Mentor-Student type 2 List", err);
    res.status(500).json({ error: "Error fetching Mentor-Student type 2 List" });
  }
};