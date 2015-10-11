var recInput = document.getElementById( 'rec-id' ),
	rec = document.getElementById( 'rec' ),
	articles = document.getElementsByTagName( 'article' );

var submitListener = function ( e ) {
	e.preventDefault();

	var id = recInput.value;

	var request = new XMLHttpRequest();
	request.open( 'GET', '/api/' + id, true );

	rec.classList.add( 'disabled' );
	rec.removeEventListener( 'submit', submitListener );

	request.onload = function() {
		var data = JSON.parse( request.responseText );
		for ( var i = 0, l = data.length; i < l; i++ ) {
			var hero = '';
			if ( data[i].post.hero && data[i].post.hero.src && data[i].post.hero.src.desktop_2x ) {
				hero = data[i].post.hero.src.desktop_2x
			}
			console.log( data[i].post.id, data[i].post.title );
			articles[i].getElementsByTagName( 'h1' )[0].innerHTML = data[i].post.title;
			articles[i].getElementsByTagName( 'a' )[0].href = data[i].post.permalink;
			articles[i].style.backgroundImage = 'url(' + hero + ')';
		}
		rec.classList.remove( 'disabled' );
		document.getElementById( 'articles' ).classList.add( 'enabled' );
	};

	request.send();

};

rec.addEventListener( 'submit', submitListener );
recInput.focus();





