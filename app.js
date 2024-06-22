if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require("express");
const path = require('path');
const morgan = require("morgan");
const ejs = require("ejs");
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const methodOverride = require("method-override");
const MongoStore = require('connect-mongo');
const connectDB = require('./services/database/connection');
const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(20).toString('hex');
require('./services/config/passport')(passport);


const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI ;
connectDB();

const app = express();
app.use(morgan('tiny'));
app.use(cors());

//bodyParser
app.set("view engine", "ejs");
app.use(express.urlencoded( { extended : true } ));
app.use(express.json());
app.use(flash());

app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ 
        mongoUrl: 'mongodb+srv://transversesecret:transverse%402024@transverse.erhafjy.mongodb.net/?retryWrites=true&w=majority&appName=transverse', // Replace with your MongoDB connection string
        collectionName: 'sessions' // Optional: specify the collection name where sessions will be stored
      }),
      cookies: { 
        secure: true, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 60 * 60 * 1000 
      } // 1 hour
    })
  );

  app.use((req, res, next) => {
    if (!req.session.visitorCount) {
      req.session.visitorCount = 1;
    } else {
      req.session.visitorCount += 1;
    }
    
    if (!req.session.likedBlogPosts) {
      req.session.likedBlogPosts = [];
    }
  
    next();
  });

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// app.use(nocache())

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use('/animated.css/animate.min.css', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
});

app.use('/bootstrap/css/', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
});


app.use('/css', express.static(path.resolve(__dirname, "assets/css")));
app.use('/images', express.static(path.resolve(__dirname, "assets/images")));
app.use('/js', express.static(path.resolve(__dirname, "assets/js")));
app.use('/fonts', express.static(path.resolve(__dirname, "assets/fonts")));
app.use('/bat', express.static(path.resolve(__dirname, "assets/bat")));
app.use('/bootstrap-icons', express.static(path.resolve(__dirname, "assets/bootstrap-icons")));
app.use('/fonts', express.static(path.resolve(__dirname, "assets/bootstrap-icons/fonts")));
app.use('/bat/phpmailer', express.static(path.resolve(__dirname, "assets/bat/phpmailer")));
app.use('/bat/ReCaptcha', express.static(path.resolve(__dirname, "assets/bat/ReCaptcha")));
app.use('/bat/ReCaptcha', express.static(path.resolve(__dirname, "assets/bat/ReCaptcha/RequestMethod")));



app.use((error, req, res, next) => {
    console.error("Error:", error.message); // Log the error message
    res.status(error.status || 500).send({ error: error.message }); // Send an error response
  });



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*", "fonts.googleapis.com", "fonts.gstatic.com");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
  
  app.use('/', require('./services/routes/index'));
  app.use("/admin", require("./services/routes/admin"));


  const server = app.listen(PORT, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`server running and listening at http:/%s, %%s, ${host}, ${port}`);

})

