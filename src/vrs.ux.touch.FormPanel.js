/**

Required functionality:

Config and Structure:
* It should support simple configuration and specification of "rows"
* It should allow specifying lead icon and/or disclosure icon
* It should allow specifying a class that is used for mask styling instead
* It should use an item selector internally.
* It should support setting defaults for configuration (ex: right chevron for all items)
- It should support updating the configuration (in place?)



Events:
* It should support events for when the lead/trail objects are tapped
* It should support itemtap
* It should support itemdoubletap
* It should support itemswipe
* It should support events callbacks getting an index of the item selected
* It should support per item events (itemtap, itemdoubletap, itemswipe)
* It should support custom events (per item) for the lead/trail objects tapped


Style:
* It should have a style for when an item is selected (pressedItemCls)
* It should be styled to look like part of a form
* It should support being used inside a fieldset
* It should allow setting a class that gets set for each row.  (allows styling items)
- It should be able to be styled to look fine outside of a form
- It should support a style that looks iPhone-ish

future:
- It should support configuring with a component to use
- It should support fields in righthand side
*/

/**
* Class for creating 'list' of items that can be used in forms
* or menus as selectable items with decorations.
*
*/
FormList = Ext.extend(Ext.Component, {
   componentCls: 'x-form-list',

   /**
   * CSS class to use for decorating all rows in the list.
   */
   rowCls: 'x-formlist-row',

   /**
    * @cfg {String} iconMaskCls
    * CSS class to be added to the items that need mask applied
    * Defaults to 'x-icon-mask'
    */
   iconMaskCls: 'x-formlist-icon-mask',

   pressedCls: 'x-formlist-row-selected',  // Dataview x-item-pressed

   /**
     * @cfg {Number} pressedDelay
     * The amount of delay between the tapstart and the moment we add the pressedCls.
     * Settings this to true defaults to 100ms
    */
   pressedDelay: 100,

   contentCls: 'x-formlist-content',
   leftItemCls: 'x-formlist-leftitem',
   rightItemCls: 'x-formlist-rightitem',


   /**
   * List of configurations for each row in the form panel.
   * Each row item supports the following properties:
   *  - content: string - The text content to put on the row.
   *  - leftIcon / rightIcon: URL of an icon to display.
   *  - leftIconCls / rightIconCls: Icon mask class to use for the left/right icon.
   *  - itemtap, itemdoubletap, itemswipe, lefttap, righttap: function to call when
   *         the event happens for that specific row.
   */
   formItems: [],

   /** Default values for the form items.
   * Can be used for example to set a common rightIcon.
   */
   formItemDefaults: {},

   initComponent: function() {
      FormList.superclass.initComponent.call(this);

      this.addEvents(
         /**
          * @event itemtap
          * Fires when a item is tapped on
          * @param {FormList} this The FormList object.
          * @param {Number} index The index of the row that was tapped
          */
         'itemtap',

         /**
          * @event itemdoubletap
          * Fires when an item is double tapped on
          * @param {FormList} this The FormList object.
          * @param {Number} index The index of the item that was tapped
          * @param {Ext.Element} item The item element
          * @param {Ext.EventObject} e The event object
          */
         'itemdoubletap',

         /**
          * @event itemswipe
          * Fires when a node is swipped
          * @param {FormList} this The FormList object.
          * @param {Number} index The index of the item that was tapped
          * @param {Ext.Element} item The item element
          * @param {Ext.EventObject} e The event object
          */
         'itemswipe',

         /**
          * @event lefttap
          * Fires when a item's left icon is tapped on
          * @param {FormList} this The FormList object.
          * @param {Number} index The index of the row that was tapped
          */
         'lefttap',

         /**
          * @event righttap
          * Fires when a item's right icon is tapped on
          * @param {FormList} this The FormList object.
          * @param {Number} index The index of the row that was tapped
          */
         'lefttap'
      );


   },

   // @private
   afterRender: function() {
      var me = this;
      FormList.superclass.afterRender.call(me);

      // Setup all the event handlers we need to monitor.
      me.mon(me.getTargetEl(), {
         singletap: me.onTap,
         tapstart : me.onTapStart,
         tapcancel: me.onTapCancel,
         touchend : me.onTapCancel,
         doubletap: me.onDoubleTap,
         swipe    : me.onSwipe,
         scope    : me
      });
   },

   /**
     * Return the selected items DOM node given an event.
     * @param {Ext.EventObject} e
     */
   findItemByEvent: function(e) {
      // Search up parents for the row element and stop at the formlist element
      return e.getTarget('.' + this.rowCls, this.getTargetEl());
   },

   /** Return the numeric index of the given node item from our list.
   * Returns -1 if not found.
   */
   indexOf: function(itemNode) {
      var row_elts = this.getTargetEl().query('.' + this.rowCls);
      return row_elts.indexOf(itemNode);
   },

   /** Return a object containing the values to use
   * for the given form item index.
   * This combines the configured values with the default values.
   */
   getItemValues: function(index) {
      return Ext.apply({}, this.formItems[index], this.formItemDefaults);
   },

   // ---- RENDERING OF CONTENT --- //
   /**
   * Called after component structure is setup.
   * We add our structure by calling refresh to reload everything.
   */
   onRender : function() {
      FormList.superclass.onRender.apply(this, arguments);
      this.refresh();
   },

   /**
   * Refresh the content to the most recent state of the formData.
   *
   * Note: could try to use XTemplate in the future, but for now turned
   *       out to be more complex then just doing this directly.
   */
   /*
    <div class="x-form-list">
      <div class="x-formlist-row">
         <div class="x-formlist-leftitem leftClass">opt_image</div>
         <div class="x-formlist-content">content</div>
         <div class="x-formlist-rightitem rightClass">opt_image</div>
      </div>
      <div class="x-formlist-row">
         <div class="x-formlist-leftitem leftClass">opt_image</div>
         <div class="x-formlist-content">content</div>
         <div class="x-formlist-rightitem rightClass">opt_image</div>
      </div>
    </div>
   */
   refresh : function() {
      var x, item,
          me = this,
          el = this.getTargetEl(),
          hasLeftContent = false,
          hasRightContent = false,
          htmlFrags = [],
          htmlContent;

      // Determine if we have content on left and right to include
      for(x=0; x<this.formItems.length; x++) {
         item = this.getItemValues(x);
         if(!(Ext.isEmpty(item.leftIcon) && Ext.isEmpty(item.leftIconCls)))
         { hasLeftContent = true; }
         if(!(Ext.isEmpty(item.rightIcon) && Ext.isEmpty(item.rightIconCls)))
         { hasRightContent = true; }
      }

      // Return an html fragment for one section (left or right)
      // contains div for section with embedded img with either icon or mask class
      getSectionDivStr = function(itemCls, iconCls, itemIcon) {
         var img, icon_cls_str;
         if(Ext.isEmpty(itemIcon))
         { itemIcon = Ext.BLANK_IMAGE_URL; }
         icon_cls_str = (Ext.isEmpty(iconCls) ? ""
                                 : 'class="' + (me.iconMaskCls + ' ' + iconCls) + '"');

         var img = '<img ' + icon_cls_str + ' src="' + itemIcon + '">';
         return '<div class="' + itemCls + '">' + img + '</div>';
      }

      // build up contents
      for(x=0; x<this.formItems.length; x++) {
         item = this.getItemValues(x);

         htmlFrags.push('<div class="' + me.rowCls + ' x-field">');
         if(hasLeftContent)
         { htmlFrags.push(getSectionDivStr(me.leftItemCls, item.leftIconCls, item.leftIcon)); }
         if(!Ext.isEmpty(item.content))
         { htmlFrags.push('<div class="' + me.contentCls + '">' + item.content + '</div>'); }
         if(hasRightContent)
         { htmlFrags.push(getSectionDivStr(me.rightItemCls, item.rightIconCls, item.rightIcon)); }
         htmlFrags.push('</div>');
      }

      // Put it in place
      htmlContent = htmlFrags.join('\n');
      el.update(htmlContent);
   },

   // ---- EVENT HANDLING ---- //

   // @private
   onTap: function(e) {
      console.log('onTap called');
      var index, form_item,
          itemNode = this.findItemByEvent(e);
      if (itemNode) {
         Ext.fly(itemNode).removeCls(this.pressedCls);
         index = this.indexOf(itemNode);
         form_item = this.getItemValues(index);
         if (this.onItemTap(index, e) !== false) {
            // Now determine if it was the left, right, or center that was clicked.
            if(e.getTarget('.' + this.leftItemCls, this.getTargetEl()))
            {
               if(!Ext.isEmpty(form_item.lefttap))
               { form_item.lefttap(this, index, itemNode, e); }
               this.fireEvent('lefttap', this, index, itemNode, e);
            }
            else if(e.getTarget('.' + this.rightItemCls, this.getTargetEl()))
            {
               if(!Ext.isEmpty(form_item.righttap))
               { form_item.righttap(this, index, itemNode, e); }
               this.fireEvent('righttap', this, index, itemNode, e);
            }
            else
            {
               if(!Ext.isEmpty(form_item.itemtap))
               { form_item.itemtap(this, index, itemNode, e); }
               this.fireEvent("itemtap", this, index, itemNode, e);
            }
         }
      }
      /* No container taps for now.
      else {
         if(this.fireEvent("containertap", this, e) !== false) {
                this.onContainerTap(e);
            }
        }
      */
   },

   // @private
   onTapStart: function(e, t) {
      console.log('onTapStart called');
      var me = this;
      var item = this.findItemByEvent(e);

      if (item) {
         // If we should delay press, create the delay and manage it here.
         if (me.pressedDelay) {
            if (me.pressedTimeout) {
               clearTimeout(me.pressedTimeout);
            }
            me.pressedTimeout = setTimeout(function() {
               Ext.fly(item).addCls(me.pressedCls);
            }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
         }
         else {
            Ext.fly(item).addCls(me.pressedCls);
         }
      }
   },

   // @private
   onTapCancel: function(e, t) {
      console.log('onTapCancel called');
      var me = this,
          item = this.findItemByEvent(e);

      if (me.pressedTimeout) {
         clearTimeout(me.pressedTimeout);
         delete me.pressedTimeout;
      }

      if (item) {
         Ext.fly(item).removeCls(me.pressedCls);
      }
   },

   // @private
   onContainerTap: function(e) {
      //if (this.allowDeselect) {
      //    this.clearSelections();
      //}
   },

   // @private
   onDoubleTap: function(e) {
      console.log('onDoubleTap called');
      var index, form_item,
          item = this.findItemByEvent(e);
      if (item) {
         index = this.indexOf(item);
         form_item = this.getItemValues(index);
         if(!Ext.isEmpty(form_item.itemdoubletap))
         { form_item.itemdoubletap(this, index, item, e); }
         this.fireEvent("itemdoubletap", this, this.indexOf(item), item, e);
      }
   },

   // @private
   onSwipe: function(e) {
      console.log('onSwipe called');
      var index, form_item,
          item = this.findItemByEvent(e);
      if (item) {
         index = this.indexOf(item);
         form_item = this.getItemValues(index);
         if(!Ext.isEmpty(form_item.itemswipe))
         { form_item.itemswipe(this, index, item, e); }
         this.fireEvent("itemswipe", this, this.indexOf(item), item, e);
      }
   },

   // @private
   /* Called from internal event handlers when item is tapped.
   * Return true to allow the tap.
   */
   onItemTap: function(index, e) {
      if (this.pressedTimeout) {
         clearTimeout(this.pressedTimeout);
         delete this.pressedTimeout;
      }
      return true;
   }

});

