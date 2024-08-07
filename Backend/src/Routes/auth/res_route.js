const express = require("express")

const resources = require('../../Controllers/auth/resource')
const router = express.Router();

router.get("/resources", resources.get_resource)
router.get('/rolecheck', resources.validateRole)

module.exports = router;