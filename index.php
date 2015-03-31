<?php
require 'vendor/autoload.php';

$app = new \Slim\Slim(array(
    'templates.path' => './public/views'
));

$app->get('/', function () use ($app){
    $app->render('index.html');
});
$app->run();
