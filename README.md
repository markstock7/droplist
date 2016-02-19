# droplist
拖放式排序目录
![](http://fh-static-image.oss-cn-hangzhou.aliyuncs.com/marque%2FScreen%20Shot%202016-02-19%20at%2012.21.54%20PM.png)

###Usage
    
    //html 初始化
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
	// 可以自行编写itemFactory 为每个目录相生成更多的dom，比如目录项描述等
	itemFactory : function(item){
	    return '<div class="drop-handle">'+item.term_name+'</div>'
	}
    });
		
   // 生成的dom如下
   
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

你可以使用droptest.plugin.serlalize() 获取改变的数据, 每项数据如下，只导出其顺序或父目录改变的项目。
 { 
   __changed: false
   __original_parent: 2
   parent: 8
   term_id: 6 
   term_name: "c6"
}
