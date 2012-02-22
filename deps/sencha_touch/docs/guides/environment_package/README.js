Ext.data.JsonP.environment_package({"guide":"<h1>Environment Detection</h1>\n<div class='toc'>\n<p><strong>Contents</strong></p>\n<ol>\n<li><a href='#!/guide/environment_package-section-1'>Operating System</a></li>\n<li><a href='#!/guide/environment_package-section-2'>Browser</a></li>\n<li><a href='#!/guide/environment_package-section-3'>Features</a></li>\n</ol>\n</div>\n\n<p>Commonly when building applications targeting mobile devices, you need to know specific information about the environment your application is running on. Perhaps the browser type, device name, or if specific functionality is available for use. The environment package in Sencha Touch gives you an easy API which allows you to find out all this information.</p>\n\n<h2 id='environment_package-section-1'>Operating System</h2>\n\n<p>You can detect the operating system your application is running on using <code>Ext.os.name</code>. This will return one of the following values:</p>\n\n<ul>\n<li>iOS</li>\n<li>Android</li>\n<li>webOS</li>\n<li>BlackBerry</li>\n<li>RIMTablet</li>\n<li>MacOS</li>\n<li>Windows</li>\n<li>Linux</li>\n<li>Bada</li>\n<li>Other</li>\n</ul>\n\n\n<p>You can also use the <code>Ext.os.is</code> singleton to check if the current OS mataches a certain operating system. For example, if you wanted to check if the current OS is Android, you could do:</p>\n\n<pre><code>if (Ext.os.is.Android) { ... }\n</code></pre>\n\n<p>You can do this will any of the above values:</p>\n\n<pre><code>if (Ext.os.is.MacOS) { ... }\n</code></pre>\n\n<p>You can also use it to detect if the device is an iPhone, iPad or iPod using <code>Ext.os.is</code>:</p>\n\n<pre><code>if (Ext.os.is.iPad) { ... }\n</code></pre>\n\n<p>The version of the OS can be also accessed using <code>Ext.os.version</code>:</p>\n\n<pre><code>alert('You are running: ' + Ext.os.name + ', version ' + Ext.os.version.version);\n</code></pre>\n\n<h2 id='environment_package-section-2'>Browser</h2>\n\n<p>You can also find information about the browser you are running your application on by using <code>Ext.browser.name</code>. The list of available values are:</p>\n\n<ul>\n<li>Safari</li>\n<li>Chrome</li>\n<li>Opera</li>\n<li>Dolfin</li>\n<li>webOSBrowser</li>\n<li>ChromeMobile</li>\n<li>Firefox</li>\n<li>IE</li>\n<li>Other</li>\n</ul>\n\n\n<p>You can also use <code>Ext.browser.is</code> to check if the current browser is one of the above values:</p>\n\n<pre><code>if (Ext.browser.is.Chrome) { ... }\n</code></pre>\n\n<p>The <code>Ext.browser.is</code> singleton also has other useful information about the current browser that may be useful for your application:</p>\n\n<ul>\n<li><code>Ext.browser.userAgent</code> - returns the current userAgent</li>\n<li><code>Ext.browser.isSecure</code> - returns true if the current page is using SSL</li>\n<li><code>Ext.browser.isStrict</code> - returns true if the browser is in strict mode</li>\n<li><code>Ext.browser.engineName</code> - returns the browser engine name (<code>WebKit</code>, <code>Gecko</code>, <code>Presto</code>, <code>Trident</code> and <code>Other</code>)</li>\n<li><code>Ext.browser.engineVersion</code> - returns the version of the browser engine</li>\n</ul>\n\n\n<h2 id='environment_package-section-3'>Features</h2>\n\n<p>You can use the <a href=\"#!/api/Ext.feature.has\" rel=\"Ext.feature.has\" class=\"docClass\">Ext.feature.has</a> singleton to check if a certain browser feature exists. For example, if you want to check if the browser supports canvas, you check do the following:</p>\n\n<pre><code>if (<a href=\"#!/api/Ext.feature.has-property-Canvas\" rel=\"Ext.feature.has-property-Canvas\" class=\"docClass\">Ext.feature.has.Canvas</a>) { ... }\n</code></pre>\n\n<p>The list of available <em>features</em> are:</p>\n\n<ul>\n<li><a href=\"#!/api/Ext.feature.has-property-Audio\" rel=\"Ext.feature.has-property-Audio\" class=\"docClass\">Audio</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Canvas\" rel=\"Ext.feature.has-property-Canvas\" class=\"docClass\">Canvas</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-ClassList\" rel=\"Ext.feature.has-property-ClassList\" class=\"docClass\">ClassList</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-CreateContextualFragment\" rel=\"Ext.feature.has-property-CreateContextualFragment\" class=\"docClass\">CreateContextualFragment</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Css3dTransforms\" rel=\"Ext.feature.has-property-Css3dTransforms\" class=\"docClass\">Css3dTransforms</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-CssAnimations\" rel=\"Ext.feature.has-property-CssAnimations\" class=\"docClass\">CssAnimations</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-CssTransforms\" rel=\"Ext.feature.has-property-CssTransforms\" class=\"docClass\">CssTransforms</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-CssTransitions\" rel=\"Ext.feature.has-property-CssTransitions\" class=\"docClass\">CssTransitions</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-DeviceMotion\" rel=\"Ext.feature.has-property-DeviceMotion\" class=\"docClass\">DeviceMotion</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Geolocation\" rel=\"Ext.feature.has-property-Geolocation\" class=\"docClass\">Geolocation</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-History\" rel=\"Ext.feature.has-property-History\" class=\"docClass\">History</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Orientation\" rel=\"Ext.feature.has-property-Orientation\" class=\"docClass\">Orientation</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-OrientationChange\" rel=\"Ext.feature.has-property-OrientationChange\" class=\"docClass\">OrientationChange</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Range\" rel=\"Ext.feature.has-property-Range\" class=\"docClass\">Range</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-SqlDatabase\" rel=\"Ext.feature.has-property-SqlDatabase\" class=\"docClass\">SqlDatabase</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Svg\" rel=\"Ext.feature.has-property-Svg\" class=\"docClass\">Svg</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Touch\" rel=\"Ext.feature.has-property-Touch\" class=\"docClass\">Touch</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Video\" rel=\"Ext.feature.has-property-Video\" class=\"docClass\">Video</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-Vml\" rel=\"Ext.feature.has-property-Vml\" class=\"docClass\">Vml</a></li>\n<li><a href=\"#!/api/Ext.feature.has-property-WebSockets\" rel=\"Ext.feature.has-property-WebSockets\" class=\"docClass\">WebSockets</a></li>\n</ul>\n\n","title":"Environment Detection"});