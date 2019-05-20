/* Magic Mirror
 * Node Helper: mmm-toggle-by-presence
 *
 * By Moritz Kraus
 * MIT Licensed.
 */


var NodeHelper = require("node_helper");
var shell = require('shelljs');
const { spawn } = require('child_process');
var watch = require('node-watch');
var fs = require('fs');


module.exports = NodeHelper.create({

	//control flow params
	updateInterval: 500, // update interval for presence detection
	detectionTimeout: 10000, //mirror will be turned off if no detection in this timespan
	validRange: 40, // the range in mm where a person is detected
	lastDetection: 0, // last detection timestamp
	now: 0, // current timestamp
	currentDetectionState: false, // current (old) detection state
	newDetectionState: false, // new detection state
	isHdmiOn: true, // indicator for power state of HDMI monitor
	isPresenceDetectionStarted: false,


	// @Override MagicMirror module functions
	// Used for initialisation. Read and set config overrides, then start presence detection as singleton.
	socketNotificationReceived: function(notification, payload) {

		console.log(this.name + " received a socket notification: " + notification + " - Payload: ", payload);

		if(payload.hasOwnProperty("updateInterval")) this.updateInterval = payload.updateInterval;
		if(payload.hasOwnProperty("detectionTimeout")) this.detectionTimeout = payload.detectionTimeout;
		if(payload.hasOwnProperty("validRange")) this.validRange = payload.validRange;

		if(!this.isPresenceDetectionStarted) {
			this.startPresenceDetection();
		}
	},

	startPresenceDetection: function () {

		var self = this;
		if(self.updateInterval >= 500) {
			console.log("mmm-toggle-by-presence: START PRESENCE DETECTION. Interval: " + self.updateInterval);
		} else {
			self.updateInterval = 500;
			console.log("mmm-toggle-by-presence: START PRESENCE DETECTION. Interval set to 500ms (min value)");
		}

		self.isPresenceDetectionStarted = true;

		// Start range detector
		var rangeDetector = spawn(__dirname + '/range_detector/./Range', [self.updateInterval]);
		/*
		rangeDetector.stdout.on('data', (data) => {console.log(`stdout: ${data}`);});
		rangeDetector.stderr.on('data', (data) => {console.log(`stderr: ${data}`);});
		rangeDetector.on('close', (code) => {console.log(`child process exited with code ${code}`);});
		*/


		console.log("mmm-toggle-by-presence: PRESENCE DETECTION STARTED.");

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

			console.log("mmm-toggle-by-presence: current distance is " + distance + "mm");
			self.newDetectionState = distance < self.validRange;
	      	self.now = new Date().getTime();

	      	if(self.currentDetectionState && (self.now-self.lastDetection) < self.detectionTimeout) {

				// restart timeout when presence is detected
				if(self.newDetectionState) {
					console.log('Presence detected. Reset timeout counter');
					self.lastDetection=self.now;

				} else {
					console.log('mmm-toggle-by-presence: no presence detected. Timeout: ', (self.now-self.lastDetection)/1000);
				}

				return;
			}

			// timeout has finished, there was an detection state change
			if(self.currentDetectionState!=self.newDetectionState) {

				self.currentDetectionState = self.newDetectionState;

				if(self.newDetectionState) {

					self.lastDetection = self.now;
					// make sure hdmi is turned on
					self.hdmiTurnOn();
	          	}

				// publish new detection state
				self.sendSocketNotification("mmm-toggle-by-presence-notification", {detectionState: self.newDetectionState});
			}


	    } catch (e) {
	      console.error('Error: '+e);
	      self.sendSocketNotification("mmm-toggle-by-presence-notification", {detectionState: true});

	    }


	},


	hdmiTurnOn: function() {

		console.log("Turn HDMI monitor ON");
		if(!this.isHdmiOn) {

			shell.exec('/opt/vc/bin/tvservice -p');
			this.isHdmiOn=true;
			return 'Das Display wurde eingeschaltet!';

		} else {
			return 'Das Display ist bereits eingeschaltet!';
		}

	},

	hdmiTurnOff: function() {

		console.log("Turn HDMI monitor OFF");
		if(this.isHdmiOn) {

			shell.exec('/opt/vc/bin/tvservice -o');
			this.isHdmiOn=false;
			return 'Das Display wurde ausgeschaltet!';

		} else {
			return 'Das Display ist bereits ausgeschaltet!';
		}
	}


});
