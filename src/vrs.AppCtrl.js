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
*       - destroy(): when we should destroy our information.
*
*  revealBegin(new), revealEnd(new)
*  concealBegin, concealEnd
*  addedToStack, removedFromStack
*
*   - Provide (optional) smart handling of UI creation/destruction to
*     remove the use of resources for UIs that are not on screen and
*     delay construction of UI/panel until it is needed.
*
* TODO:
*   - See if we can remove the timing issue using apply/update/initialConfig support in ST2.
*   - Allow panel to be set to a class (instantiate the class for the panel value)
*/
Ext.define('vrs.PanelController', {
   mixins: {
      observable: 'Ext.mixin.Observable'
   },

   config: {
      /**
      * If set, this is the text that should be displayed in the back button
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

      /**
      * @cfg {Object} panel The view panel that this controller holds/uses.
      *
      * Initial settings or value for the panel that we manage.  This may be one of:
      *    * A component class instance
      *    * A string xtype
      *    * A config object specifying the component details to instantiate.
      *
      *  Ex:
      *    panel: 'mypaneltype',
      *
      *    panel: panelObject,
      *
      *    panel: {
      *          xtype:
      *          ...
      *       }
      */
      panel: null,

      /**
      * @cfg {Object} refs A collection of named ComponentQuery selectors to apply
      *                    to create getters for getting access to key components on the panel.
      *                    The component query used is rooted at the managed panel.
      *
      *  Ex:
      *    refs: {
      *       backBtn: '.backBtn'
      *    }
      */
      refs: {},

      /**
      * @cfg {Object} control Provides mapping of Controller functions that should be called
      *                       when the given component fires an event.  Callback can be
      *                       a string to a name of a controller method or a function object.
      *                       The key can be a component query selector or the name of a
      *                       ref object from above.
      *                       If an object named 'option' is passed it is used as options
      *                       for all the listeners.
      *
      *    control: {
      *         myButton: {
      *            tap: 'onTap'
      *         },
      *         '.otherBtn': {
      *            tap: function() { callBlah(); },
      *            options: {
      *               buffer: 10
      *            }
      *         }
      *     }
      */
      control: {}
   },

   constructor: function(config) {
      this.initConfig(config);
      this.callParent(arguments);
      assert(this.getPanelHolder() !== null, "Must set stack controller on new Panels.");
   },

   /**
   * Turn the passed value into a panel object.
   */
   applyPanel: function(panel) {
      console.log('applyPanel');
      // If we don't have panel set yet, then skip the creation.
      if(null === panel) {
         return panel;
      }
      panel = Ext.ComponentManager.create(panel, 'component');

      console.log('exit applyPanel');
      return panel;
   },

   /**
   * When panel changes, check for placeholders to override.
   */
   updatePanel: function(panel, oldPanel) {
      // Look for and replace any placeholders
      if(panel) {
         this._replacePlaceholders();
      }
   },

   /**
   * Turn refs into local object references.
   */
   applyRefs: function(refs) {
      var refName, getterName, selector;

      // For each ref, add a getter that will call to get the ref dynamically
      for (refName in refs) {
         selector = refs[refName];
         getterName = "get" + Ext.String.capitalize(refName);

         if(!this[getterName]) {
            this[getterName] = Ext.Function.pass(this.getRef, [refName, selector], this);
         }
      }
      return refs;
   },

   /** Helper method to return the given ref (potentially cached).
   * @private
   */
   getRef: function(refName, selector) {
      this.refCache = this.refCache || {};
      var me = this,
          cached = this.refCache[refName];

      if(!cached) {
         cached = this.getPanel().query(selector)[0];
         me.refCache[refName] = cached;
         if(cached) {
            cached.on('destroy', function() {
               me.refCache[refName] = null;
            });
         } else {
            this._logError('Bad ref lookup [' + refName + ']. not found');
         }
      }

      return cached;
   },


   applyControl: function(selectors) {
      // TODO: Look into using Ext.event.Dispatcher.addListener
      //       instead to add the listeners to multiple items.

      var me = this,
          panel = this.getPanel(),
          refs  = this.getRefs(),
          selector, getterName,
          listener, listeners,
          event_name,
          has_ref = false,
          components = [];

      // Helper to add listener to the given component.
      function add_listener(comp) {
         comp.on(event_name, listener, me, listeners.options);
      }

      if(panel) {
         // For each selector find components and add events to them.
         for (selector in selectors) {
            listeners = selectors[selector];
            has_ref   = (selector in refs);

            if(!Ext.isObject(listeners)) {
               this._logError('Control selector: [' + selector + '] configured with non-object');
               break;
            }

            // If selector is a reference name, then lookup that component else query
            if(has_ref) {
               getterName = "get" + Ext.String.capitalize(selector);
               components = [this[getterName].call(this)];
               if(Ext.isEmpty(components[0])) {
                  this._logError('Control selector: [' + selector + '] has ref to ' +components[0]);
                  break;
               }
            } else {
               components = panel.query(selector);
            }

            // warn if we didn't find any components
            if(components.length === 0) {
               this._logError('Did not find control for selector: ' + selector);
            }

            // Add listeners for each event.
            for (event_name in listeners) {
               // if the 'event' is named options, skip it because that is
               // simply our options object for each event registered.
               if('options' === event_name) {
                  continue;
               }

               listener = listeners[event_name];

               // If is string, then lookup as function on the controller.
               if(Ext.isString(listener)) {
                  listener = me[listener];
               }

               // Register the event listener
               if(Ext.isFunction(listener)) {
                  Ext.each(components, add_listener);
               } else {
                  this._logError('Control selector: [' + selector + '] event: [' + event_name +
                                '] has invalid non-function listener');
               }
            }
         }
      }

      return selectors;
   },

   _logError: function(msg) {
      console.error(Ext.getClassName(this) + ': ' + msg);
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
   destroy: function() {
      //console.log("Destroying panel for control: ", this);
      this.setPanelHolder(null);  // Clear reference to the stack
      var panel = this.getPanel();
      if(panel)
      { panel.destroy(); }
      this.setPanel(null);

      // XXX: this.clearListeners();
      // should happen in base class for observable
      this.callParent();
   },

   onDestroy: function() {
      console.log("[DEPRECATED]: Call destroy instead of onDestroy");
      this.destroy();
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
      found = panel.query('#backBtn');
      if(found.length > 1) {
         console.warn('Found multiple back buttons');
      }
      if(found.length > 0) {
         this._overrideBackBtn(found[0]);
      }

      // Find home button
      found = panel.query('#homeBtn');
      if(found.length > 1) {
         console.warn('Found multiple home buttons');
      }
      if(found.length > 0) {
         this._overrideHomeBtn(found[0]);
      }

      // Find toolbar
      found = panel.query('#navToolbar');
      if(found.length > 1) {
         console.warn('Found multiple nav toolbars');
      }
      if(found.length > 0) {
         this._overrideNavToolbar(found[0]);
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

      btn.setIconMask(true);
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
      if(holder.getUseStack() && !this.isBaseController()) {
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

/**
* Helpers for creating placeholders in view panels.
*/
vrs.createBackBtnPlaceholder = function(btnConfig) {
   return Ext.Button.create(Ext.apply({}, btnConfig, {
      itemId: 'backBtn'
   }));
};

vrs.createHomeBtnPlaceholder = function(btnConfig) {
   return Ext.Button.create(Ext.apply({}, btnConfig, {
      itemId: 'homeBtn'
   }));
};

vrs.createNavToolbarPlaceholder = function(config) {
   return Ext.Toolbar.create(Ext.apply({}, config, {
      itemId: 'navToolbar'
   }));
};

/**
* Used for testing when we need a panel controller
* with no content.
*/
Ext.define('vrs.HtmlPanelController', {
   extend: 'vrs.PanelController',

   config: {
      panelHtml: ''
   },

   getPanel: function() {
      if(Ext.isEmpty(this._panel))
      {
         this.setPanel(Ext.Panel.create({html: this.getPanelHtml() }));
      }
      return this._panel;
   }
});


/**
* Panel controller that will be displayed with a title, a back button,
* and an embedded IFrame.
*/
Ext.define('vrs.HtmlViewerPanelController', {
   extend: 'vrs.PanelController',

   config: {
      /** URI of the page to view. */
      pageUri: null,

      title: ''
   },

   constructor: function(config) {
      this.callParent(arguments);
      this.setPanel(vrs.HtmlViewerPanel.create({ controller: this }));
   }
});

Ext.define('vrs.HtmlViewerPanel', {
   extend: 'Ext.Panel',

   config: {
      cls: 'html-viewer-panel',
      controller: null
   },

   initialize: function() {
      this.callParent();

      var me = this,
          ctrl = me.getController();

      this.backBtn = Ext.Button.create({
         text    : 'Back',
         ui      : 'back',
         handler : function() { ctrl.getPanelHolder().popFocusCtrl(); }
      });

      this.topToolbar = Ext.Toolbar.create({
         docked  : 'top',
         title   : ctrl.title,
         ui      : 'dark',
         items   : [
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
      this.add([
         this.topToolbar,
         this.embeddedPanel
      ]);
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
Ext.define('vrs.SubPanelController', {
   mixins: {
      observable: 'Ext.mixin.Observable'
   },

   config: {
      panel: null
   },

   destroy: function() {
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

   /**
   * Set the base controller.
   */
   applyBaseController: function(baseController) {
      assert(this.getBaseController() === null, 'Must only call once');
      assert(baseController.isBaseController(), 'Must have been configured as base controller');
      return baseController;
   },

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
      console.log("============ Setting New Focus ================");

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

      if(anim_config) {
         this.animateActiveItem(ctrl.getPanel(), anim_config);
         assert(this.activeItemAnimation, "Must have animation");
         this.activeItemAnimation.on('animationend', function() {
            console.log('animation complete');
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
         console.log("Finish pop");
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
         console.log("Clearing all controllers");
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
      console.log('Removing control: ', ctrl);
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


