(function(){
	var app = angular.module('grader', 
		[
			//dependencies
			'oc.lazyLoad',
			'ui.router',
			'angularModalService',

			//our code
			'general',
			'courses',
			'classrooms',
			'user',
			'assignments',
			'submissions',
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
  				ensureAuth(event, AuthService.isAuthenticated());
  			}else{
  				AuthResolver.resolve().then(function(data){
  					ensureAuth(event, AuthService.isAuthenticated());
  				});
  			}
  		});
	});

	app.factory('Config', function(){
		return {
			//where the tests run. this file can't be deleted by the user. 
			graderTestFile: 'Main'
		}
	});
})();