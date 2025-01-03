/* server/algo.js */

const KEYS = require("./key.js");
const dataBase = require("./databaseEngine.js");

// reminder latitude should bounce back at limits
// and longitude should wrap around 
const meterToLat = 1/(1852*60);
const maxLat = 90;
const minLat = -90

const meterToLong = 1/(1852*60);
const maxLong = 180;
const minLong = -180;

/**
 * Reminder: Route randomization + upgrades to geometry
 * - Randomize distance 
 *   Because we are estimating distances with polygons, we will very oftentimes overestimate
 *   So the idea is we will randomly choose distances of [0.90, 1.02] of the original distance
 *   Where the expected value is 0.96 -> an understimate 
 * - Starting point variance
 *   Give the user the option to randomly adjust starting point
 *   @TODO Turtlecuber: add option to have variance, default is 0 metres. Add this to get request
 * - More points on sweep?? Finer ratios?
 *   Think about some geometrical randomization + other stuff
 */

/**
 * returns set of most fit points for given starting point
 * and distance
 * @param {*} lat 
 * @param {*} long 
 * @param {*} distance 
 */
async function getRoute(lat, long, distance, variance) {
    const lengthPlusWidthFinal = distance/2;
    let bestRoute = [];
    let bestRouteLength = 0;

    const storedRoute = await retrieveSimilarRoute(lat, long, distance, variance);

    if (storedRoute != -1) {
        for (const pt of storedRoute.points) {
            bestRoute.push([pt.lat, pt.long]);
        }
        return bestRoute;
    }

    const randXShift = Math.random() - 0.5;
    const randYShift = Math.random() - 0.5;

    let newLatLong = createNewPoint(lat, long, variance*randXShift, variance*randYShift);
    lat = newLatLong[0];
    long = newLatLong[1];
    
    // basic trig to get x and y given angle
    // around ~60 queries
    for (let ratio = 20; ratio <= 80; ratio += 10) {
        const randomShift = Math.random() * 0.12 + 0.9;
        const lengthPlusWidth = lengthPlusWidthFinal*randomShift;

        const length = lengthPlusWidth*ratio/100;
        const width = lengthPlusWidth*(100-ratio)/100;
        const hyp = Math.sqrt(length*length + width*width);

        const displacements = [length, width, hyp];
        for (let angle = 0; angle < 360; angle += 45) {
            let pts = [[lat, long]];
            for (let angleShift = 0; angleShift <= 90; angleShift += 45) {
                let rad = (Math.PI*(angle+angleShift))/180;

                let xShift = Math.cos(rad) * displacements[angleShift/45];
                let yShift = Math.sin(rad) * displacements[angleShift/45]; 
                pts.push(createNewPoint(lat, long, xShift, yShift));
            }
            const actualDistance = await queryDistance(pts);

            if (actualDistance === -1) continue;

            // console.log(getErrorMargin(distance, actualDistance));
            // console.log(getErrorMargin(distance, bestRouteLength));

            if (getErrorMargin(distance, actualDistance) < getErrorMargin(distance, bestRouteLength)) {
                bestRouteLength = actualDistance;
                bestRoute = pts;
            }
        }
    }
    if (bestRouteLength != 0) await dataBase.write(bestRouteLength, bestRoute);

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
 * return snapped points (to nearest roads)
 * @param {*} points 
 */
async function snapPoints(points) {
    let str = "https://roads.googleapis.com/v1/nearestRoads";

    if (points.length == 0) return points;

    str += "?points=";

    // Snapping mutiple points
    // points.forEach((point) => {
    //     str += point[0] + "," + point[1] + "|";
    // })

    str += points[0][0] + "," + points[0][1];

    // str = str.substring(0, str.length-2);
    str += "&key=" + KEYS.ROUTES_KEY;

    // console.log(points);

    try {
        const response = await fetch(str);
        const result = await response.json();
        
        // ok this is somewhat backwards, should change later
        // ret = [];
        temp = result.snappedPoints;

        // temp.forEach((point) => {
        //     ret.push([parseFloat(point.location.latitude), parseFloat(point.location.longitude)]);
        // });

        points[0] = [parseFloat(temp[0].location.latitude), parseFloat(temp[0].location.longitude)];

        // console.log(ret);

        return points;
    } catch (error) {
        console.log("Error: ", error);
        return -1;
    }
}

/**
 * return distance of points by making request to
 * google maps routes api
 * @param {*} points 
 */
async function queryDistance(points) {

    // Snap points to nearest roads first, if invalid return -1
    // Get route after snapping to roads, should increase effectivness
    points = await snapPoints(points);
    if (points === -1) return -1;

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
                'X-Goog-Api-Key' : KEYS.ROUTES_KEY,
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
        });
    });
    return ret;
}

/**
 * returns google maps embed link
 * @param {*} points 
 * @returns 
 */
function getEmbed(points) {
    let str = "https://www.google.com/maps/embed/v1/directions";

    if (points.length == 0) return "ERROR";

    // add the key
    str += "?key=" + KEYS.EMBED_KEY;
    str += "&origin=" + points[0][0] + "," + points[0][1];
    str += "&destination=" + points[0][0] + "," + points[0][1];
    str += "&waypoints=";

    points.forEach((point) => {
        str += point[0] + "," + point[1] + "|";
    })

    str = str.substring(0, str.length-2);

    str += "&mode=walking";
    str += "&units=metric";

    return str;
}

/**
 * retrieve a similar route, return -1 if no similar route
 * @TODO Turtlecuber
 * @param {*} lat 
 * @param {*} long 
 * @param {*} distance 
 */
async function retrieveSimilarRoute(lat, long, distance, variance) {
    // fixed error right now, same variance from before can get passed here
    let offset = 200*(1 - variance);
    let ret = await dataBase.read(distance, offset);

    // for now we will return the first route which is within 100 metres
    // perhaps we can use same variance
    for (const route of ret) {
        for (const pt of route.points) {
            const tempLat = pt.lat;
            const tempLong = pt.long;
            if (inBetween(lat - offset*meterToLat, lat + offset*meterToLat, tempLat) 
                && inBetween(long - offset*meterToLat, long + offset*meterToLat, tempLong)) {
                return {
                    distance: distance,
                    points: route.points 
                }
            }
        }
    }

    return -1;

}

function inBetween(left, right, center) {
    return center >= left && center <= right;
}

module.exports = {
    getRoute: getRoute,
    getEmbed: getEmbed
};