// --- 1. ELEMENT REFERENCES ---
// Auth containers and forms
const authContainer = document.getElementById('auth-container');
const todoContainer = document.getElementById('todo-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Login/Register toggle links
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

// To-Do App elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const logoutBtn = document.getElementById('logout-btn');

// --- 2. API BASE URL ---
const apiUrl = 'http://localhost:8080'; // Your backend server URL

// --- 3. STATE MANAGEMENT & VIEW TOGGLING ---

// Checks if a user is logged in by looking for a token in localStorage
const checkLoginState = () => {
    const token = localStorage.getItem('token');
    if (token) {
        // If token exists, show the to-do app and hide the auth forms
        authContainer.classList.add('hidden');
        todoContainer.classList.remove('hidden');
        renderTasks(); // Fetch and display tasks for the logged-in user
    } else {
        // If no token, show the auth forms and hide the to-do app
        authContainer.classList.remove('hidden');
        todoContainer.classList.add('hidden');
    }
};

// --- 4. AUTHENTICATION FUNCTIONS ---

// Handle Login
const handleLogin = async (event) => {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token); // Save token to localStorage
            checkLoginState(); // Update the view
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
    }
};

// Handle Registration
const handleRegister = async (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${apiUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please log in.');
            showLoginLink.click(); // Switch to the login form
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
    }
};

// Handle Logout
const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    checkLoginState(); // Update the view
};

// --- 5. TASK (CRUD) FUNCTIONS ---

// Fetch and Render Tasks for the logged-in user
const renderTasks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${apiUrl}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}` // Send the token for authentication
            }
        });
        const tasks = await response.json();
        taskList.innerHTML = ''; // Clear list before rendering

        tasks.forEach(task => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');
            
            const taskText = document.createElement('span');
            taskText.textContent = task.description;

            const buttonsContainer = document.createElement('div');
            const completeBtn = document.createElement('button');
            completeBtn.textContent = '✓';
            completeBtn.classList.add('complete-btn');
            completeBtn.addEventListener('click', () => toggleComplete(task.id, !task.completed));

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✗';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            buttonsContainer.appendChild(completeBtn);
            buttonsContainer.appendChild(deleteBtn);
            li.appendChild(taskText);
            li.appendChild(buttonsContainer);
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
};

// Add a new task
const addTask = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const description = taskInput.value.trim();

    if (description && token) {
        try {
            await fetch(`${apiUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description })
            });
            taskInput.value = '';
            renderTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }
};

// Toggle complete status
const toggleComplete = async (id, completedStatus) => {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${apiUrl}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: completedStatus })
        });
        renderTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

// Delete a task
const deleteTask = async (id) => {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${apiUrl}/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        renderTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

// --- 6. EVENT LISTENERS ---

// Auth form toggling
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Form submissions and logout
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
taskForm.addEventListener('submit', addTask);
logoutBtn.addEventListener('click', handleLogout);

// --- 7. INITIAL APP LOAD ---
checkLoginState(); // Check login state when the page first loads