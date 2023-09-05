$(function(){

  function init () {
  $(".nxt-btn").click(function(){
    //alert('import check');
    var payload = {}
    var attributes_dict = {}
    payload.industry = $('#industry').val();
    payload.description = $('#venturedesc').val();
    attributes_dict.luxury = $('#lacomp').val();
    attributes_dict.masculine = $('#mfcomp').val();
    attributes_dict.modern = $('#vmcomp').val();
    payload.AV_dict = attributes_dict;

    color_select(payload);   
});
}

function color_select(payload){
  $.ajax({
    type: 'POST',
    data: JSON.stringify(payload),
        contentType: 'application/json',
                url: '/colorSelectCall',						
                success: function(data) {
                    alert(data);
                    console.log('success');
                },
            });
}

  init();

});