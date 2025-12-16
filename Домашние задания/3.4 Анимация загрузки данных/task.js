
const loader = document.getElementById('loader');
const itemsContainer = document.getElementById('items');
const DATA_URL =
  'https://students.netoservices.ru/nestjs-backend/slow-get-courses';
const STORAGE_KEY = 'currencyRatesCache';

const cachedRates = getCachedRates();
if (cachedRates) {
  renderRates(cachedRates);
}

loadRates();

function loadRates() {
  showLoader();

  const xhr = new XMLHttpRequest();
  xhr.open('GET', DATA_URL);

  xhr.addEventListener('load', () => {
    if (xhr.status !== 200) {
      console.error('Не удалось загрузить курс валют');
      return;
    }

    try {
      const data = JSON.parse(xhr.responseText);
      const valutes = data?.response?.Valute;

      if (!valutes) {
        console.error('Некорректные данные курса валют');
        return;
      }

      renderRates(valutes);
      cacheRates(valutes);
    } catch (e) {
      console.error('Ошибка обработки ответа', e);
    }
  });

  xhr.addEventListener('error', () =>
    console.error('Ошибка сети при загрузке курса валют')
  );

  xhr.addEventListener('loadend', hideLoader);
  xhr.send();
}

function renderRates(valutes) {
  if (!itemsContainer) {
    return;
  }

  const values = Array.isArray(valutes) ? valutes : Object.values(valutes);

  itemsContainer.innerHTML = '';

  values.forEach((valute) => {
    const item = document.createElement('div');
    item.className = 'item';

    const code = document.createElement('div');
    code.className = 'item__code';
    code.textContent = valute.CharCode;

    const value = document.createElement('div');
    value.className = 'item__value';
    value.textContent = valute.Value;

    const currency = document.createElement('div');
    currency.className = 'item__currency';
    currency.textContent = 'руб.';

    item.append(code, value, currency);
    itemsContainer.appendChild(item);
  });
}

function cacheRates(valutes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valutes));
  } catch (e) {
    console.warn('Не удалось сохранить данные', e);
  }
}

function getCachedRates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn('Не удалось прочитать данные из localStorage', e);
    return null;
  }
}

function showLoader() {
  loader?.classList.add('loader_active');
}

function hideLoader() {
  loader?.classList.remove('loader_active');
}
