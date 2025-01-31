# Makefile for pg_duckdb
# Remove all git submodule references, rely on local duckdb folder in third_party/duckdb.

.PHONY: duckdb install-duckdb clean-duckdb clean-all lintcheck check-regression-duckdb clean-regression

MODULE_big = pg_duckdb
EXTENSION = pg_duckdb
DATA = pg_duckdb.control $(wildcard sql/pg_duckdb--*.sql)

SRCS = $(wildcard src/*.cpp src/*/*.cpp)
OBJS = $(subst .cpp,.o, $(SRCS))

C_SRCS = $(wildcard src/*.c src/*/*.c)
OBJS += $(subst .c,.o, $(C_SRCS))

###############################################################################
# Where is the DuckDB source? By default, we assume it's in `third_party/duckdb`.
# If you keep it somewhere else, adjust `DUCKDB_SRC_ROOT`.
###############################################################################
DUCKDB_SRC_ROOT = third_party/duckdb

# If you prefer 'make' instead of 'ninja', set DUCKDB_GEN = make
DUCKDB_GEN ?= ninja

# Used to override the reported version in DuckDB build (not strictly required)
DUCKDB_VERSION = v1.1.3

# Basic CMake flags for building DuckDB
DUCKDB_CMAKE_VARS = -DBUILD_SHELL=0 -DBUILD_PYTHON=0 -DBUILD_UNITTESTS=0

# Whether to disable asserts in DuckDB (0 = enable, 1 = disable)
DUCKDB_DISABLE_ASSERTIONS ?= 0

DUCKDB_BUILD_CXX_FLAGS =
DUCKDB_BUILD_TYPE =
ifeq ($(DUCKDB_BUILD),Debug)
    DUCKDB_BUILD_CXX_FLAGS = -g -O0 -D_GLIBCXX_ASSERTIONS
    DUCKDB_BUILD_TYPE = debug
else
    DUCKDB_BUILD_CXX_FLAGS =
    DUCKDB_BUILD_TYPE = release
endif

DUCKDB_LIB = libduckdb$(DLSUFFIX)
$(info DLSUFFIX is "$(DLSUFFIX)")

# The final DuckDB library path after we build it
FULL_DUCKDB_LIB = $(DUCKDB_SRC_ROOT)/build/$(DUCKDB_BUILD_TYPE)/src/$(DUCKDB_LIB)

ERROR_ON_WARNING ?=
ifeq ($(ERROR_ON_WARNING),1)
    ERROR_ON_WARNING = -Werror
else
    ERROR_ON_WARNING =
endif

# Compiler warnings
COMPILER_FLAGS = -Wno-sign-compare -Wshadow -Wswitch -Wunused-parameter \
                 -Wunreachable-code -Wno-unknown-pragmas -Wall -Wextra ${ERROR_ON_WARNING}

###############################################################################
# PostgreSQL extension build flags
###############################################################################
# Include paths for DuckDB + re2
override PG_CPPFLAGS += -Iinclude \
    -isystem $(DUCKDB_SRC_ROOT)/src/include \
    -isystem $(DUCKDB_SRC_ROOT)/third_party/re2 \
    $(COMPILER_FLAGS)

# We need C++17 for DuckDB
override PG_CXXFLAGS += -std=c++17 $(DUCKDB_BUILD_CXX_FLAGS) $(COMPILER_FLAGS) -Wno-register

# Postgres enforces "no declaration after statement" in C; let's ignore that
override PG_CFLAGS += -Wno-declaration-after-statement

# Link with DuckDB, stdc++, etc.
SHLIB_LINK += -Wl,-rpath,$(PG_LIB)/ \
              -lpq \
              -L$(DUCKDB_SRC_ROOT)/build/$(DUCKDB_BUILD_TYPE)/src \
              -L$(PG_LIB) \
              -lduckdb \
              -lstdc++ \
              -llz4

###############################################################################
# Include PGXS or your local Makefile.global
###############################################################################
include Makefile.global
# or:  include $(shell pg_config --pgxs)

# The final shared library for pg_duckdb depends on DuckDB lib + our OBJs
$(shlib): $(FULL_DUCKDB_LIB) $(OBJS)

NO_INSTALLCHECK = 1
PYTEST_CONCURRENCY = auto

###############################################################################
# Regression tests and other checks
###############################################################################
check-regression-duckdb:
	$(MAKE) -C test/regression check-regression-duckdb

clean-regression:
	$(MAKE) -C test/regression clean-regression

installcheck: all install
	$(MAKE) check-regression-duckdb

pycheck: all install
	LD_LIBRARY_PATH=$(PG_LIBDIR):${LD_LIBRARY_PATH} pytest -n $(PYTEST_CONCURRENCY)

check: installcheck pycheck

###############################################################################
# Build DuckDB library
###############################################################################
duckdb: $(FULL_DUCKDB_LIB)

$(FULL_DUCKDB_LIB):
	@echo "Building DuckDB in $(DUCKDB_SRC_ROOT) ..."
	OVERRIDE_GIT_DESCRIBE=$(DUCKDB_VERSION) \
	GEN=$(DUCKDB_GEN) \
	CMAKE_VARS="$(DUCKDB_CMAKE_VARS)" \
	DISABLE_SANITIZER=1 \
	DISABLE_ASSERTIONS=$(DUCKDB_DISABLE_ASSERTIONS) \
	EXTENSION_CONFIGS="../pg_duckdb_extensions.cmake" \
	$(MAKE) -C $(DUCKDB_SRC_ROOT) \
	$(DUCKDB_BUILD_TYPE)

###############################################################################
# Install the DuckDB .so into Postgres lib dir
###############################################################################
install-duckdb: $(FULL_DUCKDB_LIB) $(shlib)
	$(INSTALL_LIB) $(FULL_DUCKDB_LIB) $(DESTDIR)$(PG_LIB)

###############################################################################
# Cleanup rules
###############################################################################
clean-duckdb:
	rm -rf $(DUCKDB_SRC_ROOT)/build

install: install-duckdb

clean-all: clean clean-regression clean-duckdb

###############################################################################
# Lint, format, etc.
###############################################################################
lintcheck:
	clang-tidy $(SRCS) -- \
	    -I$(INCLUDEDIR) -I$(INCLUDEDIR_SERVER) -Iinclude $(CPPFLAGS) -std=c++17
	ruff check

format:
	git clang-format origin/main
	ruff format

format-all:
	find src include -iname '*.hpp' -o -iname '*.h' -o -iname '*.cpp' -o -iname '*.c' \
	    | xargs clang-format -i
	ruff format
