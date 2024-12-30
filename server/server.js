const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const port = 3000;
const path = require('path');
const { Console } = require('console');
const { title } = require('process');
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
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
})

const User = mongoose.model('User',userSchema);
const Task = mongoose.model("Task",taskSchema);

db.once('open',() => {
    console.log("mongo db connected");
})

const authenticate = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied' });
    }

    try {
        const tokenWithoutBearer = token.split(" ")[1];
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

        req.user = decoded.userId;
        console.log(req.user)
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: 'Token is invalid' });
    }
};


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
        console.log(err);
        res.status(500).json({message: `${err}`});
    }
})

app.post('/user/login',async(req,res) => {
    try {
        const {email,password} = req.body;
        const finduser = await User.findOne({email});
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
        console.log(token);
        res.status(200).json({message: 'Login Successful',token});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: `${err}`});
    }
})

app.post('/task/newtask',authenticate,async(req,res) => {
    try {
        const {title, description, priority,status} = req.body;
        const findtask = await Task.findOne({title});

        if(findtask) {
            return res.status(401).json({message: 'Task Exists'});
        }
        console.log(req.user)
        if (!req.user) {
            return res.status(400).json({ message: 'User not authenticated' });
        }

        const newTask = new Task({
            title,
            description,
            createdAt: Date.now(),
            priority,
            status,
            user : req.user
        })

        await newTask.save();

        res.status(200).json({message : 'Task created successfully'});
    }catch(err) {

        return res.status(500).json({message: `${err}`});
    }
})

app.get('/tasks',authenticate,async(req,res) => {
    try{
        const  tasks = await Task.findOne({user: req.user});
        console.log(tasks)
        res.status(200).json(tasks);
    }catch(err) {
        return res.status(500).json({message: 'server Error'});
    }
})

app.put('/task/:title',authenticate,async(req,res) => {
    try{
        const title = req.params.title;
        const newtitle = req.body.title;
        const {description, priority,status} = req.body;
        const findtask = await Task.findOne({title});
        console.log(findtask)
        if(!findtask) {
            return res.status(404).json({message: "can't find tasks"});
        }

        findtask.title = newtitle;
        findtask.description = description;
        findtask.priority = priority;
        findtask.status = status;

        await findtask.save();
        res.status(200).json({message: "Task updated successfully",task: findtask});
    }catch(err) {
        return res.status(500).json({message: `${err}`});
    }
})

app.delete('/task/deletetask', authenticate, async (req, res) => {
    try {
        const { title } = req.body;
        const user = req.user; 

        const deletetask = await Task.deleteOne({ title, user });
        console.log(deletetask);

        if (deletetask.deletedCount === 0) {
            return res.status(404).json({ message: "Can't find that task" });
        }

        const tasks = await Task.find({ user });

        return res.status(200).json({ message: 'Deleted Successfully', remainingTasks: tasks });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});


app.listen(port,() => {
    console.log("Listetning on 3000");
})