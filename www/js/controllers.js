angular.module('NUSTalk.controllers', [])

.controller('HomeController', function($scope) {
  $scope.modules = [
    {id:1, name:'CS1010'},
    {id:2, name:'CS1020'},
    {id:3, name:'CS1030'},
    {id:4, name:'CS1040'},
    {id:5, name:'CS1050'}];
})

.controller('ModuleController', function($scope, $stateParams) {
  $scope.currentModule = {
    name: $stateParams.name
  };
});
