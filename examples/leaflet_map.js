Ext.ns('vrs');

Ext.setup({
   onReady: function() {
      vrs.ctrl = new vrs.AppCtrl();
   },

   fullscreen     : true,
   statusBarStyle : 'black'
});


vrs.AppCtrl = Ext.extend(Ext.util.Observable, {
   panel: null,

   /** List of markers on the map. */
   markers: null,

   constructor: function(config) {
      vrs.AppCtrl.superclass.constructor.call(this, config);

      this.panel = new vrs.MapPanel();
      //this.panel = new vrs.ux.touch.LeafletMap();
   }
});



/*
* Main view for the application.
*/
vrs.MapPanel = Ext.extend(Ext.Panel, {
   cls: 'map_panel',

   controller: null,
   fullscreen: true,

   layout: {
      type: 'vbox',
      align: 'stretch'
   },

   initComponent: function() {
      var me = this,
          ctrl = this.controller,
          toolbar;

      this.addBtn = new Ext.Button({
         text: 'Add',
         ui: 'action',
         handler: function() {
            console.log('add something');
         }
      });

      this.topToolbar = new Ext.Toolbar({
         title: 'Map',
         dock: 'top',
         items: [
            this.addBtn,
            {xtype: 'spacer'}
         ]
      });

      this.mainPanel = new Ext.Panel({
         html: 'Put stuff here'
      });

      this.mapCmp = new vrs.ux.touch.LeafletMap();

      // finalize the setup
      this.dockedItems = [
         this.topToolbar
      ];

      this.items = [
         this.mapCmp
      ];

      // Finish setup
      vrs.MapPanel.superclass.initComponent.call(this);
   },

   // -- TEST HELPERS --- //
   tapAddBtn: function() {
      this.addBtn.callHandler(null);
   }
});

