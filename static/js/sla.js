$('document').ready(function() {
  var content = $('#message_code').text();
  $('#message_content').html(content);
});

$('#search').on('click',function() {
  var weekno = $('#weekno').val();
  var indexes = {'SLA(FE-Responded)':1,'SLA(FE-Suport_SLG)':2,'SLA(FE_TI)':3};
  var sla_selected = $('#select_SLA').find('option:selected').text();
  if(weekno=="") {
    alert("Please enter week number");
    return;
  }
  else {
    $.ajax({
      url:'/sla',
      type:'GET',
      data:{'weekno':weekno,'sla_selected':sla_selected},
      success:function(response) {
        $('body').html(response);
        $('#weekno').val(weekno);
        $('#select_SLA').selectedIndex = indexes[sla_selected];
      },
      error:function(error) {
        $('#message_content').html('<h3>Error reading Week-'+weekno+'</h3>');
      }
    });
  }
});

$('#select_SLA').on('change',function() {
  var weekno = $('#weekno').val();
  var indexes = {'SLA(FE-Responded)':1,'SLA(FE-Suport_SLG)':2,'SLA(FE_TI)':3};
  var sla_selected = $(this).find('option:selected').text();
  $.ajax({
    url:'/sla',
    type:'GET',
    data:{'sla_selected':sla_selected,'weekno':weekno},
    success:function(response) {
      $('body').html(response);
      $('#weekno').val(weekno);
      $('#select_SLA').selectedIndex = indexes[sla_selected];
    },
    error:function(error) {
      $('#message_content').html('<h3>Error reading Week-'+weekno+'</h3>');
    }
  });
});
