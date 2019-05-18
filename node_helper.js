/* Magic Mirror
 * Node Helper: mmm-toggle-by-presence
 *
 * By Moritz Kraus
 * MIT Licensed.
 */


var NodeHelper = require("node_helper");
var shell = require('shelljs');


module.exports = NodeHelper.create({

	//control flow params
	updateInterval: 500, // update interval for presence detection
	detectionTimeout: 10000, //mirror will be turned off if no detection in this timespan
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

		if(!this.isPresenceDetectionStarted) {
			this.startPresenceDetection();
		}
	},

	startPresenceDetection: function () {

		console.log("START PRESENCE DETECTION");
		var self = this;
		self.isPresenceDetectionStarted = true;

		setInterval(function(){

			try {

			  self.newDetectionState = Math.random() >= 0.5;
		      self.now = new Date().getTime();

		      if(self.currentDetectionState && (self.now-self.lastDetection)<self.detectionTimeout) {

		          // restart timeout when presence is detected
		          if(self.newDetectionState) {
		            console.log('Presence detected. Reset timeout counter');
		            self.lastDetection=self.now;

		          } else {
		            console.log('No presence detected. Timeout: ', (self.now-self.lastDetection)/1000);
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
		      self.sendSocketNotification("mmm-toggle-by-presence-notification", {detectionState: false});

		    }

		}, self.updateInterval);

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
