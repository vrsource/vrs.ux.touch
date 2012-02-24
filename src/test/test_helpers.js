/** Helper methods and fixtures for tests. */
/*global mostRecentAjaxRequest: false, urlparse: false, ajaxRequests: false */

// Testing Howto:
//
// - Spy on a constructor
//
//  see jasmine.createSpyClass below.
//


/**
 * IDEA: Consider using Ext.override to add these
 * as methods to jasmine.Spec so we can just call "this.blah()" locally in test.
 */
test.helpers = {
   /**
    * Setup p5.settings.getSettingsRecord to return
    * the passed in settings records using a spy.
    */
   /*
   setupSettingsSpy: function(retSettings) {
      var spec     = jasmine.getEnv().currentSpec;
      p5.settings = jasmine.createSpyObj('settings', ['getSettingsRecord',
                                                      'commitRecordChanges',
                                                      'on']);
      p5.settings.getSettingsRecord.andReturn(retSettings);
      spec.after(function() {p5.settings = undefined; });
   },
   */

   /**
    * Create a panel holder with the spies needed to intercept calls
    * to the panel holder.
    *
    * Should be used as a panelHolder param to new controllers.
    *
    * options:
    *    inSidePanel: If set, used as value for inSidePanel for stack ctrl. (default: false)
    *    inPopupPanel: If set, used as value for inPopupPanel for the ctrl. (default: false)
    *    popupPanel: If set, used as the object that is the popupPanel we are within.
    */
   createPanelHolderSpy: function(options) {
      var panel_holder_spy = jasmine.createSpyObj('panelHolder',
                                                  ['pushFocusCtrl', 'popFocusCtrl',
                                                   'gotoBaseController', 'getFocusCtrl',
                                                   'getPrevCtrl']);

      // Apply options directly to the spy object
      Ext.apply(panel_holder_spy, options, {
         useStack: true,
         inSidePanel: false,
         inPopupPanel: false
      });

      return panel_holder_spy;
   },

   /**
    * Replace the given object for the duration of the test.
    *
    * Used for cases where we don't want to spy a function,
    * but want to replace an object/attribute.
    *
    * ex:
    *   it('should do this', function() {
    *      var temp_obj = new MyObj();
    *      replaceObj(p5.something, 'myObj', temp_obj);
    *      // test stuff
    *   });
    */
   replaceObj: function(namespace, objName, newObj) {
      var spec     = jasmine.getEnv().currentSpec,
          orig_obj = namespace[objName];
      namespace[objName] = newObj;
      spec.after(function() { namespace[objName] = orig_obj; });
   },

   // Howto:
   //
   // - Spy on a constructor
   //
   //

   // ----- Ajax Helpers ----- //
   /**
    * Return the number of pending ajax requests (readyState === 2)
    */
   numPendingAjaxRequests: function() {
      var count = 0;
      Ext.each(ajaxRequests, function(req) {
         if(2 === req.readyState) {
            count += 1;
         }
      });
      return count;
   },

   /**
    * Jasmine expectation to take one step in
    * the ajax chain based upon the current outstanding requests.
    * By default this will find the oldest pending request
    * that has not yet been handled and process that request.
    *
    * expectConfig: Object with details of what should have been sent.
    *    * url: <expected url> with full details. (will ignore missing components)
    *    * method: the method expected for the call.
    *    * params: {expected: 'val'}
    *    * headers: {expected: 'val'}
    *
    * response: Object with details of the response to provide when we return.
    *    * status: status value to return.  (default: 200)
    *    * responseText: text to put in the reaponse. (default: '')
    *    * headers: dictionary of headers to respond with.
    *    * contentType: The content type to respond with. (def: 'application/json')
    *    * jsonObj: If set, the responseText is set to the encoded version of this object.
    *
    * testFunc: If passed in, is executed on the current request after checking expectConfig.
    *
    */
   expectAjaxStep: function(expectConfig, response, testFunc) {
      var cur_req = null, //= mostRecentAjaxRequest(),
          split_url, ex_split,
          url_params, extra_params,
          resp_obj;

      // find the oldest request that is pending
      Ext.each(ajaxRequests, function(req) {
         if(2 === req.readyState) {
            cur_req = req;
            return false;
         }
      });
      if(null === cur_req) {
         throw new Error('Could not find pending AJAX request');
      }

      // Setup URL splits as needed
      if(cur_req.url)
      {
         split_url = urlparse.urlsplit(cur_req.url);
      }
      if(expectConfig.url) {
         ex_split = urlparse.urlsplit(expectConfig.url);
      }

      if(expectConfig) {
         if(expectConfig.url) {
            if(ex_split.hostname) {
               expect(split_url.hostname).toEqual(ex_split.hostname);
            }
            if(ex_split.path) {
               expect(split_url.path).toEqual(ex_split.path);
            }
            if(ex_split.port) {
               expect(split_url.port).toEqual(ex_split.port);
            }
            if(ex_split.scheme) {
               expect(split_url.scheme).toEqual(ex_split.scheme);
            }
         }

         // Check params one at a time
         if(expectConfig.params) {
            // params may be in cur_req.params if it was a POST
            url_params = Ext.apply({}, Ext.urlDecode(split_url.query));
            if(!Ext.isEmpty(cur_req.params)) {
               try {
                  extra_params = Ext.urlDecode(cur_req.params);
                  url_params = Ext.apply(url_params, extra_params);
               } catch(ex) {
                  // skip it
               }
            }

            Ext.iterate(expectConfig.params, function(k, v) {
               var val = (v ? String(v) : v);
               expect(url_params[k]).toEqual(val);
            });
         }

         if(expectConfig.method) {
            expect(cur_req.method).toEqual(expectConfig.method);
         }

         if(expectConfig.headers) {
            Ext.iterate(expectConfig.headers, function(k, v) {
               var val = (v ? String(v) : v),
                   val2 = cur_req.requestHeaders[k];
               val2 = (val2 ? String(val2) : val2);
               expect(val2).toEqual(val);
            });
         }
      }

      if(testFunc) {
         testFunc(cur_req);
      }

      resp_obj = Ext.apply({}, response,
                   {status: 200, contentType: 'application/json', responseText: ''});

      if(response) {
         if(response.jsonObj) {
            resp_obj.responseText = Ext.encode(response.jsonObj);
         }
         if(response.headers) {
            resp_obj.responseHeaders = response.headers;
         }
      }
      // trigger the response
      cur_req.response(resp_obj);
   },

   /**
   * Install spies and mocks for testing code that thinks it is running on phonegap.
   *
   * This will flip the p5.isPhoneGap flag as well to make sure code tries the phonegap path.
   *
   * Options:
   *   - hasCamera: true/false
   */
   installPhoneGap: function(opts) {
      var spec         = jasmine.getEnv().currentSpec,
          link_handler = {};

      // Install plugins.
      window.plugins              = window.plugins || {};
      window.plugins.Capabilities = window.plugins.Capabilities || {};
      window.device               = {};
      test.singlepage.installSinglePage();

      opts = Ext.apply({}, opts, {
         hasCamera: true
      });

      // Setup the mocks
      test.helpers.replaceObj(p5, 'isPhoneGap', true);
      test.helpers.replaceObj(window.plugins.Capabilities, 'hasCamera', opts.hasCamera);
      test.camera.installCamera();

      // Add a object and spy for the link handler. To use for testing you can
      // do something like the following:
      //    expect(window.plugins.linkHandler.openLink).toHaveBeenCalled();
      spec.spyOn(link_handler, "openLink", true);
      test.helpers.replaceObj(window.plugins, "linkHandler", link_handler);

      // Cleanup later.
      spec.after(function() {

      });
   }
};


// ------ JASMINE EXTENTIONS -------------- //
jasmine.Matchers.prototype.toBeEmpty = function() {
   return this.actual.length === 0;
};

jasmine.Matchers.prototype.toBeLength = function(expected) {
   return (this.actual.length === expected);
};

jasmine.Matchers.prototype.toBeInstanceOf = function(expected) {
   return (this.actual instanceof expected);
};

jasmine.Matchers.prototype.toEqualTime = function(expected) {
   return (this.actual.format('c') === expected.format('c'));
};

/**
 * createSpyClass
 *
 * Creates a spy/mock that hides the class and it's construction
 * so it will always return a mock that is under our control.
 *
 * This method will automatically replace the class in the given
 * namespace with a new spy-based class.  This will be registered
 * with an after call for the spec to reset it back to the original.
 *
 * @arg methods: A dictionary of class methods to include.  If values are null,
 *               then they will be a spy, if function, then it will call the fake.
 * @returns The spy object that is now covering the class.
 *
 * note: to override the behavior of specific methods,
 *       call the spy at class.prototype.method or include in the dictionary.
 * Ex:
 *
 *    klass = jasmine.createSpyClass(test, 'MyClass', {
 *       constructor: function() {
 *          this.initValue = 10;
 *       },
 *       doSomething: function() {
 *          this.blah = 10;
 *       }
 *    });
 *
 * TODO:
 *   - Extend to take method fakes as part of call.
 * see: http://groups.google.com/group/jasmine-js/browse_thread/thread/db6453000eb4566
 */
jasmine.createSpyClass = function(namespace, class_name, methods) {
   var fn = jasmine.createSpy(class_name),
       ctor_name = 'constructor',
       old_klass, cur_spec, i, meth,
       method_obj;

   // Backwards compatible with list of methods.
   if(Ext.isArray(methods)) {
      method_obj = {};
      Ext.each(methods, function(m) {
         method_obj[m] = null;
      });
      methods = method_obj;
   }

   // Add fake call through to constructor if we defined one.
   if(methods[ctor_name] !== Object) {
      fn.andCallFake(methods[ctor_name]);
      //delete methods[ctor_name];
   }

   // Build up all the fake methods.
   Ext.iterate(methods, function(k, v) {
      fn.prototype[k] = jasmine.createSpy(class_name + '.' + k);
      if(v !== null) {
         fn.prototype[k].andCallFake(v);
      }
   });

   // When the Class Constructor is reset, reset all prototype methods too
   fn._reset = fn.reset;
   fn.reset = function() {
      var i, meth;
      fn._reset();
      Ext.iterate(methods, function(k, v) {
         fn.prototype[k].reset();
      });
   };

   // Graft it onto the test area and restore it when
   // done with the current spec
   //spyOn(namespace, class_name).andReturn(fn);
   old_klass = namespace[class_name];
   namespace[class_name] = fn;
   cur_spec  = jasmine.getEnv().currentSpec;
   cur_spec.after(function() {
      namespace[class_name] = old_klass;
   });

   return fn;
};
