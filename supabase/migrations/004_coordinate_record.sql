ALTER TABLE "public"."core_coldtag_event"
ADD COLUMN "latitude" DOUBLE PRECISION;

ALTER TABLE "public"."core_coldtag_event"
ADD COLUMN "longitude" DOUBLE PRECISION;

ALTER TABLE "public"."node_coldtag_event"
DROP COLUMN "latitude";

ALTER TABLE "public"."node_coldtag_event"
DROP COLUMN "longitude";

ALTER TABLE "public"."node_coldtag_event_alert_impact"
DROP COLUMN "latitude";

ALTER TABLE "public"."node_coldtag_event_alert_impact"
DROP COLUMN "longitude";

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
DROP COLUMN "latitude";

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
DROP COLUMN "longitude";
