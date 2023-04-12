function empty(el) {
    while(el.firstElementChild)
       el.firstElementChild.remove();
}

function sortOnKeys(d) {
    var s = [], t = {};
    
    for(var key in d)
        s[s.length] = key;
    
    s.sort();

    for(var i = 0; i < s.length; i++)
        t[s[i]] = d[s[i]];

    return t;
}
  
const isValidUrl = urlString => {
    // From this web site : https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/

    var up = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
    '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    
    return !!up.test(urlString);
}
  
var isKnownGroup = function(g){
    for(var k in _groups)
        if(k == g)
            return true;
    return false;
}
  
var addHtmlGroup = function(g, ro, i){
    var gl = document.getElementById("groups_list");
    var nd = document.createElement('div');
    var nt = document.createElement('input');
    var nb = document.createElement('input');
	var nc = document.createElement('input');
        
    nd.style.whiteSpace = "nowrap";
    
    nt.type  = "text";
    nt.value = g;
    nt.id    = "new_group";
    if(ro) {
        nt.id = "new_group_"+i;
        nt.readOnly = true;
    }
        
    nd.appendChild(nt);
    if(!ro){
        // add Group button
		nb.type  = "button";
        nb.value = "Add";
        
        nb.addEventListener("click", (event) => {
            addGroup(document.getElementById("new_group").value);
        });
		
		nd.appendChild(nb);
		
		// cancel button
		nc.type  = "button";
        nc.value = "Cancel";
        
        nc.addEventListener("click", (event) => {
            doDOMGroupList();
        });
		
        nd.appendChild(nc);
    }
    
    if(ro)
    {
        var rem = document.createElement('input');
        var edi = document.createElement('input');
        var ren = document.createElement('input');
        var che = document.createElement('input');
        
        rem.type    = "button";
        rem.value   = "Delete";
        edi.type    = "button";
        edi.value   = "Edit";
        ren.type    = "button";
        ren.value   = "Rename";
        che.type    = "checkbox"
        che.checked = _groups[g]['active'];
        
        rem.addEventListener("click", (event) => {
            delGroup(document.getElementById('new_group_'+i).value);
        });
        
        edi.addEventListener("click", (event) => {
            _current_group = document.getElementById('new_group_'+i).value;
            doDOMGroupList();
			doDOMRulesList(_current_group);
        });
        
        ren.addEventListener("click", (event) => {
            renameGroup(document.getElementById('new_group_'+i).value);
        });
        
        che.addEventListener("change", function() {
            activeGroup(document.getElementById('new_group_'+i).value, this.checked);
        });
        
        nd.appendChild(edi);
        nd.appendChild(rem);
        nd.appendChild(ren);
        nd.appendChild(che);
    }
    
    gl.appendChild(nd);
}
  
var activeGroup = function(g, c){
    if(!c) {
        _active_group = undefined;
        _groups[g]['active'] = false;
    } else
        for(var k in _groups)
            _groups[k]['active'] = (k != g) ? false : true;
    
    browser.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
        doDOMGroupList();
    });
}

var emptyList = function(id){
    var gl = document.getElementById(id);
    empty(gl);
    
    if(_current_group !== undefined){
        var el = document.getElementById('rules_title');
        el.textContent = "Rules for ";
		var span = document.createElement('span');
		span.className = 'label';
		span.textContent = _current_group;
		el.appendChild(span);
    }
}

var varToHtmlGroups = function(){
    var i = 0;
    for(var k in _groups)
        addHtmlGroup(k, true, i++);
}

var doDOMGroupList = function(){
    browser.storage.sync.get("groups", function(items){
        for(var k in items){
            if(k == "groups"){
                _groups = sortOnKeys(items[k]);
                emptyList("groups_list");
                varToHtmlGroups();
                if(_current_group !== undefined)
                    doDOMRulesList(_current_group);
                break;
            }
        }
    });
}

var renameGroup = function(g){
    var new_group = prompt("Please enter the new Group name", g);
    
	if(new_group === null){
        return;
    }
	
    if(isKnownGroup(new_group)){
        alert('This group already exists !');
        return;
    }
    
    if(new_group === ""){
        alert('No value set !');
        return;
    }
    
    _groups[new_group] = _groups[g];
    delete _groups[g];
        
    browser.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
        if(_current_group !== undefined &&
        _current_group === g)
            _current_group = new_group;
            
        doDOMGroupList();
    });
}

var addGroup = function(g){
    if(g === ""){
        alert('No value set !');
        return;
    }
    
    if(isKnownGroup(g)){
        alert('This group already exists !');
        return;
    }
    
    if(_groups !== undefined && Object.keys(_groups).length == _max_groups){
        alert('Max groups number ('+_max_groups+') reached !');
        return;
    }
    
    if(_groups === undefined)
        _groups = new Object();
    
    _groups[g] = {"active": false};
    _current_group = g;
    browser.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
        doDOMGroupList();
    });
}

var delGroup = function(g){
    const c = confirm("Are you sure you want remove " + g + " group ?");

    if(c){
        delete _groups[g];
        _current_group = undefined;
        browser.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
            doDOMGroupList();
        });
    }
}
  
var isKnownRule = function(f, g){
    for(var k in _groups) {
        if(k == g){
            var gr = _groups[g]['rules'];
            
            if(gr == null)
                return false;

            for(var i = 0 ; i < gr.length ; i++)
                if(gr[i][0] == f)
                    return true;
        }
    }
    
    return false;
}

var addRule = function(f, t, g){
    if(isKnownRule(f, g)){
        alert('An other rule already exists in this group (' + g + ') for "' + f + '" !');
        return;
    }
    
    if(f === "" || t === ""){
        alert('Missing value !');
        return;
    }
    
    if(!isValidUrl(f)){
        alert('Source string is not Web URL compliant !');
        return;
    }
    
    if(!isValidUrl(t)){
        alert('Destination string is not Web URL compliant !');
        return;
    }
    
    if(_groups[g]["rules"] === undefined)
        _groups[g]["rules"] = [[f, t]];
    else{
        if(_groups[g]["rules"].length == _max_rules){
            alert('Max rules number (' + _max_rules + ') reached !');
            return;
        }
        _groups[g]["rules"].push([f, t]);
    }
    
    browser.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
        doDOMGroupList();
    });
}

var delRule = function(n, g){
    const c = confirm("Are you sure you want remove this rule ?");

    if(c){
        _groups[g]['rules'].splice(n,1);
        browser.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
            doDOMGroupList();
        });
    }
}

var editRule = function(n, f, t, g){
    if(!isValidUrl(f)){
        alert('Source string is not Web URL compliant !');
        return;
    }
    
    if(!isValidUrl(t)){
        alert('Destination string is not Web URL compliant !');
        return;
    }
    
    _groups[g]['rules'][n][0] = f;
    _groups[g]['rules'][n][1] = t;
    browser.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
        doDOMGroupList();
    });
}

var addHtmlRule = function(from_txt, to_txt, ro, i, g){
    var gl   = document.getElementById("group_content");
    var nd   = document.createElement('div');
	var hid  = document.createElement('input');
    var from = document.createElement('input');
    var to   = document.createElement('input');
    var add  = document.createElement('input');
    var edi  = document.createElement('input');
    var rem  = document.createElement('input');
	var can  = document.createElement('input');
    
    nd.style.whiteSpace = "nowrap";
    
    hid.type  = "hidden";
    hid.value = -1;
    hid.id    = "new_rule";
    
    if(ro){
        hid.value = i;
        hid.id  = "new_rule_"+i;
        from.id = "new_rule_from_"+i;
        to.id   = "new_rule_to_"+i;
    } else {
        from.id  = "new_rule_from";
        to.id    = "new_rule_to";
    }

    from.type = "text";
    from.value = from_txt;
    from.addEventListener("input", function() {
        this.style.backgroundColor = "yellow";
    });
    
    to.type = "text";
    to.value = to_txt;
    to.addEventListener("input", function() {
        this.style.backgroundColor = "yellow";
    });	
    
    add.type = "button";
    add.value = "Add";
    
    add.addEventListener("click", (event) => {
        addRule(document.getElementById("new_rule_from").value,
                document.getElementById("new_rule_to").value, 
                g);
    });
    
    nd.appendChild(hid);
    nd.appendChild(from);
    nd.appendChild(to);
    if(!ro) {
        nd.appendChild(add);
		
		can.type  = "button";
        can.value = "Cancel";
		
		// cancel button
        can.addEventListener("click", (event) => {
            doDOMRulesList(g);
        });
		
		nd.appendChild(can);
    }
	
    if(ro)
    {
        edi.type  = "button";
        edi.value = "Save";
        rem.type  = "button";
        rem.value = "Delete";
        
		
        rem.addEventListener("click", (event) => {
            delRule(document.getElementById('new_rule_'+i).value, g);
        });
        
        edi.addEventListener("click", (event) => {
            editRule(document.getElementById('new_rule_'+i).value, 
                    document.getElementById('new_rule_from_'+i).value, 
                    document.getElementById('new_rule_to_'+i).value, 
                    g);
        });
        
        nd.appendChild(edi);
        nd.appendChild(rem);
    }
    
    gl.appendChild(nd);
} 
  
var addHtmlRuleButton = function(g){
    var gl = document.getElementById("group_content");
    var bt = document.createElement('input')
    bt.type = 'button';
    bt.value = 'Add Rule';
    bt.style.fontSize = '13px';
	bt.style.fontWeight = 'bold';
	bt.style.width = '100%';
	bt.className = 'main';
	
    bt.addEventListener("click", (event) => {
        if(_groups[g]["rules"] !== null && 
            _groups[g]["rules"] !== undefined && 
            _groups[g]["rules"].length == _max_rules){
            alert('Max rules number ('+_max_rules+') reached !');
            return;
        }
        
        if(document.getElementById('new_rule') === null)
            addHtmlRule("", "", false, "", g);
    });
    gl.appendChild(bt);
}

var varToHtmlGroupRules = function(g){
    addHtmlRuleButton(g);
    if(_groups[g]["rules"] === undefined)
        return;
    
    var gr = _groups[g]["rules"];

    for(var i = 0 ; i < gr.length ; i++) {
        addHtmlRule(gr[i][0].toString(), 
                    gr[i][1].toString(), 
                    true, i, g);
    }
}

var doDOMRulesList = function(g){
    browser.storage.sync.get("groups", function(items){
        for(var k in items){
            if(k == "groups"){
                _groups = items[k];
                emptyList("group_content");
                varToHtmlGroupRules(g);
                break;
            }
        }
    });
}

// Start working
var _groups        = undefined;
var _current_group = undefined;
var _active_group  = undefined;
var _max_groups    = 20;
var _max_rules     = 50;

document.addEventListener('DOMContentLoaded', function() { 
    var ga = document.getElementById("group_add");

    ga.addEventListener("click", (ev) => {
        if(_groups !== undefined && 
            Object.keys(_groups).length === _max_groups){
            alert('Max groups number (' + _max_groups + ') reached !');
            return;
        }
        
        if(document.getElementById('new_group') === null)
            addHtmlGroup("", false, "");
    });
    
    doDOMGroupList();
    
}, false);
