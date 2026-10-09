from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os


# -----------------------------------
# Create FastAPI application
# -----------------------------------

app = FastAPI()


# -----------------------------------
# CORS - Allow React frontend
# -----------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------
# JSON file
# -----------------------------------

FILE_NAME = "user.json"


# -----------------------------------
# Load users from user.json
# -----------------------------------

def load_users():

    if not os.path.exists(FILE_NAME):
        return []

    try:
        with open(FILE_NAME, "r") as file:
            return json.load(file)

    except json.JSONDecodeError:
        return []


# -----------------------------------
# Save users to user.json
# -----------------------------------

def save_users(users):

    with open(FILE_NAME, "w") as file:
        json.dump(users, file, indent=4)


# -----------------------------------
# HOME
# -----------------------------------

@app.get("/")
def home():

    return {
        "message": "FastAPI CRUD API is working"
    }


# -----------------------------------
# CREATE USER
# POST /users
# -----------------------------------

@app.post("/users")
def create_user(user: dict):

    users = load_users()

    # Generate new ID
    new_id = 1

    if users:
        new_id = max(
            user_item["id"]
            for user_item in users
        ) + 1

    # Create new user
    new_user = {
        "id": new_id,
        "name": user["name"],
        "email": user["email"],
        "update_history": []
    }

    # Add user
    users.append(new_user)

    # Save to JSON
    save_users(users)

    return {
        "message": "User created successfully",
        "user": new_user
    }


# -----------------------------------
# READ ALL USERS
# GET /users
# -----------------------------------

@app.get("/users")
def get_users():

    users = load_users()

    return users


# -----------------------------------
# READ ONE USER
# GET /users/{user_id}
# -----------------------------------

@app.get("/users/{user_id}")
def get_user(user_id: int):

    users = load_users()

    for user in users:

        if user["id"] == user_id:

            return user

    return {
        "message": "User not found"
    }


# -----------------------------------
# UPDATE USER
# PUT /users/{user_id}
# -----------------------------------

@app.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: dict
):

    users = load_users()

    for user in users:

        if user["id"] == user_id:

            # -----------------------------------
            # Create update_history if missing
            # -----------------------------------

            if "update_history" not in user:
                user["update_history"] = []


            # -----------------------------------
            # Check NAME change
            # -----------------------------------

            if user["name"] != updated_user["name"]:

                user["update_history"].append({
                    "field": "name",
                    "old_value": user["name"],
                    "new_value": updated_user["name"]
                })

                user["name"] = updated_user["name"]


            # -----------------------------------
            # Check EMAIL change
            # -----------------------------------

            if user["email"] != updated_user["email"]:

                user["update_history"].append({
                    "field": "email",
                    "old_value": user["email"],
                    "new_value": updated_user["email"]
                })

                user["email"] = updated_user["email"]


            # -----------------------------------
            # Save changes
            # -----------------------------------

            save_users(users)

            return {
                "message": "User updated successfully",
                "user": user
            }


    return {
        "message": "User not found"
    }


# -----------------------------------
# DELETE USER
# DELETE /users/{user_id}
# -----------------------------------

@app.delete("/users/{user_id}")
def delete_user(user_id: int):

    users = load_users()

    for user in users:

        if user["id"] == user_id:

            users.remove(user)

            save_users(users)

            return {
                "message": "User deleted successfully"
            }


    return {
        "message": "User not found"
    }