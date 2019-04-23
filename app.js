const express = require("express");
const passport = require("passport");
require("dotenv").config();

const GoogleStrategy = require("passport-google-oauth2").Strategy;
const cookieSession = require("cookie-session");
const whitelist = ["nipunbatra.1984@gmail.com", "achiekoaoki@gmail.com"];

const app = express();
app.use(
  cookieSession({
    maxAge: 0.2 * 60 * 60 * 1000, // One day in milliseconds
    keys: ["randomstringhere"]
  })
);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      whitelist.indexOf(profile._json.email) !== -1
        ? done(null, profile)
        : done(new Error("Unauthorized Email address"));
    }
  )
);
// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
  done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
  done(null, user);
});

function isUserAuthenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("You must login!");
  }
}

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"] // Used to specify the required data
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect("/secret");
  }
);

app.get("/secret", isUserAuthenticated, (req, res) => {
  res.send("You have reached the secret route");
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(8080, () => {
  console.log("Server Started!");
});
