var express = require( 'express' ),
	app = express(),
	QZ = require( './qz-api' ),
	Q = require( 'q' ),
	_ = require( 'underscore' );



Q.longStackSupport = true;


app.use( express.static( 'public' ) );


app.get( '/', function ( req, res ) {

	res.sendFile( '/static/index.html' );

});



app.get( '/api/:id', function ( req, res ) {

	var id = req.params.id;

	Q( function () {
		return QZ._getPost( id );
	}() )
	.then( function ( post ) {

		var authors = QZ._getPostAuthors( post );
		var taxonomies = QZ._getPostTags( post );
		// var taxonomies = [];
		taxonomies.push( QZ._getPostObsession( post ) );

		var postFunctions = [];
		_.each( authors, function ( author ) {
			postFunctions.push( QZ._getPostsByAuthor.bind( QZ, author ) );
		});
		_.each( taxonomies, function ( tax ) {
			postFunctions.push( QZ._getPostsByTaxonomy.bind( QZ, tax ) );
		});

		var result = Q( [] );
		_.each( postFunctions, function ( postFunction ) {
			result = result.then( postFunction );
		});

		return result;

	})
	.then( function ( result ) {

		var rawposts = _.flatten( result );
		var posts = {};
		_.each( rawposts, function ( rawpost ) {

			if ( _.isObject( rawpost ) && rawpost.id && parseInt( rawpost.id ) !== parseInt( id ) ) {

				if ( _.isObject( posts[rawpost.id] ) ) {
					posts[rawpost.id].count++;
				} else {
					posts[rawpost.id] = {
						count: 1,
						post: rawpost
					};
				}

			}

		});

		var postsArray = [];
		_.each( posts, function ( post, id ) {
			postsArray.push( post );
		});
		postsArray.sort( function ( a, b ) {
			if ( a.count < b.count ) {
				return 1;
			} else {
				return -1;
			}
		});

		res.json( postsArray.slice( 0, 2 ) );
	})
	.done();

});

var server = app.listen( 3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log( 'start yer engines.', host, port );

});