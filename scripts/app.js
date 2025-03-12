// Элементы DOM
const themeToggleButton = document.querySelector(".theme-toggle");
const emptySection = document.querySelector(".tasks-section__empty");

const addButton = document.querySelector(".add-button");
const container = document.querySelector(".container");
const modalCloseButton = document.querySelector(".modal__buttons-cancel");
const modalApplyButton = document.querySelector(".modal__buttons-apply");
const modal = document.querySelector(".modal");
const searchInput = document.querySelector(".search-input");
const tasksList = document.createElement("ul");
const tasksSection = document.querySelector(".tasks-section");
tasksSection.appendChild(tasksList);
tasksList.classList.add("tasks-section__list");

// Массив задач
const todoItems = [];

// Темы
const themes = {
  light: {
    textColor: "black",
    emptyImageSrc: "./assets/images/empty-image.svg",
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.1249 0.548798C11.3387 0.917354 11.321 1.3762 11.0791 1.72705C10.3455 2.79152 9.91599 4.08062 9.91599 5.47334C9.91599 9.12428 12.8757 12.084 16.5266 12.084C17.9194 12.084 19.2085 11.6545 20.2729 10.9208C20.6238 10.6791 21.0826 10.6613 21.4512 10.8751C21.8197 11.089 22.0319 11.4962 21.9961 11.9208C21.5191 17.567 16.7867 22 11.0178 22C4.93282 22 0 17.0672 0 10.9822C0 5.21328 4.43301 0.480873 10.0792 0.00392422C10.5038 -0.0319387 10.911 0.180242 11.1249 0.548798ZM8.17985 2.63461C4.70452 3.81573 2.20355 7.10732 2.20355 10.9822C2.20355 15.8502 6.14981 19.7964 11.0178 19.7964C14.8927 19.7964 18.1843 17.2955 19.3654 13.8202C18.4741 14.1232 17.5191 14.2875 16.5266 14.2875C11.6587 14.2875 7.71244 10.3413 7.71244 5.47334C7.71244 4.48086 7.87682 3.52582 8.17985 2.63461Z" fill="#F7F7F7"/>
          </svg>`,
  },
  dark: {
    textColor: "white",
    emptyImageSrc: "./assets/images/dark-mode-empty-image.svg",
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1576 1.15764C12.1576 0.518299 11.6394 0 11 0C10.3606 0 9.84235 0.518299 9.84235 1.15764V1.73887C9.84235 2.37822 10.3606 2.89651 11 2.89651C11.6394 2.89651 12.1576 2.37822 12.1576 1.73887V1.15764ZM18.7782 4.85893C19.2302 4.40683 19.2302 3.67386 18.7782 3.22177C18.3261 2.76969 17.5931 2.76969 17.141 3.22177L16.73 3.63282C16.2779 4.08492 16.2779 4.81789 16.73 5.26998C17.182 5.72206 17.915 5.72206 18.3671 5.26998L18.7782 4.85893ZM4.85889 3.22184C4.40681 2.76976 3.67383 2.76976 3.22175 3.22184C2.76967 3.67393 2.76967 4.4069 3.22175 4.859L3.63273 5.26998C4.08483 5.72206 4.8178 5.72206 5.26989 5.26998C5.72197 4.81789 5.72197 4.08492 5.26989 3.63282L4.85889 3.22184ZM1.15764 9.84235C0.518299 9.84235 0 10.3606 0 11C0 11.6394 0.518299 12.1576 1.15764 12.1576H1.73884C2.37819 12.1576 2.89648 11.6394 2.89648 11C2.89648 10.3606 2.37819 9.84235 1.73884 9.84235H1.15764ZM20.2611 9.84235C19.6217 9.84235 19.1035 10.3606 19.1035 11C19.1035 11.6394 19.6217 12.1576 20.2611 12.1576H20.8424C21.4817 12.1576 22 11.6394 22 11C22 10.3606 21.4817 9.84235 20.8424 9.84235H20.2611ZM5.26989 18.3672C5.72197 17.9151 5.72197 17.1821 5.26989 16.7301C4.8178 16.2779 4.08483 16.2779 3.63273 16.7301L3.22177 17.141C2.76968 17.5931 2.76968 18.3261 3.22176 18.7782C3.67385 19.2302 4.40682 19.2302 4.85892 18.7782L5.26989 18.3672ZM18.3671 16.7301C17.915 16.2779 17.182 16.2779 16.73 16.7301C16.2779 17.1821 16.2779 17.9151 16.73 18.3672L17.1409 18.7782C17.5931 19.2303 18.326 19.2303 18.7782 18.7782C19.2302 18.3261 19.2302 17.5932 18.7782 17.141L18.3671 16.7301ZM12.1576 20.2611C12.1576 19.6217 11.6394 19.1035 11 19.1035C10.3606 19.1035 9.84235 19.6217 9.84235 20.2611V20.8424C9.84235 21.4817 10.3606 22 11 22C11.6394 22 12.1576 21.4817 12.1576 20.8424V20.2611ZM6.36943 11C6.36943 8.4426 8.4426 6.36943 11 6.36943C13.5573 6.36943 15.6305 8.4426 15.6305 11C15.6305 13.5573 13.5573 15.6305 11 15.6305C8.4426 15.6305 6.36943 13.5573 6.36943 11ZM11 4.05415C7.1639 4.05415 4.05415 7.1639 4.05415 11C4.05415 14.8361 7.1639 17.9458 11 17.9458C14.8361 17.9458 17.9458 14.8361 17.9458 11C17.9458 7.1639 14.8361 4.05415 11 4.05415Z" fill="#F7F7F7"/>
          </svg>`,
  },
};
function getEditIcon() {
  return `
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.67272 3.99106L1 10.6637V14H4.33636L11.0091 7.32736M7.67272 3.99106L10.0654 1.59837L10.0669 1.59695C10.3962 1.26759 10.5612 1.10261 10.7514 1.04082C10.9189 0.986392 11.0993 0.986392 11.2669 1.04082C11.4569 1.10257 11.6217 1.26735 11.9506 1.59625L13.4018 3.04738C13.7321 3.37769 13.8973 3.54292 13.9592 3.73337C14.0136 3.90088 14.0136 4.08133 13.9592 4.24885C13.8974 4.43916 13.7324 4.60414 13.4025 4.93398L13.4018 4.93468L11.0091 7.32736M7.67272 3.99106L11.0091 7.32736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function getDeleteIcon() {
  return `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z" stroke="#CDCDCD"/>
      <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
      <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
      <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
      <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
    </svg>
  `;
}
// Функции для работы с localStorage
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
    tasksList.insertAdjacentHTML(
      "beforeend",
      `
      <li class="tasks-section__list-item list-item" data-key=${todoItem.id}>
        <input id=${todoItem.id} type="checkbox" ${
        todoItem.checked ? "checked" : ""
      }/>
        <label for="${todoItem.id}" class="list-item__checkbox"></label>
        <input value=${
          todoItem.taskText
        } type="text" class="list__item-text" readonly="true"/>
        <div class="list-item__buttons">
          <button class="edit-button">${getEditIcon()}</button>
          <button class="delete-button">${getDeleteIcon()}</button>
        </div>
      </li>
      `
    );
  });
  updateTasksView();
  updateBorders();
}

// Обновление границ
function updateBorders() {
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

// Обновление отображения задач
function updateTasksView() {
  const isEmpty = tasksList.children.length === 0;
  emptySection.style.display = isEmpty ? "flex" : "none";
  tasksList.style.display = isEmpty ? "none" : "block";
}

// Обновление темы
function updateTheme() {
  const isDarkMode = container.classList.contains("dark");
  const theme = isDarkMode ? themes.dark : themes.light;
  const emptyImage = emptySection.children[0];
  const emptyText = emptySection.children[1];
  emptyImage.src = theme.emptyImageSrc;
  emptyText.style.color = theme.textColor;
  themeToggleButton.innerHTML = theme.icon;
  searchInput.classList.toggle("dark", isDarkMode);
}

// Переключение темы
themeToggleButton.addEventListener("click", () => {
  container.classList.toggle("dark");
  updateTheme();
});

// Открытие модального окна
addButton.addEventListener("click", () => {
  const isDarkMode = container.classList.contains("dark");
  if (isDarkMode) {
    const modalInput = document.querySelector(".modal__input");
    const modalMain = document.querySelector(".modal__main");
    modalMain.classList.toggle("dark");
    modalInput.classList.toggle("dark");
  }
  modal.style.display = "block";
  container.classList.add("modal-open");
  updateBorders();
});

// Закрытие модального окна
modalCloseButton.addEventListener("click", () => {
  modal.style.display = "none";
  container.classList.remove("modal-open");
});

// Добавление задачи
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

// Поиск задач
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
  updateBorders();
});

// Удаление задачи
function deleteTask(id) {
  const index = todoItems.findIndex((item) => item.id === Number(id));
  if (index !== -1) {
    todoItems.splice(index, 1);
    saveTasksToLocalStorage();
    renderTasks();
  }
}

// Завершение задачи
function completeTask(id) {
  const index = todoItems.findIndex((item) => item.id === Number(id));
  todoItems[index].checked = !todoItems[index].checked;
  saveTasksToLocalStorage();
  const item = document.querySelector(`[data-key='${id}']`);
  if (todoItems[index].checked) {
    item.classList.add("done");
  } else {
    item.classList.remove("done");
  }
  updateBorders();
}

// Редактирование задачи
function editTask(id) {
  const taskElement = document.querySelector(`[data-key='${id}']`);
  if (!taskElement) return;
  const taskElementInput = taskElement.querySelector(
    'input[type="text"]:last-of-type'
  );
  if (taskElementInput) {
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
      updateBorders();
    };

    taskElementInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveChanges();
      }
    });

    taskElementInput.addEventListener("blur", saveChanges);
  }
}

// Обработка кликов
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

// Загрузка задач при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromLocalStorage();
});
