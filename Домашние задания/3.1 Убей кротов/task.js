// Получаем элементы счётчиков
const deadCounter = document.getElementById('dead');
const lostCounter = document.getElementById('lost');

// Получаем лунки по индексу.
function getHole(index) {
  if (typeof window.baseGetHole === 'function') {
    return window.baseGetHole(index);
  }

  return document.getElementById(`hole${index}`);
}

// Сброс счётчиков
function resetGame() {
  deadCounter.textContent = '0';
  lostCounter.textContent = '0';
}

// Обработчики клика для всех 9 лунок
for (let i = 1; i <= 9; i++) {
  const hole = getHole(i);

  hole.onclick = function () {
    const isMole = hole.classList.contains('hole_has-mole');

    if (isMole) {
      // Попадание по кроту
      deadCounter.textContent = String(Number(deadCounter.textContent) + 1);

      if (Number(deadCounter.textContent) === 10) {
        alert('Победа! Вы убили 10 кротов.');
        resetGame();
      }
    } else {
      // Промах
      lostCounter.textContent = String(Number(lostCounter.textContent) + 1);

      if (Number(lostCounter.textContent) === 5) {
        alert('Вы проиграли! Слишком много промахов.');
        resetGame();
      }
    }
  };
}
