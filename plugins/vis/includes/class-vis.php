<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class vis {

	/**
	 * The single instance of vis.
	 * @var 	object
	 * @access  private
	 * @since 	1.0.0
	 */
	private static $_instance = null;
	
	private static $vis_db_version = '1.0';

	/**
	 * Settings class object
	 * @var     object
	 * @access  public
	 * @since   1.0.0
	 */
	public $settings = null;

	/**
	 * The version number.
	 * @var     string
	 * @access  public
	 * @since   1.0.0
	 */
	public $_version;

	/**
	 * The token.
	 * @var     string
	 * @access  public
	 * @since   1.0.0
	 */
	public $_token;

	/**
	 * The main plugin file.
	 * @var     string
	 * @access  public
	 * @since   1.0.0
	 */
	public $file;

	/**
	 * The main plugin directory.
	 * @var     string
	 * @access  public
	 * @since   1.0.0
	 */
	public $dir;

	/**
	 * The plugin assets directory.
	 * @var     string
	 * @access  public
	 * @since   1.0.0
	 */
	public $assets_dir;

	/**
	 * The plugin assets URL.
	 * @var     string
	 * @access  public
	 * @since   1.0.0
	 */
	public $assets_url;

	/**
	 * Suffix for Javascripts.
	 * @var     string
	 * @access  public
	 * @since   1.0.0
	 */
	public $script_suffix;
	

	/**
	 * Constructor function.
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	public function __construct ( $file = '', $version = '1.0.0' ) {
		$this->_version = $version;
		$this->_token = 'vis';

		// Load plugin environment variables
		$this->file = $file;
		$this->dir = dirname( $this->file );
		$this->assets_dir = trailingslashit( $this->dir ) . 'assets';
		$this->assets_url = esc_url( trailingslashit( plugins_url( '/assets/', $this->file ) ) );

		$this->script_suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		register_activation_hook( $this->file, array( $this, 'install' ) );

		// Load frontend JS & CSS
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ), 10 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ), 10 );

		// Load admin JS & CSS
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 10, 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_styles' ), 10, 1 );

		// Load API for generic admin functions
		if ( is_admin() ) {
			$this->admin = new vis_Admin_API();
		}

		// Handle localisation
		$this->load_plugin_textdomain();
		add_action( 'init', array( $this, 'load_localisation' ), 0 );
		
		//Register survey post type
		$this->register_post_type('survey','Surveys','Survey','VIS surveys');
	
		add_filter( 'post_row_actions', array( $this, 'survey_add_action_button' ), 10, 2 );
		add_filter( 'page_row_actions', array( $this, 'survey_add_action_button' ), 10, 2 );

		add_action( 'admin_init', array( $this, 'survey_export_function' ) );
		
		
		
		add_action( 'admin_post_nopriv_survey_submit', array( $this, 'survey_submit_handler' ) );
		add_action( 'admin_post_survey_submit', array( $this, 'survey_submit_handler' ) );
		
	} // End __construct ()

	/**
	 * Wrapper function to register a new post type
	 * @param  string $post_type   Post type name
	 * @param  string $plural      Post type item plural name
	 * @param  string $single      Post type item single name
	 * @param  string $description Description of post type
	 * @return object              Post type class object
	 */
	public function register_post_type ( $post_type = '', $plural = '', $single = '', $description = '', $options = array() ) {

		if ( ! $post_type || ! $plural || ! $single ) return;

		$post_type = new vis_Post_Type( $post_type, $plural, $single, $description, $options );

		return $post_type;
	}

	/**
	 * Wrapper function to register a new taxonomy
	 * @param  string $taxonomy   Taxonomy name
	 * @param  string $plural     Taxonomy single name
	 * @param  string $single     Taxonomy plural name
	 * @param  array  $post_types Post types to which this taxonomy applies
	 * @return object             Taxonomy class object
	 */
	public function register_taxonomy ( $taxonomy = '', $plural = '', $single = '', $post_types = array(), $taxonomy_args = array() ) {

		if ( ! $taxonomy || ! $plural || ! $single ) return;

		$taxonomy = new vis_Taxonomy( $taxonomy, $plural, $single, $post_types, $taxonomy_args );

		return $taxonomy;
	}

	/**
	 * Load frontend CSS.
	 * @access  public
	 * @since   1.0.0
	 * @return void
	 */
	public function enqueue_styles () {
		wp_register_style( $this->_token . '-frontend', esc_url( $this->assets_url ) . 'css/frontend.css', array(), $this->_version );
		wp_enqueue_style( $this->_token . '-frontend' );
		
		wp_register_style( $this->_token . '-deck-core', esc_url( $this->assets_url ) . 'css/deck.core.css', array(), $this->_version );
		wp_enqueue_style( $this->_token . '-deck-core' );
		
		

	} // End enqueue_styles ()

	/**
	 * Load frontend Javascript.
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	public function enqueue_scripts () {
		wp_register_script( $this->_token . '-frontend', esc_url( $this->assets_url ) . 'js/frontend' . $this->script_suffix . '.js', array( 'jquery' ), $this->_version );
		wp_enqueue_script( $this->_token . '-frontend' );
		
		wp_register_script( $this->_token . '-deck-core', esc_url( $this->assets_url ) . 'js/deck.core.js',  array('jquery'), $this->_version );
		wp_enqueue_script( $this->_token . '-deck-core' );
		
		wp_register_script( $this->_token . '-modernizr-custom', esc_url( $this->assets_url ) . 'js/modernizr.custom.js',  array('jquery'), $this->_version );
		wp_enqueue_script( $this->_token . '-modernizr-custom' );
		
		wp_register_script( $this->_token . '-vis', esc_url( $this->assets_url ) . 'js/vis.js', array(), $this->_version );
		wp_enqueue_script( $this->_token . '-vis' );
		
		wp_register_script( $this->_token . '-vis-jquery', esc_url( $this->assets_url ) . 'js/vis.jquery.js', array('jquery'), $this->_version );
		wp_enqueue_script( $this->_token . '-vis-jquery' );
		
		wp_register_script( $this->_token . '-parsley', esc_url( $this->assets_url ) . 'js/parsley.min.js', array('jquery'), $this->_version );
		wp_enqueue_script( $this->_token . '-parsley' );
		
		
		
	} // End enqueue_scripts ()

	/**
	 * Load admin CSS.
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	public function admin_enqueue_styles ( $hook = '' ) {
		wp_register_style( $this->_token . '-admin', esc_url( $this->assets_url ) . 'css/admin.css', array(), $this->_version );
		wp_enqueue_style( $this->_token . '-admin' );
	} // End admin_enqueue_styles ()

	/**
	 * Load admin Javascript.
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	public function admin_enqueue_scripts ( $hook = '' ) {
		wp_register_script( $this->_token . '-admin', esc_url( $this->assets_url ) . 'js/admin' . $this->script_suffix . '.js', array( 'jquery' ), $this->_version );
		wp_enqueue_script( $this->_token . '-admin' );
	} // End admin_enqueue_scripts ()

	/**
	 * Load plugin localisation
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	public function load_localisation () {
		load_plugin_textdomain( 'vis', false, dirname( plugin_basename( $this->file ) ) . '/lang/' );
	} // End load_localisation ()

	/**
	 * Load plugin textdomain
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	public function load_plugin_textdomain () {
	    $domain = 'vis';

	    $locale = apply_filters( 'plugin_locale', get_locale(), $domain );

	    load_textdomain( $domain, WP_LANG_DIR . '/' . $domain . '/' . $domain . '-' . $locale . '.mo' );
	    load_plugin_textdomain( $domain, false, dirname( plugin_basename( $this->file ) ) . '/lang/' );
	} // End load_plugin_textdomain ()

	/**
	 * Main vis Instance
	 *
	 * Ensures only one instance of vis is loaded or can be loaded.
	 *
	 * @since 1.0.0
	 * @static
	 * @see vis()
	 * @return Main vis instance
	 */
	public static function instance ( $file = '', $version = '1.0.0' ) {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self( $file, $version );
		}
		return self::$_instance;
	} // End instance ()

	/**
	 * Cloning is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __clone () {
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?' ), $this->_version );
	} // End __clone ()

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 1.0.0
	 */
	public function __wakeup () {
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?' ), $this->_version );
	} // End __wakeup ()

	
	
	public function survey_add_action_button($actions, $post){
		if( $post -> post_type == 'survey'){
			$url = add_query_arg(
				array(
				  'survey_id' => $post->ID,
				  'my_action' => 'survey_export',
				)
			  );
			$actions['export'] = '<a href="' . esc_url( $url ) . '" target="_blank"    >Export Results</a>';
		}
		return $actions;
	}
	
	function to_csv($columns, $rows, $sep){
		$out = implode($sep,$columns);
		foreach ($rows as $row){
			$out = $out . "\n". implode($sep,$row);
		}
		return $out;	
	}
	
	function get_columns($submission){
		$columns = array();
	
		$metadata_dec = json_decode(str_replace('\"', '"', $submission->metadata), true);
		$data_dec = json_decode(str_replace('\"', '"', $submission->data), true);

		array_push($columns,'id');
		array_push($columns,'survey_id'); 
		array_push($columns,'submission_time'); 
		
		foreach ($metadata_dec as $key => $value) {
			array_push($columns,$key); 
		}

		foreach ($data_dec as $key => $value) {
			foreach ($value as $inner1_key => $inner1_value) {
				foreach ($inner1_value as $inner2_key => $inner2_value) {
					array_push($columns,$key .'_'. $inner1_key .'_'. $inner2_key); 
				}
			}
		}
		
		return $columns;
	}

	function get_row($submission){
		$row = array();
		
		$metadata_dec = json_decode(str_replace('\"', '"', $submission->metadata), true);
		$data_dec = json_decode(str_replace('\"', '"', $submission->data), true);

		array_push($row,$submission->id);
		array_push($row,$submission->survey_id);
		array_push($row,$submission->submission_time);
		
		foreach ($metadata_dec as $key => $value) {
			array_push($row,$value); 
		}

		foreach ($data_dec as $key => $value) {
			foreach ($value as $inner1_key => $inner1_value) {
				foreach ($inner1_value as $inner2_key => $inner2_value) {
					array_push($row,$inner2_value); 
				}
			}
		}
	
		return $row;
	}

	public function survey_export_function(){
		global $wpdb;
		if ( isset( $_REQUEST['my_action'] ) &&  'survey_export' == $_REQUEST['my_action']  ) {
			$sid = $_REQUEST['survey_id'];
			
			$submissions = $wpdb->get_results(
				$wpdb->prepare("SELECT * FROM {$wpdb->prefix}vis_survey_submission WHERE survey_id = %d ORDER BY submission_time",$sid)
			);
			
			$columns = array();
			if (!empty($submissions)){
				$columns = $this->get_columns(reset($submissions));
			}
			
			$rows = array();
			foreach ($submissions as $submission){
				array_push($rows,$this->get_row($submission));
			}

			header('Content-Encoding: UTF-8');
			header('Content-Type: text/csv; charset=UTF-8');			
			header('Content-Disposition: attachment; filename="survey_results_'.$sid.'.csv"');
			//var_dump($columns);
			//var_dump($rows);
			echo $this->to_csv($columns,$rows,';');
			exit;
		}
	}
	
	
	public function survey_submit_handler(){
		global $wpdb;
		$wpdb->insert( 
			$wpdb->prefix . 'vis_survey_submission', 
			array( 
				'survey_id' => $_POST["survey_id"], 
				'submission_time' => date_create()-> format('Y-m-d H:i:s'), 
				'data' => $_POST["data"],
				'metadata' => $_POST["metadata"]
			)
		);
		 wp_redirect( home_url() );
	}
	
	
	
	/**
	 * Installation. Runs on activation.
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	public function install () {
		global $wpdb;
		$this->_log_version_number();
		$table_name = $wpdb->prefix . 'vis_survey_submission';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			survey_id mediumint(9) NOT NULL,
			submission_time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
			data TEXT DEFAULT NULL,
			metadata TEXT DEFAULT NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
		add_option( 'vis_db_version', $vis_db_version );
	} // End install ()

	/**
	 * Log the plugin version number.
	 * @access  public
	 * @since   1.0.0
	 * @return  void
	 */
	private function _log_version_number () {
		update_option( $this->_token . '_version', $this->_version );
	} // End _log_version_number ()

}