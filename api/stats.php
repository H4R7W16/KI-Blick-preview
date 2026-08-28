<?php
/**
 * GET /api/stats.php
 *
 * Gibt aggregierte öffentliche Statistiken zurück.
 * Für die Landing Page – keine sensiblen Daten.
 * Cache: 5 Minuten.
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(405, ['error' => 'Method not allowed']);
}

try {
    $db = getDB();

    $stmt = $db->query(
        "SELECT event, COUNT(*) as cnt FROM events GROUP BY event"
    );
    $rows = $stmt->fetchAll();

    $counts = [];
    foreach ($rows as $row) {
        $counts[$row['event']] = (int)$row['cnt'];
    }

    $result = [
        'pageViews' => $counts['page_view'] ?? 0,
        'pathsCompleted' => $counts['path_completed'] ?? 0,
        'badgesEarned' => $counts['badge_earned'] ?? 0,
        'checkoutsCompleted' => $counts['checkout_completed'] ?? 0,
    ];

    header('Cache-Control: public, max-age=300');
    jsonResponse(200, $result);

} catch (PDOException $e) {
    error_log('KI:Blick stats DB error: ' . $e->getMessage());
    jsonResponse(500, ['error' => 'Internal error']);
}
