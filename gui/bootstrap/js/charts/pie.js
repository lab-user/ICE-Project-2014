$(function() {
	var pieData;
	var rememberPiston;
	var rememberPlumgrid;
	refreshPie();
	/**
	 * Updates the pie charts of the ticket statuses each second. 
	 */
	function refreshPie() {
		var partners = ["piston", "plumgrid"];
		for (var i = 0; i < partners.length; i++) {
			getData(partners[i])
		}
		setTimeout(refreshPie, 1000);
	}
	/**
	 * Gets all the tickets of one partner and counts the amount of tickets per status.
	 * Then, one pie chart is being created for each partner showing the percentage of the statuses.
	 * 
	 * @param {String} partner name
	 */
	function getData(partner) {
		$.ajax({
			type: "GET",
			url: "http://toolchainapi.beta.scapp.io/api/v1/tickets?partnerName=" + partner,
			success: function(data) {
				var neww = 0;
				var validation = 0;
				var assigned = 0;
				var onhold = 0;
				var working = 0;
				var delivered = 0;
				var closed = 0;
				var declined = 0;
				for (var i = 0; i < data.length; i++) {
					switch (data[i].status)	{
					case "new":
						neww++;
						break;
					case "validation":
						validation++;
						break;
					case "assigned":
						assigned++;
						break;
					case "on hold":
						onhold++;
						break;
					case "working":
						working++;
						break;
					case "delivered":
						delivered++;
						break;
					case "closed":
						closed++;
						break;
					case "declined":
						declined++;
						break;
					default:
						break;
					}
				};
				pieData = [
					{ label: "new",  data: neww},
					{ label: "validation",  data: validation},
					{ label: "assigned",  data: assigned},
					{ label: "on hold",  data: onhold},
					{ label: "working",  data: working},
					{ label: "delivered",  data: delivered},
					{ label: "closed",  data: closed},
					{ label: "declined",  data: declined}
				];
				createPie(pieData, partner);
			}
		});
	}
	/**
	 * Generates a pie chart with the number of tickets per status.
	 * 
	 * @param {Array} information for the pie chart
	 * @param {String} name of the partner
	 */
	function createPie(data, partner) {
		var placeholder = $("#"+partner+"Placeholder");
		placeholder.unbind();
		$.plot(placeholder, data, {
			series: {
				pie: { 
					innerRadius: 0.3,
					show: true,
					label: {
						show: true,
						radius: 3/4,
						formatter: labelFormatter,
						background: {
							opacity: 0.5,
							color: '#000'
						}
					}
				}
			},
			grid: {
				hoverable: true,
				clickable: true
			},
			legend: {
				show: false
			}
		});
		placeholder.bind("plothover", function(event, pos, obj) {
			if (!obj) {
				return;
			}
			var percent = parseFloat(obj.series.percent).toFixed(2);
			$("#hover").html("<span style='font-weight:bold; color:" + obj.series.color + "'>" + obj.series.label + " (" + percent + "%)</span>");
		});
		placeholder.bind("plotclick", function(event, pos, obj) {
			if (!obj) {
				return;
			}
			// further information about certain status
			$("#pie-"+partner).html("Amount of tickets with the status \"" + obj.series.label + "\": " + obj.series.data.toString().split(",")[1] + "</ br>");
			var remember;
			if(partner == "piston") {
				remember = rememberPiston;
				rememberPiston = obj.series.label;
			} else {
				remember = rememberPlumgrid;
				rememberPlumgrid = obj.series.label;
			}
			if(obj.series.label == remember) {
				$("#pie-"+partner).toggle( "slow", function() {
				});
			} else {
				$("#pie-"+partner).show( "slow", function() {
				});
			}	
		});
	}
	/**
	 * A custom formatter used for the labels on the pie charts.
	 */
	function labelFormatter(label, series) {
		return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
	}

});