// algo.js

// API KEY (REPLACE WITH DUMMY WHEN PUSHING)
SECRET_KEY = "SOMERANDOMKEY";

// static class members
// reminder latitude should bounce back at limits
// and longitude should wrap around 
meterToLat = 1/(1852*60);
maxLat = 90;
minLat = -90

meterToLong = 1/(1852*60);
maxLong = 180;
minLong = -180;

/**
 * returns set of most fit points for given starting point
 * and distance
 * @param {*} lat 
 * @param {*} long 
 * @param {*} distance 
 */
function getRoute(lat, long, distance) {
    
    let lengthPlusWidth = distance/2;
    let bestRoute = [];
    let bestRouteLength = 0;
    
    // basic trig to get x and y given angle
    // around ~60 queries
    for (let ratio = 20; ratio <= 80; ratio += 10) {
        let length = lengthPlusWidth*ratio/100;
        let width = lengthPlusWidth*(100-ratio)/100;
        let hyp = Math.sqrt(length*length + width*width);

        let displacements = [length, width, hyp];
        for (let angle = 0; angle < 360; angle += 45) {
            let pts = [[lat, long]];
            for (let angleShift = 0; angleShift <= 90; angleShift += 45) {
                let rad = (Math.PI*(angle+angleShift))/180;

                let xShift = Math.cos(rad) * displacements[angleShift/45];
                let yShift = Math.sin(rad) * displacements[angleShift/45]; 
                pts.push(createNewPoint(lat, long, xShift, yShift));
            }
            let actualDistance = queryDistance(pts);

            if (actualDistance == -1) continue;
            
            if (getErrorMargin(actualDistance) < getErrorMargin(bestRouteLength)) {
                bestRouteLength = actualDistance;
                bestRoute = pts;
            }
        }
    }

    return bestRoute;
}

/**
 * produce new latitude and longitude given start and shift
 * @param {*} lat 
 * @param {*} long 
 * @param {*} xShift 
 * @param {*} yShift 
 */
function createNewPoint(lat, long, xShift, yShift) {
    let newLat = lat + xShift * meterToLat;
    let newLong = long + yShift * meterToLong;

    if (newLat > maxLat) newLat = maxLat - (newLat - maxLat);
    else if (newLat < minLat) newLat = minLat + (minLat - newLat);
    
    if (newLong > maxLong) newLong = minLong + (newLong - maxLong);
    else if (newLong < minLong) newLong = maxLong - (minLong - newLong);
    
    return [newLat, newLong];
}

/**
 * return margin of error
 * @param {*} expected 
 * @param {*} actual 
 * @returns 
 */
function getErrorMargin(expected, actual) {
    return (Math.abs(expected-actual)*100)/expected;
}

/**
 * return distance of points by making request to
 * google maps routes api
 * @param {*} points 
 */
function queryDistance(points) {
    
    // Extract origin, waypoints, and destination
    const origin = `${points[0][0]},${points[0][1]}`;
    const destination = `${points[points.length - 1][0]},${points[points.length - 1][1]}`;
    const waypoints = points.slice(1, -1).map(point => `${point[0]},${point[1]}`).join('|');
    
    // Construct the URL
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${SECRET_KEY}`;
    
    // Make the request
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Extract and print the distance
            const routes = data.routes;
            if (routes && routes.length > 0) {
                const legs = routes[0].legs;
                const totalDistance = legs.reduce((sum, leg) => sum + leg.distance.value, 0); // distance in meters
                return totalDistance;
            } else {
                return -1;
            }
        })
        .catch(error => {
            console.log("FUCK");
            return -1;
        });
}

module.exports = {
    getRoute: getRoute
};