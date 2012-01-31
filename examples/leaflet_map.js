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

      this.panel.mapCmp.on('repPicked', this.onRepPicked, this);

      this.addThings();
   },

   addThings: function() {
      var map = this.panel.mapCmp,
          marker = map.addMarker(0, 0);

      marker.on('click', this.onRepPicked, this);
   },

   onRepPicked: function(evt) {
      var popup = new vrs.ux.touch.LeafletPopupPanel({
         map:      this.panel.mapCmp.map,
         location: evt.target.getLatLng(),
         items:    [{'html': 'the body'}],
         anchored : true,

         //hideOnMaskTap    : true,
         autoRemoveOnHide : true,
         sizeConfig: {
            size: 'small'
         }
      });

      popup.show();
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

      this.mapCmp.on('maprender', function() {
         var layer = new L.TileLayer(
            'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
            {maxZoom: 17});
         this.map.addLayer(layer);
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
   }
});
