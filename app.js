const STORAGE_KEY = "daymark-tasks";

function createId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seedTasks = [
  { id: createId(), title: "Sketch the outline for the new project", completed: false, createdAt: "09:15" },
  { id: createId(), title: "Book a table for Friday evening", completed: false, createdAt: "08:42" },
  { id: createId(), title: "Read 20 pages of current book", completed: true, createdAt: "Yesterday" },
  { id: createId(), title: "Water the plants", completed: true, createdAt: "Yesterday" },
];

let tasks = loadTasks();
let currentFilter = "all";

const elements = {
  form: document.querySelector("#taskForm"),
  input: document.querySelector("#taskInput"),
  list: document.querySelector("#taskList"),
  empty: document.querySelector("#emptyState"),
  allCount: document.querySelector("#allCount"),
  activeCount: document.querySelector("#activeCount"),
  doneCount: document.querySelector("#doneCount"),
  countLabel: document.querySelector("#taskCountLabel"),
  progressRing: document.querySelector("#progressRing"),
  progressPercent: document.querySelector("#progressPercent"),
  progressTitle: document.querySelector("#progressTitle"),
  progressCaption: document.querySelector("#progressCaption"),
};

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : seedTasks;
  } catch {
    return seedTasks;
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // The app remains usable when storage is blocked or full.
  }
}

function render() {
  const completed = tasks.filter((task) => task.completed).length;
  const visibleTasks = tasks.filter((task) => currentFilter === "all" || (currentFilter === "completed" ? task.completed : !task.completed));
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  elements.list.innerHTML = visibleTasks.map((task, index) => `
    <article class="task ${task.completed ? "done" : ""}" style="animation-delay: ${index * 45}ms">
      <button class="task-check" type="button" data-action="toggle" data-id="${task.id}" aria-label="Mark ${escapeHtml(task.title)} ${task.completed ? "open" : "complete"}"></button>
      <span class="task-text">${escapeHtml(task.title)}</span>
      <span class="task-date">${task.createdAt}</span>
      <button class="edit-task" type="button" data-action="edit" data-id="${task.id}" aria-label="Edit ${escapeHtml(task.title)}">✎</button>
      <button class="delete-task" type="button" data-action="delete" data-id="${task.id}" aria-label="Delete ${escapeHtml(task.title)}">×</button>
    </article>
  `).join("");

  elements.empty.hidden = visibleTasks.length > 0;
  elements.allCount.textContent = tasks.length;
  elements.activeCount.textContent = tasks.length - completed;
  elements.doneCount.textContent = completed;
  elements.countLabel.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressRing.style.background = `conic-gradient(var(--accent) ${progress * 3.6}deg, var(--line) 0deg)`;
  elements.progressRing.setAttribute("aria-label", `${progress}% complete`);
  elements.progressTitle.textContent = progress === 100 ? "All clear" : progress > 0 ? "Good momentum" : "Fresh start";
  elements.progressCaption.textContent = progress === 100 ? "You made space for what matters." : progress > 0 ? "Keep the rhythm going." : "A little progress goes a long way.";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function addTask(title) {
  tasks.unshift({ id: createId(), title, completed: false, createdAt: "Just now" });
  saveTasks();
  render();
}

function beginEdit(task, article, button) {
  const textElement = article.querySelector(".task-text");
  const input = document.createElement("input");
  input.className = "task-edit-input";
  input.type = "text";
  input.maxLength = 120;
  input.value = task.title;
  textElement.replaceWith(input);
  button.dataset.action = "save";
  button.textContent = "✓";
  button.setAttribute("aria-label", `Save ${task.title}`);
  input.focus();
  input.select();
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") button.click();
    if (event.key === "Escape") render();
  });
}

function saveEdit(task, article) {
  const input = article.querySelector(".task-edit-input");
  const updatedTitle = input?.value.trim();
  if (!updatedTitle) return;
  task.title = updatedTitle;
  saveTasks();
  render();
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.input.value.trim();
  if (!title) return;
  addTask(title);
  elements.input.value = "";
  elements.input.focus();
});

elements.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const task = tasks.find((item) => item.id === button.dataset.id);
  if (!task) return;
  if (button.dataset.action === "toggle") task.completed = !task.completed;
  if (button.dataset.action === "edit") {
    beginEdit(task, button.closest(".task"), button);
    return;
  }
  if (button.dataset.action === "save") {
    saveEdit(task, button.closest(".task"));
    return;
  }
  if (button.dataset.action === "delete") tasks = tasks.filter((item) => item.id !== task.id);
  saveTasks();
  render();
});

function setFilter(filterName) {
  currentFilter = filterName;
  document.querySelectorAll(".filter").forEach((filter) => {
    const selected = filter.dataset.filter === filterName;
    filter.classList.toggle("active", selected);
    filter.setAttribute("aria-selected", selected);
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.navFilter === filterName);
  });
  render();
}

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    setFilter(link.dataset.navFilter);
  });
});

document.querySelectorAll("[data-emoji]").forEach((button) => {
  button.addEventListener("click", () => {
    const emoji = button.dataset.emoji;
    const currentValue = elements.input.value.trimEnd();
    elements.input.value = currentValue ? `${currentValue} ${emoji} ` : `${emoji} `;
    elements.input.focus();
    elements.input.setSelectionRange(elements.input.value.length, elements.input.value.length);
  });
});

document.querySelector("#clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
render();
