function ajax (options) {
	var xhr;
	var params=do_params(options.data)
	
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	}else{
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if(options.type=='GET'){
		xhr.open(options.type,options.url+'?'+params,options.async)
		xhr.send(null)
	}else if(options.type=='POST'){
		xhr.open(options.type,options.url,options.async)
		xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
		xhr.send(params)
	}
	
	xhr.onreadystatechange = function(){
		if (xhr.readyState==4 && xhr.status==200) {
			options.success(xhr.responseText)
		}
	}
	
	function do_params(data){
		var arr=[];
		for(var name in data){
			arr.push(name+'='+data[name])
		}
		return arr.join('&')
	}
}