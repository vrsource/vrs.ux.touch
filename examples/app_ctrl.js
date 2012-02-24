Ext.ns('vrs');

// Get everything started when ready
Ext.setup({
   onReady: function() {
      vrs.AppObject.launch();
   },

   statusBarStyle : 'black'
});

// Main Application Object
vrs.AppObject = {
   baseStack : null,
   mainCtrl  : null,

   launch: function() {
      // Create the core panel stack to slide items onto
      this.baseStack = new vrs.PanelHolder({
         id: 'base_stack',
         fullscreen: true
      });

      // Create main controller
      this.mainCtrl = new vrs.MainMenuController({
         panelHolder : this.baseStack,
         isBaseController : true
      });
      this.baseStack.setBaseController(this.mainCtrl);
   }
};


// --- Main Menu View Controller and Panel --- //
vrs.MainMenuController = Ext.extend(vrs.PanelController, {
   backName : 'Main',

   constructor: function(config) {
      var me = this;
      vrs.MainMenuController.superclass.constructor.call(this, config);

      this.panel = new vrs.MainMenuPanel({controller: this});
   },

   onButtonTap: function() {
      var panel1_ctrl = new vrs.Panel1Controller({panelHolder: this.panelHolder});
      this.panelHolder.pushFocusCtrl(panel1_ctrl);
   }
});

vrs.MainMenuPanel = Ext.extend(Ext.Panel, {
   cls : 'main_menu_panel',
   scroll : 'vertical',
   layout: {
      type  : 'vbox',
      align : 'stretch', //'stretch',
      pack  : 'justify'
   },

   initComponent: function() {
      assert(this.controller, "Must have a valid controller");

      var me = this,
          ctrl = this.controller;

      this.dockedItems = [{
         xtype : 'toolbar',
         dock  : 'top',
         title : 'Main Menu'
      }];

      this.items = [
         vrs.containerWrapButton({
               xtype: 'button',
               text: 'Next Panel',
               handler: function() { ctrl.onButtonTap(); }
         })
      ];

      vrs.MainMenuPanel.superclass.initComponent.call(this);
   }

});


// ---- Panel1 Controller and Panel ---- //
vrs.Panel1Controller = Ext.extend(vrs.PanelController, {
   backName : 'Panel1',

   constructor: function(config) {
      vrs.Panel1Controller.superclass.constructor.call(this, config);
      this.panel = new vrs.Panel1({controller: this});
   },

   onButtonTap: function() {
      var panel2_ctrl = new vrs.Panel2Controller({panelHolder: this.panelHolder});
      this.panelHolder.pushFocusCtrl(panel2_ctrl);
   }
});

vrs.Panel1 = Ext.extend(Ext.Panel, {
   cls : 'panel1',
   scroll : 'vertical',
   layout: {
      type  : 'vbox',
      align : 'stretch', //'stretch',
      pack  : 'justify'
   },

   initComponent: function() {
      assert(this.controller, "Must have a valid controller");

      var me = this,
          ctrl = this.controller;

      this.dockedItems = [{
         xtype : 'toolbar',
         dock  : 'top',
         title : 'Panel 1',
         items : [
            ctrl.createBackButton()
         ]
      }];

      this.items = [
         vrs.containerWrapButton({
            xtype: 'button',
            text: 'Next Panel',
            handler: function() { ctrl.onButtonTap(); }
         })
      ];

      vrs.Panel1.superclass.initComponent.call(this);
   }
});


// ---- Panel2 Controller and Panel ---- //
vrs.Panel2Controller = Ext.extend(vrs.PanelController, {
   backName : 'Panel2',

   constructor: function(config) {
      vrs.Panel2Controller.superclass.constructor.call(this, config);
      this.panel = new vrs.Panel2({controller: this});
   }
});

vrs.Panel2 = Ext.extend(Ext.Panel, {
   cls : 'panel2',
   scroll : 'vertical',
   layout: {
      type  : 'vbox',
      align : 'stretch', //'stretch',
      pack  : 'justify'
   },

   initComponent: function() {
      assert(this.controller, "Must have a valid controller");

      var me = this,
          ctrl = this.controller;

      this.dockedItems = [{
         xtype : 'toolbar',
         dock  : 'top',
         title : 'Panel 2',
         items: [
            ctrl.createBackButton()
         ]
      }];

      this.items = [
         {
            html: 'This is Panel 2'
         }
      ];

      vrs.Panel2.superclass.initComponent.call(this);
   }
});