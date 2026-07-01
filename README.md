# Structured Shared Memory Demo

A bare-metal demonstration of sharing structured data between JavaScript and C
through WebAssembly linear memory — no Embind, no serialization, just direct
`TypedArray` views over a shared pointer.

## Why this approach?

* **Bare-Metal Performance** — interacts directly with the WebAssembly heap
  instead of going through high-level bindings like Embind.
* **Predictable Memory Layout** — `__attribute__((packed))` in C guarantees the
  binary layout matches the JavaScript `TypedArray` offsets exactly.
* **Zero-Copy Serialization** — `Int32Array`/`Float32Array` views map straight
  onto the shared memory address, so there's no conversion step between JS and C.

## The shared struct

```c
typedef struct __attribute__((packed)) {
    int32_t id;      // offset 0
    float   value;   // offset 4
    int32_t active;  // offset 8
} DataPacket;
```

`shared_struct.c` exposes three functions to JS via `EMSCRIPTEN_KEEPALIVE`:

| Function | Purpose |
|---|---|
| `init_packet()` | Allocates a zeroed `DataPacket` and returns a pointer |
| `process_packet(ptr)` | Doubles `value`, then sets `active` based on the sign |
| `free_packet(ptr)` | Frees the struct |

## Two ways to access the struct from JS

This repo includes two parallel examples of the same pattern, at different
levels of abstraction:

1. **Inline / low-level** — `index_struct.html`
   Builds `Int32Array`/`Float32Array` views ad hoc inside a `StructBridge`
   object each time it reads or writes. Minimal, but repeats the offset
   bookkeeping at every call site.

2. **Wrapped / object-oriented** — `index_bridge.html` (`packet_bridge.js` + `main.js`)
   `packet_bridge.js` defines a `DataPacketBridge` class that maps the views
   once in its constructor and exposes `id`, `value`, and `active` as plain
   JS getters/setters, plus a `.process()` method. `main.js` shows the
   resulting clean call site. `index_bridge.html` loads `shared_struct.js`,
   then `packet_bridge.js`, then `main.js`, in that order.

## File structure

```
.
├── shared_struct.c     # C struct definition + exported functions
├── index_struct.html   # Demo using the inline StructBridge approach
├── packet_bridge.js    # DataPacketBridge class (OOP wrapper over the struct)
├── main.js             # Demo using DataPacketBridge
├── index_bridge.html   # Demo page that loads packet_bridge.js + main.js
├── LICENSE
└── README.md
```

## Prerequisites

You need the Emscripten SDK (`emcc`) on your `PATH`. If it's not already
installed (e.g. in a clean container or Codespace):

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
cd ..
```

The `source ./emsdk_env.sh` step only affects your current shell session —
re-run it (or add it to `~/.bashrc` / `~/.profile`) in any new terminal.
Verify it worked with:

```bash
emcc --version
```

## Build instructions

1. **Compile the C code with Emscripten:**

  ```bash
    emcc shared_struct.c \
      -s EXPORTED_FUNCTIONS='["_init_packet","_process_packet","_free_packet"]' \
      -s EXPORTED_RUNTIME_METHODS='["HEAP32"]' \
      -O2 \
      -o shared_struct.js

   This produces `shared_struct.js` and `shared_struct.wasm`, which
   `index_struct.html` loads via `<script src="shared_struct.js"></script>`.

2. **Serve and test:**

   ```bash
   python3 -m http.server 8080
   ```

   Open `http://localhost:8080/index_struct.html` for the inline version, or
   `http://localhost:8080/index_bridge.html` for the `DataPacketBridge` version,
   and check the browser console for the `Input:` / `Output:` log lines
   showing `value` doubled and `active` recalculated.

## Architecture

Both demos follow the same flow:

1. `init_packet()` allocates a `DataPacket` in WASM linear memory and returns
   a pointer.
2. JS creates `Int32Array`/`Float32Array` views directly over that pointer
   address (`Module.HEAP32.buffer`), reading/writing the struct fields
   in place — no copying.
3. `process_packet(ptr)` runs the actual logic on the C side, operating on
   the same memory the JS views point to.
4. `free_packet(ptr)` releases the memory once done.

The `index_struct.html` example does this inline at each call site; the
`packet_bridge.js` / `main.js` pair wraps the same mechanics behind a
small class so call sites read like plain property access.

## License

Copyright 2026 Michael Listrom.
Licensed under the [Apache License, Version 2.0](LICENSE).
