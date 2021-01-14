var NodeHelper = require("node_helper");
const uuid = require('uuid');

const WebSocket = require('ws');

module.exports = NodeHelper.create({
	start: function () {
		this.console_debug = true;
		this.log_debug = true;
	},
	notificationReceived: function() {},
	socketNotificationReceived: function(notification, payload) {
		switch(notification){
			case "WS_CONNECT":
				// upbit websocket에 보낼 format data(json) = payload
				var formatData = [{ticket: uuid.v4()}, payload];
				this.connect(formatData);
		}
	},
	
	connect: function(config) {
		var self = this;

		// Disconnect to assure only one instance is running.
		self.disconnect();
		
		self.ws = new WebSocket('wss://api.upbit.com/websocket/v1');

		// Register error listener
		self.ws.onerror = function(event){
			console.log('Connection Error');
		};

		// Register open listener
		self.ws.onopen = function open() {
			// self.console_debug("Connection established");
			
			function sendFormatData() {
				if (self.ws.readyState === self.ws.OPEN) {
					console.log(JSON.stringify(config));
					self.ws.send(JSON.stringify(config));
					console.log("format data sent.")
				}
			}
			
			// delay to avoid connection error
			setTimeout(sendFormatData, 1000);

			// Register on close listener
			self.ws.onclose = function close(event) {
				self.error("Connection was closed!", event.code, event.reason);
				self.reconnect(config);
			};

			// Register message handler
			self.ws.onmessage = function message(event) {
				try {
					// self.sendMessage(JSON.parse(event.data));
					var price_json = JSON.parse(event.data);
					var simplified_price_info = {
						symbol: price_json["code"],
						trade_price: price_json["trade_price"],
						change_price: price_json["change_price"],
						change_percent: price_json["change_price"] / price_json["trade_price"] * 100
					}
					self.sendSocketNotification("WS_PRICE_INFO", simplified_price_info);
				} catch(error) {
					self.error("Error while handling event:", event, error);
				}
			};
		};
	},
	
	reconnect: function(config) {
		var self = this;
		self.console_debug("Trying to reconnect...");
		self.connect(config, function(error) {
			if(error) {
				self.error("Error while reconnecting to websocket...", error);
				setTimeout(function() { self.reconnect(config) }, 5000);
			}
		});
	},
	
	disconnect: function() {
		var self = this;
		if (self.ws) {
			// Unregister listener
			self.ws.onclose = undefined;
			self.ws.onerror = undefined;
			self.ws.onopen = undefined;
			self.ws.onmessage = undefined;

			if(self.ws.readyState === WebSocket.OPEN) {
				self.ws.close();
				self.ws.terminate();
			}
			self.ws = undefined;
		}
	},
	
	error: function(error){
		console.log(error);
	},
	
	console_debug: function(log) {
		var self = this;
		if(self.console_debug) {
			console.log(log);
		}
	},
	
	log_debug: function(log) {
		var self = this;
		if(self.log_debug) {
			self.sendSocketNotification("DEBUG_LOG", log);
		}
	},
});
