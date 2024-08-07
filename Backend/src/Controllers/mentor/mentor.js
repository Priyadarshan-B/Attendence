const { get_database, post_database } = require("../../config/db_utils");

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
 
 