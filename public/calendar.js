const months = [
"January",
"February",
"March",
"April",
"May",
"June"
];

let currentMonthIndex = 0;


/* ---------- LOAD MONTH ---------- */

async function loadCalendar(month){

  const res = await fetch(`/calendar/${month}`);
  const days = await res.json();

  const container = document.getElementById("calendar");
  const title = document.getElementById("monthTitle");

  title.innerText = month + " 2026";

  container.innerHTML = "";

  days.forEach(day => {

    const card = document.createElement("div");

    card.className = "calendar-card";

    let info = "";

    if(day.holiday){

      info = day.holiday;
      card.classList.add("holiday");

    }

    else if(day.event){

      info = day.event;
      card.classList.add("event");

    }

    else if(day.dayOrder){

      info = "Day Order " + day.dayOrder;
      card.classList.add("dayorder");

    }

    card.innerHTML = `
      <div class="date">${day.date.split("-")[2]}</div>
      <div class="day">${day.day}</div>
      <div class="info">${info}</div>
    `;

    container.appendChild(card);

  });

}


/* ---------- NAVIGATION ---------- */

function nextMonth(){

  if(currentMonthIndex < months.length-1){
    currentMonthIndex++;
    loadCalendar(months[currentMonthIndex]);
  }

}

function prevMonth(){

  if(currentMonthIndex > 0){
    currentMonthIndex--;
    loadCalendar(months[currentMonthIndex]);
  }

}


/* ---------- INITIAL LOAD ---------- */

loadCalendar(months[currentMonthIndex]);