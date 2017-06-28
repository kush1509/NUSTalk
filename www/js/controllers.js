angular.module('NUSTalk.controllers',['firebase'])

	
	.controller('AppController', function($scope, $state, $ionicModal, Firebase, User) {
    	
		$scope.Username = User.getUserName();
	    // logout modal
	    $ionicModal.fromTemplateUrl('templates/modal-logout.html', {
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
	    };

	    // user logout
	    $scope.logoutUser = function() {
	      firebase.auth().signOut().then(function() {
			  console.log('Signed out');
			  $state.go('login');
			}).catch(function(error) {
			  // An error happened.
			});
	      $scope.closeLogoutModal();
	    };
  	})

	.controller('LoginCtrl', function($scope, $state, User, $window, $cordovaInAppBrowser, $rootScope){
		$scope.loginWithIVLE = function(){
			var link = 'https://ivle.nus.edu.sg/api/login/?apikey=JWE5l4plZpPkhqENrgaVx&url=http://localhost:8100/';
 			
 			
 			/*
		    $cordovaInAppBrowser.open(link, '_blank')
		      .then(function(event) {
		      //  alert(event.url);
		        $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){
		        //	alert(event.url);
		        	if(event.url.indexOf('token=')!=-1){  					
	  					$cordovaInAppBrowser.close();
	  					$scope.token = event.url.split('=')[1];
					//	alert($scope.token);
						User.setToken($scope.token);
						$state.go('loggedIn');
					}
 				});
		      })
		      .catch(function(event) {
		       	console.log('no');
		     });
			*/
		      
	
		     
		     var win = window.open(link);	
  			
  			var interval = setInterval(function(){
  				console.log(win.location.href);
  				if(win.location.href.indexOf('token=')!=-1){  					
  					win.close();
  					$scope.token = (win.location.href.split('=')[1]).split('#')[0];
					console.log($scope.token);
					User.setToken($scope.token);
					$state.go('loggedIn');
					clearInterval(interval);
  				}	
  			},1000);

			
				
			
  						
	  	};	
	})

	.controller('LoggedInCtrl', function($scope, $state, $http, User, ModuleService, Firebase){


		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/UserName_Get?APIKey=JWE5l4plZpPkhqENrgaVx&Token='+User.getToken(), { cache: false })
			.then(function(result){
				console.log(result);
				
				var UserRef = firebase.database().ref('Users').child('users');

				var flag = 0;
				UserRef.once('value', function(snapshot) {
 				 snapshot.forEach(function(childSnapshot) {
 				   	var childData = childSnapshot.val();
 				   	console.log(childData);
 				   	if(childData.Name == result.data){
 				   		console.log('same');
 				   		flag = 1;
 				   	}	
 				 });
 				 	if(flag == 0){
 						console.log('pushing');
 						UserRef.child(result.data).set({
 							Name: result.data
 						});
 				  }
 				});
				
				User.setUserName(result.data);
		});

		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/Modules?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&Duration=0&IncludeAllInfo=false', { cache: false })
			.then(function(result){
				console.log(result);
				ModuleService.setModules(result.data.Results);
				$state.go('NUSTalk.home');
			});	
	}) 

	.controller('HomeController', function($scope, User, $http, ModuleService, $state){
		

		 if(!User.getUserName())
		 	$state.go('login');

	     $scope.userName = User.getUserName();
	     console.log($scope.userName);

	   	 $scope.modules = ModuleService.getModules();
	   	 console.log($scope.modules);

	   	 $scope.setCurrentModule = function(data){
	   	 	ModuleService.setCurrentModule(data);
	   	 	console.log(data.CourseCode);
	   	 }
	})

	.controller('ModuleController', function($scope, ModuleService, $ionicModal, $http, User, ChatService, $state, $ionicScrollDelegate, Firebase){

		$scope.userName = User.getUserName();

		$scope.currentModule = ModuleService.getCurrentModule();
		console.log($scope.currentModule.CourseCode);

		$ionicModal.fromTemplateUrl('templates/modal-newChat.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.newChatModal = modal;
		});

		$scope.chats = []; 
	//	$scope.last = "";

		var UserRef = firebase.database().ref('Users/users/'+ User.getUserName()+'/Chats');
		
		UserRef.on('child_added', function(data) {
			console.log('chat started with '+ data.val().Name);
			var messagesRef = firebase.database().ref('Users/users/'+ User.getUserName()+'/Chats/'+ data.val().Name);

			messagesRef.limitToLast(2).on("child_added", function (snapshot) {
        		if(snapshot.key != "Name"){
        			$scope.last = snapshot.val().message;
        			console.log($scope.last);
        		}	
        	});
        		
			$scope.chats.unshift(
				{Name: data.val().Name,
				lastText: $scope.last}
			);	
		});

		//go from module page
		$scope.goToChat = function(other){
		 		ChatService.setOtherUser(other);
		 		$state.go('NUSTalk.chatDetails');
		 };

		$scope.newChat = function(){
			console.log('new chat');
			$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/Module_Lecturers?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID+'&Duration=0', { cache: false })
			.then(function(result){
				$scope.moduleFacils = JSON.parse(JSON.stringify(result.data.Results));
				console.log($scope.moduleFacils);

				$scope.lecturers = {show:false, list:[]};
				$scope.tutors = {show:false, list:[]};

				for (var i = 0; i < $scope.moduleFacils.length; i++) {
					if(($scope.moduleFacils[i].Role).indexOf('Lecturer')!=-1)
						$scope.lecturers.list.push($scope.moduleFacils[i]);	
					else
						$scope.tutors.list.push($scope.moduleFacils[i]);
				};

			});

			$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/Class_Roster?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID, { cache: false })
				.then(function(result){
					console.log(result);

					$scope.classRoster = {
						show: false,
						list: result.data.Results
					}
				});

			/*	
			$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/GroupsByUserAndModule?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID+'&AcadYear=2016/2017&Semester=2', { cache: false })
			.then(function(result1){
				$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/Module_ClassGroupUsers?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&ClassGroupID='+result1.data.Results[0].ClassGroupID, { cache: false })
				.then(function(result2){
					console.log(result1.data.Results[4]);
					console.log(result2);

					$scope.classRoster = {
						show: false,
						list: result2.data.Results
					}
				});
			});	
			*/

			$scope.newChatModal.show();

			$scope.toggleQuery = function(query) {
		    	query.show = !query.show;
		 	};
			$scope.isQueryShown = function(query) {
		    	return query.show;
		 	};

		 	$scope.goToChat = function(other){
		 		ChatService.setOtherUser(other);
		 		$scope.newChatModal.hide();
		 		$state.go('NUSTalk.chatDetails');
		 	};
		}

	    $scope.closeNewChatModal = function(){
	     	$scope.newChatModal.hide();
	    }
	})

	.controller('ChatDetailsController', function($scope, $state, ChatService, Firebase, User, $ionicScrollDelegate, $timeout, $rootScope){

	//	$scope.refresh = setInterval(function(){
	//			$state.go('NUSTalk.chatDetails');
	//	}, 500);


		$timeout(function() {
    		$ionicScrollDelegate.scrollBottom();
  		});

		$scope.otherUser = ChatService.getOtherUser(); 
		
		$scope.sendMessage = function(msg){

			//$ionicScrollDelegate.scrollBottom(true);

			var data = {
				sender: User.getUserName(),
				message: msg,
				time: new Date().getTime()
			};

			console.log(data.time);
			var UserRef = firebase.database().ref('Users');

			UserRef.child('users').child(ChatService.getOtherUser().Name).child('Chats').child(User.getUserName()).child('Name').set(User.getUserName());
			UserRef.child('users').child(ChatService.getOtherUser().Name).child('Chats').child(User.getUserName()).push(data);

			UserRef.child('users').child(User.getUserName()).child('Chats').child(ChatService.getOtherUser().Name).child('Name').set(ChatService.getOtherUser().Name);
			UserRef.child('users').child(User.getUserName()).child('Chats').child(ChatService.getOtherUser().Name).push(data);
		}	

		$scope.data = angular.copy({});

		$scope.messages = [];

		var messagesRef = firebase.database().ref('Users/users/'+ User.getUserName()+'/Chats/'+ ChatService.getOtherUser().Name);
		
		messagesRef.on('child_added', function(data) {
			console.log('new message'+ data.val().message);
			if(data.key != 'Name'){
				$scope.messages.push(data.val());	
				$timeout(function() {
    			$ionicScrollDelegate.scrollBottom();
	  			});
			}
		});


	});
	
