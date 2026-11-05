const gameField = document.querySelector('[data-spawn-area]');
const startBtn = document.querySelector('[data-action="start"]');
const restartBtn = document.querySelector('[data-action="restart"]');
const logo = document.querySelector('[data-ui="title"]');
const info = document.querySelector('[data-ui="info"]');
const timer = document.querySelector('[data-ui="timer"]');

const game = {
  state: 'ready',
  layout: 'compact',
  remainingTimeSec: 3,
  carrotCount: 10,
  bugCount: 10,
  timerId: null,
};

function startGame() {
  //게임 초기화 로직도 작성하기
  //1. state를 playing로 전환
  game.state = 'playing';
  //2. 당근, 벌레 생성하기
  createObjects('carrot', game.carrotCount);
  createObjects('bug', game.bugCount);
  //3. 타이머 시작
  startTimer();
  //4. 배경음악 시작하기
  playBGM();
}

function endGame(result) {
  //'won', 'lost'공통 로직
  //1. game.state를  'won' or 'lost'
  //2. 타이머 중지하기
  stopTimer();
  //3. 배경음악 멈추기
  stopBGM();
  //4. 'won' or 'lost'효과음 내기
  playSound('won') || playSound('lost');
  //5. 당근, 벌레를 눌러도 동작하지 않게 하기
  //6. 효과음 내지 않기
  stopAllSounds();
}

function startTimer() {
  if (game.state === 'won' || game.state === 'lost') return;

  timer.textContent = formatTime(game.remainingTimeSec);

  game.timerId = setInterval(() => {
    game.remainingTimeSec -= 1;
    timer.textContent = formatTime(game.remainingTimeSec);
    if (game.remainingTimeSec <= 0) {
      clearInterval(game.timerId);
      game.timerId = null;
    }
  }, 1000);
}

function stopTimer() {}

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
  //game.state === playing일 때만 가능, 그 외는 동작하지 않게 하기.
  //1. 당근이면
  handleClickCarrot();
  //2. 벌레면
  handleClickBug();
}

function handleClickCarrot() {}

function handleClickBug() {
  //게임 즉시 종료
  endGame();
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

gameField.addEventListener('click', (e) => {
  handleClickObjects();
});

// start, restart는 같은 로직을 공유한다. 이벤트를 발생을 줄이는 방법이 없을까?
startBtn.addEventListener('click', () => {
  startGame();
  showHUD();
});

restartBtn.addEventListener('click', () => {
  startGame();
});
