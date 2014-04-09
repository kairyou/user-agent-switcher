var CUSTOM_UA_LIST = 'custom_ua_list';
var SPOOFER_LIST = 'spoofer_list';
var CURR_INDEX = 'curr_index';
var BASE_UA = {
	'base': {
		'Chrome': [
			{slug: '', title: 'Default', ua: '', readonly: true}
		],
		'Firefox': [
			{slug: 'FF3', title: 'Windows Firefox 3.5', ua: 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7'},
			{slug: 'FF4', title: 'Windows Firefox 4', ua: 'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1'},
			{slug: 'FF15', title: 'Windows Firefox 15', ua: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20120427 Firefox/15.0a1'},
			{slug: 'FFAM', title: 'Firefox on Android Mobile', ua: 'Mozilla/5.0 (Android; Mobile; rv:14.0) Gecko/14.0 Firefox/14.0'}
		],
		'Opera': [
			{slug: 'O10', title: 'Opera 10', ua: 'Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.2.15 Version/10.00'}
		],
		'Safari': [
			{slug: 'SF5', title: 'OSX Safari 5', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10'}
		],
		'Internet Explorer': [
			{slug: 'IE6', title: 'Internet Explorer 6', ua: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0; WOW64; Trident/4.0; SLCC1)'},
			{slug: 'IE7', title: 'Internet Explorer 7', ua: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1)'},
			{slug: 'IE8', title: 'Internet Explorer 8', ua: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1)'},
			{slug: 'IE9', title: 'Internet Explorer 9', ua: 'Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; Trident/5.0)'},
			{slug: 'IE10', title: 'Internet Explorer 10', ua: 'Mozilla/5.0 (compatible; WOW64; MSIE 10.0; Windows NT 6.2)'}
		],
		'iOS': [
			{slug: 'IP4', title: 'iPhone 4', ua: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5'},
			{slug: 'iPad', title: 'iPad', ua: 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10'}
		],
		'Android': [
			{slug: 'Nes7', title: 'Nexus 7 (Tablet)', ua: 'Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166  Safari/535.19'},
			{slug: 'SGT', title: 'Samsung Galaxy Tab (Tablet)', ua: 'Mozilla/5.0 (Linux; U; Android 2.2; en-gb; GT-P1000 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'},
			{slug: '360', title: '360 Aphone Browser', ua: 'Mozilla/5.0 (Linux; U; Android 4.2.2; zh-cn; GT-I9100G Build/JDQ39E) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30; 360browser(securitypay,securityinstalled); 360(android,uppayplugin); 360 Aphone Browser (5.1.2)'}
		],
		'Windows Phone': [
			{slug: 'WP7', title: 'Windows Phone 7', ua: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; NOKIA; Lumia 800)'},
			{slug: 'WP8', title: 'Windows Phone 8', ua: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)'}
		]
	}
};
HYPERLINK = document.createElement('a');
var K = {
	local: function(name, value) {
		var ret = null;
		if (null === value) {
			localStorage.removeItem(name);
		}else if (value) {
			ret = localStorage.setItem(name, value);
		}else {
			ret = localStorage.getItem(name);
			try {
				ret = JSON.parse(ret);
			} catch (a) {}
		}
		// localStorage.clear(); //清空storage
		return ret;
	},
	uaList: function(val) { // get || set uaList;
		if (!val) return this.local(CUSTOM_UA_LIST) || BASE_UA;
		// $.extend({}, this.local(BASE_UA_LIST) || BASE_UA, this.local(CUSTOM_UA_LIST));
		return this.local(CUSTOM_UA_LIST, JSON.stringify(val));
	},
	spoofList: function(val) { // get || set spoofList;
		// {slug: 'FF3', domain: 'adsfsf.com', ua: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0; WO'},
		if (val) return this.local(SPOOFER_LIST, JSON.stringify(val));
		return this.local(SPOOFER_LIST) || [];
	},
	tmpl: function(str, context) {
		return window.doT ? doT.template(str).apply(null, [context]) : '';
	},
	hostname: function(url) { // get urlStr's hostname
		HYPERLINK.href = url;
		return HYPERLINK.host;
	},
	matchDomain: function(url, domain) {
		var ret = 0;
		var hostname = this.hostname(url);
		if (domain == hostname || domain == url) {
			ret = 1;
		} else if(hostname.indexOf(domain) > -1) {
			ret = 2;
		}
		return ret;
	},
	saveCurrUA: function(val) {
		K.local(CURR_INDEX, val);
	},
	getCurrUA: function(url) {
		var ret = {}, group,
			ualist = this.uaList(), spoofList = this.spoofList(),
			index = K.local(CURR_INDEX);
		if (!index || !url) return ret;
		index = index.split('::');
		group = ualist['base'][index[0]] || ualist['custom'][index[0]];
		// console.log(group);
		if (group) ret = group[index[1]];
		// console.log(spoofList);
		if (ret.ua) return ret;
		// else: !ret.ua (is default ua)
		var match = {};
		for (var i = 0, j = spoofList.length; i < j; i++) {
			var item = spoofList[i];
			var matchVal = this.matchDomain(url, item.domain);
			if (item && item.domain && item.ua && matchVal > 0) {
				if (matchVal == 2) {
					match.secondary = item;
				} else if (matchVal == 1) {
					match.primary = item;
					break;
				}
			}
		}
		// console.log('match', match, url);
		return match.primary || match.secondary || ret;
	},
	saveFileAs: function(fileName, fileData) {
		try {
			var Blob = window.Blob || window.WebKitBlob;
			// Detect availability of the Blob constructor.
			var constructor_supported = false;
			if (Blob) {
				try {
					new Blob([], { 'type' : 'text/plain' });
					constructor_supported = true;
				} catch (_) { }
			}
			var b = null;
			if (constructor_supported) {
				b = new Blob([fileData], { 'type' : 'text/plain' });
			} else {
				// Deprecated BlobBuilder API
				var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
				var bb = new BlobBuilder();
				bb.append(fileData);
				b = bb.getBlob("text/plain");
			}
			saveAs(b, fileName);
		} catch (e) {
			$.confirm({
				text: 'Oops! Can\'t save generated file, ' + e.toString(),
				confirmButton: 'OK', cancelButton: ''
			});
		}
	}
};