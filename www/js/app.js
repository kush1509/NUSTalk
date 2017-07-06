// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('NUSTalk', ['ionic','NUSTalk.services', 'NUSTalk.controllers', 'ngCordova','ionic.closePopup'])

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
      
      .state('login', {
        url: '/login',
        cache: false,
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('loggedIn',{
        url:'/loggedIn',
        cache: false,
        templateUrl: 'templates/loggedIn.html',
        controller: 'LoggedInCtrl'
      })


      .state('NUSTalk', {
        url: '/NUSTalk',
        abstract: true,
        cache: false,
        templateUrl: 'templates/sidemenu.html',
        controller: 'AppController'
      })

      .state('NUSTalk.home', {
        url: '/home',
        cache: false,
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/homepage.html',
            controller: 'HomeController'
          }
        }
      })

      .state('NUSTalk.module', {
        url: '/module/:moduleName',
        cache: false,
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/module.html',
            controller: 'ModuleController'
          }
        }
      })

      .state('NUSTalk.chatDetails', {
        url: '/module/Chat',
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/chatDetails.html',
            controller: 'ChatDetailsController'
          }
        }
      })

      .state('NUSTalk.groupChatDetails', {
        url: '/module/GroupChat',
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/groupChatDetails.html',
            controller: 'GroupChatDetailsController'
          }
        }
      });

    $urlRouterProvider.otherwise('/login');
  });