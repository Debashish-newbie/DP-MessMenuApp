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
  let todayName = days[new Date().getDay()]; //Get day return 0-6 Sun-Sat
  let dkey = day || days[new Date().getDay];
  let week = Math.floor(new Date().getDate() % 7);

  if (week == 1 || 3) {
    if (todayName === "Sunday") {
      todayName = "Sundayo"
    }
    else if (todayName === "Wednesday") {
      todayName = "Wednesdayo"
    }
  }
  console.log(`Frontend asked for menu. Fetching for: ${todayName}`);

  // Fetch from Supabase (Server does the work now)
  const { data, error } = await supabase
    .from('menu')
    .select('*')
    .eq('day_name', todayName)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Send the food (data) back to the frontend
  res.json(data);
});

// 5. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});