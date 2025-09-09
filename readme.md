# Full-Stack To-Do List Application

A minimalist full-stack web application built to demonstrate the fundamental interaction between a frontend, a backend API, and a database. This project provides a complete CRUD (Create, Read, Update, Delete) experience for managing tasks.

---
## ## Features

* **Create**: Add new tasks to the list.
* **Read**: View all existing tasks on page load.
* **Update**: Mark tasks as complete or incomplete.
* **Delete**: Remove tasks from the list.

---
## ## Technology Stack

* **Frontend**: Vanilla HTML, CSS, and JavaScript
* **Backend**: Node.js with Express.js
* **Database**: SQLite

---
## ## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd <project-folder>
    ```
3.  **Install backend dependencies:**
    ```bash
    npm install
    ```
4.  **Start the backend server:**
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:8080`.

5.  **Open the frontend:**
    Open the `index.html` file in your web browser.

---
## ## API Endpoints

The backend provides the following RESTful API endpoints:

| Method | Endpoint     | Description              |
| :----- | :----------- | :----------------------- |
| `GET`  | `/tasks`     | Fetches all tasks.       |
| `POST` | `/tasks`     | Creates a new task.      |
| `PUT`  | `/tasks/:id` | Updates a specific task. |
| `DELETE`| `/tasks/:id` | Deletes a specific task. |