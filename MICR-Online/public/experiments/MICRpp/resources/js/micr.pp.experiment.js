

// experiment.js

// This file defines the Experiment object that is initialized in runner.js.
// The experiment's timeline and trials live here.

// Stimuli are defined in data/stimuli.json. This file is loaded by runner.js.
// The contents of this file are passed to the params variable of the
// Experiment object.

function Experiment(params, firebaseStorage) {

  // Initialize the experiment timeline
  var timeline = [];

  /*************************************************************************
  * CUSTOMIZEABLE HELPER FUNCTIONS - EDIT AS NEEDED
  **************************************************************************/

  /******************
   * Experiment flow
   ******************/

  // Function to be called by jsPsych at the very end of the experiment
  // If you are using Prolific, you should use this function to redirect
  // participants to the page Prolific specifies.
  this.onFinish = function() {
    // TODO: Add Prolific or other redirects here
  }


  /******************
   * Data storage
   ******************/

  // Initialize a variable to store participant information
  // TODO: Add more participant parameters here if needed.
  var participant = {
    id: params.participantId
  }

  // Initialize a variable to store experiment information
  // TODO: Add more experiment parameters here if needed.
  var experimentData = {
    id: params.experimentId
  }

  // This function adds data to jsPsych's internal representation of the
  // experiment. Can be called at any time.
  this.addPropertiesTojsPsych = function () {
    jsPsych.data.addProperties({
      participantId: participant.id
    });
  }

  this.setStorageLocation = function() {

    var currentDate = new Date();
    var prettyDate = [currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      currentDate.getDate()].join('-');

    filename = experimentData.id + prettyDate + '/' + participant.id + '.csv'
    experimentData.storageLocation = firebaseStorage.ref().child(filename);

  }


  /******************
   * Getter functions
   ******************/

  this.getParticipantId = function() { // Return current participant's ID
    return participant.id;
  }
  this.getExperimentId = function() {  // Return experiment's ID
    return experimentData.id;
  }
  this.getTimeline = function() {      // Return the timeline
    return timeline;
  }
  this.getAudio = function() {         // Return list of audio files
      return params.audio;
    }
  this.getImages = function() {         // Return list of image files
      return params.images;
    }

  /**************************************************************************
  * BUILD THE TIMELINE
  ***************************************************************************/

  // This function builds the full experiment timeline using your individual
  // init functions. By building different phases of the experiment with their
  // own init functions, it is easy to turn on and off different parts of the
  // experiment during testing.

  this.createTimeline = function() {
    initPreExperiment();
    // initTrials();
    initBlocks();
    initPostExperiment();
    console.log(timeline)
  }


  /************************************************************************
  * EXPERIMENT BLOCKS
  *************************************************************************/

  /***************************
  * Preparation
  ****************************/

  // Function to check if a subject has given consent to participate.
  // Used in informedConsent trial below
  var check_consent = function(elem) {
    if (document.getElementById('consent_checkbox').checked) {
      return true;
    }
    else {
      alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
      return false;
    }
    return false;
  };

  /***************************
  * Pre-experiment
  ****************************/

  // Use this function to create any trials that should appear before the main
  // experiment. For example, instructions.
  var initPreExperiment = function() {

    var informedConsent = {
      type:'external-html',
      url: "micr.pp.consent.html",
      cont_btn: "start",
      check_fn: check_consent
    };
    timeline.push(informedConsent);

    var studyInstructions = {
      type: 'instructions',
      pages: params.instructionText,
      key_forward: ' ',
      // show_clickable_nav: true  // shows both previous and next buttons
    }
    timeline.push(studyInstructions);

  }


  /***************************
  * Trials
  ****************************/

  // This is the main function used to create a set of trials.
  // In a more complex experiment, you might want to make additional functions,
  // such as "initBlock()" to create experiment blocks, or initPractice() to
  // create a practice phase.
  var initTrials = function(blockName) {

    // // Enter fullscreen mode for trials
    // timeline.push({
    //   type: 'fullscreen',
    //   fullscreen_mode: true
    // });

    /* Define the trial components  */
    var primeImage = {
      type: 'html-keyboard-response',
      stimulus: jsPsych.timelineVariable('facePrime'),
      choices: jsPsych.NO_KEYS,
      trial_duration: 500,
      post_trial_gap: 0,              // no post_trial_gap so that images display across trials seamlessly
    }

    var sentenceAudio = {
      type: "audio-keyboard-response",
      stimulus: jsPsych.timelineVariable('sentStim'),
      prompt: jsPsych.timelineVariable('facePrime'),
      // choices: jsPsych.NO_KEYS,
      trial_ends_after_audio: true,
      post_trial_gap: 0,              // no post_trial_gap so that images display across trials seamlessly
      choices: [" "],                 // for testing purposes only
      response_ends_trial: true,      // for testing purposes only
    }

    // var wordAudio = {
    //   type: "audio-keyboard-response",
    //   stimulus: jsPsych.timelineVariable('wordStim'),
    //   prompt: jsPsych.timelineVariable('facePrime'),
    //   choices: jsPsych.NO_KEYS,
    //   trial_ends_after_audio: true,
    //   post_trial_gap: 0,              // no post_trial_gap so that images display across trials seamlessly
    // }

    var keyResponse = {
      type: "html-keyboard-response",
      stimulus: params.keyChoiceText,
      choices: ["1","0"],
      post_trial_gap: 0,              // no post_trial_gap so that isi times are exact
      data: jsPsych.timelineVariable('data')
    }

    // var ratingResponse = {
    //   type: "html-slider-response",
    //   stimulus: "",
    //   prompt: params.sliderPromptText,
    //   labels: ["1","2","3","4","5","6","7"],
    //   min: 1,
    //   max: 7,
    //   start: 4,
    //   step: 1,
    //   slider_width: 400,
    //   response_ends_trial: true,
    //   post_trial_gap: 0,              // no post_trial_gap so that isi times are exact
    //   data: jsPsych.timelineVariable('data'),
    // }

    /* Define stimuli */
    //var stimuli = params.MIB1
    // console.log(params[blockName]);
     var stimuli = params[blockName];
    // var stimuli = jsPsych.randomization.shuffle(params.trialStim) // Randomize manually using jsPsych.randomization

        /* Parse stimuli data */
        // Parse the data string into a JavaScript object that can be read as columns in the output Data
        // Due to creation through R, the nested data structure was not possible;
        // Thus, a string of key-value pairs were listed; this function then parses that string into JS
        // This can then be read as a nested object that creates data columns in the output
        // The function first splits the string (by ', ') into keyValues pairs; then splits those by ":"
        _.each(stimuli, function(stimulus) {
          // console.log(stimulus);
          var parsedData = stimulus.data.split(', ');
          var obj = {};
          _.each(parsedData, function(keyValuePair) {
            // console.log(keyValuePair);
            var tup = keyValuePair.split(':');
            obj[tup[0]] = tup[1];
            // console.log(obj)
          });
          stimulus.data = obj;
        });
        // console.log(stimuli);

    /* Compile the trial components  */
    var trial_procedure = {
      timeline: [primeImage, sentenceAudio, keyResponse],
      timeline_variables: stimuli,
      randomize_order: true,                                          // Randomize using timeline chunk options
      // repetitions: 1
    }
    timeline.push(trial_procedure);


  //   // exit full screen mode for trials
  //   timeline.push({
  //     type: 'fullscreen',
  //     fullscreen_mode: false
  //   });
  }


  /***************************
  * Conditions & Blocks
  ****************************/

  var initBlocks = function() {

    // Enter fullscreen mode for trials
    timeline.push({
      type: 'fullscreen',
      fullscreen_mode: true
    });

    /* Define break */
    var breakScreen = {
      type: 'html-keyboard-response',
      stimulus: params.breakMessage,
      choices: [" "],
    }

    /* Define condition */
    // Conditions will be set in the URL flag
    // e.g. experiments/MICRpp/micr.pp.exp.html?condition=condA
    // The jsPsych.data.urlVariables() function in runner.js sends this flag information to params
    // Call params.condition to retrieve the condition variable name (e.g. condA)
    condition = params.condition
    console.log(params.condition)
    condBlocks = "blocks"

    /* Define blocks */
    // Use ordered blocks (no randomization) OR
    var blocksList = params[condition][condBlocks]
    console.log(params[condition][condBlocks])

    // Randomize the blocks into a shuffled block list
    // var blocksList = jsPsych.randomization.shuffle(params[condition][condBlocks])

    /* Define block procedure */
    // For each block in the shuffledBlocks list,  (Underscore for loop)
    // Pass blockName into the trials function --i.e. run trials using stimuli from that blockName
    // (Trials are pushed to main timeline within iniTrials())
    // Then, if not the final block, run the break screen
    _.each(blocksList, function(block, i) {
      initTrials(block.blockName, i);
      if(i < blocksList.length - 1) { // add break between block except for last block
        timeline.push(breakScreen);
      }
    });

      // exit full screen mode for trials
      timeline.push({
        type: 'fullscreen',
        fullscreen_mode: false
      });

  }

  /***************************
  * Post-experiment
  ****************************/

  // Use this function to create any trials that should appear after the main
  // experiment. For example, a confirmation or thank-you page.

  var initPostExperiment = function() {

    /* Include this if have a short/simply survey; otherwise, redirect to survey on Qualtrics

      var shortSurvey = {
        type: 'survey-text',
        preamble: 'Please answer a few questions about your demographic and language background.',
        questions: [
          {prompt: "What is your age?", name: 'Age'},
          {prompt: "What gender do you identify as?", name: 'Gender'},
          {prompt: "Where is/are your native language(s)?", name: 'nativeLang'}
        ],
      }
      timeline.push(shortSurvey);

    */

    var thankYou = {
        on_start: function() {
          saveDataToStorage(jsPsych.data.get().csv(), experimentData.storageLocation)
        },
        type: "html-keyboard-response",
        choices: [" "],
        stimulus: params.surveyMessage,
        // stimulus: params.completionMessage,
    };

    timeline.push(thankYou);

    var redirect = {
        type: "html-keyboard-response",
        stimulus: params.redirectQualtrics,
        // stimulus: params.redirectProlific,
    };

    timeline.push(redirect);

  }

};


/* Sample Intro
    var welcome = {
        type: "html-keyboard-response",
        stimulus: "<p>Welcome to the experiment. Press any key to begin.</p>"
    };

    timeline.push(welcome);

    var instructions = {
      type: "html-keyboard-response",
      stimulus: "<p>This is a sample experiment.</p>" +
                "<p>Press any key to begin.</p>",
      post_trial_gap: 2000
    };

    timeline.push(instructions);
*/

/* Sample Trials

    var stimuli = params.stimuli

    var fixation = {
      type: 'html-keyboard-response',
      stimulus: '<div style="font-size:60px;"><p>+</p></div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
    }

    var test = {
      type: "html-keyboard-response",
      stimulus: jsPsych.timelineVariable('stimulus'),
      prompt: "Press F or J.",
      choices: ['f', 'j']
    }

    var testProcedure = {
      timeline: [fixation, test],
      timeline_variables: stimuli
    }

    timeline.push(testProcedure);
*/
