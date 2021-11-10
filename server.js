const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`API Document: http://localhost:${PORT}/api-docs/`);
});

/**
 * Start: Swagger Configuration 
 */
const swaggerOptions = {  
  swaggerDefinition: {  
      info: {  
          title:'Social Network API',  
          description: 'Social Network API Information',
          version:'1.0.0',
          server: ["http://localhost:3000"]  
      }  
  },  
  //['routes/*.js']
  apis:['server.js'],  
}  

const swaggerDocs = swaggerJSDoc(swaggerOptions);  
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
// End: Swagger Configuration

//Run server.js: nodemon -L server.js