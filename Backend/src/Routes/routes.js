const express = require('express')
const mentor = require('../../Controllers/mentor/mentor')

const router = express.Router()

router.get("/mentor-students",mentor.get_students)

module.exports= router