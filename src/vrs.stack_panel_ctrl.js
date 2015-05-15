/*global Ext */
Ext.ns('vrs');

/**
* Slightly customized PanelController that knows how to act as
* a child of a stack holder (PanelHolder).
*
* Note: this should probably be a mixin long term, but for now
*       we will just use a new class.
*
* TODO:
*  - Change placeholder values to be configured
*/
Ext.define('vrs.StackPanelController', {
   extend: 'vrs.PanelController',

   config: {
      /**
      * @cfg backName
      *
      * If set, this is the text that should be displayed in the back button
      * of any panels we push onto the stack.  (ie. buttons that come back to us)
      */
      backName: null,

      /**
      * @cfg panelHolder Our current panel holder.
      * @required
      * Should call to this to push, pop, and clear the stack and do any other holder ops.
      * (this is set by the controller stack that we get pushed onto)
      */
      panelHolder: null,

      /**
      * @cfg isBaseController
      *
      * If set true, then as part of construction, will set the
      * controller as base on the holder.  (can only happen for one controller in holder)
      *
      * note: we do it this way to make sure the panel construction code knows
      *       if we are the base controller or not and what our holderPanel is.
      */
      isBaseController: false,

      /**
      * UI selectors for automatically setting up back, home, and navigation
      * information.  If they are set, then we will try to replace
      * any UI controls of the given name with controls and settings
      * for controlling the stack.
      */
      backBtnSelector    : '#backBtn',
      homeBtnSelector    : '#homeBtn',
      navToolbarSelector : '#navToolbar'
   },

   constructor: function(config) {
      this.callParent(arguments);
      //assert(this.getPanelHolder() !== null, "Must set stack controller on new Panels.");
   },

   /**
   * When panel changes, check for placeholders to override.
   */
   updatePanel: function(panel, oldPanel) {
      //this.callParent(arguments);
      // Look for and replace any placeholders
      if(panel) {
         this._replacePlaceholders();
      }
   },

   destroy: function() {
      //console.log("Destroying panel for control: ", this);
      this.setPanelHolder(null);  // Clear reference to the stack
      this.callParent(arguments);
   },

   // --- Helpers to figure out where we are being used --- //
   isBaseController: function() {
      return this.getIsBaseController();
   },

   /** Return true if we are being shown in a side panel. */
   inSidePanel: function() {
      if(!this.getPanelHolder())
      { return false; }

      return this.getPanelHolder().getInSidePanel();
   },

   /** Return true if we are being shown in a popup panel. */
   inPopupPanel: function() {
      if(!this.getPanelHolder()) { return false; }
      return this.getPanelHolder().getInPopupPanel();
   },

   // ---- CONTROLLER HELPERS ---- //
   /**
   * Search for placeholders on the panel and replace them as needed.
   * @private
   */
   _replacePlaceholders: function() {
      var me = this,
          panel = this.getPanel(),
          found;

      // Find back button
      if(this.getBackBtnSelector()) {
         found = panel.query(this.getBackBtnSelector());
         if(found.length > 1) {
            console.warn('Found multiple back buttons');
         }
         if(found.length > 0) {
            this._overrideBackBtn(found[0]);
         }
      }

      // Find home button
      if(this.getHomeBtnSelector()) {
         found = panel.query(this.getHomeBtnSelector());
         if(found.length > 1) {
            console.warn('Found multiple home buttons');
         }
         if(found.length > 0) {
            this._overrideHomeBtn(found[0]);
         }
      }

      // Find toolbar
      if(this.getNavToolbarSelector()) {
         found = panel.query(this.getNavToolbarSelector());
         if(found.length > 1) {
            console.warn('Found multiple nav toolbars');
         }
         if(found.length > 0) {
            this._overrideNavToolbar(found[0]);
         }
      }
   },

   /** @private */
   _overrideBackBtn: function(btn) {
      var me = this,
          back_txt,
          prev_ctrl = this.getPanelHolder().getPrevCtrl();

      back_txt = (prev_ctrl && prev_ctrl.getBackName()) || 'Back';

      if(Ext.isEmpty(btn.getText())) {
         btn.setText(back_txt);
      }
      btn.setUi('back');
      btn.on('tap', function() { me.getPanelHolder().popFocusCtrl(); });
   },

   /** @private */
   _overrideHomeBtn: function(btn) {
      var me = this;

      btn.setUi('action');
      btn.setIconCls('home');
      btn.on('tap', function() { me.getPanelHolder().gotoBaseController(); });
   },

   /** @private */
   _overrideNavToolbar: function(toolbar) {
      var me = this,
          back_btn, home_btn,
          toolbar_items = [],
          holder = this.getPanelHolder();

      // If in stack and not base controller, need navigation
      if(holder && holder.getUseStack() && !this.isBaseController()) {
         // - Create back buttn
         back_btn = new Ext.Button({
            itemId: 'backBtn'
         });
         this._overrideBackBtn(back_btn);

         // - If not in side panel and not in popup, then need home button
         if(!holder.getInSidePanel()  && !holder.getInPopupPanel()) {
            // create home button
            home_btn = new Ext.Button({
               itemId: 'homeBtn'
            });
            this._overrideHomeBtn(home_btn);
         }
      }
      if(back_btn) {
         toolbar_items.push(back_btn);
      }
      toolbar_items.push({xtype: 'spacer'});
      if(home_btn) {
         toolbar_items.push(home_btn);
      }

      toolbar.setItems(toolbar_items);
   }
});
