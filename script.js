document.getElementById('numEnvelopes').addEventListener('input', actualizarResultado);
document.getElementById('largeItem').addEventListener('change', actualizarResultado);

let map;
let marker;
let distanciaGlobal = 0;

function initMap(lat, lng) {
    const myLocation = { lat: lat, lng: lng };

    if (!map) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: myLocation,
            zoom: 12,
        });

        marker = new google.maps.Marker({
            position: myLocation,
            map: map,
            title: "Mi Ubicación",
        });
    } else {
        map.setCenter(myLocation);
        marker.setPosition(myLocation);
    }
}

function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            initMap(lat, lng);
            calcularDistancia(lat, lng);
        });
    } else {
        document.getElementById('result').innerText = "La geolocalización no es soportada por este navegador.";
    }
}

function usarUbicacionManual() {
    const direccion = document.getElementById('manualLocation').value;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'address': direccion }, function(results, status) {
        if (status === 'OK') {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();

            initMap(lat, lng);
            calcularDistancia(lat, lng);
        } else {
            document.getElementById('result').innerText = "No se pudo encontrar la ubicación manualmente.";
        }
    });
}

function calcularDistancia(lat, lng) {
    const ubicacionCartago = { lat: 9.8589, lng: -83.9123 };

    const origen = new google.maps.LatLng(lat, lng);
    const destino = new google.maps.LatLng(ubicacionCartago.lat, ubicacionCartago.lng);

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [origen],
            destinations: [destino],
            travelMode: 'DRIVING'
        },
        function(response, status) {
            if (status === 'OK') {
                distanciaGlobal = response.rows[0].elements[0].distance.value / 1000; // convertir metros a kilómetros
                actualizarResultado();
            } else {
                document.getElementById('result').innerText = "No se pudo calcular la distancia.";
            }
        }
    );
}

function actualizarResultado() {
    const ubicacion = 'Cartago';
    const numSobres = parseInt(document.getElementById('numEnvelopes').value) || 1;
    const esArticuloGrande = document.getElementById('largeItem').checked;

    calcularTarifa(ubicacion, distanciaGlobal, numSobres, esArticuloGrande);
}

function calcularTarifa(ubicacion, distancia, numSobres, esArticuloGrande) {
    const costosBase = {
        'Cartago': 1000
    };

    const costoPorKm = 500;

    let costoBase = costosBase[ubicacion];
    let costoExtra = 0;

    if (distancia > 10) {
        costoExtra = (distancia - 10) * costoPorKm;
    }

    let costoTotal = costoBase + costoExtra;

    if (esArticuloGrande) {
        costoTotal *= 1.5;
    }

    document.getElementById('result').innerText = `La tarifa de entrega es ${Math.round(costoTotal)} ₡.`;
}
