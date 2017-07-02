angular.module('NUSTalk.services',['firebase'])

	.factory('Firebase',function(){
		var config = {
	        apiKey: "AIzaSyBrTbxABijoMOnyITzHrxZDCRgFzmPRP3s",
	        authDomain: "nustalk1.firebaseapp.com",
	        databaseURL: "https://nustalk1.firebaseio.com",
	        projectId: "nustalk1",
	        storageBucket: "gs://nustalk1.appspot.com",
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

		  var setUserId = function(data) {
		      userData.userId = data;
		  };

		  var getUserId = function(){
		      return userData.userId;
		  };			  

		  return {
		    setToken: setToken,
		    getToken: getToken,
		    setUserName: setUserName,
		    getUserName: getUserName,
		    setUserId: setUserId,
		    getUserId: getUserId
		  };
	})

	.service('ModuleService', function(){

		var studentModules = [];
		var staffModules = [];
		var currentModule = {};

		var setStudentModules = function(data) {
		    studentModules = data;
		};

		var getStudentModules = function(){
		    return studentModules;
 	    };

 	    var setStaffModules = function(data) {
		    staffModules = data;
		};

		var getStaffModules = function(){
		    return staffModules;
 	    };

 	    var setCurrentModule = function(data){
 	    	currentModule = data;
 	    };

 	    var getCurrentModule = function(){
 	    	return currentModule;
 	    };
		  return {
		    setStudentModules: setStudentModules,
		    getStudentModules: getStudentModules,
		    setStaffModules: setStaffModules,
		    getStaffModules: getStaffModules,
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
