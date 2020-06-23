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
    id: params.PROLIFIC_PID
  }

  var condition = {
    id: params.condition
  }

  // Initialize a variable to store experiment information
  // TODO: Add more experiment parameters here if needed.
  var experimentData = {
    id: params.STUDY_ID
  }

  // This function adds data to jsPsych's internal representation of the
  // experiment. Can be called at any time.
  this.addPropertiesTojsPsych = function () {
    jsPsych.data.addProperties({
      participantId: participant.id, condition: condition.id
    });
  }

  this.setStorageLocation = function() {

    var currentDate = new Date();
    var prettyDate = [currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      currentDate.getDate()].join('-');

    var timestamp_msec = currentDate.getTime();

    filename = 'MICRaxb' + '/' + prettyDate + '/' + participant.id + '_' + timestamp_msec + '.csv';
    experimentData.storageLocation = firebaseStorage.ref().child('results/' + filename);

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
    initPractice();
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
      url: "micr.axb.consent.html",
      cont_btn: "start",
      check_fn: check_consent
    };
    timeline.push(informedConsent);

    var studyInstructions1 = {
      type: 'instructions',
      pages: params.prepInstructionText,
      key_forward: ' ',
      show_clickable_nav: true  // shows both previous and next buttons
    }
    timeline.push(studyInstructions1);

    /**** Audio/Headphone test *****/

    var toneTest = {
      timeline: [
          {
              type: 'html-keyboard-response',
              stimulus: params.fixationCross,
              choices: jsPsych.NO_KEYS,
              trial_duration: 500,
              post_trial_gap: 0,
              data: {trialType: 'fixation'},
          },
          {
              type: 'audio-button-response',
              prompt: "<p>Which sound is the quietest?</p>",
              stimulus: jsPsych.timelineVariable('tone'),
              choices: ['FIRST sound is QUIETEST', 'SECOND sound is QUIETEST', 'THIRD sound is QUIETEST'],
              // button_html: '%choice%',
              margin_vertical: '100px',
              data: jsPsych.timelineVariable('data'),
              post_trial_gap: 0,
              on_finish: function(data){
                data.correct = data.button_pressed == data.corAns
              }
          },
      ],
        timeline_variables: [
          { tone: '../../src/audio/toneTest_1.wav', data: {trialType: 'tonetest', corAns: 2}},
          { tone: '../../src/audio/toneTest_2.wav', data: {trialType: 'tonetest', corAns: 1}},
          { tone: '../../src/audio/toneTest_3.wav', data: {trialType: 'tonetest', corAns: 2}},
          { tone: '../../src/audio/toneTest_4.wav', data: {trialType: 'tonetest', corAns: 1}},
          { tone: '../../src/audio/toneTest_5.wav', data: {trialType: 'tonetest', corAns: 0}},
          { tone: '../../src/audio/toneTest_6.wav', data: {trialType: 'tonetest', corAns: 0}}
      ],
      sample: {
        type: 'with-replacement',
        size: 6, // 10 trials, with replacement
      }
    }
    timeline.push(toneTest);


    var debrief_block = {
      type: "html-keyboard-response",
      choices: " ",
      stimulus: function() {

        var trials = jsPsych.data.get().filter({trialType: 'tonetest'});
        var correct_trials = trials.filter({correct: true}).count();

        return "<div class=\"vertical-center\"><p><b>Your score was "+correct_trials+"/6.</b></p><p>If you scored below 6, please ensure that you are wearing headphones and in a quiet location free of distractions.</p><p><i>To continue to the main experiment, press SPACE.</i></p></div>";
      }
    }
    timeline.push(debrief_block);

    /**** Pre-Awareness Survey *****/

    // var shortSurvey = {
    //   type: 'survey-text',
    //   preamble: 'Please answer a few questions about your experiences with Michigan and Canadian English.',
    //   // preamble: 'Please answer a few questions about your demographic and language background.',
    //   questions: [
    //     // {prompt: "What is your age?", name: 'Age', placeholder: "35"},
    //     // {prompt: "What gender do you identify as?", name: 'Gender', placeholder: "female"},
    //     // {prompt: "Where did you spend most of your time before age 18?", name: 'GrewUp', placeholder: "City/Town, State/Province, Country"},
    //     // {prompt: "Where is/are your native language(s)?", name: 'nativeLang', placeholder: "English"},
    //     {prompt: "Can you tell if someone is from Michigan or from Canada based only on the way they speak? <br> How likely are you to be able to identify someone as being from Canada?", name: 'IK1', rows: 6, columns: 80},
    //     {prompt: "Please explain what differences you think there are between Michigan and Canadian English.", name: 'EK1', rows: 6, columns: 80}
    //   ],
    // }
    // timeline.push(shortSurvey);

    /* Enter fullscreen mode for trials */
    timeline.push({
      type: 'fullscreen',
      fullscreen_mode: true
    });

    }

    /**** Practice trials *****/

  var initPractice = function() {

    var studyInstructions2 = {
      type: 'instructions',
      pages: params.mainInstructionText,
      key_forward: ' ',
      show_clickable_nav: false  // shows both previous and next buttons
    }
    timeline.push(studyInstructions2);

    var speakerInfoScreen = {
      type: "html-keyboard-response",
      stimulus: "<div class=\"vertical-center\"><p>The speaker you are about to hear is from Buffalo, New York.</p><p> <br> <i>Press SPACE to continue.</i></p></div>",
      choices: [" "],
      // trial_duration: 500,
      post_trial_gap: 0,
    }
    timeline.push(speakerInfoScreen);

    var promptScreen = {
      type: "html-keyboard-response",
      stimulus: params.axbText,
      choices: jsPsych.NO_KEYS,
      trial_duration: 500,
      post_trial_gap: 0,
    }

    var wordAudio = {
      type: "audio-keyboard-response",
      stimulus: jsPsych.timelineVariable('wordStim'),
      prompt: params.axbText,
      choices: ["1","0"],
      trial_ends_after_audio: false,
      post_trial_gap: 500,
      data: jsPsych.timelineVariable('data'),
    }

    var trial_procedure = {
      timeline: [promptScreen, wordAudio],
      timeline_variables: [
      { wordStim: 'resources/audio/practiceStim/S1_AU_14_axb.wav', data: {trialType: 'practice', vowel: 'AU'}},
      { wordStim: 'resources/audio/practiceStim/S1_AU_14_bxa.wav', data: {trialType: 'practice', vowel: 'AU'}},
      { wordStim: 'resources/audio/practiceStim/S1_AI_21_axb.wav', data: {trialType: 'practice', vowel: 'AI'}},
      { wordStim: 'resources/audio/practiceStim/S1_AI_21_bxa.wav', data: {trialType: 'practice', vowel: 'AI'}}
      ],
      randomize_order: true,         // Randomize using timeline chunk options
      repetitions: 1
    }
    timeline.push(trial_procedure);

    var studyInstructions3 = {
      type: 'instructions',
      pages: params.finalInstructionText,
      key_forward: ' ',
      show_clickable_nav: false  // shows both previous and next buttons
    }
    timeline.push(studyInstructions3);

  }

  /***************************
  * Trials
  ****************************/

  // This is the main function used to create a set of trials.
  // In a more complex experiment, you might want to make additional functions,
  // such as "initBlock()" to create experiment blocks, or initPractice() to
  // create a practice phase.
  var initTrials = function(blockName) {

    /* Define the trial components  */
    var promptScreen = {
      type: "html-keyboard-response",
      stimulus: params.axbText,
      choices: jsPsych.NO_KEYS,
      trial_duration: 500,
      post_trial_gap: 0,
    }

    var wordAudio = {
      type: "audio-keyboard-response",
      stimulus: jsPsych.timelineVariable('wordStim'),
      prompt: params.axbText,
      choices: ["1","0"],
      trial_ends_after_audio: false,
      post_trial_gap: 500,
      data: jsPsych.timelineVariable('data'),
      on_finish: function() {
        var testTrials = jsPsych.data.get().filter({trialType: 'test'});
        var trialNum = testTrials.count();
        console.log(trialNum)
      },
    }

    /* Define break */
    var breakScreen = {
      type: 'html-keyboard-response',
      stimulus: params.breakMessage,
      choices: [" "],
    }

    /* Trial-based breaks */
    var ifthenBreak = {
        timeline: [breakScreen],
        conditional_function: function(){
          // Get number of test trials thus far
          var testTrials = jsPsych.data.get().filter({trialType: 'test'});
          var trialNum = testTrials.count();

          // Set last trial and break intervals here
          // TODO: Change values as needed
          var lastTrialNum = 8
          var breakInterval = 4

          // If trial number is divisiable by block break value, AND if it is not the last trial, show the break screen; else don't
          if(trialNum % breakInterval === 0){
            if(trialNum !== lastTrialNum){
              return true;
            } else {
              return false;
              }
            } else {
            return false;
          }
        }
    }

    /* Define stimuli details */
    // console.log(params[blockName]);
     var stimuli = params[blockName];

        /* Parse stimuli data */
        // Parse the data string into a JavaScript object that can be read as columns in the output Data
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
      timeline: [promptScreen, wordAudio], // add ifthenBreak to timeline if trial-based breaks
      timeline_variables: stimuli,
      randomize_order: true,         // Randomize using timeline chunk options
      repetitions: 1
    }
    timeline.push(trial_procedure);

  }


  /***************************
  * Blocks
  ****************************/

  var initBlock = function(block, numBlocks, i) {

    /* Define block procedure */

    var speakerInfoScreen = {
      type: "html-keyboard-response",
      stimulus: block.speakerInfo,
      choices: [" "],
      // trial_duration: 500,
      post_trial_gap: 0,
    }
    timeline.push(speakerInfoScreen);

    initTrials(block.blockName)

    var breakScreen = {
      type: 'html-keyboard-response',
      stimulus: params.breakMessage,
      choices: [" "],
    }

    /* Block-based breaks */
    /* Add break between blocks except for last
    */
    if(i < numBlocks - 1) {
      timeline.push(breakScreen);
    }

  }


  /***************************
  * Conditions & Blocks
  ****************************/

  var initBlocks = function() {




    /* Define condition */
    /* Conditions will be set in the URL flag
     * e.g. experiments/MICRpp/micr.pp.exp.html?condition=condA
     * The jsPsych.data.urlVariables() function in runner.js sends this flag information to params
     * Call params.condition to retrieve the condition variable name (e.g. condA)
    */
    condition = params.condition
    console.log(params.condition)
    condBlocks = "blocks"

    /* Define blocks */
    /* Use ordered blocks (no randomization) OR */
    var blocksList = params[condition][condBlocks]
    console.log(params[condition][condBlocks])
    numBlocks = blocksList.length

    // Randomize the blocks into a shuffled block list
    // var blocksList = jsPsych.randomization.shuffle(params[condition][condBlocks])

    /* For each block in the shuffledBlocks list,  (Underscore for loop)
     * Pass blockName into the trials function --i.e. run trials using
     * stimuli from that blockName
     * (Trials are pushed to main timeline within iniTrials())
     * Then, if not the final block, run the break screen
    */

  _.each(blocksList, function(block, i) {
    initBlock(block, numBlocks, i);


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

    /* exit full screen mode for trials
    */
    timeline.push({
      type: 'fullscreen',
      fullscreen_mode: false
    });

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
        on_start: function() {
          // HTTP redirect:
          window.location.replace("https://umich.qualtrics.com/jfe/form/SV_b4bDMP9ZW7PuTzL?PROLIFIC_PID="+participant.id);
        },
        type: "html-keyboard-response",
        choices: jsPsych.NO_KEYS,
        stimulus: "<div class=\"vertical-center\"><p>You are being redirected to the surveys on Qualtrics.com.</p><p>If you are not redirected in 5 seconds, please click this link: https://umich.qualtrics.com/jfe/form/SV_b4bDMP9ZW7PuTzL?PROLIFIC_PID="+participant.id+".</p></div>."
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


/* Other trials

// var primeImage = {
//   type: 'html-keyboard-response',
//   stimulus: jsPsych.timelineVariable('facePrime'),
//   choices: jsPsych.NO_KEYS,
//   trial_duration: 500,
//   post_trial_gap: 0,              // no post_trial_gap so that images display across trials seamlessly
// }

// var sentenceAudio = {
//   type: "audio-keyboard-response",
//   stimulus: jsPsych.timelineVariable('sentStim'),
//   prompt: jsPsych.timelineVariable('facePrime'),
//   // choices: jsPsych.NO_KEYS,
//   trial_ends_after_audio: true,
//   post_trial_gap: 0,              // no post_trial_gap so that images display across trials seamlessly
//   choices: [" "],                 // for testing purposes only
//   response_ends_trial: true,      // for testing purposes only
// }

// var keyResponse = {
//   type: "html-keyboard-response",
//   stimulus: params.keyChoiceText,
//   choices: ["1","0"],
//   post_trial_gap: 0,              // no post_trial_gap so that isi times are exact
//   data: jsPsych.timelineVariable('data')
// }

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


*/
