<?php 
require __DIR__ . '/global_var.php';
require __DIR__ . '/vendor/autoload.php';
require __DIR__ .'/DBHandler.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Psr\Container\ContainerInterface;
use Slim\Factory\AppFactory;
use Slim\Views\PhpRenderer;
use DBManager\DBHandler;

$app = AppFactory::create();
$api = new DBHandler();

// Add body parsing middleware
$app->addBodyParsingMiddleware();

// Set base path
$app->setBasePath("/petopia");

session_start();

$app->get('/image', function ($request, $response, $args) use($api) {
	$row = $api->sp_select_image();
	$response->getBody()->write($row);
	return $response;
});

$app->post('/member', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$UUID = $params['UUID'];
	$ID = $params['ID'];
	$PW = $params['PW'];
    $nickname = $params['nickname'];
    $sexual = $params['sexual'];
    $mbti = $params['mbti'];
	if($UUID == null)
	{
		$json_data = array
        (
            "error" => "E1003",
            "data" => ""
        );

		$row = json_encode($json_data);
	}
	else
	{
		$row = $api->sp_insert_Member($UUID,$ID,$PW,$nickname,$sexual,$mbti);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

$app->get('/member/{midx}', function ($request, $response, $args) use($api) 
{	
	$midx = $request->getAttribute('midx');
	$row = $api->sp_select_Member($midx);
	$response->getBody()->write($row);
	return $response;
});

$app->run();

?>