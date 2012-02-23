/*global OpenLayers: false */
Ext.ns('vrs.ux.touch');

/**
 * @class vrs.ux.touch.OpenLayersMap
 * @extends Ext.Component
 *
 * Wraps an open layers map.
 * To use this component you must include OpenLayers.js script.
 *
 * <h2>Example code:</h2>
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items     : [
        {
            xtype             : 'openlayers_map',
            enableLocationTracking: true
        }
    ]
});</code></pre>
 * @xtype openlayers_map
 *
 * TODO:
 *  * ...
 */



vrs.ux.touch.OpenLayersMap = Ext.extend(Ext.Component, {
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
     * options as specified in OpenLayers documentation. Passed as options
     * to the Map constructor.
     */
    mapOptions: {},

    /**
     * @type {OpenLayers.Map}
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
        var me = this,
            /** See open layers documentation for events. */
            ol_event_names = ['preaddlayer',
                              'addlayer',
                              'removelayer',
                              'changelayer',
                              'movestart',
                              'move',
                              'moveend',
                              'zoomend',
                              'mouseover',
                              'mouseout',
                              'mousemove',
                              'changebaselayer'];

        this.scroll = false;
        this.lastGeoObj = null;

        vrs.ux.touch.OpenLayersMap.superclass.initComponent.call(this);

        // Setup our events
        this.addEvents.apply(this, ol_event_names);

        if(! window.OpenLayers) {
            this.html = 'OpenLayers API is required.';
        }
        else
        {
            // Default map options
            Ext.applyIf(this.mapOptions, {
                controls: [
                    new OpenLayers.Control.TouchNavigation({
                        dragPanOptions: {
                            interval: 100,
                            enableKinetic: true
                        }
                    })
                ],
                center: new OpenLayers.LonLat(0,0),
                zoom: 1
            });

            // Setup the map object.
            this.map = new OpenLayers.Map(this.mapOptions);

            // Register a passthrough handler for each OL event.  This allows
            // us to treat the events as Ext events.
            Ext.each(ol_event_names, function(ev_name) {
                me.map.events.register(ev_name, this, function(evt) {
                    me.fireEvent(ev_name, evt);
                });
            });

            // Setup the geolocation object and it's callbacks
            if (this.enableLocationTracking) {
                this.registerLocationTracking(false);
            }
        }
    },

    // @private
    beforeDestroy : function() {
        Ext.destroy(this.geo);
        if (this.maskMap && this.mask) {
            this.element.unmask();
        }
        // XXX: Memory leak.  Doesn't seem to work right now
        //**// this.map.destroy();  // Destroy the map and all layers and controls
        this.map = null;
        // TODO: Cleanup our events (may happen in the map.destroy method)
        vrs.ux.touch.OpenLayersMap.superclass.onDestroy.call(this);
    },

    // @private
    onRender : function(container, position) {
        vrs.ux.touch.OpenLayersMap.superclass.onRender.apply(this, arguments);
        this.element.setVisibilityMode(Ext.Element.OFFSETS);
    },

    // @private
    // Called after everything is in the DOM and we should be ready to go.
    afterRender : function() {
        vrs.ux.touch.OpenLayersMap.superclass.afterRender.apply(this, arguments);
        this.renderMap();
    },

    // @private
    /*
    onResize : function( w, h) {
        vrs.ux.touch.OpenLayersMap.superclass.onResize.apply(this, arguments);
        console.log("todo: handle resize");
        this.map.updateSize();
    },
    */

    /** Disable masking for now
    afterComponentLayout : function() {
        if (this.maskMap && !this.mask) {
            this.element.mask(null, this.maskMapCls);
            this.mask = true;
        }
    },
    */

    /**
    * Create the map object and attach it to the DOM where it should be
    * with the correct settings to use.
    */
    renderMap : function(){
        var me     = this,
            map_el = me.element;

         // If we are an iPad use better navigation controls.
         if (Ext.is.iPad) {
             console.log("iPad not setup for OpenLayers component");
         }

         // Setup the mask values
         if (me.maskMap && !me.mask) {
             me.element.mask(null, this.maskMapCls);
             me.mask = true;
         }

         // Remove any old children of the DOM element.
         if (map_el && map_el.dom && map_el.dom.firstChild) {
             Ext.fly(map_el.dom.firstChild).remove();
         }

         // Clear any existing event connections and listeners
         if (me.map) {
            console.log("todo: Clear existing listeners");
            //gm.event.clearInstanceListeners(me.map);
         }

         assert(me.map !== undefined);
         me.map.render(map_el.dom);     // Target the map at our DOM element (set's the map div)

         // Notify everyone that the map has now been rendered
         me.fireEvent('maprender', me, me.map);

         // Make sure the layout gets updated after we have rendered the map to the DOM
         me.doComponentLayout();
    },


    // ---- MAP TRACKING SUPPORT ---- //
    /**
    * Register events for auto tracking in the system.
    * This does not cause the triggering to begin.
    * @param enable: If true, enable location tracking.
    */
    registerLocationTracking: function(enable) {
        if(undefined === enable) {
            enable = true;
        }

        if(!this.geo) {
            this.geo = new Ext.util.GeoLocation({
                autoUpdate: false,
                allowHighAccuracy: this.useHighAccuracyLocation
            });
        }

        this.geo.on({
            locationupdate : this.onGeoUpdate,
            locationerror : this.onGeoError,
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
            max_zoom_level = this.map.getNumZoomLevels() - 1;
            this.map.zoomTo(max_zoom_level - 1);
            this.geo.forceGeoLocationUpdate();
        }
    },

    /** Called when we get a new geo update. */
    onGeoUpdate : function(geoObj) {
        if(!this.trackingEnabled) {
            return;
        }
        var center,
            geo_obj = {
                accuracy: geoObj.accuracy,
                altitude: geoObj.altitude,
                altitudeAccuracy: geoObj.altitudeAccuracy,
                heading: geoObj.heading,
                latitude: geoObj.latitude,
                longitude: geoObj.longitude,
                speed: geoObj.speed,
                timestamp: geoObj.timestamp
            };

        console.log("OLM: Geo update: " + Ext.encode(geo_obj));
        this.lastGeoObj = geoObj;

        center = new OpenLayers.LonLat(geoObj.longitude, geoObj.latitude);

        if (this.rendered) {
            this.updateCenter(center);
        }
    },

    /**
    * Called when the geo we are connected to has an error.
    */
    onGeoError : function(geo) {
//#JSCOVERAGE_IF 0
        if(!this.trackingEnabled) {
            return;
        }

        console.error("Error getting location: ", arguments);
//#JSCOVERAGE_ENDIF
    },


    /**
     * Moves the map center to the designated coordinates hash of the form:

         { latitude : 37.381592,
          longitude : -122.135672
          }
     * or a LatLon object representing the target.
     */
    updateCenter : function(coords) {
        var me = this;

        // Adapt input if it is an object
        if (coords && !(coords instanceof OpenLayers.LonLat) && 'longitude' in coords) {
           coords = new OpenLayers.LonLat(coords.longitude, coords.latitude);
        }

        if (!this.hidden && this.rendered) {
            if (this.map && coords instanceof OpenLayers.LonLat) {
                me.map.panTo(coords);
            }
        }
    }

});

Ext.reg('openlayers_map', vrs.ux.touch.OpenLayersMap);


/**
* A panel that can be used as popup window on open layers
* maps.  Support anchoring to a location so it moves
* accordingly when the map is panned and zoomed
*/
vrs.ux.touch.OpenLayersPopupPanel = Ext.extend(Ext.Panel, {
    /** {bool}.  True if the popup should be anchored to it's location. */
    anchored: true,

    /** {OpenLayers.Map} The map to anchor onto. */
    map: null,

    /** {bool}  True if we should pan the map so the popup is in view. */
    panIn: true,

    /** ``OpenLayers.Feature.Vector`` or ``OpenLayers.LonLat`` or
     *  ``OpenLayers.Pixel`` or ``OpenLayers.Geometry`` A location for this
     *  popup's anchor.
     */
    location: null,

    /** Set to allow custom styling. */
    componentCls: 'x-map-popup',

    /** Override the panel defaults. */
    // note: beware of layout.  You may need vbox or other such layout to
    // get everything looking correct.
    floating: true,


    initComponent: function() {
        vrs.ux.touch.OpenLayersPopupPanel.superclass.initComponent.apply(this, arguments);

        // lookup map from feature
        if(!this.map && this.location instanceof OpenLayers.Feature.Vector &&
                                                        this.location.layer) {
            this.map = this.location.layer.map;
        }
        // Lookup location from feature
        if(this.location instanceof OpenLayers.Feature.Vector) {
            this.location = this.location.geometry;
        }
        // lookup location from geometry of pixel
        if (this.location instanceof OpenLayers.Geometry) {
            if (typeof this.location.getCentroid === "function") {
                this.location = this.location.getCentroid();
            }
            this.location = this.location.getBounds().getCenterLonLat();
        } else if (this.location instanceof OpenLayers.Pixel) {
            this.location = this.map.getLonLatFromViewPortPx(this.location);
        }

        if(this.anchored) {
            this.addAnchorEvents();
        }

        // Add flag we use to track if have toggled ourselves into fullscreen mode
        // used in setPanelSize to handle fullscreen settings.
        this._isFullscreen = false;
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
    setPanelSize: function(config) {
        var vp_size = Ext.Viewport.getSize(),
            tall_wide_factor = 1.5,  // Factor used to increase size of tall/wide panels.
            set_sizes = {},          // map from size name to size values to use.
            size_name, var_name,
            width, height,
            extra_margin = 12,  // extra margin to fix layout issues
            auto_position      = config.autoPosition || true, // if we should update position.
            should_anchor      = config.anchor || true,       // if we should be anchored
            setting_fullscreen = config.fullscreen || false,  // if we are setting to fullscreen
            was_fullscreen     = this._isFullscreen;          // if we were previously fullscreen.

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

        // finalize the size
        this.setSize(width + extra_margin, height + extra_margin);
        this.doLayout();

        // If we should be anchoring and it doesn't match previous setting,
        // then change and possible update the rendering to remove/add anchor.
        if(should_anchor !== this.anchored) {
           this.anchored = should_anchor;
           if(this.rendered) {
              this.show();        // reshow to get anchor laid out correctly.
           }
        }

        // If we are rendered and we should update position, then do so now.
        if(this.rendered && auto_position) {
           this.position();
        }

        if(setting_fullscreen) {
           this.setCentered(true, true);  // set to centered and update it
        } else if(was_fullscreen && this.centered) {
           this.setCentered(false);   // reset to not be centered
        }

        // update fullscreen flag.
        this._isFullscreen = setting_fullscreen;
    },

    /** Extend the show method to position the panel. */
    show: function() {
        vrs.ux.touch.OpenLayersPopupPanel.superclass.show.apply(this, arguments);

        if(this.anchorEl) {
            this.anchorEl.hide();  // If we had anchor in past, hide for now.
        }

        // If we are anchored, position ourselves and potentially pan into view.
        if(this.anchored) {
            // Setup the anchor.
            // - hacked together from showBy and alignTo in Component.js
            if(!this.anchorEl) {
                this.anchorEl = this.element.createChild({
                    cls: 'x-anchor'
                });
            }
            this.anchorEl.show();
            this.anchorEl.addCls('x-anchor-bottom');

            // Set the initial position
            this.position();
            if(this.panIn && !this._mapMove) {
                this.panIntoView();
            }
        }
    },

    /** Position the popup relative to it's location. */
    position: function() {
        var visible, centerPx_map, mapBox,
            center_x_page, center_y_page,
            arrow_size,
            panel_dx, panel_dy,
            arrow_dx, arrow_dy;

        // If we are moving based upon a map move and we are not on map anymore,
        // change our visibility
        if(this._mapMove === true) {
            visible = this.map.getExtent().containsLonLat(this.location);
            if(visible !== !this.isHidden()) {
                this.setVisible(visible);
            }
        }

        if(!this.isHidden()) {
            // Position of feature in global coords
            centerPx_map = this.map.getViewPortPxFromLonLat(this.location);

            // Get global position of map
            mapBox   = Ext.fly(this.map.div).getBox();

            // Anchor on bottom
            //var anc = this.anc;
            //var dx = anc.getLeft(true) + anc.getWidth() / 2;
            arrow_size = this.anchorEl.getSize();
            panel_dx = (this.getWidth() / 2);
            panel_dy = this.getHeight() + arrow_size.height + 10;
            arrow_dx = arrow_size.width / 2;
            arrow_dy = -arrow_size.height;
            center_x_page = centerPx_map.x + mapBox.x;
            center_y_page = centerPx_map.y + mapBox.y;

            //Assuming for now that the map viewport takes up
            //the entire area of the MapPanel
            //this.setPosition(center_x_page - panel_dx, center_y_page - panel_dy);
            this.setLeft(center_x_page - panel_dx);
            this.setTop(center_y_page - panel_dy);

            if(this.anchorEl) {
                this.anchorEl.setXY(center_x_page + arrow_dx, center_y_page + arrow_dy);
            }
        }
    },

    /**
    * Pans the MapPanel's map so that an anchored popup can come entirely
    * into view, with padding specified as per normal OpenLayers.Map popup
    * padding.
    */
    panIntoView: function() {
        var mapBox = Ext.Fly(this.map.div).getBox(),
            popupPos, panelSize, popupSize, newPos, padding, dx, dy;

        // assumed viewport takes up whole body element of map panel
        popupPos = this.getPosition(true);
        popupPos[0] -= mapBox.x;
        popupPos[1] -= mapBox.y;

        panelSize = [mapBox.width, mapBox.height]; // [x,y]
        popupSize = this.getSize();
        newPos = [popupPos[0], popupPos[1]];

        // For now, using native OpenLayers popup padding. This may not be ideal.
        padding = this.map.paddingForPopups;

        // X
        if(popupPos[0] < padding.left) {
            newPos[0] = padding.left;
        } else if(popupPos[0] + popupSize.width > panelSize[0] - padding.right) {
            newPos[0] = panelSize[0] - padding.right - popupSize.width;
        }

        // Y
        if(popupPos[1] < padding.top) {
            newPos[1] = padding.top;
        } else if(popupPos[1] + popupSize.height > panelSize[1] - padding.bottom) {
            newPos[1] = panelSize[1] - padding.bottom - popupSize.height;
        }

        dx = popupPos[0] - newPos[0];
        dy = popupPos[1] - newPos[1];

        this.map.pan(dx, dy);
    },

    onMapMove: function() {
        if(this.anchored) {
            this._mapMove = true;
            this.position();
            delete this._mapMove;
        }
    },

    addAnchorEvents: function() {
        this.map.events.on({
            "move" : this.onMapMove,
            scope  : this
        });

        /*
        this.on({
            "resize": this.position,
            "collapse": this.position,
            "expand": this.position,
            scope: this
        });
        */
    },

    removeAnchorEvents: function() {
        // stop position with location
        this.map.events.un({
            "move" : this.onMapMove,
            scope  : this
        });

        /*
        this.un("resize", this.position, this);
        this.un("collapse", this.position, this);
        this.un("expand", this.position, this);
        */
    },

    beforeDestroy: function() {
        if(this.anchored) {
            this.removeAnchorEvents();
        }
        vrs.ux.touch.OpenLayersPopupPanel.superclass.beforeDestroy.call(this);
    }
});
