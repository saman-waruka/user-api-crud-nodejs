const idParamValid = function (req,res, next) {
  if (!isNumber(req.params.id)) {
    res.status(400).send({ 'Invalid Request' : 'id must be number' });
    return;
  } 
  next(); 
}

function isNumber(str) {
  const regNumber = /^\d+$/;
  return regNumber.test(str);
}


module.exports = {
  idParamValid
}