const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  // console.log(req.headers.authorization); // Bearer PJzfz49axmog3ow08zbc

  const token = req.headers.authorization?.replace("Bearer ", "");
  // console.log(token); // PJzfz49axmog3ow08zbc <- Token

  const authorizedUser = await User.findOne({ token: token });
  // console.log(authorizedUser); // <- Vérifie que ça renvoie bien le bon user

  if (authorizedUser) {
    req.user = authorizedUser;
    return next();
  } else {
    return res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthenticated;
