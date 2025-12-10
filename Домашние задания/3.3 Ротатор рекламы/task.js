const rotators = document.querySelectorAll('.rotator');

rotators.forEach((rotator) => {
  const cases = Array.from(rotator.querySelectorAll('.rotator__case'));

  // Стартовый индекс (у кого есть класс rotator__case_active)
  let activeIndex = cases.findIndex((el) =>
    el.classList.contains('rotator__case_active')
  );

  if (activeIndex === -1) {
    activeIndex = 0;
    cases[0].classList.add('rotator__case_active');
  }

  // Функция активации очередного слайда
  function activateCase(index) {
    // снимаем активность со всех
    cases.forEach((el) => el.classList.remove('rotator__case_active'));

    const current = cases[index];
    current.classList.add('rotator__case_active');

    const color = current.dataset.color;
    if (color) {
      current.style.color = color;
    }

    // скорость показа текущего слайда
    let speed = parseInt(current.dataset.speed, 10);
    if (Number.isNaN(speed) || speed <= 0) {
      speed = 1000;
    }

    // Я немного не понял как надо, так как в ридми говорится и о секунде в том числе. Вот реализация, если показываем по  одинаковому таймингу: const speed = 1000; setTimeout(() => activateCase(nextIndex), speed);//

    // планируем показ следующего слайда
    const nextIndex = (index + 1) % cases.length;
    setTimeout(() => activateCase(nextIndex), speed);
  }

  // Бесконечный цикл переключения
  activateCase(activeIndex);
});
