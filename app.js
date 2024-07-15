const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const url = 'https://service.court.gov.by/ru/public/schedule/schedule';
const apiUrl = 'https://premcalc.onrender.com/sessions';

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function getFormattedDate() {
  return formatDate(new Date());
}

function getDatePlus30Days() {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  return formatDate(futureDate);
}

const courtsMap = {
  93: "Минский городской суд",
  94: "Суд Ленинского района г. Минска",
  95: "Суд Фрунзенского района г. Минска",
  96: "Суд Октябрьского района г. Минска",
  97: "Суд Центрального района г. Минска",
  98: "Суд Партизанского района г. Минска",
  99: "Суд Первомайского района г. Минска",
  100: "Суд Заводского района г. Минска",
  101: "Суд Советского района г. Минска",
  103: "Минский областной суд",
  115: "Суд Минского района" 
};

const potrebosses = [
  { name: "Асадчий Георгий Васильевич", courtId: 96 },
  { name: "Коваленок Елена Владимировна", courtId: 97 },
  { name: "Шамаль Надежда Владимировна", courtId: 101 },
  { name: "Ситникова Ольга Владимировна", courtId: 97 },
  { name: "Мигурская Ирина Александровна", courtId: 115 },
  { name: "Полат Алла Александровна", courtId: 98 },
  { name: "Кравченко Людмила Васильевна", courtId: 100 },
  { name: "Гурская Анна Викторовна", courtId: 96 },
  { name: "Бутько Дмитрий Викторович", courtId: 99 },
  { name: "Шлендер Елена Николаевна", courtId: 101 },
  { name: "Радина Ирина Эдуардовна", courtId: 99 },
  { name: "Симоненко Павел Васильевич", courtId: 94 },
  { name: "Бойков Александр Васильевич", courtId: 95 },
  { name: "Бурдо Никита Владимирович", courtId: 97 },
  { name: "Бурый Алексей Витальевич", courtId: 97 },
  { name: "Зингаров Игорь Святославович", courtId: 93 },
  { name: "Бурдо Никита Владимирович", courtId: 97 },
  { name: "Бурко Ирина Борисовна", courtId: 100 },
];

async function fetchCourtData(name, courtId) {
  const data = {
    t: `${Date.now()}`,
    CourtId: courtId,
    time: `${Date.now() - 2}`,
    RecaptchaResponse: '',
    StartDate: getFormattedDate(),
    EndDate: getDatePlus30Days(),
    Name: name
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://service.court.gov.by/',
      'Origin': 'https://service.court.gov.by',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: new URLSearchParams(data).toString()
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const rows = document.querySelectorAll('tbody tr');
    const cases = [];

    rows.forEach(row => {
      const caseDetails = {
        name: row.children[6].textContent.trim(),
        date: row.children[1].textContent.trim(),
        time: row.children[2].textContent.trim(),
        courtRoom: row.children[3].textContent.trim(),
        liabelee: row.children[7].textContent.trim(),
        judge: row.children[8].textContent.trim(),
        type: row.children[5].textContent.trim(),
        court: courtsMap[courtId]
      };

      cases.push(caseDetails);
    });

    return cases;
  } catch (error) {
    console.error('Error fetching court data:', error);
    return [];
  }
}

function parseDateAndTime(dateStr, timeStr) {
  const [day, month, year] = dateStr.split('.').map(Number);
  const [hours, minutes] = timeStr.split('.').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}


async function main() {
  const allCases = [];

  for (const potreboss of potrebosses) {
    const cases = await fetchCourtData(potreboss.name, potreboss.courtId);
    allCases.push(...cases);
  }

  allCases.sort((a, b) => {
    const dateA = parseDateAndTime(a.date, a.time);
    const dateB = parseDateAndTime(b.date, b.time);
    return dateA - dateB;
  })

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(allCases)
    });

    if (!response.ok) {
      throw new Error(`Failed to send data: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Successfully sent cases to the server:', result);
  } catch (error) {
    console.error('Error sending cases to the server:', error);
  }
}

main();
