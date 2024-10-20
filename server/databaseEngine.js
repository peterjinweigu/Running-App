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
 * One document "loops"
 * "loops" contains one field
 * loops: array of loops formatted as JSON
 * {
 *      distance: distance
 *      points: points
 * }
 */

/**
 * return suitable match if found
 */
async function readData() {
    return -1;
}

/**
 * write a dataset into the database
 * @param {*} lat 
 * @param {*} long 
 * @param {*} distance 
 * @param {*} points 
 */
async function writeData(distance, points) {
    // Firestore wants array of JSON unfortunately
    pts = [];
    points.forEach((point) => {
        pts.push({
            lat: point[0],
            long: point[1]
        })
    })
    try {
        const docRef = db.collection("routes").doc("loops");
        await docRef.update({
            loops: admin.firestore.FieldValue.arrayUnion(
                {
                    distance: distance,
                    points: pts
                }
            )
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

module.exports = {
    read: readData,
    write: writeData
};