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
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "justTryingToLearn"
  }
}


app.get("/", (req, res) => {
  res.render("urls_home", { user_id: req.session["user_id"]});
});

//below is the code to adding additional endpoints to your server
//each is called a handler
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/users.json", (req, res) => {
  res.json(users);
});

//do we even need this?
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  // console.log(req.session.user_id);
  // let SessionMatch = userIDMatchLoggedInUser(req.session.user_id);
  if (req.session.user_id) {
    console.log(req.session);
    console.log(req.session.user_id);
    // console.log(SessionMatch);
    console.log(urlDatabase);
    let templateVars = {  urls: sessionURLSobj(req.session.user_id),
                          user_id: req.session.user_id,
                          // sMatch: SessionMatch,
                          currLongURL: req.body.longURL };
    //because our cookies saved on our browser! and that's where
    //we are getting it from!!
    res.render("urls_index", templateVars);
  } else {
    res.send("please login in order to see some URLS!")
  }
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user_id: req.session["user_id"]});
});


app.post("/urls/new", (req, res) => {
// true if user is not registered
  if (!((req.session)["user_id"])) {
    res.status(401);
    res.redirect("/login");
  } else {
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
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  console.log("urlData: ", urlDatabase);
  // console.log("req.body: ", req.body);
  // console.log("req.params: ", req.params);
  console.log("req.params.shortURL: ", req.params.shortURL);
  let shrtURL = req.params.shortURL;
  // console.log("in req.sessionL ", req.session);
  console.log("longurl: ",  urlDatabase[shrtURL].longURL);
  let lrgURL = urlDatabase[shrtURL].longURL;
  // res.send("you will be redirected shortly");
  res.redirect(lrgURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
//express routes are based on paths AND methods!!!

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log(urlDatabase[req.params.shortURL]);
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {

  var newURL = req.body["longURL"];
  var ObjBod = {
    "longURL": newURL,
    "user_id": req.session["user_id"]
  }
  urlDatabase[req.params.shortURL] = ObjBod;
  let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL].longURL
                      ,
                      user_id: req.session["user_id"]};
  res.render("urls_show", templateVars);
});

// separate function below so email and pass aren't together
app.post("/login", (req, res) => {
  let user = emailMatchesPassCheck(req.body.email, req.body.password);
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(401);
    res.send("ERROR Enter valid email and password");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/");
});

app.get("/register", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL],
                      user_id: req.session["user_id"]};
  res.render("urls_register", templateVars);
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
    res.redirect("/email_exists_already");
  } else if (req.body.email === "" || req.body.password === "") {
    res.redirect("/emptyStr");
  } else {
    const email = req.body.email;
    const newUserID = generateRandomString();
    users[newUserID] = {};
    users[newUserID].id = newUserID;
    users[newUserID].email = req.body.email;
    users[newUserID].password = hashed_password;

    req.session.user_id = newUserID;

    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL],
                      user_id: req.session["user_id"]};
  res.render("urls_login", templateVars);
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

// function userIDMatchLoggedInUser (id) {

//   for (var key in urlDatabase) {
//     if (urlDatabase[key].user_id === id) {
//       return true;
//     }
//   }
//   return false;
// }

function sessionURLSobj (id) {
  var ansObj = {};
  for (var key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      ansObj[key] = urlDatabase[key];
    }
  }
  return ansObj;
}






