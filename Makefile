 #!Make
DENO=deno
BUNDLE=$(DENO) bundle
RUN=$(DENO) run
TEST=$(DENO) test
FMT=$(DENO) fmt
LINT=$(DENO) lint
BUILD=${DENO} compile
DEPS=${DENO} info
DOCS=${DENO} doc main.ts --json
INSPECT=${DENO} run --inspect
VERSION=0.0.1
DESCRIPTION=Benchmark tool for testing endpoint
AUTHOR=stephendltg
DENOV=1.13.2

install: 
	@echo "Installing project USBcopy ..."
	curl -fsSL https://deno.land/x/install/install.sh | sh
	deno upgrade --version ${DENOV}
  
version:
	@echo "Version Deno ..."
	$(DENO) --version

upgrade:
	@echo "Update Deno ..."
	$(DENO) upgrade

tool:
	@echo "Deno tools ..."
	${DEPS}
	${FMT}
	${LINT} --unstable

dev:
	@echo "Deno dev ..."
	deno run --allow-all --unstable --watch .\USBcopy.ts 

clean:
	@echo "Deno cleaning ..."
	rm -f ${BINARY_NAME}.exe

compile:
	@echo "Deno Compile ..."
	deno compile -A --unstable .\USBcopy.ts

inspect:
	@echo "Deno inspect ..."
	@echo "Open chrome & chrome://inspect"
	${INSPECT} --allow-all --unstable .\USBcopy.ts

env:
	@echo "Version: $(VERSION)"
	@echo "Description: $(DESCRIPTION)"
	@echo "Homepage: $(HOMEPAGE)"
	@echo "Author: $(AUTHOR)"
	@echo "Deno: ${DENOV}"