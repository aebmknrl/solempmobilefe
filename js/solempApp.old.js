angular
	.module('solempApp',['ngMessages', 'angular-loading-bar','ui.router', 'ui.bootstrap.showErrors','LocalStorageModule'])
	.config(function($stateProvider, $urlRouterProvider) {
	    $urlRouterProvider.otherwise('/solempmobile');
    	$stateProvider
        // HOME STATES AND NESTED VIEWS ========================================
        .state('solempmobile', {
            url: '/solempmobile',
            templateUrl: 'login.html'
        }) 
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('menuhotels', {
           url: '/menuhotels',
            templateUrl: 'menuhotels.html'
        });   
	})
	.config(['showErrorsConfigProvider', function(showErrorsConfigProvider) {
	  showErrorsConfigProvider.showSuccess(true);
	}])
	.controller('loginController', ['$http','$scope','$location','$state', function ($http,$scope,$location,$state){
		var scope = this;
		scope.userName = "";
		scope.password = "";
		scope.respuesta = "";
		scope.error = false;
		$scope.startSubmit = function() {
			$scope.$broadcast('show-errors-check-validity');
			if ($scope.logInfrm.$invalid) { return; }
			  // code to add the user
			};

		scope.checkLogIn = function(){
			return $http({
	            method: "POST",
	            url: "http://192.168.0.203/testWebApi/Token",
	            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	            data: 'username=' + encodeURIComponent(scope.userName) + '&password=' + encodeURIComponent(scope.password) + '&grant_type=password'
	        }).success(function (data) {
	            scope.respuesta = data;
	            console.log(data);
	           	$location('/solempmobile/menuhotels');
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
	.directive('showErrors', function() {
	  return {
	      restrict: 'A',
	      require:  '^form',
	      link: function (scope,element,attrs,formCtrl) {
                 // find the text box element, which has the 'name' attribute
			        var inputElement   = element[0].querySelector("[name]");
			        console.log("inputElement = " + inputElement);
			        // convert the native text box element to an angular element
			        var inputNgElement = angular.element(inputElement);
			        console.log("inputNgElement = " + inputNgElement);
			        // get the name on the text box so we know the property to check
			        // on the form controller
			        var inputName = inputNgElement.attr('name');
			        console.log("inputName = " + inputName);		
			        // only apply the has-error class after the user leaves the text box
			        inputNgElement.bind('blur', function() {
			          element.toggleClass('has-error', formCtrl[inputName].$invalid);
			        });
			        scope.$on('show-errors-check-validity', function() {
					  element.toggleClass('has-error', formCtrl[inputName].$invalid);
					});
			    }
        	}
	  });