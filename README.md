# droplist
a drop and sorted list 

It can be used like this
    
    <div id="droplistTest"> </div>
    
    // there must have a parent and term_id in data, 
    var data = [ { term_id: 2 ,term_name: "c2" ,parent: 0}, 
					 { term_id: 6 ,term_name: "c6" ,parent: 2},
					 { term_id: 5 ,term_name: "c5" ,parent: 2},
					 { term_id: 8 ,term_name: "c8" ,parent: 5},
					 { term_id: 1 ,term_name: "c1" ,parent: 0},
					 { term_id: 4 ,term_name: "c4" ,parent: 1},
					 { term_id: 7 ,term_name: "c7" ,parent: 4},
					 { term_id: 3 ,term_name: "c3" ,parent: 1} ];
		
    var droptest = $('#droplistTest').dropList({
		    data : data ,
		    // itemFactor for generate the dom that warp your data
			  itemFactory : function(item){
				   return '<div class="drop-handle">'+item.term_name+'</div>'
			 }
		});
		
After it initialized ,the dom look like below:
    
    <ul class="drop drop-list drop-list-normal">
      <li class="list-depth-1" data-depth="1" data-term-id="1">
        <div class="drop-handle">c1</div>
      </li>
      <li class="list-depth-2" data-depth="2" data-term-id="3">
        <div class="drop-handle">c3</div>
      </li>
      <li class="list-depth-2" data-depth="2" data-term-id="4">
        <div class="drop-handle">c4</div>
      </li>
      <li class="list-depth-3" data-depth="3" data-term-id="7">
        <div class="drop-handle">c7</div>
      </li>
      <li class="list-depth-1" data-depth="1" data-term-id="2">
        <div class="drop-handle">c2</div>
      </li>
      <li class="list-depth-2" data-depth="2" data-term-id="5">
        <div class="drop-handle">c5</div>
      </li>
      <li class="list-depth-3" data-depth="3" data-term-id="8">
        <div class="drop-handle">c8</div>
      </li>
      <li class="list-depth-2" data-depth="2" data-term-id="6">
        <div class="drop-handle">c6</div>
      </li>
    </ul>

you can run droptest.plugin.serlalize() to get the data out, 
and it is format is as same as the data shown above,only change its parent

##so basically all you need to care about is how to handle your data ,pretty easy huh.
