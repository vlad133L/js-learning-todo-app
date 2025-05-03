import {
  taskIcons,
  themeIcons,
  THEMES,
  SELECTORS,
  FILTER_OPTIONS,
  TIMER_DURATION,
} from "./constants.js";
import { debounce } from "./utils/debounce.js";
import { TodoService } from "./components/TodoService.js";
import { LocalStorageService } from "./services/LocalStorageService.js";
import { TodoItem } from "./components/TodoItem.js";
import { startTimer, stopTimer } from "./utils/timer.js";

export class App {
  #todoService = new TodoService(new LocalStorageService());
  #deletedTask = null;
  #deletionTimeout = null;

  #container = document.querySelector(SELECTORS.CONTAINER);
  #themeToggleButton = document.querySelector(SELECTORS.THEME_TOGGLE);
  #emptySection = document.querySelector(SELECTORS.EMPTY_SECTION);
  #addTaskButton = document.querySelector(SELECTORS.ADD_TASK_BUTTON);
  #modal = document.querySelector(SELECTORS.MODAL);
  #searchInput = document.querySelector(SELECTORS.SEARCH_INPUT);
  #selectFilter = document.querySelector(SELECTORS.SELECT_FILTER);
  #tasksSection = document.querySelector(SELECTORS.TASKS_SECTION);
  #undoButton = document.querySelector(SELECTORS.UNDO_BUTTON);
  #modalInput = document.querySelector(SELECTORS.MODAL_INPUT);
  #tasksList = document.createElement("ul");

  constructor() {
    if (!this.#container) throw new Error("Container not found");

    this.#initElements();
    this.#bindEvents();
    this.#renderTasks();
  }

  #initElements() {
    this.#tasksList.classList.add("tasks-section__list");
    this.#tasksSection.appendChild(this.#tasksList);
  }

  #bindEvents() {
    this.#themeToggleButton.addEventListener("click", () =>
      this.#toggleTheme()
    );
    this.#selectFilter.addEventListener("change", (e) =>
      this.#filterTasks(e.target.value)
    );
    this.#addTaskButton.addEventListener("click", () => this.#showModal());

    this.#modal.addEventListener("click", (e) => {
      if (e.target.closest(".modal__buttons-apply")) this.#addTaskToList();
      if (e.target.closest(".modal__buttons-cancel")) this.#closeModal();
    });

    this.#modalInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.#addTaskToList();
      }
    });

    this.#searchInput.addEventListener(
      "input",
      debounce((e) => this.#handleSearchInput(e), 300)
    );
    this.#tasksList.addEventListener("click", (e) => this.#handleTaskAction(e));
    this.#undoButton.addEventListener("click", () => {
      this.#undoDelete();
      this.#updateTaskBorders();
    });
  }

  #handleTaskAction(e) {
    const taskEl = e.target.closest(".list-item");
    if (!taskEl) return;

    const id = parseInt(taskEl.dataset.key);
    if (e.target.classList.contains("list-item__checkbox")) {
      this.#completeTask(id);
    } else if (e.target.closest(".delete-button")) {
      this.#deleteTask(id);
    } else if (e.target.closest(".edit-button")) {
      this.#editTask(id);
    }
  }

  #renderTasks() {
    this.#tasksList.innerHTML = "";
    const tasks = this.#todoService.loadTasksFromLocalStorage();

    // Исключаем задачу в процессе удаления
    const tasksToRender = this.#deletedTask
      ? tasks.filter((task) => task.id !== this.#deletedTask.id)
      : tasks;

    if (tasksToRender.length === 0) {
      this.#emptySection.style.display = "flex";
      this.#tasksList.style.display = "none";
      return;
    }

    tasksToRender.forEach((item) => {
      this.#tasksList.appendChild(this.#createTodoItemElement(item));
    });

    this.#emptySection.style.display = "none";
    this.#tasksList.style.display = "block";
    this.#filterTasks(this.#selectFilter.value);
  }

  #createTodoItemElement(todoItem) {
    const li = document.createElement("li");
    li.className = "tasks-section__list-item list-item";
    li.dataset.key = todoItem.id;

    li.innerHTML = `
      <input id="${todoItem.id}" type="checkbox" ${
      todoItem.checked ? "checked" : ""
    } />
      <label for="${todoItem.id}" class="list-item__checkbox"></label>
      <input type="text" class="list-item__text" value="${
        todoItem.taskText
      }" readonly />
      <div class="list-item__buttons">
        <button class="edit-button">${taskIcons.editIcon}</button>
        <button class="delete-button">${taskIcons.deleteIcon}</button>
      </div>
    `;

    if (todoItem.checked) li.classList.add("done");
    return li;
  }

  #addTaskToList() {
    const taskText = this.#modalInput.value.trim();
    if (!taskText) return alert("Type something");

    const newItem = new TodoItem(taskText, false);
    this.#todoService.save(newItem);
    this.#renderTasks();
    this.#closeModal();
  }

  #completeTask(id) {
    this.#todoService.toggleTaskCompletion(id);
    this.#renderTasks();
  }

  #deleteTask(id) {
    const tasks = this.#todoService.loadTasksFromLocalStorage();
    const taskToDelete = tasks.find((task) => task.id === id);

    if (!taskToDelete) return;

    // Сохраняем задачу для возможного восстановления
    this.#deletedTask = {
      id,
      task: taskToDelete,
      element: this.#tasksList.querySelector(`[data-key="${id}"]`),
    };

    // Сразу удаляем из localStorage
    this.#todoService.deleteTask(id);

    // Скрываем элемент визуально
    if (this.#deletedTask.element) {
      this.#deletedTask.element.style.display = "none";
    }

    this.#showUndoButton();
    this.#setDeleteButtonsDisabled(true);

    // Очищаем предыдущий таймер
    if (this.#deletionTimeout) {
      stopTimer(this.#deletionTimeout);
    }

    // Запускаем новый таймер
    this.#deletionTimeout = startTimer(() => {
      // Полностью удаляем задачу после таймера
      this.#deletedTask = null;
      this.#renderTasks(); // Перерисовываем список
      this.#hideUndoButton();
      this.#setDeleteButtonsDisabled(false);
    });
  }
  #undoDelete() {
    if (!this.#deletedTask) return;

    // Останавливаем таймер
    stopTimer(this.#deletionTimeout);
    this.#deletionTimeout = null;

    // Восстанавливаем задачу в localStorage
    this.#todoService.save(this.#deletedTask.task);

    // Полностью перерисовываем список
    this.#deletedTask = null;
    this.#renderTasks();

    // Обновляем UI
    this.#hideUndoButton();
    this.#setDeleteButtonsDisabled(false);
  }

  #editTask(id) {
    const taskEl = this.#tasksList.querySelector(`[data-key="${id}"]`);
    const input = taskEl.querySelector(".list-item__text");
    const button = taskEl.querySelector(".edit-button");

    if (!input || !button) return;

    if (input.readOnly) {
      input.readOnly = false;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      button.innerHTML = "Save";

      const saveHandler = () => {
        const updatedText = input.value.trim() || "Type something...";
        this.#todoService.updateTask(id, updatedText);
        input.readOnly = true;
        button.innerHTML = taskIcons.editIcon;
        this.#filterTasks(this.#selectFilter.value);
        this.#updateTaskBorders();
      };

      input.addEventListener(
        "keypress",
        (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            saveHandler();
          }
        },
        { once: true }
      );

      button.addEventListener("click", saveHandler, { once: true });
    }
  }

  #showModal() {
    this.#modal.style.display = "block";
    this.#container.classList.add("modal-open");

    if (this.#container.classList.contains("dark")) {
      document.querySelector(SELECTORS.MODAL_MAIN)?.classList.add("dark");
      this.#modalInput.classList.add("dark");
    }
    this.#updateTaskBorders();
  }

  #closeModal() {
    this.#modal.style.display = "none";
    this.#container.classList.remove("modal-open");
    this.#modalInput.value = "";
  }

  #toggleTheme() {
    this.#container.classList.toggle("dark");
    const isDark = this.#container.classList.contains("dark");
    const theme = isDark ? THEMES.dark : THEMES.light;
    const [img, text] = this.#emptySection.children;

    img.src = theme.emptyImageSrc;
    text.style.color = theme.textColor;
    this.#themeToggleButton.innerHTML = theme.icon;
    this.#searchInput.classList.toggle("dark", isDark);
  }

  #filterTasks(filter) {
    Array.from(this.#tasksList.children).forEach((task) => {
      const isChecked = task.querySelector('input[type="checkbox"]').checked;
      let show = false;

      switch (filter) {
        case FILTER_OPTIONS.ALL:
          show = true;
          break;
        case FILTER_OPTIONS.COMPLETE:
          show = isChecked;
          break;
        case FILTER_OPTIONS.INCOMPLETE:
          show = !isChecked;
          break;
      }

      task.style.display = show ? "flex" : "none";
    });

    this.#updateTaskBorders();
  }

  #handleSearchInput(e) {
    const value = e.target.value.trim().toLowerCase();
    const filter = this.#selectFilter.value;

    Array.from(this.#tasksList.children).forEach((task) => {
      const text = task
        .querySelector(".list-item__text")
        .value.trim()
        .toLowerCase();
      const checked = task.querySelector('input[type="checkbox"]').checked;

      const matchesSearch = text.startsWith(value);
      const matchesFilter =
        filter === FILTER_OPTIONS.ALL ||
        (filter === FILTER_OPTIONS.COMPLETE && checked) ||
        (filter === FILTER_OPTIONS.INCOMPLETE && !checked);

      task.style.display = matchesSearch && matchesFilter ? "flex" : "none";
    });

    this.#updateTaskBorders();
  }

  #toggleTasksView() {
    const isEmpty = this.#todoService.loadTasksFromLocalStorage().length === 0;
    this.#emptySection.style.display = isEmpty ? "flex" : "none";
    this.#tasksList.style.display = isEmpty ? "none" : "block";
  }

  #setDeleteButtonsDisabled(disabled) {
    this.#tasksList.querySelectorAll(".delete-button").forEach((btn) => {
      if (btn !== this.#deletedTask?.element?.querySelector(".delete-button")) {
        btn.disabled = disabled;
      }
    });
  }

  #showUndoButton() {
    this.#undoButton.style.display = "flex";
  }

  #hideUndoButton() {
    this.#undoButton.style.display = "none";
  }

  #updateTaskBorders() {
    const visibleTasks = Array.from(this.#tasksList.children).filter(
      (task) => task.style.display !== "none"
    );
    visibleTasks.forEach((task, index) => {
      task.style.borderBottom =
        index === visibleTasks.length - 1
          ? "none"
          : "1px solid var(--primary-color)";
    });
  }
}

new App();
