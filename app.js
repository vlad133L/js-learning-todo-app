import { themeIcons } from "./modules/themeIcons.js";
import { taskIcons } from "./modules/taskIcons.js";
const themeToggleButton = document.querySelector(".controls__theme-toggle");
const emptySection = document.querySelector(".tasks-section__empty");
const addTaskButton = document.querySelector(".add-button");
const container = document.querySelector(".container");
const modalCloseButton = document.querySelector(".modal__buttons-cancel");
const modalApplyButton = document.querySelector(".modal__buttons-apply");
const modal = document.querySelector(".modal");
const searchInput = document.querySelector(".controls__search");
const tasksList = document.createElement("ul");
const tasksSection = document.querySelector(".tasks-section");
const selectFilter = document.querySelector(".controls__filter");
tasksSection.appendChild(tasksList);
tasksList.classList.add("tasks-section__list");

const todoItems = [];
let deletedTask = null; // Объявляем переменную deletedTask
let remainingTime = 0; // Объявляем переменную remainingTime
let timerInterval = null; // Объявляем переменную timerInterval
let deletionTimeout = null; // Объявляем переменную deletionTimeout

const themes = {
  light: {
    textColor: "black",
    emptyImageSrc: "./assets/images/empty-image.svg",
    icon: themeIcons.light,
  },
  dark: {
    textColor: "white",
    emptyImageSrc: "./assets/images/dark-mode-empty-image.svg",
    icon: themeIcons.dark,
  },
};

selectFilter.addEventListener("change", (event) => {
  const selectedOption = event.target.value;
  filterTasks(selectedOption);
});

function filterTasks(filter) {
  const tasks = Array.from(tasksList.children);
  tasks.forEach((task) => {
    const isTaskCompleted = task.querySelector(
      'input[type="checkbox"]'
    ).checked;
    if (filter === "All") {
      task.style.display = "flex";
    } else if (filter === "Complete") {
      task.style.display = isTaskCompleted ? "flex" : "none";
    } else if (filter === "Incomplete") {
      task.style.display = !isTaskCompleted ? "flex" : "none";
    } else {
      task.style.display = "flex";
    }
  });

  updateTaskBorders();
}

function saveTasksToLocalStorage() {
  localStorage.setItem("todoItems", JSON.stringify(todoItems));
}

function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem("todoItems");
  if (storedTasks) {
    todoItems.push(...JSON.parse(storedTasks));
    renderTasks();
  }
}

function renderTasks() {
  tasksList.innerHTML = "";
  todoItems.forEach((todoItem) => {
    const taskElement = document.createElement("li");
    taskElement.classList.add("tasks-section__list-item", "list-item");
    taskElement.setAttribute("data-key", todoItem.id);

    taskElement.innerHTML = `
      <input id=${todoItem.id} type="checkbox" ${
      todoItem.checked ? "checked" : ""
    }/>
      <label for="${todoItem.id}" class="list-item__checkbox"></label>
      <input value=${
        todoItem.taskText
      } type="text" class="list__item-text" readonly="true"/>
      <div class="list-item__buttons">
        <button class="edit-button">${taskIcons.editIcon}</button>
        <button class="delete-button">${taskIcons.deleteIcon}</button>
      </div>
    `;

    if (todoItem.checked) {
      taskElement.classList.add("done");
    }

    tasksList.appendChild(taskElement);
  });

  const selectedFilter = selectFilter.value;
  filterTasks(selectedFilter);

  toggleTasksView();
  updateTaskBorders();
}
function toggleTasksView() {
  const isEmpty = tasksList.children.length === 0;
  emptySection.style.display = isEmpty ? "flex" : "none";
  tasksList.style.display = isEmpty ? "none" : "block";
}

function updateTaskBorders() {
  const visibleTasks = Array.from(tasksList.children).filter(
    (task) => task.style.display !== "none"
  );
  visibleTasks.forEach((task, index) => {
    task.style.borderBottom =
      index === visibleTasks.length - 1
        ? "none"
        : "1px solid var(--primary-color)";
    task.style.borderTop = "none";
  });
}

// toggle theme (light or dark)
themeToggleButton.addEventListener("click", () => {
  container.classList.toggle("dark");
  updateTheme();
});
function updateTheme() {
  const isDarkMode = container.classList.contains("dark");
  const theme = isDarkMode ? themes.dark : themes.light;
  const [emptyImage, emptyText] = emptySection.children;
  emptyImage.src = theme.emptyImageSrc;
  emptyText.style.color = theme.textColor;
  themeToggleButton.innerHTML = theme.icon;
  searchInput.classList.toggle("dark", isDarkMode);
}

addTaskButton.addEventListener("click", () => {
  const isDarkMode = container.classList.contains("dark");
  if (isDarkMode) {
    const modalInput = document.querySelector(".modal__input");
    const modalMain = document.querySelector(".modal__main");
    modalMain.classList.toggle("dark");
    modalInput.classList.toggle("dark");
  }
  modal.style.display = "block";
  container.classList.add("modal-open");
  updateTaskBorders();
});

modalCloseButton.addEventListener("click", () => {
  modal.style.display = "none";
  container.classList.remove("modal-open");
});

modalApplyButton.addEventListener("click", () => {
  const modalTaskInput = document.querySelector(".modal__input");
  const taskText = modalTaskInput.value.trim();
  if (!taskText) {
    return;
  }
  const todoItem = {
    taskText,
    checked: false,
    id: Date.now(),
  };
  todoItems.push(todoItem);
  saveTasksToLocalStorage();
  renderTasks();
  modal.style.display = "none";
  container.classList.remove("modal-open");
  modalTaskInput.value = "";
});

searchInput.addEventListener("input", (e) => {
  const searchInputValue = e.target.value.trim().toLowerCase();
  Array.from(tasksList.children).forEach((task) => {
    const taskText = task.querySelector(".list__item-text").value.toLowerCase();
    if (taskText.startsWith(searchInputValue)) {
      task.style.display = "flex";
    } else {
      task.style.display = "none";
    }
  });
  updateTaskBorders();
});

function startTimer() {
  const timerElement = document.querySelector(".undo-button .timer");
  const timerCircle = document.querySelector(
    ".undo-button .timer-circle circle"
  );

  remainingTime = 3;
  timerElement.textContent = remainingTime;

  timerCircle.style.animation = "none";
  timerCircle.offsetHeight;
  timerCircle.style.animation = null;

  timerInterval = setInterval(() => {
    remainingTime--;
    timerElement.textContent = remainingTime;

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      hideUndoButton();
    }
  }, 1000);
}

function deleteTask(id) {
  const taskElement = document.querySelector(`[data-key='${id}']`);
  if (!taskElement) return;

  taskElement.style.display = "none";

  deletedTask = {
    id: id,
    element: taskElement,
  };

  showUndoButton();
  startTimer();
  updateTaskBorders();
  deletionTimeout = setTimeout(() => {
    if (deletedTask) {
      const index = todoItems.findIndex((item) => item.id === Number(id));
      if (index !== -1) {
        todoItems.splice(index, 1);
        saveTasksToLocalStorage();
      }

      deletedTask = null;
      hideUndoButton();
    }
  }, 3000);
}

function undoDelete() {
  if (deletedTask) {
    deletedTask.element.style.display = "flex";

    deletedTask = null;

    hideUndoButton();

    if (deletionTimeout) {
      clearTimeout(deletionTimeout);
    }
  }
}

function showUndoButton() {
  const undoButton = document.querySelector(".undo-button");
  undoButton.style.display = "flex";
}

function hideUndoButton() {
  const undoButton = document.querySelector(".undo-button");
  undoButton.style.display = "none";
}

document.querySelector(".undo-button").addEventListener("click", () => {
  undoDelete();
  updateTaskBorders();
});

function completeTask(id) {
  const index = todoItems.findIndex((item) => item.id === Number(id));
  if (index === -1) return;

  todoItems[index].checked = !todoItems[index].checked;
  saveTasksToLocalStorage();

  const taskElement = document.querySelector(`[data-key='${id}']`);
  if (taskElement) {
    taskElement.classList.toggle("done", todoItems[index].checked);
  }

  renderTasks();
}

function editTask(id) {
  const taskElement = document.querySelector(`[data-key='${id}']`);
  if (!taskElement) return;

  const taskElementInput = taskElement.querySelector(
    'input[type="text"]:last-of-type'
  );
  const editButton = taskElement.querySelector(".edit-button");

  if (taskElementInput && editButton) {
    editButton.innerHTML = "Save";

    taskElementInput.removeAttribute("readonly");
    taskElementInput.focus();
    const length = taskElementInput.value.length;
    taskElementInput.setSelectionRange(length, length);

    const saveChanges = () => {
      const newText = taskElementInput.value.trim();
      if (newText) {
        const index = todoItems.findIndex((item) => item.id === Number(id));
        if (index !== -1) {
          todoItems[index].taskText = newText;
          saveTasksToLocalStorage();
        }
      }

      taskElementInput.setAttribute("readonly", true);

      editButton.innerHTML = taskIcons.editIcon;

      updateTaskBorders();
    };

    taskElementInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveChanges();
      }
    });

    editButton.addEventListener("click", saveChanges);

    taskElementInput.addEventListener("blur", saveChanges);
  }
}

tasksList.addEventListener("click", (event) => {
  event.preventDefault();

  if (event.target.classList.contains("list-item__checkbox")) {
    const todoItemId = event.target.closest(".list-item").dataset.key;
    completeTask(todoItemId);
  }

  const deleteButton = event.target.closest(".delete-button");
  if (deleteButton) {
    const todoItemId = deleteButton.closest(".list-item").dataset.key;
    deleteTask(todoItemId);
  }

  const editButton = event.target.closest(".edit-button");
  if (editButton) {
    const todoItemId = editButton.closest(".list-item").dataset.key;
    editTask(todoItemId);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromLocalStorage();
  const selectedFilter = selectFilter.value;
  filterTasks(selectedFilter);
});
