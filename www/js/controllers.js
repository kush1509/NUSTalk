angular.module('NUSTalk.controllers', [])
  .controller('AppController', function($scope, $ionicModal) {
    $scope.hasLoggedIn = false;

    // LOGIN MODAL
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.loginModal = modal;
    });

    // LOGOUT MODAL
    $ionicModal.fromTemplateUrl('templates/logout.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.logoutModal = modal;
    });

    // close modal
    var closeModal = function(hasLoggedIn) {
      if(hasLoggedIn) {
        $scope.logoutModal.hide();
        $scope.logoutModal.remove();
      } else {
        $scope.loginModal.hide();
        $scope.loginModal.remove();
      }
    };

    // show login modal
    var showModal = function(hasLoggedIn) {
      if(hasLoggedIn) {
        $scope.logoutModal.show();
      } else {
        $scope.loginModal.show();
      }
    };

    $scope.loginOrLogout = function(hasLoggedIn) {
      if(hasLoggedIn) {
        // show logout
        showModal(hasLoggedIn);
        //TODO: update flag only if user logs out
        $scope.hasLoggedIn = false;
      } else {
        // show login
        showModal(hasLoggedIn);
        //TODO: update flag only if user logs in
        $scope.hasLoggedIn = true;
      }
    }
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

  .controller('ModuleController', function($scope, $state, $stateParams) {
    $scope.currentModule = {
      name: $stateParams.moduleName
    };

    $scope.goToInfo = function() {
      $state.go('NUSTalk.info', { moduleName: $stateParams.moduleName });
    }
  })

  .controller('InfoController', function($scope, $stateParams) {
    $scope.currentModule = {
      name: $stateParams.moduleName
    }

  })

  .controller('SettingsController', function($scope) {

  });
