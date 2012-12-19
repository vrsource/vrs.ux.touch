/*jshint unused:false*/
/** Spec for the main controller classes. */

/** Test classes */
Ext.define('test.ExtPanel1', {
   extend : 'vrs.StackPanelController',
   config: {
      panel: 'panel'
   }
});

Ext.define('test.ExtPanel2', {
   extend : 'vrs.StackPanelController',
   config: {
      panel: 'panel'
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
            itemId : 'top_bar',
            items: [{
               xtype  : 'button',
               itemId : 'back_button',
               text   : 'Back'
            }]
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

Ext.define('test.Panel1Controller', {
   extend: 'vrs.StackPanelController',

   constructor: function() {
      this.callParent(arguments);
      this.callCount = 0;
   },

   callback: function() {
      this.callCount += 1;
   }
});

// Helpers for testing component replacement
Ext.define('test.BtnReplacePanel', {
   extend : 'Ext.Panel',
   xtype  : 'test_btnreplacepanel',

   config: {
      layout : 'vbox',
      items: [
         {
            xtype : 'toolbar',
            docked: 'top',
            title : 'Panel 1',
            items : [
               { xtype: 'button', itemId: 'backBtn' },
               { xtype: 'spacer' },
               { xtype: 'button', itemId: 'homeBtn' }
            ]
         },
         {
            xtype : 'panel',
            html  : 'Stuff Here'
         }
      ]
   }
});


Ext.define('test.ToolbarReplacePanel', {
   extend : 'Ext.Panel',
   xtype  : 'test_toolbarreplacepanel',

   config: {
      layout : 'vbox',
      items: [
         {
            xtype: 'toolbar',
            itemId: 'navToolbar',
            docked  : 'top',
            title   : 'Title'
         },
         {
            xtype : 'panel',
            html  : 'Stuff Here'
         }
      ]
   }
});


/**
* Panel that registers events.
*/
test.EventPanel = Ext.extend(vrs.StackPanelController, {
   constructor: function(config) {
      test.EventPanel.superclass.constructor.call(this, config);

      // Add a normal event
      this.on('direct_event', function() { console.log('event'); });
   }
});


// ---- PANEL CONTROLLER --- //
component('PanelController', function() {
   it('Should construct correctly', function() {
      var obj;

      // given: an object constructed with a config object
      obj = new vrs.StackPanelController({panelHolder: {}, backName: 'myname'});

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
         obj = vrs.StackPanelController.create({
            panelHolder: {},
            panel: panel_obj
         });
         // then: should have stored it
         expect(obj.getPanel()).toEqual(panel_obj);
      });

      it('should support initialization from xtype', function() {
         // given: an object constructed with a panel xtype
         var obj = vrs.StackPanelController.create({
            panelHolder: {},
            panel: { xtype: 'test_viewpanel1' }
         });
         // then: Should have created panel object
         expect(obj.getPanel()).not.toEqual(null);
      });

      it('should support initialization from config', function() {
         // given: an object constructed with a panel xtype
         var obj = vrs.StackPanelController.create({
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
         var obj = vrs.StackPanelController.create({
            panelHolder: {},
            panel: {
               xtype: 'test_viewpanel1'
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

   feature('Control initialization', function() {
      it('should allow adding selectors based upon refs', function() {
         // given: ctrl constructed with controll callback based upon refs
         var obj = test.Panel1Controller.create({
            panelHolder: {},
            panel: 'test_viewpanel1',
            refs: {
               backBtn : '#back_button'
            },
            control: {
               backBtn: {
                  tap: 'callback'
               }
            }
         });
         expect(obj.callCount).toEqual(0);

         // when: trigger button
         obj.getBackBtn().onTap();

         // then: should have called
         expect(obj.callCount).toEqual(1);
      });

      it('should allow adding listeners based upon selectors', function() {
         // given: ctrl constructed with controll callback based upon refs
         var obj = test.Panel1Controller.create({
            panelHolder: {},
            panel: 'test_viewpanel1',
            refs: {
               backBtn : '#back_button'
            },
            control: {
               '#back_button': {
                  tap: 'callback'
               }
            }
         });
         expect(obj.callCount).toEqual(0);

         // when: trigger button
         obj.getBackBtn().onTap();

         // then: should have called
         expect(obj.callCount).toEqual(1);
      });
   });

   feature('Component replacement', function() {

      it('should allow replacement of back and home buttons', function() {
         // given: ctrl contructed with a panel with button placeholders
         var obj = vrs.StackPanelController.create({
            panelHolder: test.helpers.createPanelHolderSpy(),
            panel: 'test_btnreplacepanel',
            refs: {
               backBtn: '#backBtn',
               homeBtn: '#homeBtn'
            }
         });
         expect(obj.getBackBtn().getText()).toEqual('Back');

         // when: hit back button
         obj.getBackBtn().onTap();

         // then: should have popped controller
         expect(obj.getPanelHolder().popFocusCtrl).toHaveBeenCalled();

         // when: tap home button
         obj.getHomeBtn().onTap();

         // then: should pop to home
         expect(obj.getPanelHolder().gotoBaseController).toHaveBeenCalled();
      });

      it('should allow replacement of nav toolbar', function() {
         // given: ctrl contructed with a panel with button placeholders
         var obj = vrs.StackPanelController.create({
            panelHolder: test.helpers.createPanelHolderSpy(),
            panel: 'test_toolbarreplacepanel',
            refs: {
               backBtn: '#backBtn',
               homeBtn: '#homeBtn',
               navToolbar: '#navToolbar'
            }
         });
         expect(obj.getBackBtn().getText()).toEqual('Back');
         expect(obj.getNavToolbar().getTitle().getTitle()).toEqual('Title');

         // when: hit back button
         obj.getBackBtn().onTap();

         // then: should have popped controller
         expect(obj.getPanelHolder().popFocusCtrl).toHaveBeenCalled();

         // when: tap home button
         obj.getHomeBtn().onTap();

         // then: should pop to home
         expect(obj.getPanelHolder().gotoBaseController).toHaveBeenCalled();
      });
   });


   //it('Should require panelHolder to be set', function() {
   //   // If panel holder is not set, it should throw an assertion exception.
   //   expect(function() {
   //      /* jshint unused:false */
   //      var obj = new vrs.StackPanelController({});
   //   }).toThrow();
   //});

   it('should destroy the panel when the control is deactivated', function() {
      var obj = new vrs.StackPanelController({panelHolder: {}}),
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

component('Panel Holder', function() {
   var panel_holder = null,
       base_ctrl, ctrl1, ctrl2, ctrl3;

   feature('base controller support', function() {
      beforeEach(function() {
         panel_holder = vrs.PanelHolder.create({
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
         base_ctrl = test.ExtPanel1.create({
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
         panel_holder = vrs.PanelHolder.create({
            animConfig: false
         });

         // when: set with a controller not marked base, it should throw
         expect(function() {
            panel_holder.setBaseController(test.ExtPanel1.create({panelHolder: panel_holder}));
         }).toThrow();
      });

      it('should deactivate the base controller upon destruction', function() {
         // given holder with no base controller
         base_ctrl = test.ExtPanel1.create({
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
         panel_holder = vrs.PanelHolder.create({
            animConfig: false
         });

         base_ctrl = test.ExtPanel1.create({
            panelHolder: panel_holder,
            isBaseController: true
         });
         ctrl1 = test.ExtPanel1.create({panelHolder: panel_holder});
         ctrl2 = test.ExtPanel2.create({panelHolder: panel_holder});
         ctrl3 = test.ExtPanel2.create({panelHolder: panel_holder});

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