const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const port = 3000;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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

const authenticate = (req,res,next) => {
    const token = req.header("Authorization");

    if(!token) {
        return res.status(401).json({message: 'Authorization denied'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch(err) {
        console.log(err);
        return res.status(401).json({message: 'Token is invalid'});
    }
}

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

        const token = jwt.sign(
            {userId: finduser._id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.status(200).json({message: 'Login Successful',token});
    } catch(err) {
        return res.status(500).json({message: 'Server Error'});
    }
})

app.post('/task/newtask',authenticate,async(req,res) => {
    try {

    }catch(err) {
        return res.status(500).json({message: 'Server Error'});
    }
})

app.listen(port,() => {
    console.log("Listetning on 3000");
})