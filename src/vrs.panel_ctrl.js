/*global Ext */
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
*   - Investigate extending Evented for this class instead. (could handle initialize, etc)
*   - May need to split off some of the behavior related to holder and automatic
*     back buttons and home buttons.  (ie. the stack specific functions)
*/
Ext.define('vrs.PanelController', {
   mixins: {
      observable: 'Ext.mixin.Observable'
   },

   config: {
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
      *  ...
      *  obj.getBackBtn()
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

   /**
   * @prop Flag that is true only after construction has finished and initialize method
   *       is completed.
   */
   initialized: false,

   /**
   * Construct the panel.
   *
   * @note: Subclasses must call up to this if they override the constructor.
   */
   constructor: function(config) {
      this.initialConfig = config;
      this.initConfig(config);
      this.callParent(arguments);
      this.initialize();
      this.initialized = true;
   },

   /** Allows customization in derived classes.
   * Called at end of constructor.
   */
   initialize: Ext.emptyFn,

   /**
   * Turn the passed value into a panel object.
   */
   applyPanel: function(panel) {
      // If we don't have panel set yet, then skip the creation.
      if(null === panel) {
         return panel;
      }
      panel = Ext.ComponentManager.create(panel, 'component');

      return panel;
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

   /**
   * Helper method to return the given ref (potentially cached).
   *  If the selector is '' or null then return defaultValue.
   * @private
   *   @param defaultValue: The default value to return.
   */
   getRef: function(refName, selector, defaultValue) {
      this.refCache = this.refCache || {};

      var me = this,
          selectors = /([^\(\)]*)(\((.*)\))?/.exec(selector),
          component_selector = (selectors[1] || '').trim(),
          css_selector       = (selectors[3] || '').trim(),
          panel, component, element;

      // Early out since we already have it
      if (this.refCache[refName]) {
         return this.refCache[refName];
      }

      if(component_selector) {
         panel = this.getPanel();
         // try panel then sub-panel
         if(Ext.ComponentQuery.is(panel, component_selector)) {
            component = panel;
         }
         else {
            component = this.getPanel().query(component_selector)[0];
         }
      }

      if (css_selector && component) {
         element = component.element.down(css_selector);
      }

      var res = element || component;

      if (res) {
         me.refCache[refName] = res;

         component.on('destroy', function() {
            delete me.refCache[refName];
         });
      }
      else if (defaultValue !== undefined) {
         res = defaultValue;
      } else {
         this._logError('Bad ref lookup [' + refName + ']. not found');
      }

      return res;
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
      console.error(Ext.getDisplayName(this) + ': ' + msg);
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
      this.callParent(arguments);
      var panel = this.getPanel();
      if(panel)
      { panel.destroy(); }
      this.setPanel(null);

      // XXX: this.clearListeners();
      // should happen in base class for observable
      //this.callParent();
   },

   onDestroy: function() {
      console.log("[DEPRECATED]: Call destroy instead of onDestroy");
      this.destroy();
   }
});
