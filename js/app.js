document.addEventListener('DOMContentLoaded', function() {
    // Navigation between sections
    const navLinks = document.querySelectorAll('nav a, .cta-buttons button');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active nav link
            document.querySelectorAll('nav a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            if (this.tagName === 'A') {
                this.classList.add('active');
            } else {
                // For CTA buttons, find corresponding nav link
                const navLink = document.querySelector(`nav a[data-section="${sectionId}"]`);
                if (navLink) navLink.classList.add('active');
            }
        });
    });

    function showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Initialize station dropdowns
    initializeStationDropdowns();
    
    // Initialize metro map
    initializeMetroMap();
    
    // Set up event listeners for journey planning
    setupJourneyPlanner();
    
    // Set up event listeners for fare calculator
    setupFareCalculator();
});

function initializeStationDropdowns() {
    const stationSelects = document.querySelectorAll('.station-select');
    
    stationSelects.forEach(select => {
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add stations from metroData
        metroData.stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = station.name;
            select.appendChild(option);
        });
    });
}

function initializeMetroMap() {
    const metroMap = document.getElementById('metro-map');
    
    // Create a container for the metro lines and stations
    const mapContainer = document.createElement('div');
    mapContainer.style.position = 'relative';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '600px';
    mapContainer.style.backgroundImage = 'url("../images/metro-map-bg.jpg")';
    mapContainer.style.backgroundSize = 'cover';
    mapContainer.style.backgroundPosition = 'center';
    metroMap.appendChild(mapContainer);
    
    // Draw metro lines (simplified for demo)
    drawMetroLines(mapContainer);
    
    // Add station markers
    addStationMarkers(mapContainer);
}

function drawMetroLines(container) {
    // This is a simplified version - in a real app, you'd use proper coordinates
    // or a library like D3.js for complex metro maps
    
    // Red Line (horizontal)
    const redLine = document.createElement('div');
    redLine.className = 'metro-line red';
    redLine.style.width = '80%';
    redLine.style.left = '10%';
    redLine.style.top = '30%';
    container.appendChild(redLine);
    
    // Blue Line (vertical)
    const blueLine = document.createElement('div');
    blueLine.className = 'metro-line blue';
    blueLine.style.width = '60%';
    blueLine.style.left = '40%';
    blueLine.style.top = '20%';
    blueLine.style.transform = 'rotate(90deg)';
    container.appendChild(blueLine);
    
    // Green Line (diagonal)
    const greenLine = document.createElement('div');
    greenLine.className = 'metro-line green';
    greenLine.style.width = '40%';
    greenLine.style.left = '30%';
    greenLine.style.top = '50%';
    greenLine.style.transform = 'rotate(45deg)';
    container.appendChild(greenLine);
}

function addStationMarkers(container) {
    metroData.stations.forEach(station => {
        const marker = document.createElement('div');
        marker.className = `station-marker ${getLineClass(station.line)}`;
        marker.textContent = station.id;
        marker.setAttribute('data-station-id', station.id);
        marker.setAttribute('title', station.name);
        
        // Simplified positioning - in a real app, use proper coordinates
        const position = getStationPosition(station.id);
        marker.style.left = `${position.x}%`;
        marker.style.top = `${position.y}%`;
        
        marker.addEventListener('click', function() {
            // Highlight station
            document.querySelectorAll('.station-marker').forEach(m => {
                m.style.boxShadow = 'none';
            });
            this.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
            
            // Show station info
            alert(`Station: ${station.name}\nLine: ${station.line}`);
        });
        
        container.appendChild(marker);
    });
}

function getLineClass(lineCode) {
    switch(lineCode) {
        case 'R': return 'red';
        case 'B': return 'blue';
        case 'G': return 'green';
        case 'I': return 'interchange';
        default: return 'red';
    }
}

function getStationPosition(stationId) {
    // Simplified positioning logic - in a real app, use proper coordinates
    if (stationId < 10) {
        // Red line stations
        return { x: 10 + stationId * 7, y: 30 };
    } else if (stationId < 30) {
        // Blue line stations
        return { x: 40, y: 20 + (stationId - 10) * 2 };
    } else {
        // Green line stations
        return { x: 30 + (stationId - 30) * 3, y: 50 + (stationId - 30) * 2 };
    }
}

function setupJourneyPlanner() {
    const findRouteBtn = document.getElementById('find-route');
    const sourceSelect = document.getElementById('source-station');
    const destinationSelect = document.getElementById('destination-station');
    const routeTypeRadios = document.getElementsByName('route-type');
    const journeyResults = document.getElementById('journey-results');
    const pathVisualization = document.getElementById('path-visualization');
    
    findRouteBtn.addEventListener('click', function() {
        const sourceId = parseInt(sourceSelect.value);
        const destinationId = parseInt(destinationSelect.value);
        const routeType = document.querySelector('input[name="route-type"]:checked').value;
        
        if (!sourceId || !destinationId) {
            alert('Please select both source and destination stations');
            return;
        }
        
        if (sourceId === destinationId) {
            alert('Source and destination stations cannot be the same');
            return;
        }
        
        // In a real app, this would call your Java backend API
        // For demo, we'll use mock data
        const result = calculateRoute(sourceId, destinationId, routeType);
        
        // Display results
        displayJourneyResults(result, routeType);
        
        // Visualize path
        visualizePath(result.path, pathVisualization);
    });
}

function calculateRoute(sourceId, destinationId, routeType) {
    const visited = new Set();
    const distances = {};
    const previous = {};
    const queue = [];

    // Build graph
    const graph = {};
    metroData.stations.forEach(station => {
        graph[station.id] = [];
    });

    metroData.connections.forEach(conn => {
        graph[conn.from].push({ to: conn.to, weight: conn[routeType] });
        graph[conn.to].push({ to: conn.from, weight: conn[routeType] }); // Assuming bidirectional
    });

    // Init
    metroData.stations.forEach(station => {
        distances[station.id] = Infinity;
        previous[station.id] = null;
    });
    distances[sourceId] = 0;
    queue.push({ id: sourceId, dist: 0 });

    // Dijkstra’s loop
    while (queue.length > 0) {
        queue.sort((a, b) => a.dist - b.dist);
        const current = queue.shift();

        if (visited.has(current.id)) continue;
        visited.add(current.id);

        if (current.id === destinationId) break;

        for (const neighbor of graph[current.id]) {
            const alt = distances[current.id] + neighbor.weight;
            if (alt < distances[neighbor.to]) {
                distances[neighbor.to] = alt;
                previous[neighbor.to] = current.id;
                queue.push({ id: neighbor.to, dist: alt });
            }
        }
    }

    // Build path
    const path = [];
    let currentId = destinationId;
    while (currentId !== null) {
        path.unshift(currentId);
        currentId = previous[currentId];
    }

    const sourceStation = metroData.stations.find(s => s.id === sourceId);
    const destStation = metroData.stations.find(s => s.id === destinationId);
    const distance = routeType === "distance" ? distances[destinationId] : path.length * 1.5;
    const time = routeType === "time" ? distances[destinationId] : path.length * 2;

    return {
        source: sourceStation.name,
        destination: destStation.name,
        distance: distance.toFixed(1),
        time: Math.round(time),
        fare: calculateFare(distance),
        path
    };
}

function displayJourneyResults(result, routeType) {
    const distanceResult = document.querySelector('#distance-result .result-content');
    const timeResult = document.querySelector('#time-result .result-content');
    const fareResult = document.querySelector('#fare-result .result-content');
    
    distanceResult.innerHTML = `
        <p><strong>From:</strong> ${result.source}</p>
        <p><strong>To:</strong> ${result.destination}</p>
        <p><strong>Distance:</strong> ${result.distance} km</p>
        <p><strong>Route Type:</strong> ${routeType === 'distance' ? 'Shortest Distance' : 'Shortest Time'}</p>
    `;
    
    timeResult.innerHTML = `
        <p><strong>Estimated Travel Time:</strong> ${result.time} minutes</p>
        <p><strong>Number of Stations:</strong> ${result.path.length}</p>
    `;
    
    fareResult.innerHTML = `
        <p><strong>Ticket Fare:</strong> ₹${result.fare}</p>
    `;
}

function visualizePath(path, container) {
    // Clear previous visualization
    container.innerHTML = '<h3>Your Journey Path</h3>';
    
    const pathContainer = document.createElement('div');
    pathContainer.className = 'path-steps';
    
    path.forEach((stationId, index) => {
        const station = metroData.stations.find(s => s.id === stationId);
        
        const step = document.createElement('div');
        step.className = 'path-step';
        
        if (index === 0) {
            // Starting point
            step.innerHTML = `<i class="fas fa-map-marker-alt"></i> Start at ${station.name}`;
        } else if (index === path.length - 1) {
            // Destination
            step.innerHTML = `<i class="fas fa-flag-checkered"></i> Arrive at ${station.name}`;
        } else {
            // Intermediate station
            step.innerHTML = `<i class="fas fa-arrow-down"></i> ${station.name}`;
            
            // Add line change indicator if needed
            if (index > 0) {
                const prevStation = metroData.stations.find(s => s.id === path[index - 1]);
                if (prevStation.line !== station.line) {
                    const lineChange = document.createElement('div');
                    lineChange.className = 'line-change';
                    lineChange.innerHTML = `<i class="fas fa-exchange-alt"></i> Change to ${getLineName(station.line)} Line`;
                    lineChange.style.color = getLineColor(station.line);
                    lineChange.style.marginLeft = '20px';
                    pathContainer.appendChild(lineChange);
                }
            }
        }
        
        pathContainer.appendChild(step);
    });
    
    container.appendChild(pathContainer);
}

function getLineName(lineCode) {
    switch(lineCode) {
        case 'R': return 'Red';
        case 'B': return 'Blue';
        case 'G': return 'Green';
        default: return '';
    }
}

function getLineColor(lineCode) {
    switch(lineCode) {
        case 'R': return 'var(--primary-color)';
        case 'B': return 'var(--secondary-color)';
        case 'G': return 'var(--tertiary-color)';
        default: return '#000';
    }
}

function setupFareCalculator() {
    const calculateFareBtn = document.getElementById('calculate-fare');
    const fareSourceSelect = document.getElementById('fare-source');
    const fareDestSelect = document.getElementById('fare-destination');
    const fareResult = document.getElementById('fare-calculation-result');
    
    calculateFareBtn.addEventListener('click', function() {
        const sourceId = parseInt(fareSourceSelect.value);
        const destinationId = parseInt(fareDestSelect.value);
        
        if (!sourceId || !destinationId) {
            alert('Please select both source and destination stations');
            return;
        }
        
        if (sourceId === destinationId) {
            alert('Source and destination stations cannot be the same');
            return;
        }
        
        // Calculate distance (mock - in real app use Dijkstra's)
        const distance = Math.abs(destinationId - sourceId) * 1.5;
        const fare = calculateFare(distance);
        
        // Find stations
        const sourceStation = metroData.stations.find(s => s.id === sourceId);
        const destStation = metroData.stations.find(s => s.id === destinationId);
        
        // Display result
        const fareDetails = fareResult.querySelector('.fare-breakdown');
        fareDetails.innerHTML = `
            <p><strong>From:</strong> ${sourceStation.name}</p>
            <p><strong>To:</strong> ${destStation.name}</p>
            <p><strong>Distance:</strong> ${distance.toFixed(1)} km</p>
            <p><strong>Fare:</strong> ₹${fare}</p>
        `;
    });
}

function calculateFare(distance) {
    if (distance <= 2) return 10;
    if (distance <= 4) return 15;
    if (distance <= 6) return 25;
    if (distance <= 8) return 30;
    if (distance <= 10) return 35;
    if (distance <= 14) return 40;
    if (distance <= 18) return 45;
    if (distance <= 22) return 50;
    if (distance <= 26) return 55;
    if (distance <= 30) return 60;
    if (distance <= 34) return 65;
    return 70; // For distances beyond 34km
}