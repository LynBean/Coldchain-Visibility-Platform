CREATE TABLE "core_coldtag_event" (
  "id" SERIAL PRIMARY KEY,
  "core_coldtag_id" INT NOT NULL REFERENCES "create_core_coldtag" (ID),
  "event_time" TIMESTAMPTZ NOT NULL,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "core_coldtag_event" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "node_coldtag_event" (
  "id" SERIAL PRIMARY KEY,
  "node_coldtag_id" INT NOT NULL REFERENCES "create_node_coldtag" (ID),
  "core_coldtag_id" INT NOT NULL REFERENCES "create_core_coldtag" (ID),
  "temperature" DOUBLE PRECISION,
  "humidity" DOUBLE PRECISION,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "core_coldtag_received_time" TIMESTAMPTZ NOT NULL,
  "event_time" TIMESTAMPTZ NOT NULL,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "node_coldtag_event" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "node_coldtag_event_alert_liquid" (
  "id" SERIAL PRIMARY KEY,
  "node_coldtag_id" INT NOT NULL REFERENCES "create_node_coldtag" (ID),
  "core_coldtag_id" INT NOT NULL REFERENCES "create_core_coldtag" (ID),
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "core_coldtag_received_time" TIMESTAMPTZ NOT NULL,
  "event_time" TIMESTAMPTZ NOT NULL,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "node_coldtag_event_alert_liquid" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "node_coldtag_event_alert_impact" (
  "id" SERIAL PRIMARY KEY,
  "node_coldtag_id" INT NOT NULL REFERENCES "create_node_coldtag" (ID),
  "core_coldtag_id" INT NOT NULL REFERENCES "create_core_coldtag" (ID),
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "core_coldtag_received_time" TIMESTAMPTZ NOT NULL,
  "event_time" TIMESTAMPTZ NOT NULL,
  "time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "node_coldtag_event_alert_impact" ENABLE ROW LEVEL SECURITY;
