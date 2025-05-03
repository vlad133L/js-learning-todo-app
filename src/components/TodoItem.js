export class TodoItem {
  #taskText;
  #checked;
  #id;

  constructor(taskText, checked = false) {
    this.#taskText = taskText;
    this.#checked = checked;
    this.#id = Math.floor(Math.random() * 1e8);
  }

  get taskText() {
    return this.#taskText;
  }

  set taskText(value) {
    this.#taskText = value;
  }

  get checked() {
    return this.#checked;
  }

  set checked(value) {
    this.#checked = value;
  }

  get id() {
    return this.#id;
  }

  toJSON() {
    return {
      taskText: this.#taskText,
      checked: this.#checked,
      id: this.#id,
    };
  }

  static fromJSON(obj) {
    return new TodoItem(obj.taskText, obj.checked, obj.id);
  }
}
