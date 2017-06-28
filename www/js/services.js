angular.module('NUSTalk.services',['firebase'])

	.factory('Firebase',function(){
		var config = {
	        apiKey: "AIzaSyBrTbxABijoMOnyITzHrxZDCRgFzmPRP3s",
	        authDomain: "nustalk1.firebaseapp.com",
	        databaseURL: "https://nustalk1.firebaseio.com",
	        projectId: "nustalk1",
	        storageBucket: "nustalk1.appspot.com",
	        messagingSenderId: "1001751122819"
	      };
	    return firebase.initializeApp(config);
	}) 

	.service('User', function($http) {
		  var  userData = {};

		  var setToken = function(data) {
		      userData.token = data;
		  };

		  var getToken = function(){
		      return userData.token;
		  };

		  var setUserName = function(data) {
		      userData.userName = data;
		  };

		  var getUserName = function(){
		      return userData.userName;
		  };		  

		  return {
		    setToken: setToken,
		    getToken: getToken,
		    setUserName: setUserName,
		    getUserName: getUserName
		  };
	})

	.service('ModuleService', function(){

		var modules = [];
		var currentModule = {};

		var setModules = function(data) {
		    modules = data;
		};

		var getModules = function(){
		    return modules;
 	    };

 	    var setCurrentModule = function(data){
 	    	currentModule = data;
 	    }

 	    var getCurrentModule = function(){
 	    	return currentModule;
 	    }
		  return {
		    setModules: setModules,
		    getModules: getModules,
		    setCurrentModule: setCurrentModule,
		    getCurrentModule: getCurrentModule
		  };
	})
	
	.service('ChatService', function(){

		var otherUser = {};

		var setOtherUser = function(data){
			otherUser = data;
		}

		var getOtherUser = function(){
		    return otherUser;
 	    };

 	    return {
 	    	setOtherUser: setOtherUser,
 	    	getOtherUser: getOtherUser
 	    };
	})

	.service('Chats', function(){

		var chats = [];

		var addChat = function(data){
			chats.push(data);
		};

		var getChats = function(){
		    return chats;
 	    };

		return{
			addChat: addChat,
			getChats: getChats
		}
	});
