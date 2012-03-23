/*global simfla: false */

/*
component('Toggling Button', function() {
   var button, toggleHandler, normalHandler;

   // Create a button with given opts.
   //Sets some defaults for common usage but can override with opts.
   function createButton(opts) {
      toggleHandler = jasmine.createSpy();
      normalHandler = jasmine.createSpy();

      button = new vrs.TogglingButton(Ext.apply({}, opts, {
                                       handler: normalHandler,
                                       toggleHandler: toggleHandler
                                    }) );
      button.render(Ext.getBody());
   }

   afterEach(function() {
      if(button) {
         button.destroy();
      }
   });

   it('should call the toggleHandler with the new state', function() {
      // given: button with handlers
      createButton();
      expect(button.toggled).toEqual(false);

      // when: called first time, should toggle on
      button.callHandler(null);
      expect(toggleHandler).toHaveBeenCalledWith(true, button, null);
      expect(normalHandler).toHaveBeenCalledWith(button, null);
      expect(button.toggled).toEqual(true);

      // and when: called second time, should toggle off
      button.callHandler(null);
      expect(toggleHandler).toHaveBeenCalledWith(false, button, null);
      expect(normalHandler).toHaveBeenCalledWith(button, null);
      expect(button.toggled).toEqual(false);
   });

   it('should allow starting in toggled state', function() {
      // given: button started in toggled state
      createButton({ toggled: true, text: 'bad', toggledText: 'good' });

      // then: should have UI set for starting in toggled.
      expect(button.toggled).toEqual(true);
      expect(button.text).toEqual('good');

      // when: tapped first time, should flip to false
      button.callHandler(null);
      expect(toggleHandler).toHaveBeenCalledWith(false, button, null);
   });

   feature('toggling button settings', function() {
      it('should support toggling iconcls', function() {
         createButton({ iconCls: 'base', toggledIconCls: 'tog' });

         expect(button.iconCls).toEqual('base');
         button.callHandler(null);
         expect(button.iconCls).toEqual('tog');
         button.callHandler(null);
         expect(button.iconCls).toEqual('base');
      });

      it('should support toggling button text', function() {
         createButton({ text: 'base', toggledText: 'tog' });

         expect(button.text).toEqual('base');
         button.callHandler(null);
         expect(button.text).toEqual('tog');
         button.callHandler(null);
         expect(button.text).toEqual('base');
      });

      it('should support toggling icon', function() {
         createButton({ icon: 'base', toggledIcon: 'tog' });

         expect(button.icon).toEqual('base');
         button.callHandler(null);
         expect(button.icon).toEqual('tog');
         button.callHandler(null);
         expect(button.icon).toEqual('base');
      });

      it('should support toggling ui', function() {
         createButton({ ui: 'base', toggledUi: 'tog' });

         expect(button.ui).toEqual('base');
         button.callHandler(null);
         expect(button.ui).toEqual('tog');
         button.callHandler(null);
         expect(button.ui).toEqual('base');
      });
   }); // toggling button settings.
}); // Toggling button
*/


/*
component('Link Button', function() {
   var button;

   afterEach(function() {
      if(button) {
         button.destroy();
      }
   });

   it('should not get in inifinite loop when url set multiple times', function() {
      // See bug: #19
      var link_spy, link_elt;

      // given: button with url
      button = new Ext.Button({
         linkId  : 'my_link',
         url     : '#bogus',
         text    : 'Test Button',
         plugins : [ new simfla.ux.plugins.linkButton() ]
      });
      button.render(Ext.getBody());

      // when: set the url multiple times
      button.setUrl('#bogus2');
      button.setUrl('#bogus3');

      // then: can still click on it to have it open that
      link_spy = jasmine.createSpy();
      link_elt = Ext.get('my_link');
      link_elt.on('click', link_spy, this, { stopEvent: true,
                                             preventDefault: true,
                                             stopPropagation: true });
      button.callHandler(null);

      expect(link_spy).toHaveBeenCalled();
   });
});
*/


// ----- NUMERIC ONLY FIELD -------- //
/*
component('Numeric Only Field', function() {
   var field;

   afterEach(function() {
      if(field) {
         field.destroy();
      }
   });

   //story('numbers only', function() {
   //   summary('As a user, I only want it to accept numbers as input.', function() {
   //   });
   //
   //   scenario('numbers and letters lead to only numbers', function() {
   //   });
   //});

   story('ensure valid range', function() {
      summary('As a user, I want the value to stay in the valid range');

      beforeEach(function() {
         field = new Ext.form.Number({
            name: 'test number',
            minValue : 1,
            value    : 50,
            maxValue : 100,
            plugins: ['numericonlyfield']
         });
         field.render(Ext.getBody());
         field.onFocus();   // Saves the value and starts editing
      });

      scenario('outside min', function() {
         // given: field with valid ranges and value of 50
         // when: set the value to 0
         field.setValue(0);
         field.onBlur();
         // then: value should limit to 1
         expect(field.getValue()).toEqual("1");
      });

      scenario('outside max', function() {
         // given: field with valid ranges and value of 50
         // when: set the value to 0
         field.setValue(200);
         field.onBlur();
         // then: value should limit to 100
         expect(field.getValue()).toEqual("100");
      });

      scenario('non-numeric handled', function() {
         // given: field with valid ranges and value of 50
         // when: set the value to a string handles exception
         field.setValue('abc');
         field.onBlur();
      });
   });
});
*/

/*
component('Requesting Input, vrs.requestFormData', function() {
      var done = false,
          form = null,
          form_opts = {
             fn: function(results) {
                if(results){
                   done = results;
                }
             },
             items: [
                {
                   xtype: 'textfield',
                   name : 'name',
                   label: 'Title',
                   placeHolder: 'title for new note',
                   required: true
                }
             ]
          };

   beforeEach(function () {
      done = null;
   });

   afterEach(function() {
      if (form) {
         form.hide();
      }
   });

   function submitForm() {
      form.confirm_button.handler();
   }

   scenario('If the user fails to enter the required fields errors are shown', function() {
      // GIVEN we ask the user for data
      form = vrs.requestFormData(form_opts);
      // AND the user fails to supply it

      // WHEN they try to submit the form
      submitForm();
      waitsFor(function() {
         return form.element.dom && form.el.hasCls('form-invalid');
      });

      // THEN the error is shown
      runs(function() {
         expect(Ext.select('.field-invalid').elements.length).toEqual(1);
      });
      // AND the form did not close
      runs(function() {
         expect(form.isVisible()).toEqual(true);
      });
   });

   scenario('filled out form gives caller the values.', function() {
      // GIVEN we ask the user for data
      form = vrs.requestFormData(form_opts);

      // AND the user supplies the info
      form.getFields().name.setValue('new name');

      // WHEN they try to submit the form
      submitForm();
      waitsFor(function() {
         return done !== null;
      });

      // THEN no errors are shown
      runs(function() {
         expect(Ext.select('.field-invalid').elements.length).toEqual(0);
      });
      // AND the new value is returned
      runs(function() {
         expect(done.name).toEqual('new name');
      });
      // AND the form closes
      runs(function() {
         expect(form.isVisible()).toEqual(false);
      });
   });
});
*/