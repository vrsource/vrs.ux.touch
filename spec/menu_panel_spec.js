/** Tests for MenuPanel. */

/**
* Wrap the given menu in a panel
* and return the panel.
*/
var wrapPanel = function(menu) {
   var panel = new Ext.form.FormPanel({
      fullscreen: true,
      layout: 'fit',
      items: [
         {
            xtype: 'fieldset',
            items: [menu]
         }
      ]
   });
   return panel;
};

component('Stuff me', function() {
   it('should do good stuff', function() {
      expect(true).toBeTruthy();
   });
});

component('MenuPanel', function() {
   var panel;

   beforeEach(function() {
      panel = null;
   });

   afterEach(function() {
      if(panel !== null)
      {
         panel.destroy();
         panel = null;
      }
   });

   it('Should construct correctly', function() {
      var menu = new vrs.ux.touch.MenuPanel();
      expect(menu).toBeTruthy();
   });


   feature('menu item configuration', function() {
      it('should give new list of items to each object', function() {
         var menu, menu2;
         // given: a menu that has been created and added an item
         menu = vrs.ux.touch.MenuPanel.create();
         menu.getMenuItems().push({content: 'item1'});
         expect(menu.getMenuItems().length).toEqual(1);

         // when: another menu is created, it should not have any items
         menu2 = vrs.ux.touch.MenuPanel.create();
         expect(menu2.getMenuItems().length).toEqual(0);
      });

      it('Should support rendering', function() {
         var menu = new vrs.ux.touch.MenuPanel({
            menuItems: [ {content: 'item1'}]
         });
         panel = wrapPanel(menu);
         expect(menu.rendered).toBeTruthy();
         expect(menu.element.is('.x-menu-panel')).toBeTruthy();
      });

      it('should support configuration of multiple rows', function() {
         var menu = new vrs.ux.touch.MenuPanel({
            menuItems: [
               {content: 'item1'},
               {content: 'item2'}
            ]
         });
         panel = wrapPanel(menu);
         expect(panel.element.select('.x-menupanel-row').getCount()).toEqual(2);
      });

      it('should allow specifying left and right icons', function() {
         var menu, left_src, right_src,
             icon1 = 'resources/img/checked.png',
             icon2 = 'resources/img/chevron.png';

         menu = new vrs.ux.touch.MenuPanel({
            menuItems: [
               {leftIcon: icon1, content: 'item1', rightIcon: icon2}
            ]
         });
         panel = wrapPanel(menu);
         left_src = panel.element.down('.x-menupanel-leftitem > img').getAttribute('src');
         right_src = panel.element.down('.x-menupanel-rightitem > img').getAttribute('src');
         expect(left_src).toEqual(icon1);
         expect(right_src).toEqual(icon2);
      });

      it('should allow specifying left and right icon mask classes', function() {
         var left_img, right_img, menu;
         menu = new vrs.ux.touch.MenuPanel({
            menuItems: [
               {leftIconCls: 'lefty', content: 'item1', rightIconCls: 'righty'}
            ]
         });
         panel = wrapPanel(menu);
         left_img = panel.element.down('.x-menupanel-leftitem > img');
         right_img = panel.element.down('.x-menupanel-rightitem > img');
         expect(left_img.is('.lefty')).toBeTruthy();
         expect(left_img.is('.righty')).toBeFalsy();

         expect(right_img.is('.righty')).toBeTruthy();
         expect(right_img.is('.lefty')).toBeFalsy();
      });

      it('should support setting default values for menu items', function() {
         var left_img, right_img, menu;
         menu = new vrs.ux.touch.MenuPanel({
            menuItemDefaults: {leftIconCls: 'lefty', rightIconCls: 'righty'},
            menuItems: [
               {content: 'item1'}
            ]
         });
         panel = wrapPanel(menu);
         left_img = panel.element.down('.x-menupanel-leftitem > img');
         right_img = panel.element.down('.x-menupanel-rightitem > img');
         expect(left_img.is('.lefty')).toBeTruthy();
         expect(right_img.is('.righty')).toBeTruthy();
      });
   });

   feature('event management', function() {
      // It should support itemtap
      // It should support itemdoubletap
      // It should support itemswipe
      // It should support left and right item events
      // It should support per item events (itemtap, itemdoubletap, itemswipe, etc)
   });


});


/**

Required functionality:

Config and Structure:
* It should support simple configuration and specification of "rows"
* It should allow specifying lead icon and/or disclosure icon
* It should allow specifying a class that is used for mask styling instead
* It should use an item selector internally.
* It should support setting defaults for configuration (ex: right chevron for all items)
* It should support updating the configuration (in place?)
* It should support fast updating in place.  (ie. no DOM changes)

Events:
* It should support events for when the lead/trail objects are tapped
* It should support itemtap
* It should support itemdoubletap
* It should support itemswipe
* It should support events callbacks getting an index of the item selected
* It should support per item events (itemtap, itemdoubletap, itemswipe)
* It should support custom events (per item) for the lead/trail objects tapped


Style:
* It should have a style for when an item is selected (pressedItemCls)
* It should be styled to look like part of a form
* It should support being used inside a fieldset
* It should allow setting a class that gets set for each row.  (allows styling items)
- It should be able to be styled to look fine outside of a form
- It should support a style that looks iPhone-ish

future:
- It should support configuring with a component to use
- It should support fields in righthand side
*/



