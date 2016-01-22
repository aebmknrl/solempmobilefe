angular
	.module('loginApp',['ngMessages'])
	.controller('loginController', ['$http', function ($http) {
		var scope = this;
		scope.userName = "";
		scope.password = "";
		scope.respuesta = "";

		scope.checkLogIn = function(){
			alert("El usuario es " + scope.userName + " y su clave " + scope.password);
			return $http({
	            method: "GET",
	            url: "http://192.168.1.134:53910/api/Account/UserInfo",
	            headers: { 'Content-Type': 'application/json' }
	        }).success(function (data) {
	            scope.respuesta = data;
	            console.log(data);
	        }).error(function (data) {
	            console.log(data);
	        });
		};
	}]);
