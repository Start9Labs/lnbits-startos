PKG_ID := $(shell yq e ".id" manifest.yaml)
PKG_VERSION := $(shell yq e ".version" manifest.yaml)
TS_FILES := $(shell find ./ -name \*.ts)

# delete the target of a rule if it has changed and its recipe exits with a nonzero exit status
.DELETE_ON_ERROR:

all: submodule-update verify

verify: $(PKG_ID).s9pk
	@start-sdk verify s9pk $(PKG_ID).s9pk
	@echo " Done!"
	@echo "   Filesize: $(shell du -h $(PKG_ID).s9pk) is ready"

install:
ifeq (,$(wildcard ~/.embassy/config.yaml))
	@echo; echo "You must define \"host: http://server-name.local\" in ~/.embassy/config.yaml config file first"; echo
else
	start-cli package install $(PKG_ID).s9pk
endif

clean:
	rm -rf docker-images
	rm -f $(PKG_ID).s9pk
	rm -f scripts/*.js

submodule-update:
	@if [ -z "$(shell git submodule status | egrep -v '^ '|awk '{print $$2}')" ]; then \
		echo "Submodules are up to date."; \
	else \
		echo "\nUpdating submodules...\n"; \
		git submodule update --init --progress; \
	fi

scripts/embassy.js: $(TS_FILES)
	deno run --allow-read --allow-write --allow-env --allow-net scripts/bundle.ts

# for rebuilding just the arm image. will include docker-images/x86_64.tar into the s9pk if it exists
arm:
	@rm -f docker-images/x86_64.tar
	ARCH=aarch64 $(MAKE)

# for rebuilding just the x86 image. will include docker-images/aarch64.tar into the s9pk if it exists
x86:
	@rm -f docker-images/aarch64.tar
	ARCH=x86_64 $(MAKE)

docker-images/x86_64.tar: Dockerfile docker_entrypoint.sh
ifeq ($(ARCH),aarch64)
else
	mkdir -p docker-images
	docker buildx build --tag start9/$(PKG_ID)/main:$(PKG_VERSION) --platform=linux/amd64 --build-arg PLATFORM=amd64 -o type=docker,dest=docker-images/x86_64.tar .
endif

docker-images/aarch64.tar: Dockerfile docker_entrypoint.sh
ifeq ($(ARCH),x86_64)
else
	mkdir -p docker-images
	docker buildx build --tag start9/$(PKG_ID)/main:$(PKG_VERSION) --platform=linux/arm64 --build-arg PLATFORM=arm64 -o type=docker,dest=docker-images/aarch64.tar .
endif

$(PKG_ID).s9pk: manifest.yaml instructions.md LICENSE icon.png scripts/embassy.js docker-images/aarch64.tar docker-images/x86_64.tar 
ifeq ($(ARCH),aarch64)
	@echo "start-sdk: Preparing aarch64 package ..."
else ifeq ($(ARCH),x86_64)
	@echo "start-sdk: Preparing x86_64 package ..."
else
	@echo "start-sdk: Preparing Universal Package ..."
endif
	@start-sdk pack
