
$(function() {
	// menu
	var $showUA = $('#j-showUA'),
		$addUA = $('#j-addUA'),
		$spoof = $('#j-spoof'),
		$conf = $('#j-conf'),
		$filter = $('#j-filter');
	var $search = $('#j-search');
	// bd
	var $bd = $('#j-bd');
	var $uaForm = $('#j-uaForm'),
		$uaList = $('#j-uaList'),
		$spoofBox = $('#j-spoofBox'),
		$confBox = $('#j-confBox');
	var $uaName = $('#j-uaName'),
		$uaStr = $('#j-uaStr'),
		$uaFlag = $('#j-uaFlag'),
		$uaGroup = $('#j-uaGroup');
	var $spoofList = $('#j-spoofList'),
		$spoofForm = $('#j-spoofForm'),
		$spoofUASel = $('#j-spoofUASel'),
		$domain = $('#j-domain');
	// btns
	var $addUABtn = $('#j-addUABtn');
	var $addSpoofBtn = $('#j-addSpoofBtn');
	//tmpl
	var uaListTmpl = $('#j-uaListTmpl').val(),
		spoofListTmpl = $('#j-spoofListTmpl').val(),
		spoofUATmpl = $('#j-spoofUATmpl').val();
	var isOption = '#options' == location.hash ? true : false;
	// cache
	$UA = K.uaList();
	$SPOOF = K.spoofList();
	// sub fn
	var hideUAList = function() {
		$uaForm.removeClass('show');
		$addUA.hide();
		$filter.hide();
	};
	var showTitle = function($obj) {
		var txt = $obj.data('title');
		if (!txt) return;
		$filter.hide();
		$('#j-title').show().text(txt);
	};
	// init
	// $UA = $.extend(true, {}, $UA, BASE_UA); // dev: for update BASE_UA (deep extend)
	$uaList.html(K.tmpl(uaListTmpl, {list: $UA}));
	$spoofList.html(K.tmpl(spoofListTmpl, $SPOOF));
	
	// remove input error
	$bd.on('blur', '.err', function(event) {
		$(this).removeClass('err');
	});
	// filter ua
	$search.on('keyup', function() {
		var val = $search.val().toLowerCase();
		// console.log(val,$UA);
		var ret = {};
		$.each($UA, function(key, type) {
			var ua = ret[key] = {};
			$.each(type, function(index, group) {
				ua[index] = [];
				$.each(group, function(idx, item) {
					if(-1 === item.slug.toLowerCase().indexOf(val) &&
						-1 === item.title.toLowerCase().indexOf(val) &&
						-1 === item.ua.toLowerCase().indexOf(val)) return;
					ua[index].push(item);
				});
			});
		});
		// console.log(ret);
		$uaList.html(K.tmpl(uaListTmpl, {list: ret, filter: val ? true : false}));
	}).on('search', function() { // clear button
		$uaList.html(K.tmpl(uaListTmpl, {list: $UA}));
	});
	// toggle ua
	$bd.on('click', '.j-chgUA', function() {
		K.saveCurrUA($(this).data('index'));
		window.close();
		chrome.extension.sendRequest({action: 'set'}, function(response) {
			console.log(response);
		});
		// console.log(K.local(CURR_INDEX),  K.getCurrUA());
	}).on('click', '.j-groupAct', function() { // delete ua group
		var $this = $(this), $li = $this.parents('li'), type = $li.data('type');
		var groupName = $li.find('.title').text(),
			group = $UA[type][groupName], arr = [];
		$.confirm({
			text: 'Delete: group "' + $li.find('.title').text() + '" ?',
			confirm: function(button) {
				$.each(group, function(index, val) {
					if (val && val.readonly) arr.push(val);
				});
				if (!arr.length) {
					delete $UA[type][groupName];
				} else {
					$UA[type][groupName] = arr;
				}
				K.uaList($UA); //save
				$uaList.html(K.tmpl(uaListTmpl, {list: $UA}));
			},
			cancel: function(button) {}
		});
	}).on('click', '.j-uaAct', function() { // del/mod ua && ua group
		var $this = $(this), $li = $this.parents('li');
		var action = $this.data('action'),
			index = $li.find('.j-chgUA').data('index');
		index = index.split('::');
		var groupName = index[0];
		var group =  $UA['base'][groupName] || $UA['custom'][groupName];
		if (action == 'del') {
			$.confirm({
				text: 'Delete: user-agent "' + $li.find('.ua-name').text() + '" ?',
				confirm: function(button) {
					group.splice(index[1], 1); // delete
					K.uaList($UA); //save
					$uaList.html(K.tmpl(uaListTmpl, {list: $UA}));
				},
				cancel: function(button) {}
			});
		} else{ // mod
			var item = group[index[1]];
			$uaName.val(item.title);
			$uaStr.val(item.ua);
			$uaFlag.val(item.slug);
			$uaGroup.val(groupName);
			$uaForm.find('.j-saveType').val('mod').data({index: index[1], group: groupName});
			$uaForm.addClass('show');
			$bd.scrollTop(0);
		}
	}).on('click', '.j-spoofAct', function() { // del/mod spoof
		var $this = $(this), action = $this.data('action'),
			$li = $this.parents('li'), index = $li.data('index');
		if (action == 'del') {
			$.confirm({
				text: 'Delete: domain "' + $li.find('.ua-name').text() + '" ?',
				confirm: function(button) {
					$SPOOF.splice(index, 1); // delete
					K.spoofList($SPOOF); //save
					$spoofList.html(K.tmpl(spoofListTmpl, $SPOOF));
				},
				cancel: function(button) {}
			});
		} else{ // mod
			var item = $SPOOF[index];
			// $spoofForm.find('')
			$domain.val(item.domain);
			$spoofUASel.val(item.ua);
			$spoofForm.find('.j-saveType').val('mod').data('index', index);
		}
	});
	// add ua
	$addUABtn.click(function(e) {
		e.preventDefault();
		var $this = $(this), $saveType = $this.siblings('.j-saveType');
		var title = $uaName.val(),
			str = $uaStr.val(),
			flag = $uaFlag.val(),
			groupName = $uaGroup.val() || '[No group]';
		if (!title) return $uaName.addClass('err').focus();
		if (!str) return $uaStr.addClass('err').focus();
		if (!$UA['custom']) $UA['custom'] = {};
		var data = {slug: flag, title: title, ua: str},
			group = $UA['base'][groupName] || $UA['custom'][groupName] || ($UA['custom'][groupName] = []);
		if ('mod' == $saveType.val()) {
			var index = $saveType.data('index'),
				originName = $saveType.data('group');
			if (groupName !== originName) { // change group
				var originGroup = $UA['base'][originName] || $UA['custom'][originName];
				originGroup.splice(index, 1);
				group.push(data);
			} else {
				group[index] = data;
			}
		} else{
			group.push(data);
		}
		K.uaList($UA); //save
		$uaList.html(K.tmpl(uaListTmpl, {list: $UA}));
		$uaForm.removeClass('show');
		$uaForm[0].reset();
	});
	// add spoof
	$addSpoofBtn.click(function(e) {
		e.preventDefault();
		var $this = $(this), $saveType = $this.siblings('.j-saveType');
		var domain = $domain.val(),
			$selected = $spoofUASel.find('option:selected'),
			ua = $selected.val(), slug = $selected.data('slug');
		if (!domain) return $domain.addClass('err').focus();
		// console.log($selected.text(), domain, ua, slug);
		var data = {slug: slug, domain: domain, ua: ua};
		if ('mod' == $saveType.val()) {
			var index = $saveType.data('index');
			$SPOOF[index] = data;
		} else{
			$SPOOF.push(data);
		}
		K.spoofList($SPOOF); //save
		$spoofList.html(K.tmpl(spoofListTmpl, $SPOOF));
		$spoofForm[0].reset();
	});

	// configs
	$confBox.on('click', '.j-backup', function() {
		var data = {ua: $UA, spoof: $SPOOF};
		data = JSON.stringify(data);
		K.saveFileAs("UserAgentSwitcher+.bak", btoa(data));
	}).on('change', '#rfile', function() {
		var rfile = $('#rfile')[0];
		if (rfile.files.length > 0 && rfile.files[0].name.length > 0) {
			var r = new FileReader();
			r.onload = function (e) {
				var data = atob(e.target.result);
				try {
					data = JSON.parse(data);
				} catch (e) {}
				// console.log(data);
				if (!data.ua) alert('Error data format!');
				$UA = data.ua;
				K.uaList($UA);
				$uaList.html(K.tmpl(uaListTmpl, {list: $UA}));
				if (!data.spoof) return;
				$SPOOF = data.spoof;
				K.spoofList($SPOOF); //save
				$spoofList.html(K.tmpl(spoofListTmpl, $SPOOF));
				$('.j-restore', $confBox).after('<p class="r tip">Options restored successfully</p>');
			};
			r.onerror = function () {
			};
			r.readAsText(rfile.files[0]);
			rfile.value = '';
		}
	}).on('click', '.j-restore', function() {
        $('#rfile').click();
	}).on('click', '.j-delAllspoof', function() {
		$.confirm({
			text: 'Delete: all domains rules ?',
			confirm: function(button) {
				K.local(SPOOFER_LIST, null);
				$spoofList.html(K.tmpl(spoofListTmpl, null));
			}
		});
	}).on('click', '.j-resetUA', function() {
		$.confirm({
			text: 'Reset user-agent to default ?',
			confirm: function(button) {
				K.local(CUSTOM_UA_LIST, null);
				$UA = K.uaList();
				$uaList.html(K.tmpl(uaListTmpl, {list: $UA}));
			}
		});
	});
	
	// toggle panel
	$showUA.click(function() {
		$uaList.show().siblings('div').hide();
		$uaForm.removeClass('show');
		$addUA.show();
		$filter.show();
	});
	$addUA.click(function() {
		$uaForm.show().toggleClass('show');
		$bd.scrollTop(0);
		if (!$uaForm.hasClass('show')) return $filter.show();
		$uaForm[0].reset();
		showTitle($addUA);
	});
	$spoof.click(function() {
		$spoofUASel.html(K.tmpl(spoofUATmpl, $UA));
		$spoofBox.show().siblings('div').hide();
		hideUAList();
		showTitle($spoof);
	});
	var showOption = function() {
		$confBox.show().siblings('div').hide();
		hideUAList();
		showTitle($conf);
	};
	$conf.click(function() {
		if (isOption) return showOption();
		chrome.tabs.create({url:'popup.html#options'});
	});
	if (isOption) showOption();
});