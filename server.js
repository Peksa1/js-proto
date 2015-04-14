// The class is translated to JS from https://github.com/HSLdevcom/navigator-server/blob/master/src/helsinki.coffee

var net = require("net");
var carrier = require("carrier");

var col_names = [
    "id", "name", "type", "ip", "lat", "lng", "speed", "bearing",
    "acceleration", "gps_time_difference", "unix_epoch_gps_time", "low_floor", "route", "direction",
    "departure", "departure_time", "departure_stars_in", "distance_from_start", "snapped_lat", "snapped_lng",
    "snapped_bearing", "next_stop_index", "on_stop", "difference_from_timetable"
];

var route_to_code = function(route) {
	if (route === "1") {
		// metro, Mellumäki branch
		return "1300M";
	};
	if (route === "2") {
		// metro, Vuosaari branch
		return "1300V";
	};
	if ("IKNTHRZ".indexOf(route) !== -1 ) {
		// train, northern railroad
		return "3001" + route;
	};
	if ("YSULEAM".indexOf(route) !== -1) {
		// train western railroad (or M for Vantaankoski)
		return "3002" + route;
	};
	// somethign else, let's hope it's a route code already
	return route.substring(0,5).trim();
};



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
		this.reset_timeout();

		console.log("Received line " + JSON.stringify(line));

		var cols = line.split(";");

		if (cols.length < 10) {
			return;
		};

		var info = {};

		for (index = 0, length = col_names.length; index < length; index = ++index) {
			n = col_names[index];
			info[n] = cols[index];
		};

		//Skip line if no coordinates supplied
		if (info.lat === "0" || info.lng === "0") {
			return;
		};

		var timestamp = (parseInt(info.unix_epoch_gps_time))/1000;
		
		if (timestamp <= 0) {
			return;
		};
		
		if (!info.route) {
			return;
		};

		info.id = info.id.trim();

		var type;

		// Using regular expressions to search for different types
		if (info.id.match(/^RHKL/)) {
			// Tram line codes start with 10. Most are single numbered, and then we have tram line 10
			if (!(info.route.match(/^100/ || info.route.match(/^1010/)))) {
				// Sometimes the API gives us trams which don't have the right route types,
				// so we just ignore those
				return;
			};
			type = "tram";
		} else if (info.id.match(/^metro/)) {
			type = "subway";
		} else if (info.id.match(/^[Kk]/)) {
			type = "kutsuplus";
		} else {
			console.log("Unknown id " + info.id);
			return;
		};

		var out_info = {
			vehicle: {
				id: info.id
			},
			trip: {
				route: route_to_code(info.route),
				operator: "HSL"
			},
			position: {
				latitude: parseFloat(info.lat),
				longitude: parseFloat(info.lng),
				bearing: parseFloat(info.bearing)
			}
			timestamp: (parseInt(info.unix_epoch_gps_time)) /1000
		};

		// Many vehicles do not actually send data, just zeros in many fields
		if (type !== "kutsuplus") {
			out_info.trip.direction = info.direction;
		};
		if (type !== "subway") {
			out_info.position.speed = (parseFloat(info.speed))/3.6;
		};
		if (type !== "tram") {
			out_info.trip.start_time = info.departure;
			out_info.position.odometer = parseFloat(info.distance_from_start);
			out_info.position.delay = -(parseFloat(info.difference_from_timetable));
			out_info.position.next_stop_index = (parseInt(info.next_stop_index)) + 1
		};

		// Create path/channel that is used for publishing the out_info for the
		// interested navigator-proto clients via the callback function
		var route = route_to_code(info.route).replace(" ", "_");
		var vehicle_id = out_info.vehicle.id.replace(" ", "_");
		var path = "location/helsinki/" + route + "/" + vehicle_id;
		callback(path, out_info, this.args);
	};
};
