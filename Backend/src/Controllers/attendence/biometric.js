const cron = require('node-cron');
const { get_database, post_database } = require("../../config/db_utils");



exports.mentor_att_approve = async(req, res)=>{
    const student = req.query.student;
    
   if (!student) {
    return res.status(400).json({ error: "Mentor Id not found" });
  }
   try {const query = `
    UPDATE students 
    SET att_status = '1'
    WHERE id = ?;`
    const mentor_approve = await post_database(query,[student])
    res.json(mentor_approve)
        }
        catch(err) {
            console.error("Error Updating Mentor-Student Attendence", err);
     res.status(500).json({ error: "Error Updating Mentor-Student Attendence" });
}
    
}
exports.mentor_no_att_approve = async(req, res)=>{
  const student = req.query.student;
  
 if (!student) {
  return res.status(400).json({ error: "Mentor Id not found" });
}
 try {const query = `
  UPDATE students 
  SET att_status = '0'
  WHERE id = ?;`
  const mentor_approve = await get_database(query,[student])
  res.json(mentor_approve)
      }
      catch(err) {
          console.error("Error Updating Mentor-Student no Attendence", err);
   res.status(500).json({ error: "Error Updating Mentor-Student no Attendence" });

      }
  
}

exports.update_7_days = async(req, res)=>{
    const query = `UPDATE students
                 SET att_status = '0'
                 WHERE DAYOFWEEK(CURDATE()) = 4`;

    const attendence = await get_database(query)
    res.json(attendence);

  connection.query(query, (error, results) => {
    if (error) {
      return console.error('An error occurred while executing the query for update attendence:', error);
    }
    console.log('Rows affected:', results.affectedRows);
  });

  cron.schedule('0 0 * * 3', this.update_7_days);
  process.stdin.resume();

}
