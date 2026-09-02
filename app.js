const STORAGE_KEY = "daymark-tasks";

const seedTasks = [
  { id: crypto.randomUUID(), title: "Sketch the outline for the new project", completed: false, createdAt: "09:15" },
  { id: crypto.randomUUID(), title: "Book a table for Friday evening", completed: false, createdAt: "08:42" },
  { id: crypto.randomUUID(), title: "Read 20 pages of current book", completed: true, createdAt: "Yesterday" },
  { id: crypto.randomUUID(), title: "Water the plants", completed: true, createdAt: "Yesterday" },
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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
  tasks.unshift({ id: crypto.randomUUID(), title, completed: false, createdAt: "Just now" });
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
  if (button.dataset.action === "delete") tasks = tasks.filter((item) => item.id !== task.id);
  saveTasks();
  render();
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("active", selected);
      filter.setAttribute("aria-selected", selected);
    });
    render();
  });
});

document.querySelector("#clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
render();
