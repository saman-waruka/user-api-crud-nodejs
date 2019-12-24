const { Pool } = require('pg')
require('dotenv').config()
const pool = new Pool({
  host: process.env.localhost,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const getUsers = (request, response) => {  
    pool.query(
      `SELECT * FROM users 
      WHERE softdelete = false 
      ORDER BY id ASC`, (error, results) => {
        if (error) {
            response.send(error);
            throw error;        
        } else {
          response.status(200).send(results.rows);
        }
    });
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);
  const strSQL = 'SELECT * FROM users WHERE id = $1 AND softdelete = false';
  pool.query(strSQL,[id], (error, results) => {
    if (error) {
      response.send(error);
      throw error;
    }
    response.status(200).send(results.rows);
  })
}

const createUser = (request, response) => {
  if (!(request.body.name && request.body.lastname)) {
    let errorStr = [];
    request.body.name ? '' : errorStr.push('Name') ;
    request.body.lastname ? '': errorStr.push(' Lastname') ;
    errorStr = errorStr.join() + ' is Required for Create User.';
    response.status(400).send({ 
      status : 400,
      error : 'Invalid Request' ,
      detail : errorStr});
    throw errorStr;    
  }
  const { name, lastname, profile } = request.body;  
  const strSQL = 'INSERT INTO users (name, lastname, profile) VALUES ($1, $2, $3)';  
    pool.query(strSQL, [name, lastname, profile], (error, results) => {
      if (error) {
        response.status(200).send({ error : JSON.stringify(error)});
        throw error;
      }
      response.status(201).send({
        action: 'User added'
      });
    }) 
}

const manageUpdateAndRestore = (request, response) => {
  const hasQuery = Object.keys(request.query).length > 0;

  if ( hasQuery) {
    const isRestoreQuery = String(request.query.restore).toLowerCase() == 'true' ;
    if (isRestoreQuery) {
      restoreUser(request, response);
    } else {
      response.status(400).send({ 
        status : 400,
        error : 'Invalid Request' 
      });
    }

  } else {
    updateUser(request, response);
  }
}

const updateUser = (request, response) => {  
  if (!(request.body.name && request.body.lastname)) {
    let errorStr = [];
    request.body.name ? '' : errorStr.push('Name') ;
    request.body.lastname ? '': errorStr.push(' Lastname') ;
    errorStr = errorStr.join() + ' is Required For Update User.';
    response.status(400).send({ 
      status : 400,
      error : 'Invalid Request' ,
      detail : errorStr});
    throw errorStr;
    
  }
  const id = parseInt(request.params.id);
  const { name, lastname, profile} = request.body;
  const strSQL = 
    `UPDATE public.users
    SET  name=$1, lastname=$2, profile=$3, updated_at=(now())::timestamp without time zone
    WHERE id=$4 AND softdelete=false;` ;
  pool.query(strSQL, [name, lastname, profile, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rowCount > 0) {
        response.status(200).send({
          action : 'User updated with ID ' + id
        });
      } else {
        response.status(404).send({
          error : 'Can not updated, User with ID '+ id + ' does not exist.'
        });
      }
    }
  )
}

const deleteUser = (request, response) => {   
  const isPermanentDelete = String(request.query.permanent).toLowerCase() == 'true' ;
  if( isPermanentDelete ) {
    permanentDeleteUser(request, response);
  } else {
    softdelete(request, response);
  }
}

const softdelete = (request, response) => {
    const id = parseInt(request.params.id);  
    const strSQL = 
      `UPDATE public.users
      SET  softdelete=true
      WHERE id=$1 AND softdelete=false ;` ;
    pool.query(strSQL, [id], (error, results) => {
        if (error) {
          throw error;
        }
        if (results.rowCount > 0) {
          response.status(200).send({
            action : 'User deleted with ID '+ id
          });
        } else {
          response.status(404).send({
            error : 'Can not deleted, User with ID '+  id + ' does not exist.'
          });
        }
    })
}

const restoreUser = (request, response) => {
    const id = parseInt(request.params.id);  
    const strSQL = 
      `UPDATE public.users
      SET  softdelete=false
      WHERE id=$1 AND softdelete=true ;` ;
    pool.query(strSQL, [id], (error, results) => {
        if (error) {
          throw error;
        }
        if (results.rowCount > 0) {
          response.status(200).send({
            action : 'User restored with ID '+ id
          });
        } else {
          response.status(404).send({
            error : 'Can not restored, User with ID '+  id + ' does not exist in recycle bin.'
          });
        }
    })
}

const permanentDeleteUser = (request, response) => {
  const id = parseInt(request.params.id);  
  const strSQL = `DELETE FROM public.users WHERE id=$1 ;` ;
  pool.query(strSQL, [id], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rowCount > 0) {
        response.status(200).send({
          action : 'User permanent deleted with ID '+ id
        });
      } else {
        response.status(200).send({
          error : 'Can not deleted, User with ID '+  id + ' does not exist.'
        });
      }
  })
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
    manageUpdateAndRestore
};