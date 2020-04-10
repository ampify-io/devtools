<?php
/**
 * Plugin Name: Ampify.io AMP
 * Plugin URI: https//ampify.io/plugins/wp
 * Description: Ampify.io AMP
 * Version: 1.0.9
 * Author: Ampify LTD
 * Author URI: https://ampify.io
 */
class AmpifyPlugin {
  public $ampify_url = "https://convert.ampify.io/{PID}?u={URL}";
  public $menu_id;

  public function __construct() {
    add_action('admin_menu', array($this, 'add_admin_menu'));
    add_action('admin_init', array($this, 'register_settings'));

    if (get_option('ampify_is_active') && get_option('ampify_project_id')) {
      if ($this->isPageIncluded() && !$this->isPageExcluded()) {
        add_action('wp_head', array($this, 'wp_head_hook'));
      } else {
      }
    }

    if ($this->is_amp()) {
      //$this->generate_amp();
      ob_start(array($this, 'generate_amp'));
    }
  }

  private function isGlobMatch($pattern, $input) {
    $rx = preg_replace_callback(
      '/([.?+^$[\]\\(){}|\/-])/',
      function ($match) {
        return '\\' . $match[1];
      },
      $pattern
    );
    $rx = '/' . preg_replace('/\*/', '.*', $rx) .'$/';

    return preg_match($rx, $input);
  }

  public function isPageIncluded() {
    $included = trim(get_option('ampify_include_urls'));
    $request_uri = $_SERVER['REQUEST_URI'];
    
    if ($included) {
      $included = explode("\n", $included);

      foreach ($included as $include) {
        $include = trim($include);

        if ($this->isGlobMatch($include, $request_uri)) {
          return true;
        }
      }

      return false;
    }

    return true;
  }

  public function isPageExcluded() {
    $excluded = get_option('ampify_exclude_urls');
    $request_uri = $_SERVER['REQUEST_URI'];

    if ($excluded) {
      $excluded = explode("\n", $excluded);

      foreach ($excluded as $exclude) {
        $exclude = trim($exclude);
 
        if ($this->isGlobMatch($exclude, $request_uri)) {
          return true;
        }
      }
  
    }

    return false;
  }

  public function generate_amp() {
    $site_base = $this->getBaseUrl();
    $request_uri = $_SERVER['REQUEST_URI'];
    $request_uri = preg_replace("/(?:\&|\?)ampify/", "", $request_uri);
    $projectId = get_option('ampify_project_id');

    $url = $this->ampify_url;
    $url = str_replace('{PID}', $projectId, $url);
    $url = str_replace('{URL}', urldecode($site_base . $request_uri), $url);

    $response = wp_remote_get($url);
    $amp = wp_remote_retrieve_body($response);

    return $amp;
  }

  public function wp_head_hook() {
    $site_base = $this->getBaseUrl();
    $request_uri = $_SERVER['REQUEST_URI'];
    $amp_url = $site_base . $request_uri . (preg_match("/\?/", $request_uri) ? '&' : '?') . 'ampify';

    echo '<link rel="amphtml" href="'. $amp_url .'">';
  }

  public function is_amp() {
    $request_uri = $_SERVER['REQUEST_URI'];

    if (preg_match("/(?:\&|\?)ampify/", $request_uri)) {
      return true;
    }

    return false;
  }

  public function getBaseUrl() {
    $protocol = $this->getProtocol();
    $host = $_SERVER['HTTP_HOST'];
    
    return $protocol . '://' . $host;
  }

  public function getProtocol() {
    if(isset($_SERVER['HTTPS'])){
      $protocol = ($_SERVER['HTTPS'] && $_SERVER['HTTPS'] != 'off') ? 'https' : 'http';
    }
    else{
      $protocol = 'http';
    }

    return $protocol;
  }

  public function add_admin_menu() {
    $this->menu_id = add_management_page( 'Ampify', 'Ampify', 'manage_options', 'ampify-io-amp', array( $this, 'ampify_settings' ) );
  }

  public function register_settings() {
    register_setting( 'ampify_settings', 'ampify_is_active' );
    register_setting( 'ampify_settings', 'ampify_project_id' );
    register_setting( 'ampify_settings', 'ampify_exclude_urls' );
    register_setting( 'ampify_settings', 'ampify_include_urls' );
  }

  

  public function ampify_settings() {
    ?>
    <style>
    .ampify-container {
      padding: 20px;
    }

    .ampify-container th {
      text-align: left;
    }

    .ampify_include_urls, .ampify_exclude_urls {
      width: 400px;
      height: 120px;
    }

    .explain {
      margin-bottom: 10px;
      font-weight: 600;
      font-size: 12px;
    }

    .ampify-table td {
      padding: 5px 0;
    }

    .note {
      color: #ff3333;
      font-size:10px;
      padding-left: 5px;
    }
    </style>

    <div class="ampify-container" style="padding:20px">
      <h2>Ampify Settings</h2>
      
      <form method="post" action="options.php">
        <?php settings_fields( 'ampify_settings' ); ?>
        <table class="ampify-table">
          <tr valign="top">
            <th scope="row"><label for="ampify_is_active">Active: </label></th>
            <td><input type="checkbox" id="ampify_is_active" name="ampify_is_active" value="1" <?php if (get_option('ampify_is_active')) { echo "checked"; } ?> /></td>
          </tr>

          <tr valign="top">
            <th scope="row"><label for="ampify_project_id">Ampify Project Id: </label></th>
            <td><input type="text" id="ampify_project_id" name="ampify_project_id" value="<?php echo get_option('ampify_project_id'); ?>" /></td>
          </tr>

          <tr valign="top">
            <th scope="row"><label for="ampify_include_urls">Include urls: </label></th>
            <td>
              <div class="explain">Include pages in AMP</div>
              <textarea id="ampify_include_urls" name="ampify_include_urls" class="ampify_include_urls"><?php echo get_option('ampify_include_urls')?></textarea>
              <div class="explain">
                /my-article/ -  include a specific url <strong class="note">*url must end with /</strong><br />
                /blog/* - include all urls under /blog/<br />
                Add multiple inclusions with new line<br />
                Leave this field empty to apply AMP on all pages.
              </div>
            </td>
          </tr>

          <tr valign="top">
            <th scope="row"><label for="ampify_exclude_urls">Exclude urls: </label></th>
            <td>
              <div class="explain">Exclude pages from AMP</div>
              <textarea id="ampify_exclude_urls" name="ampify_exclude_urls" class="ampify_exclude_urls"><?php echo get_option('ampify_exclude_urls')?></textarea>
              <div class="explain">
                Excluded URLs will be excluded even if defined as Included. <br />
                For example: When /blog/* is added to include and /blog/single-article/ is added as exclude, <br />
                all /blog/* pages will be Ampfied, excluding /blog/single-article/
              </div>
            </td>
          </tr>
        </table>
        <?php submit_button(); ?>
      </form>
    </div>
  <?php
  }
}

$GLOBALS["ampify-plugin"] = new AmpifyPlugin();
?>