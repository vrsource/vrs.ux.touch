Ext.define('Kitchensink.profile.Phone', {
    extend: 'Kitchensink.profile.Base',

    config: {
        controllers: ['Main']
    },

    isActive: function() {
        return Ext.os.is.Phone; // || Ext.os.is.Desktop;
    },

    launch: function() {
        Ext.create('Kitchensink.view.phone.Main');

        this.callParent();
    }
});
