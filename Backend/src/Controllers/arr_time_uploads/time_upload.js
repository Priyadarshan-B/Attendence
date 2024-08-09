const { post_database } = require("../../config/db_utils");

exports.add_attendance_records = async (req, res) => {
    const data = req.body; 
    console.log(data)

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    try {
        // Prepare SQL query for inserting new records
        const insertQuery = `
            INSERT INTO arrear_attendence (name, email, date, time_range, status)
            VALUES (?, ?, ?, ?, ?);
        `;

        // Loop through each item in the array and insert into the database
        for (const item of data) {
            const { name, email, date, time_range } = item;

            if (!name || !email || !date || !time_range) {
                return res.status(400).json({ error: "Missing required fields in one or more items" });
            }

            // Insert new record with default status '1'
            await post_database(insertQuery, [name, email, date, time_range, '1']);
        }

        res.json({ message: "Records added successfully" });
    } catch (err) {
        console.error("Error adding attendance records", err);
        res.status(500).json({ error: "Error adding attendance records" });
    }
};
