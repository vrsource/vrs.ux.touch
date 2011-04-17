Ext.setup({
onReady: function() {

   var panel = new Ext.Panel({
      fullscreen: true,
      dockedItems: [
         {
            dock : 'top',
            xtype: 'toolbar',
            title: 'Desired UIs',
         }
      ],
      items: [
      {
         xtype: 'panel',
         id: 'list_panel',
         style: {
            backgroundColor: 'orange'
         },
         layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start',
         },
         items: [
            // row 1
            {
               xtype: 'panel',
               id: 'row1',
               style: {
                  backgroundColor: 'blue'
               },
               layout: {
                  type: 'hbox',
                  //pack: 'stretch',
                  pack: 'justify',
                  //align: 'end'
               },
               items: [
                  {
                     xtype: 'button',
                     text: 'Delete',
                     ui: 'decline-small'
                  },
                  { html: 'My Text' },
                  {
                     xtype: 'button',
                     text: 'Something',
                     ui: 'small'
                  }
               ]
            },
            // row 2
            {
               xtype: 'panel',
               id: 'row2',
               style: {
                  backgroundColor: 'blue'
               },
               layout: {
                  type: 'hbox',
                  //pack: 'stretch',
                  pack: 'justify',
                  //align: 'end'
               },
               items: [
                  { html: 'My Text' },
                  {
                     xtype: 'togglefield',
                     //label: 'another',
                     //ui: 'decline-small'
                  }

               ]
            },
            // row 3
            {
               xtype: 'panel',
               id: 'row3',
               style: {
                  backgroundColor: 'blue'
               },
               layout: {
                  type: 'hbox',
                  //pack: 'stretch',
                  pack: 'justify',
                  //align: 'end'
               },
               items: [
                  {
                     xtype: 'button',
                     text: 'Delete',
                     ui: 'decline-small'
                  },
                  { html: 'My Text' },
                  {
                     xtype: 'button',
                     text: 'Something',
                     ui: 'small'
                  }
               ]
            },
            // row 4
            {
               xtype: 'panel',
               id: 'row4',
               style: {
                  backgroundColor: 'blue'
               },
               layout: {
                  type: 'hbox',
                  //pack: 'stretch',
                  pack: 'justify',
                  //align: 'end'
               },
               items: [
                  { html: 'My Text' },
                  {
                     xtype: 'spinnerfield',
                     minValue: 0,
                     maxValue: 100,
                     value: 50
                     //label: 'another',
                     //ui: 'decline-small'
                  },
                  { html: 'My Text' },

               ]
            },

         ]
      }
      ]
   });
}
});

