$(document).ready(function() {
	var table_data = [];
	$.get('/api/fetch_data', function(data) {
		table_data = data;
	}).fail(function (err) {
		console.log(err);
		$('.message').html('Something went wrong!');
	}).always(function() {
		showTable(table_data);
	});

	function getLabelClass(label) {
		return "label__" + label;
	}

	/**
	 * Render table from data (ajax)
	 * @param data
	 */
	function showTable(data) {
		var body = $("#list_content");
		if (!data || !data.length) {
			var msg = "Not data to show!";
			body.html("<tr><td colspan='4' class='text-center table-danger'>"+msg+"</td></tr>");
			return;
		}

		var html = [];
		for (var i in data) {
			var id_link = "<a href='"+ data[i].article_link +"' target='_blank'>"+ data[i].id +"<a/>";
			var btns = [
				"<a class='btn btn-danger btn-label' data-id='"+ data[i].id +"' data-label='-1' href='#'>Negative</a>",
				"<a class='btn btn-outline-primary btn-label' data-id='"+ data[i].id +"' data-label='0' href='#'>Neutral</a>",
				"<a class='btn btn-success btn-label' data-id='"+ data[i].id +"' data-label='1' href='#'>Positive</a>",
			];

			html.push(
				$('<tr class="" />').addClass(getLabelClass(data[i].label))
					.append($('<td />').html(id_link).addClass('id'))
					.append($('<td />').html(data[i].content).addClass('content'))
					.append($('<td />').html(data[i].label).addClass('label'))
					.append($('<td />').html(btns.join(" ")))
			);
		}

		body.html(html);
	}

	$('tbody').on('click', '.btn-label', function(e) {
		var id = $(this).data('id');
		var label = $(this).data('label');
		var data = {
			id: id,
			label: label
		}

		$.ajax({
			url: '/api/set_label',
			type: 'POST',
			data: data,
			success: function(result) {
				for (var i in table_data) {
					if (table_data[i].id == result.id) {
						table_data[i] = result;
					}
				}
				showTable(table_data);
			},
			error: function(err) {
				alert('Something went wrong!');
				console.log(err);
			}
		});


		e.preventDefault();
	});
});