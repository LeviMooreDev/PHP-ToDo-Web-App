//when the page is ready.
$(document).ready(function ()
{
	Core.ready();
	Edit.ready();
	Update.ready();
	Create.ready();
})

/**
 * Handles getting tasks from database
 */
class Core
{
	static by;
	static checkingRefreshing = false;
	static autoRefreshTime = 2000;
	static lastUpdate = null;
	static taskIdAttribute = "data-task-id"; //the attribute used to store task id in.
	static activeListCookieName = "active-list";

	static lists;
	static tasks;

	static ready()
	{
		Core.getLiveData();
		Core.autoRefresh();
	}

	//update page with tasks from database.
	//all data no tsaved will be cleared.
	static getLiveData(callback)
	{
		API.simple("todo", "get", "",
			function (result)
			{
				Core.by = result["by"];

				Core.tasks = {};
				for (let i in result["tasks"])
				{
					let task = result["tasks"][i];
					Core.addTaskLocal(task, false);

					let taskUpdatedAt = new Date(task["updated_at"]);
					if (Core.lastUpdate == null || taskUpdatedAt > Core.lastUpdate)
					{
						Core.lastUpdate = taskUpdatedAt;
					}
				}

				Core.updateListsArray();

				//generate html
				HTML.generate();

				if (callback)
				{
					callback();
				}
			},
			function (result)
			{
				Alert.error("Something went wrong. See console (F12) for more info.");
				console.log(result);
			}
		);
	}

	static addTaskLocal(data, updateList = true)
	{
		Core.tasks[data.id] = data;

		if (updateList)
		{
			Core.updateListsArray();
		}
	}

	static updateTaskLocal(data, updateList = true)
	{
		let task = Core.tasks[data.id];
		if (data.done != undefined)
		{
			task.done = data.done;
		}
		if (data.name != undefined)
		{
			task.name = data.name;
		}
		if (data.list != undefined)
		{
			task.list = data.list;
		}
		if (data.date != undefined)
		{
			task.date = data.date;
		}
		if (data.priority != undefined)
		{
			task.priority = data.priority;
		}
		if (data.description != undefined)
		{
			task.description = data.description;
		}

		Core.tasks[data.id] = task;

		//update list data
		if (updateList)
		{
			Core.updateListsArray();
		}
	}

	static deleteTaskLocal(id, updateList = true)
	{
		delete Core.tasks[id];

		//update list data
		if (updateList)
		{
			Core.updateListsArray();
		}
	}

	static updateListsArray()
	{
		Core.lists = [];
		for (let i in Core.tasks)
		{
			let task = Core.tasks[i];

			if (Core.lists.indexOf(task["list"]) == -1)
			{
				Core.lists.push(task["list"]);
			}
		}

		Core.lists.sort(function (a, b)
		{
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
	}

	static autoRefresh()
	{
		setInterval(() =>
		{
			if (Core.checkingRefreshing)
			{
				return;
			}

			if ((Edit.modal.data('bs.modal') || {})._isShown)
			{
				return;
			}

			Core.checkingRefreshing = true;

			API.simple("todo", "last-updated", { by: Core.by },
				function (result)
				{
					if (Core.lastUpdate != null && new Date(result["updated_at"]) > Core.lastUpdate)
					{
						Core.getLiveData(() =>
						{
							Core.checkingRefreshing = false;
						});
					}
					else
					{
						Core.checkingRefreshing = false;
					}
				},
				function (result)
				{
					console.log(result);
					Core.checkingRefreshing = false;
				}
			);
		}, Core.autoRefreshTime);
	}

	static getListId(list)
	{
		return "list-" + list.toLowerCase().replace(" ", "-");
	}

	static isListActive(list)
	{
		let activeList = Core.getActiveList();
		if (Core.lists.length != 0)
		{
			if (activeList == "")
			{
				activeList = Core.lists[0];
			}
			else if (Core.lists.indexOf(activeList) == -1)
			{
				activeList = Core.lists[0];
			}
		}
		return list == activeList;
	}
	
	static getActiveList()
	{
		return getCookie(Core.activeListCookieName);
	}

	static setActiveListCookie(list)
	{
		setCookie(Core.activeListCookieName, list, 9999);
	}

	static goToList(list)
	{
		$("#" + Core.getListId(list) + "-tab").click();
		Core.setActiveListCookie(list);
	}
}

/**
 * Handles all html generation.
 */
class HTML
{
	static listsElement = $("#lists"); //the list of lists (tabs) at the top of the page.
	static tasksElement = $("#tasks"); //the area below the lists where all the tasks are.
	static listOptionsElement = $("#edit-list-options"); //the list of options in the list 

	static generate()
	{
		HTML.listsElement.html("");
		HTML.tasksElement.html("");
		HTML.listOptionsElement.html("");

		for (let i in Core.lists)
		{
			let list = Core.lists[i];

			//list option
			HTML.listOptionsElement.append(HTML.generateListEditOption(list));

			//list tab
			HTML.listsElement.append(HTML.generateListTab(list));

			//list content
			HTML.tasksElement.append(HTML.generateListContent(list));
		}

		//tasks
		let sortedTasks = Object.values(Core.tasks).sort(function (a, b)
		{
			//sort by priority 
			let priority = b.priority - a.priority;;
			if (priority != 0){
				return priority;
			}

			//then by date
			if(a.date == null){
				return 1;
			}
			if(b.date == null){
				return -1;
			}
			a = a.date.split('/').reverse().join('');
			b = b.date.split('/').reverse().join('');
			return a > b ? 1 : a < b ? -1 : 0;
		});
		for (let i in sortedTasks)
		{
		}

		HTML.setupSlidingTabs();

		$("#loading").remove();
	}
	static generateListEditOption(list)
	{
		return `<a class="dropdown-item" href="#" onclick="Edit.setList('${list}')">${list}</a>`;
	}
	static generateListTab(list)
	{
		let active = Core.isListActive(list);
		let id = Core.getListId(list);
		return `
		<li class="nav-item">
			<a class="nav-link ${active ? 'active' : ''}" id="${id}-tab" data-toggle="tab" href="#${id}" onclick="Core.setActiveListCookie('${list}')" role="tab" aria-controls="${id}" aria-selected="true">${list}</a>
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
				dateClass = "task-overdue";
			}
		}

		return `
		<li class="list-group-item" ${Core.taskIdAttribute}="${task["id"]}">
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
				<div class="col open-edit">
					<div class="task-name d-flex align-items-center">${task["name"]}</div>
				</div>
				${task["priority"] ? '<div class="task-priority"><i class="far fa-star"></i></div>' : ""}
				${date ? '<span class="task-time ' + dateClass + '">' + date + ' <i class="far fa-clock"></i> </span>' : ""}
			</div>
		</li>
		`;
	}

	static setupSlidingTabs()
	{
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
	}
}

/**
 * Handles the edit modal. Updating and creating tasks is NOT its responsibility.
 */
class Edit
{
	static modal = $('#edit-modal');
	static createElements = $(".create-modal-element");
	static updateElements = $(".update-modal-element");
	static idElement = $("#edit-id");
	static nameElement = $("#edit-name");
	static dateElement = $("#edit-date");
	static descriptionElement = $("#edit-description");
	static priorityElement = $("#edit-priority");
	static listButtonElement = $("#edit-list-button");
	static listNewElement = $("#edit-list-new");

	static ready()
	{
		Edit.modal.removeAttr("style");

		Edit.listNewElement.on("input", function ()
		{
			Edit.setList(Edit.listNewElement.val());
		});

		Edit.listNewElement.keyup(function (e)
		{
			if (e.keyCode == 13)
			{
				if (document.activeElement == Edit.listNewElement[0])
				{
					//we give the list button focus and click it instead of using "dropdown('toggle');"
					//this is to avoid "popper Cannot read property 'setAttribute' of null".
					//the error occurs because the dropdown structureis not "correct". Everything should be on the same level, but I don't want to do that.
					Edit.listButtonElement.focus();
					Edit.listButtonElement.click();
					Edit.setList(Edit.listNewElement.val());
				}
			}
		});

		Edit.listNewElement.parent().on('click', function (e)
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
		priority.console
		Edit.priorityElement.prop('checked', false);
		if (priority)
		{
			Edit.priorityElement.prop('checked', true);
		}
		Edit.setList(list);
		Edit.listNewElement.val("");

		Edit.modal.modal({ backdrop: 'static' })
	}

	static hide()
	{
		Edit.modal.modal('hide');
	}

	static isOpen()
	{

	}

	static setList(value)
	{
		Edit.listButtonElement.html(value);
		Edit.listButtonElement.attr("data-value", value);
	}

	static getData()
	{
		let id = Edit.idElement.attr(Core.taskIdAttribute);

		let name = Edit.nameElement.val().trim();
		let list = Edit.listButtonElement.html().trim();
		let description = Edit.descriptionElement.val().trim();
		let date = Edit.dateElement.val();
		let priority = Edit.priorityElement.prop('checked');

		return {
			id: id,
			name: name,
			list: list,
			description: description,
			date: date,
			priority: priority
		}
	}
}

/**
 * Update Task
 */
class Update
{
	static doneCheckboxSelector = ".list-group-item input[type=checkbox]";
	static openSelector = ".open-edit";
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
			//open edit modal
			$.each(mutations, function (i, mutation)
			{
				let elements = $(mutation.addedNodes).find(Update.openSelector).addBack(Update.openSelector);
				elements.each(function ()
				{
					Update.open($(this));
				});
			});
			//click done checbox
			$.each(mutations, function (i, mutation)
			{
				let elements = $(mutation.addedNodes).find(Update.doneCheckboxSelector).addBack(Update.doneCheckboxSelector);
				elements.each(function ()
				{
					$(this).click(function ()
					{
						Update.clickDone($(this));
					});
				});
			});
		});
		obs.observe(HTML.tasksElement[0], { childList: true });

		Update.deleteButtonElement.on('click', Update.clickDelete);
		Update.saveButton.on('click', Update.clickSave);
	}

	static open(button)
	{
		button.click(function ()
		{
			//get task
			let id = $(this).closest(".list-group-item").attr(Core.taskIdAttribute);
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

	static clickSave()
	{
		let data = Edit.getData();

		if (!data.name || data.name == null || data.name == "")
		{
			Alert.error("Name is missing");
			return;
		}
		if (!data.list || data.list == null || data.list == "")
		{
			Alert.error("List is missing");
			return;
		}

		API.simple("todo", "update", data,
			function (result)
			{
				if (result["success"] == true)
				{
					Core.updateTaskLocal(data);

					HTML.generate();
					Edit.hide();
					Core.goToList(data.list);

					Alert.success(result["message"]);
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
			let id = Edit.getData().id;
			API.simple("todo", "delete", { id: id },
				function (result)
				{
					if (result["success"] == true)
					{
						Core.deleteTaskLocal(id);

						HTML.generate();
						Edit.hide();

						Alert.success(result["message"]);
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
		else
		{
			Update.deleteButtonElement.attr(Update.deleteButtonConfirmAttribute, true);
			Update.deleteButtonElement.html(Update.deleteButtonConfirmText);
		}
	}

	static clickDone(checkbox)
	{
		let id = checkbox.closest(".list-group-item").attr(Core.taskIdAttribute);
		let done = checkbox.prop('checked');

		let data = {
			id: id,
			done: done
		};

		API.simple("todo", "update", data,
			function (result)
			{
				if (result["success"] == true)
				{
					Core.updateTaskLocal(data);
				}
				else if (result["success"] == false)
				{
					Alert.error(result["message"]);
					console.log(result);
				}
			},
			function (result)
			{
				Alert.error("Something went wrong. See console (F12) for more info.");
				console.log(result);
			}
		);
	}
}

/**
 * Create Task
 */
class Create
{
	static openButton = $('#open-create-task');
	static createButton = $('#edit-create');

	static ready()
	{
		Create.openButton.on('click', Create.open);
		Create.createButton.on('click', Create.create);
	}

	static open()
	{
		Edit.createElements.show();
		Edit.updateElements.hide();

		Edit.show("create", "", "", Core.getActiveList(), "", false);
	}

	static create()
	{
		let data = Edit.getData();

		if (!data.name || data.name == null || data.name == "")
		{
			Alert.error("Name is missing");
			return;
		}
		if (!data.list || data.list == null || data.list == "")
		{
			Alert.error("List is missing");
			return;
		}

		API.simple("todo", "create", data,
			function (result)
			{
				if (result["success"] == true)
				{
					data.id = result["id"];
					Core.addTaskLocal(data);

					HTML.generate();
					Edit.hide();
					Core.goToList(data.list);

					Alert.success(result["message"]);
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
}

//https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays)
{
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname)
{
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++)
	{
		var c = ca[i];
		while (c.charAt(0) == ' ')
		{
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0)
		{
			return c.substring(name.length, c.length);
		}
	}
	return "";
}