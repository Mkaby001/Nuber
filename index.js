require('dotenv').config()
const UserSchema = require('./models/UserSchema')
const bcrypt = require('bcrypt')
const session = require('express-session')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const MongoDBStore = require('connect-mongodb-session')(session) // add this package to store the user session id automatically on mongodb
// check on your db, you will have another collection (next to people) which is 'mySessions'
const loginRouter = require('./routes/loginRoutes')

const app = express()
const MAX_AGE = 1000 * 60 * 60 * 3 // 3hrs
const port = 5001

// local 'mongodb://localhost:27017/usersdb' 
//mongodb+srv://saurabh:<password>@cluster0.ivvus.mongodb.net/?retryWrites=true&w=majority
// const username = "saurabh";
// const password = "";
// const cluster = "cluster0.ivvus";
// const DBname = "Cluster0";

const URI= `mongodb://localhost:27017/usersdb`

const corsOptions = {
  origin: 'http://192.168.1.9:3000',
  //origin: 'http://18.208.157.160:3000',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}
// This is where your API is making its initial connection to the database
mongoose.Promise = global.Promise
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  if(err) throw err;
  console.log('Connected to MongoDB!!!')
})

// setting up connect-mongodb-session store
const mongoDBstore = new MongoDBStore({
  uri: URI,
  collection: 'mySessions',
})

app.use(
  session({
    secret: 'a1s2d3f4g5h6',
    name: 'session-id', // cookies name to be put in "key" field in postman
    store: mongoDBstore,
    cookie: {
      maxAge: MAX_AGE, // this is when our cookies will expired and the session will not be valid anymore (user will be log out)
      sameSite: false,
      secure: false, // to turn on just in production
    },
    resave: true,
    saveUninitialized: false,
  })
)

app.use(cors(corsOptions))
app.use(express.json())

// ROUTERS
app.use('/api', loginRouter)

// START SERVER
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

module.exports = app
