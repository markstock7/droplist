    (function($, window ,document, undefined){
			if($ === null)
				throw Error('Please load jquery firstly!');

			// for avoiding call mousemove event frequently
			var _throttle = function(fn, delay){
				var timeoutId;
				return function(){
					if(!timeoutId)
						timeoutId = setTimeout(function(){
							fn();
							clearTimeout(timeoutId);
							timeoutId = null;
						}, delay);
				}
			}

			var hasPointerEvents = (function(){
        		var el    = document.createElement('div'),
            		docEl = document.documentElement;
        		if (!('pointerEvents' in el.style)) {
            		return false;
        		}
        		el.style.pointerEvents = 'auto';
        		el.style.pointerEvents = 'x';
        		docEl.appendChild(el);
        		var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        		docEl.removeChild(el);
        		return !!supports;
    		})();

			var defaults = {
				listNodeName : 'ul',
				itemNodeName : 'li',
				rootClass 	 : 'drop drop-list drop-list-normal',
				handleClass  : 'drop-handle',
				placeholderClass : 'drop-placeholder',
				depthClass   : 'list-depth-',
 				noDragClass  : 'drop-nodrag',
 				dragClass 	 : 'drop-dragWrapper',
				maxDepth 	 : 5,
				thresholdX   : 30,
				thresholdY   : 30,
				itemFactory  : null,
			};

			function Plugin(element, options){
				this.doc = $(document);
				this.el  = $(element);
				var data = options.data;
				delete options.data;
				this.options = $.extend({}, defaults, options);
				this.init(data);
			}

			// Traverse the dom to serialize the data
			Plugin.prototype.serialize = function(){
				var elem = this.el.find(this.options.itemNodeName).first(),
					tempData = [],
					datas = this.dataSet,
					i , len, id,
					prevDepth = 0 ,depth,
					prevId = 0 , id ,
					stack = [],
					temp;
				while(elem.length){
					id = +elem.attr('data-term-id');
					depth = +elem.attr('data-depth');

					if(stack.length === 0) {
						this.dataSet[id].parent = 0;
						stack.push({depth:depth ,id :id});
						prevDepth = depth;
						prevId = id;
					} else if(depth > prevDepth) {
						this.dataSet[id].parent = prevId;
						stack.push({depth:depth, id:id});
						prevDepth = depth;
						prevId = id;
					} else if(depth === prevDepth) {
						temp = stack.pop();
						this.dataSet[id].parent = temp.id;
						temp.id = id;
						prevId = id;
						stack.push(temp);
					} else {
						temp = stack.pop();
						while(temp){
							if(temp.depth > depth){
								temp = stack.pop();
								continue;
							}
							else if(temp.depth === depth){
								this.dataSet[id].parent = this.dataSet[temp.id].parent;
								prevId = id;
								prevDepth = depth;
								stack.push({depth:depth ,id:id});
								break;
							}
							temp = stack.pop();
						}
					}
					elem = elem.next();
				}
				return this.dataSet;
				//console.log(this.dataSet);
			},

			Plugin.prototype.init = function(data){
				/**
				 * Mapped the data to the dom Tree.
				 * @param array  The root of the dome tree(ul)
				 * @param object 
				 */ 
				function wrapperItem(root, item){
					if(item) {
						var elem = $(document.createElement(this.options.itemNodeName)).addClass(this.options.depthClass + item.depth);
						elem.attr('data-depth' ,item.depth);
						elem.attr('data-term-id', item.term_id);
						// 构造子元素
						elem.append(this.options.itemFactory(item));
						elem.appendTo(root);
						if(item.children.length > 0 ){
							for(var i = 0 ,len = item.children.length ; i < len ; i++){
								root = wrapperItem.call(this, root, item.children[i]);
							}
						}
					}
					return root;
				}

				/**
				 * Organization structure of the datas.
				 * @param array data 
				 */
				function constructorData(data) {
					var catelog = {}, 
						i,
						len = data.length - 1,
						root = [],
						parent;
					for(i = len; i >= 0 ;i--){
						data[i].children = [];
						catelog[data[i].term_id] = data[i];
					}
					for(i = len; i >= 0 ;i--){
						parent = data[i].parent;
						if(parent ===0) root.push(data[i]);
						else catelog[parent].children.push(data[i]);
						//delete data[i];						
					}
					return root;
				}

				/**
				 * Prepare for the dragEvent of dragStart.
				 * @param object event 
				 */
				var onStartEvent = function(e){
					var target = $(e.target);
					if(!target.hasClass(list.options.handleClass)){
						if(target.closest('.' + list.options.noDragClass).length)
							return;
						target = target.closest('.'+list.options.handleClass);
					}
					if(!target.length || droplist.dragEl)
						return ;

					e.preventDefault();
					list.dragStart(e);
				}

				/**
				 * Prepare for the dragEvent of dragStop.
				 * @param object event 
				 */
				var onEndEvent = function(e){
					if(list.dragEl){
						e.preventDefault();
						list.dragStop(e);
					}
				}

				/**
				 * Prepare for the dragEvent of dragMove.
				 * @param object event 
				 */
				var onMoveEvent = function(e){
					if(list.dragEl){
						e.preventDefault();
						list.dragMove(e);
					}
				}
				
				var tree,
					i,
					list = this,
					len;

				try {
					// We Can't sure that the data format is right
					this.dataSet = {};
					for(i = 0 ,len = data.length; i <len ; i++){
						this.dataSet[data[i].term_id] = data[i];
					}
					tree = new Node(constructorData(data));
				} catch(e){
					throw e;
				}

				
				// Initialize the ul.
				var droplist  = $(document.createElement(this.options.listNodeName)).addClass(this.options.rootClass);
				for( i = 0 ,len = tree.children.length ;i < len ;i++ ) {
					droplist = wrapperItem.call(this ,droplist ,tree.children[i]);
				}
				droplist.appendTo(this.el);

				// Initialize the placeholder.
				this.placeholder = $('<li class="' + this.options.placeholderClass + '"/>');
				
				// Initialize some data.
				this.reset();

				// Initialize the Event 
				this.el.on('mousedown' , onStartEvent);
				this.doc.on('mousemove', onMoveEvent);
				this.doc.on('mouseup'  , onEndEvent);
			};
			
			Plugin.prototype.dragStart = function(e){
				var mouse = this.mouse ,										// Record some data about the mouse 
					target = $(e.target) ,										// The target that fires the mousedown event
					target = target.closest(this.options.itemNodeName) ,		// Fix the target to li element
					nextItem = null ,											//
					depth =  parseInt(target.attr('data-depth')) ,			    // The depth of the target
					dragItemParent = target.parent() ,							//
					dragItemPrev = target.prev() || dragItemParent;				// The previous element of the target, if target is the first li then dragItemPrev is ul

				// Initialize the starting point of mouse of the document
				mouse.nowX = e.pageX;
				mouse.nowY = e.pageY;

				//
				mouse.offsetX = e.offsetX !== undefined ? e.offsetX : e.pageX - target.offset().left;
 				mouse.offsetY = e.offsetY !== undefined ? e.offsetY : e.pageY - target.offset().top;

 				// Create a new ul to store the moving element ,We will call it Temporary list set
 				this.dragEl = $(document.createElement(this.options.listNodeName))
 								.addClass(this.options.rootClass + ' ' +this.options.dragClass);

 				// Fina all the child of the current target (not the real child, just in theoretical depends on the depth)
 				while( (nextItem = target.next()) && parseInt(nextItem.attr('data-depth')) > depth){
 					this.dragEl.append(nextItem);
 				}

 				// Move the target itself to the Temporary list set
 				this.dragEl.prepend(target);

 				// Set the Temporary list set position
 				this.dragEl.css({
 					left : e.pageX - mouse.offsetX,
 					top  : e.pageY - mouse.offsetY
 				});


 				this.dragEl.width(dragItemParent.width());
 				$(document.body).append(this.dragEl);

 				// Insert the placeholder and the placeholder depth
 				this.placeholder.height(this.dragEl.height());
 				this.placeholder.addClass('list-depth-' + depth);
 				if(dragItemPrev.length)
 					this.placeholder.insertAfter(dragItemPrev);
 				else 
 					dragItemParent.prepend(this.placeholder);

			}

			Plugin.prototype.dragStop = function(e) {
				var el = this.dragEl.children() ,
					opt = this.options ,
					depth = ((new RegExp(opt.depthClass+'(\\d*)')).exec(this.placeholder.attr('class')))[1] ,
					depthDiff = depth - (+($(el[0]).attr('data-depth'))),
					elem,
					i;
				for(i = el.length-1;i >=0 ;i--){
					elem = $(el[i]);
					depth = +elem.attr('data-depth') + depthDiff;
					elem.attr('class',opt.depthClass + depth );
					elem.attr('data-depth', depth);
					elem.insertAfter(this.placeholder);					
				}
				this.placeholder.remove();
				this.placeholder.attr('class',this.options.placeholderClass);
				this.dragEl.remove();
				this.reset();
			}

			Plugin.prototype.dragMove = function(e){
				var mouse = this.mouse,
					parent,
					prev,
					next,
					depth,
					opt = this.options;

				this.dragEl.css({
					left : e.pageX-mouse.offsetX,
					top : e.pageY - mouse.offsetY
				});

				// mouse position last events
				mouse.lastX = mouse.nowX;
				mouse.lastY = mouse.nowY;

				// mouse position this events
				mouse.nowX = e.pageX;
				mouse.nowY = e.pageY;

				 // distance mouse moved between events
				mouse.distX = mouse.nowX - mouse.lastX;
				mouse.distY = mouse.nowY - mouse.lastY; 

				 // direction mouse was moving
				mouse.distAtX += mouse.distX;
				mouse.distAtY += mouse.distY;

				// Move horizontal to Right
				if( mouse.distAtX > opt.thresholdX ){
					
					depth = ((new RegExp(opt.depthClass+'(\\d*)')).exec(this.placeholder.attr('class')))[1];
					depth = +depth;

					// If the previous element's depth is bigger than the current placeholder and not equal to depth - 1, then safe
					prev = this.placeholder.prev(opt.itemNodeName);
					if(+prev.attr('data-depth') !== (depth - 1)){
						while(prev.length){
							if(+prev.attr('data-depth') >= depth)
								break;
							else 
								prev = prev.prev(opt.itemNodeName);
						}
						if(prev.length){
							this.placeholder.removeClass(opt.depthClass+depth);
							this.placeholder.addClass(opt.depthClass+(depth+1));
						}
					}
					mouse.distAtX = 0 ;
				// Move horizontal to Left 
				// 向左的时候也要考虑下placeholder下面的元素
				} else if ( mouse.distAtX < -opt.thresholdX ) {
					next = this.placeholder.next();

					depth = ((new RegExp(opt.depthClass+'(\\d*)')).exec(this.placeholder.attr('class')))[1];
					depth = +depth;

					if((depth-1) >= 1 && (!next || +next.attr('data-depth')-1 !== depth)){
						this.placeholder.removeClass(opt.depthClass+depth);
						this.placeholder.addClass(opt.depthClass+(depth-1));
					}
					mouse.distAtX = 0 ;
				}


				if (!hasPointerEvents) {
                	this.dragEl[0].style.visibility = 'hidden';
            	}
            	this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, 
            											   e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
            	if (!hasPointerEvents) {
                	this.dragEl[0].style.visibility = 'visible';
            	}

            	// Move vertical to Top
                if(mouse.distAtY < -opt.thresholdY) {
                	prev = this.pointEl.closest(opt.itemNodeName);
                	prev = prev.prev();

                	if(prev.length){
                		depth = ((new RegExp(opt.depthClass+'(\\d*)')).exec(this.placeholder.attr('class')))[1];
						depth = +depth;
						this.placeholder.removeClass(opt.depthClass+depth);
						this.placeholder.addClass(opt.depthClass+(prev.attr('data-depth')));
						this.placeholder.insertAfter(prev)
                	} else {
                		depth = ((new RegExp(opt.depthClass+'(\\d*)')).exec(this.placeholder.attr('class')))[1];
						depth = +depth;
						this.placeholder.removeClass(opt.depthClass+depth);
						this.placeholder.addClass(opt.depthClass+1);
						this.el.find('ul').prepend(this.placeholder);
                	}
                	mouse.distAtY = 0;

                // Move vertical to Down
                } else if (mouse.distAtY > opt.thresholdY){
                	prev = this.pointEl.closest(opt.itemNodeName);
                	if(prev.lenght){
						this.placeholder.insertAfter(prev);
                	} else {
                		this.placeholder.appendTo(this.placeholder.parent());
                	}
					mouse.distAtY = 0;
                }
			}

			Plugin.prototype.reset = function(){
				this.mouse = {
                	offsetX   : 0,
                	offsetY   : 0,
                	startX    : 0,
                	startY    : 0,
                	lastX     : 0,
                	lastY     : 0,
                	nowX      : 0,
                	nowY      : 0,
                	distX     : 0,
                	distY     : 0,
                	distAtX   : 0,   // 水平方向移动的总距离
                	distAtY   : 0    // 垂直方向移动的总距离
            	};
            	this.moving = false;
            	this.dragEl = null;
            	this.dragRootEl = null;
            	this.dragDepth = 0;
            	this.hasNewRoot = false;
            	this.pointEl = null;

			}

			var Node = function(data ,depth){
				this.children = [];
				this.depth = depth || 0;
				var i = 0 ,len;
				if(data.children === undefined){
					for(i = 0, len = data.length; i < len; i++){
						this.children.push(new Node(data[i], this.depth + 1));
					}
				} else {
					var children = data.children;
					delete data.children;
					for( i in data ) this[i] = data[i];
					for(i = 0, len = children.length ; i< len ; i++){
						this.children.push(new Node(children[i] , depth+1));
					}
				}
			}

			$.fn.dropList = function(params) {
				var dropWrapper = this,
					retval;
				var plugin = $(this).data('plugin');
				if( !plugin ) {
					plugin = new Plugin(this, params);
					$(this).data('plugin', plugin);
					this.plugin  = plugin;

				} else {
					if( typeof params === 'string' && plugin[params] === 'function' ) {
						retval = plugin[params]();
					}
				}
				return retval || dropWrapper;
			}
			
		})($ || null, window, document, undefined);
