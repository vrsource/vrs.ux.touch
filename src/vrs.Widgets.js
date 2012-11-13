/*global simfla: false, document: false */
// Utility helpers
Ext.ns('vrs.plugins');

/**
* Helper method to wrap a button in a container
*
* This proves to be very useful for layout because
* buttons can't be laid out inline with some other types of items.
*/
vrs.containerWrapButton = function(btnItem) {
   return {
      xtype: 'container',
      layout: {
         type  : 'hbox',
         pack  : 'center',
         align : 'center'
      },
      items: [ btnItem ]
   };
};


/**
* Returns the current text value of the given selection field.
* requires that the data for selection use the fields 'text' and 'value'.
* @returns undefined if it is not found.
*/
vrs.getSelectFieldTextValue = function(selectField) {
   // Find the record for the current value.
   var record,
       cur_value = selectField.getValue();

   if(cur_value === undefined) {
      return undefined;
   }

   record = selectField.store.findRecord('value', cur_value);
   if(null === record) {
      return undefined;
   }

   return record.get('text');
};



/**
* Customized Nested List that always shows the back button
* even on the base level.
* Provides a handler hook to get called when the base back button
* is pressed.
*
* This is useful for panels where we want a nested list but need a way
* to exit the list and go to the previous panel.
*/
Ext.define('vrs.BackedNestedList', {
   extend: 'Ext.NestedList',

   config: {
      /** Handler function to call if/when the back back button is pressed. */
      baseBackButtonHandler: null
   },

   initialize: function() {
      this.callParent(arguments);

      if(this.getBackButton()) {
         this.getBackButton().show();
      }
   },

   /**
   * Override the back tap to tell us when the back button has been pressed at
   * the lowest level.
   */
   onBackTap: function() {
      // Get index before the superclass changes it
      var currList = this.getActiveItem(),
           currIdx = this.items.indexOf(currList);

      // Do the standard updates
      this.callParent(arguments);

      // If at base level, call to the handler
      if(currIdx === 0)
      {
         console.log('back pressed at lowest level');
         if(this.getBaseBackButtonHandler()) {
            this.getBaseBackButtonHandler()();
        }
      }
   },

   syncToolbar: function(card) {
      this.callParent(arguments);
      vrs.BackedNestedList.superclass.syncToolbar.call(this, card);

      var list  = card || this.getActiveItem(),
          depth = this.items.indexOf(list);

      if((0 === depth) && (this.backButton)) {
         this.backButton.setText(this.backText);
         this.backButton.show();
      }
   }

});

vrs.st1_code = function() {

   /**
   * Try to blur the currently focused field (if any).
   * this is useful on iOS to clear the virtual keyboard.
   *
   * note: this makes use of some internal details of
   *       sencha touch, so it may break on updates.
   */
   vrs.blurFocusedField = function() {
      // Basic idea is that we want to blur whatever currently has focus
      // sencha touch tracks this in Ext.currentlyFocusedField for
      // text fields.  This is used for scrolling on iOS
      if(Ext.currentlyFocusedField) {
         Ext.currentlyFocusedField.blur();  // force a blur
      }

      // (future) Idea 2: Could create an a link in DOM and move focus to it.
   };

   /**
   * Change the ui value for the given component.
   */
   vrs.changeUiCls = function(cmp, ui) {
      var old_ui_cls = cmp.componentCls + '-' + cmp.ui,
          new_ui_cls = cmp.componentCls + '-' + ui;

      cmp.ui = ui;

      cmp.removeCls(old_ui_cls);
      cmp.addCls(new_ui_cls);
   };


   /**
   * Simple panel extension that loads the given iframe as the html content
   * of the panel.
   *
   * Note: this exists to aid in testing and making the frame usable.
   */
   vrs.IframePanel = Ext.extend(Ext.Panel, {
      /**
      * The full url of the iframe data to load.
      */
      url: null,

      scrollable: false,

      initComponent: function() {
         this.html = Ext.format('<iframe src="{0}" '+
            'style="width: 100%; height: 100%; padding-bottom:2em;" ></iframe>', this.url);

         vrs.IframePanel.superclass.initComponent.call(this);
      }
   });


   /**
   * Auto expanding version of text area that allows editing text inline.
   *
   * Based upon concept from: http://goo.gl/NcSI5
   */
   vrs.ExpandoTextField = Ext.extend(Ext.form.Text, {
      ui      : 'expando-text',
      isField : true,

      /** Number of rows to use initially. */
      initialRows : 2,

      /** Maximum number of rows to grow to. */
      maxRows : 50,

      renderTpl : [

         '<div class="x-form-field-container">',
            '<tpl if="label"><div class="label"><span>{label}</span></div></tpl>',
            '<textarea id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
              ' rows="{initialRows}" ',
              '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
              '<tpl if="placeHolder">placeholder="{placeHolder}" </tpl>',
              '<tpl if="style">style="{style}" </tpl>',
              '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
              '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
              '<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
              '></textarea>',
              '<tpl if="useMask"><div class="x-field-mask"></div></tpl>',
          '</div>'
      ],

      initComponent: function() {
         vrs.ExpandoTextField.superclass.initComponent.call(this);

         this.curRows = this.initialRows;
      },

      initRenderData: function() {
         var renderData = vrs.ExpandoTextField.superclass.initRenderData.call(this);

         // Copy over value even if it is already set.
         Ext.apply(renderData, {
            initialRows : this.initialRows
         });
         this.renderData = renderData;
         return this.renderData;
      },

      initEvents: function() {
         vrs.ExpandoTextField.superclass.initEvents.apply(this, arguments);
      },

      afterRender: function() {
         vrs.ExpandoTextField.superclass.afterRender.apply(this, arguments);
         this.grow();  // make sure it is large enough for initial text.
      },

      /** Grow the size as needed.
      *
      * note: this does not allow shrinking.
      */
      grow : function() {
         var textarea = this.fieldEl,
            new_height = textarea.dom.scrollHeight,
            cur_height = textarea.dom.clientHeight;

         // Keep expanding until can see all text.
         // note: we only expect to go multiple iterations on the first grow()
         //       with initial text that is more than initialRows in length.
         while((new_height > cur_height) && (this.curRows < this.maxRows)) {
            this.curRows += 1;
            textarea.dom.rows = this.curRows;

            new_height = textarea.dom.scrollHeight;
            cur_height = textarea.dom.clientHeight;
         }
      },

      onKeyUp: function(e) {
         // Use same method as text area does.  This lets us press enter
         // in the field to get a new line.
         this.fireEvent('keyup', this, e);
         this.grow();
      }

   });

   Ext.reg('expandofield', vrs.ExpandoTextField);

   // Add to list of fields for scroll control
   Ext.textFieldTypes = Ext.textFieldTypes || [];
   Ext.textFieldTypes.push('expandofield');


   /**
   * Helper to request form data in a convienent popup dialog
   * with an async query.
   *
   * Builds on FormPanel to make it easier for the use case of presenting the
   * user with a form that they can either accept or reject depending upon
   * which button they press.
   *
   * Provides 3 usage modes:
   *  * Popup window
   *  * Controller
   *  * action sheet (fullscreen)
   *
   * @param config: Config object
   *   - mode: One of 'popup', 'panel', 'sheet' [default: 'popup']
   *   - items: form items to use. in format of sencha touch items.
   *          Supports a "required" paramemter that when used will require that value
   *          to be set before the form will return.
   *   - data: object - initial data to load.
   *   - fn: callback function to hit. takes one parameter, the results object.
   *          called with undefined if the user cancels the interaction.
   *   - scope: scope to call back into.
   *   - confirmText: Text to use on the save button.
   *   - declineText: Text to use on the cancel button.
   *   - confirmUi: Ui style to use on confirm button. [default: 'confirm']
   *   - declineUi: Ui style to use on declien button. [default: 'normal']
   *   - itemDefaults: Passed as 'defaults' to the form for the items.
   *   - formOpts: option object of overrides for form panel.
   *   - title: (optional) If set, adds a top dock with the given title.
   *            instead of loading in popup.
   *   - panelHolder: (optional) If passed, add form panel to stack
   *
   * @returns Returns the FormPanel object created.
   *
   * @note: See FormPanel for more details about the data that can be
   *         passed and used.  (see FormPanel.load() and FormPanel.getValues()
   * @note: if panelHolder is passed, the buttons are added to top dock and
   *         the "save" button is given a back button styling.
   *
   * Example:
   onAddButtonTap: function() {
      var me = this;

      vrs.requestFormData({
         fn: function(results) {
            console.log("Results: ", results);
            if(results)
            { doSomething(results); }
         },
         scope: me,
         items: [
           {
               xtype: 'textfield',
               name: 'name',
               label: 'Username',
               placeHolder: 'user name',
               required: true
            },
            {
               xtype: 'togglefield',
               name: 'interested',
               label: 'Is Interested?',
               required: false
            },
         ]
         });
      },
   *
   */
   vrs.requestFormData = function(config) {
      var cb    = config.fn,
          scope = config.scope || this,
          form  = null,
          mode         = config.mode || 'popup',
          confirmText  = config.confirmText || 'Save',
          declineText  = config.declineText || 'Cancel',
          confirm_ui   = config.confirmUi || 'confirm',
          decline_ui   = config.declineUi || 'normal',
          formItems    = config.items || [],
          initialData  = config.data || {},
          formOpts     = config.formOpts || {},
          itemDefaults = config.itemDefaults || {},
          panelHolder  = config.panelHolder || null,
          title        = config.title || null,
          docked_bars  = [],
          docked_items = [],
          confirm_button,
          decline_button,
          sheet_panel = null,
          use_popup = ('popup' === mode),
          use_sheet = ('sheet' === mode),
          use_panel = ('panel' === mode);

      if(config.saveText) {
         console.warn('requestFormData: saveText option deprecated.  Use confirmText instead');
         confirmText = config.saveText;
      }

      /** Check the form to see if all required fields are filled. */
      function requiredFieldsFilledIn() {
         form.removeCls('form-invalid');

         // using private method
         var fields = form.getFields(),
             name, field, valid = true;
         for (name in fields) {
            if (fields.hasOwnProperty(name)) {
               field = fields[name];
               // Clean up old setting
               field.removeCls('field-invalid');
               if(field.required === true) {
                  if(Ext.isEmpty(field.getValue())) {
                     valid = false;
                     // Mark the field as invalid
                     field.addCls('field-invalid');
                  }
               }
            }
         }
         return valid;
      }

      /** Disable the interface of the form because we are about to close it. */
      function disableForm() {
         form.disable();
         form.setDisabled(true);
         confirm_button.setDisabled(true);
         decline_button.setDisabled(true);
      }

      function showForm() {
         if(use_popup) {
            form.show(vrs.inTest ? null : 'pop');  // no animation when in test suite
            form.on({
               hide: function() { form.destroy(); }
            });
         } else if (use_panel) {
            panelHolder.pushFocusCtrl(new vrs.StackPanelController({
               panel       : form,
               panelHolder : panelHolder
            }));
         } else {
            sheet_panel = new Ext.Sheet({
               cls: 'full_sheet',  // mark it as a full page sheet.
               stretchX : true,
               stretchY : true,
               enterAnimation : vrs.inTest ? null : 'slide',
               exitAnimation  : vrs.inTest ? null : 'slide',
               height: '100%',
               layout: 'fit',
               items: [form],
               listeners: {
                  hide: function() { sheet_panel.destroy(); }
               }
            });
            sheet_panel.show();
         }
      }

      /** Hide the form at the end of usage. */
      function hideForm() {
         if(use_popup) {
            form.hide('pop');
         } else if(use_panel) {
            panelHolder.popFocusCtrl();
         } else {
            sheet_panel.hide();
         }
      }

      confirm_button = new Ext.Button({
         xtype : 'button',
         text  : confirmText,
         ui    : confirm_ui,
         //cls   : 'x-button-confirm',  // do directly so we can use UI to style back.
         handler: function() {
            if(!requiredFieldsFilledIn())
            {
               // Set the CSS to mark the form as invlaid
               // Use set timeout so that the class remove and add take place
               // in different ticks.  This allows the browsers engine to detect that a class
               // was added and does the shake animation
               setTimeout(function() {
                  form.addCls('form-invalid');
               }, 0);
               // Re-layout incase the css change made some fields hide/show
               // form.doComponentLayout();
            }
            else
            {
               // hack to remove the iOS virtual keyboard
               // since it doesn't know the form has completed (submitted).
               vrs.blurFocusedField();

               if(cb)
               { cb.call(scope, form.getValues()); }

               disableForm();
               hideForm();
            }
         }
      });

      decline_button = new Ext.Button({
         text    : declineText,
         ui      : decline_ui,
         handler : function() {
            if(cb)
            { cb.call(scope, undefined); }

            disableForm();
            hideForm();
         }
      });

      // Create the top and bottom docks
      // - if we are a popup, then buttons are on bottom, else on top
      // - only create top if we have a title or if we are not a popup
      docked_items = [decline_button,
                      {xtype: 'spacer'},
                      confirm_button];

      if(title || !use_popup) {
         docked_bars.push({
            xtype : 'toolbar',
            dock  : 'top',
            title : title,
            items : use_popup ? [] : docked_items
         });
      }
      if(use_popup) {
         docked_bars.push({
            xtype : 'toolbar',
            dock  : 'bottom',
            items : docked_items
         });
      }

      form = new Ext.form.FormPanel(Ext.apply({
         url       : 'no-submit',
         modal     : true,
         hideOnMaskTap: false,
         floating  : use_popup,              // If using popup, then float and center
         centered  : use_popup,
         cls       : 'request-form',
         draggable : false,
         scroll    : 'vertical',

         // ignore the 'action'/"go" event since we handle directly
         submitOnAction: false,

         defaults    : itemDefaults,
         items       : formItems,
         dockedItems : docked_bars,

         listeners: {
            // intercept the action event and call the accept directly
            action: function() { confirm_button.callHandler(); },
            // short circut submit actions and ignore them
            beforesubmit: function() { return false; }
         }
      }, formOpts));

      if(initialData)
      { form.setValues(initialData); }

      // show the form
      showForm();

      // Add buttons onto the form object so we can access if needed
      form.decline_button = decline_button;
      form.confirm_button = confirm_button;
      form.tapDeclineButton = function() {
         this.decline_button.callHandler(null);
      };
      form.tapConfirmButton = function() {
         this.confirm_button.callHandler(null);
      };

      return form;
   };



   /**
   * Button that supports toggling between two states.
   *
   * TODO:
   *   - Figure out if we need to do anything with icon mask settings.
   */
   vrs.TogglingButton = Ext.extend(Ext.Button, {
      /** Icon class to set in toggled state. */
      toggledIconCls: null,

      /** Button text to set in toggled state. */
      toggledText: null,

      /** Icon to set in toggled state. */
      toggledIcon: null,

      /** Handler to call when toggled.
      * Called as: toggleHandler(toggleState, button, eventObject)
      */
      toggleHandler: null,

      /** UI to use in toggled state.
      */
      toggledUi: 'normal',

      /**
      * Current toggled state. If true, start toggled.
      */
      toggled: false,

      initComponent: function() {
         vrs.TogglingButton.superclass.initComponent.call(this);
      },


      afterRender : function(ct, position) {
         var me = this;

         vrs.TogglingButton.superclass.afterRender.call(me, ct, position);

         // Save the base settings so we can reapply them later.
         this.baseSettings = {
            iconCls : this.iconCls,
            text    : this.text,
            icon    : this.icon,
            ui      : this.ui
         };

         if(me.toggled) {
            me._updateToggleVisuals();
         }
      },

      callHandler : function(e) {
         var me = this;

         // Intercept the handler call and manage the toggle handler.
         this.toggled = !me.toggled;
         this._updateToggleVisuals();
         if(me.toggleHandler) {
            me.toggleHandler.call(me.scope || me, this.toggled, me, e);
         }

         // Call up to the normal handler.
         vrs.TogglingButton.superclass.callHandler.call(me, e);
      },

      /**
      * Update the visuals on the button based upon the current
      * toggle state.
      */
      _updateToggleVisuals: function() {
         var icon_cls, text, icon, ui,
             cur_ui_cls, new_ui_cls;

         if(this.toggled) {
            icon_cls = this.toggledIconCls || this.baseSettings.iconCls;
            text     = this.toggledText    || this.baseSettings.text;
            icon     = this.toggledIcon    || this.baseSettings.icon;
            ui       = this.toggledUi      || this.baseSettings.ui;
         } else {
            icon_cls = this.baseSettings.iconCls;
            text     = this.baseSettings.text;
            icon     = this.baseSettings.icon;
            ui       = this.baseSettings.ui;
         }

         this.setText(text);
         this.setIcon(icon);
         this.setIconClass(icon_cls);

         // Remove the current UI class and add the new one
         cur_ui_cls = this.componentCls + '-' + this.ui;
         new_ui_cls = this.componentCls + '-' + ui;
         this.removeCls(cur_ui_cls);
         this.addCls(new_ui_cls);
         this.ui = ui;
      }

   });

   Ext.reg('togglingbutton', vrs.TogglingButton);





   /*Copyright (C) 2011 by WhiteFox AS

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE.*/
   // from: http://www.sencha.com/forum/showthread.php?129018
   /*
   Use as:

   {
      xtype: 'button',
      linkId: 'myLink3',
      url: 'tel:+4790992724',
      text: 'Call: Simon Flack',
      plugins: [ new simfla.ux.plugins.linkButton() ]
   }

   your_button.plugins[0].setUrl(your_button,YourNewLink);
   */

   Ext.ns('simfla.ux.plugins');

   simfla.ux.plugins.fireEvent = function (obj,evt) {
      var fireOnThis = obj, evObj;
      if( document.createEvent ) {
         evObj = document.createEvent('MouseEvents');
         evObj.initEvent( evt, true, false );
         return fireOnThis.dispatchEvent(evObj);
      } else if( document.createEventObject ) {
         return fireOnThis.fireEvent('on'+evt);
      }
   };

   simfla.ux.plugins.linkButton = Ext.extend(Ext.util.Observable, {
      init: function(cmp){
         var me = this;

         if(!cmp.linkId) {
            cmp.linkId = 'auto-id-' + (++Ext.idSeed);  // auto generate
         }

         if(cmp.url && cmp.linkId){
            cmp.html = '<a id="' +  cmp.linkId +
               '" style="position:absolute; width: 0px; height: 0px; opacity: 0;" >&nbsp;</a>';

            cmp.handler = function() {
               if(Ext.get(cmp.linkId)) {
                  Ext.get(cmp.linkId).set({'href': Ext.isFunction(cmp.url) ? cmp.url() : cmp.url});
               }

               if (cmp.additionalHandler) {
                  cmp.additionalHandler();
               }
               return simfla.ux.plugins.fireEvent(document.getElementById(cmp.linkId),'click');
            };
         }

         // Add set url method
         if(!cmp.setUrl) {
            cmp.setUrl = function(url) {
               cmp.url = url;
               me.init(cmp);
            };
         }
      }

      //setUrl: function(cmp, url){
      //   cmp.url = url;
      //   cmp.plugins[0].init(cmp);
      //}
   });


   Ext.preg('linkbutton', simfla.ux.plugins.linkButton);

   /**
   * Numeric field plugin
   *
   * Added functionality:
   *  - Restricts input so it only accepts valid numeric characters.
   *  - Restricts the accepted range to be within the min and max values.
   *
   * note: could make this a full up inheritted class, but
   * this makes it so we can use on spinner and numeric fields.
   */
   vrs.plugins.numericOnlyField = Ext.extend(Ext.util.Observable, {
      init: function(cmp) {
         var me = this;
         me.cmp = cmp;

         // Set the renderTpl to have the pattern to get a numeric keyboard up
         // note: copied from Ext.form.Number class
         cmp.renderTpl = [
           '<tpl if="label"><div class="x-form-label"><span>{label}</span></div></tpl>',
           '<tpl if="fieldEl"><div class="x-form-field-container">',
               '<input id="{inputId}" type="{inputType}" name="{name}" class="{fieldCls}"',
                   ' pattern="[0-9]*"',
                   '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                   '<tpl if="placeHolder">placeholder="{placeHolder}" </tpl>',
                   '<tpl if="style">style="{style}" </tpl>',
                   '<tpl if="minValue != undefined">min="{minValue}" </tpl>',
                   '<tpl if="maxValue != undefined">max="{maxValue}" </tpl>',
                   '<tpl if="stepValue != undefined">step="{stepValue}" </tpl>',
                   '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                   '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
                   '<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
               '/>',
               '<tpl if="useMask"><div class="x-field-mask"></div></tpl>',
               '</div></tpl>',
           '<tpl if="useClearIcon">',
              '<div class="x-field-clear-container">',
                  '<div class="x-field-clear x-hidden-visibility">&#215;</div>',
               '<div></tpl>'
         ];


         // Register with after render so that we can register
         // keypress event callback with the field element in the DOM.
         cmp.on('afterrender', function(field, ev) {
            var field_el = field.fieldEl;

            /*
            Ext.util.Observable.capture(field, function(ev_name) {
               console.log('Field: Event: [' + ev_name + '] ', arguments);
               return true;
            });
            */

            // Monitor the keypress and don't allow non-numeric
            // note: Doesn't seem I can simulate this event with safari (http://goo.gl/t1Tzv)
   //#JSCOVERAGE_IF 0
            field.mon(field_el, {
               keypress: function(ev_obj, dom_elt) {
                  var key_evt = ev_obj.browserEvent,
                      key_val = String.fromCharCode(key_evt.charCode);
                  //console.log('keydown: ', ev_obj, dom_elt);
                  //console.log('char code: ', key_evt.charCode);
                  //console.log('pressed key: ', key_val);

                  // If control character, then let it through
                  if(key_evt.keyCode < 32) {
                     return;
                  // If not a number, then ignore
                  } else if("0123456789".indexOf(key_val) === -1) {
                     ev_obj.preventDefault();
                  }
               }
            });
   //#JSCOVERAGE_ENDIF

            field.on({
               change: function(fieldObj, newValue, oldValue) {
                  // Intercept the change of the value and make sure it is in range
                  // if we have to correct it, then we refire the event so everyone
                  // else gets the new value correctly.
                  var num_val,
                      corrected = false;

                  // Validate the numeric range
                  num_val = Number(newValue);
                  if(!isNaN(num_val)) {
                     if((field.minValue !== undefined) && (num_val < field.minValue)) {
                        field.setValue(field.minValue);
                        corrected = true;
                     } else if((field.maxValue !== undefined) && (num_val > field.maxValue)) {
                        field.setValue(field.maxValue);
                        corrected = true;
                     }
                  }

                  // Refire if we corrected it and then return false
                  // to cut off this round of firing.
                  if(corrected) {
                     field.fireEvent('change', field, field.getValue(), oldValue);
                     return false;
                  }
               }
            });

         });
      }
   });

   Ext.preg('numericonlyfield', vrs.plugins.numericOnlyField);


   /*
   * Ugly hack to clear text fields when select fields are selected.
   *
   * Provides:
   *   - When select field is selected, clears any active focus text fields
   *     so that the iOS virtual keyboard is closed.
   *
   * As best I can tell this is needed because select fields use hidden fields that
   * never get selected.  Instead, selecting a mask on the field is what makes the
   * picker get shown.  This leaves the input focus wherever it was before this
   * and can cause the keyboard to stay up on the screen.
   *
   * We try to get around this by intercepting the onMaskTap call
   * and clear the focus field.
   */
   vrs.plugins.selectFieldClear = Ext.extend(Ext.util.Observable, {
      init: function(cmp) {
         var me = this;
         me.cmp = cmp;

         // Intercept the call and call us first
         cmp.onMaskTap = Ext.util.Functions.createInterceptor(cmp.onMaskTap,
                                 this.onMaskTap, this);

         /*
         Ext.util.Observable.capture(cmp, function(ev_name) {
            console.log('Event: [' + ev_name + '] ', arguments);
            return true;
         });
         */
      },

      /** Clear the form focus. */
      onMaskTap: function() {
         vrs.blurFocusedField();
         return true;  // continue with normal function
      }
   });

   Ext.preg('selectfieldclear', vrs.plugins.selectFieldClear);


   // --- STANDARD WIDGET EXTENSIONS ---- //
   Ext.override(Ext.TabPanel, {
      /**
      * Helper method to remove the tab bar.
      *
      * This is useful for the case of a bottom tab bar
      * when we are using forms on iOS.
      * We need to hide the tab bar so it doesn't interfere with the
      * virtual keyboard.
      */
      setTabBarVisible: function(visible) {
         var bar = this.getTabBar();

         if(visible) {
            if(this.dockedItems.indexOf(bar) !== -1) {
               this.removeDocked(bar, false);
            }
            this.addDocked(bar);
         } else {
            this.removeDocked(bar, false);
         }

         // old methods
         //this.panel.getTabBar().setVisible(visible);
         //this.panel.doLayout();

         // enable/disable
         //this.panel.getTabBar().setDisabled(!visible);
      }
   });
};
