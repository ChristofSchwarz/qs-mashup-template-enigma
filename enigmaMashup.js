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
				app.getField("Product Sub Group Desc")
				.then(field => {
					console.log("field", field);
					return field.select("(Cheese|Beer)")
				})
				.then(selectionresult => {
					console.log("selectionresult", selectionresult);
					return app.createSessionObject({
						qInfo: { qType: 'StringExpression' }
						,expr: { qStringExpression: { qExpr: "Sum([Sales Quantity]*[Sales Price])" }}
					});
				})
				.then(object => { 
					objectId = object.id;
					console.log("object", object.id);
					return object.getLayout();
				})
				.then(layout => { 
					document.getElementById("enigma1").innerText += '<' + layout.expr + '>';
					console.log('String expr: ', layout);
					return doc.destroySessionObject(objectId);
				})
				.then(ret => console.log("destroyed: ", ret))
			})
			.catch((error) => {
    			console.log('Enigma error', error);
  			});
        }
    });

});