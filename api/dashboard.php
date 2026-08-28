<?php
/**
 * KI:Blick – Admin Dashboard
 * GET  /api/dashboard.php               – Dashboard anzeigen
 * POST /api/dashboard.php?action=mark_seen&id=N – Feedback als gesehen markieren
 * GET  /api/dashboard.php?export=csv    – Feedback als CSV herunterladen
 */

require_once __DIR__ . '/config.php';

// --- HTTP Basic Auth ---
if (DASHBOARD_PASS === ''
    || !isset($_SERVER['PHP_AUTH_USER'])
    || $_SERVER['PHP_AUTH_USER'] !== DASHBOARD_USER
    || $_SERVER['PHP_AUTH_PW']  !== DASHBOARD_PASS) {
    header('WWW-Authenticate: Basic realm="KI:Blick Dashboard"');
    http_response_code(401);
    echo '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem"><h1>401 – Zugang verweigert</h1></body></html>';
    exit;
}

$db = getDB();

// --- Action: mark_seen ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'mark_seen') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id > 0) {
        $stmt = $db->prepare('UPDATE feedback SET seen = 1 WHERE id = :id AND channel = \'problem\'');
        $stmt->execute([':id' => $id]);
    }
    // Redirect zurück mit denselben GET-Parametern minus action/id
    $params = $_GET;
    unset($params['action'], $params['id']);
    header('Location: dashboard.php' . ($params ? '?' . http_build_query($params) : ''));
    exit;
}

// --- Filter-Parameter ---
$filterChannel = in_array($_GET['channel'] ?? '', ['micro', 'completion', 'problem'], true)
    ? $_GET['channel'] : '';
$filterArea = in_array($_GET['area'] ?? '', ['verstehen', 'entdecken', 'einordnen', 'lernen'], true)
    ? $_GET['area'] : '';
$filterDays = in_array((int)($_GET['days'] ?? 0), [7, 30, 90], true)
    ? (int)$_GET['days'] : 0;
$sortCol  = in_array($_GET['sort'] ?? '', ['created_at', 'channel', 'area', 'unit_id', 'role'], true)
    ? $_GET['sort'] : 'created_at';
$sortDir  = ($_GET['dir'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
$page     = max(1, (int)($_GET['page'] ?? 1));
$perPage  = 25;
$activeTab = ($_GET['tab'] ?? '') === 'problems' ? 'problems' : 'overview';

// --- CSV Export ---
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="ki-blick-feedback-' . date('Y-m-d') . '.csv"');
    echo "\xEF\xBB\xBF"; // UTF-8 BOM für Excel

    $where  = buildWhereClause($filterChannel, $filterArea, $filterDays);
    $params = buildWhereParams($filterChannel, $filterArea, $filterDays);
    $stmt   = $db->prepare("SELECT id, created_at, channel, area, unit_id, role, answers, freetext, seen FROM feedback $where ORDER BY created_at DESC");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID', 'Datum', 'Kanal', 'Bereich', 'Einheit', 'Rolle', 'Antworten', 'Freitext', 'Gesehen'], ';');
    foreach ($rows as $row) {
        fputcsv($out, [
            $row['id'],
            $row['created_at'],
            $row['channel'],
            $row['area'],
            $row['unit_id'],
            $row['role'] ?? '',
            $row['answers'],
            $row['freetext'] ?? '',
            $row['seen'] ? 'ja' : 'nein',
        ], ';');
    }
    fclose($out);
    exit;
}

// --- Helper: WHERE-Klausel ---
function buildWhereClause(string $channel, string $area, int $days): string {
    $parts = [];
    if ($channel !== '') $parts[] = 'channel = :channel';
    if ($area    !== '') $parts[] = 'area = :area';
    if ($days    > 0)    $parts[] = 'created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)';
    return $parts ? 'WHERE ' . implode(' AND ', $parts) : '';
}

function buildWhereParams(string $channel, string $area, int $days): array {
    $p = [];
    if ($channel !== '') $p[':channel'] = $channel;
    if ($area    !== '') $p[':area']    = $area;
    if ($days    > 0)    $p[':days']    = $days;
    return $p;
}

// --- KPI-Daten ---
function countEvents(PDO $db, string $event, string $extra = ''): int {
    $stmt = $db->prepare("SELECT COUNT(*) FROM events WHERE event = :e $extra");
    $stmt->execute([':e' => $event]);
    return (int)$stmt->fetchColumn();
}

try {
    $kpi = [
        'today'      => (int)$db->query("SELECT COUNT(*) FROM events WHERE event='page_view' AND event_date=CURDATE()")->fetchColumn(),
        'week'       => (int)$db->query("SELECT COUNT(*) FROM events WHERE event='page_view' AND event_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)")->fetchColumn(),
        'total'      => countEvents($db, 'page_view'),
        'paths'      => countEvents($db, 'path_completed'),
        'badges'     => countEvents($db, 'badge_earned'),
        'checkouts'  => countEvents($db, 'checkout_completed'),
    ];

    // Trend: Besuche letzte 30 Tage
    $trendStmt = $db->query(
        "SELECT event_date, COUNT(*) as cnt
         FROM events
         WHERE event = 'page_view' AND event_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY event_date ORDER BY event_date"
    );
    $trendRows = $trendStmt->fetchAll();
    $trendMax  = max(1, ...array_column($trendRows, 'cnt'));

    // Feedback-Tabelle
    $whereClause  = buildWhereClause($filterChannel, $filterArea, $filterDays);
    $whereParams  = buildWhereParams($filterChannel, $filterArea, $filterDays);
    $countStmt    = $db->prepare("SELECT COUNT(*) FROM feedback $whereClause");
    $countStmt->execute($whereParams);
    $totalFeedback = (int)$countStmt->fetchColumn();
    $totalPages    = max(1, (int)ceil($totalFeedback / $perPage));
    $page          = min($page, $totalPages);
    $offset        = ($page - 1) * $perPage;

    $feedbackStmt = $db->prepare(
        "SELECT id, created_at, channel, area, unit_id, role, answers, freetext, seen
         FROM feedback $whereClause
         ORDER BY $sortCol $sortDir
         LIMIT :limit OFFSET :offset"
    );
    foreach ($whereParams as $k => $v) $feedbackStmt->bindValue($k, $v);
    $feedbackStmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
    $feedbackStmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
    $feedbackStmt->execute();
    $feedbackRows = $feedbackStmt->fetchAll();

    // Problem-Reports (Tab)
    $problemStmt = $db->prepare(
        "SELECT id, created_at, area, unit_id, answers, freetext, seen
         FROM feedback WHERE channel = 'problem'
         ORDER BY seen ASC, created_at DESC LIMIT 100"
    );
    $problemStmt->execute();
    $problemRows = $problemStmt->fetchAll();
    $unseenCount = count(array_filter($problemRows, fn($r) => !$r['seen']));

} catch (PDOException $e) {
    error_log('KI:Blick dashboard DB error: ' . $e->getMessage());
    $kpi = array_fill_keys(['today','week','total','paths','badges','checkouts'], 0);
    $trendRows = [];
    $trendMax  = 1;
    $feedbackRows = [];
    $totalFeedback = 0;
    $totalPages = 1;
    $problemRows = [];
    $unseenCount = 0;
}

// --- Helper: Sortier-Link ---
function sortLink(string $col, string $label, string $current, string $dir, array $params): string {
    $newDir = ($current === $col && $dir === 'DESC') ? 'asc' : 'desc';
    $arrow  = $current === $col ? ($dir === 'DESC' ? ' ↓' : ' ↑') : '';
    $p      = array_merge($params, ['sort' => $col, 'dir' => $newDir, 'page' => 1]);
    return '<a href="dashboard.php?' . htmlspecialchars(http_build_query($p)) . '" style="color:inherit;text-decoration:none">' . htmlspecialchars($label) . $arrow . '</a>';
}

// --- Helper: Kanal-Badge ---
function channelBadge(string $c): string {
    $map = [
        'micro'      => ['#3b82f6', 'Micro'],
        'completion' => ['#10b981', 'Completion'],
        'problem'    => ['#ef4444', 'Problem'],
    ];
    [$color, $text] = $map[$c] ?? ['#94a3b8', $c];
    return "<span style=\"background:$color;color:#fff;padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600\">$text</span>";
}

// --- Helper: Bereich-Badge ---
function areaBadge(string $a): string {
    $map = [
        'verstehen' => '#0ea5e9',
        'entdecken' => '#8b5cf6',
        'einordnen' => '#f59e0b',
        'lernen'    => '#10b981',
    ];
    $color = $map[$a] ?? '#94a3b8';
    return "<span style=\"background:{$color}22;color:$color;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;border:1px solid {$color}55\">" . htmlspecialchars(ucfirst($a)) . "</span>";
}

// --- Helper: Answers-Darstellung ---
function renderAnswers(string $json): string {
    $data = json_decode($json, true);
    if (!is_array($data)) return htmlspecialchars($json);
    $parts = [];
    foreach ($data as $k => $v) {
        $parts[] = '<span style="color:#94a3b8">' . htmlspecialchars($k) . ':</span> ' . htmlspecialchars((string)$v);
    }
    return implode('<br>', $parts);
}

// --- Aktuelle GET-Params für Links ---
$currentParams = array_filter([
    'channel' => $filterChannel,
    'area'    => $filterArea,
    'days'    => $filterDays ?: '',
    'sort'    => $sortCol,
    'dir'     => strtolower($sortDir),
    'tab'     => $activeTab === 'problems' ? 'problems' : '',
], fn($v) => $v !== '');

?>
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KI:Blick – Dashboard</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
:root {
    --bg:      #0b1120;
    --surface: #0f172a;
    --card:    #1e293b;
    --border:  #334155;
    --muted:   #64748b;
    --text2:   #94a3b8;
    --text1:   #e2e8f0;
    --accent:  #0ea5e9;
}
body { background: var(--bg); color: var(--text1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.5 }
a { color: var(--accent) }

/* Layout */
.shell { max-width: 1400px; margin: 0 auto; padding: 1.5rem }
header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border) }
header h1 { font-size: 1.1rem; font-weight: 700; color: var(--text1) }
header .meta { color: var(--muted); font-size: 12px }

/* Tabs */
.tabs { display: flex; gap: 4px; margin-bottom: 1.5rem }
.tab { padding: 6px 16px; border-radius: 8px; text-decoration: none; color: var(--text2); font-weight: 500; font-size: 13px; border: 1px solid transparent }
.tab:hover { background: var(--card); color: var(--text1) }
.tab.active { background: var(--card); color: var(--text1); border-color: var(--border) }
.tab .badge { background: #ef4444; color: #fff; border-radius: 99px; padding: 1px 6px; font-size: 10px; margin-left: 5px; font-weight: 700 }

/* KPI Grid */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem }
.kpi { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1rem }
.kpi-value { font-size: 1.75rem; font-weight: 700; color: var(--text1); line-height: 1 }
.kpi-label { color: var(--muted); font-size: 11px; margin-top: 4px }

/* Filters */
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem; align-items: flex-end }
.filters select { background: var(--card); color: var(--text1); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; font-size: 13px; cursor: pointer }
.filters select:focus { outline: 2px solid var(--accent) }
.btn { display: inline-block; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: var(--card); color: var(--text1); text-decoration: none; transition: background 0.15s }
.btn:hover { background: var(--border) }
.btn-accent { background: var(--accent); border-color: var(--accent); color: #fff }
.btn-accent:hover { opacity: 0.9 }

/* Table */
.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 1.5rem }
table { width: 100%; border-collapse: collapse }
th { background: var(--card); padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; border-bottom: 1px solid var(--border) }
td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: top; color: var(--text2); max-width: 260px }
td:first-child { white-space: nowrap }
tr:last-child td { border-bottom: none }
tr:hover td { background: var(--card) }
.text1 { color: var(--text1) }
.small { font-size: 12px }
.mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px }

/* Pagination */
.pagination { display: flex; gap: 6px; align-items: center; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap }
.pagination a, .pagination span { padding: 5px 11px; border-radius: 6px; font-size: 13px; border: 1px solid var(--border); text-decoration: none; color: var(--text2) }
.pagination a:hover { background: var(--card); color: var(--text1) }
.pagination .current { background: var(--accent); border-color: var(--accent); color: #fff }
.pagination .dots { border: none; color: var(--muted) }

/* Trend Chart */
.chart-section { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem }
.chart-title { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1rem }
.chart { display: flex; align-items: flex-end; gap: 3px; height: 80px }
.bar-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 3px; height: 100% }
.bar { width: 100%; background: var(--accent); border-radius: 3px 3px 0 0; min-height: 2px; opacity: 0.85; transition: opacity 0.1s; position: relative }
.bar:hover { opacity: 1 }
.bar-label { font-size: 8px; color: var(--muted); white-space: nowrap; transform: rotate(-45deg); transform-origin: top center; margin-top: 4px }
.chart-empty { color: var(--muted); font-size: 13px; text-align: center; padding: 2rem 0 }

/* Section headers */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem }
.section-header h2 { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em }

/* Seen badge */
.seen-yes { color: var(--muted); font-size: 11px }
.seen-no  { color: #f59e0b; font-size: 11px; font-weight: 600 }

/* Empty state */
.empty { text-align: center; padding: 3rem 1rem; color: var(--muted) }

@media (max-width: 640px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr) }
    .bar-label { display: none }
}
</style>
</head>
<body>
<div class="shell">

<header>
    <div>
        <h1>KI:Blick · Dashboard</h1>
        <div class="meta">Stand: <?= htmlspecialchars(date('d.m.Y, H:i')) ?> Uhr</div>
    </div>
    <a href="dashboard.php?export=csv&<?= htmlspecialchars(http_build_query(array_filter(['channel'=>$filterChannel,'area'=>$filterArea,'days'=>$filterDays?:'']))) ?>" class="btn">⬇ CSV Export</a>
</header>

<!-- Tabs -->
<nav class="tabs">
    <a href="dashboard.php?tab=overview&<?= htmlspecialchars(http_build_query(array_filter(['channel'=>$filterChannel,'area'=>$filterArea,'days'=>$filterDays?:'']))) ?>"
       class="tab <?= $activeTab === 'overview' ? 'active' : '' ?>">Übersicht &amp; Feedback</a>
    <a href="dashboard.php?tab=problems"
       class="tab <?= $activeTab === 'problems' ? 'active' : '' ?>">Problem-Reports<?php if ($unseenCount > 0): ?><span class="badge"><?= $unseenCount ?></span><?php endif ?></a>
</nav>

<?php if ($activeTab === 'overview'): ?>

<!-- KPI Cards -->
<div class="kpi-grid">
    <div class="kpi">
        <div class="kpi-value"><?= number_format($kpi['today']) ?></div>
        <div class="kpi-label">Besuche heute</div>
    </div>
    <div class="kpi">
        <div class="kpi-value"><?= number_format($kpi['week']) ?></div>
        <div class="kpi-label">Besuche diese Woche</div>
    </div>
    <div class="kpi">
        <div class="kpi-value"><?= number_format($kpi['total']) ?></div>
        <div class="kpi-label">Besuche gesamt</div>
    </div>
    <div class="kpi">
        <div class="kpi-value"><?= number_format($kpi['paths']) ?></div>
        <div class="kpi-label">Lernpfade abgeschlossen</div>
    </div>
    <div class="kpi">
        <div class="kpi-value"><?= number_format($kpi['badges']) ?></div>
        <div class="kpi-label">Badges vergeben</div>
    </div>
    <div class="kpi">
        <div class="kpi-value"><?= number_format($kpi['checkouts']) ?></div>
        <div class="kpi-label">Checkouts gelöst</div>
    </div>
</div>

<!-- Trend Chart -->
<div class="chart-section">
    <div class="chart-title">Seitenaufrufe – letzte 30 Tage</div>
    <?php if (empty($trendRows)): ?>
        <div class="chart-empty">Noch keine Daten vorhanden.</div>
    <?php else: ?>
        <div class="chart" role="img" aria-label="Balkendiagramm Seitenaufrufe letzte 30 Tage">
            <?php foreach ($trendRows as $r):
                $pct = round(($r['cnt'] / $trendMax) * 100);
                $date = date('d.m.', strtotime($r['event_date']));
            ?>
                <div class="bar-wrap" title="<?= htmlspecialchars($date) ?>: <?= (int)$r['cnt'] ?> Aufrufe">
                    <div style="flex:1;display:flex;align-items:flex-end;width:100%">
                        <div class="bar" style="height:<?= max(3,$pct) ?>%"></div>
                    </div>
                    <div class="bar-label"><?= htmlspecialchars($date) ?></div>
                </div>
            <?php endforeach ?>
        </div>
    <?php endif ?>
</div>

<!-- Feedback-Tabelle -->
<div class="section-header">
    <h2>Feedback (<?= number_format($totalFeedback) ?> Einträge)</h2>
</div>

<!-- Filter-Form -->
<form method="get" action="dashboard.php" class="filters">
    <input type="hidden" name="tab" value="overview">
    <select name="channel" onchange="this.form.submit()">
        <option value="" <?= $filterChannel==='' ? 'selected' : '' ?>>Alle Kanäle</option>
        <option value="micro"      <?= $filterChannel==='micro'      ? 'selected' : '' ?>>Micro</option>
        <option value="completion" <?= $filterChannel==='completion' ? 'selected' : '' ?>>Completion</option>
        <option value="problem"    <?= $filterChannel==='problem'    ? 'selected' : '' ?>>Problem</option>
    </select>
    <select name="area" onchange="this.form.submit()">
        <option value="" <?= $filterArea==='' ? 'selected' : '' ?>>Alle Bereiche</option>
        <option value="verstehen" <?= $filterArea==='verstehen' ? 'selected' : '' ?>>Verstehen</option>
        <option value="entdecken" <?= $filterArea==='entdecken' ? 'selected' : '' ?>>Entdecken</option>
        <option value="einordnen" <?= $filterArea==='einordnen' ? 'selected' : '' ?>>Einordnen</option>
        <option value="lernen"    <?= $filterArea==='lernen'    ? 'selected' : '' ?>>Lernen</option>
    </select>
    <select name="days" onchange="this.form.submit()">
        <option value="" <?= $filterDays===0 ? 'selected' : '' ?>>Alle Zeiträume</option>
        <option value="7"  <?= $filterDays===7  ? 'selected' : '' ?>>Letzte 7 Tage</option>
        <option value="30" <?= $filterDays===30 ? 'selected' : '' ?>>Letzte 30 Tage</option>
        <option value="90" <?= $filterDays===90 ? 'selected' : '' ?>>Letzte 90 Tage</option>
    </select>
    <?php if ($filterChannel || $filterArea || $filterDays): ?>
        <a href="dashboard.php?tab=overview" class="btn">✕ Filter zurücksetzen</a>
    <?php endif ?>
</form>

<?php if (empty($feedbackRows)): ?>
    <div class="empty">Keine Einträge für diese Filter.</div>
<?php else: ?>
<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th><?= sortLink('created_at', 'Datum', $sortCol, $sortDir, $currentParams) ?></th>
            <th><?= sortLink('channel',    'Kanal', $sortCol, $sortDir, $currentParams) ?></th>
            <th><?= sortLink('area',       'Bereich', $sortCol, $sortDir, $currentParams) ?></th>
            <th><?= sortLink('unit_id',    'Einheit', $sortCol, $sortDir, $currentParams) ?></th>
            <th><?= sortLink('role',       'Rolle', $sortCol, $sortDir, $currentParams) ?></th>
            <th>Antworten</th>
            <th>Freitext</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($feedbackRows as $row): ?>
        <tr>
            <td class="small mono"><?= htmlspecialchars(date('d.m.y H:i', strtotime($row['created_at']))) ?></td>
            <td><?= channelBadge($row['channel']) ?></td>
            <td><?= areaBadge($row['area']) ?></td>
            <td class="mono small text1"><?= htmlspecialchars($row['unit_id']) ?></td>
            <td class="small"><?= $row['role'] ? htmlspecialchars($row['role']) : '<span style="color:var(--muted)">–</span>' ?></td>
            <td class="small"><?= renderAnswers($row['answers']) ?></td>
            <td class="small"><?= $row['freetext'] ? htmlspecialchars($row['freetext']) : '<span style="color:var(--muted)">–</span>' ?></td>
        </tr>
        <?php endforeach ?>
    </tbody>
</table>
</div>

<!-- Pagination -->
<?php if ($totalPages > 1):
    $navParams = $currentParams;
?>
<div class="pagination">
    <?php if ($page > 1): ?>
        <a href="dashboard.php?<?= htmlspecialchars(http_build_query(array_merge($navParams, ['page' => $page - 1]))) ?>">← Zurück</a>
    <?php endif ?>

    <?php for ($i = 1; $i <= $totalPages; $i++):
        if ($i === 1 || $i === $totalPages || abs($i - $page) <= 2): ?>
            <?php if ($i === $page): ?>
                <span class="current"><?= $i ?></span>
            <?php else: ?>
                <a href="dashboard.php?<?= htmlspecialchars(http_build_query(array_merge($navParams, ['page' => $i]))) ?>"><?= $i ?></a>
            <?php endif ?>
        <?php elseif (abs($i - $page) === 3): ?>
            <span class="dots">…</span>
        <?php endif ?>
    <?php endfor ?>

    <?php if ($page < $totalPages): ?>
        <a href="dashboard.php?<?= htmlspecialchars(http_build_query(array_merge($navParams, ['page' => $page + 1]))) ?>">Weiter →</a>
    <?php endif ?>
</div>
<?php endif ?>
<?php endif ?>

<?php else: /* Tab: problems */ ?>

<!-- Problem-Reports -->
<div class="section-header">
    <h2>Problem-Reports (<?= count($problemRows) ?>)</h2>
    <?php if ($unseenCount > 0): ?>
        <span style="color:#f59e0b;font-size:12px;font-weight:600"><?= $unseenCount ?> ungesehen</span>
    <?php endif ?>
</div>

<?php if (empty($problemRows)): ?>
    <div class="empty">Keine Problem-Reports vorhanden.</div>
<?php else: ?>
<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>Datum</th>
            <th>Bereich</th>
            <th>Einheit</th>
            <th>Typ</th>
            <th>Schwere</th>
            <th>Freitext</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($problemRows as $row):
            $answers = json_decode($row['answers'], true) ?? [];
            $ptype    = htmlspecialchars($answers['problemType'] ?? '–');
            $severity = htmlspecialchars($answers['severity'] ?? '–');
        ?>
        <tr>
            <td class="small mono"><?= htmlspecialchars(date('d.m.y H:i', strtotime($row['created_at']))) ?></td>
            <td><?= areaBadge($row['area']) ?></td>
            <td class="mono small text1"><?= htmlspecialchars($row['unit_id']) ?></td>
            <td class="small"><?= $ptype ?></td>
            <td class="small"><?= $severity ?></td>
            <td class="small"><?= $row['freetext'] ? htmlspecialchars($row['freetext']) : '<span style="color:var(--muted)">–</span>' ?></td>
            <td>
                <?php if ($row['seen']): ?>
                    <span class="seen-yes">✓ Gesehen</span>
                <?php else: ?>
                    <form method="post" action="dashboard.php?action=mark_seen&id=<?= (int)$row['id'] ?>&tab=problems" style="display:inline">
                        <button type="submit" class="btn" style="font-size:11px;padding:3px 9px">Als gesehen markieren</button>
                    </form>
                <?php endif ?>
            </td>
        </tr>
        <?php endforeach ?>
    </tbody>
</table>
</div>
<?php endif ?>

<?php endif ?>

</div><!-- .shell -->
</body>
</html>
