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
        })
		.state('menucompanies', {
           url: '/menucompanies',
            templateUrl: 'menucompanies.html'
        })
        .state('logout', {
           url: '/logout',
            templateUrl: 'logout.html'
        });   
	})
	.config(['showErrorsConfigProvider', function(showErrorsConfigProvider) {
	  showErrorsConfigProvider.showSuccess(true);
	}])
	.config(function (localStorageServiceProvider) {
  		localStorageServiceProvider
  		.setPrefix('SolempApp')
  		.setStorageType('sessionStorage')
  		.setNotify(true, true);
	})
	.constant("solempWebApiURL", {
        "url": "http://192.168.1.56/solempmobileWA/api",
        "port": "80"
    })
	.controller('mainController', ['loginFactory','$scope','$rootScope',function(loginFactory,$scope,$rootScope){
		var mc = this;
		mc.isloggedIn = loginFactory.isLogged();
		$rootScope.isloggedIn = loginFactory.isLogged();
		$rootScope.actualPage = "main";
	}])
	.controller('loginController', ['$http','$scope','$location','$state','localStorageService','loginFactory','$rootScope','solempWebApiURL', function ($http,$scope,$location,$state,localStorageService,loginFactory,$rootScope,solempWebApiURL){
		var scope = this;
		scope.userName = "";
		scope.password = "";
		scope.respuesta = "";
		scope.error = false;
		scope.onCheckLogin = false;
		if (loginFactory.isLogged()) {
			$state.go('menuhotels');
		};

		$scope.startSubmit = function() {
			$scope.$broadcast('show-errors-check-validity');
			if ($scope.logInfrm.$invalid) { return; }
			  // code to add the user
			};

		scope.checkLogIn = function(){
			//Avisar que se está verificando el login
			//para deshabilitar el botón de ingreso
			scope.onCheckLogin = true;


			return $http({
	            method: "POST",
	            url: solempWebApiURL.url + "/Users/getUser",
	            headers: { 'Content-Type': 'application/json' },
	            dataType: "json",
	           	data: {
	           			"userName" : scope.userName,
	           			"Password" : scope.password
	           		}
	        }).success(function (data) {
	            scope.respuesta = data;
	            console.log(data);

	            if (data.Result === "ERROR") {
	            	if (data.Error.ErrorMsg === "Usuario o Password incorrecto!") {
		            	scope.error = true;
		            	scope.userName = "";
						scope.password = "";
						//Reiniciar valores de validacion
						$scope.logInfrm.$setPristine();
						//habilitar botón de ingreso nuevamente
						scope.onCheckLogin = false;
	            	}
	            } else {
   					// escribo en el Session Storage la sesion y otros datos
   					localStorageService.set('userName', scope.userName);
   					localStorageService.set('loggedIn', 'yes');
	            	// aviso que esta logueado el usuario
	            	$rootScope.isloggedIn = true;
					// Cargo los hoteles
					localStorageService.set('hotels',data.Data[0].Hotels);
					// Cargo las Compañías
					localStorageService.set('companies',data.Data[0].Companies);
					// Habilito boton de ingreso de nuevo
					scope.onCheckLogin = false;
					// Cargo menu de hoteles
	            	$state.go('menuhotels');
	            };
	        }).error(function (data) {
	            console.log(data);
	            if (data.error === "invalid_grant" ) {
					scope.error = true;
					scope.userName = "";
					scope.password = "";
					//Reiniciar valores de validacion
					$scope.logInfrm.$setPristine();
					// Habilito boton de ingreso de nuevo
					scope.onCheckLogin = false;
	            };
	            
	        });
		};
	}])
	.controller('logoutController', ['$scope','$rootScope','$state','localStorageService','loginFactory', function ($scope,$rootScope,$state,localStorageService,loginFactory){
		console.log("Cerrando Session");
		localStorageService.clearAll();
		$rootScope.isloggedIn = false;
		//Aviso que estoy en la página main
		$rootScope.actualPage = "main";
		$state.go('solempmobile');
	}])
	.controller('hmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory', function ($scope,$rootScope,$state,localStorageService,loginFactory){
		hmc = this; 
		hmc.hotels = localStorageService.get('hotels');
		hmc.selectedHotel = "";
		hmc.onSelectHotel = false;
		//Aviso que estoy en la página de Hotels
		$rootScope.actualPage = "hotels";
		//Al seleccionar hotel:
		hmc.hotelSelected = function() {
			//Aviso que estoy procesando
			//Deshabilito el boton para 
			//evitar otro request
			hmc.onSelectHotel = true;
			// Guardo el hotel seleccionado
			localStorageService.set('hotel', hmc.selectedHotel);
			// Paso a seleccion de empresa
			$state.go("menucompanies");
			//Habilito de nuevo el botón
			//Por si se regresa a Hoteles
			hmc.onSelectHotel = false;
		};
	}])
	.controller('cmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory', function ($scope,$rootScope,$state,localStorageService,loginFactory){
		cmc = this; 
		cmc.companies = localStorageService.get('companies');
		cmc.selectedCompany = "";
		cmc.onSelectCompany = false;
		//Aviso que estoy en la página de Companies
		$rootScope.actualPage = "companies";
		//Al seleccionar hotel:
		cmc.companySelected = function() {
			//Aviso que estoy procesando
			//Deshabilito el boton para 
			//evitar otro request
			cmc.onSelectCompany = true;
			// Guardo el hotel seleccionado
			localStorageService.set('company', cmc.selectedCompany);
			// Paso al Menú Principal
			
			return $http({
	            method: "POST",
	            url: solempWebApiURL.url + "/Users/getDataForMainScreen",
	            headers: { 'Content-Type': 'application/json' },
	            dataType: "json",
	           	data: {
	           			"userName" : scope.userName,
	           			"Password" : scope.password
	           		}
		        }).success(function (data) {
		            
		        }).error(function (data) {
		            
		        });
			};

			//Habilito de nuevo el botón
			//Por si se regresa a Hoteles
			cmc.onSelectCompany = false;
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
	  })
	.factory("loginFactory", ['localStorageService', function(localStorageService){
    	var isloggedIn = false;
	    var interfaz = {
	        isLogged : function(){
		        if (localStorageService.get('loggedIn') === 'yes') {
					return true;
				} else {
					return false;
				}
			} 
	    }
	    return interfaz;
	}])