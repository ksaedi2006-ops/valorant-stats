let currentStats = [];
let currentStatType = 'kd';

document.addEventListener('DOMContentLoaded', () => {
    fetchAgentStats();
    setupStatButtons();
});

function setupStatButtons() {
    const buttons = document.querySelectorAll('.stat-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            currentStatType = button.dataset.stat;
            displayAgentStats(currentStats);
        });
    });
}
function getStatValue(agent, statType) {
    switch(statType) {
        case 'kd': return { value: agent.average_kd, label: 'K/D' };
        case 'assists': return { value: agent.average_assists, label: 'Avg Assists' };
        case 'hs': return { value: agent.average_hs, label: 'HS%' };
        case 'econ': return { value: agent.average_econ, label: 'Econ Rating' };
        default: return { value: 0, label: 'Unknown' };
    }
}

async function fetchAgentStats() {
    try {
        const response = await fetch('/api/agent-stats');
        currentStats = await response.json();
        displayAgentStats(currentStats);
    } catch (error) {
        console.error('Error fetching agent stats:', error);
    }
}

function displayAgentStats(stats) {
    const container = document.querySelector('.agent-grid');
    const sortedStats = [...stats].sort((a, b) => {
        const statA = getStatValue(a, currentStatType).value;
        const statB = getStatValue(b, currentStatType).value;
        return statB - statA;
    });
    
    const fragment = document.createDocumentFragment();

    sortedStats.forEach(agent => {
        const stat = getStatValue(agent, currentStatType);
        const card = document.createElement('div');
        card.className = 'agent-card';
        
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
        
        card.addEventListener('click', () => {
            const details = card.querySelector('.details');
            details.classList.toggle('show');
        });
        
        fragment.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}