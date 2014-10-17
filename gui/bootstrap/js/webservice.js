$(document).ready(function() {
	var id = "";
	refreshTable();
	$('#mapping tr, #mapping h2, #mapping button').hide();
	/**
	 * Prevents the form from submitting when enter is pressed in the input field for the ID.
	 * Instead of that, the button for loading a user gets triggered.
	 */
	$('#id').keydown(function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			$('#butMapping').trigger("click");
			return false;
		}
	});
	/**
	 * Updates the ticket tables of the partners each second.
	 */
	function refreshTable() {
		var partners = ["piston", "plumgrid"];
		for (var i = 0; i < partners.length; i++) {
			doAjaxSelects(partners[i])
		}
		setTimeout(refreshTable, 1000);
	}
	/**
	 * Gets all the tickets of a partner and updates the corresponding table.
	 *
	 * @param {String} partner name
	 */
	function doAjaxSelects(partner) {
		$.ajax({
			type: "GET",
			url: "http://toolchainapi.beta.scapp.io/api/v1/tickets?partnerName=" + partner,
			success: function(data) {
				var table = document.getElementById(partner);
				deleteRows(table);
				insertCells(data,table);
			}
		});
	}
	/**
	 * Deletes all the rows of a table except the first one.
	 *
	 * @param {Element} reference to table
	 */
	function deleteRows(table) {
		for(var i = table.rows.length - 1; i > 0; i--) {
			table.deleteRow(i);
		}
	}
	/**
	 * Creates a row for each ticket of a partner.
	 *
	 * @param {Array} tickets
	 * @param {Element} reference to table
	 */
	function insertCells(data,table) {
		var tBody = table.getElementsByTagName("tbody")[0];
		for (var i = 0; i < data.length; i++) {
			var row = tBody.insertRow(i);
			row.insertCell(0).innerHTML = data[i].partnerID;
			row.insertCell(1).innerHTML = data[i].topic;
			// Without the div-tag including the overflow attribute the text would display over the next cell and beyond
			row.insertCell(2).innerHTML = '<div style="overflow: hidden">'+data[i].priority+'</div>';
			row.insertCell(3).innerHTML = '<div style="overflow: hidden">'+data[i].status+'</div>';
			row.insertCell(4).innerHTML = '<div style="overflow: hidden">'+data[i].processed+'</div>';
		}
	}
	/**
	 * Dynamically fills the mapping tables with the fields of the common schema
	 * and input fields for the mapping.
	 *
	 * @param {JSON-Object} mapping file
	 */
	function getMappingForm(data) {
		var table = document.getElementById("ticketstatuses");
		var firstRow = table.insertRow();
		firstRow.insertCell().innerHTML = "<b>Ticket Statuses</b>";
		firstRow.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.ticketStatuses[0].common + '">' +
		data.sourceSystem.mapping.ticketStatuses[0].common + '</label>';
		firstRow.insertCell().innerHTML = '<input type="text" ' + 
		'id="' + data.sourceSystem.mapping.ticketStatuses[0].common + '" ' +
		'value="' + data.sourceSystem.mapping.ticketStatuses[0].source + 
		'" class="form-control">';
		for (var i = 1; i < data.sourceSystem.mapping.ticketStatuses.length; i++) {
			var row = table.insertRow();
			row.insertCell();
			row.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.ticketStatuses[i].common + '">' +
			data.sourceSystem.mapping.ticketStatuses[i].common + '</label>';
			row.insertCell().innerHTML = '<input type="text" ' + 
			'id="' + data.sourceSystem.mapping.ticketStatuses[i].common + '" ' +
			'value="' + data.sourceSystem.mapping.ticketStatuses[i].source + 
			'" class="form-control">';
		};
		table = document.getElementById("prioritystatuses");
		firstRow = table.insertRow();
		firstRow.insertCell().innerHTML = "<b>Priority Statuses</b>";
		firstRow.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.priorityStatuses[0].common + '">' +
		data.sourceSystem.mapping.priorityStatuses[0].common + '</label>';
		firstRow.insertCell().innerHTML = '<input type="text" ' + 
		'id="' + data.sourceSystem.mapping.priorityStatuses[0].common + '" ' +
		'value="' + data.sourceSystem.mapping.priorityStatuses[0].source + 
		'" class="form-control">';
		for (var i = 1; i < data.sourceSystem.mapping.priorityStatuses.length; i++) {
			var row = table.insertRow();
			row.insertCell();
			row.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.priorityStatuses[i].common + '">' +
			data.sourceSystem.mapping.priorityStatuses[i].common + '</label>';
			row.insertCell().innerHTML = '<input type="text" ' + 
			'id="' + data.sourceSystem.mapping.priorityStatuses[i].common + '" ' +
			'value="' + data.sourceSystem.mapping.priorityStatuses[i].source + 
			'" class="form-control">';
		};
		table = document.getElementById("labeltypes");
		firstRow = table.insertRow();
		firstRow.insertCell().innerHTML = "<b>Label Types</b>";
		firstRow.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.labelTypes[0].common + '">' + 
		data.sourceSystem.mapping.labelTypes[0].common + '</label>';
		firstRow.insertCell().innerHTML = '<input type="text" ' + 
		'id="' + data.sourceSystem.mapping.labelTypes[0].common + '" ' +
		'value="' + data.sourceSystem.mapping.labelTypes[0].source + 
		'" class="form-control">';
		for (var i = 1; i < data.sourceSystem.mapping.labelTypes.length; i++) {
			var row = table.insertRow();
			row.insertCell();
			row.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.labelTypes[i].common + '">' + 
			data.sourceSystem.mapping.labelTypes[i].common + '</label>';
			row.insertCell().innerHTML = '<input type="text" ' + 
			'id="' + data.sourceSystem.mapping.labelTypes[i].common + '" ' +
			'value="' + data.sourceSystem.mapping.labelTypes[i].source + 
			'" class="form-control">';
		};
		table = document.getElementById("tickettypes");
		firstRow = table.insertRow();
		firstRow.insertCell().innerHTML = "<b>Ticket Types</b>";
		firstRow.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.ticketTypes[0].common + '">' +
		data.sourceSystem.mapping.ticketTypes[0].common + '</label>';
		firstRow.insertCell().innerHTML = '<input type="text" ' + 
		'id="' + data.sourceSystem.mapping.ticketTypes[0].common + '" ' +
		'value="' + data.sourceSystem.mapping.ticketTypes[0].source + 
		'" class="form-control">';
		for (var i = 1; i < data.sourceSystem.mapping.ticketTypes.length; i++) {
			var row = table.insertRow();
			row.insertCell();
			row.insertCell().innerHTML = '<label for="' + data.sourceSystem.mapping.ticketTypes[i].common + '">' +
			data.sourceSystem.mapping.ticketTypes[i].common + '</label>';
			row.insertCell().innerHTML = '<input type="text" ' + 
			'id="' + data.sourceSystem.mapping.ticketTypes[i].common + '" ' +
			'value="' + data.sourceSystem.mapping.ticketTypes[i].source + 
			'" class="form-control">';
		}
	}
	/**
	 * Sets all the necessary input fields to required.
	 */
	function setRequired() {
		document.getElementById("source").required=true;
		document.getElementById("sourceSystem").required=true;
		document.getElementById("token").required=true;
		document.getElementById("user").required=true;
		document.getElementById("password").required=true;
		document.getElementById("url").required=true;
	}
	/**
	 * Clears (not only resets) the whole form, including default values.
	 */
	function clearForm() {
		var form = document.getElementById("target");
		var frm_elements = form.elements;
		$("select#sourceSystem option[selected]").removeAttr("selected");
		for (i = 0; i < frm_elements.length; i++) {
			field_type = frm_elements[i].type.toLowerCase();
			switch (field_type)	{
				case "text":
				case "password":
				case "hidden":
					frm_elements[i].value = "";
					frm_elements[i].defaultValue = "";
					break;
				case "checkbox":
					frm_elements[i].checked = false;
					frm_elements[i].defaultChecked = false;
					break;
				case "select-one":
					frm_elements[i].selectedIndex = -1;
					frm_elements[i].defaultSelected = -1;
					break;
				default:
					break;
			}
		}
	}
	/**
	 * Removes all rows of the mapping tables.
	 */
	function clearMappingTables() {
		$("#ticketstatuses tr").remove();
		$("#prioritystatuses tr").remove();
		$("#labeltypes tr").remove();
		$("#tickettypes tr").remove();
	}
	/**
	 * Hides and clears the whole form, 
	 * including the removal of the mapping tables.
	 */
	$('#butCancel').click(function() {
		$('#mapping tr, #mapping h2, #mapping button').hide('slow', function() {
			clearForm();
			clearMappingTables();
		});
	});
	/**
	 * Makes a GET request to retrieve the common fields of the schema 
	 * and creates and shows an empty form.
	 */
	$('#butNew').click(function() {
		id = "";
		$.ajax({
			type: "GET",
			url: "http://toolchainapi.beta.scapp.io/api/v1/mapper?mapperID=" + "S3", //TODO
			success: function(data) {
				if(!($('#mapping tr').is(":visible"))) {
					getMappingForm(data);
				}
				$('#mapping tr').hide();
			}
		}).then(function(data) {
			clearForm();
			$('#mapping tr, #mapping h2, #mapping button').show('slow', function() {
				// Animation complete.
			});
			setRequired();
		});
	});
	/**
	 * Makes a GET request to retrieve the corresponding user to the entered ID
	 * and creates the form, including the filling of the input fields, checkboxes and dropdowns
	 * with values and default values. Furthermore, it sets the required fields to required.
	 */
	$('#butMapping').click(function() {
		id = document.getElementById("id").value;
		$.ajax({
			type: "GET",
			url: "http://toolchainapi.beta.scapp.io/api/v1/mapper?mapperID=" + id,
			success: function(data) {
				if (data == null) {
					alert("The user with the ID \"" + id + "\" could not be found.");
				} else {
					// set values
					document.getElementById("id").defaultValue = id;
					document.getElementById(data.sourceSystem.name.toLowerCase()).defaultSelected = true;
					document.getElementById("source").defaultValue=data.source;
					document.getElementById("token").defaultValue=data.sourceSystem.credentials.token;
					document.getElementById("user").defaultValue=data.sourceSystem.credentials.user;
					document.getElementById("password").defaultValue=data.sourceSystem.credentials.password;
					document.getElementById("url").defaultValue=data.sourceSystem.credentials.url;
					document.getElementById("defect").defaultValue=data.sourceSystem.Defect.name;
					document.getElementById("roadmap").defaultValue=data.sourceSystem.Roadmap.name;
					document.getElementById("ci").defaultValue=data.sourceSystem.CustomerIndividual.name;
					document.getElementById("defectBox").defaultChecked=data.sourceSystem.Defect.subscribed;
					document.getElementById("roadmapBox").defaultChecked=data.sourceSystem.Roadmap.subscribed;
					document.getElementById("ciBox").defaultChecked=data.sourceSystem.CustomerIndividual.subscribed;
					// set default values
					document.getElementById("id").value = id;
					document.getElementById(data.sourceSystem.name.toLowerCase()).selected = true;
					document.getElementById("source").value=data.source;
					document.getElementById("token").value=data.sourceSystem.credentials.token;
					document.getElementById("user").value=data.sourceSystem.credentials.user;
					document.getElementById("password").value=data.sourceSystem.credentials.password;
					document.getElementById("url").value=data.sourceSystem.credentials.url;
					document.getElementById("defect").value=data.sourceSystem.Defect.name;
					document.getElementById("roadmap").value=data.sourceSystem.Roadmap.name;
					document.getElementById("ci").value=data.sourceSystem.CustomerIndividual.name;
					document.getElementById("defectBox").checked=data.sourceSystem.Defect.subscribed;
					document.getElementById("roadmapBox").checked=data.sourceSystem.Roadmap.subscribed;
					document.getElementById("ciBox").checked=data.sourceSystem.CustomerIndividual.subscribed;
					if(($('#mapping tr').is(":visible"))) {
						clearMappingTables();
					} 
					getMappingForm(data);
					$('#mapping tr').hide();
				}
			}
		}).then(function(data) {
			if(data !== null) {
				$('#mapping tr, #mapping h2, #mapping button').show('slow', function() {
				});
				setRequired();
			}
		});
	});
	/**
	 * Reads the values out of the form and creates a JSON-object out of the input data.
	 * Depending on the existence of an ID, a POST or PUT request is being made.
	 * Then, it returns the ID to the client, clears all the values and hides the form.
	 */
	$('#target').submit(function(event) {
		event.preventDefault();
		var method;
		var notification;
		if(id=="") {
			method = "POST";
			nodification = "created";
		} else {
			method = "PUT";
			nodification = "modified";
		}
		var defectBox = document.getElementById("defectBox").checked;
		var defect = document.getElementById("defect").value=="";
		var roadmapBox = document.getElementById("roadmapBox").checked;
		var roadmap = document.getElementById("roadmap").value=="";
		var ciBox = document.getElementById("ciBox").checked;
		var ci = document.getElementById("ci").value=="";
		if(defectBox && defect || roadmapBox && roadmap || ciBox && ci) {
			alert("In the section \"type\" you activated a checkbox without providing the mapping. Please write the corresponding term in the field or uncheck the checkbox.");
			event.preventDefault();
		} else {
			var mapper = '{' +
				'"id":"' + id + '",' +
				'"source":"' + document.getElementById("source").value + '",' +
				'"sourceSystem":{' +
					'"name":"' + document.getElementById("sourceSystem").value + '",' +
					'"Defect":{' +
						'"subscribed":' + document.getElementById("defectBox").checked + ',' +
						'"name":"' + document.getElementById("defect").value + '"' +
					'},' +
					'"Roadmap":{' +
						'"subscribed":' + document.getElementById("roadmapBox").checked + ',' +
						'"name":"' + document.getElementById("roadmap").value + '"' +
					'},' +
					'"CustomerIndividual":{' +
						'"subscribed":' + document.getElementById("ciBox").checked + ',' +
						'"name":"' + document.getElementById("ci").value + '"' +
					'},' +
					'"credentials":{' +
						'"token":"' + document.getElementById("token").value + '",' +
						'"user":"' + document.getElementById("user").value + '",' +
						'"password":"' + document.getElementById("password").value + '",' +
						'"url":"' + document.getElementById("url").value + '"' +
					'},' +
					'"mapping":{' +
						'"ticketStatuses":[' +
							'{' +
								'"common":"new",' +
								'"source":"' + document.getElementById("new").value + '"' +
							'},' +
							'{' +
								'"common":"validation",' +
								'"source":"' + document.getElementById("validation").value + '"' +
							'},' +
							'{' +
								'"common":"assigned",' +
								'"source":"' + document.getElementById("assigned").value + '"' +
							'},' +
							'{' +
								'"common":"on hold",' +
								'"source":"' + document.getElementById("on hold").value + '"' +
							'},'+
							'{' +
								'"common":"working",' +
								'"source":"' + document.getElementById("working").value + '"' +
							'},' +
							'{' +
								'"common":"delivered",' +
								'"source":"' + document.getElementById("delivered").value + '"' +
							'},' +
							'{' +
								'"common":"closed",' +
								'"source":"' + document.getElementById("closed").value + '"' +
							'},' +
							'{' +
								'"common":"declined",' +
								'"source":"' + document.getElementById("declined").value + '"' +
							'}' +
						'],' +
						'"priorityStatuses":[' +
							'{' +
								'"common":"low",' +
								'"source":"' + document.getElementById("low").value + '"' +
							'},' +
							'{' +
								'"common":"standard",' +
								'"source":"' + document.getElementById("standard").value + '"' +
							'},' +
							'{' +
								'"common":"high",' +
								'"source":"' + document.getElementById("high").value + '"' +
							'},' +
							'{' +
								'"common":"urgent",' +
								'"source":"' + document.getElementById("urgent").value + '"' +
							'}' +
						'],' +
						'"labelTypes":[' +
							'{' +
								'"common":"assembly",' +
								'"source":"' + document.getElementById("assembly").value + '"' +
							'},' +
							'{' +
								'"common":"qa",' +
								'"source":"' + document.getElementById("qa").value + '"' +
							'}' +
						'],' +
						'"ticketTypes":[' +
							'{' +
								'"common":"issue",' +
								'"source":"' + document.getElementById("issue").value + '"' +
							'},' +
							'{' +
								'"common":"incident",' +
								'"source":"' + document.getElementById("incident").value + '"' +
							'},' +
							'{' +
								'"common":"question",' +
								'"source":"' + document.getElementById("question").value + '"' +
							'},' +
							'{' +
								'"common":"task",' +
								'"source":"' + document.getElementById("task").value + '"' +
							'}' +
						']' +
					'}' + 
				'}' +
			'}';
			obj = JSON.parse(mapper);
			$.ajax({
				type: method,
				url: "http://toolchainapi.beta.scapp.io/api/v1/mapper/",
				data: obj,
				success: function(data) {
					alert("The user with the ID " + data.id + " has been successfully " + nodification + ".");
				}
			});
			$('#mapping tr, #mapping h2, #mapping button').hide('slow', function() {
				clearForm();
				clearMappingTables();
			});
		}
	});
});
