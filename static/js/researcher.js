$('#search').on('click',function() {
  var from = document.getElementById('from').value;
  var to = document.getElementById('to').value;
  if(!Date.parse(from) || !Date.parse(to))
  {
    alert("Please enter Date range");
    return false;
  }
  else {
    document.getElementById('loader').style.display = "block";
    $.ajax({
      url:'researcher_count',
      type:'GET',
      data:{'from':from,'to':to},
      success:function(response) {
        $('body').html(response);
        $('#from').val(from);
        $('#to').val(to);
        document.getElementById('loader').style.display = "none";
      },
      error:function(error) {
        document.getElementById('loader').style.display = "none";
        alert("Something went wrong");
      }
    });
  }
});

$('#index_selection').change(function() {
  document.getElementById('loader').style.display = "block";
  var filter_list = {'Day':1,'Week':2,'Month':3};
  var filter = $(this).find('option:selected').text();
  if(filter=='Select Type') {
    document.getElementById('loader').style.display = "none";
    return;
  }
  else {
    var from = document.getElementById('from').value;
    var to = document.getElementById('to').value;
    if(!Date.parse(from) || !Date.parse(to) ) {
      $.ajax({
        url:'researcher_count',
        type:'GET',
        data:{'filter':filter},
        success:function(response) {
          $('body').html(response);
          $(this).selectedIndex = filter_list[filter];
          document.getElementById('loader').style.display = "none";
        },
        error:function(error) {
          document.getElementById('loader').style.display = "none";
          alert("Something went wrong");
        }
      });
    }
    else {
      $.ajax({
        url:'researcher_count',
        type:'GET',
        data:{'filter':filter,
              'from':from,
              'to':to},
        success:function(response) {
          $('body').html(response);
          $('#from').val(from);
          $('#to').val(to);
          $(this).selectedIndex = filter_list[filter];
          document.getElementById('loader').style.display = "none";
        },
        error:function(error) {
          document.getElementById('loader').style.display = "none";
          alert("Something went wrong");
        }
      });
    }
  }
});

$('#exportData').unbind().click(function() {
var html = document.querySelector("table").outerHTML;
export_table_to_csv(html, "researcher_count.csv");
});
