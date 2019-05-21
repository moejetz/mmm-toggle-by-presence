/* global Module */

/* Magic Mirror
 * Module: mmm-toggle-by-presence
 *
 * By Moritz Kraus
 * MIT Licensed.
 */

const MODULE_NAME = 'mmm-toggle-by-presence'; // Module name
const SOCKET_NOTIFICATION_KEY = 'mmm-toggle-by-presence-notification-key'; // Socket communication key

Module.register(MODULE_NAME, {


	detectionState: true, // Current presence detection state


	getScripts: function() {
		return ['modules/' + MODULE_NAME + '/js/jquery.js'];
	},

	// Initialize bidirectional node_helper communication
	start: function() {
		this.sendSocketNotification(SOCKET_NOTIFICATION_KEY, this.config);
		$('body').hide();
	},


	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === SOCKET_NOTIFICATION_KEY) {

			if(this.detectionState != payload.detectionState) {
				this.detectionState = payload.detectionState;
				this.updateDom();
			}

		}
	},

	// MagicMirror2 function to update the DOM.
	// Used to display/hide the complete body
	getDom: function() {

		var self = this;
		console.log(MODULE_NAME + ': server callback triggered! DetectionState: ', self.detectionState);

	    if(self.detectionState) {
			console.log(MODULE_NAME + ': turn display modules ON...');
			$('body').fadeIn(1000);

	    } else {
    		console.log(MODULE_NAME + 'turn display modules OFF...');
    		$('body').fadeOut(1000);
	    }

		return document.createElement('div');
	},




});
