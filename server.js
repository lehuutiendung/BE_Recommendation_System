const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
var cookieParser = require('cookie-parser')
const { authJwt } = require("./app/middleware/common.service");

const app = express();
require('dotenv').config();
// Cookie parser npm 
app.use(cookieParser());

// cross domain
app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

const db = require("./app/models/common.model");
const Role = db.role;
const React = require("./app/models/react.model");
/****************************************************************************
 * Connect DB
 */
db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });
/***************************************************************************/

/***************************************************************************
 * Routes
 */
// require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);
app.use('/api/auth', require('./app/routes/auth.routes'));
app.use('/api/users',[authJwt.verifyToken], require('./app/routes/user.routes'));
app.use('/api/posts',[authJwt.verifyToken], require('./app/routes/post.routes'));

/***************************************************************************/

/****************************************************************************
 * Tạo Schema Role, React
 */
function initial() {
  React.estimatedDocumentCount((err, count) => {
    if(!err && count == 0){
      new React({
        reactName: "LIKE",
        reactNumber: 1
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'LIKE' to reacts collection");
      });

      new React({
        reactName: "LOVE",
        reactNumber: 2
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'LOVE' to reacts collection");
      });

      new React({
        reactName: "HAHA",
        reactNumber: 3
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'HAHA' to reacts collection");
      });

      new React({
        reactName: "WOW",
        reactNumber: 4
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'WOW' to reacts collection");
      });

      new React({
        reactName: "SAD",
        reactNumber: 5
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'SAD' to reacts collection");
      });

      new React({
        reactName: "ANGRY",
        reactNumber: 6
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'ANGRY' to reacts collection");
      });
    }
  })
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
/***************************************************************************/

/***************************************************************************
 * Start: Swagger Configuration 
 */
const swaggerOptions = {  
  swaggerDefinition: {  
      info: {  
          title:'Social Network API',  
          description: 'Social Network API Information',
          version:'1.0.0',  
      },
      servers:[
        {
          url: 'http://localhost:3000'
        }
      ]  
  },  
  apis: ['./app/routes/*.js'],
}  

const swaggerDocs = swaggerJSDoc(swaggerOptions);  
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
/***************************************************************************/ 

/***************************************************************************
 * Set port, listen for requests
 */
 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}.`);
   console.log(`API Document: http://localhost:${PORT}/api-docs/`);
 });
 /***************************************************************************/