$(document).ready(function() {
	$(json).load("http://dev.hsl.fi/siriaccess/vm/json?operatorRef=HSL&lineRef=1300V");
	$(json).load("http://dev.hsl.fi/siriaccess/vm/json?operatorRef=HSL&lineRef=1300M");
})
