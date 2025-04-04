import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { regions } from './regionData.js';

document.addEventListener('DOMContentLoaded', () => {
    // Attempt to load TopoJSON data with fallback mechanisms
    fetch('https://raw.githubusercontent.com/deldersveld/topojson/master/countries/us-states/OR-41-oregon-counties.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            try {
                createMap(data);
                createRegionCards();
            } catch (e) {
                console.error("Error creating map:", e);
                useAlternativeMapSource();
            }
        })
        .catch(error => {
            console.error("Error loading map data, trying alternative source:", error);
            useAlternativeMapSource();
        });
});

function createMap(topoData) {
    console.log("Creating map with data:", topoData);
    const width = document.getElementById('map-container').clientWidth;
    const height = document.getElementById('map-container').clientHeight;
    
    // Clear any existing content
    d3.select('#map-container').html("");
    
    const svg = d3.select('#map-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Ensure we have the correct object path
    const countyObject = topoData.objects.cb_2015_oregon_county_20m;
    if (!countyObject) {
        console.error("County data not found in the expected format");
        const availableObjects = Object.keys(topoData.objects).join(", ");
        console.log("Available objects:", availableObjects);
        
        // Try to find the first available object as fallback
        const firstObjectKey = Object.keys(topoData.objects)[0];
        if (firstObjectKey) {
            console.log("Using first available object as fallback:", firstObjectKey);
            const geoData = topojson.feature(topoData, topoData.objects[firstObjectKey]);
            const projection = d3.geoMercator().fitSize([width, height], geoData);
            const path = d3.geoPath().projection(projection);
            
            svg.selectAll('path')
                .data(geoData.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('class', 'county')
                .attr('fill', d => getRegionColor(d.properties.NAME || ""))
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', 0.5);
        } else {
            document.getElementById('map-container').innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p>Unable to render map: data format not recognized</p>
                </div>
            `;
        }
        return;
    }
    
    const projection = d3.geoMercator()
        .fitSize([width, height], topojson.feature(topoData, topoData.objects.cb_2015_oregon_county_20m));
    
    const path = d3.geoPath().projection(projection);
    
    const counties = topojson.feature(topoData, topoData.objects.cb_2015_oregon_county_20m).features;
    
    // Draw counties
    svg.selectAll('path')
        .data(counties)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'county')
        .attr('fill', d => getRegionColor(d.properties.NAME))
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 0.5)
        .on('click', (event, d) => showRegionInfo(d.properties.NAME))
        .append('title')
        .text(d => d.properties.NAME);
    
    // Add county labels
    svg.selectAll('.county-label')
        .data(counties)
        .enter()
        .append('text')
        .attr('class', 'county-label')
        .attr('transform', d => `translate(${path.centroid(d)})`)
        .text(d => d.properties.NAME)
        .attr('dy', '.35em');
}

function getRegionColor(countyName) {
    for (const [region, data] of Object.entries(regions)) {
        if (data.counties.includes(countyName)) {
            return data.color;
        }
    }
    return '#ccc';
}

function getRegionForCounty(countyName) {
    for (const [region, data] of Object.entries(regions)) {
        if (data.counties.includes(countyName)) {
            return region;
        }
    }
    return null;
}

function createRegionCards() {
    const container = document.getElementById('region-cards-container');
    container.innerHTML = '';
    
    Object.entries(regions).forEach(([regionName, data]) => {
        const card = document.createElement('div');
        card.className = 'region-card';
        card.onclick = () => showRegionInfoByName(regionName);
        
        // Use CSS variables to set the region color
        card.style.setProperty('--region-color', data.color);
        
        card.innerHTML = `
            <div class="region-card-header">${regionName}</div>
            <div class="region-card-counties">
                <strong>Counties:</strong> ${data.counties.join(', ')}
            </div>
            <div class="region-card-contact">
                <div>Contact: ${data.investigators[0].name}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function showRegionInfo(countyName) {
    const region = getRegionForCounty(countyName);
    if (!region) return;
    
    const info = regions[region];
    const panel = document.getElementById('info-panel');
    const title = document.getElementById('region-title');
    const investigatorInfo = document.getElementById('investigator-info');
    
    title.textContent = `${region} - ${countyName} County`;
    
    // Find investigators responsible for this county
    const countyInvestigators = info.investigators.filter(inv => 
        inv.counties.includes(countyName)
    );
    
    // Generate HTML for the investigators
    investigatorInfo.innerHTML = '';
    
    // Add counties information
    const countiesDiv = document.createElement('div');
    countiesDiv.className = 'counties-list';
    countiesDiv.innerHTML = `
        <h3>Counties in ${region}</h3>
        <p>${info.counties.join(', ')}</p>
    `;
    investigatorInfo.appendChild(countiesDiv);
    
    // Add investigators section
    const investigatorsContainer = document.createElement('div');
    investigatorsContainer.className = 'investigators-container';
    
    // If we found county-specific investigators, show them, otherwise show all region investigators
    const investigatorsToShow = countyInvestigators.length > 0 ? countyInvestigators : info.investigators;
    
    investigatorsToShow.forEach(investigator => {
        const investigatorCard = document.createElement('div');
        investigatorCard.className = 'investigator-card';
        
        investigatorCard.innerHTML = `
            <img src="${investigator.photo}" alt="${investigator.name}" class="investigator-photo">
            <div class="investigator-details">
                <h3>${investigator.title}</h3>
                <p><strong>${investigator.name}</strong></p>
                <p>${investigator.phone}</p>
                <p><a href="mailto:${investigator.email}">${investigator.email}</a></p>
                <p><small>Assigned counties: ${investigator.counties.join(', ')}</small></p>
            </div>
        `;
        
        investigatorsContainer.appendChild(investigatorCard);
    });
    
    investigatorInfo.appendChild(investigatorsContainer);
    panel.classList.remove('hidden');
}

function showRegionInfoByName(regionName) {
    if (!regions[regionName]) return;
    const info = regions[regionName];
    const panel = document.getElementById('info-panel');
    const title = document.getElementById('region-title');
    const investigatorInfo = document.getElementById('investigator-info');
    
    title.textContent = regionName;
    
    // Generate HTML for all investigators in this region
    investigatorInfo.innerHTML = '';
    
    // Add counties information
    const countiesDiv = document.createElement('div');
    countiesDiv.className = 'counties-list';
    countiesDiv.innerHTML = `
        <h3>Counties in ${regionName}</h3>
        <p>${info.counties.join(', ')}</p>
    `;
    investigatorInfo.appendChild(countiesDiv);
    
    // Add investigators section
    const investigatorsContainer = document.createElement('div');
    investigatorsContainer.className = 'investigators-container';
    
    info.investigators.forEach(investigator => {
        const investigatorCard = document.createElement('div');
        investigatorCard.className = 'investigator-card';
        
        investigatorCard.innerHTML = `
            <img src="${investigator.photo}" alt="${investigator.name}" class="investigator-photo">
            <div class="investigator-details">
                <h3>${investigator.title}</h3>
                <p><strong>${investigator.name}</strong></p>
                <p>${investigator.phone}</p>
                <p><a href="mailto:${investigator.email}">${investigator.email}</a></p>
                <p><small>Assigned counties: ${investigator.counties.join(', ')}</small></p>
            </div>
        `;
        
        investigatorsContainer.appendChild(investigatorCard);
    });
    
    investigatorInfo.appendChild(investigatorsContainer);
    panel.classList.remove('hidden');
}

// Alternative TopoJSON source if main one fails
function useAlternativeMapSource() {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json')
        .then(response => response.json())
        .then(us => {
            console.log("Using alternative US counties map");
            
            const width = document.getElementById('map-container').clientWidth;
            const height = document.getElementById('map-container').clientHeight;
            
            const svg = d3.select('#map-container')
                .html("")
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('viewBox', `0 0 ${width} ${height}`);
            
            // Filter for Oregon counties
            const oregonFips = "41";
            
            const oregonCounties = topojson.feature(us, us.objects.counties).features
                .filter(d => d.id.startsWith(oregonFips));
            
            const projection = d3.geoAlbers()
                .rotate([120, 0])
                .center([0, 44])
                .scale(7000)  
                .translate([width / 2, height / 2]);
            
            const path = d3.geoPath().projection(projection);
            
            // Draw Oregon state boundary
            const oregonState = topojson.feature(us, us.objects.states).features
                .find(d => d.id === oregonFips);
                
            if (oregonState) {
                svg.append("path")
                    .datum(oregonState)
                    .attr("fill", "none")
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1)
                    .attr("d", path);
            }
            
            // Draw counties
            svg.selectAll('path.county')
                .data(oregonCounties)
                .enter()
                .append('path')
                .attr('class', 'county')
                .attr('d', path)
                .attr('fill', d => {
                    // Lookup county name from id
                    const countyFips = d.id.substring(2);
                    const countyName = countyNameFromFips(countyFips);
                    return getRegionColor(countyName);
                })
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', 0.5)
                .on('click', (event, d) => {
                    const countyFips = d.id.substring(2);
                    const countyName = countyNameFromFips(countyFips);
                    showRegionInfo(countyName);
                });
            
            // Add county labels
            svg.selectAll('.county-label')
                .data(oregonCounties)
                .enter()
                .append('text')
                .attr('class', 'county-label')
                .attr('transform', d => `translate(${path.centroid(d)})`)
                .text(d => {
                    const countyFips = d.id.substring(2);
                    return countyNameFromFips(countyFips);
                })
                .attr('dy', '.35em');
            
            // Create region cards
            createRegionCards();
        })
        .catch(error => {
            console.error("Error loading alternative map:", error);
            showStaticMap();
        });
}

// Fallback: Show static SVG outline of Oregon regions
function showStaticMap() {
    const mapContainer = document.getElementById('map-container');
    const width = mapContainer.clientWidth;
    const height = mapContainer.clientHeight;
    
    mapContainer.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
            <!-- Simplified Oregon region map -->
            <path d="M100,100 L200,100 L200,150 L240,150 L240,250 L100,250 Z" fill="${regions['Region 1'].color}" stroke="#fff" class="county" onclick="showRegionInfo('Linn')"></path>
            <text x="170" y="175" class="county-label">Linn</text>
            
            <path d="M100,250 L240,250 L240,350 L100,350 Z" fill="${regions['Region 2'].color}" stroke="#fff" class="county" onclick="showRegionInfo('Lane')"></path>
            <text x="170" y="300" class="county-label">Lane</text>
            
            <path d="M240,150 L350,150 L350,250 L240,250 Z" fill="${regions['Region 3'].color}" stroke="#fff" class="county" onclick="showRegionInfo('Jefferson')"></path>
            <text x="295" y="200" class="county-label">Jefferson</text>
            
            <path d="M240,250 L500,250 L500,350 L240,350 Z" fill="${regions['Region 4'].color}" stroke="#fff" class="county" onclick="showRegionInfo('Deschutes')"></path>
            <text x="370" y="300" class="county-label">Deschutes</text>
            
            <path d="M200,100 L280,100 L280,150 L200,150 Z" fill="${regions['Region 5'].color}" stroke="#fff" class="county" onclick="showRegionInfo('Multnomah')"></path>
            <text x="240" y="125" class="county-label">Multnomah</text>
        </svg>
    `;
    
    // Create region cards
    createRegionCards();
}

// Helper function to translate FIPS codes to county names (partial mapping)
function countyNameFromFips(fips) {
    const oregonCounties = {
        "001": "Baker", "003": "Benton", "005": "Clackamas", "007": "Clatsop",
        "009": "Columbia", "011": "Coos", "013": "Crook", "015": "Curry",
        "017": "Deschutes", "019": "Douglas", "021": "Gilliam", "023": "Grant",
        "025": "Harney", "027": "Hood River", "029": "Jackson", "031": "Jefferson",
        "033": "Josephine", "035": "Klamath", "037": "Lake", "039": "Lane",
        "041": "Lincoln", "043": "Linn", "045": "Malheur", "047": "Marion",
        "049": "Morrow", "051": "Multnomah", "053": "Polk", "055": "Sherman",
        "057": "Tillamook", "059": "Umatilla", "061": "Union", "063": "Wallowa",
        "065": "Wasco", "067": "Washington", "069": "Wheeler", "071": "Yamhill"
    };
    return oregonCounties[fips] || "Unknown";
}

// Make closePanel available globally
window.closePanel = function() {
    document.getElementById('info-panel').classList.add('hidden');
};
