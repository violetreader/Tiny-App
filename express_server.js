var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//so app is actually a function??? does that mean all the express libraries
//are now functions
app.get("/", (req, res) => {
  res.end("Bonjour!");
});

//below is the code to adding additional endpoints to your server
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

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
//you're rendering above template and using the keys and vlues in other files
//'urls_show' is the template name. call that name to make use of the template
//we're calling shortURL + longURL the keys and printing their values to the browser

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





