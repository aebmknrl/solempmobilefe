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
        .state('mainmenu', {
           url: '/mainmenu',
            templateUrl: 'mainmenu.html'
        })
        .state('pays', {
           url: '/pays',
            templateUrl: 'pays.html'
        })
        .state('listofpays', {
           url: '/listofpays',
            templateUrl: 'listofpays.html'
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
		scope.errorLogin = false
		scope.error = false;
		scope.errorMsg = "";
			scope.onQuery = false;
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
			scope.onQuery = true;


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
		            	scope.errorMsg = "Error: Usuario o Clave incorrectos";
		            	scope.error = true;
		            	scope.userName = "";
						scope.password = "";
						//Reiniciar valores de validacion
						$scope.logInfrm.$setPristine();
						//habilitar botón de ingreso nuevamente
						scope.onQuery = false;
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
					scope.onQuery = false;
					// Cargo menu de hoteles
	            	$state.go('menuhotels');
	            };
	        }).error(function (data, status, headers, config) {
	            console.log(data);
	            if (data.error === "invalid_grant" ) {
					scope.error = true;
					scope.userName = "";
					scope.password = "";
					//Reiniciar valores de validacion
					$scope.logInfrm.$setPristine();
					// Habilito boton de ingreso de nuevo
					
	            } else {
	            	scope.errorMsg = data.error;
	            }
	            scope.onQuery = false;
	        }).catch(function(error) {
				console.log(JSON.stringify(error));
				if (error.status = -1) {
					scope.errorMsg = "Error de conexión con el servidor";
					scope.error = true;
					scope.userName = "";
					scope.password = "";
					//Reiniciar valores de validacion
					$scope.logInfrm.$setPristine();
					// Habilito boton de ingreso de nuevo					
				};
				scope.onQuery = false;
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
		if (!loginFactory.isLogged()) {
			$state.go('solempmobile');
		};
		hmc = this; 
		hmc.hotels = localStorageService.get('hotels');
		hmc.selectedHotel = "";
		hmc.onQuery = false;
		//Aviso que estoy en la página de Hotels
		$rootScope.actualPage = "hotels";
		//Al seleccionar hotel:
		hmc.hotelSelected = function() {
			//Aviso que estoy procesando
			//Deshabilito el boton para 
			//evitar otro request
			hmc.onQuery = true;
			// Guardo el hotel seleccionado
			localStorageService.set('hotel', hmc.selectedHotel);
			// Paso a seleccion de empresa
			$state.go("menucompanies");
			//Habilito de nuevo el botón
			//Por si se regresa a Hoteles
			hmc.onQuery = false;
		};
	}])
	.controller('cmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL){
		if (!loginFactory.isLogged()) {
			$state.go('solempmobile');
		};
		cmc = this; 
		cmc.companies = localStorageService.get('companies');
		cmc.selectedCompany = "";
		cmc.onQuery = false;
		cmc.hasError = false;
		cmc.errorMsg = "";
		//Aviso que estoy en la página de Companies
		$rootScope.actualPage = "companies";
		//Al seleccionar hotel:
		cmc.companySelected = function() {
			//Aviso que estoy procesando
			//Deshabilito el boton para 
			//evitar otro request
			cmc.onQuery = true;
			// Guardo el hotel seleccionado
			localStorageService.set('company', cmc.selectedCompany);
			// Paso al Menú Principal
			
			//Obtengo valores para pasar a API
			var userName = localStorageService.get('userName');
			var companyID = localStorageService.get('company').idempresa;
			return $http({
	            method: "POST",
	            url: solempWebApiURL.url + "/Users/getDataForMainScreen",
	            headers: { 'Content-Type': 'application/json' },
	            dataType: "json",
	           	data: {
	           			"userName" : userName,
	           			"companyID" : companyID 
	           		}
		        }).success(function (data) {
		            console.log(data);
		            if (data.Result === "ERROR") {
						cmc.hasError = true;
		            	cmc.errorMsg = data.Error.ErrorMsg;
		            } else {
			            // Si hay elementos a mostrar
			            // guardo
			            localStorageService.set('mainData', data.Data[0]);
			            // Ir al menú principal
			            $state.go("mainmenu");
		            }
					//Habilito el boton nuevamente
		            cmc.onQuery = false;
		        }).error(function (data) {
		            
		        });

			//Habilito de nuevo el botón
			//Por si se regresa a Hoteles
			cmc.onSelectCompany = false;
		};
	}])
	.controller('mainmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL){
		if (!loginFactory.isLogged()) {
			$state.go('solempmobile');
		};
		mmc = this;
		//Aviso que estoy en la página de mainmenu
		$rootScope.actualPage = "mainmenu";
		//Variable para avisar que se esta consultando
		mmc.onQuery = false;

		// Variables de control de error
		mmc.hasError = false;
		mmc.errorMsg = "";

		//Saber si aprueba Pagos Pendientes
		mmc.apruebapp = localStorageService.get('mainData').apruebapp;
		//Programaciones de Pago Pendientes
		mmc.pppendientes = localStorageService.get('mainData').pppendientes;

		//Saber si aprueba Ordenes de Compra
		mmc.apruebaord = localStorageService.get('mainData').apruebaord;
		//Ordenes de Compra
		mmc.ordpendientes = localStorageService.get('mainData').ordpendientes;

		//Saber si aprueba Requisiciones de Almacén
		mmc.apruebareq = localStorageService.get('mainData').apruebareq;
		//Requisiciones de Almacén
		mmc.reqpendientes = localStorageService.get('mainData').reqpendientes;

		mmc.getPays = function(){
			mmc.onQuery = true;
			return $http({
	            method: "POST",
	            url: solempWebApiURL.url + "/Users/getProgPagByStatus",
	            headers: { 'Content-Type': 'application/json' },
	            dataType: "json",
	           	data: {
					  "status": "TODOS",
					  "companyID": localStorageService.get('company').idempresa
					}
		        }).success(function (data) {
		            console.log(data);
		            if (data.Result === "ERROR") {
						mmc.hasError = true;
		            	mmc.errorMsg = data.Error.ErrorMsg;
		            } else {
			            // Si hay elementos a mostrar
			            // guardo
			            //Programaciones Aprobadas
			            localStorageService.set('pppAprobadas', data.Data[0]);
			            // Programaciones Por Aprobar
			            localStorageService.set('pppPorAprobar', data.Data[1]);
			            // Programaciones Rechazadas
			            localStorageService.set('pppRechazadas', data.Data[2]);
			            // Ir al menú principal
			            $state.go("pays");
		            }
					//Habilito el boton nuevamente
		            mmc.onQuery = false;
		        }).error(function (data) {
		            
		        });
		};
	}])
	.controller('payController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL){
		if (!loginFactory.isLogged()) {
			$state.go('solempmobile');
		};
			payc = this;
			//Aviso que estoy en la página de pays
			$rootScope.actualPage = "pays";

			// Inicializar variables de error
			payc.hasError = false;
		    payc.errorMsg = "";

			// Variable de bloquear botones cuando se hace consulta
			payc.onQuery = false;

			payc.poraprobar = localStorageService.get('pppAprobadas').tot;
			payc.aprobadas = localStorageService.get('pppPorAprobar').tot;
			payc.rechazadas = localStorageService.get('pppRechazadas').tot;

			payc.getPP = function(PPType){
				var pptype = PPType;
				// Bloquear botones cuando se hace consulta
				payc.onQuery = true;

				// Guardo el tipo de PP elegido
				localStorageService.set('PPType', pptype);
				
				$state.go("listofpays");
				payc.onQuery = false;
				//connectAPI();			
			};
			
			function connectAPI(){
			  return $http({
		            method: "POST",
		            url: solempWebApiURL.url + "/Users/listProgPagByStatus",
		            headers: { 'Content-Type': 'application/json' },
		            dataType: "json",
		           	data: {
							"status": localStorageService.get('PPType'),
							"companyID": localStorageService.get('company').idempresa
							}
			        }).success(function (data) {
			            console.log(data);
			            if (data.Result === "ERROR") {
							payc.hasError = true;
			            	payc.errorMsg = data.Error.ErrorMsg;
			            } else {
			            	//console.log(data);
				            // Si hay elementos a mostrar
				            // guardo
				            localStorageService.set('paylistdata', data.Data);
				            // Ir al menú principal
				            // Voy a mostrar la lista de pago
							$state.go("listofpays");
			            }
						//Habilito el boton nuevamente
			            payc.onQuery = false;
			        }).error(function (data) {
			            
			        });
			};
	}])
	.controller('listofpayController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL){
		if (!loginFactory.isLogged()) {
			$state.go('solempmobile');
		};
			// Variable para poner el fondo en gris mientras se carga
			$rootScope.grayOutScreen = true;

			lpc = this;
			lpc.listofpays = [];
			// Variables para el control de errores
			lpc.hasError = false;
			lpc.errorMsg = "";
			// Variable para avisar que se esta realizando un query
			lpc.onQuery = true;
			//Aviso que estoy en la página de pays
			$rootScope.actualPage = "listofpays";
			

			$http.post(solempWebApiURL.url + "/Users/listProgPagByStatus", 
				{
					"status": localStorageService.get('PPType'),
					"companyID": localStorageService.get('company').idempresa
				}).then(function(data){
			            if (data.data.Data.Result === "ERROR") {
							lpc.hasError = true;
			            	lpc.errorMsg = data.Error.ErrorMsg;
			            } else {
				            // Si hay elementos a mostrar
				            // guardo
				            lpc.listofpays = data.data.Data;
			            }
						//Habilito el boton nuevamente
			            lpc.onQuery = false;
				}).catch(function(error) {
			  		console.log(JSON.stringify(error));
			});
		$scope.$on('cfpLoadingBar:completed', function(){
        console.debug('Loading Finished');
        $rootScope.grayOutScreen = false;
      });
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