Module.onRuntimeInitialized = () => {
    // Initialization via abstraction
    const packet = new DataPacketBridge(_init_packet());

    // Clean setter API
    packet.id = 101;
    packet.value = 2.5;
    packet.active = 1;

    console.log("Input:", { id: packet.id, val: packet.value });

    // Logical processing triggered via abstraction
    packet.process();

    console.log("Output:", { id: packet.id, val: packet.value });

    // Cleanup
    _free_packet(packet.ptr);
};
