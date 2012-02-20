/** Spec for the open layers extension. */

/*
component('Ext.ex.OpenlayersMap', function() {
   feature('Should support component lifecycle', function() {

      it('should be able to be constructed', function() {
         var map_layer = new Ext.ux.OpenLayersMap();
         expect(map_layer.map).toBeDefined();
      });

      it('should support rendering in a scene', function() {
         var map_layer = new Ext.ux.OpenLayersMap(),
             panel = new Ext.Panel({
            fullscreen: true,
            layout: 'fit',
            items: [map_layer]
         });
         expect(map_layer.rendered).toBeTruthy();         // should have rendered.
         expect(map_layer.el.is('.olMap')).toBeTruthy();  // Make sure it was created
         panel.destroy();
      });

      it('should support destruction correctly', function() {
         var map_layer = new Ext.ux.OpenLayersMap();
         map_layer.destroy();
         expect(map_layer.map).toBeNull();
      });
   });

   it('should support updating the center', function() {
      var map_layer = new Ext.ux.OpenLayersMap({
               mapOptions: {
                  layers: [new OpenLayers.Layer.Vector('m', {isBaseLayer: true})]
               }
            }),
         panel = new Ext.Panel({
         fullscreen: true,
         layout: 'fit',
         items: [map_layer]
      });
      this.after(function() { panel.destroy(); });
      expect(map_layer.rendered).toBeTruthy();         // should have rendered.

      map_layer.updateCenter({latitude: 40, longitude: 40});
   });

   it('should support masking the UI', function() {
      var map_layer = new Ext.ux.OpenLayersMap({maskMap: true}),
          panel = new Ext.Panel({
         fullscreen: true,
         layout: 'fit',
         items: [map_layer]
      });
      expect(map_layer.mask).toBeTruthy();         // should have rendered.
      panel.destroy();
   });

   feature('Ipad support', function() {
      var old_ipad;
      beforeEach(function() {
         old_ipad = Ext.is.iPad;
         Ext.is.iPad = true;
      });
      afterEach(function() { Ext.is.iPad = old_ipad; });

      it('should support the ipad', function() {
         var map_layer = new Ext.ux.OpenLayersMap(),
             panel = new Ext.Panel({
            fullscreen: true,
            layout: 'fit',
            items: [map_layer]
         });
         panel.destroy();
      });
   });

   feature("If we don't have OpenLayers, it should contiune", function() {
      var old_open_layers;
      beforeEach(function() {
         old_open_layers = OpenLayers;
         OpenLayers = null;
      });
      afterEach(function() { OpenLayers = old_open_layers; });

      it('should allow contruction', function() {
         var map_layer = new Ext.ux.OpenLayersMap();
      });
   });

   feature('Geolocation updating', function() {

      it('should start auto tracking if configured to do so', function() {
         spyOn(Ext.ux.OpenLayersMap.prototype, 'startAutoTracking');
         var map_layer = new Ext.ux.OpenLayersMap({useCurrentLocation: true});
         expect(map_layer.startAutoTracking).toHaveBeenCalled();
      });


      //it('can be called with location error', function() {
         //spyOn(Ext.ux.OpenLayersMap.prototype, 'startAutoTracking');
         //var map_layer = new Ext.ux.OpenLayersMap({useCurrentLocation: true});
         //map_layer.onGeoError('error');
      //});


      it('should allow construction with geo location', function() {
         var map_layer, panel;
         runs(function() {
            spyOn(Ext.ux.OpenLayersMap.prototype, 'onGeoUpdate').andCallThrough();
            map_layer = new Ext.ux.OpenLayersMap({useCurrentLocation: true});
            panel = new Ext.Panel({
               fullscreen: true,
               layout: 'fit',
               items: [map_layer]
            });
            this.after(function() { panel.destroy(); });
            expect(map_layer.geo).toBeDefined();
         });

         waitsFor(function() {
            return map_layer.lastGeoObj !== null;
         });

         runs(function() {
            expect(Ext.ux.OpenLayersMap.prototype.onGeoUpdate).toHaveBeenCalled();
            map_layer.stopAutoTracking();
            //panel.destroy();
         });
      });

   });
});
*/