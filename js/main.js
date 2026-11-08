const gameField = document.querySelector('[data-spawn-area]');
const startBtn = document.querySelector('[data-action="start"]');
const restartBtn = document.querySelector('[data-action="restart"]');
const logo = document.querySelector('[data-ui="title"]');
const info = document.querySelector('[data-ui="info"]');
const timer = document.querySelector('[data-ui="timer"]');
const scoreUI = document.querySelector('[data-ui="score"]');
const overlay = document.querySelector('[data-ui="overlay"]');
const resultBackGround = document.querySelector('[data-ui="result"]');
const resultMessage = document.querySelector('[data-ui="message"]');

const game = {
  state: 'ready',
  layout: 'compact',
  remainingTimeSec: 30,
  score: 10,
  carrotCount: 10,
  bugCount: 4,
  timerId: null,
};

function resetGameData() {
  game.remainingTimeSec = 30;
  game.score = 10;
  game.carrotCount = 10;
  game.bugCount = 4;
}

function resetHUD() {
  scoreUI.textContent = `${game.score} / ${game.carrotCount}`;
  timer.textContent = formatTime(game.remainingTimeSec);
}

function initialiseGame() {
  resetGameData();
  resetHUD();
  gameField.replaceChildren();
  hideResult();
}

function startGame() {
  initialiseGame();

  game.state = 'playing';
  showHUD();

  createObjects('carrot', game.carrotCount);
  createObjects('bug', game.bugCount);

  startTimer();
  //4. 배경음악 시작하기
  playBGM();
}

function endGame(result) {
  game.state = result;
  stopTimer();
  //3. 배경음악 멈추기
  stopBGM();
  //4. 'won' or 'lost'효과음 내기
  playSound('won') || playSound('lost');
  //6. 효과음 내지 않기
  stopAllSounds();
  showResult(result);
}

function startTimer() {
  if (game.state === 'won' || game.state === 'lost') return;

  game.timerId = setInterval(() => {
    game.remainingTimeSec -= 1;
    timer.textContent = formatTime(game.remainingTimeSec);
    if (game.remainingTimeSec <= 0) {
      clearInterval(game.timerId);
      game.timerId = null;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(game.timerId);
  game.timerId = null;
}

function createObjects(types, counts) {
  for (let i = 0; i < counts; i++) {
    const object = document.createElement('img');
    object.setAttribute('src', `../assets/images/sprites/${types}.png`);
    object.setAttribute('alt', `${types}`);
    object.setAttribute('class', `${types}`);
    object.setAttribute('data-action', `${types}`);

    const random = setRandomPosition();
    object.style.top = `${random.y}px`;
    object.style.left = `${random.x}px`;

    gameField.append(object);
  }
}

function handleClickObjects(object) {
  if (game.state !== 'playing') return;

  switch (object.dataset.action) {
    case 'carrot':
      object.remove();
      game.score -= 1;
      scoreUI.textContent = `${game.score} / ${game.carrotCount}`;
      if (game.score === 0 && game.remainingTimeSec > 0) {
        endGame('won');
      }
      break;
    case 'bug':
      endGame('lost');
      break;
    default:
      throw new Error(`Unknown event target: ${object}`);
  }
}

function playBGM() {}

function stopBGM() {}

function playSound(type) {}

function stopAllSounds() {}

function setRandomPosition() {
  const fieldRect = gameField.getBoundingClientRect();
  const availableFieldWidth = Math.max(0, fieldRect.width - 55);
  const availableFieldHeight = Math.max(0, fieldRect.height - 55);

  const randomX = Math.random() * availableFieldWidth;
  const randomY = Math.random() * availableFieldHeight;

  return { x: randomX, y: randomY };
}

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return;

  const minutes = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secs % 60).toString().padStart(2, '0');

  const formatted = `${minutes} : ${seconds}`;

  return formatted;
}

function showHUD() {
  logo.classList.add('shrink');
  startBtn.classList.add('hidden');
  info.classList.remove('hidden');
}

function showResult(result) {
  overlay.classList.remove('hidden');

  switch (result) {
    case 'won':
      resultBackGround.style.backgroundImage =
        "url('assets/images/ui/result-frame-success.png')";
      resultMessage.textContent = 'All carrots collected!';
      break;
    case 'lost':
      resultBackGround.style.backgroundImage =
        "url('assets/images/ui/result-frame-failed.png')";
      resultMessage.textContent = 'Try again!';
      break;
    default:
      throw new Error(`Unknow result: ${result}`);
  }
}

function hideResult() {
  overlay.classList.add('hidden');
}

gameField.addEventListener('click', (e) => {
  if (e.target !== e.currentTarget) {
    handleClickObjects(e.target);
  }
});

// start, restart는 같은 로직을 공유한다. 이벤트를 발생을 줄이는 방법이 없을까?
startBtn.addEventListener('click', () => {
  startGame();
});

restartBtn.addEventListener('click', () => {
  startGame();
});
