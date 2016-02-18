(function(){
	angular.module('user').config(['$stateProvider', function($stateProvider){
		$stateProvider.state('root.auth', {
			url: '/auth',
			templateUrl: '/angular/user/partials/auth.html',
			controller: 'LoginController',
			controllerAs: 'loginCtrl'
		});

		$stateProvider.state('root.dashboard', {
			templateUrl: '/angular/user/partials/dashboard.html',
			controller: 'DashboardController',
			controllerAs: 'dashboardCtrl'
		});

		$stateProvider.state('root.profile', {
			url: '/profile',
			templateUrl: '/angular/user/partials/profile.html',
			controller: 'ProfileController',
			controllerAs: 'profileCtrl'
		});
	}]);
})();