import { themeIcons } from "./modules/themeIcons.js";
import { taskIcons } from "./modules/taskIcons.js";
import { debounce } from "./utils/debounce.js";
import { startTimer } from "./utils/timer.js";

const themeToggleButton = document.querySelector(".controls__theme-toggle");
const emptySection = document.querySelector(".tasks-section__empty");
const addTaskButton = document.querySelector(".add-button");
const container = document.querySelector(".container");
const modal = document.querySelector(".modal");
const searchInput = document.querySelector(".controls__search");
const tasksList = document.createElement("ul");
const tasksSection = document.querySelector(".tasks-section");
const selectFilter = document.querySelector(".controls__filter");

tasksSection.appendChild(tasksList);
tasksList.classList.add("tasks-section__list");

const todoItems = [];

let deletedTask = null;
let deletionTimeout = null;

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

document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromLocalStorage();
  const selectedFilter = selectFilter.value;
  filterTasks(selectedFilter);
});

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

function createTodoItem(todoItem) {
  const taskElement = document.createElement("li");
  taskElement.classList.add("tasks-section__list-item", "list-item");
  taskElement.setAttribute("data-key", todoItem.id);

  taskElement.innerHTML = `
    <input id=${todoItem.id} type="checkbox" ${
    todoItem.checked ? "checked" : ""
  }/>
    <label for="${todoItem.id}" class="list-item__checkbox"></label>
    <input value="${
      todoItem.taskText
    }" type="text" class="list-item__text" readonly />
    <div class="list-item__buttons">
      <button class="edit-button">${taskIcons.editIcon}</button>
      <button class="delete-button">${taskIcons.deleteIcon}</button>
    </div>
  `;

  if (todoItem.checked) {
    taskElement.classList.add("done");
  }

  return taskElement;
}

function renderTasks() {
  tasksList.innerHTML = "";
  todoItems.forEach((todoItem) => {
    const taskElement = createTodoItem(todoItem);
    tasksList.appendChild(taskElement);
  });

  const selectedFilter = selectFilter.value;
  filterTasks(selectedFilter);

  toggleTasksView();
  updateTaskBorders();
}

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
function addTaskToList() {
  const modalTaskInput = document.querySelector(".modal__input");
  const taskText = modalTaskInput.value.trim();
  if (!taskText) {
    alert("Type something");
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
  closeModal();

  modalTaskInput.value = "";
}
function closeModal() {
  modal.style.display = "none";
  container.classList.remove("modal-open");
}

// delegation modal (close&apply buttons)
modal.addEventListener("click", (event) => {
  const target = event.target;
  if (target.closest(".modal__buttons-apply")) {
    addTaskToList();
  }
  if (target.closest(".modal__buttons-cancel")) {
    closeModal();
  }
});
const modalTaskInput = document.querySelector(".modal__input");
modalTaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTaskToList();
  }
});

function handleSearchInput(event) {
  const searchInputValue = event.target.value.trim().toLowerCase();
  const selectedFilter = selectFilter.value;
  Array.from(tasksList.children).forEach((task) => {
    const taskText = task
      .querySelector(".list-item__text")
      .value.trim()
      .toLowerCase();

    const isTaskCompleted = task.querySelector(
      'input[type="checkbox"]'
    ).checked;

    const matchesSearch = taskText.startsWith(searchInputValue);
    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Complete" && isTaskCompleted) ||
      (selectedFilter === "Incomplete" && !isTaskCompleted);

    if (matchesSearch && matchesFilter) {
      task.style.display = "flex";
    } else {
      task.style.display = "none";
    }
  });

  updateTaskBorders();
}

const debouncedHandleSearchInput = debounce(handleSearchInput, 300);
searchInput.addEventListener("input", debouncedHandleSearchInput);

function toggleTasksView() {
  const isEmpty = todoItems.length === 0;
  emptySection.style.display = isEmpty ? "flex" : "none";
  tasksList.style.display = isEmpty ? "none" : "block";
}

function setDeleteButtonsDisabled(isDisabled) {
  const deleteButtons = document.querySelectorAll(".delete-button");
  deleteButtons.forEach((button) => {
    if (button !== deletedTask?.element?.querySelector(".delete-button")) {
      button.disabled = isDisabled;
    }
  });
}

function deleteTask(id) {
  const taskElement = document.querySelector(`[data-key='${id}']`);
  if (!taskElement) return;

  taskElement.style.display = "none";

  deletedTask = {
    id,
    element: taskElement,
  };

  showUndoButton();
  startTimer();
  updateTaskBorders();
  setDeleteButtonsDisabled(true);

  deletionTimeout = setTimeout(() => {
    if (deletedTask) {
      const index = todoItems.findIndex((item) => item.id === Number(id));
      if (index !== -1) {
        todoItems.splice(index, 1);
        saveTasksToLocalStorage();
      }
      deletedTask = null;
      hideUndoButton();
      setDeleteButtonsDisabled(false);
      if (todoItems.length === 0) {
        toggleTasksView();
      }
    }
  }, 3000);
}

function undoDelete() {
  if (deletedTask) {
    deletedTask.element.style.display = "flex";

    deletedTask = null;
    hideUndoButton();
    if (deletionTimeout) clearTimeout(deletionTimeout);
    setDeleteButtonsDisabled(false);
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

  const taskTextInput = taskElement.querySelector(".list-item__text");
  const editButton = taskElement.querySelector(".edit-button");

  if (taskTextInput && editButton) {
    if (taskTextInput.isEditing) {
      saveChanges(taskTextInput, id, editButton);
    } else {
      taskTextInput.removeAttribute("readonly");
      taskTextInput.focus();
      taskTextInput.setSelectionRange(
        taskTextInput.value.length,
        taskTextInput.value.length
      );
      taskTextInput.isEditing = true;
      editButton.innerHTML = "Save";

      const handleSaveClick = () => {
        saveChanges(taskTextInput, id, editButton);
      };
      editButton.addEventListener("click", handleSaveClick);
      editButton.removeEventListener("click", handleSaveClick);
    }
  }
}

function saveChanges(taskTextInput, id, editButton) {
  const newText = taskTextInput.value.trim() || "Type something...";
  const index = todoItems.findIndex((item) => item.id === Number(id));
  if (index !== -1) {
    todoItems[index].taskText = newText;
    taskTextInput.value = newText;
    saveTasksToLocalStorage();
  }
  taskTextInput.setAttribute("readonly", true);
  taskTextInput.isEditing = false;
  editButton.innerHTML = taskIcons.editIcon;
  taskTextInput.blur();
  updateTaskBorders();
}
// delegation task list (task items)
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
