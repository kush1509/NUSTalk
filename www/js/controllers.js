angular.module('NUSTalk.controllers', [])
  .controller('AppController', function($scope, $state, $ionicModal) {
    $scope.user = {
      name: '',
      email: '',
      password: '',
      hasLoggedIn: false
    };

    $scope.showLogin = function(){
      $state.go('NUSTalk.login');
    };

    // logout modal
    $ionicModal.fromTemplateUrl('templates/logout.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.logoutModal = modal;
    });

    // show logout modal
    $scope.showLogoutModal = function() {
      $scope.logoutModal.show();
    };

    // close logout modal
    $scope.closeLogoutModal = function() {
      $scope.logoutModal.hide();
      $scope.logoutModal.remove();
    };

    // user logout
    $scope.logoutUser = function() {
      $scope.user.hasLoggedIn = false;
      $scope.closeLogoutModal();
    };
  })

  .controller('LoginController', function($scope, $state) {
    // user login
    $scope.loginUser = function() {
      $scope.user.hasLoggedIn = true;
      $state.go('NUSTalk.home');
    };

    $scope.showSignUp = function() {
      $state.go('NUSTalk.signup');
    };
  })

  .controller('SignUpController', function($scope) {
    // user signup
    $scope.signUpUser = function() {
      // get data
      // show login page after adding user
      $scope.showLogin();
    };
  })

  .controller('HomeController', function($scope) {
    // TODO: get the users to select what modules they want to add from the NUSMods API's JSON objects
    $scope.modules = [
      {id:1, name:'CS1010'},
      {id:2, name:'CS1020'},
      {id:3, name:'CS1030'},
      {id:4, name:'CS1040'},
      {id:5, name:'CS1050'}];
  })

  .controller('ModuleController', function($scope, $state, $stateParams, Socket, Users, Chats, Chat) { // add
    $scope.currentModule = {
      name: $stateParams.moduleName
    };

    $scope.chats = Chats.all();

    $scope.goToInfo = function() {
      $state.go('NUSTalk.info', { moduleName: $stateParams.moduleName });
    };
  })

  .controller('InfoController', function($scope, $stateParams) {
    $scope.currentModule = {
      name: $stateParams.moduleName
    };
  })

  .controller('NUSModsAPIController', function(NUSModsModuleData) {
    var thisData = this;

    NUSModsModuleData.getSomeData().then(function(response){
      //do something with response
      thisData.data = response.data;
    }).catch(function(response){
      //handle the error
    });
  })

  .controller('SettingsController', function($scope) {

  });
