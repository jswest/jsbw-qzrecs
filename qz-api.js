var request = require( 'request-json' ),
	QZ = request.createClient( 'http://qz.com/api/' ),
	Q = require( 'q' ),
	_ = require( 'underscore' );



/**
 * QZ-API
 * A modest wrapper that can exract some important things from
 * the quartz API.
 */
module.exports = {



	posts: [],



	/**
	 * @function _getPost
	 * Gets the post JSON for a given article ID.
	 * @private
	 * @param {string|number} id The ID of a given article.
	 * @return {object} The JSON for that article.
	 */
	_getPost: function ( id ) {

		return Q.Promise( function ( resolve ) {
			QZ.get( 'article/' + id, function ( error, response, body ) {

				if ( error ) {
					resolve( {} );
				}

				if ( _.isArray( body.items ) ) {
					resolve( body.items[0] );
				} else {
					resolve( {} );
				}

			});
		});
	},



	/**
	 * @function _getPostAuthors
	 * Extracts the author(s) for a given post.
	 * @private
	 * @param {object} post The JSON of a given post.
	 * @return {array} The author(s) of the post
	 */
	_getPostAuthors: function ( post ) {

		if (
			_.isObject( post ) &&
			_.isObject( post.byline ) &&
			_.isArray( post.byline.authors )
		) {

			var authors = [];

			_.each( post.byline.authors, function ( author ) {

				if (
					_.isObject( author ) &&
					_.isString( author.name ) &&
					_.isString( author.username )
				) {
					authors.push( author );
				}

			});

			return authors;

		}

		return [];

	},



	/**
	 * @function _getPostTags
	 * Extracts the tags for the given post.
	 * @private
	 * @param {object} post The JSON of a given post.
	 * @return {array} The tag(s) for the post.
	 */
	_getPostTags: function ( post ) {

		if (
			_.isObject( post ) &&
			_.isObject( post.taxonomies ) &&
			_.isArray( post.taxonomies.tags )
		) {

			var tags = [];

			_.each( post.taxonomies.tags, function ( tag ) {

				if (
					_.isObject( tag ) &&
					_.isString( tag.name ) &&
					_.isString( tag.slug )
				) {
					tags.push( tag );
				}

			});

			return tags;

		}

		return [];

	},



	/**
	 * @function _getPostObsession
	 * Extracts the obsession for a given post.
	 * @private
	 * @param {object} post The JSON of a given post.
	 * @return {object} The obsession for the post.
	 */
	_getPostObsession: function ( post ) {

		// First, we want a utility function to check the status of the obsession
		// since it can live in a couple of places.
		var checkObsession = function ( obsession ) {

			if (
				_.isObject( obsession ) &&
				_.isString( obsession.name ) &&
				_.isString( obsession.slug )
			) {
				return true
			}

			return false;

		};

		// Check if the post contains an obsession.
		if (
			_.isObject( post ) &&
			(
				(
					_.isObject( post.taxonomies ) &&
					_.isArray( post.taxonomies.obsession )
				) ||
				_.isObject( post.obsession )
			)
		) {

			// Check in the two places it could live.
			if ( checkObsession( post.obsession ) ) {
				return post.obsession;
			} else if ( checkObsession( post.taxonomies.obsession[0] ) ) {
				return post.obsession;
			} else {
				return {};
			}

		}

	},



	/**
	 * @function _getPostsByTaxonomy
	 * Given a taxonomy, gets 16 posts.
	 * @private
	 * @param {object} taxonomy The JSON of a taxonomy.
	 * @return {array} The JSON of posts.
	 */
	_getPostsByTaxonomy: function ( taxonomy ) {

		var d = Q.defer();

		if (
			_.isObject( taxonomy ) &&
			_.isString( taxonomy.name ) &&
			_.isString( taxonomy.slug )
		) {

			QZ.get( 'tag/' + taxonomy.slug, function ( error, response, body ) {

				if ( error ) {
					d.resolve( this.posts );
				}

				this.posts.push( body.items );
				d.resolve( this.posts );

			}.bind( this ));

		} else {
			d.resolve( this.posts );
		}

		return d.promise;

	},



	/**
	 * @function _getPostsByAuthor
	 * Given an author, get 16 posts.
	 * @private
	 * @param {object} author The JSON of an author.
	 * @return {array} the JSON of posts.
	 */
	_getPostsByAuthor: function ( author ) {

		var d = Q.defer();

		if (
			_.isObject( author ) &&
			_.isString( author.name ) &&
			_.isString( author.username )
		) {

			QZ.get( 'author/' + author.username, function ( error, response, body ) {

				if ( error ) {
					d.resolve( this.posts );
				}

				this.posts.push( body.items );
				d.resolve( this.posts );

			}.bind( this ));

		} else {
			d.resolve( this.posts );
		}

		return d.promise;

	}



};