let globalStats = null;

function filterMarkets(markets, filters) {
    console.log('Filtering markets:', { 
        totalMarkets: markets.length, 
        filters 
    });

    const now = new Date();
    const filteredMarkets = markets.filter(market => {
        // Debug log for each market
        console.log('Checking market:', {
            title: market.title,
            endTime: market.endTime,
            active: market.active
        });

        const endDate = new Date(market.endTime);
        
        // Status filter
        if (filters.status === 'active' && !market.active) {
            console.log('Filtered out by status');
            return false;
        }

        // End date filter
        if (filters.endDays !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() + parseInt(filters.endDays));
            
            // Debug log dates
            console.log('Date comparison:', {
                endDate,
                cutoffDate,
                now,
                withinRange: endDate <= cutoffDate && endDate >= now
            });

            if (endDate > cutoffDate || endDate < now) {
                console.log('Filtered out by date');
                return false;
            }
        }

        return true;
    });

    console.log('Filtered results:', filteredMarkets.length);
    return filteredMarkets;
}

async function fetchStats() {
    try {
        document.body.classList.add('loading');
        
        const response = await fetch('/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        globalStats = await response.json();
        console.log('Received stats:', globalStats); // Debug log

        // Get filter values
        const filters = {
            endDays: document.getElementById('endDateFilter').value,
            status: document.getElementById('statusFilter').value
        };

        console.log('Applied filters:', filters); // Debug log

        // Apply filters
        const filteredMarkets = filterMarkets(globalStats.markets, filters);
        
        // Update UI with filtered markets
        updateUI(filteredMarkets);

    } catch (error) {
        console.error('Error fetching stats:', error);
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.style.display = 'block';
        errorContainer.textContent = `Error loading data: ${error.message}`;
    } finally {
        document.body.classList.remove('loading');
    }
}

function updateUI(markets) {
    // Update overview
    document.getElementById('totalMarkets').textContent = markets.length;
    document.getElementById('totalVolume').textContent = 
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(markets.reduce((sum, m) => sum + (m.volume24h || 0), 0));
    document.getElementById('lastUpdate').textContent = 
        new Date(globalStats.lastUpdated).toLocaleString();

    // Update markets list
    const marketsList = document.getElementById('marketsList');
    marketsList.innerHTML = '';

    if (markets.length > 0) {
        markets
            .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
            .forEach(market => {
                const card = document.createElement('div');
                card.className = 'card market-card';
                card.innerHTML = `
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">
                                <a href="${market.url}" target="_blank" class="text-decoration-none">
                                    ${market.title}
                                </a>
                            </h5>
                            <span class="badge ${market.active ? 'bg-success' : 'bg-secondary'}">
                                ${market.active ? 'Active' : 'Closed'}
                            </span>
                        </div>
                        
                        ${market.description ? `
                            <p class="card-text small text-muted mb-2">${market.description}</p>
                        ` : ''}
                        
                        <div class="market-details">
                            <div class="row g-2">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-cash me-2"></i>
                                        <span>Volume: ${new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(market.volume24h)}</span>
                                    </div>
                                </div>
                                
                                ${market.category ? `
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-tag me-2"></i>
                                            <span>Category: ${market.category}</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>

                            ${market.tags && market.tags.length > 0 ? `
                                <div class="mt-2">
                                    ${market.tags.map(tag => `
                                        <span class="badge bg-info me-1">${tag}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            ${market.startTime ? `
                                <div class="mt-2 small">
                                    <i class="bi bi-calendar me-1"></i>
                                    Starts: ${new Date(market.startTime).toLocaleString()}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
                marketsList.appendChild(card);
            });
    } else {
        marketsList.innerHTML = '<div class="alert alert-info">No markets match the selected filters</div>';
    }
}

// Add filter change handlers
document.getElementById('endDateFilter').addEventListener('change', () => {
    if (globalStats) {
        const filters = {
            endDays: document.getElementById('endDateFilter').value,
            status: document.getElementById('statusFilter').value
        };
        const filteredMarkets = filterMarkets(globalStats.markets, filters);
        updateUI(filteredMarkets);
    }
});

document.getElementById('statusFilter').addEventListener('change', () => {
    if (globalStats) {
        const filters = {
            endDays: document.getElementById('endDateFilter').value,
            status: document.getElementById('statusFilter').value
        };
        const filteredMarkets = filterMarkets(globalStats.markets, filters);
        updateUI(filteredMarkets);
    }
});

// Initial fetch
fetchStats();

// Add refresh button handler
document.getElementById('refreshBtn').addEventListener('click', fetchStats);

// Auto-refresh every 5 minutes
setInterval(fetchStats, 5 * 60 * 1000); 