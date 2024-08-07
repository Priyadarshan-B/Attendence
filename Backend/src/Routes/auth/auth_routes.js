const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env')});

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback route
router.get("/google/callback", passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login` }), function(req, res) {
    req.user.token = generateToken(req.user, 600, req.user.name,req.user.register_number, req.user.role_id, req.user.id);
    console.log("token:", req.user.token);
  
    // Prepare the JSON response
    const responseJson = {
      token: req.user.token,
      name: req.user.name,
      roll:req.user.register_number,
      role: req.user.role_id,
      id: req.user.id
    };
  
    // Redirect the user to a specific page with the JSON data as query parameters
    res.redirect(`${process.env.CLIENT_URL}/welcome?data=${encodeURIComponent(JSON.stringify(responseJson))}`);
  });

const generateToken = (user, expiresIn, name, role_id, id) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    return jwt.sign({ userId: user.id, name:name,roll:user.register_number, role:role_id, id:id }, JWT_SECRET, { expiresIn:'1h' });
};

module.exports = router;
