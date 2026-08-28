#!/usr/bin/env php
<?php
/**
 * KI:Blick – Wöchentlicher E-Mail-Report
 *
 * Aufruf per Cron: 0 8 * * 1  php /var/www/ki-blick/api/report-cron.php
 * (Jeden Montag um 8:00 Uhr)
 *
 * Kann auch manuell getestet werden: php report-cron.php
 */

require_once __DIR__ . '/config.php';

if (empty(REPORT_EMAIL)) {
    echo "Keine Report-E-Mail konfiguriert (REPORT_EMAIL in config.php).\n";
    exit(1);
}

$db          = getDB();
$weekAgo     = date('Y-m-d', strtotime('-7 days'));
$twoWeeksAgo = date('Y-m-d', strtotime('-14 days'));

// --- Daten sammeln ---

function q(PDO $db, string $sql, array $params = []): int {
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return (int)$stmt->fetchColumn();
}

try {
    // Besuche
    $visitsThisWeek = q($db,
        "SELECT COUNT(*) FROM events WHERE event='page_view' AND event_date >= ?",
        [$weekAgo]);
    $visitsPrevWeek = q($db,
        "SELECT COUNT(*) FROM events WHERE event='page_view' AND event_date >= ? AND event_date < ?",
        [$twoWeeksAgo, $weekAgo]);
    $visitsTotal = q($db,
        "SELECT COUNT(*) FROM events WHERE event='page_view'");

    // Lernaktivität
    $pathsCompleted  = q($db, "SELECT COUNT(*) FROM events WHERE event='path_completed'  AND event_date >= ?", [$weekAgo]);
    $badgesEarned    = q($db, "SELECT COUNT(*) FROM events WHERE event='badge_earned'    AND event_date >= ?", [$weekAgo]);
    $checkoutsDone   = q($db, "SELECT COUNT(*) FROM events WHERE event='checkout_completed' AND event_date >= ?", [$weekAgo]);

    // Feedback nach Kanal
    $feedbackTotal = q($db, "SELECT COUNT(*) FROM feedback WHERE created_at >= ?", [$weekAgo]);
    $stmt = $db->prepare("SELECT channel, COUNT(*) as cnt FROM feedback WHERE created_at >= ? GROUP BY channel");
    $stmt->execute([$weekAgo]);
    $feedbackByChannel = [];
    foreach ($stmt->fetchAll() as $row) {
        $feedbackByChannel[$row['channel']] = (int)$row['cnt'];
    }

    // Problem-Reports
    $stmt = $db->prepare(
        "SELECT id, created_at, area, unit_id, answers, freetext
         FROM feedback WHERE channel = 'problem' AND created_at >= ?
         ORDER BY created_at DESC"
    );
    $stmt->execute([$weekAgo]);
    $problemReports = $stmt->fetchAll();

    // Top-Seiten
    $stmt = $db->prepare(
        "SELECT path, COUNT(*) as cnt FROM events
         WHERE event='page_view' AND event_date >= ? AND path IS NOT NULL
         GROUP BY path ORDER BY cnt DESC LIMIT 10"
    );
    $stmt->execute([$weekAgo]);
    $topPages = $stmt->fetchAll();

} catch (PDOException $e) {
    echo "Datenbankfehler: " . $e->getMessage() . "\n";
    exit(1);
}

// --- Trend-Berechnung ---

function trend(int $thisWeek, int $prevWeek): string {
    if ($prevWeek === 0) {
        return $thisWeek > 0 ? '(neu)' : '';
    }
    $pct = round(($thisWeek - $prevWeek) / $prevWeek * 100);
    if ($pct > 0) return sprintf('↑ +%d%%', $pct);
    if ($pct < 0) return sprintf('↓ %d%%', $pct);
    return '→ ±0%';
}

$visitTrend = trend($visitsThisWeek, $visitsPrevWeek);

// --- E-Mail-Body aufbauen ---

$kw      = date('W');
$dateFmt = date('d.m.Y');

$lines = [];

$lines[] = "KI:Blick – Wochenbericht";
$lines[] = str_repeat('=', 40);
$lines[] = "Zeitraum: $weekAgo bis $dateFmt";
$lines[] = '';

// Besuche
$lines[] = "BESUCHE";
$lines[] = str_repeat('-', 40);
$lines[] = sprintf("Diese Woche:  %d  %s", $visitsThisWeek, $visitTrend);
$lines[] = sprintf("Vorwoche:     %d", $visitsPrevWeek);
$lines[] = sprintf("Gesamt:       %d", $visitsTotal);
$lines[] = '';

// Lernaktivität
$lines[] = "LERNAKTIVITÄT";
$lines[] = str_repeat('-', 40);
$lines[] = sprintf("Lernpfade abgeschlossen:  %d", $pathsCompleted);
$lines[] = sprintf("Badges vergeben:          %d", $badgesEarned);
$lines[] = sprintf("Checkouts gelöst:         %d", $checkoutsDone);
$lines[] = '';

// Feedback
$lines[] = "FEEDBACK";
$lines[] = str_repeat('-', 40);
if ($feedbackTotal === 0) {
    $lines[] = "Kein neues Feedback diese Woche.";
} else {
    $lines[] = sprintf("Gesamt diese Woche:  %d", $feedbackTotal);
    $lines[] = sprintf("  Mikro-Feedback:    %d", $feedbackByChannel['micro']      ?? 0);
    $lines[] = sprintf("  Lernpfad-Feedback: %d", $feedbackByChannel['completion'] ?? 0);
    $lines[] = sprintf("  Problem-Meldungen: %d", $feedbackByChannel['problem']    ?? 0);
}
$lines[] = '';

// Problem-Reports
if (!empty($problemReports)) {
    $lines[] = "PROBLEM-MELDUNGEN";
    $lines[] = str_repeat('-', 40);
    foreach ($problemReports as $r) {
        $answers    = json_decode($r['answers'], true) ?? [];
        $ptype      = $answers['problemType'] ?? '–';
        $severity   = $answers['severity'] ?? '–';
        $freitext   = $r['freetext'] ? '"' . $r['freetext'] . '"' : '(kein Freitext)';
        $createdAt  = date('d.m.Y H:i', strtotime($r['created_at']));
        $lines[] = sprintf("#%d  [%s]  Schwere: %s", $r['id'], $ptype, $severity);
        $lines[] = sprintf("  Bereich: %s / %s", $r['area'], $r['unit_id']);
        $lines[] = "  $freitext";
        $lines[] = "  Gemeldet: $createdAt";
        $lines[] = '';
    }
}

// Top-Seiten
if (!empty($topPages)) {
    $lines[] = "TOP-10 SEITEN";
    $lines[] = str_repeat('-', 40);
    foreach ($topPages as $i => $row) {
        $lines[] = sprintf("%2d. %-45s (%d Aufrufe)", $i + 1, $row['path'] ?? '/', (int)$row['cnt']);
    }
    $lines[] = '';
}

$lines[] = str_repeat('-', 40);
$lines[] = "Dieser Bericht wurde automatisch generiert.";
$lines[] = "Dashboard: https://ki-blick.kmz-es.de/api/dashboard.php";

$body = implode("\n", $lines);

// --- E-Mail senden ---

$subject = sprintf('KI:Blick Wochenbericht KW%s – %s', $kw, $dateFmt);
$headers = implode("\r\n", [
    'From: noreply@kmz-es.de',
    'Content-Type: text/plain; charset=utf-8',
    'X-Mailer: KI-Blick-Report',
]);

$sent = mail(REPORT_EMAIL, $subject, $body, $headers);

if ($sent) {
    echo "Report gesendet an " . REPORT_EMAIL . " (" . date('Y-m-d H:i:s') . ")\n";
} else {
    echo "Fehler beim Senden der E-Mail!\n";
    exit(1);
}
