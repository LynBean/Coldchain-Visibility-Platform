import asyncio
import builtins
import json
from collections.abc import AsyncGenerator, Callable, Coroutine
from contextlib import asynccontextmanager, suppress
from datetime import UTC, datetime
from random import choice, uniform
from typing import Any

import httpx
from aiomqtt import Client as MQTTClient
from aiomqtt import MqttError
from fastapi import FastAPI
from loguru import logger
from pydantic import BaseModel, ConfigDict

MQTT_HOST = "127.0.0.1"

MQTT_PORT = 1883


class AppMQTT(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    class MockCore(BaseModel):
        mac_address: str
        identifier: str

    class MockNode(BaseModel):
        mac_address: str
        identifier: str

    client: MQTTClient

    is_shutdown: asyncio.Event = asyncio.Event()

    core_devices: list[MockCore] = [
        MockCore(mac_address="01:01:01:01:01:01", identifier="Mock Device - 01"),
        MockCore(mac_address="02:02:02:02:02:02", identifier="Mock Device - 02"),
        MockCore(mac_address="03:03:03:03:03:03", identifier="Mock Device - 03"),
        MockCore(mac_address="04:04:04:04:04:04", identifier="Mock Device - 04"),
    ]
    node_devices: list[MockNode] = [
        MockNode(mac_address="05:05:05:05:05:05", identifier="Mock Device - 05"),
        MockNode(mac_address="06:06:06:06:06:06", identifier="Mock Device - 06"),
        MockNode(mac_address="07:07:07:07:07:07", identifier="Mock Device - 07"),
        MockNode(mac_address="08:08:08:08:08:08", identifier="Mock Device - 08"),
        MockNode(mac_address="09:09:09:09:09:09", identifier="Mock Device - 09"),
        MockNode(mac_address="10:10:10:10:10:10", identifier="Mock Device - 10"),
    ]

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

    async def create_mock_devices(self) -> None:
        async def create_core(core: AppMQTT.MockCore) -> None:
            async with httpx.AsyncClient() as http_client:
                query = """
                mutation CreateCoreColdtag($macAddress: String!, $identifier: String!) {
                    createCoreColdtag(macAddress: $macAddress, identifier: $identifier) {
                        id
                    }
                }
                """
                variables = {"macAddress": core.mac_address, "identifier": core.identifier}
                with suppress(builtins.BaseException):
                    await http_client.post(
                        "http://127.0.0.1:5000/graphql", json={"query": query, "variables": variables}
                    )

        async def create_node(node: AppMQTT.MockNode) -> None:
            async with httpx.AsyncClient() as http_client:
                query = """
                mutation CreateNodeColdtag($macAddress: String!, $identifier: String!) {
                    createNodeColdtag(macAddress: $macAddress, identifier: $identifier) {
                        id
                    }
                }
                """
                variables = {"macAddress": node.mac_address, "identifier": node.identifier}
                with suppress(builtins.BaseException):
                    await http_client.post(
                        "http://127.0.0.1:5000/graphql", json={"query": query, "variables": variables}
                    )

        await asyncio.gather(*[create_core(core) for core in self.core_devices])
        await asyncio.gather(*[create_node(node) for node in self.node_devices])

    async def _schedule_task(
        self,
        delay: Callable[..., float],
        devices: list[MockCore] | list[MockNode],
        function: Callable[..., Coroutine[Any, Any, None]],
    ) -> None:
        while True:
            await asyncio.gather(*[function(t) for t in devices])
            await asyncio.sleep(delay())

    async def publish_core_event(self) -> asyncio.Task:
        async def create(core: AppMQTT.MockCore) -> None:
            logger.info(f"Publishing core_event/{core.mac_address}/telementry")
            await self.client.publish(
                topic=f"core_event/{core.mac_address}/telementry",
                payload=json.dumps({"event_time": datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")}),
            )

        return asyncio.create_task(
            self._schedule_task(
                lambda: 300,
                self.core_devices,
                create,
            )
        )

    async def publish_node_event(self) -> asyncio.Task:
        async def create(node: AppMQTT.MockNode) -> None:
            logger.info(f"Publishing node_event/{node.mac_address}/telementry")
            await self.client.publish(
                topic=f"node_event/{node.mac_address}/telementry",
                payload=json.dumps(
                    {
                        "core_mac_address": choice(self.core_devices).mac_address,
                        "temperature": uniform(10.5, 75.5),
                        "humidity": uniform(10.5, 75.5),
                        "latitude": uniform(10.5, 75.5),
                        "longitude": uniform(10.5, 75.5),
                        "core_coldtag_received_time": datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "event_time": datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    }
                ),
            )

        return asyncio.create_task(
            self._schedule_task(
                lambda: 3,
                self.node_devices,
                create,
            )
        )

    async def publish_node_event_alert_impact(self) -> asyncio.Task:
        async def create(node: AppMQTT.MockNode) -> None:
            logger.info(f"Publishing node_event/{node.mac_address}/alert/impact")
            await self.client.publish(
                topic=f"node_event/{node.mac_address}/alert/impact",
                payload=json.dumps(
                    {
                        "core_mac_address": choice(self.core_devices).mac_address,
                        "latitude": uniform(10.5, 75.5),
                        "longitude": uniform(10.5, 75.5),
                        "core_coldtag_received_time": datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "event_time": datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    }
                ),
            )

        return asyncio.create_task(
            self._schedule_task(
                lambda: uniform(2700, 3600),
                self.node_devices,
                create,
            )
        )

    async def publish_node_event_alert_liquid(self) -> asyncio.Task:
        async def create(node: AppMQTT.MockNode) -> None:
            logger.info(f"Publishing node_event/{node.mac_address}/alert/liquid")
            await self.client.publish(
                topic=f"node_event/{node.mac_address}/alert/liquid",
                payload=json.dumps(
                    {
                        "core_mac_address": choice(self.core_devices).mac_address,
                        "latitude": uniform(10.5, 75.5),
                        "longitude": uniform(10.5, 75.5),
                        "core_coldtag_received_time": datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "event_time": datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    }
                ),
            )

        return asyncio.create_task(
            self._schedule_task(
                lambda: uniform(2700, 3600),
                self.node_devices,
                create,
            )
        )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    app.extra["mqtt"] = MQTTClient(hostname=MQTT_HOST, port=MQTT_PORT)

    mqtt = AppMQTT(client=app.extra["mqtt"])
    await mqtt.connect()
    await mqtt.create_mock_devices()
    await mqtt.publish_core_event()
    await mqtt.publish_node_event()
    await mqtt.publish_node_event_alert_impact()
    await mqtt.publish_node_event_alert_liquid()

    yield

    await mqtt.disconnect()


app = FastAPI(lifespan=lifespan)
