const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Serve static files from 'public' folder
app.use(express.static('public'));
app.use(bodyParser.json());

// Helper function to load bookings data from the file
function loadBookings() {
  if (fs.existsSync('data/bookings.json')) {
    const data = fs.readFileSync('data/bookings.json');
    return JSON.parse(data);
  }
  return [];
}

// Helper function to save bookings to the file
function saveBookings(bookings) {
  fs.writeFileSync('data/bookings.json', JSON.stringify(bookings, null, 2));
}

// Route to check room availability
app.post('/check-availability', (req, res) => {
  const { room, checkin, checkout } = req.body;
  const bookings = loadBookings();
  
  const isAvailable = !bookings.some(booking => 
    booking.room === room &&
    new Date(booking.checkin) < new Date(checkout) &&
    new Date(booking.checkout) > new Date(checkin)
  );
  
  res.json({ available: isAvailable });
});

// Route to save a new booking
app.post('/save-booking', (req, res) => {
  const bookings = loadBookings();
  const newBooking = req.body;
  bookings.push(newBooking);
  saveBookings(bookings);
  res.json({ message: 'Booking saved successfully!' });
});

// Route to get all bookings
app.get('/get-bookings', (req, res) => {
  const bookings = loadBookings();
  res.json(bookings);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
