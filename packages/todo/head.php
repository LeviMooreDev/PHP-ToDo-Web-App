<meta charset="utf-8">
<meta content="initial-scale=1, shrink-to-fit=no, width=device-width" name="viewport">
<title><?=Info::Name?></title>
<?php Material::AddCSS(); ?>
<?php AaronCheckbox::AddCSS(); ?>
<style>
	/* Material theme override  */
	body{
		background-color: var(--blue-grey);
	}
	.nav-tabs .nav-link.active {
		color: var(--secondary);
	}
	.list-group-item {
		background-color: var(--blue-grey);
		color: var(--light);
	}
	.nav-tabs .nav-link{
		color: var(--dark);
		opacity: 1;
	}
	.nav-tabs .nav-link.active {
		color: var(--blue);
	}
	.nav-tabs .nav-link::before {
		background-color: var(--blue);
	}
	.nav-tabs-material .nav-tabs-indicator {
		background-color: var(--blue);
	}
	.nav-tabs {
		background-color: var(--light);
		color: var(--dark);
	}
	.list-group-item {
		background-color: var(--light);
		color: var(--dark);
	}
	.modal-footer .btn-primary, .modal-footer .btn-primary:active, .modal-footer .btn-primary:focus, .modal-footer .btn-primary:hover {
		color: var(--blue);
	}
	.btn-primary {
		background-color: var(--blue);
		color: white;
	}
	.btn-primary.active, .btn-primary:active {
		background-color: var(--blue);
	}
	.form-control:focus, .custom-select:focus, .form-control-file:focus {
		border-color: var(--blue);
		box-shadow: inset 0 -2px 0 -1px var(--blue);
	}
	.close {
		color: var(--danger);
		font-size: 2rem;
	}
</style>