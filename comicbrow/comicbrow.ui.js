var reader = {
	files:[],
	curfile:"",
	listingHtml:"",
	dual: localStorage['cobo.dual']||false,
	fitwidth: localStorage['cobo.fitwidth']||false,
	angle: localStorage['cobo.angle']||0,
	inListing: true,
	//
	filePos: function(f) {
		return $.inArray(f||reader.curfile, reader.files);
	},
	show: function(f) {
		if(typeof f == "string")
			reader.curfile = f;
		else
			f = reader.curfile;
		var ww = $(window).width(), wh = $(window).height()-5;
		var isHoriz = (reader.angle == 90 || reader.angle == 270);

		var max = "";
		// if fitting width serverside resize shouldn't constrict by height
		if(reader.fitwidth)
			max = (isHoriz ? wh/2+"x" : ww/2+"x");
		else
			max = (isHoriz ? wh+"x"+ww : ww+"x"+wh);

		var opts = "?max="+max+"&r="+reader.angle;

		if(reader.dual)	// todo: some better transition when not having to load the other pic
			$('.comic').animate({opacity:'0'}, 'slow');
		else
			$('.comic').animate({opacity:'0'}, 'slow');

		$(new Image()).hide()
			.load(function() {
			/*
				$('#container').animate({opacity: '0'},{
					step: function(now,fx){ console.log(now)
						$('#container').css('-webkit-transform','translateY('+now+'px)');
					},
					duration:600,
					complete: function() {
					}
				})*/
				var fit = (reader.fitwidth ? 'fitw':'');
				if(reader.dual) {
					var html = '<img class="comic dual left '+fit+'" src="'+reader.prevImg()+opts+
						'"/> <img class="comic dual right '+fit+'" src="'+this.src+'">';
					$('#container').html(html+'<span id="pos">'+reader.filePos()+'/'+reader.files.length+'</span>');
					$('.comic.left').click( reader.prev );
					$('.comic.right').click( reader.next );
				} else {
					var html = '<img class="comic single '+fit+'" src="'+this.src+'" alt=""/>';
					$('#container').html(html+'<span id="pos">'+reader.filePos()+'/'+reader.files.length+'</span>');
					$('.comic').click( reader.next );
				}
			})
			.error(function() {alert('error loading '+this.src)})
			.attr('src', f+opts);
		reader.inListing = false;
		window.location.href = "#"+f;
	},
	rotate: function() {
		reader.angle += 90;
		if(reader.angle >= 360)
			reader.angle = 0;
		var trans = " rotate("+reader.angle+"deg)";
		$('.comic').css({"-moz-transform":trans, "-webkit-transform":trans});
	},
	next: function() {
		reader.show(reader.nextImg());
	},
	prev: function() {
		reader.show(reader.prevImg());
	},
	nextImg: function() {
		var idx = reader.filePos()+1;
		if(idx >= reader.files.length) return null;		//idx = 0;
		return reader.files[idx];
	},
	prevImg: function() {
		var idx = reader.filePos()-1;
		if(idx < 0) return null; 	//idx = reader.files.length;
		return reader.files[idx];
	},
	showListing: function() {
		$('#container').html(
			'<table><tr><th>file</th><th>size</th><th>date</th></tr>'+reader.listingHtml+'</table>'
			);
		$('.file a.img').click(function(e) {
			reader.show($(this).attr("href"));
			return false;
		});
		reader.inListing = true;
	}
};

function sprintf(format, etc) {
	var i = 1, arg = arguments;
	return format.replace(/%((%)|s)/g, function (m) { return m[2] || arg[i++] });
}
function hasLocalStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

if(!Object.keys) Object.keys = function(o){  
  if (o !== Object(o))  
    throw new TypeError('Object.keys called on non-object');  
  var ret=[],p;  
  for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);  
  return ret;  
}

if (typeof KeyEvent == "undefined") {
	var KeyEvent = {
		DOM_VK_CANCEL: 3, DOM_VK_HELP: 6, DOM_VK_BACK_SPACE: 8, DOM_VK_TAB: 9, DOM_VK_CLEAR: 12, DOM_VK_RETURN: 13, DOM_VK_ENTER: 14, DOM_VK_SHIFT: 16, DOM_VK_CONTROL: 17, DOM_VK_ALT: 18, DOM_VK_PAUSE: 19, DOM_VK_CAPS_LOCK: 20, DOM_VK_ESCAPE: 27, DOM_VK_SPACE: 32, DOM_VK_PAGE_UP: 33, DOM_VK_PAGE_DOWN: 34, DOM_VK_END: 35, DOM_VK_HOME: 36, DOM_VK_LEFT: 37, DOM_VK_UP: 38, DOM_VK_RIGHT: 39, DOM_VK_DOWN: 40, DOM_VK_PRINTSCREEN: 44, DOM_VK_INSERT: 45, DOM_VK_DELETE: 46, DOM_VK_0: 48, DOM_VK_1: 49, DOM_VK_2: 50, DOM_VK_3: 51, DOM_VK_4: 52, DOM_VK_5: 53, DOM_VK_6: 54, DOM_VK_7: 55, DOM_VK_8: 56, DOM_VK_9: 57, DOM_VK_SEMICOLON: 59, DOM_VK_EQUALS: 61, DOM_VK_A: 65, DOM_VK_B: 66, DOM_VK_C: 67, DOM_VK_D: 68, DOM_VK_E: 69, DOM_VK_F: 70, DOM_VK_G: 71, DOM_VK_H: 72, DOM_VK_I: 73, DOM_VK_J: 74, DOM_VK_K: 75, DOM_VK_L: 76, DOM_VK_M: 77, DOM_VK_N: 78, DOM_VK_O: 79, DOM_VK_P: 80, DOM_VK_Q: 81, DOM_VK_R: 82, DOM_VK_S: 83, DOM_VK_T: 84, DOM_VK_U: 85, DOM_VK_V: 86, DOM_VK_W: 87, DOM_VK_X: 88, DOM_VK_Y: 89, DOM_VK_Z: 90, DOM_VK_CONTEXT_MENU: 93, DOM_VK_NUMPAD0: 96, DOM_VK_NUMPAD1: 97, DOM_VK_NUMPAD2: 98, DOM_VK_NUMPAD3: 99, DOM_VK_NUMPAD4: 100, DOM_VK_NUMPAD5: 101, DOM_VK_NUMPAD6: 102, DOM_VK_NUMPAD7: 103, DOM_VK_NUMPAD8: 104, DOM_VK_NUMPAD9: 105, DOM_VK_MULTIPLY: 106, DOM_VK_ADD: 107, DOM_VK_SEPARATOR: 108, DOM_VK_SUBTRACT: 109, DOM_VK_DECIMAL: 110, DOM_VK_DIVIDE: 111, DOM_VK_F1: 112, DOM_VK_F2: 113, DOM_VK_F3: 114, DOM_VK_F4: 115, DOM_VK_F5: 116, DOM_VK_F6: 117, DOM_VK_F7: 118, DOM_VK_F8: 119, DOM_VK_F9: 120, DOM_VK_F10: 121, DOM_VK_F11: 122, DOM_VK_F12: 123, DOM_VK_F13: 124, DOM_VK_F14: 125, DOM_VK_F15: 126, DOM_VK_F16: 127, DOM_VK_F17: 128, DOM_VK_F18: 129, DOM_VK_F19: 130, DOM_VK_F20: 131, DOM_VK_F21: 132, DOM_VK_F22: 133, DOM_VK_F23: 134, DOM_VK_F24: 135, DOM_VK_NUM_LOCK: 144, DOM_VK_SCROLL_LOCK: 145, DOM_VK_COMMA: 188, DOM_VK_PERIOD: 190, DOM_VK_SLASH: 191, DOM_VK_BACK_QUOTE: 192, DOM_VK_OPEN_BRACKET: 219, DOM_VK_BACK_SLASH: 220, DOM_VK_CLOSE_BRACKET: 221, DOM_VK_QUOTE: 222, DOM_VK_META: 224
	};
}

//

$(function() {
	$('#help').append('<div id="helpdlg">'+['<b>common</b>','s - save view settings',
		'<b>filelisting</b>','esc - parent directory','2 - single/double page','w - fit width/height',
		'<b>imageview</b>','esc - return to file listing','left - previous image','right - next image','r - rotate 90 degrees'
		].join('\n')+'</div>');

	$.getJSON(window.location.href, function(data){
		reader.files = Object.keys(data.files);
		reader.listingHtml = "";
		$.each(data.dirs, function(i,v){
			reader.listingHtml += '<tr class="dir"><td><a href="'+i+'/">'+unescape(i)+'</a></td><td>'+v.mtime+'</td></tr>';
		});
		$.each(data.files, function(i,v){
			reader.listingHtml += '<tr class="file"><td><a class="img" href="'+i+'">'+
			unescape(i)+'</a></td><td>'+Math.round(v.size/1024)+'k</td><td>'+v.mtime+'</td></tr>';
		});
		var hash = window.location.hash.substring(1);
		if(reader.filePos(hash) >= 0) {
			reader.show(hash);
		} else {
			reader.showListing();
		}
	});
	
	$(document).keydown(function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		//if(console.log) console.log(code);
		// common key events
		switch(code) {
			case KeyEvent.DOM_VK_S:
				if(!hasLocalStorage()) {
					alert("No local storage? Get a better browser.");
					break;
				}
				if(!confirm("Save current view setup as default?")) break;
				localStorage['cobo.angle'] = reader.angle;
				localStorage['cobo.dual'] = reader.dual;
				localStorage['cobo.fitwidth'] = reader.fitwidth;
				break;
		}
		// key events in dir listing
		if(reader.inListing)
			switch(code) {
			case KeyEvent.DOM_VK_ESCAPE:
				//reader.show(reader.curfile);
				location.pathname += "..";
				break;
			case KeyEvent.DOM_VK_LEFT:
				location.pathname += "..";
				break;
			case KeyEvent.DOM_VK_RIGHT:
				break;
			case KeyEvent.DOM_VK_UP:
				($('tr:has(a:focus)').prevUntil('tr a').first().find('a') || $('tr a:first')).focus();
				break;
			case KeyEvent.DOM_VK_DOWN:
				($('tr:has(a:focus)').nextUntil('tr a').first().find('a') || $('tr a:last')).focus();
				break;
			}
		// key events while viewing image
		else
			switch(code) {
			case KeyEvent.DOM_VK_ESCAPE:
				reader.showListing();
				break;
			case KeyEvent.DOM_VK_SPACE:
				if(!reader.fitwidth) reader.next();
				break;
			case KeyEvent.DOM_VK_2:
				reader.dual = !reader.dual;
				reader.next();
				break;
			case KeyEvent.DOM_VK_R:
				reader.rotate();
				break;
			case KeyEvent.DOM_VK_W:
				reader.fitwidth = !reader.fitwidth;
				reader.show();
				break;
			case KeyEvent.DOM_VK_LEFT:
				reader.prev();
				break;
			case KeyEvent.DOM_VK_RIGHT:
				reader.next();
				break;

			}
	});

	$('#help').mouseenter(function(){
		$('#helpdlg').show();
	}).mouseleave(function(){
		$('#helpdlg').hide();
	});
	
});

