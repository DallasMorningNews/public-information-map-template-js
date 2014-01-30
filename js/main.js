define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/arcgis/utils",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/on",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "application/TableOfContents",
    "application/AboutDialog",
    "application/ShareDialog",
    "application/Drawer",
    "application/DrawerMenu",
    "esri/dijit/HomeButton",
    "esri/dijit/LocateButton",
    "esri/dijit/BasemapToggle",
    "esri/dijit/Geocoder",
    "esri/dijit/Popup",
    "application/AreaOfInterest",
    "application/SocialLayers",
    "esri/dijit/OverviewMap",
    "dijit/registry",
    "dojo/_base/array"
],
function(
    declare,
    lang,
    arcgisUtils,
    domConstruct,
    dom,
    on,
    domStyle,
    domAttr,
    domClass,
    TableOfContents, AboutDialog, ShareDialog, Drawer, DrawerMenu,
    HomeButton, LocateButton, BasemapToggle,
    Geocoder,
    Popup,
    AreaOfInterest,
    SocialLayers,
    OverviewMap,
    registry,
    array
) {
    return declare("", [AreaOfInterest, SocialLayers], {
        config: {},
        constructor: function (config) {
            //config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id
            // any url parameters and any application specific configuration information.
            this.config = config;
            // css classes
            this.css = {
                mobileSearchDisplay: "mobile-locate-box-display",
                toggleBlue: 'toggle-grey',
                toggleBlueOn: 'toggle-grey-on',
                legendContainer: "legend-container",
                legendHeader: "legend-header",
                areaContainer: "area-container",
                areaHeader: "area-header",
                areaSection: "area-section",
                pointerEvents: "pointer-events",
                iconRight: "icon-right",
                iconText: "icon-doc-text",
                iconBookmarks: "icon-bookmarks",
                iconList: "icon-list",
                locateButtonTheme: "LocateButtonCalcite",
                homebuttonTheme: "HomeButtonCalcite",
                desktopGeocoderTheme: "geocoder-desktop",
                mobileGeocoderTheme: "geocoder-mobile"
            };
            // pointer event support
            if(this._pointerEventsSupport()){
                domClass.add(document.documentElement, this.css.pointerEvents);
            }
            // mobile size switch domClass
            this._showDrawerSize = 850;
            // drawer
            this._drawer = new Drawer({
                direction: this.config.i18n.direction,
                showDrawerSize: this._showDrawerSize,
                borderContainer: 'bc_outer',
                contentPaneCenter: 'cp_outer_center',
                contentPaneSide: 'cp_outer_left',
                toggleButton: 'hamburger_button'
            });
            // drawer resize event
            on(this._drawer, 'resize', lang.hitch(this, function () {
                // check mobile button status
                this._checkMobileGeocoderVisibility();
            }));
            // startup drawer
            this._drawer.startup();
            // get item info
            arcgisUtils.getItem(this.config.webmap).then(lang.hitch(this, function (itemInfo) {
                //let's get the web map item and update the extent if needed. 
                if (this.config.appid && this.config.application_extent.length > 0) {
                    itemInfo.item.extent = [
                        [
                            parseFloat(this.config.application_extent[0][0]),
                            parseFloat(this.config.application_extent[0][1])
                        ],
                        [
                            parseFloat(this.config.application_extent[1][0]),
                            parseFloat(this.config.application_extent[1][1])
                        ]
                    ];
                }
                this._createWebMap(itemInfo);
            }));
        },
        _pointerEventsSupport: function(){
            var element = document.createElement('x');
            element.style.cssText = 'pointer-events:auto';
            return element.style.pointerEvents === 'auto';   
        },
        _init: function () {
            // drawer size check
            this._drawer.resize();
            // menu panels
            this.drawerMenus = [];
            var content;
            if (this.config.showAreaPanel) {
                content = '';
                content += '<div class="' + this.css.areaContainer + '">';
                if(this.config.showMapNotes){
                    content += '<div class="' + this.css.areaHeader + '"><span class="' + this.css.iconText + '"></span> <span id="map_notes_title">' + this.config.i18n.area.mapNotes + '</span></div>';
                    content += '<div class="' + this.css.areaSection + '" id="area_notes"></div>';
                }
                if(this.config.showBookmarks && this.bookmarks && this.bookmarks.length){
                    content += '<div class="' + this.css.areaHeader + '"><span class="' + this.css.iconBookmarks + '"></span> ' + this.config.i18n.area.bookmarks + '</div>';
                    content += '<div class="' + this.css.areaSection + '" id="area_bookmarks"></div>';
                }
                content += '</div>';
                this.drawerMenus.push({
                    label: this.config.i18n.general.aoi,
                    content: content
                });
            }
            if (this.config.showLegendPanel) {
                content = '';
                if(this.config.showOperationalLegend){
                    content += '<div class="' + this.css.legendContainer + '">';
                    content += '<div class="' + this.css.legendHeader + '"><span class="' + this.css.iconList + '"></span> ' + this.config.i18n.layers.operational + '</div>';
                    content += '<div id="TableOfContents"></div>';
                }
                if(this.config.showSocialLegend){
                    content += '<div class="' + this.css.legendHeader + '"><span class="' + this.css.iconList + '"></span> ' + this.config.i18n.layers.social + '</div>';
                    content += '<div id="SocialTableOfContents"></div>';
                    content += '</div>';
                }
                // legend menu
                this.drawerMenus.push({
                    label: this.config.i18n.general.legend,
                    content: content
                });
            }
            // menus
            this._drawerMenu = new DrawerMenu({
                menus: this.drawerMenus
            }, dom.byId("drawer_menus"));
            this._drawerMenu.startup();
            // locate button
            if (this.config.showLocateButton) {
                var LB = new LocateButton({
                    map: this.map,
                    theme: this.css.locateButtonTheme
                }, 'LocateButton');
                LB.startup();
            }
            // home button
            if (this.config.showHomeButton) {
                var HB = new HomeButton({
                    map: this.map,
                    theme: this.css.homebuttonTheme
                }, 'HomeButton');
                HB.startup();
            }
            // basemap toggle
            if (this.config.showBasemapToggle) {
                var BT = new BasemapToggle({
                    map: this.map,
                    basemap: this.config.nextBasemap,
                    defaultBasemap: this.config.currentBasemap
                }, 'BasemapToggle');
                BT.startup();
                /* Start temporary until after JSAPI 3.9 is released */
                var layers = this.map.getLayersVisibleAtScale(this.map.getScale());
                on.once(this.map, 'basemap-change', lang.hitch(this, function () {
                    for (var i = 0; i < layers.length; i++) {
                        if (layers[i]._basemapGalleryLayerType) {
                            var layer = this.map.getLayer(layers[i].id);
                            this.map.removeLayer(layer);
                        }
                    }
                }));
                /* END temporary until after JSAPI 3.9 is released */
            }
            // about dialog
            if (this.config.showAboutDialog) {
                this._AboutDialog = new AboutDialog({
                    theme: this.css.iconRight,
                    item: this.item,
                    sharinghost: this.config.sharinghost
                }, 'AboutDialog');
                this._AboutDialog.startup();
                if(this.config.showAboutOnLoad){
                    this._AboutDialog.open();
                }
            }
            // share dialog
            if (this.config.ShowShareDialog) {
                this._ShareDialog = new ShareDialog({
                    theme: this.css.iconRight,
                    bitlyLogin: this.config.bitlyLogin,
                    bitlyKey: this.config.bitlyKey,
                    image: this.config.sharinghost + '/sharing/rest/content/items/' + this.item.id + '/info/' + this.item.thumbnail,
                    title: this.config.title,
                    summary: this.item.snippet,
                    hashtags: 'esriPIM'
                }, 'ShareDialog');
                this._ShareDialog.startup();
            }
            // Legend table of contents
            var legendNode = dom.byId('TableOfContents');
            if (legendNode) {
                var LL = new TableOfContents({
                    map: this.map,
                    layers: this.layers
                }, legendNode);
                LL.startup();
            }
            // i18n overview placement
            var overviewPlacement = 'left';
            if(this.config.i18n.direction === 'rtl'){
                overviewPlacement = 'right';
            }
            // Overview Map
            if(this.config.showOverviewMap){
                this._overviewMap = new OverviewMap({
                    attachTo: "bottom-" + overviewPlacement,
                    height: 150,
                    width: 150,
                    visible: this.config.openOverviewMap,
                    map: this.map
                });
                this._overviewMap.startup();
            }
            // geocoders
            this._createGeocoders();
            // setup
            this.initSocial();
            this.initArea();
            // hide loading div
            this._hideLoadingIndicator();
            // on body click containing underlay class
            on(document.body, '.dijitDialogUnderlay:click', function(){
                // get all dialogs
                var filtered = array.filter(registry.toArray(), function(w){ 
                    return w && w.declaredClass == "dijit.Dialog";
                });
                // hide all dialogs
                array.forEach(filtered, function(w){ 
                    w.hide(); 
                });
            });
        },
        _checkMobileGeocoderVisibility: function () {
            if(this._mobileGeocoderIconNode && this._mobileSearchNode){
                // check if mobile icon needs to be selected
                if (domClass.contains(this._mobileGeocoderIconNode, this.css.toggleBlueOn)) {
                    domClass.add(this._mobileSearchNode, this.css.mobileSearchDisplay);
                }
            }
        },
        _showMobileGeocoder: function () {
            if(this._mobileSearchNode && this._mobileGeocoderIconContainerNode){
                domClass.add(this._mobileSearchNode, this.css.mobileSearchDisplay);
                domClass.replace(this._mobileGeocoderIconContainerNode, this.css.toggleBlueOn, this.css.toggleBlue);
            }
        },
        _hideMobileGeocoder: function () {
            if(this._mobileSearchNode && this._mobileGeocoderIconContainerNode){
                domClass.remove(this._mobileSearchNode, this.css.mobileSearchDisplay);
                domStyle.set(this._mobileSearchNode, "display", "none");
                domClass.replace(this._mobileGeocoderIconContainerNode, this.css.toggleBlue, this.css.toggleBlueOn);
            }
        },
        _setTitle: function (title) {
            // set config title
            this.config.title = title;
            // map title node
            var node = dom.byId('title');
            if (node) {
                // set title
                node.innerHTML = title;
                // title attribute
                domAttr.set(node, "title", title);
            }
            // window title
            window.document.title = title;
        },
        // create geocoder widgets
        _createGeocoders: function () {
            // desktop size geocoder
            this._geocoder = new Geocoder({
                map: this.map,
                theme: this.css.desktopGeocoderTheme,
                autoComplete: true
            }, dom.byId("geocoderSearch"));
            this._geocoder.startup();
            // geocoder results
            on(this._geocoder, 'find-results', lang.hitch(this, function (response) {
                if (!response.results || !response.results.results || !response.results.results.length) {
                    alert(this.config.i18n.general.noSearchResult);
                }
            }));
            // mobile sized geocoder
            this._mobileGeocoder = new Geocoder({
                map: this.map,
                theme: this.css.mobileGeocoderTheme,
                autoComplete: true
            }, dom.byId("geocoderMobile"));
            this._mobileGeocoder.startup();
            // geocoder results
            on(this._mobileGeocoder, 'find-results', lang.hitch(this, function (response) {
                if (!response.results || !response.results.results || !response.results.results.length) {
                    alert(this.config.i18n.general.noSearchResult);
                }
                this._hideMobileGeocoder();
            }));
            // keep geocoder values in sync
            this._geocoder.watch("value", lang.hitch(this, function (name, oldValue, value) {
                this._mobileGeocoder.set("value", value);
            }));
            // keep geocoder values in sync
            this._mobileGeocoder.watch("value", lang.hitch(this, function (name, oldValue, value) {
                this._geocoder.set("value", value);
            }));
            // geocoder nodes
            this._mobileGeocoderIconNode = dom.byId("mobileGeocoderIcon");
            this._mobileSearchNode = dom.byId("mobileSearch");
            this._mobileGeocoderIconContainerNode = dom.byId("mobileGeocoderIconContainer");
            // mobile geocoder toggle 
            if (this._mobileGeocoderIconNode) {
                on(this._mobileGeocoderIconNode, "click", lang.hitch(this, function () {
                    if (domStyle.get(this._mobileSearchNode, "display") === "none") {
                        this._showMobileGeocoder();
                    } else {
                        this._hideMobileGeocoder();
                    }
                }));
            }
            var closeMobileGeocoderNode = dom.byId("btnCloseGeocoder");
            if(closeMobileGeocoderNode){
                // cancel mobile geocoder
                on(closeMobileGeocoderNode, "click", lang.hitch(this, function () {
                    this._hideMobileGeocoder();
                }));
            }
        },
        // hide map loading spinner
        _hideLoadingIndicator: function () {
            var indicator = dom.byId("loadingIndicatorDiv");
            if (indicator) {
                domStyle.set(indicator, "display", "none");
            }
        },
        //create a map based on the input web map id
        _createWebMap: function (itemInfo) {
            // popup dijit
            var customPopup = new Popup({}, domConstruct.create("div"));
            // add popup theme
            domClass.add(customPopup.domNode, "calcite");
            //can be defined for the popup like modifying the highlight symbol, margin etc.
            arcgisUtils.createMap(itemInfo, "mapDiv", {
                mapOptions: {
                    infoWindow: customPopup
                    //Optionally define additional map config here for example you can
                    //turn the slider off, display info windows, disable wraparound 180, slider position and more.
                },
                bingMapsKey: this.config.bingmapskey
            }).then(lang.hitch(this, function (response) {
                //Once the map is created we get access to the response which provides important info
                //such as the map, operational layers, popup info and more. This object will also contain
                //any custom options you defined for the template. In this example that is the 'theme' property.
                //Here' we'll use it to update the application to match the specified color theme.
                this.map = response.map;
                this.layers = response.itemInfo.itemData.operationalLayers;
                this.item = response.itemInfo.item;
                this.bookmarks = response.itemInfo.itemData.bookmarks;
                // if title is enabled
                if (this.config.showTitle) {
                    this._setTitle(this.config.title || response.itemInfo.item.title);
                }
                if (this.map.loaded) {
                    this._init();
                } else {
                    on.once(this.map, 'load', lang.hitch(this, function () {
                        this._init();
                    }));
                }
            }), lang.hitch(this, function (error) {
                //an error occurred - notify the user. In this example we pull the string from the
                //resource.js file located in the nls folder because we've set the application up
                //for localization. If you don't need to support multiple languages you can hardcode the
                //strings here and comment out the call in index.html to get the localization strings.
                if (this.config && this.config.i18n) {
                    alert(this.config.i18n.map.error + ": " + error.message);
                } else {
                    alert("Unable to create map: " + error.message);
                }
            }));
        }
    });
});