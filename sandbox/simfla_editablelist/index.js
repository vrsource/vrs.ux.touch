Ext.ns('simfla.ux.plugins.demo');

Ext.regModel('Contact', {
    fields: ['firstName', 'lastName']
});

simfla.ux.plugins.demo.store = new Ext.data.Store({
    model: 'Contact',
    sorters: 'firstName',

    data: [
        {firstName: 'Tommy', lastName: 'Maintz'},
        {firstName: 'Ed', lastName: 'Spencer'},
        {firstName: 'Jamie', lastName: 'Avins'},
        {firstName: 'Aaron', lastName: 'Conran'},
        {firstName: 'Dave', lastName: 'Kaneda'},
        {firstName: 'Michael', lastName: 'Mullany'},
        {firstName: 'Abraham', lastName: 'Elias'},
        {firstName: 'Jay', lastName: 'Robinson'}
    ]
})

Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady : function() {
        var app =  new Ext.Panel({
            fullscreen: true,
            layout: 'fit',
            dockedItems:[{
                xtype: 'toolbar',
                title: 'EditableList Plugin',
                items: [{
                    xtype: 'button',
                    editText: 'Edit',
                    doneText: 'Done',
                    listId: 'MyList',
                    editCallback: function(){alert('your edit callback')},
                    plugins: [ new simfla.ux.plugins.editableListButton() ]
                }]
            }],
            items: [{
                xtype: 'list',
                style: 'background-color: Transparent;',
                id: 'MyList',
                allowDeselect: true,
                clearSelectionOnDeactivate: true,
                layout: 'fit',
                store: simfla.ux.plugins.demo.store,
                itemTpl: '{firstName} <strong>{lastName}</strong>',
                grouped: false,
                indexBar: false,
                singleSelect: true,
                listeners:{
                    itemtap: function(list){
                        if(list.plugins[0].isEditing()){
                            return;
                        }
                        //Your stuff here
                        alert('You taped a record')
                    }
                },
                plugins: [new simfla.ux.plugins.editableList()]
                }]
            });
        
    }
});
