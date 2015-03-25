
//General helper functions

function showSlide(id) {
	$(".slide").hide();
	$("#"+id).show();
}

function launchFullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
}

function exitFullscreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

/**
 * http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
*/
Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}

var imageSrcList = new Array();

//Image helpers

function preload(sources, callback) {
    if(sources.length) {
        var preloaderDiv = $('<div style="display: none;"></div>').prependTo(document.body);

        $.each(sources, function(i,source) {
            $("<img/>").attr("src", source).appendTo(preloaderDiv);
            if(i == (sources.length-1)) {
                $(preloaderDiv).imagesLoaded(function() {
                    $(this).remove();
                    if(callback) callback();
                });
            }
        });
    } else {
        callback();
    }
}

function preloadSetup() {
	//no preloading
}

// Array logistic helpers

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function randomInteger(n) {
	return Math.floor(Math.random()*n);
}

function randomElement(array) {
	return array[randomInteger(array.length)];
}

// Full screen helpers

$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', exitHandler);

function exitHandler()
{
	if (watchingFull) {
	    if (!document.webkitIsFullScreen && !document.mozFullScreen && !(document.msFullscreenElement))
	    {
  			$(document.body).css("cursor","auto")
	    	dead = true;
  			if (curTrial > 0) {trial.pushData(true);}
	        showSlide("full-exit");
	    }
	}	
}

// Time helpers

function now() {
	return (new Date()).getTime();
}

/* global turk, store, location */

var fingerprint;

function setGeo(data) {
  fingerprint.ip = data.ip;
  fingerprint.geo = data; 
}

(function() {
  
  fingerprint = {
    browser: navigator.userAgent,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    ip: "",
    geo: "",
    timezone: new Date().getTimezoneOffset(),
    plugins: Array.prototype.slice.call(navigator.plugins).map(function(x) { return {filename: x.filename, description: x.description}})
  }


  var isLocal = /file/.test(location.protocol);
  
  // inject a call to a json service that will give us geolocation information 
  var protocol = isLocal ? "http://" : "//";
  var src = protocol + "freegeoip.net/json/?callback=setGeo";

  var scriptEl = document.createElement('script');
  scriptEl.src = protocol + "freegeoip.net/json/?callback=setGeo";
  
  document.body.appendChild(scriptEl);

})()

// Keypress helpers
var k_u = false, k_l = false, k_d = false, k_r = false;

document.onkeydown = function(event) {
	event = event || window.event;
	switch (event.keyCode) {
		case 37: // left
			k_l = true;
			event.preventDefault();
			break;
		case 38: // up
			k_u = true;
			event.preventDefault();
			break;
		case 39: // right
			k_r = true;
			event.preventDefault();
			break;
		case 40: // down
			k_d = true;
			event.preventDefault();
			break;
	}
}

document.onkeyup = function(event) {
	event = event || window.event;
	switch (event.keyCode) {
		case 37: // left
			k_l = false;
			event.preventDefault();
			break;
		case 38: // up
			k_u = false;
			event.preventDefault();
			break;
		case 39: // right
			k_r = false;
			event.preventDefault();
			break;
		case 40: // down
			k_d = false;
			event.preventDefault();
			break;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// WEBPAGE LAUNCH /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

if (fingerprint.screenHeight <= 700) {
	showSlide("screensmall");
} else {
	curHeight = fingerprint.screenHeight;
	if (curHeight > 1000) {
		curHeight = 1000;
	}
	$("#dispImg").width(curHeight);
	$("#dispImg").height(curHeight);
	// document.getElementById("character").style.fontSize = 700 + 'px';
	// $("#dispImg").width(700);
	// $("#dispImg").height(700);

	var numLoadedImages = 0;

	// define a function that will get called once
	// all images have been successfully loaded
	function onLoadedAll() {
	  showSlide("demographics");
	}

	var curTrial = 0;

	watchingFull = true;

	showSlide("loading");
	preloadSetup();
	$("#num-total").text(imageSrcList.length);
	preload(imageSrcList,onLoadedAll);

	var allData = {};
	// to add a single obj
	// allData.obj = obj;
	// per trial:
	// allData.trialNum = [];
}

// EXPERIMENT

// exp vars
var inst;
// game vars
var gravity = false, friction = false, jitter = false, randControl = false, flipCons = false;
var startPos;
// game settings
var gAccel = .00005, fricVal = .00001, jitterStr = 10, randSwitch = 1000;

// trial by trial settings
var gList = [false, false, false, false, true],
	fList = [false, true, true, true, true],
	jList = [false, false, false, true, true],
	rList = [false, false, true, false, true];

var experiment = {


	end: function() {
		watchingFull = false;
		exitFullscreen();
		showSlide("finished");
		if (opener && opener.turk.previewMode) {
			$("#finishText").hide();
			$("#finishTextPrev").show();
		} else {
			setTimeout(function() { opener.turk.submit(allData) }, 1500);
			$("#finishText").show();
			$("#finishTextPrev").hide();
		}
	},

	next: function() {
		curTrial = curTrial + 1;
		// Setup the next trial based on what trial number we are on (you can also use 
		// arrays and then pick out of the arrays using curTrial)
		if (curTrial <= 5) {
			// regular trial
			gravity = gList[curTrial-1];
			friction = fList[curTrial-1];
			jitter = jList[curTrial-1];
			randControl = rList[curTrial-1];
			inst == 0;
			startPos = randomElement([0,1,2,3,4,5,6,7])
		} else {
			experiment.end();
			return;
		}

		showSlide("trial_instructions")
		if (inst==1) {
			$("#inst").hide();
			$("#inst_reaper").show();
		} else {
			$("#inst").show();
			$("#inst_reaper").hide();
		}
		if (curTrial==3) {
			$("#inst_warning").show();
		} else {
			$("#inst_warning").hide();
		}
	},

	ready: function() {
		trial.run();
	},

	setupNext: function() {
		if (!dead) {
			if (curTrial > 0) {
				if (curTrial > 2 && opener.turk.previewMode) {
					experiment.end();
				} else {
					trial.pushData(false);
					showSlide("trial");
				}
			} else{
				showSlide("trial");
			}
		} else {
			showSlide("full-exit");
		}
	},

	addFullscreenEvents_setupNext: function() {
		document.addEventListener('webkitfullscreenchange', exitHandler, false);
	    document.addEventListener('mozfullscreenchange', exitHandler, false);
	    document.addEventListener('fullscreenchange', exitHandler, false);
	    document.addEventListener('MSFullscreenChange', exitHandler, false);
	    experiment.setupNext();
	},

	prerun: function() {
		if (document.getElementById('agebox').value=="" || document.getElementById('sexbox').value=="") {
			alert("Please enter your age and sex. These demographic information are important for our study.");
			return
		}
		//age info
		allData.demo = {};
		allData.demo.age = document.getElementById('agebox').value;
		//sex
		sVal = document.getElementById('sexbox').value;
		sVal = sVal.toLowerCase();
		// auto-parsing
		if (sVal == 'male') {sVal = 'm'}
		if (sVal == 'female') {sVal = 'f'}
		if (sVal == 'other') {sVal = 'o'}
		if (sVal != 'm' && sVal != 'f' && sVal != 'o') {
			alert("Please enter a valid sex: male/female/other (or m/f/o) designation.");
			return
		}
		allData.demo.sex = sVal;
		showSlide("gofullscreen");
	},

	run: function() {
		launchFullScreen(document.documentElement)
		experiment.addFullscreenEvents_setupNext();
	},

	runFromDead: function() {
		if (curTrial > 0) {curTrial = curTrial - 1;}
		dead = false;
		launchFullScreen(document.documentElement)
		experiment.addFullscreenEvents_setupNext();
	}
}

var frameID,
    started;
var flippedTime = [];
var dead = false;

var cx = $(window).width() / 2;
var cy = $(window).height() / 2;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var lastTick = 0; var lVeloc = 0.0, tVeloc = 0.0;

function drawHelper() {
	time = now();
	//get the elapsed time since the last frame
	diffTime = time - lastTick;
	lastTick = time;
	//adjust the time to 33 fps maximum
	if (diffTime > 50) {diffTime = 50;}

	flippedTime.push(time-started)
	if ((time-started) > (20000)) {
		window.cancelAnimationFrame(frameID);
		trial.resp(false);
		return
	}

	// check and move my rect if neccessary
	checkMove(diffTime,.0001);

	// check if we made it to the goal state
	if (checkGoal()) {
		window.cancelAnimationFrame(frameID);
		myColor = 'green';
		render();
		setTimeout(function() {trial.resp(true)},1000);
		return
	}

	// forces
	fundamentalForces(diffTime);

	// move
	myMove(diffTime);

	// check that things aren't off-screen
	checkOffscreen();

	// draw stuff
	render();
	
	// next draw
	frameID = window.requestAnimationFrame(drawHelper);
}

function fundamentalForces(elapsedTime) {
	if (gravity) {
		if (tVeloc < .1) {
			tVeloc = tVeloc + gAccel*elapsedTime;
		}
	}
	if (friction) {
		if (lVeloc > 0) {lVeloc -= (Math.abs(lVeloc*.001*elapsedTime) + fricVal*elapsedTime); if(lVeloc<0) {lVeloc=0;}}
		if (lVeloc < 0) {lVeloc += (Math.abs(lVeloc*.001*elapsedTime) + fricVal*elapsedTime); if(lVeloc>0) {lVeloc=0;}}
		if (tVeloc > 0) {tVeloc -= (Math.abs(tVeloc*.001*elapsedTime) + fricVal*elapsedTime); if(tVeloc<0) {tVeloc=0;}}
		if (tVeloc < 0) {tVeloc += (Math.abs(tVeloc*.001*elapsedTime) + fricVal*elapsedTime); if(tVeloc>0) {tVeloc=0;}}
	}
}

function checkOffscreen() {
	if (goalX < rectSize/2-canvas.width/2) {goalX = rectSize/2-canvas.width/2;}
	if (goalY < rectSize/2-canvas.height/2) {goalY = rectSize/2-canvas.height/2;}
	if (goalX > canvas.width/2-rectSize/2) {goalX = canvas.width/2-rectSize/2;}
	if (goalY > canvas.height/2-rectSize/2) {goalY = canvas.height/2-rectSize/2;}
	if (myX < rectSize/2-canvas.width/2) {myX = rectSize/2-canvas.width/2;}
	if (myY < rectSize/2-canvas.height/2) {myY = rectSize/2-canvas.height/2;}
	if (myX > canvas.width/2-rectSize/2) {myX = canvas.width/2-rectSize/2;}
	if (myY > canvas.height/2-rectSize/2) {myY = canvas.height/2-rectSize/2;}
}

function myMove(elapsedTime) {
	myX += lVeloc*elapsedTime;
	myY += tVeloc*elapsedTime;
	if (jitter) {
		myX = myX + (Math.random() - .5) * elapsedTime / jitterStr;
		myY = myY + (Math.random() - .5) * elapsedTime / jitterStr;
	}
}

var lastRandSwitch = now();

function checkMove(elapsedTime,mult) {
	if (randControl) {
		if ((now() - lastRandSwitch) > randSwitch) {
			lastRandSwitch = now();
			k_l = randomElement([true, false, false]);
			k_d = randomElement([true, false, false]);
			k_u = randomElement([true, false, false]);
			k_r = randomElement([true, false, false]);
		}
	}

	leftMove = 0; topMove = 0;
	if (k_l) {leftMove = leftMove - elapsedTime*mult}
	if (k_r) {leftMove = leftMove + elapsedTime*mult}
	if (k_u) {topMove = topMove - elapsedTime*mult}
	if (k_d) {topMove = topMove + elapsedTime*mult}
	lVeloc += leftMove;
	tVeloc += topMove;
}

function checkGoal() {
	return (myX > goalX - rectSize && myX < goalX + rectSize) &&
		(myY > goalY - rectSize && myY < goalY + rectSize);
}

// Rendering functions

var goalX, goalY;
var myX, myY;
var myColor = 'red';
var rectSize = 50;

function render() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	renderGoal();
	renderMy();
}

function renderGoal() {
	drawRect(goalX,goalY,rectSize,rectSize,'blue');
}

function renderMy() {
	drawRect(myX,myY,rectSize,rectSize,myColor);
}

function drawRect(cx,cy,xs,ys,cflag) {
	switch (cflag) {
		case 'red':
			ctx.fillStyle = "#FF0000"; break;
		case 'green':
			ctx.fillStyle = "#00FF00"; break;
		case 'blue':
			ctx.fillStyle = "#0000FF"; break;
	}
	ctx.fillRect(canvas.width/2+cx-xs/2,canvas.height/2+cy-ys/2,xs,ys);
}

var spDist = 310;

function deg2rad(deg) {
	return deg * Math.PI / 180;
}

function setupStartPos() {
	curDeg = startPos*45;
	curRad = deg2rad(curDeg);
	goalX = spDist*Math.sin(curRad);
	goalY = spDist*Math.cos(curRad);
}

var trial  = {

	pushData: function(leftFull) {

	},

	resetRects: function() {
		setupStartPos();
		myX = 0; myY = 0;
		lVeloc = 0.0; tVeloc = 0.0;
		myColor = 'red';
	},

	draw: function(started) {
		trial.resetRects();
		lastTick = now();
		frameID = window.requestAnimationFrame(drawHelper);
	},

	run: function() {
		// Double check that we're in full-screen
		if (dead) {
	        showSlide("full-exit");
		} else {
			//remove the cursor
			$(document.body).css("cursor","none")
			//tell the trial to start in 1s
			setTimeout(trial.run2,1000);
		}
	},

	run2: function() {
		showSlide("frame")
		started = now();
		//start the animation sequence
		trial.draw();
	},

	resp: function(success) {
		//trial is over, put the cursor back up
		$(document.body).css("cursor","auto");
		showSlide("response");
		if (success) {
			$("#resp-success").show();
			$("#resp-fail").hide();
		} else {
			$("#resp-success").hide();
			$("#resp-fail").show();
		}
		setTimeout(function() {showSlide("trial")},2000);
	},
}
