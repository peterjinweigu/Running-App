/* server/databaseEngine.js */

// const KEYS = require("./key.js");
const serviceAccount = require("./service-account-key.json");

// Initialize Firebase
const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

/**
 * Data Model
 * One collection "routes"
 * 
 * Multiple documents called route_x
 * where x is the nth added route
 * route has a field called loop
 * loop: 
 * {
 *      distance: distance
 *      points: points
 * }
 * 
 * One document called routeCount
 * with field count: number of routes
 */

/**
 * query related datasets and return result
 * @param {*} distance 
 * @param {*} error 
 * @returns 
 */
async function queryRelatedRoutes(distance, error) {
    const q = await db.collection("routes")
                      .where("distance", ">=", distance - error)
                      .where("distance", "<=", distance + error)
                      .get();
    ret = [];
    q.forEach((doc) => {
        ret.push(
            {
                distance: doc.data().distance,
                points: doc.data().points
            }
        )
    })
    return ret;
}

/**
 * write a dataset into the database
 * @param {*} lat 
 * @param {*} long 
 * @param {*} distance 
 * @param {*} points 
 */
async function writeRoute(distance, points) {
    // Firestore wants array of JSON unfortunately
    pts = [];
    points.forEach((point) => {
        pts.push({
            lat: point[0],
            long: point[1]
        })
    })
    try {
        const docRef = db.collection("routes").doc("routeCount");
        const doc = await docRef.get();

        const data = doc.data();
        const count = data.count + 1;

        const newDocRef = db.collection("routes").doc("route_" + count);

        await newDocRef.set({
            distance: distance,
            points: pts
        });

        await docRef.set({
            count: count
        })
        console.log("Document written with ID: ", docRef.id);
        console.log("Document written with ID: ", newDocRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

module.exports = {
    read: queryRelatedRoutes,
    write: writeRoute
};