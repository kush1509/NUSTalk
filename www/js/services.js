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

		  var setIcon = function(data) {
		      userData.icon = data;
		  };

		  var getIcon = function(){
		      return userData.icon;
		  };		  	  

		  var setEmail = function(data) {
		      userData.email = data;
		  };

		  var getEmail = function(){
		      return userData.email;
		  };

		  return {
		    setToken: setToken,
		    getToken: getToken,
		    setUserName: setUserName,
		    getUserName: getUserName,
		    setUserId: setUserId,
		    getUserId: getUserId,
		    setIcon: setIcon,
		    getIcon: getIcon,
		    setEmail: setEmail,
		    getEmail: getEmail
		  };
	})

	.service('ModuleService', function(){

		var modules = [];
		var studentModules = [];
		var staffModules = [];
		var currentModule = {};

		var setModules = function(data) {
		    modules = data;
		};

		var getModules = function(){
		    return modules;
 	    };

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
		    setModules: setModules,
		    getModules: getModules,
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
		var currentThread = "";
		var tutorialExists = false;

		var setOtherUser = function(data){
			otherUser = data;
		}

		var getOtherUser = function(){
		    return otherUser;
 	    };

 	    var setCurrentThread = function(data){
			currentThread = data;
		}

		var getCurrentThread = function(){
		    return currentThread;
 	    };

 	    var setTutorial = function(data){
 	    	tutorialExists = data;
 	    }

 	    var tutorial = function(){
 	    	return tutorialExists;
 	    };

 	    return {
 	    	setOtherUser: setOtherUser,
 	    	getOtherUser: getOtherUser,
 	    	setCurrentThread: setCurrentThread,
 	    	getCurrentThread: getCurrentThread
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
	})

	.service('GroupService', function(){

		var group = {};

		var setName = function(data){
			group.name = data;
		};

		var setMembers =  function(data){
			group.members = data;
		}

		var setIcon =  function(data){
			group.icon = data;
		}

		var getName = function(){
			return group.name;
		}

		var getMembers = function(){
			return group.members;
		}

		var getIcon = function(){
			return group.icon;
		}

		var getGroup = function(){
			return group;
		}

		return{
			setName: setName,
			getName: getName,
			setMembers: setMembers,
			getMembers: getMembers,
			setIcon: setIcon,
			getIcon: getIcon,
			getGroup: getGroup
		}

	})
