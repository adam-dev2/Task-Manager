import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Container, Link, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); 
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/user/login', { email, password });

      if (response.data.message) {
        setMessage(response.data.message); 
        setError(response.data.message)
        setOpen(true); 

        if (response.status === 200) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('name', response.data.name);

          setTimeout(() => {
            navigate('/Dashboard');
          }, 2000);
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong!');
      setOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#B454CF' }}>
      <Box sx={{ display: 'flex', width: '80%', height: '80%', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
        <Box sx={{ width: '50%', backgroundImage: "linear-gradient(-45deg,#8306a5, #de96f2)", color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '5%' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ marginBottom: '10px' }}>Task Manager</Typography>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', lineHeight: '1.5' }}>Learn to organize your regular tasks with priority and status of completion</Typography>
          <img src="https://i.pinimg.com/736x/20/01/b6/2001b6a5af55baede26f020520d7ad5f.jpg" alt="Task Manager" style={{ width: '60%', marginTop: '20px', borderRadius: '50px' }} />
        </Box>

        <Box sx={{ width: '50%', backgroundColor: 'white', padding: '5%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ marginBottom: '20px' }}>Login</Typography>
          <TextField
            id="email"
            label="Email Address"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '20px' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '20px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{
              marginTop: '20px',
              padding: '12px',
              backgroundImage: "linear-gradient(-20deg,#8306a5, #de96f2)",
              fontSize: '16px',
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#5b48d9' },
            }}
            onClick={handleSubmit}
          >
            Login
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center', marginTop: '20px', color: 'gray' }}>
            Don’t have an account?{' '}
            <Link href="/" color="primary" underline="hover">
              Create an Account
            </Link>
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity={error ? "success" : "error"} sx={{ width: '100%' }}>
          {message} 
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
