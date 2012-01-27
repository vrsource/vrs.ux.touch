/*global L: false */

Ext.ns('vrs.ux.touch');


/**
 * @class vrs.ux.touch.LeafletMap
 * @extends Ext.IMapComponent
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
         zoom: 1,
         attributionControl: false
         // Leaflet defaults to CRS 3857 used by Google, Bing, CloudMade.
         // TACCS defaults uses 4326 so we should enforce that here also?
         //crs: L.CRS.EPSG4326
      });
   },

   renderMap: function() {
      this.map = new L.Map(this.getEl().dom, this.mapOptions);
      /*var nexrad = new L.TileLayer.WMS("http://es1:8080/service", {
         layers: 'delorme_world',
         format: 'image/png'
      });
      this.map.addLayer(nexrad);*/
      // add the CloudMade layer to the map
      this.map.addLayer(new L.TileLayer(
         'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
         {maxZoom: 19}
      ));
   },

   // ---- Interface Functions ---- //
   /**
    * Convert a lat lon into the internal represtation for the mapping package
    */
   toLocation: function(lat, lon) {
      return new L.LatLng(lat, lon);
   },

   /**
    * Change the current zoom level to be zoomLevel
    */
   zoomTo: function(zoomLevel) {
      this.map.setZoom(zoomLevel);
   },

   /**
    * Returns the number of zoomLevels available for the map.
    */
   numZoomLevels: function() {
      return this.map.getMaxZoom();
   },

   /**
    * Moves the map center to the location which is the format returned by toLocation.
    */
   updateCenter : function(location) {
      this.map.panTo(location);
   },

   addMarker: function(lat, lon) {
      var marker = new L.Marker(this.toLocation(lat, lon));
      marker.dude = "adfsasdf";
      marker.on('click', this.onMarkerPicked, this);

      this.map.addLayer(marker);
   },

   onMarkerPicked: function(event) {
      this.fireEvent('repPicked', event.target);
   }
});

Ext.reg('leaflet_map', vrs.ux.touch.LeafletMap);


/**
* A panel that can be used as popup window on Leaflet
* maps.  Support anchoring to a location so it moves
* accordingly when the map is panned and zoomed
*/
vrs.ux.touch.LeafletPopupPanel = Ext.extend(vrs.ux.touch.IMapPopupPanel, {
   /**
   * Construct the popup panel.
   *
   * Note: Since this is a panel, normal panel configuration settings can
   *       be passed in.  (ex: items, dockedItems, layout, ...)
   */
   constructor: function(config) {
      Ext.apply(config, {
         renderTo: config.map._panes.popupPane
      });

      vrs.ux.touch.LeafletPopupPanel.superclass.constructor.apply(this, arguments);

      this.map.on('viewreset', this.updatePosition, this);

      // Add flag we use to track if have toggled ourselves into fullscreen mode
      // used in setPanelSize to handle fullscreen settings.
      this._isFullscreen = false;
   },

   afterRender: function() {
      vrs.ux.touch.LeafletPopupPanel.superclass.afterRender.apply(this, arguments);

      this.updatePosition();
   },

   // --- INTERNAL HELPERS ---- //
   updatePosition: function() {
      var pos    = this.map.latLngToLayerPoint(this.location);

      this.el.setTop(pos.y);
      this.el.setLeft(pos.x);
   }
});
