import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Stack, FormControlLabel, Switch } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PollingControls = () => {
    const [status, setStatus] = useState({ is_polling: false, is_classifying: false });

    const resetClassifications = async () => {
        try {
            // Send a POST request to the reset endpoint
            await axios.get('http://localhost:8000/reset_classifications');
            console.log('Classifications reset successfully.');
            await updateStatus();
        } catch (error) {
            console.error("Error resetting classifications:", error);
        }
    };

    const updateStatus = async () => {
        try {
            const response = await axios.get('http://localhost:8000/polling_status');
            setStatus(response.data);
        } catch (error) {
            console.error("Error updating status:", error.response || error.message);
        }
    };

    const togglePolling = async (start) => {
        try {
            await axios.get(`http://localhost:8000/${start ? 'start_polling' : 'stop_polling'}`);
            await updateStatus();
        } catch (error) {
            console.error("Error toggling polling:", error.response || error.message);
        }
    };

    const toggleClassifying = async (start) => {
        try {
            await axios.get(`http://localhost:8000/${start ? 'start_classifying' : 'stop_classifying'}`);
            await updateStatus();
        } catch (error) {
            console.error("Error toggling classification:", error.response || error.message);
        }
    };

    useEffect(() => {
        updateStatus();
    }, []);

    return (
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f9f9f9', maxWidth: 600, margin: '0 auto' }}>
            <Typography variant="h5" gutterBottom>Polling and Classification Controls</Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                <FormControlLabel
                    control={<Switch
                        defaultChecked={false}
                        checked={status.is_polling}
                        onChange={() => togglePolling(!status.is_polling)}/>
                    }
                    label="Poll articles" />
                <FormControlLabel
                    control={<Switch
                        defaultChecked={false}
                        checked={status.is_classifying}
                        onChange={() => toggleClassifying(!status.is_classifying)}/>
                    }
                    label="Classify articles" />
                <Button variant="outlined" startIcon={<DeleteIcon />} onClick={resetClassifications}>Reset Classification</Button>
            </Stack>
        </Box>
    );
};

export default PollingControls;