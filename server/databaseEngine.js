/* server/databaseEngine.js */

// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
// import { getAnalytics } from "firebase/analytics";

const KEYS = require("./key.js");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(KEYS.FIREBASE_CONFIG);
const dataBase = getFirestore(app);
// const analytics = getAnalytics(app);

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
async function writeData(lat, long, distance, points) {
    return -1;
}

module.exports = {
    read: readData,
    write: writeData
};