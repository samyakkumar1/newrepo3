$(function () {
    function init() {
        $('#html_editor').summernote({ 
            codemirror: {
                mode: 'text/html',
                htmlMode: true,
                lineNumbers: true,
            }, 
            tabSize: 2,
            dialogsInBody: false,
            dialogsFade: true,
            height: 300
        });
        $('#html_editor').summernote('code', '<h1>You can edit or create new email templates with the editor.</h1> Click on variables to see help on variables available for each template.');
        $(".chooseTemplateSection").hide();
        $("#htmlMode").hide();
        $("#text_editor").hide();
        var listObj = $(".templateList");
        $("#newTemplateBtn").change(function () {
            if ($("#newTemplateBtn").is(":checked")) {
                $(".newTemplateSection").show();
                $(".chooseTemplateSection").hide();
            } else {
                $(".chooseTemplateSection").show();
                $(".newTemplateSection").hide();
            }
        });
        $("#saveBtn").click(function (e) {
            e.preventDefault();
            var code = $('#html_editor').summernote('code');
            var text = $('#text_editor').val();
            var url;
            var name;
            var isNew = $("#newTemplateBtn").is(":checked");
            if (isNew){
                url = "addTemplate";
                name = $("#newTemplateName").val(); 
            } else {
                url = "updateTemplate";
                name = $(".templateList").val();
            }
            doPost(url, {
                text: text,
                code: code,
                name: name
            }, function(resp){
                if (resp.status == 200){
                    showToast("Template Successfully saved.");
                    if (isNew){
                        listObj.append("<option>" + name + "</option>");
                    }
                } else { 
                    console.log(resp);
                    showToast("Error: " + resp.msg);
                }
            }, function (err){
                console.log(err);
                showToast("Communication Error!");
            });
        });
        $("#textMode").click(function (e) {
            e.preventDefault();
            $("#text_editor").show();
            $("#htmlMode").show();
            $(".note-editor").hide();
            $("#html_editor").hide();
            $("#textMode").hide();
        });
        $("#htmlMode").click(function (e) {
            e.preventDefault();
            $("#text_editor").hide();
            $("#htmlMode").hide();
            $(".note-editor").show();
            $("#textMode").show();
        });

        listObj.change(function () {
            $("#selectOption").remove();
            $('#html_editor').summernote('code', '');
            $("text_editor").val("");
            doGet("/getTemplate", {name: listObj.val()}, function (resp) {
                if (resp.status == 200) {
                    if (resp.text_err) {
                        console.log(resp.text_err);
                        showToast("Error: " + resp.text_err);
                    } else {
                        $("#text_editor").val(resp.text);
                    }
                    if (resp.html_err) {
                        console.log(resp.html_err);
                        showToast("Error: " + resp.html_err);
                    } else {
                        $('#html_editor').summernote("code", resp.html);
                    }
                } else {
                    console.log(resp);
                    showToast("Error: " + resp.msg);
                }
            }, function (err) {
                console.log(err);
                showToast("Communication error!")
            });
        });
        doGet("/getTemplatesList", {}, function (resp) {
            if (resp.status == 200) {
                listObj.append("<option id='selectOption'>Select a file</option>");
                for (var i = 0; i < resp.files.length; i++) {
                    listObj.append("<option>" + resp.files[i] + "</option>");
                }
            } else {
                console.log(resp);
                showToast("Error: " + resp.msg);
            }
        }, function (err) {
            console.log(err);
            showToast("Communication error!")
        });
    }

    init();
});
