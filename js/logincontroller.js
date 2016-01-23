angular
	.module('loginApp',['ngMessages', 'angular-loading-bar'])
	.controller('loginController', ['$http','$scope','$timeout', function ($http,$scope,$timeout) {
		var scope = this;
		scope.userName = "";
		scope.password = "";
		scope.respuesta = "";
		scope.error = false;

		scope.checkLogIn = function(){
			return $http({
	            method: "POST",
	            url: "http://192.168.0.203//testWebApi/Token",
	            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	            data: 'username=' + encodeURIComponent(scope.userName) + '&password=' + encodeURIComponent(scope.password) + '&grant_type=password'
	        }).success(function (data) {
	            scope.respuesta = data;
	            console.log(data);
	        }).error(function (data) {
	            console.log(data);
	            if (data.error === "invalid_grant" ) {
					scope.error = true;
					 $timeout(function(){
						$scope.$broadcast('dataloaded');
					});
	            };
	            
	        });
		};
	}])
	.directive('showPopup', function() {
	  return {
	    restrict: 'A',
	    link: function(scope, element, attrs){
	    	$scope.$on('dataloaded',function () {
	    		alert("Hola");
				})
			}
		};
	});
