/*global L: false */

Ext.ns('vrs.ux.touch');

/**
 * @class vrs.ux.touch.LeafletMap
 * @extends Ext.Component
 *
 * Wraps a Leaflet map. http://leaflet.cloudmade.com/
 * To use this component you must include leaflet.js script.
 *
 * <h2>Example code:</h2>
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items     : [
        {
            xtype                 : 'leaflet_map',
            enableLocationTracking: true
        }
    ]
});</code></pre>
 * @xtype leaflet_map
 *
 * TODO:
 *  * ...
 */


vrs.ux.touch.IMapComponent = Ext.extend(Ext.Component, {
   /**
    * @cfg {String} baseCls
    * The base CSS class to apply to the Maps's element (defaults to <code>'x-map'</code>).
    */
   baseCls: 'x-map',

   /**
    * @cfg {Boolean} enableLocationTracking
    * If true, automatically registers location tracking support on startup.
    *
    * note: this does *not* start the geo location updating, simply registers
    *       the events to allow us to track the location.
    *       call geo.setAutoUpdate(true/false) to enable/disable tracking.
    *       and call enable/disableTracking on this class.
    */
   enableLocationTracking: false,

   /**
    * @cfg {Boolean} useHighAccuracyLocation
    * If true and enableLocationTracking is true, then request the high accuracy version.
    */
   useHighAccuracyLocation: true,

   monitorResize : true,

   /**
    * @cfg {Object} mapOptions
    * options as specified in Leaflet documentation. Passed as options
    * to the Map constructor.
    */
   mapOptions: {},

   /**
    * @type {Leaflet.Map}
    * The wrapped map.
    */
   map: null,

   /**
    * @type {Ext.util.GeoLocation}
    * The geolocation utility object to use with the map.
    */
   geo: null,

   /**
    * @cfg {Boolean} maskMap
    * Masks the map (Defaults to false)
    */
   maskMap: false,

   /**
    * @cfg {Strng} maskMapCls
    * CSS class to add to the map when maskMap is set to true.
    */
   maskMapCls: 'x-mask-map',

   /**
    * Add a helper function to the afterRender chain for rendering the map
    * once the DOM is ready.
    */
   afterRender: function() {
      vrs.ux.touch.IMapComponent.superclass.afterRender.apply(this, arguments);

      this.renderMap();
   },

   // ---- Interface Functions ---- //
   /**
    * Convert a lat lon into the internal represtation for the mapping package
    */
   toLocation: function(lat, lon) {
      console.error('toLocation must be overriden');
   },

   /**
    * Change the current zoom level to be zoomLevel
    */
   zoomTo: function(zoomLevel) {
      console.error('zoomTo must be overriden');
   },

   /**
    * Returns the number of zoomLevels available for the map.
    */
   numZoomLevels: function() {
      console.error('numZoomLevels must be overriden');
   },

   /**
    * Moves the map center to the location which is the format returned by toLocation.
    */
   updateCenter : function(location) {
      console.error('updateCenter must be overriden');
   },


   // ---- MAP TRACKING SUPPORT ---- //
   /**
    * Register events for auto tracking in the system.
    * This does not cause the triggering to begin.
    * @param enable: If true, enable location tracking.
    */
   registerLocationTracking: function(enable) {
      enable = (enable === undefined) ? true : enable;

      if(!this.geo) {
         this.geo = new Ext.util.GeoLocation({
            autoUpdate:        false,
            allowHighAccuracy: this.useHighAccuracyLocation
         });
      }

      this.geo.on({
         locationupdate : this.onGeoUpdate,
         locationerror  : this.onGeoError,
         scope : this
      });
      this.trackingEnabled = enable;
   },

   setEnableTracking: function(enable) {
      var max_zoom_level;

      if(this.trackingEnabled === enable) {
         return;
      }

      this.trackingEnabled = enable;

      // If we just got enabled, force an update and zoom to a reasonable level
      if(this.trackingEnabled) {
         // XXX: Need better way to do this.  For now just go to one short of max
         this.zoomTo(this.numZoomLevels() -1);

         // Since we are just starting try to get an update quickly.
         this.geo.forceGeoLocationUpdate();
      }
   },

   /** Called when we get a new geo update. */
   onGeoUpdate : function(geoObj) {
      if(!this.trackingEnabled) {
         return;
      }

      this.lastGeoObj = geoObj;

      if (this.rendered) {
         this.updateCenter(this.toLocation(geoObj.latitude, geoObj.longitude));
      }
   },

   /**
    * Called when the geo we are connected to has an error.
    */
   onGeoError : function(geo) {
      if(!this.trackingEnabled) {
         return;
      }

      console.error("Error getting location: ", arguments);
      // XXX  dispatch event about this error so that owner can handle it.
   }
});


vrs.ux.touch.LeafletMap = Ext.extend(vrs.ux.touch.IMapComponent, {
    /**
    * initialize the component as part
    * of component construction.
    */
    initComponent : function() {
       var me = this;

       if(! window.L) {
          this.html = 'Leaflet API is required.';
       }

       vrs.ux.touch.LeafletMap.superclass.initComponent.call(this);

       Ext.applyIf(this.mapOptions, {
          center: new L.LatLng(0, 0),
          zoom: 1
       });
    },

   renderMap: function() {
      this.map = new L.Map(this.getEl().dom, this.mapOptions);

      // create a CloudMade tile layer
      var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
          cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 19});

      // add the CloudMade layer to the map
      this.map.addLayer(cloudmade);
   }
});

Ext.reg('leaflet_map', vrs.ux.touch.LeafletMap);
