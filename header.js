

function initMenuToggle() {
  const hamburger = document.querySelector('.hamburger');
  const cross = document.querySelector('.cross');
  const navigation = document.querySelector('.nav-bar');

  // Check if elements exist
  if (!hamburger || !cross || !navigation) {
      console.error("Menu elements not found!");
      return;
  }

  // Initially hide the cross icon
  cross.style.display = 'none';

  // Show the navigation when the hamburger is clicked
  hamburger.addEventListener('click', () => {
      navigation.style.display = 'flex'; // Show the menu
      hamburger.style.display = 'none'; // Hide hamburger
      cross.style.display = 'inline-block'; // Show cross
  });

  // Hide the navigation when the cross is clicked
  cross.addEventListener('click', () => {
      navigation.style.display = 'none'; // Hide the menu
      hamburger.style.display = 'inline-block'; // Show hamburger
      cross.style.display = 'none'; // Hide cross
  });
}

function loadHeader() {
  const headerElement = document.getElementById('header');

  // Check if the header element exists
  if (!headerElement) {
      console.error("Header element not found!");
      return;
  }

  // Optional: Show a loading indicator
  headerElement.innerHTML = '<p>Loading...</p>'; // or insert a spinner

  fetch('header.html')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok: ' + response.statusText);
          }
          return response.text();
      })
      .then(data => {
          headerElement.innerHTML = data; // Set the loaded header content
          initMenuToggle(); // Initialize menu toggle after header loads
      })
      .catch(error => {
          console.error("There was a problem with the fetch operation:", error);
          headerElement.innerHTML = '<p>Error loading header. Please try again later.</p>'; // Show error message
      });
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
});
