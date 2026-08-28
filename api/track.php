<?php
/**
 * POST /api/track.php
 *
 * Speichert anonyme Events für einfaches Usage-Tracking.
 * Kein User-Agent, keine IP in der DB. Nur Event-Typ + Pfad + Datum.
 *
 * Erwarteter JSON-Body:
 * {
 *   "event": "page_view|path_completed|badge_earned|checkout_completed",
 *   "path": "/verstehen/vom-text-zum-bild",   (optional)
 *   "meta": { "pathId": "wer-unterrichtet" }   (optional)
 * }
 *
 * Antwort: 204 No Content (Fire-and-forget)
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['error' => 'Method not allowed']);
}

if (isRateLimited()) {
    http_response_code(429);
    exit;
}

$raw = file_get_contents('php://input');
if (!$raw || strlen($raw) > 4096) {
    http_response_code(400);
    exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    exit;
}

$validEvents = ['page_view', 'path_completed', 'badge_earned', 'checkout_completed'];
$event = $data['event'] ?? null;

if (!in_array($event, $validEvents, true)) {
    http_response_code(400);
    exit;
}

$path = isset($data['path']) && is_string($data['path'])
    ? mb_substr(stripHtmlTags($data['path']), 0, 200)
    : null;

$meta = isset($data['meta']) && is_array($data['meta']) && !array_is_list($data['meta'])
    ? json_encode($data['meta'], JSON_UNESCAPED_UNICODE)
    : null;

try {
    $db = getDB();
    $stmt = $db->prepare(
        'INSERT INTO events (event, path, meta, event_date)
         VALUES (:event, :path, :meta, CURDATE())'
    );
    $stmt->execute([
        ':event' => $event,
        ':path' => $path,
        ':meta' => $meta,
    ]);
    http_response_code(204);
} catch (PDOException $e) {
    error_log('KI:Blick track DB error: ' . $e->getMessage());
    http_response_code(500);
}
