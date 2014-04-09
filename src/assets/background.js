// 在chrome://extensions/ "背景页" 里面查看log

// ICON上显示文本
function updateBadge() {
	chrome.tabs.getSelected(null, function(tab) {
		if (!tab && !tab.url) return;
		var currUA = K.getCurrUA(tab.url);
		// console.log(currUA);
		var slug = currUA && currUA.slug;
		var domain = currUA && currUA.domain;
		var color = domain ? [255, 0, 126, 150] : [0, 165, 113, 190];
		chrome.browserAction.setBadgeBackgroundColor({
			color:color//, tabId: tab.id //
		});
		chrome.browserAction.setBadgeText({
			text: slug || "", tabId: tab.id
		});
		/*chrome.browserAction.setIcon({
			path: 'assets/img/128_h.png', tabId: tab.id
		});*/
	});
}
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) { // 标签选中
	updateBadge();
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { // 标签状态更新
	updateBadge();
});

// 接收插件的其他页发的消息
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	// console.log(CURR_INDEX, request);
	updateBadge();
	chrome.tabs.getSelected(null, function(tab) {
		if (!tab) return;
		chrome.tabs.reload(tab.id, {
			bypassCache: true
		}, function() {});
		chrome.tabs.update(tab.id, {
			selected: true
		});
	});
	// console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
	// sendResponse({farewell: "goodbye"});
});
chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	// console.log(JSON.stringify(details));
	var blockingResponse = {},
		headers = details.requestHeaders;
	var currUA = K.getCurrUA(details.url);
	// console.log(currUA);
	if (!currUA || !currUA.ua) return {requestHeaders: details.requestHeaders};
	for( var i = 0, l = headers.length; i < l; ++i ) {
		if( headers[i].name == 'User-Agent' ) {
			headers[i].value = currUA.ua;
			// console.log(headers[i].value);
			break;
		}
	}
	blockingResponse.requestHeaders = headers;
	return blockingResponse;
},
{urls: ['http://*/*', 'https://*/*']},['blocking', 'requestHeaders']);
