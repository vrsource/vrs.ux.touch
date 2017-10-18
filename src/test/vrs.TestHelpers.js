/** Helper methods and fixtures for tests. */
/*global mostRecentAjaxRequest: false, urlparse: false, ajaxRequests: false */

// Testing Howto:
//
// - Spy on a constructor
//
//  see jasmine.createSpyClass below.
//
Ext.ns('test');
Ext.ns('vrs');

/** Testing overrides. */
vrs.inTest = true;

test.helpers = test.helpers || {};

// --- Jasmine Grammar Overrides --- //
// Based upon names from jasmine-species
// config: {skip: true/false, only: true/false}
var desc_wrapper = function(prefix, config) {
   return function(desc, func) {
      if(config.skip) {
         return xdescribe(prefix + ': ' + desc, func);
      } else if(config.only) {
         return ddescribe(prefix + ': ' + desc, func);
      } else {
         return describe(prefix + ': ' + desc, func);
      }
   };
};

/** SUITES (describe) **/
_.each(['feature', 'story', 'component',
        'concern', 'context'], function(name) {
   prefix = name[0].toUpperCase() + name.slice(1);
   window[name]           = desc_wrapper(prefix, {});
   window['x' + name]     = desc_wrapper(prefix, {skip: true});
   window[name[0] + name] = desc_wrapper(prefix, {only: true});
});

/** SPECS (it) */
// config: {skip: true/false, only: true/false}
var it_wrapper = function(prefix, config) {
   return function(desc, func) {
      if(config.skip) {
         return xit(prefix + ': ' + desc, func);
      } else if(config.only) {
         return iit(prefix + ': ' + desc, func);
      } else {
         return it(prefix + ': ' + desc, func);
      }
   };
};

_.each(['scenario', 'spec'], function(name) {
   prefix = name[0].toUpperCase() + name.slice(1);
   window[name]           = it_wrapper(prefix, {});
   window['x' + name]     = it_wrapper(prefix, {skip: true});
   window[name[0] + name] = it_wrapper(prefix, {only: true});
});

var gw_func = function(desc, func) {
   return runs(func);
};

/** Steps (run) */
given = gw_func;
when  = gw_func;
then  = gw_func;
and   = gw_func;
but   = gw_func;

/**
 * IDEA: Consider using Ext.override to add these
 * as methods to jasmine.Spec so we can just call "this.blah()" locally in test.
 */
Ext.merge(test.helpers, {
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
                                                   'getPrevCtrl',
                                                   'getUseStack', 'getInSidePanel',
                                                   'getInPopupPanel']);

      // Apply options directly to the spy object
      options = Ext.apply({}, options, {
         useStack     : true,
         inSidePanel  : false,
         inPopupPanel : false
      });
      panel_holder_spy.getUseStack.andReturn(options.useStack);
      panel_holder_spy.getInSidePanel.andReturn(options.inSidePanel);
      panel_holder_spy.getInPopupPanel.andReturn(options.inPopupPanel);

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
    *      replaceObj(myApp.something, 'myObj', temp_obj);
    *      // test stuff
    *   });
    */
   replaceObj: function(namespace, objName, newObj) {
      var spec     = jasmine.getEnv().currentSpec,
          orig_obj = namespace[objName];
      namespace[objName] = newObj;
      spec.after(function() { namespace[objName] = orig_obj; });
   },

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
    *    * jsonData: <object>
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
      cur_req = _.find(ajaxRequests, {readyState: 2});
      if(!cur_req) {
         throw new Error('Could not find pending AJAX request');
      }
      else {
         _.remove(ajaxRequests, cur_req);
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

         if(expectConfig.jsonData) {
            json_data = Ext.decode(cur_req.params);
            expect(json_data).toEqual(expectConfig.jsonData);
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
   * This will flip the vrs.isPhoneGap flag as well to make sure code tries the phonegap path.
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
      test.helpers.replaceObj(vrs, 'isPhoneGap', true);
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
});


// ------ JASMINE EXTENTIONS -------------- //
vrs_custom_matchers = {
    toBeEmpty: function() {
        return {
            compare: function(actual) {
                return this.actual.length === 0;
            }
        };
    },

    toBeLength: function() {
        return {
            compare: function(actual, expected) {
                return (this.actual.length === expected);
            }
        };
    },

    toBeInstanceOf: function() {
        return {
            compare(actual, expected) {
                return (actual instanceof expected);
            }
        };
    },

    toEqualTime: function() {
        return {
            compare(actual, expected) {
                return (actual.format('c') === expected.format('c'));
            }
        }
    },
};

beforeEach(function() {
    jasmine.addMatchers(vrs_custom_matchers);
});

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
 *   - Extend to take method fakes as part of call. (See: createSpyObjEx)
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

   // Add sencha touch create method on
   // note: this may not be calling the constructor correctly.
   fn.create = function() {
      return new fn(arguments);
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

/**
 * Extends the jasmine.createSpyObj to take object of methods to override.
 *
 * @param {String} baseName name of spy class
 * @param methods: An object of object methods to include.  If values are null,
 *                 then they will have spy, if function, then spy that will call fake.
 * @return The new object with spies.
 */
jasmine.createSpyObjEx = function(baseName, methods) {
   var obj = {};

   // build up methods
   Ext.iterate(methods, function(k, v) {
      obj[k] = jasmine.createSpy(baseName + '.' + k);
      if(!Ext.isEmpty(v)) {
         obj[k].andCallFake(v);
      }
   });

   return obj;
};


// --- Dependencies --- //
// note: we keep them inline to make it easier to include this file
/*
 * Copyright (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * url processing in the spirit of python's urlparse module
 * see `pydoc urlparse` or
 * http://docs.python.org/library/urlparse.html
 *
 *  urlsplit: break apart a URL into components
 *  urlunsplit:  reconsistute a URL from componets
 *  urljoin: join an absolute and another URL
 *  urldefrag: remove the fragment from a URL
 *
 * Take a look at the tests in urlparse-test.html
 *
 * On URL Normalization:
 *
 * urlsplit only does minor normalization the components Only scheme
 * and hostname are lowercased urljoin does a bit more, normalizing
 * paths with "."  and "..".  It might be nice to have another
 * function that does full normalization
 *
 *   * removes default port numbers
 *     http://abc.com:80/ -> http://abc.com/, etc
 *   * normalizes path
 *     http://abc.com -> http://abc.com/
 *     and other "." and ".." cleanups
 *   * normalizes escaped hex values
 *     http://abc.com/%7efoo -> http://abc.com/%7Efoo
 *
 *
 * Differences with Python
 *
 * The javascript urlsplit returns a normal object with the following
 * properties: scheme, netloc, hostname, port, path, query, fragment.
 * All properties are read-write.
 *
 * In python, the resulting object is not a dict, but a specialized,
 * read-only, and has alternative tuple interface (e.g. obj[0] ==
 * obj.scheme).  It's not clear why such a simple function requires
 * a unique datastructure.
 *
 * urlunsplit in javascript takes an duck-typed object,
 *  { scheme: 'http', netloc: 'abc.com', ...}
 *  while in  * python it takes a list-like object.
 *  ['http', 'abc.com'... ]
 *
 * For all functions, the javascript version use
 * hostname+port if netloc is missing.  In python
 * hostname+port were always ignored.
 *
 * Similar functionality in different languages:
 *
 *   http://php.net/manual/en/function.parse-url.php
 *   returns assocative array but cannot handle relative URL
 *
 * TODO: test allowfragments more
 * TODO: test netloc missing, but hostname present
 */

var urlparse = {};
urlparse.urldefrag = function(url)
{
    var idx = url.indexOf('#');
    if (idx === -1) {
        return [ url, '' ];
    } else {
        return [ url.substr(0,idx), url.substr(idx+1) ];
    }
};

urlparse.urlsplit = function(url, default_scheme, allow_fragments)
{
    if (typeof allow_fragments === 'undefined') {
        allow_fragments = true;
    }

    // scheme (optional), host, port
    var fullurl = /^([A-Za-z]+)?(:?\/\/)([0-9.\-A-Za-z]*)(?::(\d+))?(.*)$/;
    // path, query, fragment
    var parse_leftovers = /([^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;

    var o = {};
    var leftover;

    var parts = url.match(fullurl);
    if (parts) {
        o.scheme = parts[1] || default_scheme || '';
        o.hostname = parts[3].toLowerCase() || '';
        o.port = parseInt(parts[4],10) || '';
        // Probably should grab the netloc from regexp
        //  and then parse again for hostname/port

        o.netloc = parts[3];
        if (parts[4]) {
            o.netloc += ':' + parts[4];
        }

        leftover = parts[5];
    } else {
        o.scheme = default_scheme || '';
        o.netloc = '';
        o.hostname = '';
        leftover = url;
    }
    o.scheme = o.scheme.toLowerCase();

    parts = leftover.match(parse_leftovers);

    o.path =  parts[1];
    o.query = parts[2] || '';

    if (allow_fragments) {
        o.fragment = parts[3] || '';
    } else {
        o.fragment = '';
    }

    return o;
};

urlparse.urlunsplit = function(o) {
    var s = '';
    if (o.scheme) {
        s += o.scheme + '://';
    }

    if (o.netloc) {
        if (s === '') {
            s += '//';
        }
        s +=  o.netloc;
    } else if (o.hostname) {
        // extension.  Python only uses netloc
        if (s === '') {
            s += '//';
        }
        s += o.hostname;
        if (o.port) {
            s += ':' + o.port;
        }
    }

    if (o.path) {
        s += o.path;
    }

    if (o.query) {
        s += '?' + o.query;
    }
    if (o.fragment) {
        s += '#' + o.fragment;
    }
    return s;
};

urlparse.urljoin = function(base, url, allow_fragments)
{
    if (typeof allow_fragments === 'undefined') {
        allow_fragments = true;
    }

    var url_parts = urlparse.urlsplit(url);

    // if url parts has a scheme (i.e. absolute)
    // then nothing to do
    if (url_parts.scheme) {
        if (! allow_fragments) {
            return url;
        } else {
            return urlparse.urldefrag(url)[0];
        }
    }
    var base_parts = urlparse.urlsplit(base);


    // copy base, only if not present
    if (!base_parts.scheme) {
        base_parts.scheme = url_parts.scheme;
    }

    // copy netloc, only if not present
    if (!base_parts.netloc || !base_parts.hostname) {
        base_parts.netloc = url_parts.netloc;
        base_parts.hostname = url_parts.hostname;
        base_parts.port = url_parts.port;
    }

    // paths
    if (url_parts.path.length > 0) {
        if (url_parts.path.charAt(0) === '/') {
            base_parts.path = url_parts.path;
        } else {
            // relative path.. get rid of "current filename" and
            //   replace.  Same as var parts =
            //   base_parts.path.split('/'); parts[parts.length-1] =
            //   url_parts.path; base_parts.path = parts.join('/');
            var idx = base_parts.path.lastIndexOf('/');
            if (idx === -1) {
                base_parts.path = url_parts.path;
            } else {
                base_parts.path = base_parts.path.substr(0,idx) + '/' +
                    url_parts.path;
            }
        }
    }

    //
    // NORMALIZE PATH with "../" and "./"
    //   http://en.wikipedia.org/wiki/URL_normalization
    //   http://tools.ietf.org/html/rfc3986#section-5.2.3
    var parts = base_parts.path.split('/');

    var newparts = [];
    // make sure path always starts with '/'
    if (parts[0] !== '') {
        newparts.push('');
    }

    for (var i = 0; i < parts.length; ++i) {
        if (parts[i] === '..') {
            if (newparts.length > 1) {
                newparts.pop();
            } else {
                newparts.push(parts[i]);
            }
        } else if (parts[i] !== '.') {
            newparts.push(parts[i]);
        }
    }

    base_parts.path = newparts.join('/');

    // copy query string
    base_parts.query = url_parts.query;

    // copy fragments
    if (allow_fragments) {
        base_parts.fragment = url_parts.fragment;
    } else {
        base_parts.fragment = '';
    }

    return urlparse.urlunsplit(base_parts);
};
