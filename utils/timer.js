export function startTimer(callback, duration = 3) {
  let remainingTime = duration;
  let timerInterval = null;

  const timerElement = document.querySelector(".undo-button .timer");
  const timerCircle = document.querySelector(
    ".undo-button .timer-circle circle"
  );
  if (!timerElement || !timerCircle) return;
  // reset animation
  timerCircle.style.animation = "none";
  timerCircle.offsetHeight;
  timerCircle.style.animation = null;
  // update timer
  timerElement.textContent = remainingTime;

  timerInterval = setInterval(() => {
    remainingTime--;
    timerElement.textContent = remainingTime;

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      if (callback) callback();
    }
  }, 1000);

  return timerInterval;
}
