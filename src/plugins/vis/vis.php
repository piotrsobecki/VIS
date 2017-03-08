<?php
/*
 * Plugin Name: VIS
 * Version: 1.0
 * Plugin URI: http://vis.sbck.co
 * Description: Visual Illusion Simulation: An open platform for conducting online visual simulation experiments.
 * Author: Piotr Sobecki
 * Author URI: http://sbck.co
 * Requires at least: 4.0
 * Tested up to: 4.0
 *
 * Text Domain: VIS
 * Domain Path: /lang/
 *
 * @package WordPress
 * @author Piotr Sobecki
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Load plugin class files
require_once( 'includes/class-vis.php' );
require_once( 'includes/class-vis-settings.php' );

// Load plugin libraries
require_once( 'includes/lib/class-vis-admin-api.php' );
require_once( 'includes/lib/class-vis-post-type.php' );
require_once( 'includes/lib/class-vis-taxonomy.php' );

/**
 * Returns the main instance of vis to prevent the need to use globals.
 *
 * @since  1.0.0
 * @return object vis
 */
function vis () {
	$instance = vis::instance( __FILE__, '1.1' );

	if ( is_null( $instance->settings ) ) {
		$instance->settings = vis_Settings::instance( $instance );
	}
	return $instance;
}

vis();

global $i;
$i=0;


function vis_game($game_name, $params){
	global $i;
	$params['game']=$game_name;
	$html = '<canvas id="vis-canvas-'.$i++.'"';
	foreach ($params as $param_key => $param_value){
		$html = $html . ' data-vis-'.$param_key.'="'.$param_value.'" ';
	}
	$html = $html . ' ></canvas>
	<div class="vis-canvas-overlay"><span class="vis-exposition-number"></span></div>';
	return $html;
}



function vis_game_ebbinghous($params){
	return vis_game('ebbinghaus',$params);
}
add_shortcode('vis-game-ebbinghaus','vis_game_ebbinghous');

function vis_game_ml($params){
	return vis_game('ml',$params);
}
add_shortcode('vis-game-ml','vis_game_ml');

function vis_game_ponzo($params){
	return vis_game('ponzo',$params);
}
add_shortcode('vis-game-ponzo','vis_game_ponzo');

function vis_game_poggendorff($params){
	return vis_game('poggendorff',$params);
}
add_shortcode('vis-game-poggendorff','vis_game_poggendorff');

function vis_game_zollner($params){
	return vis_game('zollner',$params);
}
add_shortcode('vis-game-zollner','vis_game_zollner');




function vis_game_ebbinghous_shortcode_ui($params){
	shortcode_ui_register_for_shortcode( 
		'vis-game-ebbinghaus',
		array(
			'label' => esc_html__( 'VIS Game: Ebbinghaus', 'shortcode-ui-game' ),
			'post_type' => array( 'survey' ),
			'attrs' => array(
				//Ebbinghaus
				array('label'  => esc_html__( 'Spacing between components (inches)', 'shortcode-ui-game' ),'type'   => 'text', 'attr'=> 'spacing'),
				array( 'label' => esc_html__( 'Number of expositions', 'shortcode-ui-game' ), 'attr' => 'n', 'type' => 'number'),
				array( 'label' => esc_html__( 'Speed of change given input', 'shortcode-ui-game' ), 'attr' => 'speed', 'type' => 'number'),
				array( 'label' => esc_html__( 'Randomization factor (maximum change to test element(inches))', 'shortcode-ui-game' ), 'attr' => 'rr', 'type' => 'number'),
				
				array( 'label' => esc_html__( 'Radius of components (inches)', 'shortcode-ui-game' ), 'attr' => 'radius', 'type' => 'number'),
				array( 'label' => esc_html__( 'Radius of left inner circle (inches)', 'shortcode-ui-game' ), 'attr' => 'lri', 'type' => 'number'),
				array( 'label' => esc_html__( 'Radius of left outer circle (inches)', 'shortcode-ui-game' ), 'attr' => 'lro', 'type' => 'number'),
				array( 'label' => esc_html__( 'Radius of right inner circle (inches)', 'shortcode-ui-game' ), 'attr' => 'rri', 'type' => 'number'),
				array( 'label' => esc_html__( 'Radius of right outer circle (inches)', 'shortcode-ui-game' ), 'attr' => 'rro', 'type' => 'number'),
				
				array( 'label' => esc_html__( 'Number of outer circles', 'shortcode-ui-game' ), 'attr' => 'nc', 'type' => 'number'),

                array( 'label' => esc_html__( 'Which element should be tested', 'shortcode-ui-game' ), 'attr' => 'test', 'type' => 'text')
			)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_game_ebbinghous_shortcode_ui' );

function vis_game_ml_shortcode_ui($params){
	shortcode_ui_register_for_shortcode( 
		'vis-game-ml',
		array(
			'label' => esc_html__( 'VIS Game: Muller Lyer', 'shortcode-ui-game' ),
			'post_type' => array( 'survey' ),
			'attrs' => array(
				array( 'label' => esc_html__( 'Spacing between components (inches)', 'shortcode-ui-game' ), 'attr' => 'spacing', 'type' => 'number'),
				array( 'label' => esc_html__( 'Number of expositions', 'shortcode-ui-game' ), 'attr' => 'n', 'type' => 'number'),
				array( 'label' => esc_html__( 'Speed of change given input', 'shortcode-ui-game' ), 'attr' => 'speed', 'type' => 'number'),
				array( 'label' => esc_html__( 'Randomization factor (maximum change to test element)', 'shortcode-ui-game' ), 'attr' => 'rr', 'type' => 'number'),
				
				array( 'label' => esc_html__( 'Length of the top line (inches)', 'shortcode-ui-game' ), 'attr' => 'tl', 'type' => 'number'),
				array( 'label' => esc_html__( 'Length of the bottom line (inches)', 'shortcode-ui-game' ), 'attr' => 'bl', 'type' => 'number'),
				array( 'label' => esc_html__( 'Length of the top arrow line (inches)', 'shortcode-ui-game' ), 'attr' => 'tal', 'type' => 'number'),
				array( 'label' => esc_html__( 'Length of the bottom arrow line (inches)', 'shortcode-ui-game' ), 'attr' => 'bal', 'type' => 'number'),
				array( 'label' => esc_html__( 'Arrow angle', 'shortcode-ui-game' ), 'attr' => 'theta', 'type' => 'number'),

                array( 'label' => esc_html__( 'Which element should be tested', 'shortcode-ui-game' ), 'attr' => 'test', 'type' => 'text')
			)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_game_ml_shortcode_ui' );




function vis_game_ponzo_shortcode_ui($params){
	shortcode_ui_register_for_shortcode(
		'vis-game-ponzo',
		array(
			'label' => esc_html__( 'VIS Game: Ponzo', 'shortcode-ui-game' ),
			'post_type' => array( 'survey' ),
			'attrs' => array(
				array( 'label' => esc_html__( 'Spacing between components (inches)', 'shortcode-ui-game' ), 'attr' => 'spacing', 'type' => 'number'),
				array( 'label' => esc_html__( 'Number of expositions', 'shortcode-ui-game' ), 'attr' => 'n', 'type' => 'number'),
				array( 'label' => esc_html__( 'Speed of change given input', 'shortcode-ui-game' ), 'attr' => 'speed', 'type' => 'number'),
				array( 'label' => esc_html__( 'Randomization factor (maximum change to test element)', 'shortcode-ui-game' ), 'attr' => 'rr', 'type' => 'number'),
				
				array( 'label' => esc_html__( 'Side lines length (inches)', 'shortcode-ui-game' ), 'attr' => 'side_line_length', 'type' => 'number'),
				array( 'label' => esc_html__( 'Length of the top line (inches)', 'shortcode-ui-game' ), 'attr' => 'tl', 'type' => 'number'),
				array( 'label' => esc_html__( 'Length of the bottom line (inches)', 'shortcode-ui-game' ), 'attr' => 'bl', 'type' => 'number'),
				array( 'label' => esc_html__( 'Angle of side lines', 'shortcode-ui-game' ), 'attr' => 'angle', 'type' => 'number'),

                array( 'label' => esc_html__( 'Which element should be tested', 'shortcode-ui-game' ), 'attr' => 'test', 'type' => 'text')
			)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_game_ponzo_shortcode_ui' );add_action( 'register_shortcode_ui', 'vis_game_ml_shortcode_ui' );




function vis_game_poggendorff_shortcode_ui($params){
	shortcode_ui_register_for_shortcode( 
		'vis-game-poggendorff',
		array(
			'label' => esc_html__( 'VIS Game: Poggendorff', 'shortcode-ui-game' ),
			'post_type' => array( 'survey' ),
			'attrs' => array(
				//Poggendorff
				array( 'label' => esc_html__( 'Spacing between components (inches)', 'shortcode-ui-game' ), 'attr' => 'spacing', 'type' => 'number'),
				array( 'label' => esc_html__( 'Number of expositions', 'shortcode-ui-game' ), 'attr' => 'n', 'type' => 'number'),
				array( 'label' => esc_html__( 'Speed of change given input', 'shortcode-ui-game' ), 'attr' => 'speed', 'type' => 'number'),
				array( 'label' => esc_html__( 'Randomization factor (maximum change to test element)', 'shortcode-ui-game' ), 'attr' => 'rr', 'type' => 'number'),
				
				array( 'label' => esc_html__( 'Components height (inches)', 'shortcode-ui-game' ), 'attr' => 'height', 'type' => 'number'),

                array( 'label' => esc_html__( 'Which element should be tested', 'shortcode-ui-game' ), 'attr' => 'test', 'type' => 'text')

			)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_game_poggendorff_shortcode_ui' );




function vis_game_zollner_shortcode_ui($params){
	shortcode_ui_register_for_shortcode( 
		'vis-game-zollner',
		array(
			'label' => esc_html__( 'VIS Game: Zollner', 'shortcode-ui-game' ),
			'post_type' => array( 'survey' ),
			'attrs' => array(
				//Zollner
				array( 'label' => esc_html__( 'Spacing between components (inches)', 'shortcode-ui-game' ), 'attr' => 'spacing', 'type' => 'number'),
				array( 'label' => esc_html__( 'Number of expositions', 'shortcode-ui-game' ), 'attr' => 'n', 'type' => 'number'),
				array( 'label' => esc_html__( 'Speed of change given input', 'shortcode-ui-game' ), 'attr' => 'speed', 'type' => 'number'),
				array( 'label' => esc_html__( 'Randomization factor (maximum change to test element)', 'shortcode-ui-game' ), 'attr' => 'rr', 'type' => 'number'),
				
				array( 'label' => esc_html__( 'Length of the  lines (inches)', 'shortcode-ui-game' ), 'attr' => 'len', 'type' => 'number'),
				array( 'label' => esc_html__( 'Spaciong between smaller lines (inches)', 'shortcode-ui-game' ), 'attr' => 'spacings', 'type' => 'number'),
				array( 'label' => esc_html__( 'Rotation angle of whole setup', 'shortcode-ui-game' ), 'attr' => 'rotangle', 'type' => 'number'),

                array( 'label' => esc_html__( 'Which element should be tested', 'shortcode-ui-game' ), 'attr' => 'test', 'type' => 'text')
				
			)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_game_zollner_shortcode_ui' );





function vis_next($params){
    $a = shortcode_atts( array(
        'text' => 'Ok'
    ), $params );

	return '<div class="vis-button vis-next vis-full-screen" >'.$a['text'].'</div>';
}
add_shortcode('vis-next','vis_next');

function vis_next_shortcode_ui($params){
	shortcode_ui_register_for_shortcode( 
		'vis-next',
		array(
			'label' => esc_html__( 'VIS Next slide button', 'shortcode-ui-next' ),
			'post_type' => array( 'survey' ),
			'attrs' => array(
							array(
								'label'  => esc_html__( 'Confirmation text', 'shortcode-ui-next' ),
								'attr'   => 'text',
								'type'   => 'text',
								'encode' => true,
								'meta'   => array(
									'placeholder' => esc_html__( 'Text to be displayed on the button', 'shortcode-ui-next' ),
									'data-test'   => 1
								)
							)
						)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_next_shortcode_ui' );


function vis_save($params){
    $a = shortcode_atts( array(
        'text' => 'Ok'
    ), $params );
	$text = $a['text'];
	return '<div class="vis-button vis-save vis-full-screen-exit">'.$text.'</div>';
}
add_shortcode('vis-save','vis_save');

function vis_save_shortcode_ui($params){
	shortcode_ui_register_for_shortcode( 
		'vis-save',
		array(
			'label' => esc_html__( 'VIS Save survey button', 'shortcode-ui-save' ),
			'post_type' => array( 'survey' ),
			'attrs' => array(
							array(
								'label'  => esc_html__( 'Confirmation text', 'shortcode-ui-save' ),
								'attr'   => 'text',
								'type'   => 'text',
								'encode' => true,
								'meta'   => array(
									'placeholder' => esc_html__( 'Text to be displayed on the button', 'shortcode-ui-save' ),
									'data-test'   => 1
								)
							)
						)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_save_shortcode_ui' );



function vis_form($params, $content = null){
	$a = shortcode_atts( array(
        'text' => 'Ok'
    ), $params );
	$text = $a['text'];
	return '<form action="" class="vis-form vis-full-screen" data-parsley-validate="">
				<fieldset>'.do_shortcode($content).'</fieldset>
			  <input type="submit" class="vis-button vis-full-screen"  value="'.$text.'">
			</form>';
}
add_shortcode('vis-form','vis_form');

function vis_form_shortcode_ui($params){
	shortcode_ui_register_for_shortcode( 
		'vis-form',
		array(
			'label' => esc_html__( 'VIS Form: used to embed fields', 'shortcode-ui-form' ),
			'post_type' => array( 'survey' ),
			'inner_content' => array(
				'label'        => esc_html__( 'Content', 'shortcode-ui-example' ),
				'description'  => esc_html__( 'Include the content of the form, or do it later.', 'shortcode-ui-example' )
			),
			'attrs' => array(
							array(
								'label'  => esc_html__( 'Confirmation text on form confirmation', 'shortcode-ui-form' ),
								'attr'   => 'text',
								'type'   => 'text',
								'encode' => true,
								'meta'   => array(
									'placeholder' => esc_html__( 'Text to be displayed on the button', 'shortcode-ui-form' ),
									'data-test'   => 1
								)
							)
						)
		)
	);
}
add_action( 'register_shortcode_ui', 'vis_form_shortcode_ui' );


add_filter( 'body_class', function( $classes ) {
    if (get_post_type()=='survey'){
        return array_merge( $classes, array( 'noselect' ) );
    }
    return $classes;
});

function vis_context($params, $content = null) {


    ob_start();
    $post_url = admin_url('admin-post.php');
    $sid = get_the_ID();
    ?>
    <div id="dpi" style="height: 1in; width: 1in; left: 100%; position: fixed; top: 100%;"></div>
    <div class="presentation-wrapper deck-container"><?php echo do_shortcode($content); ?></div>
    <script>
        jQuery.vis('init',{
            post_url:'<?php echo $post_url; ?>',
            survey_id:'<?php echo $sid; ?>'
        });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('vis-context','vis_context');

function vis_context_shortcode_ui() {
	shortcode_ui_register_for_shortcode('vis-context', array(
		'label' => esc_html__( 'VIS Context: Top level, to wrap VIS elements', 'shortcode-ui-context' ),
		'post_type' => array( 'survey' ),
		'inner_content' => array(
			'label'        => esc_html__( 'Content', 'shortcode-ui-example' ),
			'description'  => esc_html__( 'Include the content of the context, or do it later.', 'shortcode-ui-example' )
		)
		
	));
}
add_action( 'register_shortcode_ui', 'vis_context_shortcode_ui' );

function vis_slide($params, $content = null) {
	return '<section class="slide">'.do_shortcode($content).'</section>';

}
add_shortcode('vis-slide','vis_slide');

function vis_slide_shortcode_ui() {
	shortcode_ui_register_for_shortcode('vis-slide', array(
		'label' => esc_html__( 'VIS Slide', 'shortcode-ui-slide' ),
		'post_type' => array( 'survey' ),
		'inner_content' => array(
			'label'        => esc_html__( 'Content', 'shortcode-ui-example' ),
			'description'  => esc_html__( 'Include the content of the slide, or do it later.', 'shortcode-ui-example' )
		)
	));
}
add_action( 'register_shortcode_ui', 'vis_slide_shortcode_ui' );
