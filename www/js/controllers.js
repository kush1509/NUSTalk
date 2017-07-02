angular.module('NUSTalk.controllers',['firebase'])

	
	.controller('AppController', function($scope, $state, $ionicModal, Firebase, User, $ionicPopup) {
    	
		$scope.Username = User.getUserName();
		$scope.UserId = User.getUserId();
	    // logout modal
	    $scope.logout = function () {
			var logOutPopUp = $ionicPopup.show({
				title: 'Do you want to log out?',
				scope: $scope,
				buttons: [{
					text: 'Nope',
					type: 'button-later',
					onTap: function (e) {
						logOutPopUp.close();
					}
				},
				{
					text: '<b>Logout</b>',
					type: 'button-get-now',
					onTap: function (e) {
						localStorage.setItem("IVLEtoken", 'null');
						console.log('logged out');
						ionic.Platform.exitApp();
					}
				}
				]
			});
		};
  	})

	.controller('LoginCtrl', function($scope, $state, User, $window, $cordovaInAppBrowser, $rootScope){
		
		console.log(localStorage.getItem("IVLEtoken"));
			
		if(localStorage.getItem("IVLEtoken") !== 'null'){
			console.log('login1');			
			User.setToken(localStorage.getItem("IVLEtoken"));
			console.log(localStorage.getItem("IVLEtoken"));
			$state.go('loggedIn');
		}

		else{
			console.log('login');
			$scope.loginWithIVLE = function(){

				
				var link = 'https://ivle.nus.edu.sg/api/login/?apikey=JWE5l4plZpPkhqENrgaVx&url=http://localhost:8100/';
	 			
	 			
	 			 
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
							localStorage.setItem("IVLEtoken", $scope.token);
							$state.go('loggedIn');
						}
	 				});
			      })
			      .catch(function(event) {
			       	console.log('no');
			     });
			     


			     
			    /* 
		     var win = window.open(link);	
  			
  			var interval = setInterval(function(){
  				console.log(win.location.href);
  				if(win.location.href.indexOf('token=')!=-1){  					
  					win.close();
  					$scope.token = (win.location.href.split('=')[1]).split('#')[0];
					console.log($scope.token);
					User.setToken($scope.token);
					localStorage.setItem("IVLEtoken", $scope.token);
					$state.go('loggedIn');
					clearInterval(interval);
  				}	
  			},1000);
			*/
			
			  };
			}

	})

	.controller('LoggedInCtrl', function($scope, $state, $http, User, ModuleService, Firebase){

		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/UserName_Get?APIKey=JWE5l4plZpPkhqENrgaVx&Token='+User.getToken(), { cache: true })
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

		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/UserId_Get?APIKey=JWE5l4plZpPkhqENrgaVx&Token='+User.getToken(), { cache: true })
			.then(function(result){
				console.log(result);
				User.setUserId(result.data);
			});	

		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/Modules_Staff?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&Duration=0&IncludeAllInfo=false', { cache: false })
			.then(function(result){
				console.log(result);
				ModuleService.setStaffModules(result.data.Results);
			});

		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/Modules_Student?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&Duration=0&IncludeAllInfo=false', { cache: false })
			.then(function(result){
				console.log(result);
				ModuleService.setStudentModules(result.data.Results);
				$state.go('NUSTalk.home');
			});	
	}) 

	.controller('HomeController', function($scope, User, $http, ModuleService, $state, ChatService){
		
	     $scope.userName = User.getUserName();
	     console.log($scope.userName);

	   	 $scope.studentModules = ModuleService.getStudentModules();
	   	 console.log($scope.studentModules);

	   	 $scope.staffModules = ModuleService.getStaffModules();
	   	 console.log($scope.staffModules);

	   	 $scope.setCurrentModule = function(data){
	   	 	ModuleService.setCurrentModule(data);
	   	 	console.log(data.CourseCode);
	   	 }

	   	 $scope.BOT = {
	   	 	Name: "NUSBot"
	   	 }
	   	 $scope.goToChat = function(){
	   	 		ChatService.setOtherUser($scope.BOT);
		 		$state.go('NUSTalk.chatDetails');
	   	 }
	})

	.controller('ModuleController', function($scope, ModuleService, $ionicModal, $http, User, ChatService, $state, $ionicScrollDelegate, Firebase){

		$scope.$on('$ionicView.enter', function (e) {
			$scope.refresh();
		});

		$scope.refresh = function(){
			$http.get('https://ivle.nus.edu.sg/api/DisplayPhoto.ashx?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID=8e9dafa6-b9a1-4a98-801f-1bf8321cca5b&UserID=dcstantc', { cache: false })
			.then(function(result){
					console.log(result);
			});
			
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

			var UserRef = firebase.database().ref('Users/users/'+ User.getUserName() +'/' + ModuleService.getCurrentModule().CourseCode + '/Chats');
			
			UserRef.on('child_added', function(data) {
				console.log('chat started with '+ data.val().Name);
				var messagesRef = firebase.database().ref('Users/users/'+ User.getUserName() +'/' + ModuleService.getCurrentModule().CourseCode + '/Chats/'+ data.val().Name);

				messagesRef.limitToLast(2).on("child_added", function (snapshot) {
	        		if(snapshot.key != "Name"){
	        			$scope.last = snapshot.val().message;
	        			console.log($scope.last);
	        		}	
	        	});
	        		
				$scope.chats.unshift(
					{Name: data.val().Name,
					lastText: $scope.last}
					//face: './img/default-user.png'}
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
		    $scope.$broadcast('scroll.refreshComplete');
		}
	})

	.controller('ChatDetailsController', function($scope, $state, ChatService, Firebase, User, $ionicScrollDelegate, $timeout, $rootScope, ModuleService, $cordovaImagePicker){

		$scope.inputMessage = {};

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

			if(ChatService.getOtherUser().Name != 'NUSBot'){

				UserRef.child('users').child(ChatService.getOtherUser().Name).child(ModuleService.getCurrentModule().CourseCode).child('Chats').child(User.getUserName()).child('Name').set(User.getUserName());
				UserRef.child('users').child(ChatService.getOtherUser().Name).child(ModuleService.getCurrentModule().CourseCode).child('Chats').child(User.getUserName()).push(data);

				UserRef.child('users').child(User.getUserName()).child(ModuleService.getCurrentModule().CourseCode).child('Chats').child(ChatService.getOtherUser().Name).child('Name').set(ChatService.getOtherUser().Name);
				UserRef.child('users').child(User.getUserName()).child(ModuleService.getCurrentModule().CourseCode).child('Chats').child(ChatService.getOtherUser().Name).push(data);
			}
			else{
				UserRef.child('users').child('BOT').child(User.getUserName()).push(data);
				UserRef.child('users').child(User.getUserName()).child('NUSBot').push(data);
			}	
			$scope.inputMessage = {};

		}	


		$scope.messages = [];

		if(ChatService.getOtherUser().Name != 'NUSBot'){
			var messagesRef = firebase.database().ref('Users/users/'+ User.getUserName() +'/' + ModuleService.getCurrentModule().CourseCode + '/Chats/'+ ChatService.getOtherUser().Name);
			
			messagesRef.on('child_added', function(data) {
				console.log('new message'+ data.val().message);
				if(data.key != 'Name'){
					$scope.messages.push(data.val());	
					$timeout(function() {
	    			$ionicScrollDelegate.scrollBottom();
		  			});
				}
			});
		}
		else{
			var messagesRef = firebase.database().ref('Users/users/'+ User.getUserName() +'/NUSBot');
			
			messagesRef.on('child_added', function(data) {
				console.log('new message'+ data.val().message);
				if(data.key != 'Name'){
					$scope.messages.push(data.val());	
					$timeout(function(){
	    				$ionicScrollDelegate.scrollBottom();
		  			});
				}
			});
		}

		$scope.sendImages = function(){
			 
			 //var storageRef = firebase.storage().ref();
			 //var imgRef = storageRef.child('images');
			 var options = {
			   maximumImagesCount: 1,
			   width: 800,
			   height: 800,
			   quality: 80
			  };

			  $cordovaImagePicker.getPictures(options)
			    .then(function (result) {
			    	;
			    }, function(error) {
			      // error getting photos
			    });
			};

	});
	
