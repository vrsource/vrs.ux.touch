/*global Ext, assert */
Ext.ns('vrs');

/**
* (Stack) Panel Holder
*
* This is a controller/panel that acts as the holder for PanelControllers.
* It supports several variations based upon the usage context and is designed
* to simplify the development of panel controllers by allowing them to be
* used in multiple use cases.  (ex: popup windows, sliding stacks, side panels, etc).
*
* The supported variability points are:
*
* 1) Stack Support
*
* Maintains panel that can have PanelControllers managed on a stack
* within it. Holds a main Ext.Panel that can have controllers pushed on.
* It is set with one primary controller that is the one that is shown
* when the stack has been popped empty. Also supports mode where user
* replaces the current item on the stack.  This is more of a mode switch
* type control method.
*
* 2) Side Panel Support
*
* Let's held controllers know that they are being used in a side panel
* and should adapt accordingly.
*
* 3) Popup Panel Support
*
* Let's held controllers know that they are being used in a popup window
* on the map.  They should adapt accordingly.
*
*
* To use, must construct and then immediately set the base controller
* using: setBaseController()
*
* TODO:
*  - Support mode that keeps the stack entries around in memory. (ie. don't reallocate)
*  - Clean up the way deactivate is called. (right now it is tied to the way cards work)
*
* note: this is currently implemented  as a single class that adapts based upon
*       it's settings.  This could be done differently using plugins/mixins/etc.
*       For now though this was the most simple and easily maintained method.
*
* TODO: Try to use a smarter layout that has less overhead like this code below
*      if(this.getUseStack()) {
*         this.layout = 'card';
*      } else {
*         this.layout = {
*            type: 'vbox',
*            align: 'stretch'
*         }
*      }
*/
Ext.define('vrs.PanelHolder', {
   extend: 'Ext.Panel',

   config: {
      /** Configuration for animation. Defaults to slide type. */
      animConfig: {
         type: 'slide'
      },

      /****** STACK SETTINGS *******/
      useStack: true,

      /****** SIDE PANEL SETTINGS ********/
      /** If true, this holder is in a side panel.
      * the sub-controls may want to adjust their
      * UI accordingly.
      */
      inSidePanel: false,

      /******* POPUP SETTINGS ****/
      /** If true, this holder is in a popup window.
      */
      inPopupPanel: false,

      /** The popup panel that we are contained within.
      * Must be set before doing any popup operations.
      */
      popupPanel: null,

      /******** CORE SETTINGS ****/
      /**
      * The initial controller to use.
      * when passed in, set's panelHolder to point at this stack controller.
      * MUST SET IMMEDIATELY using setBaseController()
      */
      baseController: null,

      layout: 'card'
   },

   initialize: function() {
      this.callParent();

      // Stack of controllers we are managing.
      this._ctrlStack = [];

      /*
      var signals = ['activate', 'add', 'added', 'afterlayout', 'afterrender', 'beforeactivate',
                     'beforeadd', 'beforecardswitch', 'beforedeactivate', 'beforedestroy',
                     'beforehide', 'beforeorientationchange', 'beforeremove', 'beforerender',
                     'beforeshow', 'bodyresize', 'cardswitch', 'deactivate',
                     'destroy', 'disable', 'enable', 'hide', 'move',
                     'orientationchange', 'remove', 'render', 'resize', 'show'];
      Ext.each(signals, function(signalName) {
         me.on(signalName, function() {
            console.log('signal (holder) [' + signalName.toUpperCase() + '] - ', arguments);
         });
      });
      */
   },

   /** Validate the base controller value. */
   applyBaseController: function(baseController) {
      assert(this.getBaseController() === null, 'Must only call once');
      assert(baseController.isBaseController(), 'Must have been configured as base controller');
      return baseController;
   },

   /** Set the base controller. */
   updateBaseController: function(baseController) {
      baseController.setPanelHolder(this);

      // Set base controller panel to be the first one active
      // May need to set active item.
      this.add(baseController.getPanel());
      //this.doLayout();
   },

   // As part of destruction, call deactivate
   // on all the sub controller so they clean up.
   destroy: function() {
      var me = this;

      // XXX: Potential leak here because destroy
      Ext.each(this._ctrlStack, function(ctrl) {
         if(ctrl.getPanel()) {
            me.remove(ctrl.getPanel(), false);
         }
         ctrl.destroy();  // Tell controller to destroy itself
      });
      this._ctrlStack  = [];             // Clear the stack

      // cleanup the base controller
      if(this.getBaseController()) {
         if(this.getBaseController().getPanel()) {
            this.remove(this.getBaseController().getPanel(), false);
         }
         this.getBaseController().destroy();
         this._baseController = null;
      }

      this.callParent();
   },

   // --- POPUP MANGEMENT ---- //
   /**
   * Set the parent popup panel that contains us.
   */
   applyPopupPanel: function(popupPanel) {
      assert(this.getInPopupPanel(), "Must be in popup panel");
      return popupPanel;
   },

   // --- PANEL STACK MANAGEMENT --- /
   /** Sets focus for the "main" window to the given panel.
   * @param animOpts - animation configuration options.
   *                   (anim config object, undefined, or false)
   * @param onComple - Called when the transition to show the panel is completed.
   */
   _setFocusCtrl: function(ctrl, animOpts, onComplete) {
      var anim_config;
      onComplete = onComplete || Ext.emptyFn;
      //console.log("============ Setting New Focus ================");

      assert(this.getBaseController(), 'Must have a base controller.');
      assert(this.getUseStack(), 'Must have stack enabled.');
      if(false === animOpts) {
         anim_config = false;
      } else {
         anim_config = Ext.apply({}, animOpts, this.getAnimConfig());
         if(!this.getAnimConfig())       // If animation is disabled
         { anim_config = false; }
      }

      ctrl.setPanelHolder(this);     // Let the controller know about us

      if(anim_config && ctrl.getPanel().isPainted()) {
         this.animateActiveItem(ctrl.getPanel(), anim_config);
         assert(this.activeItemAnimation, "Must have animation");
         this.activeItemAnimation.on('animationend', function() {
            //console.log('animation complete');
            onComplete();
         });
      } else {
         this.setActiveItem(ctrl.getPanel());
         onComplete();
      }
   },

   /** Return the controller that currently has focus.
   * If nothing in stack, then the baseController has focus.
   *
   * TODO: Pull this from the panel checking what has focus.
   */
   getFocusCtrl: function() {
      assert(this.getBaseController(), 'Must have a base controller.');
      if(this._ctrlStack.length > 0)
      {
         return this._ctrlStack[this._ctrlStack.length-1];
      }
      return this.getBaseController();
   },

   /**
   * Return the previous controller or null.
   *
   * @param offset: Number of items to offset back to get controller.
   *                   (0 is last item, 1 is next to last, and so on)
   * note: this can return undefined/null if no base controller is set.
   */
   getPrevCtrl: function(offset) {
      var ctrl = this._ctrlStack[this._ctrlStack.length-1-offset];

      // out of bounds
      if(undefined === ctrl) {
         ctrl = this.getBaseController();
      }

      return ctrl;
   },

   /** Push a new controller onto the stack. */
   pushFocusCtrl: function(ctrl, animOpts, onComplete) {
      this._ctrlStack.push(ctrl);
      this._setFocusCtrl(ctrl, animOpts, onComplete);
   },

   /** Pop a controller from the stack and go back one.
   * If nothing left on stack, then make baseController active.
   *
   * @param newCtrl: If true, pops the current control (if any)
   *                 and replaces it with the new control
   */
   popFocusCtrl: function(newCtrl) {
      var me = this,
          cur_ctrl;

      // If there was a control on the stack, then remove that controller
      function on_finish() {
         //console.log("Finish pop");
         me._handleCtrlRemoval(cur_ctrl);
      }

      // If we are going to the base controller, then go directly there.
      if( (undefined === newCtrl) && (this._ctrlStack.length <= 1))
      {
         this.gotoBaseController();
      }
      // Else: pop off current controller and optionally put another in place.
      else
      {
         cur_ctrl = this._ctrlStack.pop();

         // If we don't have one to replace current, then pull one of stack or use base.
         if(undefined === newCtrl) {
            this._setFocusCtrl(this._ctrlStack[this._ctrlStack.length - 1],
                               {reverse: true}, on_finish);
         } else {
            // Push onto stack and into focus
            this.pushFocusCtrl(newCtrl, this.getAnimConfig(), on_finish);
         }
      }
   },

   /**
   * Replace the existing control that has focus.
   * If base has focus, then this will push a control
   * onto the stack instead.
   */
   replaceFocusCtrl: function(ctrl) {
      this.popFocusCtrl(ctrl);
   },

   /** Switch back to the base controller. */
   gotoBaseController: function() {
      assert(this.getBaseController(), 'Must have a base controller.');
      var me = this,
          ctrls_to_remove = this._ctrlStack;

      // store the controller that we need to remove, and then
      // clear them out in the callback function
      function on_finish() {
         //console.log("Clearing all controllers");
         Ext.each(ctrls_to_remove, function(ctrl) {
            me._handleCtrlRemoval(ctrl);
         });
      }

      this._ctrlStack      = [];             // Clear the stack
      this._setFocusCtrl(this.getBaseController(), {reverse: true}, on_finish);
   },

   /** Handle the cleanup/destruction process of a controller
   * this is called internally any time we are about to lose our last reference
   * to the controller and should let it know.
   */
   _handleCtrlRemoval: function(ctrl) {
      //console.log('Removing control: ', ctrl);
      var me = this,
          panel = ctrl.getPanel();

      assert(panel);   // We should have a panel.
      // ASSERT: panel for the given controller is not currently an active item
      // being displayed by this controller.  (ie. should be ready to remove)
      assert(panel !== this.getActiveItem());

      this.remove(panel, false); // remove from the card stack
      ctrl.destroy();            // Call to destroy (panel is destroyed in here)

      /*
      // XXX: using deactivated is the wrong signal because it requires
      //      that controls are currently in view and are about to remove from view
      //      maybe use destroyed or some other signal.
      panel.on('deactivate', function() {
         //console.log('Control was deactivated: ', ctrl);
         me.remove(panel, false);  // Remove from our card stack
         ctrl.destroy();         // Let the controller know it is being destroyed.
      });
      */
   }

}); // controller stack panel
