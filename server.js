var net = require("net");
var carrier = require("carrier");

class HSLClient


	constructor = function(this.callback, this.args) {

	}

	connect = function() {

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

	handle_error = function(error) {
		// TODO
	};

	handle_line = function(line) {
		// TODO
	};

	reset_timeout = function() {
		// TODO
	};

	handle_timeout = function() {
		// TODO
	};
	