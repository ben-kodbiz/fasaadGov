// Simple Node.js script to test casualty calculation
const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('data/us_interventions.json', 'utf8'));

let totalCasualties = 0;
let totalEvents = 0;
let eventsWithCasualties = 0;

console.log('Calculating casualties by category:\n');

data.categories.forEach(category => {
  let categoryTotal = 0;
  let categoryEvents = 0;
  
  category.events.forEach(event => {
    totalEvents++;
    categoryEvents++;
    
    const casualties = event.casualties || event.estimated_deaths || 0;
    if (casualties > 0) {
      eventsWithCasualties++;
      categoryTotal += casualties;
      totalCasualties += casualties;
      
      // Log major events (>10k casualties)
      if (casualties > 10000) {
        console.log(`  ${event.title}: ${casualties.toLocaleString()} casualties`);
      }
    }
  });
  
  console.log(`${category.name}: ${categoryTotal.toLocaleString()} casualties (${categoryEvents} events)`);
});

console.log('\n=== SUMMARY ===');
console.log(`Total events: ${totalEvents}`);
console.log(`Events with casualty data: ${eventsWithCasualties}`);
console.log(`Total casualties: ${totalCasualties.toLocaleString()}`);