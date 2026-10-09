
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import sqlite3

app = FastAPI(title="User CRUD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "users.db"


def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            )
        """)


initialize_database()


class UserCreate(BaseModel):
    name: str
    email: EmailStr


def get_user_dict(row):
    return dict(row)


@app.get("/")
def home():
    return {"message": "User CRUD API is running"}


@app.get("/users")
def get_users():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM users ORDER BY id DESC"
        ).fetchall()
    return [get_user_dict(row) for row in rows]


@app.post("/users")
def create_user(user: UserCreate):
    name = user.name.strip()
    email = str(user.email).strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required"
        )

    try:
        with get_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO users (name, email) VALUES (?, ?)",
                (name, email)
            )
            user_id = cursor.lastrowid

        return {
            "message": "User added successfully",
            "id": user_id
        }

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )


@app.put("/users/{user_id}")
def update_user(user_id: int, user: UserCreate):
    name = user.name.strip()
    email = str(user.email).strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required"
        )

    try:
        with get_connection() as conn:
            cursor = conn.execute(
                "UPDATE users SET name = ?, email = ? WHERE id = ?",
                (name, email, user_id)
            )

            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=404,
                    detail="User not found"
                )

        return {"message": "User updated successfully"}

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )


@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM users WHERE id = ?",
            (user_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

    return {"message": "User deleted successfully"}