import asyncio
import aiohttp
import time
import datetime
import aiosqlite
from app import create_reddit_instance
import logging
import sys
import json
import spacy
from nltk.sentiment import SentimentIntensityAnalyzer

nlp = spacy.load("en_core_web_sm")
sia = SentimentIntensityAnalyzer()

DATABASE = 'my_database.db'
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def fetch_topics():
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT DISTINCT query FROM user_searches ORDER BY query DESC")
        rows = await cursor.fetchall()
        return [row[0] for row in rows]

async def perform_sentiment_analysis_on_topic(reddit, topic):
    logging.info(f"Starting sentiment analysis for topic: {topic}")
    async with aiohttp.ClientSession() as session:
        reddit._core._requestor._http = session
        subreddit = await reddit.subreddit('all')
        search_results = subreddit.search(topic, limit=50, sort='relevance', time_filter='all')
        async for submission in search_results:
            logging.info(f"Processing submission -> ID: {submission.id}")
            posts_data = []
            await process_submission(submission, reddit, topic, session, posts_data)
            
            async with aiosqlite.connect(DATABASE) as conn:
                 for post in posts_data:
                     await insert_or_update_post(conn, post)
    logging.info(f"Completed sentiment analysis for topic: {topic}")
    
    

async def process_submission(submission, reddit, topic, session, posts_data):
    logging.info(f"Loading and processing submission -> ID: {submission.id}")
    comments_data = []
    await submission.load()
     # Conduct NLP on the submission content
    doc = nlp(submission.selftext)
    entities = json.dumps([(ent.text, ent.label_) for ent in doc.ents if ent.label_ not in ['TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']])
    entity_sentiments = json.dumps([
        {
            "text": ent.text,
            "label": ent.label_,
            "sentiment": sia.polarity_scores(ent.text)['compound']
        } for ent in doc.ents if ent.label_ not in ['TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']
    ])

    for comment in submission.comments.list()[:15]:
        if comment.body not in ['[removed]', '[deleted]']:
            logging.info(f"Processing comment -> ID: {comment.id}")
            processed_comment = await process_comment(comment)
            if processed_comment:
                comments_data.append(processed_comment)
                
    post_data = {
        'reddit_post_id': submission.id,
        'title': submission.title,
        'content': submission.selftext,
        'sentiment': sia.polarity_scores(submission.selftext)['compound'],
        'created_date': datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
        'comments': comments_data,
        'entities': entities,
        'entity_sentiments': entity_sentiments,
    }
    posts_data.append(post_data)

async def process_comment(comment):
    logging.info(f"Processing comment -> ID: {comment.id}")
    if comment.body != '[removed]':
        doc = nlp(comment.body)
        sentiment = sia.polarity_scores(comment.body)
        created_date = datetime.datetime.utcfromtimestamp(comment.created_utc).strftime('%Y-%m-%d %H:%M:%S')
        entities = json.dumps([(ent.text, ent.label_) for ent in doc.ents if ent.label_ not in ['TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']])
        entity_sentiments = {}
        for ent in doc.ents:
            entity_text = ent.text
            entity_label = ent.label_
            entity_sentiment = sia.polarity_scores(ent.text)['compound']            
            if entity_label not in ['TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']:
                entity_sentiments[entity_text] = {"label": entity_label, "sentiment": entity_sentiment}
        return {
            'reddit_comment_id': comment.id,
            'body': comment.body,
            'sentiment': sentiment,
            'entities': entities,
            'entity_sentiments': json.dumps(entity_sentiments), 
            'created_date': created_date
        }
    return None

async def insert_or_update_post(conn, post):
    logging.info(f"Inserting or updating post -> ID: {post['reddit_post_id']}")
    cursor = await conn.cursor()
    await cursor.execute("SELECT id FROM posts WHERE reddit_post_id = ?", (post['reddit_post_id'],))
    post_row = await cursor.fetchone()
    if post_row:
        post_id = post_row[0]
        await cursor.execute("UPDATE posts SET title = ?, content = ?, sentiment_compound = ?, created_date = ?, entities = ? WHERE id = ?",
                             (post['title'], post['content'], post['sentiment'], post['created_date'], json.dumps(post['entities']), post_id))
    else:
        await cursor.execute("INSERT INTO posts (reddit_post_id, title, content, sentiment_compound, created_date, entities) VALUES (?, ?, ?, ?, ?, ?)",
                             (post['reddit_post_id'], post['title'], post['content'], post['sentiment'], post['created_date'], json.dumps(post['entities'])))
        post_id = cursor.lastrowid
    for comment in post['comments']:
        await insert_or_update_comment(cursor, comment, post_id)
    await conn.commit()

async def insert_or_update_comment(cursor, comment, post_id):
    logging.info(f"Inserting or updating comment -> ID: {comment['reddit_comment_id']}")
    await cursor.execute("SELECT id FROM comments WHERE reddit_comment_id = ?", (comment['reddit_comment_id'],))
    comment_row = await cursor.fetchone()

    if comment_row:
        await cursor.execute("UPDATE comments SET body = ?, sentiment_pos = ?, sentiment_neg = ?, sentiment_neu = ?, sentiment_compound = ?, entities = ?, created_date = ? WHERE id = ?",
                             (comment['body'], comment['sentiment']['pos'], comment['sentiment']['neg'], comment['sentiment']['neu'], comment['sentiment']['compound'], json.dumps(comment['entities']), comment['created_date'], comment_row[0]))
    else:
        await cursor.execute("INSERT INTO comments (post_id, reddit_comment_id, body, sentiment_pos, sentiment_neg, sentiment_neu, sentiment_compound, entities, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                             (post_id, comment['reddit_comment_id'], comment['body'], comment['sentiment']['pos'], comment['sentiment']['neg'], comment['sentiment']['neu'], comment['sentiment']['compound'], json.dumps(comment['entities']), comment['created_date']))

async def daily_task():
    while True:
        logging.info("Starting daily sentiment analysis task...")
        start_time = datetime.datetime.now()
        reddit_instance = await create_reddit_instance()
        topics = await fetch_topics()
        for topic in topics:
            await perform_sentiment_analysis_on_topic(reddit_instance, topic)
        end_time = datetime.datetime.now()
        logging.info(f"Task completed in {(end_time - start_time).total_seconds()} seconds.")
        logging.info("Sleeping for 24 hours...")
        time.sleep(24 * 60 * 60)

if __name__ == "__main__":
    asyncio.run(daily_task())