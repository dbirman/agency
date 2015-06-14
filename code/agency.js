// test function
function test() {
	showSlide('frame');
	experiment.next();
	setupStartPos();
	render();
}


//General helper functions

function showSlide(id) {
	$(".slide").hide();
	$("#"+id).show();
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

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
  	if (b>a) {
      A[0]= a;
      step= step || 1;
      while(a+step<= b){
          A[A.length]= a+= step;
      }
  	} else {
  		// b < a (i.e. probably negative, so we go in reverse)
  		A[0] = a;
  		while(A[A.length-1]>b) {
  			A[A.length] = a -= 1;
  		}
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
};

var imageSrcList = [];

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
  			$(document.body).css("cursor","auto");
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
  };


  var isLocal = /file/.test(location.protocol);
  
  // inject a call to a json service that will give us geolocation information 
  var protocol = isLocal ? "http://" : "//";
  var src = protocol + "freegeoip.net/json/?callback=setGeo";

  var scriptEl = document.createElement('script');
  scriptEl.src = protocol + "freegeoip.net/json/?callback=setGeo";
  
  document.body.appendChild(scriptEl);

})();

// first movement
var firstMove = false;
// Keypress helpers
var k_u = false, k_l = false, k_d = false, k_r = false;

document.onkeydown = function(event) {
	event = event || window.event;
	switch (event.keyCode) {
		case 37: // left
			if(flipCons) {k_r = true;} else {k_l = true;}
			event.preventDefault();
			break;
		case 38: // up
			if(flipCons) {k_d = true;} else {k_u = true;}
			event.preventDefault();
			break;
		case 39: // right
			if(flipCons) {k_l = true;} else {k_r = true;}
			event.preventDefault();
			break;
		case 40: // down
			if(flipCons) {k_u = true;} else {k_d = true;}
			event.preventDefault();
			break;
	}
};

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
};

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// WEBPAGE LAUNCH /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// define a function that will get called once
// all images have been successfully loaded
function onLoadedAll() {
  showSlide("demographics");
}

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
// agency manipulation vars
var chooseGoal = false, forcePath = false, visibleAgent = false;
var startPos;
// Path tracking (for forcePath)
var curPathClose = null;
var curPathSeg = -1;
// game settings
var gAccel = 0.000025, fricVal = 0.00001, fricPerc = 0.0005, jitterStr = 10, randSwitch = 1000;
// goal settings
var closeGoal = {
	x: 0,
	y: 0,
	rad: 150,
	pos: -1,
	color: 'blue',
	pathX: [],
	pathY: [],
	pathH: [],
	target: false
};

var farGoal = {
	x: 0,
	y: 0,
	rad: 250,
	pos: -1,
	color: 'blue',
	pathX: [],
	pathY: [],
	pathH: [],
	target: false
};

createPath = function(sX, sY, eX, eY, horiz) {
	// The idea here is to generate a path of three pieces that will get us to 
	// the final end coordinates. We choose whether to start horizontally or
	// vertically randomly, then break the path up randomly for the other 
	// missing piece.
	pathX = [sX];
	pathY = [sY];
	if (horiz) {
		// start horizontal
		dist = eX - sX; // total distance to travel
		breakPoint = randomElement(Array.range(rectSize,dist-(rectSize+1),1));
		pathX.push(sX+breakPoint);
		pathX.push(sX+breakPoint);
		pathY.push(sY);
		pathY.push(eY);
		pathH = [true, false, true];
	} else {
		// start vertical
		dist = eY - sY; // total distance to travel
		breakPoint = randomElement(Array.range(rectSize,dist-(rectSize+1),1));
		pathY.push(sY+breakPoint);
		pathY.push(sY+breakPoint);
		pathX.push(sX);
		pathX.push(eX);
		pathH = [false, true, false];
	}
	pathX.push(eX);
	pathY.push(eY);
	return([pathX, pathY, pathH]);
};

// trial by trial settings (just for debugging)
//           	1 		2 		3 		4 		5
var gList = [	false, 	false, 	false, 	false, 	false],
	fList = [	true, 	true, 	true, 	true, 	true],
	jList = [	false, 	false, 	false, 	false, 	false],
	rList = [	false, 	false, 	false, 	false, 	false],
	flList = [	false, 	false, 	false, 	false, 	false];
var cgList= [true, true, true, true ,true],
	fpList = [true, true, true, true ,true],
	vaList = [true, true, true, true ,true];

var experiment = {

	end: function() {
		watchingFull = false;
		exitFullscreen();
		showSlide("finished");
		if (opener && opener.turk.previewMode) {
			$("#finishText").hide();
			$("#finishTextPrev").show();
		} else {
			setTimeout(function() { opener.turk.submit(allData); }, 1500);
			$("#finishText").show();
			$("#finishTextPrev").hide();
		}
	},

	next: function() {
		curTrial = curTrial + 1;
		// Setup the next trial based on what trial number we are on (you can also use 
		// arrays and then pick out of the arrays using curTrial)
		if (curTrial <= 5) {
			// regular trial (note indexed from 0->)
			// control variables
			gravity = gList[curTrial-1];
			friction = fList[curTrial-1];
			jitter = jList[curTrial-1];
			randControl = rList[curTrial-1];
			flipCons = flList[curTrial-1];
			// game variables
			chooseGoal = cgList[curTrial-1];
			forcePath = fpList[curTrial-1];
			visibleAgent = vaList[curTrial-1];
			// instructions, start location
			inst = 0;
			posOpts = [-.1,.1,1,1.9,2.1,3,3.9,4.1,5,5.9,6.1,7];
			closeGoal.pos = randomElement(posOpts);
			posOpts = posOpts.diff([closeGoal.pos,closeGoal.pos-.2,closeGoal.pos+.2]);
			farGoal.pos = randomElement(posOpts);
			// path info
			if (forcePath) {

			}
			if (!chooseGoal) {
				closeGoal.target = randomElement([true, false]);
				farGoal.target = !closeGoal.target;
			} else {
				closeGoal.target = false; farGoal.target = false;
			}
			// track first movement (for visibleAgent)
			firstMove = false;
		} else {
			experiment.end();
			return;
		}

		experiment.showInstructions();
	},

	showInstructions: function() {
		showSlide("trial_instructions");
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
				// Die on trial 3 and go to preview screen
				if (curTrial == 3 && opener.turk.previewMode) {
					experiment.end();
				} else {
					trial.pushData(false);
					showSlide("trial");
				}
			} else{
				showSlide("trial");
			}
		} else {
			// When you're dead, tell them they have to re-start in fullscreen mode
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

	collectDemographics: function() {
		if (document.getElementById('agebox').value=="" || document.getElementById('sexbox').value=="") {
			alert("Please enter your age and sex. These demographic information are important for our study.");
			return;
		}
		//age info
		allData.demo = {};
		allData.demo.age = document.getElementById('agebox').value;
		//sex
		sVal = document.getElementById('sexbox').value;
		sVal = sVal.toLowerCase();
		// auto-parsing
		if (sVal == 'male') {sVal = 'm';}
		if (sVal == 'female') {sVal = 'f';}
		if (sVal == 'other') {sVal = 'o';}
		if (sVal != 'm' && sVal != 'f' && sVal != 'o') {
			alert("Please enter a valid sex: male/female/other (or m/f/o) designation.");
			return;
		}
		allData.demo.sex = sVal;
		showSlide("gofullscreen");
	},

	run: function() {
		launchFullScreen(document.documentElement);
		experiment.addFullscreenEvents_setupNext();
	},

	runFromDead: function() {
		if (curTrial > 0) {curTrial = curTrial - 1;}
		dead = false;
		launchFullScreen(document.documentElement);
		experiment.addFullscreenEvents_setupNext();
	}
};

// tracking variables
var frameID, started, flippedTime = [], xPos = [], yPos = [], myStartX, myStartY;

// fullscreen controller
var dead = false;

// canvas variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// more tracking variables
var lastTick = 0; var lVeloc = 0.0, tVeloc = 0.0;

function drawHelper() {
	time = now();
	//get the elapsed time since the last frame
	diffTime = time - lastTick;
	lastTick = time;
	//adjust the time to 33 fps maximum
	if (diffTime > 50) {diffTime = 50;}

	flippedTime.push(time-started);
	if ((time-started) > (20000)) {
		window.cancelAnimationFrame(frameID);
		trial.resp(false);
		return;
	}

	// check and move my rect if neccessary
	checkMove(diffTime,0.0001);

	// check if we made it to the goal state
	if (checkGoal()) {
		visibleAgent = true;
		window.cancelAnimationFrame(frameID);
		myColor = 'green';
		render();
		setTimeout(function() {trial.resp(true);},1000);
		return;
	}

	// forces
	fundamentalForces(diffTime);

	// move
	myMove(diffTime);

	// check that things aren't off-screen
	checkOffscreen();

	// draw stuff
	render();

	// tracking
	xPos.push(myX);
	yPos.push(myY);
	
	// next draw
	frameID = window.requestAnimationFrame(drawHelper);
}

function fundamentalForces(elapsedTime) {
	if (gravity) {
		if (tVeloc < 0.1) {
			tVeloc = tVeloc + gAccel*elapsedTime;
		}
	}
	if (friction) {
		if (lVeloc > 0) {lVeloc -= (Math.abs(lVeloc*fricPerc*elapsedTime) + fricVal*elapsedTime); if(lVeloc<0) {lVeloc=0;}}
		if (lVeloc < 0) {lVeloc += (Math.abs(lVeloc*fricPerc*elapsedTime) + fricVal*elapsedTime); if(lVeloc>0) {lVeloc=0;}}
		if (tVeloc > 0) {tVeloc -= (Math.abs(tVeloc*fricPerc*elapsedTime) + fricVal*elapsedTime); if(tVeloc<0) {tVeloc=0;}}
		if (tVeloc < 0) {tVeloc += (Math.abs(tVeloc*fricPerc*elapsedTime) + fricVal*elapsedTime); if(tVeloc>0) {tVeloc=0;}}
	}
}

function checkOffscreen() {
	if (myX < rectSize/2-canvas.width/2) {myX = rectSize/2-canvas.width/2; lVeloc = 0;}
	if (myY < rectSize/2-canvas.height/2) {myY = rectSize/2-canvas.height/2; tVeloc = 0;}
	if (myX > canvas.width/2-rectSize/2) {myX = canvas.width/2-rectSize/2; lVeloc = 0;}
	if (myY > canvas.height/2-rectSize/2) {myY = canvas.height/2-rectSize/2; tVeloc = 0;}
}

function myMove(elapsedTime) {
	if (forcePath) {
		// now shit gets complicated... we have to check what kind of movements are okay to do
		validMoves = getValidMoves();
	} else {
		validMoves = [true, true, true, true];
		myX += lVeloc*elapsedTime;
		myY += tVeloc*elapsedTime;
	}
	myMoveRestricted(validMoves,tVeloc, lVeloc, elapsedTime);
	// Add jitter if necessary
	if (jitter) {
		myMoveRestricted(validMoves, Math.random()-0.5, Math.random()-0.5, elapsedTime/jitterStr);
	}
}

function myMoveRestricted(validMoves, tV, lV, elapsedTime) {
	if (validMoves[0] && tVeloc < 0) {
		// UP VALID
		myY += tV*elapsedTime;
	}
	if (validMoves[1] && tVeloc > 0) {
		// DOWN VALID
		myY += tV*elapsedTime;
	}
	if (validMoves[2] && lVeloc < 0) {
		// LEFT VALID
		myX += lV*elapsedTime;
	}
	if (validMoves[3] && lVeloc > 0) {
		// RIGHT VALID
		myX += lV*elapsedTime;
	}
}

function getValidMoves() {
	v_u = false; v_d = false; v_l = false; v_r = false;
	if (!firstMove) {
		// we haven't moved yet, check which directions the path go, and restrict movements
		if (chooseGoal) {
			// they could be on either path
			if (closeGoal.pathX[1] > 0) {v_r = true;} else {v_l = true;}
			if (closeGoal.pathY[1] > 0) {v_u = true;} else {v_d = true;}
			if (farGoal.pathX[1] > 0) {v_r = true;} else {v_l = true;}
			if (farGoal.pathY[1] > 0) {v_u = true;} else {v_d = true;}
		} else {
			// they can only be on one path
			if (closeGoal.target) {
				// they are on the close goal path
				if (closeGoal.pathX[1] > 0) {v_r = true;} else {v_l = true;}
				if (closeGoal.pathY[1] > 0) {v_u = true;} else {v_d = true;}
			} else {
				// they are on the far goal path
				if (farGoal.pathX[1] > 0) {v_r = true;} else {v_l = true;}
				if (farGoal.pathY[1] > 0) {v_u = true;} else {v_d = true;}
			}
		}
	} else {
		// we have started moving, figure out what path we're on and return the valid directions
		if (chooseGoal) {
			// we're fucked, they could be on either path
		} else {
			// they can only be on one path, thank fucking god, just figure out what path they're on 
		}
	}
	// now return the valid directions for movement
	return [v_u, v_d, v_l, v_r];
}

var lastRandSwitch = now();
var k_lO, k_dO, k_uO, k_rO;

function checkMove(elapsedTime,mult) {
	if (randControl) {
		if ((now() - lastRandSwitch) > randSwitch) {
			lastRandSwitch = now();
			k_lO = randomElement([true, false, false]);
			k_dO = randomElement([true, false, false]);
			k_uO = randomElement([true, false, false]);
			k_rO = randomElement([true, false, false]);
		}
	}

	leftMove = 0; topMove = 0;
	if (k_lO || k_l) {leftMove = leftMove - elapsedTime*mult;}
	if (k_rO || k_r) {leftMove = leftMove + elapsedTime*mult;}
	if (k_uO || k_u) {topMove = topMove - elapsedTime*mult;}
	if (k_dO || k_d) {topMove = topMove + elapsedTime*mult;}
	if (!firstMove && (k_l || k_r || k_u || k_d)) {
		firstMove = true;
		// get the angle to each goal
		cAng = Math.atan(closeGoal.pathY[3],closeGoal.pathX[3]);
		fAng = Math.atan(farGoal.pathY[3],farGoal.pathX[3]);
		x = 0; y = 0;
		if (k_l) {x = x - 1;}
		if (k_r) {x = x + 1;}
		if (k_u) {y = y - 1;}
		if (k_d) {y = y + 1;}
		mAng = Math.atan(y,x);
		cDiff = cAng-mAng; fDiff = fAng-mAng;
		cDiff = (cDiff+Math.PI/2) % Math.PI - Math.PI/2;
		fDiff = (fDiff+Math.PI/2) % Math.PI - Math.PI/2;
		if (Math.abs(cDiff) < Math.abs(fDiff)) {
			// close is closer
			closeGoal.target = true;
		} else {
			farGoal.target = true;
		}
	}
	lVeloc += leftMove;
	tVeloc += topMove;
}

function checkGoal() {
	if (chooseGoal) {return cgHelper(closeGoal.x,closeGoal.y) || cgHelper(farGoal.x,farGoal.y);}
	else {
		if (closeGoal.target) {
			return cgHelper(closeGoal.x,closeGoal.y);
		} else {
			return cgHelper(farGoal.x, farGoal.y);
		}
	}
}
function cgHelper(gX, gY) {
	return (myX > gX - rectSize && myX < gX + rectSize) &&
		(myY > gY - rectSize && myY < gY + rectSize);
}

// Rendering functions
var myX, myY;
var myColor = 'blue';

// General rectangle stuff
var rectSize = 25;

function render() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	renderPath();
	renderGoal();
	if (visibleAgent || !firstMove) {
		renderMy();
	}
}

function renderGoal() {
	drawRect(closeGoal.x,closeGoal.y,rectSize,rectSize,closeGoal.color);
	drawRect(farGoal.x,farGoal.y,rectSize,rectSize,closeGoal.color);
	if (closeGoal.target) {
		drawOpenRect(closeGoal.x,closeGoal.y,rectSize+20,rectSize+20,'green');
	}
	if (farGoal.target) {
		drawOpenRect(farGoal.x,farGoal.y,rectSize+20,rectSize+20,'green');
	}
}

function renderMy() {
	drawRect(myX,myY,rectSize,rectSize,myColor);
}

function renderPath() {
	drawPath(closeGoal.pathX,closeGoal.pathY,'black');
	drawPath(farGoal.pathX,farGoal.pathY,'black');
}

// given a 0,0 centered coordinate, returns the canvas coordinate
function cen2canx(x) {
	return canvas.width/2+x;
}
function cen2cany(y) {
	return canvas.height/2+y;
}

function drawPath(pathX,pathY,color) {
	switch (color) {
		case 'red':
			ctx.strokeStyle = "#FF0000"; break;
		case 'green':
			ctx.strokeStyle = "#00FF00"; break;
		case 'blue':
			ctx.strokeStyle = "#0000FF"; break;
		case 'black':
			ctx.strokeStyle = "#000000"; break;
	}
	ctx.lineWidth = "2";
	ctx.beginPath();
	ctx.moveTo(cen2canx(pathX[0]),cen2cany(pathY[0]));
	for (i=1;i<4;i++) {
		// iterate across path locations
		ctx.lineTo(cen2canx(pathX[i]),cen2cany(pathY[i]));
	}
	ctx.stroke();
}

function drawOpenRect(cx,cy,xs,ys,cflag) {
	switch (cflag) {
		case 'red':
			ctx.strokeStyle = "#FF0000"; break;
		case 'green':
			ctx.strokeStyle = "#00FF00"; break;
		case 'blue':
			ctx.strokeStyle = "#0000FF"; break;
	}
	ctx.lineWidth = "1";
	ctx.strokeRect(cen2canx(cx)-xs/2,cen2cany(cy)-ys/2,xs,ys);
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
	ctx.fillRect(cen2canx(cx)-xs/2,cen2cany(cy)-ys/2,xs,ys);
}

var spDist = 310;

function deg2rad(deg) {
	return deg * Math.PI / 180;
}

function setupStartPos() {
	// setup close goal
	closeGoal.x = closeGoal.rad*Math.sin(deg2rad(closeGoal.pos*45));
	closeGoal.y = closeGoal.rad*Math.cos(deg2rad(closeGoal.pos*45));
	closeH = randomElement([true, false]);
	path1 = createPath(0,0,closeGoal.x,closeGoal.y,closeH);
	closeGoal.pathX = path1[0];
	closeGoal.pathY = path1[1];
	closeGoal.pathH = path1[2];
	// far goals
	farGoal.x = farGoal.rad*Math.sin(deg2rad(farGoal.pos*45));
	farGoal.y = farGoal.rad*Math.cos(deg2rad(farGoal.pos*45));
	path2 = createPath(0,0,farGoal.x,farGoal.y,!closeH);
	farGoal.pathX = path2[0];
	farGoal.pathY = path2[1];
	farGoal.pathH = path2[2];
	// me 
	myX = 0;
	myY = 0;
}

var trial  = {

	pushData: function(leftFull) {
		// things you might want to use:
		// flippedTime
		// myStartX
		// myStartY
		// goalX
		// goalY
		// xPos
		// yPos
		// gravity
		// friction
		// jitter
		// randControl
		// flipCons (flipControls)

		// things that are redundant if you track the above:
		// startPos
		// myStartPos
	},

	resetRects: function() {
		setupStartPos();
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
			$(document.body).css("cursor","none");
			//tell the trial to start in 1s
			setTimeout(trial.run2,1000);
		}
	},

	run2: function() {
		showSlide("frame");
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
		setTimeout(function() {showSlide("trial");},2000);
	},
};