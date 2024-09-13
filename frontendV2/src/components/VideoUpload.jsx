import useFormContext from "../hooks/useFormContext"; 
import { Grid, Box, Typography, LinearProgress, IconButton, Tooltip } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function VideoUpload() {

    const { files, pgvalues, perfs,  errors} = useFormContext();

    const getIcon = (file) => {
        if (pgvalues[file.name] === 100) {
          return <CheckCircleIcon style={{ color: '#4CAF50' }} />;
        } else if (errors[file.name]) {
          return <ErrorIcon style={{ color: '#f44336' }} />;
        } else {
          return <HelpOutlineIcon style={{ color: '#FFC107' }} />;
        }
      };
    

    return (
        <div className="video-upload-summary">
            <div className="upload-stats">
                <div className="stats-content">
                    <span class="video-header">Video Upload Summary</span>
                    <span>Total no. of videos in this batch: <b>{files.length}</b></span>
                    <span className="upload-success">Successful: <b>{Object.values(pgvalues).filter(p => p === 100).length}</b></span>
                    <span className="upload-failed">Failed: <b>{Object.keys(errors).length}</b></span>
                </div>
                <button className="back-home-button" onClick={() => window.location.href = '/'}>Back to Home</button>
            </div>

            <Grid container spacing={2}>
                {files.map((file, index) => (
                    <Grid item xs={3} key={index}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            p: 1,
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            bgcolor: 'background.paper'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                {/* <IconButton sx={{ color: errors[file.name] ? '#f44336' : '#4CAF50', mr: 1 }}>
                                    {errors[file.name] ? <ErrorIcon /> : <CheckCircleIcon />}
                                </IconButton> */}
                                <IconButton sx={{ mr: 1 }}>
                                    {getIcon(file)}
                                </IconButton>

                                <Tooltip title={file.name} placement="top">
                                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {file.name}
                                    </Typography>
                                </Tooltip>
                            </Box>
                            <LinearProgress variant="determinate" value={pgvalues[file.name] || 0} sx={{
                                width: '100%',
                                my: 1,
                                '& .MuiLinearProgress-barColorPrimary': {
                                    backgroundColor: pgvalues[file.name] === 100 ? '#4CAF50' : errors[file.name] ? '#f44336' : '#FFEB3B'
                                }
                            }} />
                            <Typography variant="caption">{pgvalues[file.name] || 0}%</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

        </div>
    );
}

export default VideoUpload;
