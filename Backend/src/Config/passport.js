const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const connection = require('./database')
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });


// Configure the Google Strategy for Passport.js
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        
        // Query the mentor table first
        const mentorQuery = "SELECT id, name, role_id FROM mentor WHERE gmail = ?";
        connection.query(mentorQuery, [email], (error, results) => {
          if (error) {
            return done(error);
          }

          if (results.length > 0) {
            const user = results[0];
            return done(null, user);
          } else {
            // If not found in mentor, query the students table
            const studentQuery = "SELECT id, name, register_number, role_id FROM students WHERE gmail = ?";
            connection.query(studentQuery, [email], (error, results) => {
              if (error) {
                return done(error);
              }

              if (results.length > 0) {
                const user = results[0];
                return done(null, user);
              } else {
                return done(null, false, { message: "User not found" });
              }
            });
          }
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Here, you would typically fetch the user from your database using the id
  connection.query("SELECT id, name, role_id FROM mentor WHERE id = ? UNION SELECT id, name,register_number role_id FROM students WHERE id = ?", [id, id], (error, results) => {
    if (error) {
      return done(error);
    }

    if (results.length > 0) {
      return done(null, results[0]);
    } else {
      return done(null, false);
    }
  });
});

// Export the configured passport object
module.exports = passport;
