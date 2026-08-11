const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const selectedDateText = document.getElementById("selectedDateText");
const timeSelect = document.getElementById("time");
const nameInput = document.getElementById("name");
const eventType = document.getElementById("eventType");
const bookButton = document.getElementById("bookButton");
const message = document.getElementById("message");

let currentDate = new Date();
let selectedDate = null;

// Change these times to whatever you want.
const availableTimes = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00"
];

function getToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function displayDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function isPastDate(date) {
  return date < getToday();
}

function getBookings() {
  return JSON.parse(
    localStorage.getItem("eventBookings") || "[]"
  );
}

function saveBooking(booking) {
  const bookings = getBookings();

  bookings.push(booking);

  localStorage.setItem(
    "eventBookings",
    JSON.stringify(bookings)
  );
}

function isTimeBooked(date, time) {
  const bookings = getBookings();

  return bookings.some(
    booking =>
      booking.date === formatDate(date) &&
      booking.time === time
  );
}

function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = currentDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric"
    }
  );

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // Empty cells before the first day.
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");

    empty.className = "day empty";

    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    date.setHours(0, 0, 0, 0);

    const button = document.createElement("button");

    button.className = "day";
    button.textContent = day;

    if (isPastDate(date)) {
      button.classList.add("disabled");
      button.disabled = true;
    }

    const today = getToday();

    if (date.getTime() === today.getTime()) {
      button.classList.add("today");
    }

    if (
      selectedDate &&
      formatDate(date) === formatDate(selectedDate)
    ) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      selectDate(date);
    });

    calendar.appendChild(button);
  }
}

function selectDate(date) {
  selectedDate = date;

  selectedDateText.textContent =
    displayDate(date);

  timeSelect.disabled = false;

  populateTimes();

  hideMessage();

  renderCalendar();
}

function populateTimes() {
  timeSelect.innerHTML =
    '<option value="">Select a time</option>';

  availableTimes.forEach(time => {
    const option = document.createElement("option");

    option.value = time;

    option.textContent = formatTime(time);

    if (isTimeBooked(selectedDate, time)) {
      option.disabled = true;
      option.textContent += " — Booked";
    }

    timeSelect.appendChild(option);
  });
}

function formatTime(time) {
  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes)
  );

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

prevMonth.addEventListener("click", () => {
  currentDate.setMonth(
    currentDate.getMonth() - 1
  );

  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  currentDate.setMonth(
    currentDate.getMonth() + 1
  );

  renderCalendar();
});

bookButton.addEventListener("click", () => {
  hideMessage();

  if (!selectedDate) {
    showMessage(
      "Please select a booking date.",
      "error"
    );

    return;
  }

  if (!timeSelect.value) {
    showMessage(
      "Please select a booking time.",
      "error"
    );

    return;
  }

  if (!nameInput.value.trim()) {
    showMessage(
      "Please enter your name.",
      "error"
    );

    nameInput.focus();

    return;
  }

  if (!eventType.value) {
    showMessage(
      "Please select an event type.",
      "error"
    );

    return;
  }

  if (
    isTimeBooked(
      selectedDate,
      timeSelect.value
    )
  ) {
    showMessage(
      "That time has already been booked.",
      "error"
    );

    populateTimes();

    return;
  }

  const booking = {
    id: Date.now(),
    date: formatDate(selectedDate),
    time: timeSelect.value,
    name: nameInput.value.trim(),
    eventType: eventType.value,
    createdAt: new Date().toISOString()
  };

  saveBooking(booking);

  showMessage(
    `Booking confirmed for ${displayDate(selectedDate)} at ${formatTime(timeSelect.value)}.`,
    "success"
  );

  populateTimes();

  nameInput.value = "";
  eventType.value = "";
  timeSelect.value = "";
});

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function hideMessage() {
  message.textContent = "";
  message.className = "message";
}

renderCalendar();
