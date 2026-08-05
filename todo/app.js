/* app.js - To-Do list with localStorage */
const STORAGE_KEY = 'todo_tasks_v1';

const el = selector => document.querySelector(selector);
const els = selector => Array.from(document.querySelectorAll(selector));

let tasks = [];
let filter = 'all';

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Failed to load tasks', e);
    tasks = [];
  }
}

function uid(){return Date.now().toString(36) + Math.random().toString(36).slice(2,7)}

function render(){
  const list = el('#task-list');
  list.innerHTML = '';

  const filtered = tasks.filter(t => {
    if(filter === 'active') return !t.completed;
    if(filter === 'completed') return t.completed;
    return true;
  });

  for(const task of filtered){
    const li = document.createElement('li');
    li.className = 'task' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.completed;
    checkbox.addEventListener('change', () => toggleComplete(task.id));

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = task.title;
    title.tabIndex = 0;

    const editBtn = document.createElement('button');
    editBtn.title = 'Edit';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => startEdit(task.id, li));

    const delBtn = document.createElement('button');
    delBtn.title = 'Delete';
    delBtn.innerHTML = '🗑️';
    delBtn.addEventListener('click', () => removeTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    list.appendChild(li);
  }

  updateCount();
}

function updateCount(){
  const remaining = tasks.filter(t => !t.completed).length;
  el('#count').textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;
}

function addTask(title){
  const trimmed = title.trim();
  if(!trimmed) return;
  tasks.unshift({id: uid(), title: trimmed, completed: false, createdAt: Date.now()});
  save(); render();
}

function removeTask(id){
  tasks = tasks.filter(t => t.id !== id);
  save(); render();
}

function toggleComplete(id){
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  t.completed = !t.completed;
  save(); render();
}

function startEdit(id, li){
  const t = tasks.find(x => x.id === id);
  if(!t) return;

  li.innerHTML = '';
  const input = document.createElement('input');
  input.className = 'edit-input';
  input.value = t.title;
  li.appendChild(input);
  input.focus();

  function finish(saveEdit){
    if(saveEdit){
      const val = input.value.trim();
      if(val) t.title = val;
    }
    save(); render();
  }

  input.addEventListener('blur', () => finish(true));
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') finish(true);
    if(e.key === 'Escape') finish(false);
  });
}

function clearCompleted(){
  tasks = tasks.filter(t => !t.completed);
  save(); render();
}

function setFilter(f){
  filter = f;
  els('.filter').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === f));
  render();
}

// Setup
load();

document.addEventListener('DOMContentLoaded', () => {
  render();

  el('#new-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = el('#new-task-input');
    addTask(input.value);
    input.value = '';
    input.focus();
  });

  el('#clear-completed').addEventListener('click', () => {
    clearCompleted();
  });

  els('.filter').forEach(btn => btn.addEventListener('click', (e) => {
    setFilter(btn.dataset.filter);
  }));
});
