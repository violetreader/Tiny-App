var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
//when do we make libraries a function so we can access all their methods

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.end("Bonjour!");
});

//below is the code to adding additional endpoints to your server
//each is called a handler
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls_index", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
//you're rendering above template and using the keys and vlues in other files
//'urls_show' is the template name. call that name to make use of the template
//we're calling shortURL + longURL the keys and printing their values to the browser


app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // // Respond with 'Ok' (we will replace this)
  // res.send("Ok");
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
  // res.redirect("/urls/" + shorttURL);
});
//make sure above app.post correspends to the form attribute method in /urls path file
//express routes are based on paths AND methods!!!

app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase });
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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





