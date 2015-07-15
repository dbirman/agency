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
  			if (curTrial > 0) { trial.pushData();}
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
}

var allData = {};

allData['trialData'] = [];
allData['ibData'] = [];

// EXPERIMENT

// exp vars
var inst;
// game vars
var gravity = false, friction = false, jitter = false, randControl = false, flipCons = false;
// agency manipulation vars
var chooseGoal = false, forcePath = false, autoMove = false;
// trial type
var ibTrial = false, ibInterval = []; ibLength = 7000; ibColors = [];
//
var startPos;
// Path tracking (for forcePath)
var curPathClose = null;
var curPathSeg = -1;
// game parameters
var gAccel = 0.000025, fricVal = 0.00001, fricPerc = 0.0005, jitterStr = 10, randSwitch = 1000;
var params = {g:gAccel,fric:fricVal,fricP:fricPerc,jitter:jitterStr,randS:randSwitch};
allData['params'] = params;
// goal settings
var closeGoal = {
	x: 0,
	y: 0,
	quad: 0,
	rad: 125,
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
	quad: 0,
	rad: 325,
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
		breakPoint = randomElement(Array.range(rectSize/2,dist-(rectSize/2),1));
		pathX.push(sX+breakPoint);
		pathX.push(sX+breakPoint);
		pathY.push(sY);
		pathY.push(eY);
		pathH = [true, false, true];
	} else {
		// start vertical
		dist = eY - sY; // total distance to travel
		breakPoint = randomElement(Array.range(rectSize/2,dist-(rectSize/2),1));
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
// var cgList= [true, true, true, true , true],
// 	fpList = [true, false, false, false ,true],
// 	amList = [true, true, false, false ,true];
	ibList = [false, false, false, false, false, false, false, false, false, false, true, true, true, true, true];
var firstIbTrial = 11;

// var ibList = [true, true];
// var firstIbTrial = 1;

chooseGoalType = randomElement([true,false]);
forcePathType = randomElement([true,false]);
automoveType = randomElement([true,false]);

// var gList = [	false	],
// 	fList = [	true 	],
// 	jList = [	false 	],
// 	rList = [	false	],
// 	flList = [	false 	];
// var cgList= [true ],
// 	fpList = [true],
// 	vaList = [true ];
// 	ibList = [ true];

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
		if (curTrial <= ibList.length) {
			ibTrial = ibList[curTrial-1];
			if (ibTrial) {
				ibStart = randomElement(Array.range(250,5000,50));
				flipOne = randomElement(Array.range(0,750,50)); // length of interval to estimate
				flipTwo = randomElement(Array.range(250,1000,50));
				ibInterval = [ibStart, ibStart+flipOne, ibStart+flipOne+flipTwo];
				ibColorList = ['red','yellow','green','blue','purple','teal','black'];
				shuff = shuffleArray(ibColorList);
				ibColors = [shuff[0],shuff[1],shuff[2]];
				document.getElementById('timebox').value="";
			} else {
				// regular trial (note indexed from 0->)
				// control variables
				gravity = false;
				friction = true;
				jitter = false;
				randControl = false;
				flipCons = false;
				// game variables
				chooseGoal = chooseGoalType;
				forcePath = forcePathType;
				autoMove = automoveType;
				automoving = false;
				// reset tracking
				xPos = []; yPos = []; flippedTime = [];
				// instructions, start location
				inst = 0;
				posOpts = [1,3,5,7];
				quads = [2, 2, 1, 1, 4, 4, 3, 3];
				closeGoal.pos = randomElement(posOpts);
				closeGoal.quad = quads[closeGoal.pos];
				farGoal.pos = (closeGoal.pos + 4) % 8;
				farGoal.quad = quads[farGoal.pos];
				if (!chooseGoal) {
					closeGoal.target = randomElement([true, false]);
					farGoal.target = !closeGoal.target;
				} else {
					closeGoal.target = false; farGoal.target = false;
				}
				// track first movement
				firstMove = false;
			}
		} else {
			experiment.end();
			return;
		}

		experiment.showInstructions();
	},

	showInstructions: function() {
		showSlide("trial_instructions");
		if (ibTrial) {
			if (curTrial==firstIbTrial) {$("#inst_warning").show();} else {$("#inst_warning").hide();}
			$("#inst").hide();
			$("#inst_reaper").show();
		} else {
			$("#inst_warning").hide();
			$("#inst").show();
			$("#inst_reaper").hide();
		}
	},

	ready: function() {
		trial.run();
	},

	setupNext: function() {
		if (!dead) {
			if (curTrial > 0) {
				// Die on trial 3 and go to preview screen
				if (curTrial == 3) {
					try {
						if (opener.turk.previewMode()) {
							experiment.end();
						} else {
							trial.pushData(false);
							showSlide("trial");
						}
					} catch(err) {
						// probably opener.turk isn't defined 
						trial.pushData(false);
						showSlide("trial");
					}
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

var maxTime = 7500;

// tracking variables
var frameID, started, flippedTime = [], xPos = [], yPos = [];

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
	// Stop conditions
	if (ibTrial) {
		if ((time-started) > ibLength) {
			window.cancelAnimationFrame(frameID);
			trial.ib_getresp();
			return;
		}
	} else {
		if ((time-started) > maxTime) {
			window.cancelAnimationFrame(frameID);
			trial.resp(false);
			return;
		}
	}

	// From here on we do different things depending on the trial type

	if (ibTrial) {
		// deal with intentional binding trials
		// do nothing... everything happens in render
	} else {
		// regular trials

		// check and move my rect if neccessary
		checkMove(diffTime,0.0001);

		// check if we made it to the goal state
		if (checkGoal()) {
			window.cancelAnimationFrame(frameID);
			myColor = 'green';
			render();
			setTimeout(function() {trial.resp(true);},1000);
			return;
		}

		// forces
		fundamentalForces(diffTime);

		// move
		diffs = myMove(diffTime);

		// check that we didn't move off-path
		if (automoving) {
			applyAutoMove(diffTime);
		} else {
			if (forcePath) {
				applyMoveRestricted(diffs[0],diffs[1])
			} else {
				applyMove(diffs[0],diffs[1]);
			}
		}

		// check that things aren't off-screen
		checkOffscreen();

		// tracking
		xPos.push(myX);
		yPos.push(myY);
	}

	// draw stuff
	render();
	
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
function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

var curSec = 0;
var pixPerSec = 100;

function applyAutoMove(elapsedTime) {
	cgoal = null;
	if (closeGoal.target) {cgoal = closeGoal;} else if (farGoal.target) {cgoal = farGoal;}

	pX = cgoal.pathX; pY = cgoal.pathY;

	if (forcePath) {
		// move, stay on path
		// Figure out where we are
		sec = curSec;
		if (sec < 3) {
			nX = pX[sec+1];
			nY = pY[sec+1];
			if (approxEqual(myX,nX) && approxEqual(myY,nY)) {
				curSec = curSec + 1;
				return
			}
			moveX = nX - myX;
			moveY = nY - myY;
			dY = sign(moveY)*Math.min(Math.abs(moveY),1)*elapsedTime/1000*pixPerSec;
			dX = sign(moveX)*Math.min(Math.abs(moveX),1)*elapsedTime/1000*pixPerSec;
			applyMove(dX,dY);
		}
	} else {
		// minimize distance to target
		moveX = pX[3] - myX;
		moveY = pY[3] - myY;
		dY = sign(moveY)*Math.min(Math.abs(moveY),1)*elapsedTime/1000*pixPerSec;
		dX = sign(moveX)*Math.min(Math.abs(moveX),1)*elapsedTime/1000*pixPerSec;
		applyMove(dX,dY);
	}
}

function approxEqual(a,b) {
	return a >= b-.01 && a <= b + .01
}

function listMean(list) {
	
}

function applyMoveRestricted(dX,dY) {
	// We're going to check whether making these dX/dY moves would take
	// us off of a path, if it would, we won't apply it.
	// get the current goal
	cgoal = null;
	if (closeGoal.target) {cgoal = closeGoal;} else if (farGoal.target) {cgoal = farGoal;}
	if (cgoal == null) {
		// We don't have a goal, just apply
		applyMove(dX,dY);
	} else {
		// Okay, we have a goal, figure out what path we overlap with and check whether this moves us off
		dX_adj = [];
		dY_adj = [];
		for(i=1;i<4;i++) {
			sx = cgoal.pathX[i-1];
			ex = cgoal.pathX[i];
			sy = cgoal.pathY[i-1];
			ey = cgoal.pathY[i];
			// Okay, check whether we are within range of ALL of these points
			if (contains(myX,sx,ex) && contains(myY,sy,ey)) {
				c = 0;
				cdX = dX; cdY = dY;
				while (!contains(myX+cdX,sx,ex)) {
					cdX = cdX * 0.9; c += 1;
					if (c > 10) {cdX = 0; break;}
				}
				c = 0;
				while (!contains(myY+cdY,sy,ey)) {
					cdY = cdY * 0.9; c += 1;
					if (c > 10) {cdY = 0; break;}
				}
				dX_adj.push(cdX);
				dY_adj.push(cdY);
			}
		}
		if (dX_adj.indexOf(0) >= 0 && dY_adj.indexOf(0) >= 0) {
			applyMove(dX,dY);
		} else {
			return
		}
	}
}

function contains(val,min,max) {
	// min and max could be flipped, so figure out which direction they go and then check the bounds
	// we allow a threshold of rectSize/2 degrees of freedom
	if (min < max) {
		return (val >= (min - rectSize/2)) && (val <= (max + rectSize/2));
	} else {
		// max < min
		return (val >= (max - rectSize/2)) && (val <= (min + rectSize/2));
	}
}

function myMove(elapsedTime) {
	dX = lVeloc*elapsedTime;
	dY = tVeloc*elapsedTime;
	// Add jitter if necessary
	if (jitter) {
		dX += Math.random()-0.5*elapsedTime/jitterStr;
		dY += Math.random()-0.5*elapsedTime/jitterStr;
	}
	return [dX, dY];
}

function applyMove(dX, dY) {
	myX += dX;
	myY += dY;
}

var lastRandSwitch = now();
var k_lO, k_dO, k_uO, k_rO;
var automoving = false;

function unique(value, index, self) { 
    return self.indexOf(value) === index;
}

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
	if (chooseGoal && !firstMove && (k_l || k_r || k_u || k_d)) {
		firstMove = true;
		if (autoMove) {automoving = true; curSec = 0;};
		// pick based on quadrants

		quadOpts = [];

		if (k_r) {quadOpts.push(1);quadOpts.push(2);}
		if (k_l) {quadOpts.push(3);quadOpts.push(4);}
		if (k_d) {quadOpts.push(2);quadOpts.push(3);}
		if (k_u) {quadOpts.push(4);quadOpts.push(1);}

		uqOpts = quadOpts.filter(unique);

		if (uqOpts.indexOf(closeGoal.quad)>=0) {
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
	if (closeGoal.target) {
		return cgHelper(closeGoal.x,closeGoal.y);
	} else if (farGoal.target) {
		return cgHelper(farGoal.x, farGoal.y);
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
	if (ibTrial) {
		renderFlash();
	} else {
		if (forcePath) {renderPath();}
		renderGoal();
		if (true || !firstMove) {
			renderMy();
		}
	}
}

function renderFlash() {
	elapsed = now() - started;
	if (elapsed < ibInterval[0]) {
		// We are at the start, color = red
		cColor = ibColors[0]
	} else if (elapsed < ibInterval[1]) {
		// We are in the color change part, color = green
		cColor = ibColors[1];
	} else {
		// trial end, color = red
		cColor = ibColors[2];
	}
	drawCircle(0,0,cColor);
}

function drawCircle(x,y,color) {
	ctx.fillStyle = parseColor(color);
	ctx.beginPath();
	ctx.arc(cen2canx(x),cen2cany(y),50,0,2*Math.PI);
	ctx.fill();
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
	if (closeGoal.target) {drawPath(closeGoal.pathX,closeGoal.pathY,closeGoal.pathH,'black');}
	if (farGoal.target) {drawPath(farGoal.pathX,farGoal.pathY,farGoal.pathH,'black');}
}

// given a 0,0 centered coordinate, returns the canvas coordinate
function cen2canx(x) {
	return canvas.width/2+x;
}
function cen2cany(y) {
	return canvas.height/2+y;
}

// computes the difference of arrays r and n elementwise
function arrayDiff(r,n){if(!r.length==n.length)throw new Error("unequal array lengths");for(a3=[],i=0;i<r.length;i++)a3.push(r[i]-n[i]);return a3}
function arrayMult(r,n){if(!r.length==n.length)throw new Error("unequal array lengths");for(a3=[],i=0;i<r.length;i++)a3.push(r[i]*n[i]);return a3}

function drawPath(pathX,pathY,pathH,color) {
	ctx.strokeStyle = parseColor(color);
	ctx.lineWidth = "2";
	// First figure out what quadrant we are going into
	quadrant=pathX[3]>pathX[0]?pathY[3]<pathY[0]?1:2:pathY[3]<pathY[0]?4:3;

	inv = [-1,-1,-1,-1];
	modX1 = [0,-rectSize,-rectSize,0];
	modY1 = [-rectSize,-rectSize,-rectSize,-rectSize];
	pathX1 = []; pathY1 = []; pathX2 = []; pathY2 = []; modX = []; modY = [];
	switch (quadrant) {
		case 1:
			// now we do different things if we are going vert or horz first
			if (pathH[0]) {
				modX = modX1;
				modY = modY1;
			} else {
				modY = modX1;
				modX = modY1;			
			}
			break;
		case 2:
			if (pathH[0]) {
				modX = modX1;
				modY = arrayMult(modY1,inv);
			} else {
				modY = modX1;
				modX = arrayMult(modY1,inv);
			}
			break;
		case 3:
			if (pathH[0]) {
				modX = arrayMult(modX1,inv);
				modY = arrayMult(modY1,inv);
			} else {
				modY = arrayMult(modX1,inv);
				modX = arrayMult(modY1,inv);
			}
			break;
		case 4:
			if (pathH[0]) {
				modX = arrayMult(modX1,inv);
				modY = modY1;
			} else {
				modY = arrayMult(modX1,inv);
				modX = modY1;
			}
			break;
	}
	pathX1 = arrayDiff(pathX,modX);
	pathX2 = arrayDiff(pathX,arrayMult(modX,inv));
	pathY1 = arrayDiff(pathY,modY);
	pathY2 = arrayDiff(pathY,arrayMult(modY,inv));

	ctx.beginPath();
	ctx.moveTo(cen2canx(pathX1[0]),cen2cany(pathY1[0]));
	for (i=1;i<4;i++) {
		ctx.lineTo(cen2canx(pathX1[i]),cen2cany(pathY1[i]));
	}
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(cen2canx(pathX2[0]),cen2cany(pathY2[0]));
	for (i=1;i<4;i++) {
		ctx.lineTo(cen2canx(pathX2[i]),cen2cany(pathY2[i]));
	}
	ctx.stroke();
}

function drawOpenRect(cx,cy,xs,ys,color) {
	ctx.strokeStyle = parseColor(color);
	ctx.lineWidth = "1";
	ctx.strokeRect(cen2canx(cx)-xs/2,cen2cany(cy)-ys/2,xs,ys);
}

function drawRect(cx,cy,xs,ys,color) {
	ctx.fillStyle = parseColor(color);
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

	pushData: function() {
		if (ibTrial) {
		
			ibData = {};

			ibData['intervals'] = ibInterval;
			ibData['interval'] = ibInterval[1]-ibInterval[0];
			ibData['intervalEst'] = intervalEst;
			ibData['ibColors'] = ibColors;

			allData['ibData'].push(ibData);
		} else {
			trialData = {};

			trialData['closeGoal'] = closeGoal;
			trialData['farGoal'] = farGoal;

			trialData['xPos'] = xPos;
			trialData['yPos'] = yPos;
			trialData['flippedTime'] = flippedTime;

			trialData['gravity'] = gravity;
			trialData['friction'] = friction;
			trialData['jitter'] = jitter;
			trialData['randControl'] = randControl;
			trialData['flipCons'] = flipCons;

			trialData['chooseGoal'] = chooseGoal;
			trialData['forcePath'] = forcePath;
			trialData['autoMove'] = autoMove;

			trialData['maxTime'] = maxTime;

			allData['trialData'].push(trialData);
		}
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
			maxTime -= 333;
			$("#resp-success").show();
			$("#resp-fail").hide();
		} else {
			maxTime += 1000;
			$("#resp-success").hide();
			$("#resp-fail").show();
		}
		setTimeout(function() {experiment.setupNext();},2000);
	},

	ib_getresp: function() {
		$(document.body).css("cursor","auto");
		showSlide("ib_response");
		$("resp-text").show();
		$("timebox").show();
	},

	ib_resp: function() {
		// they pressed the button, check the input
		if (document.getElementById('timebox').value=="") {
			alert("Please enter the elapsed time in milliseconds. If you aren't sure, make a rough guess");
			return;
		}
		//age info
		intervalEst = document.getElementById('timebox').value;
		experiment.setupNext();
	}
};