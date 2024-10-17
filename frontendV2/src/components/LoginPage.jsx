import React, { useState } from "react";
// import { Grid, TextField, Button, Typography } from "@mui/material";
import { signIn } from 'aws-amplify/auth'; // Import the Auth module from Amplify
import { Grid, Box, Typography, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import logoImage from "../assets/logo.png";

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      // AWS Cognito login
      const user = await signIn({
        username: email,
        password: password,
      })
      
      onLogin(); // Call the onLogin function when successful
    } catch (error) {
      console.error('Login error', error);
      setErrorMessage('Invalid credentials! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          backgroundColor: 'white',
        }}>
          <img src={logoImage} alt="Saint Louis Zoo Logo" style={{ marginBottom: '8rem' }} width={350}/>
          <Typography variant="h5" sx={{ marginBottom: '2rem' }}>
            Welcome Admin!
          </Typography>
          <Box sx={{
            width: '50%',
            height: '4px',
            background: 'linear-gradient(to right, #ffd700, #ff4500, #ff1493)',
          }} />
        </Box>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          backgroundColor: '#f3f0e8',
        }}>
          <Box component="form" onSubmit={handleSubmit} sx={{
            width: '100%',
            maxWidth: 400,
            padding: 3,
            backgroundColor: 'white',
            borderRadius: 2,
          }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Signin
            </Typography>
            <Grid Item style={{ border: 'none' }}>
            <TextField 
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                sx: {
                  height: '56px',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: 'inherit'
                  },
                  border: 'none' 
                }
              }}
            />
            </Grid>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { height: '56px', border: 'none'}
              }}
            />
            {/* <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', marginTop: 1 }}>
              Forgot Password?
            </Typography> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                backgroundColor: '#FFD700',
                '&:hover': {
                  backgroundColor: '#FFC700',
                }
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Signin'}
            </Button>
            {errorMessage && (
              <Typography color="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: '100%',
            maxWidth: 400,
            height: '4px',
            marginTop: 2,
            background: 'linear-gradient(to right,  #ffd700, #ff4500, #ff1493)',
          }} />
        </Box>
      </Box>
    );  
}

export default Login;