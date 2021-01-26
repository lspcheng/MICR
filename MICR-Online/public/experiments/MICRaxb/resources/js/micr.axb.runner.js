// runner.js

// This file loads the stimuli in stimuli.json and initializes an Experiment
// object.

// The trials created by the Experiment are then sent to jsPsych,
// which runs the experiment.


/*************************************************************************
* ON DOCUMENT READY
**************************************************************************/

/* This function:
 * 1. Waits for experiment.html to be fully loaded by the browser
 * 2. Checks the database to see if the participant has completed the
 *    experiment previously
 * 3. a. If the participant is new, loads the experiment
 *    b. If the participant is not new, shows an error message
 */

 // TODO: Update default stimuli .json file name with experiment-specific name.

$( document ).ready(function() {
  database.ref('MICR').once('value', function(snapshot) {
    var count = snapshot.val().Condition;
    var expData = {count : count};
  loadStimuliAndRun("resources/stimdata/micr.axb.stimuli.json", expData);
  })
});


/*************************************************************************
* jsPSYCH RUNNER - EDIT AS NEEDED
**************************************************************************/

/* Calls jsPsych.init() to run the experiment
 *
 * experiment.getTimeline() returns the timeline created by the Experiment
 * object, which is passed to jsPsych.
 * experiment.onFinish() defines what jsPsych does once the experiment is done.
 */

function initializeJsPsych(experiment) {

  experiment.createTimeline()
  experiment.addPropertiesTojsPsych()
  experiment.setStorageLocation()

  audio = experiment.getAudio()         // gets audio for pre-loading
  images = experiment.getImages()       // gets images for pre-loading

  jsPsych.init({
    timeline: experiment.getTimeline(),
    show_progress_bar: true,
    display_element: 'jspsych-target',
    // default_iti: 500,
    show_preload_progress_bar: true,
    preload_audio: audio,
    preload_images: images,
    exclusions: {audio: true},
    on_finish: function() {
      experiment.onFinish()
    }
  });
}


/*************************************************************************
* EXPERIMENT LOADER AND HELPER FUNCTIONS
**************************************************************************/

/* Try to load the JSON file
 *
 * On success - calls returnStimuli()
 * On failure - displays an error message in the console
 */
function loadStimuliAndRun(file, expData) {
  $.getJSON(file, (function(expData) {
          return function(data) {
             initializeExperimentWithStimuli(data, expData);
          };
       }(expData))).fail(showConsoleError);
}

/* Initialize an Experiment object with loaded stimuli and storage instance
 * and send the experiment to jsPsych.
 * All URL variables are also passed to the Experiment object.
 */
function initializeExperimentWithStimuli(json, expData) {
  var experiment = new Experiment(_.extend(json, expData, jsPsych.data.urlVariables()),
    storage);
  initializeJsPsych(experiment);
}

function showConsoleError(d, textStatus, error) {
  console.error("getJSON failed, status: " + textStatus + ", error: " + error);
}

function showUserError() {
  $( '#jspsych-target' ).append($('<div>', {
     id: 'error',
     class: 'text-center',
     html: '<p>It appears that you have previously completed a study from <Lab> that used the same data as, or similar data to, the study you are attempting to complete now. Unfortunately, we cannot allow the same person to participate in an experiment more than once. We apologize for the inconvenience, but we must ask that you return your HIT now. (This will not negatively impact your ability to participate in future experiments.)</p><p>If you believe that this message is in error, you can contact the lab at <a href="mailto:labemail@gmail.com">labemail@institution.edu</a>, and we will do our best to resolve the situation.</div>'
   }));
}
