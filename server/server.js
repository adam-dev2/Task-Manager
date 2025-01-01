const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});


const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },  // Remove global uniqueness
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    email: { type: String, required: true },  // Store the user's email
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

db.once('open', () => {
    console.log("MongoDB connected");
});

// Authentication middleware to extract user data from JWT token
const authenticate = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied' });
    }

    try {
        const tokenWithoutBearer = token.split(" ")[1];
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

        req.user = decoded.userId;
        req.email = decoded.email;  // Add email from decoded token
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is invalid' });
    }
};

// User registration route
app.post('/user/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const usercheck = await User.findOne({ email });

        if (usercheck) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedpassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `${err}` });
    }
});

// User login route
app.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const finduser = await User.findOne({ email });

        if (!finduser) {
            return res.status(400).json({ message: 'Invalid Email' });
        }

        const isMatch = await bcrypt.compare(password, finduser.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Password' });
        }

        const token = jwt.sign(
            { userId: finduser._id, email: finduser.email },  // Include email in the token
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login Successful', name: finduser.name, token });
    } catch (err) {
        return res.status(500).json({ message: `${err}` });
    }
});

// Add a new task for the authenticated user
app.post('/task/newtask', authenticate, async (req, res) => {
    try {
        const { title, description, priority, status } = req.body;
        const userEmail = req.email;  // Get email from the authenticated user
        console.log(userEmail)

        // Check if the user already has a task with the same title
        const existingTask = await Task.findOne({ title, email: userEmail });

        if (existingTask) {
            return res.status(400).json({ message: 'You already have a task with this title' });
        }

        // Create a new task and associate it with the user's email and ID
        const newTask = new Task({
            title,
            description,
            createdAt: Date.now(),
            priority,
            status,
            email: userEmail,  // Assign the email from the token
            user: req.user  // Link the task to the authenticated user
        });

        await newTask.save();

        res.status(200).json({ message: 'Task created successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: `${err}` });
    }
});

// Get all tasks of the authenticated user
app.get('/tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user }); // Use `find` to get all tasks for the authenticated user
        res.status(200).json(tasks); // Return tasks array
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: `${err}` });
    }
});

// Update a task
app.put('/task/:title', authenticate, async (req, res) => {
    try {
        const title = req.params.title;
        const { title: newtitle, description, priority, status } = req.body;

        if (!newtitle || !description || !priority || !status) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const findtask = await Task.findOne({ title });

        if (!findtask) {
            return res.status(404).json({ message: "Can't find task" });
        }

        const conflictTask = await Task.findOne({ title: newtitle });
        if (conflictTask && conflictTask._id.toString() !== findtask._id.toString()) {
            return res.status(400).json({ message: "A task with this title already exists." });
        }

        findtask.title = newtitle;
        findtask.description = description;
        findtask.priority = priority;
        findtask.status = status;

        await findtask.save();
        res.status(200).json({ message: "Task updated successfully", task: findtask });
    } catch (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Delete a task
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

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
