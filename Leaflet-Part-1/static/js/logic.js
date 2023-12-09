// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Assign the colors and bins for earthquakes' depths
let colors = ["pink", "lightcoral", "indianred", "crimson", "firebrick", "darkred"];
let bins = ["10- ", "10-30", "30-50", "50-70", "70-90", "90+"];
function createFeatures(earthquakeData) {
  // Define a function that will return the color of a circle based on the earthquake's depth      
  function fillColor(depth) {
    if (depth <= 10) return colors[0];
    else if (depth > 10 && depth <= 30) return colors[1];
    else if (depth > 30 && depth <= 50) return colors[2];
    else if (depth > 50 && depth <= 70) return colors[3];
    else if (depth > 70 && depth <= 90) return colors[4];
    else return colors[5];
  }
  // Define a function that we want to run once for each feature in the features array
  // Give each feature a popup that describes the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h2>${feature.properties.place}</h2><hr>
    <h3>Magnitude: ${feature.properties.mag} | Depth: ${feature.geometry.coordinates[2]}</h3><hr>
    <p>${new Date(feature.properties.time)}</p>`)
  }

  // Define a function that we want to run once for each feature in the features array
  // Give each feature a circle that is defined by the earthquake's magnitude and depth
  function pointToLayer(feature, latlng) {
    return new L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        fillOpacity: 1,
        color: "black",
        fillColor: fillColor(feature.geometry.coordinates[2]),
        radius: Math.sqrt(Math.abs(feature.properties.mag)) * 80000
      });
  }
  // Create a GeoJSON layer that contains the features array on the earthquakeData object
  // Run the pointToLayer and onEachFeature functions once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object with topographic and street map layers
  let baseMaps = {
    "Topographic Map": topo,
    "Street Map": street
  };

  // Create an overlay object to hold our geoJSON layer
  let overlayMap = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the topographic map and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [topo, earthquakes]
  });

  // Create a layer control
  // Pass it our baseMaps and overlayMap
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMap, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    // Add a title to the legend
    let legendTitle = "<h1>Depth (km)</h1>";
    div.innerHTML = legendTitle;

    // Add a table with the color and respective range 
    let legendRow = [];
    for (let i = 0; i < colors.length; i++) {
        legendRow.push(`<tr><td style=\"background-color: ${colors[i]}\"></td><td class="range">${bins[i]}</td></tr>`);
    }
    div.innerHTML += "<table>" + legendRow.join("") + "</table>";
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);
}
