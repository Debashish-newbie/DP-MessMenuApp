// 1. IMPORT TOOLS
require('dotenv').config(); // Load secrets from .env
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// 2. SETUP APP
const app = express();
app.use(cors()); // Allow your frontend to talk to this server
app.use(express.json());

// 3. CONNECT TO DATABASE (Using secrets from .env)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 4. CREATE AN API ROUTE ( The "Menu Item" on your server )
// The frontend will visit: http://localhost:3000/api/menu
app.get('/api/menu', async (req, res) => {

  // Get today's day name (Server time)
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const { day } = req.query;
  const now = new Date();
  const week = Math.ceil(now.getDate() / 7);
  const todayName = days[now.getDay()]; // 0-6 Sun-Sat

  // Simple day selection: use query param if provided, otherwise use today
  const requestedDay = day || todayName;

  // Apply alternate menu naming for odd weeks (1st, 3rd, 5th...)
  let menuDay = requestedDay;
  if (week % 2 === 1) {
    if (menuDay === "Sunday") {
      menuDay = "Sundayo";
    }
  }

  console.log(`Frontend asked for menu. Fetching for: ${menuDay} (Week ${week})`);

  // Fetch from Supabase (Server does the work now)
  const { data, error } = await supabase
    .from('menu')
    .select('*')
    .eq('day_name', menuDay)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: "Menu not found" });
  }

  // Send the food (data) back to the frontend
  res.json(data);
});

// 5. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
