<?php 
namespace DBManager;
require __DIR__ .'/DBConnector.php';

use DBConnector;
use Firebase\JWT\JWT;

class DBHandler extends DBConnector{

    // insert

    // 간단한 회원가입
    public function sp_insert_Member($UUID,$ID,$PW,$nickname,$sexual,$mbti)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_Member(?,?,?,?,?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ssssis", $UUID,$ID,$PW,$nickname,$sexual,$mbti)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // 강아지 생성
    public function sp_insert_dog($midx,$name,$age,$color,$mbti,$sexual)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_dog(?,?,?,?,?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ssissi", $midx,$name,$age,$color,$mbti,$sexual)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // 인벤토리 아이템 넣기
    public function sp_insert_Inventory($midx,$rcode,$name,$price,$type)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_Inventory(?,?,?,?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("sssii", $midx,$rcode,$name,$price,$type)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // 재화 넣기
    public function sp_insert_Wallet($midx,$gold,$gem)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_Wallet(?,?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("sii", $midx,$gold,$gem)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // Meta Insert

    // Meta 코디 생성
    public function sp_insert_MetaCoordi($rcode,$name)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_MetaCoordi(?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ss", $rcode,$name)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // Meta 가구 생성
    public function sp_insert_MetaDog_furni($rcode,$name,$price)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_MetaDog_furni(?,?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ssi", $rcode,$name,$price)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // Meta 음식 생성
    public function sp_insert_MetaFood($rcode,$name)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_MetaFood(?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ss", $rcode,$name)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // Meta 펫 데이터 생성
    public function sp_insert_MetaPatDatas($rcode,$name,$petType)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_MetaPatDatas(?,?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ssi", $rcode,$name,$petType)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // Meta 룸 정보 생성
    public function sp_insert_MetaRoom($rcode,$name)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_MetaRoom(?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ss", $rcode,$name)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // select

    // 회원 조회
    public function sp_select_Member($midx)
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_Member(?)"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->bind_param("s", $midx)) {
            $error = "E1001"; // Bind failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // 강아지 조회
    public function sp_select_dog($didx,$midx)
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_dog(?,?)"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->bind_param("ss", $didx,$midx)) {
            $error = "E1001"; // Bind failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // 인벤토리 전체 조회
    public function sp_select_Inventory_all($midx)
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_Inventory_all(?)"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->bind_param("s", $midx)) {
            $error = "E1001"; // Bind failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // 인벤토리 코디 조회
    public function sp_select_Inventory_Coordi($midx)
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_Inventory_Coordi(?)"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->bind_param("s", $midx)) {
            $error = "E1001"; // Bind failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // 인벤토리 푸드 조회
    public function sp_select_Inventory_food($midx)
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_Inventory_food(?)"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->bind_param("s", $midx)) {
            $error = "E1001"; // Bind failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // 인벤토리 가구 조회
    public function sp_select_Inventory_furni($midx)
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_Inventory_furni(?)"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->bind_param("s", $midx)) {
            $error = "E1001"; // Bind failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // S3 저장된 filename & 루트
    public function sp_select_image()
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_image()"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // Meta Select

    // Meta 코디 조회
    public function sp_select_MetaCoordi()
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_MetaCoordi()"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // Meta 가구 조회
    public function sp_select_MetaDog_furni()
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_MetaDog_furni()"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // Meta 음식 조회
    public function sp_select_MetaFood()
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_MetaFood()"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // Meta 펫 데이터 조회
    public function sp_select_MetaPatDatas()
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_MetaPatDatas()"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // Meta 룸 조회
    public function sp_select_MetaRoom()
    {
        $error = "E0000";

        if (!($stmt = $this->db->prepare("CALL sp_select_MetaRoom()"))) {
            $error = "E1000"; // Prepare failed
        }
        if (!$stmt->execute()) {
            $error = "E1002"; // Execute failed
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array(
            "error" => $error,
            "data" => $data
        );

        return json_encode($json_data);
    }

    // update

    // 강아지 이름 변경
    public function sp_update_dog_name($name,$midx)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_update_dog_name(?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ss", $name,$midx)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }

    // 유저 닉네임 변경
    public function sp_update_nickname($nickname,$midx)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_update_nickname(?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("ss", $nickname,$midx)){
            $error = "E1001";
        }
        if(!$stmt->execute()){
            $error = "E1002";
        }

        $res = $stmt->get_result();
        $data = array();

        while($row = $res->fetch_assoc()){
            $data[] = $row;
        }

        $json_data = array
        (
            "error" => $error,
            "data" => $data
        );

        return $json_data;
    }
    
}

?>