"""
Upload local Qdrant collections to a Qdrant Cloud cluster.

Reads the local file-mode DB (QDRANT_LOCAL_PATH) and copies every collection
— config + all points (vectors + payloads) — to the cloud cluster
(QDRANT_URL + QDRANT_API_KEY). Per collection it recreates the cloud collection
to match, then upserts in batches. Re-runnable (idempotent).

Run as a one-off container (stack can stay DOWN — avoids the local file lock):

    docker compose run --rm --no-deps \
      -e QDRANT_URL="https://<id>.<region>.aws.cloud.qdrant.io:6333" \
      -e QDRANT_API_KEY="<your key>" \
      backend python scripts/qdrant_upload_cloud.py

(The :6333 REST port is required for the cloud URL.)
"""
import os
import sys

from qdrant_client import QdrantClient
from qdrant_client.http import models as qm

LOCAL_PATH = os.environ.get("QDRANT_LOCAL_PATH", "/app/data/qdrant_local")
CLOUD_URL = os.environ.get("QDRANT_URL")
CLOUD_KEY = os.environ.get("QDRANT_API_KEY")
BATCH = 256


def main() -> int:
    if not CLOUD_URL:
        print("ERROR: set QDRANT_URL (and QDRANT_API_KEY).")
        return 1

    local = QdrantClient(path=LOCAL_PATH)
    cloud = QdrantClient(url=CLOUD_URL, api_key=CLOUD_KEY, timeout=120)

    names = [c.name for c in local.get_collections().collections]
    if not names:
        print(f"No local collections found at {LOCAL_PATH}.")
        return 1
    print(f"Local collections ({LOCAL_PATH}): {names}\n")

    for name in names:
        info = local.get_collection(name)
        vectors_config = info.config.params.vectors      # VectorParams or dict
        local_count = local.count(name, exact=True).count

        # Recreate the cloud collection to match the local one.
        if cloud.collection_exists(name):
            cloud.delete_collection(name)
        cloud.create_collection(collection_name=name,
                                vectors_config=vectors_config)
        print(f"[{name}] created on cloud — copying {local_count} points")

        # Stream all points and upsert in batches.
        offset = None
        total = 0
        while True:
            points, offset = local.scroll(
                collection_name=name, with_vectors=True, with_payload=True,
                limit=BATCH, offset=offset)
            if not points:
                break
            cloud.upsert(collection_name=name, points=[
                qm.PointStruct(id=p.id, vector=p.vector, payload=p.payload)
                for p in points
            ])
            total += len(points)
            print(f"  +{len(points)}  (total {total}/{local_count})")
            if offset is None:
                break

        cloud_count = cloud.count(name, exact=True).count
        ok = "OK" if cloud_count == local_count else "MISMATCH"
        print(f"[{name}] cloud count = {cloud_count}  [{ok}]\n")

    print("Done. Set QDRANT_URL + QDRANT_API_KEY on the backend to use the cloud.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
