const longitude = 18.586872;
const latitude = -33.894693;
const dotSize = 200;

var map = new maplibregl.Map({
    container: 'map',
    style: '/styles/dark-matter-custom.json',
    center: [longitude, latitude], // starting position
    zoom: 3 // starting zoom
});

map.zoomTo(13, { duration: 5000 });

// Everything below is to create the location dot
const pulsingDot = {
    width: dotSize,
    height: dotSize,
    data: new Uint8Array(dotSize * dotSize * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    // called once before every frame where the icon will be used
    render() {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;

        const radius = (dotSize / 2) * 0.3;
        const outerRadius = (dotSize / 2) * 0.7 * t + radius;
        const context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = `rgba(25, 131, 178,${1 - t})`;
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(25, 131, 178, 1)';
        context.strokeStyle = 'rgba(25, 131, 178, 1)';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
    }
};

let mapTextLayers = [];
// TODO fix map labels
map.on('load', () => {
    mapTextLayers = map.getStyle().layers.filter(layer => layer.type === 'symbol' && map.getLayoutProperty(layer.id, 'text-field')).map(layer => layer.id);
    // console.log(mapTextLayers);
    localizeMap(pageLang);

    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 7 });

    map.addSource('points', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [longitude, latitude]
                    }
                }
            ]
        }
    });
    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': 'pulsing-dot'
        }
    });
});

function localizeMap(lang) {
  if (!mapTextLayers.length) {
    // map is not loaded yet, do nothing
    return;
  }

  mapTextLayers.forEach(layerId => {
    map.setLayoutProperty(layerId, 'text-field', [
        'coalesce',
        ['get', `name:${lang}`],
        ['get', `name`]
    ])
  });
}

// Tooltip
let cleanDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' }));
let hourDiff = Math.round((cleanDate.getTime() - new Date().getTime()) / 36e5);
let hourDiffString = '';
if (hourDiff > 0) {
    hourDiffString = (hourDiff === 1 ? hourAhead : hoursAhead);
} else {
    hourDiffString = (hourDiff === 1 ? hourBehind : hoursBehind);
}
hourDiffString = hourDiffString.replace('replace_me', `${hourDiff}:00`);
document.getElementById('timeZone').setAttribute('data-tooltip', hourDiffString);

// Run first time now
updateTime();
// Setup for every second
setInterval(updateTime, 1000);

function updateTime() {
    const timeDisplay = document.getElementById('timeZone');
    const now = new Date();

    if (timeDisplay) {
        const date = new Date();

        // Convert UTC time to South African Standard Time
        const offsetZA = 2;
        date.setHours(now.getUTCHours() + offsetZA);

        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'Africa/Johannesburg',
        };

        let timeSAST = new Intl.DateTimeFormat('en-US', options);
        let formattedTime = timeSAST.format(date);

        // Adding timezone tag in
        formattedTime += ' SAST';

        timeDisplay.textContent = formattedTime;
        timeDisplay.setAttribute('datetime', now.toISOString());
    }
}
