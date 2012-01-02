Ext.ns('vrs');

Ext.setup({
   onReady: function() {
      vrs.ctrl = new vrs.AppCtrl();
   },

   fullscreen     : true,
   statusBarStyle : 'black'
});


/**
* Controller for the application.
*/
vrs.AppCtrl = Ext.extend(Ext.util.Observable, {
   panel: null,

   constructor: function(config) {
      vrs.AppCtrl.superclass.constructor.call(this, config);

      this.panel = new vrs.MapPanel({ controller: this});
      this.panel.on('activate', this.onActivate, this);
   },

   onActivate: function() {
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
         handler: function() { console.log('do something'); }
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

      this.mapCmp = new Ext.Map({
         mapOptions: {
            center : new google.maps.LatLng(37.381592, -122.135672),  //nearby San Fran
            zoom : 12,
            mapTypeId : google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            navigationControlOptions: {
               style: google.maps.NavigationControlStyle.DEFAULT
            }
         },

         listeners: {
            maprender: function() { ctrl.onMapRender() }
         }
      });

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

