const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const url = 'https://service.court.gov.by/ru/public/schedule/schedule';

const courtsMap = [
    {"Минский городской суд": 93},
    {"Суд Ленинского района г. Минска": 94},
    {"Суд Фрунзенского района г. Минска": 95},
    {"Суд Октябрьского района г. Минска": 96},
    {"Суд Центрального района г. Минска": 97},
    {"Суд Партизанского района г. Минска": 98},
    {"Суд Первомайского района г. Минска": 99},
    {"Суд Заводского района г. Минска": 100},
    {"Суд Советского района г. Минска": 101},
    {"Минский областной суд": 103},
    {"Суд Минского района": 103},
   ]


  const potrebosses = [
    {
    name: "Асадчий Георгий Васильевич",
    courtId: 96
    },
    {
      name: "Коваленок Елена Владимировна",
      courtId: 97
    },
    {
      name: "Шамаль Надежда Владимировна",
      courtId: 101
    },
    {
      name: "Ситникова Ольга Владимировна",
      courtId: 97
    },
    {
      name: "Мигурская Ирина Александровна",
      courtId: 115
    },
    {
      name: "Полат Алла Александровна",
      courtId: 98
    },
    {
      name: "Кравченко Людмила Васильевна",
      courtId: 100
    },
    {
      name: "Гурская Анна Викторовна",
      courtId: 96
    },
    {
      name: "Бутько Дмитрий Викторович",
      courtId: 99
    },
    {
      name: "Шлендер Елена Николаевна",
      courtId: 101
    },
    {
      name: "Радина Ирина Эдуардовна",
      courtId: 99
    },
    {
      name: "Симоненко Павел Васильевич",
      courtId: 94
    },
    {
      name: "Бойков Александр Васильевич",
      courtId: 95
    },
    {
      name: "Бурдо Никита Владимирович",
      courtId: 97
    },
    {
      name: "Бурый Алексей Витальевич",
      courtId: 97
    },
    {
      name: "Зингаров Игорь Святославович",
      courtId: 93
    },
    {
      name: "Бурдо Никита Владимирович",
      courtId: 97
    },
]

const data = {
  t: '1720781927956',
  CourtId: '99',
  time: '1720781931745',
  RecaptchaResponse: '',
  StartDate: '12.07.2024',
  EndDate: '31.07.2024',
  Name: 'Городское общество защиты потребителей'
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

fetch(url, options)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(html => {
    // Use JSDOM to parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Select all rows containing case details
    const rows = document.querySelectorAll('tbody tr');

    // Initialize an array to hold all case details
    const cases = [];

    // Loop through each row and extract the case details
    rows.forEach(row => {
      const name = row.children[6].textContent.trim();
      const date = row.children[1].textContent.trim();
      const time = row.children[2].textContent.trim();
      const courtRoom = row.children[3].textContent.trim();
      const liabelee = row.children[7].textContent.trim();
      const judge = row.children[8].textContent.trim();
      const type = row.children[5].textContent.trim();

      // Create a JavaScript object with the extracted data
      const caseDetails = {
        name,
        date,
        time,
        courtRoom,
        liabelee,
        judge,
        type
      };

      // Add the case details object to the array
      cases.push(caseDetails);
    });

    // Log the result to the console
    console.log(cases);
  })
  .catch(error => {
    console.error('Error:', error);
  });
