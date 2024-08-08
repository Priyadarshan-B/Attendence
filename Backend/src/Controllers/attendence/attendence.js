const { get_database, post_database } = require("../../config/db_utils");

exports.get_attendence_n_arrear = async (req, res) => {
    const student = req.query.student;
    if (!student) {
        return res.status(400).json({ error: "Student register number is required" });
    }
    try {
        const query = `
            SELECT attendence 
            FROM no_arrear 
            WHERE student = ?
            AND status = '1'
            ORDER BY attendence DESC;

        `;
        const biometric_details = await get_database(query, [student]);

        if (biometric_details.length > 0) {
            const formattedDetails = biometric_details.map(detail => {
                const date = new Date(detail.attendence);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours24 = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                const hours12 = hours24 % 12 || 12; // Convert 0 to 12 for midnight
                const period = hours24 < 12 ? 'AM' : 'PM';

                const formattedDate = `${day} / ${month} / ${year}`;
                const formattedTime = `${String(hours12).padStart(2, '0')}:${minutes}:${seconds} ${period}`;

                return {
                    date: formattedDate,
                    time: formattedTime
                };
            });

            res.json(formattedDetails);
        } else {
            res.status(404).json({ error: "No attendance data found for the specified student" });
        }
    } catch (err) {
        console.error("Error fetching Biometric Details", err);
        res.status(500).json({ error: "Error fetching Biometric Details" });
    }
};

