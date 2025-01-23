# db_setup.py
import sqlite3
from contextlib import contextmanager
from logger_config import get_logger

logger = get_logger(__name__)

@contextmanager
def get_db_connection():
    conn = sqlite3.connect('articles.db')
    conn.row_factory = sqlite3.Row
    yield conn
    conn.close()

def get_last_id():
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT MAX(finnhub_id) FROM articles")
        result = cursor.fetchone()[0]
        last_id = result if result is not None else 0  # Return 0 if no rows found
        logger.info('Retrieved last_id from database: %s', last_id)
        return last_id
    
def init_db():
    logger.info("Initializing DB...")

    with get_db_connection() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY,
            finnhub_id INTEGER UNIQUE,
            category TEXT,
            datetime INTEGER,
            headline TEXT,
            image TEXT,
            related TEXT,
            source TEXT,
            summary TEXT,
            url TEXT,
            is_classified INTEGER DEFAULT 0,
            classification TEXT,
            market_sentiment REAL DEFAULT 0,            -- Calculated sentiment score from -5 to 5
            industry_category TEXT,                     -- Calculated industry category (GICS)
            classification_model TEXT,                  -- Model used for classification
            provider TEXT                               -- Provider used for classification
        )''')

    logger.info("DB initialization completed.")


def reset_classifications():
    with get_db_connection() as conn:
        conn.execute('''UPDATE articles
                        SET is_classified = 0,
                            classification = NULL,
                            market_sentiment = 0,
                            industry_category = NULL,
                            classification_model = NULL''')
        conn.commit()
        logger.info("Reset classifications for all articles.")

# main function to test setup
if __name__ == '__main__':
    init_db()
    logger.info('Last Article ID: %s' % get_last_id())
    logger.info('Database setup complete.')