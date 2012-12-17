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
      this.baseStack = vrs.PanelHolder.create({
         id         : 'base_stack',
         fullscreen : true
      });

      // Create main controller
      this.mainCtrl = vrs.MainMenuController.create({
         panelHolder      : this.baseStack,
         isBaseController : true
      });
      this.baseStack.setBaseController(this.mainCtrl);
   }
};


// --- Main Menu View Controller and Panel --- //
Ext.define('vrs.MainMenuController', {
   extend: 'vrs.StackPanelController',
   config: {
      backName : 'Main',
      panel    : 'vrs_mainmenupanel',

      refs : {
         nextPanelBtn: '#nextPanelBtn'
      },
      control : {
         nextPanelBtn : {
            tap: 'onButtonTap'
         }
      }
   },

   onButtonTap: function() {
      var panel1_ctrl = vrs.Panel1Controller.create({panelHolder: this.getPanelHolder()});
      this.getPanelHolder().pushFocusCtrl(panel1_ctrl);
   }
});

Ext.define('vrs.MainMenuPanel', {
   extend: 'Ext.Panel',
   xtype: 'vrs_mainmenupanel',

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
      var me = this;

      this.setItems([
         {
            xtype   : 'toolbar',
            docked  : 'top',
            title   : 'Main Menu'
         },
         vrs.containerWrapButton({
            xtype   : 'button',
            text    : 'Next Panel',
            itemId  : 'nextPanelBtn'
         })
      ]);

      me.callParent(arguments);
   }

});


// ---- Panel1 Controller and Panel ---- //
Ext.define('vrs.Panel1Controller', {
   extend: 'vrs.StackPanelController',
   config: {
      backName : 'Panel1',
      panel    : 'vrs_panel1',
      control : {
         '#nextPanelBtn': {
            tap: 'onButtonTap'
         }
      }
   },

   onButtonTap: function() {
      var panel2_ctrl = vrs.Panel2Controller.create({panelHolder: this.getPanelHolder()});
      this.getPanelHolder().pushFocusCtrl(panel2_ctrl);
   }
});


Ext.define('vrs.Panel1', {
   extend : 'Ext.Panel',
   xtype  : 'vrs_panel1',
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
      var me   = this;

      this.setItems([
         {
            xtype : 'toolbar',
            docked: 'top',
            title : 'Panel 1',
            items : [
               vrs.createBackBtnPlaceholder(),
               { xtype: 'spacer' },
               vrs.createHomeBtnPlaceholder()
            ]
         },
         vrs.containerWrapButton({
            xtype   : 'button',
            itemId  : 'nextPanelBtn',
            text    : 'Next Panel'
         })
      ]);
   }
});



// ---- Panel2 Controller and Panel ---- //
Ext.define('vrs.Panel2Controller', {
   extend: 'vrs.StackPanelController',
   config: {
      backName : 'Panel2',
      panel    : 'vrs_panel2'
   }
});

Ext.define('vrs.Panel2', {
   extend: 'Ext.Panel',
   xtype : 'vrs_panel2',
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
      var me = this;

      this.setItems([
         vrs.createNavToolbarPlaceholder({
            docked : 'top',
            title  : 'Panel 2'
         }),
         {
            html: 'This is Panel 2'
         }
      ]);
      me.callParent(arguments);
   }
});
