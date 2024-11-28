# main.py
from fastapi import FastAPI, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
import time
from db_setup import init_db
from news_fetcher import fetch_and_store_articles
from db_setup import get_db_connection, reset_classifications
from datetime import datetime
from classify import classify_articles
from config_loader import load_config
from logger_config import get_logger

logger = get_logger(__name__)

# Load configuration
config = load_config()
if config is None:
    logger.error("Configuration could not be loaded. Exiting.")
    exit(-1)

# Access configuration values
LLM_URL = config["llm"]["url"]
LLM_API_KEY = config["llm"]["api_key"]
FINNHUB_API_KEY = config["finnhub"]["api_key"]


app = FastAPI()
is_polling = False
is_classifying = False

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/", StaticFiles(directory="frontend/build", html=True), name="frontend")

@app.on_event("startup")
async def startup_event():
    init_db()  # Ensure the DB is set up on startup

@app.options("/reset_classifications")
async def options_handler():
    return {"status": "OK"}

@app.get("/reset_classifications")
async def reset_classifications_route():
    reset_classifications()
    return {"message": "Classifications reset."}

@app.options("/polling_status")
async def options_handler():
    return {"status": "OK"}

@app.get("/polling_status")
async def polling_status():
    return {"is_polling": is_polling, "is_classifying": is_classifying}

@app.options("/start_polling")
async def options_handler():
    return {"status": "OK"}

@app.get("/start_polling")
async def start_polling():
    global is_polling
    if not is_polling:
        is_polling = True
        asyncio.create_task(poll_news())
    return {"is_polling": is_polling, "is_classifying": is_classifying}

@app.options("/stop_polling")
async def options_handler():
    return {"status": "OK"}

@app.get("/stop_polling")
async def stop_polling():
    global is_polling
    is_polling = False
    return {"is_polling": is_polling, "is_classifying": is_classifying}

@app.options("/start_classifying")
async def options_handler():
    return {"status": "OK"}
#/start_classifying and /stop_classifying routes
@app.get("/start_classifying")
def start_classifying(background_tasks: BackgroundTasks):
    global is_classifying
    if is_classifying:
        return {"status": "Classification already in progress"}
    is_classifying = True
    background_tasks.add_task(classify_articles_start)
    return {"status": "Classification started in the background"}
        

@app.options("/stop_classifying")
async def options_handler():
    return {"status": "OK"}

@app.get("/stop_classifying")
async def stop_classifying():
    global is_classifying
    is_classifying = False
    return {"is_polling": is_polling, "is_classifying": is_classifying}

@app.options("/classified_articles")
async def options_handler():
    return {"status": "OK"}

@app.get("/classified_articles")
async def get_classified_articles():
    with get_db_connection() as conn:
        classified = conn.execute("SELECT * FROM articles WHERE is_classified = 1").fetchall()
        unclassified_count = conn.execute("SELECT COUNT(*) FROM articles WHERE is_classified = 0").fetchone()[0]
    return {"classified_articles": classified, "unclassified_count": unclassified_count}

# sync function to classify articles
# will loop until is_classifying is set to False, set by endpoint /stop_classifying
def classify_articles_start():
    global is_classifying
    while is_classifying:
        classify_articles(n=100, llm_url=LLM_URL, llm_api_key=LLM_API_KEY)
        time.sleep(30)

async def poll_news():
    while is_polling:
        await fetch_and_store_articles(FINNHUB_API_KEY)
        await asyncio.sleep(30)  # Polling interval in seconds


@app.options("/articles")
async def options_handler():
    return {"status": "OK"}

@app.get("/articles")
async def get_articles(classified: str = Query("all", regex="^(true|false|all)$")):
    """
    Fetch articles with a filter for classified (true/false) or all.
    Returns ID, formatted date, title, sentiment, and industry category.
    Order by date in descending order.
    """
    query = "SELECT id, finnhub_id, datetime, headline, market_sentiment, industry_category, is_classified FROM articles"
    
    if classified == "true":
        query += " WHERE is_classified = 1"
    elif classified == "false":
        query += " WHERE is_classified = 0"

    query += " ORDER BY datetime DESC"

    with get_db_connection() as conn:
        cursor = conn.execute(query)
        articles = cursor.fetchall()
        
        result = []
        for article in articles:
            formatted_date = datetime.fromtimestamp(article["datetime"]).strftime('%Y-%m-%d %H:%M:%S')
            result.append({
                "id": article["id"],
                "finnhub_id": article["finnhub_id"],
                "date": formatted_date,
                "title": article["headline"],
                "sentiment": article["market_sentiment"] if article["is_classified"] else None,
                "industry_category": article["industry_category"] if article["is_classified"] else None,
            })
    
    return {"articles": result}

