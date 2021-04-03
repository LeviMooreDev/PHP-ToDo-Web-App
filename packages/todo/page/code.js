let lists = [];
let tasks = [];

API.simple("todo", "get-tasks", "",
	function (result)
	{
		lists = result["lists"];
		setupTasks(lists);
	},
	function (result)
	{
		Alert.error("Something went wrong. See console (F12) for more info.");
	}
);


let editListDropdown = $("#edit-list-dropdown");
let editListButton = $("#edit-list-dropdown button");
let editListNew = $("#edit-list-dropdown input");

function setupTasks(lists)
{
	let tabsElement = $("#lists");
	let tasksElement = $("#tasks");
	for (let list in lists)
	{
		let active = list == "list1";
		let id = list.toLowerCase().replace(" ", "-");

		$("#edit-list-options").append(`<a class="dropdown-item" href="#" onclick="setList('${list}')">${list}</a>`);

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

			let date = task["date"];
			let dateClass = "";
			if (date)
			{
				let daysLeft = Math.ceil((new Date(task["date"]).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
				if (daysLeft == 0)
				{
					date = "Today";
				}
				else if (daysLeft == 1)
				{
					date = "Tomorrow";
				}
				else if (daysLeft == -1)
				{
					date = "Yesterday";
				}
				else if (daysLeft > 0)
				{
					date = daysLeft + " Days";
				}
				else
				{
					date = Math.abs(daysLeft) + " Days Ago";
					dateClass = "date-overdue"
				}
			}



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
						${date ? '<span class="task-time ' + dateClass + '">' + date + ' <i class="far fa-clock"></i> </span>' : ""}
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
			setList(task["list"]);
			editListNew.val("");
			$("#edit-date").val(task["date"]);
			resetDeleteButton();
			$(".new-group").hide();
			$(".edit-group").show();
			$('#editModal').modal();
		});
	}
}

function setList(value)
{
	editListButton.html(value);
	editListButton.attr("data-value", value);
}

editListNew.on("input", function ()
{
	setList(editListNew.val());
});
editListNew.keyup(function (e)
{
	if (e.keyCode == 13)
	{
		if (document.activeElement == editListNew[0])
		{
			//we give the list button focus and click it instead of using "dropdown('toggle');"
			//this is to avoid "popper Cannot read property 'setAttribute' of null".
			//the error occurs because the dropdown structureis not "correct". Everything should be on the same level, but I don't want to do that.
			editListButton.focus();
			editListButton.click();
			setList(editListNew.val());
		}
	}
});

$('.dropdown-item.new-list').on('click', function (e)
{
	e.stopPropagation();
});

//delete
let deleteButton = $('#edit-delete');
deleteButton.on('click', function (e)
{
	if (deleteButton.attr("data-confirm"))
	{
		$('#editModal').modal('hide');
	}
	else
	{
		deleteButton.attr("data-confirm", true);
		$('#edit-delete').html("Confirm deletion");
	}
});
function resetDeleteButton()
{
	deleteButton.removeAttr("data-confirm");
	$('#edit-delete').html("Delete");
}

//new
let newButton = $('#new-button');
newButton.on('click', function (e)
{
	$("#edit-name").val("");
	$("#edit-description").val("");
	setList("None");
	editListNew.val("");
	$("#edit-date").val("");
	$(".new-group").show();
	$(".edit-group").hide();
	$('#editModal').modal();
});

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