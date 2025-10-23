ALTER TABLE "public"."create_node_coldtag"
DROP CONSTRAINT "create_node_coldtag_core_coldtag_id_fkey";

ALTER TABLE "public"."update_node_coldtag"
DROP CONSTRAINT "update_node_coldtag_core_coldtag_id_fkey";

DROP VIEW IF EXISTS "public"."node_coldtag";

ALTER TABLE "public"."create_node_coldtag"
DROP COLUMN "core_coldtag_id";

ALTER TABLE "public"."node_coldtag_event"
ADD COLUMN "core_coldtag_id" INTEGER NOT NULL;

ALTER TABLE "public"."node_coldtag_event_alert_impact"
ADD COLUMN "core_coldtag_id" INTEGER NOT NULL;

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
ADD COLUMN "core_coldtag_id" INTEGER NOT NULL;

ALTER TABLE "public"."update_node_coldtag"
DROP COLUMN "core_coldtag_id";

ALTER TABLE "public"."node_coldtag_event"
ADD CONSTRAINT "node_coldtag_event_core_coldtag_id_fkey" FOREIGN KEY (CORE_COLDTAG_ID) REFERENCES CREATE_CORE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."node_coldtag_event" VALIDATE CONSTRAINT "node_coldtag_event_core_coldtag_id_fkey";

ALTER TABLE "public"."node_coldtag_event_alert_impact"
ADD CONSTRAINT "node_coldtag_event_alert_impact_core_coldtag_id_fkey" FOREIGN KEY (CORE_COLDTAG_ID) REFERENCES CREATE_CORE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."node_coldtag_event_alert_impact" VALIDATE CONSTRAINT "node_coldtag_event_alert_impact_core_coldtag_id_fkey";

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
ADD CONSTRAINT "node_coldtag_event_alert_liquid_core_coldtag_id_fkey" FOREIGN KEY (CORE_COLDTAG_ID) REFERENCES CREATE_CORE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."node_coldtag_event_alert_liquid" VALIDATE CONSTRAINT "node_coldtag_event_alert_liquid_core_coldtag_id_fkey";

CREATE OR REPLACE VIEW "public"."node_coldtag"
WITH
  (SECURITY_INVOKER = ON) AS
SELECT
  ID,
  MAC_ADDRESS,
  COALESCE(
    (
      SELECT
        UNC.IDENTIFIER
      FROM
        UPDATE_NODE_COLDTAG UNC
      WHERE
        (
          (UNC.NODE_COLDTAG_ID = CNC.ID)
          AND (UNC.IDENTIFIER IS NOT NULL)
        )
      ORDER BY
        UNC."time" DESC
      LIMIT
        1
    ),
    IDENTIFIER
  ) AS IDENTIFIER,
  (
    SELECT
      UNC.DELETED
    FROM
      UPDATE_NODE_COLDTAG UNC
    WHERE
      (
        (UNC.NODE_COLDTAG_ID = CNC.ID)
        AND (UNC.DELETED IS NOT NULL)
      )
    ORDER BY
      UNC."time" DESC
    LIMIT
      1
  ) AS DELETED,
  "time" AS CREATED_TIME,
  COALESCE(
    (
      SELECT
        UNC."time"
      FROM
        UPDATE_NODE_COLDTAG UNC
      WHERE
        (
          (UNC.NODE_COLDTAG_ID = CNC.ID)
          AND (UNC."time" IS NOT NULL)
        )
      ORDER BY
        UNC."time" DESC
      LIMIT
        1
    ),
    "time"
  ) AS UPDATED_TIME
FROM
  CREATE_NODE_COLDTAG CNC;
