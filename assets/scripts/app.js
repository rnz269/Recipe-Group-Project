

var config = {
    apiKey: "AIzaSyAh--04dzUCt6Iph2w8xn-cHUMx-Yfj6eM",
    authDomain: "nutrition-36cb1.firebaseapp.com",
    databaseURL: "https://nutrition-36cb1.firebaseio.com",
    storageBucket: "nutrition-36cb1.appspot.com",
    messagingSenderId: "759784210701"
  };

firebase.initializeApp(config);

var database = firebase.database();

var savedRecipes = database.ref("Saved Recipes");

var userState = {
	ingredients: "",
	allergies: "",
	dietPrefs: "",
	time: "",
	from: 0,
	to: 9
}

$('#submit-search').on('click', function(event){
	
	event.preventDefault();
	$(".results").empty();
	counter = 0;

	if( $('#ingredients-input').val() === ""){
		$(this).after("<p class=\"invalid-input\">Please enter a valid search value</p>");
	} else {
		$('.invalid-input').hide();
		userState.ingredients = $('#ingredients-input').val().trim();
		userState.allergies = [];
		userState.dietPrefs = [];
		userState.time = $('.time-input').val();
		pullCheckboxValues(userState.allergies,".allergyList");
		pullCheckboxValues(userState.dietPrefs,".dietPrefs");
		
		console.log("allergies " + userState.allergies, "dietPrefs " + userState.dietPrefs);
		console.log("ingredients " + userState.ingredients);
		console.log("time " + userState.time);

		var allergiesQuery = "";
		var dietPrefsQuery = "";

		for(i = 0; i < userState.allergies.length; i++){
			allergiesQuery += "&health=" + userState.allergies[i]
			console.log(allergiesQuery);
		}

		for(i = 0; i < userState.dietPrefs.length; i++){
			dietPrefsQuery += "&health=" + userState.dietPrefs[i]
			console.log(dietPrefsQuery);
		}


		var url = "https://api.edamam.com/search?q=" + userState.ingredients + "&app_idbcb68bd8" + "&app_key=2a8d5e5d4600120a11ab487124231f6c" + "&from=" + userState.from + "&to=" + userState.to + dietPrefsQuery + allergiesQuery;
		console.log(url);
		

		$.ajax({
		  url: url,
		  method: 'GET',
		}).done(function(response) {
		  console.log(response);
		  loadHTML(response);
		}).fail(function(err) {
		  throw err;
		});

		$(".results-section").removeClass("results-section");

	}

});

	function loadHTML (response) {
		
		var newColumn = $("<div>");
		var newCheckbox = $("<div>");

		for (var i = 0; i < response.hits.length; i++) {
			buildRow(i, response, newColumn, newCheckbox);

			if (i === 0 || i%3 === 0) {
				var newRow = $("<div class = row>");
				newColumn.append(newCheckbox);
				newCheckbox.addClass("checkbox");
				newRow.append(newColumn);
				$(".results").append(newRow);
				
			} else {
				newColumn.append(newCheckbox);
				newCheckbox.addClass("checkbox recipe-result");
				$(".results .row:last-child").append(newColumn);
			}
		}
		var newLoadRow = $("<div class = row>");
		var newLoadColumn = $("<div>");
		newLoadColumn.addClass("col-xs-12 col-sm-4 col-md-4 col-lg-4");
		var moreResultsButton = $("<button>");
		moreResultsButton.addClass("btn btn-primary");
		moreResultsButton.attr("id", "load-more-results");
		moreResultsButton.text("Show More Results");
		newLoadColumn.append(moreResultsButton);
		newLoadRow.append(newLoadColumn);
		$(".results").append(newLoadRow);
		$(".end-message").show();
	}
	

function buildRow(index, response, newColumn, newCheckbox){
	
	newColumn.addClass("col-xs-12 col-sm-4 col-md-4 col-lg-4");
	var imageURL = response.hits[index].recipe.image;
	var title = response.hits[index].recipe.label;
	var returnURL = response.hits[index].recipe.url;
	newColumn.append("<a href='" + returnURL + "' target='_blank'>" + "<img class ='recipePhoto' src='" + imageURL + "'/>" + "<h2>" + title + "</h2>" + "</a>" );
	newCheckbox.append("<label><input type=\"checkbox\" id=\"recipe-result\" value=" + response.hits[index].recipe.uri + "><span>Save Recipe</span></label>");
}	


function pullCheckboxValues(array, formgroup){
	$(formgroup).find($('input[type="checkbox"]:checked')).each(function(){
		array.push($(this).val());
		database.ref().set({
			allergiesList: userState.allergies
		});
	});
}
//add text change upon click and also save the response.hits[i].recipe.uri to firebase - can use uri for ajax request for saved recipes
$(".results").on("click", "#recipe-result", function() {
	var value = $(this).val();
	console.log(value)
	var checked = this.checked;
	console.log(checked);
	var pushKey;
	if (checked) {
		$(this).siblings("span").html("Recipe Saved!");
		//add value to firebase
		var newPush = savedRecipes.push({recipe: value});
		pushKey = newPush.key;
		console.log(pushKey);
		$(this).attr("key", pushKey);
		console.log($(this).attr("key"))
				
  	} else {
    	$(this).siblings("span").html("Save Recipe");
    	//remove value from firebase
    	var removeKey = $(this).attr("key");
    	console.log(removeKey);
    	savedRecipes.child(removeKey).remove();
  	}
});

$(".results").on('click', "#load-more-results", function(){
	$(".results .row:last-child").remove();
	console.log("more please");
	userState.from += 9;
	userState.to += 9;
	console.log(counter)
	var url = "https://api.edamam.com/search?q=" + userState.ingredients + "&app_idbcb68bd8" + "&app_key=2a8d5e5d4600120a11ab487124231f6c" + "&from=" + userState.from + "&to=" + userState.to + userState.allergies + userState.dietPrefs;
	console.log(url);
	

	$.ajax({
	  url: url,
	  method: 'GET',
	}).done(function(response) {
	  console.log(response);
	  loadHTML(response);
	}).fail(function(err) {
	  throw err;
	});

});

  

   

