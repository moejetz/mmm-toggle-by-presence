/* global Module */

/* Magic Mirror
 * Module: mmm-toggle-by-presence
 *
 * By Moritz Kraus
 * MIT Licensed.
 */

Module.register("mmm-toggle-by-presence", {

	detectionState: true, // current presence detection state

	getScripts: function() {
		return ["modules/mmm-toggle-by-presence/js/jquery.js"];
	},

	start: function() {
		// Do this to initialize bidirectional node_helper communication
		this.sendSocketNotification("mmm-toggle-by-presence-notification", this.config);
		$('body').hide();
	},


	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "mmm-toggle-by-presence-notification") {

			if(this.detectionState!=payload.detectionState) {
				this.detectionState = payload.detectionState;
				this.updateDom();
			}

		}
	},

	getDom: function() {


		var self = this;
		console.log('Server callback triggered! DetectionState: '+self.detectionState);

		var wrapper = document.createElement("div");



	    if(self.detectionState) {

			console.log("Turn display modules ON...");
			$('body').fadeIn(1000);



	    } else {

    		console.log("Turn display modules OFF...");
    		$('body').fadeOut(1000);

			//$(overlay).hide();
			//$(overlay).fadeIn(1000, function() {});
	    }

		return wrapper;
	},




});
