import json
from db_setup import get_db_connection
import logging
from openai import OpenAI
import main

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def format_prompt(article):
    # Convert Row object to dictionary
    article_dict = dict(article)
    return_prompt = """
    You are a news analyst for a financial news company. Analyze the following news article and provide the data in the specified JSON format.
    
    **Instructions:**
    
    - Return ONLY the JSON object. Do not include any text before or after the JSON.
    - The JSON should have the following keys:
      - `"sentiment_score"`: An integer from -5 (negative) to 5 (positive), with 0 being completely neutral.
      - `"company_category"`: The company category if any specific company is mentioned; otherwise, set to `null`.
      - `"company_ticker"`: The company's stock ticker symbol if applicable; otherwise, set to `null`.
      - `"reasoning"`: A brief explanation of your sentiment score.
    
    **Example JSON format:**
    
    {
        "sentiment_score": 3,
        "company_category": "Technology",
        "company_ticker": "AAPL",
        "reasoning": "The article mentions a new product launch which is expected to drive revenue growth."
    }
    
    **Article: """ + json.dumps(article_dict)

    logging.info(f"Formatted prompt for article {article['id']}: {return_prompt}")
    return return_prompt


def classify_articles(n=1, llm_url=None, llm_api_key=None, router_quality_weight=None):
    client = OpenAI(
        base_url=llm_url,
        api_key=llm_api_key
    )

    with get_db_connection() as conn:
        # Retrieve unclassified articles
        sql_query = """SELECT id, category, datetime, headline, image, related, 
        source, summary, url FROM articles WHERE is_classified = 0 LIMIT ?"""
        cursor = conn.execute(sql_query, (n,))
        articles = cursor.fetchall()

        if not articles:
            logger.info("No unclassified articles found.")
            return

        for article in articles:
            if not main.is_classifying:
                return

            try:
                sentiment_score, company_category, model = classify_article(article, client, router_quality_weight)

                update_article_classification(conn, article['id'], sentiment_score, company_category, model)

                # Small delay to avoid rate-limiting
                #time.sleep(0.5)

            except Exception as e:
                logger.error(f"Error classifying article {article['id']}: {e}")


def update_article_classification(conn, article_id, sentiment_score, company_category, model):
    try:
        conn.execute(
            '''UPDATE articles
                SET is_classified = 1,
                    market_sentiment = ?,
                    industry_category = ?,
                    classification_model = ?
                WHERE id = ?''',
            (sentiment_score, company_category, model, article_id)
        )
        conn.commit()
        logger.info(f"Article {article_id} classified successfully.")
    except Exception as e:
        logger.error(f"Error updating article {article_id} classification: {e}")


def classify_article(article, client, router_quality_weight=None):
    prompt = format_prompt(article)
    article_id = article['id']

    chat_completion = client.chat.completions.create(
        messages=[
            {
                'role': 'user',
                'content': prompt,
            }
        ],
        model='gpt-4o-2024-05-13',
        extra_headers={'X-Router-Quality-Weight': str(router_quality_weight)} if router_quality_weight is not None else None
    )

    # Parse the response assuming it’s in JSON format

    # Access the completion content
    completion_content = chat_completion.choices[0].message.content
    logger.info(f"Classification response for article ID {article_id}: {completion_content}")

    # Parse the JSON content
    classification = json.loads(completion_content)

    # Extract classification data
    sentiment_score = classification.get("sentiment_score", 0)
    company_category = classification.get("company_category", "None")

    return sentiment_score, company_category, chat_completion.model

# Main function to test classification
if __name__ == '__main__':
    classify_articles(10)
    logger.info('Article classification complete.')