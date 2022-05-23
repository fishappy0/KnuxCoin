function goBack() {
    window.history.back();
}
$(document).ready(function () {
    //active account
    $('.btn-approve').click(e => {
        const btn = e.target
        const userid = btn.dataset.id
        console.log(userid)
        $('#approved').attr('data-id', userid)
        $('#approve-confirm').modal('show')
    })

    $('#approve-confirm').click(e => {
        $('#approve-confirm').modal('hide')
        const btn = e.target
        const userid = btn.dataset.id
        console.log(userid)
        $.ajax({
            url: '/admin/approve',
            method: 'post',
            data: { userid: userid },
            success: function (data) {
                alert('Account is Actived')
                window.location.reload()
            },
        })
    })

    //disable account
    $('.btn-disable').click(e => {
        const btn = e.target
        const userid = btn.dataset.id
        console.log(userid)
        $('#disabled').attr('data-id', userid)
        $('#disable-confirm').modal('show')
    })

    $('#disable-confirm').click(e => {
        $('#disable-confirm').modal('hide')
        const btn = e.target
        const userid = btn.dataset.id
        console.log(userid)
        $.ajax({
            url: '/admin/disable',
            method: 'post',
            data: { userid: userid },
            success: function (data) {
                alert('Account is Disabled')
                window.location.reload()
            },
        })
    })

    //send request to account
    $('.btn-send').click(e => {
        const btn = e.target
        const userid = btn.dataset.id
        console.log(userid)
        $('#sent').attr('data-id', userid)
        $('#send-confirm').modal('show')
    })

    $('#send-confirm').click(e => {
        $('#send-confirm').modal('hide')
        const btn = e.target
        const userid = btn.dataset.id
        console.log(userid)
        $.ajax({
            url: '/admin/request',
            method: 'post',
            data: { userid: userid },
            success: function (data) {
                alert('Account required additional information')
                window.location.reload()
            },
        })
    })

    //unlock account
    $('.btn-unlock').click(e => {
        const btn = e.target
        const userid = btn.dataset.id
        const userName = btn.dataset.name
        const lockedDate = btn.dataset.lock

        console.log(userid)
        console.log(userName)
        console.log(lockedDate)

        $('#account').html(userName)

        $('#unlocked').attr('data-id', userid)
        $('#unlocked').attr('data-lock', lockedDate)

        $('#unlock-confirm').modal('show')
    })

    $('#unlock-confirm').click(e => {
        $('#unlock-confirm').modal('hide')
        const btn = e.target
        const userid = btn.dataset.id
        const lockedDate = btn.dataset.lock

        console.log(lockedDate)
        console.log(userid)
        $.ajax({
            url: '/admin/unlock',
            method: 'post',
            data: { userid: userid, lockedDate: lockedDate },
            success: function (data) {
                alert('Account is Unlocked')
                window.location.reload()
            },
        })
    })

    //accept transaction
    $('.btn-accept').click(e => {
        const btn = e.target
        const transid = btn.dataset.id
        console.log(transid)
        $('#accepted').attr('data-id', transid)
        $('#accept-confirm').modal('show')
    })

    $('#accept-confirm').click(e => {
        $('#accept-confirm').modal('hide')
        const btn = e.target
        const transid = btn.dataset.id
        console.log(transid)
        $.ajax({
            url: '/admin/accept',
            method: 'post',
            data: { transid: transid },
            success: function (data) {
                alert('Transaction is Accepted')
                window.location.reload()
            },
        })
    })

    //decline transaction
    $('.btn-decline').click(e => {
        const btn = e.target
        const transid = btn.dataset.id
        console.log(transid)
        $('#declined').attr('data-id', transid)
        $('#decline-confirm').modal('show')
    })

    $('#decline-confirm').click(e => {
        $('#decline-confirm').modal('hide')
        const btn = e.target
        const transid = btn.dataset.id
        console.log(transid)
        $.ajax({
            url: '/admin/decline',
            method: 'post',
            data: { transid: transid },
            success: function (data) {
                alert('Transaction is Declined')
                window.location.reload()
            },
        })
    })
});
