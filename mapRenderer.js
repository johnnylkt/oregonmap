import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { regions } from './regionData.js';

// Remove the loading indicator when the map is ready to render
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load Oregon counties TopoJSON
        const oregonData = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json');
        const width = 800;
        const height = 600;
        
        // Create SVG for map
        const svg = d3.select('#map-container')
            .html("")
            .append('svg')
            .attr('width', '150%')
            .attr('height', '160%')
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('display', 'block')
            .style('margin', '-5% -15% 100% -5%')
            .style('max-width', 'none');
            
        // Create counties from TopoJSON
        const counties = topojson.feature(oregonData, oregonData.objects.counties).features
            .filter(d => d.id.toString().startsWith('41')); // Oregon FIPS codes start with 41
            
        // Create states from TopoJSON for outline
        const states = topojson.feature(oregonData, oregonData.objects.states).features
            .filter(d => d.id === 41); // Oregon state FIPS is 41
            
        // Set up projection centered on Oregon
        const projection = d3.geoAlbers()
            .rotate([120, 0, 0])
            .center([0, 44])
            .scale(5460)
            .translate([width/2, height/2]);
            
        const path = d3.geoPath().projection(projection);
        
        // Create a map of county FIPS codes to county names
        const countyNames = {
            "41001": "Baker", "41003": "Benton", "41005": "Clackamas", "41007": "Clatsop",
            "41009": "Columbia", "41011": "Coos", "41013": "Crook", "41015": "Curry",
            "41017": "Deschutes", "41019": "Douglas", "41021": "Gilliam", "41023": "Grant",
            "41025": "Harney", "41027": "Hood River", "41029": "Jackson", "41031": "Jefferson",
            "41033": "Josephine", "41035": "Klamath", "41037": "Lake", "41039": "Lane",
            "41041": "Lincoln", "41043": "Linn", "41045": "Malheur", "41047": "Marion",
            "41049": "Morrow", "41051": "Multnomah", "41053": "Polk", "41055": "Sherman",
            "41057": "Tillamook", "41059": "Umatilla", "41061": "Union", "41063": "Wallowa",
            "41065": "Wasco", "41067": "Washington", "41069": "Wheeler", "41071": "Yamhill"
        };
        
        // Get region number based on county name
        function getRegionByCounty(countyName) {
            for (const [region, data] of Object.entries(regions)) {
                if (data.counties.includes(countyName)) {
                    return region;
                }
            }
            return null;
        }
        
        // Get color based on region
        function getColorByCounty(countyName) {
            const region = getRegionByCounty(countyName);
            return region ? regions[region].color : "#cccccc";
        }
        
        // Draw counties
        svg.selectAll("path.county")
            .data(counties)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("fill", d => getColorByCounty(countyNames[d.id]))
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .on("click", function(event, d) {
                const countyName = countyNames[d.id];
                const region = getRegionByCounty(countyName);
                if (region) {
                    showInvestigatorInfo(region, countyName);
                }
            });
            
        // Add county labels
        svg.selectAll("text.county-label")
            .data(counties)
            .enter()
            .append("text")
            .attr("class", "county-label")
            .attr("transform", d => `translate(${path.centroid(d)})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("font-size", "8px")
            .style("fill", "#000")
            .style("pointer-events", "none")
            .text(d => countyNames[d.id]);
            
        // Add state outline
        svg.append("path")
            .datum(states[0])
            .attr("class", "state-outline")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5);
            
        // Create region cards
        createRegionCards();
    } catch (error) {
        console.error("Error loading map:", error);
        document.querySelector('#map-container').innerHTML = 
            `<div style="padding: 20px; text-align: center;">
                <p>Error loading map: ${error.message}</p>
            </div>`;
    }
});

// Create region cards below the map
function createRegionCards() {
    const container = document.getElementById('region-cards-container');
    container.innerHTML = '';
    
    Object.entries(regions).forEach(([region, data]) => {
        const card = document.createElement('div');
        card.className = 'region-card';
        card.style.backgroundColor = data.color;
        
        const title = document.createElement('h3');
        title.textContent = region;
        
        const counties = document.createElement('p');
        counties.textContent = `Counties: ${data.counties.join(', ')}`;
        
        card.appendChild(title);
        card.appendChild(counties);
        card.addEventListener('click', () => showInvestigatorInfo(region));
        
        container.appendChild(card);
    });
}

// Show investigator information in panel
function showInvestigatorInfo(region, countyName = null) {
    const infoPanel = document.getElementById('info-panel');
    const titleEl = document.getElementById('region-title');
    const infoEl = document.getElementById('investigator-info');
    
    titleEl.textContent = region;
    infoEl.innerHTML = '';
    
    const regionData = regions[region];
    const investigators = countyName 
        ? regionData.investigators.filter(inv => inv.counties.includes(countyName))
        : regionData.investigators;
    
    investigators.forEach(inv => {
        const card = document.createElement('div');
        card.className = 'investigator-card';
        
        const img = document.createElement('img');
        img.src = inv.photo;
        img.alt = `Photo of ${inv.name}`;
        
        const details = document.createElement('div');
        details.className = 'investigator-details';
        
        const name = document.createElement('h3');
        name.textContent = inv.name;
        
        const title = document.createElement('p');
        title.textContent = inv.title;
        
        const contact = document.createElement('div');
        contact.className = 'contact-info';
        contact.innerHTML = `
            <p><strong>Phone:</strong> ${inv.phone}</p>
            <p><strong>Email:</strong> ${inv.email}</p>
            <p><strong>Counties:</strong> ${inv.counties.join(', ')}</p>
        `;
        
        details.appendChild(name);
        details.appendChild(title);
        details.appendChild(contact);
        
        card.appendChild(img);
        card.appendChild(details);
        
        infoEl.appendChild(card);
    });
    
    infoPanel.classList.remove('hidden');
}

// Close info panel
window.closePanel = function() {
    document.getElementById('info-panel').classList.add('hidden');
};
