CREATE TYPE "public"."coldtag_connection_status" AS ENUM('connected', 'disconnected');

CREATE SEQUENCE "public"."core_coldtag_event_id_seq";

CREATE SEQUENCE "public"."create_core_coldtag_id_seq";

CREATE SEQUENCE "public"."create_node_coldtag_id_seq";

CREATE SEQUENCE "public"."node_coldtag_event_alert_impact_id_seq";

CREATE SEQUENCE "public"."node_coldtag_event_alert_liquid_id_seq";

CREATE SEQUENCE "public"."node_coldtag_event_id_seq";

CREATE SEQUENCE "public"."update_core_coldtag_id_seq";

CREATE SEQUENCE "public"."update_node_coldtag_id_seq";

CREATE TABLE "public"."core_coldtag_event" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('core_coldtag_event_id_seq'::REGCLASS),
  "core_coldtag_id" INTEGER NOT NULL,
  "connection_status" COLDTAG_CONNECTION_STATUS NOT NULL,
  "event_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."core_coldtag_event" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."create_core_coldtag" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('create_core_coldtag_id_seq'::REGCLASS),
  "mac_address" TEXT NOT NULL,
  "identifier" TEXT,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."create_core_coldtag" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."create_node_coldtag" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('create_node_coldtag_id_seq'::REGCLASS),
  "core_coldtag_id" INTEGER NOT NULL,
  "mac_address" TEXT NOT NULL,
  "identifier" TEXT,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."create_node_coldtag" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."node_coldtag_event" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('node_coldtag_event_id_seq'::REGCLASS),
  "node_coldtag_id" INTEGER NOT NULL,
  "connection_status" COLDTAG_CONNECTION_STATUS NOT NULL,
  "temperature" DOUBLE PRECISION,
  "humidity" DOUBLE PRECISION,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "event_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."node_coldtag_event" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."node_coldtag_event_alert_impact" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL(
    'node_coldtag_event_alert_impact_id_seq'::REGCLASS
  ),
  "node_coldtag_id" INTEGER NOT NULL,
  "connection_status" COLDTAG_CONNECTION_STATUS NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "event_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."node_coldtag_event_alert_impact" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."node_coldtag_event_alert_liquid" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL(
    'node_coldtag_event_alert_liquid_id_seq'::REGCLASS
  ),
  "node_coldtag_id" INTEGER NOT NULL,
  "connection_status" COLDTAG_CONNECTION_STATUS NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "event_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."node_coldtag_event_alert_liquid" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."update_core_coldtag" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('update_core_coldtag_id_seq'::REGCLASS),
  "core_coldtag_id" INTEGER NOT NULL,
  "identifier" TEXT,
  "deleted" BOOLEAN,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."update_core_coldtag" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."update_node_coldtag" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('update_node_coldtag_id_seq'::REGCLASS),
  "node_coldtag_id" INTEGER NOT NULL,
  "core_coldtag_id" INTEGER,
  "identifier" TEXT,
  "deleted" BOOLEAN,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."update_node_coldtag" ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."core_coldtag_event_id_seq" OWNED BY "public"."core_coldtag_event"."id";

ALTER SEQUENCE "public"."create_core_coldtag_id_seq" OWNED BY "public"."create_core_coldtag"."id";

ALTER SEQUENCE "public"."create_node_coldtag_id_seq" OWNED BY "public"."create_node_coldtag"."id";

ALTER SEQUENCE "public"."node_coldtag_event_alert_impact_id_seq" OWNED BY "public"."node_coldtag_event_alert_impact"."id";

ALTER SEQUENCE "public"."node_coldtag_event_alert_liquid_id_seq" OWNED BY "public"."node_coldtag_event_alert_liquid"."id";

ALTER SEQUENCE "public"."node_coldtag_event_id_seq" OWNED BY "public"."node_coldtag_event"."id";

ALTER SEQUENCE "public"."update_core_coldtag_id_seq" OWNED BY "public"."update_core_coldtag"."id";

ALTER SEQUENCE "public"."update_node_coldtag_id_seq" OWNED BY "public"."update_node_coldtag"."id";

CREATE UNIQUE INDEX CORE_COLDTAG_EVENT_PKEY ON PUBLIC.CORE_COLDTAG_EVENT USING BTREE (ID);

CREATE UNIQUE INDEX CREATE_CORE_COLDTAG_MAC_ADDRESS_KEY ON PUBLIC.CREATE_CORE_COLDTAG USING BTREE (MAC_ADDRESS);

CREATE UNIQUE INDEX CREATE_CORE_COLDTAG_PKEY ON PUBLIC.CREATE_CORE_COLDTAG USING BTREE (ID);

CREATE UNIQUE INDEX CREATE_NODE_COLDTAG_MAC_ADDRESS_KEY ON PUBLIC.CREATE_NODE_COLDTAG USING BTREE (MAC_ADDRESS);

CREATE UNIQUE INDEX CREATE_NODE_COLDTAG_PKEY ON PUBLIC.CREATE_NODE_COLDTAG USING BTREE (ID);

CREATE UNIQUE INDEX NODE_COLDTAG_EVENT_ALERT_IMPACT_PKEY ON PUBLIC.NODE_COLDTAG_EVENT_ALERT_IMPACT USING BTREE (ID);

CREATE UNIQUE INDEX NODE_COLDTAG_EVENT_ALERT_LIQUID_PKEY ON PUBLIC.NODE_COLDTAG_EVENT_ALERT_LIQUID USING BTREE (ID);

CREATE UNIQUE INDEX NODE_COLDTAG_EVENT_PKEY ON PUBLIC.NODE_COLDTAG_EVENT USING BTREE (ID);

CREATE UNIQUE INDEX UPDATE_CORE_COLDTAG_PKEY ON PUBLIC.UPDATE_CORE_COLDTAG USING BTREE (ID);

CREATE UNIQUE INDEX UPDATE_NODE_COLDTAG_PKEY ON PUBLIC.UPDATE_NODE_COLDTAG USING BTREE (ID);

ALTER TABLE "public"."core_coldtag_event"
ADD CONSTRAINT "core_coldtag_event_pkey" PRIMARY KEY USING INDEX "core_coldtag_event_pkey";

ALTER TABLE "public"."create_core_coldtag"
ADD CONSTRAINT "create_core_coldtag_pkey" PRIMARY KEY USING INDEX "create_core_coldtag_pkey";

ALTER TABLE "public"."create_node_coldtag"
ADD CONSTRAINT "create_node_coldtag_pkey" PRIMARY KEY USING INDEX "create_node_coldtag_pkey";

ALTER TABLE "public"."node_coldtag_event"
ADD CONSTRAINT "node_coldtag_event_pkey" PRIMARY KEY USING INDEX "node_coldtag_event_pkey";

ALTER TABLE "public"."node_coldtag_event_alert_impact"
ADD CONSTRAINT "node_coldtag_event_alert_impact_pkey" PRIMARY KEY USING INDEX "node_coldtag_event_alert_impact_pkey";

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
ADD CONSTRAINT "node_coldtag_event_alert_liquid_pkey" PRIMARY KEY USING INDEX "node_coldtag_event_alert_liquid_pkey";

ALTER TABLE "public"."update_core_coldtag"
ADD CONSTRAINT "update_core_coldtag_pkey" PRIMARY KEY USING INDEX "update_core_coldtag_pkey";

ALTER TABLE "public"."update_node_coldtag"
ADD CONSTRAINT "update_node_coldtag_pkey" PRIMARY KEY USING INDEX "update_node_coldtag_pkey";

ALTER TABLE "public"."core_coldtag_event"
ADD CONSTRAINT "core_coldtag_event_core_coldtag_id_fkey" FOREIGN KEY (CORE_COLDTAG_ID) REFERENCES CREATE_CORE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."core_coldtag_event" VALIDATE CONSTRAINT "core_coldtag_event_core_coldtag_id_fkey";

ALTER TABLE "public"."create_core_coldtag"
ADD CONSTRAINT "create_core_coldtag_mac_address_key" UNIQUE USING INDEX "create_core_coldtag_mac_address_key";

ALTER TABLE "public"."create_node_coldtag"
ADD CONSTRAINT "create_node_coldtag_core_coldtag_id_fkey" FOREIGN KEY (CORE_COLDTAG_ID) REFERENCES CREATE_CORE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."create_node_coldtag" VALIDATE CONSTRAINT "create_node_coldtag_core_coldtag_id_fkey";

ALTER TABLE "public"."create_node_coldtag"
ADD CONSTRAINT "create_node_coldtag_mac_address_key" UNIQUE USING INDEX "create_node_coldtag_mac_address_key";

ALTER TABLE "public"."node_coldtag_event"
ADD CONSTRAINT "node_coldtag_event_node_coldtag_id_fkey" FOREIGN KEY (NODE_COLDTAG_ID) REFERENCES CREATE_NODE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."node_coldtag_event" VALIDATE CONSTRAINT "node_coldtag_event_node_coldtag_id_fkey";

ALTER TABLE "public"."node_coldtag_event_alert_impact"
ADD CONSTRAINT "node_coldtag_event_alert_impact_node_coldtag_id_fkey" FOREIGN KEY (NODE_COLDTAG_ID) REFERENCES CREATE_NODE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."node_coldtag_event_alert_impact" VALIDATE CONSTRAINT "node_coldtag_event_alert_impact_node_coldtag_id_fkey";

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
ADD CONSTRAINT "node_coldtag_event_alert_liquid_node_coldtag_id_fkey" FOREIGN KEY (NODE_COLDTAG_ID) REFERENCES CREATE_NODE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."node_coldtag_event_alert_liquid" VALIDATE CONSTRAINT "node_coldtag_event_alert_liquid_node_coldtag_id_fkey";

ALTER TABLE "public"."update_core_coldtag"
ADD CONSTRAINT "update_core_coldtag_core_coldtag_id_fkey" FOREIGN KEY (CORE_COLDTAG_ID) REFERENCES CREATE_CORE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."update_core_coldtag" VALIDATE CONSTRAINT "update_core_coldtag_core_coldtag_id_fkey";

ALTER TABLE "public"."update_node_coldtag"
ADD CONSTRAINT "update_node_coldtag_core_coldtag_id_fkey" FOREIGN KEY (CORE_COLDTAG_ID) REFERENCES CREATE_CORE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."update_node_coldtag" VALIDATE CONSTRAINT "update_node_coldtag_core_coldtag_id_fkey";

ALTER TABLE "public"."update_node_coldtag"
ADD CONSTRAINT "update_node_coldtag_node_coldtag_id_fkey" FOREIGN KEY (NODE_COLDTAG_ID) REFERENCES CREATE_NODE_COLDTAG (ID) NOT VALID;

ALTER TABLE "public"."update_node_coldtag" VALIDATE CONSTRAINT "update_node_coldtag_node_coldtag_id_fkey";

CREATE OR REPLACE VIEW "public"."core_coldtag"
WITH
  (SECURITY_INVOKER = ON) AS
SELECT
  ID,
  MAC_ADDRESS,
  COALESCE(
    (
      SELECT
        UCC.IDENTIFIER
      FROM
        UPDATE_CORE_COLDTAG UCC
      WHERE
        (
          (UCC.CORE_COLDTAG_ID = CNC.ID)
          AND (UCC.IDENTIFIER IS NOT NULL)
        )
      ORDER BY
        UCC."time" DESC
      LIMIT
        1
    ),
    IDENTIFIER
  ) AS IDENTIFIER,
  (
    SELECT
      UCC.DELETED
    FROM
      UPDATE_CORE_COLDTAG UCC
    WHERE
      (
        (UCC.CORE_COLDTAG_ID = CNC.ID)
        AND (UCC.DELETED IS NOT NULL)
      )
    ORDER BY
      UCC."time" DESC
    LIMIT
      1
  ) AS DELETED,
  "time" AS CREATED_TIME,
  COALESCE(
    (
      SELECT
        UCC."time"
      FROM
        UPDATE_CORE_COLDTAG UCC
      WHERE
        (
          (UCC.CORE_COLDTAG_ID = CNC.ID)
          AND (UCC."time" IS NOT NULL)
        )
      ORDER BY
        UCC."time" DESC
      LIMIT
        1
    ),
    "time"
  ) AS UPDATED_TIME
FROM
  CREATE_CORE_COLDTAG CNC;

CREATE OR REPLACE VIEW "public"."node_coldtag"
WITH
  (SECURITY_INVOKER = ON) AS
SELECT
  ID,
  MAC_ADDRESS,
  COALESCE(
    (
      SELECT
        UNC.CORE_COLDTAG_ID
      FROM
        UPDATE_NODE_COLDTAG UNC
      WHERE
        (
          (UNC.NODE_COLDTAG_ID = CNC.ID)
          AND (UNC.CORE_COLDTAG_ID IS NOT NULL)
        )
      ORDER BY
        UNC."time" DESC
      LIMIT
        1
    ),
    CORE_COLDTAG_ID
  ) AS CORE_COLDTAG_ID,
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

GRANT DELETE ON TABLE "public"."core_coldtag_event" TO "service_role";

GRANT INSERT ON TABLE "public"."core_coldtag_event" TO "service_role";

GRANT REFERENCES ON TABLE "public"."core_coldtag_event" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."core_coldtag_event" TO "service_role";

GRANT TRIGGER ON TABLE "public"."core_coldtag_event" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."core_coldtag_event" TO "service_role";

GRANT
UPDATE ON TABLE "public"."core_coldtag_event" TO "service_role";

GRANT DELETE ON TABLE "public"."create_core_coldtag" TO "service_role";

GRANT INSERT ON TABLE "public"."create_core_coldtag" TO "service_role";

GRANT REFERENCES ON TABLE "public"."create_core_coldtag" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."create_core_coldtag" TO "service_role";

GRANT TRIGGER ON TABLE "public"."create_core_coldtag" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."create_core_coldtag" TO "service_role";

GRANT
UPDATE ON TABLE "public"."create_core_coldtag" TO "service_role";

GRANT DELETE ON TABLE "public"."create_node_coldtag" TO "service_role";

GRANT INSERT ON TABLE "public"."create_node_coldtag" TO "service_role";

GRANT REFERENCES ON TABLE "public"."create_node_coldtag" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."create_node_coldtag" TO "service_role";

GRANT TRIGGER ON TABLE "public"."create_node_coldtag" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."create_node_coldtag" TO "service_role";

GRANT
UPDATE ON TABLE "public"."create_node_coldtag" TO "service_role";

GRANT DELETE ON TABLE "public"."node_coldtag_event" TO "service_role";

GRANT INSERT ON TABLE "public"."node_coldtag_event" TO "service_role";

GRANT REFERENCES ON TABLE "public"."node_coldtag_event" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."node_coldtag_event" TO "service_role";

GRANT TRIGGER ON TABLE "public"."node_coldtag_event" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."node_coldtag_event" TO "service_role";

GRANT
UPDATE ON TABLE "public"."node_coldtag_event" TO "service_role";

GRANT DELETE ON TABLE "public"."node_coldtag_event_alert_impact" TO "service_role";

GRANT INSERT ON TABLE "public"."node_coldtag_event_alert_impact" TO "service_role";

GRANT REFERENCES ON TABLE "public"."node_coldtag_event_alert_impact" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."node_coldtag_event_alert_impact" TO "service_role";

GRANT TRIGGER ON TABLE "public"."node_coldtag_event_alert_impact" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."node_coldtag_event_alert_impact" TO "service_role";

GRANT
UPDATE ON TABLE "public"."node_coldtag_event_alert_impact" TO "service_role";

GRANT DELETE ON TABLE "public"."node_coldtag_event_alert_liquid" TO "service_role";

GRANT INSERT ON TABLE "public"."node_coldtag_event_alert_liquid" TO "service_role";

GRANT REFERENCES ON TABLE "public"."node_coldtag_event_alert_liquid" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."node_coldtag_event_alert_liquid" TO "service_role";

GRANT TRIGGER ON TABLE "public"."node_coldtag_event_alert_liquid" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."node_coldtag_event_alert_liquid" TO "service_role";

GRANT
UPDATE ON TABLE "public"."node_coldtag_event_alert_liquid" TO "service_role";

GRANT DELETE ON TABLE "public"."update_core_coldtag" TO "service_role";

GRANT INSERT ON TABLE "public"."update_core_coldtag" TO "service_role";

GRANT REFERENCES ON TABLE "public"."update_core_coldtag" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."update_core_coldtag" TO "service_role";

GRANT TRIGGER ON TABLE "public"."update_core_coldtag" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."update_core_coldtag" TO "service_role";

GRANT
UPDATE ON TABLE "public"."update_core_coldtag" TO "service_role";

GRANT DELETE ON TABLE "public"."update_node_coldtag" TO "service_role";

GRANT INSERT ON TABLE "public"."update_node_coldtag" TO "service_role";

GRANT REFERENCES ON TABLE "public"."update_node_coldtag" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."update_node_coldtag" TO "service_role";

GRANT TRIGGER ON TABLE "public"."update_node_coldtag" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."update_node_coldtag" TO "service_role";

GRANT
UPDATE ON TABLE "public"."update_node_coldtag" TO "service_role";
