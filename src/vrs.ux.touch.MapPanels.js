/*global google: false */
Ext.ns('vrs.ux.touch');

/**
* TODO:
*  - Fullscreen toggling needs to move the DOM element when we go fullscreen.
*  - Add support for pan into view
*  - Add specs for the functionality.
*
*  - track location of a moving feature
*/


/**
* Overlay panel holder class.
*
* Acts as the glue to connect an overlay view to the
* Sencha Touch popup panel below.
*/
function OverlayPanelHolder(opts) {
   this.popupPanel = opts.popup;
   this.divElt     = document.createElement('DIV');
}
OverlayPanelHolder.prototype = new google.maps.OverlayView();

OverlayPanelHolder.prototype.draw = function() {
   console.log('panelholder.draw');
   this.popupPanel.updatePosition();
};

/**
* Called when the map panes are available for attaching the popup to the map DOM.
*/
OverlayPanelHolder.prototype.onAdd = function() {
   console.log('panelholder.onAdd');
   this.popupPanel.onAdd();
   // Add the div to the map pane
   var panes = this.getPanes();
   panes.floatPane.appendChild(this.divElt);  // overlayLayer, overlayMouseTarget, floatPane

   this.popupPanel.afterAdd();
};

OverlayPanelHolder.prototype.onRemove = function() {
   console.log('panelholder.onRemove');
   // Remove our div from the map.
   this.divElt.parentNode.removeChild(this.divElt);
   //this.divElt = null;   // keep the div around for the popup to look at and remove.

   this.popupPanel.afterRemove();
};



/**
* A panel that can be used as popup window on a google maps map.
* Handles the anchoring to a location and resizing as needed.
*
* Usage
* =====
*
* window = new GmapPopupPanel({
*    location: marker.position,
*    map     : map,
*    sizeConfig: {
*       size: 'small-wide'
*    },
*    items: [{ html: 'my content' }]
*  });
*/
vrs.ux.touch.GmapPopupPanel = Ext.extend(Ext.Panel, {
   /**
   * The map that we are attached onto.
   */
   map: null,

   /** google.maps.LatLng location of the panel anchor. */
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
   componentCls: 'x-map-popup',

   /**
   * If set, then automatically removes the panel and
   * associated objects when the popup is hidden.
   */
   autoRemoveOnHide : true,

   /** override the panel details. */
   floating      : true,
   hideOnMaskTap : true,  // Don't auto-hide when tap outside the component.

   /**
   * Reference to the overlay holder that manages us.
   */
   _overlayHolder: null,

   /**
   * Construct the popup panel.
   *
   * Note: Since this is a panel, normal panel configuration settings can
   *       be passed in.  (ex: items, dockedItems, layout, ...)
   */
   constructor: function(config) {
      var me = this;

      // Allocate the holder so we can get the DIV to render into.
      this._overlayHolder = new OverlayPanelHolder({popup: this});

      Ext.apply(config, {
         renderTo: this._overlayHolder.divElt
      });

      this.addEvents({
         /** Fired after the panel has been added to the map DOM.
         * called as: afterAdd(panel)
         */
         'afterAdd': true,

         /** Fired after the panel has been removed from the map DOM.
         * called as: afterRemove(panel)
         */
         'afterRemove': true
      });

      vrs.ux.touch.GmapPopupPanel.superclass.constructor.apply(this, arguments);

      // Add flag we use to track if have toggled ourselves into fullscreen mode
      // used in setPanelSize to handle fullscreen settings.
      this._isFullscreen = false;

      // If setup to auto remove, register to call remove at the end of hide
      if(this.autoRemoveOnHide) {
         this.on({
            hide: function() { me.remove(); }
         });
      }
   },

   initComponent: function() {
      vrs.ux.touch.GmapPopupPanel.superclass.initComponent.apply(this, arguments);

      // Connect it up to the map now that it has been initialized.
      this._overlayHolder.setMap(this.map);
   },

   afterRender: function() {
      vrs.ux.touch.GmapPopupPanel.superclass.afterRender.apply(this, arguments);

      this.updatePosition();
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

      // finalize the size and layout if we are visible.
      // - we don't layout if not visible because that would remove the sizing for first show
      this.setSize(width + extra_margin, height + extra_margin);
      if(this.isVisible()) {
         this.doLayout();
      }

      // If we should be anchoring and it doesn't match previous setting,
      // then change and possible update the rendering to remove/add anchor.
      if(should_anchor !== this.anchored) {
         this.anchored = should_anchor;
         if(this.rendered && this.isVisible()) {
            this.show();        // reshow to get anchor laid out correctly.
         }
      }

      // If we are rendered and we should update position, then do so now.
      if(this.rendered && this.isVisible() && auto_position) {
         this.updatePosition();
      }

      if(setting_fullscreen) {
         this.setCentered(true, true);  // set to centered and update it
      } else if(was_fullscreen && this.centered) {
         this.setCentered(false);      // reset to not be centered
      }

      // update fullscreen flag.
      this._isFullscreen = setting_fullscreen;
   },

   /** Override the show method to position the panel. */
   show: function() {
      vrs.ux.touch.GmapPopupPanel.superclass.show.apply(this, arguments);

      if(this.anchorEl) {
         this.anchorEl.hide();  // If we had anchor in past, hide for now.
      }

      // If we are anchored, position ourselves and potentially pan into view.
      if(this.anchored) {
         // Setup the anchor.
         // - hacked together from showBy and alignTo in Component.js
         //   todo: see if we can use more of alignTo logic.
         if(!this.anchorEl) {
            this.anchorEl = this.el.createChild({
               cls: 'x-anchor'
            });
         }
         this.anchorEl.show();
         this.anchorEl.addCls('x-anchor-bottom');

         // Set the initial position
         /*
         this.position();
         if(this.panIn && !this._mapMove) {
            this.panIntoView();
         }
         */
      }

   },

   /**
   * Remove the popup from the map and destroy all the associated objects.
   */
   remove: function() {
      // set map to null to trigger removal.
      // - we finish the removal in the afterRemove callback below.
      this._overlayHolder.setMap(null);
   },

   // --- INTERNAL HELPERS ---- //
   updatePosition: function() {
      var overlay_projection,
          posDiv_pane,
          arrow_size,
          panel_dx, panel_dy,
          arrow_dx, arrow_dy;

      // If we are not anchored, then nothing to update.
      if(!this.anchored) {
         return;
      }

      // Coordinate frames of interest:  (all 0,0 upper left)
      //   - pane: The overlay is added to a google map pane.  (pane 0,0 at upper left of map div)
      //   - panel: panel base div is relative to the pane
      //   - anchor: positioned relative to the panel.

      // Get the projection so we can calculate locations
      overlay_projection = this._overlayHolder.getProjection();

      // Find the location in pixel coordinates relative to the pane.
      posDiv_pane = overlay_projection.fromLatLngToDivPixel(this.location);

      console.log('Position: ', posDiv_pane);

      // Position panel bottom center on top of the point with arrow pointing at it.
      arrow_size = this.anchorEl.getSize();   // Get the box size of the arrow
      panel_dx = (this.getWidth() / 2);
      panel_dy = this.getHeight() + arrow_size.height + 10;
      arrow_dx = arrow_size.width / 2;
      arrow_dy = -arrow_size.height;

      // left, top relative to pane.
      this.setPosition(posDiv_pane.x - panel_dx, posDiv_pane.y - panel_dy);
      // left, top relative to the panel
      this.anchorEl.setBox(panel_dx - arrow_dx,
                           this.getHeight());
   },

   /**
   * Called after the overlay panel holder has added us to a pane.
   *
   * Should only be called once per map.
   */
   afterAdd: function() {
      // Pass the size configuration
      if(this.sizeConfig) {
         this.setPanelSize(this.sizeConfig);
      }

      // Auto show the popup
      this.show();

      this.fireEvent('afterAdd', this);
   },

   /**
   * Called after the overlay panel holder has removed us from the map.
   */
   afterRemove: function() {
      this.fireEvent('afterRemove', this);

      // finish removal by destroying and cleaning up everything here.
      this.map            = null;
      this._overlayHolder = null;
      this.destroy();
   }
});




/**
* Class for managing panel window popups on a google map component.
*
* This class acts as a store for creating popup panels.  It handles
* all the setup with the map and the glue code to connect the overlay
* to a sencha touch panel.
*
* TODO:
*  -
*
* Do we really need manager?
*
*  - It adds ability to close them all
*  - Adds ability to lookup by name/id.
*
* Note: DOES NOT FUNCTION YET.
*/
vrs.ux.touch.MapPanelMgr = Ext.extend(Ext.util.Observable, {
   /**
   * The google map we are connected to.
   */
   map: null,

   /**
   * The popup that we are managing.
   */
   popup: null,

   constructor: function(config) {

      this.addEvents({
         /** Test event.
         * called as: testevent(blah)
         */
         'testevent': true
      });

      vrs.ux.touch.MapPanelMgr.superclass.constructor.call(this, config);
   }

});
