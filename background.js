var _groups = undefined;

function sortOnKeys(d) {
    var s = [], t = {};

    for(var k in d)
        s[s.length] = k;
    s.sort();

    for(var i = 0; i < s.length; i++)
        t[s[i]] = d[s[i]];

    return t;
}

function goToNewURL(url){
	var g   = undefined;
	const r = /^https?:\/\//i;
	
	for(var k in _groups){
		if(_groups[k]['active']) {
			g = k;
			break;
		}
	}
	
	// in case of no active rules group or other undefined value
	if(g === undefined ||
		_groups[g]['rules'] === null || 
		_groups[g]['rules'] === undefined) 
		return undefined;
	
	// minify "_groups" variable
	var gr = _groups[g]['rules'];
	for(var i = 0 ; i < gr.length ; i++){
		// first split with "/" (if long URL) then with ":" (if port)
		var res = url.replace(r,'').split('/')[0].split(':')[0];
		
		if(res === gr[i][0].split('/')[0].split(':')[0])
			return url.replace(res, gr[i][1].split('/')[0].split(':')[0]);
	}
	
	return undefined;
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	browser.storage.sync.get("groups", function(items){
		for(var k in items){
			if(k === "groups"){
				_groups = sortOnKeys(items[k]);
				if ((changeInfo.url || tab.url) && _groups !== undefined) {
					var url = changeInfo.url ? changeInfo.url : tab.url;
					var res = goToNewURL(url);
				}
				if(res){
					console.log("Redirect from '" + url + "' to '" + res + "'");
					browser.tabs.update(tabId, { url: res });
				}
				break;
			}
		}
	});	
});
