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
      participantId: participant.id, conditionId: condition.id
    });
    console.log(participant.id);
    console.log(condition.id);
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
      initBlock("guise1");
      initHalfway();
      initBlock("guise2");
      initPostExperiment();
      // console.log(timeline)
    }


    /************************************************************************
    * EXPERIMENT CONTENT
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

      /**** Informed consent *****/

      var informedConsent = {
        type:'external-html',
        url: "micr.axb.consent.html",
        data: {trial_role: 'consent'},
        cont_btn: "start",
        check_fn: check_consent
      };
      timeline.push(informedConsent);

      /**** Instructions *****/

      var studyInstructions1 = {
        type: 'instructions',
        pages: params.prepInstructionText,
        key_forward: ' ',
        data: {trial_role: 'instructions'},
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
                data: {trial_role: 'fixation'},
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
                  data.correct_response = data.button_pressed == data.correct_answer
                }
            },
        ],
          timeline_variables: [
            { tone: '../../src/audio/toneTest_1.wav', data: {trial_role: 'tonetest', correct_answer: 2}},
            { tone: '../../src/audio/toneTest_2.wav', data: {trial_role: 'tonetest', correct_answer: 1}},
            { tone: '../../src/audio/toneTest_3.wav', data: {trial_role: 'tonetest', correct_answer: 2}},
            { tone: '../../src/audio/toneTest_4.wav', data: {trial_role: 'tonetest', correct_answer: 1}},
            { tone: '../../src/audio/toneTest_5.wav', data: {trial_role: 'tonetest', correct_answer: 0}},
            { tone: '../../src/audio/toneTest_6.wav', data: {trial_role: 'tonetest', correct_answer: 0}}
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
        data: {trial_role: 'instructions'},
        stimulus: function() {

          var trials = jsPsych.data.get().filter({trial_role: 'tonetest'});
          var correct_trials = trials.filter({correct_response: true}).count();

          return "<div class=\"vertical-center\"><p><b>Your score was "+correct_trials+"/6.</b></p><p>If you scored below 6, please ensure that you are wearing properly functioning headphones and in a quiet location free of distractions.</p><p><i>To continue to the main experiment, press SPACE.</i></p></div>";
        }
      }
      timeline.push(debrief_block);


      /* Enter fullscreen mode for trials */
      timeline.push({
        type: 'fullscreen',
        fullscreen_mode: true
      });

      }

      /**** Pre-Awareness Survey *****/

      // TODO: ADD INSTRUCTIONS HERE + MODIFY PREVIOUS INSTRUCTIONS

      // var shortSurvey = {
      //   type: 'survey-text',
      //   preamble: 'Before we begin the experiment, please answer a few questions about your experiences with Michigan and Canadian English.',
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

      /***************************
      * Practice Trials
      ****************************/

    var initPractice = function() {

  /**** Main Task Instructions *****/

      var studyInstructions2 = {
        type: 'instructions',
        pages: params.mainInstructionText,
        data: {trial_role: 'instructions'},
        key_forward: ' ',
        show_clickable_nav: false  // shows both previous and next buttons
      }
      timeline.push(studyInstructions2);

  /**** Practice Trials *****/

      var speakerInfoScreen = {
        type: "html-keyboard-response",
        stimulus: "<div class=\"vertical-center\"><p>The speaker you are about to hear is from Buffalo, New York.</p><p> <br> <i>Press SPACE to continue.</i></p></div>",
        choices: [" "],
        post_trial_gap: 0,
      }
      timeline.push(speakerInfoScreen);

      var promptScreen = {
        type: "html-keyboard-response",
        stimulus: params.axbText,
        choices: jsPsych.NO_KEYS,
        trial_duration: 500,
        post_trial_gap: 0,
        data: {trial_role: 'fixation'},
      }

      var wordAudio = {
        type: "audio-keyboard-response",
        stimulus: jsPsych.timelineVariable('wordStim'),
        prompt: params.axbText,
        choices: ["1","0"],
        trial_ends_after_audio: false,
        post_trial_gap: 500, // + 500ms prompt = 1000ms total ITI
        data: {trial_role: jsPsych.timelineVariable('trial_role'), vowel: jsPsych.timelineVariable('vowel')},
      }

      var stimInfo = [
        { wordStim: 'resources/audio/practiceStim/S1_AU_14_axb_Step-6.wav', trial_role: 'practice'},
        { wordStim: 'resources/audio/practiceStim/S1_AU_14_bxa_Step-6.wav', trial_role: 'practice'},
        { wordStim: 'resources/audio/practiceStim/S1_AI_21_axb_Step-6.wav', trial_role: 'practice'},
        { wordStim: 'resources/audio/practiceStim/S1_AI_21_bxa_Step-6.wav', trial_role: 'practice'}
      ]

      var trial_procedure = {
        timeline: [promptScreen, wordAudio],
        timeline_variables: stimInfo,
        randomize_order: true,         // Randomize using timeline chunk options
        repetitions: 1
      }
      timeline.push(trial_procedure);

      var studyInstructions3 = {
        type: 'instructions',
        pages: params.finalInstructionText,
        data: {trial_role: 'instructions'},
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
    // var initTrials = function(blockName) {
    var initTrials = function(guiseName) {

  /**** Actual Trials *****/

      /* Define the static trial components  */
      var promptScreen = {
        type: "html-keyboard-response",
        stimulus: params.axbText,
        choices: jsPsych.NO_KEYS,
        trial_duration: 500,
        post_trial_gap: 0,
        data: {trial_role: 'fixation'},
      }

//  DONE! TODO: Update data columns and timeline variable names
      var wordAudio = {
        type: "audio-keyboard-response",
        stimulus: jsPsych.timelineVariable('wordStim'),
        prompt: params.axbText,
        choices: ["1","0"],
        trial_ends_after_audio: false,
        post_trial_gap: 500, // + 500ms prompt = 1000ms total ITI
        data: {trial_role: jsPsych.timelineVariable('trial_role'),
              wordStim: jsPsych.timelineVariable('wordStim'),
              speaker: jsPsych.timelineVariable('speaker'),
              vowel: jsPsych.timelineVariable('vowel'),
              sentNum: jsPsych.timelineVariable('sentNum'),
              order: jsPsych.timelineVariable('order'),
              step: jsPsych.timelineVariable('step'),
              speakerIdentity: jsPsych.timelineVariable('speakerIdentity'),
              speakerGuise: jsPsych.timelineVariable('speakerGuise'),
              guiseName: jsPsych.timelineVariable('guiseName'),
              raised_answer: jsPsych.timelineVariable('raised_answer')
      },
        on_finish: function(data) {
          data.key_response = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
          data.raised_response = data.key_response == data.raised_answer;
          var testTrials = jsPsych.data.get().filter({trial_role: 'test'});
          var trialNum = testTrials.count();
          console.log(trialNum)
        },
      }

      /**** Trial-based Breaks *****/

      /* Define break screen */
      var breakScreen = {
        type: 'html-keyboard-response',
        stimulus: params.breakMessage,
        choices: [" "],
        data: {trial_role: 'break'},
      }

      /* Setting up Trial-based breaks conditional function */
      var ifthenBreak = {
          timeline: [breakScreen],
          conditional_function: function(){
            // Get number of test trials thus far
            var testTrials = jsPsych.data.get().filter({trial_role: 'test'});
            var trialNum = testTrials.count();

            // Set last trial and break intervals here
            // TODO: Change values as needed
            var lastTrialNum = 168
            var breakInterval = 21

            // If trial number is divisiable by block break value, AND if it is not the last trial, show the break screen; else don't
            if(trialNum % breakInterval === 0){
              if(trialNum !== lastTrialNum && trialNum !== lastTrialNum/2){
                return true;
              }
            } return false;
          }
        }

      /* Define stimuli details */

      // #1 If running one full set of stimuli only:
      // var stimInfo = params.audioStim;

      // #2 If running multiple conditions of stimuli:
      var stimInfo = params[guiseName];

      /* Compile the trial components  */
      var trial_procedure = {
        timeline: [promptScreen, wordAudio, ifthenBreak], // TODO: add ifthenBreak to timeline if trial-based breaks
        timeline_variables: stimInfo,
        randomize_order: true,         // Randomize using timeline chunk options
        repetitions: 1
      }
      timeline.push(trial_procedure);

    }

  /***************************
  * Conditions & Blocks
  ****************************/

/* Define the Block function */

  var initBlock = function(guiseNumber) {
    console.log(guiseNumber);

    /* Define block procedure */

    var guiseInfo = params[condition.id][guiseNumber];
    console.log(guiseInfo);

    var speakerInfoScreen = {
      type: "html-keyboard-response",
      stimulus: guiseInfo.speakerInfo,
      choices: [" "],
      post_trial_gap: 0,
    }
    timeline.push(speakerInfoScreen);

    initTrials(guiseInfo.guiseName)

  }

/* Define the Halfway Break function */

  var initHalfway = function() {

      var halfwayBreakScreen = {
        type: "html-keyboard-response",
        stimulus: params.halfwayBreakMessage,
        choices: [" "],
        post_trial_gap: 0,
        data: {trial_role: 'break'},
      }
      timeline.push(halfwayBreakScreen);

    }

  /***************************
  * Post-experiment
  ****************************/

  // Use this function to create any trials that should appear after the main
  // experiment. For example, a confirmation or thank-you page.

  var initPostExperiment = function() {

    /* exit full screen mode for trials */
    timeline.push({
      type: 'fullscreen',
      fullscreen_mode: false
    });


    var savingPage = {
        on_start: function() {
          saveDataToStorage(jsPsych.data.get().csv(), experimentData.storageLocation)
        },
        type: "html-keyboard-response",
        choices: jsPsych.NO_KEYS,
        stimulus: params.savingMessage,
        trial_duration: 5000
    };
    timeline.push(savingPage);

    var surveyPage = {
        on_start: function() {
          saveDataToStorage(jsPsych.data.get().csv(), experimentData.storageLocation)
        },
        type: "html-keyboard-response",
        choices: [" "],
        stimulus: params.surveyMessage,
    };
    timeline.push(surveyPage);

//  DONE! TODO: change this to redirect to qualtrics survey
    var redirect = {
        on_start: function() {
          // HTTP redirect:
          window.location.replace("https://umich.qualtrics.com/jfe/form/SV_b4bDMP9ZW7PuTzL?PROLIFIC_PID="+participant.id);
        },
        type: "html-keyboard-response",
        choices: jsPsych.NO_KEYS,
        stimulus: "<div class=\"vertical-center\"><p>You are being redirected to Qualtrics.com.</p><p>If you are not redirected in 5 seconds, please click this link: https://umich.qualtrics.com/jfe/form/SV_b4bDMP9ZW7PuTzL?PROLIFIC_PID="+participant.id+".</p></div>."
    };
    timeline.push(redirect);

  }

};

/**** END OF EXPERIMENT *****/
