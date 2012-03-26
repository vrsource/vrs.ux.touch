/*global clearTimeout: false */
Ext.ns('vrs.ux.touch');

vrs.ux.touch.BLANK_IMAGE_URL =
   'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

/**
* Class for creating menu of items that can be used in forms
* or menus as selectable items with decorations.
*
* It supports updating in place or en-mass and provides
* flexibility in how to specify the decorations (masks, icons, etc).
*
* TODO:
*  - Add support for usage with stores.  This would allow
*    something similar to lists but styled and formatted
*    as menu panels.
*  - Look into using data view with components instead.
*
*/

Ext.define('vrs.ux.touch.MenuPanel', {
   extend : 'Ext.Component',
   xtype  : 'vrs_menupanel',

   config: {
      cls: 'x-menu-panel',

      /**
      * CSS class to use for decorating all rows in the menu.
      */
      rowCls: 'x-menupanel-row',

      /**
       * @cfg {String} iconMaskCls
       * CSS class to be added to the items that need mask applied
       * Defaults to 'x-icon-mask'
       */
      iconMaskCls: 'x-menupanel-icon-mask',

      pressedCls: 'x-menupanel-row-selected',  // Dataview x-item-pressed

      /**
        * @cfg {Number} pressedDelay
        * The amount of delay between the tapstart and the moment we add the pressedCls.
        * Settings this to true defaults to 100ms
       */
      pressedDelay: 100,

      contentCls: 'x-menupanel-content',
      leftItemCls: 'x-menupanel-leftitem',
      rightItemCls: 'x-menupanel-rightitem',


      /**
      * List of configurations for each row in the menu panel.
      * Each row item supports the following properties:
      *  - content: string - The text content to put on the row.
      *  - leftIcon / rightIcon: URL of an icon to display.
      *  - leftIconCls / rightIconCls: Icon mask class to use for the left/right icon.
      *  - itemtap, itemdoubletap, itemswipe, lefttap, righttap: function to call when
      *         the event happens for that specific row.
      */
      menuItems: [],

      /** Default values for the form items.
      * Can be used for example to set a common rightIcon.
      *   object of default settings.
      */
      menuItemDefaults: []
   },

   // --- Events ---- //
   /**
   * @event itemtap
   * Fires when a item is tapped on
   * @param {MenuPanel} this The MenuPanel object.
   * @param {Number} index The index of the row that was tapped
   */

   /**
   * @event itemdoubletap
   * Fires when an item is double tapped on
   * @param {MenuPanel} this The MenuPanel object.
   * @param {Number} index The index of the item that was tapped
   * @param {Ext.Element} item The item element
   * @param {Ext.EventObject} e The event object
   */

   /**
   * @event itemswipe
   * Fires when a node is swipped
   * @param {MenuPanel} this The MenuPanel object.
   * @param {Number} index The index of the item that was tapped
   * @param {Ext.Element} item The item element
   * @param {Ext.EventObject} e The event object
   */

   /**
   * @event lefttap
   * Fires when a item's left icon is tapped on
   * @param {MenuPanel} this The MenuPanel object.
   * @param {Number} index The index of the row that was tapped
   */

   /**
   * @event righttap
   * Fires when a item's right icon is tapped on
   * @param {MenuPanel} this The MenuPanel object.
   * @param {Number} index The index of the row that was tapped
   */

   /**
   * Initialize the component.
   */
   initialize: function() {
      var target_el;

      this.callParent(arguments);

      // Setup event handlers for the elements
      // Setup all the event handlers we need to monitor.
      target_el = this.element;

      // XXX: probably needs changed.
      target_el.on({
         tap        : this.onTap,
         touchstart : this.onTapStart,
         touchend   : this.onTapCancel,
         doubletap  : this.onDoubleTap,
         swipe      : this.onSwipe,
         scope      : this
      });

      // Setup the UI
      this.refresh();
   },


   /**
   * Update an item in the menu based upon the itemObj properties passed.
   *
   * itemObj overrides the existing settings but does not replace them.
   * ie. you don't have to set all properties.
   *
   * The method trys to intelligently determine which properties have
   * have changed by comparing them to the current settings.  Because
   * of this, you can not pass the same object in that is already
   * in the menuItems.
   */
   updateItem: function(index, itemObj) {
      var me = this,
          cur_values,
          cur_icon_cls,
          icon_selector,
          img_node,
          new_icon,
          node;

      node = this.getNodeByIndex(index);

      // Loop over all settings and update based upon that specific setting.
      Ext.iterate(itemObj, function(key, value) {
         // Get it each time because the values may have changed with a refresh call below
         cur_values = me.getItemValues(index);

         // If no change, skip it
         if(cur_values[key] === value)
         { return; }

         if('content' === key)
         {
            Ext.fly(node).down('.' + me.getContentCls()).setHtml(value);
         }
         else if(('leftIconCls' === key) || ('rightIconCls' === key) ||
                 ('leftIcon' === key) || ('rightIcon' === key)) {
            // Try to find the img element we are using
            icon_selector = (('leftIconCls' === key) ? me.getLeftItemCls() : me.getRightItemCls());
            img_node = Ext.fly(node).down('.' + icon_selector + ' > img');

            // If we don't find an img node, resort to a full update because
            // the current DOM doesn't have the icons in it.
            if(!img_node)
            {
               // XXX: Apply to copy returned?
               Ext.apply(me.getMenuItems()[index], itemObj);
               me.refresh();
               return;
            }

            if(('leftIconCls' === key) || ('rightIconCls' === key)) {
               cur_icon_cls = (('leftIconCls' === key) ?
                                 cur_values['leftIconCls'] : cur_values['rightIconCls']);
               if(Ext.isEmpty(value))  // Remove the mask classes
               { img_node.removeCls([me.getIconMaskCls(), cur_icon_cls]); }
               else  // Replace (or set) the classes
               {
                  img_node.replaceCls(cur_icon_cls, value);
                  img_node.addCls(me.getIconMaskCls());
               }
            }
            else { // assert: (('leftIcon' === key) || ('rightIcon' === key))
               // Replace the icon
               new_icon = (Ext.isEmpty(value) ? (vrs.ux.touch.BLANK_IMAGE_URL) : value);
               img_node.set({src: new_icon});
            }
         }  // if iconcls or icon

         // Assign the new value
         me.getMenuItems()[index][key] = value;
      });
   },


   /**
     * Return the selected items DOM node given an event.
     * @param {Ext.EventObject} e
     */
   findItemByEvent: function(e) {
      // Search up parents for the row element and stop at the menupanel element
      return e.getTarget('.' + this.getRowCls(), this.element);
   },

   /** Return the numeric index of the given node item from our list.
   * Returns -1 if not found.
   */
   indexOf: function(itemNode) {
      var row_elts = this.element.query('.' + this.getRowCls());
      return row_elts.indexOf(itemNode);
   },

   /** Return the DOM node for the row at the given index.
   */
   getNodeByIndex: function(index) {
      var row_elts = this.element.query('.' + this.getRowCls());
      return row_elts[index];
   },

   /** Return a object containing the values to use
   * for the given menu item index.
   * This combines the configured values with the default values.
   */
   getItemValues: function(index) {
      return Ext.apply({}, this.getMenuItems()[index], this.getMenuItemDefaults());
   },

   // ---- RENDERING OF CONTENT --- //

   /**
   * Refresh the content to the most recent state of the menuItems.
   *
   * Note: could try to use XTemplate in the future, but for now turned
   *       out to be more complex then just doing this directly.
   */
   /*
    <div class="x-menu-panel">
      <div class="x-menupanel-row">
         <div class="x-menupanel-leftitem leftClass">opt_image</div>
         <div class="x-menupanel-content">content</div>
         <div class="x-menupanel-rightitem rightClass">opt_image</div>
      </div>
      <div class="x-menupanel-row">
         <div class="x-menupanel-leftitem leftClass">opt_image</div>
         <div class="x-menupanel-content">content</div>
         <div class="x-menupanel-rightitem rightClass">opt_image</div>
      </div>
    </div>
   */
   refresh : function() {
      var x, item,
          me = this,
          el = this.element,
          hasLeftContent = false,
          hasRightContent = false,
          htmlFrags = [],
          htmlContent,
          getSectionDivStr,
          numItems = this.getMenuItems().length;

      // Determine if we have content on left and right to include
      for(x=0; x<numItems; x++) {
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
         { itemIcon = vrs.ux.touch.BLANK_IMAGE_URL; }
         icon_cls_str = (Ext.isEmpty(iconCls) ? ""
                                 : 'class="' + (me.getIconMaskCls() + ' ' + iconCls) + '"');

         img = '<img ' + icon_cls_str + ' src="' + itemIcon + '">';
         return '<div class="' + itemCls + '">' + img + '</div>';
      };

      // build up contents
      for(x=0; x<numItems; x++) {
         item = this.getItemValues(x);

         htmlFrags.push('<div class="' + me.getRowCls() + ' x-field">');
         if(hasLeftContent)
         { htmlFrags.push(getSectionDivStr(me.getLeftItemCls(), item.leftIconCls, item.leftIcon)); }
         if(!Ext.isEmpty(item.content))
         { htmlFrags.push('<div class="' + me.getContentCls() + '">' + item.content + '</div>'); }
         if(hasRightContent)
         {
            htmlFrags.push(getSectionDivStr(me.getRightItemCls(),
                                            item.rightIconCls,
                                            item.rightIcon));
         }
         htmlFrags.push('</div>');
      }

      // Put it in place
      htmlContent = htmlFrags.join('\n');
      el.setHtml(htmlContent);
   },

   // ---- EVENT HANDLING ---- //

   // @private
   onTap: function(e) {
      console.log('onTap called');
      var index, menu_item,
          itemNode = this.findItemByEvent(e);
      if (!this.disabled && itemNode) {
         Ext.fly(itemNode).removeCls(this.getPressedCls());
         index = this.indexOf(itemNode);
         menu_item = this.getItemValues(index);
         if (this.onItemTap(index, e) !== false) {
            // Now determine if it was the left, right, or center that was clicked.
            if(e.getTarget('.' + this.getLeftItemCls(), this.element))
            {
               if(!Ext.isEmpty(menu_item.lefttap))
               { menu_item.lefttap(this, index, itemNode, e); }
               this.fireEvent('lefttap', this, index, itemNode, e);
            }
            else if(e.getTarget('.' + this.getRightItemCls(), this.element))
            {
               if(!Ext.isEmpty(menu_item.righttap))
               { menu_item.righttap(this, index, itemNode, e); }
               this.fireEvent('righttap', this, index, itemNode, e);
            }
            else
            {
               if(!Ext.isEmpty(menu_item.itemtap))
               { menu_item.itemtap(this, index, itemNode, e); }
               this.fireEvent('itemtap', this, index, itemNode, e);
            }
         }
      }
   },

   /**
   * Handle highlighting on tap start.
   * @private
   */
   onTapStart: function(e, t) {
      console.log('onTapStart called');
      var me = this,
          item = this.findItemByEvent(e);

      if (!this.disabled && item) {
         // If we should delay press, create the delay and manage it here.
         if (me.getPressedDelay()) {
            if (me.pressedTimeout) {
               clearTimeout(me.pressedTimeout);
            }
            me.pressedTimeout = setTimeout(function() {
               Ext.fly(item).addCls(me.getPressedCls());
            }, Ext.isNumber(me.getPressedDelay()) ? me.pressedDelay : 100);
         }
         else {
            Ext.fly(item).addCls(me.getPressedCls());
         }
      }
   },

   /**
   * Hide the highlighting.
   * @private
   */
   onTapCancel: function(e, t) {
      console.log('onTapCancel called');
      var me = this,
          item = this.findItemByEvent(e);

      if (me.pressedTimeout) {
         clearTimeout(me.pressedTimeout);
         delete me.pressedTimeout;
      }

      if (item) {
         Ext.fly(item).removeCls(me.getPressedCls());
      }
   },

   // @private
   onDoubleTap: function(e) {
      console.log('onDoubleTap called');
      var index, menu_item,
          item = this.findItemByEvent(e);
      if (!this.disabled && item) {
         index = this.indexOf(item);
         menu_item = this.getItemValues(index);
         if(!Ext.isEmpty(menu_item.itemdoubletap))
         { menu_item.itemdoubletap(this, index, item, e); }
         this.fireEvent("itemdoubletap", this, this.indexOf(item), item, e);
      }
   },

   // @private
   onSwipe: function(e) {
      console.log('onSwipe called');
      var index, menu_item,
          item = this.findItemByEvent(e);
      if (!this.disabled && item) {
         index = this.indexOf(item);
         menu_item = this.getItemValues(index);
         if(!Ext.isEmpty(menu_item.itemswipe))
         { menu_item.itemswipe(this, index, item, e); }
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

