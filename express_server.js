var express = require("express");
var cookieParser = require("cookie-parser");
var app = express();
app.use(cookieParser());
var PORT = process.env.PORT || 8080;
//how does making libraries a function give us access to all their methods


app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "justTryingToLearn"
  }
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//below is the code to adding additional endpoints to your server
//each is called a handler
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//do we even need this?
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {  urls: urlDatabase,
                        username: req.cookies["username"]
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies["username"]});
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL],
                        username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
//make sure above app.post correspends to the form attribute method in /urls path file
//express routes are based on paths AND methods!!!

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  var newURL = req.body["longURL"];
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body["username"]);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register", {username: null});
});

  urlDatabase[shortURL] = req.body.longURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);


app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const newUserID = generateRandomString();

  for (var i in emailKey) {
    var allEmails = emailKey[i];
  }
  if (req.body === "" || req.body.password === "") {
    res.statusCode(200);
    console.log("test");
//how to seeend back a status code + another ejs file to explain to user what's going on

//if email already exist here
//use for loop, loop through your users object email and check here!
  // } else if ( &&!password) {
    // this redirect doesn't tell them what happend.  fix that.
    res.redirect("/register"); // this is duct
  } else {
    users[newUserID] = {};
    users[newUserID].id = newUserID;
    users[newUserID]["email"] = req.body.email;
    users[newUserID].password = req.body.password;
    res.cookie("user_id", req.body["newUserID"]);
    res.redirect("/");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(){

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}






