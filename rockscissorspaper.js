var RockScissorsPaper = (function () {
	var my = {}
	var MODE_STOP = 1;
	var MODE_MOVE = 2;
	var MODE_UNKNOWN = 3;
	var size = 10;
	var arr = [];
	var fingers_size = 30;
	var fingers = [];
	var mode = MODE_UNKNOWN;
	var detected = false;
	var figure = null;
	var last_figure = null;
	var callback = null;
	var initArray = function() {
		arr = [];
		for (var i=0; i<size; i++)
			arr.push(null);
	}
	var initFArray = function() {
		fingers = []
		for (var i=0; i<fingers_size; i++)
			fingers.push(null);
	}
	my.init = function() {
	initArray();
	initFArray();
	Leap.loop({enableGestures:false}, function(frame) {
	if (frame.hands[0]) {
		arr.push(frame.hands[0].palmVelocity)
		arr.shift();
		if (mode == MODE_STOP) {
			fingers.push(frame.hands[0].fingers.length);
			fingers.shift();
		}
		else if (fingers.length > 0) {
			initFArray();
		}
	}
	else {
		initArray();
		if (fingers.length > 0) {
			initFArray();
		}
	}	
      });
	setTimeout(printConsole, 100)
	}
	my.startTracking = function(cb) {callback = cb}
	my.stopTracking = function() {callback = null}
	var printConsole = function() {
		var avg = [0, 0, 0]
		var favg = 0;
		var s = 0;
		var fs = 0;
		for (var j=0; j<arr.length; j++) {
			if (arr[j] == null) { continue; }
			avg[0] += Math.abs(arr[j][0]); avg[1] += Math.abs(arr[j][1]); avg[2] += Math.abs(arr[j][2]);
			s += 1;
		}
		for (var j=0; j<fingers.length; j++) {
			if (fingers[j] == null) { continue; }
			favg += Math.abs(fingers[j]);
			fs += 1;
		}
		if (mode == MODE_STOP && fs > 0 && fs == fingers_size) { 
			favg = favg / fs; 
			detected = true; 
			if (favg < 2)
				figure = 1;
			else if (favg > 3)
				figure = 2;
			else
				figure = 3;
			
			if (callback && last_figure != figure) {
				callback(figure);
			}
			last_figure = figure;
		}
		if (s > 0) {
			avgs = [avg[0]/s, avg[1]/s, avg[2]/s];
			max = Math.max.apply(null, avgs)
			if (max < 30) {
				mode = MODE_STOP
				figure = null;
			}
			else {
				mode = MODE_MOVE
				detected = false;
			}
		}
		setTimeout(printConsole, 100);
	}	
	return my;
}());
