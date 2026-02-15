const API_URL = '/api';

const STATE_NAMES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

let stateData = {};
let currentState = null;

const dropdown = document.getElementById('dropdown');
const dropdownHeader = document.getElementById('dropdownHeader');
const tooltip = document.getElementById('tooltip');
const mapSvg = document.getElementById('map');
const statusMessage = document.getElementById('statusMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const mainContent = document.getElementById('mainContent');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const resetDataBtn = document.getElementById('resetDataBtn');
const confirmModal = document.getElementById('confirmModal');
const cancelResetBtn = document.getElementById('cancelResetBtn');
const confirmResetBtn = document.getElementById('confirmResetBtn');

// Show/hide loading state
function setLoading(isLoading) {
  if (isLoading) {
    loadingSpinner.classList.remove('hidden');
    mainContent.classList.add('hidden');
  } else {
    loadingSpinner.classList.add('hidden');
    mainContent.classList.remove('hidden');
  }
}

// Show status message
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? 'status-message error' : 'status-message success';
  setTimeout(() => {
    statusMessage.className = 'status-message hidden';
  }, 3000);
}

// Load state data from API
async function loadData() {
  try {
    const response = await fetch(`${API_URL}/states`);
    if (!response.ok) throw new Error('Failed to load data');
    stateData = await response.json();
    console.log('Loaded state data:', stateData);
  } catch (error) {
    console.error('Error loading data:', error);
    showStatus('Failed to load data from server', true);
    stateData = {};
  }
}

// Save state data to API
async function saveState(stateId, status) {
  try {
    if (status === 'none') {
      const response = await fetch(`${API_URL}/states/${stateId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete state');
    } else {
      const response = await fetch(`${API_URL}/states/${stateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to save state');
    }
    console.log(`Saved ${stateId}: ${status}`);
  } catch (error) {
    console.error('Error saving state:', error);
    showStatus('Failed to save changes', true);
  }
}

// Settings menu toggle
settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsMenu.classList.toggle('show');
});

// Close settings menu when clicking outside
document.addEventListener('click', (e) => {
  if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
    settingsMenu.classList.remove('show');
  }
});

// Reset data button
resetDataBtn.addEventListener('click', () => {
  settingsMenu.classList.remove('show');
  confirmModal.classList.add('show');
});

// Cancel reset
cancelResetBtn.addEventListener('click', () => {
  confirmModal.classList.remove('show');
});

// Confirm reset
confirmResetBtn.addEventListener('click', async () => {
  try {
    // Delete all states from the database
    const stateIds = Object.keys(stateData);
    
    for (const stateId of stateIds) {
      const response = await fetch(`${API_URL}/states/${stateId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete state');
    }
    
    // Clear local data
    stateData = {};
    
    // Reload the map
    loadMap();
    
    confirmModal.classList.remove('show');
    showStatus('All data has been reset successfully');
  } catch (error) {
    console.error('Error resetting data:', error);
    showStatus('Failed to reset data', true);
  }
});

// Close modal when clicking outside
confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    confirmModal.classList.remove('show');
  }
});

// Load SVG paths from the STATE_PATHS object
function loadMap() {
  // Clear existing paths
  mapSvg.innerHTML = '';
  
  Object.keys(STATE_PATHS).forEach(stateId => {
    const pathData = STATE_PATHS[stateId];
    
    // Skip placeholder entries
    if (pathData === 'PASTE_PATH_HERE') {
      return;
    }
    
    const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newPath.setAttribute('d', pathData);
    newPath.setAttribute('id', stateId);
    newPath.classList.add('state-path');
    
    // Set initial color based on saved data
    updateStateColor(newPath, stateId);
    
    // Add event listeners
    newPath.addEventListener('click', handleStateClick);
    newPath.addEventListener('mouseenter', handleStateHover);
    newPath.addEventListener('mouseleave', handleStateLeave);
    newPath.addEventListener('mousemove', handleStateMove);
    
    mapSvg.appendChild(newPath);
  });
  
  updateStats();
}

function updateStateColor(path, stateId) {
  const status = stateData[stateId] || 'none';
  path.classList.remove('status-ben', 'status-matt', 'status-both', 'status-together');
  if (status !== 'none') {
    path.classList.add(`status-${status}`);
  }
}

function handleStateClick(e) {
  e.stopPropagation();
  currentState = e.target.getAttribute('id');
  
  // Set the dropdown header with state name
  dropdownHeader.textContent = STATE_NAMES[currentState];
  
  dropdown.style.left = `${e.clientX}px`;
  dropdown.style.top = `${e.clientY}px`;
  dropdown.classList.add('show');
}

function handleStateHover(e) {
  const stateId = e.target.getAttribute('id');
  tooltip.textContent = STATE_NAMES[stateId];
  tooltip.classList.add('show');
}

function handleStateLeave() {
  tooltip.classList.remove('show');
}

function handleStateMove(e) {
  tooltip.style.left = `${e.clientX + 15}px`;
  tooltip.style.top = `${e.clientY + 15}px`;
}

// Handle dropdown selection
dropdown.addEventListener('click', async (e) => {
  const item = e.target.closest('.dropdown-item');
  if (item && currentState) {
    const status = item.dataset.status;
    
    if (status === 'none') {
      delete stateData[currentState];
    } else {
      stateData[currentState] = status;
    }
    
    const path = document.getElementById(currentState);
    updateStateColor(path, currentState);
    updateStats();
    await saveState(currentState, status);
    
    dropdown.classList.remove('show');
    currentState = null;
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  dropdown.classList.remove('show');
});

function updateStats() {
  const counts = {
    ben: 0,
    matt: 0,
    both: 0,
    together: 0
  };

  Object.values(stateData).forEach(status => {
    if (status === 'ben') {
      counts.ben++;
    } else if (status === 'matt') {
      counts.matt++;
    } else if (status === 'both') {
      counts.ben++;
      counts.matt++;
      counts.both++;
    } else if (status === 'together') {
      counts.ben++;
      counts.matt++;
      counts.both++;
      counts.together++;
    }
  });

  // Update display
  document.getElementById('count-ben').textContent = counts.ben;
  document.getElementById('count-matt').textContent = counts.matt;
  document.getElementById('count-both').textContent = counts.both;
  document.getElementById('count-together').textContent = counts.together;

  document.getElementById('percent-ben').textContent = 
    `${counts.ben}/50 (${Math.round(counts.ben / 50 * 100)}%)`;
  document.getElementById('percent-matt').textContent = 
    `${counts.matt}/50 (${Math.round(counts.matt / 50 * 100)}%)`;
  document.getElementById('percent-both').textContent = 
    `${counts.both}/50 (${Math.round(counts.both / 50 * 100)}%)`;
  document.getElementById('percent-together').textContent = 
    `${counts.together}/50 (${Math.round(counts.together / 50 * 100)}%)`;
}

// Initialize app
(async () => {
  setLoading(true);
  await loadData();
  loadMap();
  setLoading(false);
})();
