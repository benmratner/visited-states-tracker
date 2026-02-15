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
const tooltip = document.getElementById('tooltip');
const mapSvg = document.getElementById('map');
const statusMessage = document.getElementById('statusMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const mainContent = document.getElementById('mainContent');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const resetDataBtn = document.getElementById('resetDataBtn');
const modalOverlay = document.getElementById('modalOverlay');
const cancelBtn = document.getElementById('cancelBtn');
const confirmResetBtn = document.getElementById('confirmResetBtn');
const customizeNamesBtn = document.getElementById('customizeNamesBtn');
const namesModalOverlay = document.getElementById('namesModalOverlay');
const cancelNamesBtn = document.getElementById('cancelNamesBtn');
const saveNamesBtn = document.getElementById('saveNamesBtn');
const resetNamesToDefaultBtn = document.getElementById('resetNamesToDefaultBtn');
const nameUser1 = document.getElementById('nameUser1');
const nameUser2 = document.getElementById('nameUser2');
const customizeColorsBtn = document.getElementById('customizeColorsBtn');
const colorModalOverlay = document.getElementById('colorModalOverlay');
const cancelColorBtn = document.getElementById('cancelColorBtn');
const saveColorsBtn = document.getElementById('saveColorsBtn');
const resetToDefaultBtn = document.getElementById('resetToDefaultBtn');
const colorBen = document.getElementById('colorBen');
const colorMatt = document.getElementById('colorMatt');
const colorBoth = document.getElementById('colorBoth');
const colorTogether = document.getElementById('colorTogether');

// Default colors
const DEFAULT_COLORS = {
  ben: '#ffd700',
  matt: '#ff69b4',
  both: '#90ee90',
  together: '#87ceeb'
};

// Default names
const DEFAULT_NAMES = {
  user1: 'User 1',
  user2: 'User 2'
};

// Custom colors (loaded from database)
let customColors = { ...DEFAULT_COLORS };

// Custom names (loaded from database)
let customNames = { ...DEFAULT_NAMES };

// Apply custom names
function applyCustomNames() {
  // Update stat cards
  document.getElementById('name-user1').textContent = customNames.user1;
  document.getElementById('name-user2').textContent = customNames.user2;

  // Update dropdown
  document.getElementById('dropdown-user1').textContent = customNames.user1;
  document.getElementById('dropdown-user2').textContent = customNames.user2;

  // Update color modal labels
  document.getElementById('colorLabel-user1').textContent = customNames.user1;
  document.getElementById('colorLabel-user2').textContent = customNames.user2;
}

// Apply custom colors
function applyCustomColors() {
  // Update CSS custom properties
  document.documentElement.style.setProperty('--color-ben', customColors.ben);
  document.documentElement.style.setProperty('--color-matt', customColors.matt);
  document.documentElement.style.setProperty('--color-both', customColors.both);
  document.documentElement.style.setProperty('--color-together', customColors.together);

  // Update stat card color indicators
  document.querySelectorAll('.stat-card').forEach((card, index) => {
    const indicator = card.querySelector('.color-indicator');
    if (indicator) {
      const colors = [customColors.ben, customColors.matt, customColors.both, customColors.together];
      indicator.style.background = colors[index];
    }
  });

  // Update dropdown color indicators
  document.querySelector('[data-status="ben"] .color-indicator').style.background = customColors.ben;
  document.querySelector('[data-status="matt"] .color-indicator').style.background = customColors.matt;
  document.querySelector('[data-status="both"] .color-indicator').style.background = customColors.both;
  document.querySelector('[data-status="together"] .color-indicator').style.background = customColors.together;
}

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

// Show toast notification
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? 'toast error' : 'toast success';

  // Auto-hide after 3 seconds with slide-out animation
  setTimeout(() => {
    statusMessage.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      statusMessage.className = 'toast hidden';
      statusMessage.style.animation = '';
    }, 300);
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

// Load settings (colors and names) from API
async function loadSettings() {
  try {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) throw new Error('Failed to load settings');
    const settings = await response.json();

    if (settings.colors) {
      customColors = settings.colors;
    }
    if (settings.names) {
      customNames = settings.names;
    }
    console.log('Loaded colors:', customColors);
    console.log('Loaded names:', customNames);
  } catch (error) {
    console.error('Error loading settings:', error);
    // Use defaults if loading fails
    customColors = { ...DEFAULT_COLORS };
    customNames = { ...DEFAULT_NAMES };
  }
}

// Save settings (colors) to API
async function saveSettings(key, value) {
  try {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });

    if (!response.ok) throw new Error('Failed to save settings');
    console.log(`Saved ${key}:`, value);
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Failed to save settings', true);
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
    // Apply custom color
    path.style.fill = customColors[status];
  } else {
    path.style.fill = '';
  }
}

function handleStateClick(e) {
  e.stopPropagation();
  currentState = e.target.getAttribute('id');
  
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
document.addEventListener('click', (e) => {
  if (!e.target.closest('#settingsBtn')) {
    settingsMenu.classList.remove('show');
  }
  dropdown.classList.remove('show');
});

// Settings menu toggle
settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsMenu.classList.toggle('show');
});

// Customize names button
customizeNamesBtn.addEventListener('click', () => {
  settingsMenu.classList.remove('show');

  // Load current names into inputs
  nameUser1.value = customNames.user1;
  nameUser2.value = customNames.user2;

  namesModalOverlay.classList.add('show');
});

// Cancel names customization
cancelNamesBtn.addEventListener('click', () => {
  namesModalOverlay.classList.remove('show');
});

// Close names modal when clicking overlay
namesModalOverlay.addEventListener('click', (e) => {
  if (e.target === namesModalOverlay) {
    namesModalOverlay.classList.remove('show');
  }
});

// Reset names to default
resetNamesToDefaultBtn.addEventListener('click', () => {
  nameUser1.value = DEFAULT_NAMES.user1;
  nameUser2.value = DEFAULT_NAMES.user2;
});

// Save custom names
saveNamesBtn.addEventListener('click', async () => {
  const name1 = nameUser1.value.trim();
  const name2 = nameUser2.value.trim();

  if (!name1 || !name2) {
    showStatus('Names cannot be empty', true);
    return;
  }

  customNames = {
    user1: name1,
    user2: name2
  };

  // Save to database
  await saveSettings('names', customNames);

  // Apply names
  applyCustomNames();

  namesModalOverlay.classList.remove('show');
  showStatus('Names saved successfully!');
});

// Reset data button
resetDataBtn.addEventListener('click', () => {
  settingsMenu.classList.remove('show');
  modalOverlay.classList.add('show');
});

// Cancel modal
cancelBtn.addEventListener('click', () => {
  modalOverlay.classList.remove('show');
});

// Close modal when clicking overlay
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('show');
  }
});

// Confirm reset
confirmResetBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_URL}/reset`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Reset failed');

    stateData = {};
    loadMap();
    modalOverlay.classList.remove('show');
    showStatus('All data has been reset');
  } catch (error) {
    console.error('Error resetting data:', error);
    showStatus('Failed to reset data', true);
  }
});

// Customize colors button
customizeColorsBtn.addEventListener('click', () => {
  settingsMenu.classList.remove('show');

  // Load current colors into inputs
  colorBen.value = customColors.ben;
  colorMatt.value = customColors.matt;
  colorBoth.value = customColors.both;
  colorTogether.value = customColors.together;

  colorModalOverlay.classList.add('show');
});

// Cancel color customization
cancelColorBtn.addEventListener('click', () => {
  colorModalOverlay.classList.remove('show');
});

// Close color modal when clicking overlay
colorModalOverlay.addEventListener('click', (e) => {
  if (e.target === colorModalOverlay) {
    colorModalOverlay.classList.remove('show');
  }
});

// Reset to default colors
resetToDefaultBtn.addEventListener('click', () => {
  colorBen.value = DEFAULT_COLORS.ben;
  colorMatt.value = DEFAULT_COLORS.matt;
  colorBoth.value = DEFAULT_COLORS.both;
  colorTogether.value = DEFAULT_COLORS.together;
});

// Save custom colors
saveColorsBtn.addEventListener('click', async () => {
  customColors = {
    ben: colorBen.value,
    matt: colorMatt.value,
    both: colorBoth.value,
    together: colorTogether.value
  };

  // Save to database
  await saveSettings('colors', customColors);

  // Apply colors
  applyCustomColors();
  loadMap();

  colorModalOverlay.classList.remove('show');
  showStatus('Colors saved successfully!');
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
  await loadSettings();
  applyCustomNames();
  applyCustomColors();
  await loadData();
  loadMap();
  setLoading(false);
})();
