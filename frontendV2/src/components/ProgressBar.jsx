import React, { useState } from 'react';
import '../styles/ProgressBar.css'; // Ensure the CSS file is linked correctly
import useFormContext from "../hooks/useFormContext"

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { titleList } from "../constants/constants"

function ProgressBar() {
    const {page } = useFormContext();

    if (page === 5 || page === 6) return null;

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
    // return (
        // <div data-automation-id="progressBar" class="css-3frnkb">
        //     <div data-automation-id="progressBarCompletedStep" class="css-th0jv">
        //         <div class="css-yjitp2">
        //         <div color="#76B900" class="css-klnzhc"></div>
        //         <div class="css-1rjq8gp">
        //             <div color="#76B900" class="css-19eftio"></div>
        //         </div>
        //         <div color="#76B900" class="css-1qdikki"></div>
        //         </div>
        //         <label aria-live="polite" class="css-vv2f43">completed step 1 of 7 My Information</label>
        //     </div>

        //     <div data-automation-id="progressBarActiveStep" class="css-th0jv">
        //         <div class="css-yjitp2">
        //         <div color="#76B900" class="css-1qdikki"></div>
        //         <div class="css-1rjq8gp">
        //             <div color="#76B900" class="css-2obya8"></div>
        //         </div>
        //         <div color="#76B900" class="css-fkn6a7"></div>
        //         </div>
        //         <label aria-live="polite" class="css-vv2f43">current step 2 of 7</label>
        //     </div>

        //     <div data-automation-id="progressBarInactiveStep" class="css-th0jv">
        //         <div class="css-yjitp2">
        //         <div color="#76B900" class="css-fkn6a7"></div>
        //         <div class="css-1rjq8gp">
        //             <div class="css-1osnbx9"></div>
        //         </div>
        //         <div color="#76B900" class="css-fkn6a7"></div>
        //         </div>
        //         <label aria-live="polite" class="css-vv2f43">Application Questions 1 of 2</label>
        //     </div>

        //     <div data-automation-id="progressBarInactiveStep" class="css-th0jv">
        //         <div class="css-yjitp2">
        //         <div color="#76B900" class="css-fkn6a7"></div>
        //         <div class="css-1rjq8gp">
        //             <div class="css-1osnbx9"></div>
        //         </div>
        //         <div color="#76B900" class="css-fkn6a7"></div>
        //         </div>
        //         <label aria-live="polite" class="css-vv2f43">Application Questions 2 of 2</label>
        //     </div>

        // </div>
    // );
}

export default ProgressBar;
