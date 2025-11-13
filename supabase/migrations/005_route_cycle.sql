CREATE SEQUENCE "public"."create_route_cycle_id_seq";

CREATE SEQUENCE "public"."update_route_cycle_id_seq";

CREATE TABLE "public"."create_route_cycle" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('create_route_cycle_id_seq'::REGCLASS),
  "node_coldtag_id" INTEGER NOT NULL,
  "identifier" TEXT,
  "description" TEXT,
  "owner_name" TEXT,
  "placed_at" TEXT,
  "departure" TEXT,
  "destination" TEXT,
  "temperature_alert_threshold" DOUBLE PRECISION,
  "humidity_alert_threshold" DOUBLE PRECISION,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."create_route_cycle" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."update_route_cycle" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('update_route_cycle_id_seq'::REGCLASS),
  "route_cycle_id" INTEGER NOT NULL,
  "identifier" TEXT,
  "description" TEXT,
  "owner_name" TEXT,
  "placed_at" TEXT,
  "departure" TEXT,
  "destination" TEXT,
  "temperature_alert_threshold" DOUBLE PRECISION,
  "humidity_alert_threshold" DOUBLE PRECISION,
  "completed" BOOLEAN,
  "cancelled" BOOLEAN,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."update_route_cycle" ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."create_route_cycle_id_seq" OWNED BY "public"."create_route_cycle"."id";

ALTER SEQUENCE "public"."update_route_cycle_id_seq" OWNED BY "public"."update_route_cycle"."id";

CREATE UNIQUE INDEX CREATE_ROUTE_CYCLE_PKEY ON PUBLIC.CREATE_ROUTE_CYCLE USING BTREE (ID);

CREATE UNIQUE INDEX UPDATE_ROUTE_CYCLE_PKEY ON PUBLIC.UPDATE_ROUTE_CYCLE USING BTREE (ID);

ALTER TABLE "public"."create_route_cycle"
ADD CONSTRAINT "create_route_cycle_pkey" PRIMARY KEY USING INDEX "create_route_cycle_pkey";

ALTER TABLE "public"."update_route_cycle"
ADD CONSTRAINT "update_route_cycle_pkey" PRIMARY KEY USING INDEX "update_route_cycle_pkey";

ALTER TABLE "public"."create_route_cycle"
ADD CONSTRAINT "create_route_cycle_node_coldtag_id_fkey" FOREIGN KEY (NODE_COLDTAG_ID) REFERENCES CREATE_NODE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."create_route_cycle" VALIDATE CONSTRAINT "create_route_cycle_node_coldtag_id_fkey";

ALTER TABLE "public"."update_route_cycle"
ADD CONSTRAINT "update_route_cycle_route_cycle_id_fkey" FOREIGN KEY (ROUTE_CYCLE_ID) REFERENCES CREATE_ROUTE_CYCLE (ID) NOT VALID;

ALTER TABLE "public"."update_route_cycle" VALIDATE CONSTRAINT "update_route_cycle_route_cycle_id_fkey";

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
        URC.DEPARTURE
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.DEPARTURE IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    DEPARTURE
  ) AS DEPARTURE,
  COALESCE(
    (
      SELECT
        URC.DESTINATION
      FROM
        UPDATE_ROUTE_CYCLE URC
      WHERE
        (
          (URC.ROUTE_CYCLE_ID = CRC.ID)
          AND (URC.DESTINATION IS NOT NULL)
        )
      ORDER BY
        URC."time" DESC
      LIMIT
        1
    ),
    DESTINATION
  ) AS DESTINATION,
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

GRANT DELETE ON TABLE "public"."create_route_cycle" TO "anon";

GRANT INSERT ON TABLE "public"."create_route_cycle" TO "anon";

GRANT REFERENCES ON TABLE "public"."create_route_cycle" TO "anon";

GRANT
SELECT
  ON TABLE "public"."create_route_cycle" TO "anon";

GRANT TRIGGER ON TABLE "public"."create_route_cycle" TO "anon";

GRANT
TRUNCATE ON TABLE "public"."create_route_cycle" TO "anon";

GRANT
UPDATE ON TABLE "public"."create_route_cycle" TO "anon";

GRANT DELETE ON TABLE "public"."create_route_cycle" TO "authenticated";

GRANT INSERT ON TABLE "public"."create_route_cycle" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."create_route_cycle" TO "authenticated";

GRANT
SELECT
  ON TABLE "public"."create_route_cycle" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."create_route_cycle" TO "authenticated";

GRANT
TRUNCATE ON TABLE "public"."create_route_cycle" TO "authenticated";

GRANT
UPDATE ON TABLE "public"."create_route_cycle" TO "authenticated";

GRANT DELETE ON TABLE "public"."create_route_cycle" TO "service_role";

GRANT INSERT ON TABLE "public"."create_route_cycle" TO "service_role";

GRANT REFERENCES ON TABLE "public"."create_route_cycle" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."create_route_cycle" TO "service_role";

GRANT TRIGGER ON TABLE "public"."create_route_cycle" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."create_route_cycle" TO "service_role";

GRANT
UPDATE ON TABLE "public"."create_route_cycle" TO "service_role";

GRANT DELETE ON TABLE "public"."update_route_cycle" TO "anon";

GRANT INSERT ON TABLE "public"."update_route_cycle" TO "anon";

GRANT REFERENCES ON TABLE "public"."update_route_cycle" TO "anon";

GRANT
SELECT
  ON TABLE "public"."update_route_cycle" TO "anon";

GRANT TRIGGER ON TABLE "public"."update_route_cycle" TO "anon";

GRANT
TRUNCATE ON TABLE "public"."update_route_cycle" TO "anon";

GRANT
UPDATE ON TABLE "public"."update_route_cycle" TO "anon";

GRANT DELETE ON TABLE "public"."update_route_cycle" TO "authenticated";

GRANT INSERT ON TABLE "public"."update_route_cycle" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."update_route_cycle" TO "authenticated";

GRANT
SELECT
  ON TABLE "public"."update_route_cycle" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."update_route_cycle" TO "authenticated";

GRANT
TRUNCATE ON TABLE "public"."update_route_cycle" TO "authenticated";

GRANT
UPDATE ON TABLE "public"."update_route_cycle" TO "authenticated";

GRANT DELETE ON TABLE "public"."update_route_cycle" TO "service_role";

GRANT INSERT ON TABLE "public"."update_route_cycle" TO "service_role";

GRANT REFERENCES ON TABLE "public"."update_route_cycle" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."update_route_cycle" TO "service_role";

GRANT TRIGGER ON TABLE "public"."update_route_cycle" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."update_route_cycle" TO "service_role";

GRANT
UPDATE ON TABLE "public"."update_route_cycle" TO "service_role";
