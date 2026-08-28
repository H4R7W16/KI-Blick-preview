<?php
/**
 * POST /api/feedback.php
 *
 * Nimmt Feedback-Payloads entgegen und speichert sie in der DB.
 * Erwarteter JSON-Body:
 * {
 *   "channel": "micro|completion|problem",
 *   "area": "verstehen|entdecken|einordnen|lernen",
 *   "unit_id": "string (max 100)",
 *   "answers": { ... },
 *   "role": "lehrkraft|lernende|other|null",
 *   "freetext": "string|null (max 500)"
 * }
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

// Nur POST erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['error' => 'Method not allowed']);
}

// Rate-Limiting
if (isRateLimited()) {
    jsonResponse(429, ['error' => 'Too many requests']);
}

// JSON-Body lesen
$raw = file_get_contents('php://input');
if (!$raw || strlen($raw) > 10240) {
    jsonResponse(400, ['error' => 'Invalid request body']);
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    jsonResponse(400, ['error' => 'Invalid JSON']);
}

// Validierung
$validChannels = ['micro', 'completion', 'problem'];
$validAreas = ['verstehen', 'entdecken', 'einordnen', 'lernen'];
$validRoles = ['lehrkraft', 'lernende', 'other', null];

$channel = $data['channel'] ?? null;
$area = $data['area'] ?? null;
$unitId = $data['unit_id'] ?? null;
$answers = $data['answers'] ?? null;
$role = array_key_exists('role', $data) ? $data['role'] : null;
$freetext = $data['freetext'] ?? null;

if (!in_array($channel, $validChannels, true)) {
    jsonResponse(400, ['error' => 'Invalid channel']);
}
if (!in_array($area, $validAreas, true)) {
    jsonResponse(400, ['error' => 'Invalid area']);
}
if (!is_string($unitId) || strlen($unitId) === 0 || strlen($unitId) > 100) {
    jsonResponse(400, ['error' => 'Invalid unit_id']);
}
if (!is_array($answers) || array_is_list($answers)) {
    jsonResponse(400, ['error' => 'Invalid answers (must be object)']);
}
if ($role !== null && !in_array($role, $validRoles, true)) {
    jsonResponse(400, ['error' => 'Invalid role']);
}

// Freitext bereinigen
$cleanFreetext = null;
if (is_string($freetext) && trim($freetext) !== '') {
    $cleanFreetext = mb_substr(stripHtmlTags($freetext), 0, 500);
}

// In DB speichern
try {
    $db = getDB();
    $stmt = $db->prepare(
        'INSERT INTO feedback (channel, area, unit_id, role, answers, freetext)
         VALUES (:channel, :area, :unit_id, :role, :answers, :freetext)'
    );
    $stmt->execute([
        ':channel' => $channel,
        ':area' => $area,
        ':unit_id' => trim($unitId),
        ':role' => $role,
        ':answers' => json_encode($answers, JSON_UNESCAPED_UNICODE),
        ':freetext' => $cleanFreetext,
    ]);
    jsonResponse(201, ['ok' => true]);
} catch (PDOException $e) {
    error_log('KI:Blick feedback DB error: ' . $e->getMessage());
    jsonResponse(500, ['error' => 'Database error']);
}
