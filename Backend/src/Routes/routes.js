const express = require('express')
const mentor = require('../Controllers/mentor/mentor')
const bio_attendence = require('../Controllers/attendence/biometric')
const attendence_details = require('../Controllers/attendence/attendence')
const student_details = require('../Controllers/student/student')
const router = express.Router()

router.get("/mentor-students",mentor.get_students)
router.get("/students-no-att", mentor.update_students_no_att)
router.get("/students-arr",mentor.get_students_type_2)

//bio-att
router.put("/att-approve",bio_attendence.mentor_att_approve)
router.put("/att-disapprove",bio_attendence.mentor_no_att_approve)

//att_details
router.get('/att-details',attendence_details.get_attendence_n_arrear)

//stu_details
router.get('/student-details', student_details.get_student_details)
module.exports= router