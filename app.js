//jshint esversion:6

const express = require("express");
const bodyParser= require("body-parser");
const date= require(__dirname + "/date.js");

const app= express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var items=["Buy Food", "Cook Food", "Eat Food"];
var workItems=[];

app.get("/", function(req,res){
    res.render("list",{ListTitle: date(), NewItem: items});
});

app.post("/",(req,res) =>{
    var item = req.body.item;
    if(req.body.list === "Work"){
        workItems.push(item);
        res.redirect("/work");
    }else{
        items.push(item);
        res.redirect("/");
    }

});

app.get("/work", function(req,res){
    res.render("list", {ListTitle: "Work", NewItem: workItems});
});

app.post("/work",(req,res) =>{
    var item = req.body.item;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
})