var started = false;

if (turk.previewMode) {
	$(".noprev").hide();
	$("#startButton").text('Preview 3 Trials');
}

function buttonClick() {
	$("#startButton").blur();
	if (!started || turk.previewMode) {
		started = true; window.open('agency.html');
	} else {
		alert('Please do not do this HIT more than once!');
	}
}