// Get the search bar and search button elements
const searchBar = document.getElementById('searchBar');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

// Add event listener to search button
searchButton.addEventListener('click', () => {
  // Get the search query from the search bar input
  const query = searchBar.value.trim();
  
  // If the search query is empty, do nothing
  if (query === "") {
    return;
  }
  
  // Redirect the user to the customer page with the search query as a parameter
  window.location.href = `/customerpage?search=${encodeURIComponent(query)}`;});

  // Make an AJAX request to the backend to retrieve the customer information
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/lookup?search=${searchQuery}`);
  xhr.onload = () => {
    if (xhr.status === 200) {
      // Parse the JSON response
      const data = JSON.parse(xhr.responseText);

      // Display the customer information on the customer page
      const customerInfo = data.customerInfo;
      const vehicles = data.vehicles;
      const serviceHistory = data.serviceHistory;
      
      // Construct the HTML to display the customer information
      let html = '<div>';
      html += `<h1>Customer: ${customerInfo.name}</h1>`;
      html += '<h2>Vehicles:</h2>';
      for (const vehicle of vehicles) {
        html += `<p>${vehicle.make} ${vehicle.model} (${vehicle.year})</p>`;
      }
      html += '<h2>Service History:</h2>';
      html += '<table>';
      html += '<thead>';
      html += '<tr>';
      html += '<th>Service Name</th>';
      html += '<th>Date In</th>';
      html += '<th>Date Out</th>';
      html += '<th>Total Amount</th>';
      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
      for (const service of serviceHistory) {
        html += '<tr>';
        html += `<td>${service.name}</td>`;
        html += `<td>${service.dateIn}</td>`;
        html += `<td>${service.dateOut}</td>`;
        html += `<td>${service.totalAmount}</td>`;
        html += '</tr>';
      }
      html += '</tbody>';
      html += '</table>';
      html += '</div>';

      // Update the HTML of the results container on the customer page
      resultsContainer.innerHTML = html;

      // Redirect to the customer page with the search query as a parameter
      window.location.href = `customerpage.ejs?search=${searchQuery}`;
    } else {
      console.error('Error retrieving customer information.');
    }
  };
  xhr.send();
