import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  Drawer,
  IconButton,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

const SettingsDrawer = ({ isOpen, onClose }) => {
  const [llmUrl, setLlmUrl] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [finnhubApiKey, setFinnhubApiKey] = useState("");

  const saveSettings = async () => {
    await axios.post("http://localhost:8000/settings", {
      llmUrl,
      llmApiKey: llmApiKey === "***" ? undefined : llmApiKey,
      finnhubApiKey: finnhubApiKey === "***" ? undefined : finnhubApiKey,
    });
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchSettings = async () => {
      const response = await axios.get("http://localhost:8000/settings");
      setLlmUrl(response.data.llmUrl);
      setLlmApiKey(response.data.llmApiKey);
      setFinnhubApiKey(response.data.finnhubApiKey);
    };
    fetchSettings();
  }, [isOpen]);

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: 300,
          p: 2,
          height: "100%",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        <Stack spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <TextField
            label="LLM URL"
            value={llmUrl}
            onChange={(e) => setLlmUrl(e.target.value)}
            size="small"
          />
          <TextField
            label="LLM API Key"
            value={llmApiKey}
            onChange={(e) => setLlmApiKey(e.target.value)}
            size="small"
          />
            <TextField
            label="FinnHub API Key"
            value={finnhubApiKey}
            onChange={(e) => setFinnhubApiKey(e.target.value)}
            size="small"
          />
          <Button variant="contained" color="primary" onClick={saveSettings}>
            Save
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

const SettingsControl = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        <SettingsIcon />
      </IconButton>
      <SettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default SettingsControl;
