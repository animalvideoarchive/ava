import React from 'react';
import { 
  Typography, 
  IconButton, 
  Box,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { LocalOffer as TagIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import useFormContext from "../hooks/useFormContext"


const theme = createTheme({
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
          },
        },
      },
    },
  },
});

const AdminDashboard = () => {

  const { setPage } = useFormContext()

  const handleEditMasterTags = () => {
    console.log("Edit Master Tags clicked");
    // Add your logic here
  };

  const handleAdminUploadVideo = () => {
    console.log("Upload Video clicked");
    // Add your logic here
    setPage(prev => prev + 1)
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          pt: 8, // Add padding top to move content higher
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 4, marginTop:"30px" ,marginBottom:"90px" }}>
          Welcome Admin!
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton size="large" onClick={handleEditMasterTags}>
              <TagIcon />
            </IconButton>
            <Typography variant="body2" sx={{ mt: 1 }}>Edit Master Tags</Typography>
          </Box>

          <Box 
            sx={{ 
              width: 0.005, 
              height: 100, // Reduced height
              mx: 4,
              marginLeft: "70px",
              marginRight: "70px",
              background: 'linear-gradient(to bottom, #ffd700, #ff4500, #ff1493)'
            }} 
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton size="large" onClick={handleAdminUploadVideo}>
              <UploadIcon />
            </IconButton>
            <Typography variant="body2" sx={{ mt: 1 }}>Upload Video</Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.2" d="M0,96L34.3,101.3C68.6,107,137,117,206,122.7C274.3,128,343,128,411,133.3C480,139,549,149,617,138.7C685.7,128,754,96,823,80C891.4,64,960,64,1029,80C1097.1,96,1166,128,1234,138.7C1302.9,149,1371,139,1406,133.3L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path></svg>')`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'contain'
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;