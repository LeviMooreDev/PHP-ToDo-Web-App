let lists = [];
let tasks = [];

API.simple("todo", "get-tasks", "",
	function (result)
	{
		lists = result["lists"];
		setupTasks(lists);
		console.log(lists);
	},
	function (result)
	{
		Alert.error("Something went wrong. See console (F12) for more info.");
	}
);

function setupTasks(lists)
{
	let tabsElement = $("#lists");
	let tasksElement = $("#tasks");
	for (let list in lists)
	{
		let active = list == "list1";
		let id = list.toLowerCase().replace(" ", "-");

		let tabHtml = `
		<li class="nav-item">
			<a class="nav-link ${active ? 'active' : ''}" id="${id}-tab" data-toggle="tab" href="#${id}" role="tab" aria-controls="${id}" aria-selected="true">${list}</a>
		</li>
		`;
		$(tabsElement).append(tabHtml);

		let tasksHtml = `
		<div id="${id}" class="tab-pane fade ${active ? 'show active' : ''}" role="tabpanel" aria-labelledby="${id}">
			<ul class="list-group"></ul>
		</div>
		`;
		$(tasksElement).append(tasksHtml);

		let tableBody = $(`#${id} ul`);
		for (let index in lists[list])
		{
			let task = lists[list][index];
			tasks[task["id"]] = task;
			let itemHtml = `
			<li class="list-group-item">
				<div class="container">
					<div class="row">
						<div class="col">
							<div class="d-flex align-items-center">
								<label class="checkbox path">
									<input type="checkbox" ${task["done"] ? "checked" : ""}>
									<svg viewBox="0 0 21 21">
										<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
									</svg>
								</label>
							</div>
						</div>
						<div class="col" data-task-id="${task["id"]}">
							<div class="task-name d-flex align-items-center">${task["name"]}</div>
						</div>
						${task["star"] ? '<div class="task-star"><i class="far fa-star"></i></div>' : ""}
						${task["date"] ? '<span class="task-time">Today <i class="far fa-clock"></i> </span>' : ""}
					</div>
				</div>
			</li>
			`;
			$(tableBody).append(itemHtml);
		}

		//edit click
		$("#tasks .row .col:nth-child(2)").click(function ()
		{
			let id = $(this).attr("data-task-id");
			let task = tasks[id];
			$("#edit-name").val(task["name"]);
			$("#edit-description").val(task["description"]);
			//$("#edit-list").val(task["list"]);
			$("#edit-date").val(task["date"]);
			
			$('#editModal').modal();
		});
	}
}

//reorder

//tab sliding
$('a[data-toggle="tab"]').on('hide.bs.tab', function (e)
{
	var $old_tab = $($(e.target).attr("href"));
	var $new_tab = $($(e.relatedTarget).attr("href"));

	if ($new_tab.index() < $old_tab.index())
	{
		$old_tab.css('position', 'relative').css("right", "0").show();
		$old_tab.animate({ "right": "-100%" }, 300, function ()
		{
			$old_tab.css("right", 0).removeAttr("style");
		});
	}
	else
	{
		$old_tab.css('position', 'relative').css("left", "0").show();
		$old_tab.animate({ "left": "-100%" }, 300, function ()
		{
			$old_tab.css("left", 0).removeAttr("style");
		});
	}
});
$('a[data-toggle="tab"]').on('show.bs.tab', function (e)
{
	var $new_tab = $($(e.target).attr("href"));
	var $old_tab = $($(e.relatedTarget).attr("href"));

	if ($new_tab.index() > $old_tab.index())
	{
		$new_tab.css('position', 'relative').css("right", "-2500px");
		$new_tab.animate({ "right": "0" }, 500);
	}
	else
	{
		$new_tab.css('position', 'relative').css("left", "-2500px");
		$new_tab.animate({ "left": "0" }, 500);
	}
});