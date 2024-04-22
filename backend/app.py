# Import necessary libraries and modules
# fa un alt script worker.py care sa faca requesturi la /search_subreddits
import json
from quart import Quart, jsonify, request
import asyncpraw
import asyncio
from asyncprawcore.exceptions import RequestException
from nltk.sentiment import SentimentIntensityAnalyzer
import spacy
import datetime
import aiosqlite
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from functools import wraps
import bcrypt
from datetime import date
from quart_cors import cors
import re
from time import sleep

# Create a Quart application instance
app = Quart(__name__)
app.config['SECRET_KEY'] = 'secretkey'  # Set a strong secret key
app = cors(app, allow_origin="http://localhost:5173", allow_credentials=True, allow_methods=["GET", "POST"], allow_headers=["Content-Type","Authorization"])  # Allow your frontend's origin
# Define an asynchronous function to create a Reddit API instance
async def create_reddit_instance():
    reddit = asyncpraw.Reddit(client_id='G0xw0o9uJmsl8VhsYdLLPQ',
                              client_secret='vkYv-juD_SSbVrLj7NtcNsttsdV2Dg',
                              user_agent='web:my_reddit_analyzer:v1.0')
    return reddit

# Initialize sentiment analysis and NLP tools
sia = SentimentIntensityAnalyzer()
nlp = spacy.load("en_core_web_trf")


# SQLite Database File
DATABASE = 'my_database.db'
TOPICS_FILE = "topics.txt"
# Function to create tables in the SQLite database
async def create_tables():
    """
    Creates the necessary tables in the database if they don't already exist.

    This function creates the following tables:
    - posts: Stores information about posts, including title, content, sentiment, etc.
    - users: Stores information about users, including username and password hash.
    - comments: Stores information about comments, including body, sentiment, etc.
    - entities: Stores information about entities, including entity name, sentiment, etc.
    - user_searches: Stores information about user searches, including query, search count, etc.
    - daily_search_count: Stores information about daily search counts for each user.

    Returns:
    None
    """
    async with aiosqlite.connect(DATABASE) as conn:
        await conn.execute('''CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        title TEXT,
        content TEXT,
        sentiment_compound REAL,
        created_date TEXT,
        entities TEXT,
        entity_sentiments TEXT,
        post_content TEXT,
        reddit_post_id TEXT UNIQUE
    )''')
        await conn.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password_hash TEXT
        )''')
        await conn.execute('''CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY,
        post_id INTEGER,
        body TEXT,
        sentiment_pos REAL,
        sentiment_neg REAL,
        sentiment_neu REAL,
        sentiment_compound REAL,
        created_date TEXT,
        reddit_comment_id TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id)
    )''')
        await conn.execute('''CREATE TABLE IF NOT EXISTS entities (
            id INTEGER PRIMARY KEY,
            text TEXT,
            label TEXT,
            sentiment_compound REAL, 
            source_type TEXT CHECK(source_type IN ('POST', 'COMMENT')),
            source_id INTEGER, 
            FOREIGN KEY (source_id) REFERENCES posts (id) ON DELETE CASCADE, 
            FOREIGN KEY (source_id) REFERENCES comments (id) ON DELETE CASCADE 
        )''')
        await conn.execute('''CREATE TABLE IF NOT EXISTS user_searches (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            query TEXT,
            search_count INTEGER DEFAULT 1,
            last_search_date DATE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )''')

        await conn.execute('''CREATE TABLE IF NOT EXISTS daily_search_count (
            user_id INTEGER PRIMARY KEY,
            count INTEGER DEFAULT 0,
            last_search_date DATE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )''')

        await conn.commit()
        

# async def get_table_names(conn):
#     """Fetches the names of all tables in the database."""
#     cursor = await conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
#     table_names = [row[0] for row in await cursor.fetchall()]
#     return table_names

# async def delete_data_from_tables(conn, tables_to_exclude):
#     """Deletes data from all tables except those specified in tables_to_exclude."""
#     table_names = await get_table_names(conn)
#     for table in table_names:
#         if table not in tables_to_exclude:
            
#             await conn.execute(f"DELETE FROM {table}")
#     await conn.commit()
    
#     tables_to_exclude = ['users', 'user_searches'] 

#     async with aiosqlite.connect(DATABASE) as conn:
#         await delete_data_from_tables(conn, tables_to_exclude)
# Call the function to ensure the tables are created
async def add_is_admin_column():
    async with aiosqlite.connect(DATABASE) as conn:
        await conn.execute('''
        ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0 CHECK (is_admin IN (0, 1))
        ''')
        await conn.commit()

@app.before_serving
async def startup():
    await create_tables()
    await add_is_admin_column()
    print("Tables created successfully!")

async def verify_user(username, password):
    async with aiosqlite.connect(DATABASE) as conn:
        cursor = await conn.cursor()
        await cursor.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
        user_row = await cursor.fetchone()
        if user_row:
            password_hash = user_row[0]
            return bcrypt.checkpw(password.encode('utf-8'), password_hash)
        return False

# Create a token for a given user
def create_token(username):
    token = jwt.encode({'user': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm="HS256")
    return token


@app.route('/register', methods=['POST'])
async def register():
    data = await request.get_json()
    username = data['username']
    password = data['password']

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    async with aiosqlite.connect(DATABASE) as conn:
        try:
            await conn.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, password_hash))
            await conn.commit()
        except aiosqlite.IntegrityError:
            return jsonify({'error': 'Username already exists'}), 400

    return jsonify({'message': 'User created successfully'}), 201


@app.route('/login', methods=['POST'])
async def login():
    data = await request.get_json()
    username = data['username']
    password = data['password']
    if await verify_user(username, password):
        token = create_token(username)
        return jsonify({'token': token})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401


def token_required(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token_parts = auth_header.split()  # Split by space
            if len(token_parts) == 2 and token_parts[0] == "Bearer":
                token = token_parts[1]
                print("Token is:" + " " + token)
            else:
                return jsonify({'message': 'Bearer token malformed'}), 401
        else:
            return jsonify({'message': 'Token is missing!'}), 401
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['user']
        except ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token error: ' + str(e)}), 401

        return await f(current_user, *args, **kwargs)

    return decorated_function


async def get_user_id(username):
    async with aiosqlite.connect(DATABASE) as conn:
        cursor = await conn.cursor()
        await cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        user_row = await cursor.fetchone()
        return user_row[0] if user_row else None

# Function to check and update daily search count
async def can_search(user_id):
    async with aiosqlite.connect(DATABASE) as conn:
        cursor = await conn.cursor()
        await cursor.execute("SELECT count, last_search_date FROM daily_search_count WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()

        today = date.today().isoformat()  # Convert today's date to string in ISO format
        if row:
            last_search_date = row[1] if row[1] else '1970-01-01'  # Fallback for null dates

            if last_search_date == today:
                if row[0] >= 150:
                    return False  # Daily limit reached
                new_count = row[0] + 1
            else:
                new_count = 1  # Reset count if it's a new day

            await cursor.execute("REPLACE INTO daily_search_count (user_id, count, last_search_date) VALUES (?, ?, ?)", (user_id, new_count, today))
            await conn.commit()
            return True
        else:
            # Insert a new record if no record exists
            await cursor.execute("INSERT INTO daily_search_count (user_id, count, last_search_date) VALUES (?, ?, ?)", (user_id, 1, today))
            await conn.commit()
            return True


# async def automated_search(user_id, reddit):
#     """Performs automated searches from topics.txt"""
#     with open(TOPICS_FILE, "r") as f:
#         topics = f.read().splitlines()

#     for topic in topics:
#         if await can_search(user_id):
#             try:
#                 subreddit = await reddit.subreddit('all')
#                 search_results = subreddit.search(topic, limit=5)  # Respect postLimit

#                 posts_data = []  # Initialize list for storing processed posts

#                 async for submission in search_results:
#                     if isinstance(submission, asyncpraw.reddit.models.Submission):
#                         try:
#                             if not is_media_post(submission):
#                                 await asyncio.wait_for(process_submission(submission, posts_data, 5), timeout=20)
#                         except asyncio.TimeoutError:
#                             print(f"Timeout occurred while processing submission: {submission.title}")

#                 # Database Interaction
#                 async with aiosqlite.connect(DATABASE) as conn:
#                     for post in posts_data:
#                         await insert_or_update_post(conn, post)

#                     # Store search query
#                     await conn.execute("INSERT INTO user_searches (user_id, query, last_search_date) VALUES (?, ?, ?)", 
#                                        (user_id, topic, datetime.date.today()))
#                     await conn.commit()

                
#             except (asyncio.TimeoutError, RequestException) as e:
#                 print(f"Error during automated search for topic '{topic}': {e}")
#         else:
#             print(f"Reached daily limit for user {user_id}")
#             break

# Define a route in the application for searching Reddit
@app.route('/search_subreddits', methods=['GET'])
@token_required
async def search_subreddits(current_user):
    """
    Search subreddits for posts related to a given topic.

    Args:
        current_user: The current user making the request.

    Returns:
        A JSON response containing the search results.

    Raises:
        429: If the daily search limit for the user is reached.
        504: If the request to the Reddit API times out.
        500: If there is an error connecting to the database.

    """
    
    
    user_id = await get_user_id(current_user)
    if not await can_search(user_id):
        return jsonify({'error': 'Daily search limit reached'}), 429
    
    topic = request.args.get('topic', '')
    comment_limit = request.args.get('comment_limit', type=int)
    post_limit = request.args.get('postLimit', type=int)

    try:
        reddit = await create_reddit_instance()
        # asyncio.create_task(automated_search(user_id, reddit)) 
        subreddit = await reddit.subreddit('all')
        search_results = subreddit.search(topic, limit=post_limit, sort='relevance', time_filter='all')

        posts_data = []
        print(posts_data)

        try:
            async for submission in search_results:
                try:
                    if not is_media_post(submission):
                        await asyncio.wait_for(process_submission(submission, posts_data, comment_limit), timeout=20)
                except asyncio.TimeoutError:
                    print(f"Timeout occurred while processing submission: {submission.title}")
        except asyncio.TimeoutError:
            return jsonify({'error': 'Request to Reddit API timed out.'}), 504

    except RequestException as e:
        return jsonify({'error': str(e)}), 500

    async with aiosqlite.connect(DATABASE) as conn:
        for post in posts_data:
            await insert_or_update_post(conn, post)
            
    # Store the search query
    async with aiosqlite.connect(DATABASE) as conn:
        await conn.execute("INSERT INTO user_searches (user_id, query, last_search_date) VALUES (?, ?, ?)", (user_id, topic, datetime.date.today()))
        await conn.commit()
        
    print(posts_data)   
    return jsonify(posts_data)

@app.route('/get_user_searches', methods=['GET'])
@token_required
async def get_user_searches(current_user):
    user_id = await get_user_id(current_user)
    async with aiosqlite.connect(DATABASE) as conn:
        cursor = await conn.cursor()
        await cursor.execute("SELECT query, search_count, last_search_date FROM user_searches WHERE user_id = ?", (user_id,))
        searches = await cursor.fetchall()
        return jsonify([{'query': row[0], 'count': row[1], 'date': row[2]} for row in searches])
    
    
@app.route('/auto_login', methods=['GET'])
async def auto_login():
    auth_header = request.headers.get('Authorization', None)
    if not auth_header:
        return jsonify({'error': 'Authorization header is missing'}), 401

    token_parts = auth_header.split()
    if len(token_parts) != 2 or token_parts[0] != 'Bearer':
        return jsonify({'error': 'Bearer token malformed'}), 401

    token = token_parts[1]
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        username = data.get('user')
        if username:
            # Return some user data if needed, e.g., username
            return jsonify({'username': username})
        return jsonify({'error': 'Invalid token'}), 401
    except (ExpiredSignatureError, InvalidTokenError) as e:
        return jsonify({'message': str(e)}), 401
    
    
    
@app.route('/chart-data/<search_term>')
async def get_chart_data(search_term):
    async with aiosqlite.connect(DATABASE) as conn:
        cursor = await conn.execute(
            """
            SELECT created_date, sentiment_compound, title 
            FROM posts 
            WHERE title LIKE ? 
            ORDER BY created_date ASC 
            """, 
            ('%' + search_term + '%',)  # Assuming title contains search terms
        )
        data = await cursor.fetchall()
        return jsonify(data)
    

@app.route('/chart-data-entity/<search_entity>')  
async def get_entity_sentiment_data(search_entity):
    # Retrieve filter parameters from the request's query string
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    entity_label = request.args.get('label')
    source_type = request.args.get('sourceType')  # POST or COMMENT

    # Start building the query and parameters dynamically
    query = """
            SELECT e.text, AVG(e.sentiment_compound) as avg_sentiment
            FROM entities e
            LEFT JOIN posts p ON e.source_id = p.id AND e.source_type = 'POST'
            LEFT JOIN comments c ON e.source_id = c.id AND e.source_type = 'COMMENT'
            WHERE e.text LIKE ?
            """
    params = ['%' + search_entity + '%']

    if start_date and end_date:
        query += " AND ((e.source_type = 'POST' AND p.created_date BETWEEN ? AND ?) OR (e.source_type = 'COMMENT' AND c.created_date BETWEEN ? AND ?))"
        params.extend([start_date, end_date, start_date, end_date])

    if entity_label:
        query += " AND e.label = ?"
        params.append(entity_label)

    if source_type:
        query += " AND e.source_type = ?"
        params.append(source_type)

    query += " GROUP BY e.text"

    async with aiosqlite.connect(DATABASE) as conn:
        cursor = await conn.execute(query, tuple(params))
        data = await cursor.fetchall()

        # Transform the data into a list of dicts
        data_list = [{"text": row[0], "avg_sentiment": row[1]} for row in data]

        return jsonify(data_list)

# Define an asynchronous function to insert or update a post in the SQLite database
async def insert_or_update_post(conn, post):
    """
    Inserts or updates a post in the SQLite database.

    Args:
        conn: A connection object to the SQLite database.
        post: A dictionary containing the post data.

    Returns:
        None
    """
    cursor = await conn.cursor()
    await cursor.execute("SELECT id FROM posts WHERE reddit_post_id = ?", (post['reddit_post_id'],))
    post_row = await cursor.fetchone()
    post_id = None
    doc = nlp(post['title'])
    
    if post_row:
        post_id = post_row[0]
        await cursor.execute("UPDATE posts SET title = ?, content = ?, sentiment_compound = ?, created_date = ?, entities = ? WHERE id = ?",
                             (post['title'], post['content'], post['sentiment'], post['created_date'], post['entities'] , post_id))
    else:
        await cursor.execute("INSERT INTO posts (reddit_post_id, title, content, sentiment_compound, created_date, entities) VALUES (?, ?, ?, ?, ?, ?)",
                             (post['reddit_post_id'], post['title'], post['content'], post['sentiment'], post['created_date'], post['entities'] ))
        post_id = cursor.lastrowid

    for comment in post['comments']:
        await insert_or_update_comment(cursor, comment, post_id)
        
    for ent in doc.ents:
       await conn.execute("INSERT INTO entities (text, label, sentiment_compound, source_type, source_id) VALUES (?, ?, ?, ?, ?)", 
                          (ent.text, ent.label_, sia.polarity_scores(ent.text)['compound'], 'POST', post_id))

    await conn.commit()
async def insert_or_update_comment(cursor, comment, post_id):
    """
    Inserts or updates a comment in the database.

    Args:
        cursor: The database cursor.
        comment: The comment data to be inserted or updated.
        post_id: The ID of the post associated with the comment.

    Returns:
        None
    """
    await cursor.execute("SELECT id FROM comments WHERE reddit_comment_id = ?", (comment['reddit_comment_id'],))
    comment_row = await cursor.fetchone()

    if comment_row:
        await cursor.execute("UPDATE comments SET body = ?, sentiment_pos = ?, sentiment_neg = ?, sentiment_neu = ?, sentiment_compound = ?, entities = ?, created_date = ? WHERE id = ?",
                             (comment['body'], comment['sentiment']['pos'], comment['sentiment']['neg'], comment['sentiment']['neu'], comment['sentiment']['compound'], comment['entities'], comment['created_date'], comment_row[0]))
    else:
        await cursor.execute("INSERT INTO comments (post_id, reddit_comment_id, body, sentiment_pos, sentiment_neg, sentiment_neu, sentiment_compound, entities, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                             (post_id, comment['reddit_comment_id'], comment['body'], comment['sentiment']['pos'], comment['sentiment']['neg'], comment['sentiment']['neu'], comment['sentiment']['compound'], comment['entities'], comment['created_date']))
        
    doc = nlp(comment['body'])
    for ent in doc.ents:
        await cursor.execute("INSERT INTO entities (text, label, sentiment_compound, source_type, source_id) VALUES (?, ?, ?, ?, ?)", 
                            (ent.text, ent.label_, sia.polarity_scores(ent.text)['compound'], 'COMMENT', comment['reddit_comment_id']))       

       
async def process_comment(comment):
    """
    Process a comment and extract relevant information.

    Args:
        comment (object): The comment object to process.

    Returns:
        dict: A dictionary containing the extracted information from the comment.
            - 'reddit_comment_id': The ID of the comment.
            - 'body': The body of the comment.
            - 'sentiment': The sentiment score of the comment.
            - 'entities': The entities found in the comment.
            - 'created_date': The creation date of the comment.
    """
    if comment.body != '[removed]':
        doc = nlp(comment.body)
        sentiment = sia.polarity_scores(comment.body)
        created_date = datetime.datetime.utcfromtimestamp(comment.created_utc).strftime('%Y-%m-%d %H:%M:%S')
        entities = json.dumps([(ent.text, ent.label_) for ent in doc.ents if ent.label_ not in ['TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']])
        #trebuie filtrate doar dupa user preferences ()
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
    else:
        print("Comment removed")
        return None
# Define an asynchronous function to process each Reddit submission
async def process_submission(submission, posts_data, comment_limit):
    if is_media_post(submission):
        return  # Skip this submission
    comments = await submission.comments()
    await comments.replace_more(limit=0)
    comment_tasks = []
    for comment in comments[:comment_limit]:
        if comment is not None and hasattr(comment, "body") and comment.body not in ['[removed]', '[deleted]']:
            comment_tasks.append(process_comment(comment))
    collected_comments = await asyncio.gather(*comment_tasks)

    post_content = submission.url if hasattr(submission, 'url') else submission.selftext
    post_data = {
        'reddit_post_id': submission.id,
        'title': submission.title,
        'content': post_content,
        'sentiment': sia.polarity_scores(submission.selftext)['compound'],
        'created_date': datetime.datetime.utcfromtimestamp(submission.created_utc).strftime('%Y-%m-%d %H:%M:%S'),
        'entities': json.dumps([(ent.text, ent.label_) for ent in nlp(submission.title).ents if ent.label_ not in ['TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']]),
        'comments': collected_comments,
        'entity_sentiments': json.dumps([(ent.text, ent.label_, sia.polarity_scores(ent.text)['compound']) for ent in nlp(submission.title).ents if ent.label_ not in ['TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']]),
        'post_content': post_content
    }
    posts_data.append(post_data)
    #log the post_data entities
    print(post_data['entities'])
    
    
def is_media_post(submission):
    """
    Checks if a submission is primarily an image, video, or external link.

    Args:
        submission: The praw.reddit.models.Submission object to check.

    Returns:
        True if the submission is primarily media-based, False otherwise.
    """

    # Domain-based checks
    if submission.is_self:  # Self-posts are often text-based
        return False

    domain = submission.domain
    if domain in ('i.redd.it', 'v.redd.it', 'imgur.com'):
        return True

    # You might want to add more domains to this list based on the subreddit 

    # Check if the content is primarily a crosspost
    if hasattr(submission, 'crosspost_parent_list'):
        crosspost = submission.crosspost_parent_list[0]
        return is_media_post(crosspost)
     

    return False
    
# Check if the script is being run directly
if __name__ == '__main__':
    # Start the Quart application in debug mode
    app.run(debug=True)
