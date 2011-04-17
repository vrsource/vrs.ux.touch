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

Ext.ns('simfla.ux.plugins');

simfla.ux.plugins.editableList = Ext.extend(Ext.util.Observable, {
    
    deleteButton: 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ' +
    'bWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp' +
    'bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6' +
    'eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz' +
    'NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo' +
    'dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw' +
    'dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv' +
    'IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS' +
    'ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD' +
    'cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNl' +
    'SUQ9InhtcC5paWQ6RTA4NkM1RDA1MkVFMTFFMEEzN0Q5QTREMEQ5RjY0QTMiIHhtcE1NOkRvY3Vt' +
    'ZW50SUQ9InhtcC5kaWQ6RTA4NkM1RDE1MkVFMTFFMEEzN0Q5QTREMEQ5RjY0QTMiPiA8eG1wTU06' +
    'RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMDg2QzVDRTUyRUUxMUUwQTM3' +
    'RDlBNEQwRDlGNjRBMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMDg2QzVDRjUyRUUxMUUw' +
    'QTM3RDlBNEQwRDlGNjRBMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1w' +
    'bWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiDNBBQAAAMAUExURb6+vsQ5Oee5ueLp6dfZ2d/n58/a' +
    '2ufT07EAAMxhYfv///HS0vrx8e/v79Nqavr6+tjh4ff397wBAePj48dJSefn57UBAdSjo8rS0vZA' +
    'QPMyMu0yMuArK8fAwMQ/P+nt7cE5Ofz///f//87W1slNTdN7e+fm5sQ1NcRAQOxDQ7u8vObu7tUh' +
    'IcM3N9bh4b0iItLd3bxXV89sbMkWFsUSEuMjI87OzsXPz8tWVvKxscfHx9qKisdTU9sfH+stLfd+' +
    'fsIqKuE8PMM9Pfz8/OHDw9omJuaamsZHR/Pz88TExL7FxbQEBOzs7PA6Or/Jybu5uc0SEuDg4Nra' +
    '2sIvL9jY2NYsLNTU1N/MzMuZmcrKyvP5+fD4+MbJyd+ZmcwZGcLExLkVFd1OTsVBQdEeHt/j4+Qv' +
    'L9ymptszM8MyMvHs7MMQEOPt7ejq6unp6eLm5tzc3NXd3e3T08EKCu/5+dbFxeny8sHBwdmursgM' +
    'DMOpqdfX1+fPz8zQ0NuSksQ7O8oYGMUKCrO+vuSqqsihodVxcbyjo8cUFLoKCtNycstKSr4ICMUM' +
    'DL8NDc8cHLUICNMZGdEXF+Xl5d/f3+Tk5Ovr6////729vcZFRfj4+Pn5+fT09MVERN7e3v7+/sjI' +
    'yP/z887S0urq6vjV1d3e3vX6+u/19deCgshOTtfV1eTl5ebLy9/e3tIzM8LCwurp6bw1NdeXl94k' +
    'JNzi4tff3/M9PcUtLepISPTY2NUnJ8PMzMa+vsVZWczLy79BQdDQ0ODT0+HU1Le7u8EbG9Tk5MyP' +
    'j8eWltcdHenAwMMICPrv78AmJsXGxtTZ2eHh4d8pKcMVFdnc3ObX18UoKPD6+rvAwL+/v/Dw8PDz' +
    '89PU1Ly6utno6Po2Ns6QkOzv79J2dtOYmOXOzshHR79gYNuPj++YmPCVld2NjcrJydQgIOdFRd2V' +
    'leHMzM5wcN7f39KXl9WRkf7////+/ujW1rUQELscHPxkZLe8vNbb28mXl74qKt6SktZ2dsDDw+rr' +
    '69kkJP///8tRZHQAAAEAdFJOU///////////////////////////////////////////////////' +
    '////////////////////////////////////////////////////////////////////////////' +
    '////////////////////////////////////////////////////////////////////////////' +
    '////////////////////////////////////////////////////////////////////////////' +
    '/////////////////////////////////////////////////////////////wBT9wclAAADAklE' +
    'QVR42mL4jwCzpkycLCzKOwNJiAHGcM5duVRJaUlUdGnKYl4M6YV/P/Acr71nZKS6wSWHNcgDRZr/' +
    'rCLPq+VOTnIacnW6ujbied+FkaT5J39kWi4nIuI+fXZSkoYGY/DukoKzcGln0Y/LnCCSGnJyTnWM' +
    'dRnqEcqBMOnJU5c5qbgnJcklycnVMTJm6GYwqjs0m0+BSPMqMgFl5dJWLdcF6mR06Phk5KCeobAr' +
    'nh8kPffuSaDBcmlciuwiGSDZv8y5fA7qlx75BYGkeRVrnUSS0rj4Z0VVPwx26BC9UPV9Jd9WdYfW' +
    'gzP/M8wV5XEXcU9apTiLd532xU7VlJrIeZ63fvccOm/YOGkqg+BSJgWR6XLL2aPWTc7/fmBF/NVp' +
    '/myPu3p6uvT9T89g8FGyZnSfncSo8oC5al9kzNVpV68a/DqRZZKVlVV5ZQrDRCUjuelJsxkTvoSf' +
    'ee7JwOB5Wi+2waQNCLqPegkzTFzCCZT+2Scmpr8/ZlqZ1Z7NTRVt9SBQcWTnYgbhKE652Qkc3t5i' +
    'nFVXr1qZhS2uXhPQCwIB7yQWM4hGv9EFyXJYbPoz7fSesKDV2oWhE3RevEieUC4xkYG39H0fh5g3' +
    'h01KDEPZPIFNkybmRnOnH/v3T2dHeI0Pw8wUFw4OoGzeAs9pawWaqrUXXvNQ4nZ0PWebyHxDkOH/' +
    'JPn1QN2vBfas1TKIrVhTWOwxg5/riamMrVu28FyG/x6s4hzeYiLCNQxszxqMA0K5lZynLtKUtnuZ' +
    'yTIDFGNBzHuB8ipvD1ufaItL7k/frgiU9bWzLJ4DjlDBMyWfxfrEOluKTIzjknVsHZ9qSklK2SsG' +
    'zYQkB9GCCG+xdiGhLLC06zlT6S23v86XnwJLa2eVm/XFunqg0jKp0lL286+rIVLqanNZw3YhiOH/' +
    'Nppus1S8K4qcznPj/VoNT5lUVAT0hya6ZV5ePAU1G/CHfGu8Wfnjzv3ycObsC5NmoGei/zMnnb7i' +
    'ZS6hvCBssiBmHgMCwSmT50ya6CM4FSEEEGAAeBbVs+u3yC4AAAAASUVORK5CYII=',
    
    init: function(cmp){
      this.cmp = cmp;
      
      var orgItemTpl = cmp.itemTpl;
      var newItemTpl = '<div>' + orgItemTpl + '<tpl if="Ext.getCmp(\'' + cmp.id + '\').plugins[0].isEditing()"><img src="data:image/png;base64,' + this.deleteButton + '" onclick="Ext.getCmp(\'' + cmp.id + '\').plugins[0].deleteItem({[xindex-1]})" onload="style.opacity=1" class="deleteFade"/></tpl></div>';
      
      cmp.itemTpl = newItemTpl;
      
      cmp.initComponent();
    },   
    
    isEditing: function(){
      var me = this;
      return me.isEditingValue;
    },
    
    startEdit: function(){
      var me = this;
      me.isEditingValue = true;
      me.cmp.getStore().fireEvent('datachanged');
    },
    
    endEdit: function(){
      var me = this;
      me.isEditingValue = false;
      me.cmp.getStore().fireEvent('datachanged');
    },
  
    deleteItem: function (index) {
        var me = this;
        var store = me.cmp.getStore();
        store.removeAt(index);
    }
  
});

Ext.preg('editableList', simfla.ux.plugins.editableList);