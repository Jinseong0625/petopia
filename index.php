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

// 회원가입
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

// 강아지 생성
$app->post('/dog', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$midx = $params['midx'];
	$name = $params['name'];
	$age = $params['age'];
    $color = $params['color'];
    $mbti = $params['mbti'];
    $sexual = $params['sexual'];
	if($midx == null)
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
		$row = $api->sp_insert_dog($midx,$name,$age,$color,$sexual,$mbti);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

// 인벤토리 아이템 넣기
$app->post('/inven', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$midx = $params['midx'];
	$rcode = $params['rcode'];
	$name = $params['name'];
    $price = $params['price'];
    $type = $params['type'];
	if($midx == null)
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
		$row = $api->sp_insert_Inventory($midx,$rcode,$name,$price,$type);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

// 인벤토리 아이템 넣기
$app->post('/wallet', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$midx = $params['midx'];
	$gold = $params['gold'];
	$gem = $params['gem'];
	if($midx == null)
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
		$row = $api->sp_insert_Wallet($midx,$gold,$gem);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

//Meta

// Meta 코디
$app->post('/meta/coordi', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$rcode = $params['gold'];
	$name = $params['gem'];
	if($rcode == null)
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
		$row = $api->sp_insert_MetaCoordi($rcode,$name);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

// Meta 가구
$app->post('/meta/furni', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$rcode = $params['gold'];
	$name = $params['gem'];
    $price = $params['price'];
	if($rcode == null)
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
		$row = $api->sp_insert_MetaDog_furni($rcode,$name,$price);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

// Meta 음식
$app->post('/meta/food', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$rcode = $params['gold'];
	$name = $params['gem'];
	if($rcode == null)
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
		$row = $api->sp_insert_MetaFood($rcode,$name);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

// Meta 음식
$app->post('/meta/petdata', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$rcode = $params['gold'];
	$name = $params['gem'];
    $petType = $params['petType'];
	if($rcode == null)
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
		$row = $api->sp_insert_MetaPatDatas($rcode,$name,$petType);

		if (is_array($row)) {
			$row = json_encode($row);
		}
	}
	
	$response->getBody()->write($row);
	return $response;
});

// Meta 음식
$app->post('/meta/room', function ($request, $response, $args) use($api) 
{
	$params = $request->getParsedBody();
	$rcode = $params['gold'];
	$name = $params['gem'];
	if($rcode == null)
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
		$row = $api->sp_insert_MetaRoom($rcode,$name);

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