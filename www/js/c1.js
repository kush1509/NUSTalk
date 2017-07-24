angular.module('NUSTalk.controllers',['firebase'])

	
	.controller('AppController', function($scope, $state, $ionicModal, Firebase, User, $ionicPopup, $rootScope, $ionicPush) {
    	
		$scope.Username = User.getUserName();
		$scope.UserId = User.getUserId();
		$rootScope.DP = User.getIcon() || './img/default-user.png';
		$rootScope.APItoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZGY4Y2U2ZC0zNzFiLTQ1ODUtYjFkMy0xNGM5MjFjNWQwYTgifQ.w44N5dPyw3AWaDy0XCHNBIxwxO14DX8mhPylKK2ra9Q";

		$scope.imageShow = function(imageSrc){
			PhotoViewer.show(imageSrc);
		}

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
						localStorage.removeItem("IVLEtoken");
						console.log('logged out');
						$ionicPush.unregister()
						ionic.Platform.exitApp();
					}
				}
				]
			});
		};
  	})

	.controller('LoginCtrl', function($scope, $state, User, $window, $cordovaInAppBrowser, $rootScope){
		
		console.log(localStorage.getItem("IVLEtoken"), typeof localStorage.getItem("IVLEtoken"));
			
		if(localStorage.getItem("IVLEtoken") !== null){
			console.log('login1');			
			User.setToken(localStorage.getItem("IVLEtoken"));
			console.log(localStorage.getItem("IVLEtoken"));
			$state.go('loggedIn');
		}

		else{
			console.log('login');
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
							localStorage.setItem("IVLEtoken", $scope.token);
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
					localStorage.setItem("IVLEtoken", $scope.token);
					$state.go('loggedIn');
					clearInterval(interval);
  				}	
  			},1000);
				
			
			  };
			}

	})

	.controller('LoggedInCtrl', function($scope, $state, $http, User, $ionicLoading ,ModuleService, Firebase, $rootScope, $ionicPush, BotService){

		$ionicLoading.show({
			template: '<ion-spinner icon="ios-small" class="spinner-calm"></ion-spinner><p>Logging In</p>',
			animation: 'fade-in',
			showBackdrop: true,
			showDelay: 0
		});

		/*
		$ionicPush.register().then(function(t) {
		  return $ionicPush.saveToken(t);
		}).then(function(t) {
			$rootScope.pushToken = t.token;
		  console.log('Token saved:', t.token);
		  */

			$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/UserName_Get?APIKey=JWE5l4plZpPkhqENrgaVx&Token='+User.getToken(), { cache: true })
				.then(function(result){
					console.log(result);
					User.setUserName(result.data);
			});

			$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/UserEmail_Get?APIKey=JWE5l4plZpPkhqENrgaVx&Token='+User.getToken(), { cache: true })
				.then(function(result){
					console.log(result);
					User.setEmail(result.data);
			});	

			$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/UserId_Get?APIKey=JWE5l4plZpPkhqENrgaVx&Token='+User.getToken(), { cache: true })
				.then(function(result){
					console.log(result);
					
					var UserRef = firebase.database().ref('users');
					var threadsRef = firebase.database().ref('threads');

					var flag = 0;
					UserRef.once('value', function(snapshot) {
	 				 snapshot.forEach(function(childSnapshot) {
	 				   	var childData = childSnapshot.val();
	 				   	console.log(childSnapshot.key);
	 				   	if(childSnapshot.key == result.data){
	 				   		console.log('same');
	 				   		flag = 1;
	 				   		UserRef.child(result.data).child('token').set($rootScope.pushToken);
	 				   	}	
	 				 });
	 				 	if(flag == 0){
	 						console.log('pushing');
	 						UserRef.child(result.data).set({
	 							'Name': User.getUserName(),
								'email': User.getEmail(),		 							
	 							'token': $rootScope.pushToken
	 						});
	 						$http({
								method: "POST",
								url: "https://directline.botframework.com/api/conversations",
								headers: {
							 	   'Authorization': 'Bearer SfB4DslT2ew.cwA.F64.3AfjhRhOOZsoXoONOYDquiVTSn0NUhDcuxNsYxqmAM8'
							 	}
							}).then(function(response){
								BotService.setToken(response.data.token);
								BotService.setConID(response.data.conversationId);
								threadsRef.child('BOT').child(result.data).child('conversationID').set(response.data.conversationId);
								threadsRef.child('BOT').child(result.data).child('watermark').set(0);
						   	 	console.log(response);
						   	 	$http({
									method: "POST",
									url: "https://directline.botframework.com/api/conversations/" + BotService.getConID() + "/messages",
									headers: {
								 	   'Authorization': 'Bearer ' + 'SfB4DslT2ew.cwA.F64.3AfjhRhOOZsoXoONOYDquiVTSn0NUhDcuxNsYxqmAM8'
								 	},
									data: {
									    'text': "ivle token is " + User.getToken(),
									    'from': User.getUserId() 
									},
								}).then(function(data){
									console.log('token sent', data);
								});
						   	});
					  	}
					  	else{	
							threadsRef.child('BOT').child(result.data).once('value', function(snapshot){
								BotService.setConID(snapshot.val().conversationID);	
							})
					  	}
	 				});
					User.setUserId(result.data);
					$scope.picRef = firebase.database().ref('users/'+ result.data +'/picture');
					$scope.picRef.once('value', function(snapshot){
						User.setIcon(snapshot.val());
						$rootScope.DP = snapshot.val() || './img/default-user.png';
						console.log('icon', snapshot.val());
					})
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

	.controller('HomeController', function($scope, $ionicLoading, User, $http, ModuleService, $state, ChatService, $ionicModal, $rootScope){
			
		 $ionicLoading.hide();	
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
	   	 		//ChatService.setOtherUser($scope.BOT);
		 		$state.go('NUSTalk.bot');
	   	 }

	   	 $scope.search = function(){
	   	 	$scope.searchItem = {};
	   	 	console.log('search');
	   	 	$scope.searched = false;
	   	 	$scope.showSearch = !$scope.showSearch;
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

			var ChatsRef = firebase.database().ref('users/' + User.getUserId() + '/threads/' + $scope.currentModule.CourseCode).orderByChild('lastTextTime');
			
			ChatsRef.on('child_added', function(data) {
				console.log('chat: '+ data.key);
					$scope.picRef = firebase.database().ref('users/'+data.val().UserID+'/picture');
					$scope.picRef.once('value', function(snapshot){
						$scope.icon = snapshot.val();
						console.log('icon', snapshot.val());
						if(data.val.type == 1)
							firebase.database().ref('users/' + User.getUserId()).child('threads').child(ModuleService.getCurrentModule().CourseCode).child(data.key).child('icon').set($scope.icon);
					}).then(function(){
						$scope.chats.unshift(
						{ 'Name': data.val().Name,
						  'UserID': data.val().UserID || "",	
						  'lastText': data.val().lastText.message || (data.val().lastText.imageUrl?"Image":"Send a message..."),
						  'threadID': data.key,
						  'type': data.val().type,
						  'icon': $scope.icon || data.val().icon || './img/default-user.png'}
						);	
					}), function(error){
						$scope.chats.unshift(
						{ 'Name': data.val().Name,
						  'UserID': data.val().UserID || "",	
						  'lastText': data.val().lastText.message || (data.val().lastText.imageUrl?"Image":"Send a message..."),
						  'threadID': data.key,
						  'type': data.val().type,
						  'icon': data.val().icon || './img/default-user.png'}
						);	
					};
			});

			//go from module page
			$scope.goToChat = function(other){
				ChatService.setCurrentThread(other.threadID);
				if(other.type == 2){
					GroupService.setName(other.Name);
					GroupService.setIcon(other.icon);
					var ref = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode + '/' + other.threadID + '/members');
					ref.once('value', function(snapshot){
						GroupService.setMembers(snapshot.val());
						console.log(GroupService.getMembers());
						console.log(GroupService.getName());
						$state.go('NUSTalk.groupChatDetails');
					});	
				}
				else{
			 		ChatService.setOtherUser(other);
			 		$state.go('NUSTalk.chatDetails');
			 	}
			};


			$scope.contacts = [];
			
			$scope.newChat = function(){

				$scope.contacts = [];

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

				$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/GroupsByUserAndModule?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID+'&AcadYear=2016/2017&Semester=2', { cache: false })
				.then(function(result1){
					$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/Module_ClassGroupUsers?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&ClassGroupID='+result1.data.Results[0].ClassGroupID, { cache: false })
					.then(function(result2){
						console.log(result1.data.Results[4]);
						console.log(result2);

						$scope.tutorial = {
							show: false,
							list: result2.data.Results
						}
					});
				});	

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
						 		$scope.searchItem = {};
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
						 			mem.push({  UserID: $scope.members[i].UserID || $scope.members[i].User.UserID,
						 					    UserName: $scope.members[i].Name || $scope.members[i].User.Name});	
						 		mem.push({ 	UserID: User.getUserId(),
						 				    UserName: User.getUserName()});
						 		GroupService.setName($scope.group.groupName);
						 		GroupService.setMembers(mem);
						 		console.log($scope.members);
						 		$scope.setGroupModal.hide();		
						 		$state.go('NUSTalk.groupChatDetails');	
						 	}
						 	$scope.tutorialGroupChat = function(){
						 		$scope.members = [];
						 		for(var i=0;i<$scope.tutorial.list.length;++i)
						 			$scope.members.push($scope.tutorial.list[i]);
								$scope.next(); 
						 	}
						});
					}
				}
			
				$scope.closeSetGroupModal = function(){
		     		$scope.setGroupModal.hide();
		    	}

			 	$scope.goToChat1 = function(other){
			 		console.log(other.UserID || other.User.UserID);
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
		     	$scope.searchItem = {};
			  	
			  	$scope.search = function(){
			   	 	console.log('search');
			   	 	$scope.searchItem = {};
			   	 	$scope.searched = false;
			   	 	$scope.showSearch = !$scope.showSearch;
			   	 }

			};

		    $scope.searchChat = "";
		   	
		  	$scope.$broadcast('scroll.refreshComplete');
		 };
	})

	.controller('ChatDetailsController', function($scope, $http, $state, $rootScope, ChatService, Firebase, User, $ionicScrollDelegate, $timeout, $rootScope, ModuleService, $cordovaImagePicker, $ionicModal){

		$scope.inputMessage = {};

		$ionicModal.fromTemplateUrl('templates/modal-otherProfile.html', {
			scope: $scope,
			animation: 'slide-in-right',
			cache: false
		}).then(function (modal) {
			$scope.otherProfileModal = modal;
		});


		$scope.otherProfile =  function(){
			$scope.otherProfileModal.show();
		};

		$scope.closeOtherProfile =  function(){
			$scope.otherProfileModal.hide();
		};

		$timeout(function() {
    		$ionicScrollDelegate.scrollBottom();
  		});

		$scope.otherUser = ChatService.getOtherUser(); 
		$scope.otherUser.UserID = ChatService.getOtherUser().UserID || ChatService.getOtherUser().User.UserID;
		$scope.otherUser.Name = ChatService.getOtherUser().Name || ChatService.getOtherUser().User.Name;
		console.log($scope.otherUser.UserID);

		$scope.currentThread = ChatService.getCurrentThread();
		
		$scope.threadsRef = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode);
		$scope.userRef = firebase.database().ref('users/' + User.getUserId());
		$scope.userThreadsRef = firebase.database().ref('users/' + User.getUserId() + '/threads/' + ModuleService.getCurrentModule.CourseCode);
		$scope.otheruserRef = firebase.database().ref('users/' + $scope.otherUser.UserID);
		$scope.picRef = firebase.database().ref('users/'+ $scope.otherUser.UserID +'/picture');
		$scope.picRef.once('value', function(snapshot){
			$scope.icon = snapshot.val();
			console.log('icon', snapshot.val());
			$scope.pic = $scope.icon || './img/default-user.png'
			$scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('icon').set($scope.icon);
		});
		$scope.emRef = firebase.database().ref('users/'+ $scope.otherUser.UserID +'/email');
		$scope.emRef.once('value', function(snapshot){
			$scope.email = snapshot.val();
			console.log('email', snapshot.val());
		});

		$scope.flag = 0;
		if($scope.currentThread == ""){
			var arr = {};
			$scope.userThreadsRef.once('value', function(snapshot){
				snapshot.forEach(function(childSnapshot){
				console.log(childSnapshot.val());
				var thread = childSnapshot.val();
				var checkID = ChatService.getOtherUser().UserID || ChatService.getOtherUser().User.UserID;
				console.log(thread.UserID, checkID);
					if(thread.UserID && thread.UserID == checkID){
						$scope.currentThread = childSnapshot.key;
						$scope.flag = 1;
						console.log($scope.currentThread);
					}
				})	
			});

			if($scope.flag == 0){
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
					$scope.picRef.once('value', function(snapshot){
						$scope.icon = snapshot.val();
						console.log('icon', snapshot.val());
					}).then(function(){
						$scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).set({
							'Name': ChatService.getOtherUser().Name || ChatService.getOtherUser().User.Name,
							'UserID': ChatService.getOtherUser().UserID || ChatService.getOtherUser().User.UserID,
							'lastText': "",
							'lastTextTime': new Date().getTime(),
							'type': 1,
							'icon': $scope.icon || null
							});
						$scope.otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).set({
							'Name': User.getUserName(),
							'UserID': User.getUserId(),
							'lastText': "",
							'lastTextTime': new Date().getTime(),
							'type': 1,
							'icon': User.getIcon()  
							});
					});
				});
			}	
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
			var currentTime = new Date();
			var data = {
				sender: User.getUserId(),
				message: msg,
				time: ("0" + currentTime.getHours()).slice(-2) + ':' + ("0" + currentTime.getMinutes()).slice(-2)
			};

			console.log(data);			
			console.log($scope.currentThread);
			$scope.threadsRef.child($scope.currentThread).child('messages').push(data);
			$scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastText').set(data);
			$scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastTextTime').set(data.time);
			$scope.otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastText').set(data);
			$scope.otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastTextTime').set(data.time);		
			$scope.otheruserRef.child('token').once('value', function(snapshot){
				var otherToken = snapshot.val();
				console.log('otherToken', otherToken);
				$http({
					method: "POST",
					url: "https://api.ionic.io/push/notifications",
					headers: {
				 	   'Authorization': 'Bearer ' + $rootScope.APItoken
				 	},
					data: {
					    "tokens": [otherToken],
					    "profile": "dev",
					    "notification": {
					        "message": data.message,
					        "android": {
					            "title": User.getUserName(),
					            "image": User.getIcon() || './img/default-user.png'
					        }
					    }
					},
				}).then(function(data){
			   	 	console.log(data);
			   	 });
		   	 });	
			$scope.inputMessage = {};
		};


		$scope.sendImages = function(){
			 
			 var storageRef = firebase.storage().ref();
			 var options = {
			   maximumImagesCount: 1,
			   width: 800,
			   height: 800,
			   quality: 80
			  };

			  $cordovaImagePicker.getPictures(options)
			    .then(function (imageData) {
			    	console.log(imageData);
				    var getFileBlob = function(url, cb) {
				        var xhr = new XMLHttpRequest();
				        xhr.open("GET", url);
				        xhr.responseType = "blob";
				        xhr.addEventListener('load', function() {
				            cb(xhr.response);
				        });
				        xhr.send();
				    };

				    var blobToFile = function(blob, name) {
				        blob.lastModifiedDate = new Date();
				        blob.name = name;
				        return blob;
				    };

				    var getFileObject = function(filePathOrUrl, cb) {
				        getFileBlob(filePathOrUrl, function(blob) {
				            cb(blobToFile(blob, 'test.jpg'));
				        });
				    };

				    getFileObject(imageData, function(fileObject) {
				        var uploadTask = storageRef.child('images/'+imageData[0].substring(imageData[0].indexOf('cache')+6)).put(fileObject);

				        uploadTask.on('state_changed', function(snapshot) {
				            console.log(snapshot);
				        }, function(error) {
				            console.log(error);
				        }, function() {
				            var downloadURL = uploadTask.snapshot.downloadURL;
				            console.log(downloadURL);
				            // handle image here
				           var currentTime = new Date();
				           var data = {
							sender: User.getUserId(),
							imageUrl: downloadURL,
							time: ("0" + currentTime.getHours()).slice(-2) + ':' + ("0" + currentTime.getMinutes()).slice(-2)
						};

						console.log(data);			
						console.log($scope.currentThread);
						$scope.threadsRef.child($scope.currentThread).child('messages').push(data);
						$scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastText').set(data);
						$scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastTextTime').set(data.time);
						$scope.otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastText').set(data);
						$scope.otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastTextTime').set(data.time);				
						$scope.otheruserRef.child('token').once('value', function(snapshot){
							var otherToken = snapshot.val();
							console.log('otherToken', otherToken);
							$http({
								method: "POST",
								url: "https://api.ionic.io/push/notifications",
								headers: {
							 	   'Authorization': 'Bearer ' + $rootScope.APItoken
							 	},
								data: {
								    "tokens": [otherToken],
								    "profile": "dev",
								    "notification": {
								        "message": "Image",
								        "android": {
								            "title": User.getUserName(),
								            "image": User.getIcon() || './img/default-user.png'
								        }
								    }
								},
							}).then(function(data){
						   	 	console.log(data);
						   	 });
					   	 });
						$scope.inputMessage = {};
				        });
				    });
			    }, function(error) {
			      	console.log('error getting photos');
			    });
			};
		$scope.imageShow = function(imageSrc){
			 PhotoViewer.show(imageSrc);
		}

	})
	
	.controller('GroupChatDetailsController', function($scope, $http, $state, ChatService, Firebase, User, $ionicScrollDelegate, $timeout, $rootScope, ModuleService, $cordovaImagePicker, GroupService, $ionicModal){

		
		$scope.inputMessage = {};
		$scope.group = GroupService.getGroup();
		$scope.user = User.getUserId();
		$scope.userName = User.getUserName();
		$scope.members = GroupService.getMembers();
		$scope.currentThread = ChatService.getCurrentThread();
		$scope.threadsRef = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode);
		$scope.userRef = firebase.database().ref('users/' + User.getUserId());
		$scope.currentModule = ModuleService.getCurrentModule();
		$scope.imageUrl = GroupService.getIcon() || './img/default-user.png';
		
		$ionicModal.fromTemplateUrl('templates/modal-otherProfile.html', {
			scope: $scope,
			animation: 'slide-in-right',
			cache: false
		}).then(function (modal) {
			$scope.otherProfileModal = modal;
		});

		$scope.otherUser = {};

		$scope.otherProfile =  function(member){
			$scope.picRef = firebase.database().ref('users/'+ member.UserID +'/picture');
			$scope.picRef.once('value', function(snapshot){
				var icon = snapshot.val();
				console.log('icon', snapshot.val());
				$scope.pic = icon || './img/default-user.png';
			}).then(function(){
				$scope.otherProfileModal.show();
				$scope.otherUser.Name = member.UserName;
				$scope.otherUser.UserID = member.UserID;
			});
		};

		$scope.closeOtherProfile =  function(){
			console.log('back');
			$scope.otherProfileModal.hide();
		};

		$ionicModal.fromTemplateUrl('templates/modal-groupInfo.html', {
			scope: $scope,
			animation: 'slide-in-right',
			cache: false
		}).then(function (modal) {
			$scope.groupInfoModal = modal;
		});
		$ionicModal.fromTemplateUrl('templates/modal-addMember.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.addMemberModal = modal;
		});
		$scope.groupInfo = function(){
			console.log('groupInfo');
			$scope.groupInfoModal.show();
			$scope.edit = false;
		}
		
		$scope.closeGroupInfo = function(){
			$scope.groupInfoModal.hide();
		}

		$scope.editt = function(){
			$scope.edit = !$scope.edit;
		}

		$scope.setName = function(name){
			GroupService.setName(name);
			$scope.threadsRef.child($scope.currentThread).child('name').set(name);
			for(var i = 0; i < $scope.group.members.length; ++i ){
					var otheruserRef =  firebase.database().ref('users/' + $scope.group.members[i].UserID);
					otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('Name').set(name);
				}	
			$scope.editt();
		}

		$scope.addMember = function(){
			$scope.contacts = [];
			$http.get('https://ivle.nus.edu.sg/api/Lapi.svc/Module_Lecturers?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID+'&Duration=0', { cache: false })
			.then(function(result){
				$scope.moduleFacils = JSON.parse(JSON.stringify(result.data.Results));
				console.log($scope.moduleFacils);

				$scope.lecturers = {show:false, list:[]};
				$scope.tutors = {show:false, list:[]};

				for (var i = 0; i < $scope.moduleFacils.length; i++) {
					if(($scope.moduleFacils[i].Role).indexOf('Lecturer')!=-1 && $scope.notMember($scope.moduleFacils[i]))
						$scope.lecturers.list.push($scope.moduleFacils[i]);	
					else if($scope.notMember($scope.moduleFacils[i]))
						$scope.tutors.list.push($scope.moduleFacils[i]);
				};

				$scope.contacts = $scope.contacts.concat($scope.lecturers.list.concat($scope.tutors.list));

			});

			$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/Class_Roster?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID, { cache: false })
				.then(function(result){
					console.log(result);

					$scope.classRoster = {
						show: false,
						list: []
					}
					for (var i = 0; i < result.data.Results.length; i++) {
						if($scope.notMember(result.data.Results[i]))
							$scope.classRoster.list.push(result.data.Results[i]);	
					}

					$scope.contacts = $scope.contacts.concat($scope.classRoster.list);
			});

			$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/GroupsByUserAndModule?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&CourseID='+$scope.currentModule.ID+'&AcadYear=2016/2017&Semester=2', { cache: false })
			.then(function(result1){
				$http.get('https://ivle.nus.edu.sg/API/Lapi.svc/Module_ClassGroupUsers?APIKey=JWE5l4plZpPkhqENrgaVx&AuthToken='+User.getToken()+'&ClassGroupID='+result1.data.Results[0].ClassGroupID, { cache: false })
				.then(function(result2){
					console.log(result1.data.Results[4]);
					console.log(result2);

					$scope.tutorial = {
						show: false,
						list: []
					}

					for (var i = 0; i < result2.data.Results.length; i++) {
						if($scope.notMember(result2.data.Results[i]))
							$scope.tutorial.list.push(result2.data.Results[i]);	
					}

					$scope.addMemberModal.show().then(function(){
						$scope.toggleQuery = function(query) {
					    	query.show = !query.show;
					 	}
						$scope.isQueryShown = function(query) {
					    	return query.show;
					    }
					});
				});
			});

			$scope.notMember = function(data){
				console.log(data);
				var id = data.UserID;
				console.log(id);
				for(var i=0;i<$scope.members.length;++i){
					if($scope.members[i].UserID == id)
						return false;
				}	
				return true;
			}
		};

		$scope.addToChat = function(member){
			$scope.members.push({UserID: member.UserID || member.User.UserID, UserName: member.Name || member.User.Name});
			$scope.threadsRef.child($scope.currentThread).child('members').set($scope.members);
			var otheruserRef =  firebase.database().ref('users/' + $scope.members[$scope.members.length -1].UserID);
			otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).set({
				'Name': $scope.group.name,
				'lastText': "",
				'lastTextTime': new Date().getTime(),
				'type': 2
			});
			console.log(otheruserRef.Name);
			$scope.addMemberModal.hide().then(function(){
				window.plugins.toast.showShortBottom(
					otheruserRef.Name + ' Added', function (a) { }, function (b) { }
				);
			});
		}
		$scope.closeAddMemberModal = function(){
			$scope.addMemberModal.hide();
		}
		$scope.changePicture = function(){
			 var storageRef = firebase.storage().ref();
			 var options = {
			   maximumImagesCount: 1,
			   width: 800,
			   height: 800,
			   quality: 80
			 };


			  $cordovaImagePicker.getPictures(options)
			    .then(function (imageData) {
			    	console.log(imageData);
				    var getFileBlob = function(url, cb) {
				        var xhr = new XMLHttpRequest();
				        xhr.open("GET", url);
				        xhr.responseType = "blob";
				        xhr.addEventListener('load', function() {
				            cb(xhr.response);
				        });
				        xhr.send();
				    };

				    var blobToFile = function(blob, name) {
				        blob.lastModifiedDate = new Date();
				        blob.name = name;
				        return blob;
				    };

				    var getFileObject = function(filePathOrUrl, cb) {
				        getFileBlob(filePathOrUrl, function(blob) {
				            cb(blobToFile(blob, 'test.jpg'));
				        });
				    };

				    getFileObject(imageData, function(fileObject) {
				        var uploadTask = storageRef.child('images/'+imageData[0].substring(imageData[0].indexOf('cache')+6)).put(fileObject);

				        uploadTask.on('state_changed', function(snapshot) {
				            console.log(snapshot);
				        }, function(error) {
				            console.log(error);
				        }, function() {
				            var downloadURL = uploadTask.snapshot.downloadURL;
				            console.log(downloadURL);
				            $scope.imageUrl = downloadURL;
				            GroupService.setIcon(downloadURL);
				            window.plugins.toast.showLongBottom('Group Photo Changed', function(a){console.log('toast success: ' + a); $scope.imageShow(downloadURL);}, function(b){alert('toast error: ' + b)});
				            $scope.threadsRef.child($scope.currentThread).child('icon').set($scope.imageUrl);
				            $scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('icon').set($scope.imageUrl);
							for(var i = 0; i < $scope.group.members.length; ++i ){
								var otheruserRef =  firebase.database().ref('users/' + $scope.group.members[i].UserID);
								otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('icon').set($scope.imageUrl);
								console.log(otheruserRef.Name);
							}
				        });
				    });
			    }, function(error) {
			      	console.log('error getting photos');
			    });
			$scope.imageShow = function(imageSrc){
				 PhotoViewer.show(imageSrc);
			}	
		}	
		$timeout(function() {
    		$ionicScrollDelegate.scrollBottom();
  		});

		if($scope.currentThread == ""){

			console.log('New chat');
			$scope.threadsRef.push({
				'name': $scope.group.name,
				'members': $scope.group.members
			})
			$scope.threadsRef.limitToLast(1).on("child_added", function(childSnapshot){
				console.log(childSnapshot.key);
				$scope.currentThread = childSnapshot.key;
				$scope.userRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).set({
					'Name': $scope.group.name,
					'lastText': "",
					'lastTextTime': new Date().getTime(),
					'type': 2
				});
				for(var i = 0; i < $scope.group.members.length; ++i ){
					var otheruserRef =  firebase.database().ref('users/' + $scope.group.members[i].UserID);
					otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).set({
						'Name': $scope.group.name,
						'lastText': "",
						'lastTextTime': new Date().getTime(),
						'type': 2
					});
					console.log(otheruserRef.Name);
				}	
			});
		}

		console.log($scope.group.name, $scope.group.members);
		$scope.messages = [];

			$scope.messagesRef = firebase.database().ref('threads/' + ModuleService.getCurrentModule().CourseCode + '/' + $scope.currentThread + '/messages');
			
			$scope.messagesRef.on('child_added', function(data) {
				console.log('new message'+ (data.val().message || data.val().imageUrl));
				$scope.messages.push(data.val());	
				$timeout(function() {
	    			$ionicScrollDelegate.scrollBottom();
		  		});
			});
		

			$scope.sendMessage = function(msg){

				//$ionicScrollDelegate.scrollBottom(true);
				var currentTime = new Date();
				var data = {
					senderID: User.getUserId(),
					senderName: User.getUserName(),
					message: msg,
					time: ("0" + currentTime.getHours()).slice(-2) + ':' + ("0" + currentTime.getMinutes()).slice(-2)
			};

				console.log(data);			
				console.log($scope.currentThread);
				$scope.threadsRef.child($scope.currentThread).child('messages').push(data);
				for(var i = 0; i < $scope.group.members.length; ++i ){
					var otheruserRef =  firebase.database().ref('users/' + $scope.group.members[i].UserID);
					otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastText').set(data);
					otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastTextTime').set(data.time);
					if($scope.group.members[i].UserID != User.getUserId()){
						otheruserRef.child('token').once('value', function(snapshot){
							var otherToken = snapshot.val();
							console.log('otherToken', otherToken);
							$http({
								method: "POST",
								url: "https://api.ionic.io/push/notifications",
								headers: {
							 	   'Authorization': 'Bearer ' + $rootScope.APItoken
							 	},
								data: {
								    "tokens": [otherToken],
								    "profile": "dev",
								    "notification": {
								        "message": data.senderName + " : " + data.message,
								        "android": {
								            "title": GroupService.getName(),
								            "image": GroupService.getIcon() || './img/default-user.png'
								        }
								    }
								},
							}).then(function(data){
						   	 	console.log(data);
						   	 });
					   	 });
					}
				}
				$scope.inputMessage = {};
			};

		$scope.sendImages = function(){
			 
			 var storageRef = firebase.storage().ref();
			 var options = {
			   maximumImagesCount: 1,
			   width: 800,
			   height: 800,
			   quality: 80
			  };

			  $cordovaImagePicker.getPictures(options)
			    .then(function (imageData) {
			    	console.log(imageData);
				    var getFileBlob = function(url, cb) {
				        var xhr = new XMLHttpRequest();
				        xhr.open("GET", url);
				        xhr.responseType = "blob";
				        xhr.addEventListener('load', function() {
				            cb(xhr.response);
				        });
				        xhr.send();
				    };

				    var blobToFile = function(blob, name) {
				        blob.lastModifiedDate = new Date();
				        blob.name = name;
				        return blob;
				    };

				    var getFileObject = function(filePathOrUrl, cb) {
				        getFileBlob(filePathOrUrl, function(blob) {
				            cb(blobToFile(blob, 'test.jpg'));
				        });
				    };

				    getFileObject(imageData, function(fileObject) {
				        var uploadTask = storageRef.child('images/'+imageData[0].substring(imageData[0].indexOf('cache')+6)).put(fileObject);

				        uploadTask.on('state_changed', function(snapshot) {
				            console.log(snapshot);
				        }, function(error) {
				            console.log(error);
				        }, function() {
				            var downloadURL = uploadTask.snapshot.downloadURL;
				            console.log(downloadURL);
				            // handle image here
				            var currentTime = new Date();
				            var data = {
								senderID: User.getUserId(),
								senderName: User.getUserName(),
								imageUrl: downloadURL,
								time: ("0" + currentTime.getHours()).slice(-2) + ':' + ("0" + currentTime.getMinutes()).slice(-2)
							};
							console.log(data);			
							console.log($scope.currentThread);
							$scope.threadsRef.child($scope.currentThread).child('messages').push(data);
							for(var i = 0; i < $scope.group.members.length; ++i ){
								var otheruserRef =  firebase.database().ref('users/' + $scope.group.members[i].UserID);
								otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastText').set(data);
								otheruserRef.child('threads').child(ModuleService.getCurrentModule().CourseCode).child($scope.currentThread).child('lastTextTime').set(data.time);
								if($scope.group.members[i].UserID != User.getUserId()){
									otheruserRef.child('token').once('value', function(snapshot){
										var otherToken = snapshot.val();
										console.log('otherToken', otherToken);
										$http({
											method: "POST",
											url: "https://api.ionic.io/push/notifications",
											headers: {
										 	   'Authorization': 'Bearer ' + $rootScope.APItoken
										 	},
											data: {
											    "tokens": [otherToken],
											    "profile": "dev",
											    "notification": {
											        "message": data.senderName + ": Image" ,
											        "android": {
											            "title": GroupService.getName(),
											            "image": GroupService.getIcon() || './img/default-user.png'
											        }
											    }
											},
										}).then(function(data){
									   	 	console.log(data);
									   	 });
								   	 });
								}
							}
				        });
				    });
			    }, function(error) {
			      	console.log('error getting photos');
			    });
			};
		$scope.imageShow = function(imageSrc){
			 PhotoViewer.show(imageSrc);
		}	
	})

	.controller('ProfileCtrl', function($scope, $cordovaImagePicker, User, $state, Firebase, $rootScope){
		$scope.goHome = function(){
			$state.go('NUSTalk.home');
		}
		$scope.userName = User.getUserName();
		$scope.userID = User.getUserId();
		$scope.email = User.getEmail();
		$scope.imageUrl = User.getIcon() || './img/default-user.png';
		console.log('pro', $scope.imageUrl);

		$scope.imageShow = function(imageSrc){
			 PhotoViewer.show(imageSrc);
		}

		$scope.changePicture = function(){
			 var storageRef = firebase.storage().ref();
			 var options = {
			   maximumImagesCount: 1,
			   width: 800,
			   height: 800,
			   quality: 80
			  };

			  $cordovaImagePicker.getPictures(options)
			    .then(function (imageData) {
			    	console.log(imageData);
				    var getFileBlob = function(url, cb) {
				        var xhr = new XMLHttpRequest();
				        xhr.open("GET", url);
				        xhr.responseType = "blob";
				        xhr.addEventListener('load', function() {
				            cb(xhr.response);
				        });
				        xhr.send();
				    };

				    var blobToFile = function(blob, name) {
				        blob.lastModifiedDate = new Date();
				        blob.name = name;
				        return blob;
				    };

				    var getFileObject = function(filePathOrUrl, cb) {
				        getFileBlob(filePathOrUrl, function(blob) {
				            cb(blobToFile(blob, 'test.jpg'));
				        });
				    };

				    getFileObject(imageData, function(fileObject) {
				        var uploadTask = storageRef.child('images/'+imageData[0].substring(imageData[0].indexOf('cache')+6)).put(fileObject);

				        uploadTask.on('state_changed', function(snapshot) {
				            console.log(snapshot);
				        }, function(error) {
				            console.log(error);
				        }, function() {
				            var downloadURL = uploadTask.snapshot.downloadURL;
				            console.log(downloadURL);
				            // handle image here
				            firebase.database().ref('users').child(User.getUserId()).child('picture').set(downloadURL);
				            $scope.imageUrl = downloadURL;
				            User.setIcon(downloadURL);
				            $rootScope.DP = downloadURL;
				            window.plugins.toast.showLongBottom('Profile Photo Changed', function(a){console.log('toast success: ' + a);$scope.imageShow(downloadURL);}, function(b){alert('toast error: ' + b)});
				        });
				    });
			    }, function(error) {
			      	console.log('error getting photos');
			    });
			};
	})

	.controller('BotCtrl', function($scope, $http, $state, $rootScope, ChatService, Firebase, User, $ionicScrollDelegate, $timeout, $rootScope, ModuleService, $cordovaImagePicker, $ionicModal, BotService){

		$scope.inputMessage = {};
		$scope.userID = User.getUserId();

		$timeout(function() {
    		$ionicScrollDelegate.scrollBottom();
  		});

		$scope.threadRef = firebase.database().ref('threads/BOT/' + User.getUserId());
		$scope.messages = [];

		$scope.messagesRef = firebase.database().ref('threads/BOT/' + User.getUserId() + '/messages');
			
			$scope.messagesRef.on('child_added', function(data) {
				console.log('new message'+ data.val().text);
				$scope.messages.push(data.val());	
				$timeout(function() {
	    			$ionicScrollDelegate.scrollBottom();
		  		});
			});

		$scope.threadRef.once('value', function(snapshot){
			$scope.watermark = snapshot.val().watermark;
			console.log('watermark', $scope.watermark);
		})

		/*var interval = setInterval(function() {	
			   	 	$http({
						method: "GET",
						url: "https://directline.botframework.com/api/conversations/" + BotService.getConID() + "/messages?watermark=" + $scope.watermark,
						headers: {
					 	   'Authorization': 'Bearer ' + 'SfB4DslT2ew.cwA.F64.3AfjhRhOOZsoXoONOYDquiVTSn0NUhDcuxNsYxqmAM8'
					 	},
					}).then(function(response){
				   	 	console.log(response);
				   	 	if($scope.watermark == response.data.watermark){
				   	 		clearInterval(interval);
				   	 		$scope.threadRef.child('watermark').set($scope.watermark);
				   	 	}
				   	 	else{
				   	 		$scope.watermark = response.data.watermark;
				   	 		var chat = response.data.messages;
				   	 		console.log(chat);
				   	 		for(var i=0;i<chat.length;++i){
				   	 			$scope.threadRef.child('messages').push(chat[i]);
				   	 		}
				   	 	}
				   	});	
				}, 1000);*/


			 
		$scope.sendMessage = function(msg){

			$ionicScrollDelegate.scrollBottom(true);
			var currentTime = new Date();
			var Message = {
				from: User.getUserId(),
				text: msg,
			};

			console.log(Message);	

			$http({
				method: "POST",
				url: "https://directline.botframework.com/api/conversations/" + BotService.getConID() + "/messages",
				headers: {
			 	   'Authorization': 'Bearer ' + 'SfB4DslT2ew.cwA.F64.3AfjhRhOOZsoXoONOYDquiVTSn0NUhDcuxNsYxqmAM8'
			 	},
				data: {
				    'text': Message.text,
				    'from': User.getUserId() 
				},
			}).then(function(data){
		   	 	console.log(data);	
		   	 	var interval = setInterval(function() {	
			   	 	$http({
						method: "GET",
						url: "https://directline.botframework.com/api/conversations/" + BotService.getConID() + "/messages?watermark=" + $scope.watermark,
						headers: {
					 	   'Authorization': 'Bearer ' + 'SfB4DslT2ew.cwA.F64.3AfjhRhOOZsoXoONOYDquiVTSn0NUhDcuxNsYxqmAM8'
					 	},
					}).then(function(response){
				   	 	console.log(response);
				   	 	if($scope.watermark == response.data.watermark){
				   	 		$scope.threadRef.child('watermark').set($scope.watermark);
				   	 		clearInterval(interval);
				   	 	}
				   	 	else{
				   	 		$scope.watermark = response.data.watermark;
				   	 		var chat = response.data.messages;
				   	 		console.log(chat);
				   	 		for(var i=0;i<chat.length;++i){
				   	 			if(chat[i].from != Message.from)
				   	 				$scope.threadRef.child('messages').push(chat[i]);
				   	 		}
				   	 	}
				   	});	
				}, 1000);

		   	 });		
			$scope.threadRef.child('messages').push(Message);
			$scope.inputMessage = {};
		};	


	})

	
	
