
function showSlide(id) {
	$(".slide").hide();
	$("#"+id).show();
}
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
function drawCircle(x,y,color) {
	ctx.fillStyle = parseColor(color);
	ctx.beginPath();
	ctx.arc(cen2canx(x),cen2cany(y),50,0,2*Math.PI);
	ctx.fill();
}
// given a 0,0 centered coordinate, returns the canvas coordinate
function cen2canx(x) {
	return canvas.width/2+x;
}
function cen2cany(y) {
	return canvas.height/2+y;
}
function randomElement(array) {
	return array[randomInteger(array.length)];
}

function parseColor(color) {
	switch (color) {
		case 'red':
			return "#FF0000";
		case 'green':
			return "#00FF00";
		case 'blue':
			return "#0000FF";
		case 'yellow':
			return "#FFFF00";
		case 'teal':
			return "#00FFFF";
		case 'purple':
			return "#FF00FF";
		case 'black':
			return "#000000";
		case 'white':
			return "#FFFFFF";
	}
}
function now() {
	return (new Date()).getTime();
}

showSlide('frame');
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
 
var colors = ['red','green','blue','yellow','teal','purple','black'];
var bugCounters = [100,250,500,1000];
var posX = [-300,-100,100,300];
var texts = ['100ms','250ms','500ms','1000ms'];
var actTime = 4000;
var acting = 0;
var bugs = [0,0,0,0];
var onColor = 'red';
var offColor = 'teal';

function drawBugs() {
	window.requestAnimationFrame(drawBugs);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	time = now();
	elapsed = time-prev;
	prev = time;
	actTime -= elapsed;
	if (actTime < 0) {
		actTime = 5000;
		acting = acting+1;
		if (acting>3) {
			acting = 0;
		}
	}
	i = acting;
	bugs[i]-=elapsed;
	if (bugs[i] <= -bugCounters[i]) {
		bugs[i] += bugCounters[i]*2;
	}
	if (bugs[i]<0) {
		drawCircle(posX[i],0,onColor);
	} else {
		drawCircle(posX[i],0,offColor);
	}
	for (i=0;i<4;i++) {
		ctx.font = "20px Arial";
		ctx.fillStyle = parseColor('black');
		ctx.fillText(texts[i],cen2canx(posX[i]),cen2cany(100));
	}
}

started = now();
prev = started;
drawBugs();

