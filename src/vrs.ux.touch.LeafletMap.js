/*global OpenLayers: false */
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



vrs.ux.touch.LeafletMap = Ext.extend(Ext.Component, {
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
   mapOptions: null,

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
    * initialize the component as part
    * of component construction.
    */
    initComponent : function() {
       var me = this;

       vrs.ux.touch.LeafletMap.superclass.initComponent.call(this);

       if(! window.L) {
          this.html = 'Leaflet API is required.';
       }
    },

   afterRender: function() {
      vrs.ux.touch.LeafletMap.superclass.afterRender.apply(this, arguments);

      this.renderMap();
   },

   renderMap: function() {
      this.map = new L.Map(this.getEl().dom, {
         center: new L.LatLng(51.505, -0.09),
         zoom: 13
      });

      // create a CloudMade tile layer
      var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
          cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 19});

      // add the CloudMade layer to the map
      this.map.addLayer(cloudmade);
   }
});

Ext.reg('leaflet_map', vrs.ux.touch.LeafletMap);
