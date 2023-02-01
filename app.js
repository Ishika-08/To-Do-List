const express = require("express");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
const _=require('lodash');
const date= require(__dirname + "/date.js");

const app= express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose database setup
main().catch(err => console.log(err));

async function main() {
    mongoose.set("strictQuery", false);
    await mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');
}

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "welcome to your to do list!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3= new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String, 
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req,res){

    Item.find((err,foundItems)=>{

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("Data succesfully added to collection");
                }
                res.redirect("/");
            });
        }else{
            res.render("list",{ListTitle: "Today", NewItem: foundItems});
        }
    })
});

app.post("/",(req,res) =>{
    const item = req.body.item;
    const title = req.body.list;
    const newItem = new Item({
        name: item
    })

    if(title === "Today"){
        Item.insertMany(newItem, (err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("Succesfully saved the data");
            }
        });
        res.redirect("/");
    }else{
        List.find({name: title},(err,foundList)=>{
            foundList[0].items.push(newItem);
            foundList[0].save();
            res.redirect("/"+ title);
        })
    }
});


app.post("/delete",(req,res)=>{
    const checkedItemId = req.body.checkBox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId, (err)=>{
            if(err){
                console.log(err);
            }else{
                console.log(checkedItemId + "  deleted!");
            }
        })
        res.redirect("/");
    }else{
        List.findOneAndUpdate(
            {name: listName},
            {$pull: {items: {_id:checkedItemId}}},
            (err,foundList)=>{
                if(!err){
                    res.redirect("/" + listName);
                }
            }
            )      
    }
})

app.get("/:parameter",(req,res)=>{
    const title= _.capitalize(req.params.parameter);
    

    List.find({name: title},(err,foundItems)=>{
        if(foundItems.length === 0){
                const list = new List({
                    name: title,
                    items: defaultItems
                });
                list.save(); 
                res.redirect("/" + title); 
        }else{
            res.render("list",{ListTitle: title, NewItem: foundItems[0].items});       

        }
    })
})

app.listen(3000, function(){
    console.log("Server started on port 3000");
})