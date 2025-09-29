CREATE TABLE "create_user" (
  "id" UUID PRIMARY KEY REFERENCES "auth"."users" (ID),
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "update_user" (
  "id" SERIAL PRIMARY KEY,
  "create_user_id" UUID NOT NULL REFERENCES "create_user" (ID),
  "operator_user_id" UUID REFERENCES "create_user" (ID),
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "create_user" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "update_user" ENABLE ROW LEVEL SECURITY;

CREATE VIEW "user"
WITH
  (SECURITY_INVOKER = ON) AS (
    SELECT
      CU.ID,
      CU.TIME
    FROM
      "create_user" CU
      LEFT JOIN "auth"."users" AU ON AU.ID = CU.ID
      LEFT JOIN "update_user" UU ON UU.CREATE_USER_ID = CU.ID
  );
