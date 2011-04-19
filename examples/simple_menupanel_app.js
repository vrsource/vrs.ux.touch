Ext.setup({
onReady: function() {

   checkClicked = function(list, itemNum) {
      console.log("Clicked");
   }

   form_items = [
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
   ]

   var form_list = new MenuPanel({
      formItems: form_items,
      listeners: {
         itemTap:       function(fl, index) { console.log('Tapped index: ', index); },
         itemDoubleTap: function(fl, index) { console.log('Double tapped index: ', index); },
         itemSwipe:     function(fl, index) { console.log('Swipped index: ', index); },
         leftTap:       function(fl, index) { console.log('Left item selected: ', index); },
         rightTap:      function(fl, index) { console.log('Right item selected: ', index); },
         scope: this
      }
   });


   // --- MENU SELECTION TEST --- //
   // Demo of doing selection on a menu (slow method of refresh)
   menuItemSelected = function(formList, index, el, ev) {
      console.log('Item selected: ', index);
      // Change the check to be on the one that was just selected
      Ext.each(formList.formItems, function(item, i) {
         item.leftIconCls = ((i === index) ? 'check1' : null);
      });
      formList.refresh();
   };

   var menu_list = new MenuPanel({
      formItemDefaults: {
         rightIcon: 'img/chevron.png'
      },
      listeners: {
         itemTap: menuItemSelected
      },
      formItems: [
         {content: 'Area 1'},
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
      Ext.each(formList.formItems, function(item, i) {
         var left_icon_cls = ((i === index) ? 'check1' : null);
         formList.updateItem(i, {leftIconCls: left_icon_cls});
      });
   };

   var menu_list2 = new MenuPanel({
      formItemDefaults: {
         rightIcon: 'img/chevron.png'
      },
      listeners: {
         itemTap: fastMenuItemSelected
      },
      formItems: [
         {content: 'Area 1'},
         {content: 'Area 2'},
         {content: 'Area 3'},
         {content: 'Area 4'}
      ]
   });


   var panel = new Ext.form.FormPanel({
      fullscreen: true,
      scroll: 'vertical',
      cls: 'x-form-settings-panel',
      dockedItems: [
         {
            dock : 'top',
            xtype: 'toolbar',
            title: 'Form List',
         }
      ],
      items: [
         {
            xtype: 'fieldset',
            title: 'Section 1',
            instructions: 'This is a nifty little panel.',
            items: [form_list]
         },
         {
            xtype: 'fieldset',
            title: 'Menu Example',
            instructions: 'This menu uses a full update and refresh.',
            items: [menu_list]
         },
         {
            xtype: 'fieldset',
            title: 'Faster Menu Example',
            instructions: 'This menu uses updateItem for updates.',
            items: [menu_list2]
         }
      ]


   });
}
});

