/**
 * Created by Designerbe on 10-12-2020.
 */
$(function (){

    function init () {
        if (!isLoggedIn()) {
            window.location = "/?redir=editProfile";
        } else {
            addWaitingOverlay();
            $("#editProfileForm").validate();
            $("#changePassword").click(function (e) {
                e.preventDefault();
                $("#changePwdDiv").toggle("fast");
            });
            $("#saveProfile").click(function (e) {
                e.preventDefault();
                if ($('#editProfileForm').valid()) {
                    saveUserInfo();
                } else {
                    bootbox.alert("Please fill the required fields correctly.");
                }
            });
            fillAllFields();
            removeWaitingOverlay();
        }
    }

    function fillAllFields(){
        $("#emailId").val(getUser().email);
        $("#phone_num").val(getUser().phone_num);
        $("#first_name").val(getUser().first_name);
        $("#last_name").val(getUser().last_name);
        $("#address1").val(getUser().address == null ? "" : getUser().address.split("\n")[0]);
        $("#address2").val(getUser().address == null ? "" : getUser().address.split("\n")[1]);
        $("#city").val(getUser().city);
        $("#state").val(getUser().state);
        $("#postal_code").val(getUser().postal_code);
        $("#country").val(getUser().country);
    }

    function saveUserInfo (){
        var data = {
            emailId: $("#emailId").val(),
            phone_num: $("#phone_num").val(),
            first_name: $("#first_name").val(),
            last_name: $("#last_name").val(),
            address: $("#address1").val() + "\n" +  $("#address2").val(),
            country: $("#country").val(),
            city: $("#city").val(),
            state: $("#state").val(),
            postal_code: $("#postal_code").val(),
            current_password: $("#current_password").val(),
            usertype:user.usertype
        };
        getSalt(data.emailId, function (salt){
            data.old_md5_password = MD5(salt + ":" + data.current_password);
            delete data.current_password;
            doPost("/updateUser", data, function (resp) {
                if (resp.status == 200) {
                    setUser(resp.user);
                    bootbox.alert("Profile successfully updated.");
                    window.location = "/";
                } else {
                    console.log(resp);
                    bootbox.alert("Password entered is invalid.");
                }
            }, function (err) {
                console.log(err);
                bootbox.alert(typeof err == "string" ? err : "Server Error: " + err.error);
            });

        }, function (err){
            console.log(err);
            bootbox.alert(typeof err == "string" ? err : "Server Error: " + err.error);
        });
    }

    init();
});

