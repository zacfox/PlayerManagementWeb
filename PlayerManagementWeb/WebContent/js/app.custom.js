var app = angular.module('players', []);

//Diese App hat nur einen Kontroller 'start'
app.controller('start', function ($scope, $http) {

	$scope.players = [];
	
	$scope.isLoading = false;
	$scope.isEditMode = false;
	$scope.currentPlayer = null;
	
	$scope.switchToEditMode = function(emailAddress, index) {
		$scope.currentEmailAddress = angular.copy(emailAddress);
		emailAddress.isEditMode = true;
	}
	
	// ============================================
	// Datenmanagement
	// ============================================
	$scope.restoreEmailAddress = function(index) {
		$scope.currentPlayer.emailAddresses[index] = $scope.currentEmailAddress;
	}
	
	$scope.deleteEmailAddress = function(index) {
		$scope.currentPlayer.emailAddresses.splice(index, 1);
	}
	
	$scope.restorePlayer = function() {
		$scope.currentPlayer = null;
		$scope.currentPlayerOriginal = null;
		
		$scope.loadPlayers();
	}
	
	$scope.addEmailAddress = function() {
		var emailAddress = { isEditMode:true };
		
		if($scope.currentPlayer.emailAddresses == null) {
			$scope.currentPlayer.emailAddresses = new Array();
		}
		
		$scope.currentPlayer.emailAddresses.push(emailAddress);
	}
	
	$scope.addNewPlayer = function() {
		$scope.currentPlayer = { emailAddresses : [] };
		$scope.isEditMode = true;
	}
	
	// ============================================
	// Mit Server interagieren
	// ============================================
	$scope.loadPlayers = function() {
		$scope.isLoading = true;
		
		$http.get("api/v1/players/all?" + Math.random()) //Zufallszahl wird hinzugefügt, um Caching des Browsers zu verhindern
			 .success(function(data) {
				$scope.players = data;
				$scope.isLoading = false;
				$scope.isEditMode = false;
			 });		
	}
	
	$scope.storePlayer = function() {
		if($scope.currentPlayer.id && $scope.currentPlayer.id > 0) {
			$http.put("api/v1/players/update", $scope.currentPlayer) 
				 .success(function() {
					 $scope.loadPlayers();
			});
		} else {
			$http.post("api/v1/players/create", $scope.currentPlayer) 
			 .success(function() {
				 $scope.loadPlayers();
			 });
		}
	}

	$scope.deletePlayer = function() {
		$http.delete("api/v1/players/delete/" + $scope.currentPlayer.id + "?" + Math.random())
			 .success(function() {
				 $scope.loadPlayers();
			 });
	}
	
	$scope.showDetails = function(item) {
		$http.get("api/v1/players/" + item.id + "?" + Math.random())
			 .success(function(data) {
				 $scope.isEditMode = true;
				 $scope.currentPlayer = data;
				 $scope.currentPlayerOriginal = angular.copy(data);
			 });
	}
	
	// ============================================
	// Nachrichten anzeigen
	// ============================================
	$scope.showMessage = function(msg) {
		$("#playerMessage").text(msg);
		$("#playerMessage").show(100).delay(2000).hide(100);
	};
	
	// Implementierung des WebSocket Clients
	var ws = WebSocket("ws://localhost:8080/PlayerManagementWeb/player");
	ws.onmessage = function(msg) {
		$scope.showMessage(msg.data);
		
		if(!$scope.isEditMode) {
			$scope.loadPlayers();
		}
	}
	
	$scope.loadPlayers(); // initiales Laden
	
});

// ============================================
// Nachrichtenbereich initialisieren
// ============================================
$(document).ready(function() {
	$("#playerMessage").hide();
	$("#playerMessage").css("color", "green");
})