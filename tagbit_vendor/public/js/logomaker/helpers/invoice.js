$(function () {

    loadList(undefined, 10);

    $("#showAllRecords").click(function () {
        loadList(undefined, undefined, function () {
            $("#showAllRecords").hide();
        });
    });

    $("#email").keypress(function (ev) {
        if (ev.charCode == 13) {
            loadList(this.value, undefined, function () {
                $("#showAllRecords").show();
            });
        }
    });

    function loadList(email, limit, callback) {
        var tbl = $("#invoiceTable");
        tbl.children().remove();
        addWaitingOverlay();
        doPost("/listCarts", {email: email, limit: limit}, function (resp) {
            removeWaitingOverlay();
            if (resp.status == 200) {
                for (var i = 0; i < resp.carts.length; i++) {
                    var row = "<tr>" +
                            "<td>" + moment(resp.carts[i].date_purchased).format("DD-MMM-YYYY hh:mm A") + "</td>" +
                            "<td>" + resp.carts[i].email + "</td>" +
                            "<td>" + resp.carts[i].shipping_address.replace(/\n/g, "<br/>") + "</td>" +
                            "<td id='shippingItems" + resp.carts[i].id + "'>" + getSummery(resp.carts[i]) + "</td>" +
                            "<td>" + resp.carts[i].currency + " " + resp.carts[i].price + "<br/> via <br/>" + resp.carts[i].payement_type + "</td>" +
                            "<td><button class='btn btn-xs btn-default send-invoice-btn' data-item-ids='" + resp.carts[i].purchaseItemIds + "'>Send Invoice</button></td>" +
                            "</tr>";
                    tbl.append(row);
                }
                $(".send-invoice-btn").click(function (e) {
                    updateShipping("", "", "", "", undefined, function (err) {
                        if (err) {
                            console.error(err);
                            showToast(err);
                        } else {
                            showToast("Successfully Sent Invoice.", "success");
                        }
                    }, $(this).attr("data-item-ids").split(","));
                    e.stopPropagation();
                }); 
            } else if (resp.status == 201) {
                showToast("No items found with this email: " + email);
            } else {
                console.log(resp);
                showToast("Error in retrieving details");
            }
            callback ? callback() : $.noop();
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
        });
    }

    function getSummery(resp) {
        var splitted = resp.purchaseTypes.split(",");
        var logos = 0, cards = 0;
        for (var i = 0; i < splitted.length; i++) {
            if (splitted[i] == "BC") {
                cards++;
            } else {
                logos++;
            }
        }
        return [(logos ? logos + " Logo(s)" : ""), (cards ? cards + " Card(s)" : "")].join(" ")
    }
});