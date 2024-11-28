## LLM Demo News

### Overview

LLM Demo News is a demonstration project showcasing the integration of financial news sentiment analysis using a Large Language Model (LLM). This project fetches market-related news articles, classifies their sentiment (positive, negative, neutral), and categorizes them by industry (e.g., Technology, Healthcare, etc.). It includes a backend powered by FastAPI and a React-based frontend for real-time visualization.

You will need access to an LLM, like open AI and a free finnhub API token, which you can get here: https://finnhub.io/  

### Features
- News Fetching: Retrieves market news from Finnhub.
- Sentiment Analysis: Uses an LLM to classify article sentiment from -5 (negative) to 5 (positive).
- Industry Categorization: Assigns articles to specific industries based on content.
- Real-Time Dashboard: Displays a timeline of sentiment scores and categorized articles in a browser-based UI.

### Tech Stack
- Backend: FastAPI, Python
- Frontend: React, Chart.js
- Database: SQLite
- LLM Integration: Local endpoint for LLM (compatible with OpenAI APIs)
- APIs:
    - Finnhub API for news data
    - Custom LLM API for sentiment analysis

### Setup

#### Prerequisites

Ensure the following tools are installed on your system:
- Python 3.11+
- Node.js 16+
- npm 8+
- pip (Python package manager)

### Backend Installation

1. Clone the Repository
```shell
git clone https://github.com/castai/llm_demo_news
cd llm-demo-new
```
2. Create a Virtual Environment
```shell
python -m venv venv
source venv/bin/activate
```
3. Install Dependencies
```shell
pip install -r requirements.txt
```
4. Configure secrets in config.yaml
```yaml
llm:
  url: "http://localhost:8090/v1/"
  api_key: "your-llm-api-key"

finnhub:
  api_key: "your-finnhub-api-key"
```
5. Run the Server
```shell
./scripts/start_server.sh
```
The backend will be available at http://127.0.0.1:8000

### Frontend Installation
1. Navigate to the dashboard
```shell
cd news-dashboard
```
2. Install Dependancies
```shell
npm install
```
3. Start the development server
```shell
npm run start
```
The frontend will be available at http://localhost:3000.

### Usage
1. Start both the backend and frontend servers.
2. Open the frontend in your browser (http://localhost:3000).
3. Use the controls to:
    - Start/Stop polling news articles.
    - Start/Stop classifying articles.
    - Reset classifications.
4. View the sentiment timeline and detailed news articles on the dashboard.



## Create Image for K8s

Run `./scripts/build_multi.sh`. The image will be `kirilomancastai/demo:$tag`. Make sure to update the `k8s/demo.yaml` file with the latest working tag.

## Deploy in K8s cluster

From root, run `./scripts/deploy.sh` while in the context of your cluster. It will return the URL that can be accessed. Paste it in the browser and use the APP.
