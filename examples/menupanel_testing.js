Ext.setup({
onReady: function() {
   var checkClicked, menu_items, form_list,
       menuItemSelected, menu_list, fastMenuItemSelected,
       menu_list2, menu_part1, menu_part2, panel;

   checkClicked = function(list, itemNum) {
      console.log("Clicked");
   };

   menu_items = [
      {content: 'Item 1', leftIcon: 'img/checked.png', rightIcon: 'img/chevron.png'},
      {content: 'Item 1.5', leftIcon: 'img/checked.png', rightIcon: 'img/chevron.png'},
      {content: 'Just Right', rightIcon: 'img/chevron.png'},
      {content: 'Item with Masks', leftIconCls: 'star', rightIconCls: 'arrow_right'},
      {content: 'Item with Masks', leftIconCls: 'check1', rightIconCls: 'arrow_right'},
      {content: 'Add Item...', itemtap: function() {console.log('Add item');} },
      {content: 'First'},
      {
         content: 'Custom Events',
         leftIconCls: 'check1',
         rightIconCls: 'arrow_right',
         itemtap: function() {console.log('custom itemtap', arguments);},
         itemdoubletap: function() {console.log('custom itemdoubletap', arguments);},
         itemswipe: function() {console.log('custom itemswipe', arguments);},
         lefttap: function() {console.log('custom lefttap', arguments);},
         righttap: function() {console.log('custom righttap', arguments);}
      }
   ];

   form_list = new vrs.ux.touch.MenuPanel({
      menuItems: menu_items,
      listeners: {
         itemtap:       function(fl, index) { console.log('Tapped index: ', index); },
         itemdoubletap: function(fl, index) { console.log('Double tapped index: ', index); },
         itemswipe:     function(fl, index) { console.log('Swipped index: ', index); },
         lefttap:       function(fl, index) { console.log('Left item selected: ', index); },
         righttap:      function(fl, index) { console.log('Right item selected: ', index); },
         scope: this
      }
   });


   // --- MENU SELECTION TEST --- //
   // Demo of doing selection on a menu (slow method of refresh)
   menuItemSelected = function(formList, index, el, ev) {
      console.log('Item selected: ', index);
      // Change the check to be on the one that was just selected
      var menu_items = formList.getMenuItems();
      Ext.each(menu_items, function(item, i) {
         item.leftIconCls = ((i === index) ? 'check1' : null);
      });
      formList.refresh();
   };

   menu_list = new vrs.ux.touch.MenuPanel({
      menuItemDefaults: {
         rightIcon: 'img/chevron.png'
      },
      listeners: {
         itemtap: menuItemSelected
      },
      menuItems: [
         {leftIconCls: 'check1', content: 'Area 1'},
         {content: 'Area 2'},
         {content: 'Area 3'},
         {content: 'Area 4'}
      ]
   });

   // -- FAST MENU TEST -- //
   //
   fastMenuItemSelected = function(formList, index, el, ev) {
      console.log('Item selected: ', index);
      // Change the check to be on the one that was just selected
      var menu_items = formList.getMenuItems();
      Ext.each(menu_items, function(item, i) {
         var left_icon_cls = ((i === index) ? 'check1' : null);
         formList.updateItem(i, {leftIconCls: left_icon_cls});
      });
   };

   menu_list2 = new vrs.ux.touch.MenuPanel({
      menuItemDefaults: {
         rightIcon: 'img/chevron.png'
      },
      listeners: {
         itemtap: fastMenuItemSelected
      },
      menuItems: [
         {leftIconCls: 'check1', content: 'Area 1'},
         {content: 'Area 2'},
         {content: 'Area 3'},
         {content: 'Area 4'}
      ]
   });


   // -- TEST WITH FORM FIELDS -- //
   menu_part1 = new vrs.ux.touch.MenuPanel({
      menuItemDefaults: {
         rightIcon: 'img/chevron.png'
      },
      menuItems: [
         {content: 'Item 1'},
         {content: 'Item 2'}
      ]
   });
   menu_part2 = new vrs.ux.touch.MenuPanel({
      menuItemDefaults: {
         rightIcon: 'img/chevron.png'
      },
      menuItems: [
         {content: 'Item 3'},
         {content: 'Item 4'}
      ]
   });


   panel = new Ext.form.FormPanel({
      fullscreen: true,
      scroll: 'vertical',
      cls: 'x-form-settings-panel',
      id: 'MyFormPanel',
      items: [
         {
            docked : 'top',
            xtype: 'toolbar',
            title: 'Menu Panel Test'
         },
         {
            xtype: 'fieldset',
            title: 'Section 1',
            instructions: 'This panel uses the MenuPanel to display items in a field set.',
            items: [form_list]
         },
         {
            xtype: 'fieldset',
            title: 'Menu Example',
            instructions: 'Select item to check it. This menu uses a full update and refresh.',
            items: [menu_list]
         },
         {
            xtype: 'fieldset',
            title: 'Faster Menu Example',
            instructions: 'Select item to check it. This menu uses updateItem for updates.',
            items: [menu_list2]
         },
         {
            xtype: 'fieldset',
            title: 'Mixed Menu and Form Fields',
            instructions: 'This shows how to mix menu in with other fields.',
            items: [
               menu_part1,
               {
                  xtype: 'textfield',
                  name: 'name',
                  label: 'Name',
                  placeHolder: 'Tom Roy',
                  autoCapitalize : true,
                  required: true,
                  useClearIcon: true
               }, {
                   xtype: 'passwordfield',
                   name: 'password',
                   label: 'Password',
                   placeHolder: 'Select each time',
                   useClearIcon: true
               }, {
                   xtype: 'emailfield',
                   name: 'email',
                   label: 'Email',
                   placeHolder: 'me@sencha.com',
                   useClearIcon: true
               }, {
                   xtype: 'urlfield',
                   name: 'url',
                   label: 'Url',
                   placeHolder: 'http://sencha.com',
                   useClearIcon: true
               }, {
                   xtype: 'checkboxfield',
                   name: 'cool',
                   label: 'Cool'
               }, {
                   xtype: 'datepickerfield',
                   name: 'birthday',
                   label: 'Birthday',
                   picker: { yearFrom: 1900 }
               }, {
                   xtype: 'selectfield',
                   name: 'rank',
                   label: 'Rank',
                   options: [{
                       text: 'Master',
                       value: 'master'
                   }, {
                       text: 'Journeyman',
                       value: 'journeyman'
                   }, {
                       text: 'Apprentice',
                       value: 'apprentice'
                   }]
               }, {
                   xtype: 'hiddenfield',
                   name: 'secret',
                   value: false
               },
               menu_part2,
               {
                  xtype: 'sliderfield',
                  name: 'value',
                  label: 'Value'
               }, {
                  xtype: 'togglefield',
                  name: 'enable',
                  label: 'Enable'
               }, {
                  xtype: 'spinnerfield',
                  label: 'spinner',
                  minValue: 0,
                  maxValue: 100,
                  cycle: true
               }, {
                  xtype: 'searchfield',
                  placeHolder: 'Search',
                  name: 'searchfield'
               }
               //*/
            ]
         }
      ]


   });
}
});

