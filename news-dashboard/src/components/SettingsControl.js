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
  Slider,
  Autocomplete,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

const SettingsDrawer = ({ isOpen, onClose }) => {
  const [llmUrl, setLlmUrl] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [finnhubApiKey, setFinnhubApiKey] = useState("");
  const [qualityWeight, setQualityWeight] = useState(0);

  const saveSettings = async () => {
    await axios.post("http://localhost:8000/settings", {
      llmUrl,
      llmApiKey: llmApiKey === "***" ? undefined : llmApiKey,
      finnhubApiKey: finnhubApiKey === "***" ? undefined : finnhubApiKey,
      routerQualityWeight: qualityWeight,
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
      setQualityWeight(response.data.routerQualityWeight);
    };
    fetchSettings();
  }, [isOpen]);

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          p: 2,
          height: "100%",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        <Stack spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <Autocomplete
            freeSolo
            options={[
              'https://api.openai.com/v1',
              'https://llm.cast.ai/openai/v1',
              'http://castai-ai-optimizer-proxy.castai-agent.svc.cluster.local:443/openai/v1',
            ]}
            value={llmUrl}
            onChange={(event, newValue) => setLlmUrl(newValue || '')}
            onInputChange={(event, newInputValue) => setLlmUrl(newInputValue)}
            renderInput={(params) => (
              <TextField {...params} label="LLM URL" size="small" />
            )}
          />
          <TextField
            label="LLM API Key"
            value={llmApiKey}
            type="password"
            onChange={(e) => setLlmApiKey(e.target.value)}
            size="small"
          />
            <TextField
            label="FinnHub API Key"
            value={finnhubApiKey}
            type="password"
            onChange={(e) => setFinnhubApiKey(e.target.value)}
            size="small"
          />
            <Box sx={{ m: 3, p: 2 }}>
                <Typography gutterBottom>Router quality/cost weight: {qualityWeight}</Typography>
                <Slider
                    value={qualityWeight}
                    onChange={(event, newValue) => {
                        setQualityWeight(newValue);
                    }}
                    step={0.05}
                    marks
                    min={0}
                    valueLabelDisplay="auto"
                    max={1}/>
            </Box>
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
