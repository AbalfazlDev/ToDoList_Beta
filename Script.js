document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskPrioritySelect = document.getElementById('taskPriority');
    const taskList = document.getElementById('taskList');
    const taskDetails = document.getElementById('taskDetails');
    const taskCount = document.getElementById('taskCount');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const taskModal = document.getElementById('taskModal');
    const confirmModal = document.getElementById('confirmModal');
    const cancelTaskBtn = document.getElementById('cancelTask');
    const closeModalBtn = document.querySelector('.close-btn');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const submitBtn = document.getElementById('submitBtn');

    // App State
    let tasks = [];
    let currentFilter = 'all';
    let selectedTaskId = null;
    let isEditing = false;
    let currentEditId = null;
    var currentId = -2;

    // Initialize
    loadTasks();
    setupEventListeners();

    function setupEventListeners() {
        // Form submission
        taskForm.addEventListener('submit', handleFormSubmit);
        
        // Modal buttons
        addTaskBtn.addEventListener('click', openTaskModal);
        cancelTaskBtn.addEventListener('click', closeTaskModal);
        closeModalBtn.addEventListener('click', closeTaskModal);
        
        // Task actions
        clearCompletedBtn.addEventListener('click', handleClearCompleted);
        confirmDeleteBtn.addEventListener('click', confirmDeleteTask);
        cancelDeleteBtn.addEventListener('click', closeConfirmModal);
        
        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === taskModal) {
                closeTaskModal();
            }
            if (event.target === confirmModal) {
                closeConfirmModal();
            }
        });
        
        // Close modals with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeTaskModal();
                closeConfirmModal();
            }
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        var isEdditingTxt = submitBtn.textContent;
        //var taskId = e.
        console.log(currentId + "  fff");
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const priority = taskPrioritySelect.value;
        
        if (!title) {
            alert('Task title cannot be empty');
            return;
        }
        
        if (isEdditingTxt =='Edit') {

            updateTask(currentId, title, description, priority);
            console.log("Editing");
        } else {
            addTask(title, description, priority);
            console.log("Adding");
        }
        
        closeTaskModal();
    }

    function addTask(title, description, priority) {
        const newTask = {
            id: Date.now(),
            title,
            description,
            priority,
            completed: false,
            createdAt: new Date().toLocaleString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        // Select the newly added task
        selectedTaskId = newTask.id;
        renderTasks();
    }

    function updateTask(id, title, description, priority) {
      console.log('Before save:', tasks);
      

        const taskIndex = tasks.findIndex(task => task.id === id);
        console.log(taskIndex);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title,
                description,
                priority
            };
            saveTasks();
            renderTasks();
            console.log('After save:', JSON.parse(localStorage.getItem('tasks')));
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        
        if (selectedTaskId === id) {
            selectedTaskId = null;
        }
        
        if (currentEditId === id) {
            resetForm();
        }
        
        saveTasks();
        renderTasks();
    }

    function toggleComplete(id, event) {
        if (event) event.stopPropagation();
        
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
        }
    }

    function selectTask(id) {
        selectedTaskId = id;
        renderTasks();
    }

    function showEditForm(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        
        isEditing = true;
        currentId = id;
        console.log(currentId);
        openTaskModal();
        modalTitle.textContent = 'Edit Task';
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description;
        taskPrioritySelect.value = task.priority;
        submitBtn.textContent = "Edit";
    }

    function resetForm() {
        taskForm.reset();
        isEditing = false;
        currentEditId = null;
        modalTitle.textContent = 'Add New Task';
    }

    function filterTasks(filter) {
        currentFilter = filter;
        
        // Update active filter button
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        renderTasks();
    }

    function handleClearCompleted() {
        if (tasks.some(task => task.completed)) {
            showConfirmModal(
                'Are you sure you want to delete all completed tasks?',
                () => {
                    tasks = tasks.filter(task => !task.completed);
                    
                    if (selectedTaskId && !tasks.some(task => task.id === selectedTaskId)) {
                        selectedTaskId = null;
                    }
                    
                    if (currentEditId && !tasks.some(task => task.id === currentEditId)) {
                        resetForm();
                    }
                    
                    saveTasks();
                    renderTasks();
                }
            );
        } else {
            alert('No completed tasks to delete');
        }
    }

    function showDeleteConfirmation(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        showConfirmModal(
            `Are you sure you want to delete "${task.title}"?`,
            () => deleteTask(taskId)
        );
    }

    function showConfirmModal(message, confirmCallback) {
        modalMessage.textContent = message;
        confirmDeleteBtn.onclick = function() {
            confirmCallback();
            closeConfirmModal();
        };
        confirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeConfirmModal() {
        confirmModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function openTaskModal() {
        resetForm();
        taskModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        taskTitleInput.focus();
        submitBtn.textContent = "Add";
    }

    function closeTaskModal() {
        taskModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function confirmDeleteTask() {
        if (selectedTaskId) {
            deleteTask(selectedTaskId);
        }
        closeConfirmModal();
    }

    function renderTasks() {
        // Filter tasks based on current filter
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'active') return !task.completed;
            return true;
        });
        
        // Render task list
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet. Add one to get started!' : 
                                      currentFilter === 'completed' ? 'No completed tasks' : 'No active tasks';
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.id === selectedTaskId ? 'selected' : ''}`;
                
                li.innerHTML = `
                    <input type="number" id="itemid" style="display: none;" value="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onclick="event.stopPropagation(); toggleComplete(${task.id}, event)">
                    <span class="task-text">${task.title}</span>
                    <span class="task-priority priority-${task.priority}">
                        ${getPriorityText(task.priority)}
                    </span>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="event.stopPropagation(); showEditForm(${task.id}, event)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="event.stopPropagation(); showDeleteConfirmation(${task.id}, event)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                li.addEventListener('click', () => selectTask(task.id));
                taskList.appendChild(li);
            });
        }
        
        // Update task details
        if (selectedTaskId && tasks.some(task => task.id === selectedTaskId)) {
            showTaskDetails(selectedTaskId);
        } else {
            showNoSelection();
        }
        
        // Update task counter
        updateStats();
    }

    function showTaskDetails(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        taskDetails.innerHTML = `
            <div class="detail-content">
                <h3 class="detail-title">${task.title}</h3>
                
                <div class="detail-meta">
                    <div class="detail-meta-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">${task.completed ? 'Completed' : 'Active'}</span>
                    </div>
                    <div class="detail-meta-item">
                        <span class="detail-label">Priority</span>
                        <span class="detail-value ${task.priority}-priority">
                            ${getPriorityText(task.priority)}
                        </span>
                    </div>
                    <div class="detail-meta-item">
                        <span class="detail-label">Created At</span>
                        <span class="detail-value">${task.createdAt}</span>
                    </div>
                </div>
                
                <div>
                    <span class="detail-label">Description</span>
                    <p class="detail-description">${task.description || 'No description provided'}</p>
                </div>
                
                <div class="detail-actions">
                    <button class="edit-btn" onclick="showEditForm(${task.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="showDeleteConfirmation(${task.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    function showNoSelection() {
        taskDetails.innerHTML = `
            <div class="no-selection">
                <i class="fas fa-hand-pointer"></i>
                <p>Select a task to view details</p>
            </div>
        `;
    }

    function updateStats() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
    }

    function getPriorityText(priority) {
        const priorities = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High'
        };
        return priorities[priority] || priority;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        renderTasks();
    }

    // Expose functions to global scope for inline event handlers
    window.toggleComplete = toggleComplete;
    window.showEditForm = showEditForm;
    window.showDeleteConfirmation = showDeleteConfirmation;
    window.filterTasks = filterTasks;
});