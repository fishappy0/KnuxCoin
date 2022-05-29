var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const crypto = require("crypto");
const session = require("express-session");
var dashboardRouter = require("./routes/dashboard");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var transactionRouter = require("./routes/transaction");
const mongoose = require("mongoose");
const { handlebars } = require("hbs");
const { env } = require("process");
const mongoUrl = "mongodb://0.0.0.0:27017/test-db";
mongoose.connect(mongoUrl).then(() => {
  console.log(`<KnuxCoin Web> Connected to the database at ${mongoUrl}`);
});

var app = express();

function convert(string) {
  var date = new Date(string),
    day = ("0" + date.getDate()).slice(-2),
    month = ("0" + (date.getMonth() + 1)).slice(-2);
  return [day, month, date.getFullYear()].join("-");
}

handlebars.registerHelper("dateFormat", function (date) {
  return convert(date);
});
handlebars.registerHelper("dateHour", function (date) {
  return new Date(date).toUTCString();
});
handlebars.registerHelper("eq", function (val1, val2, opt) {
  if (val1 == val2) {
    return opt.fn(this);
  }
  return opt.inverse(this);
});

handlebars.registerHelper("currencyFormat", function (money, currency) {
  return money.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") + currency;
});

var paginateHelper = require("handlebars-paginate");
handlebars.registerHelper("paginate", paginateHelper);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(
  session({
    secret: crypto.randomBytes(4).toString("hex"),
    saveUninitialized: true,
    resave: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/dashboard", dashboardRouter);
// Nạp tiền, rút tiền, chuyển tiền,...
app.use("/transaction", transactionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
console.log(
  `<KnuxCoin Web> Application started at localhost:${env.port || "8080"}`
);
module.exports = app;
