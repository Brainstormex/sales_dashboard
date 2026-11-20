import sqlite3
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "sales.db"
SQL_DIR = BASE_DIR / "sql"

def get_connection() -> sqlite3.Connection:
    """Creates a connection to the SQLite database with row factory and foreign keys enabled."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes database schema and analytical views."""
    conn = get_connection()
    try:
        schema_file = SQL_DIR / "schema.sql"
        views_file = SQL_DIR / "views.sql"
        
        if schema_file.exists():
            with open(schema_file, "r", encoding="utf-8") as f:
                conn.executescript(f.read())
        
        if views_file.exists():
            with open(views_file, "r", encoding="utf-8") as f:
                conn.executescript(f.read())
                
        conn.commit()
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at: {DB_PATH}")
