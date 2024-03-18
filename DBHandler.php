<?php 
namespace DBManager;
require __DIR__ .'/DBConnector.php';

use DBConnector;
use Firebase\JWT\JWT;

class DBHandler extends DBConnector{

    // 간단한 회원가입
    public function sp_insert_Member($UUID,$ID,$PW)
    {
        $error = "E0000";

        if(!($stmt = $this->db->prepare("CALL sp_insert_Member(?,?,?)"))){
            $error = "E1000";
        }
        if(!$stmt->bind_param("sss", $UUID,$ID,$PW)){
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

    
}

?>