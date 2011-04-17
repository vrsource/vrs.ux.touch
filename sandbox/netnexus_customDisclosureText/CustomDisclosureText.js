Ext.ns('Ext.ux');
/**
 * @author Johannes Pfeiffer - http://netnexus.de
 * @class Ext.ux.CustomDisclosureText
 * <p>A plugin that allows to set a custom text and class for the disclosure items in a list.</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'list',
     ...,
     plugins: [new Ext.ux.CustomDisclosureText({
        disclosureText: 'Show it',
        addCls: 'x-button custom-disclosure-btn'
        })],
     ...
 }
 * </code></pre>
 */

Ext.ux.CustomDisclosureText = function(config) {
    this.config = config;
};

Ext.extend(Ext.ux.CustomDisclosureText, Ext.util.Observable, {
    init: function(list) {
        list.tpl = '<tpl for="."><div class="x-list-item"><div class="x-list-item-body">' + list.itemTpl + '</div>';
        if (list.onItemDisclosure) {
            list.tpl += '<div class="x-list-disclosure custom-disclosure-text ' + this.config.addCls + '">' + this.config.disclosureText + '</div>';
        }
        list.tpl += '</div></tpl>';
        list.tpl = new Ext.XTemplate(list.tpl);

        if (list.grouped) {

            list.listItemTpl = list.tpl;
            if (Ext.isString(list.listItemTpl) || Ext.isArray(list.listItemTpl)) {
                list.listItemTpl = new Ext.XTemplate(list.listItemTpl);
            }
            if (Ext.isString(list.groupTpl) || Ext.isArray(list.groupTpl)) {
                list.tpl = new Ext.XTemplate(list.groupTpl);
            }
        }
        else {
            list.indexBar = false;
        }
    }
});