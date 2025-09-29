CREATE SEQUENCE "public"."update_user_id_seq";

CREATE TABLE "public"."create_user" (
  "id" UUID NOT NULL,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."create_user" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."update_user" (
  "id" INTEGER NOT NULL DEFAULT NEXTVAL('update_user_id_seq'::REGCLASS),
  "create_user_id" UUID NOT NULL,
  "operator_user_id" UUID,
  "time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."update_user" ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."update_user_id_seq" OWNED BY "public"."update_user"."id";

CREATE UNIQUE INDEX CREATE_USER_PKEY ON PUBLIC.CREATE_USER USING BTREE (ID);

CREATE UNIQUE INDEX UPDATE_USER_PKEY ON PUBLIC.UPDATE_USER USING BTREE (ID);

ALTER TABLE "public"."create_user"
ADD CONSTRAINT "create_user_pkey" PRIMARY KEY USING INDEX "create_user_pkey";

ALTER TABLE "public"."update_user"
ADD CONSTRAINT "update_user_pkey" PRIMARY KEY USING INDEX "update_user_pkey";

ALTER TABLE "public"."create_user"
ADD CONSTRAINT "create_user_id_fkey" FOREIGN KEY (ID) REFERENCES AUTH.USERS (ID) NOT VALID;

ALTER TABLE "public"."create_user" VALIDATE CONSTRAINT "create_user_id_fkey";

ALTER TABLE "public"."update_user"
ADD CONSTRAINT "update_user_create_user_id_fkey" FOREIGN KEY (CREATE_USER_ID) REFERENCES CREATE_USER (ID) NOT VALID;

ALTER TABLE "public"."update_user" VALIDATE CONSTRAINT "update_user_create_user_id_fkey";

ALTER TABLE "public"."update_user"
ADD CONSTRAINT "update_user_operator_user_id_fkey" FOREIGN KEY (OPERATOR_USER_ID) REFERENCES CREATE_USER (ID) NOT VALID;

ALTER TABLE "public"."update_user" VALIDATE CONSTRAINT "update_user_operator_user_id_fkey";

CREATE OR REPLACE VIEW "public"."user"
WITH
  (SECURITY_INVOKER = ON) AS
SELECT
  CU.ID,
  CU."time"
FROM
  (
    (
      CREATE_USER CU
      LEFT JOIN AUTH.USERS AU ON ((AU.ID = CU.ID))
    )
    LEFT JOIN UPDATE_USER UU ON ((UU.CREATE_USER_ID = CU.ID))
  );

GRANT DELETE ON TABLE "public"."create_user" TO "service_role";

GRANT INSERT ON TABLE "public"."create_user" TO "service_role";

GRANT REFERENCES ON TABLE "public"."create_user" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."create_user" TO "service_role";

GRANT TRIGGER ON TABLE "public"."create_user" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."create_user" TO "service_role";

GRANT
UPDATE ON TABLE "public"."create_user" TO "service_role";

GRANT DELETE ON TABLE "public"."update_user" TO "service_role";

GRANT INSERT ON TABLE "public"."update_user" TO "service_role";

GRANT REFERENCES ON TABLE "public"."update_user" TO "service_role";

GRANT
SELECT
  ON TABLE "public"."update_user" TO "service_role";

GRANT TRIGGER ON TABLE "public"."update_user" TO "service_role";

GRANT
TRUNCATE ON TABLE "public"."update_user" TO "service_role";

GRANT
UPDATE ON TABLE "public"."update_user" TO "service_role";
