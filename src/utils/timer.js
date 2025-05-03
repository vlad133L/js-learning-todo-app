import { TIMER_DURATION } from "../constants.js";

export function startTimer(callback) {
  const timer = document.querySelector(".undo-button .timer");
  const circle = document.querySelector(".undo-button .timer-circle circle");
  if (!timer || !circle) return;

  let time = TIMER_DURATION / 1000;
  timer.textContent = time;
  const interval = setInterval(() => {
    timer.textContent = --time;
    if (time <= 0) {
      clearInterval(interval);
      callback?.();
    }
  }, 1000);
  return interval;
}

export function stopTimer(interval) {
  if (interval) {
    clearInterval(interval);
  }
}
