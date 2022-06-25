// npm run debug
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
var cookieParser = require('cookie-parser')
const { authJwt } = require("./app/middleware/common.service");

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
require('./socket')(io)

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
app.use('/api/auth', require('./app/routes/auth.routes'));
app.use('/api/users',[authJwt.verifyToken], require('./app/routes/user.routes'));
app.use('/api/posts',[authJwt.verifyToken], require('./app/routes/post.routes'));
app.use('/api/comments',[authJwt.verifyToken], require('./app/routes/comment.routes'));
app.use('/api/groups',[authJwt.verifyToken], require('./app/routes/group.routes'));
app.use('/api/recommends', require('./app/routes/recommend.routes'));
app.use('/api/emails', require('./app/routes/email.routes'));
app.use('/api/chats', require('./app/routes/chat.routes'));
// Test đầu API gọi sang Python với SPAWN
// app.post('/api/recommends/recommend-post', function (req, res) {
//   try {
//     var spawn = require('child_process').spawn;
//     var process = spawn('python', ['../MachineLearning/main.py']  
//     );
//     process.stdout.on('data', (data) => {
//         res.write(data.toString());
//     });

//     process.on('close', (code) => {
//       if (code !== 0) {
//         console.log(`grep process exited with code ${code}`);
//       }
//       res.end(); // finish the request, `end` not `send`
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });
/***************************************************************************/

/****************************************************************************
 * Tạo Schema Role
 */
function initial() {
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
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`API Document: http://localhost:${PORT}/api-docs/`);
});

 /***************************************************************************/