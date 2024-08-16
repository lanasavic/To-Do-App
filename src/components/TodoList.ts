import trashAlt from '../resources/img/trashAlt.png';

class TodoList extends HTMLElement {

  tasks: { content: string; completed: boolean, isApiTask: boolean }[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback() {
    this.shadowRoot?.querySelector('button')?.addEventListener('click', () => {
      const taskCountInput = this.shadowRoot?.querySelector('.todo-list__api-group--api-task-number') as HTMLInputElement;
      const input = this.shadowRoot?.querySelector('input');
      const content = input?.value.trim();

      if (content) {
        this.tasks.push({ content, completed: false, isApiTask: false });
        this.appendTask(content, false, false);
        input!.value = '';
      } else {
        this.showMessage('Please enter a valid task', 'error');
        taskCountInput!.value = '';
      }
    });

    this.shadowRoot?.querySelector('.todo-list__api-group--add-api-task-button')?.addEventListener('click', () => {
      const taskCountInput = this.shadowRoot?.querySelector('.todo-list__api-group--api-task-number') as HTMLInputElement;
      const taskCount = parseInt(taskCountInput.value, 10);

      if (taskCount > 0) {
        this.fetchApiTasks(taskCount);
        taskCountInput!.value = '';
      } else {
        this.showMessage('Please enter a valid number of tasks', 'error');
        taskCountInput!.value = '';
      }
    });

    this.shadowRoot!.querySelector('.todo-list__button-group--delete-all')!.addEventListener('click', this.deleteAllTasks.bind(this));
    
    this.shadowRoot?.querySelector('.todo-list__button-group--delete-manual')?.addEventListener('click', () => {
      this.deleteManualTasks();
    });
    
    this.shadowRoot?.querySelector('.todo-list__button-group--delete-api')?.addEventListener('click', () => {
      this.deleteApiTasks();
    });
  }

  appendTask(content: string, completed: boolean, isApiTask: boolean = false) {
    const taskList = this.shadowRoot?.querySelector('ul');
    const listItem = document.createElement('li') as HTMLLIElement;
  
    listItem.classList.add('task-list__task', isApiTask ? 'api-task' : 'manual-task');
  
    listItem.innerHTML = `
      <div class="task-list__checkbox">
        <input class="task-list__checkbox--input" type="checkbox" ${completed ? 'checked' : ''}>
      </div>
      <span class="task-list__content">${content}</span>
      <button class="task-list__button task-list__content--delete-task-button"><img class="task-list__icon task-list__content--delete-icon" src=${trashAlt} alt="Trash Icon"></button>
    `;
          
    if (completed) {
      listItem.classList.add('completed');
    }

    const checkbox = listItem.querySelector('input') as HTMLInputElement;
  
    checkbox.addEventListener('change', () => {
      const index = Array.from(taskList!.children).indexOf(listItem);
      this.toggleTask(index, checkbox);
    });
  
    listItem.querySelector('button')?.addEventListener('click', () => {
      this.removeTask(listItem);
    });
  
    taskList?.appendChild(listItem);
    this.updateTaskCount();
  }
  
  async fetchApiTasks(count: number) {
    try {
      const response = await fetch(`https://dummyjson.com/todos?limit=254`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();

      const shuffledTasks = this.shuffleArray(data.todos);

      const selectedTasks = shuffledTasks.slice(0, count);

      selectedTasks.forEach((task: any) => {
        const content = task.todo;
        const completed = task.completed;
  
        this.tasks.push({ content, completed, isApiTask: true });
        this.appendTask(content, completed, true);
      });
    
      this.showMessage('Tasks added successfully', 'success');
      this.updateTaskCount();
    } catch (error) {
      this.showMessage('Error adding tasks', 'error');
      console.error('Error fetching API tasks:', error);
    }
  }

  // Fisher-Yates shuffle algorithm
  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  showMessage(message: string, type: 'success' | 'error') {
    const messageElement = this.shadowRoot!.querySelector('p') as HTMLParagraphElement;
    messageElement.textContent = message;
    messageElement.className = `todo-list__message ${type}`;
    setTimeout(() => {
      const completedTasks = this.tasks.filter(task => task.completed).length;
      messageElement.textContent = `Completed tasks: ${completedTasks} / ${this.tasks.length}`;
      messageElement.className = 'todo-list__message';
    }, 3000);
  }

  toggleTask(index: number, checkbox: HTMLInputElement) {
    this.tasks[index].completed = checkbox.checked;
    
    const taskListItems = this.shadowRoot!.querySelectorAll('li');
    const taskItemElement = taskListItems[index];

    if (taskItemElement) {
      if (checkbox.checked) {
        taskItemElement.classList.add('completed');
      } else {
        taskItemElement.classList.remove('completed');
      }
    }

    this.updateTaskCount();
  }

  updateTaskCount() {
    const completedTasks = this.tasks.filter(task => task.completed).length;
    this.shadowRoot!.querySelector('p')!.textContent = `Completed tasks: ${completedTasks} / ${this.tasks.length}`;
  }

  deleteAllTasks() {
    const taskList = this.shadowRoot!.querySelector('.task-list')!;

    if (taskList.children.length === 0) {
      alert("There is nothing to delete");
    } else {
      this.tasks = [];
      taskList.innerHTML = '';
      this.updateTaskCount();
    }
  }

  deleteManualTasks() {
    const manualTasks = this.shadowRoot?.querySelectorAll('li.manual-task');

    if (manualTasks?.length) {
        manualTasks.forEach(task => task.remove());
        this.tasks = this.tasks.filter(task => task.isApiTask);
    } else {
        alert('No manual tasks to delete');
    }
    this.updateTaskCount();
  }
  
  deleteApiTasks() {
      const apiTasks = this.shadowRoot?.querySelectorAll('li.api-task');
      
      if (apiTasks?.length) {
          apiTasks.forEach(task => task.remove());
          this.tasks = this.tasks.filter(task => !task.isApiTask);
      } else {
          alert('No API tasks to delete');
      }
      this.updateTaskCount();
  }

  removeTask(listItem: HTMLLIElement) {
    const index = Array.from(this.shadowRoot!.querySelectorAll('li')).indexOf(listItem);
    this.tasks.splice(index, 1);
    listItem.remove();
    this.updateTaskCount();
  }
        
  render() {
    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="/src/styles/main.scss">
      <div class="todo-list">
          <p class="todo-list__message">Completed tasks: 0 / 0</p>
          <div class="todo-list__content">
            <div class="todo-list__input-group">
              <input class="todo-list__input todo-list__input-group--add-task" type="text" placeholder="Add a new task" />
              <button class="todo-list__button todo-list__input-group--add-task-button">Add Task</button>
            </div>
            <div class="todo-list__api-group">
              <input type="number" placeholder="Set number of tasks" class="todo-list__input todo-list__api-group--api-task-number" />
              <button class="todo-list__button todo-list__api-group--add-api-task-button">Add API Tasks</button>
            </div>
            <div class="todo-list__button-group">
              <button class="todo-list__button todo-list__button-group--delete-all">Delete All</button>
              <button class="todo-list__button todo-list__button-group--delete-manual">Delete Manual Tasks</button>
              <button class="todo-list__button todo-list__button-group--delete-api">Delete API Tasks</button>
            </div>
            <div class="todo-list__task-group">
              <ul class="task-list"></ul>
            </div>
          </div>
      </div>
    `;
  }
}

customElements.define('todo-list', TodoList);
