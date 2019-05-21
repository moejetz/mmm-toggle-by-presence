/* Magic Mirror
 * Node Helper: mmm-toggle-by-presence
 *
 * By Moritz Kraus
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var shell = require('shelljs');
const { spawn } = require('child_process');
var watch = require('node-watch');
var fs = require('fs');

const MODULE_NAME = 'mmm-toggle-by-presence'; // module name
const SOCKET_NOTIFICATION_KEY = 'mmm-toggle-by-presence-notification-key'; // socket communication key


module.exports = NodeHelper.create({

	// Control flow params, settable via MagicMirror2 config
	updateInterval: 500, // Update interval for presence detection
	detectionTimeout: 10000, // Mirror will be turned off if no detection in this timespan
    validRange: 40, // The range in cm where a person is detected
    debug: true, // Show debug output of range detector

    // Internal variables
	lastDetection: 0, // last detection timestamp
	now: 0, // current timestamp
	oldDetectionState: false, // current (old) detection state
	newDetectionState: false, // new detection state
	isHdmiOn: true, // indicator for power state of HDMI monitor
	isPresenceDetectionStarted: false,


	// @Override MagicMirror module functions
	// Used for initialisation. Read and set config overrides, then start presence detection as singleton.
	socketNotificationReceived: function(notification, payload) {

		console.log(MODULE_NAME + ': received a socket notification. Key: ' + notification + ' - payload:', payload);

        if(notification !== SOCKET_NOTIFICATION_KEY) {
            console.log(MODULE_NAME + ': wrong socket communication key. Ignoring...');
            return;
        }

        if(this.isPresenceDetectionStarted) {
            console.log(MODULE_NAME + ': ignoring new config data because the presence detection has already been started.');

        } else {
			// set config overrides
			if(payload.hasOwnProperty('updateInterval')) this.updateInterval = payload.updateInterval;
			if(payload.hasOwnProperty('detectionTimeout')) this.detectionTimeout = payload.detectionTimeout;
			if(payload.hasOwnProperty('validRange')) this.validRange = payload.validRange;
            if(payload.hasOwnProperty('debug')) this.debug = payload.debug;

			// start presence detection
			this.startPresenceDetection();
		}
	},

	startPresenceDetection: function () {

		var self = this;
		if(self.updateInterval >= 500) {
			console.log(MODULE_NAME + ': START PRESENCE DETECTION. Interval: ' + self.updateInterval + "ms");
		} else {
			self.updateInterval = 500;
			console.log(MODULE_NAME + ': START PRESENCE DETECTION. Interval reset to 500ms (min value)');
		}

		self.isPresenceDetectionStarted = true;

		// Start range detector
		var rangeDetector = spawn(__dirname + '/range_detector/./Range', [self.updateInterval]);
		/*
		rangeDetector.stdout.on('data', (data) => {console.log(`stdout: ${data}`);});
		rangeDetector.stderr.on('data', (data) => {console.log(`stderr: ${data}`);});
		rangeDetector.on('close', (code) => {console.log(`child process exited with code ${code}`);});
		*/

		console.log(MODULE_NAME + ': PRESENCE DETECTION STARTED.');

		var watcher = watch(__dirname + '/range_detector/detection_state');
	    watcher.on('change', function(evt, name) {

			fs.readFile(name, 'utf8', function (err, data) {
				if (err) {
					return console.log(err);
	        	}

	        	self.analyzeDistance(self, data);

	        });

	    });

	},



	analyzeDistance: function(self, distance) {

		try {

            if(!distance || distance === undefined) distance = 0; // fix in case the sensor did not send a valid value

            self.logDebug(self, 'current distance is ' + distance + 'cm');
			self.newDetectionState = distance < self.validRange;
	      	self.now = new Date().getTime();

	      	if(self.oldDetectionState && (self.now-self.lastDetection) < self.detectionTimeout) {

				// Restart timeout when presence is detected
				if(self.newDetectionState) {
                    self.logDebug(self, 'presence detected. Reset timeout counter');
					self.lastDetection = self.now;

				} else {
                    self.logDebug(self, 'no presence detected. Timeout: ' + (self.now-self.lastDetection)/1000);
				}

				return;
			}

			// Timeout has finished, there was an detection state change
			if(self.oldDetectionState!=self.newDetectionState) {

				self.oldDetectionState = self.newDetectionState;

				if(self.newDetectionState) {
					self.lastDetection = self.now;
					self.hdmiTurnOn(); // make sure hdmi is turned on
	          	}

				// Publish new detection state
                self.publishState(self, self.detectionState);
			}


	    } catch (e) {
	      console.error(MODULE_NAME + ':', e);
          self.publishState(self, true); // In case of error, always return true so the mirror's display is turned on constantly
	    }

	},


    // Turn RPI HDMI output ON
	hdmiTurnOn: function() {

        this.logDebug(this, 'turn HDMI monitor ON')
		if(!this.isHdmiOn) {

			shell.exec('/opt/vc/bin/tvservice -p');
			this.isHdmiOn=true;
            this.logDebug(this, 'the HDMI display has been turned on.');

		} else {
			this.logDebug(this, 'the HDMI display has already been turned on.');
		}

	},

    // Turn RPI HDMI output ON
	hdmiTurnOff: function() {

		this.logDebug(this, 'turn HDMI monitor OFF')
		if(this.isHdmiOn) {

			shell.exec('/opt/vc/bin/tvservice -o');
			this.isHdmiOn=false;
            this.logDebug(this, 'the HDMI display has been turned off.');

		} else {
            this.logDebug(this, 'the HDMI display has already been turned off.');
		}
	},


    // Publish state to module (mmm-toggle-by-presence.js)
    publishState: function(self, state) {
        self.sendSocketNotification(SOCKET_NOTIFICATION_KEY, {detectionState: state});
    },

    // Log debug messages, if debug is enabled (enabled by default)
    logDebug: function(self, message) {
        if(self.debug) {
            console.log(MODULE_NAME + ': ' + message);
        }

    }


});
