(function(){
	var app = angular.module('grader', 
		[
			'ui.router',
			'textAngular',
			'general',
			'courses',
			'user',
			'assignments',
			'misc'
		]);

	//remove the hash
	app.config(['$locationProvider', function($locationProvider){
		$locationProvider.html5Mode(true);
	}]);
	
	app.run(function ($rootScope, $state, AuthService, AuthResolver) {
  		$rootScope.$on('$stateChangeStart', function (event, next) {

			var ensureAuth = function(event, bIsLoggedIn){
				if (!bIsLoggedIn && (typeof next.data === 'undefined' || next.data.bIsPublic !== true)){
					event.preventDefault();
					$state.go('root.login');
				}
			}

  			if (AuthResolver.bIsResolved()){
  				console.log('stateChangeStart resolved');
  				console.log('auth: ' + AuthService.isAuthenticated());
  				ensureAuth(event, AuthService.isAuthenticated());
  			}else{
  				AuthResolver.resolve().then(function(data){
  					console.log('stateChangeStart not resolved');
  					console.log('auth: ' + AuthService.isAuthenticated());
  					ensureAuth(event, AuthService.isAuthenticated());
  				});
  			}
  		});
	});
})();