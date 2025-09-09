// --- 1. GET REFERENCES TO HTML ELEMENTS ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// --- 2. DEFINE THE API URL ---
const apiUrl = 'http://localhost:8080/tasks';

// --- 3. FUNCTION TO FETCH AND RENDER TASKS ---
const renderTasks = async () => {
    try {
        // Fetch tasks from the backend
        const response = await fetch(apiUrl);
        const tasks = await response.json();

        // Clear the current list
        taskList.innerHTML = '';

        // Create and append a list item for each task
        tasks.forEach(task => {
            const li = document.createElement('li');

            // Add 'completed' class if the task is done
            if (task.completed) {
                li.classList.add('completed');
            }

            // Task description
            const taskText = document.createElement('span');
            taskText.textContent = task.description;

            // Container for buttons
            const buttonsContainer = document.createElement('div');

            // Complete button (✓)
            const completeBtn = document.createElement('button');
            completeBtn.textContent = '✓';
            completeBtn.classList.add('complete-btn');
            completeBtn.addEventListener('click', () => toggleComplete(task.id, !task.completed));
            
            // Delete button (✗)
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✗';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            // Assemble the list item
            buttonsContainer.appendChild(completeBtn);
            buttonsContainer.appendChild(deleteBtn);
            li.appendChild(taskText);
            li.appendChild(buttonsContainer);
            
            // Add the new list item to the main list
            taskList.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
};


// --- 4. FUNCTION TO ADD A NEW TASK (POST) ---
taskForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevents the form from reloading the page
    
    const description = taskInput.value.trim(); // Get text from input

    if (description) {
        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: description })
            });
            taskInput.value = ''; // Clear the input field
            renderTasks(); // Re-render the list with the new task
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }
});


// --- 5. FUNCTION TO TOGGLE COMPLETE STATUS (PUT) ---
const toggleComplete = async (id, completedStatus) => {
    try {
        await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completedStatus })
        });
        renderTasks(); // Re-render the list to show the change
    } catch (error) {
        console.error('Error updating task:', error);
    }
};


// --- 6. FUNCTION TO DELETE A TASK (DELETE) ---
const deleteTask = async (id) => {
    try {
        await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });
        renderTasks(); // Re-render the list without the deleted task
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};


// --- 7. INITIAL RENDER ---
// Fetch and display all tasks when the page first loads
renderTasks();