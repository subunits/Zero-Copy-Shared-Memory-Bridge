function runBridgeDemo() {
    console.log("System runtime connected. Executing Class-Bridge memory operations...");

    setTimeout(() => {
        try {
            const initFn = window._init_packet || (window.Module && window.Module._init_packet);
            const freeFn = window._free_packet || (window.Module && window.Module._free_packet);
            if (!initFn) throw new Error("WASM _init_packet function not found!");

            const packet = new DataPacketBridge(initFn());

            packet.id = 101;
            packet.value = 2.5;
            packet.active = 1;

            console.log("Input Layout Data:", { id: packet.id, value: packet.value, active: packet.active });

            packet.process();

            console.log("Output Layout Data (Processed in C):", { id: packet.id, value: packet.value, active: packet.active });

            if (freeFn) freeFn(packet.ptr);
        } catch (err) {
            console.log("Execution Error: " + err.message);
        }
    }, 50);
}

if (window.Module && window.Module.runtimeInitialized) {
    runBridgeDemo();
} else {
    window.Module = window.Module || {};
    window.Module.onRuntimeInitialized = runBridgeDemo;
}
