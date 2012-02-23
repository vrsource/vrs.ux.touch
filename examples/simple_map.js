/*global google: false */
Ext.ns('vrs');

Ext.setup({
   onReady: function() {
      vrs.ctrl = new vrs.AppCtrl();
   },

   statusBarStyle : 'black'
});


/**
* Controller for the application.
*/
Ext.define('vrs.AppCtrl', {
   mixins: {
      observable: 'Ext.mixin.Observable'
   },

   panel: null,

   /** List of markers on the map. */
   markers: null,

   /** The google map for easy access. */
   map: null,

   constructor: function(config) {
      this.initConfig(config);
      this.mixins.observable.constructor.call(this, config);

      //vrs.AppCtrl.superclass.constructor.call(this, config);

      this.panel = vrs.MapPanel.create({ controller: this});
      this.map   = this.panel.mapCmp.getMap();

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
          toolbar, map_options;

      this.addBtn = Ext.Button.create({
         text    : 'Add',
         ui      : 'action',
         handler : function() {
            var ctrl = me.controller,
                map_cmp = me.mapCmp,
                mtypes = map_cmp.getMap().mapTypes;
            console.log('do something');
         }
      });

      this.topToolbar = Ext.Toolbar.create({
         title  : 'Map',
         docked : 'top',
         items  : [
            this.addBtn,
            {xtype: 'spacer'}
         ]
      });

      this.mainPanel = Ext.Panel.create({
         html: 'Put stuff here'
      });

      map_options = {
         center : new google.maps.LatLng(30, -100),
         zoom : 3,
         mapTypeId : google.maps.MapTypeId.HYBRID,
         scaleControl: true,
         mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
         }
      };

      this.mapCmp = Ext.Map.create({
         //mapOptions: map_options
      });

      this.mapCmp.setMapOptions(map_options);

      // finalize the setup
      me.add([
         this.topToolbar,
         this.mapCmp
      ]);
   },

   // -- TEST HELPERS --- //
   tapAddBtn: function() {
      //this.addBtn.doTap(this.addBtn, callHandler(null);
      this.addBtn.getHandler().apply(this.addBtn.getScope(), null);
      //this.addBtn.getHandler().call(null);
   }
});

