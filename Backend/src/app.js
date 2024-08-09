const express = require('express')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const passport = require("passport");
const session = require("express-session");
const passportConfig = require("./Config/passport")

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });


//routes
const routes = require('./Routes/routes')
const auth_route = require('./Routes/auth/auth_routes')
const resources_route = require('./Routes/auth/res_route')
// const attendence_details = require('./Routes/routes')

const morgan_config = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const app = express()
const port = process.env.PORT

//session
app.use(
  session({
    secret: "this is my secrect code",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
//cors
app.use(express.json());
const cors_config = {
    origin: "*",
  };
  app.use(cors(cors_config));
  app.use(morgan_config);



//routes
app.use("/auth", resources_route);
app.use("/auth", auth_route);
app.use(routes)

// listen port
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  