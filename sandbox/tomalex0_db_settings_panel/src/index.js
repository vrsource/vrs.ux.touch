Ext.SettingsPanel = Ext.extend(Ext.List, {
        deleteButton:true,
        hideGroupHeaders:true,
        groupTpl : [
        '<tpl for=".">',
            '<div class="x-list-group x-group-{id}">',
                '<h3 class="x-list-header x-settings-header" >{group}</h3>',
                '<div class="x-list-group-items">',
                    '{items}',
                '</div>',
            '</div>',
        '</tpl>',
	],
        initComponent : function() {
            var memberFnsCombo = {};
            this.tpl = '<tpl for=".">';
            if (this.deleteButton) {
                this.tpl += '<div class="x-list-del">Del</div>';
            } else {
                this.tpl += '<div class="x-list-nulldel"></div>';
            }
            this.tpl += '<div class="x-list-item"><div class="x-list-item-body">' + this.itemTpl + '</div>';
           
            if (this.onItemDisclosure) {
                this.tpl += '<div class="x-list-disclosure"></div>';
            }
            this.tpl += '</div></tpl>';
            this.tpl = new Ext.XTemplate(this.tpl, memberFnsCombo);
           
    
            if (this.grouped) {
                
                this.listItemTpl = this.tpl;
                if (Ext.isString(this.listItemTpl) || Ext.isArray(this.listItemTpl)) {
                    // memberFns will go away after removal of tpl configuration for itemTpl
                    // this copies memberFns by storing the original configuration.
                    this.listItemTpl = new Ext.XTemplate(this.listItemTpl, memberFnsCombo);
                }
                if (Ext.isString(this.groupTpl) || Ext.isArray(this.groupTpl)) {
                    this.tpl = new Ext.XTemplate(this.groupTpl);
                }
            }
            else {
                this.indexBar = false;
            }
            
            if (this.scroll !== false) {
                this.scroll = {
                    direction: 'vertical',
                    useIndicators: !this.indexBar
                };
            }
    
            Ext.List.superclass.initComponent.call(this);
    
            if (this.onItemDisclosure) {
                // disclosure can be a function that will be called when
                // you tap the disclosure button
                if (Ext.isFunction(this.onItemDisclosure)) {
                    this.onItemDisclosure = {
                        scope: this,
                        handler: this.onItemDisclosure
                    };
                }
            }
            
            if (this.deleteButton) {
                if (Ext.isFunction(this.deleteButton)) {
                    this.onItemDisclosure = {
                        scope: this,
                        handler: this.deleteButton
                    };
                }
            }
             
            this.on('deactivate', this.onDeactivate, this);
            
             this.addEvents(
                 /**
                  * @event disclose
                  * Fires when the user taps the disclosure icon on an item
                  * @param {Ext.data.Record} record The record associated with the item
                  * @param {Ext.Element} node The wrapping element of this node
                  * @param {Number} index The index of this list item
                  * @param {Ext.util.Event} e The tap event that caused this disclose to fire
                  */
                 'disclose'
             );
    }
});
Ext.apply(Ext.anims, {
    nudge: new Ext.Anim({
        direction: 'left',
        width:30,
        before: function(el) {
            this.from = {
                '-webkit-transition-duration': '500ms,500ms,500ms',
                '-webkit-transition': 'all 500ms ease-in-out'
            };
            
            if(this.direction == "left"){
                this.to = {
                    'margin-left' : this.width+'px'
                };
            } else {
                this.to = {
                    'margin-right' : this.width+'px'
                };
            }
        }
    }),
    nudgehide: new Ext.Anim({
        direction: 'left',
        width:30,
        before: function(el) {
            this.from = {
                '-webkit-transition-duration': '500ms,500ms,500ms',
                '-webkit-transition': 'all 500ms ease-in-out'
            };
            
            if(this.direction == "left"){
                this.to = {
                    'left' : this.width+'px'
                };
            } else {
                this.to = {
                    'right' : this.width+'px'
                };
            }
        }
    })
});

Ext.reg('settingspanel',Ext.SettingsPanel);
Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady : function() {
            Ext.regModel('settingsModel', {
                fields: ['section', 'type','childpanel']
            });

            var settingsStore = new Ext.data.JsonStore({
                model  : 'settingsModel',
                getGroupString : function(record) {
                    return record.get('type');
                },
                data: [
                    {"section":"Weather","type":"Network","childpanel" : "weatherpanel","icon":'weather.png'},
                    {"section":"Sms","type":"Network","childpanel" : "smspanel","icon":'sms.png'},
                    
                    {"section":"Safari","type":"Utility","childpanel" : "safarirpanel","icon":'safari.png'},
                    {"section":"Calculator","type":"Utility","childpanel" : "calculatorpanel","icon":'calculator.png'},
                    {"section":"Wallpaper","type":"Utility","childpanel" : "wallpaperpanel","icon":'flower.png'}
                ]
            });
            var deleteMode = function (width,mode){
                Ext.each(Ext.get(Ext.DomQuery.select('.settingscls .x-list-item')).elements,function(rec,i){
                    if(width == 0){
                        Ext.Anim.run(Ext.get(Ext.get(rec).dom.lastChild),'slide',{direction:'left',autoClear: false,out: false,to:'-webkit-transform: translate3d(100px, 0px, 0px)'});
                        Ext.Anim.run(Ext.get(Ext.get(rec).dom.previousSibling),'nudgehide',{direction:'left',width:-30,autoClear: false});
                    } else {
                        Ext.Anim.run(Ext.get(Ext.get(rec).dom.lastChild),'slide',{direction:'right',autoClear: false,out: true,to:'-webkit-transform: translate3d(100px, 0px, 0px)'});
                        Ext.Anim.run(Ext.get(Ext.get(rec).dom.previousSibling),'nudgehide',{direction:'left',width:15,autoClear: false});
                    }
                    Ext.Anim.run(Ext.get(rec), 'nudge', {
                        width:width,
                        direction:'left',
                        autoClear: false
                    });
                });  
            };
            var settingsBasePanel =  new Ext.Panel({
                layout:{
                    type:'vbox',
                    align:'stretch'
                },
                baseCls: 'blackback',
                fullscreen:true,
                scroll:'vertical',
                dockedItems:[{
                    xtype:'toolbar',
                    title:'Settings',
                    items:[{
                        xtype:'spacer'
                    },{
                        xtype:'button',
                        text:'Edit',
                        handler:function(el){
                            console.log(el.text);
                            if(el.text == "Edit"){
                                el.setText("Done");
                                deleteMode(30);
                            } else {
                                el.setText("Edit") ;
                                deleteMode(0);
                            }
                        }
                    }]
                }],
                items: [{
                    fullscreen:true,
                    scroll:false,
                    xtype: 'settingspanel',
                    cls:'settingscls',
                    grouped     : true,
                    indexBar    : false,
                    singleSelect: true,
                    onItemDisclosure: true,
                    store:settingsStore,
                    itemTpl: '<tpl for="."><div ><img src ="{icon}" class="icon" /><strong>{section}</strong></div></tpl>',
                    listeners:{
                        itemtap : function(dataview,index,item,e){
                            console.log(dataview.store.getAt(index).data.childpanel);
                        }
                    }
                }]
            });
            var baseSettingsPanel = new Ext.Panel({
                layout:'card',
                scroll:false,
                fullscreen:true,
                items:[settingsBasePanel]
            });
    }
});
