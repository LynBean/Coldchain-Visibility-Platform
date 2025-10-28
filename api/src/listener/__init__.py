import asyncio
import json
import os
import re
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from aiomqtt import Client as MQTTClient
from aiomqtt import MqttError
from fastapi import FastAPI
from loguru import logger
from pydantic import BaseModel, ConfigDict

if TYPE_CHECKING:
    from src.persistence.coldtag import ColdtagPersistence


HOST: str = os.getenv("MQTT_BROKER_HOST", "127.0.0.1")

PORT: int = int(os.getenv("MQTT_BROKER_PORT", "1883"))


class AppMQTT(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    client: MQTTClient

    is_shutdown: asyncio.Event = asyncio.Event()

    async def connect(self) -> asyncio.Task:
        async def task() -> None:
            while True:
                try:
                    async with self.client:
                        await self.is_shutdown.wait()

                        if self.is_shutdown.is_set():
                            break

                except MqttError as err:
                    logger.exception(err)
                    await asyncio.sleep(2)

        result = asyncio.create_task(task())

        while not self.client._client.is_connected():  # noqa: SLF001
            await asyncio.sleep(2)
            continue

        return result

    async def disconnect(self) -> None:
        self.is_shutdown.set()

    async def subscribe_core_event(self, app: FastAPI, /) -> asyncio.Task:
        coldtag_persistence: ColdtagPersistence = app.extra["coldtag_persistence"]

        async def task() -> None:
            while True:
                try:
                    await self.client.subscribe("core_event/+/telementry")
                    async for message in self.client.messages:
                        try:
                            if not re.compile(r"^core_event/[^/]+/telementry$").match(message.topic.value):
                                continue

                            topics = message.topic.value.split("/")
                            payload = json.loads(
                                message.payload.decode() if isinstance(message.payload, bytes) else str(message.payload)
                            )

                            core_mac_address = topics[1]
                            event_time = datetime.strptime(payload["event_time"], "%Y-%m-%dT%H:%M:%SZ").astimezone(UTC)

                            persisted_core = await coldtag_persistence.find_core_by_mac_address(core_mac_address)

                            assert persisted_core is not None

                            await coldtag_persistence.create_core_event(
                                persisted_core.id,
                                time=event_time,
                            )

                        except Exception as err:
                            logger.exception(err)
                            continue

                except MqttError as err:
                    logger.exception(err)
                    await asyncio.sleep(2)

        return asyncio.create_task(task())

    async def subscribe_node_event(self, app: FastAPI, /) -> asyncio.Task:
        coldtag_persistence: ColdtagPersistence = app.extra["coldtag_persistence"]

        async def task() -> None:
            while True:
                try:
                    await self.client.subscribe("node_event/+/telementry")
                    async for message in self.client.messages:
                        try:
                            if not re.compile(r"^node_event/[^/]+/telementry$").match(message.topic.value):
                                continue

                            topics = message.topic.value.split("/")
                            payload = json.loads(
                                message.payload.decode() if isinstance(message.payload, bytes) else str(message.payload)
                            )

                            node_mac_address = topics[1]
                            core_mac_address = payload["core_mac_address"]
                            temperature = float(payload["temperature"])
                            humidity = float(payload["humidity"])
                            latitude = float(payload["latitude"])
                            longitude = float(payload["longitude"])
                            core_coldtag_received_time = datetime.strptime(
                                payload["core_coldtag_received_time"], "%Y-%m-%dT%H:%M:%SZ"
                            ).astimezone(UTC)
                            event_time = datetime.strptime(payload["event_time"], "%Y-%m-%dT%H:%M:%SZ").astimezone(UTC)

                            persisted_node = await coldtag_persistence.find_node_by_mac_address(node_mac_address)
                            persisted_core = await coldtag_persistence.find_core_by_mac_address(core_mac_address)

                            assert persisted_node is not None
                            assert persisted_core is not None

                            await coldtag_persistence.create_node_event(
                                persisted_node.id,
                                core_id=persisted_core.id,
                                temperature=temperature,
                                humidity=humidity,
                                latitude=latitude,
                                longitude=longitude,
                                core_received_time=core_coldtag_received_time,
                                time=event_time,
                            )

                        except Exception as err:
                            logger.exception(err)
                            continue

                except MqttError as err:
                    logger.exception(err)
                    await asyncio.sleep(2)

        return asyncio.create_task(task())

    async def subscribe_node_event_alert_impact(self, app: FastAPI, /) -> asyncio.Task:
        coldtag_persistence: ColdtagPersistence = app.extra["coldtag_persistence"]

        async def task() -> None:
            while True:
                try:
                    await self.client.subscribe("node_event/+/alert/impact")
                    async for message in self.client.messages:
                        try:
                            if not re.compile(r"^node_event/[^/]+/alert/impact$").match(message.topic.value):
                                continue

                            topics = message.topic.value.split("/")
                            payload = json.loads(
                                message.payload.decode() if isinstance(message.payload, bytes) else str(message.payload)
                            )

                            node_mac_address = topics[1]
                            core_mac_address = payload["core_mac_address"]
                            latitude = float(payload["latitude"])
                            longitude = float(payload["longitude"])
                            core_coldtag_received_time = datetime.strptime(
                                payload["core_coldtag_received_time"], "%Y-%m-%dT%H:%M:%SZ"
                            ).astimezone(UTC)
                            event_time = datetime.strptime(payload["event_time"], "%Y-%m-%dT%H:%M:%SZ").astimezone(UTC)

                            persisted_node = await coldtag_persistence.find_node_by_mac_address(node_mac_address)
                            persisted_core = await coldtag_persistence.find_core_by_mac_address(core_mac_address)

                            assert persisted_node is not None
                            assert persisted_core is not None

                            await coldtag_persistence.create_node_event_alert_impact(
                                persisted_node.id,
                                core_id=persisted_core.id,
                                latitude=latitude,
                                longitude=longitude,
                                core_received_time=core_coldtag_received_time,
                                time=event_time,
                            )

                        except Exception as err:
                            logger.exception(err)
                            continue

                except MqttError as err:
                    logger.exception(err)
                    await asyncio.sleep(2)

        return asyncio.create_task(task())

    async def subscribe_node_event_alert_liquid(self, app: FastAPI, /) -> asyncio.Task:
        coldtag_persistence: ColdtagPersistence = app.extra["coldtag_persistence"]

        async def task() -> None:
            while True:
                try:
                    await self.client.subscribe("node_event/+/alert/liquid")
                    async for message in self.client.messages:
                        try:
                            if not re.compile(r"^node_event/[^/]+/alert/liquid$").match(message.topic.value):
                                continue

                            topics = message.topic.value.split("/")
                            payload = json.loads(
                                message.payload.decode() if isinstance(message.payload, bytes) else str(message.payload)
                            )

                            node_mac_address = topics[1]
                            core_mac_address = payload["core_mac_address"]
                            latitude = float(payload["latitude"])
                            longitude = float(payload["longitude"])
                            core_coldtag_received_time = datetime.strptime(
                                payload["core_coldtag_received_time"], "%Y-%m-%dT%H:%M:%SZ"
                            ).astimezone(UTC)
                            event_time = datetime.strptime(payload["event_time"], "%Y-%m-%dT%H:%M:%SZ").astimezone(UTC)

                            persisted_node = await coldtag_persistence.find_node_by_mac_address(node_mac_address)
                            persisted_core = await coldtag_persistence.find_core_by_mac_address(core_mac_address)

                            assert persisted_node is not None
                            assert persisted_core is not None

                            await coldtag_persistence.create_node_event_alert_liquid(
                                persisted_node.id,
                                core_id=persisted_core.id,
                                latitude=latitude,
                                longitude=longitude,
                                core_received_time=core_coldtag_received_time,
                                time=event_time,
                            )

                        except Exception as err:
                            logger.exception(err)
                            continue

                except MqttError as err:
                    logger.exception(err)
                    await asyncio.sleep(2)

        return asyncio.create_task(task())


async def create_mqtt_client() -> AppMQTT:
    client = MQTTClient(hostname=HOST, port=PORT)
    return AppMQTT(client=client)
