let meterToLat = 1/(1852*60);
let maxLat = 90;
let minLat = -90

let meterToLong = 1/(1852*60);
let maxLong = 180;
let minLong = -180;

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
            console.log(pts);
        }
    }
}
    
function createNewPoint(lat, long, xShift, yShift) {
    let newLat = lat + xShift * meterToLat;
    let newLong = long + yShift * meterToLong;

    if (newLat > maxLat) newLat = maxLat - (newLat - maxLat);
    else if (newLat < minLat) newLat = minLat + (minLat - newLat);
        
    if (newLong > maxLong) newLong = minLong + (newLong - maxLong);
    else if (newLong < minLong) newLong = maxLong - (minLong - newLong);
        
    return [newLat, newLong];
}

getRoute(20, 20, 3000);