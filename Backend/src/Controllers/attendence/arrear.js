const { get_database, post_database } = require("../../config/db_utils");

exports.get_arrear_att = async (req, res) => {
  try {
    const query = `
        SELECT re_appear.id, students.name, students.register_number,
        slot,att_session
        FROM re_appear
        INNER JOIN students
        ON re_appear.student = students.id
        WHERE 
        re_appear.status = '1';
        `;
    const get_attendence = await get_database(query);
    if (get_attendence.length > 0) {
      const formattedDetails = get_attendence.map((detail) => {
        const date = new Date(detail.att_session);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours24 = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        const hours12 = hours24 % 12 || 12;
        const period = hours24 < 12 ? "AM" : "PM";
        const formattedDate = `${day} / ${month} / ${year}`;
        const formattedTime = `${String(hours12).padStart(
          2,
          "0"
        )}:${minutes}:${seconds} ${period}`;

        return {
          ...detail,
          date: formattedDate,
          time: formattedTime,
        };
      });
      res.json(formattedDetails);
    } else {
      res.status(404).json({ error: "No Data Present.." });
    }
  } catch (err) {
    console.error("Error Fetching attendence type 2", err);
    return res.status(500).json({ error: "Error Fetching attendence type 2" });
  }
};
