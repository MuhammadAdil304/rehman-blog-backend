const jwt = require("jsonwebtoken");
const { SendResponse } = require("../helpers/helper");

const verifyToken = (req, res, next) => {
const token = req.cookies.access_token
if(!token){
  return res.status(401).send(SendResponse(false, "Un Authorized", null));
}
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if(err){
    return res.status(401).send(SendResponse(false, "Un Authorized", null));
  }
  req.user = user;
  next();
});

};

module.exports = verifyToken;
