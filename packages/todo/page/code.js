let testData = [
	"list1",
	"list2",
	"list3",
	"list4"
];

let tabs = $("#tabs");
let tasks = $("#tasks");
testData.forEach(element => {
	let tabHtml = `
	<li class="nav-item" role="presentation">
		<a class="nav-link ${element == 'list1' ? 'active' : ''}" id="${element}-tab" data-toggle="tab" href="#${element}" role="tab" aria-controls="${element}" aria-selected="true">${element}</a>
	</li>
	`;
	$(tabs).append(tabHtml);
	
	let tasksHtml = `
	<div id="${element}" class="tab-pane fade ${element == 'list1' ? 'show active' : ''}" role="tabpanel" aria-labelledby="${element}">${element}</div>
	`;
	$(tasks).append(tasksHtml);
});