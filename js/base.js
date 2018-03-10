//var baseUrl = 'http://333ff6e9704e44d8b5d465e4819a3f6a-cn-beijing.alicloudapi.com/note/';
//var baseUrl = 'http://cloud.bmob.cn/ead27e69d1ab3fe4/';
//var baseUrl = 'http://cloud.bmob.cn/c217e0595a075296/';
var baseUrl = 'http://cloud.bmob.cn/b82559a27442a320/';



var app = new Vue({
	el: '#app',
	data: {
		noteList: [],
	},
	methods: {
		//  删除
		onDelClick: function(objectId) {
			var params = {
				objectId: objectId,
			};
			invokeJsonp('removeNote', params, function() {
				plus.webview.currentWebview().close();
				mui.toast("删除成功");
			}, function() {
				mui.toast("网络连接出错");
			})
		},
		//获取id并跳转到修改页面
		onNote: function(objectId) {
			var subWebview = mui.openWindow({
				url: 'updateNote.html',
				extras: {
					objectId: objectId
				},
				aniShow: 'slide-in-right',
				duration: 200
			});
			subWebview.addEventListener("close", function(e) {
				subWebview = null;
				console.log("webview closed!");
				firstPageNote();
			});
		},
	}
});
var invokeJsonp = function(method, params, callback, errback) {
	params = params == null ? {} : params;
	$.ajax({
		url: baseUrl + method + '?params=' + encodeURI(JSON.stringify(params)),
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		dataType: 'jsonp',
		data: '',
		jsonp: 'callback',
		success: function(data) {
			callback(data);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			errback(jqXHR, textStatus, errorThrown);
		}
	})
};

//笔记内容显示在修改页面
function onFetchNote() {
	var webview = plus.webview.currentWebview();
	var objectId = webview.objectId;
	var params = {
		objectId: objectId,
	};
	invokeJsonp('fetchNote', params, function(data) {
		var note = data;
		document.getElementById("objectId").value = note.objectId;
		document.getElementById("title").value = note.title;
		document.getElementById("content").innerHTML = note.content;
	});
}

//上拉加载笔记列表
function onQueryClick(callback) {
	//分页加载逻辑，每次下拉加载五条记录
	var filter = document.getElementById("filter").value;
	console.log("filter = " + filter);
	var skip = document.getElementsByTagName("li").length;
	var params = {
		filter: filter,
		limit: 5,
		skip: skip,
	};
	invokeJsonp('queryNote', params, function(data) {
		var notes = data;
		callback(notes);
		app.noteList = app.noteList.concat(notes.results);
	}, function() {
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		mui.toast("网络连接出错");
	});
}
//下拉刷新
function onFirst() {
	var filter = document.getElementById("filter").value;
	var params = {
		filter: filter,
		limit: 5,
		skip: 0,
	};
	invokeJsonp('queryNote', params, function(data) {
		var notes = data;
		app.noteList = notes.results;
	}, function() {
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		mui.toast("网络连接出错");
	});
}

//获取前五条记录
function firstPageNote() {
	var params = {
		limit: 5,
		skip: 0,
	};
	invokeJsonp('queryNote', params, function(data) {
		var notes = data;
		app.noteList = notes.results;
	}, function() {
		mui.toast("网络连接出错");
	});
}
//跳转到添加页面
mui('.header').on('tap', 'a.plus', function(e) {
	var subWebview = mui.openWindow({
		url: 'addNote.html',
		aniShow: 'slide-in-right',
		duration: 200
	});
	subWebview.addEventListener("close", function(e) {
		subWebview = null;
		console.log("webview closed!");
		firstPageNote();
	});
});

//添加笔记
mui('.header').on('tap', 'a.addSave', function(e) {
	var params = {
		title: $("#title").val(),
		content: $("#content").val()
	};
	invokeJsonp('addNote', params, function() {
		plus.webview.currentWebview().close();
	}, function() {
		mui.toast("网络连接出错");
	});
});

//修改笔记
mui('.header').on('tap', 'a.update', function(e) {
	var params = {
		objectId: $("#objectId").val(),
		title: $("#title").val(),
		content: $("#content").val()
	};
	invokeJsonp('updateNote', params, function() {
		plus.webview.currentWebview().close();
		mui.toast("修改成功");
	}, function() {
		mui.toast("网络连接出错");
	});
});

//语音识别完成事件
//document.getElementById("filter").addEventListener('recognized', function(e) {
//	console.log(e.detail.value);
//	this.value=e.detail.value.replace(/,。/g,'。').replace();
//	console.log(this.value);
//});
