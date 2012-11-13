// To add
//

// Helper classes
test.AClass = Ext.extend(Object, {
   constructor: function() {
      this.setMe = true;
   },

   doSomething: function() {
      this.didSomething = true;
   }
});

component('vrs.TestHalpers', function() {
   feature('toBeEmpty', function() {
      it('should pass when empty', function() {
         var empty_list = [];
         expect(empty_list).toBeEmpty();
      });
      it('should fail when list not empty', function() {
         var full_list = [1,2,3];
         expect(full_list).not.toBeEmpty();
      });
   });

   feature('toBeLength', function() {
      it('should work with empty', function() {
         var list = [];
         expect(list).toBeLength(0);
      });
      it('should work with elements', function() {
         var list = [1,2,3];
         expect(list).toBeLength(3);
      });
   });

   feature('replaceObj', function() {
      it('setup variable', function() {
         test.replaceVar = {value: 10};
      });
      it('should be set', function() {
         expect(test.replaceVar.value).toEqual(10);
      });
      it('should be replacable', function() {
         var temp_obj = {value: 20};
         test.helpers.replaceObj(test, 'replaceVar', temp_obj);
         expect(test.replaceVar.value).toEqual(20);
      });
      it('should go back to original value', function() {
         expect(test.replaceVar.value).toEqual(10);
      });
   });

   // --- createSpyClass ---- //
   feature('createSpyClass', function() {

      it('should mock the object construction', function() {
         jasmine.createSpyClass(test, 'AClass', ['doSomething']);
         var test_obj = new test.AClass();
         test_obj.doSomething();
         expect(test_obj.setMe).toBeUndefined();
         expect(test_obj.doSomething).toHaveBeenCalled();
      });

      it('should mock calls to methods', function() {
         jasmine.createSpyClass(test, 'AClass', ['doSomething']);
         test.AClass.prototype.doSomething.andCallFake(function() {
            this.faked = true;
         });

         var test_obj = new test.AClass();
         expect(test_obj.setMe).toBeUndefined();
         test_obj.doSomething();
         expect(test_obj.faked).toEqual(true);
      });

      it('should be instance of a class we can check', function() {
         jasmine.createSpyClass(test, 'AClass', ['doSomething']);
         var test_obj = new test.AClass();
         expect(test_obj).toEqual(jasmine.any(test.AClass));
      });

      it('should reset all prototypes along with constructor', function() {
         jasmine.createSpyClass(test, 'AClass', ['doSomething']);

         // first round
         var test_obj = new test.AClass();
         test_obj.doSomething();
         expect(test.AClass).toHaveBeenCalled();
         expect(test_obj.doSomething).toHaveBeenCalled();

         // reset
         test.AClass.reset();
         expect(test.AClass).not.toHaveBeenCalled();
         expect(test_obj.doSomething).not.toHaveBeenCalled();

         // second round
         test_obj = new test.AClass();
         test_obj.doSomething();
         expect(test.AClass).toHaveBeenCalled();
         expect(test_obj.doSomething).toHaveBeenCalled();
      });

      it('should call normal class when no spy', function() {
         var test_obj = new test.AClass();
         expect(test_obj.setMe).toEqual(true);
         test_obj.doSomething();
         expect(test_obj.didSomething).toEqual(true);
      });

   });

   // --- AJAX HELPERS -- //
   feature('Ajax Test Helpers', function() {
      var resp, response_cb,
          expectAjaxStep = test.helpers.expectAjaxStep;

      /** Callback to store the response. */
      response_cb = function(opts, success_val, response_val) {
         resp.opts     = opts;
         resp.success  = success_val;
         resp.response = response_val;
      };

      beforeEach(function() {
         resp = {};
      });

      it('should support testing url passed in', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'GET', callback: response_cb});
         expectAjaxStep({url: '/my_url'});
         expect(resp.success).toEqual(true);
         expect(resp.response.status).toEqual(200);
      });

      it('should support testing valid params passed to request (POST)', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'POST',
                           params: {p1: '10', p2: 20}, callback: response_cb});
         expectAjaxStep({params: {p1: '10', p2: '20'}});
         expect(resp.success).toEqual(true);
      });

      it('should support testing valid params passed to request (GET)', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'GET',
                           params: {p1: '10', p2: 20}, callback: response_cb});
         expectAjaxStep({params: {p1: '10', p2: '20'}});
         expect(resp.success).toEqual(true);
      });

      it('should support testing valid method passed in', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'PUT', callback: response_cb});
         expectAjaxStep({method: 'PUT'});
         expect(resp.success).toEqual(true);
      });

      it('should support testing valid headers passed in', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'GET',
                            headers: {h1: 'val1', h2: 20}, callback: response_cb});
         expectAjaxStep({headers: {h1: 'val1', h2: '20'}});
      });

      it('should support providing response text', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'GET', callback: response_cb});
         expectAjaxStep({url: '/my_url'}, {responseText: 'hello'});
         expect(resp.response.responseText).toEqual('hello');
      });

      it('should support providing response json object', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'GET', callback: response_cb});
         var json_obj = {var1: 'val'},
             resp_obj;
         expectAjaxStep({url: '/my_url'}, {jsonObj: json_obj});
         resp_obj = Ext.decode(resp.response.responseText);
         expect(resp_obj.var1).toEqual(json_obj.var1);
      });

      it('should support providing response headers', function() {
         Ext.Ajax.request({ url: '/my_url', method: 'GET', callback: response_cb});
         expectAjaxStep({url: '/my_url'}, {headers: {h1: 'val'}});
         expect(resp.response.getAllResponseHeaders().h1).toEqual('val');
      });

      it('should throw exception if no request is pending', function() {
         expect(function() { expectAjaxStep(); }).toThrow('Could not find pending AJAX request');
      });
   });
});

