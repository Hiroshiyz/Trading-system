const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models").User;
const fs = require("fs");
const path = require("path");
const publicKeyPath = path.resolve(process.env.PUBLIC_KEY_PATH);
const publicKey = fs.readFileSync(publicKeyPath, "utf8");
module.exports = (passport) => {
  let opts = {}; //passport-jwt自動抓opts
  //!從cookie抓token
  opts.jwtFromRequest = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies.token;
    }
    return token;
  };
  opts.secretOrKey = publicKey; //RSA256
  opts.algorithms = ["RS256"];
  //jwt驗證
  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        let foundUser = await User.findOne({
          where: {
            id: jwt_payload.id,
          },
          attributes: { exclude: ["password"] },
        });
        if (foundUser) {
          return done(null, foundUser); //req.user = foundUser
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
