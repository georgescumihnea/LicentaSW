CREATE TABLE comments (
        id INTEGER PRIMARY KEY,
        post_id INTEGER,
        body TEXT,
        sentiment_pos REAL,
        sentiment_neg REAL,
        sentiment_neu REAL,
        sentiment_compound REAL,
        entities TEXT,
        created_date TEXT,
        reddit_comment_id TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id)
    );
CREATE TABLE searches (id INTEGER PRIMARY KEY, username TEXT, query TEXT, search_date TEXT);
CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password_hash TEXT
        , is_admin INTEGER DEFAULT 0 CHECK (is_admin IN (0, 1)));
CREATE TABLE user_searches (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            query TEXT,
            search_count INTEGER DEFAULT 1,
            last_search_date DATE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
CREATE TABLE daily_search_count (
            user_id INTEGER PRIMARY KEY,
            count INTEGER DEFAULT 0,
            last_search_date DATE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT, content TEXT, sentiment_compound REAL, created_date TEXT, reddit_post_id TEXT UNIQUE, entities TEXT, entity_sentiments TEXT);
CREATE TABLE entities (
            id INTEGER PRIMARY KEY,
            text TEXT,
            label TEXT,
            sentiment_compound REAL, 
            source_type TEXT CHECK(source_type IN ('POST', 'COMMENT')),
            source_id INTEGER, 
            FOREIGN KEY (source_id) REFERENCES posts (id) ON DELETE CASCADE, 
            FOREIGN KEY (source_id) REFERENCES comments (id) ON DELETE CASCADE 
        );
