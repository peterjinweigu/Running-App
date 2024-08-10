// algo.js

// API KEY (REPLACE WITH DUMMY WHEN PUSHING)
ROUTES_KEY = "DUMMY_KEY";
// Pretty sure this key is not vulnerable, maybe put on frontend
EMBED_KEY = "DUMMY_KEY";


// static class members
// reminder latitude should bounce back at limits
// and longitude should wrap around 
const meterToLat = 1/(1852*60);
const maxLat = 90;
const minLat = -90

const meterToLong = 1/(1852*60);
const maxLong = 180;
const minLong = -180;

/**
 * returns set of most fit points for given starting point
 * and distance
 * @param {*} lat 
 * @param {*} long 
 * @param {*} distance 
 */
async function getRoute(lat, long, distance) {
    
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
            let actualDistance = await queryDistance(pts);

            if (actualDistance == -1) continue;

            // console.log(getErrorMargin(distance, actualDistance));
            // console.log(getErrorMargin(distance, bestRouteLength));

            if (getErrorMargin(distance, actualDistance) < getErrorMargin(distance, bestRouteLength)) {
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
    return Math.abs(expected-actual);
}

/**
 * return distance of points by making request to
 * google maps routes api
 * @param {*} points 
 */
async function queryDistance(points) {

    console.log(points);

    // Fetch POST
    try {
        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "post",
            body: JSON.stringify({
                "origin":{
                    "location":{
                        "latLng":{
                            "latitude": points[0][0],
                            "longitude": points[0][1]
                        }
                    },
                },
                "destination":{
                    "location":{
                        "latLng":{
                            "latitude": points[0][0],
                            "longitude": points[0][1]
                        }
                    }
                },
                "intermediates": convertPointsJson(points),
                "travelMode": "WALK",
                "computeAlternativeRoutes": false,
                "languageCode": "en-US",
                "units": "IMPERIAL"
            }),
            headers: {
                'Content-Type' : 'application/json',
                'X-Goog-Api-Key' : ROUTES_KEY,
                'X-Goog-FieldMask' : 'routes.distanceMeters'
            }
        });
        const result = await response.json();
        const ret = parseFloat(result.routes[0].distanceMeters);
        return ret;
    } catch (error) {
        console.log("Error: ", error);
        return -1;
    }
}

/**
 * returns jsonified points formatted for google maps api
 * @param {*} points 
 * @returns 
 */
function convertPointsJson(points) {
    ret = [];
    points.forEach((point) => {
        ret.push({
            "location":{
                "latLng":{
                    "latitude": point[0],
                    "longitude": point[1]
                }
            },
            "via": true
        })
    })
    return ret;
}

module.exports = {
    getRoute: getRoute
};