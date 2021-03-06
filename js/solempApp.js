angular
	.module('solempApp',['ngMessages', 'cgBusy','ui.router', 'ui.bootstrap.showErrors','LocalStorageModule','ngToast'])
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
	.config(['ngToastProvider', function(ngToast) {
    ngToast.configure({
      horizontalPosition: 'center',
      maxNumber: 1,
      animation: 'fade',
      dismissButton : true
    });
  }])
	.constant("solempWebApiURL", {
        "url": "http://192.168.111.56/solempmobileWA/api",
        "port": "80"
    })
	.controller('mainController', ['loginFactory','$scope','$rootScope',function(loginFactory,$scope,$rootScope){
		var mc = this;
		mc.isloggedIn = loginFactory.isLogged();
		$rootScope.isloggedIn = loginFactory.isLogged();
		$rootScope.actualPage = "main";
	}])
	.controller('loginController', ['$http','$scope','$location','$state','localStorageService','loginFactory','$rootScope','solempWebApiURL','ShowErrorMessages', function ($http,$scope,$location,$state,localStorageService,loginFactory,$rootScope,solempWebApiURL,ShowErrorMessages){
		var scope = this;
		scope.userName = "";
		scope.password = "";
		scope.respuesta = "";
		scope.errorLogin = false
		scope.error = false;
		scope.errorMsg = "";
		scope.onQuery = false;
		$rootScope.actualPage = "main";
		if (loginFactory.isLogged()) {
			$state.go('menuhotels');
		};

		$scope.startSubmit = function() {
			$scope.$broadcast('show-errors-check-validity');
			if ($scope.logInfrm.$invalid) { 
				return; 
			}
			 //Avisar que se está verificando el login
			//para deshabilitar el botón de ingreso
			scope.onQuery = true;
			$rootScope.apiQuery = $http.post("http://192.168.111.56/solempmobileWA/token",
					 "userName=" + encodeURIComponent(scope.userName) +
                     "&password=" + encodeURIComponent(scope.password) +
                     "&grant_type=password"
				).then(function(response){
					$rootScope.apiQuery = $http.post("http://192.168.111.56/solempmobileWA/api/Users/getUser",
						{
							"userName" : scope.userName,
							"password" : scope.password
						},
						{
							headers : {
								"Authorization" : "Bearer " + response.data.access_token
							}
						}
					).then (function(responseAux){
						// escribo en el Session Storage la sesion y otros datos
		   				localStorageService.set('userName', scope.userName);
						// Guardar Token
						localStorageService.set('token',response.data.access_token)
						// aviso que esta logueado el usuario
						$rootScope.isloggedIn = loginFactory.isLogged();
						
						// Cargo los hoteles
						localStorageService.set('hotels',responseAux.data.Data[0].Hotels);
						// Cargo las Compañías
						localStorageService.set('companies',responseAux.data.Data[0].Companies);
						//Cargo menu de hoteles
			            $state.go('menuhotels');

					}).catch(function(errorAux){
						if (errorAux.status == 401) {
						scope.errorMsg = "Sin autorización";
						scope.error = true;
						scope.userName = "";
						scope.password = "";
						//Reiniciar valores de validacion
						$scope.logInfrm.$setPristine();
						}
					})
				}).catch(function(error) {
			  		//console.log(JSON.stringify(error));
			        if (error.status == -1) {
			        	ShowErrorMessages.ShowErrorMessage("Error de conexión con el servidor");
						//scope.errorMsg = "Error de conexión con el servidor";
						//scope.error = true;
						scope.userName = "";
						scope.password = "";
						//Reiniciar valores de validacion
						$scope.logInfrm.$setPristine();
						return;
					}
					if (error.status == 400) {
						ShowErrorMessages.ShowErrorMessage("Usuario o clave incorrectos");
						//scope.errorMsg = "Usuario o clave incorrecta";
						//scope.error = true;
						scope.userName = "";
						scope.password = "";
						//Reiniciar valores de validacion
						$scope.logInfrm.$setPristine();
						return;
					}
					ShowErrorMessages.ShowErrorMessage("Error de cód. status : " + error.status);
				});
				// Habilito boton de ingreso de nuevo
				scope.onQuery = false;
				//Reiniciar valores de validacion
				$scope.logInfrm.$setPristine();
			};
	}])
	.controller('logoutController', ['$scope','$rootScope','$state','localStorageService','loginFactory','ShowErrorMessages', function ($scope,$rootScope,$state,localStorageService,loginFactory,ShowErrorMessages){
		console.log("Cerrando Session");
		localStorageService.clearAll();
		$rootScope.isloggedIn = loginFactory.isLogged();
		//Aviso que estoy en la página main
		$state.go('solempmobile');		
	}])
	.controller('hmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory','ShowErrorMessages', function ($scope,$rootScope,$state,localStorageService,loginFactory,ShowErrorMessages){
		if (!loginFactory.isLogged()) {
			$state.go('logout');
			ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");
		} else {
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
		};
	}])
	.controller('cmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL','ShowErrorMessages', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL,ShowErrorMessages){
		if (!loginFactory.isLogged()) {
			$state.go('logout');
			ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");			
		} else {
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
				// Ir al menú principal
				$state.go("mainmenu");
				// Habilito boton de nuevo
				cmc.onQuery = false;
			};
		}

	}])
	.controller('mainmenuController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL','ShowErrorMessages', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL,ShowErrorMessages){
		if (!loginFactory.isLogged()) {
			$state.go('logout');
			ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");			
		} else {
			mmc = this;
			//Aviso que estoy en la página de mainmenu
			$rootScope.actualPage = "mainmenu";
			//Variable para avisar que se esta consultando
			mmc.onQuery = true;
			// Variables de control de error
			mmc.hasError = false;
			mmc.errorMsg = "";

			//Obtener datos principales
			var userName = localStorageService.get('userName');
			var companyID = localStorageService.get('company').idempresa;
			$rootScope.apiQuery = $http.post(solempWebApiURL.url + "/Users/getDataForMainScreen", 
				{
					"userName" : userName,
		       		"companyID" : companyID 
				},
				{
					headers : {
						"Authorization" : "Bearer " + localStorageService.get('token')
					}
				}
				).then(function(response){
					if (response.data.Result === "ERROR") {
						mmc.hasError = true;
			           	mmc.errorMsg = response.data.Error.ErrorMsg;
			        } else {
				        // Si hay elementos a mostrar
				        // guardo
						//Saber si aprueba Pagos Pendientes
						mmc.apruebapp = response.data.Data[0].apruebapp;
						//Programaciones de Pago Pendientes
						mmc.pppendientes = response.data.Data[0].pppendientes;

						//Saber si aprueba Ordenes de Compra
						mmc.apruebaord = response.data.Data[0].apruebaord;
						//Ordenes de Compra
						mmc.ordpendientes = response.data.Data[0].ordpendientes;

						//Saber si aprueba Requisiciones de Almacén
						mmc.apruebareq = response.data.Data[0].apruebareq;
						//Requisiciones de Almacén
						mmc.reqpendientes = response.data.Data[0].reqpendientes;
			        }
						//Habilito el boton nuevamente
			            mmc.onQuery = false;
			    }).catch(function(error) {
			       	if (error.status == 401) {
						$state.go("logout");
						ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");			
						return;
					}
			       	//Habilito el boton nuevamente
		        	mmc.onQuery = false;
					//mmc.hasError = true;
					//mmc.errorMsg = "Error de cód. status : " + error.status;
					ShowErrorMessages.ShowErrorMessage("Error de cód. status : " + error.status);
		        });	
			mmc.getPays = function(){
				$state.go("pays");
			};
		}

	}])
	.controller('payController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL','ShowErrorMessages', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL,ShowErrorMessages){
		if (!loginFactory.isLogged()) {
			$state.go('logout');
			ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");
		} else {
			payc = this;
			//Aviso que estoy en la página de pays
			$rootScope.actualPage = "pays";
			// Inicializar variables de error
			payc.hasError = false;
		    payc.errorMsg = "";
			// Variable de bloquear botones cuando se hace consulta
			payc.onQuery = true;

			$rootScope.apiQuery = $http.post(solempWebApiURL.url + "/Users/getProgPagByStatus", 
				{
					"status": "TODOS",
					"companyID": localStorageService.get('company').idempresa
				},
				{
					headers : {
						"Authorization" : "Bearer " + localStorageService.get('token')
					}
				}).then(function(response){
					if (response.data.Result === "ERROR") {
						payc.hasError = true;
			           	payc.errorMsg = response.data.Error.ErrorMsg;
			        } else {
				    	// Si hay elementos a mostrar
				            // guardo
				            //Programaciones Aprobadas
				            payc.aprobadas = response.data.Data[0].tot;
				            // Programaciones Por Aprobar
				            payc.poraprobar = response.data.Data[1].tot;
				            // Programaciones Rechazadas
				            payc.rechazadas = response.data.Data[2].tot;
				            // Ir al menú principal
				            $state.go("pays");  
			        }
						//Habilito el boton nuevamente
			            payc.onQuery = false;
			    }).catch(function(error) {
					if (error.status == 401) {
						$state.go("logout");
						ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");
						return;						
					}
			       	//Habilito el boton nuevamente
		        	payc.onQuery = false;
					//payc.hasError = true;
					//payc.errorMsg = "Error de cód. status : " + error.status;
					ShowErrorMessages.ShowErrorMessage("Error de cód. status : " + error.status);
		        });
			payc.getPP = function(PPType){
				var pptype = PPType;
				// Bloquear botones cuando se hace consulta
				payc.onQuery = true;
				// Guardo el tipo de PP elegido
				localStorageService.set('PPType', pptype);				
				$state.go("listofpays");
				payc.onQuery = false;		
			};
		}		
			// Funcion anterior de conexion con WEB API ya NO usada
			// Queda como referencia
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
	.controller('listofpayController', ['$scope','$rootScope','$state','localStorageService','loginFactory','$http','solempWebApiURL', 'ShowErrorMessages', function ($scope,$rootScope,$state,localStorageService,loginFactory,$http,solempWebApiURL,ShowErrorMessages){
		if (!loginFactory.isLogged()) {
			$state.go('logout');
			ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");
		} else {
			lpc = this;
			lpc.listofpays = [];
			// Variables para el control de errores
			lpc.hasError = false;
			lpc.errorMsg = "";
			// Variable para avisar que se esta realizando un query
			lpc.onQuery = true;
			//Aviso que estoy en la página de pays
			$rootScope.actualPage = "listofpays";
			$rootScope.apiQuery = $http.post(solempWebApiURL.url + "/Users/listProgPagByStatus", 
				{
					"status": localStorageService.get('PPType'),
					"companyID": localStorageService.get('company').idempresa
				},
				{
					headers : {
						"Authorization" : "Bearer " + localStorageService.get('token')
					}
				}).then(function(data){
			            if (data.data.Data.Result === "ERROR") {
							lpc.hasError = true;
			            	lpc.errorMsg = data.Error.ErrorMsg;
			            } else {
				            // Si hay elementos a mostrar
				            // guardo
				            lpc.listofpays = data.data.Data;
				            //console.log(JSON.stringify(data.data.Data));
			            }
						//Habilito el boton nuevamente
			            lpc.onQuery = false;
				}).catch(function(error) {
			  			if (error.status == 401) {
						$state.go("logout");
						ShowErrorMessages.ShowErrorMessage("Debe iniciar sesión primero");
						return;
					}
					ShowErrorMessages.ShowErrorMessage("Error de cód. status : " + error.status);
				});
      	}
	}])
	.directive('showErrors', function() {
	  return {
	      restrict: 'A',
	      require:  '^form',
	      link: function (scope,element,attrs,formCtrl) {
                 // find the text box element, which has the 'name' attribute
			        var inputElement   = element[0].querySelector("[name]");
			        //console.log("inputElement = " + inputElement);
			        // convert the native text box element to an angular element
			        var inputNgElement = angular.element(inputElement);
			        //console.log("inputNgElement = " + inputNgElement);
			        // get the name on the text box so we know the property to check
			        // on the form controller
			        var inputName = inputNgElement.attr('name');
			        //console.log("inputName = " + inputName);		
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
		        if (typeof localStorageService.get('token') !== "undefined" && localStorageService.get('token') !== null){
					return true;
				} else {
					return false;
				}
			}
	    }
	    return interfaz;
	}])
	.service('ShowErrorMessages',['$rootScope','ngToast', function($rootScope,ngToast){
		this.ShowErrorMessage = function(message){
			  var myToastMsg = ngToast.danger({
			  content: message
			});
		}
	}])