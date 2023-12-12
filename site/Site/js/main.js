///////////////////////////////////////////////////////////////////////////////
////////////////////////* Create variables and constant *//////////////////////
///////////////////////////////////////////////////////////////////////////////

const GEOJSON_URL = './geojson/accidentVeloGeoJson.geojson';
const DEPARTMENTS_URL = './geojson/contour-des-departements.geojson';
const ICONS = {
  green: './img/icon_indemne.png',
  yellow: './img/icon_leger.png',
  orange: './img/icon_hopital.png',
  red: './img/icon_mort.png',
};

var formFilters;
var dateMinInput;
var dateMaxInput;

var gravite1 = L.layerGroup();
var gravite2 = L.layerGroup();
var gravite3 = L.layerGroup();
var gravite4 = L.layerGroup();


/////////////////////////* Create customizable icons */////////////////////////
//Generic Icon
var IconGravite = L.Icon.extend({
  options: {
    iconSize: [25, 25],
    shadowSize: [0, 0],
    iconAnchor: [15, 15],
    shadowAnchor: [0, 0],
    popupAnchor: [0, 0]
  }
});
//Create IconGravite object
var greenIcon = new IconGravite({ iconUrl: ICONS.green });
var yellowIcon = new IconGravite({ iconUrl: ICONS.yellow });
var redIcon = new IconGravite({ iconUrl: ICONS.red });
var orangeIcon = new IconGravite({ iconUrl: ICONS.orange });




function start() {
  formFilters = document.getElementById('formFilters');
  dateMinInput = document.getElementById('dateMin');
  dateMaxInput = document.getElementById('dateMax');

  ///////////////////////////////////////////////////////////////////////////////
  //////////////////////////////* Create base map *//////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  //all style of map
  var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
  });

  var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  });
  googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });
  googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });

  var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 1,
    maxZoom: 16,
    ext: 'jpg'
  });

  //create a map with coordinate and layers
  var map = L.map('map', {
    center: [46.09305911993418, 6.449291436135037],
    zoom: 10,
    layers: [osm, gravite1, gravite2, gravite3, gravite4]
  });

  var baseMaps = {
    "OpenStreetMap": osm,
    "OpenStreetMap.HOT": osmHOT,
    "Dark": CartoDB_DarkMatter,
    "Google Streets": googleStreets,
    "Google Sateletite": googleSat,
    "Water Color": Stamen_Watercolor,
  };


  ///////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////* Add legend *////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  var legend = L.control({ position: 'bottomright' });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var labels = ['injured unharmed', 'minor injury', 'Injured in hospital', 'death'];
    var icons = [greenIcon, yellowIcon, orangeIcon, redIcon];
    for (var i = 0; i < icons.length; i++) {
      var label = labels[i];
      var icon = icons[i];
      var legendItem = L.DomUtil.create('div', 'legend-item');
      var iconImg = L.DomUtil.create('img', 'legend-icon');
      iconImg.src = icon.options.iconUrl;
      iconImg.alt = 'icon';
      L.DomUtil.addClass(legendItem, 'legend-item');
      L.DomUtil.addClass(iconImg, 'legend-icon');
      legendItem.appendChild(iconImg);
      legendItem.appendChild(document.createTextNode(label));
      div.appendChild(legendItem);
    }
    return div;
  };

  legend.addTo(map);



  ///////////////////////////////////////////////////////////////////////////////
  //////////////////////* Add contours of the department *///////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  fetch(DEPARTMENTS_URL).then(
    response => response.json()
  ).then(
    data => L.geoJson(
      (data),
      {
        style: {
          weight: 2,
          color: '#800026',
          fillOpacity: 0
        }
      }).addTo(map)
  );



  ///////////////////////////////////////////////////////////////////////////////
  //////////////////////* ------------------------------ *///////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  //Recharge des markers lors de l'envoi du formulaire des filtres
  formFilters.addEventListener('submit', e => {
    e.preventDefault();
    processData();
  });


  var layerControl = L.control.layers(baseMaps).addTo(map);
  layerControl.addOverlay(gravite1, "injured unharmed");
  layerControl.addOverlay(gravite2, "minor injury");
  layerControl.addOverlay(gravite3, "Injured in hospital");
  layerControl.addOverlay(gravite4, "death");

  ///////////////////////////////////////////////////////////////////////////////
  //////////////////////////////* Create charts *////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  var typeTrajetByYears = document.getElementById("typeTrajetByYears").getContext("2d");
  new Chart(typeTrajetByYears, {
    type: "bar",
    data: {
      labels: ["2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021"],
      datasets: [
        {
          label: "work commute",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          data: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 3, 6, 7, 6, 5, 6]
        },
        {
          label: "leisure trip",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          data: [5, 5, 7, 3, 0, 6, 5, 3, 2, 0, 2, 3, 31, 29, 21, 42, 25]
        },
        {
          label: "Other",
          backgroundColor: "rgba(255, 205, 86, 0.2)",
          borderColor: "rgba(255, 205, 86, 1)",
          borderWidth: 1,
          data: [1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 18, 5, 10, 6, 2]
        },
        {
          label: "Total",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderColor: "rgba(0, 0, 0, 1)",
          borderWidth: 1,
          data: [6, 7, 8, 5, 0, 7, 5, 3, 2, 0, 6, 7, 55, 41, 37, 53, 33],
          type: 'line',
          fill: false,
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          title: {
            display: true,
            text: 'number of accidents',
          },
        },
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Year',
          },
        },
      },
      plugins: {
        title: {
        display: true,
        text: "Accident distribution by year from 2005 to 2021 based on trip type (commute, leisure, or others)", // Le titre que vous souhaitez afficher
        font: {
          size: 16 // Vous pouvez ajuster la taille de la police selon vos préférences
        }
      }
    }
    }
  });

  var chart2 = document.getElementById("chart2").getContext("2d");
  new Chart(chart2, {
    type: "boxplot",
    data: {
      labels: ["1", "2", "3", "4"],
      datasets: [
        {
          label: "age",
          outlierColor: "#999999",
          padding: 0,
          itemRadius: 0,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          data: [
            {
              min: 16,
              q1: 22,
              median: 40.5,
              q3: 49.75,
              max: 63
            },
            {
              min: 18,
              q1: 43,
              median: 52,
              q3: 63.75,
              max: 84
            },
            {
              min: 6,
              q1: 28.75,
              median: 47,
              q3: 58.5,
              max: 89
            },
            {
              min: 4,
              q1: 28,
              median: 47,
              q3: 61,
              max: 85
            }
          ]
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
        display: true,
        text: "Age distribution by accident severity",
        font: {
          size: 16
        }
      }
    }
    }
  });


  var chart3 = document.getElementById("chart3").getContext("2d");
  new Chart(chart3, {
    type: "pie",
    data: {
      labels: ["Motorway", "National Road", "Departmental Road", "Local Road", "Off-Public Network", "Publicly Accessible Parking Area", "Urban Metropolitan Road", "Other"],
      datasets: [
        {
          data: [0, 1, 169, 98, 0, 2, 0, 5], // Nombre d'accidents par type de route
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 0, 0, 0.2)',
            'rgba(0, 255, 0, 0.2)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 0, 0, 1)',
            'rgba(0, 255, 0, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'right'
        },
          title: {
          display: true,
          text: "Number of Accidents by Road Type", 
          font: {
            size: 16 
          }
        }
      }
    }
  });

  var chart4 = document.getElementById("chart4").getContext("2d");
  new Chart(chart4, {
    type: "bar",
    data: {
      labels: ["None", "Underground - Tunnel", "Bridge - Overpass", "Interchange or Connector Ramp", "Railway Track", "Intersected Junction", "Pedestrian Zone", "Toll Zone", "Construction Site", "Other"],
      datasets: [
        {
          label: "Number of Accidents",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          data: [232, 0, 3, 0, 1, 29, 6, 0, 1, 2]
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
        display: true,
        text: "Number of Accidents by Infrastructure Type",
        font: {
          size: 16
        }
      }
    }
    }
  });  

};

window.addEventListener('load', start);
window.addEventListener('load', processData());




function processData() {
  gravite1.clearLayers();
  gravite2.clearLayers();
  gravite3.clearLayers();
  gravite4.clearLayers();

  fetch(GEOJSON_URL)
    .then(response => response.json())
    .then(data => {
      L.geoJson(data, {
        filter: function (feature) {
          return feature.properties.an >= dateMinInput.value && feature.properties.an <= dateMaxInput.value;
        },
        onEachFeature: function (feature, layer) {
          switch (feature.properties.gravite) {
            case 1:
               gravite1.addLayer(layer);
              break;
              case 2:
                gravite2.addLayer(layer);
              break;
              case 3:
                gravite3.addLayer(layer);
              break;
              default:
                gravite4.addLayer(layer);
              break;
          }

          layer.on('click', function () {
            var popupContent = "<b>specific data: </b><br>" +
                               "<span>Date: </span> " + feature.properties.date + "<br>" +
                               "<span>Age: </span> " + feature.properties.age + "<br>" +
                               "<span>the local authority: </span> " + feature.properties.commune;
          
              layer.bindPopup(popupContent).openPopup();
          });
          
        },
        pointToLayer: function (feature, latlng) {
          var icon;

          switch (feature.properties.gravite) {
            case 1:
              icon = greenIcon;
              break;
            case 2:
              icon = yellowIcon;
              break;
            case 3:
              icon = orangeIcon;
              break;
            case 4:
              icon = redIcon;
              break;
          }

          return L.marker(latlng, { icon: icon });
        },
      });

      gravite1.addTo(map);
      gravite2.addTo(map);
      gravite3.addTo(map);
      gravite4.addTo(map);
    });
}