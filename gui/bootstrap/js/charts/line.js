$(function() {
	var data = [],
		totalPoints = 30;
	/**
	 * Creates random numbers to feed the diagram.
	 *
	 * @return {Array} random numbers
	 */
	function getRandomData() {
		if (data.length > 0)
			data = data.slice(1);
		// Do a random walk
		while (data.length < totalPoints) {
			var prev = data.length > 0 ? data[data.length - 1] : 5,
				y = prev + Math.random() * 10 - 5;
			if (y < 1) {
				y = 1;
			} else if (y > 9) {
				y = 9;
			}
			data.push(y);
		}
		// Zip the generated y values with the x values
		var res = [];
		for (var i = 0; i < data.length; ++i) {
			res.push([i, data[i]])
		}
		return res;
	}
	/**
	 * Sets up the control widget.
	 */
	var updateInterval = 300;
	$("#updateInterval").val(updateInterval).change(function () {
		var v = $(this).val();
		if (v && !isNaN(+v)) {
			updateInterval = +v;
			if (updateInterval < 1) {
				updateInterval = 1;
			} else if (updateInterval > 2000) {
				updateInterval = 2000;
			}
			$(this).val("" + updateInterval);
		}
	});
	// Define the diagrams.
	var plot = $.plot("#piston-traffic-placeholder", [ getRandomData() ], {
		series: {
			shadowSize: 0	// Drawing is faster without shadows
		},
		yaxis: {
			min: 0,
			max: 10
		},
		xaxis: {
			show: false
		}
	});
	var plot2 = $.plot("#plumgrid-traffic-placeholder", [ getRandomData() ], {
		series: {
			shadowSize: 0
		},
		yaxis: {
			min: 0,
			max: 10
		},
		xaxis: {
			show: false
		}
	});
	/**
	 * Generates the Diagrams with random content (at this point only for show).
	 */
	function update() {
		plot.setData([getRandomData()]);
		plot2.setData([getRandomData()]);
		// Since the axes don't change, ther's no need to call plot.setupGrid()
		plot.draw();
		plot2.draw();
		setTimeout(update, updateInterval);
	}
	update();
});