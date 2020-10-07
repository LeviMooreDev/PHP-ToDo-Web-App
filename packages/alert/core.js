class Alert
{
    static success(text)
    {
        Swal.fire(
        {
            position: 'top',
            icon: 'success',
            title: text,
            showConfirmButton: false,
            timer: 3000,
            toast: true
        });
    }

    static error(text)
    {
        Swal.fire(
        {
            position: 'top',
            icon: 'error',
            title: text,
            showConfirmButton: false,
            timer: 5000,
            toast: true
        });
    }

    static ok(title, text)
    {
        Swal.fire(
        {
            icon: '',
            title: title,
            text: text
        });
    }

    static yesNo(text, yes, no)
    {
        Swal.fire(
        {
            title: text,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) =>
        {
            if (result.value)
            {
                if (yes)
                {
                    yes();
                }
            }
            else
            {
                if (no)
                {
                    no();
                }
            }
        });
    }
    static working(work)
    {
        Swal.fire(
        {
            title: 'Working',
            timerProgressBar: true,
            onBeforeOpen: () =>
            {
                Swal.showLoading()
                work();
            }
        });
    }
    static workingSmall()
    {
        Swal.fire(
        {
            position: 'top',
            title: 'Working',
            timerProgressBar: true,
            toast: true,
            onBeforeOpen: () =>
            {
                Swal.showLoading()
            }
        });
    }
    static workingDone()
    {
        Swal.close();
    }
}