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

Ext.ns('simfla.ux.plugins.');

simfla.ux.plugins.editableListButton = Ext.extend(Ext.util.Observable, {
    init: function(cmp){
        this.cmp = cmp;
        
        if(this.cmp.editText)
        {
            this.cmp.setText(this.cmp.editText)
        }
        
        cmp.on('tap', this.handleToggle, this);
    },
    handleToggle: function(){
        var me = this;
        if(me.cmp.listId){
            var list = Ext.getCmp(me.cmp.listId);
            if(list){
                if(list.plugins[0].isEditing()){
                    //Stop Editing
                    list.plugins[0].endEdit();
                    if(this.cmp.editText)
                    {
                        this.cmp.setText(this.cmp.editText)
                    }
                    if(this.cmp.editCallback){
                        this.cmp.editCallback();
                    }
                }else{
                    //Start Editing
                    list.plugins[0].startEdit();
                    if(this.cmp.doneText)
                    {
                        this.cmp.setText(this.cmp.doneText)
                    }
                }
            }
        }
    }
});

Ext.preg('editableListButton', simfla.ux.plugins.editableListButton);