// firebase-config.js
// This file contains the data necessary to connect to your Firebase project.

/******************************************************
 * FIREBASE CONFIGURATION - EDIT WITH YOUR DATA
 ******************************************************/

 /* apiKey - The public API key of the project.
  * Can be found in the project's settings in the Firebase Console.

  * databaseURL - The URL of the project's database.
  * Can be found by navigating to the real-time database in the Firebase Console.

  * storageBucket - The URL of the project's storage bucket.
  * Can be found by navigating to Storage in the Firebase Console.
 */

var config = {
  apiKey:        "AIzaSyDbqbs0Y3GrioTOH4axgjiARQh-2d9xVog",       // TODO: Your key goes here
  databaseURL:   "https://micr-project.firebaseio.com/", // TODO
  storageBucket: "gs://micr-project.appspot.com"        // TODO
};

/******************************************************
 * FIREBASE INITIALIZATION - NO NEED TO EDIT
 ******************************************************/

firebase.initializeApp(config);

var storage  = firebase.storage();
var database = firebase.database();


/*************************************************************************
* FIREBASE HELPER FUNCTIONS
**************************************************************************/

function saveDataToStorage(filedata, dataRef, thenFunc){
    console.log("Saving progress...");
    dataRef.putString(filedata).then(thenFunc);
}

function getParticipantCompletion(participantId, experimentId) {
    return firebase.database().ref(experimentId + '/' + participantId).once('value');
}

function addParticipantToDatabase(participantId, experimentId) {
  if(participantId !== "demo") {
    var tokenRef = database.ref(experimentId + '/' + participantId);
    tokenRef.set({
        complete : 1
    });
    console.log("Added participant " + participantId + "to experiment " + experimentId + " with completion value 1.");
  }
}
