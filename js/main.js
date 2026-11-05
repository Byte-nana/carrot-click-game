const gameField = document.querySelector('[data-spawn-area]');
const startBtn = document.querySelector('[data-action="start"]');
const restartBtn = document.querySelector('[data-action="restart"]');

const game = {
  state: 'ready',
  layout: 'compact',
  remainingTimeSec: 30,
  carrotCount: 10,
  bugCount: 10,
  timerId: null,
};

function startGame() {
  //게임 초기화 로직도 작성하기
  //1. state를 playing로 전환
  game.state = 'playing';
  //2. 당근, 벌레 생성하기
  createCarrots(game.carrotCount);
  createBugs(game.bugCount);
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
  //1. game.state === playing일때만 동작
  //2. game.state === 'wond || 'lost'면 동작하지 않고 그대로 멈춘다.
  //3. 포맷은 MM:SS (기본시간은 30초지만 60초가 넘어가면 MM자리에 오도록 포맷 만들기)
}

function stopTimer() {}

function createCarrots(counts) {
  for (let i = 0; i < counts; i++) {
    const carrot = document.createElement('img');
    carrot.setAttribute('src', '../assets/images/sprites/carrot.png');
    carrot.setAttribute('alt', 'carrot');
    carrot.setAttribute('class', 'carrot');
    carrot.setAttribute('data-action', 'carrot');

    const random = setRandomPosition();
    carrot.style.top = `${random.y}px`;
    carrot.style.left = `${random.x}px`;

    gameField.append(carrot);
  }
}

function createBugs(counts) {
  for (let i = 0; i < counts; i++) {
    const bug = document.createElement('img');
    bug.setAttribute('src', '../assets/images/sprites/bug.png');
    bug.setAttribute('alt', 'bug');
    bug.setAttribute('class', 'bug');
    bug.setAttribute('data-action', 'bug');

    const random = setRandomPosition();
    bug.style.transform = `translate(${random.x}px, ${random.y}px)`;

    gameField.append(bug);
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

gameField.addEventListener('click', (e) => {
  handleClickObjects();
});

// start, restart는 같은 로직을 공유한다. 이벤트를 발생을 줄이는 방법이 없을까?
startBtn.addEventListener('click', () => {
  startGame();
  console.log(game.state);
});

restartBtn.addEventListener('click', () => {
  startGame();
});
