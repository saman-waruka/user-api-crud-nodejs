const authHeader = function (req, res, next) {
  if ( req.headers.authorization) {
    if ( req.headers.authorization === '20scoops'){
      next();
    } else {
      return res.status(401).send({ 'error ' : 'Unauthorized'});
    }
  }
  else {
    return res.status(401).send({ 'error ' : 'Unauthorized'});
  }
}

module.exports = {
  authHeader
}