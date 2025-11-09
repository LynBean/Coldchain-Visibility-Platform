DROP VIEW IF EXISTS "public"."route_cycle";

ALTER TABLE "public"."create_route_cycle"
DROP COLUMN "departure";

ALTER TABLE "public"."create_route_cycle"
DROP COLUMN "destination";

ALTER TABLE "public"."create_route_cycle"
ADD COLUMN "departure_latitude" DOUBLE PRECISION;

ALTER TABLE "public"."create_route_cycle"
ADD COLUMN "departure_longitude" DOUBLE PRECISION;

ALTER TABLE "public"."create_route_cycle"
ADD COLUMN "destination_latitude" DOUBLE PRECISION;

ALTER TABLE "public"."create_route_cycle"
ADD COLUMN "destination_longitude" DOUBLE PRECISION;

ALTER TABLE "public"."update_route_cycle"
DROP COLUMN "departure";

ALTER TABLE "public"."update_route_cycle"
DROP COLUMN "destination";

ALTER TABLE "public"."update_route_cycle"
ADD COLUMN "departure_latitude" DOUBLE PRECISION;

ALTER TABLE "public"."update_route_cycle"
ADD COLUMN "departure_longitude" DOUBLE PRECISION;

ALTER TABLE "public"."update_route_cycle"
ADD COLUMN "destination_latitude" DOUBLE PRECISION;

ALTER TABLE "public"."update_route_cycle"
ADD COLUMN "destination_longitude" DOUBLE PRECISION;

CREATE OR REPLACE VIEW "public"."route_cycle"
WITH
  (SECURITY_INVOKER = ON) AS
SELECT
  ID,
  NODE_COLDTAG_ID,
  COALESCE(
    (
      SELECT
        URC.IDENTIFIER
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.IDENTIFIER IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    IDENTIFIER
  ) AS IDENTIFIER,
  COALESCE(
    (
      SELECT
        URC.DESCRIPTION
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.DESCRIPTION IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    DESCRIPTION
  ) AS DESCRIPTION,
  COALESCE(
    (
      SELECT
        URC.OWNER_NAME
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.OWNER_NAME IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    OWNER_NAME
  ) AS OWNER_NAME,
  COALESCE(
    (
      SELECT
        URC.PLACED_AT
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.PLACED_AT IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    PLACED_AT
  ) AS PLACED_AT,
  COALESCE(
    (
      SELECT
        URC.DEPARTURE_LATITUDE
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.DEPARTURE_LATITUDE IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    DEPARTURE_LATITUDE
  ) AS DEPARTURE_LATITUDE,
  COALESCE(
    (
      SELECT
        URC.DEPARTURE_LONGITUDE
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.DEPARTURE_LONGITUDE IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    DEPARTURE_LONGITUDE
  ) AS DEPARTURE_LONGITUDE,
  COALESCE(
    (
      SELECT
        URC.DESTINATION_LATITUDE
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.DESTINATION_LATITUDE IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    DESTINATION_LATITUDE
  ) AS DESTINATION_LATITUDE,
  COALESCE(
    (
      SELECT
        URC.DESTINATION_LONGITUDE
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.DESTINATION_LONGITUDE IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    DESTINATION_LONGITUDE
  ) AS DESTINATION_LONGITUDE,
  COALESCE(
    (
      SELECT
        URC.TEMPERATURE_ALERT_THRESHOLD
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.TEMPERATURE_ALERT_THRESHOLD IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    TEMPERATURE_ALERT_THRESHOLD
  ) AS TEMPERATURE_ALERT_THRESHOLD,
  COALESCE(
    (
      SELECT
        URC.HUMIDITY_ALERT_THRESHOLD
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.HUMIDITY_ALERT_THRESHOLD IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    HUMIDITY_ALERT_THRESHOLD
  ) AS HUMIDITY_ALERT_THRESHOLD,
  (
    SELECT
      URC.COMPLETED
    FROM
      UPDATE_ROUTE_CYCLE URC
    WHERE
      (
        (URC.ROUTE_CYCLE_ID = CRC.ID)
        AND (URC.COMPLETED IS NOT NULL)
      )
    ORDER BY
      URC."time" DESC
    LIMIT
      1
  ) AS COMPLETED,
  (
    SELECT
      URC.CANCELLED
    FROM
      UPDATE_ROUTE_CYCLE URC
    WHERE
      (
        (URC.ROUTE_CYCLE_ID = CRC.ID)
        AND (URC.CANCELLED IS NOT NULL)
      )
    ORDER BY
      URC."time" DESC
    LIMIT
      1
  ) AS CANCELLED,
  "time" AS CREATED_TIME,
  COALESCE(
    (
      SELECT
        URC."time"
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC."time" IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    "time"
  ) AS UPDATED_TIME
FROM
  CREATE_ROUTE_CYCLE CRC;
