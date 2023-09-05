

function showLogin(id, onsuccess){
    var isLoggedIn = doSyncRequest("/isLoggedIn", {}, "POST");
    if (isLoggedIn.status == true){
        setUser(isLoggedIn.user);
        onsuccess();
        return undefined;
    } else if (isLoggedIn.error) {
        console.log(error);
        bootbox.alert("Error: " + isLoggedIn.error);
    } else {
        var div = $("<div/>").css({
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'background-color': 'rgba(0,0,0,0.6)',
            'height': "100%",
            'width': "100%"
        }).appendTo($(id).css("position", "relative"));
        var template = $("#loginModal").text();
        var html = Mustache.render(template, {});
        div.append(html);
        div.find(".loginCancelBtn").click(function (e) {
            e.preventDefault();
            div.remove();
        });
        div.find(".loginBtn").click(function (e) {
            e.preventDefault();
            signin($("#usernameInPopup").val(), $("#passwordInPopup").val(), function (resp) {
                div.remove();
                showLogoutOptions();
                if (onsuccess != undefined) {
                    onsuccess();
                }
            }, function (err) {
                console.log(err);
                bootbox.alert(typeof err == "string" ? err : "Server Error: " + err.error);
            });
        });
        div.find(".createAccountBtn").click(function (e) {
            e.preventDefault();
            div.remove();
            bootbox.alert("Please check your email to verify the account and login after verification to download/purchase.");
        });
        return div;
    }
}

function downloadImage(imageURL) {
    window.open(imageURL);
}

function showPayment(id, onsuccess){
    var div = $("<div/>").css({
        'position':'absolute',
        'top':'0',
        'left':'0',
        'background-color':'rgba(0,0,0,0.6)',
        'height':"100%",
        'width':"100%"
    }).appendTo($(id).css("position", "relative"));
    var template = $("#paymentOptionsModel").text();
    var html = Mustache.render(template, {});
    div.append(html);
    div.find(".paymentCancelBtn").click(function (e){
        e.preventDefault();
        div.remove();
    });
    div.find(".proceedToPayment").click(function (e){
        e.preventDefault();
        div.remove();
        if (onsuccess != undefined){
            onsuccess();
        }
    });
    return div;
}

function getBaseURL() {
    var url = location.href;  // entire url including querystring - also: window.location.href;
    var baseURL = url.substring(0, url.indexOf('/', 14));
    if (baseURL.indexOf('http://localhost') != -1) {
        // Base Url for localhost
        var url = location.href;  // window.location.href;
        var pathname = location.pathname;  // window.location.pathname;
        var index1 = url.indexOf(pathname);
        var index2 = url.indexOf("/", index1 + 1);
        var baseLocalUrl = url.substr(0, index2);

        return baseLocalUrl + "/";
    }
    else {
        // Root Url for domain name
        return baseURL + "/";
    }
}

function editLogo(logoId) {
    window.location = "/logodesigner?id="+logoId;
}

function buyLogo(logoId){
    addLogoToShoppingCart(logoId, function (){
        bootbox.alert("Logo added to shopping cart.");
    })
}