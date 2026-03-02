window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: {
      openapi: "3.0.3",
      info: {
        title: "Host Calendar & Availability Control API",
        version: "1.0.0",
        description: "APIs to manage host calendar, availability windows, blocks, and to check conflicts for bookings."
      },
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "http://localhost:3000", description: "Local dev" }
      ],
      security: [{ bearerAuth: [] }],
      paths: {
        "/hosts/{hostId}/calendar": {
          get: {
            summary: "Get calendar days for a host in a date range",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "start", in: "query", required: true, schema: { type: "string", format: "date" }, example: "2026-02-27" },
              { name: "end", in: "query", required: true, schema: { type: "string", format: "date" }, example: "2026-03-05" }
            ],
            responses: {
              "200": {
                description: "Calendar days",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CalendarResponse" },
                    examples: {
                      weekRange: {
                        summary: "GET /hosts/host123/calendar?start=2026-02-27&end=2026-03-05",
                        value: {
                          hostId: "host123",
                          days: [
                            { date: "2026-02-27", status: "available" },
                            { date: "2026-02-28", status: "booked" },
                            { date: "2026-03-01", status: "available" },
                            { date: "2026-03-02", status: "blocked" },
                            { date: "2026-03-03", status: "available" },
                            { date: "2026-03-04", status: "pending" },
                            { date: "2026-03-05", status: "available" }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/hosts/{hostId}/availability": {
          get: {
            summary: "Get availability slots for host",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            responses: {
              "200": {
                description: "Availability slots",
                content: {
                  "application/json": {
                    schema: { type: "array", items: { $ref: "#/components/schemas/AvailabilitySlot" } },
                    examples: {
                      slotList: {
                        summary: "GET /hosts/host123/availability",
                        value: [
                          { id: "slot1", status: "available" },
                          { id: "slot2", status: "booked" },
                          { id: "slot3", status: "blocked" }
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: "Create an availability slot",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AvailabilitySlotCreate" },
                  examples: {
                    createAvailable: {
                      summary: "POST /hosts/host123/availability — create available slot",
                      value: { hostId: "host123", status: "available" }
                    },
                    createBlocked: {
                      summary: "POST /hosts/host123/availability — create blocked slot",
                      value: { hostId: "host123", status: "blocked" }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Created",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AvailabilitySlot" },
                    examples: {
                      created: {
                        summary: "Newly created slot",
                        value: { id: "slot4", status: "available" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/hosts/{hostId}/availability/{slotId}": {
          put: {
            summary: "Update availability slot",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "slotId", in: "path", required: true, schema: { type: "string" }, example: "slot4" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AvailabilitySlotUpdate" },
                  examples: {
                    bookSlot: {
                      summary: "PUT /hosts/host123/availability/slot4 — mark as booked",
                      value: { status: "booked", startDate: "2026-03-05", endDate: "2026-03-06" }
                    },
                    makeAvailable: {
                      summary: "PUT /hosts/host123/availability/slot4 — make available again",
                      value: { status: "available", startDate: "2026-03-05", endDate: "2026-03-06" }
                    },
                    blockSlot: {
                      summary: "PUT /hosts/host123/availability/slot4 — block slot",
                      value: { status: "blocked", startDate: "2026-03-10", endDate: "2026-03-12" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Updated slot",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/AvailabilitySlot" },
                    examples: {
                      bookedSlot: {
                        summary: "Slot updated to booked",
                        value: { id: "slot4", status: "booked" }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: "Delete availability slot",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "slotId", in: "path", required: true, schema: { type: "string" }, example: "slot4" }
            ],
            responses: { "204": { description: "Deleted" } }
          }
        },
        "/hosts/{hostId}/block-dates": {
          post: {
            summary: "Block a date range",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BlockDatesRequest" },
                  examples: {
                    maintenanceBlock: {
                      summary: "POST /hosts/host123/block-dates — maintenance",
                      value: { hostId: "host123", startDate: "2026-03-10", endDate: "2026-03-12", reason: "Maintenance" }
                    },
                    personalBlock: {
                      summary: "POST /hosts/host123/block-dates — personal use",
                      value: { hostId: "host123", startDate: "2026-04-01", endDate: "2026-04-07", reason: "Family visit" }
                    },
                    renovationBlock: {
                      summary: "POST /hosts/host123/block-dates — renovation",
                      value: { hostId: "host123", startDate: "2026-05-01", endDate: "2026-05-14", reason: "Renovation" }
                    }
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Blocked",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        reason: { type: "string" }
                      }
                    },
                    examples: {
                      blockedMaintenance: {
                        summary: "Block created for maintenance",
                        value: { id: "block1", startDate: "2026-03-10", endDate: "2026-03-12", reason: "Maintenance" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/hosts/{hostId}/unblock-dates": {
          post: {
            summary: "Remove blocked dates",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UnblockDatesRequest" },
                  examples: {
                    unblockSingle: {
                      summary: "POST /hosts/host123/unblock-dates — single block",
                      value: { hostId: "host123", blockIds: ["block1"] }
                    },
                    unblockMultiple: {
                      summary: "POST /hosts/host123/unblock-dates — multiple blocks",
                      value: { hostId: "host123", blockIds: ["block1", "block2", "block3"] }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Unblocked",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BulkResult" },
                    examples: {
                      singleDeleted: {
                        summary: "One block removed",
                        value: { created: 0, updated: 0, deleted: 1 }
                      },
                      multipleDeleted: {
                        summary: "Multiple blocks removed",
                        value: { created: 0, updated: 0, deleted: 3 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/hosts/{hostId}/check-availability": {
          post: {
            summary: "Check availability",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckAvailabilityRequest" },
                  examples: {
                    checkFree: {
                      summary: "POST /hosts/host123/check-availability — open period",
                      value: { hostId: "host123", startDate: "2026-03-15", endDate: "2026-03-18" }
                    },
                    checkConflict: {
                      summary: "POST /hosts/host123/check-availability — conflicting period",
                      value: { hostId: "host123", startDate: "2026-03-05", endDate: "2026-03-06" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Availability result",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CheckAvailabilityResult" },
                    examples: {
                      isAvailable: {
                        summary: "Dates are free",
                        value: { available: true }
                      },
                      notAvailable: {
                        summary: "Dates have a conflict",
                        value: { available: false }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/hosts/{hostId}/bookings": {
          get: {
            summary: "List bookings",
            parameters: [
              { name: "hostId", in: "path", required: true, schema: { type: "string" }, example: "host123" },
              { name: "start", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-01" },
              { name: "end", in: "query", required: false, schema: { type: "string", format: "date" }, example: "2026-03-31" }
            ],
            responses: {
              "200": {
                description: "Bookings list",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/BookingListResponse" },
                    examples: {
                      marchBookings: {
                        summary: "GET /hosts/host123/bookings?start=2026-03-01&end=2026-03-31",
                        value: {
                          bookings: [
                            { id: "booking1", startDate: "2026-03-02", endDate: "2026-03-04" },
                            { id: "booking2", startDate: "2026-03-07", endDate: "2026-03-09" },
                            { id: "booking3", startDate: "2026-03-15", endDate: "2026-03-18" }
                          ]
                        }
                      },
                      noBookings: {
                        summary: "GET /hosts/host123/bookings — empty result",
                        value: { bookings: [] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
          CalendarDay: {
            type: "object",
            properties: {
              date: { type: "string", format: "date", example: "2026-03-01" },
              status: { type: "string", enum: ["available", "booked", "blocked", "pending"], example: "available" }
            }
          },
          CalendarResponse: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              days: { type: "array", items: { $ref: "#/components/schemas/CalendarDay" } }
            }
          },
          AvailabilitySlot: {
            type: "object",
            properties: {
              id: { type: "string", example: "slot1" },
              status: { type: "string", example: "available" }
            }
          },
          AvailabilitySlotCreate: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              status: { type: "string", example: "available" }
            }
          },
          AvailabilitySlotUpdate: {
            type: "object",
            properties: {
              status: { type: "string", example: "booked" },
              startDate: { type: "string", format: "date", example: "2026-03-05" },
              endDate: { type: "string", format: "date", example: "2026-03-06" }
            }
          },
          BlockDatesRequest: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              startDate: { type: "string", format: "date", example: "2026-03-10" },
              endDate: { type: "string", format: "date", example: "2026-03-12" },
              reason: { type: "string", example: "Maintenance" }
            }
          },
          UnblockDatesRequest: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              blockIds: { type: "array", items: { type: "string" }, example: ["block1", "block2"] }
            }
          },
          CheckAvailabilityRequest: {
            type: "object",
            properties: {
              hostId: { type: "string", example: "host123" },
              startDate: { type: "string", format: "date", example: "2026-03-15" },
              endDate: { type: "string", format: "date", example: "2026-03-18" }
            }
          },
          CheckAvailabilityResult: {
            type: "object",
            properties: {
              available: { type: "boolean", example: true }
            }
          },
          BookingListResponse: {
            type: "object",
            properties: {
              bookings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "booking1" },
                    startDate: { type: "string", format: "date", example: "2026-03-02" },
                    endDate: { type: "string", format: "date", example: "2026-03-04" }
                  }
                }
              }
            }
          },
          BulkResult: {
            type: "object",
            properties: {
              created: { type: "integer", example: 0 },
              updated: { type: "integer", example: 0 },
              deleted: { type: "integer", example: 1 }
            }
          }
        }
      }
    },
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout"
  });
};