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
         fullscreen: true,
         animConfig: false
      });

      //vrs.dumpEvents(this.baseStack, 'PanelHolder');

      // Create main controller
      this.mainCtrl = new vrs.MainMenuController({
         panelHolder : this.baseStack,
         isBaseController : true
      });
      this.baseStack.setBaseController(this.mainCtrl);
   }
};


// --- Main Menu View Controller and Panel --- //
Ext.define('vrs.MainMenuController', {
   extend: 'vrs.PanelController',
   config: {
      backName : 'Main'
   },

   constructor: function(config) {
      this.callParent(arguments);
      this.setPanel(vrs.MainMenuPanel.create({controller: this}));
      //vrs.dumpEvents(this.getPanel(), 'MainPanel');
   },

   onButtonTap: function() {
      var panel1_ctrl = vrs.Panel1Controller.create({panelHolder: this.getPanelHolder()});
      this.getPanelHolder().pushFocusCtrl(panel1_ctrl);
   }
});

Ext.define('vrs.MainMenuPanel', {
   extend: 'Ext.Panel',

   config: {
      controller : null,
      cls        : 'main_menu_panel',
      scrollable : 'vertical',
      layout: {
         type  : 'vbox',
         align : 'stretch', //'stretch',
         pack  : 'justify'
      }
   },

   initialize: function() {
      assert(this.getController(), "Must have a valid controller");
      this.callParent();

      var me = this,
          ctrl = this.getController();

      this.add([
         {
            xtype : 'toolbar',
            docked  : 'top',
            title : 'Main Menu'
         },
         vrs.containerWrapButton({
            xtype: 'button',
            text: 'Next Panel',
            handler: function() { ctrl.onButtonTap(); }
         })
      ]);
   }

});


// ---- Panel1 Controller and Panel ---- //
Ext.define('vrs.Panel1Controller', {
   extend: 'vrs.PanelController',
   config: {
      backName : 'Panel1'
   },

   constructor: function(config) {
      this.callParent(arguments);
      this.setPanel(vrs.Panel1.create({controller: this}));
      //vrs.dumpEvents(this.getPanel(), 'Panel1');
   },

   onButtonTap: function() {
      var panel2_ctrl = vrs.Panel2Controller.create({panelHolder: this.getPanelHolder()});
      this.getPanelHolder().pushFocusCtrl(panel2_ctrl);
   }
});

Ext.define('vrs.Panel1', {
   extend: 'Ext.Panel',
   config: {
      controller : null,
      cls : 'panel1',
      scrollable : 'vertical',
      layout: {
         type  : 'vbox',
         align : 'stretch', //'stretch',
         pack  : 'justify'
      }
   },

   initialize: function() {
      this.callParent();
      assert(this.getController(), "Must have a valid controller");

      var me = this,
          ctrl = this.getController();

      this.add([
         {
            xtype : 'toolbar',
            docked: 'top',
            title : 'Panel 1',
            items : [
               ctrl.createBackButton(),
               { xtype: 'spacer' },
               ctrl.createHomeButton()
            ]
         },
         vrs.containerWrapButton({
            xtype: 'button',
            text: 'Next Panel',
            handler: function() { ctrl.onButtonTap(); }
         })
      ]);
   }
});


// ---- Panel2 Controller and Panel ---- //
Ext.define('vrs.Panel2Controller', {
   extend: 'vrs.PanelController',
   config: {
      backName : 'Panel2'
   },

   constructor: function(config) {
      this.callParent(arguments);
      this.setPanel(vrs.Panel2.create({controller: this}));
      //vrs.dumpEvents(this.getPanel(), 'Panel2');
   }
});

Ext.define('vrs.Panel2', {
   extend: 'Ext.Panel',
   config: {
      controller : null,
      cls : 'panel2',
      scroll : 'vertical',
      layout: {
         type  : 'vbox',
         align : 'stretch', //'stretch',
         pack  : 'justify'
      }
   },

   initialize: function() {
      this.callParent();
      assert(this.getController(), "Must have a valid controller");

      var me = this,
          ctrl = this.getController();

      this.add([
         {
            xtype : 'toolbar',
            docked  : 'top',
            title : 'Panel 2',
            items: [
               ctrl.createBackButton(),
               { xtype: 'spacer' },
               ctrl.createHomeButton()
            ]
         },
         {
            html: 'This is Panel 2'
         }
      ]);
   }
});