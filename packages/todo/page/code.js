//when the page is ready.
$(document).ready(function ()
{
	List.ready();
	Task.ready();
	Edit.ready();
	Update.ready();
	Create.ready();
})

/**
 * Handles getting tasks from database
 */
class Task
{
	static by;
	static checkingRefreshing = false;
	static autoRefreshTime = 2000;
	static lastUpdate = null;
	static taskIdAttribute = "data-task-id"; //the attribute used to store task id in.

	static tasks;

	static ready()
	{
		Task.getLiveData();
		Task.autoRefresh();
	}

	//update page with tasks from database.
	//all data no tsaved will be cleared.
	static getLiveData(callback)
	{
		API.simple("todo", "task/get", "",
			function (result)
			{
				Task.by = result["by"];

				Task.tasks = {};
				for (let i in result["tasks"])
				{
					let task = result["tasks"][i];
					Task.addLocal(task, false);

					let taskUpdatedAt = new Date(task["updated_at"]);
					if (Task.lastUpdate == null || taskUpdatedAt > Task.lastUpdate)
					{
						Task.lastUpdate = taskUpdatedAt;
					}
				}

				List.rebuildArray();

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

	static addLocal(data, updateList = true)
	{
		Task.tasks[data.id] = data;

		if (updateList)
		{
			List.rebuildArray();
		}
	}

	static updateLocal(data, updateList = true)
	{
		let task = Task.tasks[data.id];
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

		Task.tasks[data.id] = task;

		//update list data
		if (updateList)
		{
			List.rebuildArray();
		}
	}

	static deleteTaskLocal(id, updateList = true)
	{
		delete Task.tasks[id];

		//update list data
		if (updateList)
		{
			List.rebuildArray();
		}
	}

	static autoRefresh()
	{
		setInterval(() =>
		{
			if (Task.checkingRefreshing)
			{
				return;
			}

			if ((Edit.modal.data('bs.modal') || {})._isShown)
			{
				return;
			}

			Task.checkingRefreshing = true;

			API.simple("todo", "last-updated", { ignoreBy: Task.by },
				function (result)
				{
					if (Task.lastUpdate != null && new Date(result["updated_at"]) > Task.lastUpdate)
					{
						Task.getLiveData(() =>
						{
							console.log("autoRefresh");
							Task.checkingRefreshing = false;
						});
					}
					else
					{
						Task.checkingRefreshing = false;
					}
				},
				function (result)
				{
					console.log(result);
					Task.checkingRefreshing = false;
				}
			);
		}, Task.autoRefreshTime);
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
	static completedTasksUl = ".completed-tasks ul";
	static notCompletedTasksUl = ".not-completed-tasks ul";

	static generate()
	{
		HTML.listsElement.html("");
		HTML.tasksElement.html("");
		HTML.listOptionsElement.html("");

		for (let i in List.lists)
		{
			let list = List.lists[i];

			//list option
			HTML.listOptionsElement.append(HTML.generateListEditOption(list));

			//list tab
			HTML.listsElement.append(HTML.generateListTab(list));

			//list content
			HTML.tasksElement.append(HTML.generateListContent(list));
		}

		//tasks
		let sortedTasks = Object.values(Task.tasks).sort(function (a, b)
		{
			//sort by priority 
			let priority = b.priority - a.priority;;
			if (priority != 0)
			{
				return priority;
			}

			//then by date
			if (a.date == null)
			{
				return 1;
			}
			if (b.date == null)
			{
				return -1;
			}
			a = a.date.split('/').reverse().join('');
			b = b.date.split('/').reverse().join('');
			return a > b ? 1 : a < b ? -1 : 0;
		});
		for (let i in sortedTasks)
		{
			let task = Task.tasks[sortedTasks[i].id];
			let ul;
			if (task.done)
			{
				ul = $(`#${List.getId(task.list)} ${HTML.completedTasksUl}`);
			}
			else
			{
				ul = $(`#${List.getId(task.list)} ${HTML.notCompletedTasksUl}`);
			}
			$(ul).append(HTML.generateTask(task));
		}

		HTML.setupSlidingTabs();
		HTML.setupShowCompleted();

		$("#loading").remove();
	}
	static generateListEditOption(list)
	{
		return `<a class="dropdown-item" href="#" onclick="Edit.setList('${list}')">${list}</a>`;
	}
	static generateListTab(list)
	{
		let active = List.isActive(list);
		let id = List.getId(list);
		return `
		<li class="nav-item" data-list-name="${list}">
			<span class="nav-link ${active ? 'active' : ''}" id="${id}-tab" data-toggle="tab" href="#${id}" role="tab" aria-controls="${id}" aria-selected="true">${list}</span>
		</li>
		`;
	}
	static generateListContent(list)
	{
		let active = List.isActive(list);
		let id = List.getId(list);
		return `
		<div id="${id}" class="tab-pane fade ${active ? 'show active' : ''}" role="tabpanel" aria-labelledby="${id}">
			<div class="not-completed-tasks"><ul class="list-group"></ul></div>	
			<button class="btn btn-outline-light show-completed-tasks-button" type="button" data-toggle="collapse" data-target="#show-completed-${id}" aria-expanded="false" aria-controls="show-completed-${id}">Completed Tasks</button>
			<div class="collapse completed-tasks" id="show-completed-${id}"><ul class="list-group"></ul></div>

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
		<li class="list-group-item" ${Task.taskIdAttribute}="${task["id"]}">
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

	static setupShowCompleted()
	{
		$('.completed-tasks').each(function ()
		{
			let cookieName = "todo_" + $(this).parent().attr("id") + "_show_completed";
			let show = getCookie(cookieName, 1);
			if (show == 1)
			{
				$(this).addClass('show');
				$(this).collapse('show');
			}

			$(this).on('hide.bs.collapse', function ()
			{
				setCookie(cookieName, 0, 99999);
			})
			$(this).on('show.bs.collapse', function ()
			{
				setCookie(cookieName, 1, 99999);
			})
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
		Edit.idElement.attr(Task.taskIdAttribute, id);
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
		let id = Edit.idElement.attr(Task.taskIdAttribute);

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
		button.on('click', function ()
		{
			//get task
			let id = $(this).closest(".list-group-item").attr(Task.taskIdAttribute);
			let task = Task.tasks[id];

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

		API.simple("todo", "task/update", data,
			function (result)
			{
				if (result["success"] == true)
				{
					Task.updateLocal(data);

					HTML.generate();
					Edit.hide();
					List.goTo(data.list);

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
			API.simple("todo", "task/delete", { id: id },
				function (result)
				{
					if (result["success"] == true)
					{
						Task.deleteTaskLocal(id);

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
		let id = checkbox.closest(".list-group-item").attr(Task.taskIdAttribute);
		let done = checkbox.prop('checked');

		let data = {
			id: id,
			done: done
		};

		API.simple("todo", "task/update", data,
			function (result)
			{
				if (result["success"] == true)
				{
					Task.updateLocal(data);
					HTML.generate();
					setTimeout(() =>
					{
					}, 700);
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

		Edit.show("create", "", "", List.active, "", false);
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

		API.simple("todo", "task/create", data,
			function (result)
			{
				if (result["success"] == true)
				{
					data.id = result["id"];
					Task.addLocal(data);

					HTML.generate();
					Edit.hide();
					List.goTo(data.list);

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

/**
 * 
 */
class List
{
	static modal = $('#edit-list-modal');
	static nameElement = $("#edit-list-name");
	static oldNameElement = $("#edit-list-old-name");
	static openSelector = "#lists .nav-item";
	static activeCookieName = "active-list";
	static updateButtonElement = $("#edit-list-update");
	static deleteButtonElement = $("#edit-list-delete");
	static deleteButtonConfirmAttribute = "data-delete-confirm";
	static deleteButtonConfirmText = "Confirm deletion";
	static deleteButtonNormalText = "Delete";

	static active = "";
	static lists;

	static ready()
	{
		List.modal.removeAttr("style");
		List.active = getCookie(List.activeCookieName);

		List.updateButtonElement.click(function ()
		{
			List.clickUpdate();
		});

		List.deleteButtonElement.click(function ()
		{
			List.clickDelete();
		});

		let obs = new MutationObserver(function (mutations, observer)
		{
			$.each(mutations, function (i, mutation)
			{
				let elements = $(mutation.addedNodes).find(List.openSelector).addBack(List.openSelector);
				elements.each(function ()
				{
					$(this).click(function ()
					{
						List.clickListTab($(this));
					});
				});
			});
		});
		obs.observe(HTML.listsElement[0], { childList: true });
	}

	static rebuildArray()
	{
		List.lists = [];
		for (let i in Task.tasks)
		{
			let task = Task.tasks[i];

			if (List.lists.indexOf(task["list"]) == -1)
			{
				List.lists.push(task["list"]);
			}
		}

		List.lists.sort(function (a, b)
		{
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
	}

	static updateLocal(oldList, newList)
	{
		for (let i in Task.tasks)
		{
			if (Task.tasks[i].list == oldList)
			{
				Task.tasks[i].list = newList;
			}
		}

		List.rebuildArray();
	}

	static removeLocal(list)
	{
		for (let i in Task.tasks)
		{
			if (Task.tasks[i].list == list)
			{
				delete Task.tasks[i];
			}
		}

		List.rebuildArray();
	}

	static isActive(list)
	{
		if (List.lists.length != 0)
		{
			if (List.active == "")
			{
				List.active = List.lists[0];
			}
			else if (List.lists.indexOf(List.active) == -1)
			{
				List.active = List.lists[0];
			}
		}
		return list == List.active;
	}

	static goTo(list)
	{
		$("#" + List.getId(list) + "-tab").click();
		setCookie(List.activeCookieName, list, 9999);
	}

	static getId(list)
	{
		return "list-" + list.toLowerCase().replace(/\s/g, "-");
	}

	static open(name)
	{
		List.nameElement.val(name);
		List.oldNameElement.val(name);
		List.modal.modal({ backdrop: 'static' })
	}

	static hide()
	{
		List.modal.modal('hide');
	}

	static clickListTab(button)
	{
		let selectedList = button.attr("data-list-name");
		setCookie(List.activeCookieName, selectedList, 9999);

		if (selectedList == List.active)
		{
			List.open(selectedList);
		}
		List.active = selectedList;
	}

	static clickUpdate()
	{
		let data = {
			new: List.nameElement.val(),
			old: List.oldNameElement.val()
		}
		API.simple("todo", "list/update", data,
			function (result)
			{
				if (result["success"] == true)
				{
					List.updateLocal(data.old, data.new);

					HTML.generate();
					List.hide();
					List.goTo(data.new);

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
		if (List.deleteButtonElement.attr(List.deleteButtonConfirmAttribute))
		{
			API.simple("todo", "list/delete", { name: List.active },
				function (result)
				{
					if (result["success"] == true)
					{
						List.removeLocal(List.active);
						HTML.generate();
						List.hide();

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
			List.deleteButtonElement.attr(List.deleteButtonConfirmAttribute, true);
			List.deleteButtonElement.html(List.deleteButtonConfirmText);
		}
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
function getCookie(cname, defaultValue = "")
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
	return defaultValue;
}

/*
//Add custom event listener
$(':root').on('mousedown touchstart ', '*', function ()
{
	let el = $(this);
	let events = $._data(this, 'events');
	if (events && events.clickHold)
	{
		el.data('clickHoldTimer',
			setTimeout(
				function ()
				{
					el.trigger('clickHold');
				},
				el.data('clickHoldTimeout')
			)
		);
	}
}).on('mouseup mouseleave mousemove touchend touchmove touchcancel', '*', function ()
{
	clearTimeout($(this).data('clickHoldTimer'));
});

//Attach it to the element

button.data('clickHoldTimeout', 200); //Time to hold
button.on('clickHold', function ()
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
*/