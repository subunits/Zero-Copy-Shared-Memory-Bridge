class DataPacketBridge {
    constructor(ptr) {
        this.ptr = ptr;
        
        const heap = window.Module?.HEAP32?.buffer || (typeof Module !== 'undefined' && Module.HEAP32.buffer);
        if (!heap) {
            throw new Error("WASM HEAP32 memory structure is missing!");
        }

        this.i32 = new Int32Array(heap, this.ptr, 3);
        this.f32 = new Float32Array(heap, this.ptr, 3);
    }

    get id() { return this.i32[0]; }
    set id(val) { this.i32[0] = val; }

    get value() { return this.f32[1]; }
    set set_value(val) { this.f32[1] = val; } /* mapped setter */
    set value(val) { this.f32[1] = val; }

    get active() { return this.i32[2]; }
    set active(val) { this.i32[2] = val; }

    process() {
        const processFn = window._process_packet || (window.Module && window.Module._process_packet);
        if (!processFn) throw new Error("WASM _process_packet function not found!");
        processFn(this.ptr);
    }
}
