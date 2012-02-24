// Main application file
//
Ext.ns('vrs');

/*  Controller interface
*
*  Base interface for all panel controllers in the system.
*  This must provide the panel that should be used
*  and provides the interface for the common hooks used
*  to manage the controller.
*
* TODO:
*   - Provide more hooks such as:
*       - activationStarted(firstTime): when we start activating the control
*       - activationCompleted(): when the control panel has completed it's transition
*       - removalStarted(): when we start removing the focus
*       - removalCompleted(): when we end removal from view.
*       - onDestroy(): when we should destroy our information.
*
*  revealBegin(new), revealEnd(new)
*  concealBegin, concealEnd
*  addedToStack, removedFromStack
*
*   - Provide (optional) smart handling of UI creation/destruction to
*     remove the use of resources for UIs that are not on screen and
*     delay construction of UI/panel until it is needed.
*/
vrs.PanelController = Ext.extend(Ext.util.Observable, {
   panel: null,

   /** If set, this is the text that should be displayed in the back button
   * of any panels we push onto the stack.  (ie. buttons that come back to us)
   */
   backName: null,

   /** Our current panel holder.
   * Should call to this to push, pop, and clear the stack and do any other holder ops.
   * (this is set by the controller stack that we get pushed onto)
   */
   panelHolder: null,

   /**
   * If set true, then as part of construction, will set the
   * controller as base on the holder.  (can only happen for one controller in holder)
   *
   * note: we do it this way to make sure the panel construction code knows
   *       if we are the base controller or not and what our holderPanel is.
   */
   isBaseController: false,

   constructor: function(config) {
      vrs.PanelController.superclass.constructor.call(this, config);
      assert(this.panelHolder !== null, "Must set stack controller on new Panels.");
   },

   /** Return the panel for the controller. */
   getPanel: function() {
      return this.panel;
   },

   // ----- STATE CHANGE/UPDATE CALLBACKS ---- //
   // note: these could be done as events, but the local object
   //       is the main user so it ends up being easier to use this way.

   /*
   * Called when the controller is not held anymore by app controller
   * and it should be cleaned up.  (ie. call destroy on all UI objects)
   * note: this is unless someone else is holding on for good reason.
   * (note: can't just watch for deactive locally because that doesn't tell us
   * if we are just being held on the stack for a while.)
   */
   onDestroy: function() {
      //console.log("Destroying panel for control: ", this);

      this.panelHolder = null;  // Clear reference to the stack
      var panel = this.getPanel();
      if(panel)
      { panel.destroy(); }
      this.clearListeners();
   },

   // --- Helpers to figure out where we are being used --- //
   /** Return true if we are being shown in a side panel. */
   inSidePanel: function() {
      if(!this.panelHolder) { return false; }

      return this.panelHolder.inSidePanel;
   },

   /** Return true if we are being shown in a popup panel. */
   inPopupPanel: function() {
      if(!this.panelHolder) { return false; }
      return this.panelHolder.inPopupPanel;
   },

   // ---- CONTROLLER HELPERS ---- //
   /**
   * Return a new back button with the correct behavior and label
   * to use on a newly created panel.
   *
   * @param btnConfig: Config to apply to the back button as overrides.
   * @param numBack:   Number of spots back in the stack to look for button text.
   *                       [defaults to 0]
   */
   createBackButton: function(btnConfig, numBack) {
      numBack = numBack || 0;
      var me = this,
          back_btn,
          back_txt,
          prev_ctrl = this.panelHolder.getPrevCtrl(numBack);

      back_txt = (prev_ctrl && prev_ctrl.backName) || 'Back';

      back_btn = new Ext.Button(Ext.apply({}, btnConfig, {
         text    : back_txt,
         ui      : 'back',
         handler : function() { me.panelHolder.popFocusCtrl(); }
      }));
      return back_btn;
   },

   /**
   * Return a new top toolbar with the correct buttons and
   * settings for the type of holder we are within.
   *
   * This brings together quite a bit of repeated code for creating
   * navigation controls.
   *
   * @param panelCtrl: the panel controller we are building the toolbar for.
   * @param toolbarConfig: config object to use for the toolbar.
   *                       (note: can not override the items settings, use for title, ui, etc.)
   * @param backBtnConfig: config to add if back button is used.
   * @note If toolbar will have backBtn and homeBtn attributes added iff
   *       those buttons are created.
   */
   createTopToolbar: function(toolbarConfig, backBtnConfig) {
      var toolbar, back_btn, home_btn,
          toolbar_items = [],
          me = this,
          holder = this.panelHolder;

      // If in stack and not base controller, need navigation
      if(holder.useStack && !this.isBaseController) {
         // - Create back buttn
         back_btn = new Ext.Button(Ext.apply({}, backBtnConfig,
         {
            text: 'Back',
            ui: 'back',
            handler: function() { me.panelHolder.popFocusCtrl(); }
         }));

         // - If not in side panel and not in popup, then need home button
         if(!holder.inSidePanel  && !holder.inPopupPanel) {
            // create home button
            home_btn = new Ext.Button({
               iconMask: true,
               ui: 'action',
               iconCls: 'home',
               handler: function() { me.panelHolder.gotoBaseController(); }
            });
         }
      }
      if(back_btn) {
         toolbar_items.push(back_btn);
      }
      toolbar_items.push({xtype: 'spacer'});
      if(home_btn) {
         toolbar_items.push(home_btn);
      }

      // Create toolbar
      toolbar = new Ext.Toolbar(Ext.apply({}, {
         items: toolbar_items
      }, toolbarConfig));

      // have the back and home buttons
      toolbar.backBtn = back_btn;
      toolbar.homeBtn = home_btn;

      // add test helpers
      toolbar.tapBackBtn = function() {
         this.backBtn.callHandler(null);
      };
      toolbar.tapHomeBtn = function() {
         this.homeBtn.callHandler(null);
      };

      return toolbar;
   }
});

/**
* Used for testing when we need a panel controller
* with no content.
*/
vrs.HtmlPanelController = Ext.extend(vrs.PanelController, {
   panelHtml: '',

   constructor: function(config) {
      vrs.HtmlPanelController.superclass.constructor.call(this, config);
   },
   getPanel: function() {
      if(Ext.isEmpty(this.panel))
      { this.panel = new Ext.Panel({html: this.panelHtml });}
      return this.panel;
   }
});


/**
* Panel controller that will be displayed with a title, a back button,
* and an embedded IFrame.
*/
vrs.HtmlViewerPanelController = Ext.extend(vrs.PanelController, {
   /** URI of the page to view. */
   pageUri: null,

   panel: null,
   title: '',

   constructor: function(config) {
      vrs.HtmlViewerPanelController.superclass.constructor.call(this, config);
      this.panel = new vrs.HtmlViewerPanel({ controller: this });
   }
});

vrs.HtmlViewerPanel = Ext.extend(Ext.Panel, {
   cls: 'html-viewer-panel',
   controller: null,

   initComponent: function() {
      var me = this,
          ctrl = me.controller;

      this.backBtn = new Ext.Button({
         text    : 'Back',
         ui      : 'back',
         handler : function() { ctrl.panelHolder.popFocusCtrl(); }
      });

      this.topToolbar = new Ext.Toolbar({
         dock  : 'top',
         title : ctrl.title,
         ui    : 'dark',
         items : [
            this.backBtn,
            { xtype: 'spacer' }
         ]
      });

      // Main body
      this.embeddedPanel = new vrs.IframePanel({
         fullscreen : true,
         url        : ctrl.pageUri
      });

      // Hook everything up
      this.dockedItems = [
         this.topToolbar
      ];

      this.items = [
         this.embeddedPanel
      ];

      vrs.HtmlViewerPanel.superclass.initComponent.call(this);
   },

   // -- test helpers -- //
   tapBackBtn: function() {
      this.backBtn.callHandler(null);
   }
});



/*
* todo: Merge this up with the Panel controller in a common hierarchy
*       to get some reuse and commonality.
*/
vrs.SubPanelController = Ext.extend(Ext.util.Observable, {
   panel: null,

   getPanel: function() {
      return this.panel;
   },

   onDestroy: function() {
      var panel = this.getPanel();
      if(panel)
      { panel.destroy(); }
      this.clearListeners();
   }
});



/**
* Panel Holder
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
*/
vrs.PanelHolder = Ext.extend(Ext.Panel, {
   /** Configuration for animation. Defaults to slide type. */
   animConfig: {type: 'slide'},

   /****** STACK SETTINGS *******/
   useStack: true,

   /** Stack of controllers. */
   ctrlStack: null,

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

   initComponent: function() {
      var me = this;

      this.ctrlStack = [];
      this.items     = [];

      // Change layout method based upon desired usage.
      this.layout = 'card';

      // TODO: Try to use a smarter layout that has less overhead like this code below
      /*
      if(this.useStack) {
         this.layout = 'card';
      } else {
         this.layout = {
            type: 'vbox',
            align: 'stretch'
         }
      }
      */

      vrs.PanelHolder.superclass.initComponent.call(this);
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

      me.on({
         beforecardswitch : me.onBeforeCardSwitch,
         cardswitch       : me.onCardSwitch,
         scope            : me
      });

   },

   /**
   * Set the base controller.
   */
   setBaseController: function(baseController) {
      assert(this.baseController === null, 'Must only call once');
      assert(baseController.isBaseController, 'Must have been configured as base controller');
      this.baseController = baseController;
      this.baseController.panelHolder = this;

      // Set base controller panel to be the first one active
      // May need to set active item.
      this.add(this.baseController.getPanel());
      this.doLayout();
   },

   // @private
   // At beginning of destruction, call deactivate
   // on all the sub controller so they clean up.
   beforeDestroy: function() {
      var me = this;

      // XXX: Potential leak here because onDestroy
      Ext.each(this.ctrlStack, function(ctrl) {
         if(ctrl.getPanel()) {
            me.remove(ctrl.getPanel(), false);
         }
         ctrl.onDestroy();  // Tell controller to destroy itself
      });
      this.ctrlStack  = [];             // Clear the stack

      // cleanup the base controller
      if(this.baseController) {
         if(this.baseController.getPanel()) {
            this.remove(this.baseController.getPanel(), false);
         }
         this.baseController.onDestroy();
         this.baseController = null;
      }

      // set activate item to something empty?
      vrs.PanelHolder.superclass.beforeDestroy.call(this);
   },

   onBeforeCardSwitch: function(container, newCard, oldCard, index, animated) {
      return true;
   },

   onCardSwitch: function(container, newCard, oldCard, index, animated) {
   },

   // --- POPUP MANGEMENT ---- //
   /**
   * Set the parent popup panel that contains us.
   */
   setPopupPanel: function(popupPanel) {
      assert(this.inPopupPanel, "Must be in popup panel");
      this.popupPanel = popupPanel;
   },

   // --- PANEL STACK MANAGEMENT --- /
   /** Sets focus for the "main" window to the given panel.
   * @param animOpts - animation configuration options.
   *                   (anim config object, undefined, or false)
   */
   _setFocusCtrl: function(ctrl, animOpts) {
      var config;

      assert(this.baseController, 'Must have a base controller.');
      assert(this.useStack, 'Must have stack enabled.');
      if(false === animOpts) {
         config = false;
      } else {
         config = Ext.apply({}, animOpts, this.animConfig);
         if(!this.animConfig)       // If animation is disabled
         { config = false; }
      }

      ctrl.panelHolder = this;     // Let the controller know about us
      this.setActiveItem(ctrl.getPanel(), config);
   },

   /** Return the controller that currently has focus.
   * If nothing in stack, then the baseController has focus.
   *
   * TODO: Pull this from the panel checking what has focus.
   */
   getFocusCtrl: function() {
      assert(this.baseController, 'Must have a base controller.');
      if(this.ctrlStack.length > 0)
      {
         return this.ctrlStack[this.ctrlStack.length-1];
      }
      return this.baseController;
   },

   /**
   * Return the previous controller or null.
   *
   * @param offset: Number of items to offset back to get controller.
   *                   (0 is last item, 1 is next to last, and so on)
   * note: this can return undefined/null if no base controller is set.
   */
   getPrevCtrl: function(offset) {
      var ctrl = this.ctrlStack[this.ctrlStack.length-1-offset];

      // out of bounds
      if(undefined === ctrl) {
         ctrl = this.baseController;
      }

      return ctrl;
   },

   /** Push a new controller onto the stack. */
   pushFocusCtrl: function(ctrl, animOpts) {
      this.ctrlStack.push(ctrl);
      this._setFocusCtrl(ctrl, animOpts);
   },

   /** Pop a controller from the stack and go back one.
   * If nothing left on stack, then make baseController active.
   *
   * @param newCtrl: If true, pops the current control (if any)
   *                 and replaces it with the new control
   */
   popFocusCtrl: function(newCtrl) {
      // Remove the current panel from the stack
      var cur_ctrl = this.ctrlStack.pop();

      // If there was a control on the stack, then remove that controller
      if(cur_ctrl !== undefined)
      { this._handleCtrlRemoval(cur_ctrl); }

      // If we don't have one to replace current, then pull one of stack or use base.
      if(undefined === newCtrl) {
         // If we have no other controllers, then go back to base controller
         if (this.ctrlStack.length === 0)
         { this.gotoBaseController(); }
         else
         {
            this._setFocusCtrl(this.ctrlStack[this.ctrlStack.length - 1],
                                {reverse: true});
         }
      } else {
         // Push onto stack and into focus
         this.pushFocusCtrl(newCtrl);
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
      assert(this.baseController, 'Must have a base controller.');
      var me = this,
          cur_ctrl = this.ctrlStack.pop();

      // Start removal process for top of stack and manually destroy the others
      if(cur_ctrl !== undefined)
      { this._handleCtrlRemoval(cur_ctrl); }

      Ext.each(this.ctrlStack, function(ctrl) {
         if(ctrl.getPanel()) {
            me.remove(ctrl.getPanel(), false);
         }
         ctrl.onDestroy();
      }, this);

      this.ctrlStack      = [];             // Clear the stack
      this._setFocusCtrl(this.baseController, {reverse: true});
   },

   /** Handle the cleanup/destruction process of a controller
   * this is called internally any time we are about to lose our last reference
   * to the controller and should let it know.
   */
   _handleCtrlRemoval: function(ctrl) {
      //console.log('Removing control: ', ctrl);
      var me = this,
          panel;

      panel = ctrl.getPanel();
      assert(panel);   // We should have a panel.

      // XXX: using deactivated is the wrong signal because it requires
      //      that controls are currently in view and are about to remove from view
      //      maybe use destroyed or some other signal.
      panel.on('deactivate', function() {
         //console.log('Control was deactivated: ', ctrl);
         me.remove(panel, false);  // Remove from our card stack
         ctrl.onDestroy();         // Let the controller know it is being destroyed.
      });
   }

}); // controller stack panel


