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
				User.setUserName(result.data);
		});	

		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/UserId_Get?APIKey=JWE5l4plZpPkhqENrgaVx&Token='+User.getToken(), { cache: true })
			.then(function(result){
				console.log(result);
				
				var UserRef = firebase.database().ref('users');

				var flag = 0;
				UserRef.once('value', function(snapshot) {
 				 snapshot.forEach(function(childSnapshot) {
 				   	var childData = childSnapshot.val();
 				   	console.log(childSnapshot.key);
 				   	if(childSnapshot.key == result.data){
 				   		console.log('same');
 				   		flag = 1;
 				   	}	
 				 });
 				 	if(flag == 0){
 						console.log('pushing');
 						UserRef.child(result.data).set({
 							Name: User.getUserName()
 						});
				  }
 				});
				
				User.setUserId(result.data);
		});
		
		$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/Modules?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&Duration=0&IncludeAllInfo=false', { cache: false })
			.then(function(result){
				console.log(result);
				ModuleService.setModules(result.data.Results);
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

	.controller('HomeController', function($scope, User, $http, ModuleService, $state, ChatService, $ionicModal){
		
	     $scope.showSearch = false;
	     $scope.searched = false;

	     $scope.userName = User.getUserName();
	     console.log($scope.userName);

	     $scope.modules = ModuleService.getModules();
	   	 console.log($scope.modules);

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

	   	 $scope.search = function(){
	   	 	console.log('search');
	   	 	$scope.searched = false;
	   	 	$scope.showSearch = !$scope.showSearch;
	   	 }

	   	$scope.find = function(data){
	  		console.log(data);
	  		data = data.toUpperCase();
	  		$scope.searched = true;	
	  		$scope.searchedModules = [];

	  		for(var i=0 ; i < $scope.modules.length; ++i){
	  			var module = $scope.modules[i];
	  			console.log(module.CourseCode + " " + data);
	  			if(module.CourseCode.indexOf(data)!=-1)
	  				$scope.searchedModules.push(module);
	  		}
	  		console.log($scope.searchedModules);
	  	}
	})

	.controller('ModuleController', function($scope, ModuleService, $ionicModal, $http, User, ChatService, $state, $ionicScrollDelegate, $ionicPopup, Firebase, GroupService, IonicClosePopupService){

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
			$ionicModal.fromTemplateUrl('templates/modal-newGroupChat.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				$scope.newGroupChatModal = modal;
			});
			$ionicModal.fromTemplateUrl('templates/modal-setGroupName.html', {
				scope: $scope,
				animation: 'slide-in-right'
			}).then(function (modal) {
				$scope.setGroupModal = modal;
			});

			$scope.chats = []; 

			var ChatsRef = firebase.database().ref('users/' + User.getUserId() + '/threads').orderByChild('lastTextTime');
			
			ChatsRef.on('child_added', function(data) {
				console.log('chat: '+ data.key);
				$scope.chats.unshift(
					{ 'Name': data.val().Name,
					  'UserID': data.val().UserID || "",	
					  'lastText': data.val().lastText.message || "Send a message...",
					  'threadID': data.key,
					  'type': data.val().type }
					//face: './img/default-user.png'}
				);	
			});

			//go from module page
			$scope.goToChat = function(other){
				ChatService.setCurrentThread(other.threadID);
				if(other.type == 2){
					GroupService.setName(other.Name);
					console.log(GroupService.getName());
					$state.go('NUSTalk.groupChatDetails');
				}
				else{
			 		ChatService.setOtherUser(other);
			 		$state.go('NUSTalk.chatDetails');
			 	}
			};


			$scope.contacts = [];
			
			$scope.newChat = function(){

				ChatService.setCurrentThread("");

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

					$scope.contacts = $scope.contacts.concat($scope.lecturers.list.concat($scope.tutors.list));

				});

				$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/Class_Roster?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID, { cache: false })
					.then(function(result){
						console.log(result);

						$scope.classRoster = {
							show: false,
							list: result.data.Results
						}
						$scope.contacts = $scope.contacts.concat($scope.classRoster.list);
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
					$scope.contacts = $scope.contacts.concat($scope.classRoster.list);
				});	
				*/
				var myPopup = $ionicPopup.show({
					templateUrl: 'templates/popup-chooseChat.html',
					title: 'Choose Chat Type',
					scope: $scope
				});

				IonicClosePopupService.register(myPopup);

				$scope.chatType = function(choice){
					if(choice === 'p'){
						console.log('new private chat');
						myPopup.close();
						$scope.searchItem = "";
						$scope.newChatModal.show().then(function(){
							$scope.toggleQuery = function(query) {
						    	query.show = !query.show;
						 	};
							$scope.isQueryShown = function(query) {
						    	return query.show;
						 	};
						});
					}
					else{
						console.log('new group chat');
						myPopup.close();	
						$scope.searchItem = "";
						$scope.members = [];
						$scope.showMembers = "";
						$scope.group = {};
						$scope.newGroupChatModal.show().then(function(){
							$scope.toggleQuery = function(query) {
						    	query.show = !query.show;
						 	};
							$scope.isQueryShown = function(query) {
						    	return query.show;
						 	};
						 	$scope.toggleSelection = function(data){
						 		if ($scope.members.indexOf(data) == -1) {
						 			$scope.members.push(data);
						 			if($scope.showMembers != "")
						 				$scope.showMembers +=  ', ' + (data.Name || data.User.Name); 
						 			else
						 				$scope.showMembers += data.Name || data.User.Name;	
						 		}
						 		else {
						 			var index = $scope.members.indexOf(data);
						 			if(index == 0 && $scope.members.length>1 )
						 				$scope.showMembers = $scope.showMembers.replace((data.Name || data.User.Name)+", ", "");
						 			else if($scope.members.length == 1)
						 				$scope.showMembers = $scope.showMembers.replace((data.Name || data.User.Name), "");
						 			else
						 				$scope.showMembers = $scope.showMembers.replace(", " + (data.Name || data.User.Name), "");
						 			$scope.members.splice(index, 1);
						 		}
						 		console.log($scope.showMembers);
						 	}
						 	$scope.next = function(){
						 		GroupService.setMembers($scope.members);
						 		console.log('members', GroupService.getMembers());
						 		$scope.newGroupChatModal.hide();
						 		$scope.setGroupModal.show();	
						 	}
						 	$scope.done = function(){
						 		var mem=[];
						 		for(var i=0;i<$scope.members.length;++i)
						 			mem.push($scope.members[i].UserID || $scope.members[i].User.UserID);	
						 		mem.push(User.getUserId());
						 		GroupService.setName($scope.group.groupName);
						 		GroupService.setMembers(mem);
						 		$scope.setGroupModal.hide();		
						 		$state.go('NUSTalk.groupChatDetails');	
						 	}
						 	$scope.tutorialGroupChat = function(){
						 		
						 	}
						});
					}
				}
			
				$scope.closeSetGroupModal = function(){
		     		$scope.setGroupModal.hide();
		    	}

			 	$scope.goToChat = function(other){
			 		ChatService.setOtherUser(other);
			 		$scope.newChatModal.hide();
			 		$state.go('NUSTalk.chatDetails');
			 	};

			 	$scope.groupChat = function(group){
			 		if(group == null){
			 			console.log('Tutorial Group Chat');
			 		}
			 		$scope.newChatModal.hide();
			 		$state.go('NUSTalk.groupChatDetails');
			 	};

			 	$scope.closeNewChatModal = function(){
			     	$scope.newChatModal.hide();
			    }

				$scope.closeNewGroupChatModal = function(){
			     	$scope.newGroupChatModal.hide();
			    }

			    $scope.showSearch = false;
		     	$scope.searched = false;
			  	
			  	$scope.search = function(){
			   	 	console.log('search');
			   	 	$scope.searchItem = "";
			   	 	$scope.searched = false;
			   	 	$scope.showSearch = !$scope.showSearch;
			   	 }

			   	$scope.find = function(data){
			  		console.log(data);
			  		data = data.toLowerCase();
			  		$scope.searched = true;	
			  		$scope.searchedContacts = [];

			  		for(var i=0 ; i < $scope.contacts.length; ++i){
			  			var contact = $scope.contacts[i];
			  			if((contact.Name != null && contact.Name.toLowerCase().indexOf(data)!=-1) || (contact.User != null && contact.User.Name.toLowerCase().indexOf(data)!=-1)){
			  				console.log(contact);
			  				$scope.searchedContacts.push(contact);
			  			}
			  		}
			  		console.log($scope.searchedContacts);
			  	}
			};

		    $scope.searchChat = "";

		   	$scope.findChat = function(data){
		  		console.log(data);
		  		data = data.toLowerCase();	
		  		$scope.searchedChats = [];

		  		for(var i=0 ; i < $scope.chats.length; ++i){
		  			var chat = $scope.chats[i];
		  			console.log(chat.Name + " " + data);
		  			if(chat.Name.toLowerCase().indexOf(data)!=-1)
		  				$scope.searchedChats.push(chat);
		  		}
		  		console.log($scope.searchedChats);
		  	}
		  	$scope.$broadcast('scroll.refreshComplete');
		 };
	})

	.controller('ChatDetailsController', function($scope, $state, ChatService, Firebase, User, $ionicScrollDelegate, $timeout, $rootScope, ModuleService, $cordovaImagePicker){

		$scope.inputMessage = {};

		$timeout(function() {
    		$ionicScrollDelegate.scrollBottom();
  		});

		$scope.otherUser = ChatService.getOtherUser(); 

		$scope.currentThread = ChatService.getCurrentThread();
		
		$scope.threadsRef = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode);
		$scope.userRef = firebase.database().ref('users/' + User.getUserId());

		if($scope.currentThread == ""){
			console.log('New chat');
			$scope.threadsRef.push({
				'name': "",
				'members':[
					User.getUserId(),
					ChatService.getOtherUser().UserID || ChatService.getOtherUser().User.UserID]	
			})
			$scope.threadsRef.limitToLast(1).on("child_added", function(childSnapshot){
			console.log(childSnapshot.key);
			$scope.currentThread = childSnapshot.key;
			$scope.userRef.child('threads').child($scope.currentThread).set({
				'Name': ChatService.getOtherUser().Name || ChatService.getOtherUser().User.Name,
				'UserID': ChatService.getOtherUser().UserID || ChatService.getOtherUser().User.UserID,
				'lastText': "",
				'lastTextTime': new Date().getTime(),
				'type': 1
				});
			});
		}

		$scope.messages = [];

		$scope.messagesRef = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode + '/' + $scope.currentThread + '/messages');
			
			$scope.messagesRef.on('child_added', function(data) {
				console.log('new message'+ data.val().message);
				$scope.messages.push(data.val());	
				$timeout(function() {
	    			$ionicScrollDelegate.scrollBottom();
		  		});
			});
		

		$scope.sendMessage = function(msg){

			//$ionicScrollDelegate.scrollBottom(true);
			var data = {
				sender: User.getUserId(),
				message: msg,
				time: new Date().getTime()
			};

			console.log(data);			
			console.log($scope.currentThread);
			$scope.threadsRef.child($scope.currentThread).child('messages').push(data);
			$scope.userRef.child('threads').child($scope.currentThread).child('lastText').set(data);
			$scope.userRef.child('threads').child($scope.currentThread).child('lastTextTime').set(data.time);				
			$scope.inputMessage = {};
		};


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

	})
	
	.controller('GroupChatDetailsController', function($scope, $state, ChatService, Firebase, User, $ionicScrollDelegate, $timeout, $rootScope, ModuleService, $cordovaImagePicker, GroupService){

		$scope.inputMessage = {};
		$scope.group = GroupService.getGroup();
		$scope.user = User.getUserId();

		$timeout(function() {
    		$ionicScrollDelegate.scrollBottom();
  		});

		$scope.currentThread = ChatService.getCurrentThread();
		
		$scope.threadsRef = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode);
		$scope.userRef = firebase.database().ref('users/' + User.getUserId());

		if($scope.currentThread == ""){
			console.log('New chat');
			$scope.threadsRef.push({
				'name': $scope.group.name,
				'members': $scope.group.members
			})
			$scope.threadsRef.limitToLast(1).on("child_added", function(childSnapshot){
				console.log(childSnapshot.key);
				$scope.currentThread = childSnapshot.key;
				$scope.userRef.child('threads').child($scope.currentThread).set({
					'Name': $scope.group.name,
					'lastText': "",
					'lastTextTime': new Date().getTime(),
					'type': 2
				});
			});
		}

		console.log($scope.group.name, $scope.group.members);
		$scope.messages = [];

			$scope.messagesRef = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode + '/' + $scope.currentThread + '/messages');
			
			$scope.messagesRef.on('child_added', function(data) {
				console.log('new message'+ data.val().message);
				$scope.messages.push(data.val());	
				$timeout(function() {
	    			$ionicScrollDelegate.scrollBottom();
		  		});
			});
		

			$scope.sendMessage = function(msg){

				//$ionicScrollDelegate.scrollBottom(true);
				var data = {
					sender: User.getUserId(),
					message: msg,
					time: new Date().getTime()
				};

				console.log(data);			
				console.log($scope.currentThread);
				$scope.threadsRef.child($scope.currentThread).child('messages').push(data);
				$scope.userRef.child('threads').child($scope.currentThread).child('lastText').set(data);				
				$scope.inputMessage = {};
			};

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

	})
	
	
