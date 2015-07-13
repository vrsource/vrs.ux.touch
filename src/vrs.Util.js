/*global Ext, PhoneGap, vrs */
Ext.ns('vrs');

/**
 * Utility methods
 */
function AssertException(message) {
   this.message = message;
}
AssertException.prototype.toString = function () {
   return 'AssertException: ' + this.message;
};

function assert(exp, message) {
   if (!exp) {
      if(undefined === message) {
         message = "<no message>";
      }
      throw new AssertException(message);
   }
}

// ---------- SHORTCUTS -------- //
Ext.format = Ext.util.Format.format;


// --------- Mouse and Keyboard support ------ //

/**
 * Add hooks to intercept mouse wheel events.
 *
 * see for base concept:
 * https://www.sencha.com/forum/showthread.php?110792-Add-support-for-mouse-scrolling-%28for-development%29&p=744700&viewfull=1#post744700
 */
(function() {
   // `wheel` events can have different modes to indicate what the delta means.
   // For our use here we simply need to know how to convert the delta into a
   // reasonable pixel size for the scroller.
   var delta_multipliers = {
      0: 0.5,    // pixels
      1: 12,     // lines
      2: 12 * 20 // pages
   };

   function adjustScroller(scroller, evt) {
      var multiplier = delta_multipliers[evt.deltaMode] || 0.5,
          offset = {
             x: 0,
             y: evt.deltaY * multiplier
          };

      scroller.fireEvent('scrollstart', scroller, scroller.position.x, scroller.position.y, evt);
      scroller.scrollBy(offset.x, offset.y);
      scroller.snapToBoundary();
      scroller.fireEvent('scrollend', scroller, scroller.position.x, scroller.position.y - offset.y);
   }

   function findScroller(el) {
      var cmp, scroller;

      while (el !== document.body) {
         if (el && el.className && el.className.indexOf('x-container') >= 0) {
            cmp = Ext.getCmp(el.id);
            if (cmp && typeof cmp.getScrollable == 'function' && cmp.getScrollable()) {
               scroller = cmp.getScrollable().getScroller();
               if (scroller) {
                  return scroller;
               }
            }
         }
         el = el.parentNode;
      }
      return null;
   }

   /**
    * Event handler for `wheel` events which will search up the DOM looking for
    * a scroller and adjust the scrollers possition to simulate normal scrolling.
    *
    * @param evt https://developer.mozilla.org/en-US/docs/Web/Events/wheel
    */
   function onWheelEvent(evt) {
      var scroller = findScroller(evt.target);
      if (scroller) {
         adjustScroller(scroller, evt);
      }
   }

   /**
    * Adds an event mouse whell event listener so that the scroller can behave
    * correctly on desktops
    */
   vrs.addMouseWheelHooks = function() {
      document.addEventListener('wheel', onWheelEvent, false);
   };
}());


/**
 * Custom json writer that doesn't
 * put the written records into an embedded 'records'
 * data structure.
 *
 * Just write as one json object or a list of json objects.
 */
Ext.define('vrs.FlatJsonWriter', {
   extend: 'Ext.data.writer.Json',

   alias: 'writer.json_flat',  // Register the writer.

   writeRecords: function(request, data) {
      var local_data = data;
      if(1 === data.length)
      { local_data = data[0]; }

      if (this.encode === true) {
         local_data = Ext.encode(local_data);
      }
      request.jsonData = local_data;

      return request;
   }
});

// XXX: Ext.data.WriterMgr.registerType('json_flat', vrs.FlatJsonWriter); //



// --- Formatting Helpers ---- //
vrs.number_format = function( number, decimals, dec_point, thousands_sep ) {
   // http://kevin.vanzonneveld.net
   // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
   // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
   // +     bugfix by: Michael White (http://crestidg.com)
   // +     bugfix by: Benjamin Lupton
   // +     bugfix by: Allan Jensen (http://www.winternet.no)
   // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
   // *     example 1: number_format(1234.5678, 2, '.', '');
   // *     returns 1: 1234.57
   var n, d, t, i, c, s, j;
   n = number;
   c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
   d = dec_point === undefined ? "," : dec_point;
   t = thousands_sep === undefined ? "." : thousands_sep;
   s = n < 0 ? "-" : "";
   i = parseInt(n = Math.abs(+n || 0).toFixed(c), 10) + "";
   j = (j = i.length) > 3 ? j % 3 : 0;

   return s + (j ? i.substr(0, j) + t : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
      (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

/**
 * Return a human readable forme of a filesize.
 * from: http://snipplr.com/view.php?codeview&id=5949
 */
vrs.size_format = function(filesize) {
   if (filesize >= 1073741824) {
      filesize = vrs.number_format(filesize / 1073741824, 2, '.', '') + ' GB';
   } else {
      if (filesize >= 1048576) {
         filesize = vrs.number_format(filesize / 1048576, 2, '.', '') + ' MB';
      } else {
         if (filesize >= 1024) {
            filesize = vrs.number_format(filesize / 1024, 0) + ' KB';
         } else {
            filesize = vrs.number_format(filesize, 0) + ' B';
         }
      }
   }
   return filesize;
};

/**
 * Return a formatted data string based upon whether the date is the same
 * as the current date or not.
 *
 * If dateVar is today, then return todayFormat.  If not, then return notTodayFormat
 * verion of the data.
 */
vrs.format_today_date = function(dateVar, todayFormat, notTodayFormat) {
   var today_date = new Date(),
       is_today = ( (today_date.getYear() === dateVar.getYear()) &&
                    (today_date.getMonth() === dateVar.getMonth()) &&
                    (today_date.getDate() === dateVar.getDate()) );
   return (is_today ? dateVar.format(todayFormat) : dateVar.format(notTodayFormat));
};

/**
 * Detect if we are running inside of PhoneGap.
 */
vrs.isPhoneGap = (undefined !== window.PhoneGap);

/**
 * Returns true if the given strings ends with the given suffix.
 *
 * @param {String} str:    Full string to test.
 * @param {String} suffix: The suffix to test for.
 */
vrs.endsWith = function(str, suffix)
{
   return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Returns true if the given string starts with the given prefix.
 *
 * @param {String} str:    Full string to test.
 * @param {String} prefix: The prefix to test for.
 */
vrs.startsWith = function(str, prefix)
{
   return str.substring(0, prefix.length) === prefix;
};

/**
 * Return the file extension for the given filename.
 *
 * @param {String} filename: Path to the file.
 */
vrs.getFileExtension = function(filename)
{
   var parts = filename.split('.');
   if (parts.length > 1)
   {
      return parts.pop();
   }
   return "";
};

/* Block threat for number of milliseoconds.
 * DON'T USE IN PRODUCTION
 */
vrs.sleep = function sleep(milliSeconds){
   var startTime = new Date().getTime(), // get the current time
       cur_time = new Date().getTime();
   while (cur_time < startTime + milliSeconds)
   { cur_time = new Date().getTime(); /* hog cpu */ }
};

/*
 * Capture all events from the specified object and call fn before they run
 * within the scope of scope.
 */
vrs.captureEvents = function(o, fn, scope) {
   o.fireEvent = Ext.Function.createInterceptor(o.fireEvent, fn, scope);
};

vrs.captureActions = function(o, fn, scope) {
   o.fireAction = Ext.Function.createInterceptor(o.fireAction, fn, scope);
};

/** Helper function to display details of all events/actions
 * for the given object.
 */
vrs.dumpEvents = function(o, name) {
   if(name) {
      name = "[" + name + "]";
   } else {
      name = '';
   }

   vrs.captureEvents(o, function(eventName) {
      console.log(name + " Event: " + eventName, arguments);
   });
   vrs.captureActions(o, function(actionName) {
      console.log(name + " Action: " + actionName, arguments);
   });
};

/*
 // No mouse version
 Ext.Component.prototype.fireEvent =
 Ext.Function.createInterceptor(Ext.Component.prototype.fireEvent, function() {
 if (arguments && arguments[0].indexOf("mouse") === -1 && arguments[0] != "uievent") {
 console.log(this.$className, arguments, this);
 }
 return true;
 });

 Ext.Component.prototype.fireEvent =Ext.Function.createInterceptor(Ext.Component.prototype.fireEvent, function() {
 console.log(this.$className, arguments, this);
 return true;
 });
 */
