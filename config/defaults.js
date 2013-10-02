define([], function() {
//Default configuration settings for the applciation. This is where you'll define things like a bing maps key, 
//default web map, default app color theme and more. These values can be overwritten by template configuration settings
//and url parameters.
    var defaults = {
        "appid": "06a85b051a364e20a1fd5d5a89ce3093", 
        "webmap": "",// "0eece0d5de2140e9a44d8050f943fd18", "de5ae0c2040c49d38e9ea0637454ac73"
        "oauthappid": null,//"AFTKRmv16wj14N3z",
        //Group templates must support a group url parameter. This will contain the id of the group. 
        //group: "",
        //Enter the url to the proxy if needed by the applcation. See the 'Using the proxy page' help topic for details
        //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
        "proxyurl": "",
        //Example of a template specific property. If your template had several color schemes
        //you could define the default here and setup configuration settings to allow users to choose a different
        //color theme.
        "theme": "blue",
        "twitterUrl": location.protocol + "//tmappsevents.esri.com/website/twitter-oauth-proxy-php/index.php",
        "twitterSigninUrl": location.protocol + "//tmappsevents.esri.com/website/twitter-oauth-proxy-php/sign_in.php",
        "flickr_key":"404ebea7d5bc27aa5251d1207620e99b",
        "webcams_key":"65939add1ebe8bc9cc4180763f5df2ca",
        "bannedUsersService": "http://services.arcgis.com/QJfoC7c7Z2icolha/ArcGIS/rest/services/fai/FeatureServer/2",
		"bannedWordsService": "http://tm2-elb-1378978824.us-east-1.elb.amazonaws.com/ArcGIS/rest/services/SharedTools/Filter/MapServer/1",
		"flagMailServer": "http://tmappsevents.esri.com/Website/pim_fai/fai.php",
        "bingmapskey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
        "sharinghost": location.protocol + "//" + "www.arcgis.com" //Defaults to arcgis.com. Set this value to your portal or organization host name. 
    };
    return defaults;
});