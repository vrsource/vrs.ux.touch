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
            xtype                 : 'leaflet_map'
        }
    ]
});</code></pre>
 * @xtype leaflet_map
 *
 * TODO:
 *  * ...
 */

Ext.define('vrs.ux.touch.LeafletMap', {
   extend: 'vrs.ux.touch.IMapComponent',

   alias: 'widget.leaflet_map',

   constructor : function() {
      this.callParent(arguments);

      if(! window.L) {
         this.setHtml('Leaflet API is required.');
      }
   },

   initialize: function() {
      this.callParent();
      this.innerElement.on('touchstart', 'onTouchStart', this);
   },

   /** Return the correct structure for the leaflet map. */
   getElementConfig: function () {
      return {
         reference: 'element',
         className: 'x-container',
         children: [{
            reference: 'innerElement',
            className: 'x-inner',
            children: [{
               reference: 'mapContainer',
               className: Ext.baseCSSPrefix + 'map-container'
            }]
         }]
      };
   },

   onTouchStart: function(e) {
      e.makeUnpreventable();
   },

   renderMap: function() {
      // Apply defaults
      var map_options = this.getMapOptions();
      map_options = Ext.merge({
         center: new L.LatLng(0, 0),
         zoom: 1,
         attributionControl: false,
         closePopupOnClick:  false
      }, map_options);

      // What does this help?
      if (this.mapContainer.firstChild) {
         Ext.fly(element.dom.firstChild).destroy();
      }

      //this.setMap(new L.Map(this.element.dom, map_options));
      this.setMap(new L.Map(this.mapContainer.dom, map_options));

      // When we finally get painted, then we need to invalidate our size to
      // reset everything.
      this.on('painted', this.fixLayout, this);
   },

   /**
    * Helper that is called at the last possible second in the components show cycle.
    * Once sencha has the layout ready we tell the map to figure out its bounds again.
    *
    * XXX: May not be used.
    */
   fixLayout: function() {
      this.getMap().invalidateSize();
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
      this.getMap().setZoom(zoomLevel);
   },

   /**
    * Returns the number of zoomLevels available for the map.
    */
   numZoomLevels: function() {
      return this.getMap().getMaxZoom();
   },

   /**
    * Moves the map center to the location which is the format returned by toLocation.
    */
   updateCenter : function(location) {
      this.getMap().panTo(location);
   },

   addMarker: function(lat, lon) {
      var marker = new L.Marker(this.toLocation(lat, lon));

      this.getMap().addLayer(marker);
      return marker;
   }
});


/**
* A panel that can be used as popup window on Leaflet
* maps.  Support anchoring to a location so it moves
* accordingly when the map is panned and zoomed
*/
Ext.define('vrs.ux.touch.LeafletPopupPanel', {
   extend: 'vrs.ux.touch.IMapPopupPanel',

   config: {
      cls: 'x-map-popup'  // 'leaflet-popup'
   },

   /**
   * Construct the popup panel.
   *
   * Note: Since this is a panel, normal panel configuration settings can
   *       be passed in.  (ex: items, dockedItems, layout, ...)
   */
   initialize: function() {
      // Call parent which will show us.
      this.callParent();

      this.setRenderTo(this.getMap()._panes.popupPane);

      // Now that we are configured, apply sizing settings
      this.applyPopupSizeAndPosition();

      // Connect to the maps reset for the duration of the popup
      // Be sure to remove this connection when the popup is closed
      // Otherwise, the next zoom will cause an error in applyPopupSizeAndPosition
      this.getMap().on('viewreset', this.applyPopupSizeAndPosition, this);
      this.on('hide', function() {
         this.map.off('viewreset', this.applyPopupSizeAndPosition, this);
      }, this);

      // Add flag we use to track if have toggled ourselves into fullscreen mode
      // used in setPanelSize to handle fullscreen settings.
      this._isFullscreen = false;
   },

   // --- INTERNAL HELPERS ---- //
   updatePosition: function() {
      var leaflet_map = this.getMap(),
          pos;

      if(!leaflet_map) {
         console.log('updatePosition: Map not set, returning');
         return;
      }

      pos = this.getMap().latLngToLayerPoint(this.getLocation());

      // Avoid race condition where the tap mask has not removed the panel yet but
      // the dom was cleaned up already.
      if (! this.element.dom) {
         return;
      }

      // These values will cascade into setPopSizeAndPosition
      this.element.setTop(pos.y);
      this.element.setLeft(pos.x);
   }
});

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
vrs.ux.touch._OldLeafletDrag = L.Map.Drag;
L.Map.Drag = vrs.ux.touch.LeafletDrag;
