$(document).ready(function() {

	jQuery.getJSON("http://dev.hsl.fi/siriaccess/vm/json?operatorRef=HSL&lineRef=1300V", function(data) {
		
		//console.log(JSON.stringify(data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity, null, 4))

		$.each(data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity, function(i,v) {
			console.log(v.MonitoredVehicleJourney.VehicleRef.value + 
				": longitude: " + v.MonitoredVehicleJourney.VehicleLocation.Longitude +
				", latitude: " + v.MonitoredVehicleJourney.VehicleLocation.Latitude );
		});
	});


	jQuery.getJSON("http://dev.hsl.fi/siriaccess/vm/json?operatorRef=HSL&lineRef=1300M", function(data) {
		
		//console.log(JSON.stringify(data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity, null, 4))

		$.each(data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity, function(i,v) {
			console.log(v.MonitoredVehicleJourney.VehicleRef.value + 
				": longitude: " + v.MonitoredVehicleJourney.VehicleLocation.Longitude +
				", latitude: " + v.MonitoredVehicleJourney.VehicleLocation.Latitude );
		});
	});
	//$(json).load("http://dev.hsl.fi/siriaccess/vm/json?operatorRef=HSL&lineRef=1300V");
	//$(json).load("http://dev.hsl.fi/siriaccess/vm/json?operatorRef=HSL&lineRef=1300M");
})
