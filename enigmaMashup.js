var config = {
	host: window.location.hostname,
	prefix: "/",
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};

require.config({
	baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
});

require(["js/qlik"] 
,function (qlik) {
	qlik.setOnError(function (error) {
		alert(error.message);
	});

    var global = qlik.getGlobal(config);
    //var scope = $('body').scope();
	var scope = angular.element('body').scope();
	scope.enigma = null;
//    console.log("global.session", global.session);
	var objectId;
	var app;
	
	var unbind = scope.$watch(function() { return global.session.__enigmaApp }, function (newValue, oldValue) {
		if (newValue) {
			scope.enigma = newValue;
			console.log("bound Enigma version ", scope.enigma.engineVersion());
			unbind();
			
			scope.enigma.openDoc('Executive Dashboard.qvf')
			.then((doc) => {
				app = doc;
				app.getField("Product Sub Group Desc")   // get field 1
				.then(field => {
					console.log("field", field);
					return field.select("(Chocolate?Candy|Beer)")  // make selection 1
				})
				.then(selectionresult => {
					console.log("selectionresult", selectionresult);
					return app.getField("Fiscal Year");   // get field 2
				})
				.then(field => {
					console.log("field", field);
					return field.select("2013")	  // make selection 2
				})
				.then(selectionresult => {
					console.log("selectionresult", selectionresult);
					return app.evaluate("Sum([Sales Quantity]*[Sales Price])");
				})
				.then(ev => {
					console.log("evaluate", ev);
					document.getElementById("enigma1").innerText += ev;
					return app.createSessionObject({        // create sessionobject
						qInfo: { qType: 'StringExpression' }
						,expr1: { qStringExpression: { qExpr: "Sum([Sales Quantity]*[Sales Price])" }}
						,expr2: { qStringExpression: { qExpr: "Count([Order Number])" }}						
					});
				})
				.then(object => { 
					objectId = object.id;
					console.log("object", object.id);
					return object.getLayout();   // get content of sessionobject
				})
				.then(layout => { 
					document.getElementById("enigma2").innerText += layout.expr1 + ' | ' + layout.expr2;
					console.log('String expr: ', layout);
					return doc.destroySessionObject(objectId);   // remove sessionobject
				})
				.then(ret => console.log("destroyed: ", ret))
			})
			.catch((error) => {
    			console.log('Enigma error', error);
  			});
		}
	});
});
