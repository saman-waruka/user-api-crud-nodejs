const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const  db = require('./db/queries');
const auth = require('./middleware/authHeader');
const validate = require('./middleware/validateParams');
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (error, req, res, next) {
  if(error instanceof SyntaxError){ //Handle SyntaxError here.
    return res.status(error.status).send({ 
      status : error.status,
      'error' : 'Invalid Syntax'
    });
  } else {
    next();
  }
});

  app.get('/api/users', db.getUsers);
  app.get('/api/users/:id', validate.idParamValid, db.getUserById);
  app.post('/api/users', auth.authHeader, db.createUser);
  app.put('/api/users/:id', auth.authHeader, validate.idParamValid, db.manageUpdateAndRestore);
  app.delete('/api/users/:id', auth.authHeader, validate.idParamValid, db.deleteUser);

  app.all('*', function(req, res){
    res.status(404).send({ 
      status : 404,
      error :`Your request path does not exist.`
    });
  });

  app.listen(port, () => {
    console.log(`App running on port ${port}.`);
  })