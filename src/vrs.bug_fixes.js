//#JSCOVERAGE_IF 0


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

/**
* Fix bug in setting grouped dynamically on a list.
*
* See: http://www.sencha.com/forum/showthread.php?248818
*
* Should be fixed in 2.2+
*/
Ext.define('Ext.ListGroupFix', {
    override: 'Ext.dataview.List',

    updateGrouped: function(grouped) {
               var me = this,
            baseCls = this.getBaseCls(),
            cls = baseCls + '-grouped',
            unCls = baseCls + '-ungrouped';

        if (grouped) {
            me.findGroupHeaderIndices();
            me.addCls(cls);
            me.removeCls(unCls);
            me.updatePinHeaders(me.getPinHeaders());
        }
        else {
            me.addCls(unCls);
            me.removeCls(cls);
            me.updatePinHeaders(null);
        }

        if (me.isPainted() && me.listItems.length) {
            me.setItemsCount(me.listItems.length);
        }

    }
});

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


/*
* Override the parseStatus method to consider 0 as a failure.
* Fixed in ST 2.0.1
*/
/*
Ext.define('Ext.overrides.Connection', {
   override: 'Ext.data.Connection',

   parseStatus: function(status) {
      var ret_val = this.callParent(arguments);

      if(0 === status) {
         ret_val.success = false;
         //console.log('set to fail');
      }

      return ret_val;
   }
});
*/


if(0) {
    // ---- Sencha Touch 1.x Bug fixes ----- //
    /**
    *
    * Extension to add a method to GeoLocation that I would really like.
    */
    Ext.override(Ext.util.GeoLocation, {

       /**
       * Manually force the GeoLocation object to send an update signal
       * out based upon the currently known values.
       *
       * this is useful when we turn on tracking and need an immediate value.
       */
       forceGeoLocationUpdate: function() {
          this.fireEvent('locationupdate', this);
       }
    });

    /** Fix bug where iOS 5 hates watchPosition for getting updates of users position.
    *
    * See: http://www.sencha.com/forum/showthread.php?150932
    *
    * This basically switches to polling system using the getCurrentPosition method
    * which iOS 5 does not appear to have an issue with.
    */
    Ext.override(Ext.util.GeoLocation, {
       setAutoUpdate : function(autoUpdate) {
          // Cancel the old one if it is running
          if (this.watchOperation !== null) {
             clearInterval(this.watchOperation);
             this.watchOperation = null;
          }
          // Early out if we are not updating anymore
          if (!autoUpdate) {
             return true;
          }
          // Oops, no geo support
          if (!Ext.supports.GeoLocation) {
             this.fireEvent('locationerror', this, false, false, true, null);
             return false;
          }
          // Start looping interval for getting the current location.
          try{
             this.watchOperation = setInterval(Ext.createDelegate(function() {
                this.updateLocation();
             }, this),
             3000); // 3 second frequency is phonegaps setting the spec is not clear on this point.
          }
          catch(e){
             this.autoUpdate = false;
             this.fireEvent('locationerror', this, false, false, true, e.message);
             return false;
          }
          return true;
       }
    });


    /**
    * Fix for bug in abort method.
    *
    * See: http://www.sencha.com/forum/showthread.php?128367
    */
    Ext.override(Ext.data.Connection, {
       abort : function(r) {
            if (r && this.isLoading(r)) {
                if (!r.timedout) {
                    r.aborted = true;
                }
                // Will fire an onreadystatechange event
                r.xhr.abort();
            }
            else if (!r) {
                var id;
                for(id in this.requests) {
                    if (!this.requests.hasOwnProperty(id)) {
                        continue;
                    }
                    this.abort(this.requests[id]);
                }
            }
        }
    });


    /**
    * see: http://www.sencha.com/forum/showthread.php?118971
    */
    Ext.override(Ext.data.Store, {
        loadRecords: function(records, add) {
            if (!add) {
                this.data.clear();
            }

            this.data.addAll(records);

            //FIXME: this is not a good solution. Ed Spencer is totally responsible for this
            // and should be forced to fix it immediately.
            if(records) {
                for (var i = 0, length = records.length; i < length; i++) {
                    records[i].needsAdd = false;
                    records[i].join(this);
                }
            }

            /*
             * this rather inelegant suspension and resumption of events is required because both
             * the filter and sort functions
             * fire an additional datachanged event, which is not wanted. Ideally we would do this
             * a different way. The first
             * datachanged event is fired by the call to this.add, above.
             */
            this.suspendEvents();

            if (this.filterOnLoad && !this.remoteFilter) {
                this.filter();
            }

            if (this.sortOnLoad && !this.remoteSort) {
                this.sort();
            }

            this.resumeEvents();
            this.fireEvent('datachanged', this, records);
        }
    });


    Ext.override(Ext.form.Field, {
        initValue: function() {
            var value = (Ext.isEmpty(this.value) ? '' : this.value);
            this.setValue(value, true);

            /**
             * The original value of the field as configured in the {@link #value} configuration, or
             * as loaded by the last form load operation if the form's
             * {@link Ext.form.BasicForm#trackResetOnLoad trackResetOnLoad}
             * setting is <code>true</code>.
             * @type mixed
             * @property originalValue
             */
            this.originalValue = this.getValue();
        }
    });

    /**
    * Fix bug where getComponent can't handle sub components indexed
    * by id and by itemId.
    *
    * See: http://www.sencha.com/forum/showthread.php?145417
    */
    Ext.override(Ext.lib.Container, {
        getComponent : function(comp) {
            var ret_comp, x, item;

            if (Ext.isObject(comp)) {
                comp = comp.getItemId();
            }

            ret_comp = this.items.get(comp);

            // If not found, try a slower more accurate lookup
            if(undefined === ret_comp) {
                if(undefined === comp) { return undefined; }

                for(x = 0; x < this.items.getCount(); x++) {
                    item = this.items.getAt(x);
                    if((comp === item.getItemId()) || (comp === item.getId())) {
                        return item;
                    }
                }
            }

            return ret_comp;
        }
    });

    /***
    * Fix issue where custom fields that we create are not treated
    * the same as the base fields.
    *
    * No bug reported yet.
    *
    * See container.handleFieldEventListener
    */
    Ext.textFieldTypes = Ext.textFieldTypes || [];
    Ext.textFieldTypes.push('textfield', 'passwordfield', 'emailfield',
        //<deprecated since=0.99>
        'textarea',
        //</deprecated>
        'textareafield', 'searchfield', 'urlfield',
        'numberfield', 'spinnerfield');

    Ext.override(Ext.Container, {
        handleFieldEventListener: function(isAdding, item) {
            if (!this.fieldEventWrap)
            {    this.fieldEventWrap = {}; }

            if (Ext.textFieldTypes.indexOf(item.xtype) !== -1) {
                if (isAdding) {
                    this.fieldEventWrap[item.id] = {
                        beforefocus: function(e) {this.onFieldBeforeFocus(item, e);},
                        focus: function(e) {this.onFieldFocus(item, e);},
                        blur: function(e) {this.onFieldBlur(item, e);},
                        keyup: function(e) {this.onFieldKeyUp(item, e);},
                        scope: this
                    };

                    this.containsFormFields = true;
                }

                item[isAdding ? 'on' : 'un'](this.fieldEventWrap[item.id]);

                if (!isAdding) {
                    delete this.fieldEventWrap[item.id];
                }
            }
        }
    });


    /*
    Ext.override(Ext.data.RestProxy, {
        buildUrl: function(request) {
            var records = request.operation.records || [],
                record  = records[0],
                format  = this.format,
                url     = request.url || this.url;

            if (this.appendId && record) {
                if (!url.match(/\/$/)) {
                    url += '/';
                }

                url += record.getId();
            }

            if (format) {
                if (!url.match(/\.$/)) {
                    url += '.';
                }

                url += format;
            }

            request.url = url;

            return Ext.data.RestProxy.superclass.buildUrl.apply(this, arguments);
        }
    });
    */

    /*
    * Bug IMHO related to data.Proxy batching
    * sending multiple POST and PUT's at the same time.
    *
    * See: http://support.sencha.com/index.php#ticket-3568
    */
    /*
    Ext.override(Ext.data.Proxy, {
        batch: function(operations, listeners) {
            var records, batch;

            batch = new Ext.data.Batch({
                proxy: this,
                listeners: listeners || {}
            });

            Ext.each(this.batchOrder.split(','), function(action) {
                records = operations[action];

                Ext.each(records, function(record) {
                    batch.add(new Ext.data.Operation({
                        action : action,
                        records: [record]
                    }));
                }, this);
            }, this);

            batch.start();

            return batch;
        }
    });
    */


    /*
     * Update Sencha Touch to do AJAX form uploads.  This uses the Sencha Touch 2 codebase.
     */
    Ext.override(Ext.data.Connection, {
       requestForm : function(o) {
            var me = this,
                params      = o.params,
                url         = o.url || me.url,
                urlParams   = o.urlParams,
                extraParams = me.extraParams,
                request, data, headers,
                method, key, xhr, contentType, jsonData, xmlData;

            if (me.fireEvent('beforerequest', me, o) !== false) {
                // allow params to be a method that returns the params object
                if (Ext.isFunction(params)) {
                    params = params.call(o.scope || window, o);
                }

                // allow url to be a method that returns the actual url
                if (Ext.isFunction(url)) {
                    url = url.call(o.scope || window, o);
                }

                // check for xml or json data, and make sure json data is encoded
                data = o.rawData || o.xmlData || o.jsonData || null;
                if (o.jsonData && !Ext.isPrimitive(o.jsonData)) {
                    data = Ext.encode(data);
                }

                // make sure params are a url encoded string and include any extraParams if specified
                params = Ext.urlEncode(extraParams,
                      Ext.isObject(params) ? Ext.urlEncode(params) : params);

                urlParams = Ext.isObject(urlParams) ? Ext.urlEncode(urlParams) : urlParams;

                // decide the proper method for this request
                method = (o.method || ((params || data) ? 'POST' : 'GET')).toUpperCase();

                // if the method is get append date to prevent caching
                if (method === 'GET' && o.disableCaching !== false && me.disableCaching) {
                    url = Ext.urlAppend(url,
                      o.disableCachingParam || me.disableCachingParam + '=' + (new Date().getTime()));
                }

                // if the method is get or there is json/xml data append the params to the url
                if ((method === 'GET' || data) && params) {
                    url = Ext.urlAppend(url, params);
                    params = null;
                }

                // allow params to be forced into the url
                if (urlParams) {
                    url = Ext.urlAppend(url, urlParams);
                }

                if (this.isFormUpload(o) === true) {
                    this.upload(o.form, url, data || params || null, o);
                    return null;
                }

                // if autoabort is set, cancel the current transactions
                if (o.autoAbort === true || me.autoAbort) {
                    me.abort();
                }

                // create a connection object
                xhr = this.getXhrInstance();

                // open the request
                xhr.open(method.toUpperCase(), url, true);

                // create all the headers
                headers = Ext.apply({}, o.headers || {}, me.defaultHeaders || {});
                if (!headers['Content-Type'] && (data || params)) {
                    contentType = me.defaultPostHeader;
                    jsonData    = o.jsonData;
                    xmlData     = o.xmlData;

                    if (data) {
                        if (o.rawData) {
                            contentType = 'text/plain';
                        } else {
                            if (xmlData && Ext.isDefined(xmlData)) {
                                contentType = 'text/xml';
                            } else if (jsonData && Ext.isDefined(jsonData)) {
                                contentType = 'application/json';
                            }
                        }
                    }
                    headers['Content-Type'] = contentType;
                }
                if (me.useDefaultXhrHeader && !headers['X-Requested-With']) {
                    headers['X-Requested-With'] = me.defaultXhrHeader;
                }
                // set up all the request headers on the xhr object
                for (key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        try {
                            xhr.setRequestHeader(key, headers[key]);
                        }
                        catch(e) {
                            me.fireEvent('exception', key, headers[key]);
                        }
                    }
                }

                // create the transaction object
                request = {
                    id: ++Ext.data.Connection.requestId,
                    xhr: xhr,
                    headers: headers,
                    options: o,
                    timeout: setTimeout(function() {
                        request.timedout = true;
                        me.abort(request);
                    }, o.timeout || me.timeout)
                };
                me.requests[request.id] = request;

                // bind our statechange listener
                xhr.onreadystatechange = Ext.createDelegate(me.onStateChange, me, [request]);

                // start the request!
                xhr.send(data || params || null);
                return request;
            } else {
                return o.callback ? o.callback.apply(o.scope, [o, undefined, undefined]) : null;
            }
        },

         /**
         * Detects whether the form is intended to be used for an upload.
         * @private
         */
        isFormUpload: function(options) {
            var form = this.getForm(options);
            if (form) {
                return (options.isUpload || (/multipart\/form-data/i).test(
                                                                  form.getAttribute('enctype')));
            }
            return false;
        },

        /**
         * Gets the form object from options.
         * @private
         * @param {Object} options The request options
         * @return {HTMLElement} The form, null if not passed
         */
        getForm: function(options) {
            return Ext.getDom(options.form) || null;
        },

        /**
         * Uploads a form using a hidden iframe.
         * @param {String/HTMLElement/Ext.Element} form The form to upload
         * @param {String} url The url to post to
         * @param {String} params Any extra parameters to pass
         * @param {Object} options The initial options
         */
        upload: function(form, url, params, options) {
            form    = Ext.getDom(form);
            options = options || {};

            var id = Ext.id(),
                frame    = document.createElement('iframe'),
                hiddens  = [],
                encoding = 'multipart/form-data',

                buf = {
                    target:   form.target,
                    method:   form.method,
                    encoding: form.encoding,
                    enctype:  form.enctype,
                    action:   form.action
                },

                hiddenItem,

                addField   = function(name, value) {
                   hiddenItem = document.createElement('input');
                   Ext.fly(hiddenItem).set({
                      type: 'hidden',
                      value: value,
                      name: name
                   });
                   form.appendChild(hiddenItem);
                   hiddens.push(hiddenItem);
                };

            /*
             * Originally this behaviour was modified for Opera 10 to apply the secure URL after
             * the frame had been added to the document. It seems this has since been corrected in
             * Opera so the behaviour has been reverted, the URL will be set before being added.
             */
            Ext.fly(frame).set({
                id: id,
                name: id,
                cls: Ext.baseCSSPrefix + 'hide-display',
                src: Ext.SSL_SECURE_URL
            });

            document.body.appendChild(frame);

            // This is required so that IE doesn't pop the response up in a new window.
            if (document.frames) {
                document.frames[id].name = id;
            }

            Ext.fly(form).set({
                target: id,
                method: 'POST',
                enctype: encoding,
                encoding: encoding,
                action: url || buf.action
            });

            // add dynamic params
            if (params) {
                Ext.iterate(Ext.Object.fromQueryString(params), function(name, value) {
                    if (Ext.isArray(value)) {
                        Ext.each(value, function(v) {
                            addField(name, v);
                        });
                    } else {
                        addField(name, value);
                    }
                });
            }

            Ext.fly(frame).on('load',
                  Ext.createDelegate(this.onUploadComplete, this, [frame, options, id]),
                  null, {single: true});

            form.submit();

            Ext.fly(form).set(buf);
            Ext.each(hiddens, function(h) {
                Ext.removeNode(h);
            });
        },

        onUploadComplete: function(frame, options, frameId) {
            var me = this,
                // bogus response object
                response = {
                    responseText: '',
                    responseXML: null
                }, doc, firstChild;

            try {
                doc = frame.contentWindow.document||
                   frame.contentDocument||
                   window.frames[frameId].document;

                if (doc) {
                    if (doc.body) {
                        // json response wrapped in textarea
                        if (/textarea/i.test(
                                 (firstChild = doc.body.firstChild || {}).tagName)) {
                            response.responseText = firstChild.value;
                        } else {
                            response.responseText = doc.body.innerHTML;
                        }
                    }
                    //in IE the document may still have a body even if returns XML.
                    response.responseXML = doc.XMLDocument || doc;
                }
            } catch (e) {
            }

            me.fireEvent('requestcomplete', me, response, options);

            if (options.success) {
               options.success.bind(options.scope)(response, options);
            }
            if (options.callback) {
               options.callback.bind(options.scope)(options, true, response);
            }

            setTimeout(function() {
                Ext.removeNode(frame);
            }, 100);
        }
    });

    /**
     * Patch that allows Form Selects to have none selected
     * http://www.sencha.com/forum/showthread.php?111532-Select-field-to-no-selection./page2
     *
     * Fix bug where selectfield can't select an item with a value of 0.
     * http://www.sencha.com/forum/showthread.php?154587
     */
    Ext.override(Ext.form.Select, {
       setValue : function(value) {
          var idx = -1,
              hiddenField = this.hiddenField,
              record = null,
              dispval = "",
              pickerValue;

          if ((null !== value) && (undefined !== value)) { // Better falsy check
             idx = this.store.findExact(this.valueField, value);
          }
          if (idx !== -1) {
             record = this.store.getAt(idx);
          }

          if (record) {
             this.value = record.get(this.valueField);
             dispval = record.get(this.displayField);
          } else {
             // record not found
             this.value =  '';
             dispval = this.placeHolder;
          }

          if (this.rendered){
             this.fieldEl.dom.value = dispval;
             if (hiddenField) {hiddenField.dom.value = this.value;}
          }

          // Temporary fix, the picker should sync with the store automatically by itself
          if (this.picker) {
             pickerValue = {};
             pickerValue[this.name] = this.value;
             this.picker.setValue(pickerValue);
          }

          return this;
       },

       showComponent: function() {
          var picker, name,
              value  = {},
              listPanel, index;

          if (Ext.is.Phone) {
             picker = this.getPicker();
             name   = this.name;

             value[name] = this.getValue();
             picker.show();
             picker.setValue(value);
          } else {
             listPanel = this.getListPanel();
             index = this.store.findExact(this.valueField, this.value);

             listPanel.showBy(this.el, 'fade', false);
             if (index !== -1) {listPanel.down('#list').getSelectionModel().select(index, false, true);}
          }
        },

        // Overridden to so that the non-phone interface does not allow deselect
        // this way the iPad and iPhone work the same
        getListPanel: function() {
            if (!this.listPanel) {
                this.listPanel = new Ext.Panel({
                    floating         : true,
                    stopMaskTapEvent : false,
                    hideOnMaskTap    : true,
                    cls              : 'x-select-overlay',
                    scroll           : 'vertical',
                    items: {
                        xtype: 'list',
                        store: this.store,
                        itemId: 'list',
                        scrollable: false,
                        // Here is the change to tell the list widget to not allow deselect
                        allowDeselect: false,
                        itemTpl : [
                            '<span class="x-list-label">{' + this.displayField + '}</span>',
                            '<span class="x-list-selected"></span>'
                        ],
                        listeners: {
                            select : this.onListSelect,
                            scope  : this
                        }
                    }
                });
            }

            return this.listPanel;
        }
    });
}


//#JSCOVERAGE_ENDIF
