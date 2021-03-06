# Project structure

- services (all tweek microservices)
  - api (rest api for getting configurations and updating context)
  - authoring (rest api for reading and editing keys definitions/manifests)
  - editor (admin ui for editing rules and managing Tweek)
  - publishing ("CI" and publishing bundles)
- dependencies
  - git-service (stand-alone git rules repository for bootstrap, dev & testing)
  - minio (object storage) - rules storage
  - redis/couchbase/mongo - context database
  - nats - pubsub
- deployments
  - dev (docker compose files for devlopment)
  - kubernetes - use together with Skaffold
- core
  - Tweek calculation lib (.Net)
- addons
  - Addons for Tweek api
- e2e (full system tests)
  - UI (full UI tests using selenium)
  - Integration (api, service interactions tests)

# Build & Run tweek environment

## Requirements

1. Docker compatible environment (Windows 10/Mac/Linux)

## Install runtime dependencies

1. Install .Net core (<https://www.microsoft.com/net/core)>
2. Install docker (<https://www.docker.com/)>
   - On windows, open docker setting through traybar and your working drive as shared drive (under shared drives)
3. Install node 8+ (<https://nodejs.org/en/)>

## Running full environment

1. clone:

   ```bash
   git clone https://github.com/Soluto/tweek.git
   cd tweek
   ```

2. Yarn start
3. Go to http://localhost:8081/login and use basic auth with (user: admin-app, password: 8v/iUG0vTH4BtVgkSn3Tng==)

Access Tweek gateway using localhost:8081.
Tweek gateway route all traffic to other resources based on: https://github.com/Soluto/tweek/blob/master/services/gateway/settings/settings.json
The root path redirect to Tweek Editor UI

## Using Tilt

Tilt is a CLI tool that can be used to create optimal development environment for multi-container apps such as Tweek, it support automatic rebuliding of images and re-running of containers on files' changes.
Additonally, it support more complex live reloading scenarios such as Tweek Editor (React app).
Tweek uses Tilt on top of docker-compose for easier and (usually) faster developer experience (comapred to Tilt with k8s or Skaffold).

- Install Tilt (https://docs.tilt.dev/install.html)
- tilt up

## Using Skaffold

If you use k8s (comes bundled with Docker for mac/pc, enable using UI), you can use Skaffold (https://github.com/GoogleContainerTools/skaffold).
Skaffold provides watch, build for all Tweek services and hot code reloading for editor in a similiar way to Tilt.
Since Skaffold/k8s run all services and dependencies together, it can take few minutes to stabilize. (k8s will attempt to restart failed services)

After installing Skaffold, use `skaffold dev --port-forward=false`

## Debugging Tweek editor

If you're not using Skaffold/Tilt, the best way to develop the editor is to run the editor locally against docker-compose:

1. go to services\editor
2. run `yarn`
3. run `yarn start:full-env`

### Unit Tests

- run `yarn test`

## E2E

1. go to e2e folder
2. run `yarn`

### run tests

- if you didn't make any changes to editor, or already built it:
  ```bash
  yarn test:full-env
  ```
- to rebuild editor and then run tests:
  ```bash
  yarn test:full-env:build
  ```
- our e2e tests are using selenium. If you don't have it installed, and you don't want to install it, you can just run the tests in docker. To do so replace `full-env` with `docker`:
  ```bash
  yarn test:docker
  ```

## Tear Down

```bash
yarn teardown
```

## Contributing

Create branch with the format {issueNumber}\_{someName}
Commit, push, create pull request

## Reporting security issues and bugs

Security issues and bugs should be reported privately, via email to tweek@soluto.com.
