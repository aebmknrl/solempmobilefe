angular
.module('routerApp', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/home',
            templateUrl: 'partial-home.html'
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
                url: "http://192.168.0.203/testWebApi/Token",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: 'username=' + encodeURIComponent(scope.userName) + '&password=' + encodeURIComponent(scope.password) + '&grant_type=password'
            }).success(function (data) {
                scope.respuesta = data;
                console.log(data);
                $location.path('/solempmobile/menuhotels.html');
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