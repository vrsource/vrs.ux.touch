Ext.data.JsonP.floating_components({"guide":"<h1>Floating Components</h1>\n<div class='toc'>\n<p><strong>Contents</strong></p>\n<ol>\n<li><a href='#!/guide/floating_components-section-1'>Centering a Component</a></li>\n<li><a href='#!/guide/floating_components-section-2'>Absolutely positioning a Component</a></li>\n<li><a href='#!/guide/floating_components-section-3'>Modal Components</a></li>\n</ol>\n</div>\n\n<p>Often in you need to have floating or centering components in your applications. Generally this happens when you need to ask the user what to do next, or perhaps when you want to show a dropdown style menu.</p>\n\n<p>Sencha Touch allows you to do three things to achieve this:</p>\n\n<ul>\n<li>center any component on the screen</li>\n<li>absolutely position it on the screen (just like CSS)</li>\n<li>or show it by another component</li>\n</ul>\n\n\n<h2 id='floating_components-section-1'>Centering a Component</h2>\n\n<p>You can center any component within its container in Sencha touch by using the <a href=\"#!/api/Ext.Component-cfg-centered\" rel=\"Ext.Component-cfg-centered\" class=\"docClass\">centered</a> configuration. This will <em>always</em> center the component, even when its parent containers size changes.</p>\n\n<pre class='inline-example miniphone preview'><code><a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'panel',\n    html: 'This is a centered panel',\n    centered: true\n});\n</code></pre>\n\n<p>When using <a href=\"#!/api/Ext.Component-cfg-centered\" rel=\"Ext.Component-cfg-centered\" class=\"docClass\">centered</a>, the width and height of the component is automatically set depending on the size of the content. However, if the content of the component is dynamic, like a scroller panel, the width and height must be set manually.</p>\n\n<pre class='inline-example miniphone'><code><a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'panel',\n    scrollable: true,\n    html: 'This is a scrollable centered panel with some long content so it will scroll.',\n    centered: true,\n    width: 100,\n    height: 100\n});\n</code></pre>\n\n<p>Centered components are centered within their container. In the above examples we are adding a component into <a href=\"#!/api/Ext.Viewport\" rel=\"Ext.Viewport\" class=\"docClass\">Ext.Viewport</a>, so the component is centered in the center of the screen (as the Viewport is the full size of the screen). However, if we want, we can centered a component within a random sized container.</p>\n\n<pre class='inline-example phone preview'><code><a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'container',\n    layout: 'hbox',\n    items: [\n        {\n            flex: 1,\n            html: 'left item',\n            style: 'background:#eee;'\n        },\n        {\n            flex: 2,\n            html: 'right, item',\n            items: [\n                {\n                    xtype: 'panel',\n                    html: 'This is a centered panel within this container',\n                    centered: true\n                }\n            ]\n        }\n    ]\n});\n</code></pre>\n\n<p>You can also use the <a href=\"#!/api/Ext.Component-method-setCentered\" rel=\"Ext.Component-method-setCentered\" class=\"docClass\">setter</a> for centered to dynamically change if a component is centered or not at any time.</p>\n\n<pre class='inline-example miniphone preview'><code>var panel = <a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'panel',\n    layout: {\n        type: 'vbox',\n        align: 'center',\n        pack: 'center'\n    },\n    items: [\n        {\n            xtype: 'button',\n            text: 'toggle centered',\n            handler: function() {\n                if (panel.isCentered()) {\n                    panel.setCentered(false);\n                    panel.setWidth(null);\n                    panel.setHeight(null);\n                } else {\n                    panel.setCentered(true);\n                    panel.setWidth(200);\n                    panel.setHeight(100);\n                }\n            }\n        }\n    ]\n});\n</code></pre>\n\n<h2 id='floating_components-section-2'>Absolutely positioning a Component</h2>\n\n<p>You can also absolutey position a component in Sencha Touch using the <a href=\"#!/api/Ext.Component-cfg-top\" rel=\"Ext.Component-cfg-top\" class=\"docClass\">top</a>, <a href=\"#!/api/Ext.Component-cfg-right\" rel=\"Ext.Component-cfg-right\" class=\"docClass\">right</a>, <a href=\"#!/api/Ext.Component-cfg-bottom\" rel=\"Ext.Component-cfg-bottom\" class=\"docClass\">bottom</a> and <a href=\"#!/api/Ext.Component-cfg-left\" rel=\"Ext.Component-cfg-left\" class=\"docClass\">left</a> configurations of any <a href=\"#!/api/Ext.Component\" rel=\"Ext.Component\" class=\"docClass\">component</a>. This works just like CSS <code>position: absolute</code>.</p>\n\n<p>For example, you can do the following (CSS):</p>\n\n<pre><code>.element {\n    position: absolute;\n    left: 50px;\n    bottom: 5px;\n}\n</code></pre>\n\n<p>..with a component in Sencha Touch like this:</p>\n\n<pre class='inline-example miniphone'><code><a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'panel',\n    html: 'A floating component',\n    top: 50,\n    right: 5\n});\n</code></pre>\n\n<p>And of course, because these position properties are all configurations, you can use the appropriate setters to change them at any time:</p>\n\n<pre class='inline-example miniphone preview'><code>var panel = <a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'panel',\n    defaultType: 'button',\n    layout: {\n        type: 'vbox',\n        align: 'stretch'\n    },\n    items: [\n        {\n            text: 'up',\n            handler: function() {\n                panel.setTop(panel.getTop() - 5);\n            }\n        },\n        {\n            text: 'down',\n            handler: function() {\n                panel.setTop(panel.getTop() + 5);\n            }\n        },\n        {\n            text: 'left',\n            handler: function() {\n                panel.setLeft(panel.getLeft() - 5);\n            }\n        },\n        {\n            text: 'right',\n            handler: function() {\n                panel.setLeft(panel.getLeft() + 5);\n            }\n        }\n    ],\n    top: 50,\n    left: 5\n});\n</code></pre>\n\n<h2 id='floating_components-section-3'>Modal Components</h2>\n\n<p>Making a floating or centered container <a href=\"#!/api/Ext.Container-cfg-modal\" rel=\"Ext.Container-cfg-modal\" class=\"docClass\">modal</a> masks the rest of its parent container so there are less distractions for the user. You simply set the <a href=\"#!/api/Ext.Container-cfg-modal\" rel=\"Ext.Container-cfg-modal\" class=\"docClass\">modal</a> configuration to true.</p>\n\n<pre class='inline-example preview'><code><a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'panel',\n    html: 'This is a centered and modal panel',\n    modal: true,\n    centered: true\n});\n\n<a href=\"#!/api/Ext.Viewport-method-setHtml\" rel=\"Ext.Viewport-method-setHtml\" class=\"docClass\">Ext.Viewport.setHtml</a>('This content is in the viewport and masked because the panel is modal.');\n<a href=\"#!/api/Ext.Viewport-method-setStyleHtmlContent\" rel=\"Ext.Viewport-method-setStyleHtmlContent\" class=\"docClass\">Ext.Viewport.setStyleHtmlContent</a>(true);\n</code></pre>\n\n<p>You can also use the <a href=\"#!/api/Ext.Container-cfg-hideOnMaskTap\" rel=\"Ext.Container-cfg-hideOnMaskTap\" class=\"docClass\">hideOnMaskTap</a> configuration to make the panel and mask disappear when a user taps on the mask:</p>\n\n<pre class='inline-example preview'><code><a href=\"#!/api/Ext.Viewport-event-add\" rel=\"Ext.Viewport-event-add\" class=\"docClass\">Ext.Viewport.add</a>({\n    xtype: 'panel',\n    html: 'This is a centered and modal panel',\n    modal: true,\n    hideOnMaskTap: true,\n    centered: true\n});\n\n<a href=\"#!/api/Ext.Viewport-method-setHtml\" rel=\"Ext.Viewport-method-setHtml\" class=\"docClass\">Ext.Viewport.setHtml</a>('This content is in the viewport and masked because the panel is modal.&lt;br /&gt;&lt;br /&gt;You can also tap on the mask to hide the panel.');\n<a href=\"#!/api/Ext.Viewport-method-setStyleHtmlContent\" rel=\"Ext.Viewport-method-setStyleHtmlContent\" class=\"docClass\">Ext.Viewport.setStyleHtmlContent</a>(true);\n</code></pre>\n\n<p>Please note that you can only add <a href=\"#!/api/Ext.Container-cfg-modal\" rel=\"Ext.Container-cfg-modal\" class=\"docClass\">modal</a> to a <a href=\"#!/api/Ext.Container\" rel=\"Ext.Container\" class=\"docClass\">Ext.Container</a>, or subclass of it (like <a href=\"#!/api/Ext.Panel\" rel=\"Ext.Panel\" class=\"docClass\">Ext.Panel</a>).</p>\n","title":"Floating Components"});