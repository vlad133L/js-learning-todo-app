import { TodoItem } from "./TodoItem.js";

export class TodoService {
  constructor(localStorageService) {
    this.localStorageService = localStorageService;
  }

  save(item) {
    const tasks = this.loadTasksFromLocalStorage();
    tasks.push(item);
    this.localStorageService.save(tasks);
    return item;
  }

  loadTasksFromLocalStorage() {
    const storedTasks = this.localStorageService.load();
    return storedTasks
      ? storedTasks.map((task) => TodoItem.fromJSON(task))
      : [];
  }

  deleteTask(id) {
    const tasks = this.loadTasksFromLocalStorage();
    const updatedTasks = tasks.filter((task) => task.id !== id);
    this.localStorageService.save(updatedTasks);
  }

  updateTask(id, newText) {
    const tasks = this.loadTasksFromLocalStorage();
    const task = tasks.find((item) => item.id === id);
    if (task) {
      task.taskText = newText;
      this.localStorageService.save(tasks);
    }
  }

  toggleTaskCompletion(id) {
    const tasks = this.loadTasksFromLocalStorage();
    const task = tasks.find((item) => item.id === id);
    if (task) {
      task.checked = !task.checked;
      this.localStorageService.save(tasks);
    }
  }
}
