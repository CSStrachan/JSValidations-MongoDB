// Setting up Dependencies
const express = require('express');
const req = require('express/lib/request');
const path = require ('path');
var myApp = express();
const session = require('express-session');

// DB Connection Setup
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/JuiceStore', {
    UseNewUrlParser: true,
    UseUnifiedTopology: true
});

// DB Model Setup
const Order = mongoose.model('order', {
    name : String,
    studentNum : Number,
    mangoJ : Number,
    berryJ : Number,
    appleJ : Number,
    subTotal: Number,
    tax : Number,
    totalCost : Number
});

const Admin = mongoose.model('Admin', {
    aname : String,
    pass : String
});

// Session Setup
myApp.use(session({
    secret : 'randomkey',
    resave : false,
    saveUninitialized : true
}));

//Create Object Destructuring for Express Validator
const {check, validationResult} = require ('express-validator');
// const { Admin } = require('mongodb');
myApp.use(express.urlencoded({extended:true}));

// Set path to public and views folder.
myApp.set ('views', path.join(__dirname, 'views'));
myApp.use (express.static(__dirname + '/public'));
myApp.set ('view engine', 'ejs');

// Validation Functions
var studentNumRegex = /^[0-9]{3}\-?[0-9]{4}$/;

function checkRegex(userInput, regex)
{
    if (regex.test(userInput))
        return true;
    else
        return false;
}

function customStudentNumValidation(value)
{
    if (!checkRegex(value, studentNumRegex))
    {
        throw new Error('Please enter a valid Student Number')
    }
    return true;
}

var cart = req.body.cart;
function customOrderValidation(cart, {req})
{
    if (!checkRegex(tickets, positiveNumber))
    {
        throw Error ('Your cart must have at least one item')
    }
    return true;
}

//Order Page
myApp.get('/', function(req, res){
    res.render('form');
    res.end();
});

// Receipt Posting & Validation
myApp.post('/', [
    check ('name', 'Name is required!').notEmpty(),
    check ('studentNumber', 'Please enter a valid Student Number').custom(customStudentNumValidation),
    check ('cart', '').custom(customOrderValidation)
],function(req, res){
    const errors = validationResult(req);
    console.log(errors);

    if(!errors.isEmpty())
    {
        res.render('form', {errors : errors.array()});
    }

    else{
        // If no errors occur
        var name = req.body.name;
        var studentNumber = req.body.studentNumber;
        var mangoJ = parseInt(req.body.mangoJ);
        var berryJ = parseInt(req.body.berryJ);
        var appleJ = parseInt(req.body.appleJ);
        var cart = mangoJ + berryJ + appleJ;

        var subTotal = (mangoJ * 6.99) + (berryJ * 5.99) + (appleJ*3.99); 
        var tax = subTotal*0.13;
        var totalCost = subTotal + tax;
    }

    // Object for Model-Order
    var myOrder = new Order(pageData);

    // Saving order in DB
    myOrder.save().then(function(){
        console.log('New ORder Saved');
    });

    //Display the receipt output on form.
    res.render('form', pageData);
    res.end();
});

// Log-in Page
myApp.get('/login', function(req, res){
    res.render('login');
    });

myApp.post('/login', function(req,res){
    var user = req.body.username;
    var pass = req.body.password;

    Admin.findOne({
        username: user,
        password : pass}).exec(function(err, admin){
        
            console.log(`Errors: ${err}`);
        console.log(`Admin: ${admin}`);

        if(admin)   //If admin object exists - true
        {
            //Store username in session and set login in true.
            req.session.username = admin.username;
            req.session.userLoggedIn = true;
            //Redirect user to the All-Orders Page (Dashboard)
            res.redirect('/allorders');
        }
        else
        {
            //Display error if user info is incorrect
            res.render('login', {error: "Sorry Login Failed. Please try again!"});
        }
        });
});

myApp.get('/logout', function(req, res){
    req.session.username = "";
    req.session.userLoggedIn = false;
    res.render('login',{error: 'Successfully logged out!'});
});

// Delete Functionality
myApp.get('/delete/:id', function(req,res){
    //Check if Session is established
    if(req.session.userLoggedIn) {
        //Perform delete operation
        var id = req.params.id;
        console.log("Id: " + id);
        Order.findByIdAndDelete({_id : id}).exec(function(err, order){
            console.log(`Error: ${err}`);
            console.log(`Order: ${order}`);
            if(order) {
                res.render('delete',{message: "Record Deleted Successfully!"});
            }
            else {
                res.render('delete',{message: "Sorry, Record Not Deleted!"});
            }
        });
    }   
    else
        //Otherwise redirect user to login page.
        res.redirect('/login');
});

// Edit Functionality
myApp.get('/edit/:id', function(req,res){
    //Check if Session is established
    if(req.session.userLoggedIn) {
        //Perform edit operation
        var id = req.params.id;
        console.log("Id: " + id);
        Order.findOne({_id : id}).exec(function(err, order){
            console.log(`Error: ${err}`);
            console.log(`Order: ${order}`);
            if(order) {
                res.render('edit',{order: order});
            }
            else {
                res.render('edit',{order: "No order found with this id!"});
            }
        });
    }   
    else
        //Otherwise redirect user to login page.
        res.redirect('/login');
});

myApp.post('/edit/:id', [
    check ('name', 'Name is required!').notEmpty(),
    check ('studentNumber', 'Please enter a valid Student Number').custom(customStudentNumValidation),
    check ('cart', '').custom(customOrderValidation)
],function(req, res){

    //Check if errors
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty())
    {
        //Edit 
        var id = req.params.id;
        console.log(`Id: ${id}`);
        Order.findOne({_id : id}).exec(function(err, order){
            console.log(`Error: ${err}`);
            console.log(`Order: ${order}`);
            if(order)
                res.render('edit', {order: order, errors: errors.array()});
            else
                res.send('No order was found with this id!');
        });
    }

    else 
    {
        //No Errors
        var name = req.body.name;
        var studentNum = req.body.studentNum;
        var mangoJ = req.body.mangoJ;
        var berryJ = req.body.berryJ;
        var appleJ = req.body.appleJ;
        var subTotal = req.body.subTotal;
        var tax = req.body.tax;
        var total = req.body.total;

        var subTotal = tickets * 20;
        if (lunch == 'yes')
        { subTotal+= 15; }

        var tax = subTotal * 0.13;
        var total = subTotal + tax;

        var pageData = {
            name : name, 
            studentNum : studentNum,
            mangoJ : mangoJ,
            berryJ : berryJ,
            appleJ : appleJ,
            subTotal : subTotal,
            tax : tax,
            total : total
        }
    };

    var id = req.params.id;
    Order.findOne({_id : id}).exec(function(err, order){
        order.name = name; 
        order.studentNum = studentNum;
        order.mangoJ = mangoJ;
        order.berryJ = berryJ;
        order.appleJ = appleJ;
        order.subTotal = subTotal;
        order.tax = tax;
        order.total = total;
        order.save();
    });

    //Display output: Updated Information
    res.render('editsuccess', pageData); // no need to add .ejs extension to the command.
    res.end();
});

//Server Port Listen
myApp.listen(8080);
console.log('Everything executed fine... Open http://localhost:8080/');