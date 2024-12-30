const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')

const port = 3000;
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    priority: {type: String, enum:['Low', 'Medium','High'],default: 'Low'},
    status: {type: String, enum: ['Pending','In Progress','Completed'], default: 'Pending'},
})

const User = mongoose.model('User',userSchema);
const Task = mongoose.model("Task",taskSchema);

db.once('open',() => {
    console.log("mongo db connected");
})

app.post('/user/signup',async(req,res) => {
    try{
        const {name,email,password} = req.body;
        const usercheck = await User.findOne({email});

        if(usercheck) {
            return res.status(400).json({message: 'User already exists with this email'});
        }
        const hashedpassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name,
            email,
            password: hashedpassword,
        })

        await newUser.save();

        res.status(201).json({message: 'User created succefully'});
    }catch(err) {
        res.status(500).json({message: 'Server Error'});
    }
})

app.post('/user/login',async(req,res) => {
    try {
        const {email,password} = req.body;
        const finduser = User.findOne({email});
        if(!finduser) {
            return res.status(400).json({message: 'Invalid Email'});
        }

        const isMatch = await bcrypt.compare(password,finduser.password);

        if(!isMatch) {
            return res.status(400).json({message: 'Invalid Password'});
        }

        res.status(200).json({message: 'Login Successful'});
    } catch(err) {
        res.status(500).json({message: 'Server Error'});
    }
})

app.listen(port,() => {
    console.log("Listetning on 3000");
})