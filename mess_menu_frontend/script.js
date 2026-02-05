import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// =========================================================
// 1. CONFIGURATION
// =========================================================
// Time Config: [Hour, Minute] (24-hour format)
const times = {
  breakfast: { start: [7, 15], end: [9, 0] },
  lunch: { start: [12, 30], end: [14, 30] },
  snacks: { start: [17, 30], end: [19, 0] },
  dinner: { start: [20, 30], end: [22, 0] }
};

// =========================================================
// 2. MAIN APP LOGIC
// =========================================================
async function loadApp() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const todayName = days[now.getDay()];
  let week = Math.ceil(new Date().getDate() / 7);
  const day = document.getElementById('day-display');
  for (let d of days) {
    let da = document.createElement("option");
    da.className = "day-display"
    da.value = d;
    da.innerText = d;
    day.append(da)
  }
  day.value = todayName;

  // Update Day Header



  const loadingEl = document.getElementById('loading');

  // --- START NEW SERVER LOGIC ---
  try {
    // 1. Ask the Waiter (Backend) for data
    const response = await fetch('http://10.204.31.94:3000/api/menu');
    const data = await response.json(); // 'data' is born here!
    console.log(data);

    // 2. Check for errors
    if (data.error) throw new Error(data.error);

    // 3. UPDATE UI (MUST BE DONE HERE inside the 'try' block)
    if (data) {
      const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text || '--';
      };

      document.querySelector("#week-display").innerText = `Week ${week}`
      setText('menu-breakfast', data.breakfast);
      setText('menu-lunch', data.lunch);
      setText('menu-snack', data.Snacks);
      setText('menu-dinner', data.dinner);


      // Show the menu
      if (loadingEl) loadingEl.style.display = 'none';
      const container = document.getElementById('menu-container');
      if (container) container.style.display = 'flex';
    }

  } catch (err) {
    console.error("Server Error:", err);
    if (loadingEl) {
      loadingEl.innerText = "Error: Is the backend server running?";
      loadingEl.style.color = "red";
    }
  }
  // --- END SERVER LOGIC ---

  // Start Timer (This is fine outside because it doesn't need 'data')
  startTimer();
}
// Start the Clock
startTimer();


// =========================================================
// 3. TIMER & COUNTDOWN LOGIC
// =========================================================
function startTimer() {
  setInterval(() => {
    const now = new Date();

    // Helper: Create a Date object for Today at specific Hour:Minute
    const getTarget = (h, m) => {
      const t = new Date(now);
      t.setHours(h, m, 0, 0);
      return t;
    };

    let status = "Chill time";
    let targetTime = null;

    // Reset active highlighting
    document.querySelectorAll('.meal-card').forEach(el => el.classList.remove('active'));

    // Define all time boundaries for today
    const bStart = getTarget(...times.breakfast.start);
    const bEnd = getTarget(...times.breakfast.end);
    const lStart = getTarget(...times.lunch.start);
    const lEnd = getTarget(...times.lunch.end);
    const sStart = getTarget(...times.snacks.start);
    const sEnd = getTarget(...times.snacks.end);
    const dStart = getTarget(...times.dinner.start);
    const dEnd = getTarget(...times.dinner.end);

    // Logic Cascade
    // 1. Breakfast
    if (now < bStart) {
      status = "Breakfast starts in:";
      targetTime = bStart;
    } else if (now < bEnd) {
      status = "Breakfast ends in:";
      targetTime = bEnd;
      document.getElementById('card-breakfast')?.classList.add('active');
      console.log(targetTime);
    }
    // 2. Lunch
    else if (now < lStart) {
      status = "Lunch starts in:";
      targetTime = lStart;
    } else if (now < lEnd) {
      status = "Lunch ends in:";
      targetTime = lEnd;
      document.getElementById('card-lunch')?.classList.add('active');
    }
    // 3. Snacks
    else if (now < sStart) {
      status = "Snacks starts in:";
      targetTime = sStart;
    } else if (now < sEnd) {
      status = "Snacks ends in:";
      targetTime = sEnd;
      document.getElementById('card-snacks')?.classList.add('active');
    }
    // 4. Dinner
    else if (now < dStart) {
      status = "Dinner starts in:";
      targetTime = dStart;
    } else if (now < dEnd) {
      status = "Dinner ends in:";
      targetTime = dEnd;
      document.getElementById('card-dinner')?.classList.add('active');
    }
    // 5. Day Over
    else {
      status = "Mess Closed. Sleep well! 😴";
    }

    // Update Status Text
    const statusEl = document.getElementById('status-msg');
    if (statusEl) statusEl.innerText = status;

    // Calculate & Display Countdown
    const timerEl = document.getElementById('timer');
    if (timerEl) {
      if (targetTime) {
        const diff = targetTime - now;
        if (diff > 0) {
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / (1000 * 60)) % 60);
          const s = Math.floor((diff / 1000) % 60);
          // Add leading zeros (e.g., 09:05:01)
          const format = (num) => num.toString().padStart(2, '0');
          timerEl.innerText = `${format(h)}:${format(m)}:${format(s)}`;
        } else {
          timerEl.innerText = "00:00:00";
        }
      } else {
        timerEl.innerText = "--:--:--";
      }
    }

  }, 1000);
}

// Start the application
loadApp();