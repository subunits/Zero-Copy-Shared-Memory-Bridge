#include <emscripten/emscripten.h>
#include <stdlib.h>
#include <stdint.h>

// Packed struct ensures memory layout is identical to JS views
typedef struct __attribute__((packed)) {
    int32_t id;
    float value;
    int32_t active;
} DataPacket;

EMSCRIPTEN_KEEPALIVE
DataPacket* init_packet() {
    // calloc ensures memory starts at zero
    return (DataPacket*)calloc(1, sizeof(DataPacket)); 
}

EMSCRIPTEN_KEEPALIVE
void process_packet(DataPacket* p) {
    if (p == NULL) return;
    
    // Perform processing directly on linear memory
    p->value *= 2.0f;
    p->active = (p->value > 0) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void free_packet(DataPacket* p) {
    if (p != NULL) free(p);
}
