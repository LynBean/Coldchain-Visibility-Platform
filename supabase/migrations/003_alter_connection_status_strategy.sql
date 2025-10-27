ALTER TABLE "public"."core_coldtag_event"
DROP COLUMN "connection_status";

ALTER TABLE "public"."node_coldtag_event"
DROP COLUMN "connection_status";

ALTER TABLE "public"."node_coldtag_event"
ADD COLUMN "core_coldtag_received_time" TIMESTAMP WITH TIME ZONE NOT NULL;

ALTER TABLE "public"."node_coldtag_event_alert_impact"
DROP COLUMN "connection_status";

ALTER TABLE "public"."node_coldtag_event_alert_impact"
ADD COLUMN "core_coldtag_received_time" TIMESTAMP WITH TIME ZONE NOT NULL;

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
DROP COLUMN "connection_status";

ALTER TABLE "public"."node_coldtag_event_alert_liquid"
ADD COLUMN "core_coldtag_received_time" TIMESTAMP WITH TIME ZONE NOT NULL;

DROP TYPE "public"."coldtag_connection_status";
