<?php
// ── Salesdock Appointments API ───────────────────────────────────────────────
// Upload to: /public_html/appointments/api.php on Vimmex
// Run the TABLE SQL once in phpMyAdmin, fill in the 4 config values, done.

// ── CONFIG ────────────────────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'tiptop2026_endgame');
define('DB_USER', 'tiptop2026_endgame');
define('DB_PASS', 'dcc7a3q2G7YS7EhLpEcX');
define('API_PIN', '3636');
// ─────────────────────────────────────────────────────────────────────────────

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-pin');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function checkPin() {
    $pin = $_SERVER['HTTP_X_PIN'] ?? $_GET['pin'] ?? '';
    if ($pin !== API_PIN) { http_response_code(401); echo json_encode(['error'=>'Ongeldige PIN']); exit; }
}

function db() {
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    return $pdo;
}

$method = $_SERVER['REQUEST_METHOD'];
$path   = trim(preg_replace('#^.*api\.php/?#', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''), '/');
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

// POST /auth
if ($method === 'POST' && $path === 'auth') {
    echo json_encode(($body['pin'] ?? '') === API_PIN ? ['ok'=>true] : (http_response_code(401) && ['error'=>'Ongeldige PIN']));
    exit;
}

checkPin();

// GET /appointments
if ($method === 'GET' && ($path === 'appointments' || $path === '')) {
    $where=[]; $params=[];
    if (!empty($_GET['status']))  { $where[]='status = ?';  $params[]=$_GET['status']; }
    if (!empty($_GET['lead_id'])) { $where[]='lead_id = ?'; $params[]=$_GET['lead_id']; }
    $sql = 'SELECT * FROM appointments'.($where?' WHERE '.implode(' AND ',$where):'').' ORDER BY call_at ASC';
    $st = db()->prepare($sql); $st->execute($params);
    echo json_encode($st->fetchAll()); exit;
}

// POST /appointments
if ($method === 'POST' && $path === 'appointments') {
    if (empty($body['lead_name']) || empty($body['call_at'])) {
        http_response_code(400); echo json_encode(['error'=>'lead_name en call_at zijn verplicht']); exit;
    }
    $st = db()->prepare('INSERT INTO appointments (lead_id,lead_name,kvk,contact,address,postcode,city,phone,call_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?)');
    $st->execute([$body['lead_id']??null, $body['lead_name'], $body['kvk']??null, $body['contact']??null,
                  $body['address']??null, $body['postcode']??null, $body['city']??null,
                  $body['phone']??null, $body['call_at'], $body['notes']??null]);
    $row = db()->query('SELECT * FROM appointments WHERE id = '.(int)db()->lastInsertId())->fetch();
    http_response_code(201); echo json_encode($row); exit;
}

// /appointments/{id}
if (preg_match('#^appointments/(\d+)$#', $path, $m)) {
    $id = (int)$m[1];
    $row = db()->query('SELECT * FROM appointments WHERE id = '.$id)->fetch();
    if (!$row) { http_response_code(404); echo json_encode(['error'=>'Niet gevonden']); exit; }

    if ($method === 'PATCH') {
        $sets=[]; $params=[];
        foreach (['call_at','notes','status','kvk','contact','address','postcode','city','phone'] as $f) {
            if (array_key_exists($f, $body)) { $sets[]="$f = ?"; $params[]=$body[$f]; }
        }
        if ($sets) { $params[]=$id; db()->prepare('UPDATE appointments SET '.implode(', ',$sets).' WHERE id = ?')->execute($params); }
        echo json_encode(db()->query('SELECT * FROM appointments WHERE id = '.$id)->fetch()); exit;
    }
    if ($method === 'DELETE') {
        db()->prepare('DELETE FROM appointments WHERE id = ?')->execute([$id]);
        echo json_encode(['ok'=>true]); exit;
    }
}

if ($method === 'GET' && $path === 'health') { echo json_encode(['ok'=>true]); exit; }
http_response_code(404); echo json_encode(['error'=>'Route niet gevonden']);