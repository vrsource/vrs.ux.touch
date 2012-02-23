/**
* Misc bug fixes to Sencha Touch.
*
* Because Sencha Touch doesn't have a public repository, there is often a lag
* between the time a fix is available on the forums and the time it is in a
* release.  This file collects the ones we have found to be needed and
* puts them into a place where we can collect and use them across
* various projects.
*
* Each fix should include a description, link to forum posting, and a bug number.
*/

/*
* Ext.Map mapOptions not taking effect.
*
* forum: http://www.sencha.com/forum/showthread.php?182767
* bug: TOUCH-2223
*/
Ext.override('Ext.overrides.Map', {
    override: 'Ext.Map',
    getMapOptions: function() {
        return Ext.merge({}, this.options || this.getInitialConfig('mapOptions'));
    }
});
