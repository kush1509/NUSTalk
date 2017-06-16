angular.module('NUSTalk.controllers', [])
  .controller('AppController', function($scope) {

  })

  .controller('LoginController', function($scope) {

  })

  .controller('HomeController', function($scope, $ionicModal) {
    // TODO: get the users to select what modules they want to add
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
