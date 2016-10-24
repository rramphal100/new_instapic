var express = require("express");
var promise = require("bluebird");
var path = require("path");
var app = express();

var options = {
	promiseLib: promise
};

var pgp = require("pg-promise")(options);

//database access credentials
// var un = "postgres";
// var pw = "12345";
// var port = 5432;

var connection = {
	host: 'localhost',
	port: 5432,
	database: 'instapic',
	user: 'postgres',
	password: '12345'
};

var db = pgp(connection);

var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static("public"));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

//get all users
app.get("/", function(req, res, next){
	db.any("SELECT * FROM users")
	.then(function(users){
		res.render("index", {users: users});
	})
	.catch(function(err){
		return next(err);
	});
});

app.get("/users/:name", function(req,res,next){
	db.task(t=> {
		return t.one("SELECT * FROM users WHERE name=$1", req.params.name)
		.then(user=> {
			return t.any("SELECT * FROM pics WHERE name=$1", user.name);
		});
	})
	.then(pics=> {
		res.render("user", {name: req.params.name, pics: pics});
	})
	.catch(error=> {
		return next(error);
	});
});

app.post("/users", function(req, res, next){
	db.none("INSERT INTO users (name, password) values ('" + req.body.name + "', '" + req.body.password + "')")
	.then(function(){
		res.redirect("/");
	})
	.catch(function(err){
		return next(err);
	});
});


app.listen(80, function(){
	console.log("New Instapic app listening on port 80!");
});



















