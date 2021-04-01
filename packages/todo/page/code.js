var lists = new Array();
lists["list1"] = new Array("hej", "med", "dig");
lists["list2"] = new Array("hej", "med", "dig");
lists["list3"] = new Array("hej", "med", "dig");
lists["list4"] = new Array("hej", "med", "dig");

let tabs = $("#lists");
let tasks = $("#tasks");
for (let list in lists)
{
	let active = list == "list1";
	let id = list;

	let tabHtml = `
	<li class="nav-item" role="presentation">
		<span class="nav-link ${active ? 'active' : ''}" id="${id}-tab" data-toggle="tab" href="#${id}" role="tab" aria-controls="${id}" aria-selected="true">${list}</span>
	</li>
	`;
	$(tabs).append(tabHtml);

	let tasksHtml = `
	<div id="${id}" class="tab-pane fade ${active ? 'show active' : ''}" role="tabpanel" aria-labelledby="${id}">
		<ul class="list-group">
		</ul>
	</div>
	`;
	$(tasks).append(tasksHtml);

	let tableBody = $(`#${id} ul`);
	for (let index in lists[list])
	{
		let item = lists[list][index];
		let itemId = item;
		let itemHtml = `
		<li class="list-group-item">
			<div class="container">
				<div class="row">
					<div class="col">
						<div class="d-flex align-items-center">
							<i class="fas fa-grip-vertical"></i>
						</div>
					</div>
					<div class="col">
						<div class="d-flex align-items-center">
							<label class="checkbox path">
								<input type="checkbox">
								<svg viewBox="0 0 21 21">
									<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
								</svg>
							</label>
						</div>
					</div>
					<div class="col">
						<div class="task-name d-flex align-items-center">${item}</div>
					</div>
					<div class="task-star"><i class="far fa-star"></i></div>
					<span class="task-time">01/01/0101</span>
				</div>
			</div>
		</li>
		`;
		$(tableBody).append(itemHtml);
	}
}