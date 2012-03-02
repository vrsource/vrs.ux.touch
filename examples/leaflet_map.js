/*global L: false */
Ext.ns('vrs');

Ext.setup({
   onReady: function() {
      vrs.ctrl = new vrs.AppCtrl();
   },

   fullscreen     : true,
   statusBarStyle : 'black'
});


Ext.define('vrs.AppCtrl', {
   mixins: {
      observable: 'Ext.mixin.Observable'
   },

   panel: null,

   /** List of markers on the map. */
   markers: null,

   constructor: function(config) {
      this.initConfig(config);
      this.mixins.observable.constructor.call(this, config);

      this.panel = vrs.MapPanel.create({controller: this});
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
Ext.define('vrs.MapPanel', {
   extend: 'Ext.Panel',

   config: {
      controller : null,
      cls        : 'map_panel',
      fullscreen : true,
      layout     : 'fit'
   },

   initialize: function() {
      this.callParent(arguments);

      var me   = this,
          ctrl = this.getController(),
          toolbar,
          map, layer;

      this.addBtn = Ext.Button.create({
         text: 'Add',
         ui: 'action',
         handler: function() {
            console.log('add something');
         }
      });

      this.topToolbar = Ext.Toolbar.create({
         title: 'Map',
         docked: 'top',
         items: [
            this.addBtn,
            {xtype: 'spacer'}
         ]
      });

      this.mainPanel = new Ext.Panel({
         html: 'Put stuff here'
      });

      this.mapCmp = vrs.ux.touch.LeafletMap.create();

      /*
      this.mapCmp.on('maprender', function() {
         var layer = new L.TileLayer(
         'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
            {maxZoom: 17});
         this.map.addLayer(layer);
      });
      */
      map = this.mapCmp.getMap();
      layer = new L.TileLayer(
         'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
         {maxZoom: 17});
      map.addLayer(layer);

      // Finish setup
      me.add([
         this.topToolbar,
         this.mapCmp
      ]);
   }
});
