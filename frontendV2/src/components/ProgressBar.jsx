import React, { useState } from 'react';
import useFormContext from "../hooks/useFormContext"

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { titleList } from "../constants/constants"

function ProgressBar() {
    const {page } = useFormContext();

    if (page ==0 || page === 6) return null;

    return (
        <Box sx={{ width: '100%', }} >
          <Stepper activeStep={page} alternativeLabel 
           sx={{
            color: '#f8a228',
            '& .MuiStepIcon-root.Mui-active': {
              color: '#f8a228',
            },
            '& .MuiStepIcon-root.Mui-completed': {
              color: '#f8a228',
            }
          }}
          >
            {titleList.map((label) => (
              <Step key={label} >
                <StepLabel
                    sx={{
                    '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel': {
                        marginTop: '5px',
                    }
                    }}
                >{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      );
}

export default ProgressBar;
