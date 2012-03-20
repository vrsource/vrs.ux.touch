/** Spec for the main app class. */

/** Test classes */
test.ExtPanel1 = Ext.extend(vrs.PanelController, {
   constructor: function(config) {
      test.ExtPanel1.superclass.constructor.call(this, config);
   },
   getPanel: function() {
      if(Ext.isEmpty(this._panel))
      { this.setPanel(new Ext.Panel({}));}
      return this._panel;
   }
});

test.ExtPanel2 = Ext.extend(vrs.PanelController, {
   constructor: function(config) {
      test.ExtPanel2.superclass.constructor.call(this, config);
   },
   getPanel: function() {
      if(Ext.isEmpty(this._panel))
      { this.setPanel(new Ext.Panel({}));}
      return this._panel;
   }
});


Ext.define('test.ViewPanel1', {
   extend : 'Ext.Panel',
   xtype  : 'test_viewpanel1',

   config: {
      cls: 'view_panel',

      items: [
         {
            docked : 'top',
            xtype  : 'toolbar',
            title  : 'App',
            itemId : 'top_bar'
         },
         {
            itemId : 'panel_content',
            xtype  : 'panel',
            cls    : 'stuff_area',
            html   : 'Stuff Here'
         }
      ]
   }
});

Ext.define('test.ViewPanel2', {
   extend : 'Ext.Panel',
   xtype  : 'test_viewpanel2',

   config: {
      cls: 'view_panel',
      layout: 'vbox',

      items: [
         {
            xtype : 'panel',
            cls   : 'stuff_area',
            html  : 'Stuff Here'
         },
         {
            xtype : 'panel',
            cls   : 'stuff_area2',
            html  : 'Stuff Here'
         }
      ]
   }
});

/**
* Panel that registers events.
*/
test.EventPanel = Ext.extend(vrs.PanelController, {
   constructor: function(config) {
      test.EventPanel.superclass.constructor.call(this, config);

      // Add a normal event
      this.on('direct_event', function() { console.log('event'); });
   }
});

test.EventSubPanel = Ext.extend(vrs.SubPanelController, {
   constructor: function(config) {
      test.EventSubPanel.superclass.constructor.call(this, config);

      // Add a normal event
      this.on('direct_event', function() { console.log('event'); });
   }
});


// ---- PANEL CONTROLLER --- //
component('PanelController', function() {
   it('Should construct correctly', function() {
      var obj;

      // given: an object constructed with a config object
      obj = new vrs.PanelController({panelHolder: {}, backName: 'myname'});

      // then: configured property should be set
      expect(obj.getBackName()).toEqual('myname');

      // and: default panel is null
      expect(obj.getPanel()).toEqual(null);
   });

   feature('panel initialization', function() {

      it('should support initialization with object', function() {
         var panel_obj = test.ViewPanel1.create(),
             obj;
         // given: an object constructed with a panel object
         obj = vrs.PanelController.create({
            panelHolder: {},
            panel: panel_obj
         });
         // then: should have stored it
         expect(obj.getPanel()).toEqual(panel_obj);
      });

      it('should support initialization from xtype', function() {
         // given: an object constructed with a panel xtype
         var obj = vrs.PanelController.create({
            panelHolder: {},
            panel: { xtype: 'test_viewpanel1' }
         });
         // then: Should have created panel object
         expect(obj.getPanel()).not.toEqual(null);
      });

      it('should support initialization from config', function() {
         // given: an object constructed with a panel xtype
         var obj = vrs.PanelController.create({
            panelHolder: {},
            panel: {
               xtype: 'test_viewpanel1',
               ui: 'test_ui'
            }
         });
         // then: Should have created panel object
         expect(obj.getPanel()).not.toEqual(null);
         expect(obj.getPanel().getUi()).toEqual('test_ui');
      });
   });

   feature('Ref Initialization', function() {
      it('Should support ref initialization for panel', function() {
         // given: ctrl constructed with a panel
         var obj = vrs.PanelController.create({
            panelHolder: {},
            panel: {
               xtype: 'test_viewpanel1',
            },
            refs: {
               topBar   : '.toolbar',
               contents : '#panel_content'
            }
         });

         // then: should have setup the refs
         expect(obj.getTopBar().getTitle().getTitle()).toEqual('App');
         expect(obj.getContents().getHtml()).toEqual('Stuff Here');
      });
   });


   it('Should require panelHolder to be set', function() {
      // If panel holder is not set, it should throw an assertion exception.
      expect(function() {
         var obj = new vrs.PanelController({});
      }).toThrow();
   });

   it('should destroy the panel when the control is deactivated', function() {
      var obj = new vrs.PanelController({panelHolder: {}}),
          panel_spy = jasmine.createSpyObj('panel', ['destroy']);
      spyOn(obj, 'getPanel').andReturn(panel_spy);

      obj.destroy();
      //expect(obj.getPanel).toHaveBeenCalled();
      expect(panel_spy.destroy.callCount).toEqual(1);
   });

   it('should disconnect all listeners when destroyed', function() {
      // given: a panel with registered events
      var obj = new test.EventPanel({ panelHolder: test.helpers.createPanelHolderSpy()});
      expect(obj.hasListener('direct_event')).toEqual(true);

      // when: destroy the panel
      obj.destroy();

      // then: should not have the events registered any more
      expect(obj.hasListener('direct_event')).toEqual(false);
   });
});

component('SubPanelController', function() {

   it('should disconnect all listeners when destroyed', function() {
      // given: a panel with registered events
      var obj = new test.EventSubPanel();
      expect(obj.hasListener('direct_event')).toEqual(true);

      // when: destroy the panel
      obj.destroy();

      // then: should not have the events registered any more
      expect(obj.hasListener('direct_event')).toEqual(false);
   });
});


component('Panel Holder', function() {
   var panel_holder = null,
       base_ctrl, ctrl1, ctrl2, ctrl3;

   feature('base controller support', function() {
      beforeEach(function() {
         panel_holder = new vrs.PanelHolder({
            animConfig: false
         });
      });
      afterEach(function() {
         if(null !== panel_holder) {
            panel_holder.destroy();
         }
      });

      it('should allow setting base controller to setup initial controller', function() {
         // given: holder with no base controller set

         // when: set a base controller
         base_ctrl = new test.ExtPanel1({
            panelHolder: panel_holder,
            isBaseController: true
         });
         panel_holder.setBaseController(base_ctrl);
         //panel_holder.render(Ext.getBody());

         // then: base controller should be held
         expect(panel_holder.getBaseController()).toBe(base_ctrl);
         expect(base_ctrl.getPanelHolder()).toBe(panel_holder);

         // and: panel should have been added to the holder
         expect(panel_holder.items.get(0)).toBe(base_ctrl.getPanel());
      });

      it('should require that base controller is marked as base controller', function() {
         // given: panel holder
         panel_holder = new vrs.PanelHolder({
            animConfig: false
         });

         // when: set with a controller not marked base, it should throw
         expect(function() {
            panel_holder.setBaseController(new test.ExtPanel1({panelHolder: panel_holder}));
         }).toThrow();
      });

      it('should deactivate the base controller upon destruction', function() {
         // given holder with no base controller
         base_ctrl = new test.ExtPanel1({
            panelHolder: panel_holder,
            isBaseController: true
         });
         spyOn(base_ctrl, 'destroy').andCallThrough();
         panel_holder.setBaseController(base_ctrl);
         //panel_holder.render(Ext.getBody());

         // when: destroy the holder
         panel_holder.destroy();
         panel_holder = null;

         // then: should have called the destruction method on base controller
         expect(base_ctrl.destroy).toEqual(Ext.emptyFn);
      });
   });


   feature('stack support', function() {
      beforeEach(function() {
         panel_holder = new vrs.PanelHolder({
            animConfig: false
         });

         base_ctrl = new test.ExtPanel1({
            panelHolder: panel_holder,
            isBaseController: true
         });
         ctrl1 = new test.ExtPanel1({panelHolder: panel_holder});
         ctrl2 = new test.ExtPanel2({panelHolder: panel_holder});
         ctrl3 = new test.ExtPanel2({panelHolder: panel_holder});

         spyOn(ctrl1, 'destroy').andCallThrough();
         spyOn(ctrl2, 'destroy').andCallThrough();
         spyOn(ctrl3, 'destroy').andCallThrough();
         spyOn(base_ctrl, 'destroy').andCallThrough();

         panel_holder.setBaseController(base_ctrl);
         //panel_holder.render(Ext.getBody());
         this.after(function() {
            if(null !== panel_holder) {
               panel_holder.destroy();
            }
         });
      });

      it('should start with empty stack', function() {
         expect(panel_holder._ctrlStack).toBeEmpty();
         expect(panel_holder.getFocusCtrl()).toEqual(base_ctrl);
      });

      story('pushing panel into focus', function() {
         it('should set that as focus panel and expand the stack', function() {
            panel_holder.pushFocusCtrl(ctrl1);
            expect(panel_holder._ctrlStack).toBeLength(1);
            expect(panel_holder.getFocusCtrl()).toBe(ctrl1);
            expect(panel_holder.getActiveItem()).toBe(ctrl1.getPanel());
         });
      });

      story('popping a panel', function() {
         it('should remove from the stack and go back to previous', function() {
            // given: panel holder with 2 controllers on it
            panel_holder.pushFocusCtrl(ctrl1);
            panel_holder.pushFocusCtrl(ctrl2);
            expect(panel_holder._ctrlStack).toBeLength(2);
            expect(panel_holder.getFocusCtrl()).toBe(ctrl2);
            expect(panel_holder.getActiveItem()).toBe(ctrl2.getPanel());

            // when: pop off controller, it should be removed and deactivated.
            panel_holder.popFocusCtrl();
            expect(panel_holder._ctrlStack).toBeLength(1);
            expect(panel_holder.getFocusCtrl()).toBe(ctrl1);
            expect(panel_holder.getActiveItem()).toBe(ctrl1.getPanel());
            expect(ctrl2.destroy).toEqual(Ext.emptyFn);

            // when: pop off controller, it should be removed and deactivated
            panel_holder.popFocusCtrl();
            expect(panel_holder._ctrlStack).toBeLength(0);
            expect(panel_holder.getFocusCtrl()).toEqual(base_ctrl);
            expect(panel_holder.getActiveItem()).toBe(base_ctrl.getPanel());
            expect(ctrl1.destroy).toEqual(Ext.emptyFn);
         });

         it('should set to main if too many are popped', function() {
            // given: panel holder with just base controller
            expect(panel_holder._ctrlStack).toBeLength(0);
            expect(panel_holder.getActiveItem()).toBe(base_ctrl.getPanel());

            // when: attempt to pop, should not do anything
            panel_holder.popFocusCtrl();
            expect(panel_holder._ctrlStack).toBeLength(0);
            expect(panel_holder.getActiveItem()).toBe(base_ctrl.getPanel());
         });
      });

      story('replacing a panel', function() {
         it('should remove the current panel and replace it with the new panel', function() {
            // Given: Stack setup with 2 controls
            panel_holder.pushFocusCtrl(ctrl1);
            panel_holder.pushFocusCtrl(ctrl2);
            expect(panel_holder._ctrlStack).toBeLength(2);
            expect(panel_holder.getFocusCtrl()).toBe(ctrl2);
            expect(panel_holder.getActiveItem()).toBe(ctrl2.getPanel());

            // when: replace with a third
            panel_holder.replaceFocusCtrl(ctrl3);

            // then: should still be length 2 and the new one should be on stack
            expect(panel_holder._ctrlStack).toBeLength(2);
            expect(panel_holder.getFocusCtrl()).toBe(ctrl3);
            expect(panel_holder.getActiveItem()).toBe(ctrl3.getPanel());
            expect(ctrl2.destroy).toEqual(Ext.emptyFn);
         });
      });

      story('gotoBaseController is called', function() {
         it('should clear the stack and set back to base controller', function() {
            // given: controller stack with 3 controllers on it
            panel_holder.pushFocusCtrl(ctrl1);
            panel_holder.pushFocusCtrl(ctrl2);
            panel_holder.pushFocusCtrl(ctrl3);
            expect(panel_holder._ctrlStack).toBeLength(3);

            // when: pop to go to back controller
            panel_holder.gotoBaseController();

            // then: should be empty and should have destroyed all stck controllers
            expect(panel_holder._ctrlStack).toBeEmpty();
            expect(panel_holder.getActiveItem()).toBe(base_ctrl.getPanel());
            // todo: fix this and figure out how the ones below seem to work.
            expect(ctrl1.destroy).toEqual(Ext.emptyFn);
            expect(ctrl2.destroy).toEqual(Ext.emptyFn);
            expect(ctrl3.destroy).toEqual(Ext.emptyFn);
         });
      });

      story('destruction', function() {
         it('should call deactivate on all ctrls in stack', function() {
            // given: stack with 3 controllers
            panel_holder.pushFocusCtrl(ctrl1);
            panel_holder.pushFocusCtrl(ctrl2);
            panel_holder.pushFocusCtrl(ctrl3);

            // when: we destroy the holder
            panel_holder.destroy();
            panel_holder = null;

            // then: it should have called deactivate on all of them including base controller
            expect(ctrl1.destroy).toEqual(Ext.emptyFn);
            expect(ctrl2.destroy).toEqual(Ext.emptyFn);
            expect(ctrl3.destroy).toEqual(Ext.emptyFn);
            expect(base_ctrl.destroy).toEqual(Ext.emptyFn);
         });
      });
   });

});