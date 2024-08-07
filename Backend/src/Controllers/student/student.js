const { get_database, post_database } = require("../../config/db_utils");

exports.get_student_details = async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Student id is required" });
  }
  try {
    const query = `
        SELECT * FROM students
        WHERE id = ?
        AND status = '1';
        `;
    const student = await get_database(query, [id]);
    res.json(student);
  } catch (err) {
    console.error("Error Fetching Student details", err);
    res.status(500).json({ error: "Error Fetching Student details" });
  }
};
