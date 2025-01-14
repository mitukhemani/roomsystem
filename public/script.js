// Get elements
const bookingForm = document.getElementById('bookingForm');
const guestForm = document.getElementById('guestForm');
const bookingListDiv = document.getElementById('bookingList');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

// Add a flag to avoid multiple submissions
let isSubmitting = false;

// Booking form logic
bookingForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (isSubmitting) {
    // If we're already submitting, prevent further submissions
    return;
  }

  isSubmitting = true; // Set flag to prevent further submissions

  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const room = document.getElementById('room').value;

  // Check room availability via the backend
  fetch('/check-availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room, checkin, checkout })
  })
  .then(response => response.json())
  .then(data => {
    if (data.available) {
      guestForm.style.display = 'block';

      // Remove existing submit event listener (if any) to prevent adding multiple listeners
      guestForm.removeEventListener('submit', handleGuestFormSubmit);

      // Add the submit event listener for guest form
      guestForm.addEventListener('submit', handleGuestFormSubmit);
    } else {
      alert('Room is not available for the selected dates.');
      isSubmitting = false; // Reset submission flag if room is not available
    }
  })
  .catch(err => {
    console.error('Error while checking availability:', err);
    isSubmitting = false; // Reset submission flag on error
  });
});

// Handle the guest form submit
function handleGuestFormSubmit(e) {
  e.preventDefault();

  const guestName = document.getElementById('guestName').value;
  const guestPhone = document.getElementById('guestPhone').value;
  const guestAddress = document.getElementById('guestAddress').value;
  const guestPrice = document.getElementById('guestPrice').value;
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const room = document.getElementById('room').value;

  // Save booking details via the backend
  fetch('/save-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room, checkin, checkout, guestName, guestPhone, guestAddress, guestPrice })
  })
  .then(response => response.json())
  .then(() => {
    alert('Booking saved successfully!');
    guestForm.reset();
    guestForm.style.display = 'none';
    bookingForm.reset(); // Reset booking form as well
    isSubmitting = false; // Reset submission flag
  })
  .catch(err => {
    console.error('Error while saving booking:', err);
    isSubmitting = false; // Reset submission flag on error
  });
}

// Show all bookings based on date range
function showBookings() {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Store the date range in the local storage to persist across page reload
  localStorage.setItem('startDate', startDate);
  localStorage.setItem('endDate', endDate);

  // Refresh the page to load the bookings after the page reload
  window.location.reload();
}

// After page reload, fetch and display the bookings
window.onload = function() {
  // Check if there's any saved date range in localStorage
  const savedStartDate = localStorage.getItem('startDate');
  const savedEndDate = localStorage.getItem('endDate');

  if (savedStartDate && savedEndDate) {
    // Set the values in the date input fields
    startDateInput.value = savedStartDate;
    endDateInput.value = savedEndDate;

    // Fetch and display the bookings based on the saved date range
    fetchBookings(savedStartDate, savedEndDate);
  }
}

// Fetch and display bookings based on the date range
function fetchBookings(startDate, endDate) {
  // Fetch all bookings from backend
  fetch('/get-bookings')
    .then(response => response.json())
    .then(bookings => {
      bookingListDiv.innerHTML = '';

      // Filter bookings based on the provided date range
      const filteredBookings = bookings.filter(booking => {
        const bookingCheckin = new Date(booking.checkin);
        const bookingCheckout = new Date(booking.checkout);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Return bookings that overlap with the date range
        return (bookingCheckin <= end && bookingCheckout >= start);
      });

      // Display filtered bookings
      if (filteredBookings.length === 0) {
        bookingListDiv.innerHTML = "<p>No bookings found for the selected date range.</p>";
      } else {
        filteredBookings.forEach(booking => {
          const div = document.createElement('div');
          div.innerHTML = `
            <p><strong>Room: </strong>${booking.room}</p>
            <p><strong>Guest Name: </strong>${booking.guestName}</p>
            <p><strong>Check-in: </strong>${booking.checkin}</p>
            <p><strong>Check-out: </strong>${booking.checkout}</p>
            <p><strong>Phone: </strong>${booking.guestPhone}</p>
            <p><strong>Address: </strong>${booking.guestAddress}</p>
            <p><strong>Price: </strong>${booking.guestPrice}</p>
            <hr>
          `;
          bookingListDiv.appendChild(div);
        });
      }
    })
    .catch(err => {
      console.error('Error while fetching bookings:', err);
    });
}
