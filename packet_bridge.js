// A formal wrapper for the DataPacket struct defined in C
class DataPacketBridge {
    constructor(ptr) {
        this.ptr = ptr;
        // Map the structure offsets once
        this.i32 = new Int32Array(Module.HEAP32.buffer, this.ptr, 3);
        this.f32 = new Float32Array(Module.HEAP32.buffer, this.ptr, 3);
    }

    get id() { return this.i32[0]; }
    set id(val) { this.i32[0] = val; }

    get value() { return this.f32[1]; }
    set value(val) { this.f32[1] = val; }

    get active() { return this.i32[2]; }
    set active(val) { this.i32[2] = val; }

    // Logic abstraction
    process() {
        _process_packet(this.ptr);
    }
}
