CREATE TABLE "create_route_cycle" (
  "id" SERIAL PRIMARY KEY,
  "node_coldtag_id" INT NOT NULL REFERENCES "create_node_coldtag" (ID),
  "identifier" TEXT,
  "description" TEXT,
  "owner_name" TEXT,
  "placed_at" TEXT,
  "departure_latitude" DOUBLE PRECISION,
  "departure_longitude" DOUBLE PRECISION,
  "destination_latitude" DOUBLE PRECISION,
  "destination_longitude" DOUBLE PRECISION,
  "temperature_alert_threshold" DOUBLE PRECISION,
  "humidity_alert_threshold" DOUBLE PRECISION,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "create_route_cycle" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "update_route_cycle" (
  "id" SERIAL PRIMARY KEY,
  "route_cycle_id" INT NOT NULL REFERENCES "create_route_cycle" (ID),
  "identifier" TEXT,
  "description" TEXT,
  "owner_name" TEXT,
  "placed_at" TEXT,
  "departure_latitude" DOUBLE PRECISION,
  "departure_longitude" DOUBLE PRECISION,
  "destination_latitude" DOUBLE PRECISION,
  "destination_longitude" DOUBLE PRECISION,
  "temperature_alert_threshold" DOUBLE PRECISION,
  "humidity_alert_threshold" DOUBLE PRECISION,
  "started" BOOLEAN,
  "completed" BOOLEAN,
  "canceled" BOOLEAN,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "update_route_cycle" ENABLE ROW LEVEL SECURITY;

CREATE VIEW "route_cycle" AS (
  SELECT
    CRC.ID,
    CRC.NODE_COLDTAG_ID,
    COALESCE(
      (
        SELECT
          URC.IDENTIFIER
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.IDENTIFIER IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.IDENTIFIER
    ) AS "identifier",
    COALESCE(
      (
        SELECT
          URC.DESCRIPTION
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.DESCRIPTION IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.DESCRIPTION
    ) AS "description",
    COALESCE(
      (
        SELECT
          URC.OWNER_NAME
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.OWNER_NAME IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.OWNER_NAME
    ) AS "owner_name",
    COALESCE(
      (
        SELECT
          URC.PLACED_AT
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.PLACED_AT IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.PLACED_AT
    ) AS "placed_at",
    COALESCE(
      (
        SELECT
          URC.DEPARTURE_LATITUDE
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.DEPARTURE_LATITUDE IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.DEPARTURE_LATITUDE
    ) AS "departure_latitude",
    COALESCE(
      (
        SELECT
          URC.DEPARTURE_LONGITUDE
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.DEPARTURE_LONGITUDE IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.DEPARTURE_LONGITUDE
    ) AS "departure_longitude",
    COALESCE(
      (
        SELECT
          URC.DESTINATION_LATITUDE
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.DESTINATION_LATITUDE IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.DESTINATION_LATITUDE
    ) AS "destination_latitude",
    COALESCE(
      (
        SELECT
          URC.DESTINATION_LONGITUDE
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.DESTINATION_LONGITUDE IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.DESTINATION_LONGITUDE
    ) AS "destination_longitude",
    COALESCE(
      (
        SELECT
          URC.TEMPERATURE_ALERT_THRESHOLD
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.TEMPERATURE_ALERT_THRESHOLD IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.TEMPERATURE_ALERT_THRESHOLD
    ) AS "temperature_alert_threshold",
    COALESCE(
      (
        SELECT
          URC.HUMIDITY_ALERT_THRESHOLD
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.HUMIDITY_ALERT_THRESHOLD IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.HUMIDITY_ALERT_THRESHOLD
    ) AS "humidity_alert_threshold",
    (
      SELECT
        URC.STARTED
      FROM
        "update_route_cycle" URC
      WHERE
        URC.ROUTE_CYCLE_ID = CRC.ID
        AND URC.STARTED IS NOT NULL
      ORDER BY
        URC.TIME DESC
      LIMIT
        1
    ),
    (
      SELECT
        URC.COMPLETED
      FROM
        "update_route_cycle" URC
      WHERE
        URC.ROUTE_CYCLE_ID = CRC.ID
        AND URC.COMPLETED IS NOT NULL
      ORDER BY
        URC.TIME DESC
      LIMIT
        1
    ),
    (
      SELECT
        URC.TIME
      FROM
        "update_route_cycle" URC
      WHERE
        URC.ROUTE_CYCLE_ID = CRC.ID
        AND URC.STARTED = TRUE
      ORDER BY
        URC.TIME ASC
      LIMIT
        1
    ) AS "dispatch_time",
    (
      SELECT
        URC.TIME
      FROM
        "update_route_cycle" URC
      WHERE
        URC.ROUTE_CYCLE_ID = CRC.ID
        AND (
          URC.COMPLETED = TRUE
          OR URC.CANCELED = TRUE
        )
      ORDER BY
        URC.TIME ASC
      LIMIT
        1
    ) AS "completion_time",
    (
      SELECT
        URC.CANCELED
      FROM
        "update_route_cycle" URC
      WHERE
        URC.ROUTE_CYCLE_ID = CRC.ID
        AND URC.CANCELED IS NOT NULL
      ORDER BY
        URC.TIME DESC
      LIMIT
        1
    ),
    CRC.TIME AS "created_time",
    COALESCE(
      (
        SELECT
          URC.TIME
        FROM
          "update_route_cycle" URC
        WHERE
          URC.ROUTE_CYCLE_ID = CRC.ID
          AND URC.TIME IS NOT NULL
        ORDER BY
          URC.TIME DESC
        LIMIT
          1
      ),
      CRC.TIME
    ) AS "updated_time"
  FROM
    "create_route_cycle" CRC
);
