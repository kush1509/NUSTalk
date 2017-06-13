// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('NUSTalk', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('Home', {
    url: '/home',
    templateUrl: 'templates/Homepage.html',   
    controller: function($scope){
        $scope.modules = [
        {id:1, name:'CS1010'},
        {id:2, name:'CS1020'},
        {id:3, name:'CS1030'},
        {id:4, name:'CS1040'},
        {id:5, name:'CS1050'}];
    }
  })

  .state('Module', {
    url: '/module/:name',
    templateUrl: 'templates/Module.html',   
    controller: function($scope){
        ;
    }
  })

  // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');
});
