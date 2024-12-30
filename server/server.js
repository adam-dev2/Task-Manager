const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const port = 3000;
require('dotenv').config();

const app = express();

app.use(cors());

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



app.listen(port,() => {
    console.log("Listetning on 3000");
})