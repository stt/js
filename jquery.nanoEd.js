/**
 * Very simple, single-file, editor component with main goal
 * of preventing pre-element breakage
 * (c)2010 <samuli.tuomola@gmail.com>
 */
(function($) {
   $.fn.addButton = function(title) {
      var bar = $(this).hasClass('nEd-bar') ? $(this) : $(this).find('.nEd-bar');
      return $('<div class="nEd-button" title="'+title+'"><div>')
         .mousedown(function() { $(this).addClass('click'); })
         .mouseup(function() { $(this).removeClass('click'); })
         .appendTo( bar );
   };

   $.fn.nanoEd = function(opts) {
      if(!($.browser.mozilla || $.browser.webkit)) alert("Untested browser, YMMV");
      
      opts = $.extend({}, $.fn.nanoEd.defaults, opts);
      initStyle(opts);
      
      // for each selected element..
      return this.each(function(){
         if(!this.id) { alert("Element missing id, please define one"); return; }
         var id = this.id;
         
         // define the toolbar
         var bar = $('<div class="nEd-bar"></div>');
         for (var i=0,btn=0; i < opts.toolbar.length; i++) {
            if(typeof opts.toolbar[i] == 'undefined')
               $('<div class="nEd-separator"></div>').appendTo(bar);
            else if(opts.toolbar[i].constructor == String)
               $(opts.toolbar[i]).appendTo(bar);
            else {
               bar.addButton(opts.toolbar[i].label)
                  .css('background-position', -btn*opts.btnSize+'px')
                  .data('exec',opts.toolbar[i].exec)
                  .click(function() {
                     $(this).parent().siblings('.nEd-content').execCommand($(this).data('exec'));
                  });
               btn++;
            }
         }
         bar.find('select.format').change(function() {
            $('#'+id+' .nEd-content').execCommand('formatblock', this.value);
            this.selectedIndex = 0;
         });
         
         // source view is one of the few essential features editor needs
         bar.addButton('Source').click(function() {
            var src = $(this).parent().siblings('.nEd-source'), content = $(this).parent().siblings('.nEd-content');
            if(src.css('display') == 'none')
               src.text( content.contentDocument().body.innerHTML );
            else
               content.contentDocument().body.innerHTML = src.text();
            $(this).parent().siblings('.nEd-content, .nEd-source').toggle();
         });
         
         // define the editor
         var ele = $('<div id="'+id+'" class="nanoEd"></div>')
            .append(bar);
         
         // big ol' ugly iframe
         ele.append($('<input type="hidden" id="nEd-'+id+'" name="'+this.name+'" value=""/><iframe class="nEd-content">'+
            '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'+
            '<html><head><title></title>'+
            '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
            '<style type="text/css">pre { background-color: #eeeeee; padding: 0.75em 1.5em; border: 1px solid #dddddd; }</style>'+
            //if (this.cssFile) { html += '<link rel="stylesheet" type="text/css" href="'+this.cssFile+'">'; }
            '<style type="text/css">html,body { cursor: text; } body { margin: 0.5em; padding: 0; }</style>'+
            '</head><body></body></html></iframe><div class="nEd-source" contenteditable="true" style="display:none"></div>')
            );
         
         var val = $(this).val();   // old val
         $(this).replaceWith(ele);  // unleash
         // mainscreen turn on
         var doc = ele.find('.nEd-content').designMode("on").contentDocument();
         doc.open().write(val);
         $('#nEd-'+id).val(val);
         
         // ie: attachEvent
         doc.addEventListener('blur', function(e) {
            $('#nEd-'+id).val(this.body.innerHTML);
         }, true);
         
         // and now the reason why this editor exists..
         doc.addEventListener('keypress', function(e) {
            if(e.which==13 && $.browser.mozilla) {
               var range = this.defaultView.getSelection().getRangeAt(0);
               var pre = $(range.startContainer).closest('pre');
               // don't crap on my pre
               if(pre.length > 0) {
                  range.insertNode( document.createTextNode("\n") );
                  e.preventDefault();
                  return false;
               }
            }
            return true;
         }, true);
         doc.addEventListener('paste', function(e) {
            var range = this.defaultView.getSelection().getRangeAt(0);
            var pre = $(range.startContainer).closest('pre');
            // don't crap on my pre
            if(pre.length > 0) {
               setTimeout(function() {
                  pre.html( pre.html().replace(/<br>/g, '\n') );
               }, 10);
            }
            return true;
         }, false);
         
         doc.close();
         
      });
   };

   // define global styles, should be called only once per page
   function initStyle(opts) {
      $('<style type="text/css">.nEd-button { background:url(data:image/gif;base64,'+opts.btnImg+') }'+
         '.nanoEd { width:'+opts.width+'px; }'+
         '.nEd-bar { height:26px; background:#ECE9D8; padding:3px; border:#ACA899 1px; border-style:solid solid none solid; }'+
         '.nanoEd select { float:left; } .nEd-source { overflow:scroll; white-space:pre-line; font-family:monospace; }'+
         '.nEd-content, .nEd-source { border:1px solid; border-color:#716F64 #ECE9D8 #ECE9D8 #716F64; width:100%; height:'+opts.height+'px; }'+
         'div.nEd-button.click { border-color:#ACA899 #ffffff #ffffff #ACA899; }'+
         'div.nEd-button { float:left; padding:1px; border:#ECE9D8 1px solid; width:'+opts.btnSize+'px; height:'+opts.btnSize+'px; }'+
         'div.nEd-button:hover { padding:1px; border:1px solid; border-color:#ffffff #ACA899 #ACA899 #ffffff; }'+
         'div.nEd-separator { width:0px; height:18px; float:left; border-left:#aca899 1px solid; border-right:#ffffff 1px solid; margin:0 5px; }'+
         '</style>').appendTo('head');
   }
   
   $.fn.nanoEd.defaults = {
      width  : 540,
      height : 300,
      btnSize : 20,
      btnImg : 'R0lGODlhBAEUAPMAAAAAAGZmZoCAAP//AAAAgIAAgICAgMDAwMzMzP///wAAAAAAAAAAAAAAAAAA'+
               'AAAAACH5BAEAAAoALAAAAAAEARQAAAT+UMlJq7046827/2AojmRpnmiqrmzrvnAsz3Rts0UB3HzP'+
               'ESKC8LQTFX2eQiIHOCKJzahUaplao9Wr1TKUaJ0SIVDxfZa+24wyx26a37UxSGzElivUuwkwSPT/'+
               'foEDYBRrBQOIbYRkVyFTGnlYGGgclBuWFHRwLQGPjFEBeIKCBk0GCYsKhgUChwNtk26fjgAGlUey'+
               'm7o/FHoTcp9pEp0JCQjHTcXHCAChE3yjfQACAnyLqzkCiToZkpIepal4uOLBmM9o3+jphF1z7h7w'+ 
               'vmFyvgDGaMi90X7T1agWsLlS1E2Wulu2bqHbZWLMPAWa5omBt2EisEuomCk71okZs174gACFMzCo'+
               'ggE2bFq1OSCu0YdwHnLlunAulpZbN7kEofgDmDAu9TzhQfZF3zN+IQFSCJfyFZMDB0rZ9DLzUq2Y'+ 
               '5BiO0ETDp1Cd6w4OA7AMQadmZZuBDNQkacmlSpqg1AFV6tRZHWBiXViQXRa/4wBrhXHWmxRnR6UZ'+ 
               'KDXonjSTOYrJpRu1nOFyva7upTo4BNd4PHHueBjJ5R7FpUpBdUxosmQAdS2bhvTVqtjAs23mpvkQ'+ 
               'YtjaELv07ryv1uLjsFkqzRI5QWXi0Elc7DldNKMOkV6YSs09edVxOezuGh49U/XyMNjdDoy+fXnM'+
               'k9zLn0+/vv37+PNXiAAAOw==',
      toolbar : [
      '<select class="format"><option value=""></option><option value="<h1>">Heading 1</option>'+
      '<option value="<h2>">Heading 2</option><option value="<h3>">Heading 3</option>'+
      '<option value="<p>">Paragraph</option><option value="<pre>">Preformatted</option></select>',
       ,
       {label:'Bold',exec:'bold'}, {label:'Italic',exec:'italic'}, {label:'Underline',exec:'underline'},
       ,
       {label:'Align left',exec:'justifyleft'}, {label:'Align center',exec:'justifycenter'},
       {label:'Align right',exec:'justifyright'},
       ,
       {label:'Ordered list',exec:'insertorderedlist'}, {label:'Unordered list',exec:'insertunorderedlist'},
       ,
       {label:'Outdent',exec:'outdent'}, {label:'Indent',exec:'indent'},
       ,
       {label:'Create link',exec:'createlink'}, {label:'Insert image',exec:'insertimage'}
       ]
   };


   /**
    * designMode jQuery plugin v0.1, by Emil Konow.
    * This plugin allows you to handle functionality related to designMode in a cross-browser way.
    */

   /**
    * Cross-browser function to access a DOM:Document element
    */
   $.fn.contentDocument = function() {
	   var frame = this[0];
	   if (frame.contentDocument) {
		   return frame.contentDocument;
	   } else if (frame.contentWindow && frame.contentWindow.document) {
		   return frame.contentWindow.document;
	   } else if (frame.document) {
		   return frame.document;
	   } else {
		   return null;
	   }
   }

   /**
    * Cross-browser function to set the designMode property
    */
   $.fn.designMode = function(mode) {
	   // Default mode is 'on'
	   var mode = mode || 'on';
	   this.each(function() {
		   var frame = $(this);
		   var doc = frame.contentDocument();
		   if (doc) {
			   doc.designMode = mode;
			   // Some browsers are kinda slow, so you'll have to wait for the window to load
			   frame.load(function() {
				   $(this).contentDocument().designMode = mode;
			   });
		   }
	   });
	   return this;
   }

   /**
    * Cross-browser function to execute designMode commands
    * Example: $('#foo').execCommand('formatblock', '<p>');
    * @param string cmd - The command to execute. Please see http://www.mozilla.org/editor/midas-spec.html
    * @param string param - Optional parameter, required by some commands
    */
   $.fn.execCommand = function(cmd, param) {
	   this.each(function() {
		   var doc = $(this).contentDocument();
		   if (doc) {
			   // Use try-catch in case of invalid or unsupported commands
       		try {
				   // Non-IE-browsers requires all three arguments
				   doc.execCommand(cmd, false, param);
			   } catch (e) {
			   }
		   }
	   });
	   return this;
   }

})(jQuery);

