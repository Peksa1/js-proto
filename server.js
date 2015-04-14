// The class is translated to JS from https://github.com/HSLdevcom/navigator-server/blob/master/src/helsinki.coffee

var net = require("net");
var carrier = require("carrier");


HSLClient = function() {

	HSLClient = function(callback, args) {
		this.callback = callback;
		this.args = args; 

		// TODO bind functions?
	}


	HSLClient.prototype.connect = function() {

		// Connect to HSL Live server via PUSH interface
		this.client = net.connect(808,"83.145.232.209");

		// Error event happens when the connection fails immediately,
		// Most likely because the network is down or th e HSL Live server is down
		this.client.on("error", this.handle_error());

		this.client.on("connect", function(conn) {
			console.log("HSLClient connected");

			// Tell the HSL Live server that we want just info of the vehicles logged on route
			this.client.write("&okffin;tuusula1 onroute:1&");

			// We use carrier module to receive new-line terminated messages from HSL Live server
			// and pass those lines to the handle_line function

			this.carrier = carrier.carry(this.client);
			carrier.on("line", this.handle_line());

			this.reset_timeout()
		});


	};

	HSLClient.prototype.handle_error = function(error) {
		if (typeof this.timeout !== "undefined" && elvis !== null) {
			clearTimeout(this.timeout);
		};
		console.log("Cannot connect to HSL Live", error);
		this.timeout = setTimeout(this.connect(), 30000);
	};


	HSLClient.prototype.reset_timeout = function() {
		if (typeof this.timeout !== "undefined" && elvis !== null) {
			clearTimeout(this.timeout);
		};
		this.timeout = setTimeout(this.handle_timeout, 15000);
	};

	HSLClient.prototype.handle_timeout = function() {
		console.log("Timeout reading HSL Live data, reconnecting");

		// It's ok to call on .end() when the remote end has closed
		// the connection, so our timeout handles those cases too.
		// .end() also clsoes the this.carrier via 'end' event.

		this.client.end();
		this.connect();
	};


	HSLClient.prototype.handle_line = function(line) {
		// TODO
	};
};
