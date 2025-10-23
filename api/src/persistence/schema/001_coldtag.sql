CREATE TABLE "create_core_coldtag" (
  "id" SERIAL PRIMARY KEY,
  "mac_address" TEXT UNIQUE NOT NULL,
  "identifier" TEXT,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "create_core_coldtag" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "update_core_coldtag" (
  "id" SERIAL PRIMARY KEY,
  "core_coldtag_id" INT NOT NULL REFERENCES "create_core_coldtag" (ID),
  "identifier" TEXT,
  "deleted" BOOLEAN,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "update_core_coldtag" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "create_node_coldtag" (
  "id" SERIAL PRIMARY KEY,
  "mac_address" TEXT UNIQUE NOT NULL,
  "identifier" TEXT,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "create_node_coldtag" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "update_node_coldtag" (
  "id" SERIAL PRIMARY KEY,
  "node_coldtag_id" INT NOT NULL REFERENCES "create_node_coldtag" (ID),
  "identifier" TEXT,
  "deleted" BOOLEAN,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "update_node_coldtag" ENABLE ROW LEVEL SECURITY;

CREATE VIEW "core_coldtag" AS (
  SELECT
    CNC.ID,
    CNC.MAC_ADDRESS,
    COALESCE(
      (
        SELECT
          UCC.IDENTIFIER
        FROM
          "update_core_coldtag" UCC
        WHERE
          UCC.CORE_COLDTAG_ID = CNC.ID
          AND UCC.IDENTIFIER IS NOT NULL
        ORDER BY
          UCC.TIME DESC
        LIMIT
          1
      ),
      CNC.IDENTIFIER
    ) AS "identifier",
    (
      SELECT
        UCC.DELETED
      FROM
        "update_core_coldtag" UCC
      WHERE
        UCC.CORE_COLDTAG_ID = CNC.ID
        AND UCC.DELETED IS NOT NULL
      ORDER BY
        UCC.TIME DESC
      LIMIT
        1
    ),
    CNC.TIME AS "created_time",
    COALESCE(
      (
        SELECT
          UCC.TIME
        FROM
          "update_core_coldtag" UCC
        WHERE
          UCC.CORE_COLDTAG_ID = CNC.ID
          AND UCC.TIME IS NOT NULL
        ORDER BY
          UCC.TIME DESC
        LIMIT
          1
      ),
      CNC.TIME
    ) AS "updated_time"
  FROM
    "create_core_coldtag" CNC
);

CREATE VIEW "node_coldtag" AS (
  SELECT
    CNC.ID,
    CNC.MAC_ADDRESS,
    COALESCE(
      (
        SELECT
          UNC.IDENTIFIER
        FROM
          "update_node_coldtag" UNC
        WHERE
          UNC.NODE_COLDTAG_ID = CNC.ID
          AND UNC.IDENTIFIER IS NOT NULL
        ORDER BY
          UNC.TIME DESC
        LIMIT
          1
      ),
      CNC.IDENTIFIER
    ) AS "identifier",
    (
      SELECT
        UNC.DELETED
      FROM
        "update_node_coldtag" UNC
      WHERE
        UNC.NODE_COLDTAG_ID = CNC.ID
        AND UNC.DELETED IS NOT NULL
      ORDER BY
        UNC.TIME DESC
      LIMIT
        1
    ),
    CNC.TIME AS "created_time",
    COALESCE(
      (
        SELECT
          UNC.TIME
        FROM
          "update_node_coldtag" UNC
        WHERE
          UNC.NODE_COLDTAG_ID = CNC.ID
          AND UNC.TIME IS NOT NULL
        ORDER BY
          UNC.TIME DESC
        LIMIT
          1
      ),
      CNC.TIME
    ) AS "updated_time"
  FROM
    "create_node_coldtag" CNC
);
