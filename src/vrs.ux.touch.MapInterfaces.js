Ext.ns('vrs.ux.touch');

Ext.define('vrs.ux.touch.IMapComponent', {
   extend: 'Ext.Component',

   /**
   * @event maprender
   * Fired when Map is initially rendered.
   * @param {Map} this
   * @param {...}
   */

   /**
   * @event reppicked
   * Fired when a rep on the map is picked.
   *
   */

   config: {
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
      maskMapCls: 'x-mask-map'
   },

   constructor: function() {
      this.callParent(arguments);
   },

   /**
   * Initialize the UI pieces.
   */
   initialize: function() {
      this.callParent(arguments);
      this.renderMap();
      this.fireEvent('maprender');
   },

   /**
   * This method should setup the map in the DOM.
   */
   renderMap: Ext.emptyFn,

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
   setZoom: function(zoomLevel) {
      console.error('setZoom must be overriden');
   },

   /**
    * Returns the number of zoomLevels available for the map.
    */
   numZoomLevels: function() {
      console.error('numZoomLevels must be overriden');
   },

   addMarker: function(lat, lon) {
      console.error('addMarker must be overriden');
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

      if(!this.getGeo()) {
         this.setGeo(new Ext.util.GeoLocation({
            autoUpdate:        false,
            allowHighAccuracy: this.useHighAccuracyLocation
         }));
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
         this.setZoom(this.numZoomLevels() -1);

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
   },

   // @private
   onDestroy : function() {
      Ext.destroy(this.geo);

      if (this.maskMap && this.mask) {
         this.element.unmask();
      }

      this.map = undefined;

      vrs.ux.touch.IMapComponent.superclass.onDestroy.call(this);
   }
});


/*
* Base class for all Map Popup panels.
*/
Ext.define('vrs.ux.touch.IMapPopupPanel', {
   extend: 'Ext.Panel',

   config: {
      /**
      * The map that we are attached onto.
      *
      * This is the underlying map object. (leaflet, etc)
      */
      map: null,

      /** LatLng location of the panel anchor. */
      location: null,

      /** {bool} True if the popup should be anchored to it's location. */
      anchored: true,

      scroll: true,

      /** {bool} True if we should pan the map so the popup is in view. */
      panIn: true,

      /** A config object to pass to setPanelSize after panel
      * is constructed.
      */
      sizeConfig: null,

      /** Set to allow custom styling. */
      cls: 'x-map-popup',

      /** override the panel details. */
      floating      : true,
      hideOnMaskTap : false  // Don't auto-hide when tap outside the component.
   },


   initialize: function() {
      // Once hidden the popup is nolonger important so destroy it
      this.on({
         hide: function() {
            this.destroy();
         }
      });

      // Set the starting size if possible
      // - Update should handle this.

      // Popups are shown by default.
      this.show();
   },

   /*
   updateSizeConfig: function(value, oldValue) {
      this.applyPopupSizeAndPosition();
   },
   */

   /**
   * This method should update the position of the panel relative
   * to the map.
   */
   updatePosition: Ext.emptyFn,


   /** Override the show method to position the panel. */
   show: function() {
      this.callParent(arguments);

      if(this.anchorEl) {
         this.anchorEl.hide();  // If we had anchor in past, hide for now.
      }

      // If we are anchored, position ourselves and potentially pan into view.
      if(this.getAnchored()) {
         // Setup the anchor.
         // - hacked together from showBy and alignTo in Component.js
         //   todo: see if we can use more of alignTo logic.
         if(!this.anchorEl) {
            this.anchorEl = this.element.createChild({
               cls: 'x-anchor'
            });
         }
         this.anchorEl.show();
         this.anchorEl.addCls('x-anchor-bottom');
         this.anchorEl.setBottom(-10);
         this.anchorEl.setLeft((this.element.getWidth() / 2.0) - (this.anchorEl.getWidth() / 2.0));
      }
   },

   /**
   * Set the size of the panel to use.
   *
   * @param config
   *      fullscreen: If true, then set to a fullscreen panel centered on screen.
   *                 (still respects width and height settings as computed)
   *      width: if set, sets to this width in pixels.
   *      height: if set, sets to this height in pixels.
   *      size: if set to one of 'small', 'medium', 'large', 'fullscreen'
   *           or variation ending in '-tall' or '-wide'. (ex: 'small-wide')
   *           automatically picks window of good size for the current device.
   *      autoPosition: If true, automatically call the position setting. (default: true)
   *      anchor: If true, we set anchored (if not already set) and update.
   *               (true by default except for fullscreen which is false by default)
   *
   * note: fullscreen is a special variation that will override some other settings.
   */
   applyPopupSizeAndPosition: function() {
      var config             = this.getSizeConfig() || {},
          dims               = this.calculatePanelSize(config),
          auto_position      = config.autoPosition || true, // if we should update position.
          should_anchor      = config.anchor || true,       // if we should be anchored
          setting_fullscreen = config.fullscreen || false,  // if we are setting to fullscreen;
          was_fullscreen     = this._isFullscreen;          // if we were previously fullscreen.

      this.updatePosition();

      // finalize the size and layout if we are visible.
      // - we don't layout if not visible because that would remove the sizing for first show
      this.setSize(dims.w + dims.margin, dims.h + dims.margin);
      // 10 is for the anchor
      this.element.setTop(this.element.getTop() - dims.h - dims.margin - 10);
      this.element.setLeft(this.element.getLeft() - dims.w/2.0);

      // If we should be anchoring and it doesn't match previous setting,
      // then change and possible update the rendering to remove/add anchor.
      if(should_anchor !== this.getAnchored()) {
         this.setAnchored(should_anchor);
         if(this.rendered && !this.isHidden()) {
            this.show();        // reshow to get anchor laid out correctly.
         }
      }

      if(setting_fullscreen) {
         this.setCentered(true, true);  // set to centered and update it
      } else if(was_fullscreen && this.centered) {
         this.setCentered(false);      // reset to not be centered
      }

      // update fullscreen flag.
      this._isFullscreen = setting_fullscreen;
   },

   /**
   * Calculate the size of the panel we want to show based upon the
   * passed in sizing configuration object.
   */
   calculatePanelSize: function(config) {
      var vp_size = Ext.Viewport.getSize(),
         tall_wide_factor = 1.5,  // Factor used to increase size of tall/wide panels.
          set_sizes = {},          // map from size name to size values to use.
          size_name, var_name,
          width, height,
          extra_margin = 12,  // extra margin to fix layout issues
          auto_position      = config.autoPosition || true,  // if we should update position.
          should_anchor      = config.anchor       || true,  // if we should be anchored
          setting_fullscreen = config.fullscreen   || false; // if we are setting to fullscreen
      config = config || {};

      // Lookup table of named size values
      set_sizes = {
         small: {
            width  : vp_size.width  * 0.2,
            height : vp_size.height * 0.2
         },
         medium: {
            width  : vp_size.width  * 0.35,
            height : vp_size.height * 0.35
         },
         large: {
            width  : vp_size.width  * 0.5,
            height : vp_size.height * 0.5
         }
      };

      // compute the final width and height values
      if(config.size) {
         size_name = config.size.split('-')[0];
         var_name  = config.size.split('-')[1];
         width  = set_sizes[size_name].width;
         height = set_sizes[size_name].height;
         if('tall' === var_name) {
            height = height * tall_wide_factor;
         }
         if('wide' === var_name) {
            width = width * tall_wide_factor;
         }
      } else {
         width  = config.width;
         height = config.height;
      }

      // If fullscreen and no explicit width set, then set defaults.
      if(setting_fullscreen) {
         auto_position = false;
         should_anchor = false;

         if(Ext.isEmpty(width)) {
            width  = vp_size.width  * 0.9;
            height = vp_size.height * 0.9;
         }
      }

      return {w: width, h: height, margin: extra_margin};
   }

});

