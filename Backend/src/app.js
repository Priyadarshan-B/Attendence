const express = require('express')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });


//routes
const mentor_routes = require('./Routes/routes')

const morgan_config = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const app = express()
const port = process.env.PORT

//cors
const cors_config = {
    origin: "*",
  };
  app.use(cors(cors_config));
  app.use(morgan_config);

//routes
app.use(mentor_routes)

// listen port
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  