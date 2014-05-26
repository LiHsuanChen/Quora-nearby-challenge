/* Solution to Quora's Nearby Programming Challenge
 * Author: Terry Chen
 * Note: This script is intended to run on NodeJS sever platform. It can also be run on browser clients.
 */


var line = 1;
var t, q, n;

var first = {};
var second = {};
var third = {};
var query = {};

process.stdin.resume();
process.stdin.setEncoding('utf8');
 
//Upon receing input, transform them into javascript object
process.stdin.on('data', function (chunk) {

	if ( line === 1 ){
		var data = chunk.replace(/\n/g,"");
		var array = data.split(" ");

		t = parseInt(array[0]);
		first.T = t;
		q = parseInt(array[1]);
		first.Q = q;
		n = parseInt(array[2]);
		first.N = n;
		line++;

	}
	else if ( line > 1 && line <= 1 + t ){
		line++;
		var data = chunk.replace(/\n/g,"");
		var array = data.split(" ");

		second[line-3] = {};
		second[line-3].id = parseInt(array[0]);
		second[line-3].x  = parseInt(array[1]);
		second[line-3].y  = parseInt(array[2]);

	}
	else if ( line > t + 1 && line <= t + 1 + q ){
		line++;
		var data = chunk.replace(/\n/g,"");
		var array = data.split(" ");

		third[line - t - 3] = {};
		third[line - t - 3].id  = parseInt(array[0]);
		third[line - t - 3].num = parseInt(array[1]);
		for (var i = 2; i < third[line - t - 3].num + 2 ; i++){
			third[line - t - 3][i-2]  = parseInt(array[i]);
		}

	}
	else if ( line > 1 + t + q && line <= t + 1 + q + n){
		line++;
		var data = chunk.replace(/\n/g,"");
		var array = data.split(" ");
		
		query[line - t - q - 3] = {};
		query[line - t - q - 3][0]  = array[0];
		query[line - t - q - 3][1]  = parseInt(array[1]);
		query[line - t - q - 3].x   = parseInt(array[2]);
		query[line - t - q - 3].y   = parseInt(array[3]);

	}
	if( line > t + q + n + 1){
		//Initiate the algorithm when finish reciving all inputs
		nearby();
	}
});


/* This is how the those objects look like
 * It is using the sample data
// the first object references the first line of STDIN input
var first = {
	T : 3, 
	Q : 6,
	N : 2
};

// the second object references the T lines of STDIN inputs following by the first
// Each of them has an topic id and x,y location
var second = {
	0 : { id : 0, x : 0.0, y: 0.0 },
	1 : { id : 1, x : 1.0, y: 1.0 },
	2 : { id : 2, x : 2.0, y: 2.0 }
};

// the third object references the Q lines of STDIN inputs following by the second
// Each of them has an question id, a number of topic reference, and each topic id that references this question id
var third = {
	0 : {
		id : 0,
		num : 1,
		0 : 0
	},
	1 : {
		id : 1,
		num : 2,
		0 : 0,
		1 : 1
	},
	2 : {
		id : 2,
		num : 3,
		0 : 0,
		1 : 1,
		2 : 2
	},
	3 : {
		id : 3,
		num : 0
	},
	4 : {
		id : 4,
		num : 0
	},
	5 : {
		id : 5,
		num : 2,
		0 : 1,
		1 : 2
	}
};	

// the query object references the N lines of STDIN inputs following by the third
// Each of them has a required result indicator, number of required results, and x,y location
var query = {
	0 : { 
		0 : "t",
		1 : 2,
		x : 0.0,
		y : 0.0
	},
	1 : {
		0 : "q",
		1 : 5,
		x : 1.0,
		y : 1.0
	},
};
*/


/*
 * Get an array of topics sorted by closest location
 *
 * @param  {Object}   obj 	  query object
 * @param  {Boolean}  def 	  true to be "t" type of query, false to be "q" type of query
 * @return {Array}    result  sorted results based on the closest location
 *
 */
function findTopic( obj, def ){
	
	var result = [];
	var stdout = "";

	//Calculating the distance between each topic and location specified in object query
	for ( var i = 0; i < first.T; i++ ){
		var distance = Math.sqrt((obj.x - second[i].x)*(obj.x - second[i].x) + (obj.y - second[i].y)*(obj.y - second[i].y));
		//Storing results into result array
		result[i] = { 
			dis : distance,
			id : second[i].id
		}
	}
	//Sorting the result array
	result.sort(function(a, b){ 
		//the entity with the larger id should be ranked first if there is a tie in distance
		if (a.dis === b.dis){
			return b.id - a.id;
		}
		//Distance in ascending order
		return a.dis - b.dis;
	});

	//if it is "t" type of query, Printing results on console
	if(def){
		for ( var i = 0; i < obj[1]; i++){
			stdout += String(result[i].id);
			stdout += " ";
		}
		//Print on console
		process.stdout.write(stdout + "\n");
	}
	//otherwise it would be "q" type of query, return the result
	else{
		return result;
	}
};


/*
 * Get an array of questions that have the closest location
 *
 * @param  {Object}   obj 	  query object
 *
 */
function findQuestion( obj ){

	//This result is for question array
	var result = [];
	var stdout = "";
	//Get the sorted topic array first
	var topics = findTopic( obj, false );
	//for each Topic id in topics array
	for ( var t = 0 ; t < first.T ; t++ ){
		//for each Question in third object
		for ( var i = 0 ; i < first.Q ; i++ ){
			//for the topic associated with the question in third object
			for ( var j = 0 ; j < third[i].num ; j++ ){
				//if the topic match the question AND it is not yet being put in result
				if ( third[i][j] === topics[t].id && !third[i].found){
					result[result.length] = {
						dis : topics[t].dis,
						Qid : third[i].id
					};
					third[i].found = true;
				}
			}
		}
	}
	//Sorting the result if there are questions associated with topics in the same distance 
	result.sort(function(a, b){
		if (a.dis === b.dis){
			return b.Qid - a.Qid;
		}
	});

	//Printing results on console
	for ( var i = 0; i < obj[1]; i++){
		//Rquired results might be more than number of questions that are assoiated to topics, need to ignore those
		if (typeof result[i] !== "undefined"){
			stdout += String(result[i].Qid);
			stdout += " ";
		}
		
	}
	//Print on console
	process.stdout.write(stdout + "\n");
};


/*
 *
 * Main function
 *
 */
function nearby() {
	//Run for each query specifed
	for (var index in query) {

		//obj variable references that query
		var obj = query[index];

		//if it's got a "t"
		if ( obj[0] === "t" ) {
			findTopic( obj, true );
		}
		//if it's got a "q"
		else if ( obj[0] === "q" ) {
			findQuestion( obj );
		}
		//Otherwise
		else{
			console.log("query input invalid")
		}
	};
	process.exit(0);

};