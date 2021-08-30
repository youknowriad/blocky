<?php

function create_block_{block_name}() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'create_block_{block_name}' );
