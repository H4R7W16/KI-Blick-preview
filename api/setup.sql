-- KI:Blick – Datenbank-Setup
-- Einmalig in der Datenbank ki_blick_db ausführen.
-- Idempotent: kann mehrfach ausgeführt werden ohne Datenverlust.

-- ============================================================
-- Tabelle: feedback (erweitert bestehende Tabelle)
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  channel       ENUM('micro','completion','problem') NOT NULL,
  area          ENUM('verstehen','entdecken','einordnen','lernen') NOT NULL,
  unit_id       VARCHAR(100) NOT NULL,
  role          ENUM('lehrkraft','lernende','other') DEFAULT NULL,
  answers       JSON         NOT NULL,
  freetext      TEXT         DEFAULT NULL,
  seen          TINYINT(1)   NOT NULL DEFAULT 0,
  INDEX idx_channel (channel),
  INDEX idx_area (area),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Falls die Tabelle bereits existiert, die seen-Spalte ergänzen:
-- (ignoriert den Fehler falls die Spalte schon existiert)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS seen TINYINT(1) NOT NULL DEFAULT 0;

-- ============================================================
-- Tabelle: events (NEU – anonymes Usage-Tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event       VARCHAR(50)  NOT NULL,
  path        VARCHAR(200) DEFAULT NULL,
  meta        JSON         DEFAULT NULL,
  event_date  DATE         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event (event),
  INDEX idx_date (event_date),
  INDEX idx_event_date (event, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Cleanup-Event: Automatische Datenbereinigung
-- ============================================================

DROP EVENT IF EXISTS cleanup_data;

CREATE EVENT cleanup_data
  ON SCHEDULE EVERY 1 DAY
  STARTS CURRENT_TIMESTAMP
  DO BEGIN
    -- Freitexte nach 90 Tagen anonymisieren
    UPDATE feedback
      SET freetext = NULL
      WHERE created_at < NOW() - INTERVAL 90 DAY
        AND freetext IS NOT NULL;

    -- Feedback-Einträge nach 24 Monaten löschen
    DELETE FROM feedback
      WHERE created_at < NOW() - INTERVAL 24 MONTH;

    -- Events nach 12 Monaten löschen (nur Zähldaten)
    DELETE FROM events
      WHERE created_at < NOW() - INTERVAL 12 MONTH;

    -- Rate-Limit temp-Dateien aufräumen (älter als 1 Stunde)
    -- Hinweis: Dies muss ggf. über einen separaten Cron erledigt werden,
    -- da MySQL-Events keinen Dateisystem-Zugriff haben.
  END;

-- Events aktivieren (falls nicht global aktiviert):
-- SET GLOBAL event_scheduler = ON;
