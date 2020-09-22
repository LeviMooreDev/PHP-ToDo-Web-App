function messageSuccess(text) {
    Swal.fire({
        position: 'top',
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 3000,
        toast: true
    });
}
function messageError(text) {
    Swal.fire({
        position: 'top',
        icon: 'error',
        title: text,
        showConfirmButton: false,
        timer: 5000,
        toast: true
    });
}

function messageOK(title, text) {
    Swal.fire({
        icon: '',
        title: title,
        text: text
    });
}

function messageYesNo(text, yes, no) {
    Swal.fire({
        title: text,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.value) {
            if (yes) {
                yes();
            }
        } else {
            if (no) {
                no();
            }
        }
    });
}
function messageWorking(work) {
    Swal.fire({
        title: 'Working',
        timerProgressBar: true,
        onBeforeOpen: () => {
            Swal.showLoading()
            work();
        }
    });
}