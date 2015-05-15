/*global Ext */
Ext.ns('vrs');

/**
* Extension to PanelController that allows for dialog display
* and interaction.
*
* TODO:
*  - Extend this to allow operation in 3 modes:
*    - modal central dialog
*    - slide in sheet (full or partial screen)
*    - showBy popup window
*/
Ext.define('vrs.DialogController', {
   extend: 'vrs.PanelController',

   config: {

      /**
      * Callback function which is called when dialog is dismissed by interaction.
      *
      *  params:
      *    - buttonId: (string) id of the button as defined by the specific dialog
      *    - dialog: (obj) reference to this object
      */
      completeFn: null,

      /**
      * The scope of the callback function
      */
      scope: null,

      /**
      * If true, then we are modal during interaction.
      */
      modal: true,

      /** If true, center the dialog. */
      centered: true,

      width  : null,
      height : null
   },

   show: function(options) {
      this._preShowPanel(options);
      this.getPanel().show();
   },

   showBy: function(component, options) {
      this._preShowPanel(options);
      this.getPanel().showBy(component);
   },

   /** Helper to perform common panel setup operations. */
   _preShowPanel: function(options) {
      var panel = this.getPanel();

      if(!panel.getParent() && Ext.Viewport) {
         Ext.Viewport.add(panel);
      }

      this.setConfig(options);

      var panel_options = {
         modal : this.getModal(),
         centered : this.getCentered()
      };
      if(this.getWidth() !== null) {
         panel_options.width = this.getWidth();
      }
      if(this.getHeight() !== null) {
         panel_options.height = this.getHeight();
      }

      panel.setConfig(panel_options);
   },

   _finishDialog: function(buttonId) {
      var fn = this.getCompleteFn(),
          panel = this.getPanel(),
          me = this;

      // If we have a completeFn, then setup to call it once the dialog
      // component is hidden
      if(_.isFunction(fn)) {
         panel.on({
            hiddenchange: function() {
               fn.call(me.getScope() || me, buttonId, me);
            },
            single: true
         });
      }

      panel.hide();
   }
});
