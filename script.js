const PLANET_COLORS = [
  '#ff6b6b', '#feca57', '#1dd1a1', '#54a0ff',
  '#ff9ff3', '#5f27cd', '#00d2d3', '#ff9f43'
];

const DEFAULT_CONTROLS = {
  direction: 'row',
  justify: 'flex-start',
  align: 'flex-start',
  wrap: 'nowrap'
};

const LEVELS = [
  {
    instruction: 'סדרו את כוכבי הלכת בשורה אחת, כשהראשון צמוד לקצה השמאלי והאחרון לקצה הימני של הלוח, עם רווחים שווים ביניהם. מרכזו אותם לגובה הלוח.',
    itemCount: 4,
    itemSize: 55,
    target: { direction: 'row', justify: 'space-between', align: 'center', wrap: 'nowrap' }
  },
  {
    instruction: 'סדרו את כוכבי הלכת בעמודה אחת, צמודים לחלק העליון של הלוח, וממורכזים לרוחב הלוח.',
    itemCount: 4,
    itemSize: 55,
    target: { direction: 'column', justify: 'flex-start', align: 'center', wrap: 'nowrap' }
  },
  {
    instruction: 'סדרו את כוכבי הלכת בשורה אחת, ממורכזים לרוחב הלוח, כשכולם צמודים לתחתית הלוח.',
    itemCount: 4,
    itemSize: 55,
    target: { direction: 'row', justify: 'center', align: 'flex-end', wrap: 'nowrap' }
  },
  {
    instruction: 'סדרו את כוכבי הלכת בעמודה אחת הצמודה לצד הימני של הלוח, עם מרווח שווה סביב כל כוכב (כולל למעלה ולמטה).',
    itemCount: 4,
    itemSize: 55,
    target: { direction: 'column', justify: 'space-around', align: 'flex-end', wrap: 'nowrap' }
  },
  {
    instruction: 'יש כאן יותר מדי כוכבי לכת לשורה אחת! גרמו לעודפים לעטוף לשורה נוספת, וסדרו את כולם צמודים לפינה השמאלית העליונה של הלוח.',
    itemCount: 8,
    itemSize: 70,
    target: { direction: 'row', justify: 'flex-start', align: 'flex-start', wrap: 'wrap' }
  },
  {
    instruction: 'סדרו את כוכבי הלכת בשורה אחת עם מרווח שווה לגמרי בין כולם וגם בין הקצוות ללוח. מקמו אותם בחלק העליון של הלוח.',
    itemCount: 4,
    itemSize: 55,
    target: { direction: 'row', justify: 'space-evenly', align: 'flex-start', wrap: 'nowrap' }
  },
  {
    instruction: 'סדרו את כוכבי הלכת בעמודה אחת, ומרכזו את כל הקבוצה גם לגובה וגם לרוחב הלוח.',
    itemCount: 4,
    itemSize: 55,
    target: { direction: 'column', justify: 'center', align: 'center', wrap: 'nowrap' }
  },
  {
    instruction: 'יש כאן יותר מדי כוכבי לכת לעמודה אחת! אפשרו להם לעטוף לעמודה נוספת, ומרכזו את כל הקבוצה בלוח.',
    itemCount: 6,
    itemSize: 90,
    itemWidth: 65,
    target: { direction: 'column', justify: 'center', align: 'center', wrap: 'wrap' }
  }
];

let state = {
  current: 0,
  attempts: {},
  completed: [],
  score: 0
};

const boardEl = document.getElementById('board');
const instructionEl = document.getElementById('instruction');
const progressEl = document.getElementById('level-progress');
const scoreEl = document.getElementById('score-display');
const dotsEl = document.getElementById('level-dots');
const attemptsEl = document.getElementById('attempts');
const feedbackEl = document.getElementById('feedback');

const ctrlDirection = document.getElementById('ctrl-direction');
const ctrlJustify = document.getElementById('ctrl-justify');
const ctrlAlign = document.getElementById('ctrl-align');
const ctrlWrap = document.getElementById('ctrl-wrap');

const btnCheck = document.getElementById('btn-check');
const btnReset = document.getElementById('btn-reset');

function saveProgress() {
  try {
    localStorage.setItem('flexGameProgress', JSON.stringify({
      completed: state.completed,
      score: state.score
    }));
  } catch (e) {
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem('flexGameProgress');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.completed)) {
        state.completed = parsed.completed;
      }
      if (typeof parsed.score === 'number') {
        state.score = parsed.score;
      }
    }
  } catch (e) {
  }
}

function renderBoardItems(level) {
  boardEl.innerHTML = '';
  const size = level.itemSize;
  const width = level.itemWidth || size;

  for (let i = 0; i < level.itemCount; i++) {
    const planet = document.createElement('div');
    planet.className = 'planet';
    planet.style.width = width + 'px';
    planet.style.height = size + 'px';
    planet.style.setProperty('--planet-color', PLANET_COLORS[i % PLANET_COLORS.length]);
    planet.textContent = i + 1;
    boardEl.appendChild(planet);
  }
}

function applyControlsToBoard() {
  boardEl.style.flexDirection = ctrlDirection.value;
  boardEl.style.justifyContent = ctrlJustify.value;
  boardEl.style.alignItems = ctrlAlign.value;
  boardEl.style.flexWrap = ctrlWrap.value;
}

function setControlsToDefault() {
  ctrlDirection.value = DEFAULT_CONTROLS.direction;
  ctrlJustify.value = DEFAULT_CONTROLS.justify;
  ctrlAlign.value = DEFAULT_CONTROLS.align;
  ctrlWrap.value = DEFAULT_CONTROLS.wrap;
  applyControlsToBoard();
}

function renderDots() {
  dotsEl.innerHTML = '';
  LEVELS.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'level-dot';
    dot.setAttribute('aria-label', 'שלב ' + (index + 1));

    if (index === state.current) {
      dot.classList.add('is-current');
    } else if (state.completed.includes(index)) {
      dot.classList.add('is-completed');
      dot.addEventListener('click', () => loadLevel(index));
    }

    dotsEl.appendChild(dot);
  });
}

function updateProgressUI() {
  progressEl.textContent = 'שלב ' + (state.current + 1) + ' מתוך ' + LEVELS.length;
  scoreEl.textContent = 'ניקוד: ' + state.score;
  renderDots();
}

function clearFeedback() {
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

function loadLevel(index) {
  state.current = index;
  const level = LEVELS[index];

  instructionEl.textContent = level.instruction;
  if (!state.attempts[index]) state.attempts[index] = 0;
  attemptsEl.textContent = 'נסיונות בשלב זה: ' + state.attempts[index];

  renderBoardItems(level);
  setControlsToDefault();
  clearFeedback();
  updateProgressUI();
}

function goToNextLevel() {
  if (state.current < LEVELS.length - 1) {
    loadLevel(state.current + 1);
  } else {
    feedbackEl.textContent = 'כל הכבוד! השלמתם את כל השלבים! 🎉';
    feedbackEl.className = 'feedback success';
  }
}

function checkSolution() {
  const level = LEVELS[state.current];
  const target = level.target;

  state.attempts[state.current] = (state.attempts[state.current] || 0) + 1;
  attemptsEl.textContent = 'נסיונות בשלב זה: ' + state.attempts[state.current];

  const isCorrect =
    ctrlDirection.value === target.direction &&
    ctrlJustify.value === target.justify &&
    ctrlAlign.value === target.align &&
    ctrlWrap.value === target.wrap;

  if (isCorrect) {
    feedbackEl.textContent = 'מצוין! הפתרון נכון 🎉';
    feedbackEl.className = 'feedback success';

    const planets = boardEl.querySelectorAll('.planet');
    planets.forEach((p, i) => {
      setTimeout(() => {
        p.classList.add('celebrate');
        p.addEventListener('animationend', () => p.classList.remove('celebrate'), { once: true });
      }, i * 60);
    });

    if (!state.completed.includes(state.current)) {
      const attemptsUsed = state.attempts[state.current];
      const points = attemptsUsed === 1 ? 3 : (attemptsUsed <= 3 ? 2 : 1);
      state.score += points;
      state.completed.push(state.current);
      saveProgress();
    }

    updateProgressUI();

    setTimeout(() => {
      goToNextLevel();
    }, 1200);
  } else {
    feedbackEl.textContent = 'עדיין לא מדויק, נסו שוב.';
    feedbackEl.className = 'feedback error';

    boardEl.classList.add('shake');
    boardEl.addEventListener('animationend', () => boardEl.classList.remove('shake'), { once: true });
  }
}

function resetLevel() {
  setControlsToDefault();
  clearFeedback();
}

ctrlDirection.addEventListener('change', applyControlsToBoard);
ctrlJustify.addEventListener('change', applyControlsToBoard);
ctrlAlign.addEventListener('change', applyControlsToBoard);
ctrlWrap.addEventListener('change', applyControlsToBoard);

btnCheck.addEventListener('click', checkSolution);
btnReset.addEventListener('click', resetLevel);

loadProgress();
loadLevel(0);