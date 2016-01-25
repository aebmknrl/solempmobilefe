angular
	.module('solempApp',['ngMessages', 'angular-loading-bar','ui.router'])
	.config(function($stateProvider, $urlRouterProvider) {
	    $urlRouterProvider.otherwise('/solempmobile');
    	$stateProvider
        // HOME STATES AND NESTED VIEWS ========================================
        .state('solempmobile', {
            url: '/solempmobile',
            templateUrl: 'login.html'
        }) 
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('about', {
            // we'll get to this in a bit       
        });   
	})
	.controller('loginController', ['$http','$scope','$location','$state', function ($http,$scope,$location,$state){
		var scope = this;
		scope.userName = "";
		scope.password = "";
		scope.respuesta = "";
		scope.error = false;

		scope.checkLogIn = function(){
			return $http({
	            method: "POST",
	            url: "http://192.168.0.203/solempmobileWA/api/GetUser",
	            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	            data: 'userName=' + encodeURIComponent(scope.userName) + '&Password=' + encodeURIComponent(scope.password);
	        }).success(function (data) {
	            scope.respuesta = data;
	            console.log(data);
	            //$location.path('/solempmobile/menuhotels.html');
	        }).error(function (data) {
	            console.log(data);
	            if (data.error === "invalid_grant" ) {
					scope.error = true;
					scope.userName = "";
					scope.password = "";
					//Reiniciar valores de validacion
					$scope.logInfrm.$setPristine();
	            };
	            
	        });
		};
	}])
	.controller('menuhotelsController', ['$http', '$location', function ($http, $location) {
		var scope = this;
		scope.listo = "Listo";
	}])
	