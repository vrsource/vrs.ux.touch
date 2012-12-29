/*global L: false */
Ext.ns('vrs');

Ext.setup({
   onReady: function() {
      var ctrl = MapAppCtrl.create();
      Ext.Viewport.add(ctrl.getPanel());
   },

   fullscreen     : true,
   statusBarStyle : 'black'
});


Ext.define('MapAppCtrl', {
   extend: 'vrs.PanelController',

   config: {
      panel: {
         xtype: 'container',
         //layout: 'fit',
         //fullscreen: true,
         items: [{
            xtype: 'toolbar',
            title: 'Test app',
            itemId: 'toolbar',
            docked: 'top'
         }/* {
            xtype: 'leaflet_map',
            itemId: 'mapCmp',
            width: '100%',
            height: '100%'
         }*/]         
      },

      refs: {
         mapCmp: '#mapCmp',
         toolbar: '#toolbar'
      }
   },

   initialize: function() {
      this.callParent(arguments);

      var mapOptions = {};

      var map_cmp = vrs.ux.touch.LeafletMap.create({
         itemId     : 'mapCmp',
         mapOptions : mapOptions,
         width      : '100%',
         height     : '100%'
      });
      this.getPanel().add(map_cmp);

      var map = this.getMapCmp().getMap();
      var layer = new L.TileLayer(
         'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
         {maxZoom: 17});
      map.addLayer(layer);
   }
});



/*
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
         map      : this.panel.mapCmp.getMap(),
         location : evt.target.getLatLng(),
         items    : [{'html': 'the body'}],
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
*/


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
