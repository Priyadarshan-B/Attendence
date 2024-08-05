const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require('jsonwebtoken');
const connection = require("./db"); // Ensure this points to your database connection
const path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env')});

// Configure the Google Strategy for Passport.js
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"]
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Assuming 'gmail' is the column name in your users table for storing the user's email
        const email = profile.emails[0].value;
        const query = 'SELECT * FROM students WHERE gmail = ?' || 'SELECT * FROM mentor WHERE gmail = ?';
        connection.query(query, [email], (error, results, fields) => {
            if (error) {
                return done(error);
            }

            if (results.length > 0) {
                // User found, return the user object
                const user = results[0];
                user.role_id = user.role
                user.name = user.name
                user.id = user.id
                console.log(user.name)
                console.log(user.role)
                console.log(user.id)

                return done(null, user);
            } else {
                // User not found, you might want to handle this case differently
                // For example, create a new user in your database
                return done(null, false, { message: "User not found" });
            }
        });
    } catch (error) {
        return done(error);
    }
}));

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Here, you would typically fetch the user from your database using the id
    // For simplicity, we're just returning the id
    done(null, id);
});

// Export the configured passport object
module.exports = passport;
