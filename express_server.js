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
  res.render("urls_home", { user_id: req.cookies["user_id"]});
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

  let templateVars = {  urls: urlDatabase,
                        user_id: req.cookies["user_id"]};
    res.render("urls_index", templateVars);
  // console.log(req.body);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/new", (req, res) => {
// true if user is not registered
  if (!(req.cookies["user_id"])) {
    res.status(401);
    res.redirect("/login");
  } else {
    // console.log(req.body); //outputs: { longURL: 'www.cool.com' } YES
    // console.log(req.cookies); // outputs: { user_id: 'ybgtv2' } YES
    let userID = req.cookies["user_id"];
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    let uniqueShortURL = {
      "longURL": longURL,
      "user_id": userID
    }
    urlDatabase[shortURL] = uniqueShortURL;
    res.redirect("/");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL],
                      user_id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
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
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// var urlDatabase = {
//   "b2xVn2": {
//     "longURL": "http://www.lighthouselabs.ca",
//     "user_id": "userRandomID"
//   },

  //   let userID = req.cookies["user_id"];
  //   let shortURL = generateRandomString();
  //   let longURL = req.body.longURL;
  //   let uniqueShortURL = {
  //     "longURL": longURL,
  //     "user_id": userID
  //   }
  //   urlDatabase[shortURL] = uniqueShortURL;
  //   res.redirect("/");
  // }

app.post("/urls/:shortURL", (req, res) => {
  var newURL = req.body["longURL"];
  var ObjBod = {
    "longURL": newURL,
    "user_id": req.cookies["user_id"]
  }
  urlDatabase[req.params.shortURL] = ObjBod;
  res.redirect("/urls");
});

// separate function below so email and pass aren't together
app.post("/login", (req, res) => {
  let user = emailMatchesPassCheck(req.body.email, req.body.password);
  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(401);
    res.send("ERROR Enter valid email and password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/");
});

app.get("/register", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL],
                      user_id: req.cookies["user_id"]};
  res.render("urls_register", templateVars);
});

app.get("/emptyStr", (req, res) => {
  res.status(400);
  res.render("urls_emptyEmPas", { user_id: req.cookies["user_id"] });
});

app.get("/email_exists_already", (req, res) => {
  res.status(400);
  res.render("urls_emailExist", { user_id: req.cookies["user_id"] });
});

app.post("/register", (req, res) => {

  let emailExist = doesEmailExist(req.body.email);

  if (emailExist) {
    res.redirect("/email_exists_already");
  } else if (req.body.email === "" || req.body.password === "") {
    res.redirect("/emptyStr");
  } else {
    const email = req.body.email;
    const password = req.body.password;
    const newUserID = generateRandomString();
    users[newUserID] = {};
    users[newUserID].id = newUserID;
    users[newUserID].email = req.body.email;
    users[newUserID].password = req.body.password;

    res.cookie("user_id", newUserID);

    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL],
                      user_id: req.cookies["user_id"]};
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
    if (users.hasOwnProperty(i)) {
      if (users[i].email === email) {
        return true;
      }
    }
  }
  return false;
}


function emailMatchesPassCheck (email, password) {
  for (var i in users) {
    if (users.hasOwnProperty(i)) {
      if (users[i].email === email) {
        if (users[i].password === password) {
          return users[i];
        }
      }
    }
  }
  return false;
}







