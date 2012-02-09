/*global L: false */

Ext.ns('vrs.ux.touch');

/** Teach the Leaflet Draggable class to ignore pop ups when dragging the canvas
 * https://github.com/vrsource/Leaflet/blob/master/src/dom/Draggable.js
 **/
vrs.ux.touch.LeafletDraggable = L.Draggable.extend({
   _insidePopop: function(elm) {
      var class_name;
      while (elm.parentNode) {
         class_name = elm.parentNode.className;
         if (class_name && class_name.indexOf('leaflet-popup') >= 0) {
            return true;
         }
         elm = elm.parentNode;
      }
      return false;
   },

   _onDown: function(evt) {
      if (this._insidePopop(evt.target)) { return; }
      return this.__proto__.__proto__._onDown.apply(this, arguments);
   },
   _onMove: function(evt) {
      if (this._insidePopop(evt.target)) { return; }
      return this.__proto__.__proto__._onMove.apply(this, arguments);
   },
   _onUp: function(evt) {
      if (this._insidePopop(evt.target)) { return; }
      return this.__proto__.__proto__._onUp.apply(this, arguments);
   }
});

vrs.ux.touch._OldLeafletDrag = L.Map.Drag;
vrs.ux.touch.LeafletDrag = L.Map.Drag.extend({
   addHooks: function () {
      if (!this._draggable) {
         // Aside for this line this is directly from Leaflet
         // https://github.com/vrsource/Leaflet/blob/master/src/map/handler/Map.Drag.js
         this._draggable = new vrs.ux.touch.LeafletDraggable(this._map._mapPane, this._map._container);

         this._draggable
            .on('dragstart', this._onDragStart, this)
            .on('drag', this._onDrag, this)
            .on('dragend', this._onDragEnd, this);

         var options = this._map.options;

         if (options.worldCopyJump && !options.continuousWorld) {
            this._draggable.on('predrag', this._onPreDrag, this);
            this._map.on('viewreset', this._onViewReset, this);
         }
      }
      this._draggable.enable();
   }
});
// Use our map drag instead of Leaflets
L.Map.Drag = vrs.ux.touch.LeafletDrag;

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

      Ext.applyIf(this.mapOptions, {
         center: new L.LatLng(0, 0),
         zoom: 1,
         attributionControl: false,
         closePopupOnClick:  false
      });

      vrs.ux.touch.LeafletMap.superclass.initComponent.apply(this);
   },

   renderMap: function() {
      this.map = new L.Map(this.el.dom, this.mapOptions);
   },

   /**
    * Helper that is called at the last possible second in the components show cycle.
    * Once sencha has the layout ready we tell the map to figure out its bounds again.
    */
   fixLayout: function() {
      this.map.invalidateSize();
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
   setZoom: function(zoomLevel) {
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

      this.map.addLayer(marker);
      return marker;
   }
});

Ext.reg('leaflet_map', vrs.ux.touch.LeafletMap);


/**
* A panel that can be used as popup window on Leaflet
* maps.  Support anchoring to a location so it moves
* accordingly when the map is panned and zoomed
*/
vrs.ux.touch.LeafletPopupPanel = Ext.extend(vrs.ux.touch.IMapPopupPanel, {
   componentCls: 'leaflet-popup',

   /**
   * Construct the popup panel.
   *
   * Note: Since this is a panel, normal panel configuration settings can
   *       be passed in.  (ex: items, dockedItems, layout, ...)
   */
   constructor: function(config) {
      Ext.applyIf(config, {
         renderTo: config.map._panes.popupPane
      });

      vrs.ux.touch.LeafletPopupPanel.superclass.constructor.apply(this, arguments);

      // Connect to the maps reset for the duration of the popup
      // Be sure to remove this connection when the popup is closed
      // Otherwise, the next zoom will cause an error in setPopupSizeAndPosition
      this.map.on('viewreset', this.setPopupSizeAndPosition, this);
      this.on('beforehide', function() {
         this.map.off('viewreset', this.setPopupSizeAndPosition, this);
      }, this);

      // Add flag we use to track if have toggled ourselves into fullscreen mode
      // used in setPanelSize to handle fullscreen settings.
      this._isFullscreen = false;
   },

   afterRender: function() {
      vrs.ux.touch.LeafletPopupPanel.superclass.afterRender.apply(this, arguments);
      this.setPopupSizeAndPosition();
   },

   // --- INTERNAL HELPERS ---- //
   updatePosition: function() {
      var pos = this.map.latLngToLayerPoint(this.location);

      // Avoid race condition where the tap mask has not removed the panel yet but
      // the dom was cleaned up already.
      if (! this.el.dom) { return; }

      // These values will cascade into setPopSizeAndPosition
      this.el.setTop(pos.y);
      this.el.setLeft(pos.x);
   }
});
