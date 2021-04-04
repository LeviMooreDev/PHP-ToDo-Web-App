$(document).ready(function ()
{
	Core.ready();
	Edit.ready();
	Update.ready();
	Create.ready();
})

/**
 * Core
 */
class Core
{
	static taskIdAttribute = "data-task-id";

	//elements and selectors
	static tabsElement = $("#lists");
	static tasksElement = $("#tasks");
	static listOptionsElement = $("#edit-list-options");

	static activeList = "list1";
	static lists = [];
	static tasks = [];

	static ready()
	{
		Core.getLiveData();
	}

	//get tasks from database
	static getLiveData()
	{
		API.simple("todo", "get", "",
			function (result)
			{
				//set lists
				Core.lists = result["lists"];
				//set tasks
				for (let list in Core.lists)
				{
					for (let index in Core.lists[list])
					{
						Core.tasks[Core.lists[list][index]["id"]] = Core.lists[list][index];
					}
				}
				//generate html
				Core.generateHtml();
			},
			function (result)
			{
				Alert.error("Something went wrong. See console (F12) for more info.");
				console.log(result);
			}
		);
	}

	//setup html
	static getListId(list)
	{
		return "list-" + list.toLowerCase().replace(" ", "-");
	}
	static isListActive(list)
	{
		return list == Core.activeList;;
	}

	static generateListOption(list)
	{
		return `<a class="dropdown-item" href="#" onclick="Edit.setList('${list}')">${list}</a>`;
	}
	static generateListTab(list)
	{
		let active = Core.isListActive(list);
		let id = Core.getListId(list);
		return `
		<li class="nav-item">
			<a class="nav-link ${active ? 'active' : ''}" id="${id}-tab" data-toggle="tab" href="#${id}" role="tab" aria-controls="${id}" aria-selected="true">${list}</a>
		</li>
		`;
	}
	static generateListContent(list)
	{
		let active = Core.isListActive(list);
		let id = Core.getListId(list);
		return `
		<div id="${id}" class="tab-pane fade ${active ? 'show active' : ''}" role="tabpanel" aria-labelledby="${id}">
			<ul class="list-group"></ul>
		</div>
		`;
	}
	static generateTask(task)
	{
		//date
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
				dateClass = "date-overdue";
			}
		}

		return `
		<li class="list-group-item">
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
				<div class="col" ${Core.taskIdAttribute}="${task["id"]}">
					<div class="task-name d-flex align-items-center">${task["name"]}</div>
				</div>
				${task["priority"] ? '<div class="task-priority"><i class="far fa-star"></i></div>' : ""}
				${date ? '<span class="task-time ' + dateClass + '">' + date + ' <i class="far fa-clock"></i> </span>' : ""}
			</div>
		</li>
		`;
	}
	static generateHtml()
	{
		Core.tabsElement.html("");
		Core.tasksElement.html("");
		Core.listOptionsElement.html("");

		for (let list in Core.lists)
		{
			//list option
			Core.listOptionsElement.append(Core.generateListOption(list));

			//list tab
			Core.tabsElement.append(Core.generateListTab(list));

			//list content
			Core.tasksElement.append(Core.generateListContent(list));

			//tasks
			let tableBody = $(`#${Core.getListId(list)} ul`);
			for (let index in Core.lists[list])
			{
				$(tableBody).append(Core.generateTask(Core.lists[list][index]));
			}
		}

		$("#loading").remove();
	}
}

/**
 * Edit Modal
 */
class Edit
{
	static modal = $('#editModal');
	static createElements = $(".create-modal-element");
	static updateElements = $(".update-modal-element");
	static idElement = $("#edit-id");
	static nameElement = $("#edit-name");
	static dateElement = $("#edit-date");
	static descriptionElement = $("#edit-description");
	static priorityElement = $("#edit-priority");

	static listDropdown = $("#edit-list-dropdown");
	static listButton = $("#edit-list-dropdown button");
	static listNew = $("#edit-list-dropdown input");
	static listNewDropdownItem = $(".dropdown-item.new-list");

	static ready()
	{
		Edit.modal.removeAttr("style");
		
		Edit.listNew.on("input", function ()
		{
			Edit.setList(Edit.listNew.val());
		});

		Edit.listNew.keyup(function (e)
		{
			if (e.keyCode == 13)
			{
				if (document.activeElement == Edit.listNew[0])
				{
					//we give the list button focus and click it instead of using "dropdown('toggle');"
					//this is to avoid "popper Cannot read property 'setAttribute' of null".
					//the error occurs because the dropdown structureis not "correct". Everything should be on the same level, but I don't want to do that.
					Edit.listButton.focus();
					Edit.listButton.click();
					Edit.setList(Edit.listNew.val());
				}
			}
		});

		Edit.listNewDropdownItem.on('click', function (e)
		{
			e.stopPropagation();
		});
	}

	static show(id, name, description, list, date, priority)
	{
		Edit.idElement.attr(Core.taskIdAttribute, id);
		Edit.nameElement.val(name);
		Edit.dateElement.val(date);
		Edit.descriptionElement.val(description);
		Edit.priorityElement.removeAttr("checked");
		if (priority)
		{
			Edit.priorityElement.attr("checked", "checked");
		}
		Edit.setList(list);
		Edit.listNew.val("");

		Edit.modal.modal();
	}
	static hide()
	{
		Edit.modal.modal('hide');
	}

	static setList(value)
	{
		Edit.listButton.html(value);
		Edit.listButton.attr("data-value", value);
	}
}

/**
 * Update Task
 */
class Update
{
	static saveButton = $('#edit-update');
	static deleteButtonElement = $('#edit-delete');
	static deleteButtonConfirmAttribute = "data-delete-confirm";
	static deleteButtonConfirmText = "Confirm deletion";
	static deleteButtonNormalText = "Delete";

	static ready()
	{
		//listen for new tasks being added
		let obs = new MutationObserver(function (mutations, observer)
		{
			$.each(mutations, function (i, mutation)
			{
				let selector = `[${Core.taskIdAttribute}]`;
				let elements = $(mutation.addedNodes).find(selector).addBack(selector);
				elements.each(function ()
				{
					Update.open($(this));
				});
			});
		});
		obs.observe($("#tasks")[0], { childList: true });

		Update.deleteButtonElement.on('click', Update.clickDelete);
		Update.saveButton.on('click', Update.clickSave);
	}

	static clickSave()
	{
		let id = Edit.idElement.attr(Core.taskIdAttribute);

		let name = Edit.nameElement.val().trim();
		if (!name || name == null || name == "")
		{
			Alert.error("Name is missing");
			return;
		}
		let list = Edit.listButton.html().trim();
		if (!list || list == null || list == "")
		{
			Alert.error("List is missing");
			return;
		}
		let description = Edit.descriptionElement.val().trim();
		let date = Edit.dateElement.val();
		let priority = Edit.priorityElement.prop('checked');

		let data = {
			id: id,
			name: name,
			list: list,
			description: description,
			date: date,
			priority: priority
		}
		API.simple("todo", "update", data,
			function (result)
			{
				if (result["success"] == true)
				{
					Alert.success(result["message"]);
					Core.getLiveData();
					Edit.hide();
				}
				else if (result["success"] == false)
				{
					console.log(result);
					Alert.error(result["message"]);
				}
			},
			function (result)
			{
				Alert.error("Something went wrong. See console (F12) for more info.");
				console.log(result);
			}
		);
	}

	static clickDelete()
	{
		if (Update.deleteButtonElement.attr(Update.deleteButtonConfirmAttribute))
		{
			Edit.hide();
		}
		else
		{
			Update.deleteButtonElement.attr(Update.deleteButtonConfirmAttribute, true);
			Update.deleteButtonElement.html(Update.deleteButtonConfirmText);
		}
	}

	static open(element)
	{
		element.click(function ()
		{
			//get task
			let id = $(this).attr(Core.taskIdAttribute);
			let task = Core.tasks[id];

			//reset delete button
			Update.deleteButtonElement.removeAttr(Update.deleteButtonConfirmAttribute);
			Update.deleteButtonElement.html(Update.deleteButtonNormalText);

			//only show elements for editing
			Edit.createElements.hide();
			Edit.updateElements.show();

			//show modal
			Edit.show(id, task["name"], task["description"], task["list"], task["date"], task["priority"]);
		});
	}
}

/**
 * Create Task
 */
class Create
{
	static createButton = $('#open-create-task');

	static ready()
	{
		Create.createButton.on('click', function (e)
		{
			Edit.createElements.show();
			Edit.updateElements.hide();

			Edit.show("create", "", "", "", "", false);
		});
	}
}


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