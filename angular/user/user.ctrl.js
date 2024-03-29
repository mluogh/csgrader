(function(){
	angular.module('user').controller('LoginController', function($state, $rootScope, AuthService){
		var vm = this;
		
		vm.authMessage = '';
		
		vm.shownImage = parseInt(Math.random() * 4);

		vm.user = {
			email: '',
			password: ''
		};

		this.login = function() {
			AuthService.login(vm.user).then(
				function(res){
					$state.go('root.main');
				},
				function(res){
					vm.authMessage = res.data.userMessages;
				});
		};
	})

	.controller('LogoutController', function($http, $state, UserInfo){
		//Logout and reset user
		$http.post('/api/user/logout').then(
			function Success(){
				UserInfo.destroyUser();
				$state.go('root.main.public');
			}
		)
	})
	
	.controller('JoinController', function($state, $rootScope, AuthService){
		var vm = this;
		vm.authMessage = '';
		vm.user = {
			firstName: '',
			lastName: '',
			retypePassword: '', 
			password: '',
			email: '',
			role: ''
		};

		this.signup = function() {
			AuthService.signup(vm.user).then(
				function Success(res){
					$state.go('root.main');
				},
				function Failure(res){
					vm.authMessage = res.data.userMessages;
				}
			);
		};
	})

	.controller('RegistrationController', function($state, UserFactory){
		var vm = this;
		vm.regInfo = {};
		vm.userMessages = '';

		this.registerForCourse = function(){
			UserFactory.registerForCourse(vm.regInfo).then(
				function Success(res){
					$state.go('root.course', { courseCode: res.courseCode });
				},
				function Failure(res){
					vm.userMessages = res.data.userMessages;
				}
			)
		}
	})

	.controller('ProfileController', function($state, UserInfo){
		this.user = UserInfo.getUser();
	});
})();