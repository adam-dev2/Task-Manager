import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Modal,
  TextField,
  Box,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Low",
    status: "Pending",
  });
  const [editMode, setEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const userName = localStorage.getItem("name") || "User";
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const fetchTasks = async () => {
    try {
      if (!token) throw new Error("Unauthorized: Token missing.");
      const response = await axios.get("http://localhost:3000/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data || []);
    } catch (err) {
      handleSnackbarOpen(err.message || "Error fetching tasks.", "error");
    }
  };

  const handleSaveTask = async () => {
    try {
      if (!newTask.title || !newTask.description) {
        throw new Error("Title and Description are required.");
      }

      if (editMode) {
        await axios.put(
          `http://localhost:3000/task/${editingTaskId}`,
          {
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            status: newTask.status,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        handleSnackbarOpen("Task updated successfully.");
      } else {
        await axios.post("http://localhost:3000/task/newtask", newTask, {
          headers: { Authorization: `Bearer ${token}` },
        });
        handleSnackbarOpen("Task added successfully.");
      }
      fetchTasks();
      setOpenModal(false);
      setNewTask({ title: "", description: "", priority: "Low", status: "Pending" });
      setEditingTaskId(null);
    } catch (err) {
      handleSnackbarOpen(err.response?.data?.message || "Error saving task.", "error");
    }
  };

  const handleEditTask = (task) => {
    setNewTask(task);
    setEditMode(true);
    setEditingTaskId(task.title);
    setOpenModal(true);
  };

  const handleDeleteTask = async (title) => {
    try {
      await axios.delete("http://localhost:3000/task/deletetask", {
        headers: { Authorization: `Bearer ${token}` },
        data: { title },
      });
      handleSnackbarOpen("Task deleted successfully.");
      fetchTasks();
    } catch (err) {
      handleSnackbarOpen(err.message || "Error deleting task.", "error");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          width: "20%",
          backgroundColor: "#1e1e2f",
          color: "#fff",
          paddingTop: "20px",
          height: "100vh",
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ textAlign: "center", color: "#fff" }}>
            Task Manager
          </Typography>
        </Box>
        <Button
          onClick={handleLogout}
          sx={{
            color: "#fff",
            marginBottom: "20px",
            padding: "10px 20px",
            backgroundColor: "#d32f2f",
            borderRadius: "8px",
            textAlign: "center",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
        >
          Logout
        </Button>
      </Box>

      <Box sx={{ marginLeft: "20%", width: "80%", paddingBottom: "20px" }}>
        <Box
          sx={{
            backgroundImage: "linear-gradient(-45deg, #4a00e0, #8e2de2)",
            height: "25vh",
            padding: "20px",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Welcome, {userName}!
          </Typography>
          <Typography variant="h6" sx={{ fontStyle: "italic" }}>
            Manage your tasks efficiently and effectively.
          </Typography>
        </Box>

        <Box p={2}>
          {tasks.length === 0 ? (
            <Typography variant="h6" align="center">
              No tasks available.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task._id}>
                  <Card
                    sx={{
                      borderRadius: "8px",
                      backgroundColor:
                        task.status === "In Progress"
                          ? "#fff3cd"
                          : task.status === "Completed"
                          ? "#d4edda"
                          : "#d1ecf1",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5">{task.title}</Typography>
                      <Typography variant="body2">{task.description}</Typography>
                      <Typography variant="body2">Priority: {task.priority}</Typography>
                      <Typography variant="body2">Status: {task.status}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        onClick={() => handleEditTask(task)}
                        disableRipple
                        sx={{
                          backgroundColor: "crimson",
                          borderRadius: "20px",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#ff9800" },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        color="success"
                        onClick={() => handleDeleteTask(task.title)}
                        disableRipple
                        sx={{
                          backgroundColor: "lightseagreen",
                          borderRadius: "20px",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#f44336" },
                        }}
                      >
                        Completed
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Button
          onClick={() => setOpenModal(true)}
          sx={{
            backgroundColor: "#8e2de2",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            width: "200px",
            marginTop: "20px",
            "&:hover": { backgroundColor: "#6a1b9a" },
          }}
        >
          Add Task
        </Button>

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {editMode ? "Edit Task" : "Add New Task"}
            </Typography>
            <TextField
              fullWidth
              label="Title"
              variant="outlined"
              margin="normal"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              margin="normal"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Priority"
              variant="outlined"
              margin="normal"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Status"
              variant="outlined"
              margin="normal"
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
            {error && (
              <Alert severity="error" sx={{ marginBottom: "10px" }}>
                {error}
              </Alert>
            )}
            <Button
              fullWidth
              onClick={handleSaveTask}
              sx={{
                backgroundColor: "#4caf50",
                color: "#fff",
                marginTop: "10px",
                "&:hover": { backgroundColor: "#388e3c" },
              }}
            >
              {editMode ? "Save Changes" : "Add Task"}
            </Button>
          </Box>
        </Modal>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;