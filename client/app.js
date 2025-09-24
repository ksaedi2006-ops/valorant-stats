// Store current state of the application
let currentStats = [];        // Holds all agent statistics
let currentStatType = 'kd';  // Currently selected stat to display/sort by

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAgentStats();    // Get stats from the server
    setupStatButtons();   // Set up button click handlers
});

// Set up click handlers for the stat selection buttons
function setupStatButtons() {
    const buttons = document.querySelectorAll('.stat-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Update button styling
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            // Update display to show new stat type
            currentStatType = button.dataset.stat;
            displayAgentStats(currentStats);
        });
    });
}

// Get the value and label for a specific stat type from an agent object
function getStatValue(agent, statType) {
    switch(statType) {
        case 'kd': return { value: agent.average_kd, label: 'K/D' };
        case 'assists': return { value: agent.average_assists, label: 'Avg Assists' };
        case 'hs': return { value: agent.average_hs, label: 'HS%' };
        case 'econ': return { value: agent.average_econ, label: 'Econ Rating' };
        default: return { value: 0, label: 'Unknown' };
    }
}

// Fetch agent statistics from the server
async function fetchAgentStats() {
    try {
        const response = await fetch('http://localhost:3000/api/agent-stats');
        currentStats = await response.json();
        displayAgentStats(currentStats);
    } catch (error) {
        console.error('Error fetching agent stats:', error);
    }
}

// Display agent statistics in the grid
function displayAgentStats(stats) {
    const container = document.querySelector('.agent-grid');
    container.innerHTML = ''; // Clear existing cards

    // Sort agents by the currently selected stat
    const sortedStats = [...stats].sort((a, b) => {
        const statA = getStatValue(a, currentStatType).value;
        const statB = getStatValue(b, currentStatType).value;
        return statB - statA;  // Sort in descending order
    });

    // Create and add cards for each agent
    sortedStats.forEach(agent => {
        const stat = getStatValue(agent, currentStatType);
        const card = document.createElement('div');
        card.className = 'agent-card';
        
        // Create card HTML with agent stats
        card.innerHTML = `
            <div class="agent-name">${agent.Agent || 'Unknown'}</div>
            <div class="kd-ratio">${stat.value}</div>
            <div class="details">
                <div class="stat-row">
                    <span class="stat-label">K/D Ratio</span>
                    <span class="stat-value">${agent.average_kd}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Avg Assists</span>
                    <span class="stat-value">${agent.average_assists}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Headshot %</span>
                    <span class="stat-value">${agent.average_hs}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Econ Rating</span>
                    <span class="stat-value">${agent.average_econ}</span>
                </div>
            </div>
        `;
        
        // Add click handler to show/hide detailed stats
        card.addEventListener('click', () => {
            const details = card.querySelector('.details');
            details.classList.toggle('show');  // Toggle visibility of detailed stats
        });
        
        // Add the card to the grid
        container.appendChild(card);
    });
}