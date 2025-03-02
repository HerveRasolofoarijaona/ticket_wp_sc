<?php
/**
 * Plugin Name: WP React Ticket Manager
 * Description: A ticket management system built with React
 * Version: 4.0
 * Author: Hervé RASOLOFOARIJAONA
 * Author URI: https://github.com/HerveRasolofoarijaona/ticket_wp_sc
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

function wrm_enqueue_scripts() {
    wp_enqueue_script('wp-react-ticket-manager', plugin_dir_url(__FILE__) . 'build/static/js/main.js', array(), '1.0', true);
    wp_enqueue_style('wp-react-ticket-manager', plugin_dir_url(__FILE__) . 'build/static/css/main.css');
    wp_localize_script('wp-react-ticket-manager', 'wrmData', array(
        'nonce' => wp_create_nonce('wp_rest'),
        'siteUrl' => get_site_url(),
        'userId' => get_current_user_id()
    ));
}
add_action('wp_enqueue_scripts', 'wrm_enqueue_scripts');

function wrm_shortcode() {
    return '<div id="wp-react-ticket-manager"></div>';
}
add_shortcode('react_ticket_manager', 'wrm_shortcode');

// Register REST API endpoints
function wrm_register_rest_routes() {
    register_rest_route('wrm/v1', '/tickets', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_tickets',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    register_rest_route('wrm/v1', '/tickets', array(
        'methods' => 'POST',
        'callback' => 'wrm_create_ticket',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    register_rest_route('wrm/v1', '/tickets/(?P<id>\d+)', array(
        'methods' => 'PUT',
        'callback' => 'wrm_update_ticket',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    register_rest_route('wrm/v1', '/tickets/(?P<id>\d+)/comments', array(
        'methods' => 'POST',
        'callback' => 'wrm_add_comment',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));

    register_rest_route('wrm/v1', '/tickets/user/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_user_tickets',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        }
    ));
}
add_action('rest_api_init', 'wrm_register_rest_routes');

// Implement REST API callbacks
function wrm_get_tickets() {
    // Implement fetching tickets from the database
    // For now, return mock data
    return array(
        array('id' => 1, 'title' => 'Issue 1', 'status' => 'open', 'description' => 'Description 1'),
        array('id' => 2, 'title' => 'Issue 2', 'status' => 'in-progress', 'description' => 'Description 2'),
        array('id' => 3, 'title' => 'Issue 3', 'status' => 'closed', 'description' => 'Description 3'),
        array('id' => 4, 'title' => 'Issue 4', 'status' => 'closed', 'description' => 'Description 3'),
    );
}

function wrm_create_ticket($request) {
    $params = $request->get_params();
    // Implement creating a new ticket in the database
    // For now, just return the received data with a mock ID
    return array_merge(array('id' => 4), $params);
}

function wrm_update_ticket($request) {
    $id = $request['id'];
    $params = $request->get_params();
    // Implement updating the ticket in the database
    // For now, just return the received data
    return array_merge(array('id' => $id), $params);
}

function wrm_add_comment($request) {
    $id = $request['id'];
    $params = $request->get_params();
    // Implement adding a comment to the ticket in the database
    // For now, just return a success message
    return array('success' => true, 'message' => 'Comment added successfully');
}

function wrm_get_user_tickets($request) {
    $user_id = $request['id'];
    // Implement fetching user-specific tickets from the database
    // For now, return mock data
    return array(
        array('id' => 1, 'title' => 'User Issue 1', 'status' => 'open', 'description' => 'User Description 1', 'userId' => $user_id),
        array('id' => 2, 'title' => 'User Issue 2', 'status' => 'open', 'description' => 'User Description 2', 'userId' => $user_id),
    );
}

// code court [react_ticket_manager]

// Add shortcode to display customer ID

add_shortcode('display_customer_id', 'display_customer_id_function');

function display_customer_id_function() {
    // Check if the user is logged in
    if (is_user_logged_in()) {
        $user_id = get_current_user_id(); // Get current user ID

        $customer_id = get_user_meta($user_id, 'sc_customer_ids', true); // Retrieve customer ID

        $values = array_values($customer_id);
        $firstValue = $values[0];

        $product_id ='1d19efd3-ff32-40e4-80d9-c97421974f16';

        $authorization_token ='st_ZzwcuEa23mFZbMRPTX4EjMqp';

        $subscriptions = fetch_surecart_subscription_data($firstValue,$product_id,$authorization_token);

        if ($subscriptions) {
            echo '<pre>';
            print_r($subscriptions['data'][0]);
            echo '</pre>';
        } else {
            echo 'Aucune donnée disponible ou erreur lors de la requête.';
        }

        /*

        if ($customer_id) { 
            return "Your Customer ID is: ".$firstValue;
        } else {
            return "No Customer ID found for your account";
        }
            
        */
    } else {
        return "You need to be logged in to view your Customer ID.";
    }
}

// ref => https://developer.surecart.com/reference/retrieve_customer

function fetch_surecart_subscription_data($customer_id,$product_id,$authorization_token) {
    // L'URL de l'API
    $url = 'https://api.surecart.com/v1/subscriptions?customer_ids[]='.$customer_id.'&product_ids[]='.$product_id;

    // Les headers pour la requête
    $args = array(
        'headers' => array(
            'Authorization' => $authorization_token,
        ),
    );

    // Effectuer la requête GET
    $response = wp_remote_get($url, $args);

    // Vérifier si la requête a réussi
    if (is_wp_error($response)) {
        // Gestion des erreurs
        error_log('Erreur lors de la requête SureCart : ' . $response->get_error_message());
        return null;
    }

    // Récupérer le corps de la réponse
    $data = wp_remote_retrieve_body($response);

    // Décoder le JSON en tableau PHP
    $subscriptions = json_decode($data, true);

    // Retourner ou utiliser les données
    return $subscriptions;
}