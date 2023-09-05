$(function () {
    $(".newLetterGoBtn").click(function (e) {
        if (validateEmail ($("#newsletterEmail").val())) {
            doPost("/addNewsLetterEmail", {email: $("#newsletterEmail").val()}, function (resp) {
                if (resp.status == 200) {
                    alert("Thank you for subscribing to our newsletter.");
                    $("#newsletterEmail").val("");
                } else {
                    alert("Error: " + resp.msg);
                }
            }, function (err) {
                alert("Error adding newsletter email.");
            });
        } else {
                alert("Invalid email.");
        }
    });
});
(function () {
    $('.logomaker-menu').hide();
    $(".various").fancybox({
        maxWidth: 800,
        maxHeight: 600,
        fitToView: false,
        width: '70%',
        height: '70%',
        autoSize: false,
        closeClick: false,
        openEffect: 'none',
        closeEffect: 'none'
    });
})();