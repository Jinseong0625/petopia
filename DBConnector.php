<?php

class DBConnector {    
    protected $db; 

    function __construct() {
        $this->db = $this->connectDB();
    }

    function __destruct() {
        mysqli_close($this->connectDB());
    }

    private function connectDB() {        
        $conn = new mysqli(_HOST_, _USER_, _PWD_, _DB_, _PORT_);
        return $conn;
    }

}

?>