var express = require("express");
var cookieSession = require("cookie-session");
var app = express();
app.use(cookieSession({
  name: "session",
  keys: ["pancakes"]
  }));
var PORT = process.env.PORT || 8080;
//how does making libraries a function give us access to all their methods
const bcrypt = require('bcrypt');
//express routes are based on paths AND methods!!!

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": {
    "longURL": "http://www.lighthouselabs.ca",
    "user_id": "userRandomID"
  },
  "9sm5xK": {
    "longURL": "http://www.google.com",
    "user_id": "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "2"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "3"
  }
}

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//below is the code to adding additional endpoints to your server
//each is called a handler
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/urls", (req, res) => {

    if (req.session.user_id) {
// console.log("session is there");
      let userEmail = users[req.session.user_id];
      let templateVars = {  urls: sessionURLSobj(req.session.user_id),
                            user_id: req.session.user_id,
                            currLongURL: req.body.longURL,
                            email: userEmail.email
                             };
      res.status(200);
      res.render("urls_index", templateVars);
    }
    else {
// console.log("session is not there");
      res.status(401);
      res.send('Please login in order to see URLS, <a href="/login">Login here</a>');
    }
});

app.get("/urls/new", (req, res) => {

  if (!(req.session.user_id)) {
    res.status(401);
    res.send('Please login in order to see and create URLS, <a href="/login">Login here</a>');
  } else {
    res.status(200);
    let templateVars = {  urls: sessionURLSobj(req.session.user_id),
                            user_id: req.session.user_id,
                            currLongURL: req.body.longURL,
                            email: users[req.session.user_id].email
                             };
    res.render("urls_new", templateVars);
  }
});


app.post("/urls", (req, res) => {
// true if user is not registered
  if (!(req.session.user_id)) {
    res.status(401);
    res.send("You must be logged in to create a url login <a href= '/login'>here</a>");
  } else {
    let id = req.session.user_id;
    let userID = req.session["user_id"];
    let shortURL = generateRandomString();
//longURL is connected to the form input element by the name attribute
//this is how you can use that info
    let longURL = req.body.longURL;
    let uniqueShortURL = {
      "longURL": longURL,
      "user_id": userID
    }
    urlDatabase[shortURL] = uniqueShortURL;
    res.redirect("/urls/" + shortURL);
  }
});

app.get("/u/:shortURL", (req, res) => {

  console.log(req.params.shortURL);
  let UrlIsReal = tinyUrlExist(req.params.shortURL);
  if (UrlIsReal) {
    let shrtURL = req.params.shortURL;
    let lrgURL = urlDatabase[shrtURL].longURL;
    res.redirect(lrgURL);
  }
  else {
    res.status(404);
    res.send("Please use a valid tinyURL");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {

    if (!(urlDatabase[req.params.shortURL])) {
  //status is not found but resource may be available in future
    res.status(404);
    res.send("This URL doesn't currently exist.");
    return;
  }
  if (!(req.session.user_id)) {
    res.status(401);
    res.send("You must be logged in to update, login <a href= '/login'>here</a>");
    return;
  }
//if logged in AND if id doesnt match urlid then go through this statement!!!!
  if (req.session.user_id && urlDatabase[req.params.shortURL].user_id != req.session.user_id) {
  //status is forbidden
    res.status(403);
    res.send("You must be the creator to update this URL");
    return;
  }
  else {
//code below grabs old longurl from our databse and puts in the new inputted value
//updating our newURL
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect("/urls/" + req.params.shortURL);
  }
});

app.get("/urls/:shortURL", (req, res) => {

    if (!(urlDatabase[req.params.shortURL])) {
  //status is not found but resource may be available in future
    res.status(404);
    res.send("This URL doesn't currently exist.");
    return;
  }
  if (!(req.session.user_id)) {
    res.status(401);
    res.send("You must be logged in to update and delete urls login <a href= '/login'>here</a>");
    return;
  }
//if logged in AND if id doesnt match urlid then go through this statement!!!!
  if (req.session.user_id && urlDatabase[req.params.shortURL].user_id != req.session.user_id) {
  //status is forbidden
    res.status(403);
    res.send("You must be the creator to update and delete this URL");
    return;
  }
  else {
    console.log("session shortURL: ", urlDatabase[req.params.shortURL]);
    console.log(req.session.user_id);
    res.status(200);
    let templateVars = { shortURL: req.params.shortURL,
                        longURL: urlDatabase[req.params.shortURL].longURL,
                        email: users[req.session.user_id].email,
                        user_id: req.session["user_id"]};
    res.render("urls_show", templateVars);
  }
});

app.post("/login", (req, res) => {
  let user = emailMatchesPassCheck(req.body.email, req.body.password);
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/");
  } else {
    res.status(401);
    res.send("ERROR Enter valid email and password");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  req.session.user_id = null;
  res.redirect("/");
});

app.get("/register", (req, res) => {

  if (req.session.user_id) {
    res.redirect("/");
  }
  else {
    res.status(200);
    let templateVars = { shortURL: req.params.shortURL,
                        longURL: urlDatabase[req.params.shortURL],
                        user_id: req.session["user_id"]};
    res.render("urls_register", templateVars);
  }
});

app.get("/emptyStr", (req, res) => {
  res.status(400);
  res.render("urls_emptyEmPas", { user_id: req.session["user_id"] });
});

app.get("/email_exists_already", (req, res) => {
  res.status(400);
  res.render("urls_emailExist", { user_id: req.session["user_id"] });
});

app.post("/register", (req, res) => {

  let emailExist = doesEmailExist(req.body.email);
  const password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  if (emailExist) {
    res.status(400);
    res.redirect("/email_exists_already");
  } else if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.redirect("/emptyStr");
  } else {
    const email = req.body.email;
    const newUserID = generateRandomString();
    users[newUserID] = {};
    users[newUserID].id = newUserID;
    users[newUserID].email = req.body.email;
    users[newUserID].password = hashed_password;

    req.session.user_id = newUserID;

    res.redirect("/");
  }
});

app.get("/login", (req, res) => {

  if (req.session.user_id) {
    res.redirect("/");
  }
  else {
    res.status(200);
    let templateVars = { shortURL: req.params.shortURL,
                        longURL: urlDatabase[req.params.shortURL],
                        user_id: req.session["user_id"]};
    res.render("urls_login", templateVars);
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

function doesEmailExist (email) {
  for (var i in users) {
    if (users[i].email === email) {
      return true;
    }
  }
  return false;
}


function emailMatchesPassCheck (email, password) {

  for (var key in users) {
    if (users[key].email === email) {
      if (bcrypt.compareSync(password, users[key].password)) {
        return users[key];
      }
    }
  }
  return null;
}

//why didn't urlDatabase[key] work but key did ??????????
function tinyUrlExist (shortURL) {
  for (var key in urlDatabase) {
    if (key === shortURL) {
      return true;
    }
  }
  return false;
}

function sessionURLSobj (id) {
  var ansObj = {};
  for (var key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      ansObj[key] = urlDatabase[key];
    }
  }
  return ansObj;
}






