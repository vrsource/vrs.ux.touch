//<debug>
Ext.Loader.setPath({
    'Ext': '../../src'
});
//</debug>

/**
 * This simple example shows the ability of the Ext.List component with horizontal content.
 */

//define the application
Ext.define('Oreilly.model.Speaker', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            'id',
            'first_name',
            'last_name',
            'sessionIds',
            'bio',
            'position',
            'photo',
            'affiliation',
            'url',
            'twitter'
        ]
    }
});

Ext.define('Oreilly.store.Speakers', {
    extend: 'Ext.data.Store',

    config: {
        model: 'Oreilly.model.Speaker'
    }
});

Ext.define('Oreilly.util.Proxy', {
    singleton: true,
    requires: ['Ext.data.JsonP'],

    process: function(url) {
        var speakerStore = Ext.getStore('Speakers'),
            speakerIds = [],
            speakerModel;

        Ext.data.JsonP.request({
            url: url,
            callbackName: 'feedCb',

            success: function(data) {
                Ext.Array.each(data.proposals, function(proposal) {
                    Ext.Array.each(proposal.speakers, function(speaker) {
                        // don't add duplicates or items with no photos.
                        if (speakerIds.indexOf(speaker.id) == -1 && speaker.photo) {
                            speakerIds.push(speaker.id);

                            speakerModel = Ext.create('Oreilly.model.Speaker', speaker);
                            speakerStore.add(speakerModel);
                        }
                    });
                });
            }
        });
    }
});

Ext.application({
    glossOnIcon: false,
    icon: {
        57: 'resources/icons/icon.png',
        72: 'resources/icons/icon@72.png',
        114: 'resources/icons/icon@2x.png',
        144: 'resources/icons/icon@114.png'
    },

    phoneStartupScreen: 'resources/loading/Homescreen.jpg',
    tabletStartupScreen: 'resources/loading/Homescreen~ipad.jpg',

    //require any components/classes what we will use in our example
    requires: [
        'Ext.List'
    ],

    /**
     * The launch method is called when the browser is ready, and the application can launch.
     */
    launch: function() {
        //create a store instance
        var store = Ext.create('Oreilly.store.Speakers', { id: 'Speakers' });
        Oreilly.util.Proxy.process('feed.js');

        // add the list as an item to the viewport
        Ext.Viewport.add({
            layout: {
                type: 'vbox',
                pack: 'center'
            },
            items: [
                {
                    //give it an xtype of list for the list component
                    xtype: 'dataview',

                    height: 205,

                    scrollable: 'horizontal',

                    inline: {
                        wrap: false
                    },

                    //set the itemtpl to show the fields for the store
                    itemTpl: '<img src="{photo}"><div>{first_name} {last_name}</div>',

                    //bind the store to this list
                    store: store
                }
            ]
        });
    }
});
