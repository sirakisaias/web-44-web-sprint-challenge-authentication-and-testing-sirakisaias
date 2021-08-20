const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../../config/secrets');
const Users = require('./auth-model');

function buildToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  }
  const options = {
    expiresIn: '1d',
  }
  return jwt.sign(payload, TOKEN_SECRET, options)
}

//writing middlware here


function checkBodyPayload(req, res, next) {

  if (!req.body.username || !req.body.password) {
    next({ message: `username and password required`, status: 422 })
  } else if (req.body.username < 3) {
    next({ message: `username must be at least 3 chars`, status: 422 })
  } else {
    next()
  }
}

const checkUserExsist = async(req, res, next) => {

  try{
      const [user] = await Users.findBy({username: req.body.username})
      console.log('here',user)
      if(!user){
          next({status: 422, message: "the username is invalid"})
      }else{
          req.user = user
          next()
      }
  } catch(err){
      next(err)
    }
  }

  const checkUsernameExists = async(req, res, next) => {
    try{
        const [user] = await Users.findBy({username: req.body.username})
        if(user){
            next({status: 422, message: "username is taken"})
        }else{
            req.user = user
            next()
        }
    }catch(err){
        next(err)
      }
}

router.post('/register', checkUsernameExists, checkBodyPayload, (req, res, next) => {
  res.end('implement register, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
      const {username, password} = req.body
      const rounds = process.env.BCRYPT_ROUNDS || 8; // 2 ^ 8
      const hash = bcrypt.hashSync(password, rounds);

      Users.add({username, password:hash})
        .then(newUser=>{
          res.status(201).json(newUser)
        })
        .catch(next)
});

router.post('/login', checkBodyPayload, checkUserExsist, (req, res, next) => {
  res.end('implement login, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
      if(bcrypt.compareSync(req.body.password, req.user.password)){
        const token = buildToken(req.user)
        res.json({
          message: `Welcome back ${req.user.username}!`,
          token:token,
        })
    
      }else{next({status: 401, message: 'Invalid Credentials'})}
});

module.exports = router;
