Ext.setup({
onReady: function() {
   var menu_items,
       menu, selection_menu, panel;

   menu_items = [
      {content: 'Photo Gallery', leftIcon: 'img/flower.png', rightIcon: 'img/chevron.png'},
      {content: 'Messaging', leftIcon: 'img/sms.png', rightIcon: 'img/chevron.png'},
      {content: 'Allow Tracking', leftIcon: 'img/checked.png' }
   ];

   menu = new vrs.ux.touch.MenuPanel({
      menuItems: menu_items,
      listeners: {
         itemTap:       function(fl, index) { console.log('Tapped index: ', index); },
         leftTap:       function(fl, index) { console.log('Left item selected: ', index); },
         rightTap:      function(fl, index) { console.log('Right item selected: ', index); }
      }
   });

   // Selection menu
   selection_menu = new vrs.ux.touch.MenuPanel({
      listeners: {
         itemTap: function(formList, index, el, ev) {
            // Change the check to be on the one that was just selected
            Ext.each(formList.menuItems, function(item, i) {
               var left_icon_cls = ((i === index) ? 'check1' : null);
               formList.updateItem(i, {leftIconCls: left_icon_cls});
            });
         }
      },
      menuItems: [
         {leftIconCls: 'check1', content: 'Item 1'},
         {content: 'Item 2'},
         {content: 'Item 3'},
         {content: 'Item 4'},
         {content: 'Add Item...', itemtap: function() {alert('Add item');} }
      ]
   });

   panel = new Ext.form.FormPanel({
      fullscreen: true,
      scroll: 'vertical',
      dockedItems: [
         {
            dock : 'top',
            xtype: 'toolbar',
            title: 'Menu Panel'
         }
      ],
      items: [
         {
            xtype: 'fieldset',
            title: 'Mixed Menu and Form Fields',
            instructions: 'This shows how to mix menu in with other fields.',
            items: [
               menu,
               {
                  xtype: 'textfield',
                  name: 'name',
                  label: 'Name',
                  placeHolder: 'Tom Roy',
                  autoCapitalize : true,
                  required: true,
                  useClearIcon: true
               }, {
                  xtype: 'togglefield',
                  name: 'enable',
                  label: 'Enable'
               }, {
                   xtype: 'passwordfield',
                   name: 'password',
                   label: 'Password',
                   placeHolder: 'Select each time',
                   useClearIcon: true
               }
            ]
         },
         {
            xtype: 'fieldset',
            title: 'Selection Menu',
            instructions: 'This panel allows selection of the menu items.',
            items: [selection_menu]
         }
      ]

   });
}
});

