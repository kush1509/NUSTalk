angular.module('NUSTalk', ['ionic', 'NUSTalk.controllers', 'NUSTalk.services'])

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
      .state('NUSTalk', {
        url: '/NUSTalk',
        abstract: true,
        templateUrl: 'templates/sidemenu.html',
        controller: 'AppController'
      })

      .state('NUSTalk.home', {
        url: '/home',
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/homepage.html',
            controller: 'HomeController'
          }
        }
      })

      .state('NUSTalk.settings', {
        url: '/settings',
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/settings.html',
            controller: 'SettingsController'
          }
        }
      })

      .state('NUSTalk.module', {
        url: '/module/:moduleName',
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/module.html',
            controller: 'ModuleController',
            params: {moduleName: null}
          }
        }
      })

      .state('NUSTalk.info', {
        url: '/module/:moduleName/info',
        views: {
          'NUSTalkSideMenu': {
            templateUrl: 'templates/moduleInfo.html',
            controller: 'InfoController',
            params: {moduleName: null}
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/NUSTalk/home');
  });
