/*global google: false */
Ext.ns('vrs');

Ext.setup({
   onReady: function() {
      vrs.ctrl = new vrs.AppCtrl();
   },

   fullscreen     : true,
   statusBarStyle : 'black'
});


/**
* Controller for the application.
*/
vrs.AppCtrl = Ext.extend(Ext.util.Observable, {
   panel: null,

   /** List of markers on the map. */
   markers: null,

   /** The google map for easy access. */
   map: null,

   constructor: function(config) {
      vrs.AppCtrl.superclass.constructor.call(this, config);

      this.panel = new vrs.MapPanel({ controller: this});
      this.map   = this.panel.mapCmp.map;

      this.panel.on('activate', this.onActivate, this);
      this.initMap();
   },

   onActivate: function() {
   },

   /**
   * Initialize the map and setup some markers and windows for testing.
   */
   initMap: function() {
      var me = this,
          i,
          marker;

      this.markers = [];

      /** Return a standard handler that will popup details about the marker. */
      function make_std_handler(marker, idx) {
         return function(event) {
            var popup_window, sub_panel;

            console.log('clicked marker: ' + marker.getTitle(), marker);

            popup_window = new vrs.ux.touch.GmapPopupPanel({
               location : marker.position,
               map      : me.map,
               hideOnMaskTap    : true,
               autoRemoveOnHide : true,
               sizeConfig: {
                  size: 'small-wide'
               },

               id: 'mypanel',
               items: [{
                  html: "<b>Name:</b> " + marker.featureData.name
               }]
            });
         };
      }

      /** Create popup windows that require clicking close to remove. */
      function make_close_handler(marker, idx) {
         return function(event) {
            var popup_window, sub_panel;

            console.log('clicked marker: ' + marker.getTitle(), marker);

            popup_window = new vrs.ux.touch.GmapPopupPanel({
               location : marker.position,
               map      : me.map,
               hideOnMaskTap    : false,
               autoRemoveOnHide : true,
               sizeConfig: {
                  size: 'small-wide'
               },

               id: 'close_panel' + idx,
               dockedItems: [{
                  xtype: 'toolbar',
                  title: 'Stuff',
                  dock: 'top',
                  items: [{
                     xtype: 'button',
                     text: 'close',
                     handler: function() { popup_window.remove(); }
                  }]
               }],
               items: [{
                  html: "<b>Name:</b> " + marker.featureData.name
               }]
            });
         };
      }

      /** Make a popup that is not anchored. */
      function make_nonanchored_handler(marker, idx) {
         return function(event) {
            var popup_window, sub_panel;

            console.log('clicked marker: ' + marker.getTitle(), marker);

            popup_window = new vrs.ux.touch.GmapPopupPanel({
               location : marker.position,
               map      : me.map,
               anchored : false,

               hideOnMaskTap    : false,
               autoRemoveOnHide : true,
               sizeConfig: {
                  size: 'small-wide'
               },

               id: 'close_panel' + idx,
               dockedItems: [{
                  xtype: 'toolbar',
                  title: 'Anchor Test',
                  dock: 'top',
                  items: [
                     {
                        xtype: 'button',
                        text: 'close',
                        handler: function() { popup_window.remove(); }
                     },
                     {xtype: 'spacer'},
                     {
                        xtype: 'button',
                        text: 'toggle',
                        handler: function() {
                           if(popup_window.anchored) {
                              popup_window.setPanelSize({ fullscreen: true });
                           } else {
                              popup_window.setPanelSize({ size: 'small-wide' });
                           }
                        }
                     }
                  ]
               }],
               items: [{
                  html: "<b>Name:</b> " + marker.featureData.name
               }]
            });
         };
      }


      // Add some random markers to the scene.
      for(i=0; i<5; i++) {
         marker = new google.maps.Marker({
            position: this.randomPosition(),
            //icon: '../resources/img/flag.png',
            featureData: {
               name: 'My Random Feature: ' + i
            }
         });
         marker.setMap(this.map);
         this.markers.push(marker);
         google.maps.event.addListener(marker, 'mousedown', make_std_handler(marker, i));
      }

      // Add some closable markers
      for(i=0; i<5; i++) {
         marker = new google.maps.Marker({
            position: this.randomPosition(),
            icon: '../resources/img/flag.png',
            featureData: {
               name: 'Closing Feature: ' + i
            }
         });
         marker.setMap(this.map);
         this.markers.push(marker);
         google.maps.event.addListener(marker, 'mousedown', make_close_handler(marker, i));
      }

      // Add some non_anchored markers
      for(i=0; i<5; i++) {
         marker = new google.maps.Marker({
            position: this.randomPosition(),
            icon: '../resources/img/anchor.png',
            featureData: {
               name: 'Anchored Feature: ' + i
            }
         });
         marker.setMap(this.map);
         this.markers.push(marker);
         google.maps.event.addListener(marker, 'mousedown', make_nonanchored_handler(marker, i));
      }
   },


   randomPosition: function() {
      return new google.maps.LatLng(20.0 + Math.random()*40.0,
                                    -130 + Math.random()*70.0);
   }
});


/*
* Main view for the application.
*/
vrs.MapPanel = Ext.extend(Ext.Panel, {
   cls: 'map_panel',

   controller: null,
   fullscreen: true,

   layout: {
      type: 'vbox',
      align: 'stretch'
   },

   initComponent: function() {
      var me = this,
          ctrl = this.controller,
          toolbar;

      this.addBtn = new Ext.Button({
         text: 'Add',
         ui: 'action',
         handler: function() {
            var ctrl = me.controller,
                map_cmp = me.mapCmp,
                mtypes = map_cmp.map.mapTypes;

            console.log('do something');
         }
      });

      this.topToolbar = new Ext.Toolbar({
         title: 'Map',
         dock: 'top',
         items: [
            this.addBtn,
            {xtype: 'spacer'}
         ]
      });

      this.mainPanel = new Ext.Panel({
         html: 'Put stuff here'
      });

      this.mapCmp = new Ext.Map({
         mapOptions: {
            center : new google.maps.LatLng(30, -100),
            zoom : 3,
            mapTypeId : google.maps.MapTypeId.HYBRID,
            scaleControl: true,
            mapTypeControlOptions: {
               style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
         }
      });

      // finalize the setup
      this.dockedItems = [
         this.topToolbar
      ];

      this.items = [
         this.mapCmp
      ];

      // Finish setup
      vrs.MapPanel.superclass.initComponent.call(this);
   },

   // -- TEST HELPERS --- //
   tapAddBtn: function() {
      this.addBtn.callHandler(null);
   }
});

