const express = require("express");
const session = require("express-session");
const engine = require('ejs-mate')
const passport = require("./passport");
const BotClient = require("./bot");
const path = require("path");
const flash = require('connect-flash');
const app = express();

app
  .set("port", process.env.PORT || 80)
  .use(express.static("public"))
  .use(
    session({
      secret: "dashboardfeliz",
      resave: true,
      saveUninitialized: true,
    })
  )
  .use(flash())
  .use(express.json())
  .use(express.urlencoded({
    extended: true
  }))
  .use(passport.initialize())
  .use(passport.session())
  .set("views", path.join(__dirname, "../views"))
  .set("view engine", "ejs")
  .engine("ejs", engine)
  .use((req, res, next) => {
    req.BotClient = BotClient;
    app.locals.ok = req.flash('ok');
    next();
  })
  .use("/", require("../routes/routes"));

module.exports = app;
