---
name: release-safety
description: Checks release readiness, deploy safety, health verification, monitoring, and rollback evidence.
---
# Release safety

A release is eligible only when required checks pass, the change has been independently reviewed, the preview has been verified, and the target environment is known. Confirm that required secrets are present without reading or printing their values.

Before production deployment, verify health checks, error monitoring, asset availability, routing, cache behavior, and a deterministic rollback path. Never infer production success from a build result. Record release commit, deployment identifier, health evidence, and rollback target.

This skill is advisory. Do not merge, deploy, alter DNS, change Cloudflare settings, or mutate secrets.
