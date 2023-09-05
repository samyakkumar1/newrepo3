
var consts = {
    SESSION_STORE_NAME: "user"
};

function getSalt(email, successCallback, errCallBack){
    doPost("/getSalt", {email: email}, function (resp) {
        if (resp.status != 200) {
            console.log(resp);
            errCallBack("Invalid username or password. Please try again.");
        }
        else {
            successCallback(resp.salt);
        }
    }, function (err) {
        errCallBack("Server Error: " + err.error);
    });
}

function signup(data, success_callback, failure_callback, directRegistration) {
    if (success_callback == undefined) {
        success_callback = function (resp) {
            alert("Please check your email and click on the link to verify your email")
            if (window.location.pathname.indexOf("checkout") >= 0 || window.location.pathname.indexOf("shop") >= 0){
                window.location.reload();
            } else {
                window.location = "/";
            }
            
        };
    }
    if (failure_callback == undefined) {
        failure_callback = function (err) {
            alert(err);
        }
    }
    data.salt = getNewRandomNumber(1000, 9999);
    data.md5_password = MD5(data.salt + ":" + data.password);
    data.directRegistration = directRegistration;
    delete data.password;
    addWaitingOverlay();
    $("#signup_loader").css('display','inline-block');
    doPost("/addUser", data, function (resp) {
        removeWaitingOverlay();
        $("#signup_loader").css('display','none');
        if (resp.status == 200) {
            success_callback(resp);
        } else {
            failure_callback(resp.msg);
        }
    }, function (err) {
        removeWaitingOverlay();
        $("#signup_loader").css('display','none');
        console.log(err);
        failure_callback((typeof err == "string" ? err : "Server Error."))
    });
}

function signin(email, password, successCallBack, errCallBack) {
    console.log("Im hit!")
    var saveLocalItemsToServer = function (successCallback){
        var logos = retrieveJson("logos");
        var cards = retrieveJson("cards");
        var cart  = retrieveJson("carts");
        var addedLogosIds = {};
        var addedCardIds = {};
        var successfulIdx = [];
        if (logos != null) {
            logos.forEach(function (val, idx) {
                addWaitingOverlay();
                var obj = retrieveJson(val);
               
                var resp = doSyncRequest("/addUserLogo", obj, "POST");
                removeWaitingOverlay();
                if (resp.status != 200) {
                    showToast(resp.msg);
                } else {
                    deleteJson(val);
                    addedLogosIds[logos[idx].split("_")[1]] = resp.insertId;
                    successfulIdx.push(idx);
                    $.event.trigger({
                        type:    "logoSavedFromLogin",
                        localId: val.substr(5),
                        id: resp.insertId,
                        time: new Date()
                    });
                }
            });
            successfulIdx.forEach(function (val, idx) {
                logos.splice(val, 1);
            });
        }
        if (cards != null) {
            cards.forEach(function (val, idx) {
                addWaitingOverlay();
                var obj = retrieveJson(val);
                var resp = doSyncRequest("/addUserCard", obj, "POST");
                removeWaitingOverlay();
                if (resp.status != 200) {
                    showToast(resp.msg);
                } else {
                    deleteJson(val);
                    addedCardIds[cards[idx].split("_")[1]] = resp.insertId;
                    successfulIdx.push(idx);
                    $.event.trigger({
                        type:    "cardSavedFromLogin",
                        localId: val.substr(5),
                        id: resp.insertId,
                        time: new Date()
                    });
                }
            });
            successfulIdx.forEach(function (val, idx) {
                cards.splice(val, 1);
            });
        }
        if (cart != null) {
            cart.forEach(function (val, idx) {
                addWaitingOverlay();
                var item = retrieveJson(val);
                if (item.itemType == "LOGO") {
                    item.item_id = addedLogosIds[item.item_id];
                } else {
                    item.item_id = addedCardIds[item.item_id];
                }
                var resp = doSyncRequest("/addItemToCurrentShoppingCart", item, "POST");
                removeWaitingOverlay();
                if (resp.status != 200) {
                    showToast(resp.msg);
                } else {
                    deleteJson(val);
                    successfulIdx.push(idx);
                }
            });
            successfulIdx.forEach(function (val, idx) {
                cart.splice(val, 1);
            });
        }
        storeJson("logos", logos);
        storeJson("cards", cards);
        storeJson("carts", cart);
      
        successCallback();
    };
   console.log("in function")
    var user = {
        emailid: email,
        password: password
    };
    if (successCallBack == undefined){
        successCallBack = function(){
            console.log("setSuccess");
            //alert("You have successfully logged in.");
        }
    }
    if (errCallBack == undefined){
        errCallBack = function(err){
            console.log("setError");
            alert(err);
        }
    }
    getSalt(user.emailid, function (salt){
        
        user.md5_secret = MD5(salt + ":" + user.password);
        delete user.password;
        doPost("/login", user, function (resp) {
            if (resp.status == 401) {
                errCallBack("Invalid username or password. Please try again.");
            }
            else if (resp.status == 200) {
                setUser(resp.user);
                saveLocalItemsToServer(function (){
                    successCallBack();
                });
            }
            else {
                console.log(resp);
                errCallBack("Server Error: " + resp.status + "(" + (typeof resp.msg == "string"? resp.msg : "Unknown") + "). Please try again.");
            }
        }, function (err) {
            console.log(err);
            errCallBack("Server Error: " + err.error);
        });
    }, function (err) {
        errCallBack(typeof err == "string" ? err : "Server Error: " + err.error);
    });
}

function signout(callback, silent) {
    var _signoutFn = function () {
        addWaitingOverlay();
        var fn = function () {
            removeWaitingOverlay();
            $.removeCookie(consts.SESSION_STORE_NAME, { path: '/' });
            $.removeCookie("loginInfo", { path: '/' });
            $.removeCookie("somekey", { path: '/' });
            callback ? callback : $.noop();
            if (!silent) {
                showToast("Successfully Signed out.", "success");
            }
            $(".saved-items").show();
            $("#headerAccount").show();
            $("#headerRegister").show();
            $("#headerAccountLogout").hide();
            $("#myProducts").hide();
            $(".drop-login-mobile").show();
            $(".signout-mobile").hide();
            $(".drop-login-mobile").removeClass('login-hide');
            $(".signout-mobile").removeClass('login-show');
            $(".my-designs").hide();
            updateCartCount(false);
            if (window.location.pathname.indexOf("my-designs") >= 0){
                window.location = "/";
            }
            else{
                window.location.reload();
            }
        };
        doPost("/logout", {}, function (resp) {
            if (resp.status != 200) {
                $(".my-designs").hide();
            }
            fn();
        }, function (err) {
            console.log(err);
            fn();
        });
    };
    if (silent){
        _signoutFn();
    } else {
        if (isProtectedPage()) {
            bootbox.confirm("Your changes <b>will not be saved</b> to server after sign out!<br/><b>Proceed with sign-out?</b>", function (result) {
                if (result) {
                    _signoutFn();
                }
            });
        } else {
            _signoutFn();
        }
    }
}

function isLoggedIn(fromServer) {
    
    var session = $.cookie(consts.SESSION_STORE_NAME) == undefined ? undefined : JSON.parse($.cookie(consts.SESSION_STORE_NAME));
    if (fromServer != undefined && fromServer == true){
        var isLoggedIn = doSyncRequest("/isLoggedIn", {}, "POST");
        if (isLoggedIn.error) {
            console.log("Can't check for login: ", isLoggedIn);
            return false;
        } else if (isLoggedIn.status == true){
            if (session == undefined && isLoggedIn.user){
                setUser(isLoggedIn.user);
            }
            return true;
        } else {
            return false;
        }
    } else {
        return session != undefined;
    }
}

function getUser() {
    var cookie = $.cookie(consts.SESSION_STORE_NAME);
    if (cookie == undefined) {
        return undefined;
    }
    else {
        return JSON.parse(cookie);
    }
}

function setUser(user) {
    $.cookie(consts.SESSION_STORE_NAME, JSON.stringify(user), {expires: 7, path: "/"});
}

function isProtectedPage (){
    return window.location.pathname.indexOf("logo-design-online") >= 0 || window.location.pathname.indexOf("design-business-card-online") >= 0;
}

function changeUserType(userid){
    doPost("/changeUserType", {userid:userid}, function (resp) {
    })
}